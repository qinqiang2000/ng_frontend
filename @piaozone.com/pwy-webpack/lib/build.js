const stdout = process.stdout;
function webpackBuild(options, argv) {
    const ifArg = (name, fn, init) => {
        if (Array.isArray(argv[name])) {
            if (init) init();
            argv[name].forEach(fn);
        } else if (typeof argv[name] !== 'undefined') {
            if (init) init();
            fn(argv[name], -1);
        }
    };

    const firstOptions = [].concat(options)[0];
    const statsPresetToOptions = require('webpack').Stats.presetToOptions;

    let outputOptions = options.stats;
    if (typeof outputOptions === 'boolean' || typeof outputOptions === 'string') {
        outputOptions = statsPresetToOptions(outputOptions);
    } else if (!outputOptions) {
        outputOptions = {};
    }

    ifArg('display', function(preset) {
        outputOptions = statsPresetToOptions(preset);
    });

    outputOptions = Object.create(outputOptions);
    outputOptions.errorDetails = true;
    if (Array.isArray(options) && !outputOptions.children) {
        outputOptions.children = options.map(o => o.stats);
    }
    if (typeof outputOptions.context === 'undefined') outputOptions.context = firstOptions.context;
    ifArg('env', function(value) {
        if (outputOptions.env) {
            outputOptions._env = value;
        }
    });

    ifArg('json', function(bool) {
        if (bool) {
            outputOptions.json = bool;
            outputOptions.modules = bool;
        }
    });

    if (typeof outputOptions.colors === 'undefined') outputOptions.colors = require('supports-color').stdout;

    if (!outputOptions.json) {
        if (typeof outputOptions.cached === 'undefined') outputOptions.cached = false;
        if (typeof outputOptions.cachedAssets === 'undefined') outputOptions.cachedAssets = false;

        ifArg('display-chunks', function(bool) {
            if (bool) {
                outputOptions.modules = false;
                outputOptions.chunks = true;
                outputOptions.chunkModules = true;
            }
        });
        ifArg('display-entrypoints', function(bool) {
            outputOptions.entrypoints = bool;
        });

        ifArg('display-reasons', function(bool) {
            if (bool) outputOptions.reasons = true;
        });

        

        ifArg('display-origins', function(bool) {
            if (bool) outputOptions.chunkOrigins = true;
        });

        ifArg('display-max-modules', function(value) {
            outputOptions.maxModules = +value;
        });

        ifArg('display-cached', function(bool) {
            if (bool) outputOptions.cached = true;
        });

        ifArg('display-cached-assets', function(bool) {
            if (bool) outputOptions.cachedAssets = true;
        });

        if (!outputOptions.exclude) outputOptions.exclude = ['node_modules', 'bower_components', 'components'];
    }

    const webpack = require('webpack');

    let lastHash = null;
    let compiler;
    try {
        compiler = webpack(options);
    } catch (err) {
        if (err.name === 'WebpackOptionsValidationError') {
            if (argv.color) console.error(`\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m`);
            else console.error(err.message);
            // eslint-disable-next-line no-process-exit
            process.exit(1);
        }

        throw err;
    }

    if (argv.progress) {
        const ProgressPlugin = require('webpack').ProgressPlugin;
        new ProgressPlugin({
            profile: argv.profile
        }).apply(compiler);
    }

    if (outputOptions.infoVerbosity === 'verbose') {
        if (argv.w) {
            compiler.hooks.watchRun.tap('WebpackInfo', compilation => {
                const compilationName = compilation.name ? compilation.name : '';
                console.error('\nCompilation ' + compilationName + ' starting…\n');
            });
        } else {
            compiler.hooks.beforeRun.tap('WebpackInfo', compilation => {
                const compilationName = compilation.name ? compilation.name : '';
                console.error('\nCompilation ' + compilationName + ' starting…\n');
            });
        }
        compiler.hooks.done.tap('WebpackInfo', compilation => {
            const compilationName = compilation.name ? compilation.name : '';
            console.error('\nCompilation ' + compilationName + ' finished\n');
        });
    }

    function compilerCallback(err, stats) {
        if (!options.watch || err) {
            // Do not keep cache anymore
            compiler.purgeInputFileSystem();
        }
        if (err) {
            lastHash = null;
            console.error(err.stack || err);
            if (err.details) console.error(err.details);
            process.exitCode = 1;
            return;
        }
        if (outputOptions.json) {
            stdout.write(JSON.stringify(stats.toJson(outputOptions), null, 2) + '\n');
        } else if (stats.hash !== lastHash) {
            lastHash = stats.hash;
            if (stats.compilation && stats.compilation.errors.length !== 0) {
                const errors = stats.compilation.errors;
                if (errors[0].name === 'EntryModuleNotFoundError') {
                    console.error('\n\u001b[1m\u001b[31mInsufficient number of arguments or no entry found.');
                    console.error(
                        "\u001b[1m\u001b[31mAlternatively, run 'webpack(-cli) --help' for usage info.\u001b[39m\u001b[22m\n"
                    );
                }
            }
            const statsString = stats.toString(outputOptions);
            const delimiter = outputOptions.buildDelimiter ? `${outputOptions.buildDelimiter}\n` : '';
            if (statsString) stdout.write(`${statsString}\n${delimiter}`);
        }
        if (!options.watch && stats.hasErrors()) {
            process.exitCode = 2;
        }
    }
    if (argv.watch) {
        const watchOptions =
            firstOptions.watchOptions || options.watchOptions || firstOptions.watch || options.watch || {};
        if (watchOptions.stdin) {
            process.stdin.on('end', function(_) {
                process.exit(); // eslint-disable-line
            });
            process.stdin.resume();
        }
        compiler.watch(watchOptions, compilerCallback);
        if (outputOptions.infoVerbosity !== 'none') console.error('\nwebpack is watching the files…\n');
    } else {
        compiler.run((err, stats) => {
            if (compiler.close) {
                compiler.close(err2 => {
                    compilerCallback(err || err2, stats);
                });
            } else {
                compilerCallback(err, stats);
            }
        });
    }
	return compiler;
}

module.exports = webpackBuild;

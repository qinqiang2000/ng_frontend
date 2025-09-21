'use strict';
var path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const resolve = require('resolve');
const ESLintPlugin = require('eslint-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { checkUseTypeScript } = require('../lib/tools');
const createEnvironmentHash = require('../lib/createEnvironmentHash');

module.exports = (buildConfig = {}, argv = {} ) => {
    const {
		fixEslint,
		srcDir,
        rootDir,
        distDir,
        entry,
        alias,
		useCache,
        disableEslint,
		shouldUseSourceMap,
        nodeModulesDir,
        isLocal,
        imageInlineSizeLimit = 10000,
    } = buildConfig;

    const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');
    const resolveExtensions = [
        '.web.mjs',
        '.mjs',
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.json'
    ];

    const nodeEslintRules = require('./nodeEslintRules');
    const getBabelConfig = require('./babel-node.config');
    let isEnvProduction = !isLocal;
    let isEnvDevelopment = !!isLocal;

    const babelConfig = getBabelConfig({
        isEnvDevelopment,
        pwyWebpackNodeDir,
        nodeModulesDir
    });
    let devtool = shouldUseSourceMap ? 'source-map' : false;
    let mode = isEnvDevelopment ? 'development' : 'production';
    if (argv.devtool) {
        mode = 'development';
        devtool = argv.devtool;
        isEnvProduction = false;
        isEnvDevelopment = true;
    }

    const tsCheckInfo = checkUseTypeScript(buildConfig.rootDir, buildConfig.tsConfig);
    const useTypeScript = tsCheckInfo.useTypeScript;
    const tsConfigList = tsCheckInfo.tsConfigList;
    const tsConfig = tsCheckInfo.tsConfig;

	const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile');
    return {
        mode,
        entry,
        target: 'node',
        output: {
            path: distDir,
            filename: '[name].js'
        },
		devtool,
        node: {
            __dirname: true
        },
        resolve: {
            modules: ['node_modules', nodeModulesDir, path.resolve(__dirname, '../node_modules')],
            extensions: resolveExtensions,
            alias: alias
        },
        cache: {
            type: 'filesystem',
            version: createEnvironmentHash('/'),
            cacheDirectory: path.resolve(nodeModulesDir, '.cache'),
            store: 'pack',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: tsConfigList
            }
        },
		externalsPresets: { node: true },
		externals: [nodeExternals()],
        module: {
            // strictExportPresence: true,
            rules: [
                shouldUseSourceMap && {
                    enforce: 'pre',
                    exclude: /node_modules/,
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: require.resolve(path.join(pwyWebpackNodeDir, 'source-map-loader')),
                },
                {
                    oneOf: [{
                        test: [/\.avif$/],
                        type: 'asset',
                        mimetype: 'image/avif',
                        parser: {
                            dataUrlCondition: {
                                maxSize: imageInlineSizeLimit,
                            }
                        }
                    },
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                maxSize: imageInlineSizeLimit,
                            }
                        }
                    },
                    {
                        test: /\.svg$/,
                        use: [{
                                loader: require.resolve(path.join(pwyWebpackNodeDir, '@svgr/webpack')),
                                options: {
                                    prettier: false,
                                    svgo: false,
                                    svgoConfig: {
                                        plugins: [{
                                            removeViewBox: false
                                        }],
                                    },
                                    titleProp: true,
                                    ref: true,
                                }
                            },
                            {
                                loader: require.resolve('file-loader'),
                                options: {
                                    name: 'media/[name].[hash].[ext]',
                                }
                            }
                        ],
                        issuer: {
                            and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
                        }
                    }, {
                        test: /\.(js|mjs|jsx|ts|tsx)$/,
                        loader: require.resolve('babel-loader'),
						exclude: /node_modules/,
                        options: {
                            babelrc: false,
                            configFile: false,
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: useCache,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                            compact: isEnvProduction,
                            ...babelConfig
                        }
                    },
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /node_modules/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            cacheDirectory: useCache,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                            // Babel sourcemaps are needed for debugging into node_modules
                            // code.  Without the options below, debuggers like VSCode
                            // show incorrect code and set breakpoints on the wrong lines.
                            sourceMaps: shouldUseSourceMap,
                            inputSourceMap: shouldUseSourceMap,
                            ...babelConfig
                        }
                    }].concat([{
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        type: 'asset/resource'
                    }])
                }
            ].filter(Boolean)
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                // production mode 才会生效
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        keep_classnames: isEnvProductionProfile,
                        keep_fnames: isEnvProductionProfile,
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                }),
            ]
        },
        plugins: [
            !disableEslint &&
            new ESLintPlugin({
                // Plugin options
                extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
                // formatter: require.resolve(path.join(pwyWebpackNodeDir, 'react-dev-utils/eslintFormatter')),
                eslintPath: require.resolve(path.join(pwyWebpackNodeDir, 'eslint')),
                exclude: ['node_modules'],
                files: srcDir,
                context: srcDir,
                cache: useCache,
                cacheLocation: path.resolve(
                    nodeModulesDir,
                    '.cache/.eslintcache'
                ),
                fix: fixEslint,
                threads: false, // Boolean | Number 以线程池方式运行 lint 。线程池大小是自动的
                failOnError: true,
                emitError: true,
                emitWarning: true,
                // ESLint class options
                cwd: srcDir,
                resolvePluginsRelativeTo: path.join(pwyWebpackNodeDir, '../'),
                useEslintrc: false,
                baseConfig: nodeEslintRules,
            })
        ].filter(Boolean),
        performance: false
    };
}


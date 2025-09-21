const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin =
  process.env.TSC_COMPILE_ON_ERROR === 'true'
    ? require('react-dev-utils/ForkTsCheckerWarningWebpackPlugin')
    : require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const getJsxRuntime = require('./getJsxRuntime');
const webpack = require('webpack');
const resolve = require('resolve');
const eslintRules = require('./eslintRules');

module.exports = (props) => {
    const {
        fixEslint = false,
        useCache,
        plugins = [],
        srcDir,
        tsConfig,
        template,
        entry,
        shouldUseSourceMap,
        emitErrorsAsWarnings = true, // ESLINT NO DEV ERRORS
        output,
        rootDir,
        isEnvProduction,
        isEnvDevelopment,
        shouldUseReactRefresh,
        shouldInlineRuntimeChunk,
        disableEslint,
        useTypeScript,
        envVariables,
        publicUrlOrPath,
        nodeModulesDir,
        pwyWebpackNodeDir,
        disableJsxRuntime,
        disableHtmlPlugin,
        swSrc // Get the path to the uncompiled service worker (if it exists).
    } = props;

    const processEnvVar = {
        NODE_ENV: isEnvProduction ? 'production' : 'development',
        PUBLIC_PATH: output.publicPath,
        PUBLIC_URL: output.publicPath,
        WDS_SOCKET_HOST: undefined,
        WDS_SOCKET_PATH: undefined,
        WDS_SOCKET_PORT: undefined,
        FAST_REFRESH: true
    };
    const hasJsxRuntime = getJsxRuntime(disableJsxRuntime);
    const htmlWebpackPlugins = [];
    if (!disableHtmlPlugin) {
        if (typeof entry === 'string') {
            if(fs.existsSync(entry) && template) {
                htmlWebpackPlugins.push(new HtmlWebpackPlugin(
                    Object.assign({},
                      {
                        inject: true,
                        template: template,
                      },
                      isEnvProduction ? {
                            minify: {
                              removeComments: true,
                              collapseWhitespace: true,
                              removeRedundantAttributes: true,
                              useShortDoctype: true,
                              removeEmptyAttributes: true,
                              removeStyleLinkTypeAttributes: true,
                              keepClosingSlash: true,
                              minifyJS: true,
                              minifyCSS: true,
                              minifyURLs: true,
                            },
                        }
                        : undefined
                    )
                ))
            }
        } else {
            const entryKeys = Object.keys(entry);
            for (let i = 0; i < entryKeys.length; i++) {
                const curEntryKey = entryKeys[i];
                const entryPath = entry[curEntryKey];
                const entryDirName = path.dirname(entryPath);
                let tpl = path.join(entryDirName, 'index.html');

                if (template && template[curEntryKey]) {
                    tpl = template[curEntryKey];
                }

                if(!fs.existsSync(tpl)) { // 如果模板不存在，则使用默认模板
                    tpl = path.resolve(__dirname, './htmlTpl.html');
                }

                const htmlConfig = Object.assign({}, {
                    filename: curEntryKey + '.html',
                    template: tpl,
                    inject: true,
                    cache: true
                }, isEnvProduction ? {
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true,
                    }
                } : undefined);
                htmlWebpackPlugins.push(new HtmlWebpackPlugin(htmlConfig));
            }
        }
    }


    return [
        ...htmlWebpackPlugins,
        // Inlines the webpack runtime script. This script is too small to warrant
        // a network request.
        // https://github.com/facebook/create-react-app/issues/5358
        isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
        // It will be an empty string unless you specify "homepage"
        // in `package.json`, in which case it will be the pathname of that URL.
        envVariables && new InterpolateHtmlPlugin(HtmlWebpackPlugin, { ...processEnvVar, ...envVariables }),
        // This gives some necessary context to module not found errors, such as
        // the requesting resource.
        new ModuleNotFoundPlugin(rootDir),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV is set to production
        // during a production build.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(processEnvVar),
            'GLOBAL_VAL': JSON.stringify(envVariables)
        }),
        // Experimental hot reloading for React .
        // https://github.com/facebook/react/tree/main/packages/react-refresh
        isEnvDevelopment &&
        shouldUseReactRefresh &&
        new ReactRefreshWebpackPlugin({
            overlay: false,
        }),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebook/create-react-app/issues/240
        isEnvDevelopment && new CaseSensitivePathsPlugin(),
        isEnvProduction &&
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'css/[name].[contenthash:8].css',
            chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        }),
        // Generate an asset manifest file with the following content:
        // - "files" key: Mapping of all asset filenames to their corresponding
        //   output file so that tools can pick it up without having to parse
        //   `index.html`
        // - "entrypoints" key: Array of files which are included in `index.html`,
        //   can be used to reconstruct the HTML if necessary
        new WebpackManifestPlugin({
            fileName: 'manifest.json',
            publicPath: publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    manifest[file.name] = file.path;
                    return manifest;
                }, seed);
                const entrypointFiles = entrypoints.main.filter(
                    fileName => !fileName.endsWith('.map')
                );

                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        }),
        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        // Generate a service worker script that will precache, and keep up to date,
        // the HTML & assets that are part of the webpack build.
        isEnvProduction &&
        fs.existsSync(swSrc) &&
        new WorkboxWebpackPlugin.InjectManifest({
            swSrc,
            dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
            exclude: [/\.map$/, /manifest\.json$/, /LICENSE/],
            // Bump up the default maximum size (2mb) that's precached,
            // to make lazy-loading failure scenarios less likely.
            // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }),
        // TypeScript type checking
        useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
            async: isEnvDevelopment,
            typescript: {
                configFile: tsConfig,
                typescriptPath: resolve.sync('typescript', {
                    basedir: pwyWebpackNodeDir,
                }),
                configOverwrite: {
                    compilerOptions: {
                        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                        skipLibCheck: true,
                        inlineSourceMap: false,
                        declarationMap: false,
                        noEmit: true,
                        incremental: true,
                        tsBuildInfoFile: path.join(nodeModulesDir, '.cache/tsconfig.tsbuildinfo'),
                    }
                },
                context: rootDir,
                diagnosticOptions: {
                    syntactic: true,
                },
                mode: 'write-references',
                // profile: true,
            },
            issue: {
                // This one is specifically to match during CI tests,
                // as micromatch doesn't match
                // '../cra-template-typescript/template/src/App.tsx'
                // otherwise.
                include: [{
                        file: '../**/src/**/*.{ts,tsx}'
                    },
                    {
                        file: '**/src/**/*.{ts,tsx}'
                    },
                ],
                exclude: [{
                        file: '**/src/**/__tests__/**'
                    },
                    {
                        file: '**/src/**/?(*.){spec|test}.*'
                    },
                    {
                        file: '**/src/setupProxy.*'
                    },
                    {
                        file: '**/src/setupTests.*'
                    },
                ],
            },
            logger: {
                infrastructure: 'silent',
            },
        }),
        !disableEslint &&
        new ESLintPlugin({
            // Plugin options
            extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
            formatter: require.resolve(path.join(pwyWebpackNodeDir, 'react-dev-utils/eslintFormatter')),
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
            baseConfig: eslintRules,
        }),
    ].filter(Boolean).concat(plugins);
}
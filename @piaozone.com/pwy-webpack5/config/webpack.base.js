const path = require('path');
const fs = require('fs');

const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const createEnvironmentHash = require('../lib/createEnvironmentHash');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const reactRefreshRuntimeEntry = require.resolve('react-refresh/runtime');
const reactRefreshWebpackPluginRuntimeEntry = require.resolve('@pmmmwh/react-refresh-webpack-plugin');
const babelRuntimeEntry = require.resolve('babel-preset-react-app');
const babelRuntimeEntryHelpers = require.resolve(
    '@babel/runtime/helpers/esm/assertThisInitialized', {
        paths: [babelRuntimeEntry]
    }
);

const babelRuntimeRegenerator = require.resolve('@babel/runtime/regenerator', {
    paths: [babelRuntimeEntry],
});
const getBabelConfig = require('./babel.config');
const getStyleRules = require('./getStyleRules');
const getPlugins = require('./getPlugins');

module.exports = (props = {}) => {
    const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');
    const {
        fixEslint,
        output,
        isLocal = false,
        isSsr = false,
        buildConfig = {},
        shouldUseSourceMap = false,
        disableJsxRuntime = false
    } = props;
    const {
        useHash = false,
        template,
        disableEslint = false,
        useTailwind = false,
        rootDir,
        srcDir,
        includeDirs,
        alias = {},
        homepage = '',
        PUBLIC_URL,
        entry = {},
        plugins = [],
        tsConfig = '',
        tsConfigList = [],
        useTypeScript,
        nodeModulesDir,
        imageInlineSizeLimit = 10000,
        disableHtmlPlugin,
    } = buildConfig;

    const shouldUseReactRefresh = typeof buildConfig.shouldUseReactRefresh === 'undefined' ? true : !!buildConfig.shouldUseReactRefresh;
    const bail = typeof buildConfig.bail === 'undefined' ? true : !!buildConfig.bail;

    const isEnvProduction = !isLocal;
    const isEnvDevelopment = isLocal;
    const useCache = !!isLocal; // 只有development环境才使用cache
    let devtool;
    if (isEnvProduction) {
        devtool = shouldUseSourceMap ? 'source-map' : false;
    } else {
        devtool = 'cheap-module-source-map';
    }

    const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile');
    const publicUrlOrPath = getPublicUrlOrPath(
        isLocal,
        homepage,
        PUBLIC_URL
    );

    const resolveExtensions = [
        '.web.mjs',
        '.mjs',
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.json',
        '.web.jsx',
        '.jsx',
        '.less',
        '.css'
    ];

    const babelConfig = getBabelConfig({
        isEnvDevelopment,
        shouldUseReactRefresh,
        disableJsxRuntime,
        pwyWebpackNodeDir,
        nodeModulesDir
    });

    return {
        target: ['browserslist'],
        mode: 'production',
        bail, // 默认使webpack 在发现错误时尽快退出
        devtool,
        entry,
        cache: {
            type: 'filesystem',
            version: createEnvironmentHash(publicUrlOrPath.slice(0, -1)),
            cacheDirectory: path.resolve(nodeModulesDir, '.cache'),
            store: 'pack',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: tsConfigList
            }
        },
        infrastructureLogging: { // 日志选项
            level: 'none',
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
                // production mode 才会生效
                new CssMinimizerPlugin()
            ]
        },
        resolve: {
            modules: ['node_modules', nodeModulesDir, path.resolve(__dirname, '../node_modules'), path.resolve(pwyWebpackNodeDir, '@piaozone.com/pwy-babel6/src/node_modules')],
            extensions: resolveExtensions,
            alias: {
                // Support React Native Web
                // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
                'react-native': 'react-native-web',
                // Allows for better profiling with ReactDevTools
                ...(isEnvProductionProfile && {
                    'react-dom$': 'react-dom/profiling',
                    'scheduler/tracing': 'scheduler/tracing-profiling',
                }),
                '@babel/polyfill': path.resolve(pwyWebpackNodeDir, '@babel/polyfill'),
                // '@babel/runtime': path.resolve(pwyWebpackNodeDir, '@babel/runtime'),
                'babel-plugin-dynamic-import-webpack': path.resolve(pwyWebpackNodeDir, 'babel-plugin-dynamic-import-webpack'),
                'babel-plugin-import': path.resolve(pwyWebpackNodeDir, 'babel-plugin-dynamic-import-webpack'),
                'eslint-config-react-app': path.resolve(pwyWebpackNodeDir, 'eslint-config-react-app'),
                // react: path.resolve(pwyWebpackNodeDir, isLocal ? 'react/umd/react.development.js' : 'react/umd/react.production.min.js'),
                // 'react/jsx-runtime':  path.resolve(pwyWebpackNodeDir, isLocal ? 'react/jsx-dev-runtime.js' : 'react/jsx-runtime.js'),
                // 'react-dom': path.resolve(pwyWebpackNodeDir, isLocal ? 'react-dom/umd/react-dom.development.js' : 'react-dom/umd/react-dom.production.min.js'),
                ...alias,
            },
            plugins: [
                // Prevents users from importing files from outside of src/ (or node_modules/).
                new ModuleScopePlugin(srcDir, [
                    path.resolve(rootDir, 'package.json'),
                    reactRefreshRuntimeEntry,
                    reactRefreshWebpackPluginRuntimeEntry,
                    babelRuntimeEntry,
                    babelRuntimeEntryHelpers,
                    babelRuntimeRegenerator,
                ])
            ]
        },
        resolveLoader: {
            alias: {
                'css-loader': path.resolve(pwyWebpackNodeDir, 'css-loader'),
                'postcss-loader': path.resolve(pwyWebpackNodeDir, 'postcss-loader'),
                'style-loader': path.resolve(pwyWebpackNodeDir, 'style-loader'),
                'less-loader': path.resolve(pwyWebpackNodeDir, 'less-loader'),
                'file-loader': path.resolve(pwyWebpackNodeDir, 'file-loader'),
                'url-loader': path.resolve(pwyWebpackNodeDir, 'url-loader'),
                'eslint-loader': path.resolve(pwyWebpackNodeDir, 'eslint-loader'),
                'babel-loader': path.resolve(pwyWebpackNodeDir, 'babel-loader')
            }
        },
        module: {
            strictExportPresence: true,
            rules: [
                shouldUseSourceMap && {
                    enforce: 'pre',
                    exclude: /@babel(?:\/|\\{1,2})runtime/,
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: require.resolve(path.join(pwyWebpackNodeDir, 'source-map-loader')),
                },
                {
                    // "oneOf" will traverse all following loaders until one will
                    // match the requirements. When no loader matches it will fall
                    // back to the "file" loader at the end of the loader list.
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
                        },
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            loader: require.resolve('babel-loader'),
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
                        // Process any JS outside of the app with Babel.
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
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
                        }
                    ].concat(getStyleRules({
                        useTailwind,
                        srcDir,
                        isEnvDevelopment,
                        isEnvProduction,
                        publicUrlOrPath,
                        shouldUseSourceMap,
                        includeDirs
                    })).concat([{
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
        plugins: getPlugins({
            fixEslint,
            useCache,
            plugins,
            shouldUseSourceMap,
            entry,
            output,
            srcDir,
            rootDir,
            isEnvProduction,
            isEnvDevelopment,
            shouldUseReactRefresh,
            shouldInlineRuntimeChunk: true,
            disableEslint,
            useTypeScript,
            envVariables: {},
            publicUrlOrPath,
            nodeModulesDir,
            disableJsxRuntime,
            disableHtmlPlugin,
            template,
            tsConfig,
            pwyWebpackNodeDir
        }),
        performance: false
    }
}
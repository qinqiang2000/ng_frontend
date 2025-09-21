const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const getStyleLoaders = require('./styleLoaders');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

module.exports = (props) => {
    const {
        shouldUseSourceMap,
        isEnvDevelopment,
        isEnvProduction,
        publicUrlOrPath,
        useTailwind,
        srcDir,
        modifyVars = {}
    } = props;
    const publicOpt = {
        useTailwind,
        srcDir,
        isEnvDevelopment,
        isEnvProduction,
        publicUrlOrPath,
        shouldUseSourceMap
    };

    const lessRules = [
        {
            test: lessRegex,
            exclude: lessModuleRegex,
            use: [
                isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            mode: 'icss',
                        },
                        importLoaders: 1
                    }
                },
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        postcssOptions: {
                            // Necessary for external CSS imports to work
                            // https://github.com/facebook/create-react-app/issues/2677
                            ident: 'postcss',
                            config: false,
                            plugins: !useTailwind ?
                                [
                                    'postcss-flexbugs-fixes',
                                    [
                                        'postcss-preset-env',
                                        {
                                            autoprefixer: {
                                                flexbox: 'no-2009',
                                            },
                                            stage: 3,
                                        },
                                    ],
                                    // Adds PostCSS Normalize as the reset css with default options,
                                    // so that it honors browserslist config in package.json
                                    // which in turn let's users customize the target behavior as per their needs.
                                    'postcss-normalize',
                                ] :
                                [
                                    'tailwindcss',
                                    'postcss-flexbugs-fixes',
                                    [
                                        'postcss-preset-env',
                                        {
                                            autoprefixer: {
                                                flexbox: 'no-2009',
                                            },
                                            stage: 3,
                                        },
                                    ],
                                ],
                        },
                        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                    },
                },
                {
                    loader: 'less-loader',
                    options: {
                        lessOptions: {
                            importLoaders: 2,
                            javascriptEnabled: true,
                            modifyVars: modifyVars
                        }
                    }
                }
            ]
        },
        {
            test: lessModuleRegex,
            use: [
                isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            mode: 'local',
                            getLocalIdent: getCSSModuleLocalIdent,
                        },
                        importLoaders: 1
                    }
                },
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        postcssOptions: {
                            // Necessary for external CSS imports to work
                            // https://github.com/facebook/create-react-app/issues/2677
                            ident: 'postcss',
                            config: false,
                            plugins: !useTailwind ?
                                [
                                    'postcss-flexbugs-fixes',
                                    [
                                        'postcss-preset-env',
                                        {
                                            autoprefixer: {
                                                flexbox: 'no-2009',
                                            },
                                            stage: 3,
                                        },
                                    ],
                                    // Adds PostCSS Normalize as the reset css with default options,
                                    // so that it honors browserslist config in package.json
                                    // which in turn let's users customize the target behavior as per their needs.
                                    'postcss-normalize',
                                ] :
                                [
                                    'tailwindcss',
                                    'postcss-flexbugs-fixes',
                                    [
                                        'postcss-preset-env',
                                        {
                                            autoprefixer: {
                                                flexbox: 'no-2009',
                                            },
                                            stage: 3,
                                        },
                                    ],
                                ],
                        },
                        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                    }
                },
                {
                    loader: 'less-loader',
                    options: {
                        lessOptions: {
                            importLoaders: 2,
                            javascriptEnabled: true,
                            modifyVars: modifyVars
                        }
                    }
                }
            ]
        }
    ];

    return [{
            test: cssRegex,
            exclude: cssModuleRegex,
            use: getStyleLoaders({
                cssOptions: {
                    importLoaders: 1,
                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                    modules: {
                        mode: 'icss'
                    }
                },
                ...publicOpt
            }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true
        },
        // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
        // using the extension .module.css
        {
            test: cssModuleRegex,
            use: getStyleLoaders({
                cssOptions: {
                    importLoaders: 1,
                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                    modules: {
                        mode: 'local',
                        getLocalIdent: getCSSModuleLocalIdent,
                    }
                },
                ...publicOpt
            })
        },
        {
            test: sassRegex,
            exclude: sassModuleRegex,
            use: getStyleLoaders({
                ...publicOpt,
                cssOptions: {
                    importLoaders: 3,
                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                    modules: {
                        mode: 'icss',
                    }
                },
                preProcessor: 'sass-loader'
            }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true
        },
        // Adds support for CSS Modules, but using SASS
        // using the extension .module.scss or .module.sass
        {
            test: sassModuleRegex,
            use: getStyleLoaders({
                ...publicOpt,
                cssOptions: {
                    importLoaders: 3,
                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                    modules: {
                        mode: 'local',
                        getLocalIdent: getCSSModuleLocalIdent
                    }
                },
                preProcessor: 'sass-loader'
            })
        },
        ...lessRules
    ]
};
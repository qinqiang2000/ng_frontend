const MiniCssExtractPlugin = require('@piaozone.com/mini-css-extract-plugin');

module.exports = ({ isLocal, disableCssModules, includeDirs, disableCssModulesDirs = [], modifyVars, extractCss }) => {
    let newIncludeDirs = includeDirs;
    // 需要开启css modules
    if (!disableCssModules && disableCssModulesDirs.length > 0) {
        newIncludeDirs = includeDirs.filter((item) => {
            return disableCssModulesDirs.indexOf(item) === -1; // 拆分出不需要cssmodules处理的目录
        });
    }

    if (typeof extractCss === 'undefined') {
        extractCss = true;
    }

    let cssRules = [{
        test: /\.(css)$/,
        use: [
            (isLocal || !extractCss) ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
                options: {
                    modules: !disableCssModules,
                    importLoaders: 1
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: [
                        require('autoprefixer')()
                    ]
                }
            }
        ],
        include: newIncludeDirs
    },
    {
        test: /\.(less)$/,
        use: [
            (isLocal || !extractCss) ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
                options: {
                    modules: !disableCssModules,
                    importLoaders: 1
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: [
                        require('autoprefixer')()
                    ]
                }
            },
            {
                loader: 'less-loader',
                options: {
                    importLoaders: 2,
                    javascriptEnabled: true,
                    modifyVars: modifyVars
                }
            }
        ],
        include: newIncludeDirs
    }];

    if (disableCssModulesDirs.length > 0) {
        cssRules = cssRules.concat([{
            test: /\.(css)$/,
            use: [
                (isLocal || !extractCss) ? 'style-loader' : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        modules: false,
                        importLoaders: 1
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('autoprefixer')()
                        ]
                    }
                }
            ],
            include: disableCssModulesDirs
        }, {
            test: /\.(less)$/,
            use: [
                (isLocal || !extractCss) ? 'style-loader' : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        modules: false,
                        importLoaders: 1
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('autoprefixer')()
                        ]
                    }
                },
                {
                    loader: 'less-loader',
                    options: {
                        importLoaders: 2,
                        javascriptEnabled: true,
                        modifyVars: modifyVars
                    }
                }
            ],
            include: disableCssModulesDirs
        }]);
    }

    return cssRules;
}
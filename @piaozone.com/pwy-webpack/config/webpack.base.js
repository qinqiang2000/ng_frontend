// const PurgecssWebpackPlugin = require('purgecss-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('@piaozone.com/mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const envResolve = require('./resolve.js');
const stats = require('./stats.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const getCssRules = require('./cssRules');
const fs = require('fs');

module.exports = (props = {}) => {
    const { isLocal = false, buildConfig, isSsr = false } = props;
    const {
        copy,
        fixCss = false,
        fixJs = false,
        useCache = false,
		useHash = false,
        srcDir,
        nodeModulesDir,
        rootDir,
        includeDirs,
        eslintDir = '',
        stylelintDir = '',
		theme = '',
        otherPlugins = [],
        disableCssModules = false,
        disableCssModulesDirs = [],
        disableEslint = false,
        disableStylelint = false,
        eslintrc = path.resolve(__dirname, './.eslintrc.js'),
        eslintignore = path.resolve(__dirname, './.eslintignore'),
        stylelintrc = path.resolve(__dirname, './.stylelintrc.js'),
        stylelintignore = path.resolve(__dirname, './.stylelintignore'),
        cacheGroupsVendor = /(react|react-dom|dva|dva-loading|moment)/,
        cacheGroupsLibs = /(antd|history)/,
        extractCss,
        optimization
    } = buildConfig;
    let modifyVars = {};
    let entry = buildConfig.entry;
    if (isSsr) {
        entry = buildConfig.ssrEntry;
    }

    const entryKeys = Object.keys(entry);
    const htmlWebpackPlugins = [];
	if (theme !== '') {
		modifyVars = require(theme)();
    }

    for (let i = 0; i < entryKeys.length; i++) {
        const curEntryKey = entryKeys[i];
        const entryPath = entry[curEntryKey];
        const entryDirName = path.dirname(entryPath);
        let tpl = path.join(entryDirName, 'index.html');

        if (buildConfig.template && buildConfig.template[curEntryKey]) {
            tpl = buildConfig.template[curEntryKey];
        }

        if(!fs.existsSync(tpl)) { // 如果模板不存在，则使用默认模板
			tpl = path.resolve(__dirname, './htmlTpl.html');
		}

        let chunks = ['vendor', 'libs', curEntryKey];
        if (entryKeys.length > 1) {
            chunks = ['vendor', 'libs', 'commons', curEntryKey];
        }
        const htmlConfig = {
            filename: curEntryKey + '.html',
            template: tpl,
            chunks,
            inject: true,
            cache: true,
            minify: isLocal ? false : {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false
            }
        };
        htmlWebpackPlugins.push(new HtmlWebpackPlugin(htmlConfig));
    }

    //判断是否禁用eslint
    const eslintRule = disableEslint ? [] : [{
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: [{
            loader: 'eslint-loader',
            options: {
                fix: fixJs,
                cache: useCache,
                failOnError: true,
                resolvePluginsRelativeTo: path.resolve(__dirname),
                configFile: eslintrc,
                ignorePath: eslintignore
            }
        }],
        include: eslintDir || srcDir
    }];

    const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');
    let antdMobileVersion = 4;
    const admJsonPath = path.join(nodeModulesDir, 'antd-mobile/package.json');
    if (fs.existsSync(admJsonPath)) {
        const antdMobileJson = require(admJsonPath);
        antdMobileVersion = antdMobileJson.version.split('.')[0];
    }

    const webpackConfig = {
        context: rootDir,
        entry,
        module: {
            rules: eslintRule.concat([
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: useCache,
                            cacheCompression: useCache,
                            configFile: antdMobileVersion >=5 ?
                                path.resolve(__dirname, './babel.config-adm.js') :
                                path.resolve(__dirname, './babel.config.js')
                        }
                    }],
                    include: includeDirs.concat([
                        path.join(pwyWebpackNodeDir, 'strip-ansi'),
                        path.join(pwyWebpackNodeDir, 'ansi-regex'),
                        path.join(pwyWebpackNodeDir, 'query-string'),
                        path.join(pwyWebpackNodeDir, 'strict-uri-encode')
                    ])
                },
                ...getCssRules({ isLocal, disableCssModules, includeDirs, disableCssModulesDirs, modifyVars, extractCss }),
                {
                    test: /\.(png|jpg|jpeg|svg|ico|bmp|gif)$/, //ico图片目前不支持，不包括引入ico文件会报错
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 10240,
                            name: useHash ? '[name]-[hash:7].[ext]' : '[name].[ext]?[hash:7]'
                        }
                    }],
                    include: includeDirs
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)/,
                    use: 'file-loader',
                    include: includeDirs
                }
            ])
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: useHash ? '[name]-[contentHash:8].css': '[name].css?[contentHash:8]',
                minify: {
                    collapseWhitespace: true
                }
            }),
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }
            }),
            ...htmlWebpackPlugins
        ].concat(disableStylelint ? [] : new StyleLintPlugin({
            cache: useCache,
            fix: fixCss,
            context: stylelintDir || srcDir,
            files: ['./**/*.{css,less}'],
            configFile: stylelintrc,
            ignorePath: stylelintignore,
            failOnError: false,
            emitError: true
        })).concat(!copy ? []: new CopyWebpackPlugin(copy)).concat(otherPlugins),
        ...envResolve(nodeModulesDir, { isLocal, ...buildConfig } ),
        stats
	};
	if (!isSsr) {
        if (typeof optimization === 'object') {
            webpackConfig.optimization = optimization;
        } else {
            webpackConfig.optimization = {
                splitChunks: {
                    chunks: 'all',
                    minSize: 100000,
                    maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
                    maxInitialRequests: 3, // 最大初始化请求数
                    automaticNameDelimiter: '-',
                    minChunks: 1,
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        vendor: {
                            chunks: 'initial',
                            test: cacheGroupsVendor,
                            priority: 15,
                            name: 'vendor',
                            enforce: true,
                            minChunks: 1,
                            reuseExistingChunk: true,
                            maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
                            maxInitialRequests: 3 // 最大初始化请求数
                        },
                        libs: {
                            chunks: 'initial',
                            test: cacheGroupsLibs,
                            priority: 12,
                            name: 'libs',
                            minChunks: 1,
                            enforce: true,
                            reuseExistingChunk: true,
                            maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
                            maxInitialRequests: 3 // 最大初始化请求数
                        },
                        commons: {
                            chunks: 'all',
                            minChunks: 6,
                            name: 'commons',
                            priority: 5,
                            maxSize: 409600, //240 Kib
                            maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
                            maxInitialRequests: 3 // 最大初始化请求数
                        }
                    }
                }
            };
        }
    } else {
        if (typeof optimization === 'object') {
            webpackConfig.optimization = optimization;
        }
    }
	return webpackConfig;
};

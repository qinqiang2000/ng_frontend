const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const envResolve = require('./resolve.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('@piaozone.com/mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
//const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = ({
    dllManifest, externals, entry, dist, library = '',
    libraryTarget = 'umd', libraryExport = 'exports',
    includeDirs, nodeModulesDir, disableEslint, srcDir, useCache, fixJs,
    eslintrc, eslintignore, eslintDir, disableCssModules,
    modifyVars = {}, copy, extractCss,
    otherPlugins = [],
    distDir, alias ={}, isLocal = false
}, argv = {}) => {
    const newEntrys = {};
    const entryKeys = Object.keys(entry);

    if (entryKeys.length === 0) {
        throw new Error('entry require Object');
    }

    if (library === '') {
        throw new Error('library require string to delare library name');
    }

    for (let i = 0; i < entryKeys.length; i++) {
        const k = entryKeys[i];
        newEntrys[k] = entry[k];
        newEntrys[k + '.min'] = entry[k];
    }
    if (argv.build) {
        isLocal = false;
    }
    const output = {
        path: dist || distDir,
        filename: '[name].js',
        library, // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
        libraryTarget // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    };

    if (libraryExport === 'default') {
        output.libraryExport = 'default'; //libraryExport: 'default', // 和具体export有关系，如果使用了export default导出模块这里最好使用default，否则不要添加这个配置
    }

    eslintrc = eslintrc || path.resolve(__dirname, './.eslintrc.js');
    eslintignore = eslintignore || path.resolve(__dirname, './.eslintignore');
    const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');

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
	let plugins = [
		new CleanWebpackPlugin()
	];

	if (extractCss) {
		plugins.push(new MiniCssExtractPlugin({
		  filename: "[name].css",
		  chunkFilename: "[id].css",
		  //minify: false
		}))
	}

	plugins = plugins.concat(!copy ? []: new CopyWebpackPlugin(copy));

	if (dllManifest) {
		plugins.push(new webpack.DllReferencePlugin({
            manifest: dllManifest
        }));
	}

	const optimization = {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				include: /\.min\.(js|css)$/
			})
		]
	};

	// if (extractCss) {
		optimization.minimizer.push(new OptimizeCssAssetsPlugin());
	// }

    return {
        mode: isLocal ? 'none': 'production',
        entry: newEntrys,
        output: output,
        plugins: plugins.concat(otherPlugins),
		externals: externals || {},
        module: {
            rules: eslintRule.concat([
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: useCache,
                            cacheCompression: useCache,
                            configFile: path.resolve(__dirname, './babel.config.js')
                        }
                    }],
                    include: includeDirs.concat([
                        path.join(pwyWebpackNodeDir, 'strip-ansi'),
                        path.join(pwyWebpackNodeDir, 'ansi-regex'),
                        path.join(pwyWebpackNodeDir, 'query-string'),
                        path.join(pwyWebpackNodeDir, 'strict-uri-encode')
                    ])
                },
                {
					test: /\.(css|less)$/,
					use: [
						extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
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
					include: includeDirs
				}
            ]).concat({
                test: /\.(png|jpg|jpeg|svg|ico|bmp|gif)$/, //ico图片目前不支持，不包括引入ico文件会报错
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10240,
                        name: '[name].[ext]?[hash:7]'
                    }
                }],
                include: includeDirs
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)/,
                use: 'file-loader',
                include: includeDirs
            })
        },
        ...envResolve(nodeModulesDir, { isLocal, alias }),
        optimization: optimization
    };
};
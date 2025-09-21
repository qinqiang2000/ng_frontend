// const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); //模块缓存
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const mergeWebpack = require('webpack-merge');
const getWebpackBaseConfig = require('./webpack.base.js');
const TerserPlugin = require('terser-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = function(buildConfig = {}, argv = {}) {
    const plugins = [
        // new HTMLInlineCSSWebpackPlugin(),
        new ManifestPlugin({
			generate: (seed, files, entrypoints) => {
				var manifest = files.reduce(function (manifest, file) {
					if (!manifest || !manifest[file.name]) {
						manifest[file.name] = file.path;
					}
					return manifest;
				}, seed);
				return manifest;
			}
		}),
        new CleanWebpackPlugin()
    ];

    const useCache = !!buildConfig.useCache;
	const useHash = !!buildConfig.useHash;
    if (useCache) {
        plugins.push(new HardSourceWebpackPlugin());
    }

    const myConfig = {
        mode: 'production',
        entry: buildConfig.entry,
        output: {
            publicPath: buildConfig.PUBLIC_URL || '', // http://localhost:9001/
            path: buildConfig.distDir,
            libraryTarget: 'umd',
            chunkFilename: useHash ? '[name]-[chunkhash:8].js' : '[name].js?[chunkhash:8]',
            filename: useHash ? '[name]-[chunkhash:8].js': '[name].js?[chunkhash:8]' //'[name]-[hash].js'
        },
        plugins
    };

    if (argv.debug && argv.devtool) {
        myConfig.mode = 'none';
        myConfig.devtool = argv.devtool;
    } else if (argv.devtool) {
		myConfig.mode = 'none';
        myConfig.devtool = argv.devtool;
        myConfig.output.path = myConfig.output.path.replace(/\/$/, '') + '/debug';
    } else {
		myConfig.optimization = {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    cache: useCache
                })
            ]
        };
	}
    const config = mergeWebpack([getWebpackBaseConfig({ buildConfig }), myConfig]);
    return config;
};
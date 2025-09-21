const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); //模块缓存
const mergeWebpack = require('webpack-merge');
const getWebpackBaseConfig = require('./webpack.base.js');
const TerserPlugin = require('terser-webpack-plugin');
// const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');

module.exports = function(buildConfig = {}) {
    const useCache = !!buildConfig.useCache;
	const useHash = !!buildConfig.useHash;
    const plugins = [
		new webpack.HotModuleReplacementPlugin(),
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
		})
	];
    if (useCache) {
        plugins.push(new HardSourceWebpackPlugin());
    }

    return mergeWebpack([getWebpackBaseConfig({ isSsr: true, buildConfig }), {
        mode: 'production',
        entry: buildConfig.ssrEntry,
        output: {
            publicPath: buildConfig.publicPath || '/',
            path: buildConfig.distDir,
            libraryTarget: 'umd',
            filename: useHash ? '[name]-[hash:8].js': '[name].js?[hash:8]' //'[name]-[hash].js'
        },
        plugins,
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    cache: useCache
                })
            ]
        }
    }]);
};
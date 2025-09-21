// const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const webpack = require('webpack');
const mergeWebpack = require('webpack-merge');
const getWebpackBaseConfig = require('./webpack.base.js');

module.exports = function(buildConfig) {
    return mergeWebpack([getWebpackBaseConfig({ isLocal: true, buildConfig }), {
        mode: 'development',
        devtool: 'source-map',
        output: {
            publicPath: '/', // http://localhost:9001/
            path: buildConfig.distDir,
            libraryTarget: 'umd',
            filename: '[name].js'
        },
        plugins: [
            // new HTMLInlineCSSWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin()        
            
        ]
    }]);
};

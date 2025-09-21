// const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
// const webpack = require('webpack');
const mergeWebpack = require('webpack-merge');
const getWebpackBaseConfig = require('./webpack.base.js');
const { checkUseTypeScript } = require('../lib/tools');
const getOutput = require('./getOutput');

module.exports = function(buildConfig) {
    const publicPath = buildConfig.publicPath || '/';
    const output = getOutput(true, buildConfig);
    const tsCheckInfo = checkUseTypeScript(buildConfig.rootDir, buildConfig.tsConfig);
    buildConfig.useTypeScript = tsCheckInfo.useTypeScript;
    buildConfig.tsConfigList = tsCheckInfo.tsConfigList;
    buildConfig.tsConfig = tsCheckInfo.tsConfig;

    return mergeWebpack.merge([getWebpackBaseConfig({
        shouldUseSourceMap: true,
        isLocal: true,
        buildConfig,
        publicPath,
        output
    }), {
        mode: 'development',
        output
    }]);
};

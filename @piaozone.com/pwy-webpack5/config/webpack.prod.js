const mergeWebpack = require('webpack-merge');
const getWebpackBaseConfig = require('./webpack.base.js');
const { checkUseTypeScript } = require('../lib/tools');
const getOutput = require('./getOutput');
module.exports = function (buildConfig = {}, argv = {}) {
    const useHash = !!buildConfig.useHash;
    const output = getOutput(false, buildConfig);

    const myConfig = {
        mode: 'production',
        output
    };

    if (argv.devtool) {
        myConfig.mode = 'none';
        myConfig.devtool = argv.devtool;
    }
    const fixEslint = !!argv.fixEslint;
    const disableEslint = argv.disableEslint;
    if (typeof disableEslint !== 'undefined') {
        buildConfig.disableEslint = disableEslint;
    }

    const tsCheckInfo = checkUseTypeScript(buildConfig.rootDir, buildConfig.tsConfig);
    buildConfig.useTypeScript = tsCheckInfo.useTypeScript;
    buildConfig.tsConfigList = tsCheckInfo.tsConfigList;
    buildConfig.tsConfig = tsCheckInfo.tsConfig;
    let isLocal = false;
    let shouldUseSourceMap = false;
    const nodeEnv = argv.nodeEnv;
    // 开发环境
    if (nodeEnv === 'development') {
        shouldUseSourceMap = true;
        isLocal = true;
    }
    const config = mergeWebpack.merge([getWebpackBaseConfig({
        shouldUseSourceMap,
        buildConfig,
        isLocal,
        output: myConfig.output,
        fixEslint
    }), myConfig]);
    if (buildConfig.splitChunks) {
		config.optimization.splitChunks = buildConfig.splitChunks;
	}
    return config;
};
const path = require('path');
const { checkUseTypeScript } = require('../lib/tools');
const mergeWebpack = require('webpack-merge');
const getWebpackBaseConfig = require('./webpack.base.js');

module.exports = (buildConfig = {}, argv = {}) => {
    const {
        entry,
        library,
        libraryTarget,
        distDir,
        dist
    } = buildConfig;
    const entryKeys = Object.keys(entry);
    if (entryKeys.length === 0) {
        throw new Error('entry require Object');
    }

    if (library === '') {
        throw new Error('library require string to delare library name');
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

    const myConfig = {
        mode: 'production',
        output
    };

    const fixEslint = !!argv.fixEslint;
    const disableEslint = argv.disableEslint;
    if (typeof disableEslint !== 'undefined') {
        buildConfig.disableEslint = disableEslint;
    }

    const tsCheckInfo = checkUseTypeScript(buildConfig.rootDir, buildConfig.tsConfig);
    buildConfig.useTypeScript = tsCheckInfo.useTypeScript;
    buildConfig.tsConfigList = tsCheckInfo.tsConfigList;
    buildConfig.tsConfig = tsCheckInfo.tsConfig;

    const config = mergeWebpack.merge([getWebpackBaseConfig({
        buildConfig,
        output: myConfig.output,
        fixEslint
    }), myConfig]);
    return config;
};
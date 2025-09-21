const path = require('path');
const webpack = require('webpack');
const envResolve = require('./resolve.js');

module.exports = function(buildConfig = {}) {
    const nodeModulesDir = buildConfig.nodeModulesDir;
    return {
        context: buildConfig.rootDir,
        mode: 'production',    
        ...envResolve(nodeModulesDir),
        entry: buildConfig.entry,
        output: {
            path: buildConfig.distDir,
            filename: '[name].dll.js', //输出动态链接库的文件名称
            library: '[name]'
        },
        plugins: [
            new webpack.DllPlugin({
                name: '[name]',
                path: path.join(buildConfig.distDir, '[name]-manifest.json')
            })
        ]
    };
};
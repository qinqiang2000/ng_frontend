const path = require('path');
const webpackTool = require('./webpack.base');
const nodeModulesDir = path.resolve(__dirname, '../node_modules');

console.log(webpackTool({
    buildConfig: {
        rootDir: path.resolve(__dirname, '../'),
        nodeModulesDir        
    }
}).module.rules);
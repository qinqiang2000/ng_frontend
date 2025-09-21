/* eslint-disable */

'use strict';
const path = require('path');
const rootDir = path.resolve(__dirname);
const srcDir = path.join(__dirname, './src');
const distDir = path.join(__dirname, './dist/bxd-alb');
const nodeModulesDir = path.join(__dirname, './node_modules');
const reg = "/*";
const port = 9000;
module.exports = {
    rootDir, // 项目根路径
    nodeModulesDir: nodeModulesDir,
    includeDirs: [
        srcDir,
        path.join(rootDir, 'dev-test'),
        path.join(nodeModulesDir, 'antd'),
        path.join(nodeModulesDir, '@piaozone.com'),
        path.join(nodeModulesDir, 'JSEncrypt')
    ], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    dist: distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableStylelint: false, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: false, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: true, // 使用css模块
    extractCss: true,
    useHash: false,
    library: 'getFapiaoAiBxdAlbInstance', // // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
    libraryExport: 'default', //libraryExport: 'default', // 和具体export有关系，如果使用了export default导出模块这里最好使用default，否则不要添加这个配置
    libraryTarget: 'umd', // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    entry: {
        bxdAlb: path.join(srcDir, 'bxdAlb.js')
    },
    externals: {
        // react: 'React',
        // 'react-dom': 'ReactDOM'
    },
    devServer: {
        port,
        contentBase: './dist',
        proxy: {
            '/etax-bill': {
                'target': 'https://api-sit.piaozone.com/test',
                'changeOrigin': true
            },
            '/yuque': {
                'target': 'https://www.yuque.com',
                'changeOrigin': true
            },
            [reg]: { // PAGE_PRE_PATH页面开始的路径全部访问html
                'target': 'http://localhost:' + port + '/index.html',
                'changeOrigin': true,
                bypass: function() {
                    return '/index.html';
                }
            }
        }
    }
};

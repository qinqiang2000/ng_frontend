/* eslint-disable */

'use strict';
const path = require('path');
const rootDir = path.resolve(__dirname);
const srcDir = path.join(__dirname, './src');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, './node_modules');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const port = 9009;

module.exports = {
    rootDir, // 项目根路径
    nodeModulesDir: nodeModulesDir,
    includeDirs: [
        srcDir,
        rootDir,
        path.join(rootDir, 'test'),
        path.join(nodeModulesDir, 'antd'),
        path.join(nodeModulesDir, '@piaozone.com'),
        path.join(nodeModulesDir, 'react-pdf'),
        path.join(nodeModulesDir, 'pdfjs-dist')
    ], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    distDir: distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableStylelint: false, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: false, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: true, // 使用css模块
    otherPlugins: [
        new MomentLocalesPlugin({localesToKeep: ['zh-cn']}),
        new BundleAnalyzerPlugin()
    ],
    entry: {
        draggableTree: path.join(srcDir, 'index.jsx'),
        index: path.join(rootDir, 'index.js')
    },
    devServer: {
        port,
        hotOnly: true,
        contentBase: path.join(__dirname, './dist')
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    }
};

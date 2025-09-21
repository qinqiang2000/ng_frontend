const path = require('path');
const rootDir = path.resolve(__dirname);
const srcDir = path.join(__dirname, './src/');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');
const port = 1299;

const reg = '/*';

module.exports = {
    rootDir, // 项目根路径
    nodeModulesDir,
    includeDirs: [
        srcDir,
        path.join(rootDir, 'dev-test'),
        path.join(nodeModulesDir, 'antd'),
        path.join(nodeModulesDir, '@piaozone.com'),
        path.join(nodeModulesDir, 'JSEncrypt')
    ], // 需要loader处理的目录
    srcDir, // 前端源码需要webpack处理的目录
    distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableStylelint: false, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: false, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: true, // 使用css模块
    entry: {
        index: path.join(rootDir, 'dev-test/index.js')
    },
    template: {
        index: path.join(rootDir, 'dev-test/index.html')
    },
    alias: {
        '@ant-design/icons/lib/dist$': path.resolve(srcDir, 'utils/icons.js')
    },
    devServer: {
        port,
        contentBase: './dist',
        proxy: {
            '/portalweb/api': { // api代理
                'target': 'http://localhost:10030',
                'changeOrigin': true,
                'pathRewrite': {
                    '^/portalweb/api': ''
                }
            },
            '/bill-websocket/v2/invoicewebsocket/push': {
                'target': 'https://api-sit.piaozone.com/test',
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

const path = require('path');
const rootDir = path.resolve(__dirname);
const srcDir = path.join(__dirname, './src/');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');
const port = 9000;

const PAGE_PRE_PATH = '';
const reg = PAGE_PRE_PATH + "/*";

module.exports = {
    rootDir, // 项目根路径
    nodeModulesDir: nodeModulesDir,
    includeDirs: [
        srcDir,
        path.join(rootDir, 'test'),
		path.join(nodeModulesDir, 'antd'),
		path.join(nodeModulesDir, '@piaozone.com'),
		path.join(nodeModulesDir, 'normalize.css')
	], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    eslintDir: srcDir,
    distDir: distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableCssModules: true, // 使用css模块
    disableEslint: true,
	fixJs: false,
    cacheGroupsLibs: /(antd|history)/,
    entry: {
        index: path.join(rootDir, 'test/index.js')
    },
	alias: {
		'$components': path.join(srcDir, './components'),
		"$commons": path.resolve(srcDir, './commons'),
		'$routes': path.join(srcDir, './routes'),
		'$utils': path.join(srcDir, './utils'),
		'$media': path.join(srcDir, './media')
	},
	devServer: {
        port,
        contentBase: './dist',
        proxy: {
			"/m4/": { // api代理
				"target": 'http://172.18.5.39:9104/m4/',
				"changeOrigin": true,
				"pathRewrite": {
					'^/m4': ''
				}
			},
			[reg]: { // PAGE_PRE_PATH页面开始的路径全部访问html
				"target": "http://localhost:" + port + '/index.html',
				"changeOrigin": true,
				bypass: function(req, res, proxyOptions) {
					return '/index.html';
				}
			}
		}
    }
};

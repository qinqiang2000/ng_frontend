const path = require('path');

const rootDir = path.resolve(__dirname, '.');
const srcDir = path.resolve(__dirname, './src');
const distDir = path.join(__dirname, './build');
const nodeModulesDir = path.join(__dirname, './node_modules');

const port = 9000;
const reg = '/m4-web/*';

module.exports = {
    bail: false,
    publicPath: './',
    PUBLIC_URL: '.',
    rootDir, // 项目根路径
    nodeModulesDir: nodeModulesDir, // 项目node模块安装目录
    includeDirs: [
        srcDir,
        path.join(nodeModulesDir, 'antd'),
        path.join(nodeModulesDir, '@piaozone.com')
    ], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    distDir: distDir, // 打包后输出的目录
    publicDir: path.resolve(rootDir, 'public'),
    useCache: false, // 是否开启缓存
    disableStylelint: true, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: false, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    useHash: true,
    entry: path.join(srcDir, 'index.tsx'),
    template: path.join(rootDir, 'public/index.html'),
    theme: path.join(rootDir, 'public/index.html'),
    alias: {
        $commons: path.join(rootDir, './commons')
    },
    devServer: {
        port,
        proxy: {
            "/m16/": { // api代理
                // "target": 'http://172.18.5.39:9104/m16/',
                "target": 'https://api-dev.piaozone.com/test/m16/',
				"changeOrigin": true,
				"pathRewrite": {
					'^/m16': ''
				}
			},
			"/m4/": { // api代理
                // "target": 'http://172.18.5.39:9104/m4/',
                "target": 'https://api-dev.piaozone.com/test/m4/',
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
            },
            // '/m4-demo/*': { // PAGE_PRE_PATH页面开始的路径全部访问html
			// 	"target": "http://localhost:" + port + '/demoIndex.html',
			// 	"changeOrigin": true,
			// 	bypass: function(req, res, proxyOptions) {
			// 		return '/demoIndex.html';
			// 	}
			// }
		}
    }
};
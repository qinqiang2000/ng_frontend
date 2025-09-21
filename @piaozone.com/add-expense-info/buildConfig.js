const path = require('path');
const rootDir = path.resolve(__dirname);
const srcDir = path.join(__dirname, './dev-test/');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');
const port = 9000;

const reg = "/*";

module.exports = {
    rootDir, // 项目根路径
    nodeModulesDir: nodeModulesDir,
    includeDirs: [
        path.join(rootDir, 'src'),
        path.join(rootDir, 'dev-test'),
        path.join(nodeModulesDir, 'antd'),
        path.join(nodeModulesDir, '@piaozone.com')
    ], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    distDir: distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableStylelint: false, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: false, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: true, // 使用css模块
    entry: {
        index: path.join(srcDir, 'index.jsx')
    },
	devServer: {
        port,
        contentBase: './dist',
        proxy: {
			"/api/": { // api代理
				"target": 'https://www.piaozone.com/test/api/',
				"changeOrigin": true,
				"pathRewrite": {
					'^/api': ''
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
            "/portal/": { // api代理
                "target": 'http://172.18.5.39:9104/portal/',
                // "target": 'https://api-dev.piaozone.com/test/m4/',
				"changeOrigin": true,
				"pathRewrite": {
					'^/portal': ''
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

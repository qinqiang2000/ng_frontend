const path = require('path');
const rootDir = path.resolve(__dirname);
const srcDir = path.join(__dirname, './src/');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');
const port = 9000;

const reg = "/*";

module.exports = {
    rootDir, // 项目根路径
    nodeModulesDir: nodeModulesDir,
    includeDirs: [
        srcDir,
        path.join(rootDir, 'dev-test'),
        path.join(nodeModulesDir, 'antd'),
        path.join(nodeModulesDir, '@piaozone.com')
    ], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    distDir: distDir, // 打包后输出的目录
    useCache: false, // 是否开启缓存
    disableStylelint: true, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: true, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: false, // 使用css模块
    disableCssModulesDirs: [
        // 处理cssModule无法正常加载的配置
        path.join(nodeModulesDir, 'antd')
    ],
    entry: {
        index: path.join(rootDir, 'dev-test/index.js')
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

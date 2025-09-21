const path = require('path');

const srcDir = path.join(__dirname, './src/');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');
const port = 9000;
const reg = '/m4-web/';

module.exports = {
    rootDir: path.resolve(__dirname), // 项目根路径
    nodeModulesDir: nodeModulesDir,
    includeDirs: [srcDir, path.join(nodeModulesDir, 'antd'), path.join(nodeModulesDir, '@piaozone.com')], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    distDir: distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableStylelint: true, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModulesDirs: [ // 开启css modules可能第三方不支持css modules可以通过这个配置不使用css的modules组件
        path.join(nodeModulesDir, 'antd')
    ],
    disableEslint: true, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: true, // 默认不使用css模块
    cacheGroupsVendor: /(react|react-dom|dva|dva-loading|moment)/, //optimization.splitChunks.cacheGroups中vender和libs的匹配规则
    cacheGroupsLibs: /(antd|history)/,
    eslintignore: path.join(rootDir, '.eslintignore'), // 可以不用此字段，默认会忽略 （node_modules、logs、dist、run、mock、public）
    stylelintignore: path.join(rootDir, '.stylelintignore'), // 可以不用此字段，默认会忽略 （node_modules、logs、dist、run、mock、public）
    entry: {
        index: path.join(srcDir, 'index.js')
    },
    template: { // 可以不传，可以自定义模板的路径，默认在entry入口目录的index.html
        index: path.join(srcDir, 'index.html')
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
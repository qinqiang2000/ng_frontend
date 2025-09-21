var _path = require('path');
var curDir = process.cwd();

export default { 
	entry: {
		swjgFpdk: "./src/index.js",
		pwyPolyfill: "./src/pwyPolyfill.js",
	},
	// output: {
	// 	path: "build",
	// 	filename: "swjgFpdk.js",
    // },
    // copy:[{
    //     from: __dirname + '\\build\\',
    //     to: _path.resolve('E:\\workspace-portalweb-new\\qianduan2018-07-16\\static\\gov-fpcy\\js\\'),
    //     ignore: ['pwyPolyfill.js']
    // }],
	outputPath: "build",
	ignoreMomentLocale: true,	
	extraBabelIncludes: ["node_modules/query-string", "node_modules/strict-uri-encode", "node_modules/@piaozone.com"],
	extraBabelPlugins: [["transform-remove-console", { "exclude": [ "error", "warn"] }] ]
}
export default {  	
	extraBabelPlugins: [
		["import", {"libraryName": "antd", "libraryDirectory": "es", "style": true }]
	],	
	ignoreMomentLocale: true,
	extraBabelIncludes: ["node_modules/query-string", "node_modules/strict-uri-encode", "node_modules/@piaozone.com"],
	extraBabelPlugins: [
		["transform-remove-console", { "exclude": [ "error", "warn"] }]
	]  
}
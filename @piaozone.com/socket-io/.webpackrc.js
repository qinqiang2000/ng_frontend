var _path = require('path');
var curDir = process.cwd();

export default { 
	entry: {
		index: "./lib/index.js"
	},	
	outputPath: "build",
	ignoreMomentLocale: true
}
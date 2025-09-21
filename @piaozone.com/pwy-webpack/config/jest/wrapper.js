const path = require('path');
const curDir = path.resolve(__dirname);

module.exports = require("babel-jest").createTransformer({
	configFile: path.join(curDir, 'babel.config.js')
});
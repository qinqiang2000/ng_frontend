const { copyFolder, deleteFiles } = require('../lib/tools');

function MyCleanPlugin(options) {
	this.options = options || {};
}

MyCleanPlugin.prototype.apply = function(compiler) {
	compiler.plugin("beforeRun", (compilation, callback) => {
		for (let i = 0; i < this.options.cleanDir.length; i++) {
			const curDir = this.options.cleanDir[i];
			deleteFiles(curDir);
		}
	});
	compiler.plugin('afterEmit', (compilation, callback) => {
		const { srcDir = '', tarDir = '' } = this.options;
		if (srcDir && tarDir) {
            copyFolder({
                srcDir,
                tarDir,
                cb: callback
            })
		}
	});

};

module.exports = MyCleanPlugin;

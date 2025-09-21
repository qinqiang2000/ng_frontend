const fs = require('fs');
const path = require('path');

class CopyPlugin {
    constructor(opt) {
        this.options = opt;
    }

    apply(compiler) {
        // 在emit阶段插入钩子函数
        compiler.hooks.emit.tap('CopyPlugin', (compilation) => {
            for (const name in compilation.assets) {
                const text = compilation.assets[name]._valueAsString;
                if (text) {
                    try {
                        const targetDirs = [].concat(this.options.targetDir);
                        targetDirs.forEach((targetDir) => {
                            const filePath = path.join(targetDir, name);
                            fs.writeFileSync(filePath, text, 'utf-8');
                            console.log('copy file', filePath, 'success');
                        });
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        });
    }
}

module.exports = CopyPlugin;

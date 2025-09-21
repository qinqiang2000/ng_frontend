const fs = require('fs');
const path = require('path');
function fixedNumber(n) {
    return n > 9 ? n : '0' + n;
}
function formateDate() {
    const dt = new Date();
    const year = dt.getFullYear();
    const month = fixedNumber(dt.getMonth() + 1);
    const date = fixedNumber(dt.getDate());
    const hour = fixedNumber(dt.getHours());
    const minute = fixedNumber(dt.getMinutes());
    const second = fixedNumber(dt.getSeconds());
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}

class CopyPlugin {
    constructor(opt) {
        this.options = opt;
    }

    apply(compiler) {
        // 在emit阶段插入钩子函数
        compiler.hooks.emit.tap('CopyPlugin', (compilation) => {
            for (const name in compilation.assets) {
                // console.log('compilation.assets', compilation.assets);
                const text = compilation.assets[name]._valueAsString;
                if (text) {
                    try {
                        const targetDirs = [].concat(this.options.targetDir);
                        targetDirs.forEach((targetDir) => {
                            if (fs.existsSync(targetDir)) {
                                const filePath = path.join(targetDir, name);
                                fs.writeFileSync(filePath, text, 'utf-8');
                                console.log(formateDate(), 'copy file', filePath, 'success');
                            } else {
                                console.log(formateDate(), 'copy file', filePath, 'fail, 指定目录不存在');
                            }
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

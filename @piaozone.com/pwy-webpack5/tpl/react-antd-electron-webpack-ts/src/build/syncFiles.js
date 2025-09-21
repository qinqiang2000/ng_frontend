var fs = require('fs');
var pathTool = require('path');

var checkDirectory = function (src) {
    try {
        fs.accessSync(src, fs.constants.F_OK);
        return true;
    } catch (error) {
        console.error('error', error);
        return false;
    }
};

// 复制文件，要求至少目标父目录要存在
function copyFile(fromPath, toPath, coverFlag) {
    return new Promise(function(resolve) {
        if (!fromPath || !toPath) {
            console.log('源文件和目标文件路径不能为空');
            resolve(false);
        } else if (!fs.existsSync(fromPath) || !fs.statSync(fromPath).isFile()) {
            console.log('源文件不存在或者不是文件格式', fromPath);
            resolve(false);
        } else {
            const parentDir = pathTool.dirname(toPath);
            if (!fs.existsSync(parentDir) || !fs.statSync(parentDir).isDirectory()) {
                console.warn('目标路径不存在', parentDir);
                resolve(false);
                return;
            }
            const isExist = fs.existsSync(toPath);
            if (!coverFlag && isExist) {
                console.warn('文件已存在，跳过复制', toPath);
                resolve(false);
                return;
            }
            const stats = fs.statSync(fromPath);
            if (stats.size < 400 * 1024 * 1024) { // 大于400M使用其它方式复制
                try {
                    const readData = fs.readFileSync(fromPath); // 创建读取流
                    fs.writeFileSync(toPath, readData);// 创建写入流
                    resolve(true);
                } catch (error) {
                    console.error('writeFile error', error);
                    resolve(false);
                }
                return;
            }

            const from = fs.createReadStream(fromPath);
            const to = fs.createWriteStream(toPath);
            to.on('finish', function() {
                resolve(true);
            });
            to.on('error', function(err) {
                console.error('writeFile err', err);
                resolve(false);
            });
            from.pipe(to);
        }
    });
}


// 递归创建目录
function mkdirs(dirname) {
    // 判断是否存在当前 path 的最后一层目录
    if (fs.existsSync(dirname)) {
        // 存在，则不做操作，直接返回
        return true
    }
    if (mkdirs(pathTool.dirname(dirname))) {
        // 若存在，则在当前目录，创建下一层目录
        fs.mkdirSync(dirname);
        return true
    }
}

// 复制文件和目录
function copyOneFileOrDir(sourcefile, targetFile, coverFlag) {
    const stats = fs.statSync(sourcefile);
    if (stats.isDirectory()) {
        mkdirs(targetFile);
    } else {
        var dirName = pathTool.dirname(targetFile);
        mkdirs(dirName);
        copyFile(sourcefile, targetFile, coverFlag);
    }
}

var getAllFiles = function(src, fileList = []) {
    var checkRes = checkDirectory(src);
    if (checkRes) {
        let paths = fs.readdirSync(src); // 同步读取当前目录
        if (paths.length > 0) {
            paths.forEach(function (path) {
                var _src = pathTool.join(src, path);
                var stats = fs.statSync(_src);
                if (stats) {
                    if (stats.isFile()) {
                        fileList.push(_src);
                    } else if(stats.isDirectory()) {
                        getAllFiles(_src, fileList);
                    }
                }
            });
        } else {
            fileList.push(src);
        }
    }
}

function copyDir(source, dist, coverFlag) {
    if (typeof coverFlag === 'undefined') {
        coverFlag = true;
    }
    if (!fs.existsSync(source)) {
        console.log('源路径不存在', source);
        return false;
    } else if (!fs.existsSync(dist) || !fs.statSync(dist).isDirectory()) {
        console.log('目标目录不存在', dist);
        return false;
    } else if (!fs.statSync(source).isDirectory()) {
        console.log('源路径不是目录', source);
        return false;
    }

    const sourceDirName = pathTool.basename(source);
    const targetDirPath = pathTool.join(dist, sourceDirName);
    if (fs.existsSync(targetDirPath)) {
        console.log('目录已存在存在', targetDirPath);
        return false;
    }
    fs.mkdirSync(targetDirPath);
    // 获取指定目录文件列表
    const list = [];
    getAllFiles(source, list);
    const len = list.length;
    // 开始复制
    for (let i = 0; i < len; i++) {
        var sourceFilePath = list[i];
        var filePath = list[i].replace(source, '').replace(/^[\/\\]{1,}/, ''); // 清理掉默认的目录符号
        var targetPath = pathTool.join(targetDirPath, filePath); // 同步读取当前目录
        copyOneFileOrDir(sourceFilePath, targetPath, coverFlag);
    }
    return true;
}

function copyDirs(source, dist, subList = []) {
    if (!fs.existsSync(source)) {
        console.log('需要复制的路径不存在，请检查!');
    } else if (!fs.existsSync(dist) || !fs.statSync(dist).isDirectory()) { // 指定目录不存在
        console.log('指定目标目录不存在，请检查!');
    } else {
        // 如果是文件直接复制
        if (fs.existsSync(source) && !fs.statSync(source).isDirectory()) {
            console.log(source, '同步中...');
            copyOneFileOrDir(source, pathTool.join(dist, pathTool.basename(source)));
        } else if (subList.length === 0) { // 不是复制子目录，则全部复制
            copyDir(source, dist);
        } else {
            for (let j = 0; j < subList.length; j++) {
                var curPath = subList[j].replace(/[\/\\]{1,}$/, ''); // 超过4个的参数可以是目录或者文件
                var curSource = pathTool.join(source, curPath);
                // 是文件
                if (fs.existsSync(curSource) && !fs.statSync(curSource).isDirectory()) {
                    console.log(curSource, '同步中...');
                    copyOneFileOrDir(curSource, pathTool.join(dist, curPath));
                    console.log(curSource, '同步完成');
                } else { // 是目录
                    copyDir(curSource, dist);
                }
            }
        }
    }
}


// 清理掉某个目录或者删除掉某个文件
function clearTarget(src) {
    // 文件
    if (fs.statSync(src).isFile()) {
        fs.unlinkSync(src);
        return;
    }

    const paths = fs.readdirSync(src); // 同步读取当前目录
    // 空目录
    if (paths.length === 0) {
        fs.rmdirSync(src);
        return;
    }

    paths.forEach(function (path) {
        var _src = pathTool.join(src, path);
        clearTarget(_src);
    });
    fs.rmdirSync(src);
}

module.exports = {
    copyDir,
    copyDirs,
    copyFile,
    mkdirs,
    clearTarget
};
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const checkUseTypeScript = function(rootDir, tsConfig = '') {
    let tsConfigList = [];
    let useTypeScript = false;
    if (tsConfig && fs.existsSync(tsConfig)) {
        tsConfigList = [tsConfig];
        useTypeScript = true;
    } else {
        const tsconfigFixed = path.join(rootDir, 'tsconfig.json');
        if (fs.existsSync(tsconfigFixed)) {
            useTypeScript = true;
            tsConfigList = [tsconfigFixed];
            tsConfig = tsconfigFixed;
        }
    }
    return {
        tsConfigList,
        tsConfig,
        useTypeScript
    };
}

/**
 *
 * @param {string} srcPath 源文件
 * @param {string} tarPath 目标文件路径
 * @param {fun} cb 回调函数
 */
const copyStreamFile = function(srcPath, tarPath, cb) {
	const rs = fs.createReadStream(srcPath);
	rs.on('error', function(err) {
		if (err) {
			console.log('read error', srcPath);
		}
		cb && cb(err);
	});

	const ws = fs.createWriteStream(tarPath);
	ws.on('error', function(err) {
		if (err) {
			console.log('write error', tarPath);
		}
		cb && cb(err);
	});
	ws.on('close', function(ex) {
		cb && cb(ex);
	});
	rs.pipe(ws);
};

/**
 *
 * @param {string} srcPath 源文件
 * @param {string} tarPath 目标文件路径
 * @param {fun} cb 回调函数
 */
const copyFile = function(srcPath, tarPath, cb, handleFile) {

    if (typeof handleFile === 'function') {
        let content = fs.readFileSync(srcPath, 'utf-8');
        content = handleFile(content, srcPath, tarPath);
        if (typeof content === 'string') {
            fs.writeFileSync(tarPath, content);
        }
    } else {
        const content = fs.readFileSync(srcPath);
        fs.writeFileSync(tarPath, content);
    }

    cb && cb();
};

/**
 *
 * @param {string} srcDir 需要复制的目录
 * @param {string} tarDir 复制的位置
 * @param {func} cb 回调函数
 */
const copyFolder = function(opt) {
    const { srcDir, tarDir, cb, handleFile, filter } = opt;
	fs.readdir(srcDir, function(err, files = []) {
		let count = 0;
		const checkEnd = function() {
			++count == files.length && cb && cb();
		}

		if (err) {
			checkEnd();
			return;
		}

		files.forEach(function(file) {
			const srcPath = path.join(srcDir, file);
            const tarPath = path.join(tarDir, file);
            if (typeof filter === 'function' && filter(srcPath) || typeof filter === 'undefined') {
                fs.stat(srcPath, function(err, stats) {
                    if (stats.isDirectory()) {
                        fs.mkdir(tarPath, function(err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            copyFolder({...opt, srcDir: srcPath, tarDir: tarPath, cb: checkEnd});
                        });
                    } else {
                        if (typeof handleFile === 'function') {
                            copyFile(srcPath, tarPath, checkEnd, handleFile);
                        } else {
                            copyStreamFile(srcPath, tarPath, checkEnd);
                        }
                    }
                });
            }
		});
		//为空时直接回调
		files.length === 0 && cb && cb();
	});
};
const readFileSync = function(filePath, charset = 'utf-8') {
    try {
        const content = fs.readFileSync(filePath, charset);
        return content;
    } catch (error) {
        this.ctx.logger.error(error);
        return '';
    }
}

const execSpawn = function(cmdStr) {
	return new Promise((resolve, reject) => {
        console.log(cmdStr);

        let cmd = '';
        if (os.platform().indexOf('linux') !== -1) { // linux系统
            cmd = spawn('/bin/sh', ['-c', cmdStr], {stdio: 'inherit'});
        } else {
            cmd = spawn('cmd', ['/s', '/c', cmdStr], {stdio: 'inherit'});
        }

		cmd.on('exit', function(code){
			if (code === 0) {
				resolve(code);
			} else{
				reject(code);
			}
		});
	})
}

const execSpawns = function(list, index = 0, callback){
	if (index >= list.length) {
		callback(0);
		return;
	}

	execSpawn(list[index]).then(()=>{
		execSpawns(list, index + 1, callback);
	}).catch((e) => {
        console.log('命令执行失败', list[index]);
		callback(-1);
	});
}

const deleteFiles = function(dirPath, maxLiveTime = 0, needRemoveRootDir = false) {
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        let deleteDirFlag = true;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const curPath = path.join(dirPath, file);
            const stat = fs.statSync(curPath);
            if (stat.isDirectory()) {
                return deleteFiles(curPath, maxLiveTime, true);
            } else if (stat.isFile()) {
                if (maxLiveTime === 0) { // 存活时间不判断，直接清空
                    fs.unlinkSync(curPath);
					console.log('remove file', curPath);
                } else {
                    const createTime = parseInt(stat.ctimeMs);
                    const nowTime = +new Date();
                    if (nowTime - createTime > maxLiveTime) {
                        fs.unlinkSync(curPath);
						console.log('remove file', curPath);
                    } else {
                        deleteDirFlag = false; // 有一个文件没有删除，则不删除父目录
                    }
                }
            } else {
                deleteDirFlag = false; // 有其它文件格式存在，不删除父目录（块设备， 字符设备，软链接等）
            }
        }

        if (needRemoveRootDir && deleteDirFlag) {
            try {
                fs.rmdirSync(dirPath);
            } catch (e) {
                console.error(e);
            }
        }
        return true;
    }
}

module.exports = {
    readFileSync,
	execSpawn,
	execSpawns,
    copyFile,
    copyFolder,
    copyStreamFile,
    deleteFiles,
    checkUseTypeScript
};
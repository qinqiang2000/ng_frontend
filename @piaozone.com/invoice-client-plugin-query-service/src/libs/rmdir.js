/* eslint-disable no-undef*/
// import fs from 'fs';
// import log from '$client/logs/index';
// import path from 'path';

export default function rmDir(dirPath, maxLiveTime = 0, needRemoveRootDir = false) {
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const curPath = path.join(dirPath, file);
            const stat = fs.statSync(curPath);
            if (stat.isDirectory()) {
                rmDir(curPath, maxLiveTime, true);
            } else if (stat.isFile()) {
                // 存活时间不判断，直接清空
                if (maxLiveTime === 0) {
                    fs.unlinkSync(curPath);
                } else {
                    const createTime = parseInt(stat.ctimeMs);
                    const nowTime = +new Date();
                    if (nowTime - createTime > maxLiveTime) {
                        fs.unlinkSync(curPath);
                    }
                }
            }
        }
        const leftFiles = fs.readdirSync(dirPath);
        // 空目录才能删除
        if (needRemoveRootDir && leftFiles.length === 0) {
            try {
                fs.rmdirSync(dirPath);
            } catch (e) {
                log.info('文件删除异常', e);
            }
        }
        return true;
    }
}
export function sleep(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timeout || 1000);
    });
}

export function randomSleep(minTime = 2000, maxTime = 3000) {
    return new Promise((resolve) => {
        const time = minTime + Math.random() * (maxTime - minTime);
        setTimeout(() => {
            resolve(null);
        }, time);
    });
}

// 递归创建目录
export function mkdirs(dirname: string) {
    // 父目录和当前目录一样说明已经是根目录，windows盘符可能不存在导致堆栈溢出
    if (dirname === path.dirname(dirname)) {
        return fs.existsSync(dirname);
    }

    // 判断是否存在当前 path 的最后一层目录
    if (fs.existsSync(dirname)) {
        // 存在，则不做操作，直接返回
        return true;
    }
    if (mkdirs(path.dirname(dirname))) {
        // 若存在，则在当前目录，创建下一层目录
        fs.mkdirSync(dirname);
        return true;
    }
}

export function fixedFloatNumber(v: any, n: number) {
    return parseFloat(v).toFixed(n);
}

export function trim(s = '') {
    if (typeof s.replace === 'function') {
        return s.replace(/^\s+/g, '').replace(/\s+$/g, '');
    }
    return s;
}

export function clearChars(str: string) {
    return trim(str).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9]/g, '');
}
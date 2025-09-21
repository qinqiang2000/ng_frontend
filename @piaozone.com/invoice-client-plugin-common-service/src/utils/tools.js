/* eslint-disable */

export function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timeout || 1000);
    });
}

export function randomSleep(minTime = 2000, maxTime = 3000) {
    return new Promise((resolve, reject) => {
        const time = minTime + Math.random() * (maxTime - minTime);
        setTimeout(() => {
            resolve();
        }, time);
    });
}

// 递归创建目录
export function mkdirs(dirname) {
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

export function fixedFloatNumber(v, n) {
    return parseFloat(v).toFixed(n);
}

export function trim(s = '') {
    if (typeof s.replace === 'function') {
        return s.replace(/^\s+/g, '').replace(/\s+$/g, '');
    }
    return s;
}

export function clearChars(str) {
    return trim(str).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9]/g, '');
}

export function parseSetCookie(setCookieHeader) {
    return setCookieHeader.map(cookieString => {
        const parts = cookieString.split(';').map(part => part.trim());
        const cookie = {};
        parts.forEach((part) => {
            const [key, value] = part.split('=');
            if (!cookie.name) {
                cookie.name = key;
                cookie.value = value;
            } else {
                // Convert the key to camelCase for consistency
                const propName = key.charAt(0).toLowerCase() + key.slice(1).replace(/-[A-Za-z]/g, m => m.charAt(1).toUpperCase());
                cookie[propName] = value || true;
            }
        });
        return cookie;
    });
}

export function accountHidePart(value) {
    if (typeof value !== 'string') {
        return value;
    }

    // 税局实名账号名已加密
    if (~value.indexOf('********')) {
        return value;
    }

    function getAccountHideRegExp(len) {
        let a = 1;
        let b = 1;
        let c = 0;
        if (len > 1) {
            while (len > a + b + c) {
                if (b < 4) {
                    b++;
                    continue;
                }

                if (a < 3) {
                    a++;
                    continue;
                }

                if (c < 4) {
                    c++;
                    continue;
                }
                b = len - a - c;
            }
            return `(.{${a}})(.{${b}})(.{${c}})`;
        }
        return '(.)(.?)(.?)';
    }

    const length = value.length;
    const reg = new RegExp(getAccountHideRegExp(length));
    return value.replace(reg, (match, p1, p2, p3) => {
        return p1 + '*'.repeat(p2.length) + p3;
    });
}

export function isEmpty(v) {
    if(typeof v === 'undefined' || v === false || v === null || v === '') {
        return true;
    }
    return false;
}
/* eslint-disable */
import { loginedListKey, ETAX_LOGIN_OPTIONS } from '../constants';
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

export async function promiseTimeout(p, opt) {
    const maxTimeout = opt.maxTimeout || opt.timeout || 60000;
    // 使超时大于业务时间
    const deltaTimeout = opt.deltaTimeout || 5000;
    let timeoutId = null;
    const p1 = new Promise((resolve) => {
        timeoutId = global.setTimeout(() => {
            resolve(errcodeInfo.eventTimeout);
        }, maxTimeout + deltaTimeout);
    });
    let res;
    try {
        res = await Promise.race([p1, p]);
    } catch (error) {
        console.error('请求异常', error);
        res = errcodeInfo.govErr;
    }
    global.clearTimeout(timeoutId);
    return res;
}

export function deleteLoginedPage(pageId) {
    const listLogined = pwyStore.get(loginedListKey) || [];
    const curIndex = listLogined.indexOf(pageId);
    if (curIndex !== -1) {
        listLogined.splice(curIndex, 1);
        pwyStore.set(loginedListKey, listLogined, 12 * 60 * 60);
    }
}


// 根据企业税号获取税务地址信息
export function getSwjgInfoByTaxNo(taxNo) {
    if (taxNo === '') {
        return false;
    }

    let code = '';
    // 三证合一税号
    if (taxNo.length === 18) {
        code = taxNo.substr(2, 4);
    } else if (taxNo.length === 15) {
        code = taxNo.substr(0, 4);
    } else {
        return false;
    }

    let cityItem = ETAX_LOGIN_OPTIONS.filter((item) => {
        return item.code === code;
    });

    if (cityItem.length !== 0) {
        return cityItem[0];
    }

    code = code.substr(0, 2) + '00';

    cityItem = ETAX_LOGIN_OPTIONS.filter((item) => {
        return item.code === code;
    });

    if (cityItem.length !== 0) {
        return cityItem[0];
    }
    return false;
}
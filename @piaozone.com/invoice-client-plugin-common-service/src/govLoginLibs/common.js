/* global window document location FileReader */
/* eslint-disable func-names */
export function checkReOpenedPage({ originUrl }) {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    const loginMsg = msgObj && msgObj.innerText ? msgObj.innerText : '';
    if (loginMsg && loginMsg.indexOf('会话已失效') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: true
            }
        };
    }

    // 地址栏已经重定向到其它页，直接登录失效
    if (location.href !== originUrl) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: true
            }
        };
    }

    if (window.pwyHelpers && window.pwyHelpers.openRequest) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: false
            }
        };
    }
    const bodyText = document.body.innerText || '';
    if ((bodyText.indexOf('立即开票') !== -1 && bodyText.indexOf('批量开') !== -1) ||
    (bodyText.indexOf('发票查询统计') !== -1)) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: false
            }
        };
    }
    return false;
}

export function reloadCheck() {
    const bodyText = document.body.innerText || '';
    if (bodyText.indexOf('账号已退出') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: true
            }
        };
    }

    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: true
            }
        };
    }
    if (((bodyText.indexOf('立即开票') !== -1 && bodyText.indexOf('批量开') !== -1) ||
    (bodyText.indexOf('发票查询统计') !== -1)) && document.body.innerText.indexOf('账号已退出') === -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: false
            }
        };
    }
    return false;
}

export function waitOpenRequest({ originUrl }) {
    // 地址栏已经重定向到其它页，直接登录失效
    if (location.href !== originUrl) {
        return 2;
    }
    if (window.pwyHelpers && typeof window.pwyHelpers.openRequest === 'function') {
        return 1;
    }
    return 3;
}

export function reload({ originUrl }) {
    if (location.href === originUrl) {
        location.reload();
    }
}

export async function evaluateJs(innerOpt = {}) {
    const funcName = innerOpt.funcName;
    const requestUrl = innerOpt.url;
    const data = innerOpt.data;
    const otherData = innerOpt.otherData;
    let method = innerOpt.method || 'post';
    method = method.toLocaleLowerCase();
    const useCommonRequest = innerOpt.useCommonRequest;
    const disableEncry = innerOpt.disableEncry;
    const localUrl = window.location.href;
    const timeout = innerOpt.timeout || 120000;
    if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(localUrl) && !/^https:\/\/.*/.test(requestUrl)) {
        return {
            errcode: '91300',
            description: '税局登录失效，请重新进行业务操作'
        };
    }

    if (!window.pwyHelpers || typeof window.pwyHelpers[funcName] !== 'function') {
        // 文件比较久需要删除
        return {
            errcode: '9301',
            description: '税局执行异常, 请重新进行业务操作'
        };
    }

    // 需要使用commonRequest，但不存在需要更新js
    if (useCommonRequest && typeof window.pwyHelpers.commonRequest !== 'function') {
        return {
            errcode: '9301',
            description: '税局执行异常, 请重新进行业务操作'
        };
    }

    if (method === 'get' && typeof window.pwyHelpers.commonRequest === 'function') {
        try {
            const res2 = await window.pwyHelpers.commonRequest({
                timeout: timeout,
                data: data,
                method: method,
                url: requestUrl
            }, otherData);
            return {
                errcode: '0000',
                description: '操作成功',
                type: 'commonRequest',
                data: res2
            };
        } catch (error) {
            let errMsg = error ? error.message : '税局登录失效，请重新进行业务操作';
            // 税局代码错误，修改返回描述
            if (errMsg.indexOf('undefined') !== -1) {
                errMsg = '税局请求异常，请稍后再试!';
            }
            return {
                errcode: error ? '95000' : '91300',
                type: 'commonRequest',
                description: errMsg
            };
        }
    }
    let commonRequestData = data;
    let res1 = {};

    // 需要加密
    if (!disableEncry) {
        res1 = await window.pwyHelpers[funcName](data, requestUrl);
        commonRequestData = res1.data;
    }

    if (useCommonRequest && typeof window.pwyHelpers.commonRequest === 'function') {
        try {
            const res2 = await window.pwyHelpers.commonRequest({
                data: commonRequestData,
                timeout: timeout,
                headers: {
                    ...res1.headers,
                    requestUid: innerOpt.id
                },
                method: method,
                url: requestUrl
            }, otherData);
            return {
                errcode: '0000',
                description: '操作成功',
                type: 'commonRequest',
                data: res2
            };
        } catch (error) {
            let errMsg = error ? error.message : '税局登录失效，请重新进行业务操作';
            // 税局代码错误，修改返回描述
            if (errMsg.indexOf('undefined') !== -1) {
                errMsg = '税局请求异常，请稍后再试!';
            }
            return {
                errcode: error ? '95000' : '91300',
                type: 'commonRequest',
                description: errMsg
            };
        }
    }
    return {
        errcode: '0000',
        type: 'encryData',
        data: res1
    };
}

export async function evaluateDownload(innerOpt = {}) {
    const funcName = innerOpt.funcName || 'pwyDownload';
    const requestUrl = innerOpt.url;
    const localUrl = window.location.href;
    const timeout = innerOpt.timeout || 180000;
    if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(localUrl)) {
        return {
            errcode: '91300',
            description: '税局登录失效，请重新进行业务操作'
        };
    }
    if (typeof window[funcName] !== 'function') {
        return {
            errcode: '9301',
            description: '税局执行异常, 请重新进行业务操作'
        };
    }
    // eslint-disable-next-line
    let res2 = {};
    try {
        res2 = await window[funcName]({
            url: requestUrl,
            method: 'get',
            timeout: timeout,
            headers: {
                'security-mes-key': ''
            },
            responseType: 'blob'
        });
    } catch (error) {
        const errMsg = error.message || '税局请求异常，请稍后再试!';
        // const failFetch = errMsg.indexOf('Network Error') !== -1;
        // const description = failFetch ? '电子税局登录已失效，请重新进行业务操作!': errMsg;
        return {
            errcode: '95000',
            description: errMsg
        };
    }
    const resHeaders = res2.headers || {};
    const disposition = resHeaders['content-disposition'] || '';
    const contentType = resHeaders['content-type'] || '';
    if (res2.status === 200) {
        const getBase64 = (blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsBinaryString(blob);
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => resolve('');
            });
        };
        if (contentType.indexOf('text/html') !== -1) {
            return {
                errcode: '91300',
                description: '税局登录失效，请重新进行业务操作',
                data: {
                    status: res2.status,
                    contentType
                }
            };
        }
        if (contentType.indexOf('application/json') !== -1) {
            return {
                errcode: '95000',
                description: '税局请求异常，请稍后再试!',
                data: {
                    status: res2.status,
                    disposition,
                    contentType
                }
            };
        }
        let base64 = '';
        if (disposition) {
            // const blobData = await res2.blob();
            base64 = await getBase64(res2.data);
        }
        return {
            errcode: '0000',
            description: '操作成功',
            type: 'commonRequest',
            data: {
                status: res2.status,
                disposition,
                contentType,
                base64
            }
        };
    }
    if (res2.status === 301 || res2.status === 302) {
        return {
            errcode: '91300',
            description: '电子税局登录失效',
            data: {
                status: res2.status,
                contentType
            }
        };
    }
    return {
        errcode: '95000',
        description: '税局请求异常，请稍后再试',
        data: {
            status: res2.status,
            disposition,
            contentType
        }
    };
}

export async function evaluateFetchDownload(innerOpt = {}) {
    const funcName = innerOpt.funcName || 'dkgxDownload';
    const requestUrl = innerOpt.url;
    const localUrl = window.location.href;
    const timeout = innerOpt.timeout || 180000;
    if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(localUrl)) {
        return {
            errcode: '91300',
            description: '税局登录失效，请重新进行业务操作'
        };
    }
    if (typeof window[funcName] !== 'function' && typeof window.pwyDownload !== 'function') {
        return {
            errcode: '9301',
            description: '税局执行异常, 请重新进行业务操作'
        };
    }
    // eslint-disable-next-line
    let res2 = {};
    let isUseFetch = true;
    try {
        if (window[funcName]) {
            res2 = await window[funcName](requestUrl, '下载');
        } else if (window.pwyDownload) {
            isUseFetch = false;
            res2 = await window.pwyDownload({
                url: requestUrl,
                timeout: timeout,
                method: 'get',
                headers: {
                    'security-mes-key': ''
                },
                responseType: 'blob'
            });
        }
    } catch (error) {
        const errMsg = error.message || '税局请求异常，请稍后再试!';
        // const failFetch = errMsg.indexOf('Network Error') !== -1;
        // const description = failFetch ? '电子税局登录已失效，请重新进行业务操作!': errMsg;
        return {
            errcode: '95000',
            description: errMsg
        };
    }
    const resHeaders = res2.headers || {};
    const disposition = isUseFetch ? res2.getResponseHeader('content-disposition') : (resHeaders['content-disposition'] || '');
    const contentType = isUseFetch ? res2.getResponseHeader('content-type') : (resHeaders['content-type'] || '');
    if (res2.status === 200) {
        const getBase64 = (blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsBinaryString(blob);
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => resolve('');
            });
        };
        if (contentType.indexOf('text/html') !== -1) {
            return {
                errcode: '91300',
                description: '税局登录失效，请重新进行业务操作',
                data: {
                    status: res2.status,
                    contentType
                }
            };
        }
        if (contentType.indexOf('application/json') !== -1) {
            return {
                errcode: '95000',
                description: '税局请求异常，请稍后再试!',
                data: {
                    status: res2.status,
                    disposition,
                    contentType
                }
            };
        }
        const cBlob = isUseFetch ? res2.response : res2.data;
        const base64 = await getBase64(cBlob);
        return {
            errcode: '0000',
            type: 'commonRequest',
            description: '操作成功',
            data: {
                status: res2.status,
                disposition,
                contentType,
                base64
            }
        };
    }
    if (res2.status === 301 || res2.status === 302) {
        return {
            errcode: '91300',
            description: '电子税局登录失效',
            data: {
                status: res2.status,
                contentType
            }
        };
    }
    return {
        errcode: '95000',
        description: '税局请求异常，请稍后再试',
        data: {
            status: res2.status,
            disposition,
            contentType
        }
    };
}

export function waitRedirect({ baseUrl, ignoreMiddlePage }) {
    const ck = window.pwyNightmare.getCookie('SSO_SECURITY_CHECK_TOKEN');
    const localUrl = location.href;
    const inputObj = document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]');
    if (inputObj) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                logout: true
            }
        };
    }

    if (ck && localUrl.indexOf(baseUrl) !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                getLzkqow: typeof window['ssx91m$212'] === 'function',
                szzhDomain: document.location.host,
                szzhUrl: document.location.href,
                baseUrl: document.location.origin
            }
        };
    }
    // 不需要检查中间页
    if (ignoreMiddlePage) {
        return false;
    }
    let openInvoiceItem;
    let szzhItem;
    const bodyText = document.body.innerText || '';
    if (bodyText.indexOf('蓝字发票开具') !== -1) {
        openInvoiceItem = 1;
    }
    if (bodyText.indexOf('税务数字账户') !== -1) {
        szzhItem = 1;
    }

    // 出现中间页
    if (localUrl.indexOf(baseUrl) === -1 && (openInvoiceItem || szzhItem)) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                hasMiddlePage: true,
                openInvoiceCompany: openInvoiceItem,
                szzhCompany: szzhItem
            }
        };
    }
    return false;
}

export function checkOpenAuth() {
    const ck = window.pwyNightmare.getCookie('SSO_SECURITY_CHECK_TOKEN');
    const invoiceTips = document.querySelector('.t-dialog__body');

    if (invoiceTips && invoiceTips.innerText.indexOf('不允许开票') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: '不允许开票'
            }
        };
    }
    const contentText = document.querySelector('.hide-side-layout__page-content');
    if (ck && contentText && contentText.innerText.length > 30) {
        return {
            errcode: '0000',
            data: true
        };
    }
    return false;
}
export async function openRequestHelper(innerOpt = {}) {
    if (!window.pwyHelpers || typeof window.pwyHelpers.openRequest !== 'function') {
        return {
            errcode: '91300',
            description: '税局执行异常, 请重新进行业务操作'
        };
    }
    // eslint-disable-next-line
    const res1 = await window.pwyHelpers.openRequest('tyfpkj', innerOpt.data);
    return res1;
}

export async function getLzkqow(opt = {}) {
    const urlPath = opt.urlPath;
    if (!window['ssx91m$212']) {
        return {
            errcode: '0000',
            description: 'success'
        };
    }
    const result = window['ssx91m$212'](urlPath, opt.data, window.getLzkqowError);
    return result;
}

export async function dcode419(opt = {}) {
    const globalInfo = opt.globalInfo || {};
    const dunm_data = opt.dunm_data;
    for (const k in globalInfo) {
        if (globalInfo.hasOwnProperty(k)) {
            window[k] = globalInfo[k];
        }
    }
    window['$dunm']['SetLocalStorage']('dunm_data', dunm_data);
    const initResult = window.initGetLzkqow(dunm_data, window);
    initResult.run();
    return true;
}
// 拖动滑块
export function drayBtn() {
    return new Promise((resolve) => {
        try {
            const btn = document.querySelector('.el-form-item__content .handler');
            if (!document.querySelector('.el-form-item__content .drag_text') || !btn) {
                resolve({
                    errcode: '3000',
                    description: '对象不存在'
                });
                return;
            }
            const list = [];
            const mousedown = document.createEvent('MouseEvents');
            const rect = btn.getBoundingClientRect();
            const x = rect.x;
            const y = rect.y;
            list.push({ x, y, dx: 0, dy: 0 });
            mousedown.initMouseEvent('mousedown', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
            btn.dispatchEvent(mousedown);
            (function next(startX, startY, dx, dy) {
                const mousemove = document.createEvent('MouseEvents');
                const _x = startX + dx;
                const _y = startY + dy;
                mousemove.initMouseEvent('mousemove', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                btn.dispatchEvent(mousemove);
                list.push({ x: _x, y: _y, dx, dy });
                // btn.dispatchEvent(mousemove);
                const dragTextObj = document.querySelector('.el-form-item__content .drag_text');
                if (dragTextObj.innerText === '验证通过') {
                    const mouseup = document.createEvent('MouseEvents');
                    mouseup.initMouseEvent('mouseup', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                    btn.dispatchEvent(mouseup);
                    resolve({
                        errcode: '0000',
                        description: 'success',
                        data: list
                    });
                } else {
                    const tempDx = Math.ceil(Math.random() * 30) + 20;
                    setTimeout(() => {
                        next(_x, _y, tempDx, dy);
                    }, 100);
                }
            })(x, y, 0, 0);
        } catch (error) {
            resolve({
                errcode: '5000',
                description: error.toString()
            });
        }
    });
}

export function checkDray() {
    const msgObj = document.querySelector('.el-form-item__content .drag_text');
    if (msgObj && msgObj.innerText.indexOf('滑块') !== -1) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }
    return true;
}

export function getStorage(opt = {}) {
    const localStorageData = window.localStorage;
    const sessionStorageData = window.sessionStorage;
    const curUrl = location.href;
    const storageType = opt.storageType;
    if (storageType === 'dppt' && !/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(curUrl)) {
        return {
            errcode: '9000',
            description: '无关的地址不需要提取缓存'
        };
    }
    if (storageType === 'tpass' && !/https:\/\/tpass\..+\.chinatax\.gov\.cn:8443/.test(curUrl)) {
        return {
            errcode: '9000',
            description: '无关的地址不需要提取缓存'
        };
    }

    if (storageType === 'dppt' && (!localStorageData.getItem('dunm_data') || sessionStorageData.length === 0)) {
        return {
            errcode: '9000',
            description: '无数据'
        };
    }

    if (storageType === 'tpass' && localStorageData.length === 0) {
        return {
            errcode: '9000',
            description: '无数据'
        };
    }

    return {
        errcode: '0000',
        data: {
            localStorageData,
            sessionStorageData
        }
    };
}

export function getbodyText() {
    const innerText = document.body.innerText || '';
    return {
        errcode: '0000',
        data: innerText
    };
}

export function checkNtIsOk() {
    const innerText = document.body.innerText || '';
    if (innerText.length > 60) {
        return {
            errcode: '0000',
            data: true
        };
    }
    return false;
}

export const setStorage = (opt = {}) => {
    const localStorageData = opt.localStorageData;
    const sessionStorageData = opt.sessionStorageData;
    const curUrl = location.href;
    if (/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(curUrl)) {
        if (window.localStorage.length === 0 || !window.localStorage.getItem('dunm_data')) {
            Object.keys(localStorageData).forEach((curKey) => {
                window.localStorage.setItem(curKey, localStorageData[curKey]);
            });
            Object.keys(sessionStorageData).forEach((curKey) => {
                window.sessionStorage.setItem(curKey, sessionStorageData[curKey]);
            });
        }
    }
    return {
        errcode: '0000',
        description: '操作成功'
    };
};

export const getCompanyInfo = () => {
    const jztsSessionMap = window.sessionStorage.getItem('jztsSessionMap');
    let taxNo = '';
    let companyName = '';
    const curUrl = location.href;
    if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(curUrl)) {
        return {
            errcode: '91500',
            description: '税局页面异常'
        };
    }
    try {
        if (jztsSessionMap) {
            taxNo = JSON.parse(jztsSessionMap).nsrsbh;
        }
        if (document.querySelector('.g-layout__header .user-info')) {
            companyName = document.querySelector('.g-layout__header .user-info').innerText;
            companyName = companyName.replace(/^\s+/g, '').replace(/\s+$/g, '');
        }
        return {
            errcode: '0000',
            data: {
                taxNo,
                companyName
            }
        };
    } catch (error) {
        return {
            errcode: '91500',
            description: '税局页面异常'
        };
    }
};
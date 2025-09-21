import JSEncrypt from 'jsencrypt';
import { JSENCRYPT_PUBLICKEY } from '../constants';

function getInitialStateByName(name) {
    let data = null;
    return function() {
        if (data === null) {
            data = window?.__INITIAL_STATE__[name] || '';
            if (name === 'client_type') data = Number(data) || 4;
        }
        return data;
    };
}

export const getAPI_PRE_PATH = getInitialStateByName('API_PRE_PATH');
export const getClientType = getInitialStateByName('client_type');
export const getLongLinkName = getInitialStateByName('longLinkName');
export const getFpdkType = getInitialStateByName('fpdk_type');

export function encryptByJSEncrypt(data) {
    const string = encodeURI(JSON.stringify(data));
    const jsencrypt = new JSEncrypt();
    jsencrypt.setPublicKey(JSENCRYPT_PUBLICKEY);
    const k = jsencrypt.getKey();
    try {
        let ct = '';
        // RSA每次加密117bytes，需要辅助方法判断字符串截取位置
        // 1.获取字符串截取点
        const bytes = [];
        bytes.push(0);
        let byteNo = 0;
        let c;
        const len = string.length;
        let temp = 0;
        for (let i = 0; i < len; i++) {
            c = string.charCodeAt(i);
            if (c >= 0x010000 && c <= 0x10ffff) {
                byteNo += 4;
            } else if (c >= 0x000800 && c <= 0x00ffff) {
                byteNo += 3;
            } else if (c >= 0x000080 && c <= 0x0007ff) {
                byteNo += 2;
            } else {
                byteNo += 1;
            }
            if (byteNo % 117 >= 114 || byteNo % 117 === 0) {
                if (byteNo - temp >= 114) {
                    bytes.push(i);
                    temp = byteNo;
                }
            }
        }
        // 2.截取字符串并分段加密
        if (bytes.length > 1) {
            for (let i = 0; i < bytes.length - 1; i++) {
                let str;
                if (i === 0) {
                    str = string.substring(0, bytes[i + 1] + 1);
                } else {
                    str = string.substring(bytes[i] + 1, bytes[i + 1] + 1);
                }
                const t1 = k.encrypt(str);
                ct += t1.padEnd(256, '=');
            }
            if (bytes[bytes.length - 1] !== string.length - 1) {
                const lastStr = string.substring(bytes[bytes.length - 1] + 1);
                const rsaStr = k.encrypt(lastStr);
                ct += rsaStr.padEnd(256, '=');
            }
            return hex2b64(ct);
        }
        const t = k.encrypt(string);
        const y = hex2b64(t);
        return y;
    } catch (error) {
        console.error('encryptByJSEncrypt error', error);
        return false;
    }
}

function hex2b64(h) {
    const b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let i;
    let c;
    let ret = '';
    for (i = 0; i + 3 <= h.length; i += 3) {
        c = parseInt(h.substring(i, i + 3), 16);
        ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
    }
    if (i + 1 === h.length) {
        c = parseInt(h.substring(i, i + 1), 16);
        ret += b64map.charAt(c << 2);
    } else if (i + 2 === h.length) {
        c = parseInt(h.substring(i, i + 2), 16);
        ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
    }
    while ((ret.length & 3) > 0) ret += '=';
    return ret;
}

/**
 * UUId xxxxxxxxxyxxxxxxxxxx 阿里百望只支持20位流水号
 * @returns {string}
 */
export function getUUId() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxxxyxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

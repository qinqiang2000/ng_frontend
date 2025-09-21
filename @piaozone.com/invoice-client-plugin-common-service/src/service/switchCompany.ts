/* eslint-disable complexity,no-empty-function */
import { sleep, parseSetCookie } from '$utils/tools';
import * as switchLoginLibs from '../govLoginLibs/switchCompany';
import { ntLockLoginPreKey } from '../constant';
import { getCompanyInfo } from '../govLoginLibs/common';

export interface switchOptType {
    account: string;
    etaxName: string;
    taxNo: string;
    forceSwitch?: boolean;
    roleText?: string;
    roleType?: string;
}

interface checkSwitchEndOpt {
    okSelector1?: string;
    okSelector2?: string;
    logoutSelector?: string;
    roleText?: string;
}

export class SwitchCompany extends BaseService {
    createRandom(length?: number, radix?: number) {
        const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        const result = [];
        let randomIndex;
        let randomValue;
        radix = radix || characters.length;
        if (length) {
            // 创建指定长度的随机字符串
            for (let i = 0; i < length; i++) {
                randomIndex = Math.floor(Math.random() * radix);
                result[i] = characters[randomIndex];
            }
        } else {
            // 创建一个带有"-"的UUID样式的随机字符串
            result[8] = result[13] = result[18] = result[23] = '-';
            result[14] = '4';

            for (let i = 0; i < 36; i++) {
                if (!result[i]) {
                    randomValue = Math.floor(Math.random() * 16);
                    result[i] = characters[i === 19 ? (randomValue & 3) | 8 : randomValue];
                }
            }
        }
        return result.join('');
    }

    createEncryKey(inputString: string) {
        let result = '';
        for (let i = 0; i < inputString.length; i++) {
            const charCodeHexString = inputString.charCodeAt(i).toString(16);
            result += charCodeHexString;
        }
        return result;
    }

    convertStringToBytes(input: any) {
        const bytesArray = [];
        for (let i = 0; i < input.length; i += 2) {
            const byte = parseInt(input.substr(i, 2), 16);
            bytesArray.push(byte);
        }
        return bytesArray;
    }

    convertToLatin1(input: any) {
        const bytesArray = [];
        for (let i = 0; i < input.length; i++) {
            const codePoint = input.codePointAt(i);
            if (codePoint <= 127) {
                bytesArray.push(codePoint);
            } else if (codePoint <= 2047) {
                bytesArray.push(192 | (codePoint >>> 6));
                bytesArray.push(128 | (codePoint & 63));
            } else if ((codePoint <= 55295) || (codePoint >= 57344 && codePoint <= 65535)) {
                bytesArray.push(224 | (codePoint >>> 12));
                bytesArray.push(128 | ((codePoint >>> 6) & 63));
                bytesArray.push(128 | (codePoint & 63));
            } else {
                if (!(codePoint >= 65536 && codePoint <= 1114111)) {
                    throw new Error('input is not supported');
                }
                i++;
                bytesArray.push(240 | ((codePoint >>> 18) & 28));
                bytesArray.push(128 | ((codePoint >>> 12) & 63));
                bytesArray.push(128 | ((codePoint >>> 6) & 63));
                bytesArray.push(128 | (codePoint & 63));
            }
        }
        return bytesArray;
    }

    p(t: any) {
        const s = [214, 144, 233, 254, 204, 225, 61, 183, 22, 182, 20, 194, 40, 251, 44, 5, 43, 103, 154, 118, 42, 190, 4,
            195, 170, 68, 19, 38, 73, 134, 6, 153, 156, 66, 80, 244, 145, 239, 152, 122, 51, 84, 11, 67, 237, 207, 172, 98,
            228, 179, 28, 169, 201, 8, 232, 149, 128, 223, 148, 250, 117, 143, 63, 166, 71, 7, 167, 252, 243, 115, 23, 186,
            131, 89, 60, 25, 230, 133, 79, 168, 104, 107, 129, 178, 113, 100, 218, 139, 248, 235, 15, 75, 112, 86, 157, 53,
            30, 36, 14, 94, 99, 88, 209, 162, 37, 34, 124, 59, 1, 33, 120, 135, 212, 0, 70, 87, 159, 211, 39, 82, 76, 54, 2,
            231, 160, 196, 200, 158, 234, 191, 138, 210, 64, 199, 56, 181, 163, 247, 242, 206, 249, 97, 21, 161, 224, 174,
            93, 164, 155, 52, 26, 85, 173, 147, 50, 48, 245, 140, 177, 227, 29, 246, 226, 46, 130, 102, 202, 96, 192, 41, 35,
            171, 13, 83, 78, 111, 213, 219, 55, 69, 222, 253, 142, 47, 3, 255, 106, 114, 109, 108, 91, 81, 141, 27, 175, 146,
            187, 221, 188, 127, 17, 217, 92, 65, 31, 16, 90, 216, 10, 193, 49, 136, 165, 205, 123, 189, 45, 116, 208, 18, 184,
            229, 180, 176, 137, 105, 151, 74, 12, 150, 119, 126, 101, 185, 241, 9, 197, 110, 198, 132, 24, 240, 125, 236, 58, 220,
            77, 32, 121, 238, 95, 62, 215, 203, 57, 72];
        return (255 & s[t >>> 24 & 255]) << 24 | (255 & s[t >>> 16 & 255]) << 16 | (255 & s[t >>> 8 & 255]) << 8 | 255 & s[255 & t];
    }

    initializeCipher(t: any, e: any, n: any) {
        const constants = [
            462357, 472066609, 943670861, 1415275113, 1886879365, 2358483617, 2830087869,
            3301692121, 3773296373, 4228057617, 404694573, 876298825, 1347903077,
            1819507329, 2291111581, 2762715833, 3234320085, 3705924337, 4177462797,
            337322537, 808926789, 1280531041, 1752135293, 2223739545, 2695343797,
            3166948049, 3638552301, 4110090761, 269950501, 741554753, 1213159005,
            1684763257
        ];

        const rotateLeft = (dt: any, de: any) => {
            return (dt << de) | (dt >>> (32 - de));
        };

        const yFunction = (yt: any) => {
            return yt ^ rotateLeft(yt, 13) ^ rotateLeft(yt, 23);
        };

        const r = new Array(4);
        const o = new Array(4);

        for (let a = 0; a < 4; a++) {
            o[0] = 255 & t[0 + 4 * a];
            o[1] = 255 & t[1 + 4 * a];
            o[2] = 255 & t[2 + 4 * a];
            o[3] = 255 & t[3 + 4 * a];
            r[a] = (o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3];
        }

        r[0] ^= 2746333894;
        r[1] ^= 1453994832;
        r[2] ^= 1736282519;
        r[3] ^= 2993693404;

        let s;

        for (let c = 0; c < 32; c += 4) {
            s = r[1] ^ r[2] ^ r[3] ^ constants[c];
            e[c] = r[0] ^= yFunction(this.p(s));
            s = r[2] ^ r[3] ^ r[0] ^ constants[c + 1];
            e[c + 1] = r[1] ^= yFunction(this.p(s));
            s = r[3] ^ r[0] ^ r[1] ^ constants[c + 2];
            e[c + 2] = r[2] ^= yFunction(this.p(s));
            s = r[0] ^ r[1] ^ r[2] ^ constants[c + 3];
            e[c + 3] = r[3] ^= yFunction(this.p(s));
        }

        if (n === 0) {
            let f;
            for (let l = 0; l < 16; l++) {
                f = e[l];
                e[l] = e[31 - l];
                e[31 - l] = f;
            }
        }
    }

    processBlock(t: any, e: any, n: any) {
        const rotate = (dt: any, de: any) => {
            return (dt << de) | (dt >>> (32 - de));
        };

        const transform = (vt: any) => {
            return vt ^ rotate(vt, 2) ^ rotate(vt, 10) ^ rotate(vt, 18) ^ rotate(vt, 24);
        };

        const r = new Array(4);
        const i = new Array(4);

        for (let o = 0; o < 4; o++) {
            i[0] = 255 & t[0 + 4 * o];
            i[1] = 255 & t[1 + 4 * o];
            i[2] = 255 & t[2 + 4 * o];
            i[3] = 255 & t[3 + 4 * o];
            r[o] = (i[0] << 24) | (i[1] << 16) | (i[2] << 8) | i[3];
        }

        let a;
        for (let s = 0; s < 32; s += 4) {
            a = r[1] ^ r[2] ^ r[3] ^ n[s];
            r[0] ^= transform(this.p(a));
            a = r[2] ^ r[3] ^ r[0] ^ n[s + 1];
            r[1] ^= transform(this.p(a));
            a = r[3] ^ r[0] ^ r[1] ^ n[s + 2];
            r[2] ^= transform(this.p(a));
            a = r[0] ^ r[1] ^ r[2] ^ n[s + 3];
            r[3] ^= transform(this.p(a));
        }

        for (let u = 0; u < 16; u += 4) {
            e[u] = r[3 - u / 4] >>> 24 & 255;
            e[u + 1] = r[3 - u / 4] >>> 16 & 255;
            e[u + 2] = r[3 - u / 4] >>> 8 & 255;
            e[u + 3] = 255 & r[3 - u / 4];
        }
    }

    convertArrayToString(t: any) {
        return t.map(((t1: any) => {
            const t2 = t1.toString(16);
            return t2.length === 1 ? '0' + t2 : t2;
        })).join('');
    }

    convertToHex(bytes: any) {
        const chars = [];
        for (let i = 0; i < bytes.length; i++) {
            if (bytes[i] >= 240 && bytes[i] <= 247) {
                chars.push(String.fromCodePoint(
                    ((7 & bytes[i]) << 18) |
                    ((63 & bytes[i + 1]) << 12) |
                    ((63 & bytes[i + 2]) << 6) |
                    (63 & bytes[i + 3])
                ));
                i += 3;
            } else if (bytes[i] >= 224 && bytes[i] <= 239) {
                chars.push(String.fromCodePoint(
                    ((15 & bytes[i]) << 12) |
                    ((63 & bytes[i + 1]) << 6) |
                    (63 & bytes[i + 2])
                ));
                i += 2;
            } else if (bytes[i] >= 192 && bytes[i] <= 223) {
                chars.push(String.fromCodePoint(
                    ((31 & bytes[i]) << 6) |
                    (63 & bytes[i + 1])
                ));
                i++;
            } else {
                chars.push(String.fromCodePoint(bytes[i]));
            }
        }
        return chars.join('');
    }


    encryptData(data: any, key: any, algorithm?: any, options? : any) {
        const ctx = this.ctx;
        const padding = options?.padding !== undefined ? options?.padding : 'pkcs#5';
        const mode = options?.mode; // 没有使用的变量，可能需要进一步处理
        const output = options?.output !== undefined ? options?.output : 'string';

        if (typeof key === 'string') {
            key = this.convertStringToBytes(key);
        }
        if (key.length !== 16) {
            ctx.service.log.info('加密key异常', key);
            return '';
        }

        if (typeof data === 'string') {
            data = algorithm !== 0 ? this.convertToLatin1(data) : this.convertStringToBytes(data);
        } else {
            // data = convertArray(data);
        }

        if (padding === 'pkcs#5' && algorithm !== 0) {
            const paddingValue = 16 - data.length % 16;
            for (let b = 0; b < paddingValue; b++) {
                data.push(paddingValue);
            }
        }

        const cipherArray = new Array(32);
        this.initializeCipher(key, cipherArray, algorithm);
        const encryptedData = [];
        let remainingLength = data.length;
        let currentIndex = 0;

        while (remainingLength >= 16) {
            const block = data.slice(currentIndex, currentIndex + 16);
            const processedBlock = new Array(16);
            this.processBlock(block, processedBlock, cipherArray);

            for (let O = 0; O < 16; O++) {
                encryptedData[currentIndex + O] = processedBlock[O];
            }

            remainingLength -= 16;
            currentIndex += 16;
        }

        if (padding === 'pkcs#5' && algorithm === 0) {
            const lastByte = encryptedData[encryptedData.length - 1];
            encryptedData.splice(encryptedData.length - lastByte, lastByte);
        }

        if (output !== 'array') {
            return algorithm !== 0 ? this.convertArrayToString(encryptedData) : this.convertToHex(encryptedData);
        }
        return encryptedData;
    }

    createHmac(message: any, secret: any) {
        const signature = moduleCrypto.createHmac('sha256', secret).update(message).digest('hex');
        return signature;
    }

    async updateSetCookies(pageId: string, setCookies: any = [], myCookieDomain: string) {
        const ctx = this.ctx;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        if (setCookies.length > 0) {
            const newCookies = parseSetCookie(setCookies);
            const cookieDict: any = {};
            const loginedCookies = loginData.loginedCookies || [];
            const allCookieKeys = [];
            for (let i = 0; i < loginedCookies.length; i++) {
                const cookie = loginedCookies[i];
                const cookieKey = encodeURIComponent([cookie.name, cookie.domain, cookie.path].join('-'));
                allCookieKeys.push(cookieKey);
                cookieDict[cookieKey] = cookie;
            }

            for (let i = 0; i < newCookies.length; i++) {
                const cookie = newCookies[i];
                let cookieDomain;
                if (cookie.domain) {
                    // domain为：guangdong.chinatax.gov.cn需要修正为: .guangdong.chinatax.gov.cn
                    if (cookie.domain.substr(0, 1) !== '.' && cookie.domain.split('.').length !== 5) {
                        cookieDomain = '.' + cookie.domain;
                    } else if (cookie.domain.substr(0, 1) === '.' && cookie.domain.split('.').length > 5) {
                        cookieDomain = cookie.domain.repace(/^\./, '');
                    } else {
                        cookieDomain = cookie.domain;
                    }
                } else {
                    cookieDomain = myCookieDomain;
                }
                const cookieKey = encodeURIComponent([cookie.name, cookieDomain, cookie.path].join('-'));
                let expirationDate;
                if (cookie.maxAge) {
                    const maxAge = parseInt(cookie.maxAge, 10);
                    expirationDate = Math.floor(Date.now() / 1000) + maxAge;
                } else if (cookie.expires) {
                    expirationDate = new Date(cookie.expires).getTime() / 1000;
                }

                // 已经存在的cookie, 更新值和过期时间
                if (cookieDict[cookieKey]) {
                    cookieDict[cookieKey] = expirationDate ? {
                        ...cookieDict[cookieKey],
                        value: cookie.value,
                        session: false,
                        expirationDate
                    } : {
                        ...cookieDict[cookieKey],
                        value: cookie.value
                    };
                    continue;
                }
                const fullCookie: any = {
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookieDomain,
                    path: typeof cookie.path === 'undefined' ? '/' : cookie.path,
                    hostOnly: typeof cookie.hostOnly === 'undefined' ? false : cookie.hostOnly,
                    httpOnly: typeof cookie.httpOnly === 'undefined' ? false : cookie.httpOnly,
                    secure: typeof cookie.secure === 'undefined' ? false : cookie.secure,
                    sameSite: typeof cookie.sameSite === 'undefined' ? 'unspecified' : cookie.sameSite
                };
                if (expirationDate) {
                    fullCookie.expirationDate = expirationDate;
                    fullCookie.session = false;
                } else {
                    fullCookie.session = true;
                }
                cookieDict[cookieKey] = fullCookie;
                allCookieKeys.push(cookieKey);
            }
            // 提取最新的cookie
            const fullCookies = allCookieKeys.map((curKey) => {
                return cookieDict[curKey];
            });
            loginData.loginedCookies = fullCookies;
            pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
        }
        return loginData;
    }

    async requestTpass(pageId: string, opt: any) {
        const ctx = this.ctx;
        const govLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId) || {};
        const etaxName = govLoginData.baseUrl.split('.')[1];
        const tpassGlobalInfo = govLoginData.tpassGlobalInfo || {};
        const requestBase = opt.requestBase || `https://tpass.${etaxName}.chinatax.gov.cn:8443/sys-api/v1.0`;
        const refererUrl = opt.referer || `https://tpass.${etaxName}.chinatax.gov.cn:8443/#/identitySwitch/enterprise`;
        const requestUrl = requestBase + opt.url;
        const tpassReq : any = {
            headers: {
                ...(opt.headers || {}),
                refererUrl,
                Authorization: tpassGlobalInfo.token,
                'X-APP-CLIENTID': tpassGlobalInfo.clientId || '',
                'Content-Type': 'application/json',
                'X-TICKET-ID': tpassGlobalInfo.ticket || null,
                'X-TEMP-INFO': tpassGlobalInfo.natureuuid,
                'X-NATURE-IP': tpassGlobalInfo['X-NATURE-IP'],
                'X-LANG-ID': null,
                'X-SM4-INFO': '0',
                'deviceIdentyNo': tpassGlobalInfo['ded'],
                'hUid': tpassGlobalInfo['ud']
            }
        };

        const new_key16 = tpassGlobalInfo['new_key16'];
        const reqOpt : any = {
            zipCode: '0'
        };
        const encryKey = 'R6LhHTUutGk3GwdKdewgdewgjfekqwgfgfjg'.substring(0, 4) +
        'fwejkfjqfgjgfhewvfvq^R4qd^VLrf^2^ujq'.substring('fwejkfjqfgjgfhewvfvq^R4qd^VLrf^2^ujq'.length - 4);
        const encryUrls = [
            '/auth/oauth2/getPublicKey',
            '/auth/white/sendSm4',
            '/auth/user/logout',
            '/auth/user/checklogin',
            '/auth/qrcode/verifyQRCode',
            '/auth/message/sendSmsCode',
            '/auth/oauth2/revokeToken',
            '/auth/white/getAreCode',
            '/auth/white/getSecondAuthInfo',
            '/auth/oauth2/checkRedirectUrl',
            '/auth/message/captchaImage'
        ];
        const g = new_key16 || this.createRandom(16, 61);
        const p = g.substring(0, 8) + encryKey;
        let u = '';
        if (opt.method === 'post') {
            if (encryUrls.includes(opt.url)) {
                reqOpt.encryptCode = '0';
                reqOpt.datagram = JSON.stringify(opt.data);
            } else {
                const f = JSON.stringify(opt.data);
                u = this.encryptData(f, Object(this.createEncryKey)(p));
                reqOpt.datagram = u;
                reqOpt.encryptCode = '2';
            }
        }
        reqOpt.timestamp = moment().format('YYYYMMDDHHmm00');
        reqOpt.access_token = '';
        reqOpt.signtype = 'HMacSHA256';
        reqOpt.signature = this.createHmac(reqOpt.zipCode + reqOpt.encryptCode + u + reqOpt.timestamp + reqOpt.signtype, g);
        tpassReq.data = reqOpt;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        const myCookies = loginData.loginedCookies || [];
        const tpassDomain = `tpass.${etaxName}.chinatax.gov.cn`;
        const taxNoCookie = encodeURIComponent(`"value":"${govLoginData.taxNo}"`);
        const cookie: any = [`E-QUICK-CCLIST=${taxNoCookie}`];
        for (let i = 0; i < myCookies.length; i++) {
            const curItem = myCookies[i];
            const curDomain = curItem.domain;
            if (tpassDomain.indexOf(curDomain) !== -1) {
                cookie.push(`${curItem.name}=${curItem.value}`);
            }
        }
        const requestOptions = {
            method: opt.method.toUpperCase(),
            timeout: 120000,
            headers: {
                ...tpassReq.headers,
                Cookie: cookie.join(', ')
            },
            dataType: 'json',
            data: reqOpt
        };
        ctx.service.log.fullInfo('------------requestOptions', requestUrl, requestOptions);
        const res = await ctx.service.tools.httpRequest(requestUrl, requestOptions);
        ctx.service.log.info('切换接口返回', res);
        let datagram = '';
        if (res.data?.datagram) {
            datagram = this.encryptData(res.data.datagram, Object(this.createEncryKey)(p), 0);
            if (!datagram) {
                throw new Error('税局返回数据异常');
            }
            if (datagram) {
                datagram = JSON.parse(datagram);
            }
        }
        if (res.status !== 200) {
            throw new Error(`税局请求异常, 状态码${res.status}`);
        }
        if (res.data?.code !== 1000) {
            const errMsg = res.data?.msg || '税局处理异常';
            throw new Error(`${errMsg}`);
        }
        const setCookies = res.headers['set-cookie'] || [];
        await this.updateSetCookies(pageId, setCookies, tpassDomain);
        return {
            ...res.data,
            datagram
        };
    }

    async findLoginedNt(opt: switchOptType) {
        const ctx = this.ctx;
        const { account, etaxName } = opt;
        const { pageId } = ctx.request.query;
        const fpdkGovWin : any = ctx.bsWindows.fpdkGovWin || {};
        const ntKeys = Object.keys(fpdkGovWin);
        let loginData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
        let nt;
        let targetPageId;
        if (ntKeys.indexOf(pageId) !== -1) {
            const curNt = fpdkGovWin[pageId];
            if (loginData && loginData.loginedCookies && curNt) {
                const currentURL = curNt.getUrl() || '';
                const hosts = currentURL.split('.');
                if (hosts.length >= 3) {
                    return {
                        ...errcodeInfo.success,
                        pageId,
                        data: {
                            nt,
                            targetPageId,
                            loginData
                        }
                    };
                }
            }
        }
        for (let i = 0; i < ntKeys.length; i++) {
            const itemPageId = ntKeys[i];
            const infoArr = itemPageId.split('-');
            if (infoArr.length < 3) {
                continue;
            }
            // 这类型页面为电子税局后台页面
            if (infoArr[1] === etaxName) {
                continue;
            }
            const curNt = fpdkGovWin[itemPageId];
            const currentURL = curNt.getUrl() || '';
            const hosts = currentURL.split('.');
            if (hosts.length < 3) {
                continue;
            }
            const cityName: string = hosts[1];
            if (cityName !== etaxName) {
                continue;
            }
            const ntAccount = decodeURIComponent(infoArr.slice(2).join('-'));
            if (ntAccount === account && (/^https:\/\/dppt.[a-zA-Z0-9]+.chinatax.gov.cn:8443/.test(currentURL) ||
                /^https:\/\/tpass.[a-zA-Z0-9]+.chinatax.gov.cn:8443/.test(currentURL))) {
                targetPageId = itemPageId;
                nt = curNt;
                break;
            }
        }
        if (!nt || !targetPageId) {
            return {
                ...errcodeInfo.argsErr,
                description: '未查询到已登录的企业'
            };
        }

        loginData = pwyStore.get(etaxLoginedCachePreKey + targetPageId);
        ctx.service.log.info('targetPageId', targetPageId, loginData?.taxNo, loginData?.pageId);
        if (!loginData || !loginData.loginedCookies) {
            return {
                ...errcodeInfo.argsErr,
                description: '未查询到已登录的企业1'
            };
        }

        return {
            ...errcodeInfo.success,
            data: {
                nt,
                targetPageId,
                loginData
            }
        };
    }

    createResult(loginData: any) {
        if (loginData.loginedCookies) {
            return {
                ...errcodeInfo.success,
                data: {
                    taxNo: loginData.taxNo || '',
                    taxPeriod: loginData.taxPeriod || '',
                    skssq: loginData.skssq || '',
                    gxrqfw: loginData.gxrqfw || '',
                    gxczjzrq: loginData.gxczjzrq || '',
                    companyType: loginData.companyType,
                    companyName: loginData.companyName,
                    homeUrl: loginData.eUrl,
                    etaxAccountType: loginData.etaxAccountType
                }
            };
        }
        return errcodeInfo.govLogout;
    }

    async checkSwitchEnd(nt: any, opt: checkSwitchEndOpt) {
        const curUrl = nt.getUrl();
        const ctx = this.ctx;
        // 切换时地址栏发生变化，说明切换发生跳转
        ctx.service.log.info('waitSwitchCompanyEnd start', opt, curUrl);
        // 判断切换是否真正成功
        let res = await nt.wait(switchLoginLibs.waitSwitchCompanyEnd, {
            ...opt,
            waitTimeout: 25000
        });

        ctx.service.log.info('waitSwitchCompanyEnd res1', res);
        if (res.errcode !== '0000' || res.data?.isLogout) {
            return errcodeInfo.govLogout;
        }

        if (res.data?.errMsg) {
            return {
                errcode: '95000',
                description: res.data?.errMsg
            };
        }

        if (res.data?.seletor) {
            await nt.click(res.data?.seletor);
            await sleep(1000);
            res = await nt.wait(switchLoginLibs.waitSwitchCompanyEnd, {
                ...opt,
                waitTimeout: 15000,
                timeoutRefresh: true
            }, 3);
            ctx.service.log.info('waitSwitchCompanyEnd res2', res);
            if (res.errcode !== '0000' || res.data?.isLogout) {
                return errcodeInfo.govLogout;
            }
            if (res.data?.errMsg) {
                return {
                    errcode: '95000',
                    description: res.data?.errMsg
                };
            }
        }
        return res;
    }

    async redirectBillModule(backendNt: any, nt: any, opt: any) {
        const ctx = this.ctx;
        const { pageId, access_token, client_id, cityPageId } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId) || {};
        const {
            taxNo,
            companyType,
            companyName,
            openInvoiceCompany,
            szzhCompany,
            roleText,
            eUrl,
            baseUrl,
            createTime = ''
        } = opt;
        const etaxBackendUrl = backendNt.getUrl();
        const cookieRes1 = await backendNt.getCookies({});
        if (cookieRes1.errcode !== '0000') {
            return cookieRes1;
        }
        const cityName = cityPageId.split('-')[1];
        const tpassUrl = `https://tpass.${cityName}.chinatax.gov.cn:8443`;
        const bodyRes : bodyResDataType = {
            taxNo: taxNo,
            skssq: '',
            gxrqfw: '',
            gxczjzrq: '',
            taxPeriod: '',
            companyType,
            companyName,
            homeUrl: eUrl,
            etaxAccountType: 3
        };
        const newLoginData : any = {
            ...bodyRes,
            client_id,
            getLzkqow: '',
            access_token,
            openInvoiceCompany: openInvoiceCompany,
            szzhCompany: szzhCompany,
            roleText: roleText,
            pageId,
            loginedCookies: cookieRes1.data,
            etaxBackendUrl: etaxBackendUrl,
            tpassUrl,
            referer: '',
            eUrl: eUrl,
            szzhDomain: '',
            szzhUrl: '',
            baseUrl: baseUrl,
            publicKeyInfo: '',
            tpassGlobalInfo: loginData.tpassGlobalInfo || {},
            createTime: createTime || (+new Date())
        };
        await pwyStore.set(etaxLoginedCachePreKey + pageId, newLoginData, 12 * 60 * 60);
        // 跳转到业务模块
        const res = await ctx.service.etaxFpdkLogin.common.syncRedirectBillModule({
            pageId,
            etaxBaseUrl: baseUrl,
            openInvoiceCompany
        }, () => {});
        if (res.errcode === '91300') {
            return res;
        }
        return {
            ...errcodeInfo.success,
            data: bodyRes
        };
    }

    // 通过api直接切换完成后刷新界面
    async changeUser(nt: any, loginData: any, opt: switchOptType) {
        const ctx = this.ctx;
        const { taxNo, roleType, roleText } = opt;
        const { pageId } = ctx.request.query;
        const etaxName = pageId.split('-')[1];
        const tpassGlobalInfo = loginData.tpassGlobalInfo || {};
        const govToken = tpassGlobalInfo.token;
        let result;
        ctx.service.log.fullInfo('before LoginData loginedCookies', loginData.loginedCookies);
        const getDomainCookies = (requestUrl: string) => {
            const tempLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId) || {};
            const myCookies = tempLoginData.loginedCookies || [];
            const cookie: any = [];
            for (let i = 0; i < myCookies.length; i++) {
                const curItem = myCookies[i];
                // 失效的cookie不需要
                if (curItem.expirationDate && curItem.expirationDate < Math.floor(Date.now() / 1000)) {
                    continue;
                }

                const curDomain = curItem.domain + curItem.path;
                // 有效的路径匹配
                if (requestUrl.indexOf(curDomain) !== -1) {
                    cookie.push(`${curItem.name}=${curItem.value}`);
                }
            }
            return cookie.join(', ');
        };
        const partition = 'persist:' + pageId;
        const ses = electronSession.fromPartition(partition);
        try {
            result = await this.requestTpass(pageId, {
                url: '/auth/oauth2/changeUser',
                headers: {
                    Authonrization: govToken
                },
                method: 'post',
                data: {
                    creditCode: taxNo,
                    relatedType: roleType,
                    agencyCreditCode: '',
                    areaCode: tpassGlobalInfo.areaPrefix
                }
            });
            const changeUserDatagram = result.datagram || {};
            if (!changeUserDatagram.access_token) {
                return {
                    errcode: '0000',
                    data: {
                        errMsg: '税局请求异常，请稍后再试!'
                    }
                };
            }
            const loginedCookies = loginData.loginedCookies.map((item: any) => {
                if (item.name === 'token' && item.domain === `tpass.${etaxName}.chinatax.gov.cn`) {
                    return {
                        ...item,
                        value: changeUserDatagram.access_token
                    };
                }
                return item;
            });
            loginData.roleText = roleText;
            loginData.taxNo = taxNo;
            loginData.loginedCookies = loginedCookies;
            loginData.tpassGlobalInfo.token = changeUserDatagram.access_token;
            pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
            const analyticsResponse = await this.requestTpass(pageId, {
                url: '/auth/oauth2/getDpUrl',
                method: 'post',
                data: {}
            });

            if (analyticsResponse && analyticsResponse.datagram && analyticsResponse.datagram.url) {
                const urls = analyticsResponse.datagram.url.split(',');
                /*
                await nt.evaluate(switchLoginLibs.clearAllUrls, {
                    urls
                });
                */
                // 更新本地存储的cookie
                for (let i = 0; i < urls.length; i++) {
                    const url = urls[i];
                    const delimiter = url.indexOf('?') >= 0 ? '&tmp=' : '?tmp=';
                    const reqUrl = url + delimiter + Math.floor(Math.random() * 100000);
                    const domainPre = url.indexOf(`znhd.${etaxName}`) === -1 ? 'dppt' : 'znhd';
                    const cookieStr = getDomainCookies(reqUrl);
                    ctx.service.log.info('clear login', reqUrl, cookieStr);
                    const tempRes = await ctx.helper.request(reqUrl, {
                        headers: {
                            Cookie: cookieStr
                        }
                    });
                    const setCookies = tempRes.headers['set-cookie'] || [];
                    const newCookies = parseSetCookie(setCookies);
                    ctx.service.log.info('需要清理的cookie', setCookies, newCookies);
                    await this.updateSetCookies(pageId, setCookies, `${domainPre}.${etaxName}.chinatax.gov.cn`);
                }
            }
            const clearKeys = [
                'SSO_SECURITY_CHECK_TOKEN',
                'dzfp-ssotoken',
                'oauth2_referer'
            ];
            const temp1LoginData = pwyStore.get(etaxLoginedCachePreKey + pageId) || {};
            const myCookies = temp1LoginData.loginedCookies || [];
            const newFullCookies = [];
            for (let i = 0; i < myCookies.length; i++) {
                const curItem = myCookies[i];
                if (clearKeys.includes(curItem.name) && curItem.domain === '.chinatax.gov.cn' && curItem.path === '/') {
                    newFullCookies.push({
                        ...curItem,
                        expirationDate: 10,
                        session: false
                    });
                } else {
                    newFullCookies.push(curItem);
                }
            }
            temp1LoginData.loginedCookies = newFullCookies;
            pwyStore.set(etaxLoginedCachePreKey + pageId, temp1LoginData, 12 * 60 * 60);
            ctx.service.log.fullInfo('clear after cookies', newFullCookies);
            const finalResponse = await this.requestTpass(pageId, {
                url: '/acl/app/getRedirect',
                method: 'post',
                data: {
                    applicationId: tpassGlobalInfo.clientId
                }
            });
            const userInfoRes = await this.requestTpass(pageId, {
                url: '/auth/oauth2/userinfo',
                method: 'post',
                data: {
                    access_token: changeUserDatagram.access_token
                }
            });
            const userInfo = userInfoRes.datagram || {};
            let redirectUrl = '';
            if (userInfo.newEtaxFlag !== '1') {
                redirectUrl = userInfo.user_type === '1'
                    ? (finalResponse.datagram && finalResponse.datagram.zrrcdxdz)
                    : (finalResponse.datagram && finalResponse.datagram.redirectUrl);
            } else {
                redirectUrl = userInfo.user_type === '1'
                    ? (finalResponse.datagram.dz_zrrcdxdz || finalResponse.datagram.zrrcdxdz)
                    : (finalResponse.datagram.dz_cdxdz || finalResponse.datagram.redirectUrl);
            }
            const delimiter = redirectUrl.indexOf('?') >= 0 ? '&code=' : '?code=';
            const etaxUrl = redirectUrl + delimiter + changeUserDatagram.code;
            ctx.service.log.info('新企业后台地址', etaxUrl);
            const newLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
            ctx.service.log.fullInfo('newLoginData loginedCookies', newLoginData.loginedCookies);
            await nt.goto(etaxUrl);
            const menuRes = await ctx.service.etaxFpdkLogin[etaxName].queryBillMenuIndex(nt, {
                taxNo,
                data: {
                    taxNo
                }
            });
            ctx.service.log.info('查询新企业权限返回', menuRes);
            if (menuRes.errcode !== '0000') {
                return menuRes;
            }
            const { openInvoiceCompany, szzhCompany, companyType, companyName } = menuRes.data || {};
            const res = await this.redirectBillModule(nt, nt, {
                taxNo,
                companyType,
                companyName,
                openInvoiceCompany,
                szzhCompany,
                roleText,
                eUrl: loginData.eUrl,
                baseUrl: loginData.baseUrl,
                createTime: loginData.createTime
            });
            return res;
        } catch (error: any) {
            ctx.service.log.info('切换税号异常', error);
            return {
                ...errcodeInfo.govErr,
                description: error.message || '税局请求异常'
            };
        }
    }

    // 进入tpass平台，通过税局函数完成切换，然后再次进入业务模块
    async swtichByTpass(nt: any, loginData: any, opt: any) {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query;
        const cityPageArr = cityPageId.split('-');
        const etaxName = cityPageArr[1];
        const { taxNo, roleType = '', roleText } = opt;
        const switchUrl = `https://tpass.${etaxName}.chinatax.gov.cn:8443/#/identitySwitch/enterprise`;
        ctx.service.log.info('开始切换', cityPageId, taxNo, roleType);
        const ntInfo = ctx.bsWindows.fpdkGovWin || {};
        let backendNt = ntInfo ? ntInfo[cityPageId] : null;
        if (backendNt && backendNt.nightmareWindow?.win) {
            ctx.service.log.info('窗体存在');
            await backendNt.goto(switchUrl);
        } else {
            const openOpt : any = {
                id: cityPageId,
                partition: 'persist:' + cityPageId,
                ignoreGotoError: true
            };
            ctx.service.log.info('后台窗体不存在，重新打开', switchUrl);
            // 获取切换税号的页面
            const ntRes = await ctx.service.ntTools.getEtaxPage(switchUrl, openOpt);
            if (ntRes.errcode !== '0000') {
                return {
                    ...ntRes,
                    noSwitch: true
                };
            }
            backendNt = ntRes.data;
        }

        const accessRes = await backendNt.wait(switchLoginLibs.checkIsExchangePage, {
            waitTimeout: 15000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('进入企业切换界面返回', accessRes);
        const resDescription = accessRes.description || '';
        if (resDescription.includes('重新登录')) {
            return {
                ...errcodeInfo.govLogout,
                noSwitch: true
            };
        }
        if (accessRes.errcode !== '0000' || accessRes.data?.isLogout) {
            return accessRes.errcode !== '0000' ? {
                ...accessRes,
                noSwitch: true
            } : {
                ...errcodeInfo.govLogout,
                noSwitch: true
            };
        }
        const switchRes = await backendNt.evaluate(switchLoginLibs.changeUser, {
            taxNo,
            relatedType: roleType
        });
        ctx.service.log.info('切换税号返回', switchRes);

        if (switchRes.errcode === '0000' && switchRes.data?.url) {
            ctx.service.log.info('切换后重定向地址', switchRes.data?.url);
            await backendNt.goto(switchRes.data?.url);
            const menuRes = await ctx.service.etaxFpdkLogin[etaxName].queryBillMenuIndex(backendNt, {
                taxNo,
                data: {
                    taxNo
                }
            });
            ctx.service.log.info('查询新企业权限返回', menuRes);
            if (menuRes.errcode !== '0000') {
                return menuRes;
            }
            const { openInvoiceCompany, szzhCompany, companyType, companyName } = menuRes.data || {};
            const res = await this.redirectBillModule(backendNt, nt, {
                taxNo,
                companyType,
                companyName,
                openInvoiceCompany,
                szzhCompany,
                roleText,
                eUrl: loginData.eUrl,
                baseUrl: loginData.baseUrl,
                createTime: loginData.createTime
            });
            return res;
        }
        await this.redirectBillModule(backendNt, nt, {
            taxNo: loginData.taxNo,
            companyType: loginData.companyType,
            companyName: loginData.companyName,
            openInvoiceCompany: loginData.openInvoiceCompany,
            szzhCompany: loginData.szzhCompany,
            roleText: loginData.roleText,
            eUrl: loginData.eUrl,
            baseUrl: loginData.baseUrl,
            createTime: loginData.createTime
        });
        return switchRes;
    }

    async commonSwtich(nt: any, loginData: any, opt: any) {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query;
        const { taxNo, etaxName, roleText } = opt;
        const switchUrl = `https://tpass.${etaxName}.chinatax.gov.cn:8443/#/identitySwitch/enterprise`;
        ctx.service.log.info('开始切换', cityPageId, taxNo);
        const ntInfo = ctx.bsWindows.fpdkGovWin || {};
        let backendNt = ntInfo ? ntInfo[cityPageId] : null;
        if (backendNt && backendNt.nightmareWindow?.win) {
            ctx.service.log.info('窗体存在');
            await backendNt.goto(switchUrl);
        } else {
            const openOpt : any = {
                id: cityPageId,
                partition: 'persist:' + cityPageId,
                ignoreGotoError: true
            };
            ctx.service.log.info('后台窗体不存在，重新打开', switchUrl);
            // 获取切换税号的页面
            const ntRes = await ctx.service.ntTools.getEtaxPage(switchUrl, openOpt);
            if (ntRes.errcode !== '0000') {
                return {
                    ...ntRes,
                    noSwitch: true
                };
            }
            backendNt = ntRes.data;
        }

        const accessRes = await backendNt.wait(switchLoginLibs.checkIsExchangePage, {
            waitTimeout: 15000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('进入企业切换界面返回', accessRes);
        if (accessRes.errcode !== '0000' || accessRes.data?.isLogout) {
            return accessRes.errcode !== '0000' ? {
                ...accessRes,
                noSwitch: true
            } : {
                ...errcodeInfo.govLogout,
                noSwitch: true
            };
        }

        let inputIsRight = false;
        // 输入搜索税号，并检测
        for (let i = 0; i < 3; i++) {
            await backendNt.type('.search-form input[placeholder="请输入统一社会信用代码"]', taxNo);
            const inputRight = await backendNt.evaluate(switchLoginLibs.checkInput, {
                selector: '.search-form input[placeholder="请输入统一社会信用代码"]',
                value: taxNo
            });
            if (inputRight === true) {
                inputIsRight = true;
                break;
            }
        }
        if (!inputIsRight) {
            ctx.service.log.info('输入切换税号异常，请重试');
            return {
                ...errcodeInfo.govErr,
                noSwitch: true,
                description: '切换税号异常，请重试'
            };
        }

        await backendNt.click('.search-form .el-button--primary');

        // 查询搜索结果
        const wRes = await backendNt.wait(switchLoginLibs.switchCompany, {
            taxNo
        });
        ctx.service.log.info('查询搜索结果返回', wRes);
        if (wRes.errcode !== '0000' || wRes.data?.errMsg) {
            return wRes.errcode !== '0000' ? {
                ...wRes,
                noSwitch: true
            } : {
                errcode: '95000',
                noSwitch: true,
                description: wRes.data?.errMsg
            };
        }

        if (wRes.data?.isLogout) {
            return {
                ...errcodeInfo.govLogout,
                noSwitch: true
            };
        }

        // 开始进行切换并判断是否切换成功
        await backendNt.click(wRes.data.selector);

        const wRes2 = await this.checkSwitchEnd(backendNt, {
            roleText
        });

        ctx.service.log.info('点击切换返回', wRes2);
        if (wRes2.errcode !== '0000') {
            return wRes2;
        }

        const menuRes = await ctx.service.etaxFpdkLogin[etaxName].queryBillMenuIndex(backendNt, {
            taxNo,
            data: {
                taxNo
            }
        });
        ctx.service.log.info('查询新企业权限返回', menuRes);
        if (menuRes.errcode !== '0000') {
            return menuRes;
        }
        const { openInvoiceCompany, szzhCompany, companyType, companyName } = menuRes.data || {};
        const res = await this.redirectBillModule(backendNt, nt, {
            companyType,
            companyName,
            openInvoiceCompany,
            szzhCompany,
            roleText,
            eUrl: loginData.eUrl,
            baseUrl: loginData.baseUrl,
            createTime: loginData.createTime
        });
        return res;
    }

    async queryCompanyInfo(pageId: string, otherOpt: any = {}) {
        const ctx = this.ctx;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[pageId] : null;
        let urlPath = '/szzhzz/swszzhCtr/v1/getNsrjbxx';
        const opt: any = {
            disableRetry: otherOpt.disabledRetry
        };
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        if (nt) {
            const curUrl = await nt.getUrl();
            // 开票页面使用开票页面的查询企业信息
            if (curUrl.indexOf('blue-invoice-makeout') !== -1) {
                urlPath = '/kpfw/hqnsrjcxx/v1/hqnsrjcxx';
                opt.method = 'post';
                opt.data = {
                    nsrsbh: ''
                };
            }
        } else {
            const lockRes = await ctx.service.nt.checkNtLock(pageId);
            if (lockRes.errcode !== '0000') {
                return lockRes;
            }
            const ntRes = await ctx.service.nt.getNt(loginData);
            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            nt = ntRes.data;
        }
        if (!loginData.companyType) {
            const companyRes = await nt.evaluate(getCompanyInfo);
            if (companyRes.errcode === '0000' && companyRes.data?.taxNo) {
                const { taxNo, companyName } = companyRes.data || {};
                ctx.service.log.info('页面企业信息', taxNo, companyName);
                return {
                    ...errcodeInfo.success,
                    data: {
                        taxNo,
                        companyName,
                        companyType: loginData.companyType || '03'
                    }
                };
            }
        }

        const checkRes = await ctx.service.nt.ntCurl(pageId, urlPath, opt);
        if (checkRes.errcode !== '0000') {
            ctx.service.log.info('查询企业信息异常', pageId, checkRes);
            return checkRes;
        }
        const { Nsrsbh, Nsrmc, ZzsNsrzgmc = '', Nsrztdm = '' } = checkRes.data || {};
        ctx.service.log.info('查询企业信息', pageId, {
            Nsrsbh,
            Nsrmc,
            ZzsNsrzgmc,
            Nsrztdm
        });
        // 未获取到纳税人信息，需要重试
        if (typeof Nsrsbh === 'undefined') {
            return {
                ...errcodeInfo.govErr,
                description: '税局异常，请稍后再试!'
            };
        }
        let companyType = '03';
        if (ZzsNsrzgmc && ZzsNsrzgmc.indexOf('一般纳税人') === -1) {
            companyType = ZzsNsrzgmc.indexOf('一般纳税人') === -1 ? '02' : '03';
        } else if (Nsrztdm) {
            companyType = Nsrztdm === '03' ? '03' : '02';
        }

        return {
            ...errcodeInfo.success,
            data: {
                taxNo: Nsrsbh,
                companyName: Nsrmc,
                companyType
            }
        };
    }

    // 防止多个请求同时打开浏览器
    async loopQueryStatus(pageId: string, startTime = (+new Date())) {
        const ctx = this.ctx;
        if ((+new Date()) - startTime > 60 * 1000) {
            return errcodeInfo.govTimeout;
        }
        await sleep(2500);
        const lockRes = await ctx.service.redisLock.query(ntLockLoginPreKey + pageId);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }
        // 登录成功, 且当前锁定释放
        if (lockRes.data?.result === false) {
            return errcodeInfo.success;
        }
        const res : any = await this.loopQueryStatus(pageId, startTime);
        return res;
    }

    // 企业切换入口
    async switch(opt: switchOptType) {
        const ctx = this.ctx;
        const { account, taxNo, forceSwitch } = opt;
        const { cityPageId, operationType, isNewTimeTaxNo } = ctx.request.query;
        const loginRes = await ctx.service.ntTools.queryRemoteLoginStatus(cityPageId);
        if (loginRes.errcode !== '0000') {
            return loginRes;
        }
        const loginData = loginRes.data;
        await pwyStore.set(etaxLoginedCachePreKey + cityPageId, loginData, 12 * 60 * 60);
        if (loginData?.loginFrom === 'newTime' && loginData.taxNo === taxNo && !forceSwitch) {
            return errcodeInfo.success;
        }
        // 如果能再本地客户端查找到登录信息
        const lockRes1 = await ctx.service.redisLock.set(ntLockLoginPreKey + cityPageId, (+new Date()), 60);
        ctx.service.log.info('登录锁设置返回', lockRes1);

        // 获取锁异常
        if (lockRes1.errcode !== '0000') { // 其它异常
            ctx.service.log.info(cityPageId, '切换失败, 获取锁异常', lockRes1.description);
            return lockRes1;
        }

        // redis锁已经存在，设置失败
        if (lockRes1.data?.result === false) {
            const res = await this.loopQueryStatus(cityPageId);
            return res;
        }

        const roleDict : any = {
            '01': '法定代表人',
            '02': '财务负责人',
            '03': '办税员',
            '05': '管理员',
            '08': '社保经办人',
            '09': '开票员',
            '10': '销售人员'
        };
        let roleType = opt.roleType;
        let roleText = opt.roleText;
        if (!roleType || !roleDict[roleType]) {
            // 收票类型默认使用办税员
            roleType = operationType === '2' ? '03' : '09';
            roleText = roleDict[roleType];
        } else {
            roleText = roleDict[roleType];
        }

        const cityPageArr = cityPageId.split('-');
        const etaxName = cityPageArr[1];
        ctx.service.log.info('税号切换开始', cityPageId, opt, roleText, roleType, etaxName);
        const fpdkGovWin : any = ctx.bsWindows.fpdkGovWin || {};
        const nt = fpdkGovWin[cityPageId] || '';
        // 登录信息不存在，返回登录失效
        if (!loginData || !loginData.loginedCookies) {
            await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
            await ctx.service.ntTools.closePage(cityPageId);
            ctx.service.log.info('税号切换结束', cityPageId, '切换失败，登录失效');
            return errcodeInfo.govLogout;
        }

        const oldTaxNo = loginData.taxNo;
        // 切换前的税号
        if (oldTaxNo === taxNo && !forceSwitch) {
            const checkRes = await this.queryCompanyInfo(cityPageId);
            // 登录失效
            if (checkRes.errcode === '91300') {
                await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
                ctx.service.log.info('税号切换结束', cityPageId, '切换失败，登录失效');
                return errcodeInfo.govLogout;
            }
            if (checkRes.errcode !== '0000') {
                ctx.service.log.info('税号切换结束', cityPageId, '切换失败', checkRes.description);
                await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
                return checkRes;
            }
            const resData = checkRes.data || {};
            // 查询当前税号不需要切换
            if (resData.taxNo === oldTaxNo) {
                ctx.service.log.info('税号切换结束', cityPageId, '不需要切换');
                await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
                return this.createResult(loginData);
            }
        }
        // 防止切换过程中接口调用异常
        ctx.request.query.ignoreLock = true;
        let res;
        if (isNewTimeTaxNo) {
            res = await ctx.service.newTime.swtichCompany({
                taxNo,
                account,
                etaxName,
                roleText,
                roleType
            });
        } else {
            res = await ctx.service.switchCompany.swtichByTpass(nt, loginData, {
                taxNo,
                account,
                etaxName,
                roleText,
                roleType
            });
        }

        if (loginData.loginFrom === 'newTime') {
            ctx.service.log.info('税号切换结束', cityPageId, res);
            await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
            return res;
        }
        ctx.service.log.info('切换返回', res);
        if (res.errcode === '91300') {
            ctx.service.log.info('税号切换结束', cityPageId, '切换失败，登录失效');
            await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
            return errcodeInfo.govLogout;
        }

        // 没有点击切换按钮就异常
        if (res.errcode !== '0000' && res.noSwitch) {
            // 窗体存在
            if (nt && nt.nightmareWindow?.win) {
                const openInvoiceCompany = loginData.openInvoiceCompany;
                const baseUrl = loginData.baseUrl;
                let gotoUrl = '';
                if (openInvoiceCompany !== '') {
                    gotoUrl = `${baseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
                } else {
                    gotoUrl = `${baseUrl}/szzhzz/spHandler?cdlj=/digital-tax-account&ruuid=` + (+new Date());
                }
                await nt.goto(gotoUrl);
            }
            ctx.service.log.info('税号切换结束', cityPageId, '切换失败', res.description);
            await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
            return {
                errcode: res.errcode,
                description: res.description
            };
        }

        const checkRes = await this.queryCompanyInfo(cityPageId);
        // 登录失效
        if (checkRes.errcode === '91300') {
            ctx.service.log.info('税号切换结束', cityPageId, '登录失效');
            await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
            return errcodeInfo.govLogout;
        }

        const resData = checkRes.data || {};
        // 切换之后还是之前的税号
        if (resData.taxNo === oldTaxNo || checkRes.errcode !== '0000') {
            const curLoginData = pwyStore.get(etaxLoginedCachePreKey + cityPageId);
            curLoginData.taxNo = oldTaxNo;
            pwyStore.set(etaxLoginedCachePreKey + cityPageId, curLoginData, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(cityPageId, curLoginData);
            await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
            ctx.service.log.info('税号切换结束', cityPageId, '切换失败，税号没有变化');
            return {
                ...errcodeInfo.govErr,
                description: '切换失败'
            };
        }

        if (res.errcode !== '0000') {
            const curLoginData = pwyStore.get(etaxLoginedCachePreKey + cityPageId);
            curLoginData.taxNo = taxNo;
            pwyStore.set(etaxLoginedCachePreKey + cityPageId, curLoginData, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(cityPageId, curLoginData);
        }

        await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
        ctx.service.log.info('税号切换结束', cityPageId, '切换成功');
        return errcodeInfo.success;
    }
}
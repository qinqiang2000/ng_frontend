/* eslint-disable complexity */

import { mkdirs as mkdirsSync, sleep } from '$utils/tools';
import { getUUId } from '$utils/getUid';
import { getRequestInfo } from '$utils/govHelpersV2';
import { getPublicKeyInfo } from '$utils/publicKeyTools';
import * as commonLibs from '../govLoginLibs/common';
import { getGovPublickKeylockPreKey } from '../constant';
import { getSwjgInfoByTaxNo, getSwjgInfoByCity } from '$utils/swjgInfo';
const { join: pathJoin } = path;

const proxyCommonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*'
};

export class Tools extends BaseService {
    checkFileIsExsit(filePath = '', maxTime = 24 * 60 * 60 * 1000, disabledCache?: boolean, minFileSize?: number) {
        const ctx = this.ctx;
        minFileSize = typeof minFileSize === 'undefined' ? 0 : minFileSize;
        try {
            // 不存在直接返回
            if (!fs.existsSync(filePath)) {
                return false;
            }
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            if (fileSize <= minFileSize) {
                fs.unlinkSync(filePath);
                return false;
            }
            const createTime = parseInt(stat.ctimeMs);
            const nowTime = +new Date();
            // 超过缓存时间，直接删除
            if (nowTime - createTime > maxTime || disabledCache) {
                fs.unlinkSync(filePath);
                return false;
            }
            return true;
        } catch (error) {
            ctx.service.log.info('error', error);
            return false;
        }
    }

    getCachePath(taxNo: string, fileName: string) {
        const ctx = this.ctx;
        const USER_DATA_PATH = ctx.app.config.USER_DATA_PATH;
        const cacheFilePath = path.join(USER_DATA_PATH, 'download', 'cacheFiles', taxNo, fileName);
        return cacheFilePath;
    }

    getCacheResult(filePath = '', maxTime = 24 * 60 * 60 * 1000, disabledCache?: boolean) {
        const ctx = this.ctx;
        const hasCache = this.checkFileIsExsit(filePath, maxTime, disabledCache);
        let result;
        if (hasCache) {
            try {
                result = fs.readFileSync(filePath, 'utf8');
                result = JSON.parse(result);
                return result;
            } catch (error) {
                ctx.service.log.info('文件解析异常', error);
                return {
                    ...errcodeInfo.fpyInnerErr,
                    description: '文件解析异常!'
                };
            }
        }
        return false;
    }

    cacheResult(filePath = '', result: any) {
        const ctx = this.ctx;
        if (filePath && result) {
            // 将整个结果缓存
            const dirPath = path.dirname(filePath);
            try {
                mkdirsSync(dirPath);
                fs.writeFileSync(filePath, JSON.stringify(result), 'utf8');
            } catch (error) {
                ctx.service.log.info('文件缓存异常', filePath, error);
            }
        }
    }

    clearCacheFile(filePath: string) {
        if (!fs.existsSync(filePath)) {
            return true;
        }
        fs.unlinkSync(filePath);
        return true;
    }

    checkGovDownload(opt : any = {}) {
        const ctx = this.ctx;
        const {
            status,
            contentType,
            data // 为base64数据
        } = opt;
        if (status === 301 || status === 302) {
            return errcodeInfo.govLogout;
        }

        if (contentType.indexOf('application/json') !== -1) {
            try {
                const jsonData = JSON.parse(Buffer.from(data, 'base64').toString());
                ctx.service.log.info('税局返回json', jsonData);
            } catch (error) {
                ctx.service.log.info('checkGovDownload parse error', error.message);
            }
            ctx.service.log.info('税局返回异常', data);
            return errcodeInfo.govErr;
        }

        if (contentType.indexOf('html') !== -1) {
            return errcodeInfo.govLogout;
        }

        if (!data) {
            ctx.service.log.info('税局返回为空');
            return errcodeInfo.govErr;
        }

        if (status !== 200) {
            ctx.service.log.info('税局返回信息', contentType, status);
            return errcodeInfo.govErr;
        }

        return errcodeInfo.success;
    }

    apiProxyRequest(options: any, body: any) {
        return new Promise((resolve) => {
            const ctx = this.ctx;
            const requestId = getUUId();
            const { pageId } = ctx.request.query;
            const pageIdArr = pageId.split('-');
            const requestId16 = requestId.substring(0, 16);
            const errorbodyData = Buffer.from(JSON.stringify({
                Response: {
                    RequestId: requestId16,
                    Data: {
                        message: '税局请求异常'
                    }
                }
            }));
            const logoutData = Buffer.from(JSON.stringify({
                Response: {
                    RequestId: requestId16,
                    Data: {
                        CodeMsg: 'refresh'
                    }
                }
            }));
            const req = moduleHttps.request(options, (res: any) => {
                const resHeaders = res.headers;
                ctx.service.log.info('resHeaders', resHeaders);
                const contentDisposition = resHeaders['content-disposition'];
                const contentType = resHeaders['content-type'];
                const chunks: any[] = [];
                res.on('data', (chunk: any) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        delete resHeaders['location'];
                        resolve({
                            body: logoutData,
                            headers: {
                                ...resHeaders,
                                ...proxyCommonHeaders,
                                'content-length': logoutData.length.toString(),
                                'content-type': 'application/json;charset=utf-8'
                            }
                        });
                        return;
                    }
                    if (res.statusCode !== 200) {
                        resolve({
                            body: errorbodyData,
                            headers: {
                                ...resHeaders,
                                ...proxyCommonHeaders,
                                'content-length': errorbodyData.length.toString(),
                                'content-type': 'application/json;charset=utf-8'
                            }
                        });
                        return;
                    }

                    ctx.service.log.info('contentDisposition', contentDisposition);
                    ctx.service.log.info('contentType', contentType);
                    // 文件数据
                    if (contentDisposition) {
                        delete resHeaders['content-disposition'];
                        try {
                            ctx.service.log.info('--------------save file-----------');
                            const taxNo = pageIdArr[1];
                            const saveDirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo);
                            mkdirsSync(saveDirPath);
                            const fileName = contentDisposition.split(';')[1].trim().split('=')[1];
                            const fileExtension = fileName.split('.').pop();
                            const fileUid = getUUId();
                            const filePath = path.join(saveDirPath, fileUid + '.' + fileExtension);
                            fs.writeFileSync(filePath, buffer);
                            const bodyData = Buffer.from(JSON.stringify({
                                Response: {
                                    RequestId: requestId16,
                                    Data: {
                                        filePath,
                                        message: 'Ok'
                                    }
                                }
                            }));
                            resolve({
                                body: bodyData,
                                headers: {
                                    ...resHeaders,
                                    ...proxyCommonHeaders,
                                    'content-length': bodyData.length.toString(),
                                    'content-type': 'application/json;charset=utf-8'
                                }
                            });
                            return;
                        } catch (e) {
                            ctx.service.log.info('proxy save file error', e);
                            resolve({
                                body: errorbodyData,
                                headers: {
                                    ...resHeaders,
                                    ...proxyCommonHeaders,
                                    'content-length': errorbodyData.length.toString(),
                                    'content-type': 'application/json;charset=utf-8'
                                }
                            });
                            return;
                        }
                    }
                    ctx.service.log.info('---------------buffer response---');
                    resolve({
                        body: buffer,
                        headers: {
                            ...resHeaders,
                            ...proxyCommonHeaders
                        }
                    });
                });
                req.on('error', (error: Error) => {
                    ctx.service.log.info('proxy err', error);
                    resolve({
                        body: errorbodyData,
                        headers: {
                            ...proxyCommonHeaders,
                            'content-length': errorbodyData.length.toString(),
                            'content-type': 'application/json;charset=utf-8'
                        }
                    });
                });
            });

            if (ctx.request.body) {
                req.write(Buffer.from(JSON.stringify(ctx.request.body)));
            }
            req.end();
        });
    }

    async apiProxy() {
        const ctx = this.ctx;
        const { url, pageId } = ctx.request.query;
        const requestUrl = decodeURIComponent(url);
        const urlInfo = moduleUrl.parse(requestUrl);
        if (ctx.request.method === 'OPTIONS') {
            ctx.res.writeHead(200, {
                ...proxyCommonHeaders,
                'Access-Control-Max-Age': '3600'
            });
            ctx.res.end();
            return;
        }
        const { requestuid, ...otherHeaders } = ctx.request.headers;
        const ntInfo: any = ctx.bsWindows.fpdkGovWin;
        const nt: any = ntInfo ? ntInfo[pageId] : null;
        const curUrl = nt.getUrl();
        const cookiesRes = await nt.getCookies({ url: curUrl });
        const cookies = cookiesRes.data || [];
        const cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
        const options = {
            method: ctx.request.method,
            port: parseInt(urlInfo.port),
            hostname: urlInfo.hostname,
            path: urlInfo.path,
            headers: {
                ...otherHeaders,
                host: urlInfo.host,
                Cookie: cookie,
                Referer: curUrl
            },
            timeout: 120000
        };
        const res: any = await this.apiProxyRequest(options, ctx.request.body);
        ctx.res.writeHead(200, res.headers);
        if (res.body) {
            ctx.res.write(res.body);
            ctx.res.end();
        } else {
            ctx.res.end();
        }
    }

    async updateSetCookie(loginData: any, setCookies: any = [], publicInfo?: any) {
        const ctx = this.ctx;
        const cookieObj: any = [];
        const ntRes = await ctx.service.nt.getNt(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        const nt = ntRes.data;
        nt.updateAliveTime();
        const ntUrl = nt.getUrl();
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            return false;
        }
        setCookies.forEach((cookie: any) => {
            const [cookieNameValue, ...cookieOptions] = cookie.split('; ');
            const [cookieName, cookieValue] = cookieNameValue.split('=');
            const curObj: any = {
                name: cookieName,
                value: cookieValue
            };
            cookieOptions.forEach((option: any) => {
                const [optionName, optionValue] = option.split('=');
                curObj[optionName.charAt(0).toLowerCase() + optionName.slice(1)] = optionValue || true;
            });
            cookieObj.push({
                hostOnly: false,
                httpOnly: false,
                secure: false,
                sameSite: false,
                ...curObj
            });
        });
        await nt.setCookies(cookieObj);
        await ctx.service.nt.updateCookies(nt, loginData, publicInfo);
    }

    async getAndCheckNtLock(loginData: any) {
        const ctx = this.ctx;
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        const pageId = loginData.pageId;
        const ntRes = await ctx.service.nt.getNt(loginData);
        ctx.service.log.info('getAndCheckNtLock getNt start');
        if (ntRes.errcode !== '0000') {
            ctx.service.log.info('getAndCheckNtLock getNt res', ntRes);
            if (ntRes.errcode === '91300') {
                return errcodeInfo.govLogout;
            }
            return {
                ...errcodeInfo.govErr,
                description: '客户端处理异常，请稍后再试！' // 这个失败描述可以重试
            };
        }
        const nt = ntRes.data;
        const ntUrl = nt.getUrl();
        const res = await ctx.service.nt.checkNtLock(pageId);
        ctx.service.log.info('getAndCheckNtLock checkNtLock res', res);
        if (res.errcode !== '0000') {
            if (res.errcode === '91300') {
                return errcodeInfo.govLogout;
            }
            return {
                ...errcodeInfo.govErr,
                description: '客户端处理异常，请稍后再试！'
            };
        }
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            return errcodeInfo.govLogout;
        }
        nt.evaluate(simulateClick, {
            minDot: 3,
            maxDot: 4
        }, true);
        await ctx.service.nt.updateCookies(nt, loginData);
        return ntRes;
    }

    async promiseTimeout(p: any, opt: { timeout?: number } = {}) {
        const ctx = this.ctx;
        const timeout = opt?.timeout || 10000;
        let timeoutId: any = null;
        const p1 = new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                resolve({
                    ...errcodeInfo.govTimeout,
                    description: '客户端处理异常，请稍后再试！'
                });
            }, timeout + 100);
        });

        let res;
        try {
            res = await Promise.race([p1, p]);
            return {
                ...errcodeInfo.success,
                data: res
            };
        } catch (error) {
            ctx.service.log.info('客户端处理异常', error.message);
            res = {
                ...errcodeInfo.govErr,
                description: '客户端处理异常，请稍后再试！'
            };
        }
        global.clearTimeout(timeoutId);
        return res;
    }

    async getLzkqow(nt: any, loginData: any, info: any = {}) {
        const ctx = this.ctx;
        if (!loginData || !loginData.loginedCookies) {
            return errcodeInfo.govLogout;
        }

        const p = nt.evaluate(commonLibs.getLzkqow, {
            urlPath: info.url,
            data: info.data ? JSON.stringify(info.data) : ''
        });
        const res : any = await this.promiseTimeout(p, {
            timeout: 10000
        });

        // 执行出现超时等异常，需要关闭重新打开
        if (res.errcode !== '0000') {
            const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                closeFlag: true
            });
            if (res2.errcode === '91300') {
                return res2;
            }
            if (res2.errcode !== '0000') {
                return {
                    ...errcodeInfo.govErr,
                    description: '客户端处理异常，请稍后再试！'
                };
            }
            return {
                ...errcodeInfo.success,
                data: {
                    isReOpen: true
                }
            };
        }
        const resData = res.data || {};
        // 只是执行代码异常，重新刷新界面恢复
        if (typeof resData.errcode !== 'undefined' && resData.errcode !== '0000') {
            ctx.service.log.info('执行代码getLzkqow异常，开始重新加载');
            const reloadRes = await ctx.service.nt.ntReload(nt, loginData.pageId);
            if (reloadRes.errcode !== '0000') {
                return reloadRes;
            }
            return {
                ...errcodeInfo.success,
                data: {
                    isReOpen: true
                }
            };
        }
        return res;
    }

    async dcode419(loginData: any, responseData: any = {}) {
        const ctx = this.ctx;
        if (!loginData || !loginData.loginedCookies) {
            return errcodeInfo.govLogout;
        }

        ctx.service.log.info('dcode419 start');
        const ntRes = await this.getAndCheckNtLock(loginData);
        ctx.service.log.info('dcode419 getAndCheckNtLock end');
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        const nt = ntRes.data;
        const enc_flag = responseData.e;
        const ycbz = responseData.y;
        const gTcARqnea5KV = parseInt(responseData.t);
        const dunm_data = responseData.data;
        const clickP = nt.evaluate(simulateClick);
        let res;
        ctx.service.log.info('模拟点击开始');
        const clickRes = await this.promiseTimeout(clickP, {
            timeout: 15000
        });
        if (clickRes.errcode !== '0000') {
            ctx.service.log.info('模拟点击超时', clickRes);
        }
        if (clickRes.errcode === '0000') {
            ctx.service.log.info('模拟点击结束');
            const p = nt.evaluate(commonLibs.dcode419, {
                globalInfo: {
                    enc_flag,
                    ycbz,
                    gTcARqnea5KV
                },
                dunm_data
            });
            res = await this.promiseTimeout(p, {
                timeout: 10000
            });
        }

        if (clickRes.errcode !== '0000' || res.errcode !== '0000') {
            const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                closeFlag: true
            });
            if (res2.errcode !== '0000') {
                ctx.service.log.info('dcode419 openLoinedChrome res', res2);
                return {
                    ...errcodeInfo.govErr,
                    description: '客户端处理异常，请稍后再试！'
                };
            }
            return {
                ...errcodeInfo.success,
                data: {
                    isReOpen: true
                }
            };
        }
        const clickResData = clickRes.data || {};
        const resData = res.data || {};
        // 执行js出现异常
        if ((typeof clickResData.errcode !== 'undefined' && clickResData.errcode !== '0000') ||
        (typeof resData.errcode !== 'undefined' && resData.errcode !== '0000')) {
            const reloadRes = await ctx.service.nt.ntReload(nt, loginData.pageId);
            if (reloadRes.errcode !== '0000') {
                return reloadRes;
            }
            return {
                ...errcodeInfo.success,
                data: {
                    isReOpen: true
                }
            };
        }
        // return res;
        return {
            ...errcodeInfo.success,
            data: {
                isReOpen: true
            }
        };
    }

    httpRequest(requestUrl: string, options: {
        method?: string,
        timeout?: number | string[],
        headers?: any,
        contentType?: string,
        data?: any,
        dataType?: string,
        auth?: string,
        agent?: {
            host: string,
            port: number,
            auth?: string
        }
    }) {
        return new Promise((resolve) => {
            const ctx = this.ctx;
            const method = options.method || 'GET';
            const urlInfo = moduleUrl.parse(requestUrl);
            const fullOptions: any = {
                hostname: urlInfo.hostname,
                port: urlInfo.port,
                path: urlInfo.path,
                rejectUnauthorized: false,
                method: method.toUpperCase(),
                headers: options.headers
            };
            if (options.auth) {
                fullOptions.auth = options.auth;
            }
            if (typeof options.timeout === 'number' || !options.timeout) {
                fullOptions.timeout = options.timeout || 120000;
            } else if (options.timeout.length === 2) {
                fullOptions.timeout = options.timeout[1];
            }
            if (options.contentType === 'json' && options.data) {
                fullOptions.headers['content-type'] = 'application/json';
            }

            if (options.agent) {
                fullOptions.agent = options.agent;
            }
            ctx.service.log.fullInfo('税局请求开始', requestUrl);
            const req = moduleHttps.request(fullOptions, (res : any) => {
                const resHeaders = res.headers || {};
                const statusCode = res.statusCode;
                ctx.service.log.info('税局请求返回头信息', requestUrl, statusCode, typeof statusCode);
                const chunks: any = [];
                res.on('data', (chunk: any) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    let dataType = options.dataType;
                    if (statusCode === 301 || statusCode === 302) {
                        resolve({
                            status: statusCode,
                            headers: res.headers,
                            data: buffer
                        });
                        return;
                    }

                    const govDecode = resHeaders['dcode'];
                    if (govDecode === '419' || govDecode === '418') {
                        dataType = 'json';
                    }
                    if (dataType === 'text') {
                        const textData = buffer.toString();
                        ctx.service.log.info('税局请求返回数据', requestUrl, textData);
                        resolve({
                            status: statusCode,
                            headers: res.headers,
                            data: buffer.toString()
                        });
                        return;
                    }
                    const contentType = resHeaders['content-type'] || '';
                    // 返回html
                    if (contentType.indexOf('text/html') !== -1) {
                        ctx.service.log.info('税局请求异常, 返回html');
                        resolve(errcodeInfo.govErr);
                        return;
                    }
                    if (dataType === 'json' || contentType.indexOf('application/json') !== -1) {
                        try {
                            const jsonData = JSON.parse(buffer.toString());
                            // 减少日志量，418和419是基础密钥
                            if (govDecode !== '419' && govDecode !== '418') {
                                ctx.service.log.info('税局请求返回数据', requestUrl);
                            }
                            resolve({
                                status: statusCode,
                                headers: res.headers,
                                data: jsonData
                            });
                        } catch (error) {
                            ctx.service.log.info('税局请求异常, json解析异常', requestUrl);
                            resolve(errcodeInfo.govErr);
                        }
                        return;
                    }
                    resolve({
                        status: statusCode,
                        headers: res.headers,
                        data: buffer
                    });
                });
            });
            req.on('timeout', () => {
                req.abort();
                ctx.service.log.info('税局请求异常超时', requestUrl);
                resolve(errcodeInfo.govTimeout);
            });
            req.on('error', (error: any) => {
                ctx.service.log.info('税局请求异常http error', requestUrl, error.code, error.message);
                resolve(errcodeInfo.govErr);
            });

            if (!options.data) {
                req.end();
            } else if (typeof options.data === 'string') {
                req.end(Buffer.from(options.data));
            } else if (typeof options.data === 'object') {
                req.end(Buffer.from(JSON.stringify(options.data)));
            }
        });
    }

    // 获取税局公钥
    async getPublicKey(loginData: any, retry = 0) {
        const ctx = this.ctx;
        const maxRetry = 4;
        const queryInfo = ctx.request.query || {};
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }

        const ntRes : any = await this.getAndCheckNtLock(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        const nt = ntRes.data;

        const cookies = loginData.loginedCookies || [];
        const cookieStr = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
        const infoRes = await getRequestInfo({
            data: '',
            url: '/kpfw/cssSecurity/v1/getPublicKey',
            method: 'post'
        }, {
            cookieStr,
            publicKeyInfo: {},
            taxNo: queryInfo.taxNo,
            needEncry: false
        });
        // 获取公钥不需要这些头部
        delete infoRes.headers['X-B3-SpanId'];
        delete infoRes.headers['X-B3-Sampled'];
        delete infoRes.headers['X-B3-TraceId'];
        delete infoRes.headers['X-Tsf-Client-Timestamp'];
        delete infoRes.headers['security-mes-key'];
        delete infoRes.headers['nsrsbh'];
        const resultInfoRes = await this.getLzkqow(nt, loginData, infoRes);
        ctx.service.log.fullInfo('getPublicKey getLzkqow result', resultInfoRes);
        const resultInfo = resultInfoRes.data || {};
        if (resultInfoRes.errcode !== '0000') {
            ctx.service.log.info('税局请求异常，getLzkqowy处理异常');
            return resultInfoRes;
        }

        if (resultInfo.isReOpen) {
            if (retry > maxRetry) {
                ctx.service.log.info('税局请求异常，超过重试次数获取公钥失败', retry);
                return {
                    ...errcodeInfo.govErr,
                    description: '税局公钥返回异常，请稍后再试'
                };
            }
            const errRes: any = await this.getPublicKey(loginData, retry + 1);
            return errRes;
        }

        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        if (resultInfo.hd) {
            infoRes.headers['lzkqow23819'] = resultInfo['hd'];
            infoRes.url = resultInfo['hurl'];
            infoRes.data = resultInfo['bd'];
        }

        ctx.service.log.info('getRequestInfo res', infoRes);
        const requestUrl = loginData.baseUrl + infoRes.url;
        const referer = loginData.referer || `${loginData.baseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
        const userAgent = nt?.userAgent || ctx.service.ntTools.getUserAgent();
        const headers = {
            cookie: cookieStr,
            referer,
            ...infoRes.headers,
            'User-Agent': userAgent
        };

        const res = await ctx.service.tools.httpRequest(requestUrl, {
            method: 'POST',
            data: infoRes.data || '',
            dataType: 'json',
            timeout: [10000, 120000],
            headers
        });
        const resHeaders = res.headers || {};
        ctx.service.log.info('getPublicKey httpRequest res', retry, res);
        const resData = res.data || {};
        const publicKey = resData.publicKey;
        let publicInfo;
        if (publicKey) {
            publicInfo = getPublicKeyInfo(resData);
            ctx.service.log.info('税局请求返回，getPublicKey成功', publicInfo);
        }

        const setCookies = resHeaders['set-cookie'] || [];
        await this.updateSetCookie(loginData, setCookies, publicInfo);

        if (publicInfo) {
            return {
                ...errcodeInfo.success,
                data: publicInfo
            };
        }

        if (typeof res.errcode !== 'undefined') {
            if (retry > maxRetry) {
                ctx.service.log.info('税局请求异常，调用税局公钥异常', retry, res);
                return {
                    ...errcodeInfo.govErr,
                    description: '税局公钥返回异常，请稍后再试'
                };
            }
            const retryRes: any = await this.getPublicKey(loginData, retry + 1);
            return retryRes;
        }

        // 失效统一重试处理
        const logoutHandle = async(newLocation = '') => {
            const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                redirectUrl: newLocation
            });
            // 登录再次检查仍然失效
            if (res2.errcode !== '0000') {
                ctx.service.log.info('税局请求异常，登录失效后重新尝试获取公钥异常', retry, res2);
                return res2;
            }
            const retryRes: any = await this.getPublicKey(loginData, retry + 1);
            return retryRes;
        };

        // 需要解密重新调用
        if (resData.data && resHeaders['dcode'] === '419') {
            if (retry > maxRetry) {
                ctx.service.log.info('税局请求异常，dcode419异常，获取公钥超过重试次数', retry);
                return {
                    ...errcodeInfo.govErr,
                    description: '税局公钥返回异常，请稍后再试'
                };
            }
            const decodeRes = await this.dcode419(loginData, resData);
            ctx.service.log.info('税局请求异常，getPublicKey dcode419异常', decodeRes);
            if (decodeRes.errcode !== '0000') {
                return decodeRes;
            }
            const errRes: any = await this.getPublicKey(loginData, retry + 1);
            return errRes;
        }

        if (resHeaders['dcode'] === '418') {
            if (retry > maxRetry) {
                ctx.service.log.info('税局请求异常，dcode418异常，获取公钥超过重试次数', retry);
                return {
                    ...errcodeInfo.govErr,
                    description: '税局公钥返回异常，请稍后再试'
                };
            }
            ctx.service.log.info('getPublicKey dcode418异常', resData);
            if (!resData.data || !nt) {
                const res2 = await logoutHandle();
                return res2;
            }
            const reloadRes = await ctx.service.nt.ntReload(nt, loginData.pageId);
            if (reloadRes.errcode !== '0000') {
                return reloadRes;
            }
            const ntUrl = nt.getUrl();
            if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
                const res2 = await logoutHandle();
                return res2;
            }
            const errRes: any = await this.getPublicKey(loginData, retry + 1);
            return errRes;
        }

        const responseData = resData.Response?.Data || resData.Response?.Error || resData;
        const Address = responseData.Address || responseData.address || '';
        const CodeMsg = responseData.CodeMsg || responseData.codeMsg || '';

        // 登录被重定向处理
        if (res.status === 301 || res.status === 302 || CodeMsg === 'refresh' || Address.indexOf('请重新登录') !== -1 ||
        Address.indexOf('nonlogin') !== -1 || CodeMsg === 'N') {
            const res2 = await logoutHandle(resHeaders.location);
            return res2;
        }

        if (retry > 4) {
            ctx.service.log.info('税局请求异常，获取公钥超过重试次数', retry);
            return {
                ...errcodeInfo.govErr,
                description: '税局公钥返回异常，请稍后再试'
            };
        }

        const errRes: any = await this.getPublicKey(loginData, retry + 1);
        return errRes;
    }

    async loopQueryPublickKey(pageId: string, startTime = (+new Date())) {
        const ctx = this.ctx;
        await sleep(3000);
        const lockRes = await ctx.service.redisLock.query(getGovPublickKeylockPreKey + pageId);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        // 登录成功, 且当前锁定释放
        if (lockRes.data?.result === false) {
            if (localLoginData?.publicKeyInfo) {
                return {
                    ...errcodeInfo.success,
                    data: localLoginData?.publicKeyInfo
                };
            }
            return {
                ...errcodeInfo.govErr,
                description: '获取税局公钥异常，请重试！'
            };
        }
        const res : any = await this.loopQueryPublickKey(pageId, startTime);
        return res;
    }

    // 防止并发请求获取税局公钥，30s内只允许获取一次成功
    async lockGetPublickKey(loginData: any = {}) {
        const ctx = this.ctx;
        if (!loginData?.pageId || !loginData?.loginedCookies) {
            return errcodeInfo.govLogout;
        }
        const pageId = loginData.pageId;
        const lockRes = await ctx.service.redisLock.checkNtSet(getGovPublickKeylockPreKey + pageId, 120);
        // 获取锁异常
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        // 获取锁失败，循环获取缓存结果
        if (lockRes.data?.result === false) {
            ctx.service.log.info('当前正在获取公钥，开始查询公钥');
            const loopRes = await this.loopQueryPublickKey(pageId);
            return loopRes;
        }

        try {
            const keyRes = await this.getPublicKey(loginData);
            await ctx.service.redisLock.delete(getGovPublickKeylockPreKey + pageId);
            return keyRes;
        } catch (error) {
            await ctx.service.redisLock.delete(getGovPublickKeylockPreKey + pageId);
        }
        return {
            ...errcodeInfo.govErr,
            description: '获取税局公钥异常，请重试！'
        };
    }

    async requestGov(loginData: any, urlPath: string, paramJson: any, otherInfo: any = {}, retry: number = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const pageId = queryInfo.pageId;
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }

        const ntRes : any = await this.getAndCheckNtLock(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        const nt = ntRes.data;

        const errRetry = async(errRes: any, redirectUrl?: string, allowRetry?: number) => {
            ctx.service.log.info('requestGov ntEncryCurl retry', retry, queryInfo.disabledRetry, otherInfo.disabledRetry, errRes.errcode);
            // 指定可以重试多少次直接重试
            if (allowRetry && retry < allowRetry) {
                const retryRes: any = await this.requestGov(loginData, urlPath, paramJson, otherInfo, retry + 1);
                return retryRes;
            }

            if (retry > 2) {
                ctx.service.log.info('税局请求异常，超过重试次数', urlPath, retry);
                return errRes;
            }

            // 登录失效允许重试一次
            if (errRes.errcode === '91300') {
                const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                    redirectUrl
                });

                // 登录再次检查仍然失效
                if (res2.errcode !== '0000') {
                    ctx.service.log.info('税局请求异常，登录失效重新加载后还是异常', retry, res2);
                    return res2;
                }
                const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
                const res3: any = await this.requestGov(localLoginData, urlPath, paramJson, otherInfo, retry + 1);
                ctx.service.log.info('requestGov retry ntEncryCurl res', retry);
                return res3;
            }

            if (otherInfo.disabledRetry) {
                ctx.service.log.info('税局请求异常，接口不允许重试', urlPath, errRes);
                return errRes;
            }

            if (queryInfo.disabledRetry) {
                ctx.service.log.info('税局请求异常，地址栏控制不允许重试', urlPath, queryInfo.disabledRetry, retry);
                return errRes;
            }

            const retryRes: any = await this.requestGov(loginData, urlPath, paramJson, otherInfo, retry + 1);
            return retryRes;
        };

        const cookies = loginData.loginedCookies || [];
        const cookie = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
        let publicKeyInfo = loginData.publicKeyInfo;
        // 登录状态中不存在公钥时，需要重新获取
        if (!publicKeyInfo) {
            ctx.service.log.info('公钥为空，开始获取公钥');
            const keyRes = await this.lockGetPublickKey(loginData);
            ctx.service.log.info('获取公钥结束');
            if (keyRes.errcode !== '0000') {
                ctx.service.log.info('税局请求异常，获取公钥异常', keyRes);
                return keyRes;
            }
            publicKeyInfo = keyRes.data;
            loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
            loginData = {
                ...loginData,
                publicKeyInfo
            };
            // ctx.service.log.info('loginData publicKeyInfo', loginData.publicKeyInfo);
        }
        ctx.service.log.fullInfo('请求原始参数', urlPath);
        const infoRes = await getRequestInfo({
            data: paramJson,
            url: urlPath,
            method: otherInfo.method || 'post'
        }, {
            publicKeyInfo,
            cookieStr: cookie,
            taxNo: queryInfo.taxNo,
            needEncry: !otherInfo.disableEncry
        });

        ctx.service.log.info('requstGov getLzkqow infoRes', infoRes?.url);
        const resultInfoRes = await this.getLzkqow(nt, loginData, infoRes);
        ctx.service.log.info('requstGov getLzkqow result', resultInfoRes);
        const resultInfo = resultInfoRes.data || {};
        if (resultInfoRes.errcode !== '0000') {
            ctx.service.log.info('税局请求异常，getLzkqow异常');
            return resultInfoRes;
        }

        if (resultInfo.isReOpen) {
            // 删除公钥，重新获取
            ctx.service.log.info('界面重新进入，删除旧公钥重新获取');
            delete loginData['publicKeyInfo'];
            await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
            const errRes = await errRetry({
                ...errcodeInfo.govErr,
                description: '税局返回数据异常，请稍后再试！'
            });
            return errRes;
        }

        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        if (resultInfo.hd) {
            infoRes.headers['lzkqow23819'] = resultInfo['hd'];
            infoRes.url = resultInfo['hurl'];
            infoRes.data = resultInfo['bd'];
        }

        const requestUrl = loginData.baseUrl + infoRes.url;
        const referer = loginData.referer || `${loginData.baseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
        const userAgent = nt?.userAgent || ctx.service.ntTools.getUserAgent();
        const headers = {
            cookie: cookie,
            referer,
            ...infoRes.headers,
            'User-Agent': userAgent
        };

        const requestData = infoRes.data || '';
        const reqContentType = otherInfo.contentType || 'json';
        const httpRequestOpt: any = {
            method: otherInfo.method || 'POST',
            data: requestData,
            headers
        };

        if (reqContentType) {
            httpRequestOpt.contentType = reqContentType;
        }

        if (otherInfo.dataType) {
            httpRequestOpt.dataType = otherInfo.dataType;
        }
        const res = await ctx.service.tools.httpRequest(requestUrl, httpRequestOpt);
        const resHeaders = res.headers || {};
        const contentType = resHeaders['content-type'] || '';
        const resData = res.data;
        await this.updateSetCookie(loginData, resHeaders['set-cookie']);
        if (typeof res.errcode !== 'undefined') {
            const errRes = await errRetry(res);
            return errRes;
        }
        if (res.status === 301 || res.status === 302 || contentType.indexOf('text/html') !== -1) {
            const errRes = await errRetry(errcodeInfo.govLogout, resHeaders.location);
            return errRes;
        }

        if (contentType.indexOf('application/json') !== -1 || otherInfo.dataType === 'json') {
            const responseData = resData.Response?.Data || resData.Response?.Error || resData;
            // 税局返回为空
            if (!resData) {
                const errRes = await errRetry(errcodeInfo.govErr);
                return errRes;
            }

            const Address = responseData.Address || responseData.address || '';
            const CodeMsg = responseData.CodeMsg || responseData.codeMsg || '';
            if (CodeMsg === 'refresh' || Address.indexOf('请重新登录') !== -1 || Address.indexOf('nonlogin') !== -1 || CodeMsg === 'N') {
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }

            const responseError = resData.Response?.Error;
            if (responseError) {
                const { Message = '税局请求异常, 请稍后再试', Code } = responseError;
                return {
                    ...errcodeInfo.govErr,
                    description: Code ? Message + `[${Code}]` : Message
                };
            }

            // 需要重新加密发送请求
            if (responseData.data && resHeaders['dcode'] === '419') {
                ctx.service.log.info('dcode419需要重新加密请求');
                const decodeRes = await this.dcode419(loginData, responseData);
                if (decodeRes.errcode !== '0000') {
                    ctx.service.log.info('获取dcode419加密信息异常', decodeRes);
                    return decodeRes;
                }
                const errRes = await errRetry({
                    ...errcodeInfo.govErr,
                    description: '税局返回数据异常，请稍后再试！'
                }, '', 3);
                return errRes;
            } else if (resHeaders['dcode'] === '418') {
                // 需要通过保活重新处理
                if (!responseData.data || !nt) {
                    const errRes = await errRetry(errcodeInfo.govLogout);
                    return errRes;
                }
                ctx.service.log.info('dcode418异常', resHeaders, resData);
                const reloadRes = await ctx.service.nt.ntReload(nt, loginData.pageId);
                if (reloadRes.errcode !== '0000') {
                    return reloadRes;
                }

                const ntUrl = nt.getUrl();
                if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
                    return await errRetry(errcodeInfo.govLogout);
                }

                ctx.service.log.info('418状态码界面重新进入，删除旧公钥重新获取');
                // 删除公钥，重新获取
                delete loginData['publicKeyInfo'];
                await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
                await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
                const errRes: any = await errRetry({
                    ...errcodeInfo.govErr,
                    description: '税局返回数据异常，请稍后再试！'
                }, '', 3);
                return errRes;
            }

            if (resData.Response?.Data && res.status === 200) {
                return {
                    ...errcodeInfo.success,
                    data: responseData
                };
            }
            ctx.service.log.info('税局请求返回结果异常', responseData);
            return {
                ...errcodeInfo.govErr,
                data: responseData
            };
        }
        if (res.status === 200) {
            // 税局返回数据为空
            if (resData.length === 0) {
                ctx.service.log.info('税局请求返回数据为空');
                const errRes = await errRetry(errcodeInfo.govErr);
                return errRes;
            }
            return {
                ...errcodeInfo.success,
                data: resData
            };
        }
        ctx.service.log.info('税局请求返回状态码异常', res.status);
        const errRes = await errRetry(errcodeInfo.govErr);
        return errRes;
    }

    // 生成cityPageId
    async createCityPageId(opt : any = {}) {
        const ctx = this.ctx;
        const {
            access_token,
            client_id,
            tenantNo,
            taxNo,
            city,
            loginAccountUid
        } = opt;
        let etaxName = opt.etaxName || '';
        if (!tenantNo || !loginAccountUid) {
            return {
                ...errcodeInfo.argsErr,
                description: '参数错误，租户信息和账号不能为空'
            };
        }
        if (!city && !etaxName) {
            if (!access_token || !client_id) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '参数错误，授权信息异常'
                };
            }
            const resAccount = await ctx.service.ntTools.getEtaxAccount({
                tenantNo,
                client_id,
                taxNo,
                loginAccountUid
            }, access_token);
            if (resAccount.errcode === '0000') {
                const etaxAccountInfo = resAccount.etaxAccountInfo;
                etaxName = etaxAccountInfo.etaxName;
                return {
                    ...errcodeInfo.success,
                    data: [tenantNo, etaxName, encodeURIComponent(loginAccountUid)].join('-')
                };
            }
            ctx.service.log.info('createCityPageId getEtaxAccount error', resAccount);
        }
        if (!etaxName) {
            let cityItem;
            if (city) {
                cityItem = getSwjgInfoByCity(city);
            } else {
                // 未传city
                let queryTaxNo = taxNo;
                // 正式和演示
                if (taxNo === 'DIEJINJINGDOUYUN1010' || taxNo === '123654123654') {
                    // 兼容企业认证
                    const requestData = ctx.request.body;
                    const deRes = await ctx.service.etaxLogin.decryData(requestData.data);
                    if (deRes.errcode !== '0000') {
                        return deRes;
                    }
                    const decryedData = deRes.data;
                    queryTaxNo = decryedData.taxNo;
                }
                cityItem = getSwjgInfoByTaxNo(queryTaxNo);
            }

            if (!cityItem) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '企业城市信息异常'
                };
            }
            etaxName = cityItem.name;
        }
        return {
            ...errcodeInfo.success,
            data: [tenantNo, etaxName, encodeURIComponent(loginAccountUid)].join('-')
        };
    }

    // 解决请求超时
    async getRequestCache(taxNo: string, requestHash: string, opt: any = {}) {
        const ctx = this.ctx;
        if (!requestHash || !taxNo) {
            return false;
        }

        const { maxTimeout, disabledCache, pageSize } = opt;
        const pageNo = opt.pageNo ? opt.pageNo : 0;
        const localCachePath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'requestCache');
        const localCachFileName = `requstId-${requestHash}`;
        const localCacheDirName = `requstId-${requestHash}-data`;
        const curFileName = `${requestHash}-${pageNo}-${pageNo + pageSize}`;
        const filePath = pathJoin(localCachePath, localCachFileName);
        const dataFilePath = pathJoin(localCachePath, localCacheDirName, curFileName);
        const cacheMaxTimeout = 30 * 60 * 1000;
        const isExsit = this.checkFileIsExsit(filePath, cacheMaxTimeout, disabledCache);
        const isExsit2 = this.checkFileIsExsit(dataFilePath, cacheMaxTimeout, disabledCache);
        ctx.service.log.info('缓存情况', isExsit2, dataFilePath);

        let requestCacheStr = '';
        let requestCacheJson: any = {};
        let resultDataStr = '';
        let resultData : any = {};
        if (!isExsit) {
            return false;
        }

        try {
            requestCacheStr = fs.readFileSync(filePath);
            requestCacheJson = JSON.parse(requestCacheStr);
            if (isExsit2) {
                resultDataStr = fs.readFileSync(dataFilePath);
                resultData = JSON.parse(resultDataStr);
            }
        } catch (error) {
            ctx.service.log.info('超时缓存提取失败', error);
            return false;
        }
        const { status } = requestCacheJson || {};
        ctx.service.log.info('缓存状态', status);
        if (resultData && resultData.errcode === '0000' && status === 1) {
            if (resultData.msgType === 'downloadFile') {
                return resultData;
            }
            if (resultDataStr.length < 1000) {
                return resultData;
            }
            const res = await ctx.service.invoiceCache.saveLongMsgInvoices('', resultData);
            if (res.errcode !== '0000') {
                ctx.service.log.info('长报文上传接口保存结果', res);
                return res;
            }
            fs.writeFileSync(dataFilePath, JSON.stringify(res));
            return res;
        }

        // 没有传超时时间，缓存不存在直接返回接口重新请求
        if (!maxTimeout && maxTimeout < 0) {
            return false;
        }

        if (status === 2) { // 1、数据缓存处理成功，2、处理中，3处理失败
            ctx.service.log.info('正在处理中....');
            await sleep(3000);
            const res2: any = await this.getRequestCache(taxNo, requestHash, {
                ...opt,
                maxTimeout: maxTimeout - 3000
            });
            return res2;
        }
        if (status === 3) {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                ctx.service.log.info('删除临时文件异常', filePath);
            }
        }
        return false;
    }

    async setRequestCache(taxNo: string, requestHash: string, opt: any = {}) {
        const ctx = this.ctx;
        if (!requestHash || !taxNo) {
            return false;
        }
        const { status, res, pageSize = 5000, dataFromIndex, pageNo = 0 } = opt;
        const localCachePath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'requestCache');
        const localCachFileName = `requstId-${requestHash}`;
        const localCacheDirName = `requstId-${requestHash}-data`;
        const filePath = pathJoin(localCachePath, localCachFileName);
        const cacheResultData: any = {
            status
        };
        if (status === 1 && res?.data) {
            const totalNum = res.data.length;
            // 如果数据超过了最大值size，则需要拆分
            if (totalNum > pageSize) {
                for (let i = 0; i < totalNum; i += pageSize) {
                    const curList = res.data.slice(i, i + pageSize);
                    const newSubRes = {
                        ...res,
                        data: curList
                    };
                    const nextDataIndex = i + pageSize;
                    if (typeof newSubRes.totalNum !== 'undefined') {
                        newSubRes.totalNum = curList.length;
                    }

                    if (typeof newSubRes.nextDataIndex !== 'undefined') {
                        newSubRes.nextDataIndex = nextDataIndex;
                    }

                    if (typeof newSubRes.nextDataFromIndex !== 'undefined' && typeof dataFromIndex !== 'undefined') {
                        newSubRes.nextDataFromIndex = dataFromIndex;
                    }

                    if (typeof newSubRes.endFlag !== 'undefined') {
                        if (nextDataIndex > totalNum) {
                            if (typeof newSubRes.nextDataFromIndex !== 'undefined') {
                                newSubRes.nextDataFromIndex = res.nextDataFromIndex;
                            }
                            if (typeof newSubRes.nextDataIndex !== 'undefined') {
                                newSubRes.nextDataIndex = res.nextDataIndex;
                            }
                            newSubRes.endFlag = res.endFlag;
                        } else {
                            newSubRes.endFlag = false;
                        }
                    }

                    const curFileName = `${requestHash}-${i}-${nextDataIndex}`;
                    const curFilePath = pathJoin(localCachePath, localCacheDirName, curFileName);
                    this.cacheResult(curFilePath, newSubRes);
                }
            } else {
                const curFileName = `${requestHash}-${pageNo}-${pageNo + pageSize}`;
                const curFilePath = pathJoin(localCachePath, localCacheDirName, curFileName);
                this.cacheResult(curFilePath, res);
            }
        }
        this.cacheResult(filePath, cacheResultData);
        return true;
    }
}
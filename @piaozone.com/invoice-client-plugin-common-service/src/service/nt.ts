/* eslint-disable complexity */
import { getUUId } from '$utils/getUid';
import { mkdirs as mkdirsSync, randomSleep, sleep } from '$utils/tools';
import { createGovRequest, formatData } from '$utils/govHelps';
import {
    evaluateJs,
    evaluateDownload,
    evaluateFetchDownload,
    openRequestHelper,
    reloadCheck,
    checkNtIsOk,
    getbodyText,
    setStorage
} from '$client/govLoginLibs/common';
import { ntLockPreKey, ntLockLoginPreKey, ntLockRequestPreKey, simulateClickPreKey } from '../constant';
import { dkgxByImport } from '../govLoginLibs/importDkgxExcel';
import { simulateClick } from '../govLoginLibs/randomClick';

export class NtService extends BaseService {
    getHeaders(tokenInfo: any = {}, requestUrl = '') {
        const { baseUrl, loginedCookies, userAgent = '', eUrl } = tokenInfo;
        if (!eUrl || !baseUrl || !loginedCookies || loginedCookies.length === 0) {
            return errcodeInfo.govLogout;
        }
        const cookieArr = [];
        const otherHeader: any = {};
        for (let i = 0; i < loginedCookies.length; i++) {
            const cookie = loginedCookies[i];
            const name = cookie.name;
            const value = cookie.value;
            cookieArr.push(`${name}=${value}`);
            if (name === 'SSO_SECURITY_CHECK_TOKEN') {
                otherHeader[name] = value;
            }
        }
        return {
            ...errcodeInfo.success,
            data: {
                ...otherHeader,
                'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'Referer': requestUrl === '' ? baseUrl : requestUrl.indexOf(baseUrl) === -1 ? eUrl : baseUrl,
                cookie: cookieArr.join('; ')
            }
        };
    }

    createRequestOpt(url: string, opt : any = {}, tokenInfo: any, requestType: string) {
        // const ctx = this.ctx;
        const method = opt.method || 'GET';
        const baseUrl = tokenInfo.baseUrl;
        const newUrl = /^http.*$/.test(url) ? url : baseUrl + url;
        const headerRes = this.getHeaders(tokenInfo, newUrl);
        if (headerRes.errcode !== '0000') {
            return headerRes;
        }
        const requestOpt : any = {
            rejectUnauthorized: false,
            headers: {
                ...headerRes.data,
                nsrsbh: tokenInfo.taxNo,
                ...(opt.headers || {})
            }
        };

        if (method !== 'GET') {
            requestOpt.method = method;
            if (opt.body) {
                if (typeof opt.body === 'string') {
                    requestOpt.data = JSON.parse(opt.body);
                } else {
                    requestOpt.data = opt.body;
                }
            }
            if (opt.files) {
                requestOpt.files = opt.files;
            }
        }
        const isDownload = requestType === 'download';
        // 导入数据
        const isImport = requestType === 'import';
        if (!isImport) {
            requestOpt.contentType = opt.contentType || 'json';
        }

        requestOpt.timeout = [10000, 60000];

        if (isDownload) {
            requestOpt.timeout = [12000, 120000];
        }

        if (opt.timeout) {
            requestOpt.timeout = opt.timeout;
        }

        if (opt.dataType) {
            requestOpt.dataType = opt.dataType;
        }
        return {
            ...errcodeInfo.success,
            data: {
                requestUrl: newUrl,
                requestOpt
            }
        };
    }

    async getProxy() {
        const ctx = this.ctx;
        const proxyRes = await ctx.helper.jsonCurl(ctx.app.config.baseUrl + '/fpdk-gov/fpdk/proxy/get', {
            method: 'GET',
            dataType: 'json'
        });
        if (proxyRes.code !== '0000') {
            ctx.service.log.info('代理获取异常', proxyRes);
            return {
                ...errcodeInfo.fpyInnerErr,
                description: '网路获取异常，请稍后再试!'
            };
        }
        const proxyData = proxyRes.proxy || {};
        const proxyStr = `http://${proxyData.ip}:${proxyData.port}`;
        return {
            ...errcodeInfo.success,
            data: proxyStr
        };
    }

    async queryPublicKey(tokenInfo: any, retry = 0) {
        const ctx = this.ctx;
        const pageId = tokenInfo.pageId;
        const preRes = createGovRequest('/ypfw/cssSecurity/v1/getPublicKey', {
            method: 'POST',
            dataType: 'json'
        }, tokenInfo);
        if (preRes.errcode !== '0000') {
            return preRes;
        }
        const preData : any = preRes.data || {};
        let resData = await httpRequest(preData.requestUrl, preData.requestOpt);
        // 如果请求正常直接返回了税局的结构，否则为异常状态
        if (typeof resData.errcode !== 'undefined') {
            if (retry > 2) {
                // 连续税局异常, 则登录失效重新登录
                if (resData.errcode === errcodeInfo.govEmptyError.errcode) {
                    ctx.service.log.info('税局返回为空');
                    return errcodeInfo.govLogout;
                }
                ctx.service.log.info('税局请求异常, resData', resData);
                return resData;
            }
        } else {
            if (resData.status === 302) {
                return errcodeInfo.govLogout;
            }
            resData = resData.data;
            if (resData.publicKey && resData.tokenKey) {
                const publicKeyInfo = {
                    ...resData,
                    mesType: '2',
                    urlType: '1',
                    clientType: '1'
                };
                const loginData = {
                    ...tokenInfo,
                    publicKeyInfo
                };
                const updateRes = await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
                if (updateRes.errcode !== '0000') {
                    return updateRes;
                }
                return {
                    ...errcodeInfo.success,
                    data: publicKeyInfo
                };
            }
            if (resData.Response && resData.Response.Data && resData.Response.Data.CodeMsg === 'refresh') {
                return errcodeInfo.govLogout;
            }
            if (retry > 2) {
                return {
                    ...errcodeInfo.govErr,
                    data: resData
                };
            }
        }
        ctx.service.log.info('retry publicKey request', retry);
        const newRes: any = await this.queryPublicKey(tokenInfo, retry + 1);
        return newRes;
    }

    async commonRequest(url: string, opt : any = {}, tokenInfo : any = {}, requestType?: string, retry? : number) {
        const ctx = this.ctx;
        retry = typeof retry === 'undefined' ? 0 : retry;
        const { baseUrl, loginedCookies, eUrl, taxNo } = tokenInfo;
        if (!eUrl || !baseUrl || !loginedCookies || loginedCookies.length === 0 || !taxNo) {
            return errcodeInfo.govLogout;
        }

        // 税局部分接口不需要获取公钥
        if (!tokenInfo.publicKeyInfo && !opt.disableTransform) {
            const preRes = await this.queryPublicKey(tokenInfo);
            if (preRes.errcode !== '0000') {
                return preRes;
            }
            tokenInfo = {
                ...tokenInfo,
                publicKeyInfo: preRes.data
            };
        }
        const createRes = createGovRequest(url, opt, tokenInfo, requestType);
        if (createRes.errcode !== '0000') {
            return createRes;
        }
        const { requestOpt, requestUrl } = createRes.data || {};
        const isDownload = requestType === 'download';
        let resData;
        const tempRequestOpt = { ...requestOpt }; // 方便打印，请求后requestOpt会发生变化
        try {
            await randomSleep(500, 1000);
            ctx.service.log.info('税局请求地址', requestUrl);
            resData = await httpRequest(requestUrl, requestOpt);
        } catch (error) {
            ctx.service.log.fullInfo('税局请求异常, requestOpt', tempRequestOpt);
            ctx.service.log.info('税局请求异常', requestUrl, error.toString());
            return errcodeInfo.govErr;
        }
        // 如果请求正常直接返回了税局的结构，否则为异常状态
        if (typeof resData.errcode !== 'undefined') {
            if (opt.disabledRetry || retry > 2) {
                ctx.service.log.fullInfo('税局请求异常, requestOpt', tempRequestOpt);
                // 连续税局异常, 则登录失效重新登录
                if (resData.errcode === errcodeInfo.govEmptyError.errcode) {
                    ctx.service.log.info('税局返回为空');
                    return errcodeInfo.govErr;
                }
                ctx.service.log.info('税局请求异常, resData', resData);
                return resData;
            }
        } else {
            // 请求失效
            if (resData.status === 302 || resData.status === 301) {
                return errcodeInfo.govLogout;
            }

            if (isDownload) {
                return resData;
            }

            resData = resData.data;
            if (resData.Response && resData.Response.Error) {
                ctx.service.log.fullInfo('税局请求异常, requestOpt', tempRequestOpt);
                ctx.service.log.fullInfo('税局请求异常, resData', resData);
                const { Message = '税局请求异常, 请稍后再试', Code } = resData.Response.Error || {};
                if (Code === '204' || Code === '302') {
                    return errcodeInfo.govLogout;
                }
                return {
                    ...errcodeInfo.govErr,
                    description: Code ? Message + `[${Code}]` : Message
                };
            }

            if (opt.returnOrigin) {
                return {
                    ...errcodeInfo.success,
                    data: resData
                };
            }

            if (resData.Response && resData.Response.Data) {
                // 税局登录失效
                const { Address = '', CodeMsg = '' } = resData.Response.Data;
                if (CodeMsg === 'refresh' || Address.indexOf('请重新登录') !== -1 || Address.indexOf('nonlogin') !== -1 || CodeMsg === 'N') {
                    ctx.service.log.info('税局返回异常', resData.Response);
                    return errcodeInfo.govLogout;
                }
                return {
                    errcode: '0000',
                    data: resData.Response.Data,
                    description: 'success'
                };
            }
            // 禁止重试的直接返回
            if (opt.disabledRetry || retry > 2) {
                ctx.service.log.fullInfo('税局请求异常, requestOpt', tempRequestOpt);
                ctx.service.log.fullInfo('税局请求异常, resData', resData);
                return {
                    ...errcodeInfo.govErr,
                    data: resData
                };
            }
        }
        ctx.service.log.info('retry request', retry);
        const newRes: any = await this.commonRequest(url, opt, tokenInfo, requestType, retry + 1);
        return newRes;
    }

    async getNt(loginData: any = {}) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const pageId = loginData.pageId;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        if (!loginData.baseUrl) {
            return errcodeInfo.govLogout;
        }
        let nt = ntInfo ? ntInfo[pageId] : null;
        const baseUrl = loginData.baseUrl || '';
        const baseUrlArr = baseUrl.split('.');
        if (baseUrlArr.length < 2) {
            return errcodeInfo.govLogout;
        }
        const etaxName = baseUrlArr[1];
        if (!nt || !nt.nightmareWindow?.win) {
            const ntRes = await ctx.service.nt.openLoginedPage(loginData, etaxName);
            if (ntRes.errcode !== '0000') {
                return {
                    errcode: ntRes.errcode,
                    description: ntRes.description
                };
            }
            const newNtInfo = ctx.bsWindows.fpdkGovWin;
            nt = newNtInfo ? newNtInfo[pageId] : null;
        }
        if (!nt) {
            ctx.service.log.info('openInvoiceByChrome 电子税局登录失效');
            return errcodeInfo.govLogout;
        }
        if (nt.nightmareWindow?.win?.webContents) {
            const winPid = nt.nightmareWindow?.win?.webContents.getOSProcessId();
            ctx.service.log.info('nightmareWindow pid', winPid);
            // 新时代cookie可能已经变化
            if (queryInfo.isNewTimeTaxNo) {
                await nt.updateSessionCookies(loginData.loginedCookies, {
                    eUrl: loginData.eUrl,
                    baseUrl: loginData.baseUrl
                });
            }
        }
        return {
            ...errcodeInfo.success,
            data: nt
        };
    }

    // 更新请求成功后的cookie
    async updateCookies(nt: any, loginData: any, publicKeyInfo?: any) {
        const ctx = this.ctx;
        if (!nt) {
            return nt;
        }
        const { isNewTimeTaxNo } = ctx.request.query || {};
        if (isNewTimeTaxNo) {
            return errcodeInfo.success;
        }
        const ntUrl = nt.getUrl();
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            return;
        }
        const cookieRes = await nt.getCookies({});
        if (cookieRes.errcode === '0000') {
            const cookieAll = cookieRes.data;
            const newLoginData = {
                ...loginData,
                loginedCookies: cookieAll
            };
            if (publicKeyInfo) {
                ctx.service.log.info('update publicKeyInfo');
                newLoginData.publicKeyInfo = publicKeyInfo;
            }
            await ctx.service.etaxFpdkLogin.common.saveStorage(nt, newLoginData);
        }
    }

    async waitNtLock(pageId: string) {
        const ctx = this.ctx;
        const lockRes = await ctx.service.redisLock.query(ntLockPreKey + pageId);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }
        if (lockRes.data?.result === false) {
            return errcodeInfo.success;
        }
        await sleep(2000);
        const res : any = await this.waitNtLock(pageId);
        return res;
    }

    // 防止reload影响js执行，需要通过锁控制只有一个请求前拦截到异常通过reload恢复，其它等待reload结束
    async ntReload(nt: any, pageId: string) {
        const ctx = this.ctx;
        const { ignoreLock } = ctx.request.query || {};
        if (ignoreLock) {
            return errcodeInfo.success;
        }
        const lockRes = await ctx.service.redisLock.set(ntLockPreKey + pageId, (+new Date()), 40);
        ctx.service.log.info('ntReload lockRes', lockRes);
        // 获取锁异常
        if (lockRes.errcode !== '0000') { // 其它异常
            return errcodeInfo.lockRes;
        }
        if (lockRes.data?.result === false) {
            ctx.service.log.info('ntReload openLoinedChrome lockRes false', pageId);
            const res = await this.waitNtLock(pageId);
            if (res.errcode !== '0000') {
                return res;
            }
            // waitNtLock结束一般都是浏览器发生了保活，reload结束，所有可以直接返回
            return errcodeInfo.success;
        }

        try {
            await nt.reload();
            const reloadRes = await nt.wait(reloadCheck);
            ctx.service.log.info('重新刷新界面返回', reloadRes);
            if (reloadRes.errcode !== '0000') {
                await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                return {
                    ...reloadRes,
                    description: '税局调用异常, 请稍后再试'
                };
            }
            if (reloadRes.data?.logout) {
                await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                return errcodeInfo.govLogout;
            }
            const ntUrl = nt.getUrl();
            ctx.service.log.info('重新刷新后地址', ntUrl);
            if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
                await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                return errcodeInfo.govLogout;
            }
        } catch (error) {
            ctx.service.log.info('ntRelaod 异常', error.message);
        }
        await ctx.service.redisLock.delete(ntLockPreKey + pageId);
        return errcodeInfo.success;

    }

    // 执行请求前需要检测，登录锁，保活锁，已经获取nt后验证nt是否能正常执行js代码，不能执行通过reload尝试恢复
    async checkNtLock(pageId: string) {
        const ctx = this.ctx;
        const { ignoreLock, cityPageId } = ctx.request.query || {};
        ctx.service.log.info('checkNtLock ignoreLock', ignoreLock);
        if (ignoreLock) {
            return errcodeInfo.success;
        }
        // 不能自动登录的城市正在登录检测锁
        const loginLockRes = await ctx.service.redisLock.query(ntLockLoginPreKey + pageId);
        ctx.service.log.info('loginLockRes ntLockLoginPreKey', ntLockLoginPreKey + pageId, loginLockRes);
        if (loginLockRes.errcode !== '0000') {
            return loginLockRes;
        }

        if (loginLockRes.data?.result === true) {
            return errcodeInfo.govLoginIng;
        }

        // 保活中，或者登录失效状态检测中，或者能自动登录的城市正在登录
        const lockRes = await ctx.service.redisLock.query(ntLockPreKey + pageId);
        ctx.service.log.info('loginLockRes ntLockPreKey', lockRes);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }
        if (lockRes.data?.result === true) {
            await sleep(2000);
            const res = await this.waitNtLock(pageId);
            if (res.errcode !== '0000') {
                return res;
            }
        }
        return errcodeInfo.success;
    }

    async promiseTimeout(nt: any, p: any, opt: { timeout?: number } = {}) {
        const ctx = this.ctx;
        const timeout = opt?.timeout || 60000;
        let timeoutId: any = null;
        const startTime = (+new Date());
        // const { pageId } = ctx.request.query;
        const p1 = new Promise((resolve) => {
            const startNextCheck = () => {
                const duration = (+new Date()) - startTime;
                if (duration >= timeout) {
                    resolve(errcodeInfo.govTimeout);
                    return;
                }

                const leftTime = timeout - duration;
                const deltaTime = leftTime < 5000 ? leftTime : 5000;
                timeoutId = setTimeout(() => {
                    startNextCheck();
                }, deltaTime + 100);
            };
            startNextCheck();
        });

        let res;
        try {
            res = await Promise.race([p1, p]);
        } catch (error) {
            ctx.service.log.info('请求异常', error.message);
            res = errcodeInfo.govErr;
        }
        global.clearTimeout(timeoutId);
        return res;
    }

    async checkNtIsCrash(nt: any, retry = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const pageId = queryInfo.pageId;
        if (retry > 1) {
            return errcodeInfo.govErr;
        }
        const p: any = nt.evaluate(getbodyText);
        const checkRes : any = await this.promiseTimeout(nt, p, {
            timeout: 10000
        });
        ctx.service.log.info('checkNtIsCrash retry start', retry);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        if (checkRes.data?.length < 60) {
            if (retry > 0) {
                const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
                const curUrl = await nt.getUrl();
                if (loginData && loginData.dpptStorageUrl && /https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(curUrl)) {
                    const res = await ctx.helper.curl(loginData.dpptStorageUrl, {
                        method: 'GET',
                        dataType: 'json'
                    });
                    const localStorageData = res.localStorageData || '';
                    const sessionStorageData = res.sessionStorageData || '';
                    ctx.service.log.info('start setStorage----------');
                    await nt.evaluate(setStorage, {
                        localStorageData: localStorageData,
                        sessionStorageData: sessionStorageData
                    });
                    ctx.service.log.info('end setStorage----------');
                }
            }
            await this.ntReload(nt, pageId);
            const res = await nt.wait(checkNtIsOk, {
                waitTimeout: 20000
            });
            if (res.errcode !== '0000') {
                const res2: any = await this.checkNtIsCrash(nt, retry + 1);
                return res2;
            }
        }
        this.simulateClick(nt, pageId);
        return errcodeInfo.success;
    }

    async simulateClick(nt: any, pageId: string, opt: any = {}) {
        const ctx = this.ctx;
        const lockRes = await ctx.service.redisLock.set(simulateClickPreKey + pageId, (+new Date()), 15);
        if (lockRes.data?.result === true) {
            // 增加模拟点击
            await nt.evaluate(simulateClick, {
                minDot: opt.minDot || 1,
                maxDot: opt.maxDot || 2
                // selector: '.invoice-home__block.invoice-data.rdu2'
            }, true);
            await ctx.service.redisLock.delete(simulateClickPreKey + pageId);
        }
        return errcodeInfo.success;
    }

    async ntEncryDownload(loginData: any, urlPath: string, retry: number = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        // 上层连续请求时可能loginData已经变化，需要提取最新的缓存
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        if (this.isGrayCheck(loginData)) {
            const govRes = await ctx.service.tools.requestGov(loginData, urlPath, '', {
                method: 'GET'
            });
            return govRes;
        }
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        const pageId = loginData.pageId;
        const { decryedData } = ctx.request.body;
        const account = decryedData.account || decryedData.loginAccountUid;

        const errRetry = async(errRes: any, closeFlag?: boolean) => {
            if (queryInfo.isNewTimeTaxNo) {
                const loginRes = await ctx.service.newTime.checkIsLogout(account);
                // 新时代登录检测登录失效，直接返回
                if (loginRes.errcode === '91300') {
                    return errcodeInfo.govLogout;
                }
                if (loginRes.errcode !== '0000') {
                    return loginRes;
                }
                if (loginRes.errcode === '0000' && loginRes.data?.loginedCookies) {
                    loginData = loginRes.data;
                    if (errRes.errcode === '91300') {
                        closeFlag = true;
                    }
                }
            }

            // 任何异常，超过三次重试直接返回
            if (retry > 2) {
                ctx.service.log.info('税局请求异常，超过重试次数', retry, urlPath, errRes);
                return errRes;
            }

            if (errRes.errcode === '91300' || closeFlag) {
                const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                    closeFlag: typeof closeFlag === 'undefined' ? false : closeFlag
                });
                if (res2.errcode === '91300') {
                    ctx.service.log.info('税局请求异常，重新加载后登录失效', urlPath);
                    return errcodeInfo.govLogout;
                }
                // 登录再次检查仍然失效
                if (res2.errcode !== '0000') {
                    ctx.service.log.info('税局请求异常，重新加载异常', urlPath, res2);
                    return res2;
                }
                const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
                const res3: any = await this.ntEncryDownload(localLoginData, urlPath, 3); // 失效后重试一次
                return res3;
            }
            const retryRes: any = await this.ntEncryDownload(loginData, urlPath, retry + 1);
            return retryRes;
        };

        const lockRes = await this.checkNtLock(pageId);
        ctx.service.log.info('checkNtLock lockRes', lockRes);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        const ntRes = await ctx.service.nt.getNt(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        loginData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
        const nt = ntRes.data;
        const checkRes2 = await this.checkNtIsCrash(nt);
        ctx.service.log.info('checkNtIsCrash res', checkRes2);
        if (checkRes2.errcode !== '0000') {
            ctx.service.log.info('浏览器执行异常先关闭, checkNt res', checkRes2);
            if (queryInfo.isNewTimeTaxNo) {
                return await errRetry(errcodeInfo.govErr, true);
            }
            return await errRetry(errcodeInfo.govLogout, true);
        }

        const ntUrl = nt.getUrl();
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            return await errRetry(errcodeInfo.govLogout);
        }

        // 标记当前正在进行接口请求，浏览器保活识别到这个标志将不执行
        const runningUid = (+new Date()) + '_' + getUUId();
        const requestLockValue = pwyStore.get(ntLockRequestPreKey + pageId);
        if (!requestLockValue || (+new Date()) - parseInt(requestLockValue.split('_')[0]) > 120000) {
            pwyStore.set(ntLockRequestPreKey + pageId, runningUid, 120);
        }

        const p = nt.evaluate(evaluateDownload, {
            url: urlPath
        });

        const res : any = await this.promiseTimeout(nt, p, {
            timeout: 120000
        });

        const {
            status,
            disposition = '',
            contentType = '',
            base64 = ''
        } = res.data || {};

        // 税局请求超时直接返回
        if (res.errcode === errcodeInfo.govTimeout.errcode) {
            return res;
        }

        ctx.service.log.info('ntEncryDownload res', res.errcode, res.description, status, disposition, contentType);

        if (status === 504) {
            const retryRes = await errRetry({
                ...errcodeInfo.govErr,
                description: '税局请求超时，请稍后再试!'
            });
            return retryRes;
        }

        if (res.errcode === '91300' || status === 412 || contentType.indexOf('text/html') !== -1) {
            ctx.service.log.info('下载文件出现登录失效', retry);
            if (queryInfo.isNewTimeTaxNo) {
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }
            // 文件下载可能出现判断失效不准，重新刷新界面
            const reloadRes = await this.ntReload(nt, pageId);
            if (reloadRes.errcode !== '0000' && reloadRes.errcode !== '91300') {
                ctx.service.log.info('税局请求异常，重新刷新界面异常', reloadRes);
                return reloadRes;
            }
            if (reloadRes.errcode === '91300') {
                ctx.service.log.info('重新加载后登录失效');
                return await errRetry(errcodeInfo.govLogout);
            }

            if (retry > 1) {
                ctx.service.ntTools.screenshotAndUpload(nt);
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }
            const errRes = await errRetry(errcodeInfo.govErr);
            return errRes;
        }

        const requestLockValue2 = pwyStore.get(ntLockRequestPreKey + pageId);
        // 当前接口调用只清理自己产生的running
        if (runningUid === requestLockValue2) {
            pwyStore.delete(ntLockRequestPreKey + pageId);
        }

        await this.updateCookies(nt, loginData);
        // js文件加载异常，导致重要方法无法获取到，通过重新reload尝试重新加载
        if (res.errcode === '9301') {
            await this.ntReload(nt, pageId);
            return res;
        }

        if (res.errcode !== '0000') {
            if (!contentType && !disposition) {
                await this.ntReload(nt, pageId);
            }
            const retryRes = await errRetry({
                errcode: res.errcode,
                description: res.description
            });
            return retryRes;
        }

        const res2 = await ctx.service.tools.checkGovDownload({ status, contentType, data: base64 });
        if (res2.errcode !== '0000') {
            const retryRes = await errRetry(res2);
            return retryRes;
        }

        const base64Str = base64.replace(/^data:.*base64,/, '');
        return {
            ...errcodeInfo.success,
            data: base64Str
        };
    }

    async clearNtCookies(pageId: string) {
        const ctx = this.ctx;
        if (ctx.bsWindows && ctx.bsWindows.fpdkGovWin) {
            const nt = ctx.bsWindows.fpdkGovWin[pageId];
            if (nt) {
                await nt.clearAllCookies();
            }
        }
    }

    // 加密请求税局
    async ntEncryCurl(loginData: any, urlPath: string, paramJson: any, otherInfo: any = {}, retry: number = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        // 上层连续请求时可能loginData已经变化，需要提取最新的缓存
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        ctx.service.log.info('加密请求税局start', retry, !!otherInfo.disabledRetry, urlPath, loginData.getLzkqow);
        if (this.isGrayCheck(loginData)) {
            const startUid = getUUId();
            const govRes = await ctx.service.tools.requestGov(loginData, urlPath, paramJson, otherInfo);
            ctx.service.log.info('requestGov uid res', startUid, govRes);
            return govRes;
        }
        const { decryedData } = ctx.request.body;
        const account = decryedData.account || decryedData.loginAccountUid;
        const pageId = loginData.pageId;
        const errRetry = async(errRes: any, allowRetry?: boolean, closeFlag?: boolean) => {
            ctx.service.log.info('ntEncryCurl retry', retry, queryInfo.disabledRetry, otherInfo.disabledRetry);
            // 新时代登录请求异常，需要重新查询新状态重试
            if (queryInfo.isNewTimeTaxNo) {
                const loginRes = await ctx.service.newTime.checkIsLogout(account);
                // 新时代登录检测登录失效，直接返回
                if (loginRes.errcode === '91300') {
                    return errcodeInfo.govLogout;
                }
                if (loginRes.errcode !== '0000') {
                    return loginRes;
                }

                if (loginRes.errcode === '0000' && loginRes.data?.loginedCookies) {
                    loginData = loginRes.data;
                    if (errRes.errcode === '91300') {
                        closeFlag = true;
                    }
                }
            }

            // 税局返回异常状态key，直接重试
            if (allowRetry) {
                if (retry > 5) {
                    return errRes;
                }
                if (retry > 3) {
                    ctx.service.log.info('请求出现异常，需要重新打开界面');
                    const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                        closeFlag: true
                    });
                    if (res2.errcode === '91300') {
                        ctx.service.log.info('税局请求异常，重新加载后登录失效', urlPath);
                        return errcodeInfo.govLogout;
                    }
                    // 登录再次检查仍然失效
                    if (res2.errcode !== '0000') {
                        ctx.service.log.info('税局请求异常，重新加载后请求异常', retry, urlPath, res2);
                        return res2;
                    }
                }
                const retryRes : any = await this.ntEncryCurl(loginData, urlPath, paramJson, otherInfo, retry + 1);
                return retryRes;
            }

            // 超过正常重试次数
            if (retry > 2) {
                ctx.service.log.info('税局请求异常, 超过重试次数', retry, urlPath, errRes);
                return errRes;
            }

            if (errRes.errcode === '91300' || closeFlag) {
                ctx.service.log.info('请求出现异常，需要重新打开界面', closeFlag);
                const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                    closeFlag: typeof closeFlag === 'undefined' ? false : closeFlag
                });
                if (res2.errcode === '91300') {
                    ctx.service.log.info('税局请求异常，重新加载后登录失效', urlPath);
                    return errcodeInfo.govLogout;
                }
                // 登录再次检查仍然失效
                if (res2.errcode !== '0000') {
                    ctx.service.log.info('税局请求异常，重新加载后请求异常', retry, urlPath, res2);
                    return res2;
                }
                const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
                const res3: any = await this.ntEncryCurl(localLoginData, urlPath, paramJson, otherInfo, 10); // 失效重试一次
                ctx.service.log.info('重新加载后再次请求税局', retry, urlPath, res3);
                return res3;
            }

            // ctx.request.query里面的参数主要用于失效检测时接口调用不需要重试
            if (queryInfo.disabledRetry) {
                ctx.service.log.info('税局请求异常，地址栏要求不允许重试', urlPath, errRes);
                return errRes;
            }

            // 非登录失效进入直接重试流程
            if (otherInfo.disabledRetry) {
                ctx.service.log.info('税局请求异常，接口不允许重试', urlPath, errRes);
                return errRes;
            }
            const retryRes: any = await this.ntEncryCurl(loginData, urlPath, paramJson, otherInfo, retry + 1);
            return retryRes;
        };

        const lockRes = await this.checkNtLock(pageId);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        const ntRes = await ctx.service.nt.getNt(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        loginData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
        const nt = ntRes.data;
        const checkRes2 = await this.checkNtIsCrash(nt);
        if (checkRes2.errcode !== '0000') {
            ctx.service.log.info('浏览器执行异常先关闭, checkNt res', checkRes2);
            if (queryInfo.isNewTimeTaxNo) {
                return await errRetry({
                    ...errcodeInfo.govErr,
                    description: '税局异常，请稍后再试!' // 这个文字描述不会导致锁定
                }, false, true);
            }
            return await errRetry(errcodeInfo.govLogout, false, true);
        }

        const ntUrl = nt.getUrl();
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            ctx.service.log.info('调用前出现登录失效', ntUrl);
            ctx.service.ntTools.screenshotAndUpload(nt);
            return await errRetry(errcodeInfo.govLogout);
        }

        const useCommonRequest = true;

        const requestId = getUUId();
        const runningUid = (+new Date()) + '_' + requestId;
        const requestLockValue = pwyStore.get(ntLockRequestPreKey + pageId);
        if (!requestLockValue || (+new Date()) - parseInt(requestLockValue.split('_')[0]) > 60000) {
            pwyStore.set(ntLockRequestPreKey + pageId, runningUid, 60);
        }

        ctx.service.log.info('税局请求地址及参数', urlPath, paramJson);
        const p = nt.evaluate(evaluateJs, {
            funcName: 'queryFpjcxx',
            url: urlPath,
            data: paramJson,
            method: otherInfo.method,
            useCommonRequest,
            disableEncry: !!otherInfo.disableEncry,
            id: requestId
        });
        const res : any = await this.promiseTimeout(nt, p, {
            timeout: otherInfo.timeout || 60000
        });

        // 当前接口调用只清理自己产生的running
        const requestLockValue2 = pwyStore.get(ntLockRequestPreKey + pageId);
        if (runningUid === requestLockValue2) {
            pwyStore.delete(ntLockRequestPreKey + pageId);
        }

        ctx.service.log.info('ntEncryCurl返回', urlPath, requestId, res);

        // 税局请求超时直接返回
        if (res.errcode === errcodeInfo.govTimeout.errcode) {
            return res;
        }

        // 登录失效，或者税局返回refresh状态，重新刷新
        if (res.errcode === '91300' || res.data?.CodeMsg === 'refresh' || res.data?.codeMsg === 'refresh') {
            ctx.service.log.info('接口调用出现登录失效', retry);
            if (queryInfo.isNewTimeTaxNo) {
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }
            const reloadRes = await this.ntReload(nt, pageId);
            if (reloadRes.errcode !== '0000' && reloadRes.errcode !== '91300') {
                ctx.service.log.info('税局请求异常，重新刷新界面异常', reloadRes);
                return reloadRes;
            }
            if (reloadRes.errcode === '91300') {
                ctx.service.log.info('重新加载后登录失效');
                return await errRetry(errcodeInfo.govLogout);
            }

            if (retry > 1) {
                ctx.service.ntTools.screenshotAndUpload(nt);
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }
            const errRes = await errRetry(errcodeInfo.govErr);
            return errRes;
        }


        const resDescription = res.description || '';
        // 文件比较旧reload重新加载直接返回
        if (res.errcode === '9301' || resDescription.indexOf('请重新进入开具页面') !== -1) {
            ctx.service.log.info('reload页面------------', pageId);
            await this.ntReload(nt, pageId);
            await this.updateCookies(nt, loginData);
            return res;
        }

        await this.updateCookies(nt, loginData);
        // 非失效状态的异常，直接尝试重新调用
        if (res.errcode !== '0000') {
            ctx.service.log.info('接口调用普通异常，直接重试');
            const errRes = await errRetry(res);
            return errRes;
        }

        const resData = res.data;
        if (!resData) {
            const errRes = await errRetry(errcodeInfo.govErr);
            return errRes;
        }
        if (typeof resData === 'string') {
            if (resData.indexOf('Timeout: timeout') !== -1) {
                return {
                    ...errcodeInfo.govTimeout,
                    description: '税局执行超时，请稍后再试!'
                };
            } else if (resData.length > 5000) {
                await this.simulateClick(nt, pageId, { minDot: 3, maxDot: 4 });
                const errRes = await errRetry({
                    ...errcodeInfo.govErr,
                    description: '税局异常，请稍后再试!'
                }, true, true);
                return errRes;
            }
        }
        const newData: any = formatData(resData, 2);
        if (resData.code) {
            newData.code = resData.code;
        }
        if (resData.message) {
            newData.message = resData.message;
        }

        res.data = newData;
        const resultResData = res.data || {};
        const Address = resultResData.Address || resultResData.address || '';
        const CodeMsg = resultResData.CodeMsg || resultResData.codeMsg || '';

        // 税局返回重新登录
        if (Address.indexOf('请重新登录') !== -1 || Address.indexOf('nonlogin') !== -1 || CodeMsg === 'N') {
            ctx.service.log.info('接口调用税局提示重新登录');
            const errRes = await errRetry(errcodeInfo.govLogout);
            return errRes;
        }
        // 出现这种错误码允许重试
        if (resultResData.Code === 0 && resultResData.Y === false && resultResData.T) {
            await sleep(2000);
            await this.simulateClick(nt, pageId, { minDot: 3, maxDot: 4 });
            const errRes = await errRetry({
                ...errcodeInfo.govErr,
                description: '税局异常，请稍后再试!'
            }, true);
            return errRes;
        }
        return res;
    }

    async openLoginedPage(loginData: any, etaxName?: string) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[pageId] : null;
        const ntRes = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData);
        if (ntRes.errcode === '0000') {
            // 身份一致，则不需要重新登录
            return {
                ...errcodeInfo.success,
                data: {
                    taxNo: loginData.taxNo,
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
        ctx.service.log.info('openLoginedPage res', ntRes.errcode, ntRes.description);
        return ntRes;
    }

    // 通过浏览器实现开票逻辑
    async openInvoiceByChrome(loginData: any, url = '', opt : any = {}) {
        const ctx = this.ctx;
        const { pageId, taxNo } = ctx.request.query || {};
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[pageId] : null;
        const baseUrl = loginData.baseUrl || '';
        const baseUrlArr = baseUrl.split('.');
        if (baseUrlArr.length < 2) {
            return errcodeInfo.govLogout;
        }
        const etaxName = baseUrlArr[1];
        ctx.service.log.info('openInvoiceByChrome etaxName', etaxName, pageId, taxNo);
        if (!nt || !nt.nightmareWindow?.win) {
            const ntRes = await this.openLoginedPage(loginData, etaxName);
            ctx.service.log.info('openInvoiceByChrome ntRes', ntRes);
            if (ntRes.errcode !== '0000') {
                return errcodeInfo.govLogout;
            }
            const newNtInfo = ctx.bsWindows.fpdkGovWin;
            nt = newNtInfo ? newNtInfo[pageId] : null;
        }
        const newData = formatData(opt.body);
        if (!nt) {
            ctx.service.log.info('openInvoiceByChrome 电子税局登录失效');
            return errcodeInfo.govLogout;
        }
        nt.updateAliveTime();
        const res = await nt.evaluate(openRequestHelper, {
            data: newData
        });
        ctx.service.log.fullInfo('开票请求返回', res);
        if (res?.errcode === errcodeInfo.govLogout.errcode) {
            return res;
        }
        // 防止cookie失效，重新获取最新的并更新到缓存
        const curUrl = nt.getUrl();
        const cookieRes = await nt.getCookies({});
        if (cookieRes.errcode === '0000') {
            const newLoginData = {
                ...loginData,
                loginedCookies: cookieRes.data
            };
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, newLoginData);
            await pwyStore.set(etaxLoginedCachePreKey + pageId, newLoginData);
        }
        const { fphm, kprq, message = '' } = res || {};
        if (fphm && kprq) {
            return {
                errcode: '0000',
                data: {
                    Fphm: fphm,
                    Kprq: kprq
                }
            };
        }
        // 实名认证后需要重新登录才能开票
        if (message.indexOf('请重新登录') !== -1) {
            return errcodeInfo.govLogout;
        }
        return {
            errcode: '95000',
            description: message || '税局请求异常，请稍后再试'
        };
    }

    async ntDownload(id: string, url: string, opt: any = {}) {
        const ctx = this.ctx;
        const tokenInfo = await pwyStore.get(etaxLoginedCachePreKey + id);
        if (!tokenInfo || !tokenInfo.baseUrl) {
            return errcodeInfo.govLogout;
        }
        let filePath = opt.filePath;
        if (!filePath && opt.fileName) {
            filePath = path.join(opt.saveDirPath, opt.fileName);
        }
        let res1 = {
            errcode: '0000',
            data: ''
        };
        if (opt.isFetchDownload) {
            res1 = await this.ntFetchDownload(tokenInfo, url);
        } else {
            res1 = await this.ntEncryDownload(tokenInfo, url);
        }
        if (res1.errcode === '0000') {
            mkdirsSync(opt.saveDirPath);
            // 通过接口请求直接拿到buffer
            if (this.isGrayCheck(tokenInfo)) {
                fs.writeFileSync(filePath, res1.data);
            } else {
                fs.writeFileSync(filePath, res1.data, 'binary');
            }
            ctx.service.log.info('ntDownload filePath', filePath);
            return {
                ...errcodeInfo.success,
                data: {
                    filePath
                }
            };
        }
        return res1;
    }

    // 灰度的税号
    isGrayCheck(loginData: any = {}) {
        const taxNo = loginData.taxNo || '';
        const listTaxNos = [
            '914419007510962180111'
            // '914419007510962180', // guangdong
            // '91440300MA5G9GK78Y' // shenzhen
        ];

        const hosts = loginData.baseUrl.split('.');
        const cityName: string = hosts[1];
        // const allowCitys = ['shenzhen'];
        const allowCitys : any = [];
        // 青岛地址栏加密方式不一样，不能走http加密版本，目前验证实名认证接口二维码获取异常
        const notAllowCitys = ['qingdao'];
        if (notAllowCitys.includes(cityName)) {
            return false;
        }

        if (allowCitys.includes(cityName)) {
            return true;
        }

        if (taxNo && listTaxNos.includes(taxNo)) {
            return true;
        }
        return false;
    }

    async ntFetchDownload(loginData: any, urlPath: string, retry: number = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        const { decryedData } = ctx.request.body;
        const account = decryedData.account || decryedData.loginAccountUid;
        // 上层连续请求时可能loginData已经变化，需要提取最新的缓存
        loginData = await pwyStore.get(etaxLoginedCachePreKey + loginData.pageId);
        if (!loginData || !loginData.pageId) {
            return errcodeInfo.govLogout;
        }
        ctx.service.log.info('loginData.getLzkqow', loginData.getLzkqow);
        if (this.isGrayCheck(loginData)) {
            const govRes = await ctx.service.tools.requestGov(loginData, urlPath, '', {
                method: 'GET'
            });
            return govRes;
        }
        const pageId = loginData.pageId;
        const errRetry = async(errRes: any, closeFlag?: boolean) => {
            // 新时代登录，登录状态重新判断
            if (queryInfo.isNewTimeTaxNo) {
                const loginRes = await ctx.service.newTime.checkIsLogout(account);
                // 新时代登录检测登录失效，直接返回
                if (loginRes.errcode === '91300') {
                    return errcodeInfo.govLogout;
                }
                if (loginRes.errcode !== '0000') {
                    return loginRes;
                }
                if (loginRes.errcode === '0000' && loginRes.data?.loginedCookies) {
                    loginData = loginRes.data;
                    if (errRes.errcode === '91300') {
                        closeFlag = true;
                    }
                }
            }

            // 任何异常，超过三次重试直接返回
            if (retry > 2) {
                ctx.service.log.info('税局请求异常, 超过重试次数', retry, urlPath, errRes);
                return errRes;
            }

            if (errRes.errcode === '91300' || closeFlag) {
                const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                    closeFlag: typeof closeFlag === 'undefined' ? false : closeFlag
                });
                if (res2.errcode === '91300') {
                    ctx.service.log.info('税局请求异常, 重新加载登录失效', urlPath);
                    return errcodeInfo.govLogout;
                }
                // 登录再次检查仍然失效
                if (res2.errcode !== '0000') {
                    ctx.service.log.info('税局请求异常, 重新加载异常', urlPath, res2);
                    return res2;
                }
                const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
                const res3: any = await this.ntFetchDownload(localLoginData, urlPath, 3); // 失效后重试一次
                ctx.service.log.info('retry ntFetchDownload', retry, urlPath);
                return res3;
            }

            // 非登录失效进入直接重试流程
            const retryRes: any = await this.ntFetchDownload(loginData, urlPath, retry + 1);
            return retryRes;
        };

        const lockRes = await this.checkNtLock(pageId);
        ctx.service.log.info('checkNtLock res', lockRes);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        const ntRes = await ctx.service.nt.getNt(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        // getNt后登录状态可能发生变化，需要获取最新的
        loginData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
        const nt = ntRes.data;
        const checkRes2 = await this.checkNtIsCrash(nt);
        ctx.service.log.info('checkNtIsCrash res', checkRes2);
        if (checkRes2.errcode !== '0000') {
            ctx.service.log.info('浏览器执行异常先关闭, checkNt res', checkRes2);
            if (queryInfo.isNewTimeTaxNo) {
                return await errRetry(errcodeInfo.govErr, true);
            }
            return await errRetry(errcodeInfo.govLogout, true);
        }

        const ntUrl = nt.getUrl();
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            return await errRetry(errcodeInfo.govLogout);
        }

        // 标记当前正在进行接口请求，浏览器保活识别到这个标志将不执行
        const runningUid = (+new Date()) + '_' + getUUId();
        const requestLockValue = pwyStore.get(ntLockRequestPreKey + pageId);
        if (!requestLockValue || (+new Date()) - parseInt(requestLockValue.split('_')[0]) > 120000) {
            pwyStore.set(ntLockRequestPreKey + pageId, runningUid, 120);
        }
        ctx.service.log.info('start download---------');
        const p = nt.evaluate(evaluateFetchDownload, {
            url: urlPath
        });

        const res : any = await this.promiseTimeout(nt, p, {
            timeout: 120000
        });

        const requestLockValue2 = pwyStore.get(ntLockRequestPreKey + pageId);
        // 当前接口调用只清理自己产生的running
        if (runningUid === requestLockValue2) {
            pwyStore.delete(ntLockRequestPreKey + pageId);
        }

        // 税局请求超时直接返回
        if (res.errcode === errcodeInfo.govTimeout.errcode) {
            return res;
        }

        const {
            status,
            disposition = '',
            contentType = '',
            base64 = ''
        } = res.data || {};
        ctx.service.log.info('ntFetchDownload res', res.errcode, res.description, status, disposition, contentType);
        if (status === 504) {
            const retryRes = await errRetry({
                ...errcodeInfo.govErr,
                description: '税局请求超时，请稍后再试'
            });
            return retryRes;
        }
        if (res.errcode === '91300' || status === 412 || contentType.indexOf('text/html') !== -1) {
            ctx.service.log.info('ntFetchDownload下载文件出现登录失效', retry);
            if (queryInfo.isNewTimeTaxNo) {
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }
            // 文件下载可能出现判断失效不准备，重新刷新界面
            const reloadRes = await this.ntReload(nt, pageId);
            if (reloadRes.errcode !== '0000' && reloadRes.errcode !== '91300') {
                ctx.service.log.info('税局请求异常，重新刷新界面异常', reloadRes);
                return reloadRes;
            }

            if (reloadRes.errcode === '91300') {
                ctx.service.log.info('重新加载后登录失效');
                return await errRetry(errcodeInfo.govLogout);
            }
            if (retry > 1) {
                ctx.service.ntTools.screenshotAndUpload(nt);
                const errRes = await errRetry(errcodeInfo.govLogout);
                return errRes;
            }
            const errRes = await errRetry(errcodeInfo.govErr);
            return errRes;
        }

        await this.updateCookies(nt, loginData);

        // js文件加载异常，导致重要方法无法获取到，通过重新reload尝试重新加载
        if (res.errcode === '9301') {
            await this.ntReload(nt, pageId);
            return res;
        }

        if (res.errcode !== '0000') {
            if (!contentType && !disposition) {
                await this.ntReload(nt, pageId);
            }
            const retryRes = await errRetry({
                errcode: res.errcode,
                description: res.description
            });
            return retryRes;
        }

        const res2 = await ctx.service.tools.checkGovDownload({ status, contentType, data: base64 });
        ctx.service.log.info('ntFetchDownload res2', res2);
        if (res2.errcode !== '0000') {
            const retryRes = await errRetry(res2);
            return retryRes;
        }

        const base64Str = base64.replace(/^data:.*base64,/, '');
        return {
            ...errcodeInfo.success,
            data: base64Str
        };
    }

    async ntCurl(id: string, url: string, opt: any = {}, disableEncry?: boolean) {
        const ctx = this.ctx;
        const tokenInfo = await pwyStore.get(etaxLoginedCachePreKey + id);
        if (!tokenInfo || !tokenInfo.baseUrl) {
            return errcodeInfo.govLogout;
        }
        const data = opt.body || opt.data;
        const method = opt.method;
        const res1 = await this.ntEncryCurl(tokenInfo, url, data, {
            method: method || 'get',
            disableEncry,
            disableRetry: opt.disableRetry,
            dataType: opt.dataType || ''
        });
        return res1;
    }

    async ntImportExcel(id: string, url: string, opt: any = {}, retry: number = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        let loginData = await pwyStore.get(etaxLoginedCachePreKey + id);
        const data = opt.list;
        const cols = opt.cols;
        const field = opt.field || 'file';
        const lockRes = await this.checkNtLock(id);
        ctx.service.log.info('checkNtLock res', lockRes);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        const ntRes = await ctx.service.nt.getNt(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }

        const { decryedData } = ctx.request.body;
        const account = decryedData.account || decryedData.loginAccountUid;
        const errRetry = async(errRes: any, closeFlag?: boolean) => {
            if (queryInfo.isNewTimeTaxNo) {
                const loginRes = await ctx.service.newTime.checkIsLogout(account);
                // 新时代登录检测登录失效，直接返回
                if (loginRes.errcode === '91300') {
                    return errcodeInfo.govLogout;
                }

                if (loginRes.errcode !== '0000') {
                    return loginRes;
                }

                if (loginRes.errcode === '0000' && loginRes.data?.loginedCookies) {
                    loginData = loginRes.data;
                    if (errRes.errcode === '91300') {
                        closeFlag = true;
                    }
                }
            }
            if (retry > 2) {
                ctx.service.log.info('税局请求异常, 超过重试次数', errRes);
                return errRes;
            }
            if (errRes.errcode === '91300' || closeFlag) {
                const res2 = await ctx.service.etaxFpdkLogin.common.openLoinedChrome(nt, loginData, 1, {
                    closeFlag: typeof closeFlag === 'undefined' ? false : closeFlag
                });
                if (res2.errcode === '91300') {
                    ctx.service.log.info('税局请求异常, 重新加载登录失效', url);
                    return errcodeInfo.govLogout;
                }
                // 登录再次检查仍然失效
                if (res2.errcode !== '0000') {
                    ctx.service.log.info('税局请求异常, 重新加载异常', url, res2);
                    return res2;
                }
                const res3: any = await this.ntImportExcel(id, url, opt, retry + 1); // 失效后重试一次
                return res3;
            }
            ctx.service.log.info('税局请求异常', url, errRes);
            return errRes;

        };

        const nt = ntRes.data;
        const ntUrl = nt.getUrl();
        if (!/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(ntUrl)) {
            return await errRetry(errcodeInfo.govLogout);
        }

        loginData = await pwyStore.get(etaxLoginedCachePreKey + id);
        const res = await nt.evaluate(dkgxByImport, {
            field,
            path: url,
            list: data,
            cols,
            fileName: opt.fileName
        });
        if (res.errcode === '91300') {
            return await errRetry(errcodeInfo.govLogout);
        }
        /*
        const sheet1 = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        if (cols) {
            sheet1['!cols'] = cols;
        }
        xlsx.utils.book_append_sheet(wb, sheet1, 'sheet1');
        const wopts = {
            bookType: 'xlsx',
            bookSST: false,
            type: 'buffer'
        };

        const gxBf = xlsx.write(wb, wopts);
        const fileDir = path.join(ctx.app.config.govDownloadZipDir, taxNo, 'gxBill');
        if (!fs.existsSync(fileDir)) {
            mkdirsSync(fileDir);
        }
        const filePath = path.join(fileDir, getUUId() + '.xlsx');
        fs.writeFileSync(filePath, gxBf);
        ctx.service.log.info('filePath', filePath);

        const res = await this.commonRequest(url, {
            method: 'POST',
            files: { [field]: filePath },
            dataType: 'json'
        }, tokenInfo, 'import');
        // fs.unlinkSync(filePath);
        */
        ctx.service.log.info('导入勾选返回', res);
        return res;
    }

    async ntWriteJson(id: string, filePath: string, opt: any = {}) {
        // const ctx = this.ctx;
        const tokenInfo = await pwyStore.get(etaxLoginedCachePreKey + id);
        if (!tokenInfo || !tokenInfo.baseUrl) {
            return errcodeInfo.govLogout;
        }
        const dataJson = JSON.stringify(opt.data);
        mkdirsSync(opt.saveDirPath);
        fs.writeFileSync(filePath, dataJson);
        return {
            ...errcodeInfo.success,
            data: { filePath }
        };
    }
}

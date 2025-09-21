/* eslint-disable complexity */
import { sleep } from '$utils/tools';
import * as commonLogins from '../govLoginLibs/common';
import { ntLockPreKey } from '../constant';

export class CommonService extends BaseService {
    createLoginData(loginData: any = {}) {
        const ctx = this.ctx;
        const { taxNo } = ctx.request.query;
        return {
            taxNo,
            taxPeriod: loginData.taxPeriod || '',
            skssq: loginData.skssq || '',
            gxrqfw: loginData.gxrqfw || '',
            gxczjzrq: loginData.gxczjzrq || '',
            companyType: loginData.companyType,
            companyName: loginData.companyName,
            homeUrl: loginData.eUrl,
            etaxAccountType: loginData.etaxAccountType
        };
    }

    async afterLoginSuccess(pageId: string) {
        const ctx = this.ctx;
        const { decryedData } = ctx.request.body;
        const loginAccountUid = decryedData.account || decryedData.loginAccountUid;
        const { taxNo, tenantNo } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId) || {};
        await ctx.service.fpyQueryInvoices.uploadAccountInfo(1);

        if (decryedData.city && loginData?.baseUrl) {
            const autoLoginCitys = [
                'guangdong',
                'tianjin',
                'zhejiang',
                'hubei'
            ];
            const etaxName = pageId.split('-')[1];
            const opt = {
                city: decryedData.city,
                etaxName,
                autoLogin: autoLoginCitys.includes(etaxName),
                taxNo,
                companyName: loginData.companyName || '',
                loginAccountUid,
                tenantNo,
                etaxAccount: decryedData,
                etaxAccountType: loginData.etaxAccountType || 3
            };
            const updateRes = await ctx.service.etaxLogin.updateOrCreateEtaxAccount(opt);
            if (updateRes.errcode !== '0000') {
                return updateRes;
            }
        }

        // 通知长链接轮询登录成功
        ctx.eventEmitter.emit(taxNo + '-' + loginAccountUid + '-etax-login-success', {
            errcode: '0000',
            description: 'success',
            data: loginData
        });
    }

    // 登录时检查当前是否登录有效
    async commonPreCheck(opt : any = {}) {
        const ctx = this.ctx;
        const { pageId, taxNo: requsetTaxNo } = ctx.request.query;
        const url = ctx.request.url || '';
        const { taxNo, keepAliveType } = opt;
        if (requsetTaxNo !== taxNo) {
            return {
                errcode: '0001',
                description: '当前企业信息与税局账号不一致'
            };
        }
        // 获取服务端登录状态
        const loginDataRes = await ctx.service.ntTools.queryRemoteLoginStatus(pageId);
        if (loginDataRes.errcode !== '0000') {
            return loginDataRes;
        }
        const loginData = loginDataRes.data;
        // cookie信息为空
        if (!loginData || !loginData.loginedCookies || !loginData.pageId) {
            return {
                ...errcodeInfo.success,
                data: false
            };
        }
        const roleText = opt.roleText || '开票员';
        const isKeepAliveUrl = (url.indexOf('/fpdk/etax/login/keepAlive') !== -1);
        if (roleText !== (loginData.roleText || '开票员') && !isKeepAliveUrl) {
            ctx.service.log.info('当前登录角色', roleText, opt);
            ctx.service.log.info('角色loginData', loginData.roleText);
            return {
                ...errcodeInfo.success,
                data: false
            };
        }

        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[pageId] : null;
        const newLoginData = { ...loginData };

        // 进入首页点登录按钮进行保活,
        // keepAliveType: 1通过单点登录重新保活，2通过进入首页重新激活登录状态，其它状态按照正常流程；1，2主要用于指定测试某种保活策略是否功能正常
        // 正常流程：如果nt对象存在，先验证接口是否正常，如果正常直接返回，如果返回失效，先尝试进入单点登录进行保活，如果单点登录保活失效，再尝试首页进入保活
        if (nt && nt.nightmareWindow?.win && keepAliveType !== 2 && keepAliveType !== 1) {
            const checkRes = await ctx.service.etaxFpdkLogin.common.checkLogin(newLoginData);
            ctx.service.log.info('common checkRes', checkRes);
            if (checkRes.errcode !== '91300') {
                return {
                    ...errcodeInfo.success,
                    data: this.createLoginData(loginData)
                };
            }
        }

        let ntRes;
        try {
            ntRes = await this.openLoinedChrome(nt, loginData, keepAliveType);
            ctx.service.log.info('common openLoinedChrome', ntRes.errcode, ntRes.description);
            if (ntRes.errcode === '91300') {
                ctx.service.log.info('打开窗体失效', ntRes);
                return {
                    ...errcodeInfo.success,
                    data: false
                };
            }
            // 打开窗体失败
            if (ntRes.errcode !== '0000') {
                ctx.service.log.info('打开窗体失败', ntRes);
                return ntRes;
            }
            return {
                ...errcodeInfo.success,
                data: this.createLoginData(loginData)
            };
        } catch (error) {
            ctx.service.log.info('打开窗体异常', error.message, error);
            return {
                ...errcodeInfo.success,
                data: false
            };
        }
    }

    // 防止多个请求同时打开浏览器
    async loopQueryStatus(pageId: string, startTime = (+new Date())) {
        const ctx = this.ctx;
        if ((+new Date()) - startTime > 60 * 1000) {
            return errcodeInfo.govTimeout;
        }

        await sleep(3000);
        const lockRes = await ctx.service.redisLock.query(ntLockPreKey + pageId);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        // 登录成功, 且当前锁定释放
        if (lockRes.data?.result === false) {
            if (localLoginData?.loginedCookies && localLoginData?.loginedCookies.length > 0) {
                const ntInfo = ctx.bsWindows.fpdkGovWin;
                const nt = ntInfo ? ntInfo[pageId] : null;
                if (nt && nt.nightmareWindow?.win) {
                    return {
                        ...errcodeInfo.success,
                        data: localLoginData
                    };
                }
            }
            return {
                ...errcodeInfo.govTimeout,
                description: '税局处理超时，请稍后再试!'
            };
        }
        const res : any = await this.loopQueryStatus(pageId, startTime);
        return res;
    }

    // 将浏览器的localStorage保存到云端
    async saveStorage(nt: any, loginData: any = {}, storageType: string = 'dppt') {
        const ctx = this.ctx;
        const { isNewTimeTaxNo } = ctx.request.query || {};
        const pageId = loginData.pageId || '';
        if (!pageId || isNewTimeTaxNo) {
            return errcodeInfo.success;
        }
        const storageRes = await nt.evaluate(commonLogins.getStorage, {
            storageType
        });
        if (storageRes.errcode !== '0000') {
            ctx.service.log.info('storageRes 异常', storageRes);
            await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
            const res = await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
            return res;
        }
        const cacheStr = JSON.stringify(storageRes.data);
        const cacheHash = hex_md5(cacheStr);
        if (loginData.dpptStorageHash === cacheHash) {
            const loginDataHash = hex_md5(JSON.stringify(loginData));
            if (loginData.loginDataHash === loginDataHash) {
                ctx.service.log.info('登录信息无变化不需要更新');
                return errcodeInfo.success;
            }
            loginData.loginDataHash = loginDataHash;
            await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
            const res = await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
            ctx.service.log.info('storage缓存无变化不需要更新');
            return res;
        }

        const saveRes = await ctx.service.invoiceCache.saveLongMsgInvoices({}, cacheStr, {
            disableEncryUrl: true,
            disableS3: true,
            cacheTime: 4 * 60
        });
        if (saveRes.errcode === '0000') {
            if (storageType === 'dppt') {
                loginData.dpptStorageUrl = saveRes.data;
                loginData.dpptStorageHash = cacheHash;
            } else if (storageType === 'tpass') {
                loginData.tpassStorageUrl = saveRes.data;
                loginData.tpassStorageHash = cacheHash;
            }
            const loginDataHash = hex_md5(JSON.stringify(loginData));
            loginData.loginDataHash = loginDataHash;
        }
        await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
        const res = await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
        return res;
    }
    // 打开登录后的弹框, spLogin控制如果已经存在窗体，但接口调用失效尝试单点登录
    // spLogin 1、单点登录进行保活，2、进入首页点登录按钮进行保活
    async openLoinedChrome(nt: any, loginData: any = {}, spLogin?: number, otherOpt?: { redirectUrl?: string, closeFlag?: boolean }) {
        const ctx = this.ctx;
        const { cityPageId, isNewTimeTaxNo, operationType = '1' } = ctx.request.query;
        const pageId = loginData.pageId;
        const { baseUrl, etaxAccountType, loginedCookies } = loginData;
        ctx.service.log.info('openLoinedChrome start', etaxAccountType);
        if (!loginedCookies) {
            return errcodeInfo.govLogout;
        }

        const lockRes = await ctx.service.redisLock.set(ntLockPreKey + pageId, (+new Date()), 30);
        ctx.service.log.info('openLoinedChrome lockRes', lockRes, cityPageId);
        // 获取锁异常
        if (lockRes.errcode !== '0000') { // 其它异常
            return lockRes;
        }

        // redis锁已经存在，设置失败
        if (lockRes.data?.result === false) {
            ctx.service.log.info('openLoinedChrome lockRes false', pageId);
            return await this.loopQueryStatus(pageId);
        }
        ctx.request.query.ignoreLock = true;
        ctx.request.query.disabledRetry = true;

        let gotoUrl = '';
        if (otherOpt?.redirectUrl) {
            gotoUrl = otherOpt?.redirectUrl;
        }
        if (otherOpt?.closeFlag) {
            if (isNewTimeTaxNo) {
                await nt.clearAllCookies();
            }
            nt.close();
            nt = null;
        }
        // spLogin为3是直接通过首页重新点击登录按钮保活，主要用于直接验证首页登录保活
        if (spLogin !== 2) {
            if (!gotoUrl) {
                // 有开票
                if ((etaxAccountType === 3 || etaxAccountType === 1) && operationType === '1') {
                    gotoUrl = `${baseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
                } else {
                    gotoUrl = `${baseUrl}/szzhzz/spHandler?cdlj=/digital-tax-account&ruuid=` + (+new Date());
                }
            }

            ctx.service.log.info('openLoinedChrome goto', loginData.etaxBackendUrl, gotoUrl);
            // 浏览器对象不存在，通过已经存在的cookie打开
            if (!nt || !nt.nightmareWindow?.win) {
                ctx.service.log.info('getEtaxPage url', gotoUrl);
                const ntRes = await ctx.service.ntTools.getEtaxPage(gotoUrl, {
                    id: cityPageId,
                    partition: 'persist:' + cityPageId,
                    ignoreGotoError: true
                    // session: electronSession.fromPartition('persist:' + cityPageId),
                });
                ctx.service.log.info('ntTools.getEtaxPage res', ntRes.errcode);
                if (ntRes.errcode !== '0000') {
                    ctx.service.log.info('getEtaxPage res', ntRes);
                }
                nt = ntRes.data;
            } else if (spLogin === 1) { // 需要通过单点登录验证失效
                try {
                    await nt.goto(gotoUrl);
                } catch (error) {
                    ctx.service.log.info('spLogin goto error', error);
                }
            }

            const res2 = await nt.wait(commonLogins.waitRedirect, {
                baseUrl: baseUrl,
                waitTimeout: 25000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('openLoinedChrome waitRedirect res', res2);
            // 已经失效
            if (!res2.data?.logout && res2.errcode === '0000') {
                const curUrl = nt.getUrl();
                const cookieRes = await nt.getCookies({});
                // 获取cookie
                if (cookieRes.errcode === '0000') {
                    ctx.service.log.info('获取cookie');
                    const newLoginData = {
                        ...loginData,
                        referer: curUrl,
                        getLzkqow: res2.data?.getLzkqow,
                        loginedCookies: cookieRes.data
                    };
                    await pwyStore.set(etaxLoginedCachePreKey + pageId, newLoginData, 12 * 60 * 60);
                    ctx.service.log.info('记录已登录的id', cityPageId, pageId);
                    // 检查登录状态是否失效
                    const checkRes = await ctx.service.etaxFpdkLogin.common.checkLogin(newLoginData, {
                        disableRetry: true
                    });
                    if (checkRes.errcode === '0000') {
                        ctx.service.log.info('checkLogin success', checkRes);
                        const uploadRes = await this.saveStorage(nt, newLoginData);
                        if (uploadRes.errcode !== '0000') {
                            await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                            return uploadRes;
                        }
                        // 会导致多次上传更新状态
                        // await ctx.service.fpyQueryInvoices.uploadAccountInfo(1);
                        await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                        return {
                            ...errcodeInfo.success,
                            data: newLoginData
                        };
                    }
                    ctx.service.log.info('checkLogin fail res', checkRes);
                }
            }
        }

        // 正在打开浏览器，这里需要等待操作完成
        const etaxName = baseUrl.split('.')[1];
        if (typeof ctx.service.etaxFpdkLogin[etaxName]?.tryLogin === 'function' && !isNewTimeTaxNo) {
            const newLoginData = this.getNewBackendCookies(loginData);
            const res = await ctx.service.etaxFpdkLogin[etaxName].tryLogin(newLoginData);
            ctx.service.log.info('tryLogin res----------', res);
            if (res.errcode === '0000') {
                await ctx.service.fpyQueryInvoices.uploadAccountInfo(1);
                await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                return res;
            } else if (res.errcode !== '91300') {
                await ctx.service.fpyQueryInvoices.uploadAccountInfo(1);
                const resData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
                await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                return {
                    ...errcodeInfo.success,
                    data: resData
                };
            }
        }

        if (isNewTimeTaxNo) {
            const { decryedData } = ctx.request.body;
            const account = decryedData.account || decryedData.loginAccountUid;
            const res = await ctx.service.newTime.checkIsLogout(account);
            // 新时代登录没有失效, 关闭掉窗体等待下次重新打开
            if (res.errcode === '0000') {
                await nt.clearAllCookies();
                nt.close();
                nt = null;
                await ctx.service.redisLock.delete(ntLockPreKey + pageId);
                return {
                    ...errcodeInfo.govErr,
                    description: '税局异常，请稍后再试!'
                };
            }
        }
        await ctx.service.redisLock.delete(ntLockPreKey + pageId);
        return errcodeInfo.govLogout;
    }

    getNewBackendCookies(loginData: any) {
        const loginedCookies = loginData.loginedCookies || [];
        const backendCookies = loginData.backendCookies || [];
        const dictCookies: any = {};
        for (let i = 0; i < loginedCookies.length; i++) {
            const item = loginedCookies[i];
            const cookieKey = [item.name, item.domain, encodeURIComponent(item.path)].join('-');
            if (!item.session) {
                dictCookies[cookieKey] = item;
            } else {
                const { session, ...otherCookie } = item;
                const expirationDate = Math.floor(+(new Date()) / 1000) + (8 * 60 * 60);
                dictCookies[cookieKey] = {
                    ...otherCookie,
                    expirationDate
                };
            }
        }
        const result = [];
        for (let i = 0; i < backendCookies.length; i++) {
            const item = backendCookies[i];
            const cookieKey = [item.name, item.domain, encodeURIComponent(item.path)].join('-');
            if (dictCookies[cookieKey] && dictCookies[cookieKey].domain.substring(0, 1) === '.') {
                result.push(dictCookies[cookieKey]);
            } else {
                result.push(item);
            }
        }
        return {
            ...loginData,
            backendCookies: result
        };
    }

    async checkLogin(loginData : any = {}, opt: any = {}) {
        const ctx = this.ctx;
        const { baseUrl, loginedCookies, eUrl } = loginData;
        if (!eUrl || !baseUrl || !loginedCookies || loginedCookies.length === 0) {
            return errcodeInfo.govLogout;
        }
        const pageId = loginData.pageId;

        const res = await ctx.service.switchCompany.queryCompanyInfo(pageId, opt);
        const taxNo = res.data?.taxNo || '';
        // 登录失效，或者查询到的税号与当前登录不一致
        if (res.errcode === '91300' || (taxNo && taxNo !== loginData.taxNo)) {
            return errcodeInfo.govLogout;
        }

        return {
            ...errcodeInfo.success,
            data: {
                companyName: loginData.companyName,
                taxNo: loginData.taxNo,
                yhsfmc: '',
                yhsfdm: ''
            }
        };
    }

    async updateLoginToken(pageId: string, opt: any) {
        const ctx = this.ctx;
        const tempLoginData = (await pwyStore.get(etaxLoginedCachePreKey + pageId)) || {};
        let openInvoiceCompany = opt.openInvoiceCompany;
        let szzhCompany = opt.szzhCompany;
        if ((typeof openInvoiceCompany === 'undefined' || openInvoiceCompany === '') &&
            (typeof szzhCompany === 'undefined' || szzhCompany === '')) {
            openInvoiceCompany = typeof tempLoginData?.openInvoiceCompany === 'undefined' ? '' : tempLoginData?.openInvoiceCompany;
            szzhCompany = typeof tempLoginData?.szzhCompany === 'undefined' ? '' : tempLoginData?.szzhCompany;
        }

        const loginData : any = {
            taxNo: opt.taxNo || tempLoginData.taxNo || '',
            skssq: opt.skssq || tempLoginData.skssq || '',
            gxrqfw: opt.gxrqfw || tempLoginData.gxrqfw || '',
            gxczjzrq: opt.gxczjzrq || tempLoginData.gxczjzrq || '',
            taxPeriod: opt.taxPeriod || tempLoginData.taxPeriod || '',
            companyType: opt.companyType || tempLoginData.companyType || '03',
            companyName: opt.companyName || tempLoginData.companyName || '',
            homeUrl: opt.homeUrl || tempLoginData.homeUrl || '',
            etaxAccountType: 3,
            client_id: opt.client_id || tempLoginData.client_id || '',
            getLzkqow: opt.getLzkqow || tempLoginData.getLzkqow || '',
            access_token: opt.access_token || tempLoginData.access_token || '',
            openInvoiceCompany: openInvoiceCompany,
            szzhCompany: szzhCompany,
            roleText: opt.roleText || tempLoginData.roleText || '',
            pageId,
            loginedCookies: opt.loginedCookies || tempLoginData.loginedCookies || [],
            etaxBackendUrl: opt.etaxBackendUrl || tempLoginData.etaxBackendUrl || '',
            tpassUrl: opt.tpassUrl,
            referer: opt.referer || tempLoginData.referer || '',
            eUrl: opt.eUrl || tempLoginData.eUrl || '',
            szzhDomain: opt.szzhDomain || tempLoginData.szzhDomain || '',
            szzhUrl: opt.szzhUrl || tempLoginData.szzhUrl || '',
            baseUrl: opt.baseUrl || tempLoginData.baseUrl || '',
            publicKeyInfo: opt.publicKeyInfo || tempLoginData.publicKeyInfo || '',
            tpassGlobalInfo: opt.tpassGlobalInfo || tempLoginData.tpassGlobalInfo || {},
            createTime: opt.createTime || tempLoginData.createTime || (+new Date())
        };
        await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
        const updateRes = await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
        if (updateRes.errcode !== '0000') {
            return updateRes;
        }
        return errcodeInfo.success;
    }

    async redirectBillModule(nt: any, opt: any, fixedPageInfo : any) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const taxNo = fixedPageInfo?.taxNo || queryInfo.taxNo;
        const pageId = fixedPageInfo?.pageId || queryInfo.pageId;
        const cityPageId = queryInfo.cityPageId;
        const ignoreLock = queryInfo.ignoreLock;
        let tempLoginData = (await pwyStore.get(etaxLoginedCachePreKey + cityPageId)) || {};
        let openInvoiceCompany = opt.openInvoiceCompany || tempLoginData.openInvoiceCompany;
        let szzhCompany = opt.szzhCompany || tempLoginData.szzhCompany;
        const { etaxBaseUrl, eUrl, companyName = '', companyType = '03' } = opt;
        const { decryedData = {} } = ctx.request.body || {};
        const roleText = decryedData.roleText || tempLoginData.roleText || '开票员';
        if (openInvoiceCompany === '' && szzhCompany === '') {
            if (roleText === '财务负责人' || roleText === '开票员' || roleText === '办税员') {
                openInvoiceCompany = 1;
                szzhCompany = 1;
            } else {
                return {
                    ...errcodeInfo.argsErr,
                    description: '该账号没有开票和税务数字账户权限，请检查！'
                };
            }
        }
        const curUrl = nt.getUrl();
        const cookieRes = await nt.getCookies({});
        if (cookieRes.errcode !== '0000') {
            return cookieRes;
        }
        const cityName = cityPageId.split('-')[1];
        const tpassUrl = `https://tpass.${cityName}.chinatax.gov.cn:8443`;

        const res = await ctx.service.etaxFpdkLogin.common.updateLoginToken(cityPageId, {
            taxNo,
            roleText,
            companyType,
            companyName: companyName.replace(/^欢迎，/, '').replace(/^欢迎,/, ''), // 通过dom获取的名称前面有多余字符
            szzhCompany,
            openInvoiceCompany,
            etaxBackendUrl: curUrl,
            loginedCookies: cookieRes.data,
            tpassUrl,
            baseUrl: etaxBaseUrl,
            eUrl,
            access_token: queryInfo.access_token,
            tpassGlobalInfo: fixedPageInfo?.token ? {
                token: fixedPageInfo.token || '',
                new_key16: fixedPageInfo.new_key16 || '',
                clientId: fixedPageInfo.clientId || '',
                natureuuid: fixedPageInfo.natureuuid || '',
                'X-NATURE-IP': fixedPageInfo['X-NATURE-IP'] || '',
                ded: fixedPageInfo.ded || '',
                ud: fixedPageInfo.userId ? hex_md5(fixedPageInfo.userId) : '',
                userId: fixedPageInfo.userId || '',
                areaPrefix: fixedPageInfo.areaPrefix || ''
            } : tempLoginData.tpassGlobalInfo,
            createTime: +new Date()
        });
        if (res.errcode !== '0000') {
            return res;
        }

        if (!ignoreLock) {
            const lockRes = await ctx.service.redisLock.set(ntLockPreKey + pageId, (+new Date()), 30);
            ctx.service.log.info('syncRedirectBillModule openLoinedChrome lockRes', lockRes);
            // 获取锁异常
            if (lockRes.errcode !== '0000') { // 其它异常
                return lockRes;
            }

            // redis锁已经存在，设置失败
            if (lockRes.data?.result === false) {
                ctx.service.log.info('redirectBillModule openLoinedChrome lockRes false', pageId);
                const wRes = await this.loopQueryStatus(pageId);
                if (wRes.errcode !== '0000') {
                    return wRes;
                }
                const resData = wRes.data || {};
                return this.createLoginData(resData);
            }
        }
        const res2 = await this.syncRedirectBillModule({
            pageId,
            etaxBaseUrl,
            openInvoiceCompany
        }, async() => {
            await ctx.service.redisLock.delete(ntLockPreKey + pageId);
        });
        if (res2.errcode === '91300') {
            await ctx.service.ntTools.logoutClear();
            return {
                ...errcodeInfo.govErr,
                description: '登录异常，请求重新登录'
            };
        }
        tempLoginData = (await pwyStore.get(etaxLoginedCachePreKey + pageId)) || {};
        const bodyLoginRes = this.createLoginData(tempLoginData);
        return {
            ...errcodeInfo.success,
            data: bodyLoginRes
        };
    }

    // 异步跳转到业务模块
    async syncRedirectBillModule(opt: any, cback: Function) {
        const ctx = this.ctx;
        const pageId = opt.pageId;
        const { cityPageId, operationType = '1' } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin || {};
        let nt = ntInfo ? ntInfo[pageId] : null;
        const etaxBaseUrl = opt.etaxBaseUrl;
        const openInvoiceCompany = opt.openInvoiceCompany;
        const tempLoginData = (await pwyStore.get(etaxLoginedCachePreKey + cityPageId)) || {};

        let gotoUrl = '';
        if (openInvoiceCompany !== '' && operationType === '1') {
            gotoUrl = `${etaxBaseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
        } else {
            gotoUrl = `${etaxBaseUrl}/szzhzz/spHandler?cdlj=/digital-tax-account&ruuid=` + (+new Date());
        }
        ctx.service.log.info('redirectBillModule gotoUrl', gotoUrl);
        if (nt) {
            try {
                await nt.goto(gotoUrl);
            } catch (error) {
                ctx.service.log.info('goto error', error);
            }
        } else {
            const openOpt: any = {
                id: pageId,
                ignoreGotoError: true,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
            };
            const ntRes = await ctx.service.ntTools.getEtaxPage(gotoUrl, openOpt);
            if (ntRes.errcode !== '0000') {
                await cback();
                return ntRes;
            }
            nt = ntRes.data;
        }

        let res2 = await nt.wait(commonLogins.waitRedirect, {
            baseUrl: etaxBaseUrl,
            waitTimeout: 25000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('redirectBillModule waitRedirect res', res2);

        if (res2.data?.logout) {
            await cback();
            return errcodeInfo.govLogout;
        }

        if (res2.errcode !== '0000' || (res2.data && res2.data.errMsg)) {
            await cback();
            return {
                ...errcodeInfo.govErr,
                description: res2.errcode !== '0000' ? res2.description : res2.data.errMsg
            };
        }

        // 出现中间页，重新跳转
        if (res2.data?.hasMiddlePage) {
            if (openInvoiceCompany !== '' && operationType === '1') {
                gotoUrl = `${etaxBaseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
            } else {
                gotoUrl = `${etaxBaseUrl}/szzhzz/spHandler?cdlj=/digital-tax-account&ruuid=` + (+new Date());
            }
            ctx.service.log.info('出现中间页，继续跳转到业务模块', gotoUrl);
            try {
                await nt.goto(gotoUrl);
            } catch (error) {
                ctx.service.log.info('中间页重新跳转 goto error', error);
            }
            res2 = await nt.wait(commonLogins.waitRedirect, {
                baseUrl: etaxBaseUrl,
                waitTimeout: 25000,
                timeoutRefresh: true,
                ignoreMiddlePage: true
            }, 2);
            ctx.service.log.info('中间页重新跳转返回', res2);
            if (res2.data?.logout) {
                await cback();
                return errcodeInfo.govLogout;
            }

            if (res2.errcode !== '0000' || (res2.data && res2.data.errMsg)) {
                await cback();
                return {
                    ...errcodeInfo.govErr,
                    description: res2.errcode !== '0000' ? res2.description : res2.data.errMsg
                };
            }
        }

        if (tempLoginData.etaxAccountType === 3 && opt.checkOpenAuth) {
            const res3 = await nt.wait(commonLogins.checkOpenAuth, {
                waitTimeout: 20000
            });
            ctx.service.log.info('checkOpenAuth', res3);
            if (res3.data && res3.data.errMsg) {
                tempLoginData.etaxAccountType = 2;
            }
        }
        const { szzhDomain = '', szzhUrl = '', getLzkqow } = res2.data || {};
        // 使用最新的cookie信息，获取税期等信息
        const curUrl = nt.getUrl();
        const cookieRes = await nt.getCookies({});
        if (cookieRes.errcode !== '0000') {
            await cback();
            return cookieRes;
        }

        const cookieAll = cookieRes.data;
        tempLoginData.loginedCookies = cookieAll;
        tempLoginData.szzhDomain = szzhDomain;
        tempLoginData.szzhUrl = szzhUrl;
        tempLoginData.getLzkqow = getLzkqow;
        tempLoginData.referer = curUrl;
        const uploadRes = await this.saveStorage(nt, tempLoginData);
        if (uploadRes.errcode !== '0000') {
            return uploadRes;
        }
        ctx.service.log.info('记录已登录的id', cityPageId, pageId);
        await cback();
        const fpdkGovWin : any = ctx.bsWindows.fpdkGovWin || {};
        const ntKeys = Object.keys(fpdkGovWin);
        ctx.service.log.info('login ntKeys', ntKeys);
        return {
            ...errcodeInfo.success,
            data: tempLoginData
        };
    }

    // 获取电子税局结果
    async waitFinish(nt: any, opt: {
        eUrl: string;
        etaxBaseUrl: string;
    }) {
        const ctx = this.ctx;
        const { pageId, client_id, access_token } = ctx.request.query || {};
        const { eUrl, etaxBaseUrl } = opt || {};

        ctx.service.log.info('waitFinish nt', nt);
        if (!nt || !nt.nightmareWindow?.win) {
            return errcodeInfo.govLogout;
        }

        const tempLoginData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
        ctx.service.log.info('waitFinish tempLoginData', tempLoginData);
        if (!tempLoginData?.etaxAccountType) {
            return errcodeInfo.govLogout;
        }

        ctx.service.log.info('waitFinish waitRedirect start');
        const resRedirect = await nt.wait(commonLogins.waitRedirect, {
            baseUrl: etaxBaseUrl,
            waitTimeout: 17000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('waitFinish waitRedirect end', resRedirect);

        if (resRedirect.errcode !== '0000' || (resRedirect.data && resRedirect.data.errMsg)) {
            return {
                ...errcodeInfo.govErr,
                description: resRedirect.errcode !== '0000' ? resRedirect.description : resRedirect.data.errMsg
            };
        }
        const { szzhDomain = '', szzhUrl = '', baseUrl = '', getLzkqow } = resRedirect.data || {};

        // 保存最新的cookie信息
        const cookieRes = await nt.getCookies({});
        if (cookieRes.errcode !== '0000') {
            return cookieRes;
        }
        const cookieAll = cookieRes.data;
        const etaxAccountType = tempLoginData.etaxAccountType;
        const companyType = tempLoginData.companyType;
        const companyName = tempLoginData.companyName;
        const taxNo = tempLoginData.taxNo;
        const roleText = tempLoginData.roleText || '';

        const bodyRes: bodyResDataType = {
            taxNo,
            skssq: '',
            gxrqfw: '',
            gxczjzrq: '',
            taxPeriod: '',
            companyType,
            companyName,
            homeUrl: eUrl,
            etaxAccountType
        };
        const loginData: loginDataType = {
            ...bodyRes,
            client_id,
            getLzkqow,
            access_token,
            roleText,
            pageId,
            loginedCookies: cookieAll,
            eUrl,
            szzhDomain,
            szzhUrl,
            baseUrl,
            publicKeyInfo: tempLoginData.publicKeyInfo || '',
            createTime: +new Date()
        };
        const updateRes = await ctx.service.ntTools.updateRemoteLoginStatus(pageId, loginData);
        if (updateRes.errcode !== '0000') {
            return updateRes;
        }
        await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
        return {
            ...errcodeInfo.success,
            data: bodyRes
        };
    }

    // 通过电子税局后台cookie重新打开税局开票模块或者数字账户模块
    async reOpenEtaxPage(pageId: string) {
        const ctx = this.ctx;
        const pageIdArr = pageId.split('-');
        if (pageIdArr.length < 3) {
            return errcodeInfo.argsErr;
        }

        const tenantNo = pageIdArr[0];
        const taxNo = pageIdArr[1];

        ctx.request.query.pageId = pageId;
        // 租户id 基本都要
        ctx.request.query.tenantNo = tenantNo;
        ctx.request.query.taxNo = taxNo;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[pageId] : null;
        const res2 = await ctx.service.ntTools.queryRemoteLoginStatus(pageId);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const loginData = res2.data || {};
        const res = await this.openLoinedChrome(nt, loginData, 1);
        return res;
    }

    // 拖动滑块, 也可使用外部传入的drayBtn拖动滑块,checkDray检测滑动状态方法
    async retryDray(nt: any, retry: number, drayFunc?: any, checkFunc?: any): Promise<any> {
        const ctx = this.ctx;
        const startTime = +new Date();
        try {
            let drayRes: any;
            let checkData: any;
            // 拖动滑块
            if (drayFunc && typeof drayFunc === 'function') {
                drayRes = await nt.evaluate(drayFunc);
            } else {
                drayRes = await nt.evaluate(commonLogins.drayBtn);
            }
            // 滑块状态校验
            if (checkFunc && typeof checkFunc === 'function') {
                checkData = await nt.evaluate(checkFunc);
            } else {
                checkData = await nt.evaluate(commonLogins.checkDray);
            }

            ctx.service.log.info('drayBtn--checkData---', (+new Date()) - startTime, drayRes, checkData);
            if (checkData.errcode === '0000') {
                if (retry > 2) {
                    ctx.service.log.info('drayBtn 错误超过', retry, '次');
                    return {
                        ...errcodeInfo.argsErr,
                        description: '登录异常，请稍后再试！'
                    };
                }
                return await this.retryDray(nt, retry + 1, drayFunc, checkFunc);
            }
            ctx.service.log.info('drayBtn success', (+new Date()) - startTime, drayRes);
            return {
                ...errcodeInfo.success
            };
        } catch (error) {
            ctx.service.log.info('drayBtn error', error.toString());
            return {
                ...errcodeInfo.argsErr,
                description: '登录异常，请稍后再试！'
            };
        }
    }
}

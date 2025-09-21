import * as govLogins from '../govLoginLibs/guangdong-v2';
import { sleep } from '$utils/tools';

const eUrl = 'https://etax.guangdong.chinatax.gov.cn';
const etaxBaseUrl = 'https://dppt.guangdong.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.guangdong.chinatax.gov.cn/xxmh/';
const redirectURI = eUrl + '/sso/login?service=https%3A%2F%2Fetax.guangdong.chinatax.gov.cn%2Fxxmh%2Fhtml%2Findex_login.html&v=2';

export class GuangdongLoginService extends BaseService {
    // 已经登录过的税局，重新打开已登录的浏览器
    async openLoginedPage(loginData: any) {
        const ctx = this.ctx;
        const ntRes = await ctx.service.etaxLogin.openLoginedPage(loginData, loginData.szzhUrl);
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
        return errcodeInfo.govLogout;
    }

    // 当前已经时登录状态，尝试进入后台
    async tryLogin(loginData: any) {
        const ctx = this.ctx;
        const { taxNo, cityPageId } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        if (!nt || !nt.nightmareWindow.win) {
            ctx.service.log.info('tryLogin login url', eUrl, cityPageId);
            const ntRes = await ctx.service.ntTools.getEtaxPage(eUrl, {
                id: cityPageId,
                ignoreGotoError: true,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
            });
            if (ntRes.errcode !== '0000') {
                return errcodeInfo.govLogout;
            }
            nt = ntRes.data;
        } else {
            await nt.goto(eUrl);
        }

        let wRes = await nt.wait(govLogins.tryLoginWait, {
            checkClickBtn: true,
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('tryLogin wRes1', wRes);
        if (wRes.data?.selector) {
            await nt.click(wRes.data?.selector);
            wRes = await nt.wait(govLogins.tryLoginWait, {
                waitTimeout: 20000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('tryLogin wRes2', wRes);
        }

        if (wRes.data?.isLogined) {
            const res = await this.etaxLoginSuccess(nt, {
                taxNo
            });
            return res;
        }
        return errcodeInfo.govLogout;
    }

    // 进入账户中心
    async gotoAccountCenter() {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query || {};
        const ntInfo = ctx.bsWindows.fpdkGovWin || {};
        const loginData : any = pwyStore.get(etaxLoginedCachePreKey + cityPageId);
        if (!loginData || !loginData.loginedCookies || !loginData.etaxBackendUrl) {
            return errcodeInfo.govLogout;
        }
        const etaxBackendUrl = loginData.etaxBackendUrl;
        let backendNt = ntInfo ? ntInfo[cityPageId] : null;
        ctx.service.log.info('开始进入账户中心, 后台地址', etaxBackendUrl);
        if (backendNt && backendNt.nightmareWindow?.win) {
            await backendNt.goto(etaxBackendUrl);
        } else {
            const openOpt : any = {
                id: cityPageId,
                partition: 'persist:' + cityPageId,
                ignoreGotoError: true
            };
            ctx.service.log.info('后台窗体不存在，重新打开', etaxBackendUrl);
            // 获取切换税号的页面
            const ntRes = await ctx.service.ntTools.getEtaxPage(etaxBackendUrl, openOpt);
            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            backendNt = ntRes.data;
        }
        const res = await backendNt.wait(govLogins.gotoAccountCenter);
        ctx.service.log.info('进入账户中心返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        if (res.data?.isLogout) {
            return errcodeInfo.govLogout;
        }
        return res;
    }

    // 电子税局的登录，包括角色的选择
    /* eslint-disable complexity */
    async loginTypes(nt: any, data: any, retry = 0) {
        const ctx = this.ctx;
        const { taxNo = '', account = '', accountPasswd = '', roleText = '' } = data;
        let startTime = +new Date();
        try {
            await nt.evaluate(govLogins.clearErr);
            let isLogined = false;
            // 初次执行需要调整到登录页面
            if (retry === 0) {
                const wRes = await nt.wait(govLogins.waitLoginIcon);
                ctx.service.log.info('waitLoginIcon', (+new Date() - startTime), wRes);
                if (wRes.errcode !== '0000') {
                    return wRes;
                }
                const wData = wRes.data || {};
                if (wData.isLogined === true) {
                    isLogined = true;
                }
            }
            startTime = +new Date();
            const wRes2 = await nt.wait(govLogins.waitInputs, {
                waitTimeout: 25000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('waitInputs', (+new Date() - startTime), wRes2);
            if (wRes2.errcode !== '0000') {
                return wRes2;
            }
            const wData2 = wRes2.data || {};
            if (wData2.isLogined === true) {
                isLogined = true;
            }
            if (!isLogined) {
                startTime = +new Date();
                await nt.type('input[placeholder="统一社会信用代码/纳税人识别号"]', taxNo);
                await nt.type('input[placeholder="居民身份证号码/手机号码/用户名"]', account);
                await nt.type('input[placeholder="个人用户密码"]', accountPasswd);
                ctx.service.log.info('loginTypes input', (+new Date() - startTime));

                await sleep(300);
                startTime = +new Date();
                const inputIsErr = await nt.evaluate(govLogins.checkInputErr, data);
                ctx.service.log.info('loginTypes checkInputErr', (+new Date() - startTime), inputIsErr);

                // 输入有误，重复输入
                if (inputIsErr === true) {
                    if (retry > 2) {
                        return errcodeInfo.govErr;
                    }
                    const res : any = await this.loginTypes(nt, data, retry + 1);
                    return res;
                }

                // startTime = +new Date();
                // const drayRes = await nt.evaluate(govLogins.drayBtn);
                // ctx.service.log.info('drayRes', (+new Date() - startTime), drayRes);
                // 拖动滑块
                const retryDrayData = await ctx.service.etaxFpdkLogin.common.retryDray(nt, retry);
                if (retryDrayData.errcode !== '0000') {
                    return {
                        ...errcodeInfo.argsErr,
                        description: '登录异常，请稍后再试！'
                    };
                }

                startTime = +new Date();
                await nt.click('.formContentE .el-button--primary');
                const checkRes = await nt.wait(govLogins.checkLoginErr, {
                    waitTimeout: 35000,
                    timeoutRefresh: true
                }, 1);
                ctx.service.log.info('checkLoginErr', (+new Date() - startTime), checkRes);

                if (checkRes.errcode !== '0000' || (checkRes.data && checkRes.data.errMsg)) {
                    return {
                        ...errcodeInfo.govErr,
                        description: checkRes.errcode !== '0000' ? checkRes.description : checkRes.data.errMsg
                    };
                }

                startTime = +new Date();
                await nt.evaluate(govLogins.clearErr);
                const res = await nt.wait(govLogins.selectRole, { roleText });
                ctx.service.log.info('selectRole', (+new Date() - startTime), res);

                if (res.errcode !== '0000' || (res.data && res.data.errMsg)) {
                    return {
                        ...errcodeInfo.govErr,
                        description: res.errcode !== '0000' ? res.description : res.data.errMsg
                    };
                }
            }
            return errcodeInfo.success;
        } catch (e) {
            ctx.service.log.info('税局请求异常', e.toString());
            return errcodeInfo.govErr;
        }
    }

    // 查询业务菜单的索引并保存cookie到临时的store里面
    async queryBillMenuIndex(nt: any, data : any) {
        const ctx = this.ctx;
        const loginRes = await nt.wait(govLogins.waitLoginInfo, {
            waitTimeout: 30000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('queryBillMenuIndex res', loginRes);
        if (loginRes.data?.isLogout) {
            return errcodeInfo.govLogout;
        }
        if (loginRes.errcode !== '0000' || (loginRes.data && loginRes.data.errMsg)) {
            return {
                ...errcodeInfo.govErr,
                description: loginRes.errcode !== '0000' ? loginRes.description : loginRes.data.errMsg
            };
        }
        const { szzhCompany = '', openInvoiceCompany = '', companyName } = loginRes.data || {};
        return {
            ...errcodeInfo.success,
            data: {
                ...loginRes.data,
                companyName,
                openInvoiceCompany,
                szzhCompany
            }
        };
    }

    // 电子税局前面登录成功，包括选择角色后的全部流程
    async etaxLoginSuccess(nt: any, data: any = {}) {
        const ctx = this.ctx;
        const { roleText = '' } = data;
        const menuRes = await this.queryBillMenuIndex(nt, data);
        if (menuRes.errcode !== '0000') {
            return menuRes;
        }
        const { openInvoiceCompany, szzhCompany, companyName, companyType = '03' } = menuRes.data || {};
        const res = await ctx.service.etaxFpdkLogin.common.redirectBillModule(nt, {
            companyName,
            companyType,
            openInvoiceCompany,
            szzhCompany,
            roleText,
            eUrl,
            etaxBaseUrl
        });
        return res;
    }

    async checkAccount(opt:any = {}) { // 用于企业认证
        const ctx = this.ctx;
        ctx.service.log.info('plugin service checkAccount------------');
        const { cityPageId } = ctx.request.query;
        const res = await ctx.service.apiLogin.checkAccount(opt, {
            eLoginUrl,
            apiWaitLogin: govLogins.apiWaitLogin,
            redirectURI
        });
        if (res.errcode === '0000') {
            const ntInfo = ctx.bsWindows.fpdkGovWin || {};
            const nt = ntInfo[cityPageId] || null;
            if (nt) {
                nt.close();
            }
            return errcodeInfo.success;
        }
        return res;
    }

    // encryType 1、web层加密数据，使用RSA加密，2、为对称加密，在java后台解密
    /* eslint-disable complexity */
    async login(opt: any = {}) {
        const ctx = this.ctx;
        let nt;
        const { cityPageId } = ctx.request.query;
        if (ctx.service.apiLogin.allowApiLogin(eUrl)) {
            const res = await ctx.service.apiLogin.login(opt, {
                eLoginUrl,
                apiWaitLogin: govLogins.apiWaitLogin,
                redirectURI
            });
            if (res.description.indexOf('税局升级') === -1) {
                return res;
            }
            const ntInfo = ctx.bsWindows.fpdkGovWin || {};
            nt = ntInfo[cityPageId] || null;
        }

        ctx.service.log.info('plugin service------------');
        const { data = {} } = opt;

        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        let startTime = +new Date();
        if (!nt) {
            // 前置检查异常
            const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
                id: cityPageId,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
            });
            ctx.service.log.info('打开税局登录页', (+new Date()) - startTime);

            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            nt = ntRes.data;
        }

        startTime = +new Date();
        let res = await this.loginTypes(nt, data);
        ctx.service.log.info('loginTypes', (+new Date() - startTime), res);
        if (res.errcode !== '0000') {
            return res;
        }

        res = await this.etaxLoginSuccess(nt, data);
        return res;
    }
}
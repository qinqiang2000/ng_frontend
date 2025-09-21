/* eslint-disable-next-line */
/* global errcodeInfo BaseService etaxLoginedCachePreKey pwyStore setTimeout path fs xlsx base_xlsx moment qrcode urllib log hex_md5 httpRequest */
import * as govLogins from '../govLoginLibs/zhejiang';

const eUrl = 'https://etax.zhejiang.chinatax.gov.cn';
const etaxBaseUrl = 'https://dppt.zhejiang.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.zhejiang.chinatax.gov.cn/zjgfdzswj/main/index.html';
const redirectURI = `${eUrl}/zjgfdzswj/main/kx/skip.html?service=${eUrl}/zjgfdzswj/main/home/wdxx/index.html`;

export class ZhejiangLoginService extends BaseService {
    // 业务调用 已经登录过的税局，重新打开已登录的浏览器
    async openLoginedPage(loginData: any) {
        const ctx = this.ctx;
        const ntRes = await ctx.service.etaxLogin.openLoginedPage(loginData, loginData.szzhUrl);
        if (ntRes.errcode === '0000') {
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

    // 输入
    async stepOneTypes(nt: any, data: any = {}, retry = 0) {
        const ctx = this.ctx;
        const { taxNo = '', account = '', accountPasswd = '', roleText } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        let startTime = (+new Date());
        try {
            const resInit = await nt.wait(govLogins.stepOneInit, {
                waitTimeout: 20000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('init', (+new Date()) - startTime, resInit);
            if (resInit.errcode !== '0000') {
                return resInit;
            }
            // 已登录
            if (resInit.data?.isLogin) {
                const resLogin = await this.etaxLoginSuccess(nt, { data });
                return resLogin;
            }
            // 输入账户信息
            startTime = +new Date();
            await nt.type('input[placeholder="统一社会信用代码/纳税人识别号"]', taxNo);
            await nt.type('input[placeholder="居民身份证号码/手机号码/用户名"]', account);
            await nt.type('input[placeholder="个人用户密码"]', accountPasswd);
            ctx.service.log.info('type', (+new Date()) - startTime);
            const inputErr = await nt.evaluate(govLogins.checkInputErr, data);
            // 输入有误，重复输入
            if (inputErr === true) {
                if (retry > 2) {
                    return errcodeInfo.govErr;
                }
                const res: any = await this.stepOneTypes(nt, data, retry + 1);
                return res;
            }

            // 拖动滑块
            // startTime = +new Date();
            // const drayRes = await nt.evaluate(govLogins.drayBtn);
            // ctx.service.log.info('drayBtn', (+new Date()) - startTime, drayRes);

            // 拖动滑块
            const retryDrayData = await ctx.service.etaxFpdkLogin.common.retryDray(nt, retry);
            if (retryDrayData.errcode !== '0000') {
                return {
                    ...errcodeInfo.argsErr,
                    description: '登录异常，请稍后再试！'
                };
            }

            // 点击登录并获取第一步登录结果
            await nt.evaluate(govLogins.clearErr);
            await nt.click('.el-form .el-button--primary');

            startTime = +new Date();
            const selectRes = await nt.wait(govLogins.selectRole, { roleText });
            ctx.service.log.info('selectRole', (+new Date() - startTime), selectRes);
            if (selectRes.errcode !== '0000' || (selectRes.data && selectRes.data.errMsg)) {
                return {
                    ...errcodeInfo.govErr,
                    description: selectRes.errcode !== '0000' ? selectRes.description : selectRes.data.errMsg
                };
            }
            return selectRes;
        } catch (error) {
            ctx.service.log.info('第一步登录异常', error.toString());
            return {
                ...errcodeInfo.govErr,
                description: '登录异常，请稍后再试！'
            };
        }
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

    // 第一步登录
    async login(opt: any = {}) {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query;
        let nt;
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
        ctx.service.log.info('plugin service --------------');
        const { data = {} } = opt;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        // 打开税局
        const startTime = +new Date();
        if (!nt) {
            const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
                id: cityPageId,
                partition: 'persist:' + cityPageId
            });
            ctx.service.log.info('open nt', (+new Date()) - startTime);
            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            nt = ntRes.data;
        }

        const checkRes = await this.stepOneTypes(nt, data);
        ctx.service.log.info('stepOneTypes', (+new Date() - startTime), checkRes);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const res = await this.etaxLoginSuccess(nt, opt);
        return res;
    }

    // 查询企业开收票权限
    async queryBillMenuIndex(nt: any, opt: any = {}) {
        const ctx = this.ctx;
        const startTime = (+new Date());

        // 确保进入到首页
        const initRes = await nt.wait(govLogins.waitLoginInit, {
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        if (initRes.errcode !== '0000' || (initRes.data && initRes.data.errMsg)) {
            return {
                ...errcodeInfo.argsErr,
                description: initRes.errcode !== '0000' ? initRes.description : initRes.data.errMsg
            };
        }
        // 点击我要办税
        await nt.click('[href="../wybs/index.html"]');

        // 检测登录后跳转并获取当前账户的权限（开票和数字账户权限）
        const redirectRes = await nt.wait(govLogins.waitLoginRedirect);

        ctx.service.log.info('检查登录返回111', (+new Date()) - startTime, redirectRes);
        if (redirectRes.data?.isLogout) {
            return errcodeInfo.govLogout;
        }
        if (redirectRes.errcode !== '0000' || (redirectRes.data && redirectRes.data.errMsg)) {
            return {
                ...errcodeInfo.argsErr,
                description: redirectRes.errcode !== '0000' ? redirectRes.description : redirectRes.data.errMsg
            };
        }
        const { companyName, szzhCompany = '', openInvoiceCompany = '', companyType = '03' } = redirectRes.data || {};
        return {
            ...errcodeInfo.success,
            data: {
                companyName,
                companyType,
                openInvoiceCompany,
                szzhCompany
            }
        };
    }

    // 登录电子税局后台后的跳转
    async etaxLoginSuccess(nt: any, opt: any) {
        const ctx = this.ctx;
        const { data = {} } = opt;
        const { roleText = '' } = data;

        const menuRes = await this.queryBillMenuIndex(nt, opt);
        if (menuRes.errcode !== '0000') {
            return menuRes;
        }
        const { openInvoiceCompany, szzhCompany, companyName, companyType } = menuRes.data || {};
        const res = await ctx.service.etaxFpdkLogin.common.redirectBillModule(nt, {
            companyName,
            companyType,
            openInvoiceCompany,
            szzhCompany,
            roleText,
            eUrl,
            etaxBaseUrl,
            checkOpenAuth: true
        });
        return res;
    }

    // 当前已经时登录状态，尝试进入后台
    async tryLogin(loginData: any) {
        const ctx = this.ctx;
        const { taxNo, cityPageId } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        // const { roleText = '' } = loginData;
        let startTime = (+new Date());
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        if (!nt || !nt.nightmareWindow.win) {
            ctx.service.log.info('login url', eUrl);
            const ntRes = await ctx.service.ntTools.getEtaxPage(eUrl, {
                id: cityPageId,
                ignoreGotoError: true,
                partition: 'persist:' + cityPageId
                // headers: {
                //     cookies: loginData.backendCookies
                // }
            });
            if (ntRes.errcode !== '0000') {
                return errcodeInfo.govLogout;
            }
            nt = ntRes.data;
        } else {
            await nt.goto(eUrl);
        }
        ctx.service.log.info('goto', ((+new Date()) - startTime));
        startTime = +new Date();
        let wRes = await nt.wait(govLogins.tryLoginWait, {
            checkClickBtn: true,
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('tryLogin wRes1', ((+new Date()) - startTime), wRes);
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
                data: {
                    taxNo
                },
                taxNo
            });
            return res;
        }
        return errcodeInfo.govLogout;
    }
}


/* eslint-disable no-undef */
import * as govLogins from '../govLoginLibs/hubei';

const eUrl = 'https://etax.hubei.chinatax.gov.cn';
const etaxBaseUrl = 'https://dppt.hubei.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.hubei.chinatax.gov.cn/portal/';
const redirectURI = 'https://etax.hubei.chinatax.gov.cn/portal/login-web/api/third/sso/login/redirect';
export class HubeiLoginService extends BaseService {
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
            }, 1);
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
            startTime = +new Date();
            await nt.evaluate(govLogins.clearErr);
            await nt.click('.el-form .el-button--primary');

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
                // session: electronSession.fromPartition('persist:' + cityPageId)
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
        ctx.service.log.info('opt queryBillMenuIndex', opt);

        // 检测登录后跳转并获取当前账户的权限（开票和数字账户权限）
        const redirectRes = await nt.wait(govLogins.waitLoginRedirect, {
            waitTimeout: 30000,
            timeoutRefresh: true
        }, 2);

        ctx.service.log.info('检查登录返回', (+new Date()) - startTime, redirectRes);
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
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        const { roleText = '' } = loginData;
        if (!nt || !nt.nightmareWindow.win) {
            ctx.service.log.info('tryLogin login url', eUrl);
            const ntRes = await ctx.service.ntTools.getEtaxPage(eUrl, {
                id: cityPageId,
                ignoreGotoError: true,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
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
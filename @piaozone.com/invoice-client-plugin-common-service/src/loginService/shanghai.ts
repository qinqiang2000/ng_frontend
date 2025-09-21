/* eslint-disable no-undef,no-unused-vars */
import * as govLogins from '../govLoginLibs/shanghai-v2';

const eUrl = 'https://etax.shanghai.chinatax.gov.cn';
export class ShanghaiLoginService extends BaseService {
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

    // 新版第一步登录
    async stepOneLogin(opt: any) {
        return await this.ctx.service.etaxFpdkLogin.shanghaiV2.stepOneLogin(opt);
    }

    // 新版第二步获取短信
    async sendShortMsg(opt: any) {
        return await this.ctx.service.etaxFpdkLogin.shanghaiV2.sendShortMsg(opt);
    }

    // 登录
    async login(opt: any = {}) {
        const ctx = this.ctx;
        const { data = {} } = opt;
        const { realLoginType } = data;

        let res;
        if (typeof realLoginType !== 'undefined') {
            // 有值旧版
            res = await ctx.service.etaxFpdkLogin.shanghaiV1.login(opt);
        } else {
            // 无值新版
            res = await ctx.service.etaxFpdkLogin.shanghaiV2.login(opt);
        }

        // 无值新版
        return res;
    }

    async queryBillMenuIndex(nt: any, opt: any) {
        const ctx = this.ctx;
        const res = await ctx.service.etaxFpdkLogin.shanghaiV2.queryBillMenuIndex(nt, opt);
        return res;
    }

    async etaxLoginSuccess(nt: any, opt: any) {
        const ctx = this.ctx;
        const res = await ctx.service.etaxFpdkLogin.shanghaiV2.etaxLoginSuccess(nt, opt);
        return res;
    }

    // 当前已经时登录状态，尝试进入后台
    async tryLogin(loginData: any) {
        const ctx = this.ctx;
        const { taxNo, cityPageId } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const { roleText = '' } = loginData;
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
            const res = await ctx.service.etaxFpdkLogin.shanghaiV2.etaxLoginSuccess(nt, {
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
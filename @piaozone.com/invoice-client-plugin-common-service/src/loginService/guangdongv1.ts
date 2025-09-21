import { initWait, oldDrayBtn, checkInputErr } from '../govLoginLibs/guangdong';
import * as govLogins from '../govLoginLibs/guangdong-v2';
const eLoginUrl = 'https://etax.guangdong.chinatax.gov.cn/xxmh/';
export class GuangdongOldLoginService extends BaseService {
    // eslint-disable-next-line
    async login(opt: any) {
        const ctx = this.ctx;
        const { pageId, cityPageId } = ctx.request.query;
        const { taxNo = '', account = '', accountPasswd = '', roleText = '' } = opt.data || {};

        let startTime = +new Date();
        const homeUrl = eLoginUrl + '?bszmFrom=1&t=' + (+new Date());
        ctx.service.log.info('homeUrl', homeUrl);
        const ntRes = await ctx.service.ntTools.getEtaxPage(homeUrl, {
            id: pageId,
            partition: 'persist:' + cityPageId,
            ignoreGotoError: true
        });
        ctx.service.log.info('打开税局登录页', (+new Date()) - startTime);
        startTime = +new Date();
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        const nt = ntRes.data;
        const wRes = await nt.wait(initWait, {
            waitTimeout: 30000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('initWait wRes', wRes);
        if (wRes && wRes.data && wRes.data.errMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: wRes.data.errMsg
            };
        }
        if (wRes?.data?.isLogined) {
            const res = await ctx.service.etaxFpdkLogin.guangdongV2.etaxLoginSuccess(nt, opt.data);
            return res;
        }

        try {
            let typeIsError = false;
            let retryInput = 0;
            await nt.click('#mmdl_QieHuan');
            do {
                await nt.type('input[placeholder="社会信用代码/识别号"]', taxNo);
                await nt.type('input[placeholder="用户名/实名手机号码"]', account);
                await nt.type('input[placeholder="用户密码"]', accountPasswd);
                const inputIsErr = await nt.evaluate(checkInputErr, {
                    taxNo,
                    account,
                    accountPasswd
                });
                // 输入有误，重复输入
                if (inputIsErr === true) {
                    typeIsError = true;
                } else {
                    typeIsError = false;
                }
                retryInput += 1;
            } while (typeIsError && retryInput < 2);

            ctx.service.log.info('typeIsError', typeIsError);
            if (typeIsError) {
                return errcodeInfo.govErr;
            }

            const drayRes = await nt.evaluate(oldDrayBtn);

            ctx.service.log.info('drayRes', (+new Date() - startTime), drayRes);

            startTime = +new Date();
            await nt.click('#upLoginButton');
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
        } catch (infoErr) {
            ctx.service.log.info('登录过程出现异常', infoErr);
            return {
                errcode: '5000',
                description: '税局请求异常，请稍后再试！'
            };
        }

        const res = await ctx.service.etaxFpdkLogin.guangdongV2.etaxLoginSuccess(nt, opt.data);
        return res;
    }

    async getCompanyInfo(pageId: string, nt: any) {
        return errcodeInfo.success;
    }
}
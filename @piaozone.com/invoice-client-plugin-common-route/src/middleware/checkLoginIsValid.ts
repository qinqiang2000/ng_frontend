import { ETAX_LOGIN_OPTIONS } from '../constants';

// 检查当前登录状态是否有效

// 截屏中间件，主要用于登录过程中出现异常时统一截屏
export default (options: lockLoginOptions = {}) => {
    return async function checkLoginIsValid(ctx: ControllerCtxType, next: Function) {
        const { pageId, cityPageId, taxNo } = ctx.request.query;
        ctx.service.log.info('start check login is valid plugin ignore ', pageId, cityPageId);
        const { decryedData } = ctx.request.body;
        // realLoginType 旧版上海登录
        // isQuickLogin 快捷登录
        const { realLoginType, isQuickLogin } = decryedData || {};
        // 第一步登录关闭标志
        let closeNotVaildNt = options.closeNotVaildNt;

        // 上海旧版登录
        if (typeof realLoginType !== 'undefined') {
            closeNotVaildNt = true;
        }

        const requestUrl = ctx.request.url;
        const etaxName = pageId.split('-')[1];
        const etaxLoginOption: any = ETAX_LOGIN_OPTIONS.find((item) => item.name === etaxName);

        // 自动登录城市
        if (etaxLoginOption && etaxLoginOption.autoLogin) {
            closeNotVaildNt = etaxLoginOption.autoLogin;
        }

        // 发短信验证码时快捷登录
        if (requestUrl.indexOf('/fpdk/etax/common/sendShortMsg') !== -1 && isQuickLogin) {
            closeNotVaildNt = true;
        }

        ctx.service.log.info('校验是否已经登录参数', pageId, closeNotVaildNt, etaxName);

        // 查询最新的登录信息并更新本地
        const loginDataRes = await ctx.service.ntTools.queryRemoteLoginStatus(pageId);
        if (loginDataRes.errcode !== '0000') {
            ctx.body = loginDataRes;
            return;
        }

        const loginData = loginDataRes.data || {};
        if (loginData.loginedCookies) {
            await pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
        } else {
            await pwyStore.delete(etaxLoginedCachePreKey + pageId, 12 * 60 * 60);
        }

        // 首次登录如果税号不一致尝试做一次切换
        if (closeNotVaildNt && loginData?.loginedCookies && loginData.taxNo !== taxNo) {
            const account = decryedData.account || decryedData.loginAccountUid;
            ctx.service.log.info('已登录企业', loginData?.taxNo);
            ctx.service.log.info('当前企业', taxNo);
            ctx.service.log.info('先尝试切换', account, taxNo);
            // 先尝试切换
            const switchRes = await ctx.service.switchCompany.switch({
                roleText: decryedData.roleText,
                account: account,
                taxNo: taxNo
            });
            ctx.service.log.info('切换返回', switchRes);
            // 切换成功
            if (switchRes.errcode === '0000') {
                await ctx.service.etaxFpdkLogin.common.afterLoginSuccess(pageId);
                const curLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
                const bodyRes = await ctx.service.etaxFpdkLogin.common.createLoginData(curLoginData);
                ctx.body = {
                    ...errcodeInfo.success,
                    data: bodyRes
                };
                return;
            }
        }

        /*
        // 如果已经登录，校验是否登录有效
        if (loginData.loginedCookies && loginData.etaxAccountType && loginData.pageId) {
            const res = await ctx.service.etaxFpdkLogin.common.commonPreCheck(decryedData);
            ctx.service.log.info('校验登录有效返回', res);
            // 前置检查目前已经登录，不需要再登录
            if (res.errcode === '0000' && res.data) {
                await ctx.service.etaxFpdkLogin.common.afterLoginSuccess(pageId);
                ctx.body = res;
                return;
            }
        }
        */

        try {
            await next();
        } catch (error) {
            ctx.service.log.info('服务端异常，checkLoginIsValid err', error);
            ctx.body = errcodeInfo.fpyInnerErr;
            return;
        }
    };
};

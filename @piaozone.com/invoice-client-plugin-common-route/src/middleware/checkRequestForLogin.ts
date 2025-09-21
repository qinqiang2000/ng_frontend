// 登录参数校验
export default (options: lockLoginOptions = {}) => {
    return async function checkRequestForLogin(ctx: ControllerCtxType, next: Function) {
        ctx.service.log.info('start check checkRequestForLogin');

        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            ctx.body = checkRes;
            return;
        }
        // 在登录过程中的接口底层调用不受影响
        ctx.request.query.ignoreLock = true;
        try {
            await next();
        } catch (error) {
            ctx.service.log.info('服务端异常，checkRequestForLongLinkEtaxLogin error', error);
            ctx.body = errcodeInfo.fpyInnerErr;
            return;
        }
    };
};

// 截屏中间件，主要用于登录过程中出现异常时统一截屏
export default (options = {}) => {
    return async function test(ctx, next) {
        await next();
        const { cityPageId } = ctx.request.query || {};
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[cityPageId] : null;
        ctx.service.log.info('screenshot start');
        if (nt && nt.nightmareWindow?.win) {
            const res = ctx.body;
            if (res.errcode !== '0000') {
                ctx.service.ntTools.screenshotAndUpload(nt);
            }
        } else {
            ctx.service.log.info('screenshot 窗口已经不存在');
        }
    };
};
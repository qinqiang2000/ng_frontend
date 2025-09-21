export default () => {
    return async function scanFaceCheck(ctx: any, next: Function) {
        await next();
        const { description = '' } = ctx.body;
        // 身份认证 扫脸认证
        if (~description.indexOf('身份认证') || ~description.indexOf('扫脸认证')) {
            // 上传认证失效状态
            ctx.service.ntTools.AuthLogsUpload(2);
            // 清除缓存
            ctx.service.scanFaceCheck.clearCacheForEtaxNotRequiredAuth();

            const res = await ctx.service.ntTools.lockForWxRelationAndSendMsgOrShowLoginWin({
                needLogin: false,
                checkAuth: true
            });
            if (res.errcode !== errcodeInfo.govAuthFail.errcode) {
                ctx.service.log.info('middleware scanFaceCheck error', res);
                ctx.body = errcodeInfo.govAuthFail;
                return;
            }
            ctx.body = res;
        }
    };
};
/* eslint-disable complexity, no-undef */
export default (options = {}) => {
    return async function configStopRequest(ctx, next) {
        ctx.service.log.info('configStopRequest middleware before next');
        const { tenantNo } = ctx.request.query;
        const list = ['367076015893019648'];
        // 禁用的租户
        if (list.includes(tenantNo)) {
            ctx.service.log.info('stop tenantNo', tenantNo);
            ctx.body = {
                ...errcodeInfo.argsErr
            };
            return;
        }
        await next();
        ctx.service.log.info('configStopRequest middleware after next');
    };
};
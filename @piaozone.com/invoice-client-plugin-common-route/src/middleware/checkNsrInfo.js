export default (options = {}) => {
    return async function checkNsrInfo(ctx, next) {
        ctx.service.log.info('checkNsrInfo middleware before next');
        const { pageId, taxNo } = ctx.request.query;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const res = await ctx.service.switchCompany.queryCompanyInfo(pageId);
            if (res.errcode !== '0000' && res.errcode !== '91300') {
                ctx.body = res;
                return;
            }
            const { taxNo: Nsrsbh } = res.data || {};
            if (res.errcode === '91300' || Nsrsbh !== taxNo) {
                const { decryedData, etaxAccountInfo } = ctx.request.body;
                if (decryedData && etaxAccountInfo) {
                    await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
                }
                await ctx.service.ntTools.logoutClear();
                ctx.body = {
                    errcode: '91300',
                    description: '电子税局登录失效，请重试！'
                };
                return;
            }
        }
        await next();
        ctx.service.log.info('checkNsrInfo middleware after next');
    };
};
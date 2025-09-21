// import errcodeInfo from '$client/errcodeInfo';

export default (options = {}) => {
    return async function longMsgCache(ctx, next) {
        ctx.service.log.info('longMsgCache middleware before next plugin');
        if (ctx.request.query.fetchOrigin !== 'local' && ctx.request.query.access_token) { // 本地请求不缓存
            await next();
            if (ctx.body && ctx.body.errcode === '0000') {
                const cbody = JSON.stringify(ctx.body);
                if (cbody.length < 1000) { // 数据长度小于1000，不走S3
                    ctx.service.log.info('数据长度较小不走S3缓存', cbody.length);
                    return;
                }
                const startTime = +new Date();
                ctx.service.log.info('Rpa长报文上传接口保存开始');
                const res = await ctx.service.invoiceCache.saveLongMsgInvoices('', cbody);
                ctx.service.log.info('Rpa长报文上传接口保存结束 用时', (+new Date()) - startTime);
                if (res.errcode !== '0000') { // 出错后timeoutCache也不用执行
                    ctx.service.log.info('Rpa长报文上传接口保存结果', res);
                }
                ctx.body = res;
            }
        } else {
            await next();
        }
        ctx.service.log.info('longMsgCache middleware after next');
    };
};
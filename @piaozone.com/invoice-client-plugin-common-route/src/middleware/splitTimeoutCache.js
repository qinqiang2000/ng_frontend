/* eslint-disable complexity, no-undef */

export default (options = {}) => {
    return async function splitTimeoutCache(ctx, next) {
        ctx.service.log.info('timeoutCache middleware before next');
        const requestHashKeys = options.requestHashKeys || [];
        const pageNoKey = options.pageNoKey || [];
        let requestHash;
        let requestId = ctx.request.body.data?.requestId;
        if (ctx.request.body.data && typeof ctx.request.body.data === 'string') {
            requestId = ctx.request.body.decryedData?.requestId;
        }
        const decryedData = ctx.request.body.decryedData || {};
        const requestPath = ctx.request.url.split('?')[0];
        const { fetchOrigin, access_token, taxNo, disabledCache } = ctx.request.query || {};
        if (fetchOrigin !== 'local' && access_token && taxNo) { // 本地请求不缓存
            const pageSize = options.pageSize;
            // 存在连续请求的requestId先查询缓存
            const maxTimeout = requestId ? 60 * 1000 : 0;
            if (requestHashKeys.length > 0) { // 通过接口的参数是否有变化控制缓存
                const hashContent = {};
                const len = requestHashKeys.length;
                for (let i = 0; i < len; i++) {
                    const k = requestHashKeys[i];
                    if (typeof decryedData[k] === 'undefined') {
                        break;
                    }
                    hashContent[k] = decryedData[k];
                }
                // 指定的参数都传了值
                if (len === Object.keys(hashContent).length) {
                    hashContent.pageSize = pageSize;
                    hashContent.requestPath = requestPath;
                    ctx.service.log.info('参数原始函数值', hashContent);
                    requestHash = hex_md5(JSON.stringify(hashContent));
                }
            }

            const pageNo = decryedData[pageNoKey];
            // 提取已经成功的本地缓存，最大时间等待2分钟
            const res2 = await ctx.service.tools.getRequestCache(taxNo, requestHash, {
                pageNo,
                pageSize,
                maxTimeout,
                disabledCache
            });

            if (res2) {
                ctx.service.log.info('直接提取缓存', taxNo, requestHash, res2);
                ctx.body = res2;
                return;
            }

            // 处理中
            await ctx.service.tools.setRequestCache(taxNo, requestHash, {
                status: 2
            });

            // const cbody = JSON.stringify(ctx.request.body || '{}');
            await next();

            if (ctx.body && ctx.body.errcode === '0000') {
                // 处理成功，写本地缓存
                await ctx.service.tools.setRequestCache(taxNo, requestHash, {
                    status: 1,
                    pageNo,
                    pageSize,
                    dataFromIndex: decryedData.dataFromIndex,
                    res: ctx.body
                });

                const res3 = await ctx.service.tools.getRequestCache(taxNo, requestHash, {
                    pageNo,
                    pageSize
                });
                ctx.service.log.info('获取缓存返回', res3);
                ctx.body = res3;
            } else {
                // 处理失败
                await ctx.service.tools.setRequestCache(taxNo, requestHash, {
                    status: 3
                });
            }
        } else {
            await next();
        }
        ctx.service.log.info('timeoutCache middleware after next', requestId);
    };
};
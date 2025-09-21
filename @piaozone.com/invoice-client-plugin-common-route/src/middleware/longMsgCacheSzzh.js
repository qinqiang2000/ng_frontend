// import errcodeInfo from '$client/errcodeInfo';
import { getUUId } from '../utils/getUid';

export default (options = {}) => {
    return async function longMsgCacheSzzh(ctx, next) {
        ctx.service.log.info('longMsgCacheSzzh middleware before next plugin1', ctx.request.query);
        const { fpdk_type, fetchOrigin } = ctx.request.query;
        if (fetchOrigin !== 'local' && Number(fpdk_type) !== 3 && Number(fpdk_type) !== 4) { // 本地请求、电子税局请求，不缓存
            await next();
            if (ctx.body && ctx.body.errcode === '0000') {
                const cbody = JSON.stringify(ctx.body);
                if (cbody.length < 1000) { // 数据长度小于1000，不走S3
                    ctx.service.log.info('数据长度较小不走S3缓存', cbody.length);
                    return;
                }
                const startTime = +new Date();
                ctx.service.log.info('长报文上传s3 开始', startTime);
                ctx.service.log.fullInfo('长报文上传s3 开始', cbody);
                const uid = getUUId();
                const s3Res = await ctx.service.s3Upload.uploadTextToS3(uid, cbody);
                let res = {};
                if (s3Res.errcode !== '0000') {
                    ctx.service.log.info('长报文缓存结果', s3Res);
                    res = {
                        ...s3Res,
                        description: s3Res.description || '长报文缓存出错'
                    };
                } else {
                    res = {
                        errcode: '0000',
                        msgType: 'downloadFile',
                        data: s3Res.data
                    };
                }
                ctx.service.log.info('长报文上传s3 结束 用时', (+new Date()) - startTime);
                ctx.body = res;
            }
        } else {
            await next();
        }
        ctx.service.log.info('longMsgCacheSzzh middleware after next');
    };
};
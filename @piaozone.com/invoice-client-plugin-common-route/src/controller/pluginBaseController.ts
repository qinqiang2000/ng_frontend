import { ntLockLoginPreKey, ntLockPreKey } from '../constants';

export class PluginBaseController {
    ctx: ControllerCtxType;
    app: any;
    constructor(opt: BaseControllerOptType) {
        this.ctx = opt.ctx;
        const config = this.ctx.app.config;
        // 云化版本没有长链接，没有完整的请求参数打印
        if (config.IS_CLOUD_VERSION) {
            this.ctx.service.log.fullInfo('请求的完整参数', this.ctx.request.body);
        }
    }

    async responseJson(resData: any, includeData?: boolean) {
        const ctx = this.ctx;
        const config = ctx.app.config;
        const { pageId } = ctx.request.query;
        const wssConnectInfo = ctx.request.body.wssConnectInfo || {};
        const { decryedData, etaxAccountInfo } = ctx.request.body;
        let description = resData.description || '服务端异常，请稍后再试';
        const traceId = ctx.uid;
        if (resData.errcode === '91300' && pageId) {
            if (decryedData && etaxAccountInfo) {
                await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
            }
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, '');
            pwyStore.delete(etaxLoginedCachePreKey + pageId);
            // 释放登录锁和检测锁
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
            await ctx.service.redisLock.delete(ntLockPreKey + pageId);
            await ctx.service.ntTools.closePage(pageId);
        }
        if (wssConnectInfo.name) {
            const namePre = wssConnectInfo.name.substr(0, 6);
            description = description + `[${namePre}-${traceId}]`;
        }
        if (typeof includeData === 'undefined') {
            includeData = true;
        }
        let body : any;
        if (includeData) {
            body = {
                ...resData,
                traceId,
                errcode: resData.errcode,
                data: resData.data,
                description: description
            };
        } else {
            body = {
                traceId,
                errcode: resData.errcode,
                description: description
            };
        }
        // 云化版本没有长链接，没有完整的返回打印日志
        if (config.IS_CLOUD_VERSION) {
            ctx.service.log.info('请求返回', body);
        }
        ctx.body = body;
    }
}
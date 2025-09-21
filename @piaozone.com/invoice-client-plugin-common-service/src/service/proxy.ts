export class Proxy extends BaseService {
    async getOneProxy() {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query;
        const url = ctx.app.config.baseUrl + `/proxy/invoice/client/get?access_token=${access_token}&taxNo=${taxNo}`;
        const res = await ctx.helper.request(url, {
            method: 'POST',
            dataType: 'json'
        });
        ctx.service.log.info('获取代理返回', res);
        return res;
    }

    async proxyTimeout() {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query;
        const url = ctx.app.config.baseUrl + `/proxy/invoice/client/timeout?access_token=${access_token}&taxNo=${taxNo}`;
        const res = await ctx.helper.request(url, {
            method: 'POST',
            dataType: 'json'
        });
        ctx.service.log.info('代理超时回复，res', res);
        return;
    }
}
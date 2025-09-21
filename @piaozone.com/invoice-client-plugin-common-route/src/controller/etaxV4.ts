// import errcodeInfo from '$client/errcodeInfo';
// import { BaseController } from './baseController';
import { PluginBaseController } from './pluginBaseController';

export class EtaxV4 extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    // 新版异步全量接口调用底层rpa入口
    async queryEtaxV4FullInvoice() {
        const ctx = this.ctx;
        const decryedData = ctx.request.body.decryedData || {};
        ctx.service.log.info('请求参数: decryedData', decryedData);
        const { taxNo, pageId } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        const res = await ctx.service.etaxFullV4InvoiceApply.apply({ ...loginData, taxNo }, decryedData);
        return await this.responseJson(res);
    }

    // 发票统计
    async invoiceStatics() {
        const ctx = this.ctx;
        const decryedData = ctx.request.body.decryedData || {};
        ctx.service.log.info('请求参数: decryedData', decryedData);
        const { taxNo, pageId } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        const res = await ctx.service.etaxFullV4Statics.apply({ ...loginData, taxNo }, decryedData);
        return await this.responseJson(res);
    }

    async unConfirmedInvoice() { // 待抵扣发票查询
        const ctx = this.ctx;
        const decryedData = ctx.request.body.decryedData || {};
        ctx.service.log.info('请求参数: decryedData', decryedData);
        const { taxNo, pageId } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        const res = await ctx.service.etaxV4QueryInvoices.unConfirmedInvoiceApply({ ...loginData, taxNo }, decryedData);
        return await this.responseJson(res);
    }

    async confirmedInvoice() { // 已抵扣发票查询
        const ctx = this.ctx;
        const decryedData = ctx.request.body.decryedData || {};
        ctx.service.log.info('请求参数: decryedData', decryedData);
        const { taxNo, pageId } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        const res = await ctx.service.etaxV4QueryInvoices.confirmedInvoiceApply({ ...loginData, taxNo }, decryedData);
        return await this.responseJson(res);
    }

    async invoiceDeductionCheck() {
        const ctx = this.ctx;
        const decryedData = ctx.request.body.decryedData || {};
        ctx.service.log.info('请求参数: decryedData', decryedData);
        const { taxNo, pageId } = ctx.request.query;
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        const res = await ctx.service.etaxV4InvoiceDeductionCheck.apply({ ...loginData, taxNo }, decryedData);
        return await this.responseJson(res);
    }
}
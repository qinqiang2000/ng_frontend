// import errcodeInfo from '$client/errcodeInfo';
// import { BaseController } from './baseController';
import { changeQueryInvoicesParam, changeEtaxQueryParam } from '../libs/govParamsChange';
import { PluginBaseController } from './pluginBaseController';

export class QueryInvoiceMain extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    async queryInvoices() {
        const ctx = this.ctx;
        const originOpt = ctx.request.body || {};
        let searchOpt = originOpt.searchOpt || {};
        let isSingleQuery = false;
        let fpdm = searchOpt.invoiceCode || searchOpt.fpdm || '';
        let fphm = searchOpt.invoiceNo || searchOpt.fphm || '';
        if (fpdm && fphm) {
            isSingleQuery = true;
        }
        ctx.service.log.info('请求参数 plugin controller ---', ctx.request.body);
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            const decryedData = ctx.request.body.decryedData || {};
            ctx.service.log.info('请求参数: decryedData', decryedData);
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }

            const checkRes1: any = changeEtaxQueryParam(decryedData);
            if (checkRes1.errcode !== '0000') {
                return await this.responseJson(checkRes1, false);
            }

            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;

            searchOpt = decryedData.searchOpt || {};
            isSingleQuery = false;
            fpdm = searchOpt.invoiceCode || searchOpt.fpdm || '';
            fphm = searchOpt.invoiceNo || searchOpt.fphm || '';
            if ((fpdm && fphm) || (fphm && fphm.length === 20)) {
                isSingleQuery = true;
            }
            if (isSingleQuery) {
                ctx.service.log.info('单张请求');
                const res = await ctx.service.etaxQueryInvoices.querySingleInvoice(access_token, loginData, {
                    invoiceCode: fpdm,
                    invoiceNo: fphm,
                    clientType: decryedData.clientType
                });
                return await this.responseJson(res);
            }
            const res = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, loginData, checkRes1.data);
            return await this.responseJson(res);
        }
        const checkRes = await ctx.service.ntTools.checkIsLogined();
        ctx.service.log.info('登录状态', checkRes);
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const requestData = changeQueryInvoicesParam(ctx.request.body);
        ctx.service.log.info('参数转换', requestData);
        let res;
        try {
            // 单张查询
            if (isSingleQuery) {
                res = await ctx.service.queryInvoicesV4.queryByfpdmFphm(checkRes.data, {
                    ...originOpt,
                    fpdm,
                    fphm
                });
                return await this.responseJson({
                    ...res,
                    endFlag: true
                });
            }
            res = await ctx.service.queryInvoicesV4.queryInvoices(checkRes.data, requestData);
        } catch (error) {
            ctx.service.log.info('勾选数据查询异常', error);
            return await this.responseJson({
                ...res,
                endFlag: true
            });
        }
        await this.responseJson(res);
    }

    async queryInvoiceByCodeNo() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数', originOpt);
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined({
                disabledAutoLogin: true
            });
            if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
                return await this.responseJson(checkRes, false);
            }
            originOpt = ctx.request.body.decryedData || {};
            ctx.service.log.info('请求参数: decryedData', originOpt);
            const { taxNo } = ctx.request.query;
            const loginData = checkRes.data || {};
            const access_token = loginData.access_token || ctx.request.query.access_token;
            const res = await ctx.service.etaxQueryInvoices.querySingleInvoice(access_token, { ...loginData, taxNo }, {
                invoiceCode: originOpt.fpdm || originOpt.invoiceCode,
                invoiceNo: originOpt.fphm || originOpt.invoiceNo,
                clientType: originOpt.clientType
            });
            return await this.responseJson(res);
        }

        const checkRes = await ctx.service.ntTools.checkIsLogined();
        if (checkRes.errcode !== '0000') {
            ctx.service.log.info('登录状态', checkRes);
            return await this.responseJson(checkRes, false);
        }

        const requestData = {
            ...originOpt,
            fpdm: originOpt.fpdm || originOpt.invoiceCode,
            fphm: originOpt.fphm || originOpt.invoiceNo
        };
        ctx.service.log.info('单张查询转换后参数', requestData);
        const res = await ctx.service.queryInvoicesV4.queryByfpdmFphm(checkRes.data, requestData);
        await this.responseJson(res);
    }

    async queryEtaxInvoiceApply() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数 plugin', originOpt);
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            originOpt = ctx.request.body.decryedData || {};
            ctx.service.log.info('请求参数: decryedData', originOpt);
            const { taxNo } = ctx.request.query;
            const loginData = checkRes.data || {};
            const access_token = loginData.access_token || ctx.request.query.access_token;
            let res;
            // 默认全部异步走新版
            if (taxNo === '91360502MA38QCAM89' || taxNo === '914401137250197883' || taxNo) {
                res = await ctx.service.etaxFullInvoiceApply.apply({ ...loginData, taxNo }, {
                    ...originOpt
                });
            } else {
                res = await ctx.service.etaxAsyncQueryInvoices.queryEtaxInvoiceApply(access_token, { ...loginData, taxNo }, {
                    ...originOpt
                });
            }
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式的发票异步下载'
        });
    }


    // 新版异步全量接口调用底层rpa入口
    async queryEtaxV4FullInvoice() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const decryedData = ctx.request.body.decryedData || {};
        ctx.service.log.info('请求参数: decryedData', decryedData);
        const { taxNo } = ctx.request.query;
        const loginData = checkRes.data || {};
        const res = await ctx.service.etaxFullV4InvoiceApply.apply({ ...loginData, taxNo }, decryedData);
        return await this.responseJson(res);
    }

    async searchqrbz() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { pageId, taxNo } = ctx.request.query || {};
        const res = await ctx.service.etaxLogin.dqskssq(pageId);
        if (res.errcode !== '0000') {
            return await this.responseJson(res, false);
        }

        const taxPeriod = res.data;
        const loginData = checkRes.data || {};
        const res2 = await ctx.service.etaxGxConfirm.isGxConfirm({
            ...loginData,
            taxPeriod,
            taxNo
        });
        if (res2.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        return await this.responseJson({
            ...errcodeInfo.success,
            data: {
                taxPeriod,
                isGxConfirm: res2.data
            }
        });
    }
}
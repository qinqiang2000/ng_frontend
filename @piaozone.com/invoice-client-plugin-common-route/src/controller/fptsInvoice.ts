

// import { BaseController } from './baseController';
// import errcodeInfo from '$client/errcodeInfo';

import { PluginBaseController } from './pluginBaseController';

export class FptsInvoice extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    async queryInvoiceGxts() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数11', originOpt);
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
            const res = await ctx.service.etaxQueryTaxReturnInvoices.queryInvoice(access_token, { ...loginData, taxNo }, {
                ...originOpt
            });
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    async tsgx() {
        const ctx = this.ctx;
        ctx.service.log.info('请求参数', ctx.request.body);

        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData', decryedData);
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;
            const res = await ctx.service.etaxTsgxInvoices.tsgxInvoices(loginData, decryedData, access_token);
            return await this.responseJson(res);
        }

        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    async tsytComfirm() {
        const ctx = this.ctx;
        ctx.service.log.info('请求参数', ctx.request.body);

        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData1', decryedData);
            ctx.service.log.info('请求参数: loginData.etaxAccountType', loginData.etaxAccountType);

            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;
            const res = await ctx.service.etaxTsgxInvoices.tsytComfirm(loginData, decryedData, access_token);
            return await this.responseJson(res);
        }

        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    async querytsytb() {
        const ctx = this.ctx;
        ctx.service.log.info('请求参数', ctx.request.body);

        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData1', decryedData);
            ctx.service.log.info('请求参数: loginData.etaxAccountType', loginData.etaxAccountType);

            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;
            const res = await ctx.service.etaxTsgxInvoices.querytsytb(loginData, decryedData, access_token);
            return await this.responseJson(res);
        }

        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    // 查询当期已勾选或往期已认证的发票
    async queryDdWqYgxInvoices() {
        const ctx = this.ctx;
        ctx.service.log.info('请求参数', ctx.request.body);

        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData1', decryedData);

            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;
            const res = await ctx.service.etaxQueryTaxReturnInvoices.ygxInvoices(access_token, loginData, decryedData);
            return await this.responseJson(res);
        }

        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }
}
import { PluginBaseController } from './pluginBaseController';

export class QueryInvoice extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    async entryMarkInvoices() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数', originOpt);
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
            // const access_token = loginData.access_token || ctx.request.query.access_token;
            const res = await ctx.service.etaxEntryMarkInvoices.syncEntryMakInvoices({ ...loginData, taxNo }, {
                ...originOpt
            }, 'submit');
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    async entryMarkUpdateInvoices() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数', originOpt);
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
            // const access_token = loginData.access_token || ctx.request.query.access_token;
            const res = await ctx.service.etaxEntryMarkInvoices.syncEntryMakInvoices({ ...loginData, taxNo }, {
                ...originOpt
            }, 'update');
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    async entryMarkQueryInvoices() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数', originOpt);
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
            // const access_token = loginData.access_token || ctx.request.query.access_token;
            const res = await ctx.service.etaxEntryMarkInvoices.queryMarkInvoice({ ...loginData, taxNo }, {
                ...originOpt
            });
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }

    async queryInvoicesFile() {
        const ctx = this.ctx;
        let originOpt = ctx.request.body;
        ctx.service.log.info('请求参数', originOpt);
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
            const res = await ctx.service.etaxQueryFullInvoices.queryInvoicesFile(access_token, { ...loginData, taxNo }, {
                ...originOpt
            });
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }
    async changeSkssq() {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData', decryedData);
            const res = await ctx.service.etaxDkgxInvoices.changeSkssq(loginData, decryedData);
            return await this.responseJson(res);
        }
    }

    async queryInvoices() {
        const ctx = this.ctx;
        ctx.service.log.info('plugin 请求参数------', ctx.request.body);
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {

            if (!ctx.request.query.access_token && ctx.request.body.data.tenantNo) { // 客户端
                const token = await this.getAccessToken(ctx.request.body.data.tenantNo);
                ctx.request.query.access_token = token;
            }

            const checkRes = await ctx.service.ntTools.checkEtaxLogined({
                disabledAutoLogin: true
            });
            if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
                return await this.responseJson(checkRes, false);
            }
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData', decryedData);
            const { taxNo } = ctx.request.query;
            const loginData = checkRes.data || {};
            if (loginData.etaxAccountType && (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3)) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            const access_token = loginData.access_token || ctx.request.query.access_token;
            // const loginData = checkRes.data;
            const res = await ctx.service.etaxQueryFullInvoices.queryInvoices(access_token, { ...loginData, taxNo }, decryedData);
            if (res.errcode === '0000' && !res.description) {
                res.description = 'success';
            }
            return await this.responseJson(res);
        }
        const res = await ctx.service.querySzzhInvoices.queryInvoices(ctx.request.body);
        await this.responseJson(res);
    }

    // 获取token
    async getAccessToken(tenantNo: any) {
        const ctx = this.ctx;
        if (!tenantNo) {
            return {
                errcode: '0001',
                description: '无租户组织编码'
            };
        }
        const { otherAuth } = await ctx.db.tenant.findOne(tenantNo);
        const result = JSON.parse(Buffer.from(otherAuth, 'base64').toString());
        const { client_id, client_secret } = result;
        const checkRes = await ctx.service.ntTools.getAccessTokenApi({
            clientId: client_id,
            clientSecret: client_secret
        });
        const { access_token } = checkRes;
        return access_token;
    }

    // 获取token
    async getAccessTokenByTenantNo() {
        const ctx = this.ctx;
        const tenantNo = ctx.request.body.data.tenantNo;
        if (!tenantNo) {
            return await this.responseJson({
                errcode: '0001',
                description: '无租户组织编码'
            });
        }
        const token = await this.getAccessToken(tenantNo);
        return await this.responseJson({
            ...errcodeInfo.success,
            data: {
                token
            }
        });
    }

    async queryCustomBillInvoices() {
        const ctx = this.ctx;
        ctx.service.log.info('plugin queryCustomBillInvoices 请求参数------', ctx.request.body);
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {

            if (!ctx.request.query.access_token && ctx.request.body.data.tenantNo) { // 客户端
                const token = await this.getAccessToken(ctx.request.body.data.tenantNo);
                ctx.request.query.access_token = token;
            }

            const checkRes = await ctx.service.ntTools.checkEtaxLogined({
                disabledAutoLogin: true
            });
            if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
                return await this.responseJson(checkRes, false);
            }
            const decryedData = ctx.request.body.decryedData;
            ctx.service.log.info('请求参数: decryedData', decryedData);
            const { taxNo } = ctx.request.query;
            const loginData = checkRes.data || {};
            if (loginData.etaxAccountType && (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3)) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
            const access_token = loginData.access_token || ctx.request.query.access_token;
            // const loginData = checkRes.data;
            const res = await ctx.service.etaxQueryHgjkFullInvoices.queryInvoices(access_token, { ...loginData, taxNo }, decryedData);
            if (res.errcode === '0000' && !res.description) {
                res.description = 'success';
            }
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式'
        });
    }
}
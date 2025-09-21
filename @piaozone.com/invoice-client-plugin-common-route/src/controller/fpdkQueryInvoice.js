/* eslint-disable complexity, no-undef */
import { PluginBaseController } from './pluginBaseController';
import { changeEtaxQueryParam, createDqwcYgxQueryParam, changeQueryInvoicesParam } from '../libs/govParamsChange';

export class FpdkQueryInvoices extends PluginBaseController {
    async queryJksInvoices() {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes1 = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes1.errcode !== '0000') {
                return await this.responseJson(checkRes1, false);
            }
            // const loginData = await ctx.helper.getRedisInfo(pageId);
            const loginData = checkRes1.data;
            const decryedData = ctx.request.body.decryedData || {};
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }

            const checkRes = changeEtaxQueryParam(decryedData);
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes);
            }
            // 税局登录检查后token会自动添加到query里面
            // const access_token = ctx.request.query.access_token;

            const res1 = await ctx.service.etaxQueryJks.queryInvoices(ctx.request.query.access_token, loginData, checkRes.data);

            return await this.responseJson(res1);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式的海关缴款书下载'
        });
    }

    // 查询当期已勾选或往期已认证的发票
    async queryDdWqYgxInvoices() {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const requestData = ctx.request.body.decryedData || {};
            const loginData = checkRes.data;
            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;

            const { searchOpt = {} } = requestData;
            const curTaxPeriod = loginData.taxPeriod;
            const taxPeriod = searchOpt.taxPeriod || '';
            const curMonth = moment().format('YYYYMM');
            if (taxPeriod === '' || parseInt(taxPeriod) > parseInt(curMonth)) {
                return await this.responseJson(
                    {
                        ...errcodeInfo.argsErr,
                        description: '税期超出查询范围，请修改后查询!',
                        endFlag: true
                    }
                );
            }

            if (taxPeriod === curTaxPeriod) {
                const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(loginData);
                if (confirmRes.errcode !== '0000') {
                    return await this.responseJson({
                        ...confirmRes,
                        endFlag: true
                    });
                }
                const isConfirm = confirmRes.data === 'Y';
                loginData.isConfirm = isConfirm;
            }
            const resOpt = createDqwcYgxQueryParam(requestData, loginData);
            const res = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, loginData, resOpt);
            return await this.responseJson(res);
        }

        const checkRes = await ctx.service.ntTools.checkIsLogined();
        // const checkRes = { errcode: '0000', data: { gxrqfw: '20170101-20240507', skssq: '202405;20240522;202405', taxNo: '914419007510962180' } };
        ctx.service.log.info('登录状态', checkRes);
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const loginData = checkRes.data || {};
        const { skssq } = loginData;
        const curTaxPeriod = skssq.substr(0, 6);
        loginData.taxPeriod = curTaxPeriod;
        ctx.service.log.info('登录状态 1', loginData);
        const { taxPeriod } = ctx.request.body.searchOpt;
        if (taxPeriod === curTaxPeriod) {
            const confirmRes = await ctx.service.gxConfirmV4.dq_tjcx(loginData);
            ctx.service.log.info('税盘 查询统计表结果', confirmRes);
            if (confirmRes.errcode !== '0000') {
                return await this.responseJson({
                    ...confirmRes,
                    endFlag: true
                });
            }
            const { createTjbbStatus } = confirmRes.data;
            const isConfirm = createTjbbStatus === '05';
            loginData.isConfirm = isConfirm;
        }
        ctx.service.log.info('税盘 已勾选或已认证数据查询', ctx.request.body);
        const resOpt = createDqwcYgxQueryParam(ctx.request.body, loginData);
        ctx.service.log.info('参数转换1', resOpt);
        const requestData = changeQueryInvoicesParam(resOpt);
        ctx.service.log.info('参数转换', requestData);
        let res;
        try {
            res = await ctx.service.queryInvoicesV4.queryInvoices(loginData, requestData);
        } catch (error) {
            ctx.service.log.info('已勾选或已认证数据查询异常', error);
            return await this.responseJson({
                ...res,
                endFlag: true
            });
        }
        return await this.responseJson(res);

        // return await this.responseJson({
        //     ...errcodeInfo.argsErr,
        //     description: '目前税盘模式还不支持该接口'
        // });
    }


    // 查询当期已勾选或往期已认证的海关缴款书
    async queryDdWqYgxCustomBill() {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const requestData = ctx.request.body.decryedData || {};
            const loginData = checkRes.data;
            // 税局登录检查后token会自动添加到query里面
            const access_token = ctx.request.query.access_token;
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }

            const { searchOpt = {} } = requestData;
            const curTaxPeriod = loginData.taxPeriod;
            const taxPeriod = searchOpt.taxPeriod || '';
            const curMonth = moment().format('YYYYMM');
            if (taxPeriod === '' || parseInt(taxPeriod) > parseInt(curMonth)) {
                return await this.responseJson(
                    {
                        ...errcodeInfo.argsErr,
                        description: '税期超出查询范围，请修改后查询!',
                        endFlag: true
                    }
                );
            }
            if (taxPeriod === curTaxPeriod) {
                const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(loginData);
                if (confirmRes.errcode !== '0000') {
                    return await this.responseJson(
                        {
                            ...confirmRes,
                            endFlag: true
                        }
                    );
                }
                const isConfirm = confirmRes.data === 'Y';
                loginData.isConfirm = isConfirm;
            }
            const resOpt = createDqwcYgxQueryParam(requestData, loginData);
            const res = await ctx.service.etaxQueryJks.queryInvoices(access_token, loginData, resOpt);
            return await this.responseJson(res);
        }
        return await this.responseJson({
            ...errcodeInfo.argsErr,
            description: '目前还不支持税盘模式的海关缴款书下载'
        });
    }

    // 全量发票查询
    async queryFullInvoices() {
        const ctx = this.ctx;
        const { access_token, pageId } = ctx.request.query;
        const loginData = await ctx.helper.getRedisInfo(pageId);
        const res = await ctx.service.etaxQueryFullInvoices.queryInvoices(access_token, loginData, ctx.request.body);
        await ctx.helper.response({
            result: res
        });
    }
}

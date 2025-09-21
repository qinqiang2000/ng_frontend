import { PluginBaseController } from './pluginBaseController';
export class JilinController extends PluginBaseController {
    async stepOneLogin() {
        const ctx = this.ctx;
        ctx.service.log.info('-stepOneLogin-');
        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { decryedData } = checkRes.data;
        const res = await ctx.service.etaxFpdkLogin.jilin.stepOneLogin({ data: decryedData });
        await this.responseJson(res);
    }


    async sendShortMsg() {
        const ctx = this.ctx;

        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { decryedData } = checkRes.data;
        const res = await ctx.service.etaxFpdkLogin.jilin.sendShortMsg({ data: decryedData });
        await this.responseJson(res);
    }

    async stepTwoLogin() {
        const ctx = this.ctx;

        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { tenantNo, taxNo, companyName, loginAccountUid, decryedData } = checkRes.data;
        const res = await ctx.service.etaxFpdkLogin.jilin.login({ data: decryedData });
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        const { etaxAccountType } = res.data;

        // 更新客户端与服务端全电账号
        const opt = {
            city: decryedData.city || '吉林',
            etaxName: decryedData.etaxName || 'jilin',
            autoLogin: false,
            taxNo,
            companyName,
            loginAccountUid,
            tenantNo,
            etaxAccount: decryedData,
            etaxAccountType
        };
        const updateRes = await ctx.service.etaxLogin.updateOrCreateEtaxAccount(opt);
        if (updateRes.errcode !== '0000') {
            return await this.responseJson(updateRes);
        }

        // 通知客户端与长链接页面
        await ctx.service.etaxLogin.afterLogin(updateRes, loginAccountUid);
        await this.responseJson(res);
    }
}
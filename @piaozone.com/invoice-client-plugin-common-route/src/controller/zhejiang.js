import { PluginBaseController } from './pluginBaseController';
export class ZhejiangController extends PluginBaseController {
    async login() {
        const ctx = this.ctx;
        ctx.service.log.info('-login-');
        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { tenantNo, taxNo, companyName, loginAccountUid, decryedData } = checkRes.data;
        const res = await ctx.service.etaxFpdkLogin.zhejiang.login({ data: decryedData });
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        const { etaxAccountType } = res.data;

        // 更新客户端与服务端数电账号
        const opt = {
            city: decryedData.city || '浙江',
            etaxName: decryedData.etaxName || 'zhejiang',
            autoLogin: true,
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
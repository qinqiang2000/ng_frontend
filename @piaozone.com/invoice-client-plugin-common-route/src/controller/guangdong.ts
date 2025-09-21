import { PluginBaseController } from './pluginBaseController';

export class GuangdongController extends PluginBaseController {
    async login() {
        const ctx = this.ctx;
        ctx.service.log.info('plugin route-------------');
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        // 从前置中间件获取数据
        const { tenantNo, taxNo, companyName, loginAccountUid, decryedData } = checkRes.data;
        const res = await ctx.service.etaxFpdkLogin.guangdong.login({ data: decryedData });
        if (res.errcode !== '0000') {
            // 登录出现错误可能是密码错误，需要将登录设置为非自动登录，并同步到当前的客户端, 下次请求到这个客户端后将会触发手动输入
            const errRes = await ctx.service.etaxLogin.loginError(res, {
                tenantNo,
                taxNo,
                loginAccountUid,
                etaxAccount: decryedData
            });
            await this.responseJson(errRes);
            return;
        }
        const { etaxAccountType } = res.data;

        // 更新客户端与服务端数电账号
        const opt = {
            city: decryedData.city || '广东',
            etaxName: decryedData.etaxName || 'guangdong',
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

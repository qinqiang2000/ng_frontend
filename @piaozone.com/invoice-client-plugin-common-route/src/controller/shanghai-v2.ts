import { PluginBaseController } from './pluginBaseController';

export class ShanghaiV2Controller extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    async stepOneLogin() {
        const ctx = this.ctx;

        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { decryedData } = checkRes.data;

        const res = await ctx.service.etaxFpdkLogin.shanghaiV2.stepOneLogin({ data: decryedData });
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

        const res = await ctx.service.etaxFpdkLogin.shanghaiV2.sendShortMsg({ data: decryedData });
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

        // login 登录状态检测取消
        const res = await ctx.service.etaxFpdkLogin.shanghaiV2.login({
            data: decryedData,
            needCheck: false
        });
        ctx.service.log.info('登录返回', res);
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        const { etaxAccountType } = res.data;

        // 添加或更新服务端与客户端的电子税局账号
        const opt = {
            city: '上海',
            etaxName: 'shanghai',
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
import { PluginBaseController } from './pluginBaseController';

export class ShanghaiV1Controller extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    async queryUserList() {
        const ctx = this.ctx;

        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { decryedData } = checkRes.data;

        const res = await ctx.service.etaxFpdkLogin.shanghaiV1.queryUserList({ data: decryedData });
        await this.responseJson(res);
    }

    async selectLoginType() {
        const ctx = this.ctx;

        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { decryedData } = checkRes.data;

        const res = await ctx.service.etaxFpdkLogin.shanghaiV1.selectLoginType({ data: decryedData });
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

        const res = await ctx.service.etaxFpdkLogin.shanghaiV1.sendShortMsg({ data: decryedData });
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
        const { realLoginType, realUserName } = decryedData;

        // 初始化时，第一步登录无loginAccountUid默认为税号，需在第二步登录时替换为realUserName；后续登录会携带loginAccountUid, 无需替换
        // 检测loginAccountUid是否为realUserName
        // 实际需存储的realPageId与realLoginAccountUid
        let realLoginAccountUid = loginAccountUid;
        let realPageId;
        if (loginAccountUid !== realUserName) {
            realLoginAccountUid = realUserName;
            // 税局页面ID
            const pageIdRes = await ctx.service.ntTools.createPageId(tenantNo, taxNo, realLoginAccountUid);
            if (pageIdRes.errcode !== '0000') {
                return pageIdRes;
            }
            realPageId = pageIdRes.data;
        }

        // login 登录状态检测取消
        const res = await ctx.service.etaxFpdkLogin.shanghaiV1.login({
            data: decryedData,
            realPageId
        });
        ctx.service.log.info('登录返回', res);
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        const { etaxAccountType } = res.data;

        // 实际需存储的realPageId与realLoginAccountUid
        // 添加或更新服务端与客户端的电子税局账号
        const opt = {
            city: '上海',
            etaxName: 'shanghai',
            autoLogin: realLoginType === 1, // realLoginType登录方式 1自然人密码 2短信登录
            taxNo,
            companyName,
            loginAccountUid: realLoginAccountUid,
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
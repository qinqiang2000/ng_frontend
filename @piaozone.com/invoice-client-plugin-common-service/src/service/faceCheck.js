/* eslint-disable no-undef */
export class FaceCheck extends BaseService {
    async getCheckUrl() {
        const ctx = this.ctx;
        const { taxNo } = ctx.request.query;
        const { etaxAccountInfo, decryedData } = ctx.request.body;
        const authCodeRes = await ctx.service.fpyTokenInfo.getAuthCode(etaxAccountInfo.tenantNo, taxNo);
        if (authCodeRes.errcode !== '0000') {
            return authCodeRes;
        }
        const auth_code = authCodeRes.auth_code;

        const resName = await ctx.service.ntTools.getLongLinkName(etaxAccountInfo.tenantNo);
        if (resName.errcode !== '0000') {
            return resName;
        }
        const longLinkName = resName.data;

        const resLoginWebUrl = await ctx.service.etaxLogin.getEtaxLoginWebUrl({
            auth_code,
            taxNo,
            longLinkName,
            loginAccountUid: decryedData.account,
            checkAuth: true
        });
        return resLoginWebUrl;
    }
}
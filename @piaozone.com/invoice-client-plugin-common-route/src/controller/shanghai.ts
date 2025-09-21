import { PluginBaseController } from './pluginBaseController';
import { ShanghaiV1Controller } from './shanghai-v1';
import { ShanghaiV2Controller } from './shanghai-v2';

export class ShanghaiController extends PluginBaseController {
    private opt: BaseControllerOptType;
    constructor(opt: BaseControllerOptType) {
        super(opt);
        this.opt = opt;
    }

    async stepTwoLogin() {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query;
        const requestData = ctx.request.body;

        if (!access_token || !taxNo) {
            return this.responseJson(errcodeInfo.argsErr);
        }

        if (requestData.data && typeof requestData.data !== 'string') {
            return this.responseJson(errcodeInfo.argsErr);
        }

        // 数据解密
        const deRes = await ctx.service.etaxLogin.decryData(requestData.data);
        if (deRes.errcode !== '0000') {
            return this.responseJson(deRes);
        }
        const decryedData = deRes.data;
        const { realLoginType } = decryedData;

        let shanghai;
        if (typeof realLoginType !== 'undefined') {
            // 有值旧版
            ctx.service.log.info('登录方式 旧版');
            shanghai = new ShanghaiV1Controller(this.opt);
        } else {
            // 无值新版
            ctx.service.log.info('登录方式 新版');
            shanghai = new ShanghaiV2Controller(this.opt);
        }

        await shanghai.stepTwoLogin();
    }
}
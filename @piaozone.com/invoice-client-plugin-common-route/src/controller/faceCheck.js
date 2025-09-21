import { PluginBaseController } from './pluginBaseController';
export class FaceCheck extends PluginBaseController {
    async getUrl() {
        const ctx = this.ctx;
        ctx.service.log.info('-------------------getUrl');
        const res = await ctx.service.faceCheck.getCheckUrl();
        await this.responseJson(res);
    }
}
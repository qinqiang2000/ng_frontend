import { HelperController } from '../controller/helper';
export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/clear/wins',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).clearWins()
    }, {
        path: '/fpdk/etax/helper/tenant/query',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).queryDbTenant()
    }, {
        path: '/fpdk/etax/helper/sync/tenant/db',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).syncTenant()
    }, {
        path: '/fpdk/etax/helper/display/nt',
        method: 'GET',
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).displayNt()
    }, {
        path: '/fpdk/ping/check',
        method: 'ALL',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).pingTest()
    }, {
        path: '/fpdk/etax/request/gov', // 用于直接校验底层发送税局请求
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).checkRequest()
    }, {
        path: '/fpdk/etax/open/govPage', // 直接通过cookie打开税局界面，方便查看调试
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).openGovPage()
    }, {
        path: '/etax/app/client/restart', // 直接通过cookie打开税局界面，方便查看调试
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HelperController(opt).restartClient()
    }];
}
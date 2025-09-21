import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

import { ShanghaiController } from '../controller/shanghai';
import { ShanghaiV1Controller } from '../controller/shanghai-v1';
import { ShanghaiV2Controller } from '../controller/shanghai-v2';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/shanghai/queryUserList',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ isShanghaiLogin: true }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiV1Controller(opt).queryUserList()
    }, {
        path: '/fpdk/etax/shanghai/selectLoginType',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ isShanghaiLogin: true }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiV1Controller(opt).selectLoginType()
    }, {
        path: '/fpdk/etax/shanghai/sendShortMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ isShanghaiLogin: true }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiV1Controller(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/shanghai/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ isShanghaiLogin: true }), // 特殊标记上海登录，旧版和新版第二次登录共用，需要区分
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiController(opt).stepTwoLogin()
    }, {
        path: '/fpdk/etax/shanghai-v2/stepOneLogin',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiV2Controller(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/shanghai-v2/sendShortMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiV2Controller(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/shanghai-v2/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanghaiController(opt).stepTwoLogin()
    }];
}



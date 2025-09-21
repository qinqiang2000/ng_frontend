import { HunanController } from '../controller/hunan';
import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/hunan/stepOneLogin',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HunanController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/hunan/sendShortMsg',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HunanController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/hunan/stepTwo/login',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new HunanController(opt).stepTwoLogin()
    }];
}

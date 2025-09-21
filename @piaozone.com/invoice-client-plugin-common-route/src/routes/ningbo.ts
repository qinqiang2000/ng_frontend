import screenshot from '../middleware/screenshot';
import { NingboController } from '../controller/ningbo';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/ningbo/stepOneLogin',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new NingboController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/ningbo/sendShortMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new NingboController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/ningbo/stepTwo/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new NingboController(opt).stepTwoLogin()
    }];
}

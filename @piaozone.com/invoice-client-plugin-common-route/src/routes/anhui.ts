import { AnhuiController } from '../controller/anhui';
import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/anhui/stepOneLogin',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new AnhuiController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/anhui/sendShortMsg',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new AnhuiController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/anhui/stepTwo/login',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new AnhuiController(opt).stepTwoLogin()
    }];
}

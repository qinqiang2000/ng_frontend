import screenshot from '../middleware/screenshot';
import { FujianController } from '../controller/fujian';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/fujian/stepOne/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new FujianController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/fujian/sendShortMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new FujianController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/fujian/stepTwo/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new FujianController(opt).stepTwoLogin()
    }];
}

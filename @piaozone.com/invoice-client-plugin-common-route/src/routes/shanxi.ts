import screenshot from '../middleware/screenshot';
import { ShanxiController } from '../controller/shanxi';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/shanxi/stepOne/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanxiController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/shanxi/sendShortMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanxiController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/shanxi/stepTwo/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new ShanxiController(opt).stepTwoLogin()
    }];
}

import { LiaoningController } from '../controller/liaoning';
import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/liaoning/stepOneLogin',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new LiaoningController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/liaoning/sendShortMsg',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new LiaoningController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/liaoning/stepTwo/login',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new LiaoningController(opt).stepTwoLogin()
    }];
}

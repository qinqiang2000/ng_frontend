import { ShandongController } from '../controller/shandong';
import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/shandong/stepOneLogin',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new ShandongController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/shandong/sendShortMsg',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new ShandongController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/shandong/stepTwo/login',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new ShandongController(opt).stepTwoLogin()
    }];
}

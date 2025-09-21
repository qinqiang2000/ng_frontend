import { JiangxiController } from '../controller/jiangxi';
import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/jiangxi/stepOneLogin',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new JiangxiController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/jiangxi/sendShortMsg',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new JiangxiController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/jiangxi/stepTwo/login',
        method: 'POST',
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new JiangxiController(opt).stepTwoLogin()
    }];
}

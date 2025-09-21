import screenshot from '../middleware/screenshot';
import { QingdaoController } from '../controller/qingdao';

import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/qingdao/stepOne/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new QingdaoController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/qingdao/sendPhoneMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new QingdaoController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/qingdao/stepTwo/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new QingdaoController(opt).stepTwoLogin()
    }];
}
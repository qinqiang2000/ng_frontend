import LoginCommonController from '../controller/loginCommon';
import screenshot from '../middleware/screenshot';
import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/common/stepOneLogin',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ step: 'first' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new LoginCommonController(opt).stepOneLogin()
    }, {
        path: '/fpdk/etax/common/sendShortMsg',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin(),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new LoginCommonController(opt).sendShortMsg()
    }, {
        path: '/fpdk/etax/common/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild(),
            lockLogin({ step: 'last' }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new LoginCommonController(opt).login()
    }, {
        path: '/fpdk/etax/common/login/test',
        method: 'GET',
        handleFunc: (opt: BaseControllerOptType) => new LoginCommonController(opt).apiTest()
    }, {
        path: '/fpdk/etax/company/auth',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new LoginCommonController(opt).companyAuth()
    }];
}

import screenshot from '../middleware/screenshot';
import { HubeiController } from '../controller/hubei';

import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';
export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/hubei/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ autoLogin: true }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new HubeiController(opt).login()
    }];
}

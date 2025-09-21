import { GuangdongController } from '../controller/guangdong';
import screenshot from '../middleware/screenshot';

import lockLogin from '../middleware/lockLogin';
import checkRequestForLogin from '../middleware/checkRequestForLogin';
import checkLoginIsVaild from '../middleware/checkLoginIsValid';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/guangdong/login',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            checkRequestForLogin(),
            checkLoginIsVaild({ closeNotVaildNt: true }),
            lockLogin({ autoLogin: true }),
            screenshot()
        ],
        handleFunc: (opt: BaseControllerOptType) => new GuangdongController(opt).login()
    }];
}

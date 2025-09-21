import LoginController from '../controller/login';

const pathPre = '';
export default function routes(app: any) {
    return [{
        path: `${pathPre}/fpdk/getSkssq`,
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new LoginController(opt).getSkssq()
    }, {
        path: '/fpdk/etax/login/type',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new LoginController(opt).getLoginType()
    }];
}
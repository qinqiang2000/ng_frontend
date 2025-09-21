import { FptsInvoice } from '../controller/fptsInvoice';

export default function routes(app: any) {
    return [{
        path: '/fpdk/tsgx/queryInvoices',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache(),
            app.middleware.longMsgCache()
        ],
        handleFunc: (opt: BaseControllerOptType) => new FptsInvoice(opt).queryInvoiceGxts()
    }, {
        path: '/fpdk/tsgx/gxInvoices',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FptsInvoice(opt).tsgx(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache(),
            app.middleware.longMsgCache()
        ]
    }, {
        path: '/fpdk/tsgx/tsytComfirm',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FptsInvoice(opt).tsytComfirm(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache()
        ]
    }, {
        path: '/fpdk/tsgx/querytsytb',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FptsInvoice(opt).querytsytb(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache()
        ]
    }, {
        path: '/fpdk/tsyt/ygxInvoices',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FptsInvoice(opt).queryDdWqYgxInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache(),
            app.middleware.longMsgCache()
        ]
    }];
}
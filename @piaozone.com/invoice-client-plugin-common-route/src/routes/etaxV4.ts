

import { EtaxV4 } from '../controller/etaxV4';
import checkNsrInfo from '../middleware/checkNsrInfo';

const pathPre = '';
export default function routes(app: any) {
    return [{
        path: `${pathPre}/fpdk/etax/v4/full/invoice/query`, // 全量异步接口
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new EtaxV4(opt).queryEtaxV4FullInvoice(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            checkNsrInfo()
        ]
    }, {
        path: `${pathPre}/fpdk/etax/v4/invoice/statistics`, // 全量统计接口
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new EtaxV4(opt).invoiceStatics(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            checkNsrInfo()
        ]
    }, {
        path: `${pathPre}/etax/invoice/confirmed/header/apply`, // 表头历史已抵扣异步接口
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new EtaxV4(opt).confirmedInvoice(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            checkNsrInfo()
        ]
    }, {
        path: `${pathPre}/etax/invoice/unconfirmed/header/apply`, // 表头待抵扣发票列表查询
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new EtaxV4(opt).unConfirmedInvoice(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            checkNsrInfo()
        ]
    }, {
        path: `${pathPre}/etax/invoice/deduction/check/apply`, // 发票勾选
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new EtaxV4(opt).invoiceDeductionCheck(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            checkNsrInfo()
        ]
    }];
}

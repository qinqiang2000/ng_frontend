
import { QueryInvoice } from '../controller/queryInvoice';
import { FpdkOldCom } from '../controller/fpdkOldCom';
import { QueryInvoiceMain } from '../controller/queryInvoceMain';
import { FpdkQueryInvoices } from '../controller/fpdkQueryInvoice';
import scanFaceCheck from '../middleware/scanFaceCheck';
import checkNsrInfo from '../middleware/checkNsrInfo';
import longMsgCache from '../middleware/longMsgCache';
import longMsgCacheSzzh from '../middleware/longMsgCacheSzzh';
import splitTimeoutCache from '../middleware/splitTimeoutCache';
import configStopRequest from '../middleware/configStopRequest';
const pathPre = '';
export default function routes(app: any) {
    return [{
        path: '/fpdk/entry/mark/submit',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).entryMarkInvoices(),
        middlewares: [scanFaceCheck()]
    }, {
        path: '/fpdk/entry/mark/update',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).entryMarkUpdateInvoices(),
        middlewares: [scanFaceCheck()]
    }, {
        path: '/fpdk/entry/mark/query',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).entryMarkQueryInvoices(),
        middlewares: [scanFaceCheck()]
    }, {
        path: '/fpdk/taxPeriod',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).changeSkssq(),
        middlewares: [scanFaceCheck()]
    }, {
        path: '/fpdk/queryFullInvoices',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).queryInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.timeoutCache(),
            longMsgCacheSzzh()
        ]
    }, { // 旧组件接口兼容
        path: '/recvinv',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkOldCom(opt).recvinv(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            longMsgCache(),
            longMsgCacheSzzh()
        ]
    }, { // 旧组件接口兼容
        path: '/easydkquery',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkOldCom(opt).easydkquery(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            longMsgCache(),
            longMsgCacheSzzh()
        ]
    }, {
        path: '/fpcheck',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkOldCom(opt).fpcheck(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq()
        ]
    }, {
        path: '/fpcheckconfirm',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkOldCom(opt).fpcheckconfirm(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq()
        ]
    }, {
        path: '/taxqrgycx',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkOldCom(opt).taxqrgycx(),
        middlewares: [
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq()
        ]
    }, {
        path: '/invoicequery',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkOldCom(opt).invoicequery()
    }, {
        path: '/fpdk/query/ygxInvoices',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkQueryInvoices(opt).queryDdWqYgxInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            splitTimeoutCache({
                pageSize: 5000,
                pageNoKey: 'dataIndex',
                requestHashKeys: [
                    'searchOpt',
                    'dataFromIndex',
                    'taxNo'
                ]
            }),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.getSkssq()
        ]
    }, {
        path: '/fpdk/query/ygxCustomBill',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new FpdkQueryInvoices(opt).queryDdWqYgxCustomBill(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache()
        ]
    }, {
        path: `${pathPre}/fpdk/queryInvoice`,
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoiceMain(opt).queryInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            splitTimeoutCache({
                pageSize: 5000,
                pageNoKey: 'dataIndex',
                requestHashKeys: [
                    'searchOpt',
                    'dataFromIndex',
                    'taxNo'
                ]
            }),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.getSkssq()
        ]
    }, {
        path: `${pathPre}/fpdk/queryinvoice`,
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoiceMain(opt).queryInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache(),
            longMsgCache(),
            app.middleware.checkFullInvoice()
        ]
    }, {
        path: `${pathPre}/fpdk/queryInvoices`,
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoiceMain(opt).queryInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.getSkssq(),
            app.middleware.timeoutCache(),
            longMsgCache(),
            app.middleware.checkFullInvoice()
        ]
    }, {
        path: `${pathPre}/fpdk/etax/invoice/apply`,
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoiceMain(opt).queryEtaxInvoiceApply(),
        middlewares: [
            app.middleware.checkRequest(),
            configStopRequest(),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.getSkssq()
        ]
    }, {
        path: `${pathPre}/fpdk/searchqrbz`,
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoiceMain(opt).searchqrbz()
    }, {
        path: `${pathPre}/fpdk/getAccessToken/tenantNo`,
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).getAccessTokenByTenantNo()
    }, {
        path: '/fpdk/customBill/queryFull',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new QueryInvoice(opt).queryCustomBillInvoices(),
        middlewares: [
            app.middleware.checkRequest(),
            app.middleware.checkEtaxLogined(),
            checkNsrInfo(),
            app.middleware.timeoutCache(),
            longMsgCache()
        ]
    }];
}

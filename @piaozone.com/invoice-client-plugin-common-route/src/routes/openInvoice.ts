
import { OpenInvoice } from '../controller/openInvoice';
import scanFaceCheck from '../middleware/scanFaceCheck';

export default function routes(app: any) {
    return [{
        path: '/fpdk/etax/red/confirmBill/detail/query',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).queryConfirmDetail()
    }, {
        path: '/fpdk/etax/paper/invoice/cancel',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).cancelPaperInvoice()
    }, {
        path: '/fpdk/etax/bill/invoice/create',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).openInvoice(),
        middlewares: [scanFaceCheck()]
    }, {
        path: '/fpdk/etax/account/status',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).getEtaxAccountStatus()
    }, {
        path: '/fpdk/etax/invoice/qr/address', // 获取发票二维码交互的永久地址
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).getInvoiceQrAddress()
    }, {
        path: '/fpdk/etax/open/invoice/download',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).downloadInvoiceFile()
    }, {
        path: '/fpdk/etax/openInvoice/status/query',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).openInvoiceStatusQuery()
    }, {
        path: '/fpdk/etax/bill/invoice/red/apply',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new OpenInvoice(opt).redInvoiceApply()
    }];
}

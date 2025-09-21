import { EtaxOpen } from './service/etaxOpen';
import { OpenSingleInvoice } from './service/openSingleInvoice';
import { OpenInvoice } from './service/openInvoice';
import { OpenRedInvoice } from './service/openRedInvoice';
import { ScanFaceCheckService } from './service/scanFaceCheck';
import { OpenHistory } from './service/openHistory';
import { OpenEtaxPaperInvoice } from './service/openEtaxPaperInvoice';
import { OpenInvoiceQuery } from './service/openInvoiceQuery';

export default {
    openInvoice: OpenInvoice,
    openRedInvoice: OpenRedInvoice,
    etaxOpen: EtaxOpen,
    openSingleInvoice: OpenSingleInvoice,
    scanFaceCheck: ScanFaceCheckService,
    openHistory: OpenHistory,
    openEtaxPaperInvoice: OpenEtaxPaperInvoice,
    openInvoiceQuery: OpenInvoiceQuery
};
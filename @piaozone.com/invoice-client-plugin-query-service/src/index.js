import { EtaxQueryInvoices } from './service/etaxQueryInvoices';
import { EtaxExportInvoice } from './service/etaxExportInvoice';
import { EtaxQueryFullInvoices } from './service/etaxQueryFullInvoices';
import { EtaxTsgxInvoices } from './service/etaxTsgxInvoices';
import { EtaxQueryTaxReturnInvoices } from './service/etaxQueryTaxReturnInvoices';
import { EtaxDkgxInvoices } from './service/etaxDkgxInvoices';
import { EtaxBdkgxInvoices } from './service/etaxBdkgxInvoices';
import { EtaxEntryMarkInvoices } from './service/etaxEntryMarkInvoices';
import { InvoiceSaveFiles } from './service/invoiceSaveFiles';
import { QuerySzzhInvoices } from './service/fpdkSzzhInvoices';
import { QueryInvoicesV4 } from './service/queryInvoicesV4';
import { EtaxAsyncQueryInvoices } from './service/etaxAsyncQueryInvoices';
import { InvoiceSave } from './service/invoiceSave';
import { EtaxQueryHgjkFullInvoices } from './service/etaxQueryHgjkFullInvoices';
import { EtaxFullInvoiceApply } from './service/etaxFullInvoiceApply';
import { EtaxJksDkgx } from './service/etaxJksDkgx';
import { EtaxFullV4InvoiceApply } from './service/etaxFullV4InvoiceApply';
import { EtaxV4QueryInvoices } from './service/etaxV4QueryInvoices';
import { EtaxFullV4Static } from './service/etaxFullV4Statics.ts';
import { EtaxV4InvoiceDeductionCheck } from './service/etaxV4InvoiceDeductionCheck';
import { EtaxQueryJks } from './service/etaxQueryJks';
import { GxConfirmV4 } from './service/gxConfirmV4';

export default {
    etaxQueryInvoices: EtaxQueryInvoices,
    etaxExportInvoice: EtaxExportInvoice,
    etaxQueryFullInvoices: EtaxQueryFullInvoices,
    etaxTsgxInvoices: EtaxTsgxInvoices,
    etaxQueryTaxReturnInvoices: EtaxQueryTaxReturnInvoices,
    etaxDkgxInvoices: EtaxDkgxInvoices,
    etaxBdkgxInvoices: EtaxBdkgxInvoices,
    etaxEntryMarkInvoices: EtaxEntryMarkInvoices,
    invoiceSaveFiles: InvoiceSaveFiles,
    querySzzhInvoices: QuerySzzhInvoices,
    queryInvoicesV4: QueryInvoicesV4,
    etaxAsyncQueryInvoices: EtaxAsyncQueryInvoices,
    invoiceSave: InvoiceSave,
    etaxQueryHgjkFullInvoices: EtaxQueryHgjkFullInvoices,
    etaxFullInvoiceApply: EtaxFullInvoiceApply,
    etaxJksDkgx: EtaxJksDkgx,
    etaxFullV4InvoiceApply: EtaxFullV4InvoiceApply,
    etaxV4QueryInvoices: EtaxV4QueryInvoices,
    etaxFullV4Statics: EtaxFullV4Static,
    etaxV4InvoiceDeductionCheck: EtaxV4InvoiceDeductionCheck,
    etaxQueryJks: EtaxQueryJks,
    gxConfirmV4: GxConfirmV4
};
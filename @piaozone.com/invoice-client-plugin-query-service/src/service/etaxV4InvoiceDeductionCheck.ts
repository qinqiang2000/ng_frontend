import t from '../libs/validate';
import { govGxInvoiceTypes, gxInvoiceTypes } from './etaxV4QueryInvoices';
export class EtaxV4InvoiceDeductionCheck extends BaseService {
    checkArgs(opt: any) {
        const deductionPurposeList = ['1', '2', '3'];
        const authenticateFlagList = [0, 1];
        const notDeductibleTypeList = [1, 2, 3, 4, 5];
        const CheckInvoiceItemType = t.type({
            salerName: t.notEmpty('销方名称'),
            salerTaxNo: t.notEmpty('销方税号'),
            invoiceType: (name: string, value: any, obj:any) => {
                if (typeof obj.govInvoiceType === 'undefined' && typeof value === 'undefined') {
                    return '税局发票类型和发票云发票类型必须选择一种传值';
                }
                if (obj.govInvoiceType) {
                    return t.enum(govGxInvoiceTypes, '税局发票类型')('govInvoiceType', obj.govInvoiceType);
                }
                return t.enum(gxInvoiceTypes, '发票云发票类型')(name, value);
            },
            invoiceCode: (name: string, value: string, obj: any) => {
                const etaxTypes = [26, 27, 28];
                const govEtaxTypes = ['61', '81', '82'];
                if (typeof obj.govInvoiceType !== 'undefined' && !govEtaxTypes.includes(obj.govInvoiceType) && !value) {
                    return '非数电票发票代码不能为空';
                }
                if (typeof obj.invoiceType !== 'undefined' && !etaxTypes.includes(obj.invoiceType) && !value) {
                    return '非数电票发票代码不能为空';
                }
                return null;
            },
            invoiceNo: t.notEmpty('发票号码'),
            etaxInvoiceNo: (name: string, value: string, obj: any) => {
                const govEtaxTypes = ['85', '86', '87', '88'];
                if (typeof obj.govInvoiceType !== 'undefined' && govEtaxTypes.includes(obj.govInvoiceType) && !value) {
                    return '数电纸质发票etaxInvoiceNo不能为空';
                }
                return null;
            },
            invoiceDate: t.formatDate('YYYY-MM-DD', '开票日期'),
            invoiceAmount: t.notEmpty('不含税金额'),
            totalTaxAmount: t.notEmpty('税额'),
            effectiveTaxAmount: (name: string, value: any) => {
                // 抵扣勾选, 退税勾选，需要传有效税额
                if (opt.deductionPurpose !== '2' && opt.authenticateFlag === 1) {
                    return t.notEmpty('有效税额')(name, value);
                }
                return null;
            },
            notDeductibleType: (name: string, value: any) => {
                if (opt.deductionPurpose === '2' && opt.authenticateFlag === 1) {
                    return t.enum(notDeductibleTypeList, '进行不抵扣勾选时，不抵扣原因类型')(name, value);
                }
                return null;
            },
            notDeductibleText: (name: string, value: any, obj: any) => {
                if (opt.deductionPurpose === '2' && opt.authenticateFlag === 1 && obj.notDeductibleType === 5) {
                    return t.notEmpty('当不抵扣勾选原因类型为其它时，不抵扣原因类型描述')(name, value);
                }
                return null;
            }
        });
        const checkOptType = t.type({
            authenticateFlag: t.enum(authenticateFlagList, '勾选或撤销勾选'),
            deductionPurpose: t.enum(deductionPurposeList, '抵扣用途'),
            invoices: t.array(CheckInvoiceItemType, '勾选的发票')
        });
        const decode = t.decode(opt, checkOptType);
        if (decode) {
            return {
                ...errcodeInfo.argsErr,
                description: decode
            };
        }
        return errcodeInfo.success;
    }

    // 发票勾选入口
    async apply(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        const { pageId, access_token } = ctx.request.query;
        const checkRes = this.checkArgs(opt);
        if (checkRes.errcode !== '0000') {
            await ctx.service.etaxV4QueryInvoices.updateSyncResult(opt.batchNo, checkRes);
            return checkRes;
        }
        const deductionPurpose = opt.deductionPurpose;
        let res;
        let curTaxPeriod = tokenInfo.taxPeriod;
        if (!curTaxPeriod) {
            const res1 = await ctx.service.etaxLogin.getSkssq(pageId);
            if (res1.errcode !== '0000') {
                await ctx.service.etaxV4QueryInvoices.updateSyncResult(opt.batchNo, res1);
                return res1;
            }
            const { skssq, gxrqfw } = res1.data || {};
            curTaxPeriod = res1.data.taxPeriod;
            tokenInfo.taxPeriod = curTaxPeriod;
            tokenInfo.skssq = skssq;
            tokenInfo.gxrqfw = gxrqfw;
            // 查询是否查询当期
            await pwyStore.set(etaxLoginedCachePreKey + pageId, tokenInfo, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, tokenInfo);
        }
        if (deductionPurpose === '1') { // 抵扣勾选
            res = await ctx.service.etaxDkgxInvoices.dkgxInvoices(tokenInfo, opt, access_token);
        } else if (deductionPurpose === '2') { // 不抵扣勾选
            res = await ctx.service.etaxBdkgxInvoices.bdkgxInvoices(tokenInfo, opt, access_token);
        } else if (deductionPurpose === '3') { // 退税勾选
            res = await ctx.service.etaxTsgxInvoices.tsgxInvoices(tokenInfo, opt, access_token);
        }

        let errcode = res.errcode;
        // 只要有一张发票处理成功，就认为异步任务处理勾选完成
        if (res.errcode === '0000' || res.data?.success?.length > 0) {
            errcode = '0000';
        }
        await ctx.service.etaxV4QueryInvoices.updateSyncResult(opt.batchNo, {
            ...res,
            errcode
        });
        return res;
    }
}
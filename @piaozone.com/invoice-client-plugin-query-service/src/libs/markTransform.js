/* eslint-disable no-undef */
import { transformGovType, transformFpyType } from './etaxInvoiceType';
import { getInvoiceSource } from './etaxTransform';

export const invoiceStatusDict = {
    '0': '正常',
    '3': '已红冲-全额',
    '8': '已红冲-全额',
    '7': '已红冲-部分'
};

export const invoiceRiskLevelDict = {
    '正常': '01',
    '异常凭证': '02',
    '疑点发票': '03'
};

export const govTypeDict = {
    '01': ['增值税专用发票', '01'],
    '03': ['机动车销售统一发票'],
    '04': ['增值税普通发票', '02'],
    '08': ['增值税电子专用发票', '01'],
    '10': ['增值税电子普通发票', '02'],
    '11': ['增值税普通发票（卷式）', '02'],
    '14': ['道路通行费电子普通发票', '02'],
    '15': ['二手车销售统一发票'],
    '51': ['数电票（铁路电子客票）'],
    '61': ['数电票（航空运输电子客票行程单）'],
    '81': ['数电票（增值税专用发票）', '01'],
    '82': ['数电票（普通发票）', '02'],
    '85': ['数电纸质发票（增值税专用发票）'],
    '86': ['数电纸质发票（普通发票）'],
    // '83': ['数电票（机动车销售统一发票）'],
    // '84': ['数电票（二手车销售统一发票）'],
    '87': ['数电纸质发票（机动车销售统一发票）'],
    '88': ['数电纸质发票（二手车销售统一发票）']
};

export function transMarkInvoicesToFpy(data = []) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const invoiceType = transformGovType(item.FplxDm);
        if (invoiceType === -1) {
            continue;
        }
        let etaxInvoiceNo = '';
        if (invoiceType === 3 || invoiceType === 4) { // 数电票号码, 数电纸质发票才有
            etaxInvoiceNo = item.Fphm;
        }
        const itemData = {
            invoiceType: invoiceType, // 转换为发票云发票类型
            govInvoiceType: item.FplxDm,
            etaxInvoiceNo, // 纸质数电号码
            // invoiceTypeDesc: item.Fplxmc, // 发票类型描述
            invoiceCode: item.ZzfpDm, // 发票代码
            invoiceNo: item.Zzfphm || item.Fphm, // 发票号码
            invoiceDate: item.Kprq, // 开票日期
            invoiceAmount: item.Je + '', // 不含税金额
            totalTaxAmount: item.Se + '',
            buyerTaxNo: item.Gmfnsrsbh,
            salerName: item.Xsfmc, // 销方名称
            salerTaxNo: item.Xsfnsrsbh, // 销方税号
            invoiceStatus: parseInt(item.FpkjztDm), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
            // invoiceStatusDesc: item.Fpkjztmc, // 发票状态描述
            // invoiceSourceCode: item.FplyDm, // 发票来源代码
            invoiceSource: getInvoiceSource(item.FplyDm), // 发票来源
            // invoiceRiskLevelCode: item.FpfxdjDm, // 发票风险等级
            invoiceRiskLevel: item.Fpfxdjmc || '正常', // 发票风险等级描述
            entryMarkStatus: item.RzytDm || '01', // 发票入账状态
            entryMarkDate: item.Rzsj || '', // 入账时间
            // enterDate: item.Lrrq || '', // 录入日期
            fppzDm: item.FppzDm,
            mxuuid: item.Mxuuid || '', // 未入账没有这个字段
            rzuuid: item.Rzuuid || '', // 未入账没有这个字段
            invoiceZhbz: item.Zhbz // 红字锁定标致
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}

export function transMarkInvoicesToGov(data = []) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        let FplxDm;
        if (item.govInvoiceType) {
            FplxDm = item.govInvoiceType;
        } else {
            FplxDm = transformFpyType(item.invoiceType, item.etaxInvoiceNo);
        }
        let Fphm = (item.invoiceNo && item.invoiceNo.length === 20) ? item.invoiceNo : '';
        if (item.etaxInvoiceNo) {
            Fphm = item.etaxInvoiceNo;
        }
        const invoiceStatus = item.invoiceStatus || 0;
        const itemData = {
            Gmfnsrsbh: item.buyerTaxNo,
            ZzfpDm: item.invoiceCode || '',
            Fphm,
            Zzfphm: (item.invoiceNo && item.invoiceNo.length !== 20) ? item.invoiceNo : '',
            Kprq: item.invoiceDate,
            Je: item.invoiceAmount,
            Se: item.totalTaxAmount,
            Xsfmc: item.salerName,
            Xsfnsrsbh: item.salerTaxNo,
            FplyDm: Fphm.length === 20 ? 2 : 1, // 1:增值税发票管理系统 2:电子发票服务平台
            FpkjztDm: invoiceStatus, // 发票状态
            Fpkjztmc: invoiceStatusDict[invoiceStatus + ''], // 发票状态名称
            Fpfxdjmc: item.invoiceRiskLevel, // 风险等级
            FpfxdjDm: invoiceRiskLevelDict[item.invoiceRiskLevel], // 风险等级代码
            Rzsj: item.entryMarkDate, // 入账时间，这里传日期格式即可
            FplxDm,
            Fplxmc: govTypeDict[FplxDm][0],
            FprzztDm: item.entryMarkStatus,
            Lrrq: item.enterDate || moment().format('YYYY-MM-DD'),
            Mxuuid: item.mxuuid || '',
            Rzuuid: item.rzuuid || '',
            Zhbz: item.zhbz || 'N',
            FppzDm: govTypeDict[FplxDm][1] || ''
            // FppzDm: item.invoicePz,
        };
        invoiceList.push(itemData);
    }
    return invoiceList;
}
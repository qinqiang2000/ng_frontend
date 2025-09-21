/* eslint-disable no-undef */
import { transformGovType } from './etaxInvoiceType';
export function getNotDeductibleType(text) {
    // 1：用于非应税项目2：用于免税项目3：用于集体福利或者个人消费4：遭受非正常损失5：其他
    if (text.indexOf('非正常损失的') !== -1) {
        return 4;
    }
    if (text.indexOf('用于免税项目') !== -1) {
        return 2;
    }

    if (text.indexOf('用于非应税项目') !== -1) {
        return 1;
    }

    if (text.indexOf('用于集体福利或者个人消费') !== -1) {
        return 3;
    }
    return 5;
}

export function getInvoiceSource(type) {
    if (parseInt(type) === 1) {
        return '增值税发票管理系统';
    } else if (parseInt(type) === 2) {
        return '电子发票服务平台';
    }
    return '';
}

export function getInvoiceRiskLevel(level) {
    if (level === '01') {
        return '正常';
    } else if (level === '02') {
        return '异常凭证';
    } else if (level === '03') {
        return '疑点发票';
    }
    return '';
}

// 抵扣统计发票
export function transDktjInvoices(data = [], taxPeriod = '', info = {}) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const invoiceType = transformGovType(item.FplxDm);
        const authenticateFlag = 2;
        if (invoiceType === -1) {
            continue;
        }
        const itemData = {
            ...info,
            invoiceType: invoiceType, // 转换为发票云发票类型
            invoiceCode: item.ZzfpDm, // 发票代码
            invoiceNo: item.ZzfpHm, // 发票号码
            invoiceDate: item.Kprq.substr(0, 10), // 开票日期
            salerName: item.Xfmc, // 销方名称
            invoiceAmount: item.Je, // 不含税金额
            taxAmount: item.Se, // 税额
            totalTaxAmount: item.Se,
            salerTaxNo: item.Xfsbh, // 销方税号
            invoiceStatus: parseInt(item.Fpzt), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
            checkFlag: '1', // 是否勾选
            deductionPurpose: '1', // 抵扣勾选标志
            effectiveTaxAmount: item.Yxdkse,
            selectTime: item.Gxsj || '', // 勾选时间
            manageStatus: '0',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: '1', // 是否勾选认证
            selectAuthenticateTime: item.Gxsj || '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: taxPeriod,
            buyerTaxNo: item.Gfsbh,
            invoiceSource: '电子发票服务平台',
            invoiceRiskLevel: '正常'
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}

// 抵扣勾选发票
export function transDkgxInvoices(data = [], taxPeriod = '', info = {}, tongjiIsConfirm) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const gxzt = item.GxztDm;
        const invoiceType = transformGovType(item.FplxDm, item.Fpdm);
        let authenticateFlag = gxzt === '0' ? 0 : 1;
        if (authenticateFlag === 1 && tongjiIsConfirm) {
            authenticateFlag = 2;
        }
        if (invoiceType === -1) {
            continue;
        }
        let etaxInvoiceNo = '';
        if (Number(item.FplxDm) === 85 || Number(item.FplxDm) === 86 || Number(item.FplxDm) === 87) { // 数电票号码, 数电纸质发票才有
            etaxInvoiceNo = item.Qdfphm || item.Fphm;
        }
        let invoiceDate = item.Kprq.substr(0, 10); // 开票日期
        if (info.getInvoiceTime) {
            invoiceDate = item.Kprq;
        }

        const itemData = {
            businessType: item.TdyslxDm || '', // 特定业务类型
            etaxInvoiceNo,
            invoiceType: invoiceType, // 转换为发票云发票类型
            govInvoiceType: item.FplxDm,
            invoiceCode: item.Fpdm, // 发票代码
            invoiceNo: item.Fphm || item.Qdfphm, // 发票号码
            invoiceDate, // 开票日期
            salerName: item.Xsfmc, // 销方名称
            invoiceAmount: item.Je, // 不含税金额
            taxAmount: item.Se, // 税额
            totalTaxAmount: item.Se,
            salerTaxNo: item.Xfsbh, // 销方税号
            invoiceStatus: parseInt(item.FpztDm), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
            checkFlag: authenticateFlag === 0 ? '0' : '1', // 是否勾选
            deductionPurpose: authenticateFlag === 0 ? '' : '1', // 抵扣勾选标志
            effectiveTaxAmount: item.Yxse,
            selectTime: item.Gxsj || '', // 勾选时间
            manageStatus: '0',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: authenticateFlag === 2 ? '1' : '0', // 是否勾选认证
            selectAuthenticateTime: authenticateFlag === 2 ? item.Gxsj : '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: authenticateFlag === 0 ? '' : taxPeriod,
            buyerTaxNo: item.Gfsbh || info.buyerTaxNo,
            invoiceSource: getInvoiceSource(item.FpxxlyDm),
            invoiceRiskLevel: getInvoiceRiskLevel(item.FxdjDm)
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}


// 未到期发票
export function transWdqInvoices(data = [], info = {}) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const invoiceType = transformGovType(item.FplxDm);
        const authenticateFlag = 0;
        if (invoiceType === -1) {
            continue;
        }
        const itemData = {
            ...info,
            invoiceType: invoiceType, // 转换为发票云发票类型
            invoiceCode: item.Fpdm, // 发票代码
            invoiceNo: item.Fphm, // 发票号码
            invoiceDate: item.Kprq.substr(0, 10), // 开票日期
            salerName: item.Xsfmc, // 销方名称
            invoiceAmount: item.Je, // 不含税金额
            taxAmount: item.Se, // 税额
            totalTaxAmount: item.Se,
            salerTaxNo: item.Xfsbh, // 销方税号
            invoiceStatus: parseInt(item.FpztDm), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
            checkFlag: authenticateFlag.toString(), // 是否勾选
            deductionPurpose: '', // 抵扣勾选标志
            effectiveTaxAmount: item.Yxse,
            selectTime: '', // 勾选时间
            manageStatus: '0',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: '0', // 是否勾选认证
            selectAuthenticateTime: '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: '',
            buyerTaxNo: item.Gfsbh || ''
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}

// 不抵扣勾选发票
export function transBdkgxInvoices(data = [], taxPeriod = '', info = {}, tongjiIsConfirm) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const gxzt = item.GxztDm;
        const invoiceType = transformGovType(item.FplxDm);
        let authenticateFlag = gxzt === '0' ? 0 : 1;
        if (authenticateFlag === 1 && tongjiIsConfirm) {
            authenticateFlag = 2;
        }
        if (invoiceType === -1) {
            continue;
        }

        let etaxInvoiceNo = '';
        if (Number(item.FplxDm) === 85 || Number(item.FplxDm) === 86) { // 数电票号码, 数电纸质发票才有
            etaxInvoiceNo = item.Fphm;
        }

        let invoiceDate = item.Kprq.substr(0, 10); // 开票日期
        if (info.getInvoiceTime) {
            invoiceDate = item.Kprq;
        }

        const itemData = {
            businessType: item.TdyslxDm, // 特定业务类型
            etaxInvoiceNo,
            govInvoiceType: item.FplxDm,
            invoiceType: invoiceType, // 转换为发票云发票类型
            invoiceCode: item.ZzfpDm || '', // 发票代码
            invoiceNo: item.ZzfpHm || item.Fphm, // 发票号码
            invoiceDate: invoiceDate, // 开票日期
            salerName: item.Xfmc, // 销方名称
            invoiceAmount: item.Je, // 不含税金额
            taxAmount: item.Se, // 税额
            totalTaxAmount: item.Se,
            salerTaxNo: item.Xfsbh, // 销方税号
            invoiceStatus: parseInt(item.Fpzt), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
            checkFlag: authenticateFlag === 0 ? '0' : '1', // 是否勾选
            deductionPurpose: authenticateFlag === 0 ? '' : '2', // 抵扣勾选标志
            effectiveTaxAmount: item.Yxdkse,
            selectTime: item.Gxsj || '', // 勾选时间
            manageStatus: '0',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: '0', // 是否勾选认证
            selectAuthenticateTime: '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: authenticateFlag === 0 ? '' : taxPeriod,
            buyerTaxNo: item.Gfsbh || info.buyerTaxNo,
            notDeductibleType: item.BdkyyDm,
            notDeductibleText: item.Sglrdbdkyy || '',
            invoiceSource: getInvoiceSource(item.FpbbDm),
            invoiceRiskLevel: getInvoiceRiskLevel(item.FxdjDm)
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}
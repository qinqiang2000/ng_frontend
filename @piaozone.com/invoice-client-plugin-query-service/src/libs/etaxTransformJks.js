import { getNotDeductibleType } from './etaxTransform';

// 抵扣统计发票
export function transDktjJks(data = [], taxPeriod = '', info = {}) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const authenticateFlag = 2;
        const itemData = {
            invoiceType: 21, // 转换为发票云发票类型
            customDeclarationNo: item.Jkshm || '',
            invoiceDate: item.Tfrq.substr(0, 10), // 开票日期
            taxAmount: item.Skje, // 税额
            totalTaxAmount: item.Skje,
            checkFlag: '1', // 是否勾选
            deductionPurpose: '1', // 抵扣勾选标志
            effectiveTaxAmount: item.Yxdkse,
            selectTime: item.Gxsj || '', // 勾选时间
            manageStatus: '0',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: '0', // 是否勾选认证
            selectAuthenticateTime: '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: taxPeriod,
            buyerTaxNo: item.Gfsbh || '',
            ...info
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}

// 抵扣勾选缴款书
export function transDkgxJks(data = [], taxPeriod = '', info = {}, tongjiIsConfirm) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const gxzt = item.GxztDm;
        let authenticateFlag = gxzt === '0' ? 0 : 1;
        if (authenticateFlag === 1 && tongjiIsConfirm) {
            authenticateFlag = 2;
        }

        const itemData = {
            invoiceType: 21, // 转换为发票云发票类型
            customDeclarationNo: item.Hgjkshm || '',
            invoiceDate: item.Tfrq.substr(0, 10), // 开票日期
            taxAmount: item.Skje, // 税额
            totalTaxAmount: item.Skje,
            checkFlag: authenticateFlag === 0 ? '0' : '1', // 是否勾选
            deductionPurpose: authenticateFlag === 0 ? '' : '1', // 抵扣勾选标志
            effectiveTaxAmount: item.Yxdkse,
            selectTime: item.Gxsj || '', // 勾选时间
            manageStatus: item.GlztDm === '0' ? '0' : '1',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: '0', // 是否勾选认证
            selectAuthenticateTime: '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: authenticateFlag === 0 ? '' : taxPeriod,
            buyerTaxNo: item.Gfsbh,
            ...info
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}


// 未到期的缴款书
export function transWdqJks(data = [], info = {}) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const authenticateFlag = 0;
        const itemData = {
            invoiceType: 21, // 转换为发票云发票类型
            customDeclarationNo: item.Hgjkshm || '',
            invoiceDate: item.Tfrq.substr(0, 10), // 填发日期
            taxAmount: item.Skje, // 税额
            totalTaxAmount: item.Skje,
            checkFlag: authenticateFlag.toString(), // 是否勾选
            deductionPurpose: '', // 抵扣勾选标志
            effectiveTaxAmount: item.Skje,
            selectTime: '', // 勾选时间
            manageStatus: item.Glztdm === '正常' ? '0' : '1',
            authenticateFlag, // 统一勾选及认证标志
            checkAuthenticateFlag: '0', // 是否勾选认证
            selectAuthenticateTime: '', // 勾选认证时间
            scanAuthenticateFlag: '0', // 是否扫码认证
            scanAuthenticateTime: '', // 扫码认证时间
            taxPeriod: '',
            buyerTaxNo: item.Gfsbh || '',
            ...info
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}

// 不抵扣缴款书
export function transBdkgxJks(data = [], taxPeriod = '', info = {}, tongjiIsConfirm) {
    const invoiceList = [];
    for (let j = 0; j < data.length; j++) {
        const item = data[j];
        const gxzt = item.GxztDm;
        let authenticateFlag = gxzt === '0' ? 0 : 1;
        if (authenticateFlag === 1 && tongjiIsConfirm) {
            authenticateFlag = 2;
        }
        const notDeductibleType = getNotDeductibleType(item.sglrdbdkyy || '');

        const itemData = {
            invoiceType: 21, // 转换为发票云发票类型
            customDeclarationNo: item.Hgjkshm || '',
            invoiceDate: item.Tfrq.substr(0, 10), // 开票日期
            taxAmount: item.Skje, // 税额
            totalTaxAmount: item.Skje,
            // invoiceStatus: parseInt(item.Fpzt), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
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
            buyerTaxNo: item.Gfsbh,
            notDeductibleType,
            ...info
        };
        invoiceList.push(itemData);
    }

    return invoiceList;
}
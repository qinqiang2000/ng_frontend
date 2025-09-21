
/* eslint-disable no-undef */
// import xlsx from 'node-xlsx';
// import errcodeInfo from '$client/errcodeInfo';
// import fs from 'fs';
import { getEtaxInvoiceType, getInvoiceStatusByText, getGovInvoiceTypeText, getGovInvoiceType } from './etaxInvoiceType';
import { trim } from '../utils/tools';

export function wgxInvoices(filePath, taxPeriod = '', info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error('文件解析异常：', filePath, err);
        return errcodeInfo.parseExcelErr;
    }
    const invoiceList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        for (let j = 1; j < curData.data.length; j++) {
            const item = curData.data[j];
            const authenticateFlag = info.authenticateFlag || 0;
            let isQdfp = false;
            let invoiceDate = (item[6] || '').substr(0, 10); // 开票日期
            if (info.getInvoiceTime) {
                invoiceDate = trim(item[6] || '');
            }
            // 空行
            if (!invoiceDate || !item[12]) {
                continue;
            }

            const invoiceType = getEtaxInvoiceType(item[12], item[4]);
            const govInvoiceType = getGovInvoiceType(item[12]);
            if ([26, 27, 28, 29].indexOf(invoiceType) !== -1) {
                isQdfp = true;
            }

            const invoiceCode = isQdfp ? '' : item[4]; // 发票代码
            const invoiceNo = (isQdfp && item[3]) ? item[3] : item[5]; // 发票号码

            let etaxInvoiceNo = '';
            if (invoiceType === 3 || invoiceType === 4 || invoiceType === 12) { // 数电票号码, 数电纸质发票才有
                etaxInvoiceNo = item[3] || '';
            }
            const itemData = {
                buyerTaxNo: info.buyerTaxNo,
                etaxInvoiceNo, // 数电票号码, 数电纸质发票才有
                invoiceType: invoiceType, // 转换为发票云发票类型
                govInvoiceType,
                invoiceCode, // 发票代码
                invoiceNo, // 发票号码
                invoiceDate, // 开票日期
                salerName: item[8], // 销方名称
                invoiceAmount: item[9], // 不含税金额
                taxAmount: item[10], // 税额
                totalTaxAmount: item[10],
                salerTaxNo: item[7], // 销方税号
                invoiceStatus: getInvoiceStatusByText(item[13]), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                checkFlag: '0', // 是否勾选
                deductionPurpose: '', // 抵扣勾选标志
                effectiveTaxAmount: item[11],
                selectTime: item[15] || '', // 勾选时间
                manageStatus: '0',
                authenticateFlag, // 统一勾选及认证标志
                checkAuthenticateFlag: '0', // 是否勾选认证
                selectAuthenticateTime: '', // 勾选认证时间
                scanAuthenticateFlag: '0', // 是否扫码认证
                scanAuthenticateTime: '', // 扫码认证时间
                taxPeriod: taxPeriod
                // buyerTaxNo: item[9]
            };
            invoiceList.push(itemData);
        }
    }
    return {
        ...errcodeInfo.success,
        totalNum: invoiceList.length,
        data: invoiceList
    };
}


export function ygxInvoices(filePath, taxPeriod = '', info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error('文件解析异常：', filePath, err);
        return errcodeInfo.parseExcelErr;
    }
    const invoiceList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        for (let j = 1; j < curData.data.length; j++) {
            const item = curData.data[j];
            const authenticateFlag = info.authenticateFlag || 1;
            let isQdfp = false;
            let invoiceDate = (item[6] || '').substr(0, 10); // 开票日期
            if (info.getInvoiceTime) {
                invoiceDate = trim(item[6] || '');
            }
            // 空行
            if (!invoiceDate || !item[12]) {
                continue;
            }

            const invoiceType = getEtaxInvoiceType(item[12], item[4]);
            if ([26, 27].indexOf(invoiceType) !== -1) {
                isQdfp = true;
            }

            const invoiceCode = isQdfp ? '' : item[4]; // 发票代码
            const invoiceNo = (isQdfp && item[3]) ? item[3] : item[5]; // 发票号码

            let etaxInvoiceNo = '';
            if (invoiceType === 3 || invoiceType === 4) { // 数电票号码, 数电纸质发票才有
                etaxInvoiceNo = item[3] || '';
            }
            const itemData = {
                buyerTaxNo: info.buyerTaxNo,
                etaxInvoiceNo, // 数电票号码, 数电纸质发票才有
                invoiceType: invoiceType, // 转换为发票云发票类型
                invoiceCode, // 发票代码
                invoiceNo, // 发票号码
                invoiceDate, // 开票日期
                salerName: item[8], // 销方名称
                invoiceAmount: item[9], // 不含税金额
                taxAmount: item[10], // 税额
                totalTaxAmount: item[10],
                salerTaxNo: item[7], // 销方税号
                invoiceStatus: getInvoiceStatusByText(item[13]), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                checkFlag: '1', // 是否勾选
                deductionPurpose: '3', // 抵扣勾选标志
                effectiveTaxAmount: item[11],
                selectTime: item[15] || '', // 勾选时间
                manageStatus: '0',
                authenticateFlag, // 统一勾选及认证标志
                checkAuthenticateFlag: '0', // 是否勾选认证
                selectAuthenticateTime: '', // 勾选认证时间
                scanAuthenticateFlag: '0', // 是否扫码认证
                scanAuthenticateTime: '', // 扫码认证时间
                taxPeriod: taxPeriod
                // buyerTaxNo: item[9]
            };
            invoiceList.push(itemData);
        }
    }
    return {
        ...errcodeInfo.success,
        totalNum: invoiceList.length,
        data: invoiceList
    };
}


// 通过传入的勾选数据，生成税局的勾选模板
export function createDkgxExcelData(list = [], authenticateFlag, taxNo) {
    if (list.length === 0 || (authenticateFlag !== 0 && authenticateFlag !== 1)) {
        return errcodeInfo.argsErr;
    }

    const listResult = [];
    for (let i = 0; i < list.length; i++) {
        const curData = list[i];
        const govType = curData.govType;
        let invoiceTypetext = getGovInvoiceTypeText(govType);
        let isQdfp = false;
        const etaxInvoiceNo = curData.qdInvoiceNo || curData.etaxInvoiceNo || '';
        if (~invoiceTypetext.indexOf('全电发票') || ~invoiceTypetext.indexOf('数电票') || etaxInvoiceNo) {
            isQdfp = true;
        }
        if (isQdfp && govType === '01') {
            invoiceTypetext = '数电纸质发票(增值税专用发票)';
        }
        const item = {
            '是否勾选*': authenticateFlag === 0 ? '否' : '是',
            '数电票号码': isQdfp ? etaxInvoiceNo || curData.invoiceNo || '' : '',
            // '发票代码': isQdfp ? '' : curData.invoiceCode,
            // '发票号码': isQdfp ? '' : curData.invoiceNo,
            '发票代码': isQdfp ? (etaxInvoiceNo || curData.invoiceNo).substring(0, 12) : curData.invoiceCode,
            '发票号码': isQdfp ? (etaxInvoiceNo || curData.invoiceNo).substring(12) : curData.invoiceNo,
            '开票日期*': curData.invoiceDate,
            '金额*': curData.invoiceAmount,
            '票面税额*': curData.totalTaxAmount,
            '有效抵扣税额*': curData.effectiveTaxAmount,
            '购买方识别号*': curData.buyerTaxNo || taxNo,
            '销售方纳税人名称': '',
            '销售方纳税人识别号': '',
            '发票来源': '',
            '票种*': invoiceTypetext,
            '发票状态': '',
            '红字锁定标志': '',
            '转内销证明编号': '',
            '勾选时间': '',
            '发票风险等级': ''
        };
        listResult.push(item);
    }
    return {
        list: listResult,
        cols: [
            { wch: 10 },
            { wch: 14 },
            { wch: 10 },
            { wch: 10 },
            { wch: 12 },
            { wch: 10 },
            { wch: 12 },
            { wch: 16 },
            { wch: 20 },
            { wch: 16 },
            { wch: 20 },
            { wch: 10 },
            { wch: 16 },
            { wch: 10 },
            { wch: 14 },
            { wch: 16 },
            { wch: 10 },
            { wch: 12 }
        ]
    };
}

function getGxFailResultInfo(text) {
    if (text.indexOf('不存在') !== -1) {
        return '2';
    }

    // 重复勾选认为是成功的
    if (text.indexOf('发票已勾选') !== -1 && text.indexOf('不可重复勾选') !== -1) {
        return '1';
    }

    // 重复撤销勾选是可以的
    if (text.indexOf('发票未勾选') !== -1 && text.indexOf('不可撤销勾选') !== -1) {
        return '1';
    }

    if (text.indexOf('作废') !== -1) {
        return '11';
    }

    if (text.indexOf('红冲') !== -1) {
        return '12';
    }

    if (text.indexOf('失控') !== -1) {
        return '15';
    }

    if (text.indexOf('异常') !== -1) {
        return '3';
    }

    if (text.indexOf('请撤销统计表')) {
        return '20';
    }

    return '8-[001]';
}

export function getDkgxFailResult(filePath) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error('文件解析异常：', filePath, err);
        return errcodeInfo.parseExcelErr;
    }

    const resultDict = {};
    const successDict = {};
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        for (let j = 1; j < curData.data.length; j++) {
            const item = curData.data[j];
            const qdInvoiceNo = item[3];
            const invocieCode = item[4];
            const invocieNo = item[5];
            let reason = item[1] || '';
            reason = reason.trim();
            const errType = getGxFailResultInfo(reason);
            const dKey = qdInvoiceNo ? 'k' + qdInvoiceNo : 'k' + invocieCode + '' + invocieNo;
            if (errType === '1') {
                successDict[dKey] = {
                    selectResult: errType,
                    description: 'success'
                };
            } else {
                resultDict[dKey] = {
                    selectResult: errType,
                    description: reason
                };
            }
        }
        fs.unlinkSync(filePath);
        return {
            ...errcodeInfo.success,
            data: {
                failInfo: resultDict,
                successInfo: successDict
            }
        };
    }
}
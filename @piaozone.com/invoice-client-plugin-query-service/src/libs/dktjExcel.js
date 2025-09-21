/* eslint-disable no-undef */
// import xlsx from 'node-xlsx';
// import errcodeInfo from '$client/errcodeInfo';
// import fs from 'fs';
import { getEtaxInvoiceType, getInvoiceStatusByText, getGovInvoiceType } from './etaxInvoiceType';
import { fixeNumber, trim } from './tools';

export function yqrInvoices(filePath, taxPeriod = '', info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error('文件解析异常：', filePath, err);
    }

    if (!taxPeriod) {
        return errcodeInfo.argsErr;
    }

    const invoiceList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        for (let j = 3; j < curData.data.length; j++) {
            const item = curData.data[j];
            const authenticateFlag = 2;
            let invoiceDate = (item[7] || '').substr(0, 10);
            if (info.getInvoiceTime) {
                invoiceDate = trim(item[7] || '');
            }
            // 空行
            if (!item[13] || !invoiceDate) {
                continue;
            }
            const invoiceType = getEtaxInvoiceType(item[13], item[5]);
            const govInvoiceType = getGovInvoiceType(item[13]);
            let isQdfp = false;
            if ([26, 27, 28, 29].indexOf(invoiceType) !== -1) {
                isQdfp = true;
            }
            const invoiceCode = isQdfp ? '' : item[5];
            const invoiceNo = (isQdfp && item[4]) ? item[4] : item[6];
            let etaxInvoiceNo = '';
            if (invoiceType === 3 || invoiceType === 4 || invoiceType === 12) { // 数电票号码, 数电纸质发票才有
                etaxInvoiceNo = item[4] || '';
            }

            const itemData = {
                buyerTaxNo: info.buyerTaxNo,
                etaxInvoiceNo,
                invoiceType: invoiceType, // 转换为发票云发票类型
                govInvoiceType,
                invoiceCode, // 发票代码
                invoiceNo, // 发票号码
                invoiceDate, // 开票日期
                salerName: item[9], // 销方名称
                invoiceAmount: fixeNumber(item[10]), // 不含税金额
                taxAmount: fixeNumber(item[11]), // 税额
                totalTaxAmount: fixeNumber(item[11]),
                salerTaxNo: item[8], // 销方税号
                invoiceStatus: getInvoiceStatusByText(item[15]), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                checkFlag: '1', // 是否勾选
                deductionPurpose: '1', // 抵扣勾选标志
                effectiveTaxAmount: fixeNumber(item[12]),
                selectTime: item[16], // 勾选时间
                manageStatus: '0',
                authenticateFlag, // 统一勾选及认证标志
                checkAuthenticateFlag: '1', // 是否勾选认证
                selectAuthenticateTime: item[16], // 勾选认证时间
                scanAuthenticateFlag: '0', // 是否扫码认证
                scanAuthenticateTime: '', // 扫码认证时间
                taxPeriod: taxPeriod,
                invoiceSource: item[2], // 发票来源
                invoiceRiskLevel: item[17] // 发票风险等级
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
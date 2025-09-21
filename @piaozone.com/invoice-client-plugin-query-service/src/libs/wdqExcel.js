/* eslint-disable no-undef */
// import xlsx from 'node-xlsx';
// import errcodeInfo from '$client/errcodeInfo';
// import fs from 'fs';
import { getEtaxInvoiceType, getInvoiceStatusByText } from './etaxInvoiceType';
import { fixeNumber } from './tools';
// import moment from 'moment';

export default function wdqExcelInvoices(filePath, info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }
        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error('wdqExcelInvoices err', filePath, err);
        return errcodeInfo.parseExcelErr;
    }

    const invoiceList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        for (let j = 1; j < curData.data.length; j++) {
            const item = curData.data[j];
            const authenticateFlag = 0;
            const invoiceType = getEtaxInvoiceType(item[2], item[3]);
            if (invoiceType === -1) {
                continue;
            }

            let isQdfp = false;
            if ([26, 27, 28, 29].indexOf(invoiceType) !== -1) {
                isQdfp = true;
            }
            let etaxInvoiceNo = '';
            if (invoiceType === 3 || invoiceType === 4) { // 数电票号码, 数电纸质发票才有
                etaxInvoiceNo = item[5];
            }
            let invoiceDate;
            if (typeof item[8] === 'string') {
                invoiceDate = moment(item[8].trim(), 'YYYY年MM月DD日').format('YYYY-MM-DD'); // 开票日期
            } else {
                invoiceDate = new Date(item[8] * 86400 * 1000 - 25569 * 86400 * 1000);
                // // -8小时
                invoiceDate.setHours(invoiceDate.getHours() - 8);

                // 如果减去8小时后小时数为负数，需要调整日期和小时数
                if (invoiceDate.getHours() < 0) {
                    invoiceDate.setHours(invoiceDate.getHours() + 24); // 加上24小时变回正数
                    invoiceDate.setDate(invoiceDate.getDate() - 1); // 日期减一
                }
                invoiceDate = moment(new Date(invoiceDate)).format('YYYY-MM-DD HH:mm:ss');
                invoiceDate = invoiceDate.substr(0, 10);
            }
            const itemData = {
                ...info,
                etaxInvoiceNo, // 数电票号码, 数电纸质发票才有
                invoiceType: invoiceType, // 转换为发票云发票类型
                invoiceCode: isQdfp ? '' : item[3], // 发票代码
                invoiceNo: (isQdfp && item[5]) ? item[5] : item[4], // 发票号码
                invoiceDate: invoiceDate, // 开票日期
                salerName: item[7], // 销方名称
                invoiceAmount: fixeNumber(item[9]), // 不含税金额
                taxAmount: fixeNumber(item[10]), // 税额
                totalTaxAmount: fixeNumber(item[10]), // 税额
                salerTaxNo: item[6], // 销方税号
                invoiceStatus: getInvoiceStatusByText(item[11]), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                checkFlag: authenticateFlag + '', // 是否勾选
                deductionPurpose: '', // 抵扣勾选标志
                effectiveTaxAmount: fixeNumber(item[10]),
                selectTime: '', // 勾选时间
                manageStatus: '0',
                authenticateFlag, // 统一勾选及认证标志
                checkAuthenticateFlag: '0', // 是否勾选认证
                selectAuthenticateTime: '', // 勾选认证时间
                scanAuthenticateFlag: '0', // 是否扫码认证
                scanAuthenticateTime: '', // 扫码认证时间
                taxPeriod: '',
                invoiceSource: item[1], // 发票来源
                invoiceRiskLevel: item[13] // 发票风险等级
            };
            invoiceList.push(itemData);
        }
    }
    // fs.unlinkSync(filePath);
    return {
        ...errcodeInfo.success,
        data: invoiceList
    };
}
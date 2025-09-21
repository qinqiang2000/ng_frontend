/* eslint-disable no-undef */
import { getEtaxInvoiceType, getInvoiceStatusByText, getGovInvoiceType } from './etaxInvoiceType';
import { trim } from '../utils/tools';

export function ygxYtInvoices(filePath, taxPeriod = '', info = {}, paramInvoiceType = '') {
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
            // const authenticateFlag = info.authenticateFlag || 1;
            let isQdfp = false;
            let invoiceDate = trim(item[4] || '').substr(0, 10);
            if (info.getInvoiceTime) {
                invoiceDate = trim(item[4] || '');
            }
            // 空行
            if (!invoiceDate || !item[0]) {
                continue;
            }

            const invoiceType = getEtaxInvoiceType(item[0], item[2]);
            const govInvoiceType = getGovInvoiceType(item[0]);
            // 类型过滤
            if (paramInvoiceType && parseInt(paramInvoiceType) !== -1 && parseInt(paramInvoiceType) !== invoiceType) {
                continue;
            }
            if ([26, 27, 28, 29].indexOf(invoiceType) !== -1) {
                isQdfp = true;
            }

            const invoiceCode = isQdfp ? '' : item[2]; // 发票代码
            const invoiceNo = (isQdfp && item[1]) ? item[1] : item[3]; // 发票号码

            let etaxInvoiceNo = '';
            if (invoiceType === 3 || invoiceType === 4 || invoiceType === 12) { // 数电票号码, 数电纸质发票才有
                etaxInvoiceNo = item[1] || '';
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
                invoiceAmount: item[6], // 不含税金额
                taxAmount: item[7], // 税额
                totalTaxAmount: item[7],
                salerTaxNo: item[5], // 销方税号
                invoiceStatus: getInvoiceStatusByText(item[13]), // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                checkFlag: '1', // 是否勾选
                deductionPurpose: '3', // 抵扣勾选标志
                // effectiveTaxAmount: item[11],
                selectTime: item[11], // 勾选时间
                manageStatus: '0',
                authenticateFlag: 2, // 统一勾选及认证标志
                checkAuthenticateFlag: '1', // 是否勾选认证
                selectAuthenticateTime: item[11], // 勾选认证时间
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
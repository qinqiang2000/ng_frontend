
/* eslint-disable no-undef */
// import xlsx from 'node-xlsx';
// import errcodeInfo from '$client/errcodeInfo';
// import fs from 'fs';
import { getNotDeductibleType } from './etaxTransform';
import { getEtaxInvoiceType, getGovInvoiceTypeText, transformFpyType, getGovInvoiceType } from './etaxInvoiceType';
import { fixeNumber, trim } from './tools';

export function bdkYgxInvoices(filePath, taxPeriod = '', info = {}) {
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
            const authenticateFlag = typeof info.authenticateFlag === 'undefined' ? 1 : info.authenticateFlag;
            let isQdfp = false;
            const invoiceType = getEtaxInvoiceType(item[13], item[5]);
            const govInvoiceType = getGovInvoiceType(item[13]);
            if ([26, 27, 28, 29].indexOf(invoiceType) !== -1) {
                isQdfp = true;
            }

            let etaxInvoiceNo = '';
            if (invoiceType === 3 || invoiceType === 4 || invoiceType === 12) { // 数电票号码, 数电纸质发票才有
                etaxInvoiceNo = item[4] || '';
            }

            const itemData = {
                buyerTaxNo: info.buyerTaxNo,
                etaxInvoiceNo, // 数电票号码, 数电纸质发票才有
                invoiceType: invoiceType, // 转换为发票云发票类型
                govInvoiceType,
                invoiceCode: isQdfp ? '' : item[5], // 发票代码
                invoiceNo: (isQdfp && item[4]) ? item[4] : item[6], // 发票号码
                invoiceDate: info.getInvoiceTime ? trim(item[7]) : trim(item[7]).substr(0, 10), // 开票日期
                salerName: item[9], // 销方名称
                invoiceAmount: fixeNumber(item[10]), // 不含税金额
                taxAmount: fixeNumber(item[11]), // 税额
                totalTaxAmount: fixeNumber(item[11]), // 税额
                salerTaxNo: item[8], // 销方税号
                invoiceStatus: 0, // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                checkFlag: authenticateFlag === 0 ? '0' : '1', // 是否勾选
                deductionPurpose: authenticateFlag === 0 ? '1' : '2', // 抵扣勾选标志
                effectiveTaxAmount: fixeNumber(item[12]),
                selectTime: item[16] || '', // 勾选时间
                manageStatus: '0',
                authenticateFlag, // 统一勾选及认证标志
                checkAuthenticateFlag: authenticateFlag === 2 ? '1' : '0', // 是否勾选认证
                selectAuthenticateTime: authenticateFlag === 2 ? item[16] : '', // 勾选认证时间
                scanAuthenticateFlag: '0', // 是否扫码认证
                scanAuthenticateTime: '', // 扫码认证时间
                taxPeriod: info.searchTaxPeriod ? info.searchTaxPeriod : (authenticateFlag === 0 ? '' : taxPeriod), // 指定了税期查询税期用参数里面的税期
                invoiceSource: item[2], // 发票来源
                invoiceRiskLevel: item[17], // 发票风险等级
                notDeductibleType: item[18] ? getNotDeductibleType(item[18]) : ''
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

function getBdkText(type) {
    const dict = {
        'k1': '用于非应税项目',
        'k2': '用于免税项目',
        'k3': '用于集体福利或者个人消费',
        'k4': '非正常损失的',
        'k5': '其他'
    };
    return dict['k' + type] || -1;
}

// 通过传入的勾选数据，生成税局的勾选模板
export function createBdkgxExcelData(list = [], authenticateFlag, taxNo) {
    if (list.length === 0 || (authenticateFlag !== 0 && authenticateFlag !== 1)) {
        return errcodeInfo.argsErr;
    }

    const listResult = [];
    for (let i = 0; i < list.length; i++) {
        const curData = list[i];
        let govType = curData.govType;
        if (!curData.govType) {
            govType = transformFpyType(curData.invoiceType);
        }
        let invoiceTypetext = getGovInvoiceTypeText(govType);
        let isQdfp = false;
        const etaxInvoiceNo = curData.qdInvoiceNo || curData.etaxInvoiceNo || '';
        if (~invoiceTypetext.indexOf('全电发票') || ~invoiceTypetext.indexOf('数电票') || etaxInvoiceNo) {
            isQdfp = true;
        }
        if (isQdfp && govType === '01') {
            invoiceTypetext = '数电纸质发票(增值税专用发票)';
        } else if (isQdfp && govType === '03') {
            invoiceTypetext = '数电纸质发票(机动车销售统一发票)';
        }
        const item = {
            '序号': i + 1,
            '是否勾选*': authenticateFlag === 0 ? '否' : '是',
            '发票来源': '',
            '转内销证明编号': '',
            '数电票号码': isQdfp ? etaxInvoiceNo || curData.invoiceNo || '' : '',
            // '发票代码': isQdfp ? '' : curData.invoiceCode,
            // '发票号码': isQdfp ? '' : curData.invoiceNo,
            '发票代码': isQdfp && !curData.invoiceCode ? (etaxInvoiceNo || curData.invoiceNo).substring(0, 12) : curData.invoiceCode,
            '发票号码': isQdfp && !curData.invoiceNo ? (etaxInvoiceNo || curData.invoiceNo).substring(12) : curData.invoiceNo,
            '开票日期*': curData.invoiceDate,
            '销售方纳税人识别号*': curData.salerTaxNo || '',
            '销售方纳税人名称*': curData.salerName || '',
            '金额*': curData.invoiceAmount || '',
            '票面税额*': curData.totalTaxAmount || '',
            '有效抵扣税额*': curData.effectiveTaxAmount,
            '票种*': invoiceTypetext,
            '不抵扣原因*': getBdkText(curData.notDeductibleType)
        };
        listResult.push(item);
    }
    return {
        list: listResult,
        cols: [
            { wch: 6 },
            { wch: 12 },
            { wch: 10 },
            { wch: 18 },
            { wch: 16 },
            { wch: 10 },
            { wch: 10 },
            { wch: 14 }, // 开票日期
            { wch: 22 },
            { wch: 22 },
            { wch: 12 },
            { wch: 12 },
            { wch: 16 },
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

export function getBdkgxFailResult(filePath) {
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
            const qdInvoiceNo = item[4];
            const invocieCode = item[2];
            const invocieNo = item[3];
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

/* eslint-disable no-inline-comments,complexity,no-undef*/
// import xlsx from 'node-xlsx';
// import fs from 'fs';
// import errcodeInfo from '$client/errcodeInfo';
import { trim, checkInvoiceType } from '../tools';
import { changeInvoiceStatus } from '../transformInvoice';

export default function zhuanpiao_pupiao(filePath, info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }

    const invoiceDict = {};
    let detailInfo = [];

    let tongjiTotalAmount = 0.00;
    let tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;
    const invoiceKeyList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        const name = curData.name || '';
        if (name === '发票信息') {
            const invoiceTypeText = curData.data[0];
            let shudianPaper = false;
            if (invoiceTypeText && (invoiceTypeText[0] === '纸质发票（增值税专用发票）' || invoiceTypeText[0] === '纸质发票(增值税专用发票)')) {
                shudianPaper = true;
            }
            if (invoiceTypeText && (invoiceTypeText[0] === '纸质发票（普通发票）' || invoiceTypeText[0] === '纸质发票(普通发票)')) {
                shudianPaper = true;
            }
            for (let j = 2; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = trim(item[1]);
                const invoiceNo = trim(item[2]);
                // 代码号码都为空
                if (!invoiceCode && !invoiceNo) {
                    break;
                }
                const invoiceAmount = item[9];
                const taxAmount = item[10];
                const totalAmount = item[11];
                const invoiceKey = invoiceCode + '-' + invoiceNo;
                tongjiTotalTaxAmount += parseFloat(taxAmount);
                tongjiInvoiceAmount += parseFloat(invoiceAmount);
                tongjiTotalAmount += parseFloat(totalAmount);
                let invoiceType = info.invoiceType;
                if (invoiceType === 1) {
                    if (checkInvoiceType(invoiceCode, invoiceNo) === 15) { // 通行费发票
                        invoiceType = 15;
                    }
                }
                invoiceKeyList.push(invoiceKey);
                invoiceDict[invoiceKey] = {
                    etaxInvoiceNo: shudianPaper ? item[12] : '',
                    invoiceType, // 电子发票对通行费发票再判断
                    invoiceCode: invoiceCode,
                    invoiceNo: invoiceNo,
                    invoiceDate: item[3],
                    invoiceStatus: changeInvoiceStatus(item[4]), // 发票状态
                    salerTaxNo: item[5],
                    salerName: item[6],
                    buyerTaxNo: item[7],
                    buyerName: item[8],
                    invoiceAmount: item[9],
                    taxAmount: item[10],
                    totalAmount: item[11],
                    checkCode: item[12],
                    salerAddressPhone: item[13],
                    salerAccount: item[14],
                    buyerAddressPhone: item[15],
                    buyerAccount: item[16],
                    password: item[17],
                    remark: item[18],
                    machineNo: invoiceType === 1 ? item[19] : '', // 电子发票模板不一样
                    drawer: invoiceType === 1 ? item[20] : item[19],
                    payee: invoiceType === 1 ? item[21] : item[20],
                    reviewer: invoiceType === 1 ? item[22] : item[21],
                    items: []
                };
            }
        } else if (name.indexOf('货物信息') !== -1) {
            detailInfo = detailInfo.concat(curData.data);
        }
    }
    for (let i = 2; i < detailInfo.length; i++) {
        const curDetail = detailInfo[i];
        const dInvoiceCode = trim(curDetail[1]);
        const dInvoiceNo = trim(curDetail[2]);
        // 出现空行，直接退出
        if (!dInvoiceCode && !dInvoiceNo) {
            break;
        }
        const invoiceKey = dInvoiceCode + '-' + dInvoiceNo;
        const item = invoiceDict[invoiceKey];
        // 表头不存在
        if (!item) {
            continue;
        }

        if (curDetail[4].indexOf('详见销货清单') === -1) {
            invoiceDict[invoiceKey].items.push({
                goodsCode: curDetail[3],
                goodsName: curDetail[4],
                specModel: curDetail[5],
                unit: curDetail[6],
                num: curDetail[7],
                unitPrice: curDetail[8],
                detailAmount: curDetail[9],
                taxRate: curDetail[10],
                taxAmount: curDetail[11]
            });
        }
    }
    const invoiceList = invoiceKeyList.map((k) => {
        return invoiceDict[k];
    });
    return {
        errcode: '0000',
        data: invoiceList,
        tongjiInfo: {
            totalAmount: tongjiTotalAmount.toFixed(2),
            totalTaxAmount: tongjiTotalTaxAmount.toFixed(2),
            invoiceAmount: tongjiInvoiceAmount.toFixed(2),
            invoiceNum: invoiceList.length
        }
    };
}
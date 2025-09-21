
/* eslint-disable no-inline-comments,complexity,no-undef*/
// import xlsx from 'node-xlsx';
// import fs from 'fs';
// import errcodeInfo from '$client/errcodeInfo';
import { trim } from '../tools';
import { changeInvoiceStatus } from '../transformInvoice';

export default function quandian(filePath, info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }

    const invoiceList = [];
    let detailInfo = [];

    let tongjiTotalAmount = 0.00;
    let tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;

    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        const name = curData.name || '';
        if (name === '发票信息') {
            for (let j = 2; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = '';// trim(item[1]);
                const invoiceNo = trim(item[1]);
                if (!invoiceNo) {
                    break;
                }
                const invoiceAmount = item[8];
                const taxAmount = item[9];
                const totalAmount = item[10];

                tongjiTotalTaxAmount += parseFloat(taxAmount);
                tongjiInvoiceAmount += parseFloat(invoiceAmount);
                tongjiTotalAmount += parseFloat(totalAmount);
                const invoiceType = info.invoiceType;

                invoiceList.push({
                    invoiceType, // 电子发票对通行费发票再判断
                    invoiceCode: invoiceCode,
                    invoiceNo: invoiceNo,
                    invoiceDate: item[2],
                    invoiceStatus: changeInvoiceStatus(item[3]), // 发票状态
                    salerTaxNo: item[4],
                    salerName: item[5],
                    buyerTaxNo: item[6],
                    buyerName: item[7],
                    invoiceAmount: item[8],
                    taxAmount: item[9],
                    totalAmount: item[10],
                    checkCode: item[11],
                    salerAddressPhone: item[12],
                    salerAccount: item[13],
                    buyerAddressPhone: item[14],
                    buyerAccount: item[15],
                    password: item[16],
                    remark: item[17],
                    machineNo: invoiceType === 1 ? item[18] : '', // 电子发票模板不一样
                    drawer: invoiceType === 1 ? item[19] : item[18],
                    payee: invoiceType === 1 ? item[20] : item[19],
                    reviewer: invoiceType === 1 ? item[21] : item[20],
                    items: []
                });
            }
        } else if (name.indexOf('货物信息') !== -1) {
            detailInfo = detailInfo.concat(curData.data);
        }
    }

    for (let j = 0; j < invoiceList.length; j++) {
        const item = invoiceList[j];
        const invoiceNo = item.invoiceNo;
        for (let i = 2; i < detailInfo.length;) {
            const curDetail = detailInfo[i];
            const dInvoiceNo = trim(curDetail[1]);
            if (invoiceNo === dInvoiceNo && curDetail[4].indexOf('详见销货清单') === -1) {
                item.items.push({
                    goodsCode: curDetail[2],
                    goodsName: curDetail[3],
                    specModel: curDetail[4],
                    unit: curDetail[5],
                    num: curDetail[6],
                    unitPrice: curDetail[7],
                    detailAmount: curDetail[8],
                    taxRate: curDetail[9],
                    taxAmount: curDetail[10]
                });
                detailInfo.splice(i, 1);
            } else {
                i += 1;
            }
        }
    }
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
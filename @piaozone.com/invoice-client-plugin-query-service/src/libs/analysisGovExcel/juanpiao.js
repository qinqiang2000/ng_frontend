
/* eslint-disable no-inline-comments,no-undef*/
// import xlsx from 'node-xlsx';
// import fs from 'fs';
// import errcodeInfo from '$client/errcodeInfo';
import { trim } from '../tools';
import { changeInvoiceStatus } from '../transformInvoice';

export default function juanpiao(filePath, info = {}) {
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
    const tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;

    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        if (curData.name === '发票信息') {
            for (let j = 2; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = trim(item[1]);
                const invoiceNo = trim(item[2]);
                if (!invoiceCode || !invoiceNo) {
                    break;
                }

                invoiceList.push({
                    invoiceType: 5,
                    invoiceCode: invoiceCode,
                    invoiceNo: invoiceNo,
                    invoiceDate: item[3],
                    invoiceStatus: changeInvoiceStatus(item[4]), // 发票状态
                    salerName: item[5],
                    salerTaxNo: item[6],
                    buyerName: item[7],
                    buyerTaxNo: item[8],
                    machineNo: item[10], //
                    payee: item[11], // 收款员
                    checkCode: item[12],
                    invoiceAmount: 0, // 通过明细计算
                    taxAmount: 0,
                    totalAmount: 0,

                    // salerAddressPhone: '',
                    // salerAccount: '',
                    // buyerAddressPhone: '',
                    // buyerAccount: '',
                    // password: '',
                    // remark: '',
                    // drawer: '',
                    // reviewer: '',

                    items: []
                });
            }
        } else if (curData.name === '货物信息') {
            detailInfo = curData.data;
        }
    }

    for (let j = 0; j < invoiceList.length; j++) {
        const item = invoiceList[j];
        const invoiceCode = item.invoiceCode;
        const invoiceNo = item.invoiceNo;
        let curInvoiceAmount = 0.00;
        for (let i = 2; i < detailInfo.length;) {
            const curDetail = detailInfo[i];
            const dInvoiceCode = trim(curDetail[1]);
            const dInvoiceNo = trim(curDetail[2]);
            if (invoiceCode === dInvoiceCode && invoiceNo === dInvoiceNo) {
                const detailAmount = curDetail[7];
                curInvoiceAmount += parseFloat(detailAmount);
                item.items.push({
                    goodsCode: curDetail[3],
                    goodsName: curDetail[4],
                    unitPrice: curDetail[5],
                    num: curDetail[6],
                    detailAmount
                });
                detailInfo.splice(i, 1);
            } else {
                i += 1;
            }
        }

        item.invoiceAmount = parseFloat(curInvoiceAmount).toFixed(2);
        item.totalAmount = parseFloat(curInvoiceAmount).toFixed(2);

        tongjiInvoiceAmount += parseFloat(curInvoiceAmount);
        tongjiTotalAmount += parseFloat(curInvoiceAmount);
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
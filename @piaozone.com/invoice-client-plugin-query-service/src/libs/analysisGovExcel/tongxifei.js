
/* eslint-disable no-inline-comments,no-undef*/
// import xlsx from 'node-xlsx';
// import fs from 'fs';
// import errcodeInfo from '$client/errcodeInfo';
import { trim, checkInvoiceType } from '../tools';
import { changeInvoiceStatus } from '../transformInvoice';

export default function tongxifei(filePath, info = {}) {
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
        if (curData.name === '发票信息') {
            for (let j = 2; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = trim(item[1]);
                const invoiceNo = trim(item[2]);
                if (!invoiceCode || !invoiceNo) {
                    break;
                }
                const invoiceAmount = item[9];
                const taxAmount = item[10];
                const totalAmount = item[11];

                tongjiTotalTaxAmount += parseFloat(taxAmount);
                tongjiInvoiceAmount += parseFloat(invoiceAmount);
                tongjiTotalAmount += parseFloat(totalAmount);
                let invoiceType = info.invoiceType;
                if (invoiceType === 1) {
                    if (checkInvoiceType(invoiceCode, invoiceNo) === 15) { // 通行费发票
                        invoiceType = 15;
                    }
                }
                invoiceList.push({
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
                    drawer: item[20],
                    payee: item[21],
                    reviewer: item[22],
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
        for (let i = 2; i < detailInfo.length;) {
            const curDetail = detailInfo[i];
            const dInvoiceCode = trim(curDetail[1]);
            const dInvoiceNo = trim(curDetail[2]);
            if (invoiceCode === dInvoiceCode && invoiceNo === dInvoiceNo && curDetail[4].indexOf('详见销货清单') === -1) {
                item.items.push({
                    goodsCode: curDetail[3],
                    goodsName: curDetail[4],
                    vehPlate: curDetail[5], // 车牌号
                    specModel: curDetail[6],
                    startDate: curDetail[7],
                    endDate: curDetail[8],
                    detailAmount: curDetail[9],
                    taxRate: curDetail[10],
                    taxAmount: curDetail[11]
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
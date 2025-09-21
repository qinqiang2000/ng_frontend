
/* eslint-disable no-inline-comments,no-undef*/
// import xlsx from 'node-xlsx';
// import fs from 'fs';
// import errcodeInfo from '$client/errcodeInfo';
import { trim } from '../tools';
import { changeInvoiceStatus } from '../transformInvoice';

export default function jidongche(filePath, info = {}) {
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
    let tongjiTotalAmount = 0.00;
    let tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;

    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        if (curData.name === '发票信息') {
            for (let j = 2; j < curData.data.length; j++) {
                const invoiceType = info.invoiceType;
                const item = curData.data[j];
                const invoiceCode = trim(item[1]);
                const invoiceNo = trim(item[2]);
                if (!invoiceCode || !invoiceNo) {
                    break;
                }

                const totalAmount = item[16] ? parseFloat(item[16]) : 0;
                tongjiTotalTaxAmount += parseFloat(item[24]);
                tongjiInvoiceAmount += parseFloat(item[27]);
                tongjiTotalAmount += totalAmount;

                invoiceList.push({
                    invoiceType,
                    invoiceCode: invoiceCode,
                    invoiceNo: invoiceNo,
                    invoiceDate: item[3],
                    invoiceStatus: changeInvoiceStatus(item[4]), // 发票状态
                    buyerName: item[5],
                    buyerCardno: item[6],
                    buyerTaxNo: item[7],
                    vehicleType: item[8],
                    brandModel: item[9],
                    producingArea: item[10],
                    certificateNum: item[11],
                    importCertificate: item[12],
                    commodityInspectionNum: item[13],
                    engineNum: item[14],
                    vehicleIdentificationCode: item[15],
                    totalAmount: item[16],
                    salerName: item[17],
                    salerPhone: item[18],
                    salerTaxNo: item[19],
                    salerAccount: item[20],
                    salerAddress: item[21],
                    salerBankName: item[22],
                    taxRate: item[23],
                    taxAmount: item[24],
                    taxAuthorityName: item[25],
                    taxAuthorityCode: item[26],
                    invoiceMoney: item[27],
                    overTaxCode: item[28],
                    totalTon: item[29],
                    limitePeople: item[30]
                });
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
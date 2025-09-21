
/* eslint-disable no-inline-comments,no-undef*/
import analysisZhuanpiao_pupiao from './zhuanpiao_pupiao';
import analysisJuanpiao from './juanpiao';
import analysisJks from './jks';
// import errcodeInfo from '$client/errcodeInfo';
import analysisTongxifei from './tongxifei';
import analysisQuanDian from './quandian';
import analysisJidongche from './jidongche';

// 专票、普通发票、电子发票模板一样
export function analysisExcel(filePath, excelInfo) {
    const invoiceType = excelInfo.invoiceType;
    if (invoiceType === 3 || invoiceType === 4 || invoiceType === 1 || invoiceType === 2) {
        return analysisZhuanpiao_pupiao(filePath, excelInfo);
    }
    if (invoiceType === 5) {
        return analysisJuanpiao(filePath, excelInfo);
    }
    if (invoiceType === 15) { // 通行费发票
        return analysisTongxifei(filePath, excelInfo);
    }
    if (invoiceType === 12) {
        // return errcodeInfo.fpyUnsuportAnalysis;
        return analysisJidongche(filePath, excelInfo);
    }

    if (invoiceType === 21) { // 缴款书
        return analysisJks(filePath, excelInfo);
    }

    if (invoiceType === 26 || invoiceType === 27) { // 数电
        return analysisQuanDian(filePath, excelInfo);
    }

    return errcodeInfo.fpyUnsuportAnalysis;
}
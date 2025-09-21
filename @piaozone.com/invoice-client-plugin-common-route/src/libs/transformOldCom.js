/* eslint-disable spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda,max-len,object-curly-spacing,key-spacing,comma-spacing,quotes */
import { transformFpyTypeToGov } from './downloadApplyTool';

export function easydkqueryOutPut(resData = [], fixEtaxInvoiceType = '') {
    const invoice = [];
    let invoiceAmount = 0.00;
    for (let i = 0; i < resData.length; i++) {
        const item = resData[i];
        let fplx;
        // 数电专用专票兼容不支持数电的erp转换为电子发票
        if (fixEtaxInvoiceType === '1' && parseInt(item.invoiceType) === 27) {
            fplx = '05';
        } else {
            fplx = transformFpyTypeToGov(item.invoiceType);
        }
        if (fplx === -1) {
            continue;
        }
        // 旧版返回的发票类型电子专票为05
        // fplx = fplx === '08' ? '05' : fplx;
        const authenticateFlag = parseInt(item.authenticateFlag);
        invoiceAmount += parseFloat(item.invoiceAmount);
        invoice.push({
            invoice_code: item.invoiceCode || '',
            invoice_num: item.invoiceNo,
            invoice_state: item.invoiceStatus + '',
            checkdate: (item.selectAuthenticateTime || item.authenticateTime || '').substr(0, 10), // 认证日期
            taxbelong: item.taxPeriod,
            select_flag: authenticateFlag === 1 || authenticateFlag === 2 ? '1' : '0',
            select_date: authenticateFlag === 1 || authenticateFlag === 2 ? item.selectTime.substr(0, 10) : '',
            moneyamount: item.invoiceAmount + '', // 不含税金额
            billdate: item.invoiceDate,
            tax: (item.taxAmount || item.totalTaxAmount) + '',
            authentype: '1',
            invoice_type: fplx,
            sellername: item.salerName,
            buyername: item.buyerName,
            buyercode: item.buyerTaxNo
        });
    }
    return {
        invoice,
        totalMoney: invoiceAmount.toFixed(2)
    };
}

export function recvinvOutPut(resData = [], fixEtaxInvoiceType = '') {
    const invoice = [];
    let invoiceAmount = 0.00;
    for (let i = 0; i < resData.length; i++) {
        const item = resData[i];
        let fplx;
        if (fixEtaxInvoiceType === '1' && parseInt(item.invoiceType) === 27) {
            fplx = '05';
        } else {
            fplx = transformFpyTypeToGov(item.invoiceType);
        }
        if (fplx === -1) {
            continue;
        }
        // 旧版返回的发票类型电子专票为05
        fplx = fplx === '08' ? '05' : fplx;
        invoiceAmount += parseFloat(item.invoiceAmount);
        invoice.push({
            fpdm: item.invoiceCode || '',
            fphm: item.invoiceNo,
            fpzt: item.invoiceStatus + '',
            jshj: item.invoiceAmount + '',
            kprq: item.invoiceDate,
            se: (item.taxAmount || item.totalTaxAmount) + '',
            sf_gx: item.checkFlag,
            gx_sj: item.selectTime.substr(0, 10),
            sf_gxrz: item.checkAuthenticateFlag,
            gx_rzsj: item.selectAuthenticateTime.substr(0, 10),
            sf_smrz: item.scanAuthenticateFlag,
            sm_rzsj: item.scanAuthenticateTime,
            xhf_mc: item.salerName || '',
            xhf_nsrsbh: item.salerTaxNo || '',
            ghf_mc: item.buyerName || '',
            ghf_nsrsbh: item.buyerTaxNo || '',
            fplx: fplx,
            taxbelong: item.taxPeriod
        });
    }

    return {
        invoice,
        totalMoney: invoiceAmount.toFixed(2)
    };
}

// recvinv接口税局数据和发票云数据合并
export function recvinvMerge(fpyArr = [], govDataArr = []) {
    const resultDict = {};
    const resultList = [...govDataArr];
    let totalMoney = 0.00;
    for (let i = 0; i < govDataArr.length; i++) {
        const item = govDataArr[i];
        const invoiceKey = item.fpdm + '-' + item.fphm;
        totalMoney += parseFloat(item.jshj);
        resultDict[invoiceKey] = item;
    }
    for (let i = 0; i < fpyArr.length; i++) {
        const item = fpyArr[i];
        const invoiceKey = item.fpdm + '-' + item.fphm;
        // 只合并红票，蓝票可能勾选状态不一致导致数据异常
        if (!resultDict[invoiceKey] && item.jshj < 0) {
            totalMoney += parseFloat(item.jshj);
            resultList.push(item);
        }
    }
    return {
        copies: resultList.length,
        invoice: resultList,
        totalMoney: totalMoney.toFixed(2)
    };
}

// easydkquery接口税局数据和发票云数据合并
export function easydkqueryMerge(fpyArr = [], govDataArr = []) {
    const resultDict = {};
    const resultList = [...govDataArr];
    let totalMoney = 0.00;
    for (let i = 0; i < govDataArr.length; i++) {
        const item = govDataArr[i];
        const invoiceKey = item.invoice_code + '-' + item.invoice_num;
        totalMoney += parseFloat(item.moneyamount);
        resultDict[invoiceKey] = item;
    }
    for (let i = 0; i < fpyArr.length; i++) {
        const item = fpyArr[i];
        const invoiceKey = item.invoice_code + '-' + item.invoice_num;
        if (!resultDict[invoiceKey]) {
            totalMoney += parseFloat(item.moneyamount);
            resultList.push(item);
        }
    }
    return {
        copies: resultList.length,
        invoice: resultList,
        totalMoney: totalMoney.toFixed(2)
    };
}
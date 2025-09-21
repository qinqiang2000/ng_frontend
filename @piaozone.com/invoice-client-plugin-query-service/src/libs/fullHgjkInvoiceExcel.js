/* eslint-disable no-undef,complexity,prefer-const */

import { trim, fixeNumber } from './tools';

const excelTtiles = {
    baseSheet: {
        customDeclarationNo: '海关缴款书号码',
        invoiceDate: '填发日期',
        totalTaxAmount: '税款金额', // 总税额
        totalAmount: '税款金额', // 总税额
        buyerTaxNo: '缴款单位税号',
        buyerName: '缴款单位名称'
    },
    detailSheet: {
        customDeclarationNo: '海关缴款书号码',
        goodsCode: '税号',
        taxNumberInformation: '税号',
        goodsName: '货物名称',
        num: '数量',
        unit: '单位',
        detailAmount: '完税价格',
        taxRateTemp: '税率',
        taxAmount: '税款金额'
    }
};

function getBaseSheetItemIndex(data) {
    const baseSheet = excelTtiles.baseSheet;
    return {
        customDeclarationNoIndex: data.findIndex((title) => title === baseSheet.customDeclarationNo),
        invoiceDateIndex: data.findIndex((title) => title === baseSheet.invoiceDate),
        totalTaxAmountIndex: data.findIndex((title) => title === baseSheet.totalTaxAmount),
        buyerTaxNoIndex: data.findIndex((title) => title === baseSheet.buyerTaxNo),
        buyerNameIndex: data.findIndex((title) => title === baseSheet.buyerName)
    };
}

function getDetailSheetItemIndex(data) {
    const detailSheet = excelTtiles.detailSheet;
    return {
        customDeclarationNoIndex: data.findIndex((title) => title === detailSheet.customDeclarationNo),
        goodsCodeIndex: data.findIndex((title) => title === detailSheet.goodsCode),
        goodsNameIndex: data.findIndex((title) => title === detailSheet.goodsName),
        unitIndex: data.findIndex((title) => title === detailSheet.unit),
        numIndex: data.findIndex((title) => title === detailSheet.num),
        detailAmountIndex: data.findIndex((title) => title === detailSheet.detailAmount),
        taxRateTempIndex: data.findIndex((title) => title === detailSheet.taxRateTemp),
        taxAmountIndex: data.findIndex((title) => title === detailSheet.taxAmount)
    };
}

export function jxInvoicesByTitle(filePath, searchOpt = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }
    let detailInfo = [];
    const invoiceDict = {};
    const invoiceKeyList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        const name = curData.name || '';
        if (name === '海关缴款书基础信息') {
            const titles = curData.data[0];
            const keyIndex = getBaseSheetItemIndex(titles);

            for (let j = 1; j < curData.data.length; j++) {
                const item = curData.data[j];
                const customDeclarationNo = trim(item[keyIndex.customDeclarationNoIndex]);
                // 出现空行直接退出
                if (!customDeclarationNo) {
                    break;
                }

                const invoiceDate = item[keyIndex.invoiceDateIndex] || '';
                if (!invoiceDate) {
                    break;
                }
                const totalTaxAmount = fixeNumber(item[keyIndex.totalTaxAmountIndex]); // 总税额
                let invoiceKey = customDeclarationNo;
                invoiceKeyList.push(invoiceKey);
                invoiceDict[invoiceKey] = {
                    invoiceType: 21,
                    customDeclarationNo,
                    invoiceDate,
                    invoiceStatus: 0, // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
                    totalTaxAmount,
                    totalAmount: totalTaxAmount,
                    buyerName: item[keyIndex.buyerNameIndex] || '',
                    buyerTaxNo: item[keyIndex.buyerTaxNoIndex] || '',
                    items: []
                };
            }
        } else if (name.indexOf('货物清单') !== -1) {
            detailInfo = detailInfo.concat(curData.data);
        }
    }
    const detailTitles = detailInfo[0];
    const detailKeyIndex = getDetailSheetItemIndex(detailTitles);
    for (let i = 1; i < detailInfo.length; i++) {
        const curDetail = detailInfo[i];
        const customDeclarationNo = trim(curDetail[detailKeyIndex.customDeclarationNoIndex]);
        // 出现空行，直接退出
        if (!customDeclarationNo) {
            break;
        }

        let invoiceKey = customDeclarationNo;
        let item = invoiceDict[invoiceKey];
        // 表头不存在
        if (!item) {
            continue;
        }
        const taxRateTemp = curDetail[detailKeyIndex.taxRateTempIndex] || '';
        let taxRate = '';
        if (taxRateTemp.indexOf('%') !== -1) {
            taxRate = (parseFloat(taxRateTemp.replace('%', '')) / 100).toFixed(2);
        }
        invoiceDict[invoiceKey].items.push({
            goodsCode: curDetail[detailKeyIndex.goodsCodeIndex],
            taxNumberInformation: curDetail[detailKeyIndex.goodsCodeIndex],
            goodsName: curDetail[detailKeyIndex.goodsNameIndex],
            unit: curDetail[detailKeyIndex.unitIndex],
            num: curDetail[detailKeyIndex.numIndex],
            taxRate,
            taxAmount: fixeNumber(curDetail[detailKeyIndex.taxAmountIndex]),
            detailAmount: fixeNumber(curDetail[detailKeyIndex.detailAmountIndex])
        });
    }
    const invoiceData = invoiceKeyList.map((k) => {
        return invoiceDict[k];
    });
    return {
        errcode: '0000',
        data: invoiceData
    };
}

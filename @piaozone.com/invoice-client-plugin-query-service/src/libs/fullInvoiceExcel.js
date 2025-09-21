/* eslint-disable no-undef,complexity,prefer-const */

// import xlsx from 'node-xlsx';
// import errcodeInfo from '$client/errcodeInfo';
// import fs from 'fs';
import { trim, fixeNumber } from './tools';
import { getEtaxInvoiceType, getInvoiceStatusByText } from './etaxInvoiceType';
// const path = require('path');

export function jxInvoices(filePath, searchOpt = {}) {
    let workSheetsFromBuffer = null;
    const sInvoiceType = searchOpt.invoiceType || -1;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }
    let detailInfo = [];
    let tongjiTotalAmount = 0.00;
    let tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;
    const tongxingfeiNum = 0;
    const juanpiaoNum = 0;
    const invoiceDict = {};
    const invoiceKeyList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        const name = curData.name || '';
        if (name === '发票基础信息') {
            for (let j = 1; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = trim(item[1]);
                const invoiceNo = trim(item[2]);
                const invoiceType = getEtaxInvoiceType(trim(item[12]), invoiceCode);
                const qdInvocieNo = item[3] === '--' ? '' : item[3];
                // 出现空行直接退出
                if (!invoiceCode && !invoiceNo && !qdInvocieNo) {
                    break;
                }
                // 发票类型不一致直接过滤
                if (sInvoiceType !== -1 && parseInt(sInvoiceType) !== invoiceType) {
                    // 申请普通电子发票时，包含通行费发票
                    // if (parseInt(sInvoiceType) === 1 && invoiceType === 15) {
                    //     tongxingfeiNum += 1;
                    // 申请纸质普通发票时包含卷票
                    // } else if (parseInt(sInvoiceType) === 3 && invoiceType === 5) {
                    //     juanpiaoNum += 1;
                    // } else {
                    //     continue;
                    // }
                    continue;
                }

                const invoiceDate = item[8] || '';
                if (!invoiceDate) {
                    break;
                }
                let isQdfp = false;
                if ([26, 27].indexOf(invoiceType) !== -1) {
                    isQdfp = true;
                }

                let etaxInvoiceNo = '';
                if ((invoiceType === 3 || invoiceType === 4) && qdInvocieNo) { // 数电票号码, 数电纸质发票才有
                    etaxInvoiceNo = qdInvocieNo;
                }
                const invoiceAmount = fixeNumber(item[9]);
                const taxAmount = fixeNumber(item[10]);
                const totalAmount = (parseFloat(invoiceAmount) + parseFloat(taxAmount)).toFixed(2);

                tongjiTotalTaxAmount += parseFloat(taxAmount);
                tongjiInvoiceAmount += parseFloat(invoiceAmount);
                tongjiTotalAmount += parseFloat(totalAmount);

                let invoiceKey = invoiceCode + '-' + invoiceNo + '-' + qdInvocieNo;
                if (etaxInvoiceNo) { // 数电纸质发票,因为货物清单中只有数电号码，没有invoiceCode、invoiceNo
                    invoiceKey = etaxInvoiceNo;
                }
                invoiceKeyList.push(invoiceKey);
                // let etaxInvoiceNo = '';
                // if (invoiceType === 3 || invoiceType === 4) { // 数电票号码, 数电纸质发票才有
                //     etaxInvoiceNo = qdInvocieNo;
                // }
                invoiceDict[invoiceKey] = {
                    etaxInvoiceNo,
                    invoiceType, // 电子发票对通行费发票再判断
                    invoiceCode: isQdfp ? '' : invoiceCode,
                    invoiceNo: isQdfp ? qdInvocieNo : invoiceNo,
                    invoiceDate, // : invoiceDate.substr(0, 10),
                    invoiceStatus: getInvoiceStatusByText(item[13]), // 发票状态
                    salerTaxNo: item[4],
                    salerName: item[5],
                    buyerTaxNo: item[6],
                    buyerName: item[7],
                    invoiceAmount: fixeNumber(item[9]),
                    taxAmount: fixeNumber(item[10]),
                    totalTaxAmount: fixeNumber(item[10]),
                    totalAmount: totalAmount,
                    checkCode: '',
                    salerAddressPhone: '',
                    salerAccount: '',
                    buyerAddressPhone: '',
                    buyerAccount: '',
                    password: '',
                    remark: trim(item[16]),
                    machineNo: '',
                    drawer: item[15] || '',
                    payee: '',
                    reviewer: '',
                    invoiceSource: item[11], // 发票来源
                    invoiceRiskLevel: item[14], // 发票风险等级
                    items: []
                };
            }
        } else if (name.indexOf('货物清单') !== -1) {
            detailInfo = detailInfo.concat(curData.data);
        }
    }

    for (let i = 1; i < detailInfo.length; i++) {
        const curDetail = detailInfo[i];
        const dInvoiceCode = trim(curDetail[1]);
        const dInvoiceNo = trim(curDetail[2]);
        const dQdInvoiceNo = trim(curDetail[3]) === '--' ? '' : trim(curDetail[3]);
        const goodsName = curDetail[5] || '';
        // 出现空行，直接退出
        if (!dInvoiceCode && !dInvoiceNo && !dQdInvoiceNo) {
            break;
        }

        let invoiceKey = dInvoiceCode + '-' + dInvoiceNo + '-' + dQdInvoiceNo;
        let item = invoiceDict[invoiceKey];
        // 表头不存在
        if (!item) {
            invoiceKey = dQdInvoiceNo; // 数电纸质票
            item = invoiceDict[invoiceKey];
            if (!item) {
                continue;
            }
        }

        const invoiceType = item.invoiceType;
        if (goodsName.indexOf('详见销货清单') === -1) {
            const taxRateTemp = curDetail[11] + '';
            let taxRate = '';
            let zeroTaxRateFlag = '';
            if (taxRateTemp.indexOf('%') !== -1) {
                taxRate = (parseFloat(taxRateTemp.replace('%', '')) / 100).toFixed(2);
            } else if (taxRateTemp.indexOf('免税') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '1';
            } else if (taxRateTemp.indexOf('不征税') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '2';
            } else if (taxRateTemp.indexOf('普通零税率') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '3';
            } else if (taxRateTemp.indexOf('***') !== -1) { // 税率计算方式：税率 = 税额 / (不含税金额 - 备注中差额征税值) -- '差额征税：2640.00。'
                const { totalTaxAmount, invoiceAmount, remark } = item;
                let difference = 0;
                if (remark && remark.indexOf('差额征税') !== -1) {
                    const texts = remark.split('：');
                    if (texts.length > 1) {
                        difference = parseFloat(texts[1].split('。')[0]);
                    }
                }
                const differenceRes = invoiceAmount - difference;
                if (differenceRes === 0) {
                    taxRate = '0.00';
                } else {
                    taxRate = (totalTaxAmount / (invoiceAmount - difference)).toFixed(2);
                }
            } else {
                taxRate = fixeNumber(curDetail[11]);
                if (!curDetail[11] || taxRate === 'undefined') {
                    taxRate = '';
                }
            }

            if (invoiceType === 15) {
                invoiceDict[invoiceKey].items.push({
                    goodsCode: curDetail[4],
                    goodsName: curDetail[5],
                    vehPlate: curDetail[6],
                    specModel: curDetail[7],
                    startDate: curDetail[8],
                    endDate: curDetail[9],
                    detailAmount: fixeNumber(curDetail[10]),
                    taxRate: taxRate, // fixeNumber(curDetail[11]),
                    taxAmount: fixeNumber(curDetail[12]),
                    zeroTaxRateFlag
                });
            } else {
                invoiceDict[invoiceKey].items.push({
                    goodsCode: curDetail[4],
                    goodsName: curDetail[5],
                    specModel: curDetail[6],
                    unit: curDetail[7],
                    num: curDetail[8],
                    unitPrice: curDetail[9],
                    detailAmount: fixeNumber(curDetail[10]),
                    taxRate: taxRate, // fixeNumber(curDetail[11]),
                    taxAmount: fixeNumber(curDetail[12]),
                    zeroTaxRateFlag
                });
            }
        }
    }
    const invoiceData = invoiceKeyList.map((k) => {
        return invoiceDict[k];
    });
    return {
        errcode: '0000',
        data: invoiceData,
        tongjiInfo: {
            totalAmount: tongjiTotalAmount.toFixed(2),
            totalTaxAmount: tongjiTotalTaxAmount.toFixed(2),
            invoiceAmount: tongjiInvoiceAmount.toFixed(2),
            invoiceNum: invoiceData.length,
            juanpiaoNum,
            tollBillNum: tongxingfeiNum // 通行费发票数量
        }
    };
}

export function jxInvoicesJson(filePath) {
    let dataJson = null;
    const jsonFile = path.resolve(filePath);
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }
        // dataJson = fs.readFileSync(filePath);
        dataJson = fs.readFileSync(jsonFile, 'UTF-8').toString();
    } catch (error) {
        return errcodeInfo.parseJsonErr;
    }

    return {
        errcode: '0000',
        data: dataJson
    };
}

export function jxInvoicesFuJian(filePath, searchOpt = {}) {
    let workSheetsFromBuffer = null;
    const sInvoiceType = searchOpt.invoiceType || -1;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }
    let detailInfo = [];
    let tongjiTotalAmount = 0.00;
    let tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;
    const tongxingfeiNum = 0;
    const juanpiaoNum = 0;
    const invoiceDict = {};
    const invoiceKeyList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        const name = curData.name || '';
        if (name === '发票基础信息') {
            for (let j = 1; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = trim(item[1]);
                const invoiceNo = trim(item[2]);
                const invoiceType = getEtaxInvoiceType(trim(item[13]), invoiceCode);
                const qdInvocieNo = item[3] === '--' ? '' : item[3];
                // 出现空行直接退出
                if (!invoiceCode && !invoiceNo && !qdInvocieNo) {
                    break;
                }
                // 发票类型不一致直接过滤
                if (sInvoiceType !== -1 && parseInt(sInvoiceType) !== invoiceType) {
                    // 申请普通电子发票时，包含通行费发票
                    // if (parseInt(sInvoiceType) === 1 && invoiceType === 15) {
                    //     tongxingfeiNum += 1;
                    // 申请纸质普通发票时包含卷票
                    // } else if (parseInt(sInvoiceType) === 3 && invoiceType === 5) {
                    //     juanpiaoNum += 1;
                    // } else {
                    //     continue;
                    // }
                    continue;
                }

                const invoiceDate = item[8] || '';
                if (!invoiceDate) {
                    break;
                }
                let isQdfp = false;
                if ([26, 27].indexOf(invoiceType) !== -1) {
                    isQdfp = true;
                }

                let etaxInvoiceNo = '';
                if ((invoiceType === 3 || invoiceType === 4) && qdInvocieNo) { // 数电票号码, 数电纸质发票才有
                    etaxInvoiceNo = qdInvocieNo;
                }
                const invoiceAmount = fixeNumber(item[9]);
                const taxAmount = fixeNumber(item[10]);
                const totalAmount = (parseFloat(invoiceAmount) + parseFloat(taxAmount)).toFixed(2);

                tongjiTotalTaxAmount += parseFloat(taxAmount);
                tongjiInvoiceAmount += parseFloat(invoiceAmount);
                tongjiTotalAmount += parseFloat(totalAmount);

                let invoiceKey = invoiceCode + '-' + invoiceNo + '-' + qdInvocieNo;
                if (etaxInvoiceNo) { // 数电纸质发票,因为货物清单中只有数电号码，没有invoiceCode、invoiceNo
                    invoiceKey = etaxInvoiceNo;
                }
                invoiceKeyList.push(invoiceKey);
                // let etaxInvoiceNo = '';
                // if (invoiceType === 3 || invoiceType === 4) { // 数电票号码, 数电纸质发票才有
                //     etaxInvoiceNo = qdInvocieNo;
                // }
                invoiceDict[invoiceKey] = {
                    etaxInvoiceNo,
                    invoiceType, // 电子发票对通行费发票再判断
                    invoiceCode: isQdfp ? '' : invoiceCode,
                    invoiceNo: isQdfp ? qdInvocieNo : invoiceNo,
                    invoiceDate, // : invoiceDate.substr(0, 10),
                    invoiceStatus: getInvoiceStatusByText(item[14]), // 发票状态
                    salerTaxNo: item[4],
                    salerName: item[5],
                    buyerTaxNo: item[6],
                    buyerName: item[7],
                    invoiceAmount: fixeNumber(item[9]),
                    taxAmount: fixeNumber(item[10]),
                    totalTaxAmount: fixeNumber(item[10]),
                    totalAmount: totalAmount,
                    checkCode: '',
                    salerAddressPhone: '',
                    salerAccount: '',
                    buyerAddressPhone: '',
                    buyerAccount: '',
                    password: '',
                    remark: trim(item[17]),
                    machineNo: '',
                    drawer: item[16] || '',
                    payee: '',
                    reviewer: '',
                    invoiceSource: item[11], // 发票来源
                    invoiceRiskLevel: item[15], // 发票风险等级
                    items: []
                };
            }
        } else if (name.indexOf('货物清单') !== -1) {
            detailInfo = detailInfo.concat(curData.data);
        }
    }

    for (let i = 1; i < detailInfo.length; i++) {
        const curDetail = detailInfo[i];
        const dInvoiceCode = trim(curDetail[1]);
        const dInvoiceNo = trim(curDetail[2]);
        const dQdInvoiceNo = trim(curDetail[3]) === '--' ? '' : trim(curDetail[3]);
        const goodsName = curDetail[5] || '';
        // 出现空行，直接退出
        if (!dInvoiceCode && !dInvoiceNo && !dQdInvoiceNo) {
            break;
        }

        let invoiceKey = dInvoiceCode + '-' + dInvoiceNo + '-' + dQdInvoiceNo;
        let item = invoiceDict[invoiceKey];
        // 表头不存在
        if (!item) {
            invoiceKey = dQdInvoiceNo; // 数电纸质票
            item = invoiceDict[invoiceKey];
            if (!item) {
                continue;
            }
        }

        const invoiceType = item.invoiceType;
        if (goodsName.indexOf('详见销货清单') === -1) {
            const taxRateTemp = curDetail[11] + '';
            let taxRate = '';
            let zeroTaxRateFlag = '';
            if (taxRateTemp.indexOf('%') !== -1) {
                taxRate = (parseFloat(taxRateTemp.replace('%', '')) / 100).toFixed(2);
            } else if (taxRateTemp.indexOf('免税') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '1';
            } else if (taxRateTemp.indexOf('不征税') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '2';
            } else if (taxRateTemp.indexOf('普通零税率') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '3';
            } else if (taxRateTemp.indexOf('***') !== -1) { // 税率计算方式：税率 = 税额 / (不含税金额 - 备注中差额征税值) -- '差额征税：2640.00。'
                const { totalTaxAmount, invoiceAmount, remark } = item;
                let difference = 0;
                if (remark && remark.indexOf('差额征税') !== -1) {
                    const texts = remark.split('：');
                    if (texts.length > 1) {
                        difference = parseFloat(texts[1].split('。')[0]);
                    }
                }
                const differenceRes = invoiceAmount - difference;
                if (differenceRes === 0) {
                    taxRate = '0.00';
                } else {
                    taxRate = (totalTaxAmount / (invoiceAmount - difference)).toFixed(2);
                }
            } else {
                taxRate = fixeNumber(curDetail[11]);
                if (!curDetail[11] || taxRate === 'undefined') {
                    taxRate = '';
                }
            }

            if (invoiceType === 15) {
                invoiceDict[invoiceKey].items.push({
                    goodsCode: curDetail[4],
                    goodsName: curDetail[5],
                    vehPlate: curDetail[6],
                    specModel: curDetail[7],
                    startDate: curDetail[8],
                    endDate: curDetail[9],
                    detailAmount: fixeNumber(curDetail[10]),
                    taxRate: taxRate, // fixeNumber(curDetail[11]),
                    taxAmount: fixeNumber(curDetail[12]),
                    zeroTaxRateFlag
                });
            } else {
                invoiceDict[invoiceKey].items.push({
                    goodsCode: curDetail[4],
                    goodsName: curDetail[5],
                    specModel: curDetail[6],
                    unit: curDetail[7],
                    num: curDetail[8],
                    unitPrice: curDetail[9],
                    detailAmount: fixeNumber(curDetail[10]),
                    taxRate: taxRate, // fixeNumber(curDetail[11]),
                    taxAmount: fixeNumber(curDetail[12]),
                    zeroTaxRateFlag
                });
            }
        }
    }
    const invoiceData = invoiceKeyList.map((k) => {
        return invoiceDict[k];
    });
    return {
        errcode: '0000',
        data: invoiceData,
        tongjiInfo: {
            totalAmount: tongjiTotalAmount.toFixed(2),
            totalTaxAmount: tongjiTotalTaxAmount.toFixed(2),
            invoiceAmount: tongjiInvoiceAmount.toFixed(2),
            invoiceNum: invoiceData.length,
            juanpiaoNum,
            tollBillNum: tongxingfeiNum // 通行费发票数量
        }
    };
}

const excelTtiles = {
    baseSheet: {
        invoiceCode: '发票代码',
        invoiceNo: '发票号码',
        qdInvocieNo: '数电票号码',
        salerTaxNo: '销方识别号',
        salerName: '销方名称',
        buyerTaxNo: '购方识别号',
        buyerName: '购买方名称',
        invoiceDate: '开票日期',
        invoiceAmount: '金额',
        taxAmount: '税额',
        invoiceSource: '发票来源',
        invoiceType: '发票票种',
        invoiceStatus: '发票状态',
        invoiceRiskLevel: '发票风险等级',
        drawer: '开票人',
        remark: '备注'
    },
    detailSheet: {
        invoiceCode: '发票代码',
        invoiceNo: '发票号码',
        qdInvocieNo: '数电票号码',
        goodsCode: '税收分类编码',
        goodsName: '货物或应税劳务名称',
        specModel: '规格型号',
        unit: '单位',
        num: '数量',
        unitPrice: '单价',
        detailAmount: '金额',
        taxRateTemp: '税率',
        taxAmount: '税额',
        specificBusType: '特定业务类型'
    }
};

function getBaseSheetItemIndex(data) {
    const baseSheet = excelTtiles.baseSheet;
    return {
        invoiceCodeIndex: data.findIndex((title) => title === baseSheet.invoiceCode),
        invoiceNoIndex: data.findIndex((title) => title === baseSheet.invoiceNo),
        qdInvocieNoIndex: data.findIndex((title) => title === baseSheet.qdInvocieNo),
        salerTaxNoIndex: data.findIndex((title) => title === baseSheet.salerTaxNo),
        salerNameIndex: data.findIndex((title) => title === baseSheet.salerName),
        buyerTaxNoIndex: data.findIndex((title) => title === baseSheet.buyerTaxNo),
        buyerNameIndex: data.findIndex((title) => title === baseSheet.buyerName),
        invoiceDateIndex: data.findIndex((title) => title === baseSheet.invoiceDate),
        invoiceAmountIndex: data.findIndex((title) => title === baseSheet.invoiceAmount),
        taxAmountIndex: data.findIndex((title) => title === baseSheet.taxAmount),
        invoiceSourceIndex: data.findIndex((title) => title === baseSheet.invoiceSource),
        invoiceTypeIndex: data.findIndex((title) => title === baseSheet.invoiceType),
        invoiceStatusIndex: data.findIndex((title) => title === baseSheet.invoiceStatus),
        invoiceRiskLevelIndex: data.findIndex((title) => title === baseSheet.invoiceRiskLevel),
        drawerIndex: data.findIndex((title) => title === baseSheet.drawer),
        remarkIndex: data.findIndex((title) => title === baseSheet.remark)
    };
}

function getDetailSheetItemIndex(data) {
    const detailSheet = excelTtiles.detailSheet;
    return {
        invoiceCodeIndex: data.findIndex((title) => title === detailSheet.invoiceCode),
        invoiceNoIndex: data.findIndex((title) => title === detailSheet.invoiceNo),
        qdInvocieNoIndex: data.findIndex((title) => title === detailSheet.qdInvocieNo),
        goodsCodeIndex: data.findIndex((title) => title === detailSheet.goodsCode),
        goodsNameIndex: data.findIndex((title) => title === detailSheet.goodsName),
        specModelIndex: data.findIndex((title) => title === detailSheet.specModel),
        unitIndex: data.findIndex((title) => title === detailSheet.unit),
        numIndex: data.findIndex((title) => title === detailSheet.num),
        unitPriceIndex: data.findIndex((title) => title === detailSheet.unitPrice),
        detailAmountIndex: data.findIndex((title) => title === detailSheet.detailAmount),
        taxRateTempIndex: data.findIndex((title) => title === detailSheet.taxRateTemp),
        taxAmountIndex: data.findIndex((title) => title === detailSheet.taxAmount),
        specificBusTypeIndex: data.findIndex((title) => title === detailSheet.specificBusType)
    };
}

export function jxInvoicesByTitle(filePath, searchOpt = {}) {
    let workSheetsFromBuffer = null;
    const sInvoiceType = searchOpt.invoiceType || -1;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }
    let detailInfo = [];
    let tongjiTotalAmount = 0.00;
    let tongjiTotalTaxAmount = 0.00;
    let tongjiInvoiceAmount = 0.00;
    let tongxingfeiNum = 0;
    let juanpiaoNum = 0;
    const invoiceDict = {};
    const invoiceKeyList = [];
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        const name = curData.name || '';
        if (name === '发票基础信息') {
            // if (curData.data && curData.data.length > 0) {
            const titles = curData.data[0];
            const keyIndex = getBaseSheetItemIndex(titles);
            // }

            for (let j = 1; j < curData.data.length; j++) {
                const item = curData.data[j];
                const invoiceCode = trim(item[keyIndex.invoiceCodeIndex]);
                const invoiceNo = trim(item[keyIndex.invoiceNoIndex]);
                const invoiceType = getEtaxInvoiceType(trim(item[keyIndex.invoiceTypeIndex]), invoiceCode);
                const qdInvocieNo = item[keyIndex.qdInvocieNoIndex] === '--' ? '' : item[keyIndex.qdInvocieNoIndex];
                // 出现空行直接退出
                if (!invoiceCode && !invoiceNo && !qdInvocieNo) {
                    break;
                }
                // 发票类型不一致直接过滤
                if (sInvoiceType !== -1 && parseInt(sInvoiceType) !== invoiceType) {
                    // 申请普通电子发票时，包含通行费发票
                    // if (parseInt(sInvoiceType) === 1 && invoiceType === 15) {
                    //     tongxingfeiNum += 1;
                    // 申请纸质普通发票时包含卷票
                    // } else if (parseInt(sInvoiceType) === 3 && invoiceType === 5) {
                    //     juanpiaoNum += 1;
                    // } else {
                    //     continue;
                    // }
                    continue;
                }

                const invoiceDate = item[keyIndex.invoiceDateIndex] || '';
                if (!invoiceDate) {
                    break;
                }
                let isQdfp = false;
                if ([26, 27].indexOf(invoiceType) !== -1) {
                    isQdfp = true;
                }

                let etaxInvoiceNo = '';
                if ((invoiceType === 3 || invoiceType === 4) && qdInvocieNo) { // 数电票号码, 数电纸质发票才有
                    etaxInvoiceNo = qdInvocieNo;
                }
                const invoiceAmount = fixeNumber(item[keyIndex.invoiceAmountIndex]);
                const taxAmount = fixeNumber(item[keyIndex.taxAmountIndex]);
                const totalAmount = (parseFloat(invoiceAmount) + parseFloat(taxAmount)).toFixed(2);
                tongjiTotalTaxAmount += parseFloat(taxAmount);
                tongjiInvoiceAmount += parseFloat(invoiceAmount);
                tongjiTotalAmount += parseFloat(totalAmount);

                let invoiceKey = invoiceCode + '-' + invoiceNo + '-' + qdInvocieNo;
                if (etaxInvoiceNo) { // 数电纸质发票,因为货物清单中只有数电号码，没有invoiceCode、invoiceNo
                    invoiceKey = etaxInvoiceNo;
                }
                invoiceKeyList.push(invoiceKey);
                // let etaxInvoiceNo = '';
                // if (invoiceType === 3 || invoiceType === 4) { // 数电票号码, 数电纸质发票才有
                //     etaxInvoiceNo = qdInvocieNo;
                // }
                invoiceDict[invoiceKey] = {
                    etaxInvoiceNo,
                    invoiceType, // 电子发票对通行费发票再判断
                    invoiceCode: isQdfp ? '' : invoiceCode,
                    invoiceNo: isQdfp ? qdInvocieNo : invoiceNo,
                    invoiceDate, // : invoiceDate.substr(0, 10),
                    invoiceStatus: getInvoiceStatusByText(item[keyIndex.invoiceStatusIndex]), // 发票状态
                    salerTaxNo: item[keyIndex.salerTaxNoIndex],
                    salerName: item[keyIndex.salerNameIndex],
                    buyerTaxNo: item[keyIndex.buyerTaxNoIndex],
                    buyerName: item[keyIndex.buyerNameIndex],
                    invoiceAmount: fixeNumber(item[keyIndex.invoiceAmountIndex]),
                    taxAmount: fixeNumber(item[keyIndex.taxAmountIndex]),
                    totalTaxAmount: fixeNumber(item[keyIndex.taxAmountIndex]),
                    totalAmount: totalAmount,
                    checkCode: '',
                    salerAddressPhone: '',
                    salerAccount: '',
                    buyerAddressPhone: '',
                    buyerAccount: '',
                    password: '',
                    remark: trim(item[keyIndex.remarkIndex]),
                    machineNo: '',
                    drawer: item[keyIndex.drawerIndex] || '',
                    payee: '',
                    reviewer: '',
                    invoiceSource: item[keyIndex.invoiceSourceIndex], // 发票来源
                    invoiceRiskLevel: item[keyIndex.invoiceRiskLevelIndex], // 发票风险等级
                    items: []
                };
            }
        } else if (name.indexOf('信息汇总表') !== -1) {
            detailInfo = detailInfo.concat(curData.data);
        }
    }
    const detailTitles = detailInfo[0];
    const detailKeyIndex = getDetailSheetItemIndex(detailTitles);
    for (let i = 1; i < detailInfo.length; i++) {
        const curDetail = detailInfo[i];
        const dInvoiceCode = trim(curDetail[detailKeyIndex.invoiceCodeIndex]);
        const dInvoiceNo = trim(curDetail[detailKeyIndex.invoiceNoIndex]);
        const dQdInvoiceNo = trim(curDetail[detailKeyIndex.qdInvocieNoIndex]) === '--' ? '' : trim(curDetail[detailKeyIndex.qdInvocieNoIndex]);
        const goodsName = curDetail[detailKeyIndex.goodsNameIndex] || '';
        // 出现空行，直接退出
        if (!dInvoiceCode && !dInvoiceNo && !dQdInvoiceNo) {
            break;
        }

        let invoiceKey = dInvoiceCode + '-' + dInvoiceNo + '-' + dQdInvoiceNo;
        let item = invoiceDict[invoiceKey];
        // 表头不存在
        if (!item) {
            invoiceKey = dQdInvoiceNo; // 数电纸质票
            item = invoiceDict[invoiceKey];
            if (!item) {
                continue;
            }
        }

        const invoiceType = item.invoiceType;
        if (goodsName.indexOf('详见销货清单') === -1) {
            const taxRateTemp = curDetail[detailKeyIndex.taxRateTempIndex] + '';
            let taxRate = '';
            let zeroTaxRateFlag = '';
            if (taxRateTemp.indexOf('%') !== -1) {
                taxRate = (parseFloat(taxRateTemp.replace('%', '')) / 100).toFixed(2);
            } else if (taxRateTemp.indexOf('免税') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '1';
            } else if (taxRateTemp.indexOf('不征税') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '2';
            } else if (taxRateTemp.indexOf('普通零税率') !== -1) {
                taxRate = '0';
                zeroTaxRateFlag = '3';
            } else if (taxRateTemp.indexOf('***') !== -1) { // 税率计算方式：税率 = 税额 / (不含税金额 - 备注中差额征税值) -- '差额征税：2640.00。'
                const { totalTaxAmount, invoiceAmount, remark } = item;
                let difference = 0;
                if (remark && remark.indexOf('差额征税') !== -1) {
                    const texts = remark.split('：');
                    if (texts.length > 1) {
                        difference = parseFloat(texts[1].split('。')[0]);
                    }
                }
                const differenceRes = invoiceAmount - difference;
                if (differenceRes === 0) {
                    taxRate = '0.00';
                } else {
                    taxRate = (totalTaxAmount / (invoiceAmount - difference)).toFixed(2);
                }
            } else {
                taxRate = fixeNumber(curDetail[detailKeyIndex.taxRateTempIndex]);
                if (!curDetail[detailKeyIndex.taxRateTempIndex] || taxRate === 'undefined') {
                    taxRate = '';
                }
            }

            if (invoiceType === 15) {
                invoiceDict[invoiceKey].items.push({
                    goodsCode: curDetail[detailKeyIndex.goodsCodeIndex],
                    goodsName: curDetail[detailKeyIndex.goodsNameIndex],
                    vehPlate: curDetail[detailKeyIndex.specModelIndex],
                    specModel: curDetail[detailKeyIndex.unitIndex],
                    startDate: curDetail[detailKeyIndex.numIndex],
                    endDate: curDetail[detailKeyIndex.unitPriceIndex],
                    detailAmount: fixeNumber(curDetail[detailKeyIndex.detailAmountIndex]),
                    taxRate: taxRate, // fixeNumber(curDetail[11]),
                    taxAmount: fixeNumber(curDetail[detailKeyIndex.taxAmountIndex]),
                    zeroTaxRateFlag
                });
            } else {
                invoiceDict[invoiceKey].items.push({
                    goodsCode: curDetail[detailKeyIndex.goodsCodeIndex],
                    goodsName: curDetail[detailKeyIndex.goodsNameIndex],
                    specModel: curDetail[detailKeyIndex.specModelIndex],
                    unit: curDetail[detailKeyIndex.unitIndex],
                    num: curDetail[detailKeyIndex.numIndex],
                    unitPrice: curDetail[detailKeyIndex.unitPriceIndex],
                    detailAmount: fixeNumber(curDetail[detailKeyIndex.detailAmountIndex]),
                    taxRate: taxRate, // fixeNumber(curDetail[11]),
                    taxAmount: fixeNumber(curDetail[detailKeyIndex.taxAmountIndex]),
                    specificBusType: fixeNumber(curDetail[detailKeyIndex.specificBusTypeIndex]),
                    zeroTaxRateFlag
                });
            }
        }
    }
    const invoiceData = invoiceKeyList.map((k) => {
        return invoiceDict[k];
    });
    return {
        errcode: '0000',
        data: invoiceData,
        tongjiInfo: {
            totalAmount: tongjiTotalAmount.toFixed(2),
            totalTaxAmount: tongjiTotalTaxAmount.toFixed(2),
            invoiceAmount: tongjiInvoiceAmount.toFixed(2),
            invoiceNum: invoiceData.length,
            juanpiaoNum,
            tollBillNum: tongxingfeiNum // 通行费发票数量
        }
    };
}

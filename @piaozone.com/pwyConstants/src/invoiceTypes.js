const INPUT_INVOICE_TYPES = [
    { text: '电子普通发票', value: 1, allowDeduction: 1, isAddedTax: true },
    { text: '电子专用发票', value: 2, allowDeduction: 1, isAddedTax: true, allowGovdk: 1 },
    { text: '增值税普通发票', value: 3, isAddedTax: true },
    { text: '增值税专用发票', value: 4, allowDeduction: 1, isAddedTax: true, allowGovdk: 1 },
    { text: '普通纸质卷票', value: 5, isAddedTax: true },
    { text: '通用机打发票', value: 7 },
    { text: '出租车票', value: 8 },
    { text: '火车/高铁票', value: 9, allowDeduction: 1 },
    { text: '飞机行程单', value: 10, allowDeduction: 1 },
    { text: '其它票', value: 11, allowDeduction: 1 },
    { text: '机动车销售发票', value: 12, allowDeduction: 1, isAddedTax: true, allowGovdk: 1 },
    { text: '二手车销售发票', value: 13, isAddedTax: true },
    { text: '定额发票', value: 14 },
    { text: '通行费电子发票', value: 15, allowDeduction: 1, isAddedTax: true, allowGovdk: 1 }, // 允许抵扣，增值税发票
    { text: '公路汽车票', value: 16, allowDeduction: 1 },
    { text: '过路桥费发票', value: 17 },
    { text: '完税证明', value: 19 },
    { text: '轮船票', value: 20, allowDeduction: 1 }, // 允许抵扣
    { text: '通用机打电子发票', value: 23 },
	{ text: '海关缴款书', value: 21,  allowDeduction: 1, allowGovdk: 1 },
    { text: '火车票退票凭证', value: 24 },
    { text: '财政电子票据', value: 25 },
    { text: '数电票（普通发票）', value: 26, allowDeduction: 1, isAddedTax: true },
    { text: '数电票（增值税专用发票）', value: 27, allowDeduction: 1, isAddedTax: true, allowGovdk: 1 },
    { text: '数电票（航空运输电子客票行程单）', value: 28, allowDeduction: 1, disbaleEdit: true, isAddedTax: true }, // disbaleEdit 不允许编辑
    { text: '数电票（铁路电子客票）', value: 29, allowDeduction: 1, disbaleEdit: true, isAddedTax: true },
    { text: '数电发票（机动车销售统一发票）', value: 83, allowDeduction: 1, disbaleEdit: true, isAddedTax: true },
    { text: '数电发票（二手车销售统一发票）', value: 84, allowDeduction: 1, disbaleEdit: true, isAddedTax: true },
];

const inputFullInvoiceDict = {};
const addedInvoiceTypes = [];
const allowDkInvoiceTypes = [];
const otherInvoiceTypes = [];
for (let i = 0; i < INPUT_INVOICE_TYPES.length; i++) {
    const curData = INPUT_INVOICE_TYPES[i];
    inputFullInvoiceDict['k' + curData.value] = curData;
    if (curData.isAddedTax) {
        addedInvoiceTypes.push(curData.value);
    } else {
        otherInvoiceTypes.push(curData.value);
    }

    if (curData.allowDeduction === 1) {
        allowDkInvoiceTypes.push(curData.value);
    }
}

module.exports = {
    INPUT_INVOICE_TYPES,
    INPUT_INVOICE_TYPES_DICT: inputFullInvoiceDict, // INPUT_INVOICE__TYPES_DICT
    ADDED_INVOICE_TYPES: addedInvoiceTypes,
    OTHER_INVOICE_TYPES: otherInvoiceTypes,
    ALLOW_DK_TYPES: allowDkInvoiceTypes
}
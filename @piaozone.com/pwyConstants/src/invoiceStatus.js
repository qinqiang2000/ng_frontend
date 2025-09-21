const invoiceStatus = [
    {
        text: '正常',
        value: 0
    },
    {
        text: '失控',
        value: 1
    },
    {
        text: '作废',
        value: 2
    },
    {
        text: '红冲',
        value: 3
    },
    {
        text: '异常',
        value: 4
    },
    {
        text: '非正常',
        value: 5
    },
    {
        text: '待确认',
        value: 6
    },
    {
        text: '部分冲红',
        value: 7
    },
    {
        text: '全额冲红',
        value: 8
    }
];
const invoiceStatuDict = {};
for (let i = 0; i < invoiceStatus.length; i++) {
    invoiceStatuDict['k' + invoiceStatus[i].value] = invoiceStatus[i].text;
}

module.exports = {
    INVOICE_STATUS: invoiceStatus,
    INVOICE_STATUS_DICT: invoiceStatuDict
}
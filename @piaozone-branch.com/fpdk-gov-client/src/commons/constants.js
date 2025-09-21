import { invoiceTypes } from '@piaozone.com/pwyConstants';

export const INPUT_INVOICE_TYPES = invoiceTypes.INPUT_INVOICE_TYPES;

export const invoice_expense_status = [
    { text: '未用', value: 1 },
    { text: '在用', value: 30 },
    { text: '已用', value: 60 },
    { text: '已入账', value: 65 }
];

export const invoiceStatus = [
    {
        text: '正常',
        value: 0
    }, {
        text: '失控',
        value: 1
    }, {
        text: '作废',
        value: 2
    }, {
        text: '红冲',
        value: 3
    }, {
        text: '异常',
        value: 4
    }, {
        text: '红字发票待确认',
        value: 6
    }, {
        text: '部分红冲',
        value: 7
    }, {
        text: '全额红冲',
        value: 8
    }
];

export const inputFullInvoiceDict = {};
for (let i = 0; i < INPUT_INVOICE_TYPES.length; i++) {
    inputFullInvoiceDict['k' + INPUT_INVOICE_TYPES[i].value] = INPUT_INVOICE_TYPES[i].text;
}


export const inputResource = {
    k1: {
        value: 1,
        text: '手机拍照'
    },
    k2: {
        value: 2,
        text: 'PC上传'
    },
    k3: {
        value: 3,
        text: '员工扫描图像'
    },
    k4: {
        value: 4,
        text: '财务部扫描图像'
    },
    k5: {
        value: 5,
        text: '查验'
    },
    k6: {
        value: 6,
        text: '发票管理客户端'
    },
    k7: {
        value: 7,
        text: '微信卡包'
    },
    k8: {
        value: 8,
        text: '对账单开票'
    }
};
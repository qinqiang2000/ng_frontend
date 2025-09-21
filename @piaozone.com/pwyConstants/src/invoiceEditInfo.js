const { trainSeatSelectSource, airSeatSelectSource, currencySelectSource } = require('./selectSource');

// 禁止选择的日期
const disabledDate = (d) => {
    return moment(d.format('YYYY-MM-DD')).format('X') > moment().format('X');
};

// 字符串长度最长控制
const maxStringLength = 50;
const bigStringLength = 200;

// 增值税发票,通过校验码查验
const invoiceAdded1 = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true },
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '开票日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '校验码后六位', dataIndex: 'checkCode', type: 'string', maxLength: 6, required: true } // 注意区块链发票类型是1，校验码为5位
];

// 增值税发票,通过不含税金额查验
const invoiceAdded2 = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true },
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '开票日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '不含税金额', dataIndex: 'invoiceAmount', type: 'number', required: true }
];

// 飞机票
const airBill = [
    { title: '电子客票号', dataIndex: 'electronicTicketNum', type: 'string', maxLength: maxStringLength, required: true },
    { title: '身份证号码', dataIndex: 'customerIdentityNum', type: 'string', maxLength: 18, required: true },
    { 
        title: '行程', 
        subCols: [
            { title: '开始行程', dataIndex: 'placeOfDeparture', type: 'string', maxLength: maxStringLength, required: true },
            { title: '结束行程', dataIndex: 'destination', type: 'string', maxLength: maxStringLength, required: true }
        ]
    },
    { title: '票价', dataIndex: 'invoiceAmount', type: 'number', required: true },
    { title: '顾客姓名', dataIndex: 'customerName', type: 'string', maxLength: maxStringLength, required: true },    
    { title: '乘机日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '航班号', dataIndex: 'flightNum', type: 'string', maxLength: maxStringLength },
    { title: '机场建设费', dataIndex: 'airportConstructionFee', type: 'number' },
    { title: '燃油附加费', dataIndex: 'fuelSurcharge', type: 'number' },
    { title: '印刷序列号', dataIndex: 'printNum', type: 'string', maxLength: maxStringLength },
    { title: '座位等级', dataIndex: 'seatGrade', type: 'select', selectSource: airSeatSelectSource}
];

// 通用机打
const generalMachineBill = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true },
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '开票日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '合计金额', dataIndex: 'totalAmount', type: 'number', required: true },
    { title: '销方名称', dataIndex: 'salerName', type: 'string', maxLength: bigStringLength },
    { title: '销方税号', dataIndex: 'salerTaxNo', type: 'string', maxLength: maxStringLength },
    { title: '购方名称', dataIndex: 'buyerName', type: 'string', maxLength: bigStringLength }
];

// 其它发票
const otherBill = [
    { title: '金额', dataIndex: 'totalAmount', type: 'number', required: true },
    { title: '备注', dataIndex: 'salerName', type: 'string', maxLength: bigStringLength, required: true },
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12},
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10 },
    { title: '开票日期', dataIndex: 'invoiceDate', type: 'date', disabledDate }    
];

// 购置税发票
const purchaseTaxBill = [
    { title: '纳税人识别号', dataIndex: 'buyerTaxNo', type: 'string', maxLength: maxStringLength, required: true },
    { title: '完税证明号码', dataIndex: 'taxPaidProofNo', type: 'string', maxLength: maxStringLength, required: true },
    { title: '填发日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '税务机关名称', dataIndex: 'taxAuthorityName', type: 'string', maxLength: bigStringLength, required: true },
    { title: '金额', dataIndex: 'totalAmount', type: 'number', required: true }
];

// 定额发票
const quotaBill = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true },
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },    
    { title: '金额', dataIndex: 'totalAmount', type: 'number', required: true },
    { title: '所在地', dataIndex: 'place', type: 'string', maxLength: maxStringLength, required: true }
];

// 过路过桥
const roadBridgeBill = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12},
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '开票日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '金额', dataIndex: 'totalAmount', type: 'number', required: true },
    { title: '入口', dataIndex: 'entrance', type: 'string', maxLength: maxStringLength },
    { title: '出口', dataIndex: 'exit', type: 'string', maxLength: maxStringLength, required: true },
    { title: '时间', dataIndex: 'time', type: 'time' },
    { title: '所在地', dataIndex: 'place', type: 'string', maxLength: maxStringLength }
];

// 轮船票
const shipBill = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true},
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '乘船人', dataIndex: 'passengerName', type: 'string', maxLength: maxStringLength, required: true },
    { title: '乘船日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },    
    { title: '出发地', dataIndex: 'stationGetOn', type: 'string', maxLength: maxStringLength },
    { title: '到达地', dataIndex: 'stationGetOff', type: 'string', maxLength: maxStringLength, required: true },
    { title: '金额', dataIndex: 'totalAmount', type: 'number', required: true },    
    { title: '币别', dataIndex: 'currency', type: 'select', selectSource: currencySelectSource }
];


// 的士票
const taxBill = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true},
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '乘车日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '金额（含税）', dataIndex: 'totalAmount', type: 'number', required: true },
    { title: '所在地', dataIndex: 'place', type: 'string', maxLength: maxStringLength, required: true },
    { title: '打车里程', dataIndex: 'mileage', type: 'number' },    
    { title: '上车时间', dataIndex: 'timeGetOn', type: 'time' },
    { title: '下车时间', dataIndex: 'timeGetOff', type: 'time' }
];

// 客运票
const trafficBill = [
    { title: '发票代码', dataIndex: 'invoiceCode', type: 'string', maxLength: 12, required: true},
    { title: '发票号码', dataIndex: 'invoiceNo', type: 'string', maxLength: 10, required: true },
    { title: '日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },
    { title: '票价', dataIndex: 'totalAmount', type: 'number', required: true },
    { title: '出发站', dataIndex: 'stationGetOn', type: 'string', maxLength: maxStringLength, required: true },
    { title: '到达站', dataIndex: 'stationGetOff', type: 'string', maxLength: maxStringLength, required: true },
    { title: '姓名', dataIndex: 'passengerName', type: 'string', maxLength: maxStringLength, required: true },
    { title: '时间', dataIndex: 'timeGetOn', type: 'time' },
    { title: '币别', dataIndex: 'currency', type: 'select', selectSource: currencySelectSource }
];


// 高铁票
const trainBill = [
    { title: '姓名', dataIndex: 'passengerName', type: 'string', maxLength: maxStringLength, required: true},
    { title: '车次', dataIndex: 'trainNum', type: 'string', maxLength: maxStringLength, required: true },    
    { title: '印刷序号', dataIndex: 'printingSequenceNo', type: 'string', maxLength: maxStringLength, required: true },
    { title: '乘车日期', dataIndex: 'invoiceDate', type: 'date', disabledDate, required: true },    
    { title: '金额（含税）', dataIndex: 'totalAmount', type: 'number', required: true },
    { 
        title: '行程', 
        subCols: [
            { title: '开始行程', dataIndex: 'stationGetOn', type: 'string', maxLength: maxStringLength, required: true },
            { title: '结束行程', dataIndex: 'stationGetOff', type: 'string', maxLength: maxStringLength, required: true }
        ]
    },    
    { title: '座位等级', dataIndex: 'currency', type: 'select', selectSource: trainSeatSelectSource }
];

module.exports = {
    k1: invoiceAdded1,
    k3: invoiceAdded1,
    k4: invoiceAdded2,
    k5: invoiceAdded1,
    k12: invoiceAdded2,
    k13: invoiceAdded2,
    k15: invoiceAdded1,
    k7: generalMachineBill,
    k8: taxBill,
    k9: trainBill,
    k10: airBill,
    k14: quotaBill,
    k16: trafficBill,
    k17: roadBridgeBill,
    k19: purchaseTaxBill,
    k20: shipBill,
    k23: generalMachineBill,
    k11: otherBill
}
import React from 'react';
import InvoiceInfoIcon from './invoiceInfoIcon';

// 每个项目自己的常量，全局可以用公共的
const render = function(v) {
    return v ? (
        <div style={{ maxWidth: 150 }}>{v}</div>
    ) : '--';
};

const renderError = function(v) {
    return v ? (
        <div style={{ maxWidth: 190 }}>{v}</div>
    ) : '--';
};

const renderAmount = function(v) {
    return v ? (
        <div style={{ maxWidth: 120, color: '#ff9524' }}>{v}</div>
    ) : '--';
};

const renderDate = function(v) {
    return v ? (
        <div style={{ maxWidth: 120 }}>
            {v.substr(0, 4) + '-' + v.substr(4, 2) + '-' + v.substr(6, 2)}
        </div>
    ) : '--';
};

const renderInvoiceInfo = (v, r, index) => {
    var invoiceType = r.invoiceType || r.fplx;
    return (
        <div style={{ maxWidth: 160 }}>
            <InvoiceInfoIcon
                suspectedErrorData={r.suspectedErrorData}
                buyerName={r.buyerName}
                buyerTaxNo={r.buyerTaxNo}
                size='small'
                isRevise={r.isRevise}
                bx={r.bx}
                checkStatus={r.cyjg || r.fcyjg || r.checkStatus}
                invoiceStatus={r.invoiceStatus}
                fplx={invoiceType}
                notEqualsTaxNo={r.notEqualsTaxNo}
                notEqualsName={r.notEqualsName}
                info={r}
                index={index}
            />
        </div>
    );
};

const renderInvoiceInfo2 = (v, r, index) => {
    var invoiceType = r.invoiceType || r.fplx;

    return (
        <div style={{ maxWidth: 160 }}>
            <InvoiceInfoIcon
                info={r}
                size='small'
                bx={r.bx}
                fplx={invoiceType}
                isRevise={r.isRevise}
                index={index}
            />
        </div>
    );
};

const currencyRender = (v) => {
    const dict = {
        CNY: '人民币',
        HKD: '港币',
        USD: '美元'
    };
    return dict[v] || '人民币';
};


//增值税发票
const columns1 = [
    { title: '销方名称', dataIndex: 'salerName', key: 'salerName', align: 'left', width: '180px', render },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left', render },
    { title: '价税合计', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount },
    { title: '税额', dataIndex: 'totalTaxAmount', key: 'totalTaxAmount', align: 'left', render: renderAmount },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left', render: renderDate },
    { title: '发票信息', key: 'checkStatus', align: 'left', render: renderInvoiceInfo }
];

const columnsError = [
    { title: '文件名称', dataIndex: 'filename', key: 'salerName', align: 'left', render },
    { title: '错误信息', dataIndex: 'description', key: 'description', align: 'left', render: renderError }
];

//高铁
const columns4 = [
    { title: '车次', dataIndex: 'trainNum', key: 'trainNum', align: 'left' },
    { title: '出发点', dataIndex: 'stationGetOn', key: 'stationGetOn', align: 'left' },
    { title: '目的地', dataIndex: 'stationGetOff', key: 'stationGetOff', align: 'left' },
    { title: '日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount },
    { title: '姓名', dataIndex: 'passengerName', key: 'passengerName', align: 'left' },
    // { title: '座位类型', dataIndex: 'seat', key: 'seat', align: 'left' },
    { title: '税额', dataIndex: 'totalTaxAmount', key: 'totalTaxAmount', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];

//的士票
const columns5 = [
    { title: '发票所在地', dataIndex: 'place', key: 'place', align: 'left' },
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '乘车日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '上车时间', dataIndex: 'timeGetOn', key: 'timeGetOn', align: 'left' },
    { title: '下车时间', dataIndex: 'timeGetOff', key: 'timeGetOff', align: 'left' },
    // { title: '打车里程', dataIndex: 'mileage', key: 'mileage', align: 'left' },
    { title: '金额(含税)', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];


//飞机行程单
const columns7 = [
    { title: '姓名', dataIndex: 'customerName', key: 'customerName', align: 'left' },
    { title: '身份证号', dataIndex: 'customerIdentityNum', key: 'customerIdentityNum', align: 'left' },
    {
        title: '行程',
        key: 'xingcheng',
        align: 'left',
        render: (v, r) => {
            return (
                <div style={{ fontSize: 12 }}>
                    {
                        r.items && r.items.length > 0 ? (
                            r.items.map((item) => {
                                return (
                                    <p className='truncateText' style={{ width: '17em' }} key={item.destination}>
                                        {item.invoiceDate}&nbsp;{item.placeOfDeparture}&nbsp;&nbsp;{item.destination}
                                    </p>
                                );
                            })
                        ) : '--'
                    }
                </div>
            );
        }
    },
    // { title: '出发点', dataIndex: 'placeOfDeparture', key: 'placeOfDeparture', align: 'left' },
    // { title: '目的地', dataIndex: 'destination', key: 'destination', align: 'left' },
    // { title: '乘机时间', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '票价', dataIndex: 'invoiceAmount', key: 'invoiceAmount', align: 'left', render: renderAmount },
    // { title: '机场建设费', dataIndex: 'airportConstructionFee', key: 'airportConstructionFee', align: 'left' },
    { title: '燃油附加费', dataIndex: 'fuelSurcharge', key: 'fuelSurcharge', align: 'left' },
    { title: '税额', dataIndex: 'totalTaxAmount', key: 'totalTaxAmount', align: 'left', render: renderAmount },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
    // { title: '电子票号', dataIndex: 'electronicTicketNum', key: 'electronicTicketNum', align: 'left' }
];

//公路汽车票
const columns8 = [
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left', render },
    { title: '币别', dataIndex: 'currency', key: 'currency', align: 'left', render: currencyRender },
    { title: '票价', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount },
    { title: '税额', dataIndex: 'totalTaxAmount', key: 'totalTaxAmount', align: 'left', render },
    { title: '时间', dataIndex: 'time', key: 'time', align: 'left' },
    { title: '出发站', dataIndex: 'stationGetOn', key: 'stationGetOn', align: 'left' },
    { title: '到达站', dataIndex: 'stationGetOff', key: 'stationGetOff', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];

//轮船票
const columns9 = [
    { title: '乘船人', dataIndex: 'passengerName', key: 'passengerName', align: 'left' },
    { title: '乘船日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '币别', dataIndex: 'currency', key: 'currency', align: 'left', render: currencyRender },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount },
    { title: '出发点', dataIndex: 'stationGetOn', key: 'stationGetOn', align: 'left' },
    { title: '到达地', dataIndex: 'stationGetOff', key: 'stationGetOff', align: 'left' },
    { title: '税额', dataIndex: 'totalTaxAmount', key: 'totalTaxAmount', align: 'left', render: renderAmount },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];

//定额发票
const columns10 = [
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '发票所在地', dataIndex: 'place', key: 'place', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];

//其它票，
const columns11 = [
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderAmount }
];

//机动车
const columns12 = [
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '金额（不含税）', dataIndex: 'invoiceMoney', key: 'invoiceMoney', align: 'left' },
    { title: '税率', dataIndex: 'taxRate', key: 'taxRate', align: 'left', render },
    { title: '税额', dataIndex: 'totalTaxAmount', key: 'totalTaxAmount', align: 'left', render },
    { title: '价税合计', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    {
        title: '购买方名称及证件号',
        key: 'zjh',
        align: 'left',
        render: (v, r) => {
            return (
                <div style={{ maxWidth: 200, wordBreak: 'break-all' }}>
                    {
                        r.buyerTaxNo ? (
                            <p style={{ marginBottom: 0 }}>{r.buyerName}</p>
                        ) : null
                    }
                    {
                        r.buyerTaxNo ? (
                            <p style={{ marginBottom: 0 }}>{r.buyerTaxNo}</p>
                        ) : null
                    }

                </div>
            );
        }
    },
    // { title: '销方名称', dataIndex: 'salerName', key: 'salerName', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo }

];

//完税证明
const columns13 = [
    { title: '纳税人识别号', dataIndex: 'buyerTaxNo', key: 'taxNo', align: 'left', width: 240 },
    { title: '完税证明号码', dataIndex: 'taxPaidProofNo', key: 'taxPaidProofNo', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '填发日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];

//通用机打发票
const columns14 = [
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },

    { title: '购方名称', dataIndex: 'buyerName', key: 'buyerName', align: 'left' },
    { title: '销方名称', dataIndex: 'salerName', key: 'salerName', align: 'left' },
    { title: '销方税号', dataIndex: 'salerTaxNo', key: 'salerTaxNo', align: 'left' },

    { title: '合计金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];


//过路过桥费
const columns15 = [
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '入口', dataIndex: 'entrance', key: 'entrance', align: 'left' },
    { title: '出口', dataIndex: 'exit', key: 'exit', align: 'left' },
    { title: '时间', dataIndex: 'time', key: 'time', align: 'left' },
    { title: '发票所在地', dataIndex: 'place', key: 'place', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo2 }
];

//二手车
const columns16 = [
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '车价合计', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '购买方名称', dataIndex: 'buyerName', key: 'buyerName', align: 'left' },
    { title: '购买方证件号码', dataIndex: 'buyerIdNo', key: 'buyerIdNo', align: 'left' },
    { title: '销售方名称', dataIndex: 'salerName', key: 'salerName', align: 'left' },
    { title: '销售方证件号', dataIndex: 'salerIdNo', key: 'sallerName', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo }
];

// 海关缴款书
const columns21 = [
    { title: '缴款书号码', dataIndex: 'customDeclarationNo', key: 'customDeclarationNo', align: 'left' },
    { title: '填发日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '合计金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '缴款单位名称', dataIndex: 'deptName', key: 'deptName', align: 'left' },
    { title: '进口代理公司', dataIndex: 'secondDeptName', key: 'secondDeptName', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo }
];

// 火车票退票凭证
const columns24 = [
    { title: '收据号码', dataIndex: 'number', key: 'number', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo }
];

// 财政电子票据
const columns25 = [
    { title: '票据代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '票据号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '开票单位代码', dataIndex: 'invoicingPartyCode', key: 'invoicingPartyCode', align: 'left' },
    { title: '开票单位名称', dataIndex: 'invoicingPartyName', key: 'invoicingPartyName', align: 'left' },
    { title: '交款人代码', dataIndex: 'payerPartyCode', key: 'payerPartyCode', align: 'left' },
    { title: '交款人名称', dataIndex: 'payerPartyName', key: 'payerPartyName', align: 'left' },
    { title: '发票信息', dataIndex: 'bx', key: 'bx', align: 'left', render: renderInvoiceInfo }
];

//增值税发票编辑后查验
const operateCol =
{
    title: '操作 ',
    align: 'left',
    render: (v, r, i) => {
        return (
            <div className='operate'>
                {
                    r.checkStatus !== 2 && [1, 2, 3, 4, 5].indexOf(r.fplx) === -1 ? (
                        <>
                            <a href='javascript:;' onClick={() => { this.onShowEditDialog(r, i); }}>编辑</a>
                            <span className='cute' style={{ margin: '0 3px', color: '#eee' }}>|</span>
                        </>
                    ) : null
                }
                <span className='cute' style={{ margin: '0 3px', color: '#eee' }}>|</span>
                <a href='javascript:;'>删除</a>
            </div>
        );
    }
};


export const columsDict = {
    operateCol,
    addedTax: columns1, //
    error: columnsError,
    k1: columns1, //
    k3: columns1, //
    k4: columns1,
    k5: columns1,
    k15: columns1, //增值税发票
    k9: columns4, //火车高铁票
    k8: columns5, //的士票
    k10: columns7, //飞机票
    k16: columns8, //客运票
    k20: columns9, //轮船票
    k14: columns10, //定额发票
    k12: columns12, //机动车发票
    k19: columns13, //完税证明
    k7: columns14, // 通用机打发票
    k17: columns15, //过路过桥费
    k13: columns16, //二手车
    k11: columns11,
    k23: columns14,
    k21: columns21,
    k24: columns24,
    k25: columns25
};

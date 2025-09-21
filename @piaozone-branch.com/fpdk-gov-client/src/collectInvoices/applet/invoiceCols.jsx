import React from 'react';
import { Tooltip } from 'antd';
// import { getWaringCodesResult, invoiceTypes } from '@piaozone.com/pwyConstants';
import { getWaringCodesResult } from '@piaozone.com/pwyConstants';
import '../../commons/css/tip.less';
// import { TipTitle, invoiceConfig } from '../tipInfont';
const tipIcon = require('../../commons/img/tips.png');
// const errorIcon = require('../../commons/img/errorIcon.png');
const unbxIcon = require('../../commons/img/unbx.png');
const bxingIcon = require('../../commons/img/bxing.png');
const bxedIcon = require('../../commons/img/bxed.png');
let loginInfo = {};

const businessTypeTxts = { //火车票业务类型
    k1: '售',
    k2: '退'
};

const renderNumber = (v) => {
    if (typeof v !== 'undefined' && v !== '' && v !== null) {
        return parseFloat(v).toFixed(2);
    } else {
        return '--';
    }
};

const renderText = (v = '--') => {
    if (!v) {
        return '--';
    } else {
        return v;
    }
};

const bxlxDict = {
    k0: ['未用', '未用'],
    k1: ['未用', '未用'],
    k20: ['未用', '未用'],
    k25: ['在用', '在用'],
    k30: ['在用', '在用'],
    k60: ['已用', '已用']
};

const renderExpendStatus = (expendStatus) => {
    let bxlxDictInfo = [];
    if (typeof expendStatus !== 'undefined' && parseInt(expendStatus) !== 0) {
        bxlxDictInfo = bxlxDict['k' + expendStatus] || [];
    }

    return (
        bxlxDictInfo.length > 1 ? (
            <Tooltip placement='bottom' title={bxlxDictInfo[0]}>
                <span className='bxStatus' style={{ marginLeft: 0, marginRight: 10 }}>
                    {
                        bxlxDictInfo[1] === '未用' ? (
                            <img src={unbxIcon} alt='' height={18} />
                        ) : null
                    }
                    {
                        bxlxDictInfo[1] === '在用' ? (
                            <img src={bxingIcon} alt='' height={18} />
                        ) : null
                    }
                    {
                        bxlxDictInfo[1] === '已用' ? (
                            <img src={bxedIcon} alt='' height={18} />
                        ) : null
                    }
                </span>
            </Tooltip>
        ) : null
    );
};

const invoiceStatusDict = {
    k0: ['正常', '正常'],
    k1: ['已失控', '失控'],
    k2: ['已作废', '已废'],
    k3: ['已红冲', '红冲'],
    k4: ['异常发票', '异常'],
    k6: ['红字发票待确认', '红票待确认'],
    k7: ['部分红冲', '部分红冲'],
    k8: ['全额红冲', '全额红冲']
};


const renderInvoiceStatus = (invoiceStatus) => {
    let invoiceStatusInfo = [];
    if (typeof invoiceStatus !== 'undefined' && parseInt(invoiceStatus) !== 0) {
        invoiceStatusInfo = invoiceStatusDict['k' + invoiceStatus] || [];
    }

    return (
        invoiceStatusInfo.length > 1 ? (
            <Tooltip placement='bottom' title={invoiceStatusInfo[0]}>
                <span className='errIcon' style={{ marginLeft: 0 }}>
                    {invoiceStatusInfo[1]}
                </span>
            </Tooltip>
        ) : null
    );
};

const warningDescrips = (v, r) => {
    let result = [];
    if (r.warningCode) {
        result = result.concat(getWaringCodesResult(r.warningCode));
    }
    if (r.notEqualsName && loginInfo.xhf_mc) {
        result.push('发票抬头' + r.buyerName + '与当前企业名称' + loginInfo.xhf_mc + '不一致');
    }

    if (r.notEqualsTaxNo && loginInfo.xhf_nsrsbh) {
        result.push('购方税号' + r.buyerTaxNo + '与当前企业税号' + loginInfo.xhf_nsrsbh + '不一致');
    }
    if (r.recoErrorMsg && r.errcode != '0000') {
        if (r.recoErrorMsg.description) {
            result.push(r.recoErrorMsg.description + ';请点击编辑填充完整后确认修改');
        }
    }
    if (result.length > 0) {
        return (
            <Tooltip title={result.join('\n')}>
                <img src={tipIcon} alt='' height={16} style={{ marginRight: 10 }} />
            </Tooltip>
        );
    } else {
        return null;
    }
};

const renderCheckStatusAndWarning = (v, r) => {
    if (v == 2) {
        return (
            <>
                {warningDescrips(v, r)}
                {renderInvoiceStatus(r.invoiceStatus)}
                {renderExpendStatus(r.expendStatus)}
                <Tooltip title='数据相符'>
                    <img src={require('../../commons/img/dataxf.png')} alt='' height={16} />
                </Tooltip>
            </>
        );
    } else {
        const description = r.checkDescription || r.description || '未查验';
        return (
            <>
                {warningDescrips(v, r)}
                {renderInvoiceStatus(r.invoiceStatus)}
                {renderExpendStatus(r.expendStatus)}
                <Tooltip title={description}>
                    <img src={require('../../commons/img/databf.png')} alt='' height={16} />
                </Tooltip>
            </>
        );
    }
};

const addedInvoiceInfo = {
    title: '发票信息',
    width: 200,
    dataIndex: 'checkStatus',
    key: 'invoiceInfoGroup',
    render: renderCheckStatusAndWarning
};

const noAddedInvoiceInfo = {
    title: '发票信息',
    dataIndex: 'warningCode',
    align: 'center',
    render: (v, r) => {
        return warningDescrips(v, r) || '--';
    },
    width: 110
};


//增值税发票
export const columns1 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '票面税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', width: 150 },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', width: 120, align: 'center' },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left', width: 150 },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', align: 'left', width: 100 }
];
//数电票
export const columns26 = [
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 160 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '票面税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', width: 150 },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', width: 120, align: 'center' },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left', width: 150 },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', align: 'left', width: 100 }
];

const collectDate = [
    { title: '采集日期', dataIndex: 'collectDate', align: 'center', width: 84 }
];

//高铁
export const columns4 = [
    noAddedInvoiceInfo,
    { title: '票号', dataIndex: 'printingSequenceNo', align: 'left', width: 100 },
    { title: '车次', dataIndex: 'trainNum', align: 'left', width: 75 },
    { title: '价税金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '乘车日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    { title: '姓名', dataIndex: 'passengerName', align: 'left', width: 75 },
    { title: '身份证号', dataIndex: 'customerIdentityNum', align: 'left', width: 100 },
    { title: '座位等级', dataIndex: 'seat', align: 'left', width: 75 },
    { title: '业务类型', dataIndex: 'businessType', align: 'left', width: 75, render: (v) => { return businessTypeTxts['k' + v]; } }
];

//的士票
export const columns5 = [
    noAddedInvoiceInfo,
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '金额(含税)', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '乘车日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '上车时间', dataIndex: 'timeGetOn', align: 'center', width: 84 },
    { title: '下车时间', dataIndex: 'timeGetOff', align: 'center', width: 84 },
    { title: '打车里程', dataIndex: 'mileage', align: 'left', width: 84 }
    // { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 }
];


//飞机行程单
export const columns7 = [
    noAddedInvoiceInfo,
    { title: '电子票号', dataIndex: 'electronicTicketNum', align: 'left' },
    { title: '电子票号', dataIndex: 'printNum', align: 'left' },
    { title: '票价', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '乘机时间', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'placeOfDeparture', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'destination', align: 'left', width: 100 },
    { title: '姓名', dataIndex: 'customerName', align: 'left', width: 75 },
    { title: '身份证号', dataIndex: 'customerIdentityNum', align: 'left' },
    { title: '座位等级', dataIndex: 'seatGrade', align: 'left', width: 75 },
    { title: '燃油附加费', dataIndex: 'fuelSurcharge', align: 'left', width: 100, render: renderNumber },
    { title: '机场建设费', dataIndex: 'airportConstructionFee', align: 'left', width: 100, render: renderNumber }
];

// 公路汽车票
export const columns8 = [
    noAddedInvoiceInfo,
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '乘车日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    { title: '姓名', dataIndex: 'passengerName', align: 'left', width: 100 },
    { title: '身份证号', dataIndex: 'cardNumber', align: 'left', width: 100 }
];

// 轮船票
export const columns9 = [
    noAddedInvoiceInfo,
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '乘船日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    { title: '姓名', dataIndex: 'passengerName', align: 'left', width: 100 },
    { title: '身份证号', dataIndex: 'cardNumber', align: 'left', width: 100 }
];

// 定额发票
export const columns10 = [
    noAddedInvoiceInfo,
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 }
];


// 机动车
export const columns12 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '不含税金额', dataIndex: 'invoiceMoney', align: 'left', width: 100, render: renderNumber },
    { title: '票面税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '销方名称', dataIndex: 'salerName', width: 150, align: 'left' },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', width: 120, align: 'center' },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left', width: 150 },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', align: 'left', width: 100 }
];

// 购置税发票
export const columns13 = [
    noAddedInvoiceInfo,
    { title: '纳税人识别号', dataIndex: 'buyerTaxNo', align: 'left' },
    { title: '完税证明号码', dataIndex: 'taxPaidProofNo', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '填发日期', dataIndex: 'invoiceDate', align: 'center', width: 84 }
];

// 通用机打发票,通用机打电子发票
export const columns14 = [
    noAddedInvoiceInfo,
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '销方名称', dataIndex: 'salerName', width: 150, align: 'left' },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', width: 120, align: 'center' },
    { title: '购方名称', dataIndex: 'buyerName', width: 150, align: 'left' },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', width: 150, align: 'left' }

];

// 过路过桥费
export const columns15 = [
    noAddedInvoiceInfo,
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '入口', dataIndex: 'entrance', align: 'left', width: 100 },
    { title: '出口', dataIndex: 'exit', align: 'left', width: 100 },
    { title: '时间', dataIndex: 'time', align: 'center', width: 84 },
    { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 }
];

// 二手车
export const columns16 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '购买方名称', dataIndex: 'buyerName', align: 'left' },
    { title: '购买方证件号码', dataIndex: 'buyerIdNo', align: 'left' },
    { title: '销售方名称', dataIndex: 'salerName', align: 'left' },
    { title: '销售方证件号', dataIndex: 'salerIdNo', align: 'left' }
];


// 海关缴款书
export const columns21 = [
    noAddedInvoiceInfo,
    { title: '缴款书号码', dataIndex: 'customDeclarationNo', key: 'customDeclarationNo', align: 'left' },
    { title: '填发日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left', render: renderText },
    { title: '税款金额合计', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderText },
    { title: '缴款单位一名称', dataIndex: 'deptName', key: 'deptName', align: 'left', render: renderText },
    { title: '缴款单位一税号', dataIndex: 'deptTaxNo', key: 'deptName', align: 'left', render: renderText },
    { title: '缴款单位二名称', dataIndex: 'secondDeptName', key: 'secondDeptName', align: 'left', render: renderText },
    { title: '缴款单位二税号', dataIndex: 'secondDeptTaxNo', key: 'secondDeptName', align: 'left', render: renderText },
    { title: '报关单编号', dataIndex: 'declareNo', align: 'left', width: 100, render: renderText },
    { title: '合同批文号', dataIndex: 'contractNo', align: 'left', width: 100, render: renderText },
    { title: '运输工具', dataIndex: 'transToolNo', align: 'left', width: 100, render: renderText },
    { title: '缴款期限', dataIndex: 'payLimitDate', align: 'left', width: 100, render: renderText }
];

// 火车票退票凭证
export const columns24 = [
    noAddedInvoiceInfo,
    { title: '收据号码', dataIndex: 'number', key: 'number', align: 'center' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' }
];

// 财政电子票据
export const columns25 = [
    noAddedInvoiceInfo,
    { title: '票据代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '票据号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '开票单位代码', dataIndex: 'invoicingPartyCode', key: 'invoicingPartyCode', align: 'left' },
    { title: '开票单位名称', dataIndex: 'invoicingPartyName', key: 'invoicingPartyName', align: 'left' },
    { title: '交款人代码', dataIndex: 'payerPartyCode', key: 'payerPartyCode', align: 'left' },
    { title: '交款人名称', dataIndex: 'payerPartyName', key: 'payerPartyName', align: 'left' }
];

// 其它票
export const columns11 = [
    noAddedInvoiceInfo,
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '备注', dataIndex: 'remark', align: 'left', width: 100, render: renderNumber }
];

//电子铁路票
export const columns29 = [
    noAddedInvoiceInfo,
    { title: '发票号码', dataIndex: 'electronicTicketNum', align: 'left' },
    { title: '开票日期', dataIndex: 'issueDate', align: 'center', width: 84 },
    { title: '业务类型', dataIndex: 'businessType', align: 'left', width: 75, render: (v) => { return businessTypeTxts['k' + v]; } },
    { title: '出发点', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    { title: '车次', dataIndex: 'trainNum', align: 'left', width: 75 },
    { title: '乘车日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '座位等级', dataIndex: 'seat', align: 'left', width: 75 },
    { title: '票价', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '姓名', dataIndex: 'passengerName', align: 'left', width: 75 },
    { title: '证件号码', dataIndex: 'customerIdentityNum', align: 'left', width: 100 },
    { title: '金额（不含税）', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '税率', dataIndex: 'taxRate', align: 'left', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber }

];

//航空电子客票行程单
export const columns28 = [
    noAddedInvoiceInfo,
    { title: '发票号码', dataIndex: 'electronicTicketNum', align: 'left' },
    { title: 'GP单号', dataIndex: 'numberOfGpOrder', align: 'left' },
    { title: '票价', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '乘机日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '合计', dataIndex: 'totalAmount', align: 'center', width: 84 },
    { title: '出发点', dataIndex: 'placeOfDeparture', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'destination', align: 'left', width: 100 },
    { title: '姓名', dataIndex: 'customerName', align: 'left', width: 75 },
    { title: '身份证号', dataIndex: 'customerIdentityNum', align: 'left' },
    { title: '座位类型', dataIndex: 'seatGrade', align: 'left', width: 75 },
    { title: '燃油附加费', dataIndex: 'fuelSurcharge', align: 'left', width: 100, render: renderNumber },
    { title: '机场建设费', dataIndex: 'airportConstructionFee', align: 'left', width: 100, render: renderNumber },
    { title: '税率', dataIndex: 'taxRate', align: 'left', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber }
];

//海外发票 字段有问题的
export const columns30 = [
    noAddedInvoiceInfo,
    { title: '票据号码', dataIndex: 'electronicTicketNum', align: 'left' },
    { title: '币别', dataIndex: 'numberOfGpOrder', align: 'left' },
    { title: '原币金额', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '付款到期日', dataIndex: 'payAmountDate', align: 'center', width: 84 },
    { title: '销方名称', dataIndex: 'salerName', align: 'left' },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left' }
];

export const columsDict = {
    k1: collectDate.concat(addedInvoiceInfo, columns1),
    k2: collectDate.concat(addedInvoiceInfo, columns1),
    k3: collectDate.concat(addedInvoiceInfo, columns1), //
    k4: collectDate.concat(addedInvoiceInfo, columns1),
    k5: collectDate.concat(addedInvoiceInfo, columns1),
    k15: collectDate.concat(addedInvoiceInfo, columns1), // 通行费
    k26: collectDate.concat(addedInvoiceInfo, columns26), //数电普票
    k27: collectDate.concat(addedInvoiceInfo, columns26), //数电专票
    k9: collectDate.concat(columns4), // 火车高铁票
    k8: collectDate.concat(columns5), // 的士票
    k10: collectDate.concat(columns7), // 飞机票
    k16: collectDate.concat(columns8), // 客运票
    k20: collectDate.concat(columns9), // 轮船票
    k14: collectDate.concat(columns10), // 定额发票
    k12: collectDate.concat(addedInvoiceInfo, columns12), // 机动车发票
    k11: collectDate.concat(columns11),
    k19: collectDate.concat(columns13), // 购置税发票
    k7: collectDate.concat(columns14), // 通用机打发票
    k23: collectDate.concat(columns14), // 通用机打电子发票
    k17: collectDate.concat(columns15), // 过路过桥费
    k21: collectDate.concat(addedInvoiceInfo, columns21), //
    k24: collectDate.concat(columns24), //
    k25: collectDate.concat(columns25), //
    k28: collectDate.concat(addedInvoiceInfo, columns28),
    k29: collectDate.concat(addedInvoiceInfo, columns29),
    k13: collectDate.concat(addedInvoiceInfo, columns16) // 二手车
};

export const columsDictFun = function(key, info = {}) {
    loginInfo = info;
    return columsDict[key];
};

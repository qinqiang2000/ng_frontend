import React from 'react';
import { Tooltip, Icon } from 'antd';
import { getWaringCodesResult, invoiceTypes } from '@piaozone.com/pwyConstants';
import { entryVoucherCols } from '../commons/gxInvoiceCols';
import '../commons/css/tip.less';
import { TipTitle, invoiceConfig } from './tipInfont';
const tipIcon = require('../commons/img/tips.png');
const errorIcon = require('../commons/img/errorIcon.png');
let loginInfo = {};

const deductionRender = (v) => {
    if (v === '1') {
        return '已抵扣';
    } else if (v === '2') {
        return '不抵扣';
    } else if (v === '0') {
        return '未抵扣';
    } else {
        return '--';
    }
};

const editFileName = (v) => {
    const title = v;
    if (v && v.length > 23) {
        v = v.substr(0, 23) + '...';
    }
    return (
        v ? (
            <Tooltip placement='top' title={title}>
                <span style={{ cursor: 'pointer' }}>{v}</span>
            </Tooltip>
        ) : '--'
    );
};

const deductionDateRender = (v, r) => {
    if (r.deductionPurpose === '1') {
        return v;
    } else {
        return '--';
    }
};

const currencyRender = (v) => {
    const dict = {
        CNY: '人民币',
        HKD: '港币',
        USD: '美元'
    };

    return dict[v] || '人民币';
};

const renderIsSign = (v, r) => {
    if ([3, 4, 5].indexOf(parseInt(r.invoiceType)) === -1) {
        return '--';
    } else {
        if (r.signName) {
            return '是';
        } else {
            return '否';
        }
    }
};


const renderRzStatus = (v, r) => {
    const fauthenticateFlag = parseInt(r.fauthenticateFlag);
    if (fauthenticateFlag === 0) {
        return '未认证'; // 未认证
    } else if (fauthenticateFlag === 1) {
        return '已勾选未认证'; // 已勾选
    } else if (fauthenticateFlag === 2) {
        return '勾选认证';
    } else if (fauthenticateFlag === 3) {
        return '扫描认证';
    } else {
        return '--';
    }
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

const invoiceStatusDict = {
    k0: ['正常', '正常'],
    k1: ['已失控', '失控'],
    k2: ['已作废', '已废'],
    k3: ['已红冲', '红冲'],
    k4: ['异常发票', '异常']
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
    if (v === 'loading') {
        return (
            <>
                {warningDescrips(v, r)}
                <Icon type='loading' />
            </>
        );
    } else if (v == 2) {
        return (
            <>
                {warningDescrips(v, r)}
                {renderInvoiceStatus(r.invoiceStatus)}
                <Tooltip title='数据相符'>
                    <img src={require('../commons/img/dataxf.png')} alt='' height={16} />
                </Tooltip>
            </>
        );
    } else {
        const description = r.checkDescription || r.description || '未查验';
        return (
            <>
                {warningDescrips(v, r)}
                {renderInvoiceStatus(r.invoiceStatus)}
                <Tooltip title={description}>
                    <img src={require('../commons/img/databf.png')} alt='' height={16} />
                </Tooltip>
            </>
        );
    }
};

const addedInvoiceInfo = {
    title: '发票信息',
    dataIndex: 'checkStatus',
    key: 'invoiceInfoGroup',
    fixed: 'right',
    render: renderCheckStatusAndWarning,
    width: 110
};

const awaitAddedInvoiceInfo = {
    title: '发票信息',
    dataIndex: 'checkStatus',
    key: 'invoiceInfoGroup',
    fixed: 'right',
    render: (v, r) => {
        if (v === 'loading') {
            return (
                <Icon type='loading' />
            );
        } else if (v == 2) {
            return (
                <Tooltip title='数据相符'>
                    <img src={require('../commons/img/dataxf.png')} alt='' height={16} />
                </Tooltip>
            );
        } else {
            const description = r.checkDescription || r.description || '未查验';
            return (
                <Tooltip title={description}>
                    <img src={require('../commons/img/databf.png')} alt='' height={16} />
                </Tooltip>
            );
        };
    },
    width: 110
};

const noAddedInvoiceInfo = {
    title: '发票信息',
    dataIndex: 'warningCode',
    align: 'center',
    fixed: 'right',
    render: (v, r) => {
        return warningDescrips(v, r) || '--';
    },
    width: 110
};

const auditTime = {
    title: '审核时间',
    dataIndex: 'expendTime',
    align: 'left',
    width: 84,
    render: (v) => {
        return v || '--';
    }
};

//增值税发票
export const columns1 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', width: 100 },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', align: 'left', width: 100 },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left', width: 100 },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', align: 'left', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];
//全电票
export const columns26 = [
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 160 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', width: 100 },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', align: 'left', width: 100 },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left', width: 100 },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', align: 'left', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

const collectDate = [
    { title: '采集日期', dataIndex: 'collectDate', align: 'center', width: 84 }
];

const fileName = [
    { title: '文件名称', dataIndex: 'fileName', align: 'left', render: editFileName, width: 140 }
];

const dkCols = [
    { title: '抵扣状态', dataIndex: 'deductionPurpose', align: 'center', render: deductionRender, width: 80 },
    { title: '抵扣税期', dataIndex: 'taxPeriod', align: 'center', render: deductionDateRender, width: 80 }
];

const rzCols = [
    { title: '认证状态', dataIndex: 'rz', align: 'left', width: 90, render: renderRzStatus },
    { title: '认证时间', dataIndex: 'selectAuthenticateTime', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

const collectInfo = [
    { title: '采集人手机号', dataIndex: 'collectorPhone', align: 'center', width: 100, render: (v) => { return v || '--'; } },
    { title: '采集人名称', dataIndex: 'collectorName', align: 'center', width: 100, render: (v) => { return v || '--'; } }
];

const signCol = [{ title: '是否签收', dataIndex: 'qs', align: 'center', width: 80, render: renderIsSign }];
// const collectCol = [{ title: '采集日期', dataIndex: 'collectDate', align: 'left', render }];

const dkExit = [
    {
        title: '是否可抵扣',
        dataIndex: 'canBeDeduction',
        align: 'left',
        width: 100,
        render: (v) => {
            if (v == 1) {
                return (
                    <span>可</span>
                );
            } else {
                return (
                    <span>不可</span>
                );
            }
        }
    },
    { title: '入账税额', dataIndex: 'entryAmount', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '转出金额', dataIndex: 'outputAmount', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '转出原因', dataIndex: 'outputReason', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

const tipCol = [
    {
        title: '提示',
        dataIndex: 'verifyResult',
        align: 'center',
        width: 40,
        render: (v, r, i) => {
            const { verifyResult, isRepeat, serialNo, invoiceType } = r;
            const addInvoices = invoiceTypes.ADDED_INVOICE_TYPES;
            const isExist = addInvoices.indexOf(parseInt(invoiceType));
            if (isExist == '-1' && serialNo == '') {
                return (
                    <Tooltip title='必填字段缺失，请点击【编辑】检查*号项是否完整'>
                        <img src={errorIcon} alt='' height={16} />
                    </Tooltip>
                );
            } else {
                if (verifyResult && verifyResult.length > 0) {
                    let configLevel = '1';
                    const config = [];
                    for (let i = 0; i < verifyResult.length; i++) {
                        config.push(verifyResult[i].config);
                    }
                    if (isRepeat) {
                        configLevel = '0';
                    } else {
                        if (config.indexOf('0') != '-1') {
                            configLevel = '0';
                        } else if (config.indexOf('2') != '-1' || config.indexOf('3') != '-1') {
                            configLevel = '2';
                        } else {
                            configLevel = '1';
                        }
                    }
                    const { forbidList, errorList, warnList } = invoiceConfig(verifyResult || []);
                    if (configLevel == '0') {
                        return (
                            <Tooltip
                                overlayClassName='fpzsInvoiceIcon'
                                title={<TipTitle forbidList={forbidList} errorList={errorList} warnList={warnList} index={i} />}
                            >
                                <img src={errorIcon} alt='' height={16} />
                            </Tooltip>
                        );
                    } else if (configLevel == '2') {
                        return (
                            <Tooltip
                                overlayClassName='fpzsInvoiceIcon'
                                title={<TipTitle forbidList={forbidList} errorList={errorList} warnList={warnList} index={i} />}
                            >
                                <img src={tipIcon} alt='' height={16} />
                            </Tooltip>
                        );
                    } else {
                        return '--';
                    }
                } else {
                    return '--';
                }
            }
        }
    },
    {
        title: '重复采集',
        width: 70,
        dataIndex: 'isRepeat',
        align: 'center',
        render: (v) => {
            if (v) {
                return (
                    <span style={{ color: 'red' }}>是</span>
                );
            } else {
                return '否';
            }
        }
    }
];

//高铁
export const columns4 = [
    { title: '票号', dataIndex: 'printingSequenceNo', align: 'left', width: 100 },
    { title: '车次', dataIndex: 'trainNum', align: 'left', width: 75 },
    { title: '出发点', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    { title: '日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '姓名', dataIndex: 'passengerName', align: 'left', width: 75 },
    { title: '座位类型', dataIndex: 'seat', align: 'left', width: 75 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

//的士票
export const columns5 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '乘车日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '上车时间', dataIndex: 'timeGetOn', align: 'center', width: 84 },
    { title: '下车时间', dataIndex: 'timeGetOff', align: 'center', width: 84 },
    { title: '打车里程', dataIndex: 'mileage', align: 'left', width: 84 },
    { title: '金额(含税)', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];


//飞机行程单
export const columns7 = [
    { title: '姓名', dataIndex: 'customerName', align: 'left', width: 75 },
    { title: '身份证号', dataIndex: 'customerIdentityNum', align: 'left' },
    { title: '出发点', dataIndex: 'placeOfDeparture', align: 'left', width: 100 },
    { title: '目的地', dataIndex: 'destination', align: 'left', width: 100 },
    { title: '乘机时间', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '票价', dataIndex: 'invoiceAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '机场建设费', dataIndex: 'airportConstructionFee', align: 'left', width: 100, render: renderNumber },
    { title: '燃油附加费', dataIndex: 'fuelSurcharge', align: 'left', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '电子票号', dataIndex: 'electronicTicketNum', align: 'left' },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 公路汽车票
export const columns8 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '币别', dataIndex: 'currency', align: 'left', width: 75, render: currencyRender },
    { title: '票价', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '时间', dataIndex: 'time', align: 'center', width: 84 },
    { title: '出发站', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '到达站', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 轮船票
export const columns9 = [
    { title: '乘船人', dataIndex: 'passengerName', align: 'left', width: 75 },
    { title: '乘船日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '币别', dataIndex: 'currency', align: 'left', width: 75, render: currencyRender },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '出发点', dataIndex: 'stationGetOn', align: 'left', width: 100 },
    { title: '到达地', dataIndex: 'stationGetOff', align: 'left', width: 100 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 定额发票
export const columns10 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];


// 机动车
export const columns12 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '金额（不含税）', dataIndex: 'invoiceMoney', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '税率', dataIndex: 'taxRate', align: 'left', width: 60 },
    { title: '税额', dataIndex: 'totalTaxAmount', align: 'left', width: 100, render: renderNumber },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    {
        title: '购买方名称及证件号',
        key: 'zjh',
        align: 'left',
        render: (v, r) => {
            return (
                <>
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
                </>
            );
        }
    },
    { title: '销方名称', dataIndex: 'salerName', align: 'left' },
    { title: '销方税号', dataIndex: 'salerTaxNo', align: 'left' },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 购置税发票
export const columns13 = [
    { title: '纳税人识别号', dataIndex: 'buyerTaxNo', align: 'left' },
    { title: '完税证明号码', dataIndex: 'taxPaidProofNo', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '填发日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 通用机打发票
export const columns14 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '购方名称', dataIndex: 'buyerName', align: 'left' },
    { title: '销方名称', dataIndex: 'salerName', align: 'left' },
    { title: '销方税号', dataIndex: 'salerTaxNo', align: 'left' },
    { title: '合计金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];


// 过路过桥费
export const columns15 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '入口', dataIndex: 'entrance', align: 'left', width: 100 },
    { title: '出口', dataIndex: 'exit', align: 'left', width: 100 },
    { title: '时间', dataIndex: 'time', align: 'center', width: 84 },
    { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 二手车
export const columns16 = [
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '车价合计', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    { title: '购买方名称', dataIndex: 'buyerName', align: 'left' },
    { title: '购买方证件号码', dataIndex: 'buyerIdNo', align: 'left' },
    { title: '销售方名称', dataIndex: 'salerName', align: 'left' },
    { title: '销售方证件号', dataIndex: 'salerIdNo', align: 'left' },
    auditTime, //审核通过时间
    ...entryVoucherCols
];


// 海关缴款书
export const columns21 = [
    { title: '缴款书号码', dataIndex: 'customDeclarationNo', key: 'customDeclarationNo', align: 'left' },
    { title: '缴款单位名称', dataIndex: 'deptName', key: 'deptName', align: 'left', render: renderText },
    { title: '进口代理公司', dataIndex: 'secondDeptName', key: 'secondDeptName', align: 'left', render: renderText },
    { title: '填发日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left', render: renderText },
    { title: '合计金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left', render: renderText },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'left', width: 100, render: renderText },
    { title: '报关单编号', dataIndex: 'declareNo', align: 'left', width: 100, render: renderText },
    { title: '合同批文号', dataIndex: 'contractNo', align: 'left', width: 100, render: renderText },
    { title: '运输工具号', dataIndex: 'transToolNo', align: 'left', width: 100, render: renderText },
    { title: '缴款期限', dataIndex: 'payLimitDate', align: 'left', width: 100, render: renderText },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 火车票退票凭证
export const columns24 = [
    { title: '收据号码', dataIndex: 'number', key: 'number', align: 'center' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'left' },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 财政电子票据
export const columns25 = [
    { title: '票据代码', dataIndex: 'invoiceCode', key: 'invoiceCode', align: 'left' },
    { title: '票据号码', dataIndex: 'invoiceNo', key: 'invoiceNo', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', align: 'left' },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'left', width: 100 },
    { title: '开票单位代码', dataIndex: 'invoicingPartyCode', key: 'invoicingPartyCode', align: 'left' },
    { title: '开票单位名称', dataIndex: 'invoicingPartyName', key: 'invoicingPartyName', align: 'left' },
    { title: '交款人代码', dataIndex: 'payerPartyCode', key: 'payerPartyCode', align: 'left' },
    { title: '交款人名称', dataIndex: 'payerPartyName', key: 'payerPartyName', align: 'left' },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

// 其它票
export const columns11 = [
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '金额', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    // { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '业务单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 100 },
    auditTime, //审核通过时间
    ...entryVoucherCols
];

export const columsDict = {
    k1: collectDate.concat(dkCols, columns1, dkExit, collectInfo, addedInvoiceInfo),
    k2: collectDate.concat(dkCols, columns1, dkExit, collectInfo, rzCols, addedInvoiceInfo),
    k3: collectDate.concat(dkCols, signCol, columns1, collectInfo, addedInvoiceInfo), //
    k4: collectDate.concat(dkCols, signCol, columns1, dkExit, collectInfo, rzCols, addedInvoiceInfo),
    k5: collectDate.concat(dkCols, signCol, columns1, collectInfo, addedInvoiceInfo),
    k15: collectDate.concat(dkCols, columns1, rzCols, dkExit, collectInfo, addedInvoiceInfo), // 通行费
    k26: collectDate.concat(dkCols, columns26, dkExit, collectInfo, addedInvoiceInfo), //全电普票
    k27: collectDate.concat(dkCols, signCol, columns26, dkExit, rzCols, collectInfo, addedInvoiceInfo), //全电专票
    k9: collectDate.concat(dkCols, dkExit, columns4, collectInfo, noAddedInvoiceInfo), // 火车高铁票
    k8: collectDate.concat(columns5, collectInfo, noAddedInvoiceInfo), // 的士票
    k10: collectDate.concat(dkCols, dkExit, columns7, collectInfo, noAddedInvoiceInfo), // 飞机票
    k16: collectDate.concat(dkCols, dkExit, columns8, collectInfo, noAddedInvoiceInfo), // 客运票
    k20: collectDate.concat(dkCols, dkExit, columns9, collectInfo, noAddedInvoiceInfo), // 轮船票
    k14: collectDate.concat(columns10, collectInfo, noAddedInvoiceInfo), // 定额发票
    k12: collectDate.concat(dkCols, columns12, rzCols, collectInfo, addedInvoiceInfo), // 机动车发票
    k11: collectDate.concat(columns11, collectInfo, noAddedInvoiceInfo),
    k19: collectDate.concat(columns13, collectInfo, noAddedInvoiceInfo), // 购置税发票
    k7: collectDate.concat(columns14, collectInfo, noAddedInvoiceInfo), // 通用机打发票
    k23: collectDate.concat(columns14, collectInfo, noAddedInvoiceInfo), // 通用机打电子发票
    k17: collectDate.concat(columns15, collectInfo, noAddedInvoiceInfo), // 过路过桥费
    k21: collectDate.concat(dkCols, columns21, dkExit, rzCols, collectInfo, addedInvoiceInfo), //
    k24: collectDate.concat(columns24, collectInfo, noAddedInvoiceInfo), //
    k25: collectDate.concat(columns25, collectInfo, noAddedInvoiceInfo), //
    k13: collectDate.concat(columns16, rzCols, collectInfo, addedInvoiceInfo) // 二手车
};

export const collectColumsDict = {
    k1: fileName.concat(dkCols, columns1, addedInvoiceInfo),
    k2: fileName.concat(dkCols, columns1, addedInvoiceInfo),
    k3: fileName.concat(dkCols, signCol, columns1, addedInvoiceInfo),
    k4: fileName.concat(dkCols, signCol, columns1, rzCols, addedInvoiceInfo),
    k5: fileName.concat(dkCols, signCol, columns1, addedInvoiceInfo),
    k15: fileName.concat(dkCols, columns1, rzCols, addedInvoiceInfo), // 通行费
    k26: fileName.concat(dkCols, columns26, addedInvoiceInfo),
    k27: fileName.concat(dkCols, signCol, columns26, rzCols, addedInvoiceInfo),
    k9: fileName.concat(dkCols, columns4, noAddedInvoiceInfo), // 火车高铁票
    k8: fileName.concat(dkCols, columns5, noAddedInvoiceInfo), // 的士票
    k10: fileName.concat(dkCols, columns7, noAddedInvoiceInfo), // 飞机票
    k16: fileName.concat(dkCols, columns8, noAddedInvoiceInfo), // 客运票
    k20: fileName.concat(dkCols, columns9, noAddedInvoiceInfo), // 轮船票
    k14: fileName.concat(columns10, noAddedInvoiceInfo), // 定额发票
    k12: fileName.concat(dkCols, columns12, rzCols, addedInvoiceInfo), // 机动车发票
    k11: fileName.concat(columns11, noAddedInvoiceInfo),
    k19: fileName.concat(columns13, noAddedInvoiceInfo), // 购置税发票
    k7: fileName.concat(columns14, noAddedInvoiceInfo), // 通用机打发票
    k23: fileName.concat(columns14, noAddedInvoiceInfo), // 通用机打电子发票
    k17: fileName.concat(columns15, noAddedInvoiceInfo), // 过路过桥费
    k21: fileName.concat(columns21, noAddedInvoiceInfo), //
    k24: fileName.concat(columns24, addedInvoiceInfo), //
    k25: fileName.concat(columns25, noAddedInvoiceInfo), //
    k13: fileName.concat(columns16, rzCols, addedInvoiceInfo) // 二手车
};

export const waitCollectColumsDict = {
    k1: tipCol.concat(fileName, columns1, awaitAddedInvoiceInfo),
    k2: tipCol.concat(fileName, columns1, awaitAddedInvoiceInfo),
    k3: tipCol.concat(fileName, columns1, awaitAddedInvoiceInfo),
    k4: tipCol.concat(fileName, columns1, awaitAddedInvoiceInfo),
    k5: tipCol.concat(fileName, columns1, awaitAddedInvoiceInfo),
    k26: tipCol.concat(fileName, columns26, awaitAddedInvoiceInfo),
    k27: tipCol.concat(fileName, columns26, awaitAddedInvoiceInfo),
    k15: tipCol.concat(fileName, columns1, awaitAddedInvoiceInfo), // 通行费
    k9: tipCol.concat(fileName, columns4, noAddedInvoiceInfo), // 火车高铁票
    k8: tipCol.concat(fileName, columns5, noAddedInvoiceInfo), // 的士票
    k10: tipCol.concat(fileName, columns7, noAddedInvoiceInfo), // 飞机票
    k16: tipCol.concat(fileName, columns8, noAddedInvoiceInfo), // 客运票
    k20: tipCol.concat(fileName, columns9, noAddedInvoiceInfo), // 轮船票
    k14: tipCol.concat(fileName, columns10, noAddedInvoiceInfo), // 定额发票
    k12: tipCol.concat(fileName, columns12, awaitAddedInvoiceInfo), // 机动车发票
    k11: tipCol.concat(fileName, columns11, noAddedInvoiceInfo),
    k19: tipCol.concat(fileName, columns13, noAddedInvoiceInfo), // 购置税发票
    k7: tipCol.concat(fileName, columns14, noAddedInvoiceInfo), // 通用机打发票
    k23: tipCol.concat(fileName, columns14, noAddedInvoiceInfo), // 通用机打电子发票
    k17: tipCol.concat(fileName, columns15, noAddedInvoiceInfo), // 过路过桥费
    k21: tipCol.concat(fileName, columns21, noAddedInvoiceInfo), //
    k24: tipCol.concat(fileName, columns24, awaitAddedInvoiceInfo), //
    k25: tipCol.concat(fileName, columns25, noAddedInvoiceInfo), //
    k13: tipCol.concat(fileName, columns16, awaitAddedInvoiceInfo) // 二手车
};

export const columsDictFun = function(key, info = {}) {
    loginInfo = info;
    return columsDict[key];
};

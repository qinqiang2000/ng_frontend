import React from 'react';
import { Tooltip } from 'antd';
import { getWaringCodesResult } from '@piaozone.com/pwyConstants';

const invocieTypeIconDict = {
    k1: ['dzfp.png', '电子普通发票', 1],
    k2: ['dzfp.png', '电子专用发票', 2],
    k3: ['zhipiao.png', '纸质普通发票', 3],
    k4: ['zhuanpiao.png', '纸质专用发票', 4],
    k5: ['jp.png', '纸质卷式普通发票', 5],
    k7: ['jdp.png', '通用机打票', 7],
    k8: ['dsp.png', '的士发票', 8],
    k9: ['hcp.png', '火车票', 9],
    k10: ['fjp.png', '飞机票', 10],
    k11: ['qtp.png', '其它发票', 11],
    k12: ['djc.png', '机动车发票', 12],
    k13: ['esc.png', '二手车发票', 13], //无购方和销方税号
    k14: ['dep.png', '定额票', 14],
    k15: ['txf.png', '通行费电子发票', 15],
    k16: ['kyp.png', '客运发票', 16],
    k17: ['glgq.png', '过路过桥费', 17],
    k19: ['gzsfp.png', '完税证明', 19],
    k20: ['lcp.png', '轮船票', 20],
    k23: ['jdp.png', '通用机打电子发票', 23],
    k21: ['jksIcon.png', '海关缴款书', 21],
    k24: ['hctpIcon.png', '火车票退票凭证', 24],
    k25: ['czpjIcon.png', '财政电子票据', 25],
    k26: ['alldp.png', '数电票（普通发票）', 26],
    k27: ['alldz.png', '数电票（增值税专票发票）', 27]
};

const bxStatusDict = {
    k1: ['unbx.png', '未报销'],
    k30: ['bxing.png', '报销中'],
    k60: ['bxed.png', '已报销'],
    k65: ['accountIcon.png', '已入账']
};


const invoiceStatusDict = { //0:正常、1：失控、2：作废、3：红冲、4：异常
    k2: ['cancelIcon.png', '已作废'],
    k3: ['hcIcon.png', '已红冲']
};

const checkStatusDict = {
    k1: ['dataxf.png', '数据相符'],
    k3: ['databf.png', '数据不相符'],
    k2: ['databf.png', '未查验或查验失败']
};

const originalStateDict = {
    k0: ['noSingIcon.png', '未签收'],
    k1: ['singedIcon.png', '已签收']
};

const noAddDKDict = { // 抵扣用途 1抵扣 2不抵扣 3用于退税 4用于代办退税 5未准予代办退税 6未准予退税 7旅客运输
    k0: ['ondkIcon.png', '未抵扣'],
    k1: ['dkIcon.png', '已抵扣'],
    k2: ['bdkIcon.png', '不抵扣'],
    k3: ['yytxIcon.png', '用于退税'],
    k4: ['yydbtxIcon.png', '用于代办退税'],
    k5: ['bzydbtxIcon.png', '未准予代办退税'],
    k6: ['bzytxIcon.png', '未准予退税'],
    k7: ['lkysdkIcon.png', '旅客运输抵扣']
};

const addDkDict = { //勾选认证状态
    k0: ['nogxIcon.png', '未勾选认证'],
    k1: ['gxIcon.png', '已勾选未认证'],
    k2: ['gxIcon.png', '勾选认证'],
    k3: ['gxIcon.png', '扫描认证'],
    k5: ['nogxIcon.png', '预勾选']
};

const dataSource = {
    k1: { text: '手机拍照' },
    k2: { text: 'PC上传' },
    k3: { text: '员工扫描图像' },
    k4: { text: '财务部扫描图像' },
    k5: { text: '查验' },
    k6: { text: '发票管理客户端' },
    k7: { text: '微信卡包' },
    k8: { text: '对账单开票' },
    k9: { text: '税盘收票' },
    k10: { text: '滴滴卡包' },
    k11: { text: '云票儿' }
};


const tipIcon = require('../commons/img/tips.png');
let loginInfo = {};

const taxPeriod = (v) => {
    if (v) {
        return v.substr(0, 4) + '/' + v.substr(4, 6);
    } else {
        return '--';
    }
};

const renderNumber = (v) => {
    if (typeof v !== 'undefined' && v !== '' && v !== null) {
        const money = parseFloat(v).toFixed(2);
        return (
            <span style={{ color: '#ee761c' }}>{money}</span>
        );
    } else {
        return '--';
    }
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

    if (result.length > 0) {
        return (
            <Tooltip title={result.join('\n')}>
                <img src={tipIcon} alt='' height={16} style={{ marginLeft: 10 }} />
            </Tooltip>
        );
    } else {
        return null;
    }
};

const renderInvoicesInfo = (v, r) => {
    const allowCheckInvoice = [1, 2, 3, 4, 5, 12, 13, 15, 26, 27];
    let fplx = parseInt(r.invoiceType || r.fplx); //发票类型
    const bx = r.expendStatus || 1; //报销状态
    const checkStatus = r.checkStatus; //查验状态
    const invoiceStatus = r.invoiceStatus; //发票状态
    const isRevise = parseInt(r.isRevise);
    const originalState = r.originalState + ''; //签收状态  1已签收 0 未签收
    let authenticateFlag = ''; //抵扣状态 1已抵扣 0 未抵扣  非增值税发票 //勾选认证  增值税发票
    if (r.authenticateFlag && r.authenticateFlag != null) {
        authenticateFlag = r.authenticateFlag + '';
    } else {
        authenticateFlag = '0';
    }
    let deductionPurpose = '0';
    if (r.deductionPurpose) {
        deductionPurpose = r.deductionPurpose + '';
    }
    if ([28, 29, 30].indexOf(fplx) != -1) { //暂时的
        fplx = 11;
    }
    const invocieTypeIcon = invocieTypeIconDict['k' + fplx] && invocieTypeIconDict['k' + fplx][0];
    let checkStatusInfo = checkStatusDict['k' + 1];
    if (checkStatusDict['k' + checkStatus]) {
        checkStatusInfo = checkStatusDict['k' + checkStatus];
        if (checkStatus != 1) {
            checkStatusInfo[1] = r.descriptio || '未查验';
        }
    }
    return (
        <>
            {
                fplx ? (
                    <Tooltip placement='top' title={invocieTypeIconDict['k' + fplx][1]}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + invocieTypeIcon)}
                            alt=''
                            style={{ width: 35, marginLeft: 10 }} height={20}
                        />
                    </Tooltip>
                ) : null
            }
            {
                typeof bx !== 'undefined' ? (
                    <Tooltip placement='top' title={bxStatusDict['k' + bx][1] || '未知状态'}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + bxStatusDict['k' + bx][0] || 'unbx.png')}
                            alt=''
                            style={{ width: 35, marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }

            {
                typeof checkStatus !== 'undefined' && (allowCheckInvoice.indexOf(fplx) !== -1) ? (
                    <Tooltip placement='top' title={checkStatusInfo[1]}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + checkStatusInfo[0])}
                            alt=''
                            style={{ width: 35, marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }

            {
                (allowCheckInvoice.indexOf(fplx) !== -1 && invoiceStatusDict['k' + invoiceStatus]) ? (
                    <Tooltip placement='top' title={invoiceStatusDict['k' + invoiceStatus][1]}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + invoiceStatusDict['k' + invoiceStatus][0])}
                            alt=''
                            style={{ width: 35, marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }
            {
                [1, 2, 3, 4, 9, 10, 12, 15, 16, 20, 26, 27].indexOf(fplx) !== -1 && deductionPurpose ? (
                    <Tooltip placement='top' title={noAddDKDict['k' + deductionPurpose][1]}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + noAddDKDict['k' + deductionPurpose][0])}
                            alt=''
                            style={{ width: 'auto', marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }
            {
                [2, 4, 12, 15, 27].indexOf(fplx) !== -1 && authenticateFlag ? (
                    <Tooltip placement='top' title={addDkDict['k' + authenticateFlag][1]}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + addDkDict['k' + authenticateFlag][0])}
                            alt=''
                            style={{ width: 44, marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }
            {
                originalState ? (
                    <Tooltip placement='top' title={originalStateDict['k' + originalState][1]}>
                        <img
                            src={require('../commons/img/invoiceIcons/' + originalStateDict['k' + originalState][0])}
                            alt=''
                            style={{ width: 44, marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }
            {
                allowCheckInvoice.indexOf(fplx) === -1 && isRevise === 2 ? (
                    <Tooltip placement='top' title='发票信息已手动修改'>
                        <img
                            src={require('../commons/img/invoiceIcons/yxg.png')}
                            alt=''
                            style={{ width: 35, marginLeft: 10 }}
                            height={20}
                        />
                    </Tooltip>
                ) : null
            }

            {warningDescrips(v, r)}
        </>
    );
};

const rzCols = [
    { title: '认证时间', dataIndex: 'selectAuthenticateTime', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

const expenseTime = {
    title: '入账时间',
    dataIndex: 'accountTime',
    className: 'thCol',
    align: 'center',
    width: 84,
    render: (v) => {
        if (v) {
            return v;
        } else {
            return '--';
        }
    }
};

const accountDate = {
    title: '会计属期',
    dataIndex: 'accountPeriod',
    className: 'thCol',
    align: 'center',
    width: 84,
    render: (v) => {
        if (v) {
            return v;
        } else {
            return '--';
        }
    }
};
const vouchInfo = {
    title: '凭证号',
    dataIndex: 'vouchNo',
    className: 'thCol',
    align: 'center',
    render: (v) => {
        if (v) {
            return v;
        } else {
            return '--';
        }
    },
    width: 100
};

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

export const columnsAll = [ //全部
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 200 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '开票日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo
];

export const columnsStart = [ //增值税发票
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '开票日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo
];

export const columnsEnd = [
    { title: '不含税金额', dataIndex: 'invoiceAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '销方名称', dataIndex: 'salerName', className: 'thCol', align: 'left', width: 140, render: (v) => { return v || '--'; } },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '购方名称', dataIndex: 'buyerName', className: 'thCol', align: 'left', width: 140, render: (v) => { return v || '--'; } },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

const collectDate = [
    { title: '采集日期', dataIndex: 'collectDate', className: 'thCol', align: 'center', width: 84 }
];

const dkCols = { title: '旅客运输抵扣税期', dataIndex: 'taxPeriod', className: 'thCol', align: 'center', render: taxPeriod, width: 130 };

const dkColsAll = { title: '抵扣税期', dataIndex: 'taxPeriod', className: 'thCol', align: 'center', render: taxPeriod, width: 130 };

const dataSources = [
    {
        title: '数据来源',
        dataIndex: 'resource',
        align: 'center',
        className: 'thCol',
        width: 130,
        render: (v) => {
            if (v) {
                let txt = '';
                if (v) {
                    if (dataSource['k' + v]) {
                        txt = dataSource['k' + v].text;
                    } else {
                        txt = '--';
                    }
                }
                return txt;
            } else {
                return '--';
            }
        }
    }
];

export const columns4 = [ //高铁
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '票号', dataIndex: 'printingSequenceNo', className: 'thCol', align: 'left', width: 100 },
    { title: '车次', dataIndex: 'trainNum', className: 'thCol', align: 'left', width: 75 },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '乘车日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84 },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    dkCols,
    { title: '税额', dataIndex: 'totalTaxAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'stationGetOn', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '目的地', dataIndex: 'stationGetOff', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '姓名', dataIndex: 'passengerName', className: 'thCol', align: 'left', width: 75, render: (v) => { return v || '--'; } },
    { title: '身份证号', dataIndex: 'customerIdentityNum', className: 'thCol', width: 200, align: 'center', render: (v) => { return v || '--'; } },
    { title: '座位类型', dataIndex: 'seat', className: 'thCol', align: 'center', width: 75, render: (v) => { return v || '--'; } }
];

export const columns5 = [ //的士票
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', width: 110 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', width: 80 },
    { title: '乘车日期', dataIndex: 'invoiceDate', align: 'center', width: 84 },
    { title: '上车时间', dataIndex: 'timeGetOn', align: 'center', width: 84 },
    { title: '下车时间', dataIndex: 'timeGetOff', align: 'center', width: 84 },
    { title: '打车里程', dataIndex: 'mileage', align: 'left', width: 84 },
    { title: '金额(含税)', dataIndex: 'totalAmount', align: 'left', width: 100, render: renderNumber },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    { title: '发票所在地', dataIndex: 'place', align: 'left', width: 100 }
];

export const columns7 = [ //飞机行程单
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '电子票号', dataIndex: 'electronicTicketNum', className: 'thCol', width: 140, align: 'center', render: (v) => { return v || '--'; } },
    { title: '印刷序列号', dataIndex: 'printNum', className: 'thCol', width: 140, align: 'center', render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '乘机时间', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75, render: (v) => { return v || '--'; } },
    expenseTime,
    accountDate,
    vouchInfo,
    dkCols,
    { title: '税额', dataIndex: 'totalTaxAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'placeOfDeparture', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '目的地', dataIndex: 'destination', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '姓名', dataIndex: 'customerName', className: 'thCol', align: 'left', width: 75, render: (v) => { return v || '--'; } },
    { title: '身份证号', dataIndex: 'customerIdentityNum', className: 'thCol', width: 200, align: 'center', render: (v) => { return v || '--'; } },
    { title: '座位类型', dataIndex: 'seatGrade', className: 'thCol', align: 'center', width: 75, render: (v) => { return v || '--'; } },
    { title: '机场建设费', dataIndex: 'airportConstructionFee', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '燃油附加费', dataIndex: 'fuelSurcharge', className: 'thCol', align: 'right', width: 100, render: renderNumber }
];

export const columns8 = [ // 公路汽车票
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '乘车日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    dkCols,
    { title: '税额', dataIndex: 'totalTaxAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '出发站', dataIndex: 'stationGetOn', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '目的地', dataIndex: 'stationGetOff', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '姓名', dataIndex: 'passengerName', className: 'thCol', align: 'left', width: 75, render: (v) => { return v || '--'; } }
];

export const columns9 = [ // 轮船票
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '乘船日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75, render: (v) => { return v || '--'; } },
    expenseTime,
    accountDate,
    vouchInfo,
    dkCols,
    { title: '税额', dataIndex: 'totalTaxAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '出发点', dataIndex: 'stationGetOn', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '目的地', dataIndex: 'stationGetOff', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '姓名', dataIndex: 'passengerName', className: 'thCol', align: 'left', width: 75, render: (v) => { return v || '--'; } }
];

export const columns10 = [ // 定额发票
    { title: '发票信息', dataIndex: 'checkStatus fpxx', className: 'thCol', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '金额', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '发票所在地', dataIndex: 'place', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo
];

export const columns12 = [ // 机动车
    { title: '发票信息', dataIndex: 'checkStatus fpxx', className: 'thCol', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '开票时间', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84 },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    { title: '金额（不含税）', dataIndex: 'invoiceMoney', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '税额', dataIndex: 'totalTaxAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '销方名称', dataIndex: 'salerName', className: 'thCol', align: 'left', width: 140, render: (v) => { return v || '--'; } },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '购方名称', dataIndex: 'buyerName', className: 'thCol', align: 'left', width: 140, render: (v) => { return v || '--'; } },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

export const columns13 = [ // 购置税发票
    { title: '发票信息', dataIndex: 'checkStatus fpxx', className: 'thCol', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '纳税人识别号', dataIndex: 'buyerTaxNo', className: 'thCol', align: 'left' },
    { title: '完税证明号码', dataIndex: 'taxPaidProofNo', className: 'thCol', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '填发日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84 },
    expenseTime,
    accountDate,
    vouchInfo
];

export const columns14 = [ // 通用机打发票
    { title: '发票信息', dataIndex: 'checkStatus fpxx', className: 'thCol', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    { title: '销方名称', dataIndex: 'salerName', className: 'thCol', align: 'left', width: 140, render: (v) => { return v || '--'; } },
    { title: '销方纳税识别号', dataIndex: 'salerTaxNo', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '购方名称', dataIndex: 'buyerName', className: 'thCol', align: 'left', width: 140, render: (v) => { return v || '--'; } },
    { title: '购方纳税识别号', dataIndex: 'buyerTaxNo', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

export const columns15 = [ // 过路过桥费
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '金额', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    { title: '入口', dataIndex: 'entrance', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '出口', dataIndex: 'exit', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } },
    { title: '时间', dataIndex: 'time', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '发票所在地', dataIndex: 'place', className: 'thCol', align: 'left', width: 100, render: (v) => { return v || '--'; } }
];

export const columns16 = [ // 二手车
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 240 },
    { title: '发票代码', dataIndex: 'invoiceCode', className: 'thCol', align: 'left', width: 110, render: (v) => { return v || '--'; } },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 80, render: (v) => { return v || '--'; } },
    { title: '车价合计', dataIndex: 'totalAmount', className: 'thCol', align: 'left', width: 100, render: renderNumber },
    { title: '开票日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    { title: '购买方名称', dataIndex: 'buyerName', className: 'thCol', align: 'left' },
    { title: '购买方证件号码', dataIndex: 'buyerIdNo', className: 'thCol', align: 'left' },
    { title: '销售方名称', dataIndex: 'salerName', className: 'thCol', align: 'left' },
    { title: '销售方证件号', dataIndex: 'salerIdNo', className: 'thCol', align: 'left' }
];

export const columns11 = [ // 其它票
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 180 },
    { title: '金额', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '备注', dataIndex: 'remark', className: 'thCol', align: 'center', width: 75 },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo
];


// 海关缴款书
export const columns21 = [
    { title: '发票信息', dataIndex: 'bx', key: 'bx', className: 'thCol', align: 'left', render: renderInvoicesInfo },
    { title: '缴款书号码', dataIndex: 'customDeclarationNo', key: 'customDeclarationNo', className: 'thCol', align: 'left' },
    { title: '填发日期', dataIndex: 'invoiceDate', key: 'invoiceDate', className: 'thCol', align: 'left' },
    { title: '合计金额', dataIndex: 'totalAmount', key: 'totalAmount', className: 'thCol', align: 'left' },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', width: 75 },
    { title: '缴款单位名称', dataIndex: 'deptName', key: 'deptName', className: 'thCol', align: 'left' },
    { title: '进口代理公司', dataIndex: 'secondDeptName', key: 'secondDeptName', className: 'thCol', align: 'left' },
    expenseTime,
    accountDate,
    vouchInfo
];

// 火车票退票凭证
export const columns24 = [
    { title: '发票信息', dataIndex: 'bx', key: 'bx', className: 'thCol', align: 'left', render: renderInvoicesInfo },
    { title: '收据号码', dataIndex: 'number', key: 'number', className: 'thCol', align: 'left' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', className: 'thCol', align: 'left' },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo
];

// 财政电子票据
export const columns25 = [
    { title: '发票信息', dataIndex: 'bx', key: 'bx', className: 'thCol', align: 'left', render: renderInvoicesInfo },
    { title: '票据代码', dataIndex: 'invoiceCode', key: 'invoiceCode', className: 'thCol', align: 'left' },
    { title: '票据号码', dataIndex: 'invoiceNo', key: 'invoiceNo', className: 'thCol', align: 'left' },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate', className: 'thCol', align: 'left' },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', className: 'thCol', align: 'left' },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo,
    { title: '开票单位代码', dataIndex: 'invoicingPartyCode', key: 'invoicingPartyCode', className: 'thCol', align: 'left' },
    { title: '开票单位名称', dataIndex: 'invoicingPartyName', key: 'invoicingPartyName', className: 'thCol', align: 'left' },
    { title: '交款人代码', dataIndex: 'payerPartyCode', key: 'payerPartyCode', className: 'thCol', align: 'left' },
    { title: '交款人名称', dataIndex: 'payerPartyName', key: 'payerPartyName', className: 'thCol', align: 'left' }
];

//全电票
export const columns26 = [
    { title: '发票信息', dataIndex: 'checkStatus', className: 'thCol fpxx', key: 'invoiceInfoGroup', render: renderInvoicesInfo, width: 200 },
    { title: '发票号码', dataIndex: 'invoiceNo', className: 'thCol', align: 'left', width: 180, render: (v) => { return v || '--'; } },
    { title: '开票日期', dataIndex: 'invoiceDate', className: 'thCol', align: 'center', width: 84, render: (v) => { return v || '--'; } },
    { title: '价税合计', dataIndex: 'totalAmount', className: 'thCol', align: 'right', width: 100, render: renderNumber },
    { title: '单据信息', dataIndex: 'isExpenseCorrelation', className: 'thCol', align: 'center', width: 75 },
    expenseTime,
    accountDate,
    vouchInfo
];

export const columsDict = {
    k0: collectDate.concat(columnsAll).concat([dkColsAll]).concat(dataSources),
    k1: collectDate.concat(columnsStart).concat([dkCols]).concat(columnsEnd).concat(dkExit, dataSources),
    k2: collectDate.concat(columnsStart).concat([dkColsAll]).concat(columnsEnd).concat(rzCols).concat(dkExit, dataSources),
    k3: collectDate.concat(columnsStart).concat(columnsEnd).concat(dataSources),
    k4: collectDate.concat(columnsStart).concat([dkColsAll]).concat(columnsEnd).concat(rzCols).concat(dkExit, dataSources),
    k5: collectDate.concat(columnsStart).concat(columnsEnd).concat(dataSources),
    k9: collectDate.concat(columns4).concat(dkExit, dataSources), // 火车高铁票
    k8: collectDate.concat(columns5).concat(dataSources), // 的士票
    k10: collectDate.concat(columns7).concat(dkExit, dataSources), // 飞机票
    k16: collectDate.concat(columns8).concat(dkExit, dataSources), // 客运票
    k20: collectDate.concat(columns9).concat(dkExit, dataSources), // 轮船票
    k14: collectDate.concat(columns10).concat(dataSources), // 定额发票
    k12: collectDate.concat(columns12).concat([dkColsAll]).concat(rzCols).concat(dataSources), // 机动车发票
    k11: collectDate.concat(columns11).concat(dataSources),
    k19: collectDate.concat(columns13).concat(dataSources), // 购置税发票
    k7: collectDate.concat(columns14).concat(dataSources), // 通用机打发票
    k23: collectDate.concat(columns14).concat(dataSources), // 通用机打电子发票
    k17: collectDate.concat(columns15).concat(dataSources), // 过路过桥费
    k13: collectDate.concat(columns16).concat(dataSources), // 二手车,
    k21: collectDate.concat(columns21).concat(dataSources), // 海关缴款书,
    k24: collectDate.concat(columns24).concat(dataSources), // 火车退票凭证,
    k25: collectDate.concat(columns25).concat(dataSources), // 电子财政票据
    k15: collectDate.concat(columnsStart).concat([dkColsAll]).concat(columnsEnd).concat(rzCols).concat(dkExit, dataSources),
    k26: collectDate.concat(columns26).concat([dkCols]).concat(columnsEnd).concat(dkExit, dataSources),
    k27: collectDate.concat(columns26).concat([dkColsAll]).concat(columnsEnd).concat(rzCols).concat(dkExit, dataSources)
};

export const columsDictFun = function(key, info = {}) {
    loginInfo = info;
    return columsDict[key];
};

import React from 'react';
import moment from 'moment';
import { invoiceTypes, getWaringCodesResult } from '@piaozone.com/pwyConstants';
import { Tooltip } from 'antd';


const tipIcon = require('../../img/tips.png');

const INPUT_INVOICE_TYPES_DICT = invoiceTypes.INPUT_INVOICE_TYPES_DICT;


export const dataSource = {
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
    k26: ['alldp.png', '全电普票', 26],
    k27: ['alldz.png', '全电专票', 27]
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

const noAddDKDict = { //旅客运输状态
    k0: ['ondkIcon.png', '未抵扣'],
    k1: ['dkIcon.png', '已抵扣'],
    k2: ['bdkIcon.png', '不抵扣'],
    k3: ['yytxIcon.png', '用于退税'],
    k4: ['yydbtxIcon.png', '用于代办退税'],
    k5: ['bzydbtxIcon.png', '未准予代办退税'],
    k6: ['bzytxIcon.png', '未准予退税'],
    k7: ['lkysdkIcon.png', '旅客运输抵扣']
};

const addDkDict = {
    k0: ['nogxIcon.png', '未勾选认证'],
    k1: ['gxIcon.png', '已勾选未认证'],
    k2: ['gxIcon.png', '勾选认证'],
    k3: ['gxIcon.png', '扫描认证'],
    k5: ['nogxIcon.png', '预勾选']
};

export const render = function(v) {
    return v ? (
        <div>{v}</div>
    ) : '--';
};

export const renderXfmc = function(v, r) {
    return r.salerName || r.sallerName || '--';
};

export const renderFphm = function(v, r) {
    return r.invoiceNo || r.fphm || '--';
};

export const renderJshj = function(v, r) {
    const newValue = r.totalAmount || v || 0;
    if (r.errorFlag) {
        return '--';
    } else {
        return <div style={{ color: '#ff9524' }}>{newValue}</div>;
    }
};

export const renderSe = function(v, r) {
    const newValue = r.totalTaxAmount || r.se || 0;
    if (r.errorFlag) {
        return '--';
    } else {
        return <div style={{ color: '#ff9524' }}>{parseFloat(newValue).toFixed(2)}</div>;
    }
};

export const renderKprq = function(oldValue, r) {
    const v = r.invoiceDate || r.kprq;
    if (r.errorFlag || !v) {
        return '--';
    } else if (v.indexOf('-') === -1 && v.length === 8) {
        return moment(v, 'YYYYMMDD').format('YYYY-MM-DD');
    } else if (v.indexOf('-') !== -1 && v.length === 10) {
        return v;
    } else {
        return '--';
    }
};

export const renderAmount = function(v) {
    return v ? (
        <div style={{ color: '#ff9524' }}>{v}</div>
    ) : '--';
};

export const renderDate = function(v) {
    return v ? (
        <div>
            {v.substr(0, 4) + '-' + v.substr(4, 2) + '-' + v.substr(6, 2)}
        </div>
    ) : '--';
};

const warningDescrips = (v, r) => {
    let result = [];
    if (r.warningCode) {
        result = result.concat(getWaringCodesResult(r.warningCode));
    }
    if (result.length > 0) {
        return (
            <Tooltip title={result.join('\n')}>
                <img src={tipIcon} alt='' height={20} width={20} style={{ marginLeft: 10, width: 20, height: 20 }} className='invoiceIcon' />
            </Tooltip>
        );
    } else {
        return null;
    }
};

export const renderInvoiceInfo = (v, r) => {
    const fplx = parseInt(r.invoiceType || r.fplx); //发票类型
    const allowCheck = INPUT_INVOICE_TYPES_DICT['k' + fplx].isAddedTax;
    const allowGovDk = [2, 4, 12, 13, 15, 27];
    const bx = r.expendStatus || 1; //报销状态
    const checkStatus = r.checkStatus; //查验状态
    const invoiceStatus = r.invoiceStatus; //发票状态
    const isRevise = parseInt(r.isRevise);
    const originalState = r.originalState + ''; //签收状态  1已签收 0 未签收
    const authenticateFlag = r.authenticateFlag + ''; //
    const invocieTypeIcon = invocieTypeIconDict['k' + fplx] && invocieTypeIconDict['k' + fplx][0];
    let checkStatusInfo = checkStatusDict['k' + 1];
    const deductionPurpose = r.deductionPurpose || '0';
    if (checkStatusDict['k' + checkStatus]) {
        checkStatusInfo = checkStatusDict['k' + checkStatus];
        if (checkStatus != 1) {
            checkStatusInfo[1] = r.descriptio || '未查验';
        }
    }
    const sizeProps1 = {
        width: 35,
        height: 20,
        style: { width: 35, height: 20 }
    };
    const sizeProps2 = {
        width: 44,
        height: 20,
        style: { width: 44, height: 20 }
    };
    return (
        <div className='iconBox'>
            {
                fplx ? (
                    <Tooltip placement='bottom' title={invocieTypeIconDict['k' + fplx][1]}>
                        <img
                            src={require('../../img/invoiceIcons/' + invocieTypeIcon)}
                            alt=''
                            {...sizeProps1}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : null
            }
            {
                typeof bx !== 'undefined' ? (
                    <Tooltip placement='bottom' title={bxStatusDict['k' + bx][1] || '未知状态'}>
                        <img
                            src={require('../../img/invoiceIcons/' + bxStatusDict['k' + bx][0] || 'unbx.png')}
                            alt=''
                            {...sizeProps1}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : null
            }

            {
                typeof checkStatus !== 'undefined' && allowCheck ? (
                    <Tooltip placement='bottom' title={checkStatusInfo[1]}>
                        <img
                            src={require('../../img/invoiceIcons/' + checkStatusInfo[0])}
                            alt=''
                            {...sizeProps1}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : null
            }

            {
                (allowCheck && invoiceStatusDict['k' + invoiceStatus]) ? (
                    <Tooltip placement='bottom' title={invoiceStatusDict['k' + invoiceStatus][1]}>
                        <img
                            src={require('../../img/invoiceIcons/' + invoiceStatusDict['k' + invoiceStatus][0])}
                            alt=''
                            {...sizeProps1}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : null
            }
            {
                originalState ? (
                    <Tooltip placement='bottom' title={originalStateDict['k' + originalState][1]}>
                        <img
                            src={require('../../img/invoiceIcons/' + originalStateDict['k' + originalState][0])}
                            alt=''
                            {...sizeProps2}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : null
            }
            {
                allowGovDk.indexOf(fplx) !== -1 ? (
                    <Tooltip placement='bottom' title={addDkDict['k' + authenticateFlag][1]}>
                        <img
                            src={require('../../img/invoiceIcons/' + addDkDict['k' + authenticateFlag][0])}
                            alt=''
                            {...sizeProps2}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : (
                    <Tooltip placement='bottom' title={noAddDKDict['k' + deductionPurpose][1]}>
                        <img
                            src={require('../../img/invoiceIcons/' + noAddDKDict['k' + deductionPurpose][0])}
                            alt=''
                            {...sizeProps2}
                            className='invoiceIcon'
                            style={{ width: 'auto' }}
                        />
                    </Tooltip>
                )
            }
            {
                !allowCheck && isRevise === 2 ? (
                    <Tooltip placement='bottom' title='发票信息已手动修改'>
                        <img
                            src={require('../../img/invoiceIcons/yxg.png')}
                            alt=''
                            {...sizeProps1}
                            className='invoiceIcon'
                        />
                    </Tooltip>
                ) : null
            }

            {warningDescrips(v, r)}
        </div>
    );
};

export const currencyRender = (v) => {
    const dict = {
        CNY: '人民币',
        HKD: '港币',
        USD: '美元'
    };
    return dict[v] || '人民币';
};

export const renderOperate = (r, i, onShowEditDialog) => {
    return (
        <div className='operate'>
            <a
                href='javascript:;'
                onClick={() => { onShowEditDialog(r, i); }}
            >
                查看
            </a>
        </div>
    );
};


export const renderDataSource = (v) => {
    return dataSource['k' + v] ? dataSource['k' + v].text : '--';
};

export const renderIndex = (index, pageNo, pageSize) => {
    return index + 1 + (pageNo - 1) * pageSize;
};

export const renderGxFlag = function(v, r) {
    let authenticateFlag = r.authenticateFlag;
    if (typeof authenticateFlag === 'undefined') {
        authenticateFlag = v;
    }
    authenticateFlag = parseInt(authenticateFlag);

    if (authenticateFlag === 0) {
        return '否';
    } else if (authenticateFlag === 1 || authenticateFlag === 2) {
        return '是';
    }
};

export const renderGlzt = (v = '', r) => {
    v = v ? v.toString() : '';
    if (v === '') {
        return '--';
    } else if (v === '0') {
        return '正常';
    } else {
        return '非正常';
    }
};

export const renderBxInfo = (v, r, showRelatedBill) => {
    const { expendStatus, serialNo } = r;
    if (typeof showRelatedBill === 'function' && (expendStatus == 30 || expendStatus == 60 || expendStatus == 65)) {
        return (
            <a href='javascript:;' onClick={() => showRelatedBill(serialNo)}>关联单据</a>
        );
    } else {
        return '--';
    }
};
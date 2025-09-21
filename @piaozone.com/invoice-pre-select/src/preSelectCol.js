import React from 'react';
import { Tooltip, Icon } from 'antd';
import { invoiceTypes } from '@piaozone.com/pwyConstants';

const INPUT_INVOICE_TYPES = invoiceTypes.INPUT_INVOICE_TYPES;
const invoiceText = {};
INPUT_INVOICE_TYPES.map((item) => {
    invoiceText['k' + item.value] = item.text;
});

const renderInvoiceText = function(v) {
    if (v) {
        return invoiceText['k' + v];
    } else {
        return '--';
    }
};

export const render = function(v) {
    return v ? (
        <div>{v}</div>
    ) : '--';
};

const renderDeductionStatus = function(v) {
    if (typeof v === 'undefined' || v === '') {
        return '未抵扣';
    } else {
        v = parseInt(v);
        if (v === 1) {
            return '抵扣';
        } else if (v === 2) {
            return '不抵扣';
        } else {
            return '未抵扣';
        }
    }
};

const renderInvocieStatus = function(v) {
    if (typeof v === 'undefined' || v === '') {
        return '--';
    } else {
        v = parseInt(v);
        if (v === 0) {
            return '正常';
        } else if (v === 1) {
            return <span className='red'>失控</span>;
        } else if (v === 2) {
            return <span className='red'>作废</span>;
        } else if (v === 3) {
            return <span className='red'>红冲</span>;
        } else if (v === 4) {
            return <span className='red'>异常</span>;
        } else if (v === 6) {
            return <span className='red'>红票待确认</span>;
        } else if (v === 7) {
            return <span className='red'>部分红冲</span>;
        } else if (v === 8) {
            return <span className='red'>全额红冲</span>;
        } else {
            return '--';
        }
    }
};

export const renderGxFlag = function(v, r) {
    let authenticateFlag = r.authenticateFlag;
    if (typeof authenticateFlag === 'undefined') {
        authenticateFlag = v;
    }
    authenticateFlag = parseInt(authenticateFlag);
    if (authenticateFlag === 0) {
        return '未勾选';
    } else if (authenticateFlag === 1) {
        return '已勾选';
    } else if (authenticateFlag === 2) {
        return '勾选认证';
    } else if (authenticateFlag === 3) {
        return '扫描认证';
    } else if (authenticateFlag === 5) {
        return '预勾选';
    } else {
        return '--';
    }
};

export const entryVoucherCols = [
    {
        title: '是否入账',
        dataIndex: 'isEntryVoucher',
        align: 'left',
        render: (v = '') => {
            v = v.toString();
            if (v === '1') {
                return '是';
            } else if (v === '0') {
                return '否';
            }
        },
        width: 80
    },
    { title: '入账属期', dataIndex: 'accountDate', align: 'left', render, width: 100 },
    { title: '凭证号', dataIndex: 'vouchInfo', align: 'left', render: (info) => { return info ? info.vouchNo : '--'; }, width: 100 }
];

const yxseRenderTitle = (title, tips) => {
    return (
        <div>
            <span style={{ marginRight: 5 }}>可抵扣税额</span>
            <Tooltip
                style={{ width: 415 }}
                className='yxseTips'
                title={() => {
                    return (
                        <div style={{ textAlign: 'justify' }}>
                            <p style={{ marginBottom: 5 }}>
                                增值税发票综合服务平台V4.017升级：在【发票抵扣勾选】和【发票批量抵扣勾选】功能中，
                                将“有效税额”调整为“可抵扣税额”，且不允许人工修改和编辑。针对全电专票，系统自动计算其红冲剩余税额作为“可抵扣税额”，并支持“可抵扣税额”勾选。
                            </p>
                            <p style={{ margin: 0 }}>数据同步可能存在延迟，勾选认证税额以税局为准!</p>
                        </div>
                    );
                }}
            >
                <Icon type='info-circle' />
            </Tooltip>
        </div>
    );
};

const dkGxInvoiceCols = [
    { title: '发票类型', dataIndex: 'invoiceType', align: 'left', render: renderInvoiceText, width: 150 },
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', render, width: 120 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', render, width: 120 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'center', render, width: 120 },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', render, width: 300 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', render, width: 120 },
    { title: '税额', dataIndex: 'taxAmount', align: 'left', render: (v, r) => v || r.totalTaxAmount || '', width: 100 },
    { title: '价税合计', dataIndex: 'totalAmount', align: 'left', render: (v, r) => v || r.totalAmount || '', width: 100 },
    { title: yxseRenderTitle, dataIndex: 'yxse', align: 'left', width: 100 },
    { title: '勾选状态', dataIndex: 'authenticateFlag', align: 'center', render: renderGxFlag, width: 80 },
    { title: '抵扣状态', dataIndex: 'deductionPurpose', align: 'center', render: renderDeductionStatus, width: 80 },
    { title: '发票状态', dataIndex: 'invoiceStatus', align: 'left', render: renderInvocieStatus, width: 80 },
    { title: '采集日期', dataIndex: 'collectDate', align: 'center', render: (v) => v || '--', width: 120 },
    { title: '预勾选人', dataIndex: 'preSelector', align: 'left', render: (v) => v || '--', width: 100 },
    { title: '预勾选时间', dataIndex: 'preSelectTime', align: 'center', render: (v) => v || '--', width: 120 },
    { title: '入账属期', dataIndex: 'accountDate', align: 'center', render: (v) => v || '--', width: 120 }
];

export const preSelectCols = (onChangeYxse, keys) => {
    return dkGxInvoiceCols.map((r) => {
        if (r.dataIndex !== 'yxse') {
            return r;
        } else {
            return {
                ...r,
                render: (v, r) => {
                    let curYxse = r.taxAmount || r.totalTaxAmount;
                    if (typeof v === 'undefined') {
                        curYxse = r.effectiveTaxAmount;
                    } else {
                        curYxse = v;
                    }

                    return curYxse;
                }
            };
        }
    });
};

// export const createAccountDate = (len) => { //入账属期
//     const entryDate = [{
//         text: '全部',
//         value: '',
//         checked: true
//     }];
//     const date = new Date();
//     date.setMonth(date.getMonth() + 1, 1); //获取到当前月份, 设置月份
//     for (var i = 0; i < len; i++) {
//         date.setMonth(date.getMonth() - 1); //每次循环一次, 月份值减1
//         var m = date.getMonth() + 1;
//         m = m < 10 ? '0' + m : m + '';
//         entryDate.push({ checked: false, value: date.getFullYear() + m, text: date.getFullYear() + '/' + m });
//     }
//     return entryDate;
// };

export const entryDateFun = function() {
    const entryDate = [];
    var data = new Date();
    data.setMonth(data.getMonth() + 1, 1); //获取到当前月份,设置月份
    for (var i = 0; i < 12; i++) {
        data.setMonth(data.getMonth() - 1); //每次循环一次 月份值减1
        var m = data.getMonth() + 1;
        m = m < 10 ? '0' + m : m + '';
        entryDate.push({ checked: false, value: data.getFullYear() + m, text: data.getFullYear() + '/' + m });
    }
    return entryDate;
};
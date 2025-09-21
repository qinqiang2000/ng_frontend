import React from 'react';
import { Input, Icon, Tooltip } from 'antd';
import { inputFullInvoiceDict } from './constants';
import moment from 'moment';
export const render = function(v) {
    return v ? (
        <div>{v}</div>
    ) : '--';
};

export const renderInvoiceType = function(v) {
    if (inputFullInvoiceDict['k' + v]) {
        return inputFullInvoiceDict['k' + v];
    }
    return '--';
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
            return '红冲';
        } else if (v === 4) {
            return <span className='red'>异常</span>;
        } else {
            return '--';
        }
    }
};

export const renderIndexNumber = function(page, pageSize, index) {
    return (page - 1) * pageSize + index + 1;
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

export const renderGxConfirmFlag = function(v, r) {
    let authenticateFlag = r.authenticateFlag;
    if (typeof authenticateFlag === 'undefined') {
        authenticateFlag = parseInt(v);
        if (authenticateFlag === 1) {
            return '是';
        } else {
            return '否';
        }
    } else {
        authenticateFlag = parseInt(authenticateFlag);

        if (authenticateFlag === 2 || authenticateFlag === 3) {
            return '是';
        } else {
            return '否';
        }
    }
};

const renderInput = (v, r) => {
    return <Input value={typeof v === 'undefined' ? r.taxAmount || r.totalTaxAmount : v} size='small' />;
};

export const renderGlzt = (v = '', r) => {
    v = v ? v.toString() : '';
    if (v === '0' || v === '') {
        return '正常';
    } else {
        return '非正常';
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
    { title: '序号', dataIndex: 'indexNumber', align: 'center', width: 80 },
    { title: '发票类型', dataIndex: 'invoiceType', align: 'left', render: renderInvoiceType, width: 150 },
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', render, width: 120 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', render, width: 120 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'left', render, width: 120 },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', render, width: 300 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', render, width: 120 },
    { title: '税额', dataIndex: 'taxAmount', align: 'left', render: (v, r) => v || r.totalTaxAmount || '', width: 100 },
    { title: yxseRenderTitle, dataIndex: 'yxse', align: 'left', render: renderInput, width: 100 },
    { title: '发票状态', dataIndex: 'invoiceStatus', align: 'left', render: renderInvocieStatus, width: 80 },
    { title: '是否勾选', dataIndex: 'checkFlag', align: 'left', render: renderGxFlag, width: 80 },
    { title: '勾选时间', dataIndex: 'selectTime', align: 'left', render, width: 160 },
    // { title: '是否勾选确认', dataIndex: 'checkAuthenticateFlag', align: 'left', render: renderGxConfirmFlag, width: 120 },
    // { title: '勾选认证时间', dataIndex: 'selectAuthenticateTime', align: 'left', render, width: 160 },
    { title: '管理状态', dataIndex: 'manageStatus', align: 'left', render: renderGlzt }
];

const customDkGxInvoiceCols = [
    { title: '序号', dataIndex: 'indexNumber', align: 'center', width: 80 },
    { title: '发票类型', dataIndex: 'invoiceType', align: 'left', render: renderInvoiceType, width: 150 },
    { title: '缴款书号码', dataIndex: 'customDeclarationNo', align: 'left', render, width: 120 },
    { title: '缴款单位', dataIndex: 'deptName', align: 'left', render, width: 300 },
    { title: '报关单编号', dataIndex: 'declareNo', align: 'left', render, width: 120 },
    { title: '填发日期', dataIndex: 'invoiceDate', align: 'left', render, width: 120 },
    { title: '合计金额', dataIndex: 'totalTaxAmount', align: 'left', render, width: 120 },
    { title: '税额', dataIndex: 'taxAmount', align: 'left', render: (v, r) => v || r.totalTaxAmount || '', width: 100 },
    { title: yxseRenderTitle, dataIndex: 'yxse', align: 'left', render: renderInput, width: 100 },
    { title: '发票状态', dataIndex: 'invoiceStatus', align: 'left', render: renderInvocieStatus, width: 80 },
    { title: '是否勾选', dataIndex: 'checkFlag', align: 'left', render: renderGxFlag, width: 80 },
    { title: '勾选时间', dataIndex: 'selectTime', align: 'left', render, width: 160 },
    { title: '管理状态', dataIndex: 'manageStatus', align: 'left', render: renderGlzt }
];

export const preSelectCols = [
    { title: '预勾选人', dataIndex: 'preSelector', align: 'left', render, width: 120 },
    { title: '预勾选时间', dataIndex: 'preSelectTime', align: 'left', render, width: 160 }
];

export const getDkGxInvoiceCols = (onChangeYxse, keys, page, pageSize, opt = {}) => {
    return dkGxInvoiceCols.map((r) => {
        if (r.dataIndex === 'indexNumber') {
            return {
                ...r,
                align: 'left',
                render: (v, r, i) => {
                    return (i + 1) + (page - 1) * pageSize;
                }
            };
        } else if (r.dataIndex !== 'yxse') {
            return r;
        } else {
            return {
                ...r,
                render: (v, r) => {
                    let curYxse = typeof r.yxse === 'undefined' ? r.effectiveTaxAmount : r.yxse;
                    if (typeof curYxse === 'undefined' || curYxse === '') {
                        if (typeof v === 'undefined') {
                            curYxse = r.taxAmount || r.totalTaxAmount;
                        } else {
                            curYxse = v;
                        }
                    }
                    return curYxse;
                }
            };
        }
    });
};

export const getBdkGxInvoiceCols = (page, pageSize, indexAlign = 'center') => {
    return dkGxInvoiceCols.filter((r) => {
        return r.dataIndex !== 'yxse';
    }).map((r) => {
        if (r.dataIndex === 'indexNumber') {
            return {
                ...r,
                align: indexAlign,
                render: (v, r, i) => {
                    return (i + 1) + (page - 1) * pageSize;
                }
            };
        } else {
            return r;
        }
    });
};


export const getCustomsDkGxInvoiceCols = (onChangeYxse, keys, page, pageSize, opt = {}) => {
    return customDkGxInvoiceCols.map((r) => {
        if (r.dataIndex === 'indexNumber') {
            return {
                ...r,
                align: 'left',
                render: (v, r, i) => {
                    return (i + 1) + (page - 1) * pageSize;
                }
            };
        } else if (r.dataIndex !== 'yxse') {
            return r;
        } else {
            return {
                ...r,
                render: (v, r) => {
                    let curYxse = typeof r.yxse === 'undefined' ? r.effectiveTaxAmount : r.yxse;
                    if (typeof curYxse === 'undefined' || curYxse === '') {
                        if (typeof v === 'undefined') {
                            curYxse = r.taxAmount || r.totalTaxAmount;
                        } else {
                            curYxse = v;
                        }
                    }
                    return curYxse;
                }
            };
        }
    });
};

export const getCustomsBdkGxInvoiceCols = (page, pageSize, indexAlign = 'center') => {
    return customDkGxInvoiceCols.filter((r) => {
        return r.dataIndex !== 'yxse';
    }).map((r) => {
        if (r.dataIndex === 'indexNumber') {
            return {
                ...r,
                align: indexAlign,
                render: (v, r, i) => {
                    return (i + 1) + (page - 1) * pageSize;
                }
            };
        } else {
            return r;
        }
    });
};

export const getDktjInvoiceCols = (page, pageSize, indexAlign = 'left') => {
    return dkGxInvoiceCols.map((r) => {
        if (r.dataIndex === 'yxse') {
            return {
                ...r,
                render: (v, r) => {
                    return v || r.effectiveTaxAmount;
                }
            };
        } else if (r.dataIndex === 'indexNumber') {
            return {
                ...r,
                align: indexAlign,
                render: (v, r, i) => {
                    return (i + 1) + (page - 1) * pageSize;
                }
            };
        } else {
            return r;
        }
    });
};

const fplxCt = {
    k1: '增值税抵扣勾选',
    k4: '增值税不抵扣勾选',
    k2: '退税勾选'
};

const getOperationTime = (v) => {
    const Dat = moment(v);
    return Dat.format('YYYY-MM-DD HH:mm:ss');
};

const getGxLx = (v) => {
    const val = Math.abs(v);
    return fplxCt['k' + val];
};

const gxLogColsArray = [
    { title: '序号', dataIndex: 'indexNumber', align: 'center', width: 80 },
    { title: '勾选类型', dataIndex: 'deductibleMode', align: 'left', width: 120, render: getGxLx },
    { title: '操作类型', dataIndex: 'deductibleMode', align: 'center', width: 120, render: (v) => { return v > 0 ? '勾选' : '撤销'; } },
    { title: '提交发票数量', dataIndex: 'num', align: 'left', width: 120 },
    { title: '税额', dataIndex: 'taxAmount', align: 'left', width: 120 },
    { title: '可抵扣税额', dataIndex: 'effectiveTaxAmount', align: 'left', width: 120 },
    { title: '所属税期', dataIndex: 'taxPeriod', align: 'center', width: 120, render: (v) => { return v || '--'; } },
    { title: '操作人', dataIndex: 'createName', align: 'center', width: 100, render: (v) => { return v || '--'; } },
    { title: '操作日期', dataIndex: 'createTime', align: 'center', width: 220, render: getOperationTime },
    { title: '成功数量', dataIndex: 'successNum', align: 'left', width: 120 },
    { title: '失败数量', dataIndex: 'failNum', align: 'left', width: 120 }
];

export const getGxLogCols = (page, pageSize) => {
    return gxLogColsArray.map((r) => {
        if (r.dataIndex === 'indexNumber') {
            return {
                ...r,
                align: 'left',
                render: (v, r, i) => {
                    return (i + 1) + (page - 1) * pageSize;
                }
            };
        } else {
            return r;
        }
    });
};
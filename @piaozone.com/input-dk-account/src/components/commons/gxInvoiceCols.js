import React from 'react';
import { Input } from 'antd';

export const render = function(v) {
    return v ? (
        <div>{v}</div>
    ) : '--';
};

export const renderInvoiceType = function(v) {
    v = parseInt(v);
    if (v === 4) {
        return '增值税专用发票';
    } else if (v === 15) {
        return '通行费电子发票';
    } else if (v === 12) {
        return '机动车销售发票';
    } else {
        return '--';
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

const dkGxInvoiceCols = [
    { title: '序号', dataIndex: 'indexNumber', align: 'center', width: 80 },
    { title: '发票类型', dataIndex: 'invoiceType', align: 'left', render: renderInvoiceType, width: 150 },
    { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', render, width: 120 },
    { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', render, width: 120 },
    { title: '开票日期', dataIndex: 'invoiceDate', align: 'left', render, width: 120 },
    { title: '销方名称', dataIndex: 'salerName', align: 'left', render, width: 300 },
    { title: '不含税金额', dataIndex: 'invoiceAmount', align: 'left', render, width: 120 },
    { title: '税额', dataIndex: 'taxAmount', align: 'left', render: (v, r) => v || r.totalTaxAmount || '', width: 100 },
    { title: '有效税额', dataIndex: 'yxse', align: 'left', render: renderInput, width: 100 },
    { title: '发票状态', dataIndex: 'invoiceStatus', align: 'left', render: renderInvocieStatus, width: 80 },
    { title: '是否勾选', dataIndex: 'checkFlag', align: 'left', render: renderGxFlag, width: 80 },
    { title: '勾选时间', dataIndex: 'selectTime', align: 'left', render, width: 160 },
    // { title: '是否勾选确认', dataIndex: 'checkAuthenticateFlag', align: 'left', render: renderGxConfirmFlag, width: 120 },
    // { title: '勾选认证时间', dataIndex: 'selectAuthenticateTime', align: 'left', render, width: 160 },
    { title: '管理状态', dataIndex: 'manageStatus', align: 'left', render: renderGlzt }
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
                    const id = r.invoiceCode + '-' + r.invoiceNo;
                    let curYxse = r.effectiveTaxAmount;
                    if (typeof curYxse === 'undefined' || curYxse === '') {
                        if (typeof v === 'undefined') {
                            curYxse = r.taxAmount || r.totalTaxAmount;
                        } else {
                            curYxse = v;
                        }
                    }

                    return (
                        <Input
                            disabled={keys.indexOf(id) === -1}
                            value={curYxse}
                            size='small'
                            onChange={(e) => onChangeYxse(e.target.value, r)}
                        />
                    );
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

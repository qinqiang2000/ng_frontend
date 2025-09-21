
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Upload } from 'antd';
import InvoiceInfoIcon from './invoiceInfoIcon';
import moment from 'moment';

export function AttachTable({ listData = [], remove, onShowEdit }) {
    const tableAttr = {
        rowKey: 'serialNo',
        dataSource: listData,
        pagination: false
    };

    const columns = [{
        title: '附件名称',
        dataIndex: 'attachmentName',
        key: 'attachmentName',
        width: 260,
        render: (v, r) => {
            return v || '--';
        }
    }, {
        title: '采集日期',
        dataIndex: 'gatherTime',
        key: 'gatherTime',
        render: (v, r) => {
            if (typeof v === 'number') {
                return moment(v).format('YYYY-MM-DD');
            }
            return v || '--';
        }
    }, {
        title: '备注信息',
        dataIndex: 'remark',
        key: 'remark',
        align: 'left',
        render: (v, r) => {
            return (
                <div style={{ maxWidth: 200 }}>{v || '--'}</div>
            );
        }
    }];

    if (typeof remove === 'function') {
        columns.push({
            title: '操作',
            align: 'left',
            key: 'operate',
            render: (v, r, i) => {
                if (typeof onShowEdit === 'function') {
                    return (
                        <div>
                            <a href='javascript:;' style={{ marginRight: 15 }} onClick={() => { onShowEdit(i, r); }}>编辑</a>
                            <img src={require('./media/img/delete.png')} onClick={() => remove(i, r)} />
                        </div>
                    );
                } else {
                    return <img src={require('./media/img/delete.png')} onClick={() => remove(i, r)} />;
                }
            }
        });
    }

    return (
        <Table {...tableAttr} columns={columns} />
    );
}

AttachTable.propTypes = {
    listData: PropTypes.array.isRequired,
    remove: PropTypes.func.isRequired,
    onShowEdit: PropTypes.func.isRequired
};

export function InvoiceTable(opt) {
    const {
        listData = [],
        loading,
        selectedRowKeys,
        rowKey = 'serialNo',
        onSelect,
        remove,
        showImage,
        checkInvoice,
        onShowEdit,
        onExpand,
        getUploadProps,
        ralationBillNo,
        noCurrentCompany
    } = opt;
    const expandedRowRender = (r, i) => {
        const expanedColumns = [
            { title: '附件名称', dataIndex: 'attachmentName', key: 'attachmentName' },
            { title: '采集日期', dataIndex: 'gatherTime', key: 'gatherTime' },
            { title: '备注信息', dataIndex: 'remark', key: 'remark', render: (v) => { return v || '--'; } },
            {
                title: '操作',
                dataIndex: 'operate',
                key: 'operate',
                render: (subV, subR, subI) => {
                    return (
                        <div>
                            <a href='javascript:;' onClick={() => onShowEdit(i, r, '3', subI)}>编辑</a>
                            <span style={{ margin: '0 3px' }}>|</span>
                            <a href='javascript'>删除</a>
                        </div>
                    );
                }
            }
        ];
        return <Table rowKey='serialNo' columns={expanedColumns} dataSource={r.attachList} pagination={false} />;
    };

    const tableAttr = {
        rowKey,
        dataSource: listData,
        loading: loading,
        pagination: false,
        onRow: (r) => {
            return {
                onDoubleClick: () => {
                    if (typeof showImage === 'function' && !r.errorFlag) {
                        var invoiceType = r.invoiceType || r.fplx;
                        var serialNo = r.serialNo || r.fid;
                        let tempUrl = r.pdfurl || '';
                        if (tempUrl === '' || tempUrl.indexOf('kdrive/user/file/public') !== -1) { //pdf用快照显示
                            tempUrl = r.snapshotUrl || r.snapshoturl || r.pdfurl;
                        } else {
                            tempUrl = r.pdfurl;
                        }

                        showImage([tempUrl], invoiceType, serialNo);
                    }
                }
            };
        },
        rowClassName: (r, i) => {
            var continuousNos = r.continuousNos || [];

            if (r.errorFlag) {
                return 'err';
            } else if (r.notEqualsName || r.notEqualsTaxNo || continuousNos.length > 0) {
                return 'invoiceTitleError';
            } else {
                return '';
            }
        }
    };

    if (typeof onSelect === 'function') {
        tableAttr.rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: onSelect
        };
    }

    if (typeof onExpand === 'function') {
        tableAttr.onExpand = onExpand;
        tableAttr.expandedRowRender = expandedRowRender;
    }

    const relationBill = {
        title: '关联单据',
        dataIndex: 'repeatExpense',
        className: 'relationBill',
        width: 260,
        key: 'repeatExpense',
        render: (v, r) => {
            return v || '--';
        }
    };

    const serailNoCol = {
        title: '序号',
        dataIndex: 'serialNo',
        className: 'relationBill',
        width: 80,
        key: 'serialNo',
        render: (v, r, index) => {
            return parseInt(index) + 1;
        }
    };

    const columns = [{
        title: '发票摘要',
        dataIndex: 'xhf_mc',
        className: 'fpzyInfo',
        key: 'xhf_mc',
        onHeaderCell: column => ({
            height: '28px',
            style: { height: 28 }
        }),
        render: (sallerName, r) => {
            const v = r.salerName || sallerName;
            let invoiceType = r.invoiceType || r.fplx;
            invoiceType = parseInt(invoiceType);
            if ([1, 2, 3, 4, 5, 7, 12, 13, 15, 23, 26, 27].indexOf(invoiceType) !== -1) {
                return (
                    <div>
                        <p>
                            <span>销方名称：</span>
                            <span>{v || ''}</span>
                        </p>
                        <p>
                            <span>发票号码：</span>
                            <span>{r.invoiceNo || r.fphm || ''}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 9 || invoiceType === 10) {
                const printNum = r.printingSequenceNo || r.printNum || '--';
                const stationGetOn = r.stationGetOn || r.placeOfDeparture || '--';
                const stationGetOff = r.stationGetOff || r.destination || '--';
                return (
                    <div>
                        <p>
                            <span>行程：</span>
                            <span>{stationGetOn}&nbsp;-&nbsp;{stationGetOff}</span>
                        </p>
                        <p>
                            <span>印刷序列号：</span>
                            <span>{printNum}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 16 || invoiceType === 20) {
                return (
                    <div>
                        <p>
                            <span>行程：</span>
                            <span>{r.stationGetOn || '--'}&nbsp;-&nbsp;{r.stationGetOff || '--'}</span>
                        </p>
                        <p>
                            <span>发票号码：</span>
                            <span>{r.invoiceNo || r.fphm || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 8 || invoiceType === 14) {
                return (
                    <div>
                        <p>
                            <span>所在地：</span>
                            <span>{r.place || '--'}</span>
                        </p>
                        <p>
                            <span>发票号码：</span>
                            <span>{r.invoiceNo || r.fphm || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 17) { // 过路过桥
                return (
                    <div>
                        <p>
                            <span>出口：</span>
                            <span>{r.exit || '--'}</span>
                        </p>
                        <p>
                            <span>发票号码：</span>
                            <span>{r.invoiceNo || r.fphm || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 19) { // 完税证明
                return (
                    <div>
                        <p>
                            <span>税务机关名称：</span>
                            <span>{r.taxAuthorityName || '--'}</span>
                        </p>
                        <p>
                            <span>完税证明号码：</span>
                            <span>{r.taxPaidProofNo || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 11) {
                return (
                    <div>
                        <p>
                            <span>备注：</span>
                            <span>{r.remark || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 21) {
                return (
                    <div>
                        <p>
                            <span>缴款书号码：</span>
                            <span>{r.customDeclarationNo || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 24) {
                return (
                    <div>
                        <p>
                            <span>收据号码：</span>
                            <span>{r.number || '--'}</span>
                        </p>
                    </div>
                );
            } else if (invoiceType === 25) {
                return (
                    <div>
                        <p>
                            <span>票据代码：</span>
                            <span>{r.invoiceCode || '--'}</span>
                        </p>
                        <p>
                            <span>票据号码：</span>
                            <span>{r.invoiceNo || '--'}</span>
                        </p>
                    </div>
                );
            } else {
                return (
                    <div>{v || '--'}</div>
                );
            }
        }
    }, {
        title: '价税合计',
        dataIndex: 'jshjje',
        key: 'jshjje',
        render: (v, r) => {
            const newValue = r.totalAmount || v || 0;
            if (r.errorFlag) {
                return '--';
            } else {
                return (
                    <span className='money'>{parseFloat(newValue).toFixed(2)}</span>
                );
            }
        }
    }, {
        title: '税额',
        dataIndex: 'se',
        key: 'se',
        render: (v, r) => {
            const newValue = r.totalTaxAmount || v || 0;
            if (r.errorFlag) {
                return '--';
            } else {
                return (
                    <span className='money'>{parseFloat(newValue).toFixed(2)}</span>
                );
            }
        }
    }, {
        title: '开票日期',
        dataIndex: 'kprq',
        key: 'kprq',
        render: (kprq = '', r) => {
            const v = r.invoiceDate || kprq;
            if (r.errorFlag || !v) {
                return v || '--';
            } else if (v.indexOf('-') === -1 && v.length === 8) {
                return moment(v, 'YYYYMMDD').format('YYYY-MM-DD');
            } else if (v.indexOf('-') !== -1 && v.length === 10) {
                return v;
            } else {
                return '--';
            }
        }
    }, {
        title: '发票信息',
        align: 'left',
        key: 'invoiceInfo',
        render: (v, r, i) => {
            var invoiceType = r.invoiceType || r.fplx;
            if (!r.errorFlag) {
                return (
                    <InvoiceInfoIcon
                        suspectedErrorData={r.suspectedErrorData}
                        buyerName={r.buyerName || r.ghf_mc}
                        buyerTaxNo={r.buyerTaxNo || r.ghf_tin}
                        isRevise={r.isRevise}
                        bx={r.expendStatus || r.bx}
                        checkStatus={r.checkStatus || r.cyjg || r.fcyjg}
                        invoiceStatus={r.invoiceStatus}
                        fplx={invoiceType}
                        isExist={r.isExist}
                        size='small'
                        notEqualsTaxNo={r.notEqualsTaxNo}
                        notEqualsName={r.notEqualsName}
                        warningCode={r.warningCode}
                        index={i}
                        info={r}
                    />
                );
            } else {
                return r.description;
            }
        }
    }];

    if (ralationBillNo) { //关联单据号
        columns.push(relationBill);
    }

    if (noCurrentCompany) {
        columns.unshift(serailNoCol);
    }

    const uploadAttatchBtn = (v, r) => {
        if (typeof getUploadProps === 'function') {
            return (
                <span style={{ position: 'relative', cursor: 'pointer' }}>
                    {
                        r.attachSerialNoList && r.attachSerialNoList.length > 0 ? (
                            <span
                                className='num'
                                style={{
                                    position: 'absolute',
                                    top: -12,
                                    right: -4,
                                    fontSize: 12,
                                    borderRadius: 4,
                                    padding: '0 1px',
                                    background: '#3598ff',
                                    color: '#fff',
                                    minWidth: 12
                                }}
                            >
                                {r.attachSerialNoList.length}
                            </span>
                        ) : null
                    }
                    <Upload {...getUploadProps(r)} className='tableUploadBtn'>
                        <a href='javascript:;' style={{ position: 'relative' }}>上传附件</a>
                    </Upload>
                </span>
            );
        } else {
            return null;
        }
    };

    const cuteSpan = () => {
        return (
            <span style={{ fontSize: 12, color: '#ccc', margin: '0 5px', verticalAlign: '1px' }}>|</span>
        );
    };

    if (typeof remove === 'function') {
        columns[columns.length - 1].align = 'left';
        columns.push({
            title: '操作',
            align: 'center',
            width: 180,
            key: 'operate',
            render: (v, r, i) => {
                const invoiceType = r.invoiceType || r.fplx;
                if (typeof onShowEdit === 'function') {
                    const checkStatus = r.checkStatus || r.cyjg || r.fcyjg;
                    let text = '编辑';
                    if ([1, 2, 3, 4, 5, 12, 13, 15, 26, 27].indexOf(parseInt(invoiceType)) != -1 && checkStatus == 1) {
                        text = '查看';
                    }
                    return (
                        <>
                            <span
                                style={{ display: 'inline-block', color: '#3598ff', cursor: 'pointer', position: 'relative', zIndex: 100 }}
                                onClick={() => onShowEdit(i, r)}
                            >
                                {text}
                            </span>
                            {cuteSpan()}
                            {uploadAttatchBtn(v, r)}
                            {cuteSpan()}
                            <img src={require('./media/img/delete.png')} onClick={() => remove(i, r)} className='deleteIcon' />
                        </>
                    );
                } else if ([1, 2, 3, 4, 5, 12, 13, 15, 26 ,27].indexOf(parseInt(r.fplx)) != -1 && r.cyjg != 1) {
                    return (
                        <>
                            <span style={{ display: 'inline-block', color: '#3598ff', cursor: 'pointer' }} onClick={() => checkInvoice(i, r)}>查验</span>
                            {cuteSpan()}
                            {uploadAttatchBtn(v, r)}
                            {cuteSpan()}
                            <img src={require('./media/img/delete.png')} onClick={() => remove(i, r)} className='deleteIcon' />
                        </>
                    );
                } else {
                    return (
                        <img src={require('./media/img/delete.png')} onClick={() => remove(i, r)} className='deleteIcon' />
                    );
                }
            }
        });
    }

    return (
        <Table {...tableAttr} columns={columns} />
    );
}
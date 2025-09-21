import React from 'react';
import PropTypes from 'prop-types';
import InvoiceTabs from '../invoicesTabs';
import { collectColumsDict } from './invoiceCols';
import { Table, Tooltip } from 'antd';


function ShowCollectResult(props) {
    const {
        listData = [],
        changeInvoiceTab,
        onShowEditDialog,
        onDeleteInvoice,
        INPUT_INVOICE_TYPES,
        rowSelection,
        loading = false,
        rowKey = 'recognitionSerialNo',
        userSource
    } = props;
    const invoiceTabsData = {};
    const addedInvoiceTypes = INPUT_INVOICE_TYPES.filter((item) => {
        return item.isAddedTax;
    }).map((item) => {
        return item.value;
    });

    let activeInvoiceType = props.activeInvoiceType;

    for (let i = 0; i < listData.length; i++) {
        const item = listData[i];
        const invoiceType = parseInt(item.invoiceType); //no 2：电子发票专票 6：no 12：机动车发票 13：二手车发票 17：过路桥费

        let num = 1;
        if (invoiceTabsData['k' + invoiceType] && invoiceTabsData['k' + invoiceType].num > 0) {
            num = invoiceTabsData['k' + invoiceType].num + 1;
        }

        invoiceTabsData['k' + invoiceType] = { num: num };
    }

    const tabKeys = Object.keys(invoiceTabsData);
    if (!activeInvoiceType) {
        activeInvoiceType = tabKeys[0];
    }

    const activeData = listData.filter((item) => {
        return 'k' + item.invoiceType === activeInvoiceType;
    });

    const operateCol = {
        title: '操作',
        align: 'center',
        fixed: 'right',
        width: 100,
        render: (v, r, i) => {
            let allowEdit = false;
            let description = '';
            if (addedInvoiceTypes.indexOf(parseInt(r.invoiceType)) !== -1) {
                if (r.checkStatus !== 2) {
                    allowEdit = true;
                } else {
                    description = '已查验的发票不允许编辑';
                }
            } else if (r.delete !== 2 && !r.isRepeat) { // 没有废弃, 且在台账中不存在则允许编辑
                allowEdit = true;
            } else {
                if (r.delete === 2) {
                    description = '已废弃的发票不允许编辑';
                } else if (r.isRepeat) {
                    description = '已存在的发票不允许编辑';
                }
            }

            return (
                <div className='operate'>
                    {
                        allowEdit ? (
                            <a key='edit' href='javascript:;' onClick={() => { onShowEditDialog(r, i); }}>编辑</a>
                        ) : description ? (
                            <Tooltip title={description}>
                                <a href='javascript:;' onClick={() => { onShowEditDialog(r, i, true); }}>查看</a>
                            </Tooltip>
                        ) : (
                            <a href='javascript:;' onClick={() => { onShowEditDialog(r, i, true); }}>查看</a>
                        )
                    }
                    <span className='cute' style={{ margin: '0 7px', color: '#eee' }}>|</span>
                    <a href='javascript:;' onClick={() => onDeleteInvoice(r)}>删除</a>
                </div>
            );
        }
    };

    let scrollWidth = 1750;
    if (['k1', 'k3', 'k4', 'k5', 'k12', 'k13', 'k15', 'k26', 'k27'].indexOf(activeInvoiceType) !== -1) {
        scrollWidth = 2215;
    } else if (activeInvoiceType == 'k10') {
        scrollWidth = 2100;
    }
    let tableColumns = collectColumsDict[activeInvoiceType] ? collectColumsDict[activeInvoiceType].concat(operateCol) : [];
    if (userSource && userSource == 8) {
        const filterField = [ //epson过滤字段
            'deductionPurpose',
            'rz',
            'selectAuthenticateTime',
            'taxPeriod',
            'isExpenseCorrelation',
            'expendTime',
            'isEntryVoucher',
            'accountDate',
            'vouchInfo',
            'canBeDeduction',
            'entryAmount',
            'outputAmount',
            'outputReason'
        ];
        tableColumns = tableColumns.filter((item) => {
            return filterField.indexOf(item.dataIndex) == '-1';
        });
    }
    const tableProps = {
        key: 'table',
        loading,
        scroll: { x: scrollWidth },
        columns: tableColumns,
        dataSource: activeData,
        pagination: false,
        rowKey,
        rowClassName: (r) => {
            if (addedInvoiceTypes.indexOf(parseInt(r.invoiceType)) != -1) {
                if (r.checkStatus != 2) {
                    return 'redColor';
                }
            } else {
                if (!r.serialNo) {
                    return 'redColor';
                }
            }
        }
    };
    if (rowSelection) {
        tableProps.rowSelection = rowSelection;
    }

    return (
        [
            activeInvoiceType ? (
                <InvoiceTabs
                    key='tab'
                    tabInfo={invoiceTabsData}
                    onChange={changeInvoiceTab}
                    activeInvoiceType={activeInvoiceType}
                    INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                />
            ) : null,
            (
                <Table {...tableProps} key='table' />
            )
        ]
    );
}

ShowCollectResult.propTypes = {
    listData: PropTypes.array.isRequired,
    activeInvoiceType: PropTypes.string.isRequired,
    changeInvoiceTab: PropTypes.func.isRequired,
    onShowEditDialog: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    INPUT_INVOICE_TYPES: PropTypes.array,
    rowSelection: PropTypes.object,
    loading: PropTypes.bool,
    rowKey: PropTypes.string,
    userSource: PropTypes.number
};

export default ShowCollectResult;
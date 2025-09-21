import React from 'react';
import PropTypes from 'prop-types';
import InvoiceTabs from '../invoicesTabs';
import { waitCollectColumsDict } from './invoiceCols';
import { Table, Tooltip, Button } from 'antd';
const icon_invoice = require('../commons/img/icon_invoice.png');

function ShowWaitCollectResult(props) { //待上传列表
    const {
        listData = [],
        changeInvoiceTab,
        onShowEditDialog,
        onDeleteInvoice,
        INPUT_INVOICE_TYPES,
        loading = false
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
        const { isRepeat, verifyResult, serialNo } = item; //重复报销，合规性校验
        let num = 1;
        if (invoiceTabsData['k' + invoiceType] && invoiceTabsData['k' + invoiceType].num > 0) {
            num = invoiceTabsData['k' + invoiceType].num + 1;
        }
        let controlLevel = '1'; //管控级别 1：不控制 0：严格管控 2:警告
        if (isRepeat) {
            controlLevel = '0';
        } else {
            if (serialNo) {
                if (verifyResult && verifyResult.length > 0) {
                    const config = [];
                    for (let j = 0; j < verifyResult.length; j++) {
                        config.push(verifyResult[j].config);
                    }
                    if (config.indexOf('0') != '-1') {
                        controlLevel = '0';
                    } else if (config.indexOf('2') != '-1' || config.indexOf('3') != '-1') {
                        controlLevel = '2';
                    } else {
                        controlLevel = '1';
                    }
                }
            } else {
                controlLevel = '0';
            }
        }

        invoiceTabsData['k' + invoiceType] = { num, controlLevel };
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
            if (addedInvoiceTypes.indexOf(parseInt(r.invoiceType)) !== -1 || r.invoiceType == 28 || r.invoiceType == 29) {
                if (r.checkStatus !== 2) {
                    allowEdit = true;
                } else {
                    description = '已查验的发票不允许编辑';
                }
            } else if (!r.isRepeat) { // 没有废弃, 且在台账中不存在则允许编辑
                allowEdit = true;
            } else {
                if (r.isRepeat) {
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
    if (['k1', 'k3', 'k4', 'k5', 'k12', 'k13', 'k15', 'k26', 'k27', 'k28', 'k29'].indexOf(activeInvoiceType) !== -1) {
        scrollWidth = 2215;
    }
    let tableColumns = waitCollectColumsDict[activeInvoiceType] ? waitCollectColumsDict[activeInvoiceType].concat(operateCol) : [];
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
    const tableProps = {
        loading,
        scroll: { x: scrollWidth },
        columns: tableColumns,
        dataSource: activeData,
        pagination: false,
        rowKey: 'recognitionSerialNo',
        rowClassName: (r) => {
            if (!r.serialNo) {
                return 'err';
            } else {
                return '';
            }
        }
    };
    let invoiceCount = 0;
    if (activeInvoiceType) {
        if (invoiceTabsData[activeInvoiceType]) {
            invoiceCount = invoiceTabsData[activeInvoiceType].num;
        }
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
                    configInvoice={true}
                />
            ) : null,
            (
                <>
                    {
                        activeData.length > 0 ? (
                            <Table {...tableProps} key='table' />
                        ) : (
                            <Table key='table' />
                        )
                    }
                    {
                        listData.length > 0 ? (
                            <div className='btnInfo'>
                                <label>
                                    <img className='invoiceImg' src={icon_invoice} alt='' />发票数
                                    <span style={{ color: '#ff9524', padding: '0 5px' }}>
                                        {invoiceCount}
                                    </span>张
                                </label>
                                <Button
                                    type='primary'
                                    className='upload'
                                    onClick={() => { props.onInsertData(); }}
                                    disabled={listData.length == 0}
                                    style={{ marginRight: 16, float: 'right', marginTop: 6 }}
                                >确认上传
                                </Button>
                            </div>
                        ) : null
                    }
                </>
            )
            
        ]
    );
}

ShowWaitCollectResult.propTypes = {
    listData: PropTypes.array.isRequired,
    activeInvoiceType: PropTypes.string.isRequired,
    changeInvoiceTab: PropTypes.func.isRequired,
    onShowEditDialog: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    INPUT_INVOICE_TYPES: PropTypes.array,
    loading: PropTypes.bool,
    onInsertData: PropTypes.func.isRequired
};

export default ShowWaitCollectResult;
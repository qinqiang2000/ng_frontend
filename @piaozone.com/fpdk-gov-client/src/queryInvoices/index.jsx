import React from 'react';
import ScanInvoices from '@piaozone.com/scan-invoices';
import AccountSearch from './accountSearch';
import { INPUT_INVOICE_TYPES } from '../commons/constants';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import { columsDictFun } from '../collectInvoices/invoiceCols';
import PrintImg from '@piaozone.com/print-image';
import { Table, message, Modal } from 'antd';
import { kdRequest } from '@piaozone.com/utils';
import PropTypes from 'prop-types';
import './style.less';
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;

class QueryInvoices extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            loginInfo: {},
            curEditInfo: {},
            disabledEdit: false,
            listData: []
        };
    }

    componentDidMount = () => {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onShowEditDialog = (r, i, disabledEdit) => {
        this.onCheckTimes(r, disabledEdit);
    }

    onCheckTimes = async(r, disabledEdit) => {
        const { invoiceType, invoiceCode, invoiceNo } = r;
        let checkCount = null;
        let lastCheckTime = null;
        if (addedInvoiceTypes.indexOf(invoiceType) != -1) {
            if (typeof this.props.onChecklo === 'function') {
                const res = await this.props.onChecklo({
                    invoiceType,
                    invoiceCode,
                    invoiceNo
                });
                if (res.errcode == '0000') {
                    if (res.data) {
                        checkCount = res.data.checkCount || 0;
                        lastCheckTime = res.data.lastCheckTime || '';
                    }
                }
                this.setState({
                    curEditInfo: r,
                    disabledEdit: !!disabledEdit,
                    checkCount,
                    lastCheckTime
                });
                return;
            }
        }

        this.setState({
            curEditInfo: r,
            disabledEdit: !!disabledEdit,
            checkCount: null,
            lastCheckTime: null
        });
    }

    freshList = async(opt) => {
        if (!this._isMounted) {
            return false;
        }
        this.setState({
            loading: true
        });
        const res = await this.props.onGetSingleInvoice(opt);
        this.setState({
            loading: false
        });
        const resData = res.data || [];
        if (resData.length == 0) {
            message.info('未查询到该发票数据！');
            this.setState({
                listData: []
            });
            return;
        }
        if (res.errcode === '0000') {
            this.setState({
                listData: resData,
                activeInvoiceType: opt.invoiceType
            });
            this.checkShrSource(res.data);
        } else {
            message.info(res.description);
        }
    }

    checkShrSource = async(data) => {
        const fids = [];
        for (const item of data) {
            fids.push(item.serialNo);
        }
        const res = await kdRequest({
            url: this.props.shrSourceUrl,
            timeout: 60000,
            data: {
                serialNos: fids.join(',')
            },
            method: 'POST'
        });
        if (res.errcode == '0000') {
            const { listData } = this.state; //接口获取的数据；
            const list = res.data;
            const newList = listData.map((item) => {
                const currentSerialNo = item.serialNo;
                for (const itm of list) {
                    if (currentSerialNo == itm.serialNo) {
                        item.shrSource = itm.shrSource;
                    }
                }
                return item;
            });
            this.setState({
                listData: newList,
                shrSlogan: true
            });
        }
    }

    onSearch = (opt) => {
        if (opt.invoiceDate) {
            opt = {
                ...opt,
                invoiceDate: opt.invoiceDate.format('YYYY-MM-DD')
            };
        }
        this.freshList(opt);
    }

    printEnd = () => {
        this.setState({
            printImgs: [],
            selectedAllKeys: {},
            selectedAllRows: {},
            isPrintLoading: false
        });
        this.allTabKeys = [];
    }

    onPrintInvoice = (type) => {
        this.setState({ printImgs: type });
    }

    render() {
        const {
            listData,
            activeInvoiceType,
            loading,
            curEditInfo,
            disabledEdit,
            printImgs = []
        } = this.state;
        const operateCol = {
            title: '操作',
            align: 'center',
            fixed: 'right',
            width: 140,
            render: (v, r, i) => {
                return (
                    <a href='javascript:;' onClick={() => { this.onShowEditDialog(r, i, true); }}>查看</a>
                );
            }
        };
        let scrollWidth = 1780;
        const activeInvoiceTypeKey = 'k' + activeInvoiceType;
        if (['k14', 'k11', 'k17', 'k8', 'k9'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1500;
        } else if (['k4'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2200;
        } else if (['k1', 'k2', 'k3', 'k5', 'k12', 'k13', 'k15', 'k26', 'k27'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2380;
        } else if (['k10', 'k21'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2580;
        } else if (['k7', 'k16', 'k17', 'k20'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1780;
        }

        let tableColumns = [];
        if (listData.length > 0 && columsDictFun(activeInvoiceTypeKey, this.state.loginInfo)) {
            tableColumns = columsDictFun(activeInvoiceTypeKey, this.state.loginInfo).concat(operateCol);
            const shrSource = {
                title: '审核人-来源',
                dataIndex: 'shrSource',
                align: 'left',
                width: 200,
                render: (v = []) => {
                    const result = v.join(', ');
                    return (
                        <span style={{ textAlign: 'left' }}>{result || '--'}</span>
                    );
                }
            };
            const { shrSlogan } = this.state;
            if (shrSlogan) {
                scrollWidth = scrollWidth + 200;
                const len = tableColumns.length;
                tableColumns.splice(len - 2, 0, shrSource);
            }
        }

        const tableProps = {
            key: 'table',
            loading,
            scroll: { x: scrollWidth },
            columns: tableColumns,
            dataSource: listData,
            pagination: false,
            rowKey: 'serialNo'
        };
        return (
            <div className='accountManage'>
                <AccountSearch onSearch={this.onSearch} />
                <div style={{ padding: 15 }}>
                    <Table {...tableProps} />
                </div>
                <Modal
                    visible={!!curEditInfo.serialNo}
                    title={false}
                    onCancel={() => this.setState({ curEditInfo: {} })}
                    width={1000}
                    footer={null}
                    bodyStyle={{ padding: 12 }}
                    destroyOnClose={true}
                >
                    <ScanInvoices
                        width={1000}
                        height={700}
                        disabledEdit={disabledEdit}
                        billData={curEditInfo}
                        onOk={this.onConfirmEdit}
                        checkCount={this.state.checkCount}
                        lastCheckTime={this.state.lastCheckTime}
                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                        onShowLedgerdata={this.props.onShowLedgerdata}
                        onPrintInvoice={this.onPrintInvoice}
                        AccountManageState={true}
                    />
                </Modal>
                <PrintImg
                    printData={printImgs}
                    printEnd={this.printEnd}
                />
            </div>
        );
    }
}

QueryInvoices.propTypes = {
    loginInfo: PropTypes.object,
    shrSourceUrl: PropTypes.string,
    onGetSingleInvoice: PropTypes.func,
    onShowLedgerdata: PropTypes.func.isRequired,
    onChecklo: PropTypes.func
};

export default QueryInvoices;
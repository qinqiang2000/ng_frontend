import React from 'react';
import { Button, Table, message, Pagination, Modal } from 'antd';
import GxInvoicesSearch from './gxInvoicesSearch';
import PropTypes from 'prop-types';
import { getBdkGxInvoiceCols, entryVoucherCols, preSelectCols } from '../commons/gxInvoiceCols';
import { kdRequest } from '@piaozone.com/utils';
import { confirm, modalSuccess, modalError } from '../commons/antdModal';
import { selectInvoices } from '../commons/selectInvoices';
import { initSearchOpt, getSearchOpt } from './searchTools';

class DkgxInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            searchOpt: {
                ...initSearchOpt
            },
            listData: [],
            showLoginDialog: false,
            dataIndex: 0,
            selectedRows: [],
            totalNum: 0,
            pageSize: 15,
            loading: false
        };
    }

    componentDidMount() {
        this.onSearch();
    }

    onReset = () => {
        this.setState({
            searchOpt: {
                ...initSearchOpt
            }
        });
    }

    onSearch = () => {
        this.searchOpt = getSearchOpt(this.state.searchOpt);
        this.fetchList(1, this.state.pageSize);
    }

    changeOpt = (name, value) => {
        const newOpt = {
            ...this.state.searchOpt,
            [name]: value
        };
        if (name === 'isEntryVoucher' && value === '0') {
            newOpt.accountDate = null;
        }
        this.setState({
            searchOpt: newOpt
        });
    }

    getGxInvoicesOpt(rows, zt) {
        const fpdms = [];
        const fphms = [];
        const kprqs = [];
        const ses = [];
        let description = '';
        let totalAmount = 0.00;
        let totalTaxAmount = 0.00;
        const serialNos = [];
        for (let i = 0; i < rows.length; i++) {
            const curData = rows[i];
            const curInvoiceAmount = parseFloat(curData.invoiceAmount);
            const curSe = parseFloat(curData.taxAmount || curData.totalTaxAmount);

            if (isNaN(curInvoiceAmount) || isNaN(curSe)) {
                description = '数据有误';
                break;
            } else {
                totalAmount += curInvoiceAmount;
                totalTaxAmount += curSe;
            }

            if (zt === 0 || zt === 1) {
                fpdms.push(curData.invoiceCode);
                fphms.push(curData.invoiceNo);
                kprqs.push(curData.invoiceDate);
                ses.push(curSe);
                serialNos.push(curData.serialNo);
            }
        };

        if (!description) {
            return {
                errcode: '0000',
                data: {
                    fpdm: fpdms.join('='),
                    fphm: fphms.join('='),
                    kprq: kprqs.join('='),
                    se: ses.join('='),
                    zt,
                    serialNos
                },
                totalAmount: totalAmount.toFixed(2),
                totalTaxAmount: totalTaxAmount.toFixed(2)
            };
        } else {
            return {
                errcode: 'argsErr',
                description
            };
        }
    }

    gxInvoices = async() => {
        const fpdkType = this.props.fpdkType || 1;
        if ((!this.props.govOperate.passwd || !this.props.loginGovInfo) && fpdkType === 1) {
            this.props.showLogin();
            return;
        }

        const list = this.state.selectedRows;
        const info = this.getGxInvoicesOpt(list, 1);
        if (info.errcode !== '0000') {
            message.info(info.description);
        }

        confirm({
            title: '确认进行不抵扣勾选操作？',
            content: '发票数量: ' + list.length + ', 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount,
            onOk: async() => {
                message.loading('不抵扣勾选中...', 0);
                let url = this.props.bdkgxUrl;
                if (this.props.access_token) {
                    url += '?access_token=' + this.props.access_token;
                }
                const res = await this.props.govOperate.bdkGxInvoices(url, info.data);
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === '0000') {
                    modalSuccess({
                        title: '不抵扣勾选成功',
                        content: res.description
                    });
                    this.fetchList(1);
                } else {
                    modalError({
                        title: '不抵扣勾选出错',
                        content: res.description
                    });
                }
            }
        });
    }

    qxGxInvoices = async() => {
        const fpdkType = this.props.fpdkType || 1;
        if ((!this.props.govOperate.passwd || !this.props.loginGovInfo) && fpdkType === 1) {
            this.props.showLogin();
            return;
        }

        const selectedRows = this.state.selectedRows;
        const info = this.getGxInvoicesOpt(selectedRows, 0);
        if (info.errcode !== '0000') {
            message.info(info.description);
        }

        confirm({
            title: '确认进行不抵扣取消勾选操作？',
            content: '发票数量: ' + selectedRows.length + ', 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount,
            onOk: async() => {
                message.loading('不抵扣取消勾选中...', 0);
                let url = this.props.bdkgxUrl;
                if (this.props.access_token) {
                    url += '?access_token=' + this.props.access_token;
                }
                const res = await this.props.govOperate.bdkGxInvoices(url, info.data);
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === '0000') {
                    modalSuccess({
                        title: '不抵扣取消勾选成功',
                        content: res.description
                    });
                    this.fetchList(1);
                } else {
                    modalError({
                        title: '不抵扣取消勾选出错',
                        content: res.description
                    });
                }
            }
        });
    }

    async fetchList(c, size = this.state.pageSize, disabledClear) {
        this.setState({
            loading: true
        });

        const requestData = {
            ...this.searchOpt,
            deductionPurpose: this.searchOpt.gxzt === '0' ? '' : '2', //1抵扣，2不抵扣
            pageSize: size,
            page: c
        };

        let url = this.props.dkgxSearchUrl;
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }

        const res = await kdRequest({
            url,
            timeout: 60000,
            data: requestData,
            method: 'POST'
        });

        if (res.errcode === '0000') {
            this.setState({
                dataIndex: (c - 1) * size,
                pageSize: size,
                loading: false,
                listData: res.data,
                totalNum: res.totalElement,
                selectedRows: disabledClear ? this.state.selectedRows : []
            });
        } else {
            this.setState({
                loading: false
            });

            message.info(res.description);
        }
    }

    onSelect = (k, rows) => {
        const { listData = [], selectedRows = [] } = this.state;
        this.setState({
            selectedRows: selectInvoices(rows, selectedRows, listData)
        });
    }

    render() {
        const { listData, selectedRows, totalNum, pageSize, dataIndex, loading, searchOpt } = this.state;
        const { gxrqfw = '', skssq = '' } = this.props.loginGovInfo || {};
        const disabled = selectedRows.length === 0;
        const { clientType, isEntryVoucher } = this.props;
        const selectedRowKeys = selectedRows.map((r) => {
            return r.invoiceCode + '-' + r.invoiceNo;
        });
        const page = parseInt(dataIndex / pageSize) + 1;
        const bdkgxCols = getBdkGxInvoiceCols(page, pageSize, 'left');
        let scollX = 1860;
        bdkgxCols.splice(-3, 0, ...preSelectCols);
        if (isEntryVoucher === 1) {
            bdkgxCols.splice(-1, 0, ...entryVoucherCols);
            scollX += 280;
        }
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: this.onSelect,
            getCheckboxProps: (r) => {
                const invoiceStatus = r.invoiceStatus;
                const disabledGx = r.disabledGx;
                let flag = true;
                if (typeof invoiceStatus === 'undefined' || invoiceStatus === '' || disabledGx) {
                    flag = true;
                } else if (parseInt(invoiceStatus) === 0) {
                    flag = false;
                }

                return {
                    disabled: flag
                };
            }
        };



        const { totalAmount = 0.00, totalTaxAmount = 0.00 } = this.getGxInvoicesOpt(selectedRows, -1);

        return (
            <div className='dkgxInvoices clearfix'>
                <GxInvoicesSearch
                    changeOpt={this.changeOpt}
                    searchOpt={searchOpt}
                    onSearch={this.onSearch}
                    onReset={this.onReset}
                    gxrqfw={gxrqfw}
                    skssq={skssq || this.props.skssq}
                    clientType={clientType}
                    isEntryVoucher={isEntryVoucher}
                />
                <div className='optBtns'>
                    <Button type='primary' style={{ marginRight: 20 }} disabled={disabled} onClick={this.gxInvoices}>勾选发票</Button>
                    <Button type='primary' disabled={disabled} onClick={this.qxGxInvoices}>撤销勾选</Button>
                </div>
                <Table
                    rowSelection={rowSelection}
                    rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                    dataSource={listData}
                    columns={bdkgxCols}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                    tableLayout='fixed'
                    scroll={{ x: scollX, y: 500 }}
                />

                <div className='tjInfo'>
                    <span>已选<span className='num'>{selectedRows.length}</span>条数据，</span>
                    <span>已选不含税金额<span className='num'>￥{totalAmount}</span></span>，
                    <span>已选税额<span className='num'>￥{totalTaxAmount}</span></span>，
                    <span>总共<span className='num'>{totalNum}</span>条数据</span>
                </div>

                <Pagination
                    size='small'
                    current={page}
                    total={totalNum}
                    showSizeChanger
                    showQuickJumper
                    className='floatRight'
                    pageSize={pageSize}
                    pageSizeOptions={['15', '20', '50']}
                    onShowSizeChange={(c, size) => this.fetchList(c, size, true)}
                    onChange={(c, size) => this.fetchList(c, size, true)}
                />
            </div>
        );
    }
}


DkgxInvoices.propTypes = {
    govOperate: PropTypes.object.isRequired,
    showLogin: PropTypes.func.isRequired,
    loginGovInfo: PropTypes.object,
    bdkgxUrl: PropTypes.string.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired,
    access_token: PropTypes.string,
    fpdkType: PropTypes.number,
    clientType: PropTypes.number,
    skssq: PropTypes.string,
    isEntryVoucher: PropTypes.string
};

export default DkgxInvoices;
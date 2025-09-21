import React from 'react';
import { Button, Table, message, Pagination, Modal } from 'antd';
import GxInvoicesSearch from './gxInvoicesSearch';
import PropTypes from 'prop-types';
import { getDkGxInvoiceCols, entryVoucherCols, preSelectCols } from '../commons/gxInvoiceCols';
import { kdRequest, tools } from '@piaozone.com/utils';
import { confirm, modalSuccess, modalError } from '../commons/antdModal';
import { selectInvoices } from '../commons/selectInvoices';
import GxDetailList from './gxDetailList';
import { initSearchOpt, getSearchOpt, changeSearchOpt, entryDateFun } from './searchTools';

class DkgxInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            searchOpt: {
                ...initSearchOpt
            },
            listData: [],
            dataIndex: 0,
            selectedRows: [],
            totalNum: 0,
            pageSize: 15,
            loading: false,
            dkgxErrList: [],
            showGxDetailList: false
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
        const yxses = [];
        const ses = [];
        const serialNos = [];
        let description = '';
        let totalAmount = 0.00;
        let totalTaxAmount = 0.00;
        let totalYxTaxAmount = 0.00;

        for (let i = 0; i < rows.length; i++) {
            const curData = rows[i];
            const curInvoiceAmount = parseFloat(curData.invoiceAmount);
            const taxAmount = curData.taxAmount || curData.totalTaxAmount;
            const curSe = parseFloat(taxAmount);
            let yxse = curData.yxse;
            if (zt === 1 && !yxse) {
                description = '有效税额输入有误，请检查！';
                yxse = curSe;
            }

            if (isNaN(curInvoiceAmount) || isNaN(yxse) || isNaN(curSe)) {
                description = '数据有误';
                break;
            } else {
                totalAmount += curInvoiceAmount;
                totalTaxAmount += curSe;
                totalYxTaxAmount += parseFloat(yxse);
            }

            if (zt === 1) {
                if (isNaN(yxse)) {
                    description = '有效税额输入有误，请检查！';
                    break;
                } else if (curSe < yxse) {
                    description = '有效税额不能大于税额，请检查！';
                    break;
                }
            }
            if (zt === 0 || zt === 1) {
                ses.push(taxAmount);
                fpdms.push(curData.invoiceCode);
                fphms.push(curData.invoiceNo);
                kprqs.push(curData.invoiceDate);
                yxses.push(yxse);
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
                    yxse: yxses.join('='),
                    se: ses.join('='),
                    zt,
                    serialNos
                },
                totalAmount: totalAmount.toFixed(2),
                totalTaxAmount: totalTaxAmount.toFixed(2),
                totalYxTaxAmount: totalYxTaxAmount.toFixed(2)
            };
        } else {
            return {
                errcode: 'argsErr',
                description
            };
        }
    }

    gxInvoices = async() => {
        const selectedRows = this.state.selectedRows;
        const info = this.getGxInvoicesOpt(selectedRows, 1);
        if (info.errcode !== '0000') {
            message.info(info.description);
            return;
        }
        const fpdkType = this.props.fpdkType || 1;
        if ((!this.props.govOperate.passwd || !this.props.loginGovInfo) && fpdkType === 1) {
            this.props.showLogin();
            return;
        }

        confirm({
            title: '确认进行抵扣勾选操作？',
            content: '发票数量: ' + selectedRows.length + '份, 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
            onOk: async() => {
                message.loading('抵扣勾选中...', 0);
                let url = this.props.dkgxUrl;
                if (this.props.access_token) {
                    url += '?access_token=' + this.props.access_token;
                }

                const res = await this.props.govOperate.gxInvoices(url, info.data);
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === '0000') {
                    const resData = res.data || {};
                    const successList = resData.success || [];
                    const failList = resData.success || [];
                    // 完全勾选成功
                    if (selectedRows.length === successList.length) {
                        modalSuccess({
                            title: '抵扣勾选成功',
                            content: res.description
                        });
                        this.fetchList(1);
                        return;
                    }
                    this.fetchList(1);
                    const failIndexs = failList.map((item) => {
                        return item.invoiceCode + '=' + item.invoiceNo;
                    });
                    const gxErrList = [];
                    for (let i = 0; i < selectedRows.length; i++) {
                        const curItem = selectedRows[i];
                        const k = curItem.invoiceCode + '=' + curItem.invoiceNo;
                        const index = failIndexs.indexOf(k);
                        if (index !== -1) {
                            gxErrList.push({
                                ...curItem,
                                selectResult: failList[index].selectResult,
                                selectDate: failList[index].selectDate,
                                taxPeriod: failList[index].taxPeriod
                            });
                        }
                    }
                    this.setState({
                        showDkgxErrList: true,
                        dkgxErrList: gxErrList,
                        dkgxSuccessList: successList
                    });
                } else {
                    modalError({
                        title: '抵扣勾选出错',
                        content: res.description
                    });
                }
            }
        });
    }

    qxGxInvoices = async() => {
        const selectedRows = this.state.selectedRows;
        const info = this.getGxInvoicesOpt(selectedRows, 0);
        if (info.errcode !== '0000') {
            message.info(info.description);
            return;
        }

        const fpdkType = this.props.fpdkType || 1;

        if ((!this.props.govOperate.passwd || !this.props.loginGovInfo) && fpdkType === 1) {
            this.props.showLogin();
            return;
        }

        confirm({
            title: '确认进行抵扣取消勾选操作？',
            content: '发票数量: ' + selectedRows.length + ', 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
            onOk: async() => {
                message.loading('抵扣取消勾选中...', 0);
                let url = this.props.dkgxUrl;
                if (this.props.access_token) {
                    url += '?access_token=' + this.props.access_token;
                }
                const res = await this.props.govOperate.gxInvoices(url, info.data);

                message.destroy();
                Modal.destroyAll();
                if (res.errcode === '0000') {
                    modalSuccess({
                        title: '抵扣取消勾选成功',
                        content: res.description
                    });
                    this.fetchList(1);
                } else {
                    modalError({
                        title: '抵扣取消勾选出错',
                        content: res.description
                    });
                }
            }
        });
    }

    //直接查询税局数据，暂时保留
    fetchListGov(c, size = this.state.pageSize) {
        if (!this.props.govOperate.passwd || !this.props.loginGovInfo) {
            this.props.showLogin();
            return;
        }

        this.setState({
            loading: true
        });

        let url = this.props.collectUrl;

        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }

        this.props.govOperate.queryInvoices(url, {
            searchOpt: {
                ...this.searchOpt,
                pageSize: size
            },
            dataIndex: (c - 1) * size,
            continueFlag: false,
            stepFinish: (res) => {
                if (res.errcode === '0000') {
                    this.setState({
                        dataIndex: (c - 1) * size,
                        pageSize: size,
                        loading: false,
                        listData: res.data,
                        totalNum: res.totalNum,
                        selectedRows: []
                    });
                } else {
                    this.setState({
                        loading: false
                    });

                    message.info(res.description);
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
            deductionPurpose: this.searchOpt.gxzt === '0' ? '' : '1', //1抵扣，2不抵扣
            pageSize: size,
            page: c
        };

        let url = this.props.dkgxSearchUrl;
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }

        const res = await kdRequest({
            url: url,
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

    // 支持跨页选择
    onSelect = (keys, rows) => {
        const { listData = [], selectedRows = [] } = this.state;
        this.setState({
            listData: listData.map((r) => {
                const curKey = r.invoiceCode + '-' + r.invoiceNo;
                if (keys.indexOf(curKey) === -1) {
                    return {
                        ...r,
                        yxse: r.effectiveTaxAmount ? r.effectiveTaxAmount : r.taxAmount || r.totalTaxAmount
                    };
                } else {
                    return r;
                }
            }),
            selectedRows: selectInvoices(rows, selectedRows, listData)
        });
    }

    onChangeYxse = (v, r) => {
        this.setState({
            selectedRows: this.state.selectedRows.map((item) => {
                if (item.invoiceCode === r.invoiceCode && item.invoiceNo === r.invoiceNo) {
                    return {
                        ...item,
                        yxse: v
                    };
                } else {
                    return item;
                }
            }),
            listData: this.state.listData.map((item) => {
                if (item.invoiceCode === r.invoiceCode && item.invoiceNo === r.invoiceNo) {
                    return {
                        ...item,
                        yxse: v
                    };
                } else {
                    return item;
                }
            })
        });
    }

    gxAllInvoices = async() => {
        confirm({
            title: '全部发票勾选提示',
            content: '即将通过当前的查询条件进行全部发票的抵扣勾选，请确认！',
            onOk: async() => {
                this.setState({
                    disabledGxAll: true
                });
                const res = await kdRequest({
                    url: this.props.dkgxAllUrl,
                    timeout: 60000,
                    data: changeSearchOpt(this.state.searchOpt),
                    method: 'POST'
                });
                this.setState({
                    disabledGxAll: false
                });
                if (res.errcode !== '0000') {
                    message.info(res.description);
                    return;
                }
                const { batchNo } = res.data;
                this.setState({
                    showDetailList: true,
                    batchNo
                });
            }
        });
    }

    exportData = () => {
        confirm({
            title: '全部发票导出提示',
            content: '是否导出当前查询的所有发票，请确认！',
            onOk: () => {
                const param = changeSearchOpt(this.state.searchOpt);
                tools.downloadFile({
                    downloadType: 'xhr',
                    url: this.props.exportUrl,
                    key: 'downloadParams',
                    data: param,
                    startCallback: () => {
                        this.setState({
                            exporting: true
                        });
                    },
                    endCallback: (res) => {
                        if (res.errcode !== '0000') {
                            message.info(res.description + '[' + res.errcode + ']');
                        } else {
                            message.success('导出成功');
                        }
                        this.setState({
                            exporting: false
                        });
                    }
                });
            }
        });
    }

    render() {
        const {
            listData,
            selectedRows,
            totalNum,
            pageSize,
            dataIndex,
            loading,
            disabledGxAll,
            exporting,
            searchOpt,
            showDetailList,
            batchNo
        } = this.state;
        const { gxrqfw = '', skssq = '' } = this.props.loginGovInfo || {};
        const { clientType, isEntryVoucher, fpdkType = 1 } = this.props;
        const disabled = selectedRows.length === 0;

        const selectedRowKeys = selectedRows.map((r) => {
            return r.invoiceCode + '-' + r.invoiceNo;
        });
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

        const page = parseInt(dataIndex / pageSize) + 1;
        const { totalAmount = 0.00, totalTaxAmount = 0.00 } = this.getGxInvoicesOpt(selectedRows, -1);
        const dkgxCols = getDkGxInvoiceCols(this.onChangeYxse, selectedRowKeys, page, pageSize);
        let scollX = 1960;
        dkgxCols.splice(-3, 0, ...preSelectCols);
        if (isEntryVoucher === 1) {
            dkgxCols.splice(-1, 0, ...entryVoucherCols);
            scollX += 280;
        }
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
                    entryDate={entryDateFun()}
                />
                <div className='optBtns'>
                    <Button type='primary' style={{ marginRight: 20 }} disabled={disabled} onClick={this.gxInvoices}>勾选发票</Button>
                    <Button type='primary' disabled={disabled} onClick={this.qxGxInvoices}>撤销勾选</Button>
                    {
                        fpdkType === 2 && isEntryVoucher === 1 ? (
                            <Button disabled={disabledGxAll} onClick={this.gxAllInvoices} style={{ marginLeft: 20 }}>全部勾选</Button>
                        ) : null
                    }

                    {
                        this.props.exportUrl ? (
                            <Button loading={exporting} onClick={this.exportData} style={{ marginLeft: 20 }}>数据导出</Button>
                        ) : null
                    }
                </div>
                <Table
                    rowSelection={rowSelection}
                    rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                    dataSource={listData}
                    columns={dkgxCols}
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
                    onShowSizeChange={(c, size) => this.fetchList(c, size)}
                    onChange={(c, size) => this.fetchList(c, size, true)}
                />
                <Modal
                    title='抵扣勾选结果'
                    visible={showDetailList}
                    onCancel={() => this.setState({ showDetailList: false, batchNo: '' })}
                    footer={null}
                    destroyOnClose={true}
                    className='dkgxErrList'
                    width={1200}
                >
                    <GxDetailList
                        batchNo={batchNo}
                        getSingleAccountUrl={this.props.getSingleAccountUrl}
                        singleExportUrl={this.props.singleExportUrl}
                        dkgxProgressUrl={this.props.dkgxProgressUrl}
                    />
                </Modal>
            </div>
        );
    }
}

DkgxInvoices.propTypes = {
    access_token: PropTypes.string,
    govOperate: PropTypes.object.isRequired,
    showLogin: PropTypes.func.isRequired,
    loginGovInfo: PropTypes.object,
    dkgxUrl: PropTypes.string.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired,
    collectUrl: PropTypes.string,
    dkgxAllUrl: PropTypes.string,
    isEntryVoucher: PropTypes.number,
    getSingleAccountUrl: PropTypes.string.isRequired,
    singleExportUrl: PropTypes.string.isRequired,
    dkgxProgressUrl: PropTypes.string.isRequired,
    exportUrl: PropTypes.string.isRequired,
    fpdkType: PropTypes.number,
    skssq: PropTypes.string,
    clientType: PropTypes.number
};

export default DkgxInvoices;
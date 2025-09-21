import React from 'react';
import { Button, Table, message, Pagination, Modal, Select, Checkbox } from 'antd';
import GxInvoicesSearch from './gxInvoicesSearch';
import PropTypes from 'prop-types';
import { getBdkGxInvoiceCols, entryVoucherCols, preSelectCols } from '../commons/gxInvoiceCols';
import { kdRequest } from '@piaozone.com/utils';
import { confirm, modalSuccess, modalError } from '../commons/antdModal';
import { selectInvoices } from '../commons/selectInvoices';
import { initSearchOpt, getSearchOpt, entryDateFun } from './searchTools';
const { Option } = Select;
const reson = [
    { text: '请选择不抵扣原因', value: 0 },
    { text: '用于非应税项目', value: 1 },
    { text: '用于免税项目', value: 2 },
    { text: '用于集体福利或者个人消费', value: 3 },
    { text: '遭受非正常损失', value: 4 },
    { text: '其他', value: 5 }
];

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
            pageSize: 50,
            loading: false,
            shrSlogan: false,
            batchSelect: false, //批量选择
            batchBdkgxReson: null,
            bdkgxObj: {
                bdkgxStatus: false,
                selectedRowsLen: 0,
                selectInfo: null
            }
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
        const notDeductibleTypes = [];
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
                notDeductibleTypes.push(curData.notDeductibleType);
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
                    serialNos,
                    notDeductibleTypes
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
        const isLogin = await this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo);
        if (!isLogin) {
            this.props.showLogin();
            return;
        }
        const list = this.state.selectedRows;
        const info = this.getGxInvoicesOpt(list, 1);
        if (info.errcode !== '0000') {
            message.info(info.description);
        }
        this.setState({
            bdkgxObj: {
                bdkgxStatus: true,
                selectedRowsLen: list.length,
                selectInfo: info
            }
        });
    }

    confirmBdkGx = async(opt) => {
        const { info } = opt;
        const { batchBdkgxReson, batchSelect, bdkgxObj } = this.state;
        let selectData = [];
        const { notDeductibleTypes } = info.data;
        if (batchSelect) {
            if (batchBdkgxReson) {
                selectData = notDeductibleTypes.map((item) => {
                    return batchBdkgxReson;
                });
            } else {
                message.info('请先批量选择不抵扣原因');
                return;
            }
        } else {
            selectData = notDeductibleTypes;
        }
        if (selectData.indexOf(null) != -1 || selectData.indexOf('') != -1) {
            message.info('存在未选择“不抵扣原因”的发票，请先选择');
            return;
        }
        info.data.notDeductibleTypes = selectData;
        this.setState({
            bdkgxObj: {
                ...bdkgxObj,
                bdkgxStatus: false
            }
        });

        message.loading('不抵扣勾选中...', 0);
        let url = this.props.bdkgxUrl;
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }
        const res = await this.props.govOperate.bdkGxInvoices(url, info.data);
        message.destroy();
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

    qxGxInvoices = async() => {
        const isLogin = await this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo);
        if (!isLogin) {
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
            this.checkShrSource(res.data);
        } else {
            this.setState({
                loading: false
            });

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
            const { listData } = this.state;
            //接口获取的数据；
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

    selectBdkGxReson(opt) {
        const { notDeductibleType, index } = opt;
        const { listData } = this.state;
        listData[index].notDeductibleType = notDeductibleType;
        let selectedRows = this.state.selectedRows || [];
        if (selectedRows.length > 0) {
            selectedRows = selectedRows.map((item) => {
                if (item.serialNo === listData[index].serialNo) {
                    return {
                        ...item,
                        notDeductibleType
                    };
                } else {
                    return item;
                }
            });
        }
        this.setState({
            listData,
            selectedRows
        });
    }

    onSelect = (k, rows) => {
        const { listData = [], selectedRows = [] } = this.state;
        this.setState({
            selectedRows: selectInvoices(rows, selectedRows, listData)
        });
    }

    render() {
        const { listData, selectedRows, totalNum, pageSize, dataIndex, loading, searchOpt, batchSelect, batchBdkgxReson, bdkgxObj } = this.state;
        const { gxrqfw = '', skssq = '' } = this.props.loginGovInfo || {};
        const disabled = selectedRows.length === 0;
        const { clientType, isEntryVoucher, userSource } = this.props;
        const selectedRowKeys = selectedRows.map((r) => {
            return r.invoiceCode + '-' + r.invoiceNo;
        });
        const page = parseInt(dataIndex / pageSize) + 1;
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
        const renderDeductionReason = { //不抵扣勾选原因
            title: '不抵扣原因',
            dataIndex: 'notDeductibleType',
            align: 'center',
            width: 280,
            render: (v, r, i) => {
                const { authenticateFlag } = r;
                const disabled = !(authenticateFlag == 0 || authenticateFlag == 5);
                return (
                    <Select
                        value={v ? reson[v].text : reson[0].text}
                        disabled={disabled}
                        style={{ width: 220 }}
                        onChange={(e) => this.selectBdkGxReson({ notDeductibleType: e, index: i })}
                    >
                        {
                            reson.map((item) => {
                                return (
                                    <Option value={item.value} key={item.value}>{item.text}</Option>
                                );
                            })
                        }
                    </Select>
                );
            }
        };
        const bdkgxCols = getBdkGxInvoiceCols(page, pageSize, 'left');
        let scollX = 2180;
        bdkgxCols.splice(-3, 0, ...preSelectCols);
        if (isEntryVoucher === 1 && userSource != '8') {
            bdkgxCols.splice(-1, 0, ...entryVoucherCols);
            scollX += 280;
        }
        const { shrSlogan } = this.state;
        if (shrSlogan && userSource != '8') {
            bdkgxCols.push(shrSource);
            scollX += 200;
        }
        bdkgxCols.splice(bdkgxCols.length - 10, 0, renderDeductionReason);

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
                    entryDate={entryDateFun()}
                    userSource={userSource}
                    getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                    gitReviewerUrl={this.props.gitReviewerUrl}
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
                    pageSizeOptions={['50', '100', '500', '1000']}
                    onShowSizeChange={(c, size) => this.fetchList(c, size, true)}
                    onChange={(c, size) => this.fetchList(c, size, true)}
                />
                <Modal
                    title='确认进行“抵扣预勾选”操作'
                    visible={bdkgxObj.bdkgxStatus}
                    onCancel={() => { this.setState({ bdkgxObj: { ...bdkgxObj, bdkgxStatus: false } }); }}
                    onOk={() => { this.confirmBdkGx({ info: bdkgxObj.selectInfo }); }}
                    width={460}
                >
                    {
                        bdkgxObj.selectInfo ? (
                            <div>
                                {
                                    '发票数量: ' + bdkgxObj.selectedRowsLen + ', 总不含税金额：' +
                                    bdkgxObj.selectInfo.totalAmount + ', 总税额: ' + bdkgxObj.selectInfo.totalTaxAmount
                                }
                            </div>
                        ) : null
                    }
                    <div style={{ marginTop: 20 }}>
                        <Checkbox checked={batchSelect} onChange={(e) => { this.setState({ batchSelect: e.target.checked }); }}>批量填入不抵扣原因</Checkbox>
                        <Select
                            value={batchBdkgxReson ? reson[batchBdkgxReson].text : reson[0].text}
                            style={{ width: 220, marginRight: 20 }}
                            onChange={(e) => { this.setState({ batchBdkgxReson: e }); }}
                            disabled={!batchSelect}
                        >
                            {
                                reson.map((item) => {
                                    return (
                                        <Option value={item.value} key={item.value}>{item.text}</Option>
                                    );
                                })
                            }
                        </Select>
                    </div>
                </Modal>
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
    shrSourceUrl: PropTypes.string.isRequired,
    access_token: PropTypes.string,
    fpdkType: PropTypes.number,
    clientType: PropTypes.number,
    skssq: PropTypes.string,
    isEntryVoucher: PropTypes.string,
    userSource: PropTypes.userSource,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string
};

export default DkgxInvoices;
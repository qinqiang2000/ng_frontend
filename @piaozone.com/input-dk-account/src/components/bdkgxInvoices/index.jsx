import React from 'react';
import SearchBox from '../searchBox/';
import InvoiceTabs from '../invoicesTabs/';
import InvoiceList from '../invoiceList/';
import { pwyFetch, tools } from '@piaozone.com/utils';
import { message, Pagination, Modal, Select, Checkbox } from 'antd';
import { confirm, modalError, modalSuccess } from '../commons/antdModal';
import moment from 'moment';
import { selectInvoices } from '../commons/selectInvoices';
import PropTypes from 'prop-types';
import {
    invoiceStatusArr,
    expendStatusArr,
    createAccountDate,
    getDkgxSearchInvoiceTypes,
    authenticateFlagArr,
    originalStateArr,
    getCheckedValue,
    transportDeductionArr,
    getChangeOpt
} from '../searchBox/searchTools';
const { Option } = Select;
const reson = [
    { text: '请选择不抵扣原因', value: 0 },
    { text: '用于非应税项目', value: 1 },
    { text: '用于免税项目', value: 2 },
    { text: '用于集体福利或者个人消费', value: 3 },
    { text: '遭受非正常损失', value: 4 },
    { text: '其他', value: 5 }
];

class BdkgxInvoices extends React.Component {
    constructor() {
        super(...arguments);
        const { fullInvoiceInfoTypes, govDkInvoiceTypes } = getDkgxSearchInvoiceTypes(1);
        const entryDate = createAccountDate(12);
        this.fullInvoiceTypes = govDkInvoiceTypes;
        this.state = {
            activeInvoiceType: 0,
            loading: false,
            selectedRows: [],
            selectedRowKeys: [],
            listData: [],
            tabsList: [],
            totalElement: 0,
            disabledGxAll: false,
            showDetailList: false,
            pageNo: 1,
            pageSize: 10,
            searchOpt: {
                accountDate: entryDate,
                invoiceTypes: fullInvoiceInfoTypes,
                invoiceStatus: invoiceStatusArr,
                expendStatus: expendStatusArr,
                authenticateFlags: authenticateFlagArr,
                originalState: originalStateArr,
                transportDeduction: transportDeductionArr,
                belongDate: [null, null],
                accountTime: [null, null],
                invoiceTime: [moment().subtract(1, 'years'), moment()]
            },
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
        this._isAmount = true;
        this.onSearch(this.state.searchOpt);
    }

    componentWillUnmount() {
        this._isAmount = false;
    }

    getSearchOpt = (opt, pageNo = this.state.pageNo, pageSize = this.state.pageSize) => {
        const { invoiceTime, belongDate, accountTime, accountDate, invoiceTypes, authenticateFlags } = opt;
        const authenticateFlagStr = getCheckedValue(authenticateFlags);
        const selectInvoiceTypeStr = getCheckedValue(invoiceTypes);
        const searchOpt = {
            pageNo,
            pageSize,
            deductionPurpose: authenticateFlagStr === '1' ? 2 : '',
            queryType: 1,
            equalNameValue: '1', // 抬头是否一致 1 一致， 2 不一致, 勾选发票必须查询抬头一致的数据
            expenseNum: opt.expenseNum || '',
            invoiceStatus: getCheckedValue(opt.invoiceStatus),
            invoiceCode: opt.invoiceCode || '',
            invoiceNo: opt.invoiceNo || '',
            salerName: opt.salerName || '',
            originalState: getCheckedValue(opt.originalState), // 原件签收状态  1是 0否
            expendStatus: getCheckedValue(opt.expendStatus), // 报销状态 1-未报销,30-审核中,60-已报销未入账,65-已入账';
            authenticateFlags: authenticateFlagStr === '' ? '0,1' : authenticateFlagStr, // 只能查询未勾选和已勾选的发票，认证状态 0:未勾选，1勾选未认证，2勾选已认证，3扫描认证'
            collectUser: opt.collectUser || '', // 采集人: 手机号
            invoiceTypes: selectInvoiceTypeStr === '' ? this.fullInvoiceTypes.join(',') : selectInvoiceTypeStr, // 发票类型
            accountDate: getCheckedValue(accountDate), // 入账属期
            invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', // 开票日期起
            invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', // 开票日期止
            belongDateStart: belongDate && belongDate[0] ? belongDate[0].format('YYYY-MM-DD') : '', // 采集日期起
            belongDateEnd: belongDate && belongDate[1] ? belongDate[1].format('YYYY-MM-DD') : '', // 采集日期止
            accountTimeStart: accountTime && accountTime[0] ? accountTime[0].format('YYYY-MM-DD') : '', // 入账日期起
            accountTimeEnd: accountTime && accountTime[1] ? accountTime[1].format('YYYY-MM-DD') : '' // 入账日期止
        };
        return searchOpt;
    }

    onSearch = async(newOpt, newType = '') => {
        const searchOpt = this.getSearchOpt(newOpt, 1);
        this.setState({
            selectedRows: [],
            searchOpt: newOpt,
            loading: true,
            pageNo: 1
        });
        const res = await this.getTabInfo(searchOpt);
        if (res.data && res.data.length > 0) {
            const activeInvoiceType = newType || res.data[0].invoiceType;
            await this.fetchList({ ...searchOpt, invoiceTypes: activeInvoiceType }, activeInvoiceType);
        } else {
            this.setState({
                totalElement: 0,
                loading: false,
                listData: []
            });
        }
    }

    // 查询数量
    getTabInfo = async(opt) => {
        const res = await pwyFetch(this.props.queryNumUrl, {
            data: opt,
            method: 'post'
        });
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return res;
        }
        const resData = res.data || [];
        const newList = resData.filter((item) => {
            return item.invoiceType !== 0;
        });
        this.setState({
            tabsList: newList
        });
        return {
            ...res,
            data: newList
        };
    }

    // 查询发票列表
    fetchList = async(opt, activeInvoiceType = this.state.activeInvoiceType) => {
        this.setState({
            pageNo: opt.pageNo,
            pageSize: opt.pageSize,
            loading: true,
            activeInvoiceType
        });
        const res = await pwyFetch(this.props.dkgxSearchUrl, {
            data: opt,
            method: 'post'
        });
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            this.setState({
                loading: false
            });
            return res;
        }
        this.setState({
            activeInvoiceType,
            totalElement: res.totalElement,
            listData: res.data || [],
            loading: false
        });
    }

    onChangeTab = async(item) => {
        const searchOpt = this.getSearchOpt(this.state.searchOpt, 1);
        const invoiceTypes = item.invoiceType === 0 ? this.fullInvoiceTypes.join(',') : item.invoiceType;
        await this.fetchList({ ...searchOpt, invoiceTypes }, item.invoiceType);
    }

    onSelectChange = (keys, rows) => {
        const { listData = [], selectedRows = [] } = this.state;
        this.setState({
            selectedRows: selectInvoices(rows, selectedRows, listData)
        });
    }

    onChangeOpt = (k, info, flag) => {
        const searchOpt = this.state.searchOpt;
        const newOpt = getChangeOpt(searchOpt, k, info, flag);
        this.onSearch(newOpt);
    }

    startFetchList = (c = this.state.searchOpt.pageNo, size = this.state.searchOpt.pageSize, activeInvoiceType, clearSelect) => {
        const searchOpt = this.state.searchOpt;
        const opt = {
            ...searchOpt,
            pageNo: c,
            pageSize: size
        };
        this.setState({
            searchOpt: opt,
            selectedRows: clearSelect ? [] : this.state.selectedRows
        });
        const fetchOpt = this.getSearchOpt(opt, c, size);
        this.fetchList({ ...fetchOpt, invoiceTypes: activeInvoiceType });
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
            const curTotalAmount = parseFloat(curData.totalAmount);
            // const curInvoiceAmount = parseFloat(curData.invoiceAmount);
            const curSe = parseFloat(curData.taxAmount || curData.totalTaxAmount);

            if (isNaN(curTotalAmount) || isNaN(curSe)) {
                description = '数据有误';
                break;
            } else {
                totalAmount += curTotalAmount;
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
        if (!this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo)) {
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
            this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
        } else {
            modalError({
                title: '不抵扣勾选出错',
                content: res.description
            });
        }
    }

    qxGxInvoices = async() => {
        const fpdkType = this.props.fpdkType || 1;
        if (!this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo)) {
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
            content: '发票数量: ' + selectedRows.length + ', 总价税合计：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount,
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
                    this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
                } else {
                    modalError({
                        title: '不抵扣取消勾选出错',
                        content: res.description
                    });
                }
            }
        });
    }

    exportData = () => {
        const param = this.getSearchOpt(this.state.searchOpt);
        const selectInvoiceTypes = param.invoiceTypes ? param.invoiceTypes : this.govDkInvoiceTypes.join(',');
        confirm({
            title: '全部发票导出提示',
            content: '是否导出当前查询条件的所有发票，请确认！',
            onOk: () => {
                tools.downloadFile({
                    downloadType: 'xhr',
                    url: this.props.exportUrl,
                    key: 'downloadParams',
                    data: { ...param, invoiceTypes: selectInvoiceTypes, exportType: 2 },
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

    selectBdkGxReson = (r, v) => {
        this.setState({
            selectedRows: this.state.selectedRows.map((item) => {
                return {
                    ...item,
                    notDeductibleType: item.serialNo === r.serialNo ? v : item.notDeductibleType
                };
            }),
            listData: this.state.listData.map((item) => {
                return {
                    ...item,
                    notDeductibleType: item.serialNo === r.serialNo ? v : item.notDeductibleType
                };
            })
        });
    }

    render() {
        const {
            searchOpt,
            loading,
            tabsList,
            listData,
            activeInvoiceType,
            pageNo,
            pageSize,
            totalElement,
            selectedRows,
            exporting,
            batchSelect,
            batchBdkgxReson,
            bdkgxObj
        } = this.state;
        const { clientType, isEntryVoucher, fpdkType = 1, loginGovInfo = {} } = this.props;
        const { gxrqfw = '', skssq = '' } = loginGovInfo;
        const selectedRowKeys = selectedRows.map((r) => {
            return r.serialNo;
        });
        const rowSelection = {
            fixed: 'left',
            selectedRowKeys,
            onChange: this.onSelectChange,
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
        return (
            <div className='pwyTableContent'>
                <SearchBox
                    exporting={exporting}
                    gxrqfw={gxrqfw}
                    skssq={skssq || this.props.skssq}
                    clientType={clientType}
                    isEntryVoucher={isEntryVoucher}
                    fpdkType={fpdkType}
                    selectedRowKeys={selectedRowKeys}
                    searchOpt={searchOpt}
                    onChangeOpt={this.onChangeOpt}
                    onSearch={this.onSearch}
                    gxInvoices={this.gxInvoices}
                    qxGxInvoices={this.qxGxInvoices}
                    exportData={this.exportData}
                />
                <div className='invoiceContent'>
                    {
                        tabsList.length > 0 ? (
                            <InvoiceTabs
                                isEntryVoucher={isEntryVoucher}
                                tabsList={tabsList}
                                activeInvoiceType={activeInvoiceType}
                                onChange={this.onChangeTab}
                            />
                        ) : null
                    }

                    <div className='tblBottom clearfix' style={{ padding: '10px 15px 0', marginBottom: 10 }}>
                        <div className='floatLeft'>
                            <span>已选择<span className='number'>{selectedRowKeys.length}</span>条数据，当前发票类型共{totalElement}条</span>
                        </div>
                        <Pagination
                            size='small'
                            current={pageNo}
                            total={totalElement}
                            showSizeChanger
                            showQuickJumper
                            className='switchPages floatRight'
                            pageSize={pageSize}
                            pageSizeOptions={['10', '30', '50', '100']}
                            onShowSizeChange={(c, size) => this.startFetchList(1, size, activeInvoiceType, true)}
                            onChange={(c, size) => this.startFetchList(c, size, activeInvoiceType)}
                        />
                    </div>

                    <InvoiceList
                        gxFlag='bdkgx'
                        pageSize={pageSize}
                        pageNo={pageNo}
                        loading={loading}
                        listData={listData}
                        rowSelection={rowSelection}
                        activeInvoiceType={activeInvoiceType}
                        getRelateBillInfo={this.props.getRelateBillInfo}
                        onSelectBdkGxReson={this.selectBdkGxReson}
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
            </div>
        );
    }
}

BdkgxInvoices.propTypes = {
    queryNumUrl: PropTypes.string.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired,
    access_token: PropTypes.string,
    govOperate: PropTypes.object.isRequired,
    showLogin: PropTypes.func.isRequired,
    loginGovInfo: PropTypes.object,
    isEntryVoucher: PropTypes.number,
    fpdkType: PropTypes.number,
    skssq: PropTypes.string,
    clientType: PropTypes.number,
    bdkgxUrl: PropTypes.string,
    exportUrl: PropTypes.string,
    getRelateBillInfo: PropTypes.func
};
export default BdkgxInvoices;
import React from 'react';
import SearchBox from '../searchBox/';
import InvoiceTabs from '../invoicesTabs/';
import InvoiceList from '../invoiceList/';
import { pwyFetch, tools } from '@piaozone.com/utils';
import { message, Pagination, Modal, DatePicker } from 'antd';
import { selectInvoices } from '../commons/selectInvoices';
import moment from 'moment';
import { confirm } from '../commons/antdModal';
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

const { MonthPicker } = DatePicker;

class TrafficDkInvoices extends React.Component {
    constructor() {
        super(...arguments);
        const { fullInvoiceInfoTypes, fullInvoiceTypes } = getDkgxSearchInvoiceTypes(2);
        const noShowInvoiceType = [28, 29]; // 需要暂时屏蔽的发票类型
        const entryDate = createAccountDate(12);
        this.fullInvoiceTypes = fullInvoiceTypes.filter(item => !noShowInvoiceType.includes(item));
        this.state = {
            activeInvoiceType: 0,
            loading: false,
            selectedRows: [],
            listData: [],
            tabsList: [],
            totalElement: 0,
            disabledGxAll: false,
            showDetailList: false,
            taxPeriod: '',
            pageNo: 1,
            pageSize: 10,
            searchOpt: {
                accountDate: entryDate,
                invoiceTypes: fullInvoiceInfoTypes.filter(item => !noShowInvoiceType.includes(item.value)),
                invoiceStatus: invoiceStatusArr,
                expendStatus: expendStatusArr,
                authenticateFlags: authenticateFlagArr,
                originalState: originalStateArr,
                transportDeduction: transportDeductionArr,
                belongDate: [null, null],
                accountTime: [null, null],
                invoiceTime: [moment().subtract(1, 'months'), moment()]
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
        const { invoiceTime, belongDate, accountTime, accountDate, invoiceTypes, transportDeduction } = opt;
        const selectInvoiceTypeStr = getCheckedValue(invoiceTypes);
        const searchOpt = {
            pageNo,
            pageSize,
            queryType: 1,
            expenseNum: opt.expenseNum || '',
            invoiceStatus: getCheckedValue(opt.invoiceStatus),
            invoiceCode: opt.invoiceCode || '',
            invoiceNo: opt.invoiceNo || '',
            salerName: opt.salerName || '',
            originalState: getCheckedValue(opt.originalState), // 原件签收状态  1是 0否
            expendStatus: getCheckedValue(opt.expendStatus), // 报销状态 1-未报销,30-审核中,60-已报销未入账,65-已入账';
            collectUser: opt.collectUser || '', // 采集人: 手机号
            invoiceTypes: selectInvoiceTypeStr === '' ? this.fullInvoiceTypes.join(',') : selectInvoiceTypeStr, // 发票类型
            transportDeduction: getCheckedValue(transportDeduction), // 旅客运输 0未抵扣1：抵扣，空为全部
            accountDate: getCheckedValue(accountDate), // 入账属期
            invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', // 开票日期起
            invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', // 开票日期止
            belongDateStart: belongDate && belongDate[0] ? belongDate[0].format('YYYY-MM-DD') : '', // 采集日期起
            belongDateEnd: belongDate && belongDate[1] ? belongDate[1].format('YYYY-MM-DD') : '', // 采集日期止
            accountTimeStart: accountTime && accountTime[0] ? accountTime[0].format('YYYY-MM-DD') : '', // 入账时间起
            accountTimeEnd: accountTime && accountTime[1] ? accountTime[1].format('YYYY-MM-DD') : '' // 入账时间止
        };
        return searchOpt;
    }

    onSearch = async(newOpt, newType = '') => {
        const searchOpt = this.getSearchOpt(newOpt, 1);
        const {
            belongDateStart = '',
            belongDateEnd = '',
            accountTimeStart = '',
            accountTimeEnd = '',
            invoiceTimeStart = '',
            invoiceTimeEnd = ''
        } = searchOpt;
        if (accountTimeStart === '' && invoiceTimeStart === '' && belongDateStart === '') {
            message.info('采集日期，开票日期，入账时间不能同时为空');
            return;
        } else {
            if (moment(belongDateEnd, 'YYYY-MM-DD').diff(moment(belongDateStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 采集日期跨度不能大于31天');
                return;
            }
            if (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 开票日期跨度不能大于31天');
                return;
            }
            if (moment(accountTimeEnd, 'YYYY-MM-DD').diff(moment(accountTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 入账时间跨度不能大于31天');
                return;
            }
        }

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
        this.setState({
            searchOpt: newOpt
        });
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

    dkInvoices = async() => {
        const fids = this.state.selectedRows.map((item) => {
            return item.serialNo;
        });
        const taxPeriod = this.state.taxPeriod;
        if (fids.length === 0) {
            message.info('请选择需要抵扣的发票');
        } else if (!taxPeriod) {
            message.info('请选择抵扣的税期');
        } else {
            message.loading('处理中...', 0);
            const res = await this.props.onDkInvoice({
                serialNos: fids.join(','),
                taxPeriod: taxPeriod.format('YYYY-MM')
            });
            message.destroy();
            if (res.errcode === '0000') {
                message.info(taxPeriod.format(fids.length + '张发票抵扣成功'));
                this.setState({
                    showDkDialog: false
                });
                this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
            } else {
                message.info(res.description);
            }
        }
    }

    exportData = () => {
        const param = this.getSearchOpt(this.state.searchOpt);
        const selectInvoiceTypes = param.invoiceTypes ? param.invoiceTypes : this.fullInvoiceTypes.join(',');
        confirm({
            title: '全部发票导出提示',
            content: '是否导出当前查询条件的所有发票，请确认！',
            onOk: () => {
                tools.downloadFile({
                    downloadType: 'xhr',
                    url: this.props.exportUrl,
                    key: 'downloadParams',
                    data: { ...param, invoiceTypes: selectInvoiceTypes, exportType: 3 },
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

    cancelDkInvoices = async() => { //取消抵扣
        const { selectedRows } = this.state; //deductionPurpose
        const serialNos = [];
        for (const item of selectedRows) {
            if (item.deductionPurpose != 7) {
                message.info('请选择“已抵扣”状态的发票做撤销抵扣');
                return false;
            }
            serialNos.push(item.serialNo);
        }
        message.loading('处理中...', 0);
        const res = await pwyFetch(this.props.onCancelDkInvoice, {
            data: {
                serialNos: serialNos.join(',')
            },
            method: 'post'
        });
        message.destroy();
        if (res.errcode == '0000') {
            message.info('撤销成功');
            this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
        } else {
            message.info(res.description);
        }
    }

    render() {
        const {
            searchOpt,
            loading,
            exporting,
            tabsList,
            listData,
            activeInvoiceType,
            pageNo,
            pageSize,
            totalElement,
            selectedRows,
            showDkDialog,
            taxPeriod
        } = this.state;
        const { clientType, isEntryVoucher, fpdkType = 1 } = this.props;
        const selectedRowKeys = selectedRows.map((r) => {
            return r.serialNo;
        });
        const rowSelection = {
            fixed: 'left',
            selectedRowKeys,
            onChange: this.onSelectChange
            // getCheckboxProps: (r) => {
            //     return {
            //         disabled: r.deductionPurpose === 7
            //     };
            // }
        };
        const pageSizeOptions = this.props.pageSizeOptions || ['10', '30', '50', '100'];
        return (
            <div className='pwyTableContent'>
                <SearchBox
                    gxFlag='traffic'
                    exporting={exporting}
                    clientType={clientType}
                    isEntryVoucher={isEntryVoucher}
                    fpdkType={fpdkType}
                    selectedRowKeys={selectedRowKeys}
                    searchOpt={searchOpt}
                    onChangeOpt={this.onChangeOpt}
                    onSearch={this.onSearch}
                    onRecommend={(data)=> { this.setState({ searchOpt: data }) }}
                    trafficDkInvoices={() => this.setState({ showDkDialog: true })}
                    cancelTrafficDkInvoices={this.cancelDkInvoices}
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
                            <span>已选择<span className='number'>{selectedRowKeys.length}</span>条数据，共{totalElement}条</span>
                        </div>
                        <Pagination
                            size='small'
                            current={pageNo}
                            total={totalElement}
                            showSizeChanger
                            showQuickJumper
                            className='switchPages floatRight'
                            pageSize={pageSize}
                            pageSizeOptions={pageSizeOptions}
                            onShowSizeChange={(c, size) => this.startFetchList(1, size, activeInvoiceType, true)}
                            onChange={(c, size) => this.startFetchList(c, size, activeInvoiceType)}
                        />
                    </div>

                    <InvoiceList
                        gxFlag='traffic'
                        pageSize={pageSize}
                        pageNo={pageNo}
                        loading={loading}
                        listData={listData}
                        rowSelection={rowSelection}
                        activeInvoiceType={activeInvoiceType}
                        getRelateBillInfo={this.props.getRelateBillInfo}
                    />
                </div>
                <Modal
                    title='请选择税款抵扣税期'
                    wrapClassName='renewDialog'
                    width={500}
                    visible={showDkDialog}
                    onCancel={() => this.setState({ showDkDialog: false, taxPeriod: null })}
                    onOk={this.dkInvoices}
                >
                    <div className='row'>
                        <label>抵扣税期：</label>
                        <MonthPicker
                            disabledDate={(d) => {
                                return d < moment('2019-04', 'YYYY-MM') || d > moment();
                            }}
                            style={{ textAlign: 'left', width: 260 }}
                            onChange={(d) => { this.setState({ taxPeriod: d }); }}
                            value={taxPeriod}
                            allowClear={true}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

TrafficDkInvoices.propTypes = {
    queryNumUrl: PropTypes.string,
    dkgxSearchUrl: PropTypes.string,
    onDkInvoice: PropTypes.func,
    isEntryVoucher: PropTypes.number,
    fpdkType: PropTypes.number,
    clientType: PropTypes.number,
    getRelateBillInfo: PropTypes.func,
    pageSizeOptions: PropTypes.array,
    onCancelDkInvoice:PropTypes.string,
    exportUrl: PropTypes.string
};

export default TrafficDkInvoices;
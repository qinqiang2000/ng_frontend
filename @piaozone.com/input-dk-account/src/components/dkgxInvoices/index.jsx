import React from 'react';
import SearchBox from '../searchBox/';
import InvoiceTabs from '../invoicesTabs/';
import InvoiceList from '../invoiceList/';
import { pwyFetch, tools } from '@piaozone.com/utils';
import { message, Pagination, Modal, Button } from 'antd';
import { confirm, modalError, modalSuccess } from '../commons/antdModal';
import moment from 'moment';
import GxDetailList from '../gxLogs/gxDetailList';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
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
    getChangeOpt,
    getAllowGovDkTypes
} from '../searchBox/searchTools';

const invoiceTypesDict = invoiceTypes.INPUT_INVOICE_TYPES_DICT;
class DkgxInvoices extends React.Component {
    constructor() {
        super(...arguments);
        const { fullInvoiceInfoTypes, fullInvoiceTypes, govDkInvoiceTypes } = getDkgxSearchInvoiceTypes(1);
        const entryDate = createAccountDate(12);
        this.fullInvoiceTypes = fullInvoiceTypes;
        this.govDkInvoiceTypes = govDkInvoiceTypes;
        this.state = {
            activeInvoiceType: 0,
            loading: false,
            selectedRows: [],
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
            showDownLoad: false
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
        const myInvoiceTypes = selectInvoiceTypeStr === '' ? this.fullInvoiceTypes.join(',') : selectInvoiceTypeStr;
        const searchOpt = {
            pageNo,
            pageSize,
            queryType: 1,
            deductionPurpose: authenticateFlagStr === '1' ? 1 : '', // 已勾选1，未勾选0，全部为空
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
            invoiceTypes: myInvoiceTypes, // 发票类型
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
            selectedRows: selectInvoices(rows, selectedRows, listData),
            listData: this.state.listData.map((item) => {
                return {
                    ...item,
                    effectiveTaxAmount: keys.indexOf(item.serialNo) === -1 ? item.totalTaxAmount : item.effectiveTaxAmount
                };
            })
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

    onChangeYxse = (r, v) => {
        let newValue;
        const dotIndex = v.indexOf('.');
        if (dotIndex === -1) {
            newValue = parseFloat(v);
            if (isNaN(newValue)) {
                newValue = '';
            }
        } else { // 在最后
            newValue = v.substr(0, dotIndex) + '.' + v.substr(dotIndex).replace(/\./g, '').substr(0, 2);
        }

        if (newValue > parseFloat(r.totalTaxAmount)) {
            message.info('有效税额不能大于当前税额');
        }

        this.setState({
            selectedRows: this.state.selectedRows.map((item) => {
                return {
                    ...item,
                    effectiveTaxAmount: item.serialNo === r.serialNo ? newValue : item.effectiveTaxAmount
                };
            }),
            listData: this.state.listData.map((item) => {
                return {
                    ...item,
                    effectiveTaxAmount: item.serialNo === r.serialNo ? newValue : item.effectiveTaxAmount
                };
            })
        });
    }

    gxAllInvoices = () => {
        const param = this.getSearchOpt(this.state.searchOpt);
        const selectInvoiceTypes = param.invoiceTypes ? getAllowGovDkTypes(param.invoiceTypes) : this.govDkInvoiceTypes.join(',');
        if (selectInvoiceTypes === '') {
            message.info('当前没有可以抵扣勾选的票种');
            return;
        }
        confirm({
            title: '全部发票勾选提示',
            content: '即将通过当前的查询条件筛选可以抵扣勾选的发票，进行全部勾选，请确认！',
            onOk: async() => {
                this.setState({
                    disabledGxAll: true
                });
                const res = await pwyFetch(this.props.dkgxAllUrl, {
                    data: { ...param, invoiceTypes: selectInvoiceTypes },
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
            const invoiceType = curData.invoiceType;
            if (!invoiceTypesDict['k' + invoiceType].allowGovdk) {
                description = '当前发票类型不支持抵扣勾选';
                break;
            }
            const curTotalAmount = parseFloat(curData.totalAmount);
            // const curInvoiceAmount = parseFloat(curData.invoiceAmount);
            const taxAmount = curData.taxAmount || curData.totalTaxAmount;
            const curSe = parseFloat(taxAmount);
            let yxse = curData.effectiveTaxAmount || curData.yxse;
            if (typeof yxse === 'undefined') {
                yxse = curSe;
            }
            if (isNaN(curTotalAmount) || isNaN(yxse) || isNaN(curSe)) {
                description = '数据有误';
                break;
            } else {
                totalAmount += curTotalAmount;
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
        const { selectedRows } = this.state;
        const info = this.getGxInvoicesOpt(selectedRows, 1);
        if (info.errcode !== '0000') {
            message.info(info.description);
            return;
        }
        if (!this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo)) {
            this.props.showLogin();
            return;
        }

        confirm({
            title: '确认进行抵扣勾选操作？',
            content: '发票数量: ' + selectedRows.length + '份, 总价税合计：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
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
                    modalSuccess({
                        title: '抵扣勾选成功'
                    });
                    this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
                } else if (res.errcode === '90001') {
                    modalError({
                        title: '部分发票抵扣勾选成功'
                    });
                    this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
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
        const { selectedRows } = this.state;
        const info = this.getGxInvoicesOpt(selectedRows, 0);
        if (info.errcode !== '0000') {
            message.info(info.description);
            return;
        }

        if (!this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo)) {
            this.props.showLogin();
            return;
        }

        confirm({
            title: '确认进行抵扣取消勾选操作？',
            content: '发票数量: ' + selectedRows.length + ', 总价税合计：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
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
                    this.onSearch(this.state.searchOpt, this.state.activeInvoiceType);
                } else {
                    modalError({
                        title: '抵扣取消勾选出错',
                        content: res.description
                    });
                }
            }
        });
    }

    exportData = () => {
        // const param = this.getSearchOpt(this.state.searchOpt);
        // const selectInvoiceTypes = param.invoiceTypes ? param.invoiceTypes : this.govDkInvoiceTypes.join(',');

        // confirm({
        //     title: '全部发票导出提示',
        //     content: '是否导出当前查询条件的所有发票，请确认！',
        //     onOk: () => {
        //         tools.downloadFile({
        //             downloadType: 'xhr',
        //             url: this.props.exportUrl,
        //             key: 'downloadParams',
        //             data: { ...param, invoiceTypes: selectInvoiceTypes, exportType: 1 },
        //             startCallback: () => {
        //                 this.setState({
        //                     exporting: true
        //                 });
        //             },
        //             endCallback: (res) => {
        //                 if (res.errcode !== '0000') {
        //                     message.info(res.description + '[' + res.errcode + ']');
        //                 } else {
        //                     message.success('导出成功');
        //                 }
        //                 this.setState({
        //                     exporting: false
        //                 });
        //             }
        //         });
        //     }
        // });
        this.setState({
            showDownLoad: true
        });
    }

    govDownLoad = () => {
        const param = this.getSearchOpt(this.state.searchOpt);
        const selectInvoiceTypes = param.invoiceTypes ? param.invoiceTypes : this.govDkInvoiceTypes.join(',');
        tools.downloadFile({
            downloadType: 'xhr',
            url: this.props.govExportUrl,
            key: 'downloadParams',
            data: { ...param, invoiceTypes: selectInvoiceTypes, exportType: 1,  isQdGov: false},
            startCallback: () => {
                this.setState({
                    exporting: true
                });
                message.loading('下载处理中...', 0);
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
                message.destroy();
            }
        });
    }

    eleDownLoad = () => {
        const param = this.getSearchOpt(this.state.searchOpt);
        const selectInvoiceTypes = param.invoiceTypes ? param.invoiceTypes : this.govDkInvoiceTypes.join(',');
        tools.downloadFile({
            downloadType: 'xhr',
            url: this.props.eleExportUrl,
            key: 'downloadParams',
            data: { ...param, invoiceTypes: selectInvoiceTypes, exportType: 1, isQdGov: true },
            startCallback: () => {
                this.setState({
                    exporting: true
                });
                message.loading('下载处理中...', 0);
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
                message.destroy();
            }
        });
    }

    render() {
        const {
            exporting,
            searchOpt,
            loading,
            tabsList,
            listData,
            activeInvoiceType,
            pageNo,
            pageSize,
            totalElement,
            selectedRows,
            disabledGxAll,
            showDetailList,
            batchNo = '',
            showDownLoad
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
        const disabledGx = this.govDkInvoiceTypes.indexOf(activeInvoiceType) === -1;
        return (
            <div className='pwyTableContent'>
                <SearchBox
                    exporting={exporting}
                    gxrqfw={gxrqfw}
                    skssq={skssq || this.props.skssq}
                    clientType={clientType}
                    isEntryVoucher={isEntryVoucher}
                    fpdkType={fpdkType}
                    disabledGx={disabledGx}
                    disabledGxAll={disabledGxAll}
                    selectedRowKeys={selectedRowKeys}
                    searchOpt={searchOpt}
                    onChangeOpt={this.onChangeOpt}
                    onSearch={this.onSearch}
                    gxAllInvoices={this.gxAllInvoices}
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
                        gxFlag='dkgx'
                        pageSize={pageSize}
                        pageNo={pageNo}
                        loading={loading}
                        listData={listData}
                        rowSelection={rowSelection}
                        activeInvoiceType={activeInvoiceType}
                        onChangeYxse={this.onChangeYxse}
                        getRelateBillInfo={this.props.getRelateBillInfo}
                    />
                </div>
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
                <Modal
                    title='选择导出模板'
                    visible={showDownLoad}
                    onCancel={() => this.setState({ showDownLoad: false })}
                    footer={null}
                    width={600}
                >
                    <div style={{ padding: '0 10px'}}>
                        <p>1、下载为发票综合服务平台【批量勾选】Excel,可登录税局平台导入完成勾选</p>
                        <Button type='primary' disabled={exporting} style={{ display: 'block', margin: '20px auto' }} onClick={this.govDownLoad}>下载</Button>
                    </div>
                    <div style={{ padding: '0 10px'}}>
                        <p>2、下载为电子发票服务平台【清单导入勾选】Excel，可登录税局平台导入完成勾选</p>
                        <Button type='primary' disabled={exporting} style={{ display: 'block', margin: '20px auto 0' }} onClick={this.eleDownLoad}>下载</Button>
                    </div>
                </Modal>
            </div>
        );
    }
}


DkgxInvoices.propTypes = {
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
    dkgxAllUrl: PropTypes.string,
    dkgxUrl: PropTypes.string,
    exportUrl: PropTypes.string,
    govExportUrl: PropTypes.string,
    eleExportUrl: PropTypes.string,
    singleExportUrl: PropTypes.string,
    dkgxProgressUrl: PropTypes.string,
    getSingleAccountUrl: PropTypes.string,
    getRelateBillInfo: PropTypes.func
};

export default DkgxInvoices;
import React from 'react';
import { Button, Table, message, Pagination, Modal, Tooltip } from 'antd';
import GxInvoicesSearch from './gxInvoicesSearch';
import GxFailInvoiceList from './gxFailInvoiceList';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getDkGxInvoiceCols, entryVoucherCols, preSelectCols } from '../commons/gxInvoiceCols';
import { kdRequest, tools } from '@piaozone.com/utils';
import { confirm, modalSuccess, modalError } from '../commons/antdModal';
import { selectInvoices } from '../commons/selectInvoices';
import GxDetailList from './gxDetailList';
import GxExcelList from './gxExcelList';
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
            pageSize: 100,
            loading: false,
            dkgxErrList: [],
            dkgxSuccessList: [],
            showGxDetailList: false,
            shrSlogan: false,
            awaitParam: {
                name: ''
            }
        };
    }

    componentDidMount() {
        this.onSearch();
    }

    componentDidUpdate() {
        const clientLogin = document.querySelector('#clientLogin');
        if (clientLogin) {
            const loginState = clientLogin.getAttribute('loginState');
            if (loginState == 2) {
                const apiName = clientLogin.getAttribute('apiName');
                const { awaitParam } = this.state;
                if (apiName === 'gxInvoices') {
                    this.gxInvoices();
                } else if (apiName === 'qxGxInvoices') {
                    this.qxGxInvoices();
                } else if (apiName === 'importGxInvoices') {
                    this.importGxInvoices(awaitParam.param);
                } else if (apiName === 'importQxGxInvoice') {
                    this.importQxGxInvoice(awaitParam.param);
                }
                clientLogin.setAttribute('loginState', 1);
                clientLogin.setAttribute('apiName', '');
            }
        }
    }

    onReset = () => {
        this.setState({
            searchOpt: {
                ...initSearchOpt
            }
        });
    }

    onGetExcelParam = async() => {
        message.loading('加载中...');
        const res = await kdRequest({
            url: this.props.excelParamUrl,
            timeout: 60000,
            method: 'POST'
        });
        if (res.errcode == '0000') {
            const result = await kdRequest({
                url: this.props.getAuthCodeUrl,
                timeout: 60000,
                data: res.data,
                method: 'POST'
            });
            if (result.errcode == '0000') {
                const { auth_code } = result;
                if (auth_code) {
                    this.setState({
                        auth_code
                    });
                    const hostname = window.location.hostname;
                    if (hostname.indexOf('dev') != '-1' || hostname.indexOf('test') != '-1') {
                        window.location.href = 'https://api-dev.piaozone.com/test/portal-web-h5/web/input-manage/invoices/syncTaxBureau?auth_code=' + auth_code;
                    } else if (hostname.indexOf('sit') != '-1') {
                        window.location.href = 'https://api-sit.piaozone.com/test/portal-web-h5/web/input-manage/invoices/syncTaxBureau?auth_code=' + auth_code;
                    } else {
                        window.location.href = 'https://api.piaozone.com/portal-web-h5/web/input-manage/invoices/syncTaxBureau?auth_code=' + auth_code;
                    }
                } else {
                    message.info('获取授权码失败, 请重新登录后尝试');
                }
            } else {
                message.info('获取授权码失败');
            }
        } else {
            message.info('获取授权码所需参数失败');
        }
        message.destroy();
    }

    onSearch = () => {
        this.searchOpt = getSearchOpt(this.state.searchOpt);
        const { gxzt, rq_q, rq_z, createStartTime, createEndTime, gxStartTime, gxEndTime } = this.searchOpt;
        if (gxzt == 5 || gxzt == 1) {
            if (rq_q === '' && createStartTime === '' && gxStartTime === '') {
                message.info('采集日期，开票日期, 勾选日期不能同时为空');
                return;
            }
            if (gxStartTime && moment(gxEndTime, 'YYYY-MM-DD').diff(moment(gxStartTime, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 勾选日期跨度不能大于31天');
                return;
            }
        } else {
            if (rq_q === '' && createStartTime === '') {
                message.info('采集日期，开票日期不能同时为空');
                return;
            }
        }
        if (rq_q && moment(rq_z, 'YYYY-MM-DD').diff(moment(rq_q, 'YYYY-MM-DD'), 'days') > 31) {
            message.info('数据过多, 开票日期跨度不能大于31天');
            return;
        }
        if (createStartTime && moment(createEndTime, 'YYYY-MM-DD').diff(moment(createStartTime, 'YYYY-MM-DD'), 'days') > 31) {
            message.info('数据过多, 采集日期跨度不能大于31天');
            return;
        }
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
        const fplxs = [];
        const ses = [];
        const jes = [];
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
                fplxs.push(curData.invoiceType);
                jes.push(curInvoiceAmount);
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
                    fplx: fplxs.join('='),
                    yxse: yxses.join('='),
                    se: ses.join('='),
                    je: jes.join('='),
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

    addGxLog = async(data, authenticateFlag) => { //全电客户端模式新增勾选日志
        const { clientConfig } = this.props;
        const { loginType } = clientConfig;
        if (!data || parseInt(loginType) === 2) {
            return;
        }
        await kdRequest({
            url: this.props.rpaGxLogUrl,
            timeout: 60000,
            data: {
                ...data,
                deductionPurpose: 1,
                authenticateFlag,
                notDeductibleType: ''
            },
            method: 'POST'
        });
    }

    importExcelInvoices = async(select, cancel) => { //导入清单勾选发票
        if (select.length > 200) {
            message.info('抱歉，一次最多只能勾选200条发票数据！');
            return;
        }
        if (cancel.length > 200) {
            message.info('抱歉，一次最多只能勾选200条发票数据！');
            return;
        }
        let importExcelResult = null;
        if (select.length > 0) { //勾选发票
            const info = this.getGxInvoicesOpt(select, 1);
            if (info.errcode !== '0000') {
                message.info(info.description);
                return;
            }
            const res = await this.importGxInvoices(info);
            if (res) {
                const resData = res.data || {};
                const gxSuccess = resData.success || [];
                const gxFail = resData.fail || [];
                const gxSuccessLen = gxSuccess.length || 0;
                const gxFailLen = gxFail.length || 0;
                let cancelSuccessLen = 0;
                let cancelFailLen = 0;
                if (cancel.length > 0) {
                    const info = this.getGxInvoicesOpt(cancel, 0);
                    if (info.errcode !== '0000') {
                        message.info(info.description);
                        return;
                    }
                    const result = await this.importQxGxInvoice(info);
                    if (result) {
                        const resultData = result.data || {};
                        const cancelSuccess = resultData.success || [];
                        const cancelFail = resultData.fail || [];
                        cancelSuccessLen = cancelSuccess.length || 0;
                        cancelFailLen = cancelFail.length || 0;
                    }
                }
                importExcelResult = {
                    success: { //共成功
                        totalNum: gxSuccessLen + cancelSuccessLen,
                        gxNum: gxSuccessLen,
                        cancelNum: cancelSuccessLen
                    },
                    fail: { //共失败
                        totalNum: gxFailLen + cancelFailLen,
                        gxNum: gxFailLen,
                        cancelNum: cancelFailLen
                    }
                };
            }
        } else {
            if (cancel.length > 0) { //撤销勾选
                const info = this.getGxInvoicesOpt(cancel, 0);
                if (info.errcode !== '0000') {
                    message.info(info.description);
                    return;
                }
                const res = await this.importQxGxInvoice(info);
                if (res) {
                    const resData = res.data || {};
                    const successList = resData.success || [];
                    const failList = resData.fail || [];
                    importExcelResult = {
                        success: { //共成功
                            totalNum: successList.length,
                            gxNum: 0,
                            cancelNum: successList.length
                        },
                        fail: { //共失败
                            totalNum: failList.length,
                            gxNum: 0,
                            cancelNum: failList.length
                        }
                    };
                }
            }
        }
        this.setState({
            importExcelResult
        });
    }


    importGxInvoices = async(info) => { //导入勾选
        message.loading('抵扣勾选中...', 0);
        const res = await kdRequest({
            url: this.props.dkgxUrl,
            timeout: 60000,
            data: {
                ...info.data,
                ...this.props.clientConfig
            },
            method: 'POST'
        });
        message.destroy();
        if (res.errcode === 'loginFail') {
            this.props.onClientLogin(res.data.loginWebUrl, 'importGxInvoices');
            this.setState({
                awaitParam: {
                    name: 'importGxInvoices',
                    param: info
                }
            });
            return;
        }
        if (res.errcode === '91300') {
            Modal.warning({
                title: '温馨提示',
                content: res.description + '请点击重试',
                onOk: () => {
                    this.importGxInvoices(info);
                }
            });
            return;
        }
        this.addGxLog(res.data, 1);
        return res;
    }

    importQxGxInvoice = async(info) => { //导入撤销勾选
        message.loading('抵扣取消勾选中...', 0);
        const res = await kdRequest({
            url: this.props.dkgxUrl,
            timeout: 60000,
            data: {
                ...info.data,
                ...this.props.clientConfig
            },
            method: 'POST'
        });
        message.destroy();
        Modal.destroyAll();
        if (res.errcode === 'loginFail') {
            this.props.onClientLogin(res.data.loginWebUrl, 'importQxGxInvoice');
            this.setState({
                awaitParam: {
                    name: 'importGxInvoices',
                    param: info
                }
            });
            return;
        }
        if (res.errcode === '91300') {
            Modal.warning({
                title: '温馨提示',
                content: res.description + '请点击重试',
                onOk: () => {
                    this.importQxGxInvoice(info);
                }
            });
            return;
        }
        this.addGxLog(res.data, 0);
        return res;
    }

    gxInvoices = async() => { //勾选发票操作
        const selectedRows = this.state.selectedRows;
        if (selectedRows.length > 200) {
            message.info('抱歉，一次最多只能勾选200条发票数据！');
            return;
        }
        const info = this.getGxInvoicesOpt(selectedRows, 1);
        if (info.errcode !== '0000') {
            message.info(info.description);
            return;
        }
        confirm({
            title: '确认进行抵扣勾选操作？',
            content: '发票数量: ' + selectedRows.length + '份, 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
            onOk: async() => {
                message.loading('抵扣勾选中...', 0);
                const res = await kdRequest({
                    url: this.props.dkgxUrl,
                    timeout: 60000,
                    data: {
                        ...info.data,
                        ...this.props.clientConfig
                    },
                    method: 'POST'
                });
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === 'loginFail') {
                    this.props.onClientLogin(res.data.loginWebUrl, 'gxInvoices');
                    return;
                }
                if (res.errcode === '91300') {
                    Modal.warning({
                        title: '温馨提示',
                        content: res.description + '请点击重试',
                        onOk: () => {
                            this.gxInvoices();
                        }
                    });
                    return;
                }
                if (res.errcode === '0000') {
                    // 完全勾选成功
                    modalSuccess({
                        title: '抵扣勾选成功',
                        content: res.description
                    });
                    this.fetchList(1);
                } else {
                    const { selectedRows } = this.state;
                    const resData = res.data || {};
                    const successList = resData.success || [];
                    const failList = resData.fail || [];
                    modalError({
                        title: '抵扣勾选出错',
                        content: res.description
                    });
                    this.fetchList(1);
                    if (failList) {
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
                                    taxPeriod: failList[index].taxPeriod,
                                    description: failList[index].description,
                                    effectiveTaxAmount: failList[index].effectiveTaxAmount
                                });
                            }
                        }
                        this.setState({
                            dkgxErrList: gxErrList,
                            dkgxSuccessList: successList
                        });
                    }
                }
                this.addGxLog(res.data, 1);
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
        confirm({
            title: '确认进行抵扣取消勾选操作？',
            content: '发票数量: ' + selectedRows.length + ', 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
            onOk: async() => {
                message.loading('抵扣取消勾选中...', 0);
                const res = await kdRequest({
                    url: this.props.dkgxUrl,
                    timeout: 60000,
                    data: {
                        ...info.data,
                        ...this.props.clientConfig
                    },
                    method: 'POST'
                });
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === 'loginFail') {
                    this.props.onClientLogin(res.data.loginWebUrl, 'qxGxInvoices');
                    return;
                }
                if (res.errcode === '91300') {
                    Modal.warning({
                        title: '温馨提示',
                        content: res.description + '请点击重试',
                        onOk: () => {
                            this.qxGxInvoices();
                        }
                    });
                    return;
                }
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
                this.addGxLog(res.data, 0);
            }
        });
    }

    //直接查询税局数据，暂时保留

    fetchList = async(c, size = this.state.pageSize, disabledClear) => {
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
            if (res.data && res.data.length > 0) {
                this.checkShrSource(res.data);
            } else {
                message.info('未查询到任何发票');
            }
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
            batchNo,
            dkgxErrList,
            dkgxSuccessList
        } = this.state;
        const { skssq = '' } = this.props || {};
        const gxrqfw = '';
        const { clientType, isEntryVoucher, userSource, showChooseModal, isShowAccount, defaultAccount } = this.props;
        const disabled = selectedRows.length === 0;
        const { clientConfig } = this.props;
        const { loginType } = clientConfig;
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
        const dkgxCols = getDkGxInvoiceCols(this.onChangeYxse, selectedRowKeys, page, pageSize);
        let scollX = 1960;
        dkgxCols.splice(-3, 0, ...preSelectCols);
        if (isEntryVoucher === 1 && userSource != '8') {
            dkgxCols.splice(-1, 0, ...entryVoucherCols);
            scollX += 280;
        }
        const { shrSlogan } = this.state;
        if (shrSlogan && userSource != '8') {
            dkgxCols.push(shrSource);
            scollX += 200;
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
                    userSource={userSource}
                    getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                    gitReviewerUrl={this.props.gitReviewerUrl}
                    showChooseModal={showChooseModal}
                    isShowAccount={isShowAccount}
                    defaultAccount={defaultAccount}
                />
                <div className='optBtns'>
                    <Tooltip title='一次最多只能勾选200条发票数据！'>
                        <Button type='primary' style={{ marginRight: 20 }} disabled={disabled || searchOpt.gxzt == 1} onClick={this.gxInvoices}>勾选发票</Button>
                    </Tooltip>
                    <Button type='primary' disabled={disabled || searchOpt.gxzt == 0} onClick={this.qxGxInvoices}>撤销勾选</Button>
                    {
                        parseInt(loginType) === 2 && isEntryVoucher === 1 ? (
                            <Button disabled={disabledGxAll} onClick={this.gxAllInvoices} style={{ marginLeft: 20 }}>全部勾选</Button>
                        ) : null
                    }
                    <GxExcelList
                        displayCls={this.props.displayCls || 'none'}
                        gxExportUrl={this.props.gxExportUrl}
                        gxImportUrl={this.props.gxImportUrl}
                        deductionPurpose={1}
                        searchOpt={{
                            ...this.searchOpt,
                            deductionPurpose: this.searchOpt && this.searchOpt.gxzt === '0' ? '' : '1', //1抵扣，2不抵扣
                            pageSize,
                            page
                        }}
                        onImportExcelInvoices={this.importExcelInvoices}
                        importExcelResult={this.state.importExcelResult}
                        onCloseResult={() => { this.setState({ importExcelResult: null }); this.fetchList(1); }}
                        onClickGxLog={this.props.onOpenGxLog}
                    />
                    {
                        this.props.exportUrl ? (
                            <Button loading={exporting} onClick={this.exportData} style={{ marginLeft: 20 }}>数据导出</Button>
                        ) : null
                    }
                    <span onClick={this.onGetExcelParam} style={{ marginLeft: 20, color: '#3598ff', cursor: 'pointer' }}>勾选发票失败？导出发票登录税局手工勾选</span>
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
                    pageSizeOptions={['100', '200', '500', '1000']}
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
                <Modal
                    title='抵扣勾选失败列表'
                    visible={dkgxErrList.length > 0 && !showDetailList}
                    width={1200}
                    footer={null}
                    maskClosable={false}
                    onCancel={() => { this.setState({ dkgxErrList: [], dkgxSuccessList: [] }); }}
                >
                    <GxFailInvoiceList
                        listData={dkgxErrList}
                        successListData={dkgxSuccessList}
                    />
                </Modal>
            </div>
        );
    }
}

DkgxInvoices.propTypes = {
    access_token: PropTypes.string,
    dkgxUrl: PropTypes.string.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired,
    shrSourceUrl: PropTypes.string.isRequired,
    dkgxAllUrl: PropTypes.string,
    rpaGxLogUrl: PropTypes.string,
    isEntryVoucher: PropTypes.number,
    getSingleAccountUrl: PropTypes.string.isRequired,
    singleExportUrl: PropTypes.string.isRequired,
    dkgxProgressUrl: PropTypes.string.isRequired,
    gxExportUrl: PropTypes.string,
    gxImportUrl: PropTypes.string,
    exportUrl: PropTypes.string,
    excelParamUrl: PropTypes.string,
    getAuthCodeUrl: PropTypes.string,
    skssq: PropTypes.string,
    clientType: PropTypes.number,
    userSource: PropTypes.string,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string,
    clientConfig: PropTypes.object,
    onClientLogin: PropTypes.func.isRequired,
    onOpenGxLog: PropTypes.func,
    displayCls: PropTypes.bool,
    showChooseModal: PropTypes.func,
    isShowAccount: PropTypes.bool,
    defaultAccount: PropTypes.object
};

export default DkgxInvoices;
import React from 'react';
import GxFailInvoiceList from './gxFailInvoiceList';
import { Button, Table, message, Pagination, Modal, Select, Checkbox, Tooltip } from 'antd';
import GxInvoicesSearch from './gxInvoicesSearch';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getBdkGxInvoiceCols, entryVoucherCols, preSelectCols } from '../commons/gxInvoiceCols';
import { kdRequest } from '@piaozone.com/utils';
import { confirm, modalSuccess, modalError } from '../commons/antdModal';
import { selectInvoices } from '../commons/selectInvoices';
import { initSearchOpt, getSearchOpt, entryDateFun } from './searchTools';
import GxExcelList from './gxExcelList';
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
            },
            awaitParam: {
                name: ''
            },
            dkgxErrList: [], //勾选失败的发票
            dkgxSuccessList: []
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
                if (apiName === 'confirmBdkGx') {
                    this.confirmBdkGx(awaitParam.param);
                } else if (apiName === 'qxGxInvoices') {
                    this.qxGxInvoices();
                } else if (apiName === 'importGxInvoices') {
                    this.importGxInvoices(awaitParam.param);
                } else if (apiName === 'importQxGxInvoice') {
                    this.importQxGxInvoice(awaitParam.param);
                }
                this.setState({
                    awaitParam: { name: '' }
                });
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
        const fplxs = [];
        const ses = [];
        const jes = [];
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
                fplxs.push(curData.invoiceType);
                ses.push(curSe);
                jes.push(curInvoiceAmount);
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
                    fplx: fplxs.join('='),
                    se: ses.join('='),
                    je: jes.join('='),
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

    preGetgxInvoiceInfo(info) {
        const { serialNos, fpdm, fphm, yxse = '', notDeductibleTypes } = info;
        const fpdms = fpdm.split('=');
        const fphms = fphm.split('=');
        const yxses = yxse.split('=');

        const infos = {};
        for (let i = 0; i < fpdms.length; i++) {
            let dkCause = null;
            if (notDeductibleTypes && notDeductibleTypes.length > 0) {
                dkCause = notDeductibleTypes[i];
            }
            infos['k' + fpdms[i] + '-' + fphms[i]] = {
                serialNo: serialNos[i],
                yxse: yxse ? yxses[i] || '' : '',
                notDeductibleType: dkCause
            };
        }
        return infos;
    }

    addGxLog = async(data, authenticateFlag, info) => { //全电客户端模式新增勾选日志
        const { clientConfig } = this.props;
        const { loginType } = clientConfig;
        if (!data || parseInt(loginType) === 2) {
            return;
        }
        const { success, fail } = data;
        let successData = [];
        let failData = [];
        if (success && success.length > 0) {
            successData = success.map((item) => {
                const invoiceCode = item.invoiceCode || ''; //防止全电undifined
                const invoiceNo = item.invoiceNo;
                if (info) {
                    const preInvoiceInfo = this.preGetgxInvoiceInfo(info);
                    const upInfo = preInvoiceInfo['k' + invoiceCode + '-' + invoiceNo];
                    return {
                        ...item,
                        notDeductibleType: authenticateFlag == 1 ? upInfo.notDeductibleType : ''
                    };
                }
                return item;
            });
        }
        if (fail && fail.length > 0) {
            failData = fail.map((item) => {
                const invoiceCode = item.invoiceCode || ''; //防止全电undifined
                const invoiceNo = item.invoiceNo;
                if (info) {
                    const preInvoiceInfo = this.preGetgxInvoiceInfo(info);
                    const upInfo = preInvoiceInfo['k' + invoiceCode + '-' + invoiceNo];
                    return {
                        ...item,
                        notDeductibleType: authenticateFlag == 1 ? upInfo.notDeductibleType : ''
                    };
                }
                return item;
            });
        }

        await kdRequest({
            url: this.props.rpaGxLogUrl,
            timeout: 60000,
            data: {
                ...data,
                success: successData,
                fail: failData,
                deductionPurpose: 2, //不抵扣勾选
                authenticateFlag //0 取消勾选 1 勾选
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
        message.loading('不抵扣勾选中...', 0);
        const res = await kdRequest({
            url: this.props.bdkgxUrl,
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
        this.addGxLog(res.data, 1, info.data);
        return res;
    }

    importQxGxInvoice = async(info) => { //导入撤销勾选
        message.loading('不抵扣取消勾选中...', 0);
        const res = await kdRequest({
            url: this.props.bdkgxUrl,
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

    gxInvoices = async() => {
        const list = this.state.selectedRows;
        if (list.length > 200) {
            message.info('抱歉，一次最多只能勾选200条发票数据！');
            return;
        }
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
        try {
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
            const res = await kdRequest({
                url: this.props.bdkgxUrl,
                timeout: 60000,
                data: {
                    ...info.data,
                    ...this.props.clientConfig
                },
                method: 'POST'
            });
            message.destroy();
            if (res.errcode === 'loginFail') {
                this.props.onClientLogin(res.data.loginWebUrl, 'confirmBdkGx');
                this.setState({
                    awaitParam: {
                        name: 'confirmBdkGx',
                        param: opt
                    }
                });
                return;
            }
            if (res.errcode === '91300') {
                Modal.warning({
                    title: '温馨提示',
                    content: res.description + '请点击重试',
                    onOk: () => {
                        this.confirmBdkGx(opt);
                    }
                });
                return;
            }
            if (res.errcode === '0000') {
                // 完全勾选成功
                modalSuccess({
                    title: '不抵扣勾选成功',
                    content: res.description
                });
                this.fetchList(1);
            } else {
                const { selectedRows } = this.state;
                const resData = res.data || {};
                const successList = resData.success || [];
                const failList = resData.fail || [];
                modalError({
                    title: '不抵扣勾选出错',
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
            this.addGxLog(res.data, 1, info.data);
        } catch (error) {
            console.log('error----', error);
        }
    }

    qxGxInvoices = async() => {
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
                const res = await kdRequest({
                    url: this.props.bdkgxUrl,
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
                this.addGxLog(res.data, 0);
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
        const {
            listData,
            selectedRows,
            totalNum,
            pageSize,
            dataIndex,
            loading,
            searchOpt,
            batchSelect,
            batchBdkgxReson,
            bdkgxObj,
            dkgxErrList,
            dkgxSuccessList
        } = this.state;
        const { gxrqfw = '', skssq = '', showChooseModal, isShowAccount, defaultAccount } = this.props;
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
                    skssq={skssq}
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
                    <GxExcelList
                        displayCls={this.props.displayCls || 'none'}
                        gxExportUrl={this.props.gxExportUrl}
                        gxImportUrl={this.props.gxImportUrl}
                        deductionPurpose={2}
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
                    pageSizeOptions={['50', '100', '200', '500', '1000']}
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
                <Modal
                    title='不抵扣勾选失败列表'
                    visible={dkgxErrList.length > 0}
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
    bdkgxUrl: PropTypes.string.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired,
    shrSourceUrl: PropTypes.string.isRequired,
    gxExportUrl: PropTypes.string,
    gxImportUrl: PropTypes.string,
    rpaGxLogUrl: PropTypes.string,
    access_token: PropTypes.string,
    clientType: PropTypes.number,
    skssq: PropTypes.string,
    gxrqfw: PropTypes.string,
    isEntryVoucher: PropTypes.string,
    userSource: PropTypes.userSource,
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
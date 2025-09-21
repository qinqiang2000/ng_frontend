/*eslint-disable*/
import React from 'react';
import { Button, Table, message, Pagination, Tooltip, Select, Modal, Checkbox } from 'antd';
import moment from 'moment';
import PreSelectSearch from './preSelectSearch';
import PropTypes from 'prop-types';
import { preSelectCols } from './preSelectCol';
import { kdRequest, tools, paramJson } from '@piaozone.com/utils';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import { confirm } from './commons/antdModal';
import { selectInvoices } from './commons/selectInvoices';
import './style.less';
const { Option } = Select;
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;
const startTime = moment().add(-30, 'day').format('YYYY-MM-DD');
const reson = [
    { text: '请选择不抵扣原因', value: 0 },
    { text: '用于非应税项目', value: 1 },
    { text: '用于免税项目', value: 2 },
    { text: '用于集体福利或者个人消费', value: 3 },
    { text: '遭受非正常损失', value: 4 },
    { text: '其他', value: 5 }
];
const { Column } = Table;
class PreSelect extends React.Component {
    constructor(props) {
        super(...arguments);
        this.initSearchOpt = {
            collectTime: [moment(startTime), moment()],
            invoiceTime: [null, null],
            invoiceStatus: '0',
            invoiceCode: '',
            invoiceNoStart: '',
            invoiceNoEnd: '',
            salerName: '',
            pageNo: 1,
            sourceType: 1,
            collectUser: '', //采集人电话
            preSelector: '', //预勾选人名称
            invoiceType: '', //发票类型
            preSelectTime: [null, null], //预勾选时间
            deductionPurpose: '', //2:未抵扣：1抵扣  ‘’未抵扣
            isFauthenticate: '0', //勾选状态 0 未勾选 5 预勾
            isCheck: 1, //1：是， 2： 否
            expendStatus: '',
            accountDate: ''
        };
        this.qrQRArry = [];
        this.state = {
            searchOpt: {
                ...this.initSearchOpt
            },
            listData: [],
            dataIndex: 0,
            selectedRows: [],
            totalNum: 0,
            pageSize: 50,
            loading: false,
            dkgxErrList: [],
            showGxDetailList: false,
            showInvoiceInput: false,
            invoiceNoLikeLoading: false,
            invoiceNoLike: '',
            invoiceNoLikeList: [],
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
        this.qrInput = document.getElementById('qrStrInput');
        this.onSearch();
    }

    onReset = () => {
        this.setState({
            searchOpt: {
                ...this.initSearchOpt
            },
            listData: []
        });
    }

    onSearch = () => {
        this.qrQRArry = []; //清空扫码枪数组
        this.searchOpt = this.getSearchOpt(this.state.searchOpt);
        this.fetchList(1, this.state.pageSize);
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

    getSearchOpt(searchOpt) {
        const { invoiceTime, collectTime, preSelectTime, ...otherOpt } = searchOpt;
        const invoiceType = searchOpt.invoiceType;
        let result = {
            ...otherOpt,
            invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', //发票日期起
            invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', //发票日期止
            collectTimeStart: collectTime && collectTime[0] ? collectTime[0].format('YYYY-MM-DD') : '', //采集日期起
            collectTimeEnd: collectTime && collectTime[1] ? collectTime[1].format('YYYY-MM-DD') : '',
            preSelectTimeStart: preSelectTime && preSelectTime[0] ? preSelectTime[0].format('YYYY-MM-DD') : '', //预勾选日期
            preSelectTimeEnd: preSelectTime && preSelectTime[1] ? preSelectTime[1].format('YYYY-MM-DD') : '' //预勾选日期
        };

        if (invoiceType !== '' && addedInvoiceTypes.indexOf(invoiceType) === -1) {
            result = {
                ...result,
                invoiceCode: '',
                invoiceNo: '',
                salerName: '',
                invoiceStatus: ''
            };
        }
        return result;
    }

    changeOpt = (name, value) => {
        const newOpt = {
            ...this.state.searchOpt,
            [name]: value
        };
        if (name === 'isFauthenticate') {
            if (value === '0') {
                newOpt.deductionPurpose = '';
            } else {
                newOpt.deductionPurpose = '1';
            }
        }

        if (name === 'deductionPurpose') {
            if (value == '1' || value == '2') {
                newOpt.isFauthenticate = '5';
            } else {
                newOpt.isFauthenticate = '0';
            }
        }

        this.setState({
            searchOpt: newOpt
        });
    }

    getGxInvoicesOpt(rows, zt, type = '') {
        let description = '';
        let totalAmount = 0.00;
        let totalTaxAmount = 0.00;
        let totalYxTaxAmount = 0.00;
        const invoiceData = [];
        for (let i = 0; i < rows.length; i++) {
            const curData = rows[i];
            const curInvoiceAmount = parseFloat(curData.invoiceAmount);
            const taxAmount = curData.taxAmount || curData.totalTaxAmount;
            const curSe = parseFloat(taxAmount);
            let yxse = curData.yxse;
            if (typeof yxse === 'undefined') {
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
            yxse = yxse.toString();
            let notDeductibleType = curData.notDeductibleType || null;
            if (type == 1) {
                notDeductibleType = null;
            }
            if (zt === 0) {
                if (isNaN(yxse) || yxse.charAt(0) == '-') {
                    description = '有效税额输入有误，请检查！';
                    break;
                } else if (curSe < yxse) {
                    description = '有效税额不能大于税额，请检查！';
                    break;
                }
            }
            if (zt === 0 || zt === 5) {
                const item = {
                    effectiveTaxAmount: yxse,
                    serialNo: curData.serialNo,
                    notDeductibleType,
                    type
                };
                invoiceData.push(item);
            }
        };

        if (!description) {
            return {
                errcode: '0000',
                data: invoiceData,
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

    dkYgxInvoices = async() => { //抵扣预勾选
        const selectedRows = this.state.selectedRows;
        let allowSubmit = true;
        for (const item of selectedRows) {
            if (item.authenticateFlag == 5) {
                allowSubmit = false;
            }
        }
        if (!allowSubmit) {
            message.info('请将选中的“预勾选”发票取消勾选');
        } else {
            const info = this.getGxInvoicesOpt(selectedRows, 0, 1);
            if (info.errcode !== '0000') {
                message.info(info.description);
                return;
            }
            confirm({
                title: '确认进行“抵扣预勾选”操作？',
                content: '发票数量: ' + selectedRows.length + ', 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
                onOk: async() => {
                    this.preSelectOperate(info.data);
                }
            });
        }
    }

    bdkYgxInvoice = async() => { //不抵扣预勾选
        const selectedRows = this.state.selectedRows;
        let allowSubmit = true;
        for (const item of selectedRows) {
            if (item.authenticateFlag == 5) {
                allowSubmit = false;
            }
        }
        if (!allowSubmit) {
            message.info('请将选中的“预勾选”发票取消勾选');
        } else {
            const info = this.getGxInvoicesOpt(selectedRows, 0, 2);
            if (info.errcode !== '0000') {
                message.info(info.description);
                return;
            }
            this.setState({
                bdkgxObj: {
                    bdkgxStatus: true,
                    selectedRowsLen: selectedRows.length,
                    selectInfo: info
                }
            });
        }
    }

    qxGxInvoices = async() => { //取消预勾选操作
        const selectedRows = this.state.selectedRows;
        let allowSubmit = true;
        for (const item of selectedRows) {
            if (item.authenticateFlag != 5) {
                allowSubmit = false;
            }
        }
        if (!allowSubmit) {
            message.info('当前选中的发票存在“未勾选”');
        } else {
            const info = this.getGxInvoicesOpt(selectedRows, 5, 3);
            if (info.errcode !== '0000') {
                message.info(info.description);
                return;
            }
            confirm({
                title: '确认进行取消预勾选操作？',
                content: '发票数量: ' + selectedRows.length + ', 总不含税金额：' + info.totalAmount + ', 总税额: ' + info.totalTaxAmount + ', 总有效税额：' + info.totalYxTaxAmount,
                onOk: async() => {
                    this.preSelectOperate(info.data);
                }
            });
        }
    }

    startScanQr = () => {
        if (this._isMounted) {
            this.tick = setTimeout(() => {
                if (this.state.showInput) {
                    if (this.qrInput) {
                        this.qrInput.click();
                        this.qrInput.focus();
                    }
                }
                this.startScanQr();
                return false;
            }, 200);
        }
    }

    hideScanQr = () => {
        this.qrInput.value = '';
        this.setState({
            showQrInput: false
        });
        window.clearTimeout(this.tick);
    }

    toggleScanQr = () => {
        this.qrInput.value = '';
        const newStatus = !this.state.showQrInput;
        this.setState({
            showQrInput: newStatus
        });
        if (newStatus) {
            this.startScanQr();
        } else {
            window.clearTimeout(this.tick);
        }
    }

    onQrInputKeyUp = async(e) => { //扫码枪录入
        if (e.keyCode === 13) {
            this.disabledInput = true;
            const v = this.qrInput.value;
            this.qrInput.value = '';
            const scanResult = tools.getInvoiceQrInfoNew(v);
            if (scanResult.errcode === '0000') {
                if (scanResult.qrcodeType === 'web') {
                    message.info('暂不支持该类型区块链发票扫码');
                } else {
                    const { fpdm, fphm } = scanResult.data;
                    const qrQRArry = this.qrQRArry;
                    if (qrQRArry.length == 0) {
                        qrQRArry.push({ invoiceCode: fpdm, invoiceNo: fphm });
                    } else {
                        let allowPush = true;
                        for (const item of qrQRArry) {
                            if (item.invoiceCode == fpdm && item.invoiceNo == fphm) {
                                allowPush = false;
                            }
                        }
                        if (allowPush) {
                            qrQRArry.push({ invoiceCode: fpdm, invoiceNo: fphm });
                        }
                    }
                    const searchOpt = {
                        ...this.state.searchOpt,
                        invoiceList: qrQRArry
                    };
                    this.searchOpt = this.getSearchOpt(searchOpt);
                    this.fetchList(1, this.state.pageSize);
                }
            } else {
                message.info(scanResult.description);
                this.qrInput.focus();
                this.qrInput.value = '';
            }
        }
    }

    batchDelete = () => { //批量删除
        //const selectedRows = this.state.selectedRows;
        confirm({
            title: '温馨提示',
            content: '确定要从列表中删除已选中的发票吗！',
            onOk: () => {
                console.log('确定');
            }
        });
    }

    async fetchList(c, size = this.state.pageSize, disabledClear) { //查询
        // 查询后，发票号码选票需清空原查询列表，原查询选中的标识
        this.needEmpty = true;
        this.setState({
            loading: true
        });
        const requestData = {
            ...this.searchOpt, //1抵扣，2不抵扣
            expenseReviewer: this.searchOpt.expenseReviewer === '筛选有审核人的发票' ? '' : this.searchOpt.expenseReviewer,
            expenseReviewerNotNull: this.searchOpt.expenseReviewer === '筛选有审核人的发票' ? 1 : '',
            expenseSystemSource: this.searchOpt.expenseSystemSource === '筛选有来源系统的发票' ? '' : this.searchOpt.expenseSystemSource,
            expenseSystemSourceNotNull: this.searchOpt.expenseSystemSource === '筛选有来源系统的发票' ? 1 : '',
            pageSize: size,
            pageNo: c
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
            this.checkShrSource(res.data);
        } else {
            this.setState({
                loading: false
            });
            message.info(res.description);
        }
    }

    async preSelectOperate(opt) {
        message.loading('加载中...', 0);
        const res = await this.props.onPreSelect(opt);
        if (res.errcode == '0000') {
            // this.setState({
            //     listData: res.data
            // });
            this.onSearch();
        } else {
            message.info(res.description);
        }
        message.destroy();
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
                        yxse: r.taxAmount || r.totalTaxAmount,
                        notDeductibleType: r.notDeductibleType || null
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
            }
        });
    }

    exportData = () => {
        confirm({
            title: '全部发票导出提示',
            content: '是否导出当前查询的所有发票，请确认！',
            onOk: () => {
                const opt = this.getSearchOpt(this.state.searchOpt);
                message.loading('下载中...', 0);
                window.location.href = this.props.exportUrl + '?' + paramJson(opt);
                setTimeout(() => {
                    message.destroy();
                }, 2000);
            }
        });
    }

    onSearchInvoiceNoLike = (v) => {
        const value = v.replace(/\D/g, '');
        if (value.length < 4) {
            return;
        }
        // 防抖
        if (this.fetchTimer) {
            clearTimeout(this.fetchTimer);
        }
        this.fetchTimer = setTimeout(() => {
            this.fetchInvoiceNoLikeList(value);
        }, 300);
    }

    onSelectInvoiceNoLike = (r) => {
        let { invoiceNoLikeList, listData, selectedRows } = this.state;
        // 置空原查询列表，原选中
        if (this.needEmpty) {
            this.needEmpty = false;
            listData = [];
            selectedRows = [];
        }
        // 多次查询避免重复选取
        const tem = listData.filter(o => o.serialNo === r.serialNo);
        if (!tem.length) {
            listData.push(r);
            selectedRows.push(r);
        }
        this.setState({
            invoiceNoLikeList: invoiceNoLikeList.filter(o => o.serialNo !== r.serialNo),
            listData,
            selectedRows,
            dataIndex: 0,
            pageSize: 50,
            totalNum: listData.length
        });
    }

    async fetchInvoiceNoLikeList(invoiceNoLike) {
        const data = {
            sourceType: 1,
            invoiceNoLike,
            pageNo: 1,
            pageSize: 50
        };
        this.setState({ invoiceNoLikeLoading: true });
        let url = this.props.invoiceNoLikeSearchUrl;
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }
        const res = await kdRequest({
            url: url,
            timeout: 60000,
            data,
            method: 'POST'
        });
        this.setState({ invoiceNoLikeLoading: false });
        if (res.errcode === '0000') {
            this.setState({
                invoiceNoLike,
                invoiceNoLikeList: res.data || []
            });
        } else {
            message.error(res.description);
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

    confirmBdkGx = (opt) => {
        const { info } = opt;
        const { batchBdkgxReson, batchSelect, bdkgxObj } = this.state;
        let selectData = [];
        if (batchSelect) {
            if (batchBdkgxReson) {
                selectData = info.data.map((item) => {
                    return {
                        ...item,
                        notDeductibleType: batchBdkgxReson
                    };
                });
            } else {
                message.info('请先批量选择不抵扣原因');
                return;
            }
        } else {
            selectData = info.data;
        }
        for (const item of selectData) {
            if (!item.notDeductibleType) {
                message.info('存在未选择“不抵扣原因”的发票，请先选择');
                return;
            }
        }
        this.setState({
            bdkgxObj: {
                ...bdkgxObj,
                bdkgxStatus: false
            }
        });
        this.preSelectOperate(selectData);
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
            showQrInput,
            showInvoiceInput,
            invoiceNoLikeLoading,
            invoiceNoLike,
            invoiceNoLikeList,
            batchSelect,
            batchBdkgxReson,
            bdkgxObj
        } = this.state;
        const { userSource } = this.props;
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
        const renderDeductionReason = { //不抵扣勾选原因
            title: '不抵扣原因',
            dataIndex: 'notDeductibleType',
            align: 'center',
            width: 240,
            render: (v, r, i) => {
                const { authenticateFlag } = r;
                const disabled = !(authenticateFlag == 0);
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
        const page = parseInt(dataIndex / pageSize) + 1;
        const { totalAmount = 0.00, totalTaxAmount = 0.00 } = this.getGxInvoicesOpt(selectedRows, -1);
        const dkgxCols = preSelectCols(this.onChangeYxse, selectedRowKeys);
        const { shrSlogan } = this.state;
        if (shrSlogan && userSource != '8') {
            dkgxCols.push(shrSource);
        }
        dkgxCols.splice(dkgxCols.length - 7, 0, renderDeductionReason);
        return (
            <div className='preSelect clearfix'>
                <PreSelectSearch
                    changeOpt={this.changeOpt}
                    searchOpt={searchOpt}
                    userSource={userSource}
                    getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                    gitReviewerUrl={this.props.gitReviewerUrl}
                />
                <div
                    className='scanQrBox clearfix'
                    style={{
                        display: showQrInput ? 'block' : 'none',
                        border: '1px solid #d9d9d9',
                        padding: '10px',
                        margin: '0px 0 10px',
                        background: '#fbfbfb',
                        minWidth: 1178
                    }}
                >
                    <label>扫描枪录入：</label>
                    <input
                        type='text'
                        autoFocus
                        id='qrStrInput'
                        defaultValue=''
                        className='ant-input'
                        onKeyUp={this.onQrInputKeyUp}
                        placeholder='请当光标在输入框后开始扫码'
                        style={{ width: 220 }}
                    />
                    <span style={{ fontSize: 12, margin: '0 15px', color: '#FF9524' }}>注意：使用扫码枪时需要把结束符设置为回车, 不要开启中文输入法，否则可能出现异常</span>
                    <a href='https://jingyan.baidu.com/article/363872ec3b3a3a6e4ba16fc0.html' target='_blank' rel='noopener noreferrer'>扫码枪设置方法</a>
                    <Button style={{ float: 'right' }} onClick={this.hideScanQr}>收起</Button>
                </div>
                <div
                    className='scanQrBox clearfix'
                    style={{
                        display: showInvoiceInput ? 'block' : 'none',
                        border: '1px solid #d9d9d9',
                        padding: '10px',
                        margin: '0px 0 10px',
                        background: '#fbfbfb',
                        minWidth: 1178
                    }}
                >
                    <label>发票号码选票：</label>
                    <Select
                        showSearch
                        mode='multiple'
                        placeholder='输入4位以上发票号码进行查找'
                        style={{ width: 230 }}
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        filterOption={false}
                        onSearch={this.onSearchInvoiceNoLike}
                        onBlur={() => this.setState({ showInvoiceInput: false })}
                        dropdownMatchSelectWidth={false}
                        dropdownRender={() => {
                            return (
                                <div onMouseDown={e => e.preventDefault()}>
                                    <Table
                                        loading={invoiceNoLikeLoading}
                                        rowKey='serialNo'
                                        dataSource={invoiceNoLikeList}
                                        pagination={false}
                                        bordered={false}
                                        onRow={r => {
                                            return {
                                                onClick: () => this.onSelectInvoiceNoLike(r)
                                            };
                                        }}
                                    >
                                        <Column
                                            align='left'
                                            title='发票代码'
                                            dataIndex='invoiceCode'
                                            width={110}
                                        />
                                        <Column
                                            align='left'
                                            title='发票号码'
                                            dataIndex='invoiceNo'
                                            render={t => {
                                                const reg = new RegExp(invoiceNoLike, 'g');
                                                const __html = (t || '').replace(reg, '<span style="color: #1890ff;">$&</span>');
                                                return <span dangerouslySetInnerHTML={{ __html }} />;
                                            }}
                                            width={80}
                                        />
                                        <Column
                                            align='right'
                                            title='不含税金额'
                                            dataIndex='totalAmount'
                                            render={t => ('￥' + t)}
                                            width={100}
                                        />
                                    </Table>
                                </div>
                            );
                        }}
                    />
                    <span style={{ fontSize: 12, margin: '0 15px', color: '#FF9524' }}>提示：点击后将清空列表，并将选中的发票加入列表</span>
                    <Button style={{ float: 'right' }} onClick={() => this.setState({ showInvoiceInput: false })}>收起</Button>
                </div>
                <div className='optBtns'>
                    <Button type='primary' style={{ marginLeft: 15 }} onClick={this.onSearch}>查询</Button>
                    <Tooltip placement='topLeft' title='按号码查找需预勾选的发票'>
                        <Button
                            type='primary'
                            style={{ borderStyle: 'none', marginLeft: 15, display: 'none' }}
                            disabled={showInvoiceInput}
                            onClick={() => this.setState({ showInvoiceInput: true })}
                        >
                            发票号码选票
                        </Button>
                    </Tooltip>
                    <Tooltip placement='topLeft' title='仅清空查询结果，不删除发票'>
                        <Button type='primary' style={{ borderStyle: 'none', marginLeft: 15 }} onClick={this.onReset}>清空页面</Button>
                    </Tooltip>
                    <Button disabled={disabledGxAll} onClick={this.gxAllInvoices} style={{ marginLeft: 20 }} hidden={true}>跨页全选</Button>
                    <Tooltip placement='topLeft' title='仅删除查询结果，不删除发票'>
                        <Button
                            type='primary'
                            style={{ borderStyle: 'none', marginLeft: 15 }}
                            hidden={true}
                            disabled={disabled}
                            onClick={this.batchDelete}
                        >
                            批量删除
                        </Button>
                    </Tooltip>
                    <Tooltip placement='topLeft' title='使用扫码枪查询可勾选发票'>
                        <Button
                            type='primary'
                            style={{ borderStyle: 'none', marginLeft: 15 }}
                            disabled={showQrInput}
                            onClick={this.toggleScanQr}
                        >
                            扫码枪预勾选
                        </Button>
                    </Tooltip>
                    <Tooltip placement='topLeft' title='预标记需在税局抵扣勾选的发票'>
                        <Button type='primary' style={{ borderStyle: 'none', marginLeft: 15 }} disabled={disabled} onClick={this.dkYgxInvoices}>抵扣预勾选</Button>
                    </Tooltip>
                    <Tooltip placement='topLeft' title='预标记需在税局不抵扣勾选的发票'>
                        <Button type='primary' style={{ borderStyle: 'none', marginLeft: 15 }} disabled={disabled} onClick={this.bdkYgxInvoice}>不抵扣预勾选</Button>
                    </Tooltip>
                    <Tooltip placement='topLeft' title='发票恢复未勾选未抵扣状态'>
                        <Button type='primary' style={{ borderStyle: 'none', marginLeft: 15 }} disabled={disabled} onClick={this.qxGxInvoices}>取消预勾选</Button>
                    </Tooltip>
                    {
                        this.props.exportUrl ? (
                            <Button loading={exporting} onClick={this.exportData} style={{ marginLeft: 20 }}>导出Execl</Button>
                        ) : null
                    }
                </div>
                {
                    showQrInput ? (
                        <div className='qrcode' style={{ position: 'relative' }}>
                            <Table
                                rowSelection={rowSelection}
                                rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                                dataSource={listData}
                                columns={dkgxCols}
                                pagination={true}
                                bordered={false}
                                loading={loading}
                                tableLayout='fixed'
                                scroll={{ x: 2100 }}
                            />
                            <div className='tjInfo' style={{ position: 'absolute', bottom: 16, padding: '5px 0' }}>
                                <span>已选<span className='num'>{selectedRows.length}</span>条数据，</span>
                                <span>已选不含税金额<span className='num'>￥{totalAmount}</span></span>，
                                <span>已选税额<span className='num'>￥{totalTaxAmount}</span></span>，
                                <span>总共<span className='num'>{totalNum}</span>条数据</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Table
                                rowSelection={rowSelection}
                                rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                                dataSource={listData}
                                columns={dkgxCols}
                                pagination={false}
                                bordered={false}
                                loading={loading}
                                tableLayout='fixed'
                                scroll={{ x: 2100 }}
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
                                onShowSizeChange={(c, size) => this.fetchList(c, size)}
                                onChange={(c, size) => this.fetchList(c, size, true)}
                            />
                        </>
                    )
                }
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
                                    '发票数量: ' + bdkgxObj.selectedRowsLen +
                                    ', 总不含税金额：' + bdkgxObj.selectInfo.totalAmount + ', 总税额: ' +
                                    bdkgxObj.selectInfo.totalTaxAmount + ', 总有效税额：' + bdkgxObj.selectInfo.totalYxTaxAmount
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

PreSelect.propTypes = {
    access_token: PropTypes.string,
    onPreSelect: PropTypes.func.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired, //查询接口
    invoiceNoLikeSearchUrl: PropTypes.string.isRequired,
    shrSourceUrl: PropTypes.string.isRequired,
    exportUrl: PropTypes.string.isRequired,
    userSource: PropTypes.string.isRequired,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string
};

export default PreSelect;
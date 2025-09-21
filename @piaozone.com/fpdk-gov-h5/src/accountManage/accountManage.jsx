import React from 'react';
// import EditInvoice from '@piaozone.com/editInvoice-pc';
import ScanInvoices from '@piaozone.com/scan-invoices';
import PropTypes from 'prop-types';
import { Button, DatePicker, Pagination, Modal, message, Input, Select, Table, Tooltip, Icon } from 'antd';
import moment from 'moment';
import { INPUT_INVOICE_TYPES, invoice_expense_status, invoiceStatus } from '../commons/constants';
import { columsDictFun } from '../collectInvoices/invoiceCols';
import InvoiceTabs from '../invoicesTabs/';
import { modalInfo, confirm } from '../commons/antdModal';
import { preCheckInvoice } from '../commons/preCheckInvoices.js';
import async from 'async';
import ShowRelateBill from './showRelateBill';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import PrintImg from '@piaozone.com/print-image';
import immutable from 'immutable';
import { tools, pwyFetch } from '@piaozone.com/utils';
import AddExpenseInfo from '@piaozone.com/add-expense-info';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker, MonthPicker } = DatePicker;

const allowDkInvoiceTypes = invoiceTypes.ALLOW_DK_TYPES;
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;
// 勾选状态
const ALL_ISFAUTHENTICATE = [
    { text: '未勾选', value: 0 },
    { text: '预勾选', value: 5 },
    { text: '已勾选', value: 1 },
    { text: '已认证', value: 2 }
];
// 抵扣状态
const ALL_DEDUCTIONPURPOSE = [
    { text: '已抵扣', value: '1' },
    { text: '不抵扣', value: '2' },
    { text: '未抵扣', value: '' }
];

class AccountManage extends React.Component {
    constructor() {
        super(...arguments);
        this.allTabKeys = [];
        this.initSearchOpt = {
            zipPassword: '',
            expenseNum: '',
            collectTime: [moment().startOf('month'), moment()],
            expendTime: [null, null],
            invoiceTime: [null, null],
            authInvoiceDate: [null, null],
            invoiceStatus: '',
            invoiceCode: '',
            invoiceNo: '',
            salerName: '',
            equalNameValue: '',
            signOptionValue: '',
            expendStatus: '',
            isFauthenticate: null, // 0未勾选、5预勾选、1已勾选、2已认证 null全部
            pageNo: 1,
            pageSize: 10,
            collectUser: '', //采集人电话
            collectorName: '', //采集人名称
            invoiceType: '', //发票类型
            deductionPurpose: null, // 1抵扣 2不抵扣 “”（空字符串）未抵扣 null全部
            isCheck: 1 //1：是， 2： 否
        };
        this.state = {
            selectedAllRows: {},
            showMore: false,
            listData: [],
            totalElement: 0,
            invoiceTabsData: {},
            loading: true,
            activeInvoiceType: '',
            selectedAllKeys: {},
            taxPeriod: moment(),
            accountDate: moment(),
            showDkDialog: false,
            curEditInfo: {},
            disabledEdit: false,
            searchOpt: { ...this.initSearchOpt },
            showRelateBillSerialNo: '',
            invoiceSign: {
                showModal: false,
                signer: '',
                signTime: null,
                signContent: ''
            },
            invoiceExpenseInfo: {
                expenseNum: '',
                showModal: false,
                expenseName: '',
                expenseTime: null,
                remark: ''
            }
        };
    }


    componentDidMount = async() => {
        this._isMounted = true;
        this.queryInvoiceNum();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    emptyClick = () => {
        this.setState({
            searchOpt: {
                ...this.initSearchOpt
            }
        });
    }

    onShowEditDialog = (r, i, disabledEdit) => {
        this.onCheckTimes(r, disabledEdit);
    }

    onConfirmEdit = async() => {
        message.destroy();
        message.info('保存成功');
        this.queryInvoiceNum();
        this.setState({
            curEditInfo: {}
        });
    }

    onCheckTimes = async(r, disabledEdit) => {
        const { invoiceType, invoiceCode, invoiceNo } = r;
        let checkCount = null;
        let lastCheckTime = null;
        if ([1, 2, 3, 4, 5, 12, 13, 15].indexOf(invoiceType) != -1) {
            if (typeof this.props.onChecklo === 'function') {
                const res = await this.props.onChecklo({
                    invoiceType,
                    invoiceCode,
                    invoiceNo
                });
                if (res.errcode == '0000') {
                    checkCount = res.data.checkCount;
                    lastCheckTime = res.data.lastCheckTime;
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

    getSearchOpt(searchOpt) {
        const { invoiceTime, collectTime, expendTime, authInvoiceDate, accountDate, ...otherOpt } = searchOpt;
        const invoiceType = searchOpt.invoiceType;
        let result = {
            ...otherOpt,
            accountDate: accountDate ? accountDate.format('YYYYMM') : '',
            invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', //发票日期起
            invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', //发票日期止
            collectTimeStart: collectTime && collectTime[0] ? collectTime[0].format('YYYY-MM-DD') : '', //采集日期起
            collectTimeEnd: collectTime && collectTime[1] ? collectTime[1].format('YYYY-MM-DD') : '',
            expendStartTime: expendTime && expendTime[0] ? expendTime[0].format('YYYY-MM-DD') : '', //审核通过时间
            expendEndTime: expendTime && expendTime[1] ? expendTime[1].format('YYYY-MM-DD') : '',
            authStartTime: authInvoiceDate && authInvoiceDate[0] ? authInvoiceDate[0].format('YYYY-MM-DD') : '', // 认证日期
            authEndTime: authInvoiceDate && authInvoiceDate[1] ? authInvoiceDate[1].format('YYYY-MM-DD') : '' // 认证日期
        };

        if (invoiceType !== '' && addedInvoiceTypes.indexOf(invoiceType) === -1) {
            result = {
                ...result,
                invoiceCode: '',
                invoiceNo: '',
                salerName: '',
                invoiceStatus: '',
                isFauthenticate: '',
                authStartTime: '',
                authEndTime: '',
                signOptionValue: '',
                equalNameValue: ''
            };
        }
        return result;
    }

    queryInvoiceNum = async(onlyUpdateNum, pageNo = this.state.searchOpt.pageNo,
        pageSize = this.state.searchOpt.pageSize,
        activeInvoiceType = this.state.activeInvoiceType
    ) => {
        if (!this._isMounted) {
            return false;
        }

        const optResult = this.getSearchOpt(this.state.searchOpt);
        const {
            expendStartTime = '',
            expendEndTime = '',
            collectTimeStart = '',
            collectTimeEnd = '',
            invoiceTimeStart = '',
            invoiceTimeEnd = ''
        } = optResult;
        if (collectTimeStart === '' && invoiceTimeStart === '' && expendStartTime === '') {
            message.info('采集日期，开票日期，审核通过时间不能同时为空');
            return;
        } else if (!collectTimeStart) { // 采集时间为空
            if (!expendStartTime && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 开票日期跨度不能大于31天');
                return;
            } else if (!invoiceTimeStart && moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 审核通过时间跨度不能大于31天');
                return;
            } else if (
                moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31 &&
                moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31
            ) {
                message.info('数据过多, 开票日期和审核通过时间跨度不能同时大于31天');
                return;
            }
        } else if (!invoiceTimeStart) { // 开票日期为空
            if (!expendStartTime && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 采集日期跨度不能大于31天');
                return;
            } else if (!collectTimeStart && moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 审核通过时间跨度不能大于31天');
                return;
            } else if (
                (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
                (moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31)
            ) {
                message.info('数据过多, 采集日期和审核通过时间跨度不能同时大于31天');
                return;
            }
        } else if (!expendStartTime) { // 审核报销时间为空
            if (!invoiceTimeStart && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 采集日期跨度不能大于31天');
                return;
            } else if (!collectTimeStart && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 开票日期跨度不能大于31天');
                return;
            } else if (
                (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
                (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31)
            ) {
                message.info('数据过多, 采集日期和开票日期跨度不能同时大于31天');
                return;
            }
        } else if ( // 采集日期、开票日期都不为空
            (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
            (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
            (moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31)
        ) {
            message.info('数据过多, 采集日期、开票日期、审核通过时间跨度不能同时大于31天');
            return;
        }

        this.setState({
            loading: true
        });

        const res = await this.props.onQueryInvoiceNums(optResult);
        if (res.errcode === '0000') {
            const invoiceTabsData = {};
            const resData = res.data || [];
            if (resData.length > 0) {
                let allowActiveInvoiceType;
                for (let i = 0; i < resData.length; i++) {
                    const curData = resData[i];
                    invoiceTabsData['k' + curData.invoiceType] = { num: curData.totalCount };
                    if (curData.invoiceType && !allowActiveInvoiceType) {
                        allowActiveInvoiceType = parseInt(curData.invoiceType);
                    }
                }
                // 如果当前的tab没有发票就切换到第一个
                const activeData = invoiceTabsData['k' + activeInvoiceType];
                if ((!activeData || activeData.num <= 0) && allowActiveInvoiceType) {
                    activeInvoiceType = allowActiveInvoiceType;
                }

                this.setState({
                    invoiceTabsData,
                    activeInvoiceType
                });

                if (!onlyUpdateNum) { // 仅仅刷新数量显示，查验发票时可能发票类型发生变化
                    this.freshList(pageNo, pageSize, activeInvoiceType);
                }
            } else {
                this.setState({
                    loading: false,
                    invoiceTabsData,
                    activeInvoiceType,
                    listData: [],
                    selectedAllKeys: {}
                });
                this.allTabKeys = [];
            }
        } else {
            this.setState({
                loading: false,
                listData: [],
                selectedAllKeys: {}
            });
            message.info(res.description);
        }
        return res;
    }

    freshList = async(pageNo = this.state.searchOpt.pageNo, pageSize = this.state.searchOpt.pageSize, invoiceType = this.state.activeInvoiceType) => {
        if (!this._isMounted) {
            return false;
        }

        this.setState({
            loading: true
        });

        const newSearchOpt = this.getSearchOpt(this.state.searchOpt);
        const res = await this.props.onQueryAccount({
            ...newSearchOpt,
            invoiceType,
            pageSize,
            pageNo
        });

        this.setState({
            loading: false
        });

        const resData = res.data || [];
        if (res.errcode === '0000') {
            this.setState({
                totalElement: res.totalElement || 0,
                loading: false,
                listData: resData,
                activeInvoiceType: invoiceType,
                searchOpt: {
                    ...this.state.searchOpt,
                    pageSize,
                    pageNo
                }
            });
        } else {
            message.info(res.description);
        }
    }

    onSearch = async() => {
        this.setState({
            selectedAllKeys: {},
            selectedAllRows: {}
        });
        this.allTabKeys = [];
        this.queryInvoiceNum(false, 1, 10, 1);
    }


    changeActiveInvoiceTab = (info) => {
        this.setState({
            activeInvoiceType: info.invoiceType
        });
        this.freshList(1, this.state.searchOpt.pageSize, info.invoiceType);
    }

    onSelectChange = (keys, rows) => {
        const { selectedAllKeys, activeInvoiceType, selectedAllRows } = this.state;
        const newAllKeys = { ...selectedAllKeys };
        newAllKeys['k' + activeInvoiceType] = keys;
        const newAllRows = { ...selectedAllRows };
        newAllRows['k' + activeInvoiceType] = rows;
        this.setState({
            selectedAllKeys: newAllKeys,
            selectedAllRows: newAllRows
        });
    }

    dkInvoices = async() => {
        message.loading('处理中...', 0);
        const fids = this.allTabKeys;
        if (fids.length === 0) {
            message.info('请选择需要抵扣的发票');
        } else {
            const taxPeriod = this.state.taxPeriod;
            const res = await this.props.onDkInvoice({
                serialNos: fids.join(','),
                taxPeriod: taxPeriod.format('YYYY-M')
            });
            message.destroy();
            if (res.errcode === '0000') {
                message.info(taxPeriod.format(fids.length + '张发票抵扣成功'));
                this.setState({
                    showDkDialog: false,
                    selectedAllKeys: {}
                });
                this.allTabKeys = [];
                this.freshList();
            } else {
                message.info(res.description);
            }
        }
    }

    checkSelectTime = () => {
        let errMsg = '';
        let disabledLoad = false;
        const { invoiceTime, collectTime, expendTime } = this.state.searchOpt;
        if (!invoiceTime[0] && !collectTime[0] && !expendTime[0]) {
            disabledLoad = true;
            errMsg = '采集日期、开票日期、审核通过时间不能都为空';
        } else {
            let invoiceTimeTxt = '';
            let collectTimeTxt = '';
            let expendTimeTxt = '';
            if (invoiceTime[0]) {
                if (invoiceTime[1].diff(invoiceTime[0], 'days') > 31) {
                    invoiceTimeTxt = '开票日期、';
                    disabledLoad = true;
                }
            }
            if (collectTime[0]) {
                if (collectTime[1].diff(collectTime[0], 'days') > 31) {
                    collectTimeTxt = '采集日期、';
                    disabledLoad = true;
                }
            }

            if (expendTime[0]) {
                if (expendTime[1].diff(expendTime[0], 'days') > 31) {
                    expendTimeTxt = '审核通过时间';
                    disabledLoad = true;
                }
            }
            errMsg = invoiceTimeTxt + collectTimeTxt + expendTimeTxt + '的起止日期不能超过一个月';
        }
        if (disabledLoad) {
            return { errcode: '3001', description: errMsg };
        }
        return {
            errcode: '0000',
            description: 'success'
        };
    }

    exportExcel = () => {
        const checkRes = this.checkSelectTime();
        if (checkRes.errcode !== '0000') {
            message.info(checkRes.description);
            return;
        }
        message.loading('下载中...', 0);
        const newOpt = this.getSearchOpt(this.state.searchOpt);
        this.props.onExportExcel(newOpt);
        message.destroy();
    }

    onStopInvoice = (r) => {
        confirm({
            title: '确定废弃该发票？',
            onOk: async() => {
                message.loading('处理中...', 0);
                const res = await this.props.onStopInvoice({
                    recognitionSerialNo: r.recognitionSerialNo
                });
                message.destroy();
                if (res.errcode === '0000') {
                    message.info('废弃成功');
                    const { selectedAllKeys, activeInvoiceType, selectedAllRows } = this.state;
                    const curActive = 'k' + activeInvoiceType;
                    const selectedAllKeys2 = selectedAllKeys[curActive] || [];
                    const selectedAllRows2 = selectedAllRows[curActive] || [];

                    const newActiveKeys = selectedAllKeys2.filter((k) => {
                        return r.serialNo !== k;
                    });
                    const newActiveAllRows = selectedAllRows2.filter((item) => {
                        return item.serialNo !== r.serialNo;
                    });

                    this.setState({
                        selectedAllKeys: immutable.fromJS(selectedAllKeys).set([curActive], newActiveKeys).toJS(),
                        selectedAllRows: immutable.fromJS(selectedAllRows).set([curActive], newActiveAllRows).toJS()
                    });
                    this.freshList();
                } else {
                    message.info(res.description);
                }
            }
        });
    }

    onDeleteInvoice(r) {
        confirm({
            title: '确定删除该发票？',
            onOk: async() => {
                message.loading('处理中...', 0);
                const res = await this.props.onDeleteInvoice({
                    recognitionSerialNo: r.recognitionSerialNo
                });
                message.destroy();
                if (res.errcode === '0000') {
                    message.info('删除成功');
                    this.queryInvoiceNum();
                } else {
                    message.info(res.description);
                }
            }
        });
    }

    // 确定添加签收信息
    onConfirmInvoiceSign = async() => {
        const selectedAllKeys = this.allTabKeys;
        const { signer = '', signTime, signContent = '' } = this.state.invoiceSign;
        if (!signer.trim()) {
            message.info('请输入签收人名称');
            return;
        }
        if (!signTime) {
            message.info('请输入签收时间');
            return;
        }
        const opt = [];

        for (let i = 0; i < selectedAllKeys.length; ++i) {
            opt.push({ signName: signer, signTime: signTime.format('YYYY-MM-DD'), remark: signContent, serialNo: selectedAllKeys[i] });
        }

        message.loading('处理中...', 0);
        const res = await this.props.onAddInvoiceSign(opt);
        message.destroy();

        if (res.errcode === '0000') {
            message.success('签收成功');
            this.freshList();
            this.setState({
                invoiceSign: {
                    showModal: false,
                    signer: '',
                    signTime: null
                }
            });
        } else {
            message.info(res.description);
        }
    }

    // 添加报销信息
    onConfirmAddExpenseInfo = async(info) => {
        const { expenseName = '', expenseTime, remark = '', expenseNum = '', serialNos } = info;
        const opt = [];
        for (let i = 0; i < serialNos.length; ++i) {
            opt.push({ expenseNum, expenseName, expenseTime, remark, serialNo: serialNos[i] });
        }
        message.loading('处理中...', 0);
        const res = await this.props.onAddExpenseInfo(opt);
        message.destroy();
        if (res.errcode === '0000') {
            message.success('提交成功');
            this.freshList();
            this.setState({
                invoiceExpenseInfo: {
                    expenseNum: '',
                    showModal: false,
                    expenseName: '',
                    expenseTime: null,
                    remark: ''
                }
            });
        } else {
            message.info(res.description);
        }
    }

    showAddBxDialog = async(serialNos) => {
        message.info('获取报销单号中...', 0);
        const res = await pwyFetch(this.props.getExpenseNumUrl, {
            method: 'post'
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return;
        }
        const { expenseId = '' } = res.data || {};
        const loginInfo = this.props.loginInfo || {};
        const kpy = loginInfo.kpy || '';
        this.setState({
            invoiceExpenseInfo: {
                showModal: true,
                expenseId,
                expenseName: kpy,
                serialNos: serialNos
            }
        });
    }

    // 显示签收框之前校验
    showSignDialog = (serialNos) => {
        let isValidate = true;
        const { invoiceSign, listData } = this.state;
        const filterData = listData.filter((item) => {
            return serialNos.indexOf(item.serialNo) !== -1;
        });

        for (let i = 0; i < filterData.length; i++) {
            const item = filterData[i];
            const invoiceType = parseInt(item.invoiceType);
            if (invoiceType !== 3 && invoiceType !== 4 && invoiceType !== 5) {
                modalInfo({
                    title: '纸票签收提示',
                    content: '只有“增值税普通发票，专用纸质发票，普通纸质卷票”才能进行纸票签收!'
                });
                isValidate = false;
                break;
            } else if (item.signName || item.signTime) {
                modalInfo({
                    title: '纸票签收提示',
                    content: '部分发票已被签收，请选择“未签收”状态的纸票进行签收。'
                });
                isValidate = false;
                break;
            } else if (addedInvoiceTypes.indexOf(invoiceType) !== -1 && item.checkStatus !== 2) {
                modalInfo({
                    title: '纸票签收提示',
                    content: '部分发票未查验或查验失败，请选择“已查验”的纸票进行签收。'
                });
                isValidate = false;
                break;
            }
        }

        if (isValidate) {
            this.setState({
                invoiceSign: {
                    ...invoiceSign,
                    showModal: true
                }
            });
        }
    }

    // 显示抵扣框前的校验
    showDkDialog = (serialNos) => {
        let isValidate = true;
        const filterData = this.state.listData.filter((item) => {
            return serialNos.indexOf(item.serialNo) !== -1;
        });

        for (let i = 0; i < filterData.length; i++) {
            const r = filterData[i];
            const invoiceType = parseInt(r.invoiceType);
            if (r.delete === 2) {
                message.info('请不要选择废弃的发票进行抵扣');
                isValidate = false;
                break;
            } else if (allowDkInvoiceTypes.indexOf(invoiceType) === -1) {
                const allowInvoiceTexts = INPUT_INVOICE_TYPES.filter((item) => {
                    return item.allowDeduction !== 1;
                }).map((item) => {
                    return item.text;
                });
                modalInfo({
                    title: '抵扣操作提示',
                    content: '“' + allowInvoiceTexts.join(', ') + '”不能进行抵扣操作!'
                });
                isValidate = false;
                break;
            } else if (r.deductionPurpose !== '') {
                message.info('请选择未抵扣的发票进行抵扣操作！');
                isValidate = false;
                break;
            }
        }

        if (isValidate) {
            this.setState({
                showDkDialog: true
            });
        }
    }

    checkInvoice(serialNos) {
        const waitCheckList = [];
        for (let i = 0; i < this.state.listData.length; i++) {
            const invoiceData = this.state.listData[i];
            const invoiceType = parseInt(invoiceData.invoiceType);
            if (serialNos.indexOf(invoiceData.serialNo) !== -1) {
                if (addedInvoiceTypes.indexOf(invoiceType) !== -1) { //
                    const res = preCheckInvoice(invoiceData);
                    if (res.errcode === '0000' && invoiceData.checkStatus !== 2) {
                        waitCheckList.push(res.data);
                    }
                }
            }
        }

        const len = waitCheckList.length;
        if (len === 0) {
            modalInfo({
                title: '提示',
                content: '可以查验的发票为空，请选择未查验的增值税发票，且发票查验必要参数不能为空！'
            });
        } else {
            let tip = '可以查验的发票共' + len + '张，是否确认进行批量查验';
            if (len !== serialNos.length) {
                tip = '可以查验的发票共' + len + '张，有' + (serialNos.length - len) + '张发票查验参数不齐全，是否继续进行批量查验';
            }

            confirm({
                title: '查验确认',
                content: tip,
                onOk: () => {
                    message.loading('查验处理中', 0);
                    const waitCheckSerialNos = waitCheckList.map((item) => {
                        return item.serialNo;
                    });
                    this.setState({
                        listData: this.state.listData.map((item) => {
                            if (waitCheckSerialNos.indexOf(item.serialNo) !== -1) {
                                return {
                                    ...item,
                                    checkStatus: 'loading'
                                };
                            } else {
                                return item;
                            }
                        })
                    });

                    async.mapLimit(waitCheckList, 2, async(invoiceInfo, callback) => {
                        const res = await this.props.onCheckInvoice(invoiceInfo);

                        this.setState({
                            listData: this.state.listData.map((item) => {
                                if (item.serialNo === invoiceInfo.serialNo) {
                                    if (res.errcode === '0000') {
                                        const resData = res.data || {};
                                        const newInvoiceType = resData.invoiceType || invoiceInfo.invoiceType;

                                        // 刷新数量
                                        if (parseInt(newInvoiceType) !== invoiceInfo.invoiceType) {
                                            this.queryInvoiceNum(true); // 只刷新数量，其它数据已新的state为准
                                        }

                                        return {
                                            ...item,
                                            invoiceType: newInvoiceType || '',
                                            buyerName: resData.buyerName || invoiceInfo.buyerName || '',
                                            buyerTaxNo: resData.buyerTaxNo || invoiceInfo.buyerTaxNo || '',
                                            salerName: resData.salerName || invoiceInfo.salerName || '',
                                            salerTaxNo: resData.salerTaxNo || invoiceInfo.salerTaxNo || '',
                                            checkCode: resData.checkCode || invoiceInfo.checkCode || '',
                                            taxRate: resData.taxRate || invoiceInfo.taxRate || '',
                                            taxAccount: resData.taxAccount || invoiceInfo.taxAccount || '',
                                            checkStatus: 2,
                                            invoiceAmount: resData.invoiceAmount || invoiceInfo.invoiceAmount || '', // 查验覆盖识别,
                                            totalTaxAmount: resData.totalTaxAmount || invoiceInfo.totalTaxAmount || '', // 查验覆盖识别
                                            totalAmount: resData.totalAmount || invoiceInfo.totalAmount || '',
                                            invoiceDate: moment(resData.invoiceDate, 'YYYYMMDD').format('YYYY-MM-DD') || invoiceInfo.invoiceDate || ''
                                        };
                                    } else {
                                        return {
                                            ...item,
                                            checkStatus: 1,
                                            checkDescription: res.description || '服务端异常'
                                        };
                                    }
                                } else {
                                    return item;
                                }
                            })
                        });
                        callback(null, res);
                    }, (err) => {
                        if (err) {
                            console.error(err);
                        }
                        message.destroy();
                        message.info('查验完成');
                    });
                }
            });
        }
    }

    showRelatedBill = (serialNo) => {
        this.setState({
            showRelateBillSerialNo: serialNo
        });
    }

    startPrintInvoice = (serialNos) => {
        this.setState({ isPrintLoading: true });
        const { selectedAllRows } = this.state;
        let printData = [];
        const allPrintData = Object.keys(selectedAllRows);
        for (let i = 0; i < allPrintData.length; i++) {
            const k = allPrintData[i];
            printData = printData.concat(selectedAllRows[k]);
        }
        printData = printData.map(v => {
            return v.snapshotUrl || v.downloadUrl || v.pdfUrl || v.kdcloudUrl;
        });
        this.setState({ printImgs: printData });
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

    getSelectInfo(selectedAllRows) {
        const allKeys = Object.keys(selectedAllRows);
        let totalInvoiceAmount = 0.00;
        let totalTaxAmount = 0.00;
        for (let i = 0; i < allKeys.length; i++) {
            const curTabList = selectedAllRows[allKeys[i]];
            for (let j = 0; j < curTabList.length; j++) {
                if (!isNaN(parseFloat(curTabList[j].invoiceAmount))) {
                    totalInvoiceAmount += parseFloat(curTabList[j].invoiceAmount);
                }
                if (!isNaN(parseFloat(curTabList[j].totalTaxAmount))) {
                    totalTaxAmount += parseFloat(curTabList[j].totalTaxAmount);
                }
            }
        }

        return {
            totalInvoiceAmount,
            totalTaxAmount
        };
    }

    // 输入压缩密码后校验
    continueDownload = async() => {
        const zipPassword = this.state.zipPassword || '';
        if (zipPassword.length !== 6) {
            message.info('请输入6位数字密码！');
            return;
        }

        const checkRes = this.checkSelectTime();
        if (checkRes.errcode !== '0000') {
            message.info(checkRes.description);
            return;
        }
        const newOpt = this.getSearchOpt(this.state.searchOpt);
        this.setState({
            isDownloading: true
        });
        const res = await pwyFetch(this.props.applyDownloadUrl, {
            method: 'post',
            data: {
                ...newOpt,
                fdataType: 3,
                password: zipPassword
            }
        });
        if (res.errcode !== '0000') {
            message.info(res.description);
            this.setState({
                isDownloading: false
            });
            return;
        }
        this.setState({ showDownloadModal: false, isDownloading: false });
        typeof this.props.onContinueDownload === 'function' && this.props.onContinueDownload();
    }

    // 导出电票
    exportElecFiles = () => {
        const checkRes = this.checkSelectTime();
        if (checkRes.errcode !== '0000') {
            message.info(checkRes.description);
            return;
        }
        const newOpt = this.getSearchOpt(this.state.searchOpt);
        tools.downloadFile({
            downloadType: 'form',
            url: this.props.exportElecFilesUrl,
            key: 'downloadParams',
            data: newOpt,
            startCallback: () => {
                this.setState({
                    exportElecIng: true
                });
            },
            endCallback: (res) => {
                // 超过导出数据超过100条，将申请到后台处理
                if (res.errcode === '0615') {
                    message.destroy();
                    this.setState({
                        exportElecIng: false,
                        showDownloadModal: true
                    });
                    return;
                }
                this.setState({
                    exportElecIng: false
                });
                if (res.errcode !== '0000') {
                    message.destroy();
                    message.success(res.description);
                    return;
                }
                message.success('下载成功');
            }
        });
    }

    // 更新入账信息
    updateEntryInfo = () => {
        const { selectedAllRows, vouchNo, accountDate } = this.state;
        if (!vouchNo || !accountDate) {
            message.info('会计属期和凭证号都不能为空！');
            return;
        }
        let filterFlag = false;
        const keys = Object.keys(selectedAllRows);
        const accountDateStr = accountDate.format('YYYYMM');
        const list = [];
        for (let i = 0; i < keys.length; i++) {
            for (let j = 0; j < selectedAllRows[keys[i]].length; j++) {
                const item = selectedAllRows[keys[i]][j];
                // 发票状态正常，已经查验通过的发票才允许添加入账信息
                if (addedInvoiceTypes.indexOf(parseInt(item.invoiceType)) !== -1) {
                    if (item.invoiceStatus === 0 && item.checkStatus === 2 && item.isEntryVoucher === 0) {
                        list.push({
                            vouchId: item.vouchId || '',
                            vouchNo,
                            serialNo: item.serialNo,
                            accountDate: accountDateStr
                        });
                    } else {
                        filterFlag = true;
                    }
                } else if (item.isEntryVoucher === 0) {
                    list.push({
                        vouchId: item.vouchId || '',
                        vouchNo,
                        serialNo: item.serialNo,
                        accountDate: accountDateStr
                    });
                } else {
                    filterFlag = true;
                }
            }
        }

        if (list.length === 0) {
            message.info('请选择发票状态正常、查验通过(增值税), 未入账的发票维护入账信息');
            return;
        }

        const updateInner = async() => {
            message.loading('处理中...', 0);
            const res = await this.props.updateEntryInfo({
                vouchNo,
                accountDate: accountDateStr,
                vouchInfo: list
            });
            message.destroy();
            if (res.errcode !== '0000') {
                message.info(res.description + '[' + res.errcode + ']');
                return;
            }
            message.info('入账信息更新成功');
            this.freshList();
            this.setState({
                selectedAllKeys: {},
                selectedAllRows: {},
                showEntryInfo: false,
                accountDate: moment(),
                vouchNo: ''
            });
        };
        if (filterFlag) {
            confirm({
                title: '有' + list.length + '张发票可以添加入账信息，其余发票状态非正常、查验未通过或已经入账，确认更新吗？',
                onOk: async() => {
                    updateInner();
                }
            });
        } else {
            updateInner();
        }
    }

    render() {
        const {
            zipPassword,
            showDownloadModal,
            isPrintLoading,
            printImgs = [],
            showRelateBillSerialNo,
            invoiceExpenseInfo,
            invoiceSign,
            listData,
            searchOpt,
            totalElement,
            activeInvoiceType,
            loading,
            showDkDialog,
            taxPeriod,
            selectedAllKeys,
            curEditInfo,
            invoiceTabsData,
            showMore,
            selectedAllRows
        } = this.state;
        const totalInfo = this.getSelectInfo(selectedAllRows);
        const { pageNo, pageSize } = searchOpt;
        const disabledEdit = this.state.disabledEdit;

        const rowSelection = {
            selectedRowKeys: selectedAllKeys['k' + activeInvoiceType],
            onChange: this.onSelectChange,
            getCheckboxProps: (r) => {
                if (r.delete === 2) {
                    return {
                        disabled: true
                    };
                } else {
                    return {};
                }
            }
        };

        this.allTabKeys = [];
        const allKeys = Object.keys(selectedAllKeys);
        for (let i = 0; i < allKeys.length; i++) {
            const k = allKeys[i];
            this.allTabKeys = this.allTabKeys.concat(selectedAllKeys[k]);
        }
        const currentOrgisAdmin = this.props.currentOrgisAdmin || '0'; // '0' 普通 '1' 管理员
        const isAddedTax = addedInvoiceTypes.indexOf(searchOpt.invoiceType) > -1 || searchOpt.invoiceType === '';
        const operateCol = {
            title: '操作',
            align: 'center',
            fixed: 'right',
            width: 140,
            render: (v, r, i) => {
                const { isExpenseCorrelation } = r;
                let allowEdit = true;
                let description = '';
                if (parseInt(r.checkStatus) === 2) {
                    description = '已查验的发票不允许编辑';
                    allowEdit = false;
                }

                if (parseInt(r.delete) === 2) {
                    description = '已废弃的发票不允许编辑';
                    allowEdit = false;
                }

                if (parseInt(r.deductionPurpose) === 1) {
                    description = '已抵扣的发票不允许编辑';
                    allowEdit = false;
                }

                return (
                    <div className='operate'>
                        {
                            allowEdit ? (
                                <a key='edit' href='javascript:;' onClick={() => { this.onShowEditDialog(r, i); }}>编辑</a>
                            ) : description ? (
                                <Tooltip title={description}>
                                    <a href='javascript:;' onClick={() => { this.onShowEditDialog(r, i, true); }}>查看</a>
                                </Tooltip>
                            ) : (
                                <a href='javascript:;' style={{ color: '#ccc', cursor: 'default' }}>编辑</a>
                            )
                        }

                        <span className='cute' style={{ margin: '0 7px', color: '#eee' }}>|</span>
                        {
                            currentOrgisAdmin != 1 && isExpenseCorrelation == 2 ? (
                                <Tooltip title='非管理员不能删除已报销的发票'>
                                    <span style={{ color: '#999' }}>删除</span>
                                </Tooltip>
                            ) : (
                                <a href='javascript:;' onClick={() => this.onDeleteInvoice(r)}>删除</a>
                            )
                        }
                    </div>
                );
            }
        };

        let scrollWidth = 1780;
        const activeInvoiceTypeKey = 'k' + activeInvoiceType;
        if (['k14', 'k11', 'k17', 'k8', 'k9'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1500;
        } else if (['k4'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2200;
        } else if (['k1', 'k2', 'k3', 'k5', 'k12', 'k13', 'k15'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2180;
        } else if (['k10', 'k21'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2380;
        } else if (['k7', 'k16', 'k17', 'k20'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1780;
        }

        let tableColumns = listData.length > 0 &&
        columsDictFun(activeInvoiceTypeKey, this.props.loginInfo) ? columsDictFun(activeInvoiceTypeKey, this.props.loginInfo).concat(operateCol) : [];

        tableColumns = tableColumns.map((item) => {
            if (item.dataIndex === 'isExpenseCorrelation') {
                return {
                    ...item,
                    render: (v, r) => {
                        if (v === 2) {
                            return (
                                <a href='javascript:;' onClick={() => this.showRelatedBill(r.serialNo)}>关联单据</a>
                            );
                        } else {
                            return '--';
                        }
                    }
                };
            } else {
                return item;
            }
        });
        const tableProps = {
            key: 'table',
            loading,
            scroll: { x: scrollWidth },
            columns: tableColumns,
            dataSource: listData,
            pagination: false,
            rowKey: 'serialNo'
        };

        if (listData.length > 0) {
            tableProps.rowSelection = rowSelection;
        }
        // 分众添加的搜索条件
        const otherItems = (
            <>
                <div className='searchItem inlineBlock'>
                    <label>系统来源：</label>
                    <Input
                        type='text'
                        style={{ width: 220 }}
                        value={searchOpt.expenseSystemSource}
                        maxLength={100}
                        onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, expenseSystemSource: e.target.value } }); }}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>单据审核人：</label>
                    <Input
                        type='text'
                        style={{ width: 220 }}
                        value={searchOpt.expenseReviewer}
                        maxLength={100}
                        onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, expenseReviewer: e.target.value } }); }}
                    />
                </div>
            </>
        );

        return (
            <div className='accountManage'>
                <div className='topBtns'>
                    <div className='row'>
                        <div className='searchItem inlineBlock'>
                            <label>发票种类：</label>
                            <Select
                                value={searchOpt.invoiceType}
                                style={{ width: 220 }}
                                onChange={(v) => {
                                    this.setState({
                                        searchOpt: {
                                            ...searchOpt,
                                            invoiceType: v
                                        }
                                    });
                                }}
                            >
                                <Option value=''>全部</Option>
                                {
                                    INPUT_INVOICE_TYPES.map((item) => {
                                        return (
                                            <Option value={item.value} key={item.value}>{item.text}</Option>
                                        );
                                    })
                                }
                            </Select>
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>采集日期：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 220 }}
                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, collectTime: d } })}
                                value={searchOpt.collectTime}
                                allowClear={true}
                            />
                        </div>

                        <div className='searchItem inlineBlock'>
                            <label>开票日期：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 220 }}
                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, invoiceTime: d } })}
                                value={searchOpt.invoiceTime}
                                allowClear={true}
                            />
                        </div>

                        <Button type='primary' style={{ marginLeft: 15 }} onClick={() => this.onSearch()}>查询</Button>
                        <Button className='btn' icon='reload' onClick={this.emptyClick} style={{ borderStyle: 'none', marginLeft: 15 }}>清空</Button>
                    </div>
                    <div className={showMore ? 'more' : 'more hidden'}>
                        <div className={isAddedTax ? 'row' : 'row hidden'}>
                            <div className='searchItem inlineBlock'>
                                <label>发票代码：</label>
                                <Input
                                    placeholder='输入发票代码'
                                    type='text'
                                    maxLength={12}
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => this.setState({ searchOpt: { ...searchOpt, invoiceCode: e.target.value } })}
                                    value={searchOpt.invoiceCode}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>发票号码：</label>
                                <Input
                                    maxLength={10}
                                    placeholder='输入发票号码'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => this.setState({ searchOpt: { ...searchOpt, invoiceNo: e.target.value } })}
                                    value={searchOpt.invoiceNo}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>销方名称：</label>
                                <Input
                                    placeholder='请输入企业名称'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => this.setState({ searchOpt: { ...searchOpt, salerName: e.target.value } })}
                                    value={searchOpt.salerName}
                                />
                            </div>
                        </div>
                        <div className={isAddedTax ? 'row' : 'row hidden'}>
                            <div className='searchItem inlineBlock'>
                                <label>发票状态：</label>
                                <Select
                                    style={{ width: 220 }}
                                    value={searchOpt.invoiceStatus}
                                    onChange={(v) => this.setState({ searchOpt: { ...searchOpt, invoiceStatus: v } })}
                                >
                                    <Option value=''>全部</Option>
                                    {
                                        invoiceStatus.map((item, index) => {
                                            return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                        })
                                    }
                                </Select>
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>发票使用状态：</label>
                                <Select
                                    style={{ width: 220 }}
                                    value={searchOpt.expendStatus}
                                    onChange={(v) => this.setState({
                                        searchOpt: {
                                            ...searchOpt,
                                            expendStatus: v,
                                            accountDate: v === 65 || v === '' ? searchOpt.accountDate : null
                                        }
                                    })}
                                >
                                    <Option value=''>全部</Option>
                                    {
                                        invoice_expense_status.map((item) => {
                                            return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                        })
                                    }
                                </Select>
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>业务单号：</label>
                                <Input
                                    placeholder='请输入业务单号'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => this.setState({ searchOpt: { ...searchOpt, expenseNum: e.target.value } })}
                                    value={searchOpt.expenseNum}
                                />
                            </div>
                        </div>
                        <div className={isAddedTax ? 'row' : 'row hidden'}>
                            <div className='searchItem inlineBlock'>
                                <label>审核通过时间：</label>
                                <RangePicker
                                    disabledDate={(current) => { return current > moment(); }}
                                    className='rangeDate' style={{ width: 220 }}
                                    onChange={(d) => this.setState({ searchOpt: { ...searchOpt, expendTime: d } })}
                                    value={searchOpt.expendTime}
                                    allowClear={true}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>入账属期：</label>
                                <MonthPicker
                                    value={searchOpt.accountDate}
                                    placeholder='请选择入账属期'
                                    disabled={searchOpt.expendStatus !== 65 && searchOpt.expendStatus !== ''}
                                    format='YYYYMM'
                                    onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, accountDate: e } }); }}
                                    disabledDate={(c) => {
                                        return c.format('X') > moment().endOf('month').format('X');
                                    }}
                                    style={{ width: 220 }}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>采集人手机号：</label>
                                <Input
                                    type='text'
                                    style={{ width: 220 }}
                                    value={searchOpt.collectUser}
                                    maxLength={11}
                                    onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, collectUser: e.target.value.replace(/[^0-9]/g, '') } }); }}
                                />
                            </div>
                        </div>
                        <div className={isAddedTax ? 'row' : 'row hidden'}>
                            <div className='searchItem inlineBlock'>
                                <label>采集人名称：</label>
                                <Input
                                    type='text'
                                    style={{ width: 220 }}
                                    value={searchOpt.collectorName}
                                    maxLength={11}
                                    onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, collectorName: e.target.value } }); }}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>勾选状态：</label>
                                <Select
                                    style={{ width: 220 }}
                                    value={searchOpt.isFauthenticate}
                                    onChange={(v) => this.setState({ searchOpt: { ...searchOpt, isFauthenticate: v } })}
                                >
                                    <Option value={null}>全部</Option>
                                    {
                                        ALL_ISFAUTHENTICATE.map(item => {
                                            return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                        })
                                    }
                                </Select>
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>认证日期：</label>
                                <RangePicker
                                    disabled={searchOpt.isFauthenticate !== 2}
                                    disabledDate={(current) => { return current > moment(); }}
                                    className='rangeDate'
                                    style={{ width: 220 }}
                                    onChange={(v) => this.setState({ searchOpt: { ...searchOpt, authInvoiceDate: v } })}
                                    value={searchOpt.authInvoiceDate}
                                />
                            </div>
                        </div>
                        <div className={isAddedTax ? 'row' : 'row hidden'}>
                            <div className='searchItem inlineBlock'>
                                <label>纸票是否签收：</label>
                                <span
                                    className={searchOpt.signOptionValue == '' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, signOptionValue: '' } }); }}
                                >
                                    全部
                                </span>
                                <span
                                    className={searchOpt.signOptionValue == '1' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, signOptionValue: '1' } }); }}
                                >
                                    是
                                </span>
                                <span
                                    className={searchOpt.signOptionValue == '2' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, signOptionValue: '2' } }); }}
                                >
                                    否
                                </span>
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label style={{ width: 156 }}>发票抬头是否一致：</label>
                                <span
                                    className={searchOpt.equalNameValue == '' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, equalNameValue: '' } }); }}
                                >
                                    全部
                                </span>
                                <span
                                    className={searchOpt.equalNameValue == 1 ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, equalNameValue: 1 } }); }}
                                >
                                    是
                                </span>
                                <span
                                    className={searchOpt.equalNameValue == 2 ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, equalNameValue: 2 } }); }}
                                >
                                    否
                                </span>
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>抵扣状态：</label>
                                <Select
                                    style={{ width: 220 }}
                                    value={searchOpt.deductionPurpose}
                                    onChange={(v) => this.setState({ searchOpt: { ...searchOpt, deductionPurpose: v } })}
                                >
                                    <Option value={null}>全部</Option>
                                    {
                                        ALL_DEDUCTIONPURPOSE.map(item => {
                                            return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                        })
                                    }
                                </Select>
                            </div>
                        </div>
                        <div className={isAddedTax ? 'row' : 'row hidden'}>
                            <div className='searchItem inlineBlock'>
                                <label>发票是否查验：</label>
                                <span
                                    className={searchOpt.isCheck == '1' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, isCheck: '1' } }); }}
                                >
                                    是
                                </span>
                                <span
                                    className={searchOpt.isCheck == '2' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => { this.setState({ searchOpt: { ...searchOpt, isCheck: '2' } }); }}
                                >
                                    否
                                </span>
                            </div>
                            <div style={{ marginLeft: 93 }} className='inlineBlock'>{otherItems}</div>
                        </div>
                    </div>
                    {/* 非增值税发票 */}
                    <div className={isAddedTax ? 'row hidden' : 'row'}>
                        <div className='searchItem inlineBlock'>
                            <label>审核通过时间：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 220 }}
                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, expendTime: d } })}
                                value={searchOpt.expendTime}
                                allowClear={true}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>发票使用状态：</label>
                            <Select
                                style={{ width: 220 }}
                                value={searchOpt.expendStatus}
                                onChange={(v) => this.setState({
                                    searchOpt: {
                                        ...searchOpt,
                                        expendStatus: v,
                                        accountDate: v === 65 || v === '' ? searchOpt.accountDate : null
                                    }
                                })}
                            >
                                <Option value=''>全部</Option>
                                {
                                    invoice_expense_status.map((item) => {
                                        return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                    })
                                }
                            </Select>
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>采集人手机号：</label>
                            <Input
                                type='text'
                                style={{ width: 220 }}
                                value={searchOpt.collectUser}
                                maxLength={11}
                                onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, collectUser: e.target.value.replace(/[^0-9]/g, '') } }); }}
                            />
                        </div>
                    </div>
                    <div className={isAddedTax ? 'row hidden' : 'row'}>
                        <div className='searchItem inlineBlock'>
                            <label>采集人名称：</label>
                            <Input
                                type='text'
                                style={{ width: 220 }}
                                value={searchOpt.collectorName}
                                maxLength={11}
                                onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, collectorName: e.target.value } }); }}
                            />
                        </div>
                        {otherItems}
                    </div>
                    <div className='moreTip' style={{ textAlign: 'center' }}>
                        {
                            showMore ? (
                                <span onClick={() => this.setState({ showMore: !showMore })}>收起更多<Icon size='small' type='up' /></span>
                            ) : (
                                <span onClick={() => this.setState({ showMore: !showMore })}>显示更多搜索条件<Icon size='small' type='down' /></span>
                            )
                        }
                    </div>
                </div>
                <div className='middleOperateBtns' style={{ borderBottom: listData.length > 0 ? '1px solid #eee' : 'none' }}>
                    <Button
                        loading={this.props.exporting}
                        type='primary'
                        onClick={this.exportExcel}
                        disabled={listData.length === 0}
                    >导出数据
                    </Button>
                    {
                        typeof this.props.exportElecFilesUrl === 'string' ? (
                            <Button
                                style={{ marginLeft: 15 }}
                                loading={this.state.exportElecIng}
                                onClick={this.exportElecFiles}
                            >原文件下载
                            </Button>
                        ) : null
                    }

                    {/* <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.showDkDialog(this.allTabKeys)}
                        disabled={this.allTabKeys.length === 0}
                    >税额抵扣
                    </Button> */}
                    <Button
                        onClick={() => this.showSignDialog(this.allTabKeys)}
                        style={{ marginLeft: 15 }} disabled={this.allTabKeys.length === 0}
                    >纸票签收
                    </Button>
                    <Button
                        onClick={() => this.showAddBxDialog(this.allTabKeys)}
                        style={{ marginLeft: 15 }} disabled={this.allTabKeys.length === 0}
                    >添加报销信息
                    </Button>
                    <Button
                        onClick={() => this.checkInvoice(this.allTabKeys)}
                        style={{ marginLeft: 15 }}
                        disabled={this.allTabKeys.length === 0 || addedInvoiceTypes.indexOf(activeInvoiceType) === -1}
                    >批量查验
                    </Button>
                    <Button
                        onClick={() => this.startPrintInvoice(this.allTabKeys)}
                        style={{ marginLeft: 15 }}
                        disabled={this.allTabKeys.length === 0 || isPrintLoading}
                    >打印发票
                    </Button>
                    {
                        typeof this.props.updateEntryInfo === 'function' ? (
                            <Button
                                onClick={() => this.setState({ showEntryInfo: true })}
                                style={{ marginLeft: 15 }}
                                disabled={this.allTabKeys.length === 0 || isPrintLoading}
                            >
                                维护入账信息
                            </Button>
                        ) : null
                    }

                </div>
                <InvoiceTabs
                    tabInfo={invoiceTabsData}
                    onChange={this.changeActiveInvoiceTab}
                    activeInvoiceType={'k' + activeInvoiceType}
                    INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                />

                <Table {...tableProps} />

                <div className='tblBottom'>
                    <div className='floatLeft'>
                        <span>已选择<span className='number'>{this.allTabKeys.length}</span>张发票</span>
                        <span>&nbsp;&nbsp;已选不含税金额合计：<span className='number'>￥{totalInfo.totalInvoiceAmount.toFixed(2)}</span></span>
                        <span>&nbsp;&nbsp;已选税额合计：<span className='number'>￥{totalInfo.totalTaxAmount.toFixed(2)}</span></span>
                    </div>
                    <Pagination
                        size='small'
                        current={pageNo}
                        total={totalElement}
                        showSizeChanger
                        showQuickJumper
                        className='floatRight'
                        pageSize={pageSize}
                        pageSizeOptions={['10', '30', '50']}
                        onShowSizeChange={(c, size) => this.freshList(c, size)}
                        onChange={(c, size) => this.freshList(c, size)}
                    />
                </div>
                <Modal
                    title='纸票签收'
                    visible={invoiceSign.showModal}
                    onCancel={() => { this.setState({ invoiceSign: { ...invoiceSign, showModal: false } }); }}
                    onOk={this.onConfirmInvoiceSign}
                    width={460}
                >
                    <div className='searchForm'>
                        <div className='inner' style={{ textAlign: 'center' }}>
                            <div className='row'>
                                <div className='searchItem'>
                                    <label style={{ width: 80 }}>
                                        <span className='red'>*</span>签收人：
                                    </label>
                                    <Input
                                        placeholder='请输入签收人名称'
                                        maxLength={20}
                                        value={invoiceSign.signer}
                                        className='searchInput'
                                        style={{ width: 244, marginBottom: 20 }}
                                        type='text'
                                        onChange={(e) => { this.setState({ invoiceSign: { ...invoiceSign, signer: e.target.value } }); }}
                                    />
                                </div>
                                <div className='searchItem'>
                                    <label style={{ width: 80 }}>
                                        <span className='red'>*</span>签收时间：
                                    </label>
                                    <DatePicker
                                        disabledDate={(current) => { return current > moment(); }}
                                        className='rangeDate searchInput'
                                        style={{ width: 244, marginBottom: 20 }}
                                        placeholder='请输入签收时间'
                                        type='text'
                                        value={invoiceSign.signTime}
                                        onChange={(d) => { this.setState({ invoiceSign: { ...invoiceSign, signTime: d } }); }}
                                    />
                                </div>
                                <div className='searchItem'>
                                    <label style={{ width: 70, verticalAlign: 'top' }}>备注：</label>
                                    <TextArea
                                        placeholder='请输入备注内容'
                                        maxLength={100}
                                        value={invoiceSign.signContent}
                                        rows={4}
                                        style={{ width: 244 }}
                                        className='searchInput'
                                        onChange={(e) => { this.setState({ invoiceSign: { ...invoiceSign, signContent: e.target.value } }); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    title='添加报销信息'
                    visible={invoiceExpenseInfo.showModal}
                    onCancel={() => this.setState({ invoiceExpenseInfo: { ...invoiceExpenseInfo, showModal: false } })}
                    footer={false}
                    width={1100}
                    destroyOnClose={true}
                    className='wrapperAddExpenseInfo'
                >
                    <AddExpenseInfo
                        width={1080}
                        height={600}
                        expenseUserName={invoiceExpenseInfo.expenseName}
                        serialNos={invoiceExpenseInfo.serialNos}
                        queryInvoiceUrl={this.props.queryInvoiceUrl}
                        expenseId={invoiceExpenseInfo.expenseId}
                        onConfirmAddExpenseInfo={this.onConfirmAddExpenseInfo}
                    />
                </Modal>

                <Modal
                    title='请选择税款抵扣税期'
                    wrapClassName='renewDialog'
                    width={500}
                    visible={showDkDialog}
                    onCancel={() => this.setState({ showDkDialog: false })}
                    onOk={this.dkInvoices}
                >
                    <div className='row'>
                        <label>抵扣税期：</label>
                        <MonthPicker
                            disabledDate={(d) => {
                                return d < moment('2019-04', 'YYYY-MM') && d > moment();
                            }}
                            style={{ textAlign: 'left', width: 260 }}
                            onChange={(d) => { this.setState({ taxPeriod: d }); }}
                            value={taxPeriod}
                            allowClear={true}
                        />
                    </div>
                </Modal>
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
                        onCheckInvoice={this.props.onCheckInvoice}
                        onSaveInvoice={this.props.onSaveInvoice}
                        onShowLedgerdata={this.props.onShowLedgerdata}
                        updateAttachUrl={this.props.updateAttachUrl}
                        queryAttachUrl={this.props.queryAttachUrl}
                        queryTripUrl={this.props.queryTripUrl}
                        queryOtherInfoUrl={this.props.queryOtherInfoUrl}
                        onPrintInvoice={this.onPrintInvoice}
                        AccountManageState={true}
                    />
                </Modal>
                <Modal
                    visible={!!showRelateBillSerialNo}
                    title='发票报销信息'
                    onCancel={() => this.setState({ showRelateBillSerialNo: '' })}
                    width={600}
                    top={10}
                    footer={null}
                    bodyStyle={{ padding: 12 }}
                >
                    <ShowRelateBill
                        serialNo={showRelateBillSerialNo}
                        onQueryRelateBill={(opt) => this.props.onQueryRelateBill(opt)}
                    />
                </Modal>

                <PrintImg
                    printData={printImgs}
                    printEnd={this.printEnd}
                />

                <Modal
                    visible={this.state.showEntryInfo}
                    title='请手工维护入账信息'
                    onOk={this.updateEntryInfo}
                    onCancel={() => { this.setState({ showEntryInfo: false, accountDate: moment(), vouchNo: '' }); }}
                >
                    <div className='row' style={{ marginBottom: 10 }}>
                        <label style={{ display: 'inline-block', width: 80 }}>会计属期：</label>
                        <MonthPicker
                            value={this.state.accountDate}
                            placeholder='请选择会计属期'
                            format='YYYYMM'
                            style={{ width: 300 }}
                            onChange={(e) => this.setState({ accountDate: e })}
                            disabledDate={(c) => {
                                return c.format('X') > moment().endOf('month').format('X');
                            }}
                        />
                    </div>
                    <div className='row'>
                        <label style={{ display: 'inline-block', width: 80 }}>凭证号：</label>
                        <Input
                            style={{ width: 300 }}
                            value={this.state.vouchNo}
                            onChange={(e) => { this.setState({ vouchNo: e.target.value.trim() }); }}
                        />
                    </div>
                </Modal>

                <Modal
                    destroyOnClose
                    visible={showDownloadModal}
                    title='温馨提示'
                    confirmLoading={this.state.isDownloading}
                    onOk={this.continueDownload}
                    onCancel={() => { this.setState({ showDownloadModal: false }); }}
                >
                    <p style={{ textAlign: 'center' }}>您选择的发票记录过多，为了数据安全，请务必设置压缩包密码：</p>
                    <p style={{ textAlign: 'center' }}>
                        <span>6位数字密码：</span>
                        <Input
                            autoFocus
                            autoComplete='new-password'
                            maxLength={6}
                            onChange={e => this.setState({ zipPassword: e.target.value.replace(/[^0-9]/g, '') })}
                            placeholder='设置6位数字密码'
                            style={{ width: 132 }}
                            type='password'
                            value={zipPassword}
                        />
                    </p>
                </Modal>
            </div>
        );
    }
}

AccountManage.propTypes = {
    onQueryInvoiceNums: PropTypes.func.isRequired,
    onQueryAccount: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDkInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onAddInvoiceSign: PropTypes.func.isRequired,
    onAddExpenseInfo: PropTypes.func.isRequired,
    exportElecFilesUrl: PropTypes.string,
    downloadElecFilesUrl: PropTypes.string,
    applyDownloadUrl: PropTypes.string,
    onContinueDownload: PropTypes.func,
    // onEnableInvoice: PropTypes.func.isRequired,
    onStopInvoice: PropTypes.func.isRequired,
    onQueryRelateBill: PropTypes.func.isRequired,
    exporting: PropTypes.bool,
    onChecklo: PropTypes.func.isRequired,
    onShowLedgerdata: PropTypes.func.isRequired,
    onPrintInvoice: PropTypes.func.isRequired,
    updateAttachUrl: PropTypes.string,
    queryAttachUrl: PropTypes.string,
    queryTripUrl: PropTypes.string,
    queryOtherInfoUrl: PropTypes.string,
    loginInfo: PropTypes.object,
    updateEntryInfo: PropTypes.func,
    currentOrgisAdmin: PropTypes.string,
    queryInvoiceUrl: PropTypes.string,
    getExpenseNumUrl: PropTypes.string
};

export default AccountManage;
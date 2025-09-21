import React from 'react';
import ScanInvoices from '@piaozone.com/scan-invoices';
import PropTypes from 'prop-types';
import { Button, DatePicker, Pagination, Modal, message, Input, Table, Tooltip } from 'antd';
import moment from 'moment';
import { INPUT_INVOICE_TYPES } from '../commons/constants';
import { columsDictFun, collectorColums } from '../collectInvoices/invoiceCols';
import InvoiceTabs from '../invoicesTabs';
import { modalInfo, confirm } from '../commons/antdModal';
import { preCheckInvoice } from '../commons/preCheckInvoices';
import async from 'async';
import ShowRelateBill from './showRelateBill';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import PrintImg from '@piaozone.com/print-image';
import immutable from 'immutable';
import { tools, pwyFetch, kdRequest } from '@piaozone.com/utils';
import AddExpenseInfo from '@piaozone.com/add-expense-info';
import AccountSearch from './accountSearch';
const { TextArea } = Input;
const { MonthPicker } = DatePicker;
const allowDkInvoiceTypes = invoiceTypes.ALLOW_DK_TYPES;
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES.concat([28, 29]);

class AccountManage extends React.Component {
    constructor(props) {
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
            isFauthenticate: '', // 0未勾选、5预勾选、1已勾选、2已认证 null全部
            pageNo: 1,
            pageSize: 10,
            collectUser: '', //采集人电话
            collectorName: '', //采集人名称
            invoiceType: '', //发票类型
            deductionPurpose: '', // 1抵扣 2不抵扣 “”（空字符串）未抵扣 null全部
            isCheck: 1 //1：是， 2： 否
        };
        this.state = {
            selectedAllRows: {},
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
            },
            userSource: props.userSource || '1',
            shrSlogan: false,
            fdataType: 3,
            sortOpt: {
                orderColumn: '',
                orderBy: ''
            },
            showCollectorInfo: false, // 采集人信息列表弹框
            collectorList: [] // 采集人信息列表
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
        if (addedInvoiceTypes.indexOf(invoiceType) != -1) {
            if (typeof this.props.onChecklo === 'function') {
                const res = await this.props.onChecklo({
                    invoiceType,
                    invoiceCode,
                    invoiceNo
                });
                if (res.errcode == '0000') {
                    if (res.data) {
                        checkCount = res.data.checkCount || 0;
                        lastCheckTime = res.data.lastCheckTime || '';
                    }
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
        let dateRange = 31;
        if (this.props.useNewAccountQuery) { //新台账
            dateRange = 92;
        }
        if (this.props.useNewAccountQuery && this.props.expandSearchRange) {
            dateRange = 365;
        }
        if (collectTimeStart === '' && invoiceTimeStart === '' && expendStartTime === '') {
            message.info('采集日期，开票日期，审核通过时间不能同时为空');
            return;
        } else if (!collectTimeStart) { // 采集时间为空
            if (!expendStartTime && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) {
                message.info('数据过多, 开票日期跨度不能大于' + dateRange + '天');
                return;
            } else if (!invoiceTimeStart && moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > dateRange) {
                message.info('数据过多, 审核通过时间跨度不能大于' + dateRange + '天');
                return;
            } else if (
                moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > dateRange &&
                moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > dateRange
            ) {
                message.info('数据过多, 开票日期和审核通过时间跨度不能同时大于' + dateRange + '天');
                return;
            }
        } else if (!invoiceTimeStart) { // 开票日期为空
            if (!expendStartTime && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) {
                message.info('数据过多, 采集日期跨度不能大于' + dateRange + '天');
                return;
            } else if (!collectTimeStart && moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > dateRange) {
                message.info('数据过多, 审核通过时间跨度不能大于' + dateRange + '天');
                return;
            } else if (
                (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) &&
                (moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > dateRange)
            ) {
                message.info('数据过多, 采集日期和审核通过时间跨度不能同时大于' + dateRange + '天');
                return;
            }
        } else if (!expendStartTime) { // 审核报销时间为空
            if (!invoiceTimeStart && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) {
                message.info('数据过多, 采集日期跨度不能大于' + dateRange + '天');
                return;
            } else if (!collectTimeStart && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) {
                message.info('数据过多, 开票日期跨度不能大于' + dateRange + '天');
                return;
            } else if (
                (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) &&
                (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > dateRange)
            ) {
                message.info('数据过多, 采集日期和开票日期跨度不能同时大于' + dateRange + '天');
                return;
            }
        } else if ( // 采集日期、开票日期都不为空
            (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) &&
            (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > dateRange) &&
            (moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > dateRange)
        ) {
            message.info('数据过多, 采集日期、开票日期、审核通过时间跨度不能同时大于' + dateRange + '天');
            return;
        }

        this.setState({
            loading: true
        });
        const res = await this.props.onQueryInvoiceNums({
            ...optResult,
            expenseReviewer: optResult.expenseReviewer === '筛选有审核人的发票' ? '' : optResult.expenseReviewer,
            expenseReviewerNotNull: optResult.expenseReviewer === '筛选有审核人的发票' ? 1 : '',
            expenseSystemSource: optResult.expenseSystemSource === '筛选有来源系统的发票' ? '' : optResult.expenseSystemSource,
            expenseSystemSourceNotNull: optResult.expenseSystemSource === '筛选有来源系统的发票' ? 1 : '',
            useNewAccountQuery: this.props.useNewAccountQuery,
            expandSearchRange: this.props.expandSearchRange
        });
        if (res.errcode === '0000') {
            const invoiceTabsData = {};
            const resData = res.data || [];
            // 临时代码
            let result = [];
            if (resData.length > 0) {
                result = resData.filter((item) => {
                    return [30].indexOf(parseInt(item.invoiceType)) == '-1';
                });
            }
            // 临时代码
            if (result.length > 0) {
                let allowActiveInvoiceType;
                for (let i = 0; i < result.length; i++) {
                    const curData = result[i];
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
                    shrSlogan: false,
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
            ...this.state.sortOpt,
            expenseReviewer: newSearchOpt.expenseReviewer === '筛选有审核人的发票' ? '' : newSearchOpt.expenseReviewer,
            expenseReviewerNotNull: newSearchOpt.expenseReviewer === '筛选有审核人的发票' ? 1 : '',
            expenseSystemSource: newSearchOpt.expenseSystemSource === '筛选有来源系统的发票' ? '' : newSearchOpt.expenseSystemSource,
            expenseSystemSourceNotNull: newSearchOpt.expenseSystemSource === '筛选有来源系统的发票' ? 1 : '',
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
            this.checkShrSource(res.data);
        } else {
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
        let dateRange = 31;
        if (this.props.useNewAccountQuery) { //新台账
            dateRange = 92;
        }
        if (this.props.useNewAccountQuery && this.props.expandSearchRange) {
            dateRange = 365;
        }
        if (!invoiceTime[0] && !collectTime[0] && !expendTime[0]) {
            disabledLoad = true;
            errMsg = '采集日期、开票日期、审核通过时间不能都为空';
        } else {
            let invoiceTimeTxt = '';
            let collectTimeTxt = '';
            let expendTimeTxt = '';
            if (invoiceTime[0]) {
                if (invoiceTime[1].diff(invoiceTime[0], 'days') > dateRange) {
                    invoiceTimeTxt = '开票日期、';
                    disabledLoad = true;
                }
            }
            if (collectTime[0]) {
                if (collectTime[1].diff(collectTime[0], 'days') > dateRange) {
                    collectTimeTxt = '采集日期、';
                    disabledLoad = true;
                }
            }

            if (expendTime[0]) {
                if (expendTime[1].diff(expendTime[0], 'days') > dateRange) {
                    expendTimeTxt = '审核通过时间';
                    disabledLoad = true;
                }
            }
            errMsg = invoiceTimeTxt + collectTimeTxt + expendTimeTxt + '的起止日期不能超过' + dateRange + '天';
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
                        const [keyId, keySerialNo] = k.split('-');
                        return r.serialNo !== keySerialNo;
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
            title: '发票信息和影像文件将被删除，请谨慎操作，确定删除该发票？',
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
        const { expenseName = '', expenseTime, remark = '', expenseNum = '', serialNos, projectName = '' } = info;
        const opt = [];
        for (let i = 0; i < serialNos.length; ++i) {
            opt.push({ expenseNum, expenseName, expenseTime, remark, projectName, serialNo: serialNos[i] });
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

    batchDelete = (serialNos) => {
        confirm({
            title: '发票信息和影像文件将被删除，请谨慎操作，确定删除勾选的发票？',
            onOk: async() => {
                message.loading('处理中...', 0);
                const res = await this.props.onBatchDelete({
                    recognitionSerialNos: serialNos
                });
                message.destroy();
                if (res.errcode === '0000') {
                    message.info('删除成功');
                    this.queryInvoiceNum();
                    this.setState({
                        selectedAllKeys: {},
                        selectedAllRows: {}
                    });
                    this.allTabKeys = [];
                } else {
                    message.info(res.description);
                }
            }
        });
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
        let otherInvoices = false;
        for (let i = 0; i < allKeys.length; i++) {
            const curTabList = selectedAllRows[allKeys[i]];
            for (let j = 0; j < curTabList.length; j++) {
                if (!isNaN(parseFloat(curTabList[j].totalAmount))) {
                    totalInvoiceAmount += parseFloat(curTabList[j].totalAmount);
                }
                if (!isNaN(parseFloat(curTabList[j].totalTaxAmount))) {
                    totalTaxAmount += parseFloat(curTabList[j].totalTaxAmount);
                }
                const isAddedTax = addedInvoiceTypes.indexOf(curTabList[j].invoiceType) > -1;
                const allowTypes = [9, 10, 16, 20].indexOf(curTabList[j].invoiceType) > -1;
                if (isAddedTax || allowTypes) {
                    otherInvoices = true;
                }
            }
        }
        return {
            otherInvoices,
            totalInvoiceAmount,
            totalTaxAmount
        };
    }

    // 输入压缩密码后校验
    continueDownload = async() => {
        const { fdataType } = this.state;
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
                fdataType,
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
        this.setState({ showDownloadModal: false, isDownloading: false, zipPassword: '' });
        typeof this.props.onContinueDownload === 'function' && this.props.onContinueDownload();
    }

    // 下载版式原文件
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
                        showDownloadModal: true,
                        fdataType: 3
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

    onChangeSearch = (opt) => {
        this.setState({
            ...opt
        });
    }

    digtalXMLDownLoad = () => { //下载数电票xml
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
            data: {
                ...newOpt,
                isDownloadEleXml: 'Y'
            },
            startCallback: () => {
                this.setState({
                    exportXmlIng: true
                });
            },
            endCallback: (res) => {
                // 超过导出数据超过100条，将申请到后台处理
                if (res.errcode === '0615') {
                    message.destroy();
                    this.setState({
                        exportXmlIng: false,
                        showDownloadModal: true,
                        fdataType: 6
                    });
                    return;
                }
                this.setState({
                    exportXmlIng: false
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

    handleTableChange = (pagination, filters, sorter) => {
        const { columnKey, order = '' } = sorter;
        this.setState({
            sortOpt: {
                orderColumn: !order ? '' : columnKey === 'collectDate' ? 'collectTime' : columnKey === 'invoiceDate' ? 'invoiceTime' : '',
                orderBy: order === 'ascend' ? 'asc' : order === 'descend' ? 'desc' : ''
            }
        }, () => this.freshList());
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
            selectedAllRows,
            userSource,
            showCollectorInfo,
            collectorList
        } = this.state;
        const { totalInvoiceAmount, totalTaxAmount, otherInvoices } = this.getSelectInfo(selectedAllRows);
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
            const keySerialNos = selectedAllKeys[k].map(item => item.split('-')[1]);
            this.allTabKeys = this.allTabKeys.concat(keySerialNos);
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
        } else if (['k4', 'k83', 'k84'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2200;
        } else if (['k1', 'k2', 'k3', 'k5', 'k12', 'k13', 'k15', 'k27'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2380;
        } else if (['k10', 'k21', 'k26'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2580;
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
            } else if (item.dataIndex === 'collectorPhone' || item.dataIndex === 'collectorName') {
                return {
                    ...item,
                    render: (v, r) => {
                        if (r.collectorList && r.collectorList.length > 1) {
                            return (
                                <a
                                    href='javascript:;'
                                    onClick={() => this.setState({
                                        showCollectorInfo: true,
                                        collectorList: r.collectorList
                                    })}
                                >
                                    查看详情
                                </a>
                            );
                        } else {
                            return v || '--';
                        }
                    }
                };
            }else if (item.dataIndex === 'invoiceDate' || item.dataIndex === 'collectDate') {
                return {
                    ...item,
                    sorter: true,
                    sortDirections: ['descend', 'ascend']
                };
            } else {
                return item;
            }
        });
        if (userSource == '8') {
            const filterField = [ //epson过滤字段
                'rz',
                'selectAuthenticateTime',
                'expendTime',
                'isEntryVoucher',
                'accountDate',
                'vouchInfo',
                'canBeDeduction',
                'entryAmount',
                'outputAmount',
                'outputReason'
            ];
            tableColumns = tableColumns.filter((item) => {
                return filterField.indexOf(item.dataIndex) == '-1';
            });
        }

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
        const { shrSlogan } = this.state;
        if (shrSlogan && userSource != '8') {
            scrollWidth = scrollWidth + 200;
            const len = tableColumns.length;
            tableColumns.splice(len - 2, 0, shrSource);
        }
        const tableProps = {
            key: 'table',
            loading,
            scroll: { x: scrollWidth },
            columns: tableColumns,
            dataSource: listData,
            pagination: false,
            // rowKey: 'id',
            rowKey: record => `${record.id}-${record.serialNo}`,
            onChange: this.handleTableChange
        };

        if (listData.length > 0) {
            tableProps.rowSelection = rowSelection;
        }
        return (
            <div className='accountManage'>
                <AccountSearch
                    searchOpt={searchOpt}
                    userSource={userSource}
                    getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                    gitReviewerUrl={this.props.gitReviewerUrl}
                    isAddedTax={isAddedTax}
                    onChangeSearch={this.onChangeSearch}
                    onSearch={this.onSearch}
                    emptyClick={this.emptyClick}
                    loading={loading}
                />
                <div className='middleOperateBtns' style={{ borderBottom: listData.length > 0 ? '1px solid #eee' : 'none' }}>
                    <Button
                        loading={this.props.exporting}
                        type='primary'
                        onClick={this.exportExcel}
                        disabled={listData.length === 0 || loading}
                    >导出数据
                    </Button>
                    {
                        typeof this.props.exportElecFilesUrl === 'string' ? (
                            <Tooltip title='优先下载税局同步的版式文件或税控电票源文件OFD/PDF，无则下载用户上传的文件（优先级OFD>PDF>图片）'>
                                <Button
                                    style={{ marginLeft: 15 }}
                                    loading={this.state.exportElecIng}
                                    onClick={this.exportElecFiles}
                                    disabled={loading}
                                >下载（版式）原文件
                                </Button>
                            </Tooltip>
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
                        disabled={this.allTabKeys.length === 0 || addedInvoiceTypes.indexOf(activeInvoiceType) === -1 || activeInvoiceType == 26 || activeInvoiceType == 27 || activeInvoiceType == 28 || activeInvoiceType == 29 || activeInvoiceType == 83 || activeInvoiceType == 84}
                    >批量查验
                    </Button>
                    <Button
                        onClick={() => this.startPrintInvoice(this.allTabKeys)}
                        style={{ marginLeft: 15 }}
                        disabled={this.allTabKeys.length === 0 || isPrintLoading}
                    >打印发票
                    </Button>
                    <Button
                        onClick={() => this.batchDelete(this.allTabKeys)}
                        style={{ marginLeft: 15 }}
                        disabled={this.allTabKeys.length === 0}
                    >批量删除
                    </Button>
                    <Tooltip title='下载数电票的XML文件，税局同步的XML优先级高于用户上传的文件'>
                        <Button
                            onClick={() => this.digtalXMLDownLoad(this.allTabKeys)}
                            loading={this.state.exportXmlIng}
                            style={{ marginLeft: 15 }}
                            disabled={loading}
                        >下载数电票XML
                        </Button>
                    </Tooltip>
                    {
                        typeof this.props.updateEntryInfo === 'function' && userSource != '8' ? (
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
                    loading={loading}
                    tabInfo={invoiceTabsData}
                    onChange={this.changeActiveInvoiceTab}
                    activeInvoiceType={'k' + activeInvoiceType}
                    INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                />

                <Table {...tableProps} />

                <div className='tblBottom'>
                    <div className='floatLeft'>
                        <span>已选择<span className='number'>{this.allTabKeys.length}</span>张发票</span>
                        <span>&nbsp;&nbsp;已选总金额合计：<span className='number'>￥{totalInvoiceAmount.toFixed(2)}</span></span>
                        {
                            otherInvoices ? (
                                <span>&nbsp;&nbsp;已选税额合计：<span className='number'>￥{totalTaxAmount.toFixed(2)}</span></span>
                            ) : null
                        }
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
                <Modal
                    visible={showCollectorInfo}
                    title='采集人信息'
                    onCancel={() => this.setState({ showCollectorInfo: false })}
                    width={600}
                    top={10}
                    footer={null}
                    bodyStyle={{ padding: 12 }}
                    destroyOnClose={true}
                >
                    <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                        <Table
                            columns={collectorColums}
                            dataSource={collectorList}
                            pagination={false}
                            rowKey='collectTime'
                        />
                    </div>
                </Modal>

                <PrintImg
                    printData={printImgs}
                    printEnd={this.printEnd}
                    fullScreen={true}
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
    shrSourceUrl: PropTypes.string,
    getExpenseNumUrl: PropTypes.string,
    userSource: PropTypes.string,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string,
    useNewAccountQuery: PropTypes.bool,
    onBatchDelete: PropTypes.func.isRequired,
    expandSearchRange: PropTypes.bool
};

export default AccountManage;
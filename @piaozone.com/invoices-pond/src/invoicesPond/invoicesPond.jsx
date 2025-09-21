import React from 'react';
import PropTypes from 'prop-types';
import EditInvoice from '@piaozone.com/editInvoice-pc';
import { Button, DatePicker, Pagination, Modal, message, Input, Table, Tooltip, Icon, Tag } from 'antd';
import moment from 'moment';
import { INPUT_INVOICE_TYPES } from '../commons/constants';
import { columsDictFun } from './pondInvoiceCols';
import { modalInfo, confirm } from '../commons/antdModal';
import ShowRelateBill from './showRelateBill';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import PrintImg from '@piaozone.com/print-image';
import { tools, pwyFetch } from '@piaozone.com/utils';
import InvoiceTabs from '../invoicesTabs/';
import RecommendFun from './recommendFun';
const { TextArea } = Input;
const { CheckableTag } = Tag;
const { RangePicker, MonthPicker } = DatePicker;
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;
var entryDate = [];
var data = new Date();
data.setMonth(data.getMonth() + 1, 1); //获取到当前月份,设置月份
for (var i = 0; i < 12; i++) {
    data.setMonth(data.getMonth() - 1); //每次循环一次 月份值减1
    var m = data.getMonth() + 1;
    m = m < 10 ? '0' + m : m + '';
    entryDate.push({ checked: false, value: data.getFullYear() + m, text: data.getFullYear() + '/' + m });
}

const tabName = [{ text: '全部', value: 0, allowDeduction: 0 }].concat(INPUT_INVOICE_TYPES);
class InvoicesPond extends React.Component {
    constructor() {
        super(...arguments);
        this.allTabKeys = [];
        this.initSearchOpt = {
            zipPassword: '',
            expenseNum: '', //报销单号
            belongDate: [moment().startOf('month'), moment()],
            expendTime: '',
            invoiceTime: [null, null],
            authInvoiceDate: [null, null], //认证时间
            invoiceStatus: '', // 发票状态
            invoiceCode: '', //发票代码
            invoiceNo: '', //发票号码
            salerName: '', //开票企业
            buyerName: '', //购方企业
            equalNameValue: '', //抬头是否一致 1 一致， 2 不一致
            originalState: '', //原件签收状态  1是 0否
            expendStatus: '', //使用状态 1-未报销,30-审核中,60-已报销未入账,65-已入账';
            authenticateFlags: '', //认证状态 0:未勾选，1勾选未认证，2勾选已认证，3扫描认证';
            collectUser: '', //采集人: 手机号
            pageNo: 1,
            pageSize: 10,
            invoiceTypes: '', //发票类型
            transportDeduction: '', //1:旅客 未抵扣2：抵扣
            accountDate: '', //入账属期
            accountTime: [null, null], //入账时间
            taxPeriod: null
        };
        this.state = {
            totalCount: 0,
            serachValue: '',
            selectedAllRows: {},
            listData: [],
            invoiceTabsData: {},
            loading: true,
            activeInvoiceType: '',
            selectedAllKeys: {},
            accountDate: moment(),
            curEditInfo: {},
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
            showMore: false,
            moreEntryDate: false,
            moreInvoiceTypes: false,
            invoiceTypesArr: [],
            sensitiveWords: [], //已选方案
            fpStatus: [],
            bxStatus: [],
            gxConfirm: [],
            originalStateArr: [], //纸票签收状态 1是 0否
            transportDeductionArr: [], //1:未抵扣2：已抵扣
            chooseBuyName: [] //发票抬头
        };
    }

    componentDidMount = async() => {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    //已选定方案：
    selectedFun = () => {
        const project = [];
        const {
            programme,
            entryDate,
            invoiceTypesArr,
            fpStatus,
            bxStatus,
            gxConfirm,
            originalStateArr,
            transportDeductionArr,
            chooseBuyName,
            searchOpt
        } = this.state;
        const entryDateTxt = this.mapTxt(entryDate);
        const invoiceTypesTxt = this.mapTxt(invoiceTypesArr);
        const fpStatusTxt = this.mapTxt(fpStatus);
        const bxStatusTxt = this.mapTxt(bxStatus);
        const gxConfirmTxt = this.mapTxt(gxConfirm);
        const originalStateTxt = this.mapTxt(originalStateArr);
        const transportTxt = this.mapTxt(transportDeductionArr);
        const chooseBuyNameTxt = this.mapTxt(chooseBuyName);
        if (programme) {
            const item = '筛选方案：' + programme;
            project.push({ name: 'programme', text: item });
        }
        if (entryDateTxt) {
            project.push({ name: 'entryDate', text: '入账属期：' + entryDateTxt });
        }
        if (invoiceTypesTxt) {
            project.push({ name: 'invoiceTypesArr', text: '发票种类：' + invoiceTypesTxt });
        }
        if (fpStatusTxt) {
            project.push({ name: 'fpStatus', text: '发票状态：' + fpStatusTxt });
        }
        if (bxStatusTxt) {
            project.push({ name: 'bxStatus', text: '使用状态：' + bxStatusTxt });
        }
        if (gxConfirmTxt) {
            project.push({ name: 'gxConfirm', text: '是否勾选确认：' + gxConfirmTxt });
        }
        if (originalStateTxt) {
            project.push({ name: 'originalStateArr', text: '签收状态：' + originalStateTxt });
        }
        if (transportTxt) {
            project.push({ name: 'transportDeductionArr', text: '旅客运输税额是否已抵扣：' + transportTxt });
        }
        if (chooseBuyNameTxt) {
            project.push({ name: 'chooseBuyName', text: '发票抬头是否一致：' + chooseBuyNameTxt });
        }
        if (searchOpt.invoiceCode && searchOpt.invoiceCode != '') {
            project.push({ name: 'invoiceCode', text: '发票代码：' + searchOpt.invoiceCode });
        }
        if (searchOpt.invoiceNo && searchOpt.invoiceNo != '') {
            project.push({ name: 'invoiceNo', text: '发票号码：' + searchOpt.invoiceNo });
        }
        if (searchOpt.salerName && searchOpt.salerName != '') {
            project.push({ name: 'salerName', text: '企业名称：' + searchOpt.salerName });
        }
        if (searchOpt.collectUser && searchOpt.collectUser != '') {
            project.push({ name: 'collectUser', text: '采集人：' + searchOpt.collectUser });
        }
        if (searchOpt.expenseNum && searchOpt.expenseNum != '') {
            project.push({ name: 'expenseNum', text: '报销单号：' + searchOpt.expenseNum });
        }
        this.setState({
            sensitiveWords: project,
            programme
        });
    }

    mapTxt = (data) => {
        let result = '';
        if (data) {
            for (const item of data) {
                if (item.checked) {
                    result += item.text + ',';
                }
            }
        }
        return result;
    }

    onChooseFun = (item) => { //默认方案
        const { searchOpt } = this.state;
        const {
            programme,
            invoiceTypesArr,
            invoiceTypes,
            fpStatus,
            invoiceStatus,
            bxStatus,
            expendStatus,
            gxConfirm,
            authenticateFlags,
            originalStateArr,
            originalState,
            transportDeductionArr,
            transportDeduction,
            chooseBuyName,
            equalNameValue
        } = item;
        this.setState({
            invoiceTypesArr,
            fpStatus,
            bxStatus,
            gxConfirm,
            originalStateArr,
            transportDeductionArr,
            chooseBuyName,
            programme
        }, () => { //更新筛选条件project
            this.selectedFun();
        });
        this.screenOpt({
            ...searchOpt,
            invoiceTypes,
            invoiceStatus,
            expendStatus,
            authenticateFlags,
            originalState,
            transportDeduction,
            equalNameValue
        });
    }

    handleChangeTag = (i, name) => {
        const { searchOpt } = this.state;
        let { invoiceTypesArr, fpStatus, bxStatus, gxConfirm, originalStateArr, transportDeductionArr, chooseBuyName } = this.state;
        if (name == 'entryDate') {
            let accountDate = '';
            entryDate.forEach((item, j) => {
                if (i == j) {
                    item.checked = !item.checked;
                } else {
                    item.checked = false;
                }
            });
            if (entryDate[i].checked) {
                accountDate = entryDate[i].value;
            }
            searchOpt.accountDate = accountDate;
        }
        if (name === 'invoiceTypesArr') { //支持多选
            invoiceTypesArr = this.selectTag(i, invoiceTypesArr);
            const invoiceTypes = [];
            for (const item of invoiceTypesArr) {
                if (item.checked) {
                    invoiceTypes.push(item.value);
                }
            }
            searchOpt.invoiceTypes = invoiceTypes.join(',');
        }
        if (name === 'fpStatus') { //支持多选
            fpStatus = this.selectTag(i, fpStatus);
            const invoiceStatus = [];
            for (const item of fpStatus) {
                if (item.checked) {
                    invoiceStatus.push(item.value);
                }
            }
            searchOpt.invoiceStatus = invoiceStatus.join(',');
        }
        if (name === 'bxStatus') { //支持多选
            bxStatus = this.selectTag(i, bxStatus);
            const expendStatus = [];
            for (const item of bxStatus) {
                if (item.checked) {
                    expendStatus.push(item.value);
                }
            }
            const expendStatusStr = expendStatus.join(',');
            searchOpt.expendStatus = expendStatusStr;
            if (expendStatusStr !== '65' && expendStatusStr !== '') {
                searchOpt.taxPeriod = null;
            }
        }
        if (name === 'gxConfirm') { //支持多选
            gxConfirm = this.selectTag(i, gxConfirm);
            const authenticateFlags = [];
            for (const item of gxConfirm) {
                if (item.checked) {
                    authenticateFlags.push(item.value);
                }
            }
            searchOpt.authenticateFlags = authenticateFlags.join(',');
        }
        if (name === 'originalStateArr') {
            originalStateArr.forEach(item => { item.checked = false; });
            originalStateArr[i].checked = true;
            const originalState = originalStateArr[i].value;
            searchOpt.originalState = originalState;
        }
        if (name === 'transportDeductionArr') {
            transportDeductionArr.forEach(item => { item.checked = false; });
            transportDeductionArr[i].checked = true;
            const transportDeduction = transportDeductionArr[i].value;
            searchOpt.transportDeduction = transportDeduction;
        }
        if (name === 'chooseBuyName') {
            chooseBuyName.forEach(item => { item.checked = false; });
            chooseBuyName[i].checked = true;
            const equalNameValue = chooseBuyName[i].value;
            searchOpt.equalNameValue = equalNameValue;
        }
        this.setState({
            invoiceTypesArr,
            fpStatus,
            bxStatus,
            gxConfirm,
            originalStateArr,
            transportDeductionArr,
            chooseBuyName
        }, () => {
            //更新筛选条件project
            this.selectedFun();
            this.screenOpt({
                ...searchOpt
            });
        });
    }

    selectTag = (i, data) => {
        for (var j in data) {
            if (i > 0) {
                if (i == j) {
                    data[j].checked = !data[j].checked;
                }
                data[0].checked = false;
            } else {
                data[0].checked = true;
                data[j].checked = false;
            }
        }
        return data;
    }

    deletTag = (opt) => {
        const { name } = opt.data;
        const { index } = opt;
        const { sensitiveWords } = this.state;
        sensitiveWords.splice(index, 1);
        this.setState({
            sensitiveWords
        });
        //更新对应状态栏；
        this.resetCondition(name);
    }

    resetCondition = (name) => {
        const { invoiceTypesArr, fpStatus, bxStatus, gxConfirm, originalStateArr } = this.state;
        const { transportDeductionArr, chooseBuyName } = this.state;
        let searchOpt = this.state.searchOpt;
        if (name == 'invoiceTypesArr') { //发票种类
            invoiceTypesArr.forEach(item => { item.checked = false; });
            searchOpt.invoiceTypes = '0';
        }
        if (name == 'fpStatus') { //发票状态
            fpStatus.forEach(item => { item.checked = false; });
            searchOpt.invoiceStatus = '';
        }
        if (name == 'bxStatus') { //使用状态
            bxStatus.forEach(item => { item.checked = false; });
            searchOpt.expendStatus = '';
        }
        if (name == 'gxConfirm') { //勾选确认
            gxConfirm.forEach(item => { item.checked = false; });
            searchOpt.authenticateFlags = '';
        }
        if (name == 'originalStateArr') { //签收状态
            originalStateArr.forEach(item => { item.checked = false; });
            searchOpt.originalState = '';
        }
        if (name == 'transportDeductionArr') { //旅游运输抵扣
            transportDeductionArr.forEach(item => { item.checked = false; });
            searchOpt.transportDeduction = '';
        }
        if (['chooseBuyName', 'invoiceCode', 'invoiceNo', 'salerName', 'collectUser', 'expenseNum'].indexOf(name) != -1) {
            chooseBuyName.forEach(item => { item.checked = false; });
            searchOpt = {
                ...searchOpt,
                [name]: ''
            };
        }
        this.setState({
            invoiceTypesArr,
            fpStatus,
            bxStatus,
            gxConfirm,
            originalStateArr,
            transportDeductionArr,
            chooseBuyName
        }, () => {
            this.screenOpt({
                ...searchOpt
            });
        });
    }

    //条件框
    screenOpt = (opt) => {
        let { searchOpt } = this.state;
        searchOpt = {
            ...searchOpt,
            ...opt
        };
        this.setState({
            searchOpt: {
                ...searchOpt,
                ...opt
            }
        }, () => {
            this.queryInvoiceNum(false, 1, 10, 0);
        });
    }

    onShowEditDialog = (r) => {
        this.onCheckTimes(r);
    }

    onCheckTimes = async(r) => { //查看
        const { invoiceType, invoiceCode, invoiceNo } = r;
        let checkCount = null;
        let lastCheckTime = null;
        if ([1, 2, 3, 4, 5, 12, 13, 15, 26, 27].indexOf(invoiceType) != -1) {
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
                    checkCount,
                    lastCheckTime
                });
                return;
            }
        }

        this.setState({
            curEditInfo: r,
            checkCount: null,
            lastCheckTime: null
        });
    }

    getSearchOpt(searchOpt) { //查询条件
        const { invoiceTime, belongDate, accountTime, authInvoiceDate, taxPeriod, ...otherOpt } = searchOpt;
        const result = {
            ...otherOpt,
            taxPeriod: taxPeriod ? taxPeriod.format('YYYYMM') : '',
            invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', //发票日期起
            invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', //发票日期止
            belongDateStart: belongDate && belongDate[0] ? belongDate[0].format('YYYY-MM-DD') : '', //采集日期起
            belongDateEnd: belongDate && belongDate[1] ? belongDate[1].format('YYYY-MM-DD') : '',
            accountTimeStart: accountTime && accountTime[0] ? accountTime[0].format('YYYY-MM-DD') : '', //入账开始时间
            accountTimeEnd: accountTime && accountTime[1] ? accountTime[1].format('YYYY-MM-DD') : '',
            authStartTime: authInvoiceDate && authInvoiceDate[0] ? authInvoiceDate[0].format('YYYY-MM-DD') : '', // 认证日期
            authEndTime: authInvoiceDate && authInvoiceDate[1] ? authInvoiceDate[1].format('YYYY-MM-DD') : '' // 认证日期
        };
        return result;
    }

    queryInvoiceNum = async(onlyUpdateNum, pageNo = this.state.searchOpt.pageNo,
        pageSize = this.state.searchOpt.pageSize,
        activeInvoiceType = this.state.activeInvoiceType
    ) => { //查询发票种类及数量
        if (!this._isMounted) {
            return false;
        }
        this.setState({
            loading: true
        });
        const res = await this.props.onQueryInvoiceNums(this.getSearchOpt(this.state.searchOpt));
        if (res.errcode === '0000') {
            const invoiceTabsData = {};
            let resData = res.data || [];
            resData = resData.filter((item) => {
                return [28, 29, 30].indexOf(parseInt(item.invoiceType)) === -1;
            });
            if (resData.length > 0) {
                for (let i = 0; i < resData.length; i++) {
                    const curData = resData[i];
                    invoiceTabsData['k' + curData.invoiceType] = { num: curData.totalCount };
                }
                const allowActiveInvoiceType = resData[0].invoiceType + '';
                // 如果当前的tab没有发票就切换到第一个
                // const activeData = invoiceTabsData['k' + activeInvoiceType];
                // if ((!activeData || activeData.num <= 0) && allowActiveInvoiceType) {
                //     activeInvoiceType = allowActiveInvoiceType;
                // }
                activeInvoiceType = allowActiveInvoiceType;
                this.setState({
                    invoiceTabsData,
                    activeInvoiceType
                });
                if (!onlyUpdateNum) { // 仅仅刷新数量显示，查验发票时可能发票类型发生变化
                    this.freshList(pageNo, pageSize, this.state.searchOpt.invoiceTypes);
                }
            } else {
                this.setState({
                    loading: false,
                    invoiceTabsData,
                    activeInvoiceType,
                    listData: [],
                    totalElement: 0,
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

    freshList = async(pageNo = this.state.searchOpt.pageNo, pageSize = this.state.searchOpt.pageSize, invoiceTypes = this.state.searchOpt.invoiceTypes) => {
        //刷新列表
        if (!this._isMounted) {
            return false;
        }
        this.setState({
            loading: true
        });
        const newSearchOpt = this.getSearchOpt(this.state.searchOpt);
        const res = await this.props.onQueryAccount({
            ...newSearchOpt,
            invoiceTypes,
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
                // activeInvoiceType: invoiceTypes,
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

    onChangeSearch = (e) => { //搜索
        this.setState({
            serachValue: e.target.value.trim()
        });
    }

    onSearch = (name, value) => {
        const { searchOpt } = this.state;
        searchOpt[name] = value;
        this.setState({
            selectedAllKeys: {},
            selectedAllRows: {},
            serachValue: '',
            searchOpt
        }, () => {
            this.selectedFun();
        });
        this.allTabKeys = [];
        this.queryInvoiceNum(false, 1, 10, 0);
    }


    changeActiveInvoiceTab = (info) => {
        let currentType = info.invoiceType;
        if (currentType == '0') {
            currentType = this.state.searchOpt.invoiceTypes;
            this.setState({
                activeInvoiceType: '0'
            });
        } else {
            this.setState({
                activeInvoiceType: info.invoiceType
            });
        }

        this.freshList(1, this.state.searchOpt.pageSize, currentType);
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



    checkSelectTime = () => {
        let errMsg = '';
        let disabledLoad = false;
        const { invoiceTime, belongDate, expendTime } = this.state.searchOpt;
        if (!invoiceTime[0] && !belongDate[0] && !expendTime[0]) {
            disabledLoad = true;
            errMsg = '采集日期、开票日期、审核通过时间不能都为空';
        } else {
            let invoiceTimeTxt = '';
            let belongDateTxt = '';
            let expendTimeTxt = '';
            if (invoiceTime[0]) {
                if (invoiceTime[1].diff(invoiceTime[0], 'days') > 31) {
                    invoiceTimeTxt = '开票日期、';
                    disabledLoad = true;
                }
            }
            if (belongDate[0]) {
                if (belongDate[1].diff(belongDate[0], 'days') > 31) {
                    belongDateTxt = '采集日期、';
                    disabledLoad = true;
                }
            }

            if (expendTime[0]) {
                if (expendTime[1].diff(expendTime[0], 'days') > 31) {
                    expendTimeTxt = '审核通过时间';
                    disabledLoad = true;
                }
            }
            errMsg = invoiceTimeTxt + belongDateTxt + expendTimeTxt + '的起止日期不能超过一个月';
        }
        if (disabledLoad) {
            return { errcode: '3001', description: errMsg };
        }
        return {
            errcode: '0000',
            description: 'success'
        };
    }

    exportExcel = () => { //导出数据
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

    onDeleteInvoice(r) {
        //删除发票时更新发票数量
        confirm({
            title: '确定删除该发票？',
            onOk: async() => {
                message.loading('处理中...', 0);
                const res = await this.props.onDeleteInvoice({
                    serialNo: r.serialNo
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
            this.freshList(this.state.searchOpt.pageNo, this.state.searchOpt.pageSize, this.state.activeInvoiceType);
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
    onConfirmAddExpenseInfo = async() => {
        const selectedAllKeys = this.allTabKeys;
        const { expenseName = '', expenseTime, remark = '', expenseNum = '' } = this.state.invoiceExpenseInfo;
        let expenseDate = null;
        if (expenseTime != '' && expenseTime != null) {
            expenseDate = expenseTime.format('YYYY-MM-DD');
        }
        if (!expenseNum.trim()) {
            message.info('请输入报销单编号');
            return;
        }
        const opt = [];
        for (let i = 0; i < selectedAllKeys.length; ++i) {
            opt.push({ expenseNum, expenseName, expenseTime: expenseDate, remark, serialNo: selectedAllKeys[i] });
        }
        message.loading('处理中...', 0);
        const res = await this.props.onAddExpenseInfo(opt);
        message.destroy();
        if (res.errcode === '0000') {
            message.success('添加成功');
            this.freshList(this.state.searchOpt.pageNo, this.state.searchOpt.pageSize, this.state.activeInvoiceType);
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

    showRelatedBill = (serialNo) => { //关联单据
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

    // 原件下载
    exportElecFiles = () => {
        const checkRes = this.checkSelectTime();
        if (checkRes.errcode !== '0000') {
            message.info(checkRes.description);
            return;
        }
        const newOpt = this.getSearchOpt(this.state.searchOpt);
        tools.downloadFile({
            downloadType: 'xhr',
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

    showAddBxDialog = (serialNos) => { //原件下载
        const loginInfo = this.props.loginInfo || {};
        const kpy = loginInfo.kpy || '';
        var formatTime = moment(Date.now());
        const { invoiceExpenseInfo, listData } = this.state;
        invoiceExpenseInfo.expenseName = kpy;
        invoiceExpenseInfo.expenseTime = formatTime;

        this.setState({
            invoiceExpenseInfo: {
                ...invoiceExpenseInfo
            }
        });
        let isValidate = true;
        let hasExpenseCorrelation = false;
        const filterData = listData.filter((item) => {
            return serialNos.indexOf(item.serialNo) !== -1;
        });

        for (let i = 0; i < filterData.length; i++) {
            const item = filterData[i];
            if (addedInvoiceTypes.indexOf(parseInt(item.invoiceType)) !== -1 && item.checkStatus !== 1) {
                modalInfo({
                    title: '添加报销信息提示',
                    content: '部分发票未查验或查验失败，请选择“已查验”的发票进行报销信息的添加。'
                });
                isValidate = false;
                break;
            }
            if (item.isExpenseCorrelation === 2) {
                hasExpenseCorrelation = true;
            }
        }

        if (isValidate) {
            if (hasExpenseCorrelation) {
                confirm({
                    title: '添加报销信息提示',
                    content: '部分发票已录入报销信息，请确认是否继续录入？',
                    onOk: () => {
                        this.setState({
                            invoiceExpenseInfo: {
                                ...invoiceExpenseInfo,
                                showModal: true
                            }
                        });
                    }
                });
            } else {
                this.setState({
                    invoiceExpenseInfo: {
                        ...invoiceExpenseInfo,
                        showModal: true
                    }
                });
            }
        }
    }

    // 显示签收框之前校验
    showSignDialog = (serialNos) => { //原件签收
        let isValidate = true;
        const { invoiceSign, listData } = this.state;
        const filterData = listData.filter((item) => {
            return serialNos.indexOf(item.serialNo) !== -1;
        });

        for (let i = 0; i < filterData.length; i++) {
            const item = filterData[i];
            if (item.originalState == '1') {
                modalInfo({
                    title: '原件签收提示',
                    content: '部分发票已被签收，请选择“未签收”状态的增值税发票进行签收。'
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

    updateEntryInfoClick = () => {
        let filterFlag = false;
        const { selectedAllRows } = this.state;
        const keys = Object.keys(selectedAllRows);
        const updatEntrylist = [];
        for (let i = 0; i < keys.length; i++) {
            for (let j = 0; j < selectedAllRows[keys[i]].length; j++) {
                const item = selectedAllRows[keys[i]][j];
                // 发票状态正常，已经查验通过的发票才允许添加入账信息
                if (item.isEntryVoucher === 1) {
                    filterFlag = true;
                }
                if (addedInvoiceTypes.indexOf(parseInt(item.invoiceType)) !== -1) {
                    if (item.invoiceStatus === 0 && item.checkStatus === 1) {
                        updatEntrylist.push({
                            serialNo: item.serialNo,
                            oldVouchId: item.vouchId || ''
                        });
                    }
                } else {
                    updatEntrylist.push({
                        serialNo: item.serialNo,
                        oldVouchId: item.vouchId || ''
                    });
                }
            }
        }
        if (updatEntrylist.length === 0) {
            message.info('请选择发票状态正常、查验通过(增值税), 未入账的发票维护入账信息');
            return;
        }
        if (!filterFlag) {
            this.setState({
                showEntryInfo: true,
                updatEntrylist
            });
        } else {
            confirm({
                title: '存在部分发票已入账，请确认是否修改入账信息',
                onOk: async() => {
                    this.setState({
                        showEntryInfo: true,
                        updatEntrylist
                    });
                }
            });
        }
    }

    updateEntryInfo = async() => { // 更新入账信息
        const { vouchNo, accountDate, updatEntrylist } = this.state;
        if (!vouchNo || !accountDate) {
            message.info('会计属期和凭证号都不能为空！');
            return;
        }
        const accountDateStr = accountDate.format('YYYYMM');
        message.loading('处理中...', 0);
        const res = await this.props.updateEntryInfo({
            vouchNo,
            accountPeriod: accountDateStr,
            vouchId: tools.getUUId(),
            vouchInfo: updatEntrylist
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return;
        }
        message.info('入账信息更新成功');
        this.freshList(this.state.searchOpt.pageNo, this.state.searchOpt.pageSize, this.state.activeInvoiceType);
        this.setState({
            selectedAllKeys: {},
            selectedAllRows: {},
            showEntryInfo: false,
            updatEntrylist: [],
            accountDate: moment(),
            vouchNo: ''
        });
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
            selectedAllKeys,
            curEditInfo,
            invoiceTabsData,
            //selectedAllRows,
            serachValue,
            showMore,
            moreEntryDate,
            moreInvoiceTypes,
            sensitiveWords,
            invoiceTypesArr,
            fpStatus,
            bxStatus,
            gxConfirm,
            originalStateArr,
            transportDeductionArr,
            chooseBuyName
        } = this.state;

        const { belongDate, invoiceTime, accountTime, pageNo, pageSize } = searchOpt;
        //const totalInfo = this.getSelectInfo(selectedAllRows);
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
        const operateCol = {
            title: '操作',
            align: 'center',
            fixed: 'right',
            width: 140,
            render: (v, r, i) => {
                let description = '';
                if (parseInt(r.checkStatus) === 1) {
                    description = '已查验的发票不允许编辑';
                }

                if (parseInt(r.delete) === 2) {
                    description = '已废弃的发票不允许编辑';
                }

                if (parseInt(r.transportDeduction) === 2) {
                    description = '已抵扣的发票不允许编辑';
                }

                return (
                    <div className='operate'>
                        <Tooltip title={description}>
                            <a href='javascript:;' onClick={() => { this.onShowEditDialog(r, i); }}>查看</a>
                        </Tooltip>
                        <span className='cute' style={{ margin: '0 7px', color: '#eee' }}>|</span>
                        <span className='cute' style={{ margin: '0 7px', color: '#eee' }}>|</span>
                        <a href='javascript:;' onClick={() => this.onDeleteInvoice(r)}>删除</a>
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
        } else if (['k1', 'k2', 'k3', 'k5', 'k12', 'k13', 'k15', 'k26', 'k27'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2180;
        } else if (['k10'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2480;
        } else if (['k7', 'k16', 'k17', 'k20'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1780;
        } else if (['k19'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1080;
        }

        let tableColumns = listData.length > 0 &&
        columsDictFun(activeInvoiceTypeKey, this.props.loginInfo) ? columsDictFun(activeInvoiceTypeKey, this.props.loginInfo).concat(operateCol) : [];

        tableColumns = tableColumns.map((item) => {
            if (item.dataIndex === 'isExpenseCorrelation') {
                return {
                    ...item,
                    render: (v, r) => {
                        const { expendStatus, serialNo } = r;
                        if (expendStatus == 30 || expendStatus == 60) {
                            return (
                                <a href='javascript:;' onClick={() => this.showRelatedBill(serialNo)}>关联单据</a>
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

        return (
            <div className='ponds'>
                {/* 按钮 */}
                <div className='screenBox'>
                    <div className='topBtns'>
                        <div className='tags' style={{ paddingRight: 100 }}>
                            <span className='title'>筛选条件</span>
                            {
                                sensitiveWords.length > 0 ? (
                                    <>
                                        {
                                            sensitiveWords.map((item, index) => {
                                                return (
                                                    <Tooltip title={item.text} key='index'>
                                                        <Tag
                                                            key={item}
                                                            className='tag'
                                                            width={180}
                                                            closable
                                                            onClose={() => { this.deletTag({ data: item, index: index, key: 'sensitiveWords' }); }}
                                                        >
                                                            {item.text}
                                                        </Tag>
                                                    </Tooltip>

                                                );
                                            })
                                        }
                                    </>
                                ) : null
                            }
                        </div>
                        <div className='moreTip'>
                            {
                                showMore ? (
                                    <span onClick={() => this.setState({ showMore: !showMore })}>收起过滤<Icon className='arrowUp' type='up' /></span>
                                ) : (
                                    <span onClick={() => this.setState({ showMore: !showMore })}>展开过滤<Icon className='arrowDown' type='down' /></span>
                                )
                            }
                        </div>
                    </div>
                    {/* 更多 */}
                    <div className={showMore ? 'moreBox' : 'moreBox hidden'}>
                        <RecommendFun
                            onChooseFun={this.onChooseFun}
                        />
                        <div className='row bottomLine'>
                            <label className='tagName'>入账属期：</label>
                            <div className='tags'>
                                {
                                    entryDate.length > 0 ? (
                                        <div className='region'>
                                            {
                                                entryDate.map((item, i) => {
                                                    if (i < 7) {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'entryDate')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    }
                                                })
                                            }
                                            <label
                                                className='more'
                                                onClick={() => { this.setState({ moreEntryDate: !moreEntryDate }); }}
                                            >
                                                {moreEntryDate ? '收起' : '更多'}
                                            </label>
                                        </div>
                                    ) : null
                                }
                            </div>
                            {
                                moreEntryDate ? (
                                    <div className='moreChoose'>
                                        {
                                            entryDate.length > 0 ? (
                                                <div className='region'>
                                                    {
                                                        entryDate.map((item, i) => {
                                                            if (i > 6) {
                                                                return (
                                                                    <CheckableTag
                                                                        key={i}
                                                                        checked={item.checked}
                                                                        className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                        onChange={(e) => this.handleChangeTag(i, 'entryDate')}
                                                                        style={{ backgroundColor: 'none' }}
                                                                    >
                                                                        {item.text}
                                                                    </CheckableTag>
                                                                );
                                                            }
                                                        })
                                                    }
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                ) : null
                            }
                        </div>
                        <div className='row bottomLine'>
                            <label className='tagName'>发票种类：</label>
                            <div className='tags'>
                                {
                                    invoiceTypesArr.length > 0 ? (
                                        <div className='region'>
                                            {
                                                invoiceTypesArr.map((item, i) => {
                                                    if (i < 10) {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'invoiceTypesArr')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    }
                                                })
                                            }
                                            <label
                                                className='more'
                                                onClick={() => { this.setState({ moreInvoiceTypes: !moreInvoiceTypes }); }}
                                            >
                                                {moreInvoiceTypes ? '收起' : '更多'}
                                            </label>
                                        </div>
                                    ) : null
                                }
                            </div>
                            {
                                moreInvoiceTypes ? (
                                    <div className='moreChoose'>
                                        {
                                            invoiceTypesArr.length > 0 ? (
                                                <div className='region'>
                                                    {
                                                        invoiceTypesArr.map((item, i) => {
                                                            if (i > 9) {
                                                                return (
                                                                    <CheckableTag
                                                                        key={i}
                                                                        checked={item.checked}
                                                                        className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                        onChange={(e) => this.handleChangeTag(i, 'invoiceTypesArr')}
                                                                        style={{ backgroundColor: 'none' }}
                                                                    >
                                                                        {item.text}
                                                                    </CheckableTag>
                                                                );
                                                            }
                                                        })
                                                    }
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                ) : null
                            }
                        </div>
                        <div className='row bottomLine'>
                            <div className='rowItem'>
                                <label className='tagName'>发票状态：</label>
                                <div className='tags'>
                                    {
                                        fpStatus.length > 0 ? (
                                            <div className='region'>
                                                {
                                                    fpStatus.map((item, i) => {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'fpStatus')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    })
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                            <div className='rowItem'>
                                <label className='tagName'>签收状态：</label>
                                <div className='tags'>
                                    {
                                        originalStateArr.length > 0 ? (
                                            <div className='region'>
                                                {
                                                    originalStateArr.map((item, i) => {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'originalStateArr')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    })
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                            <div className='rowItem'>
                                <label className='trivelTagName'>旅客运输税额是否已抵扣：</label>
                                <div className='tags'>
                                    {
                                        transportDeductionArr.length > 0 ? (
                                            <div className='region'>
                                                {
                                                    transportDeductionArr.map((item, i) => {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'transportDeductionArr')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    })
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='row bottomLine'>
                            <div className='rowItem'>
                                <label className='tagName'>使用状态：</label>
                                <div className='tags'>
                                    {
                                        bxStatus.length > 0 ? (
                                            <div className='region'>
                                                {
                                                    bxStatus.map((item, i) => {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'bxStatus')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    })
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                            <div className='rowItem'>
                                <label className='tagName' style={{ width: 132 }}>发票抬头是否一致：</label>
                                <div className='tags'>
                                    {
                                        chooseBuyName.length > 0 ? (
                                            <div className='region'>
                                                {
                                                    chooseBuyName.map((item, i) => {
                                                        return (
                                                            <CheckableTag
                                                                key={i}
                                                                checked={item.checked}
                                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                onChange={(e) => this.handleChangeTag(i, 'chooseBuyName')}
                                                                style={{ backgroundColor: 'none' }}
                                                            >
                                                                {item.text}
                                                            </CheckableTag>
                                                        );
                                                    })
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>

                        </div>
                        <div className='row bottomLine'>
                            <label className='tagName'>是否勾选确认：</label>
                            <div className='tags'>
                                {
                                    gxConfirm.length > 0 ? (
                                        <div className='region'>
                                            {
                                                gxConfirm.map((item, i) => {
                                                    return (
                                                        <CheckableTag
                                                            key={i}
                                                            checked={item.checked}
                                                            className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                            onChange={(e) => this.handleChangeTag(i, 'gxConfirm')}
                                                            style={{ backgroundColor: 'none' }}
                                                        >
                                                            {item.text}
                                                        </CheckableTag>
                                                    );
                                                })
                                            }
                                        </div>
                                    ) : null
                                }
                            </div>
                        </div>
                        <div className='row'>
                            <div className='searchItem inlineBlock' style={{ padding: '8px 0', marginRight: 55 }}>
                                <label className='tagName'>采集日期：</label>
                                <RangePicker
                                    disabledDate={(current) => { return current > moment(); }}
                                    className='rangeDate' style={{ width: 220 }}
                                    onChange={(d) => this.screenOpt({ ...searchOpt, belongDate: d })}
                                    value={belongDate}
                                    placeholder={['开始时间', '结束时间']}
                                    allowClear={true}
                                />
                            </div>
                            <div className='searchItem inlineBlock' style={{ padding: '8px 0', marginRight: 55 }}>
                                <label className='tagName'>开票时间：</label>
                                <RangePicker
                                    disabledDate={(current) => { return current > moment(); }}
                                    className='rangeDate' style={{ width: 220 }}
                                    onChange={(d) => this.screenOpt({ ...searchOpt, invoiceTime: d })}
                                    value={invoiceTime}
                                    placeholder={['开始时间', '结束时间']}
                                    allowClear={true}
                                />
                            </div>
                            <div className='searchItem inlineBlock' style={{ padding: '8px 0', marginRight: 55 }}>
                                <label className='tagName'>入账时间：</label>
                                <RangePicker
                                    disabledDate={(current) => { return current > moment(); }}
                                    className='rangeDate'
                                    style={{ width: 220 }}
                                    onChange={d => this.screenOpt({ ...searchOpt, accountTime: d })}
                                    placeholder={['开始时间', '结束时间']}
                                    value={accountTime}
                                    allowClear={true}
                                />
                            </div>
                            <div className='searchItem inlineBlock' style={{ padding: '8px 0', marginRight: 55 }}>
                                <label className='tagName'>所属税期：</label>
                                <MonthPicker
                                    value={searchOpt.taxPeriod}
                                    placeholder='请选择所属税期'
                                    disabled={searchOpt.expendStatus !== '65' && searchOpt.expendStatus !== ''}
                                    format='YYYYMM'
                                    onChange={(e) => this.screenOpt({ ...searchOpt, taxPeriod: e })}
                                    disabledDate={(c) => {
                                        return c.format('X') > moment().endOf('month').format('X');
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='middleOperateBtns'>
                    <Button
                        className='btn btnCol'
                        loading={this.props.exporting}
                        onClick={this.exportExcel}
                    >数据导出
                    </Button>
                    <Button
                        style={{ marginLeft: 15 }}
                        className='btn btnCol'
                        onClick={this.exportElecFiles}
                    >原件下载
                    </Button>
                    <Button
                        onClick={() => this.showAddBxDialog(this.allTabKeys)}
                        className={this.allTabKeys.length === 0 ? 'btn' : 'btn btnCol'}
                        style={{ marginLeft: 15 }}
                        disabled={this.allTabKeys.length === 0}
                    >维护使用状态信息
                    </Button>

                    <Button
                        onClick={() => this.startPrintInvoice(this.allTabKeys)}
                        className={this.allTabKeys.length === 0 ? 'btn' : 'btn btnCol'}
                        style={{ marginLeft: 15 }}
                        disabled={this.allTabKeys.length === 0 || isPrintLoading}
                    >打印发票
                    </Button>
                    <Button
                        onClick={() => this.showSignDialog(this.allTabKeys)}
                        className={this.allTabKeys.length === 0 ? 'btn' : 'btn btnCol'}
                        style={{ marginLeft: 15 }} disabled={this.allTabKeys.length === 0}
                    >原件签收
                    </Button>
                    {
                        typeof this.props.updateEntryInfo === 'function' ? (
                            <Button
                                onClick={this.updateEntryInfoClick}
                                style={{ marginLeft: 15 }}
                                className={this.allTabKeys.length === 0 ? 'btn' : 'btn btnCol'}
                                disabled={this.allTabKeys.length === 0 || isPrintLoading}
                            >
                                维护入账信息
                            </Button>
                        ) : null
                    }
                    <div className='search'>
                        <Input
                            placeholder='搜索发票代码/发票号码/销方名称/采集人/报销单号'
                            style={{ width: 260 }}
                            prefix={<Icon type='search' />}
                            value={serachValue}
                            onChange={this.onChangeSearch}
                        />
                        {
                            serachValue ? (
                                <div className='searchList'>
                                    <div
                                        className='searchListRow'
                                        onClick={() => { this.onSearch('invoiceCode', serachValue); }}
                                    >
                                        <label className='searchName'>发票代码：</label>{serachValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={() => { this.onSearch('invoiceNo', serachValue); }}
                                    >
                                        <label className='searchName'>发票号码：</label>{serachValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={() => { this.onSearch('salerName', serachValue); }}
                                    >
                                        <label className='searchName'>销方名称：</label>{serachValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={() => { this.onSearch('collectUser', serachValue); }}
                                    >
                                        <label className='searchName'>采集人：</label>{serachValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={() => { this.onSearch('expenseNum', serachValue); }}
                                    >
                                        <label className='searchName'>报销单号：</label>{serachValue}
                                    </div>
                                </div>
                            ) : null
                        }

                    </div>
                </div>
                <div className='invoiceForm'>
                    <InvoiceTabs
                        tabInfo={invoiceTabsData}
                        onChange={this.changeActiveInvoiceTab}
                        activeInvoiceType={'k' + activeInvoiceType}
                        INPUT_INVOICE_TYPES={tabName}
                    />
                    <div className='tblBottom'>
                        <div className='floatLeft'>
                            <span>已选择<span className='number'>{this.allTabKeys.length}</span>条数据，共{totalElement}条</span>
                            {/* <span>&nbsp;&nbsp;已选不含税金额合计：<span className='number'>￥{totalInfo.totalInvoiceAmount.toFixed(2)}</span></span>
                            <span>&nbsp;&nbsp;已选税额合计：<span className='number'>￥{totalInfo.totalTaxAmount.toFixed(2)}</span></span> */}
                        </div>
                        <Pagination
                            size='small'
                            current={pageNo}
                            total={totalElement}
                            showSizeChanger
                            showQuickJumper
                            className='switchPages'
                            pageSize={pageSize}
                            pageSizeOptions={['10', '30', '50']}
                            onShowSizeChange={(c, size) => this.freshList(c, size, this.state.activeInvoiceType)}
                            onChange={(c, size) => this.freshList(c, size, this.state.activeInvoiceType)}
                        />
                    </div>
                    <Table {...tableProps} />
                </div>



                <Modal
                    title='原件签收'
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
                    onCancel={() => { this.setState({ invoiceExpenseInfo: { ...invoiceExpenseInfo, showModal: false } }); }}
                    onOk={this.onConfirmAddExpenseInfo}
                    width={500}
                >
                    <div className='searchForm'>
                        <div className='inner' style={{ textAlign: 'center' }}>
                            <div className='row'>
                                <div className='searchItem'>
                                    <label style={{ width: 100, textAlign: 'right' }} className='inlineBlock'>
                                        报销人：
                                    </label>
                                    <Input
                                        placeholder='请输入报销人名称'
                                        maxLength={20}
                                        value={invoiceExpenseInfo.expenseName}
                                        className='searchInput'
                                        style={{ width: 244, marginBottom: 20 }}
                                        type='text'
                                        onChange={(e) => { this.setState({ invoiceExpenseInfo: { ...invoiceExpenseInfo, expenseName: e.target.value } }); }}
                                    />
                                </div>
                                <div className='searchItem'>
                                    <label style={{ width: 100, textAlign: 'right' }} className='inlineBlock'>
                                        <span className='red'>*</span>报销单编号：
                                    </label>
                                    <Input
                                        placeholder='请输入报销单编号'
                                        maxLength={20}
                                        value={invoiceExpenseInfo.expenseNum}
                                        className='searchInput'
                                        style={{ width: 244, marginBottom: 20 }}
                                        type='text'
                                        onChange={(e) => { this.setState({ invoiceExpenseInfo: { ...invoiceExpenseInfo, expenseNum: e.target.value } }); }}
                                    />
                                </div>
                                <div className='searchItem'>
                                    <label style={{ width: 100, textAlign: 'right' }} className='inlineBlock'>
                                        报销时间：
                                    </label>
                                    <DatePicker
                                        className='rangeDate searchInput'
                                        style={{ width: 244, marginBottom: 20 }}
                                        disabledDate={(current) => { return current > moment(); }}
                                        placeholder='请输入报销时间'
                                        type='text'
                                        value={invoiceExpenseInfo.expenseTime}
                                        onChange={(d) => { this.setState({ invoiceExpenseInfo: { ...invoiceExpenseInfo, expenseTime: d } }); }}
                                    />
                                </div>
                                <div className='searchItem'>
                                    <label style={{ width: 100, verticalAlign: 'top', textAlign: 'right' }} className='inlineBlock'>备注：</label>
                                    <TextArea
                                        placeholder='请输入备注内容'
                                        maxLength={100}
                                        value={invoiceExpenseInfo.remark}
                                        rows={4}
                                        style={{ width: 244 }}
                                        className='searchInput'
                                        onChange={(e) => { this.setState({ invoiceExpenseInfo: { ...invoiceExpenseInfo, remark: e.target.value } }); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    visible={!!curEditInfo.serialNo}
                    title='编辑发票信息'
                    onCancel={() => this.setState({ curEditInfo: {} })}
                    width={1000}
                    top={10}
                    footer={null}
                    bodyStyle={{ padding: 12 }}
                >
                    <EditInvoice
                        disabledEdit={true}
                        billData={curEditInfo}
                        checkCount={this.state.checkCount}
                        lastCheckTime={this.state.lastCheckTime}
                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                        onCheckInvoice={this.props.onCheckInvoice}
                        onSaveInvoice={this.props.onSaveInvoice}
                        onShowLedgerdata={this.props.onShowLedgerdata}
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
                <PrintImg
                    printData={printImgs}
                    printEnd={this.printEnd}
                />
            </div>
        );
    }
}

InvoicesPond.propTypes = {
    onQueryInvoiceNums: PropTypes.func.isRequired,
    onQueryAccount: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onAddInvoiceSign: PropTypes.func.isRequired,
    onAddExpenseInfo: PropTypes.func.isRequired,
    exportElecFilesUrl: PropTypes.string,
    downloadElecFilesUrl: PropTypes.string,
    applyDownloadUrl: PropTypes.string,
    onContinueDownload: PropTypes.func,
    onQueryRelateBill: PropTypes.func.isRequired,
    exporting: PropTypes.bool,
    onChecklo: PropTypes.func.isRequired,
    onShowLedgerdata: PropTypes.func.isRequired,
    onPrintInvoice: PropTypes.func.isRequired,
    loginInfo: PropTypes.object,
    screenOpt: PropTypes.func.isRequired,
    updateEntryInfo: PropTypes.func
};

export default InvoicesPond;
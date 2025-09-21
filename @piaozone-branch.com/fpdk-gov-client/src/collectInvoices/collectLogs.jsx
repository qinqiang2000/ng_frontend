import React from 'react';
import { Button, Table, message, Pagination, Modal, Radio, DatePicker, Checkbox } from 'antd';
import moment from 'moment';
import GovLoginBox from '../govLogin';
import './style.less';
import PropTypes from 'prop-types';
import { pwyFetch, kdRequest } from '@piaozone.com/utils';
import async from 'async';
const { RangePicker, MonthPicker } = DatePicker;
const statusDict = {
    k1: '同步成功',
    k2: '处理失败',
    k3: '发票云处理中',
    k4: '处理失败',
    k5: '同步失败',
    k6: '税局处理中',
    k7: '申请失败',
    k8: '发票云处理中'
};

class CollectLogs extends React.Component {
    constructor(props) {
        super(...arguments);
        this.fplxOptions = [{
            label: '增值税专用发票',
            value: 4,
            width: 145
        }, {
            label: '机动车销售统一发票',
            value: 12,
            width: 175
        }, {
            label: '增值税普通发票',
            value: 3,
            width: 145
        }, {
            label: '增值税普通发票（电子）',
            value: 1,
            width: 205
        }, {
            label: '电子专用发票',
            value: 2,
            width: 125
        }, {
            label: '二手车销售统一发票',
            value: 13,
            width: 175
        }, {
            label: '增值税普通发票（卷票）',
            value: 5,
            width: 195
        }, {
            label: '通行费电子普通发票',
            value: 15,
            width: 175
        }, {
            label: '海关缴款书',
            value: 21,
            width: 145
        }, {
            label: '数电票（普通发票）',
            value: 26,
            width: 220
        }, {
            label: '数电票（增值税专用发票）',
            value: 27,
            width: 220
        }];

        this.fplxOptionsDict = [];
        for (let i = 0; i < this.fplxOptions.length; i++) {
            this.fplxOptionsDict['k' + this.fplxOptions[i].value] = this.fplxOptions[i];
        }

        this.allFplxs = this.fplxOptions.map((item) => {
            return item.value;
        });
        this.state = {
            handlerErrorIng: false,
            showApplyDialog: false,
            showDownLoad: false,
            listData: [],
            downLoadList: [],
            dataIndex: 0,
            loading: false,
            fplxs: [4, 12, 3, 1, 5, 13, 2, 15, 21],
            jxxFlag: '',
            rangeDate: [moment(), moment()],
            mode: 'time',
            downloadFileType: '0',
            needClientLoginUrl: '',
            searchOpt: { // 查询列表的参数
                invoiceRangeDate: [null, null],
                invoiceDate: [moment().startOf('month'), moment()],
                jxxInvoiceType: '',
                page: 1,
                pageSize: 20,
                rangeDate: [moment().subtract(1, 'years'), moment()],
                invoiceType: '',
                jxx: '5',
                syncStatus: '',
                clientPageSize: 200
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.onSearch();
    }

    componentDidUpdate() {
        // const clientLogin = document.querySelector('#clientLogin');
        // if (clientLogin) {
        //     const loginState = clientLogin.getAttribute('loginState');
        //     if (loginState == 2) {
        //         clientLogin.setAttribute('loginState', 1);
        //         this.startApply();
        //     }
        // }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onStartApply = () => {
        this.setState({
            showApplyDialog: true
        });
    }

    onPageDownLoad = async(url, opt) => { //批量下载
        const { stepFinish } = opt;
        let clientPageNo = 1;
        const { clientPageSize } = this.state.searchOpt;
        let goOn = true; //连续请求标志
        let res;
        let messageId = new Date().getTime();
        let dataList = [];
        var stepFinishHanlder = (stepRes) => {
            if (typeof stepFinish === 'function') {
                try {
                    stepFinish({
                        errcode: stepRes.errcode,
                        description: stepRes.description,
                        data: stepRes.data || [],
                        invoiceInfo: stepRes.invoiceInfo || {},
                        totalElement: stepRes.totalElement || 0
                    });
                } catch (error) {
                    console.log('error------------------', error);
                }
            }
        };
        do {
            res = await kdRequest({
                url,
                timeout: 70000,
                data: {
                    clientPageNo,
                    clientPageSize,
                    messageId,
                    ...opt.data
                },
                method: 'POST'
            });
            if (res.errcode != '0000') {
                const { description } = res;
                if (description && (description.indexOf('服务网关') != '-1' || description.indexOf('网络异常') != '-1' || description.indexOf('请求超时') != '-1')) {
                    messageId = new Date().getTime();
                    // goOn = false;
                    // stepFinishHanlder(res);
                } else {
                    if (description && description.indexOf('10分钟内相同数据') != '-1') {
                        if (res.data) {
                            const { totalElement = 0 } = res.data;
                            const curTotal = parseInt(clientPageNo) * parseInt(clientPageSize); //clientPageSize
                            res = { errcode: '0000', data: null, totalElement };
                            if (curTotal < parseInt(totalElement)) { //标识已被客户端调用接口入库了,
                                clientPageNo = clientPageNo + 1;
                            } else {
                                goOn = false;
                            }
                        } else {
                            goOn = false;
                            res = { errcode: '0000', data: null, totalElement: 0 };
                        }
                    } else {
                        goOn = false;
                    }
                    if (!goOn) {
                        stepFinishHanlder(res);
                    }
                }
            } else {
                let totalElement = res.totalElement || 0;
                if (res.data) {
                    totalElement = res.data.length;
                }
                const curTotal = parseInt(clientPageNo) * parseInt(clientPageSize); //clientPageSize
                if (curTotal >= parseInt(totalElement)) { //终止
                    goOn = false;
                    if (clientPageNo == 1) {
                        stepFinishHanlder(res);
                    } else {
                        stepFinishHanlder({
                            ...res,
                            data: dataList.concat(res.data)
                        });
                    }
                } else {
                    dataList = dataList.concat(res.data);
                    clientPageNo = clientPageNo + 1;
                }
            }
        } while (goOn);
        return res;
    }

    updateDownLoadResult = (res, opt, fplx, loginType) => {
        const { invoiceDate } = this.state.searchOpt;
        const time_q = invoiceDate[0] ? invoiceDate[0].format('YYYY-MM-DD') : '';
        const time_z = invoiceDate[1] ? invoiceDate[1].format('YYYY-MM-DD') : '';
        let currentData = null;
        if (res.errcode == '0000') {
            if (parseInt(loginType) === 1) { //自行增加记录
                if (res.data) {
                    this.addApplyLogs(opt, fplx, res.data);
                }
            }
            currentData = {
                invoiceDate: time_q + '->' + time_z,
                invoiceType: fplx,
                invoiceNums: res.data.length || res.totalElement,
                downLoadResult: '下载成功',
                description: 'success'
            };
            const { dataType, endDate, startDate } = opt;
            const { downloadFileType } = this.state;
            if (dataType == 1 && (fplx == 26 || fplx == 27) && downloadFileType === '1,2,3') {
                this.addDigitalLogs({
                    invoiceType: fplx,
                    endDate,
                    startDate
                });
            }
        } else {
            currentData = {
                invoiceDate: time_q + '->' + time_z,
                invoiceType: fplx,
                invoiceNums: res.data.length || 0,
                downLoadResult: res.description,
                description: 'fail'
            };
        }
        const result = this.state.downLoadList.concat(currentData);
        this.setState({
            downLoadList: result
        });
    }

    addDigitalLogs = async(opt) => { //增加
        const res = await pwyFetch(this.props.downLoadDigitalApplyUrl, {
            method: 'post',
            data: {
                ...opt,
                downloadFileType: '1,2,3'
            }
        });
        if (res.errcode === '0000') {
            message.info('成功提交下载数电票文件申请！');
        } else {
            message.info(res.description);
        }
    }

    cirQueryInvoices = async({ inputPathUrl, taxTickPlatform, loginType, searchOpt }) => { //循环调用
        let num = 0;
        const allInvoiceTypes = searchOpt.invoiceTypes;
        const index = searchOpt.invoiceTypes.indexOf(21);
        if (index != '-1') {
            allInvoiceTypes.splice(index, 1);
        }
        async.mapLimit(allInvoiceTypes, 1, async(fplx, callback) => {
            num += 1;
            let textTips = '';
            if (allInvoiceTypes.length != 0) {
                const current = this.fplxOptions.filter((item) => {
                    return item.value == fplx;
                });
                textTips = current[0].label;
            } else {
                textTips = '';
            }
            message.destroy();
            message.loading('处理（' + textTips + '）中...', 0);
            this.setState({
                loading: true
            });
            let url = this.props.downloadApplyUrl;
            if (this.props.access_token) {
                url += '?access_token=' + this.props.access_token;
            }
            if (taxTickPlatform == 1 && loginType == 1) { //税控模式
                const res = await pwyFetch(url, {
                    method: 'post',
                    data: {
                        ...searchOpt,
                        invoiceType: fplx,
                        inputPathUrl,
                        taxTickPlatform,
                        loginType
                    }
                });
                if (['1000', '91300', 'loginFail'].indexOf(res.errcode) != '-1') {
                    message.destroy();
                    return;
                }
                this.updateDownLoadResult(res, searchOpt, fplx, loginType);
                callback(null);
                return res;
            } else { //电子税局模式
                await this.onPageDownLoad(url, {
                    method: 'post',
                    data: {
                        ...searchOpt,
                        invoiceType: fplx,
                        inputPathUrl,
                        taxTickPlatform,
                        loginType
                    },
                    stepFinish: (res) => {
                        if (['1000', '91300', 'loginFail'].indexOf(res.errcode) != '-1') {
                            callback(res, true);
                            return;
                        }
                        this.updateDownLoadResult(res, searchOpt, fplx, loginType);
                        callback(null);
                        return res;
                    }
                });
            }
        }, (finish) => {
            message.destroy();
            if (finish) {
                if (finish.errcode != '0000') {
                    this.setState({
                        loading: false
                    });
                    if (finish.errcode === '91300') {
                        if (finish.data && finish.data.scanFaceCheckUrl) {
                            this.setState({
                                needClientLoginUrl: finish.data.scanFaceCheckUrl
                            });
                        } else {
                            Modal.warning({
                                title: '温馨提示',
                                content: finish.description + '请重试',
                                onOk: () => {
                                    this.startApply();
                                }
                            });
                        }
                    } else if (finish.errcode === 'loginFail') {
                        this.setState({
                            needClientLoginUrl: finish.data.loginWebUrl
                        });
                    } else {
                        if (searchOpt.invoiceTypes.length == num) {
                            Modal.warning({
                                title: '温馨提示',
                                content: finish.description + '[' + finish.errcode + ']'
                            });
                            if (this.state.downLoadList.length > 0) {
                                this.setState({
                                    showDownLoad: true
                                });
                            }
                            return;
                        }
                        message.info(finish.description + '[' + finish.errcode + ']');
                    }
                }
            }
            if (searchOpt.invoiceTypes.length == num) {
                message.destroy();
                if (this.state.downLoadList.length > 0) {
                    this.setState({
                        showDownLoad: true,
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            }
        });
    }

    onloginCallback = (res) => {
        if (res.errcode == 'cancel') {
            this.setState({ needClientLoginUrl: '' });
            return;
        }
        if (res.errcode != '0000') {
            message.error(res.description);
            return;
        }
        this.setState({ needClientLoginUrl: '' });
        this.startApply(); //重试
    }

    startApply = async() => {
        if (!this._isMounted) {
            return;
        }
        const { rangeDate, fplxs, jxxFlag } = this.state;
        const { invoiceDate } = this.state.searchOpt;
        const rq_q = rangeDate[0].format('YYYY-MM');
        const rq_z = rangeDate[1].format('YYYY-MM');
        const time_q = invoiceDate[0] ? invoiceDate[0].format('YYYY-MM-DD') : '';
        const time_z = invoiceDate[1] ? invoiceDate[1].format('YYYY-MM-DD') : '';
        let startDate = '';
        let endDate = '';
        const { clientConfig } = this.props;
        const taxTickPlatform = clientConfig.taxTickPlatform;
        const loginType = clientConfig.loginType;
        if (loginType == 1) {
            startDate = time_q;
            endDate = time_z;
        } else {
            startDate = rq_q;
            endDate = rq_z;
        }
        const searchOpt = {
            clientType: this.props.clientType || 4,
            dataType: jxxFlag === '' ? 0 : jxxFlag,
            invoiceTypes: fplxs,
            startDate,
            endDate
        };
        const { inputPathUrl } = clientConfig;
        if (loginType == 1) {
            if (!searchOpt.dataType) {
                message.error('请选择进销项！');
                return;
            }
        }
        this.cirQueryInvoices({
            inputPathUrl,
            taxTickPlatform,
            loginType,
            searchOpt
        });
    }

    addApplyLogs = async(opt, fplx, dataList) => { //自行增加日志
        const { dataType, startDate, endDate } = opt;
        const result = [{
            successTotalNum: dataList.length || 0, // 已下载条数
            dataType: dataType, // 进销项下载类型 1进项 2销项
            jxxInvoiceType: fplx, // 发票类型
            jxxStartDate: startDate, // 进销项开始时间
            jxxEndDate: endDate// 进销项结束时间
        }];
        const res = await pwyFetch(this.props.addApplyLogUrl, {
            method: 'post',
            data: result
        });
        if (res.errcode != '0000') {
            message.error(res.description);
        }
    }

    onReset = () => {
        this.setState({
            searchOpt: {
                jxx: '5',
                fplxs: this.allFplxs,
                jxxInvoiceType: '',
                invoiceRangeDate: [null, null],
                invoiceDate: [null, null],
                rangeDate: [moment().subtract(1, 'years'), moment()],
                invoiceType: '',
                syncStatus: '',
                page: 1,
                pageSize: 20
            }
        });
    }

    onChangeFplx = (e, type) => {
        const newFplx = e.target.checked ? this.state.fplxs.concat(type) : this.state.fplxs.filter((item) => {
            return item !== type;
        });
        this.setState({
            fplxs: newFplx
        });
    }

    onCheckAllOptFplx = (e) => {
        this.setState({
            searchOpt: {
                ...this.state.searchOpt,
                fplxs: e.target.checked ? this.allFplxs : []
            }
        });
    }

    onCheckAllFplx = (e) => {
        this.setState({
            fplxs: e.target.checked ? this.allFplxs : []
        });
    }

    onSearch = async(page = this.state.searchOpt.page, pageSize = this.state.searchOpt.pageSize) => {
        if (!this._isMounted) {
            return;
        }
        this.setState({
            searchLoading: true
        });
        const oldSearchOpt = this.state.searchOpt;
        const { rangeDate, jxx, syncStatus, invoiceRangeDate, jxxInvoiceType } = oldSearchOpt;
        const rq_q = rangeDate[0] ? rangeDate[0].format('YYYY-MM-DD') : '';
        const rq_z = rangeDate[1] ? rangeDate[1].format('YYYY-MM-DD') : '';
        const invoice_q = invoiceRangeDate[0] ? invoiceRangeDate[0].format('YYYY-MM-DD') : '';
        const invoice_z = invoiceRangeDate[1] ? invoiceRangeDate[1].format('YYYY-MM-DD') : '';
        let syncGovStatusList = [];
        if (syncStatus === '') {
            syncGovStatusList = [1, 2, 3, 4, 5, 6, 7, 8].join(',');
        } else if (syncStatus === '1') {
            syncGovStatusList = '1';
        } else if (syncStatus === '2') {
            syncGovStatusList = [3, 6, 8].join(',');
        } else if (syncStatus === '3') {
            syncGovStatusList = [2, 4, 5, 7].join(',');
        }

        const searchOpt = {
            syncGovStatusList: syncGovStatusList, // 1同步成功，2,4(不能重新处理),5,7同步失败,6税局处理中,3,8发票云处理中
            syncStatus: '', // 同步状态, 默认为空, 分页查询指定税号同步日志，1、已同步，2、未同步，3、同步失败，4、部分同步
            dataType: jxx, // 1进项和进项表头, 2销项, 3进项, 4进项表头,5进项+销项+进项表头
            startDate: rq_q, // 增量日志开始日期
            endDate: rq_z, // 增量日志结束日期
            currentPage: page, // 当前分页值
            pageSize: pageSize // 分页大小
        };

        if (jxx === '2' || jxx === '3') {
            searchOpt.jxxStartDate = invoice_q;
            searchOpt.jxxEndDate = invoice_z;
            searchOpt.jxxInvoiceType = jxxInvoiceType;
        }

        const res = await pwyFetch(this.props.querySyncLogUrl, {
            timeout: 60000,
            data: searchOpt,
            method: 'POST'
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description);
            this.setState({
                searchLoading: false
            });
        } else {
            const searchOpt = {
                ...this.state.searchOpt,
                page,
                pageSize
            };
            this.setState({
                searchOpt,
                totalNum: res.totalElement,
                listData: res.data,
                searchLoading: false
            });
        }
    }

    reprocess = async(r) => {
        const batchNo = r.batchNo;
        message.loading('处理中', 0);
        const res = await pwyFetch(this.props.reprocessSyncUrl, {
            method: 'post',
            data: {
                batchNo, // 增量批次号
                dataType: r.jxxDownloadType !== 2 ? 1 : 2 // 进项表头也属于进项
            }
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
        } else {
            await this.onSearch();
        }
        message.info('处理完成');
    }

    getStatusInfo(r) {
        const v = r.syncGovStatus;
        const errCode = r.jxxDownloadErrcode;
        const startStr = r.jxxEndDate ? r.jxxEndDate.substr(0, 7) : '';
        const endStr = r.jxxStartDate ? r.jxxStartDate.substr(0, 7) : '';
        let description = '同步成功';
        let retryFlag = 1;
        if (v === 1) {
            retryFlag = 0;
            description = '同步成功';
        } else if (r.jxxDownloadType === 1 || r.jxxDownloadType === 2) {
            if (!r.jxxRwh || !startStr || !endStr || startStr !== endStr) {
                retryFlag = 0;
                description = '参数错误';
            } else {
                description = statusDict['k' + v] || '--';
                if (v === 7) {
                    if (errCode === '1') {
                        retryFlag = 0;
                        description = '超过申请次数';
                    } else if (errCode === '9') {
                        retryFlag = 0;
                        description = '文件已过期';
                    }
                } else if (v === 8) {
                    if (errCode === '4') {
                        retryFlag = 0;
                        description = '不存在符合条件的发票';
                    } else {
                        retryFlag = 0;
                        description = '发票云处理中';
                    }
                } else if (v === 6) {
                    if (errCode === '9') {
                        retryFlag = 0;
                        description = '文件已过期';
                    }
                } else if (v === 3) {
                    retryFlag = 0;
                    description = '发票云处理中';
                }
            }
        } else {
            if (!r.totalNum) {
                retryFlag = 0;
                description = '处理失败';
            } else if (r.successTotalNum !== r.totalNum) {
                retryFlag = 2;
                description = '发票云处理中';
            } else {
                description = '处理成功';
            }
        }
        return {
            retryFlag,
            description
        };
    }

    render() {
        const minDate = moment('2017-01-01', 'YYYY-MM-DD');
        const maxDate = moment();
        const {
            totalNum, listData, loading,
            rangeDate, fplxs, jxxFlag,
            searchOpt, showApplyDialog,
            showDownLoad, downLoadList,
            searchLoading, handlerErrorIng
        } = this.state;
        const indeterminate = fplxs.length > 0 && fplxs.length < this.fplxOptions.length;
        const { clientConfig, isShowAccount, showChooseModal, defaultAccount } = this.props;
        const loginType = clientConfig.loginType;
        const renderDate = (dateStr = '') => {
            if (dateStr) {
                return dateStr.substr(0, 10);
            } else {
                return '--';
            }
        };
        const tabCols = [
            {
                title: '序号',
                align: 'left',
                render: (v, r, i) => {
                    return i + 1 + searchOpt.pageSize * (searchOpt.page - 1);
                }
            },
            {
                title: '进销项类型',
                dataIndex: 'jxxDownloadType',
                align: 'left',
                render: (v) => {
                    if (v) {
                        v = parseInt(v);
                        if (v === 1) {
                            return '进项票';
                        } else if (v === 2) {
                            return '销项票';
                        } else if (v === 3) {
                            return '进项表头';
                        } else if (v === 4) {
                            return '发票状态更新';
                        }
                        return '--';
                    }
                    return '--';
                }
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                align: 'left',
                render: (v) => {
                    // const jxxDownloadType = r.jxxDownloadType;
                    // let result = '--';
                    // if (jxxDownloadType === 1 || jxxDownloadType === 2) { // 进销项申请
                    //     result = v;
                    // } else if (jxxDownloadType === 3 || jxxDownloadType === 4) {
                    //     result = r.createTime.substr(0, 10);
                    // }
                    // return result;
                    return v || '--';
                }
            },
            {
                title: '发票类型',
                dataIndex: 'jxxInvoiceType',
                align: 'left',
                render: (v) => {
                    if (v) {
                        return this.fplxOptionsDict['k' + v].label || '--';
                    } else {
                        return '--';
                    }
                }
            },
            { title: '开票日期起', dataIndex: 'jxxStartDate', align: 'left', render: renderDate },
            { title: '开票日期止', dataIndex: 'jxxEndDate', align: 'left', render: renderDate },
            {
                title: '总份数',
                dataIndex: 'totalNum',
                align: 'left',
                render: (v) => {
                    return v || '0';
                }
            },
            {
                title: '成功份数',
                dataIndex: 'successTotalNum',
                align: 'left',
                render: (v) => {
                    return v || '0';
                }
            },
            {
                title: '处理状态',
                dataIndex: 'syncGovStatus',
                align: 'left',
                render: (v, r) => {
                    const info = this.getStatusInfo(r);
                    return info.description;
                }
            },
            {
                title: '回执状态',
                dataIndex: 'syncStatus',
                align: 'left',
                render: (v) => {
                    if (v === 2) {
                        return '未回执';
                    } else if (v === 1) {
                        return '回执同步成功';
                    } else if (v === 3) {
                        return '回执同步失败';
                    } else if (v === 4) {
                        return '回执部分同步';
                    } else {
                        return '--';
                    }
                }
            },
            {
                title: '回执份数',
                dataIndex: 'syncTotalNum',
                align: 'left',
                render: (v) => {
                    if (v) {
                        return v;
                    }
                    return 0;
                }
            },
            {
                title: '操作',
                dataIndex: 'operate',
                align: 'left',
                render: (v, r) => {
                    const info = this.getStatusInfo(r);
                    if (info.retryFlag === 1) {
                        return (
                            <a href='javascript:;' onClick={() => this.reprocess(r)}>重新处理</a>
                        );
                    } else {
                        return '--';
                    }
                }
            }
        ];
        const downLoadResultCols = [
            {
                title: '序号',
                dataIndex: 'indexNumber',
                align: 'center',
                width: 80,
                render: (v, r, i) => {
                    return parseInt(i) + 1;
                }
            },
            {
                title: '开票日期',
                dataIndex: 'invoiceDate',
                align: 'left',
                width: 180
            },
            {
                title: '发票类型',
                dataIndex: 'invoiceType',
                align: 'left',
                width: 180,
                render: (v) => {
                    const current = this.fplxOptions.filter((item) => {
                        return item.value == v;
                    });
                    const textTips = current[0].label;
                    return textTips;
                }
            },
            { title: '发票数量', dataIndex: 'invoiceNums', align: 'left', width: 80 },
            {
                title: '下载结果',
                dataIndex: 'downLoadResult',
                align: 'left',
                render: (v, r) => {
                    const { description } = r;
                    if (description === 'fail') {
                        return (
                            <span style={{ color: 'red' }}>{v}</span>
                        );
                    } else {
                        return (
                            <span style={{ color: '#3598ff' }}>{v}</span>
                        );
                    }
                }
            },
            {
                title: '下载说明',
                dataIndex: 'description',
                align: 'left',
                width: 80
            }
        ];
        const fplxOptionsAll = [
            {
                label: '全部',
                value: '',
                width: 80
            },
            ...this.fplxOptions
        ];
        const showOtherOpt = searchOpt.jxx === '2' || searchOpt.jxx === '3';
        return (
            <div className='collectInvoices logs'>
                <div className='searchArea jxxDownload' style={{ paddingBottom: 10 }}>
                    <div className='row choose'>
                        <div>
                            <div className='inputItem'>
                                <label style={{ width: 90 }}>采集日期范围：</label>
                                <RangePicker
                                    value={searchOpt.rangeDate}
                                    format='YYYY-MM-DD'
                                    onChange={(d) => this.setState({ searchOpt: { ...searchOpt, rangeDate: d } })}
                                />
                            </div>
                            <div className='inputItem'>
                                <label style={{ verticalAlign: 0 }}>数据类型：</label>
                                <Radio.Group onChange={(e) => this.setState({ searchOpt: { ...searchOpt, jxx: e.target.value } })} value={searchOpt.jxx}>
                                    <Radio value='5'>全部</Radio>
                                    <Radio value='3'>进项</Radio>
                                    <Radio value='2'>销项</Radio>
                                    <Radio value='4' style={{ width: 100 }}>进项表头</Radio>
                                </Radio.Group>
                            </div>
                            <Button type='primary' style={{ marginRight: 10 }} disabled={searchLoading} onClick={() => this.onSearch(1)}>查询</Button>
                            <Button style={{ marginRight: 10 }} disabled={searchLoading || handlerErrorIng} onClick={this.onStartApply}>申请同步税局发票数据</Button>
                            <Button disabled={searchLoading || handlerErrorIng} style={{ marginRight: 10 }} onClick={this.onReset}>重置条件</Button>
                        </div>
                        {
                            isShowAccount && (
                                <div>电子税局账号：{defaultAccount.name} <span className='btn' onClick={() => showChooseModal()}>切换</span></div>
                            )
                        }
                    </div>
                    <div className='row' style={{ marginBottom: 0 }}>
                        <div className='inputItem'>
                            <label style={{ verticalAlign: 0, width: 90 }}>同步状态：</label>
                            <Radio.Group
                                onChange={(e) => this.setState({ searchOpt: { ...searchOpt, syncStatus: e.target.value } })}
                                value={searchOpt.syncStatus}
                            >
                                <Radio value=''>全部</Radio>
                                <Radio value='1'>成功</Radio>
                                <Radio value='3'>失败</Radio>
                                <Radio value='2'>处理中</Radio>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className='row' style={{ display: showOtherOpt ? 'block' : 'none', marginTop: 10 }}>
                        <div className='inputItem'>
                            <label style={{ verticalAlign: '28px', width: 90 }}>发票类型：</label>
                            <Radio.Group
                                onChange={(e) => this.setState({ searchOpt: { ...searchOpt, jxxInvoiceType: e.target.value } })}
                                value={searchOpt.jxxInvoiceType}
                            >
                                {
                                    fplxOptionsAll.map((item, i) => {
                                        return (
                                            <>
                                                <Radio
                                                    value={item.value}
                                                    style={{ textAlign: 'left', width: item.width }}
                                                >
                                                    {item.label}
                                                </Radio>
                                                {
                                                    i === 4 ? (
                                                        <div style={{ marginBottom: 8, fontSize: 0, height: 0 }}>&nbsp;</div>
                                                    ) : null
                                                }
                                            </>
                                        );
                                    })
                                }
                            </Radio.Group>
                        </div>
                    </div>
                    <div className='row' style={{ display: showOtherOpt ? 'block' : 'none' }}>
                        <div className='inputItem'>
                            <label style={{ verticalAlign: 0, width: 90 }}>开票起止：</label>
                            <RangePicker
                                value={searchOpt.invoiceRangeDate}
                                format='YYYY-MM-DD'
                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, invoiceRangeDate: d } })}
                            />
                        </div>
                    </div>
                </div>
                <div className='clearfix'>
                    <div className='floatLeft' style={{ marginTop: 6 }}>
                        总记录数：{totalNum}条
                    </div>
                    <Pagination
                        size='small'
                        current={searchOpt.page}
                        total={totalNum}
                        showSizeChanger
                        showQuickJumper
                        className='floatRight'
                        pageSize={searchOpt.pageSize}
                        pageSizeOptions={['10', '20', '40']}
                        onShowSizeChange={(c, size) => this.onSearch(c, size)}
                        onChange={(c, size) => this.onSearch(c, size)}
                    />
                </div>
                <Table
                    rowKey='batchNo'
                    dataSource={listData}
                    columns={tabCols}
                    pagination={false}
                    bordered={false}
                    loading={searchLoading}
                />


                <Modal
                    className='collectInvoices'
                    visible={showApplyDialog}
                    onCancel={() => this.setState({ showApplyDialog: false })}
                    title='下载申请'
                    maskClosable={false}
                    footer={false}
                    width={800}
                    height={700}
                >
                    <div className='searchArea jxxDownload' style={{ borderBottom: 0 }}>
                        <div className='row' style={{ marginBottom: 20 }}>
                            <div className='inputItem'>
                                <label style={{ verticalAlign: 0 }}>进销项：</label>
                                <Radio.Group onChange={(e) => this.setState({ jxxFlag: e.target.value })} value={jxxFlag}>
                                    {loginType == 1 ? null : <Radio value=''>全部</Radio>}
                                    <Radio value={1}>进项</Radio>
                                    <Radio value={2}>销项</Radio>
                                </Radio.Group>
                            </div>
                        </div>
                        <div className='row' style={{ marginBottom: 25 }}>
                            {
                                loginType == 1 ? (
                                    <>
                                        <div className='inputItem'>
                                            <label>开票日期：</label>
                                            <RangePicker
                                                allowClear={false}
                                                value={searchOpt.invoiceDate}
                                                format='YYYY-MM-DD'
                                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, invoiceDate: d } })}
                                                disabledDate={(c) => {
                                                    return c.format('X') < minDate.format('X') || c.format('X') > maxDate.format('X');
                                                }}
                                            />
                                        </div>
                                        <div className='inputItem'>
                                            <label style={{ verticalAlign: 0 }}>分批申请：</label>
                                            <Radio.Group
                                                onChange={(e) => this.setState({ searchOpt: { ...searchOpt, clientPageSize: e.target.value } })}
                                                value={searchOpt.clientPageSize}
                                                defaultValue={searchOpt.clientPageSize}
                                            >
                                                <Radio value={100}>100条</Radio>
                                                <Radio value={200}>200条</Radio>
                                                <Radio value={300}>300条</Radio>
                                                <Radio value={500}>500条</Radio>
                                            </Radio.Group>
                                        </div>
                                    </>
                                ) : (
                                    <div className='inputItem'>
                                        <label>开票月份：</label>
                                        <MonthPicker
                                            allowClear={false}
                                            value={rangeDate[0]}
                                            format='YYYY-MM'
                                            style={{ width: 150 }}
                                            disabledDate={(d) => {
                                                return d > rangeDate[1] || d > moment();
                                            }}
                                            onChange={(d) => {
                                                this.setState({
                                                    rangeDate: [d, rangeDate[1]]
                                                });
                                            }}
                                        />
                                        -
                                        <MonthPicker
                                            allowClear={false}
                                            value={rangeDate[1]}
                                            format='YYYY-MM'
                                            style={{ width: 150 }}
                                            disabledDate={(d) => {
                                                return d < rangeDate[0] || d > moment();
                                            }}
                                            onChange={(d) => {
                                                this.setState({
                                                    rangeDate: [rangeDate[0], d]
                                                });
                                            }}
                                        />
                                    </div>
                                )
                            }

                        </div>
                        <div className='row fplxRow'>
                            <div className='inputItem'>
                                <label style={{ verticalAlign: 'top' }}>发票类型：</label>
                                <div style={{ display: 'inline-block', width: 620 }}>
                                    <Checkbox
                                        indeterminate={indeterminate}
                                        onChange={this.onCheckAllFplx}
                                        checked={fplxs.length === this.fplxOptions.length}
                                        style={{ textAlign: 'left', marginBottom: 15, marginRight: 15 }}
                                    >
                                        全部
                                    </Checkbox>
                                    {
                                        this.fplxOptions.map((item, i) => {
                                            if (loginType == 1) { //客户端
                                                return (
                                                    <Checkbox
                                                        key={item.value}
                                                        onChange={(e) => this.onChangeFplx(e, item.value)}
                                                        checked={fplxs.indexOf(item.value) !== -1}
                                                        style={{
                                                            textAlign: 'left',
                                                            display: item.value == 21 ? 'none' : 'inline-block',
                                                            width: item.width,
                                                            marginBottom: 15,
                                                            marginLeft: 0
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Checkbox>
                                                );
                                            } else {
                                                return (
                                                    <Checkbox
                                                        key={item.value}
                                                        onChange={(e) => this.onChangeFplx(e, item.value)}
                                                        checked={fplxs.indexOf(item.value) !== -1}
                                                        style={{ textAlign: 'left', width: item.width, marginBottom: 15, marginLeft: 0 }}
                                                    >
                                                        {item.label}
                                                    </Checkbox>
                                                );
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            loginType == 1 && jxxFlag == 1 && (fplxs.indexOf(26) != -1 || fplxs.indexOf(27) != -1) ? (
                                <>
                                    <div className='row fplxRow' style={{ display: this.props.isSupport_eleDownLoad ? 'block' : 'none' }}>
                                        <div className='inputItem'>
                                            <label style={{ verticalAlign: 'middle', width: 100 }}>下载数电票文件：</label>
                                            <div style={{ display: 'inline-block', width: 620 }}>
                                                <Radio.Group
                                                    onChange={(e) => {
                                                        this.setState({ downloadFileType: e.target.value });
                                                    }}
                                                    value={this.state.downloadFileType}
                                                >
                                                    <Radio value='0' style={{ width: 90 }}>不下载</Radio>
                                                    <Radio value='1,2,3'>下载PDF、OFD和XML</Radio>
                                                </Radio.Group>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='applyTip'>
                                        {
                                            this.props.isSupport_eleDownLoad ? (
                                                <>
                                                    <p style={{ marginBottom: 4 }}>1、根据财政部电子会计凭证报销入账归档相关要求，数电票需要归集保存XML文件</p>
                                                    <p style={{ marginBottom: 4 }}>2、选择需要下载的发票文件，从税局下载成功后将覆盖已手工采集的发票文件</p>
                                                    <p style={{ marginBottom: 4 }}>3、同一个开票月份的每一类发票每24小时申请下载请求不超过1次；</p>
                                                    <p>4、当前开票月份的每一类发票最多申请5次发票下载，历史开票月份的每一类发票每30天可申请一次发票下载</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p style={{ marginBottom: 4 }}>1、同一个开票月份的每一类发票每24小时申请下载请求不超过1次；</p>
                                                    <p>2、当前开票月份的每一类发票最多申请5次发票下载，历史开票月份的每一类发票每30天可申请一次发票下载</p>
                                                </>
                                            )
                                        }
                                    </div>
                                </>
                            ) : (
                                <div className='applyTip'>
                                    <p style={{ marginBottom: 4 }}>1、同一个开票月份的每一类发票每24小时申请下载请求不超过1次；</p>
                                    <p>2、当前开票月份的每一类发票最多申请5次发票下载，历史开票月份的每一类发票每30天可申请一次发票下载</p>
                                </div>
                            )
                        }
                        <div className='row' style={{ textAlign: 'center', marginTop: 30 }}>
                            <Button type='primary' style={{ marginRight: 15 }} disabled={loading} onClick={this.startApply}>提交申请</Button>
                            <Button disabled={loading} onClick={() => this.setState({ showApplyDialog: false })}>取消</Button>
                        </div>
                    </div>
                </Modal>
                <Modal
                    className='collectInvoices'
                    visible={showDownLoad}
                    onCancel={() => this.setState({ showDownLoad: false, downLoadList: [] })}
                    title='申请下载结果'
                    maskClosable={false}
                    footer={false}
                    width={800}
                    height={700}
                >
                    <Table
                        rowKey='batchNo'
                        dataSource={downLoadList}
                        columns={downLoadResultCols}
                        pagination={false}
                        bordered={false}
                    />
                </Modal>
                {
                    this.state.needClientLoginUrl ? (
                        <GovLoginBox
                            needClientLoginUrl={this.state.needClientLoginUrl}
                            clientLoginUrl={this.props.clientLoginUrl}
                            onloginCallback={(res) => { this.onloginCallback(res); }}
                        />
                    ) : null
                }
            </div>
        );
    }
}

CollectLogs.propTypes = {
    isSupport_eleDownLoad: PropTypes.bool,
    clientType: PropTypes.number,
    access_token: PropTypes.string,
    querySyncLogUrl: PropTypes.string.isRequired,
    downloadApplyUrl: PropTypes.string.isRequired,
    downLoadDigitalApplyUrl: PropTypes.string.isRequired,
    reprocessSyncUrl: PropTypes.string.isRequired,
    addApplyLogUrl: PropTypes.string.isRequired,
    clientConfig: PropTypes.object,
    showChooseModal: PropTypes.func,
    isShowAccount: PropTypes.bool,
    defaultAccount: PropTypes.object,
    clientLoginUrl: PropTypes.string.isRequired
};

export default CollectLogs;
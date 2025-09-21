import React from 'react';
import ScanInvoices from '@piaozone.com/scan-invoices';
import PropTypes from 'prop-types';
import { Button, Pagination, Modal, message, Table, Icon } from 'antd';
import moment from 'moment';
import { INPUT_INVOICE_TYPES } from '../../commons/constants';
import { columsDictFun } from './invoiceCols';
import InvoiceTabs from '../../invoicesTabs';
import PushAccountList from './pushAccountList';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import { pwyFetch } from '@piaozone.com/utils';
import AppletSearch from './appletSearch';
const iconTp = require('../../commons/img/icon_tp.png');
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;
let time2 = null;
class AppletWallet extends React.Component {
    constructor(props) {
        super(...arguments);
        this.allTabKeys = [];
        this.initSearchOpt = {
            pageNo: 1,
            pageSize: 10,
            collectTime: [moment().startOf('month'), moment()],
            invoiceTime: [null, null],
            invoiceStatus: '',
            invoiceCode: '',
            invoiceNo: '',
            salerName: '',
            expendStatus: '',
            invoiceType: '',
            isCheck: 1,
            isPushToAccount: '', //1：是， 2： 否 （9）
            miniQrSrc: '', //小程序地址
            showMiniProgramQrErr: '',
            oldUserKey: ''
        };
        this.state = {
            selectedAllRows: {},
            listData: [],
            totalElement: 0,
            invoiceTabsData: {},
            loading: true,
            activeInvoiceType: '',
            selectedAllKeys: {},
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
            rebind: false,
            curPushToCommonLog: [],
            showLogs: false
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

    phoneHide = function(phone) {
        phone = phone.toString();
        if (phone) {
            const desensitization = phone.substr(0, 3) + '****' + phone.substr(7, 4);
            return desensitization;
        }
        return phone;
    }

    onShowEditDialog = (r, i, disabledEdit) => {
        console.log('查看-----');
        this.setState({
            curEditInfo: r,
            disabledEdit: !!disabledEdit,
            checkCount: null,
            lastCheckTime: null
        });
    }

    onConfirmEdit = async() => {
        message.destroy();
        message.info('保存成功');
        this.queryInvoiceNum();
        this.setState({
            curEditInfo: {}
        });
    }

    getSearchOpt(searchOpt) {
        const { invoiceTime, collectTime, ...otherOpt } = searchOpt;
        const invoiceType = searchOpt.invoiceType;
        let result = {
            ...otherOpt,
            invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', //发票日期起
            invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', //发票日期止
            collectTimeStart: collectTime && collectTime[0] ? collectTime[0].format('YYYY-MM-DD') : '', //采集日期起
            collectTimeEnd: collectTime && collectTime[1] ? collectTime[1].format('YYYY-MM-DD') : ''
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
                authEndTime: ''
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
        const optResult = this.getSearchOpt({
            ...this.state.searchOpt,
            personal: true
        });
        const {
            collectTimeStart = '',
            collectTimeEnd = '',
            invoiceTimeStart = '',
            invoiceTimeEnd = ''
        } = optResult;
        if (collectTimeStart === '' && invoiceTimeStart === '') {
            message.info('采集日期，开票日期，审核通过时间不能同时为空');
            return;
        } else if (!collectTimeStart) { // 采集时间为空
            if (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 开票日期跨度不能大于31天');
                return;
            }
        } else if (!invoiceTimeStart) { // 开票日期为空
            if (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                message.info('数据过多, 采集日期跨度不能大于31天');
                return;
            }
        } else if ( // 采集日期、开票日期都不为空
            (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
            (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31)
        ) {
            message.info('数据过多, 采集日期、开票日期、跨度不能同时大于31天');
            return;
        }

        this.setState({
            loading: true
        });
        const res = await this.props.onQueryInvoiceNums(optResult);
        if (res.errcode === '0000') {
            const invoiceTabsData = {};
            const resData = res.data || [];
            // 临时代码
            let result = [];
            if (resData.length > 0) {
                result = resData.filter((item) => {
                    return [28, 29, 30].indexOf(parseInt(item.invoiceType)) == '-1';
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
            pageNo,
            personal: true
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


    checkSelectTime = () => {
        let errMsg = '';
        let disabledLoad = false;
        const { invoiceTime, collectTime } = this.state.searchOpt;
        if (!invoiceTime[0] && !collectTime[0]) {
            disabledLoad = true;
            errMsg = '采集日期、开票日期、审核通过时间不能都为空';
        } else {
            let invoiceTimeTxt = '';
            let collectTimeTxt = '';
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
            errMsg = invoiceTimeTxt + collectTimeTxt + '的起止日期不能超过一个月';
        }
        if (disabledLoad) {
            return { errcode: '3001', description: errMsg };
        }
        return {
            errcode: '0000',
            description: 'success'
        };
    }


    showPushAccountList = (listData) => {
        this.setState({
            showLogs: true,
            curPushToCommonLog: listData
        });
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

    onChangeSearch = (opt) => {
        this.setState({
            ...opt
        });
    }

    onPushToAccount = () => { //推送到台账
        console.log('推送到台账-------', this.allTabKeys);
        Modal.confirm({
            title: '温馨提示',
            content: '确定要将这些数据推送到台账吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: async() => {
                message.loading('推送中...', 0);
                const res = await pwyFetch(this.props.pushToAccountUrl, {
                    method: 'post',
                    data: {
                        serialNos: this.allTabKeys.join(','),
                        personal: true
                    }
                });
                message.destroy();
                if (res.errcode != '0000') {
                    message.error(res.description);
                    return;
                }
                this.queryInvoiceNum();
            }
        });
    }

    getWxQr = async() => {
        const { oldUserKey } = this.state;
        const res = await this.props.onGetWxQr({ oldUserKey });
        let errMsg;
        if (res.errcode === '0000') {
            const resData = res.data;
            if (resData.qrCodeBase64) {
                const { userKey } = resData; //repeat
                this.setState({
                    oldUserKey: userKey,
                    miniQrSrc: 'data:image/png;base64,' + resData.qrCodeBase64,
                    rebind: true
                });
                this.onGetUserInfo();
            } else {
                errMsg = '获取二维码数据为空';
                this.setState({
                    showMiniProgramQrErr: errMsg + '，点击重试！',
                    miniQrSrc: '',
                    rebind: true
                });
            }
        } else {
            errMsg = res.description + '[' + res.errcode + ']';
            this.setState({
                showMiniProgramQrErr: errMsg + '，点击重试！',
                miniQrSrc: '',
                rebind: true
            });
        }
    };

    onGetUserInfo = async() => { //查询用户是否绑定企业（小程序二维码）
        const res = await pwyFetch(this.props.getUserBindInfoUrl, {
            method: 'post'
        });
        if (res.errcode == '0000') {
            if (res.data) {
                const { firstInto = false, isPersonal = false, phone = '', openid } = res.data; //isPersonal true:已绑定
                this.setState({
                    isPersonal,
                    firstInto,
                    phone
                });
                if (openid === this.props.openid) {
                    time2 = setTimeout(() => {
                        this.onGetUserInfo();
                        clearTimeout(time2);
                    }, 5000);
                } else {
                    this.setState({
                        rebind: true
                    });
                    this.props.onSetOpenId(openid);
                }
            }
        } else {
            message.info(res.description);
        }
    }

    render() {
        const {
            listData,
            searchOpt,
            totalElement,
            activeInvoiceType,
            loading,
            selectedAllKeys,
            curEditInfo,
            invoiceTabsData,
            selectedAllRows,
            curPushToCommonLog,
            showLogs,
            miniQrSrc,
            showMiniProgramQrErr
        } = this.state;
        const { totalInvoiceAmount, totalTaxAmount, otherInvoices } = this.getSelectInfo(selectedAllRows);
        const { pageNo, pageSize } = searchOpt;
        const { phone } = this.props;
        const phoneTxt = this.phoneHide(phone);
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
        const isAddedTax = addedInvoiceTypes.indexOf(searchOpt.invoiceType) > -1 || searchOpt.invoiceType === '';
        const operateCol = [
            {
                title: '是否推送台账',
                fixed: 'right',
                dataIndex: 'isPushToCommon',
                align: 'center',
                width: 100
            },
            {
                title: '操作',
                align: 'center',
                fixed: 'right',
                width: 140,
                render: (v, r, i) => {
                    return (
                        <div className='operate'>
                            <a href='javascript:;' onClick={() => { this.onShowEditDialog(r, i, true); }}>查看</a>
                        </div>
                    );
                }
            }
        ];

        let scrollWidth = 1780;
        const activeInvoiceTypeKey = 'k' + activeInvoiceType;
        if (['k14', 'k11', 'k17', 'k8', 'k9'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1500;
        } else if (['k4'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2200;
        } else if (['k1', 'k2', 'k3', 'k5', 'k12', 'k13', 'k15', 'k26', 'k27'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2380;
        } else if (['k10', 'k21'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 2580;
        } else if (['k7', 'k16', 'k17', 'k20'].indexOf(activeInvoiceTypeKey) !== -1) {
            scrollWidth = 1780;
        }

        let tableColumns = listData.length > 0 &&
        columsDictFun(activeInvoiceTypeKey, this.props.loginInfo) ? columsDictFun(activeInvoiceTypeKey, this.props.loginInfo).concat(operateCol) : [];
        tableColumns = tableColumns.map((item) => {
            if (item.dataIndex === 'isPushToCommon') {
                return {
                    ...item,
                    render: (v, r) => {
                        const { pushToCommonLog = [] } = r;
                        if (v) {
                            return (
                                <a
                                    href='javascript:;'
                                    style={{ color: '#3598ff', cursor: 'pointer' }}
                                    onClick={() => this.showPushAccountList(pushToCommonLog)}
                                >
                                    是
                                </a>
                            );
                        } else {
                            return '否';
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
            <div className='accountManage'>
                <AppletSearch
                    searchOpt={searchOpt}
                    isAddedTax={isAddedTax}
                    onChangeSearch={this.onChangeSearch}
                    onSearch={this.onSearch}
                    emptyClick={this.emptyClick}
                />
                <div
                    className='middleOperateBtns'
                    style={{ padding: '15px 0', marginBottom: '5px', borderBottom: listData.length > 0 ? '1px solid #eee' : 'none' }}
                >
                    <Button
                        type='primary'
                        onClick={() => this.onPushToAccount(this.allTabKeys)}
                        disabled={this.allTabKeys.length === 0}
                    >推送数据到台账
                    </Button>
                    <Button
                        style={{ marginLeft: 15 }}
                        onClick={this.getWxQr}
                    >重新绑定小程序
                    </Button>
                    {
                        phoneTxt ? <span style={{ paddingLeft: 15 }}>当前绑定用户手机号为{phoneTxt}</span> : null
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
                        disabledEdit={true}
                        billData={curEditInfo}
                        onOk={this.onConfirmEdit}
                        checkCount={this.state.checkCount}
                        lastCheckTime={this.state.lastCheckTime}
                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                        // onSaveInvoice={this.props.onSaveInvoice}
                        // onShowLedgerdata={this.props.onShowLedgerdata}
                        updateAttachUrl={this.props.updateAttachUrl}
                        queryAttachUrl={this.props.queryAttachUrl}
                        queryTripUrl={this.props.queryTripUrl}
                        queryOtherInfoUrl={this.props.queryOtherInfoUrl}
                        // onPrintInvoice={this.onPrintInvoice}
                        AccountManageState={true}
                    />
                </Modal>
                <Modal
                    visible={showLogs}
                    title='推送台账信息'
                    onCancel={() => this.setState({ showLogs: false, curPushToCommonLog: [] })}
                    width={1000}
                    top={10}
                    footer={null}
                    bodyStyle={{ padding: 12 }}
                >
                    <PushAccountList
                        listData={curPushToCommonLog}
                        queryPushAccountLogsUrl={this.props.queryPushAccountLogsUrl}
                    />
                </Modal>
                <Modal
                    visible={this.state.rebind}
                    title='重新绑定小程序'
                    width={500}
                    maskClosable={false}
                    onCancel={() => { this.setState({ rebind: false }); clearTimeout(time2); }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div className='tipCont'>
                            <p style={{ color: '#fbc21a' }}>
                                <img src={iconTp} alt='tips' style={{ width: 18, verticalAlign: 'text-bottom', marginRight: 5 }} />扫码后等待2-5秒钟后，自动刷新绑定结果。
                            </p>
                        </div>
                        <div className='appletBox' style={{ border: '1px solid #f2f2f2' }}>
                            <p style={{ lineHeight: '180px' }}>
                                {
                                    miniQrSrc ? (
                                        <img src={miniQrSrc} style={{ width: 280 }} />

                                    ) : showMiniProgramQrErr ? (
                                        <p
                                            style={{ fontSize: 12, color: 'red', textAlign: 'center', padding: '15px 0', cursor: 'pointer' }}
                                            onClick={this.getWxQr}
                                        >
                                            {showMiniProgramQrErr}
                                        </p>
                                    ) : (
                                        <Icon type='loading' style={{ fontSize: 30, color: '#aaa' }} />
                                    )
                                }
                            </p>
                            <p className='appletTips'>微信扫一扫</p>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

AppletWallet.propTypes = {
    onQueryInvoiceNums: PropTypes.func.isRequired,
    onQueryAccount: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onShowLedgerdata: PropTypes.func.isRequired,
    onPrintInvoice: PropTypes.func.isRequired,
    updateAttachUrl: PropTypes.string,
    queryAttachUrl: PropTypes.string,
    queryTripUrl: PropTypes.string,
    queryOtherInfoUrl: PropTypes.string,
    loginInfo: PropTypes.object,
    queryPushAccountLogsUrl: PropTypes.string,
    pushToAccountUrl: PropTypes.string,
    phone: PropTypes.string,
    onGetWxQr: PropTypes.func.isRequired,
    getUserBindInfoUrl: PropTypes.string,
    openid: PropTypes.string,
    onSetOpenId: PropTypes.func.isRequired
};

export default AppletWallet;
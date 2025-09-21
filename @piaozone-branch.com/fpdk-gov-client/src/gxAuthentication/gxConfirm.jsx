import React from 'react';
import './less/gxConfirm.less';
import PropTypes from 'prop-types';
import { message, Button, Modal, Tabs, DatePicker } from 'antd';
import 'moment/locale/zh-cn';
import moment from 'moment';
import CurDktjqd from './curDktjqd';
import { kdRequest } from '@piaozone.com/utils';
import { confirm, modalInfo } from '../commons/antdModal';
import TongjiTable from './tongjiTable';

const { MonthPicker } = DatePicker;
const { TabPane } = Tabs;
const GxConfirmProcess = ({ applyTime = '', tongjiFinishTime = '', confirmSignTime = '', createTjbbStatus = '' }) => {
    return (
        <div className='gxConfirmProcess'>
            <div className={createTjbbStatus === '01' || createTjbbStatus === '' ? 'dotArea step1' : 'dotArea step1 active'}>
                <span className='dot'>1</span>
                <span className='title'>申请统计</span>
                {
                    applyTime ? (
                        <span className='time'>{applyTime}</span>
                    ) : null
                }
            </div>
            <div className={createTjbbStatus === '02' || createTjbbStatus === '05' ? 'dotArea step2 active' : 'dotArea step2'}>
                <span className='dot'>2</span>
                <span className='title'>统计完成</span>
                {
                    tongjiFinishTime ? (
                        <span className='time'>{tongjiFinishTime}</span>
                    ) : null
                }
            </div>
            <div className={createTjbbStatus === '05' ? 'dotArea step3 active' : 'dotArea step3'}>
                <span className='dot'>3</span>
                <span className='title'>确认签名</span>
                {
                    confirmSignTime ? (
                        <span className='time'>{confirmSignTime}</span>
                    ) : null
                }
            </div>
        </div>
    );
};

GxConfirmProcess.propTypes = {
    applyTime: PropTypes.string,
    tongjiFinishTime: PropTypes.string,
    confirmSignTime: PropTypes.string,
    createTjbbStatus: PropTypes.string
};

class GxConfirm extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            applyTime: '',
            updateTime: '',
            confirmSignTime: '',
            tongjiInfo: '',
            taxNo: '',
            isAllowQxTj: false,
            isAllowQrtj: false,
            createTjbbStatus: '',
            selectedMonth: null,
            activeKey: '1',
            awaitParam: {
                name: ''
            }
        };
    }

    componentDidUpdate() {
        const clientLogin = document.querySelector('#clientLogin');
        if (clientLogin) {
            const loginState = clientLogin.getAttribute('loginState');
            if (loginState == 2) {
                const apiName = clientLogin.getAttribute('apiName');
                if (apiName === 'searchSelectData') {
                    const { awaitParam } = this.state;
                    this.searchSelectData(awaitParam.param);
                    this.setState({
                        awaitParam: { name: '' }
                    });
                } else if (apiName === 'createTongji') {
                    this.createTongji();
                } else if (apiName === 'cxTongji') {
                    this.cxTongji();
                } else if (apiName === 'gxConfirm') {
                    this.gxConfirm();
                } else if (apiName === '_gxConfirm') {
                    const { awaitParam } = this.state;
                    this._gxConfirm(awaitParam.param);
                    this.setState({
                        awaitParam: { name: '' }
                    });
                }
                clientLogin.setAttribute('loginState', 1);
                clientLogin.setAttribute('apiName', '');
            }
        }
    }

    updateTable = (info) => {
        const { tjInfo, updateTime, isAllowQrtj, isAllowQxTj, createTjbbStatus, skssq, belongMonth, applyTime, confirmSignTime } = info;
        this.setState({
            updateTime,
            tongjiInfo: tjInfo,
            isAllowQrtj,
            isAllowQxTj,
            createTjbbStatus,
            skssq,
            belongMonth,
            applyTime,
            confirmSignTime
        });
    }

    _search = async(flag = true) => { //当期查询
        message.loading('查询中...', 0);
        const res = await kdRequest({
            url: this.props.searchTjUrl,
            timeout: 60000,
            data: {
                ...this.props.clientConfig
            },
            method: 'POST'
        });
        message.destroy();
        if (res.errcode !== '0000') {
            if (res.errcode === '91300') {
                Modal.warning({
                    title: '温馨提示',
                    content: res.description + '请点击重试',
                    onOk: () => {
                        this._search();
                    }
                });
            } else {
                message.info(res.description);
            }
        } else {
            this.updateTable(res.data);
            if (res.data.createTjbbStatus === '01' && flag) {
                modalInfo({
                    content: '当前还未生成统计表，您可以先勾选完发票后再生成统计表！'
                });
            } else if (res.data.createTjbbStatus === '21') {
                modalInfo({
                    content: '统计表还在生成中，请稍后再试...'
                });
            }
        }
    }

    //生成统计报表
    createTongji = async() => {
        confirm({
            content: '确定要申请生成统计表吗？',
            onOk: async() => {
                message.loading('申请生成报表中...', 0);
                const res = await kdRequest({
                    url: this.props.sctjUrl,
                    timeout: 60000,
                    data: {
                        ...this.props.clientConfig
                    },
                    method: 'POST'
                });
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === 'loginFail') {
                    this.props.onClientLogin(res.data.loginWebUrl, 'createTongji');
                    return;
                }
                if (res.errcode === '91300') {
                    Modal.warning({
                        title: '温馨提示',
                        content: res.description + '请点击重试'
                    });
                    return;
                }
                if (res.errcode !== '0000') {
                    modalInfo({
                        content: res.description
                    });
                } else {
                    if (res.data && res.data.createTjbbStatus) { //已经返回统计信息
                        this.updateTable(res.data);
                    } else {
                        confirm({
                            title: '提示',
                            content: res.description,
                            onOk: async() => {
                                Modal.destroyAll();
                                await this._search(false);
                            }
                        });
                    }
                };
            }
        });
    }


    //撤销统计报表
    cxTongji = async() => {
        confirm({
            content: '确定要撤销统计表吗？',
            onOk: async() => {
                message.loading('撤销统计表中...', 0);
                const res = await kdRequest({
                    url: this.props.qxtjUrl,
                    timeout: 60000,
                    data: {
                        ...this.props.clientConfig
                    },
                    method: 'POST'
                });
                message.destroy();
                Modal.destroyAll();
                if (res.errcode === 'loginFail') {
                    this.props.onClientLogin(res.data.loginWebUrl, 'cxTongji');
                    return;
                }
                if (res.errcode === '91300') {
                    Modal.warning({
                        title: '温馨提示',
                        content: res.description + '请点击重试'
                    });
                    return;
                }
                if (res.errcode !== '0000') {
                    modalInfo({
                        content: res.description
                    });
                } else {
                    confirm({
                        title: '提示',
                        content: res.description,
                        onOk: async() => {
                            await this._search(false);
                            Modal.destroyAll();
                        }
                    });
                };
            }
        });
    }

    //勾选确认签名
    gxConfirm = async() => {
        confirm({
            title: '提示',
            content: '即将进行勾选确认操作！',
            onOk: async() => {
                message.loading('请求处理中...', 0);
                const res = await kdRequest({
                    url: this.props.gxConfirmUrl,
                    timeout: 60000,
                    data: {
                        ...this.props.clientConfig
                    },
                    method: 'POST'
                });
                message.destroy();
                if (res.errcode === 'loginFail') {
                    this.props.onClientLogin(res.data.loginWebUrl, 'gxConfirm');
                    return;
                }
                if (res.errcode === '91300') {
                    Modal.warning({
                        title: '温馨提示',
                        content: res.description + '请点击重试'
                    });
                    return;
                }
                if (res.errcode !== '0000') {
                    message.info(res.description);
                    return;
                }
                message.loading('勾选确认成功');
            }
        });
    }

    onChangeMonth = (v) => {
        this.setState({
            selectedMonth: v
        });
    }

    onChangeTab = (v) => {
        this.setState({
            activeKey: v
        });
    }

    createTongjiByListData(data) {
        const result = {};
        const resultArr = [];
        let dkNum = 0;
        let dkTotalAmount = 0.00;
        let dkTotalTaxAmont = 0.00;
        let bdkNum = 0;
        let bdkTotalAmount = 0.00;
        let bdkTotalTaxAmont = 0.00;

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const deductionPurpose = item.deductionPurpose;
            if (!result['k' + item.invoiceType]) {
                result['k' + item.invoiceType] = {};
                if (deductionPurpose === '1') {
                    dkNum += 1;
                    dkTotalAmount = parseFloat(item.invoiceAmount);
                    dkTotalTaxAmont = parseFloat(item.effectiveTaxAmount);
                    result['k' + item.invoiceType] = {
                        invoiceType: item.invoiceType,
                        dkCopies: 1,
                        dkAmount: parseFloat(item.invoiceAmount),
                        dkTaxAmount: parseFloat(item.effectiveTaxAmount),
                        bdkCopies: 0,
                        bdkAmount: 0.00,
                        bdkTaxAmount: 0.00
                    };
                } else if (deductionPurpose === '2') {
                    bdkNum += 1;
                    bdkTotalAmount = parseFloat(item.invoiceAmount);
                    bdkTotalTaxAmont = parseFloat(item.taxAmount);
                    result['k' + item.invoiceType] = {
                        dkCopies: 0,
                        dkAmount: 0.00,
                        dkTaxAmount: 0.00,
                        bdkCopies: 1,
                        bdkAmount: parseFloat(item.invoiceAmount),
                        bdkTaxAmount: parseFloat(item.taxAmount)
                    };
                }
            } else {
                const curItem = result['k' + item.invoiceType];
                if (deductionPurpose === '1') {
                    dkNum += 1;
                    curItem.dkCopies += 1;
                    curItem.dkAmount = parseFloat(curItem.dkAmount) + parseFloat(item.invoiceAmount);
                    curItem.dkTaxAmount = parseFloat(curItem.dkTaxAmount) + parseFloat(item.effectiveTaxAmount);
                    dkTotalAmount += parseFloat(item.invoiceAmount);
                    dkTotalTaxAmont += parseFloat(item.effectiveTaxAmount);
                } else if (deductionPurpose === '2') {
                    curItem.bdkCopies += 1;
                    bdkNum += 1;
                    curItem.bdkAmount = parseFloat(curItem.bdkAmount) + parseFloat(item.invoiceAmount);
                    curItem.bdkTaxAmount = parseFloat(curItem.bdkTaxAmount) + parseFloat(item.taxAmount);
                    bdkTotalAmount += parseFloat(item.invoiceAmount);
                    bdkTotalTaxAmont += parseFloat(item.taxAmount);
                }
            }
        }

        const resultKeys = Object.keys(result);
        for (let i = 0; i < resultKeys.length; i++) {
            const curKey = resultKeys[i];
            const curData = result[curKey];
            const invoiceType = curData.invoiceType;
            resultArr.push([
                invoiceType,
                curData.dkCopies,
                curData.dkAmount.toFixed(2),
                curData.dkTaxAmount.toFixed(2),
                curData.bdkCopies,
                curData.bdkAmount.toFixed(2),
                curData.bdkTaxAmount.toFixed(2)
            ].join('='));
        }


        if (resultKeys.indexOf('k2') === -1) {
            resultArr.push(['2', 0, '0.00', '0.00', 0, '0.00', '0.00'].join('='));
        }
        if (resultKeys.indexOf('k12') === -1) {
            resultArr.push(['12', 0, '0.00', '0.00', 0, '0.00', '0.00'].join('='));
        }
        if (resultKeys.indexOf('k15') === -1) {
            resultArr.push(['15', 0, '0.00', '0.00', 0, '0.00', '0.00'].join('='));
        }
        const hjData = [
            '99',
            dkNum,
            dkTotalAmount.toFixed(2),
            dkTotalTaxAmont.toFixed(2),
            bdkNum,
            bdkTotalAmount.toFixed(2),
            bdkTotalTaxAmont.toFixed(2)
        ].join('=');
        resultArr.push(hjData);
        return resultArr;
    }

    searchSelectData = async(selectedMonth) => { //历史查询,这里有点问题
        const { loginType } = this.props.clientConfig;
        message.loading('查询中...', 0);
        if (loginType == 1) { //走全电客户端
            this.setState({
                loading: true
            });
            const res = await kdRequest({
                url: this.props.searchTjUrl,
                timeout: 60000,
                data: {
                    taxPeriod: selectedMonth,
                    ...this.props.clientConfig
                },
                method: 'POST'
            });
            message.destroy();
            if (res.errcode === 'loginFail') {
                this.props.onClientLogin(res.data.loginWebUrl, 'searchSelectData');
                this.setState({
                    awaitParam: {
                        name: 'searchSelectData',
                        param: selectedMonth
                    }
                });
                return;
            }
            if (res.errcode === '91300') {
                Modal.warning({
                    title: '温馨提示',
                    content: res.description + '请重试'
                });
                return;
            }
            if (res.errcode !== '0000') {
                message.info(res.description);
            }

            const resData = res.data || {};
            this.setState({
                selectedUpdateTime: resData.updateTime,
                selectedTongjiList: resData.tjInfo.replace(/;$/, '').split(';')
            });
            return;
        }

        this.setState({
            loading: true,
            listData: [],
            processList: []
        });

        this.searchOpt = {
            id: 'dkmx',
            rzzt: '1',
            gxzt: '-1',
            fpdm: '',
            fphm: '',
            xfsbh: '',
            fplx: '-1',
            fply: '-1',
            rq_q: '',
            rq_z: '',
            qrrzrq_q: '',
            qrrzrq_z: '',
            tjyf: selectedMonth
        };
        const res = await kdRequest({
            url: this.props.collectUrl,
            timeout: 60000,
            data: {
                searchOpt: this.searchOpt,
                dataIndex: 0,
                continueFlag: false,
                ...this.props.clientConfig
            },
            method: 'POST'
        });
        message.destroy();
        if (res.errcode === '0000') {
            const tongjiInfo = this.createTongjiByListData(res.data);
            const resData = res.data || [];
            this.setState({
                selectedUpdateTime: resData.length > 0 ? resData[0].selectAuthenticateTime : '',
                selectedTongjiList: tongjiInfo,
                selectedListData: res.data
            });
        } else {
            this.setState({
                loading: false
            });
            message.info(res.description);
        }
    }

    render() {
        // const { companyName, taxNo } = this.props.loginGovInfo || {};
        const {
            applyTime,
            confirmSignTime,
            tongjiInfo, updateTime,
            isAllowQrtj, isAllowQxTj,
            createTjbbStatus,
            belongMonth = '',
            selectedMonth,
            activeKey,
            selectedTongjiList = [],
            selectedListData = [],
            selectedUpdateTime = ''
        } = this.state;
        let curSksq = '';
        let maxSksqDate;
        let selectDate;
        const skssq = this.state.skssq || this.props.skssq;
        if (skssq) {
            curSksq = skssq.substr(0, 6);
            maxSksqDate = moment(curSksq, 'YYYYMM');
            curSksq = maxSksqDate.format('YYYY年MM月');
            selectDate = selectedMonth || maxSksqDate.subtract(1, 'months');
        }

        let tongjiList = [];
        if (tongjiInfo) {
            tongjiList = tongjiInfo.replace(/;$/, '').split(';');
        }

        tongjiList = tongjiList.filter((item) => {
            const itemList = item.split('=');
            const type = itemList[0];
            return ['01', '03', '14', '17', '24', '30', '99'].indexOf(type) !== -1;
        });
        const initData = window.__INITIAL_STATE__ || {};
        return (
            <div className='gxConfirm'>
                <Tabs type='card' activeKey={activeKey} onChange={this.onChangeTab} animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                    <TabPane tab='当前属期数据统计' key='1'>
                        <div className='topInfo clearfix'>
                            <div className='floatLeft'><b>税款所属期：</b><span className='ssq'>{curSksq || '--'}</span></div>
                            <div className='floatRight'>
                                <Button onClick={this._search}>查询统计表</Button>
                                {
                                    createTjbbStatus === '01' ? (
                                        <Button onClick={this.createTongji} type='primary'>生成统计</Button>
                                    ) : null
                                }

                                {
                                    isAllowQrtj ? (
                                        <Button onClick={this.gxConfirm}>确认签名</Button>
                                    ) : null
                                }


                                {
                                    isAllowQxTj ? (
                                        <Button onClick={this.cxTongji}>撤销统计</Button>
                                    ) : null
                                }
                            </div>
                        </div>

                        <GxConfirmProcess
                            applyTime={applyTime}
                            tongjiFinishTime={updateTime}
                            confirmSignTime={confirmSignTime}
                            createTjbbStatus={createTjbbStatus}
                        />
                        <TongjiTable
                            tongjiList={tongjiList}
                            companyName={initData.companyName}
                            taxNo={initData.taxNo}
                            belongMonth={belongMonth}
                            updateTime={updateTime}
                            createTjbbStatus={createTjbbStatus}
                        />
                    </TabPane>
                    {
                        maxSksqDate ? (
                            <TabPane tab='历史属期数据统计' key='2'>
                                <div className='topInfo clearfix'>
                                    <div className='floatLeft'>
                                        <b>税款所属期：</b>
                                        <MonthPicker
                                            onChange={this.onChangeMonth}
                                            placeholder='选择属期'
                                            value={selectDate}
                                            disabledDate={(d) => {
                                                return maxSksqDate.diff(d, 'months') > 12 ||
                                                    d.diff(maxSksqDate, 'days') > 0 ||
                                                    d.format('YYYY年MM月') === curSksq;
                                            }}
                                        />
                                    </div>
                                    <div className='floatRight'>
                                        <Button onClick={() => this.searchSelectData(selectDate.format('YYYYMM'))}>查询统计表</Button>
                                    </div>
                                </div>
                                <TongjiTable
                                    tongjiList={selectedTongjiList}
                                    companyName={initData.companyName}
                                    taxNo={initData.taxNo}
                                    belongMonth={selectDate.format('YYYYMM')}
                                    updateTime={selectedUpdateTime}
                                    createTjbbStatus={createTjbbStatus}
                                />
                            </TabPane>
                        ) : null
                    }
                </Tabs>

                {
                    confirmSignTime || (activeKey === '2' && selectDate) ? (
                        <CurDktjqd
                            access_token={this.props.access_token}
                            // showLogin={this.props.showLogin}
                            // loginGovInfo={this.props.loginGovInfo}
                            collectUrl={this.props.collectUrl}
                            tjyf={activeKey === '2' ? selectDate.format('YYYYMM') : skssq.substr(0, 6)}
                            activeKey={activeKey}
                            listData={activeKey === '2' ? selectedListData : false}
                            clientConfig={this.props.clientConfig}
                        />
                    ) : null
                }
            </div>
        );
    }
}

GxConfirm.propTypes = {
    gxConfirmUrl: PropTypes.string.isRequired,
    searchTjUrl: PropTypes.string.isRequired,
    qxtjUrl: PropTypes.string.isRequired,
    sctjUrl: PropTypes.string.isRequired,
    collectUrl: PropTypes.string.isRequired,
    access_token: PropTypes.string,
    skssq: PropTypes.string,
    clientConfig: PropTypes.object.isRequired,
    // fpdkType: PropTypes.number, // 2 合力中税接口，1或者空为旧版发票抵扣接口
    onClientLogin: PropTypes.func.isRequired
};

export default GxConfirm;
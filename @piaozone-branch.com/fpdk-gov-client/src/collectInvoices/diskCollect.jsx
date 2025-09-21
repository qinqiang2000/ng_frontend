/*eslint-disable*/
import React from 'react';
import { Button, Table, message, Pagination, Modal, DatePicker, Select, Radio } from 'antd';
import { kdRequest } from '@piaozone.com/utils';
import moment from 'moment';
import './style.less';
import CollectProcess from './collectProcess';
import PropTypes from 'prop-types';
import GovLoginBox from '../govLogin';
import { getBdkGxInvoiceCols } from '../commons/gxInvoiceCols';
const Option = Select.Option;
const { RangePicker } = DatePicker;

class DiskCollectInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            listData: [],
            processList: [],
            dataIndex: 0,
            pageSize: 400,
            loading: false,
            fplx: '',
            rzzt: '0,1,2,3',
            fpzt: '-1',
            glzt: '0',
            xfsbh: '',
            page: 1,
            rangeDate: [moment().startOf('month'), moment()],
            loginType: 2,
            needClientLoginUrl: '' //税局登录地址
        };
    }

    componentDidUpdate() {
        // const clientLogin = document.querySelector('#clientLogin');
        // if (clientLogin) {
        //     const loginState = clientLogin.getAttribute('loginState');
        //     if (loginState == 2) {
        //         clientLogin.setAttribute('loginState', 1);
        //         this.fetchList(1, this.state.pageSize);
        //     }
        // }
    }

    onSearch = async() => {
        this.fetchList(1, this.state.pageSize);
    }

    async holiTaxQueryInvoices(url, opt) { //合力中税
        const { continueFlag, clientType, stepFinish } = opt;
        let goOn = typeof continueFlag === 'undefined' ? true : continueFlag; //连续请求标志
        let name = '--';
        var stepFinishHanlder = (stepRes) => {
            if (typeof stepFinish === 'function') {
                try {
                    stepFinish({
                        endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                        errcode: stepRes.errcode,
                        description: stepRes.description,
                        continueFlag: stepRes.totalNum == 0 || stepRes.errcode != '0000' ? false : true,
                        totalNum: stepRes.totalNum || 0,
                        data: stepRes.data || [],
                        invoiceInfo: stepRes.invoiceInfo || {},
                        queryArgs: typeof stepRes.queryArgs === 'undefined' ? { //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                            searchOpt: opt.searchOpt,
                            dataFrom: opt.dataFrom || '',
                            dataFromIndex,
                            dataIndex,
                            ...otherOpt,
                            name
                        } : stepRes.queryArgs
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        };
        let { serialNo = '', versionNo = '', dataIndex = 0, searchOpt, dataFromIndex = 0, dataFrom = '', ...otherOpt } = opt;
        do {
            const res = await kdRequest({
                url,
                timeout: 70000,
                data: {
                    continueFlag,
                    serialNo,
                    clientType,
                    versionNo,
                    dataIndex,
                    dataFromIndex,
                    dataFrom,
                    ...otherOpt,
                    searchOpt
                },
                method: 'POST'
            });
            stepFinishHanlder(res);
            if (typeof res.nextDataFromIndex !== 'undefined') {
                if (res.endFlag) {
                    goOn = false;
                } else {
                    dataIndex = res.nextDataIndex || 0;
                    dataFromIndex = res.nextDataFromIndex || 0;
                    serialNo = res.serialNo;
                    if (res.queryArgs) {
                        name = res.queryArgs.name;
                    }
                }
            } else {
                goOn = false;
            }
        } while (goOn);
    }

    async queryInvoices(url, opt) { //下载表头数据
        const { loginType } = this.props.clientConfig;
        if (parseInt(loginType) === 2) {
            const res1 = await this.holiTaxQueryInvoices(url, opt);
            return res1;
        }
        const { continueFlag, clientType, stepFinish } = opt;
        let goOn = typeof continueFlag === 'undefined' ? true : continueFlag; //连续请求标志
        let res;
        let name = '--';
        let { serialNo = '', versionNo = '', dataIndex = 0, searchOpt, dataFromIndex = 0, dataFrom = '', ...otherOpt } = opt;
        var stepFinishHanlder = (stepRes) => {
            if (typeof stepFinish === 'function') {
                try {
                    stepFinish({
                        endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                        errcode: stepRes.errcode,
                        continueFlag: stepRes.totalNum == 0 || stepRes.errcode != '0000' ? false : true,
                        description: stepRes.description,
                        totalNum: stepRes.totalNum || 0,
                        data: stepRes.data || [],
                        invoiceInfo: stepRes.invoiceInfo || {},
                        queryArgs: typeof stepRes.queryArgs === 'undefined' ? { //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                            searchOpt: opt.searchOpt,
                            dataFrom: dataFrom || '',
                            dataFromIndex,
                            dataIndex,
                            ...otherOpt,
                            name
                        } : stepRes.queryArgs
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        };
        do {
            res = await kdRequest({
                url,
                timeout: 70000,
                data: {
                    continueFlag,
                    serialNo,
                    clientType,
                    versionNo,
                    dataIndex,
                    dataFromIndex,
                    dataFrom,
                    ...otherOpt,
                    searchOpt
                },
                method: 'POST'
            });
            stepFinishHanlder(res);
            if (typeof res.nextDataFromIndex !== 'undefined') {
                if (res.endFlag) {
                    goOn = false;
                } else {
                    dataIndex = res.nextDataIndex || 0;
                    dataFromIndex = res.nextDataFromIndex || 0;
                    serialNo = res.serialNo;
                    if (res.queryArgs) {
                        name = res.queryArgs.name;
                    }
                }
            } else {
                goOn = false;
            }
        } while (goOn);
        return res;
    }

    onloginCallback = (res) => {
        console.log('轮询登录结果===>>>>>>>>', res);
        if (res.errcode == 'cancel') {
            this.setState({ needClientLoginUrl: '' });
            return;
        }
        if (res.errcode != '0000') {
            message.error(res.description);
            return;
        }
        this.setState({ needClientLoginUrl: '' });
        this.fetchList(1, this.state.pageSize); //重试
    }

    fetchList = async(c, size = this.state.pageSize) => {
        this.setState({
            loading: true,
            listData: [],
            processList: []
        });
        const { fpzt, rzzt, fplx, rangeDate, xfsbh, glzt } = this.state;
        const rq_q = rangeDate[0].format('YYYY-MM-DD');
        const rq_z = rangeDate[1].format('YYYY-MM-DD');
        let url = this.props.collectUrl;
        // 单独处理未到期发票
        // if (rzzt === '2') {
        //     this.searchOpt.rzzt = '0';
        // }
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }
        const { taxTickPlatform, loginType, inputPathUrl } = this.props.clientConfig;
        let dataFrom = '';
        let exclude = '';
        let getRzzt = '';
        if (parseInt(loginType) === 2) { //软证书
            exclude = 'wdqQuery';
            getRzzt = '0';
        } else {
            if (rzzt === 'dkgxquery' || rzzt === 'bdkgxquery') {
                dataFrom = rzzt;
                exclude = rzzt;
            }
            getRzzt = rzzt;
        }
        this.searchOpt = {
            glzt,
            fpzt,
            rzzt: getRzzt,
            gxzt: '-1', //税局通过rzzt字段查询未勾选和和勾选
            fpdm: '',
            fphm: '',
            xfsbh,
            fplx,
            rq_q,
            rq_z,
            page: c,
            pageSize: size
        };
        //新参数,需要调用接口获取；
        await this.queryInvoices(url, {
            inputPathUrl,
            taxTickPlatform,
            loginType,
            dataFrom,
            exclude,
            jksbz: '1', // 缴款书标志
            continueFlag: true,
            searchOpt: this.searchOpt,
            dataIndex: (c - 1) * size,
            stepFinish: (res) => {
                if (res.errcode === '0000') {
                    this.setState({
                        page: c,
                        dataIndex: (c - 1) * size,
                        pageSize: size,
                        listData: this.state.listData.concat(res.data)
                    });
                } else {
                    if (res.errcode === 'loginFail') {
                        this.setState({
                            needClientLoginUrl: res.data.loginWebUrl
                        });
                        this.setState({
                            loading: false
                        });
                        return;
                    }
                    if (res.errcode === '91300') {
                        if (res.data && res.data.scanFaceCheckUrl) {
                            this.setState({
                                needClientLoginUrl: res.data.scanFaceCheckUrl
                            });
                        } else {
                            Modal.warning({
                                title: '温馨提示',
                                content: res.description + '请重试',
                                onOk: () => {
                                    this.fetchList(1, this.state.pageSize);
                                }
                            });
                        }
                        this.setState({
                            loading: false
                        });
                        return;
                    }
                    message.info(res.description);
                    const keyValue = Math.random();
                    this.setState({
                        processList: this.state.processList.concat({
                            ...res.queryArgs,
                            dataFrom,
                            exclude,
                            totalNum: res.totalNum,
                            description: res.description,
                            key: keyValue
                        })
                    });
                }
                if (res.endFlag) {
                    this.setState({
                        loading: false
                    });
                }
            }
        });
    }

    onRetry = async(item, i) => {
        this.setState({
            processList: this.state.processList.map((item, index) => {
                if (i === index) {
                    return {
                        ...item,
                        retryIng: true
                    };
                } else {
                    return item;
                }
            })
        });
        let url = this.props.collectUrl;
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }
        //新参数,需要调用接口获取；
        const { taxTickPlatform, loginType, inputPathUrl } = this.props.clientConfig;
        await this.queryInvoices(url, {
            inputPathUrl,
            taxTickPlatform,
            loginType,
            dataFrom: item.dataFrom || '',
            exclude: item.exclude || '',
            dataFromIndex: item.dataFromIndex,
            jksbz: '1', // 缴款书标志
            continueFlag: true,
            searchOpt: this.searchOpt,
            dataIndex: item.dataIndex,
            stepFinish: (res) => {
                if (res.errcode === '0000') {
                    this.setState({
                        listData: this.state.listData.concat(res.data),
                        processList: this.state.processList.filter((item, index) => {
                            return i !== index;
                        })
                    });
                    message.info('采集成功');
                } else {
                    if (res.errcode === 'loginFail') {
                        this.setState({
                            needClientLoginUrl: res.data.loginWebUrl
                        });
                        this.setState({
                            loading: false
                        });
                        return;
                    }
                    if (res.errcode === '91300') {
                        if (res.data && res.data.scanFaceCheckUrl) { //登录异常
                            this.setState({
                                needClientLoginUrl: res.data.scanFaceCheckUrl
                            });
                        } else {
                            Modal.warning({
                                title: '温馨提示',
                                content: res.description + '请重试'
                            });
                        }
                        this.setState({
                            loading: false
                        });
                        return;
                    }
                    this.setState({
                        processList: this.state.processList.map((item, index) => {
                            if (i === index) {
                                return {
                                    ...item,
                                    description: res.description,
                                    retryIng: false
                                };
                            } else {
                                return item;
                            }
                        })
                    });
                    message.info(res.description);
                }
            }
        });
    }

    showPageList(c, size) {
        this.setState({
            page: c,
            pageSize: size
        });
    }

    onReset = () => {
        this.setState({
            glzt: '0',
            xfsbh: '',
            fplx: '',
            rzzt: '0,1,2,3',
            fpzt: '-1',
            rangeDate: [moment().startOf('month'), moment()]
        });
    }

    setRzzt = (v) => { //认证状态
        if (v === '2,3' || v === 'bdkgxquery') {
            this.setState({
                rzzt: v,
                fpzt: '-1'
            });
        } else {
            this.setState({ rzzt: v })
        }
    }

    render() {
        const { listData, pageSize, loading, fplx, rzzt, fpzt, rangeDate, page, processList, showProcessList, glzt } = this.state;
        const { isShowAccount, showChooseModal, defaultAccount } = this.props;
        let loginType = '2'; //2软证书，1rap客户端
        if (this.props.clientConfig) {
            loginType = this.props.clientConfig.loginType
        }

        let totalAmount = 0.00;
        let totalTaxAmount = 0.00;
        for (let i = 0; i < listData.length; i++) {
            const curInvoiceAmount = parseFloat(listData[i].invoiceAmount);
            const taxAmount = listData[i].totalTaxAmount || listData[i].taxAmount;
            const curTaxAmount = parseFloat(taxAmount);
            if (!isNaN(curInvoiceAmount)) {
                totalAmount += curInvoiceAmount;
                totalTaxAmount += curTaxAmount;
            }
        }

        return (
            <div className='collectInvoices clearfix'>
                <div className='searchArea'>
                    <div className='row choose'>
                        <div>
                            {
                                loginType != 2 ? (
                                    <div className='inputItem'>
                                        <label>抵扣状态：</label>
                                        {/* <Radio.Group onChange={(e) => this.setState({ rzzt: e.target.value })} value={rzzt}>
                                            <Radio value='0'>未抵扣</Radio>
                                            <Radio value='1'>已抵扣</Radio>
                                            <Radio value='2'>未到期</Radio>
                                        </Radio.Group> */}
                                        <Select
                                            value={rzzt}
                                            style={{ width: 227 }}
                                            onChange={(v) => { this.setRzzt(v); }}
                                        >
                                            <Option value='0,1,2,3'>全部</Option>
                                            <Option value='0'>未勾选/未到期</Option>
                                            <Option value='dkgxquery'>抵扣已勾选</Option>
                                            <Option value='bdkgxquery'>不抵扣已勾选</Option>
                                            <Option value='2,3'>已认证</Option>
                                        </Select>
                                    </div>
                                ) : null
                            }

                            <div className='inputItem'>
                                <label style={{ width: loginType === 2 ? 78 : 100 }}>
                                    {
                                        rzzt === '2,3' ? '税期时间' : rzzt === 'dkgxquery' || rzzt === 'bdkgxquery'
                                        ? '抵扣日期：'
                                        : '开票/勾选日期'
                                    }
                                </label>
                                <RangePicker
                                    allowClear={false}
                                    value={rangeDate}
                                    format='YYYY-MM-DD'
                                    disabledDate={(current) => { return current > moment(); }}
                                    onChange={(d) => this.setState({ rangeDate: d })}
                                />
                            </div>
                            {/* <div className='inputItem' style={{ display: rzzt === '2' || fpdkType === 2 ? 'none' : 'inline-block' }}>
                                <label>销方税号：</label>
                                <Input
                                    value={xfsbh}
                                    onChange={(e) => this.setState({ xfsbh: e.target.value.trim() })}
                                    style={{ width: 165 }}
                                    autoComplete='off'
                                />
                            </div> */}
                            <Button type='primary' style={{ margin: '0 10px 0 25px' }} disabled={loading} onClick={this.onSearch}>下载发票</Button>
                            <Button disabled={loading} onClick={this.onReset}>重置条件</Button>
                            {
                                processList.length > 0 ? (
                                    <span className='errCollectTip' onClick={() => this.setState({ showProcessList: true })}>{processList.length}项采集失败</span>
                                ) : null
                            }
                        </div>
                        {
                            isShowAccount && (
                                <div>电子税局账号：{defaultAccount.name} <span className='btn' onClick={() => showChooseModal()}>切换</span></div>
                            )
                        }

                    </div>
                    <div className='row fplxRow'>
                        <div className='inputItem'>
                            <label>发票类型：</label>
                            {/* <Radio.Group onChange={(e) => this.setState({ fplx: e.target.value })} value={fplx}>
                                <Radio value='-1' style={{ width: 75 }}>全部</Radio>
                                <Radio value='01' style={{ width: 135 }}>增值税专用发票</Radio>
                                <Radio value='03'>机动车发票</Radio>
                                <Radio value='14'>通行费电子发票</Radio>
                                <Radio value='08' style={{ marginLeft: 20 }}>电子专用发票</Radio>
                                {
                                    loginType === 2 ? (
                                        <Radio value='21'>海关缴款书</Radio>
                                    ) : null
                                }
                                <Radio value='27'>数电票（增值税专用发票）</Radio>
                            </Radio.Group> */}

                            <Select
                                className='searchInput'
                                onChange={(v) => this.setState({ fplx: v })}
                                value={fplx}
                                style={{ width: 228 }}
                            >
                                <Option value=''>全部</Option>
                                <Option value='2'>电子专用发票</Option>
                                <Option value='4'>增值税专用发票</Option>
                                <Option value='12'>机动车销售发票</Option>
                                <Option value='15'>通行费电子发票</Option>
                                {
                                    loginType === 2 ? (
                                        <Option value='21'>海关缴款书</Option>
                                    ) : null
                                }
                                <Option value='27'>数电票（增值税专用发票）</Option>
                            </Select>
                        </div>
                        <div className='inputItem'>
                            <label style={{ width: 100 }}>发票状态：</label>
                            <Select
                                disabled={rzzt === '2,3' || rzzt === 'bdkgxquery'}
                                className='searchInput'
                                onChange={(v) => this.setState({ fpzt: v })}
                                style={{ width: 228 }}
                                value={fpzt}
                            >
                                <Option value='-1'>全部</Option>
                                <Option value='0'>正常</Option>
                                <Option value='1'>失控</Option>
                                <Option value='2'>作废</Option>
                                <Option value='3'>红冲</Option>
                                <Option value='4'>部分冲红</Option>
                                <Option value='8'>全额冲红</Option>
                            </Select>
                        </div>
                    </div>
                    <div className='row' style={{ display: parseInt(loginType) === 2 ? 'block' : 'none' }}>
                        <div className='inputItem'>
                            <label>管理状态：</label>
                            <Radio.Group onChange={(e) => this.setState({ glzt: e.target.value })} value={glzt}>
                                <Radio value='-1'>全部</Radio>
                                <Radio value='0'>正常</Radio>
                                <Radio value='1'>非正常</Radio>
                            </Radio.Group>
                        </div>
                    </div>
                </div>

                <Table
                    rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                    dataSource={listData.slice((page - 1) * pageSize, page * pageSize)}
                    columns={getBdkGxInvoiceCols(page, pageSize)}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                    tableLayout='fixed'
                    scroll={{ x: 1760, y: loginType === 1 ? 600 : 700 }}
                />

                <div className='tjInfo'>
                    <span>共采集<span className='num'>{listData.length}</span>张发票</span>，
                    <span>不含税金额合计<span className='num'>￥{totalAmount.toFixed(2)}</span></span>，
                    <span>总税额<span className='num'>￥{totalTaxAmount.toFixed(2)}</span></span>
                </div>

                <Pagination
                    size='small'
                    current={page}
                    total={listData.length}
                    showSizeChanger
                    showQuickJumper
                    className='floatRight'
                    pageSize={pageSize}
                    pageSizeOptions={['100', '200', '400']}
                    onShowSizeChange={(c, size) => this.showPageList(c, size)}
                    onChange={(c, size) => this.showPageList(c, size)}
                />
                <Modal
                    className='collectErrProcess'
                    visible={showProcessList}
                    onCancel={() => this.setState({ showProcessList: false })}
                    title='采集错误列表'
                    footer={false}
                    width={650}
                    height={700}
                >
                    <CollectProcess onRetry={this.onRetry} processList={processList} pageSize={pageSize} />
                </Modal>
                {
                    this.state.needClientLoginUrl ? (
                        <GovLoginBox
                            needClientLoginUrl={this.state.needClientLoginUrl}
                            clientLoginUrl={this.props.clientLoginUrl}
                            onloginCallback={(res)=>{ this.onloginCallback(res) }}
                        />
                    ) : null
                }
            </div>
        );
    }
}


DiskCollectInvoices.propTypes = {
    // govOperate: PropTypes.object.isRequired,
    access_token: PropTypes.string,
    collectUrl: PropTypes.string,
    clientConfig: PropTypes.object,
    showChooseModal: PropTypes.func,
    isShowAccount: PropTypes.bool,
    defaultAccount: PropTypes.object,
    clientLoginUrl: PropTypes.string.isRequired
};

export default DiskCollectInvoices;
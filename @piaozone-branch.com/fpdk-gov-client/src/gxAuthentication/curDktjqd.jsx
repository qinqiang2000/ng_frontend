//当前抵扣统计清单查询
/*eslint-disable*/
import React from 'react';
import { Button, Table, message, Pagination, Radio, DatePicker, Input, Select, Modal } from 'antd';
import { kdRequest } from '@piaozone.com/utils';
import PropTypes from 'prop-types';
import { getDktjInvoiceCols } from '../commons/gxInvoiceCols';
import './less/curDktjqd.less';
import moment from 'moment';
const Option = Select.Option;
const { RangePicker } = DatePicker;

class CurDktjQd extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            listData: props.activeKey === '2' ? props.listData : [],
            dataIndex: 0,
            totalNum: 0,
            page: 1,
            pageSize: 50,
            loading: false,
            rangeDate: [null, null],
            xfsbh: '',
            fpdm: '',
            fphm: '',
            fply: '0',
            fplx: '',
            id: 'dkmx'
        };
    }

    componentWillReceiveProps(props) {
        const { loginType } = this.props.clientConfig;
        if (props.activeKey === '2' && loginType == 2) {
            this.filterInvoice(props.listData);
        }
    }

    componentDidUpdate() {
        const clientLogin = document.querySelector('#clientLogin');
        if (clientLogin) {
            const loginState = clientLogin.getAttribute('loginState');
            if (loginState == 2) {
                clientLogin.setAttribute('loginState', 1);
                this.fetchList(1, this.state.pageSize);
            }
        }
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
                        continueFlag: (stepRes.totalNum == 0 || stepRes.errcode != '0000') ? false : true,
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
                        continueFlag: (stepRes.totalNum == 0 || stepRes.errcode != '0000') ? false : true,
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

    fetchList = async(c, size = this.state.pageSize) => {
        const { loginType = 1, inputPathUrl, taxTickPlatform } = this.props.clientConfig; // 1, 3全电客户端；2软证书
        const { rangeDate, xfsbh, fpdm, fphm, fply, id, fplx } = this.state;
        const qrrzrq_q = rangeDate[0] ? rangeDate[0].format('YYYY-MM-DD') : ''; //确认认证日期
        const qrrzrq_z = rangeDate[1] ? rangeDate[1].format('YYYY-MM-DD') : '';
        this.setState({
            loading: true,
            listData: loginType == 1 || loginType == 3 ? this.state.listData : [],
            processList: []
        });
        this.searchOpt = {
            id,
            rzzt: '2',
            gxzt: '-1',
            fpdm,
            fphm,
            xfsbh,
            fplx: loginType == 2 ? '-1' : fplx,
            fply,
            rq_q: qrrzrq_q,
            rq_z: qrrzrq_z,
            qrrzrq_q,
            qrrzrq_z,
            tjyf: this.props.tjyf,
            pageSize: size
        };

        await this.queryInvoices(this.props.collectUrl, {
            inputPathUrl,
            taxTickPlatform,
            loginType,
            jksbz: '1', // 缴款书标志
            continueFlag: true,
            searchOpt: this.searchOpt,
            dataIndex: (c - 1) * size,
            stepFinish: (res) => {
                if (res.errcode === 'loginFail') {
                    this.props.onClientLogin(res.data.loginWebUrl);
                    return;
                }
                if (res.errcode === '91300') {
                    Modal.warning({
                        title: '温馨提示',
                        content: res.description + '请点击重试'
                    });
                    return;
                }
                if (res.errcode === '0000') {
                    this.setState({
                        dataIndex: (c - 1) * size,
                        pageSize: size,
                        loading: false,
                        listData: res.data,
                        totalNum: res.totalNum,
                        selectedRows: []
                    });
                } else {
                    this.setState({
                        loading: false
                    });

                    message.info(res.description);
                }
            }
        });
        // const res = await kdRequest({
        //     url: this.props.collectUrl,
        //     timeout: 60000,
        //     data: {
        //         searchOpt: {
        //             ...this.searchOpt,
        //             pageSize: size
        //         },
        //         continueFlag: false,
        //         ...this.props.clientConfig
        //     },
        //     method: 'POST'
        // });
    }

    reset = () => {
        this.setState({
            dataIndex: 0,
            totalNum: 0,
            rangeDate: [null, null],
            xfsbh: '',
            fpdm: '',
            fphm: '',
            fply: '0',
            id: 'dkmx'
        });
    }

    filterInvoice = (list = []) => {
        const result = [];
        const { fpdm = '', fphm = '', rangeDate } = this.state;

        for (let i = 0; i < list.length; i++) {
            const curData = list[i];
            let filterFlag = false;
            if (fpdm !== '' && curData.invoiceCode !== fpdm) {
                filterFlag = true;
            } else if (fphm !== '' && curData.invoiceNo !== fphm) {
                filterFlag = true;
            } else if (rangeDate[0] && moment(curData.invoiceDate, 'YYYY-MM-DD').diff(rangeDate[0], 'days') < 0) {
                filterFlag = true;
            } else if (rangeDate[1] && moment(curData.invoiceDate, 'YYYY-MM-DD').diff(rangeDate[1], 'days') > 0) {
                filterFlag = true;
            }
            if (!filterFlag) {
                result.push(curData);
            }
        }
        this.setState({
            listData: result,
            totalNum: result.length
        });
    }

    onShowCurPageData = (c, size) => {
        const { listData } = this.state;
        const result = listData.filter((item, index) => {
            return index == c && index < c * size;
        });
        return result;
    }

    render() {
        const { page, pageSize, loading, listData, totalNum, id, fply, fpdm, fphm, xfsbh, rangeDate, fplx } = this.state;
        // const page = parseInt(dataIndex / pageSize) + 1;
        const { loginType = 1 } = this.props.clientConfig; // 1 全电客户端；2软证书
        const { activeKey } = this.props;
        const hiddeStyle = { display: loginType == 1 ? 'inline-block' : 'none' };
        const showFlag = activeKey === '2' && loginType == 2 ? this.props.listData.length !== 0 : true;
        const result = listData.filter((item, index) => {
            const startIndex = (page - 1) * pageSize;
            if (index < startIndex + pageSize && index >= startIndex) {
                return item;
            }
        });
        return (
            <div className='curDktjqd' style={{ display: showFlag ? 'block' : 'none' }}>
                <div className='titleTop clearfix'>
                    <div className='floatLeft'>发票清单</div>
                    <div className='floatRight'>
                        {
                            activeKey === '1' || (activeKey === '2' && (loginType == 1)) ? (
                                <Button type='primary' onClick={() => this.fetchList(1)} style={{ marginLeft: 15 }}>查询</Button>
                            ) : (
                                <Button type='primary' onClick={() => this.filterInvoice(this.props.listData)} style={{ marginLeft: 15 }}>筛选</Button>
                            )
                        }
                        <Button onClick={this.reset} style={{ marginLeft: 15 }}>重置</Button>
                    </div>
                </div>
                {
                    parseInt(loginType) === 2 ? ( //软证书
                        <div className='gxInvoicesSearch searchArea'>
                            <div className='row fplxRow' style={hiddeStyle}>
                                <div className='inputItem'>
                                    <label>发票类别：</label>
                                    <Radio.Group onChange={(e) => this.setState({ id: e.target.value })} value={id}>
                                        <Radio value='dkmx' style={{ width: 135 }}>增值税专用发票</Radio>
                                        <Radio value='ckznxmx'>出口转内销发票</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                            <div className='row' style={hiddeStyle}>
                                <div className='inputItem'>
                                    <label>用途：</label>
                                    <Radio.Group onChange={(e) => this.setState({ fply: e.target.value })} value={fply}>
                                        <Radio value='0'>全部</Radio>
                                        <Radio value='1'>抵扣</Radio>
                                        <Radio value='2'>不抵扣</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='inputItem'>
                                    <label>发票代码：</label>
                                    <Input value={fpdm} onChange={(e) => this.setState({ fpdm: e.target.value.trim() })} maxLength={12} />
                                </div>
                                <div className='inputItem'>
                                    <label>发票号码：</label>
                                    <Input value={fphm} onChange={(e) => this.setState({ fphm: e.target.value.trim() })} maxLength={10} />
                                </div>
                                <div className='inputItem'>
                                    <label>开票日期：</label>
                                    <RangePicker
                                        allowClear={true}
                                        value={rangeDate}
                                        format='YYYY-MM-DD'
                                        onChange={(d) => this.setState({ rangeDate: d })}
                                    />
                                </div>
                                <div className='inputItem' style={hiddeStyle}>
                                    <label>销方税号：</label>
                                    <Input value={xfsbh} onChange={(e) => this.setState({ xfsbh: e.target.value.trim() })} style={{ width: 165 }} />
                                </div>
                            </div>
                        </div>
                    ) : ( //客户端
                        <div className='gxInvoicesSearch searchArea'>
                            <div className='row'>
                                <div className='inputItem'>
                                    <label>发票类型：</label>
                                    <Select
                                        className='searchInput'
                                        onChange={(v) => this.setState({ fplx: v })}
                                        value={fplx}
                                        style={{ width: 228 }}
                                    >
                                        <Option value=''>全部</Option>
                                        <Option value='2'>电子专用发票</Option>
                                        <Option value='3'>增值税普通发票</Option>
                                        <Option value='4'>增值税专用发票</Option>
                                        <Option value='12'>机动车销售统一发票</Option>
                                        <Option value='15'>通行费电子发票</Option>
                                        <Option value='26'>数电票（普通发票）</Option>
                                        <Option value='27'>数电票（增值税专用发票）</Option>
                                    </Select>
                                </div>
                                <div className='inputItem'>
                                    <label>用途：</label>
                                    <Radio.Group onChange={(e) => this.setState({ fply: e.target.value })} value={fply}>
                                        <Radio value='0'>全部</Radio>
                                        <Radio value='1'>抵扣</Radio>
                                        <Radio value='2'>不抵扣</Radio>
                                    </Radio.Group>
                                </div>
                                <div className='inputItem' style={{ display: 'none' }}>
                                    <label>勾选日期：</label>
                                    <RangePicker
                                        allowClear={true}
                                        value={rangeDate}
                                        format='YYYY-MM-DD'
                                        onChange={(d) => this.setState({ rangeDate: d })}
                                    />
                                </div>
                            </div>
                            <div className='row'>
                                <div className='inputItem'>
                                    <label>发票代码：</label>
                                    <Input value={fpdm} onChange={(e) => this.setState({ fpdm: e.target.value.trim() })} maxLength={12} />
                                </div>
                                <div className='inputItem'>
                                    <label>发票号码：</label>
                                    <Input value={fphm} onChange={(e) => this.setState({ fphm: e.target.value.trim() })} maxLength={10} />
                                </div>
                                <div className='inputItem' style={{ marginTop: 10 }}>
                                    <label>销方税号：</label>
                                    <Input value={xfsbh} onChange={(e) => this.setState({ xfsbh: e.target.value.trim() })} style={{ width: 165 }} />
                                </div>
                            </div>
                        </div>
                    )
                }
                <Table
                    rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                    dataSource={result}
                    columns={getDktjInvoiceCols(page, pageSize)}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                    tableLayout='fixed'
                    scroll={{ x: 1660, y: 600 }}
                />
                <div className='clearfix' style={{ marginTop: 10 }}>
                    <div className='tjInfo floatLeft'>
                        <span>总共<span className='num'>{totalNum}</span>条数据</span>
                    </div>
                    {
                        loginType == 1 ? (
                            <Pagination
                                size='small'
                                current={page}
                                total={totalNum}
                                showSizeChanger
                                showQuickJumper
                                className='floatRight'
                                pageSize={pageSize}
                                pageSizeOptions={['10', '30', '50', '100']}
                                onShowSizeChange={(c, size) => this.setState({ page: c, pageSize: size })}
                                onChange={(c, size) => this.setState({ page: c, pageSize: size })}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
};



CurDktjQd.propTypes = {
    collectUrl: PropTypes.string,
    tjyf: PropTypes.string,
    activeKey: PropTypes.string,
    listData: PropTypes.array,
    clientConfig: PropTypes.object,
    onClientLogin: PropTypes.func.isRequired
};

export default CurDktjQd;
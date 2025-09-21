//当前抵扣统计清单查询

import React from 'react';
import { Button, Table, message, Pagination, Radio, DatePicker, Input } from 'antd';
import PropTypes from 'prop-types';
import { getDktjInvoiceCols } from '../commons/gxInvoiceCols';
import './less/curDktjqd.less';
import moment from 'moment';

const { RangePicker } = DatePicker;

class CurDktjQd extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            listData: props.activeKey === '2' ? props.listData : [],
            dataIndex: 0,
            totalNum: 0,
            pageSize: 50,
            loading: false,
            rangeDate: [null, null],
            xfsbh: '',
            fpdm: '',
            fphm: '',
            fply: '0',
            id: 'dkmx'
        };
    }

    componentWillReceiveProps(props) {
        if (props.activeKey === '2') {
            this.filterInvoice(props.listData);
        }
    }


    fetchList = async(c, size = this.state.pageSize) => {
        const fpdkType = this.props.fpdkType || 1;
        const isLogin = await this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo);
        if (!isLogin) {
            this.props.showLogin();
            return;
        }

        this.setState({
            loading: true,
            listData: fpdkType === 1 ? this.state.listData : [],
            processList: []
        });

        const { rangeDate, xfsbh, fpdm, fphm, fply, id } = this.state;
        const qrrzrq_q = rangeDate[0] ? rangeDate[0].format('YYYY-MM-DD') : '';
        const qrrzrq_z = rangeDate[1] ? rangeDate[1].format('YYYY-MM-DD') : '';

        this.searchOpt = {
            id,
            rzzt: '1',
            gxzt: '-1',
            fpdm,
            fphm,
            xfsbh,
            fplx: '-1',
            fply,
            rq_q: fpdkType === 1 ? '' : qrrzrq_q,
            rq_z: fpdkType === 1 ? '' : qrrzrq_z,
            qrrzrq_q,
            qrrzrq_z,
            tjyf: this.props.tjyf,
            pageSize: size
        };

        let url = this.props.collectUrl;
        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }

        this.props.govOperate.queryInvoices(url, {
            searchOpt: {
                ...this.searchOpt,
                pageSize: size
            },
            dataIndex: (c - 1) * size,
            continueFlag: false,
            stepFinish: (res) => {
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

    render() {
        const { dataIndex, pageSize, loading, listData, totalNum, id, fply, fpdm, fphm, xfsbh, rangeDate } = this.state;
        const page = parseInt(dataIndex / pageSize) + 1;
        const { fpdkType, activeKey } = this.props;
        const hiddeStyle = { display: fpdkType === 1 ? 'inline-block' : 'none' };
        const showFlag = activeKey === '2' && fpdkType === 2 ? this.props.listData.length !== 0 : true;
        return (
            <div className='curDktjqd' style={{ display: showFlag ? 'block' : 'none' }}>
                <div className='titleTop clearfix'>
                    <div className='floatLeft'>发票清单</div>
                    <div className='floatRight'>
                        {
                            activeKey === '1' || (activeKey === '2' && fpdkType === 1) ? (
                                <Button type='primary' onClick={() => this.fetchList(1)} style={{ marginLeft: 15 }}>查询</Button>
                            ) : (
                                <Button type='primary' onClick={() => this.filterInvoice(this.props.listData)} style={{ marginLeft: 15 }}>筛选</Button>
                            )
                        }
                        <Button onClick={this.reset} style={{ marginLeft: 15 }}>重置</Button>
                    </div>
                </div>
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
                            <label>{fpdkType === 1 ? '勾选日期' : '开票日期'}</label>
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

                <Table
                    rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                    dataSource={listData}
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
                        fpdkType === 1 ? (
                            <Pagination
                                size='small'
                                current={page}
                                total={totalNum}
                                showSizeChanger
                                showQuickJumper
                                className='floatRight'
                                pageSize={pageSize}
                                pageSizeOptions={['10', '30', '50', '100']}
                                onShowSizeChange={(c, size) => this.fetchList(c, size)}
                                onChange={(c, size) => this.fetchList(c, size)}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
};



CurDktjQd.propTypes = {
    govOperate: PropTypes.object.isRequired,
    showLogin: PropTypes.func.isRequired,
    loginGovInfo: PropTypes.object,
    collectUrl: PropTypes.string,
    access_token: PropTypes.string,
    fpdkType: PropTypes.string,
    tjyf: PropTypes.string,
    activeKey: PropTypes.string,
    listData: PropTypes.array
};

export default CurDktjQd;
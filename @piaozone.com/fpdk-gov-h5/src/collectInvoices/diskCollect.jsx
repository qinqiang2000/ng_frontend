import React from 'react';
import { Button, Table, message, Pagination, Modal, Radio, DatePicker, Input } from 'antd';
import moment from 'moment';
import './style.less';
import CollectProcess from './collectProcess';
import PropTypes from 'prop-types';
import { getBdkGxInvoiceCols } from '../commons/gxInvoiceCols';
const { RangePicker } = DatePicker;


class DiskCollectInvoices extends React.Component {
    constructor(props) {
        super(...arguments);

        this.state = {
            listData: [],
            processList: [],
            showLoginDialog: false,
            dataIndex: 0,
            pageSize: 400,
            loading: false,
            fplx: '-1',
            rzzt: '0',
            fpzt: '0',
            glzt: '0',
            xfsbh: '',
            page: 1,
            rangeDate: [moment().startOf('month'), moment()]
        };
    }

    onSearch = (opt) => {
        const fpdkType = this.props.fpdkType || 1;
        if ((!this.props.govOperate.passwd || !this.props.loginGovInfo) && fpdkType === 1) {
            this.props.showLogin();
        } else {
            this.fetchList(1, this.state.pageSize);
        }
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

        this.searchOpt = {
            glzt,
            fpzt,
            rzzt,
            gxzt: '-1', //税局通过rzzt字段查询未勾选和和勾选
            fpdm: '',
            fphm: '',
            xfsbh,
            fplx,
            rq_q,
            rq_z,
            pageSize: size
        };

        // 单独处理未到期发票
        if (rzzt === '2') {
            this.searchOpt.rzzt = '0';
        }

        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }
        const dataFrom = rzzt === '2' ? 'wdqQuery' : '';
        const exclude = rzzt === '0' ? 'wdqQuery' : '';
        await this.props.govOperate.queryInvoices(url, {
            dataFrom,
            exclude,
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
            }
        });

        this.setState({
            loading: false
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

        await this.props.govOperate.queryInvoices(url, {
            searchOpt: this.searchOpt,
            dataFrom: item.dataFrom || '',
            exclude: item.exclude || '',
            dataIndex: item.dataIndex,
            dataFromIndex: item.dataFromIndex,
            continueFlag: false,
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
            fplx: '-1',
            rzzt: '0',
            fpzt: '0',
            rangeDate: [moment().startOf('month'), moment()]
        });
    }


    render() {
        const { listData, pageSize, loading, fplx, rzzt, fpzt, rangeDate, page, processList, showProcessList, xfsbh, glzt } = this.state;
        let totalAmount = 0.00;
        let totalTaxAmount = 0.00;
        const fpdkType = this.props.fpdkType || 1;
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
                    <div className='row'>
                        {
                            fpdkType === 1 ? (
                                <div className='inputItem'>
                                    <label>抵扣状态：</label>
                                    <Radio.Group onChange={(e) => this.setState({ rzzt: e.target.value })} value={rzzt}>
                                        <Radio value='0'>未抵扣</Radio>
                                        <Radio value='1'>已抵扣</Radio>
                                        <Radio value='2'>未到期</Radio>
                                    </Radio.Group>
                                </div>
                            ) : null
                        }

                        <div className='inputItem'>
                            <label style={{ width: fpdkType === 2 ? 78 : 100 }}>
                                {
                                    rzzt === '2' || fpdkType === 2 ? '开票日期：' : rzzt === '0' ? '开票/勾选日期：' : '抵扣日期：'
                                }
                            </label>
                            <RangePicker
                                allowClear={false}
                                value={rangeDate}
                                format='YYYY-MM-DD'
                                onChange={(d) => this.setState({ rangeDate: d })}
                            />
                        </div>
                        <div className='inputItem' style={{ display: rzzt === '2' || fpdkType === 2 ? 'none' : 'inline-block' }}>
                            <label>销方税号：</label>
                            <Input
                                value={xfsbh}
                                onChange={(e) => this.setState({ xfsbh: e.target.value.trim() })}
                                style={{ width: 165 }} autoComplete={false}
                            />
                        </div>
                        <Button type='primary' style={{ margin: '0 10px 0 25px' }} disabled={loading} onClick={this.onSearch}>下载发票</Button>
                        <Button disabled={loading} onClick={this.onReset}>重置条件</Button>
                        {
                            processList.length > 0 ? (
                                <span className='errCollectTip' onClick={() => this.setState({ showProcessList: true })}>{processList.length}项采集失败</span>
                            ) : null
                        }

                    </div>
                    <div className='row fplxRow'>
                        <div className='inputItem'>
                            <label>发票类型：</label>
                            <Radio.Group onChange={(e) => this.setState({ fplx: e.target.value })} value={fplx}>
                                <Radio value='-1' style={{ width: 75 }}>全部</Radio>
                                <Radio value='01' style={{ width: 135 }}>增值税专用发票</Radio>
                                <Radio value='03'>机动车发票</Radio>
                                <Radio value='14'>通行费电子发票</Radio>
                                <Radio value='08'>电子专用发票</Radio>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className='row' style={{ display: rzzt === '2' ? 'none' : 'block' }}>
                        <div className='inputItem'>
                            <label>管理状态：</label>
                            <Radio.Group onChange={(e) => this.setState({ glzt: e.target.value })} value={glzt}>
                                <Radio value='-1'>全部</Radio>
                                <Radio value='0'>正常</Radio>
                                <Radio value='1'>非正常</Radio>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className='row' style={{ display: rzzt === '2' ? 'none' : 'block' }}>
                        <div className='inputItem'>
                            <label>发票状态：</label>
                            <Radio.Group onChange={(e) => this.setState({ fpzt: e.target.value })} value={fpzt}>
                                <Radio value='-1'>全部</Radio>
                                <Radio value='0'>正常</Radio>
                                <Radio value='1'>失控</Radio>
                                <Radio value='2'>作废</Radio>
                                <Radio value='3'>红冲</Radio>
                                <Radio value='4'>异常</Radio>
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
                    scroll={{ x: 1760, y: fpdkType === 1 ? 600 : 700 }}
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
            </div>
        );
    }
}


DiskCollectInvoices.propTypes = {
    govOperate: PropTypes.object.isRequired,
    showLogin: PropTypes.func.isRequired,
    loginGovInfo: PropTypes.object,
    access_token: PropTypes.string,
    collectUrl: PropTypes.string,
    fpdkType: PropTypes.number
};

export default DiskCollectInvoices;
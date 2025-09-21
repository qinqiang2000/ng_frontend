import React from 'react';
import { message, Modal, Empty, Pagination, DatePicker, Button, Spin } from 'antd';
import PropTypes from 'prop-types';
import GxDetailList from '../gxInvoices/gxDetailList';
import { renderIndexNumber } from '../commons/gxInvoiceCols';
import moment from 'moment';
import { kdRequest } from '@piaozone.com/utils';
import { getGxInfo } from './gxInfoTool';

const { RangePicker } = DatePicker;
class GxLogs extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            dkgxSuccessList: [],
            dkgxErrList: [],
            gxRangeTime: [moment().startOf('month'), moment()],
            logList: [],
            loading: false,
            page: 1,
            pageSize: 15
        };
    }

    componentDidMount() {
        this.fetchList();
    }

    fetchList = async(pageNo = this.state.page, pageSize = this.state.pageSize) => {
        const url = this.props.getAccoutUrl;
        const gxRangeTime = this.state.gxRangeTime;
        this.setState({
            loading: true,
            logList: []
        });
        const res = await kdRequest({
            url,
            timeout: 60000,
            data: {
                page: pageNo,
                pageSize,
                startTime: gxRangeTime[0].format('YYYY-MM-DD'),
                endTime: gxRangeTime[1].format('YYYY-MM-DD')
            },
            method: 'POST'
        });
        this.setState({
            loading: false
        });
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return;
        }
        const resData = res.data || {};
        this.setState({
            page: pageNo,
            pageSize,
            totalNum: res.totalElement,
            logList: resData.map((item) => {
                const gxInfo = getGxInfo(item.countInfos);
                return {
                    batchNo: item.batchNo,
                    selectTime: item.createTime.substr(0, 16),
                    successInfo: gxInfo.successInfo,
                    failInfo: gxInfo.failInfo,
                    unFinish: gxInfo.unFinish,
                    selectType: item.deductionPurpose,
                    totalInfo: gxInfo.totalInfo
                };
            })
        });
    }

    onChangeTab = () => {

    }

    renderInfo = (r, flag) => {
        let curInfo = r.success || {};
        if (flag === 2) {
            curInfo = r.fail;
        } else if (flag === 3) {
            curInfo = r.unFinish;
        }

        return (
            <table>
                <tr>
                    <td>{curInfo.totalNum}份</td>
                    <td>{curInfo.invoiceAmount}</td>
                    <td>{curInfo.totalTaxAmount}</td>
                </tr>
            </table>
        );
    }

    createHeader() {
        return (
            <thead>
                <tr>
                    <th rowSpan='2' align='center' style={{ textAlign: 'center' }} width='50'>序号</th>
                    <th rowSpan='2' align='center' style={{ textAlign: 'center' }} width='100'>勾选类型</th>
                    <th rowSpan='2' align='center' style={{ textAlign: 'center' }} width='150'>勾选时间</th>
                    <th align='center' style={{ textAlign: 'center' }} colSpan='3'>成功信息</th>
                    <th align='center' style={{ textAlign: 'center' }} colSpan='3'>失败信息</th>
                    <th align='center' style={{ textAlign: 'center' }} colSpan='3'>未处理</th>
                    <th rowSpan='2' align='center' style={{ textAlign: 'center' }}>操作</th>
                </tr>
                <tr>
                    <td align='center'>份数</td>
                    <td align='center'>不含税金额</td>
                    <td align='center'>税额</td>
                    <td align='center'>份数</td>
                    <td align='center'>不含税金额</td>
                    <td align='center'>税额</td>
                    <td align='center'>份数</td>
                    <td align='center'>不含税金额</td>
                    <td align='center'>税额</td>
                </tr>
            </thead>
        );
    }

    getGxType(type) {
        const intType = parseInt(type);
        if (intType === 1) {
            return '抵扣勾选';
        } else if (intType === -1) {
            return '抵扣取消勾选';
        } else if (intType === 4) {
            return '不抵扣勾选';
        } else if (intType === -4) {
            return '不抵扣取消勾选';
        } else {
            return '--';
        }
    }

    render() {
        const { gxRangeTime, logList = [], page, pageSize, totalNum, batchNo = '', showGxDefail, loading } = this.state;
        return (
            <div style={{ margin: '0 15px' }}>
                <div className='gxInvoicesSearch' style={{ margin: '10px 0', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                    <div className='row'>
                        <div className='inputItem inlineBlock'>
                            <label style={{ width: 65 }}>勾选日期：</label>
                            <RangePicker
                                allowClear={false}
                                value={gxRangeTime}
                                format='YYYY-MM-DD'
                                onChange={(d) => this.setState({ gxRangeTime: d })}
                                disabledDate={(c) => {
                                    return c > moment();
                                }}
                            />
                        </div>
                        <Button type='primary' onClick={() => this.fetchList(1)} style={{ margin: '0 15px 0 25px' }}>查询</Button>
                    </div>
                </div>

                <table width='100%' className='gxLogTables'>
                    {this.createHeader()}
                    {
                        logList.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan='13'>
                                        <div style={{ textAlign: 'center', margin: '15px 0' }}>
                                            {
                                                loading ? (
                                                    <Spin />
                                                ) : (
                                                    <Empty />
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {
                                    logList.map((item, i) => {
                                        return (
                                            <tr key={item.batchNo}>
                                                <td align='center'>{renderIndexNumber(page, pageSize, i)}</td>
                                                <td align='center'>{this.getGxType(item.selectType)}</td>
                                                <td align='center'>{item.selectTime}</td>
                                                <td align='center'>{item.successInfo.totalNum ? item.successInfo.totalNum + '份' : '0'}</td>
                                                <td align='center'>{item.successInfo.invoiceAmount || '--'}</td>
                                                <td align='center'>{item.successInfo.totalTaxAmount || '--'}</td>
                                                <td align='center'>{item.failInfo.totalNum ? item.failInfo.totalNum + '份' : '0'}</td>
                                                <td align='center'>{item.failInfo.invoiceAmount || '--'}</td>
                                                <td align='center'>{item.failInfo.totalTaxAmount || '--'}</td>
                                                <td align='center'>{item.unFinish.totalNum ? item.unFinish.totalNum + '份' : '0'}</td>
                                                <td align='center'>{item.unFinish.invoiceAmount || '--'}</td>
                                                <td align='center'>{item.unFinish.totalTaxAmount || '--'}</td>
                                                <td align='center'>
                                                    <a
                                                        href='javascript:;'
                                                        onClick={() => this.setState({
                                                            itemData: item,
                                                            batchNo: item.batchNo,
                                                            showGxDefail: true
                                                        })}
                                                    >
                                                        查看详情
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        )
                    }
                </table>

                <Pagination
                    size='small'
                    current={page}
                    total={totalNum}
                    showSizeChanger
                    showQuickJumper
                    className='floatRight'
                    pageSize={pageSize}
                    pageSizeOptions={['15', '30', '50']}
                    onShowSizeChange={(c, size) => this.fetchList(c, size)}
                    onChange={(c, size) => this.fetchList(c, size)}
                    style={{ marginTop: 10 }}
                />
                <Modal
                    title='勾选详细信息'
                    visible={showGxDefail}
                    onCancel={() => this.setState({ showGxDefail: false, batchNo: '', itemData: null })}
                    footer={null}
                    destroyOnClose={true}
                    className='dkgxErrList'
                    width={1200}
                >
                    <GxDetailList
                        batchNo={batchNo}
                        getSingleAccountUrl={this.props.getSingleAccountUrl}
                        singleExportUrl={this.props.singleExportUrl}
                        dkgxProgressUrl={this.props.dkgxProgressUrl}
                    />
                </Modal>
            </div>
        );
    }
}

GxLogs.propTypes = {
    getAccoutUrl: PropTypes.string.isRequired,
    getSingleAccountUrl: PropTypes.string.isRequired,
    singleExportUrl: PropTypes.string.isRequired,
    dkgxProgressUrl: PropTypes.string.isRequired
};

export default GxLogs;
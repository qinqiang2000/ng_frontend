

import React from 'react';
import { Button, Table, Pagination, message, Radio } from 'antd';
import PropTypes from 'prop-types';
import { render, renderInvoiceType, renderGxFlag, renderGlzt, renderIndexNumber } from '..//commons/gxInvoiceCols';
import './less/dkgxErrList.less';
import { kdRequest, tools } from '@piaozone.com/utils';
import { confirm } from '../commons/antdModal';
import { getGxInfo } from '../gxLogs/gxInfoTool';

class DkgxErrList extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            page: 1,
            pageSize: 20,
            loading: false,
            listData: [],
            totalNum: 0,
            selectStatus: typeof props.selectStatus === 'undefined' ? '' : props.selectStatus
        };
    }

    async componentDidMount() {
        this.tickProgress = null;
        const { batchNo } = this.props;
        this.getDkgxProgress(batchNo);
    }

    componentWillUnmount() {
        window.clearTimeout(this.tickProgress);
    }

    fetchList = async(selectStatus, page = this.state.page, pageSize = this.state.pageSize) => {
        const { getSingleAccountUrl, batchNo } = this.props;
        if (getSingleAccountUrl && batchNo) {
            this.setState({
                loading: true
            });
            const res = await kdRequest({
                url: getSingleAccountUrl,
                data: {
                    page,
                    pageSize,
                    batchNo,
                    selectStatus
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
            this.setState({
                selectStatus,
                page,
                pageSize,
                listData: res.data || []
            });
        }
    }

    getDeductionPurpose = (type) => {
        type = type.toString();
        if (type === '-1' || type === '1') {
            return '抵扣';
        } else if (type === '4' || type === '-4') {
            return '不抵扣';
        }
    }

    getTongjiInfo = (selectStatus) => {
        selectStatus = selectStatus.toString();
        const tongjiInfo = this.state.tongjiInfo || {};
        if (!tongjiInfo.totalInfo) {
            return {};
        }

        if (selectStatus === '') {
            return tongjiInfo.totalInfo;
        } else if (selectStatus === '0') {
            return tongjiInfo.unFinish;
        } else if (selectStatus === '1') {
            return tongjiInfo.successInfo;
        } else if (selectStatus === '2') {
            return tongjiInfo.failInfo;
        }
    }

    getDkgxProgress = async(batchNo, percent) => {
        const res = await kdRequest({
            url: this.props.dkgxProgressUrl,
            timeout: 60000,
            data: {
                batchNo
            },
            method: 'POST'
        });
        let gxInfo = {};
        if (res.errcode === '0000') {
            const resData = res.data || {};
            const countInfos = resData.countInfos || [];
            gxInfo = getGxInfo(countInfos);
            const finishNum = (gxInfo.successInfo.totalNum || 0) + (gxInfo.failInfo.totalNum || 0);
            const totalNum = gxInfo.totalInfo.totalNum || 0;
            if (finishNum === totalNum) {
                percent = 100;
            }
            percent = parseFloat(finishNum / totalNum) * 100;
            this.setState({
                percentStr: percent === 100 ? '100%' : percent.toFixed(2) + '%',
                tongjiInfo: gxInfo
            });
            this.fetchList(this.state.selectStatus);
        }

        if (percent === 100) {
            return;
        }

        this.tickProgress = setTimeout(() => {
            this.getDkgxProgress(batchNo, percent);
        }, 2000);
    }

    exportDetail = () => {
        confirm({
            title: '导出提示',
            content: '是否导出当前查询的所有勾选记录，请确认！',
            onOk: () => {
                tools.downloadFile({
                    downloadType: 'xhr',
                    url: this.props.singleExportUrl,
                    key: 'downloadParams',
                    data: {
                        selectStatus: this.state.selectStatus,
                        batchNo: this.props.batchNo
                    },
                    startCallback: () => {
                        this.setState({
                            exporting: true
                        });
                    },
                    endCallback: (res) => {
                        if (res.errcode !== '0000') {
                            message.info(res.description + '[' + res.errcode + ']');
                        } else {
                            message.success('导出成功');
                        }
                        this.setState({
                            exporting: false
                        });
                    }
                });
            }
        });
    }

    renderResult = (v) => {
        v = v ? v.toString() : '0';
        const errDict = {
            k1: '成功',
            k2: '无此票',
            k3: '该票异常无法认证',
            k4: '该票已勾选过',
            k5: '该票已经逾期',
            k7: '申请认证月份已过期',
            k10: '该票超出可操作开票日期范围上限',
            k11: '该票已作废',
            k12: '该票已红冲',
            k13: '未申报，属期尚未切换',
            k15: '失控发票',
            k16: '红字发票不能认证',
            k17: '该发票类型不符合退税认证条件',
            k18: '有效税额不合法',
            k19: '发票已经已勾选',
            k20: '当期已锁定勾选',
            k21: '管理状态异常',
            k31: '数据校验异常',
            k32: '认证期限校验异常',
            k23: '发票当前未勾选(取消 勾选/不抵扣勾选)',
            k24: '勾选属期非当前属期,不能取消(取消 勾选/不抵扣勾选)',
            k25: '当前勾选用途非抵扣勾选(取消勾选)',
            k26: '当前勾选用途非不抵扣勾选（取消不抵扣勾选）'
        };

        if (v === '0') {
            return (
                <span style={{ color: '#F69444' }}>处理中</span>
            );
        } else if (v === '1') {
            return (
                <span style={{ color: '#3598ff' }}>成功</span>
            );
        } else if (errDict['k' + v]) {
            return (
                <span style={{ color: '#f00' }}>{errDict['k' + v]}</span>
            );
        } else if (/^8-.*$/.test(v)) {
            return (
                <span style={{ color: '#f00' }}>认证操作执行异常</span>
            );
        } else if (/^check-.*$/.test(v)) {
            return (
                <span style={{ color: '#3598ff' }}>查验异常：{v.substr(6)}</span>
            );
        } else {
            return (
                <span style={{ color: '#f00' }}>认证异常</span>
            );
        }
    }

    render() {
        const { getSingleAccountUrl } = this.props;
        const { page, pageSize, listData = [], loading, selectStatus, percentStr } = this.state;
        const tongjiInfo = this.getTongjiInfo(selectStatus);
        const dkGxInvoiceCols = [
            { title: '序号', dataIndex: 'indexNumber', align: 'center', width: 60, render: (v, r, i) => renderIndexNumber(page, pageSize, i) },
            { title: '操作结果', dataIndex: 'selectResult', align: 'left', render: this.renderResult, width: 100 },
            { title: '是否勾选', dataIndex: 'authenticateFlag', align: 'left', render: renderGxFlag, width: 100 },
            { title: '发票代码', dataIndex: 'invoiceCode', align: 'left', render, width: 120 },
            { title: '发票号码', dataIndex: 'invoiceNo', align: 'left', render, width: 120 },
            { title: '开票日期', dataIndex: 'invoiceDate', align: 'left', render, width: 120 },
            { title: '税额', dataIndex: 'taxAmount', align: 'left', render: (v, r) => v || r.totalTaxAmount || '', width: 100 },
            { title: '有效抵扣税额', dataIndex: 'effectiveTaxAmount', align: 'left', render, width: 100 },
            { title: '销方名称', dataIndex: 'salerName', align: 'left', render, width: 150 },
            { title: '销方税号', dataIndex: 'salerTaxNo', align: 'left', render, width: 120 },
            { title: '金额', dataIndex: 'invoiceAmount', align: 'left', render, width: 120 },
            { title: '用途', dataIndex: 'deductionPurpose', align: 'left', render: this.getDeductionPurpose, width: 120 },
            { title: '发票类型', dataIndex: 'invoiceType', align: 'left', render: renderInvoiceType, width: 150 },
            { title: '管理状态', dataIndex: 'manageStatus', align: 'left', render: renderGlzt, width: 120 }
        ];
        return (
            <div className='dkgxInvoices clearfix'>
                <div className='topInfo'>
                    <div className='inputItem inlineBlock'>
                        <label style={{ width: 100, marginLeft: 4 }}>处理状态：</label>
                        <Radio.Group onChange={(e) => this.fetchList(e.target.value, 1)} value={selectStatus}>
                            <Radio value=''>全部</Radio>
                            <Radio value='1'>处理成功</Radio>
                            <Radio value='2'>处理失败</Radio>
                            <Radio value='0'>未处理</Radio>
                        </Radio.Group>
                    </div>
                    <Button type='primary' onClick={() => this.fetchList(selectStatus, 1)}>查询</Button>
                    <Button style={{ marginLeft: 15 }} onClick={this.exportDetail}>导出数据</Button>
                    <span style={{ marginLeft: 10 }}>
                        处理进度：{
                            percentStr === '100%' ? (
                                <span style={{ color: '#3598ff' }}>已完成</span>
                            ) : (
                                <span style={{ color: '#F69444' }}>{percentStr}</span>
                            )
                        }
                    </span>

                </div>
                <Table
                    rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                    dataSource={listData}
                    columns={dkGxInvoiceCols}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                    tableLayout='fixed'
                    scroll={{ x: 1200, y: 600 }}
                />

                <div className='tjInfo floatLeft'>
                    <span>合计不含税金额<span className='num'>￥{tongjiInfo.invoiceAmount || '0.00'}</span></span>，
                    <span>合计税额<span className='num'>￥{tongjiInfo.totalTaxAmount || '0.00'}</span></span>，
                    <span>总共<span className='num'>{tongjiInfo.totalNum || '0'}</span>条数据</span>
                </div>
                {
                    typeof getSingleAccountUrl === 'string' ? (
                        <Pagination
                            size='small'
                            current={page}
                            total={tongjiInfo.totalNum}
                            showSizeChanger
                            showQuickJumper
                            className='floatRight'
                            pageSize={pageSize}
                            pageSizeOptions={['15', '20', '50']}
                            onShowSizeChange={(c, size) => this.fetchList(selectStatus, c, size)}
                            onChange={(c, size) => this.fetchList(selectStatus, c, size)}
                        />
                    ) : null
                }
            </div>
        );
    }
}


DkgxErrList.propTypes = {
    selectStatus: PropTypes.string,
    batchNo: PropTypes.string,
    getSingleAccountUrl: PropTypes.string,
    dkgxProgressUrl: PropTypes.string,
    singleExportUrl: PropTypes.string
};

export default DkgxErrList;
import React from 'react';
import { DatePicker, Select, Button, Table, Pagination, message } from 'antd';
import { getGxLogCols } from '../commons/gxInvoiceCols';
import PropTypes from 'prop-types';
import moment from 'moment';
import { kdRequest } from '@piaozone.com/utils';
const { Option } = Select;
const fplxCt = [
    { label: '全部', value: '' },
    { label: '增值税抵扣勾选', value: '1' },
    { label: '增值税不抵扣勾选', value: '4' },
    // { label: '海关缴款书抵扣勾选', value: '03' },
    // { label: '海关缴款书不抵扣勾选', value: '14' },
    { label: '退税勾选', value: '2' }
];
const { MonthPicker } = DatePicker;

class GxLogs extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            page: 1,
            pageSize: 50,
            taxPeriod: '',
            deductibleMode: '',
            totalNum: 0,
            listData: [],
            loading: false
        };
    }

    componentDidMount = () => {
        const { autoRefresh } = this.props;
        if (autoRefresh) {
            this.fetchList(1, this.state.pageSize);
        }
    }

    searchClick = () => {
        this.fetchList(1, this.state.pageSize);
    }

    fetchList = async(page = this.state.page, size = this.state.pageSize) => {
        const { taxPeriod, deductibleMode } = this.state;
        let currentMonth = '';
        if (taxPeriod) {
            currentMonth = taxPeriod.format('YYYYMM');
        }
        const requestData = {
            taxPeriod: currentMonth,
            deductibleMode,
            pageSize: size,
            page
        };
        this.setState({
            loading: true
        });
        message.loading('加载中...', 0);
        const res = await kdRequest({
            url: this.props.gxLogsSearchUrl,
            timeout: 60000,
            data: requestData,
            method: 'POST'
        });
        message.destroy();
        if (res.errcode === '0000') {
            this.setState({
                page,
                pageSize: size,
                loading: false,
                totalNum: res.totalElement,
                listData: res.data || []
            });
        } else {
            message.info(res.description);
        }
    }

    reset = () => {
        this.setState({
            deductibleMode: '',
            taxPeriod: ''
        });
    }

    render() {
        const { deductibleMode, taxPeriod, page, totalNum, pageSize, listData, loading } = this.state;
        const { gxLogsDownLoadUrl } = this.props;
        const operateCol = {
            title: '操作',
            align: 'center',
            fixed: 'right',
            dataIndex: 'batchNo',
            width: 140,
            render: (v) => {
                return (
                    <a href={gxLogsDownLoadUrl + '?batchNo=' + v}>下载勾选明细</a>
                );
            }
        };
        const gxLogCols = getGxLogCols(page, pageSize).concat(operateCol);
        return (
            <div className='gxLogs' style={{ margin: '0 15px' }}>
                <div className='gxInvoicesSearch' style={{ marginBottom: 20 }}>
                    <div className='row'>
                        <div className='inputItem'>
                            <label>勾选类型：</label>
                            <Select
                                value={deductibleMode}
                                style={{ width: 220 }}
                                onChange={(v) => { this.setState({ deductibleMode: v }); }}
                            >
                                {
                                    fplxCt.map((item) => {
                                        return <Option value={item.value} key={item.value}>{item.label}</Option>;
                                    })
                                }
                            </Select>
                        </div>
                        <div className='inputItem' style={{ marginLeft: 30 }}>
                            <label>税款所属期：</label>
                            <MonthPicker
                                onChange={(d) => { this.setState({ taxPeriod: d }); }}
                                placeholder='选择勾选的税期'
                                value={taxPeriod}
                                disabledDate={(c) => {
                                    return c > moment();
                                }}
                            />
                        </div>
                        <Button type='primary' onClick={this.searchClick} style={{ margin: '0 15px 0 50px' }}>查询</Button>
                        <Button onClick={this.reset}>重置搜索</Button>
                    </div>
                </div>
                <Table
                    columns={gxLogCols}
                    dataSource={listData}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                    scroll={{ x: 1400 }}
                />
                <Pagination
                    size='small'
                    current={page}
                    total={totalNum}
                    showSizeChanger
                    showQuickJumper
                    className='floatRight'
                    pageSize={pageSize}
                    pageSizeOptions={['50', '100', '500', '1000']}
                    onShowSizeChange={(c, size) => this.fetchList(c, size)}
                    onChange={(c, size) => this.fetchList(c, size, true)}
                />
            </div>
        );
    }
}

GxLogs.propTypes = {
    gxLogsSearchUrl: PropTypes.string,
    gxLogsDownLoadUrl: PropTypes.string,
    autoRefresh: PropTypes.bool
};

export default GxLogs;
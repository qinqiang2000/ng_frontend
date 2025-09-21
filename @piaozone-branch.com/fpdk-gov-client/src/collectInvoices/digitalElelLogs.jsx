import React from 'react';
import { Button, Table, message, Pagination, DatePicker, Input } from 'antd';
import moment from 'moment';
import './style.less';
import PropTypes from 'prop-types';
import { pwyFetch } from '@piaozone.com/utils';
const { RangePicker } = DatePicker;
const statusDict = {
    k1: '未申请',
    k2: '处理中',
    k3: '下载成功',
    k4: '下载失败'
};

class DigitalElelLogs extends React.Component {
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
            listData: [],
            dataIndex: 0,
            loading: false,
            mode: 'time',
            searchOpt: { // 查询列表的参数
                invoiceRangeDate: [moment().startOf('month'), moment()],
                page: 1,
                pageSize: 20,
                invoiceNo: null
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.onSearch();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onReset = () => {
        this.setState({
            searchOpt: {
                invoiceRangeDate: [null, null],
                invoiceNo: null,
                page: 1,
                pageSize: 20
            }
        });
    }

    onSearch = async(page = this.state.searchOpt.page, pageSize = this.state.searchOpt.pageSize) => {
        if (!this._isMounted) {
            return;
        }
        this.setState({
            searchLoading: true
        });
        const { invoiceRangeDate, invoiceNo } = this.state.searchOpt;
        const invoice_q = invoiceRangeDate[0] ? invoiceRangeDate[0].format('YYYY-MM-DD') : '';
        const invoice_z = invoiceRangeDate[1] ? invoiceRangeDate[1].format('YYYY-MM-DD') : '';

        const searchOpt = {
            startTime: invoice_q, // 增量日志开始日期
            endTime: invoice_z, // 增量日志结束日期
            invoiceNo: invoiceNo || null,
            pageNo: page, // 当前分页值
            pageSize: pageSize // 分页大小
        };

        const res = await pwyFetch(this.props.queryDigitalLogsUrl, {
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

    render() {
        const minDate = moment('2017-01-01', 'YYYY-MM-DD');
        const maxDate = moment();
        const {
            totalNum, listData,
            searchOpt,
            searchLoading, handlerErrorIng
        } = this.state;
        const tabCols = [
            {
                title: '序号',
                align: 'left',
                render: (v, r, i) => {
                    return i + 1 + searchOpt.pageSize * (searchOpt.page - 1);
                }
            },
            {
                title: '发票类型',
                dataIndex: 'invoiceType',
                align: 'left',
                render: (v) => {
                    if (v) {
                        return this.fplxOptionsDict['k' + v].label || '--';
                    } else {
                        return '--';
                    }
                }
            },
            {
                title: '发票号码',
                dataIndex: 'invoiceNo',
                align: 'left'
            },
            {
                title: '开票日期',
                dataIndex: 'invoiceDate'
            },
            {
                title: '下载PDF',
                dataIndex: 'downloadPdfStatus',
                render: (v) => {
                    return statusDict['k' + v];
                }
            },
            {
                title: '下载OFD',
                dataIndex: 'downloadOfdStatus',
                render: (v) => {
                    return statusDict['k' + v];
                }
            },
            {
                title: '下载XML',
                dataIndex: 'downloadXmlStatus',
                render: (v) => {
                    return statusDict['k' + v];
                }
            },
            {
                title: '操作人',
                dataIndex: 'operator'
            },
            {
                title: '申请下载的时间',
                dataIndex: 'applyDate'
            }
        ];

        return (
            <div className='collectInvoices logs'>
                <div className='searchArea jxxDownload' style={{ paddingBottom: 10 }}>
                    <div className='row'>
                        <div className='inputItem'>
                            <label style={{ width: 90 }}>开票日期范围：</label>
                            <RangePicker
                                value={searchOpt.invoiceRangeDate}
                                format='YYYY-MM-DD'
                                disabledDate={(c) => {
                                    return c.format('X') < minDate.format('X') || c.format('X') > maxDate.format('X');
                                }}
                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, invoiceRangeDate: d } })}
                            />
                        </div>
                        <div className='inputItem'>
                            <label style={{ verticalAlign: 0 }}>发票号码：</label>
                            <Input
                                style={{ width: 220, marginRight: 20 }}
                                value={searchOpt.invoiceNo}
                                placeholder='请输入发票号码'
                                onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, invoiceNo: e.target.value.trim() } }); }}
                            />
                        </div>
                        <Button type='primary' style={{ marginRight: 10 }} disabled={searchLoading} onClick={() => this.onSearch(1)}>查询</Button>
                        <Button disabled={searchLoading || handlerErrorIng} style={{ marginRight: 10 }} onClick={this.onReset}>重置条件</Button>
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
                    rowKey='serialNo'
                    dataSource={listData}
                    columns={tabCols}
                    pagination={false}
                    bordered={false}
                    loading={searchLoading}
                />
            </div>
        );
    }
}

DigitalElelLogs.propTypes = {
    queryDigitalLogsUrl: PropTypes.string.isRequired
};

export default DigitalElelLogs;
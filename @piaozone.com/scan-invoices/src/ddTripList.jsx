import React from 'react';
import { message, Table, Pagination } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import ScrollWapper from '@piaozone.com/scroll-wrapper';
import { pwyFetch } from '@piaozone.com/utils';

class DDInvoiceInfo extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            loading: false,
            list: [],
            pageNo: 1,
            pageSize: 50
        };
    }

    componentDidMount() {
        this.fetchList();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.serialNo !== nextProps.serialNo) {
            this.fetchList(1, 50, nextProps);
        }
    }

    fetchList = async(pageNo = this.state.pageNo, pageSize = this.state.pageSize, opt = this.props) => {
        this.setState({
            loading: true,
            list: []
        });
        const { invoiceCode, invoiceNo, invoiceType } = opt;
        const res = await pwyFetch(this.props.queryTripUrl, {
            method: 'post',
            data: {
                all: 2, // 查询所有，非1或空则分页查询
                invoiceCode: invoiceCode,
                invoiceNo: invoiceNo,
                invoiceType: invoiceType,
                orderFlag: '1', // 1、按上车时间争取；2、按上车时间倒序
                pageNo,
                pageSize
            }
        });


        if (res.errcode !== '0000') {
            message.info(res.description);
        }
        this.setState({
            loading: false,
            pageNo,
            pageSize,
            list: res.data || [],
            totalElement: res.totalElement
        });
    }

    componentDidUpdate() {
        if (this.scrollObj) {
            this.scrollObj.refresh();
        }
    }

    renderTimeGet(v) {
        if (!v) {
            return '--';
        }
        const d = moment(v, 'YYYY-MM-DD HH:mm');
        const wk = d.weekday();
        const wkList = ['一', '二', '三', '四', '五', '六', '日'];
        return (
            <span>{d.format('MM-DD HH:mm 周') + wkList[wk]}</span>
        );
    }

    renderAmount(v) {
        return (
            <span style={{ color: '#FF9524' }}>{parseFloat(v).toFixed(2)}</span>
        );
    }

    onMounted = (f, scrollObj) => {
        this.scrollObj = scrollObj;
    }


    render() {
        const { list, loading, pageNo, pageSize, totalElement = 0 } = this.state;
        const { tripOrdersCount = {}, clientHeight } = this.props;
        const { totalAmount = 0.00, totalTrip = 0, applyDate, startTime, endTime } = tripOrdersCount;
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
                align: 'left',
                width: '80',
                render: (v, r, i) => {
                    return pageSize * (pageNo - 1) + (i + 1);
                }
            },
            { title: '车型', dataIndex: 'carType', align: 'left' },
            { title: '上车时间', dataIndex: 'timeGetOn', align: 'left', render: this.renderTimeGet },
            { title: '城市', dataIndex: 'place', align: 'left' },
            { title: '地点', dataIndex: 'stationGetOn', align: 'left' },
            { title: '终点', dataIndex: 'stationGetOff', align: 'left' },
            { title: '里程(公里)', dataIndex: 'distance', align: 'left' },
            { title: '金额', dataIndex: 'payAmount', align: 'left', render: this.renderAmount }
        ];
        return (
            <div className='selectInvoice ddTripList' style={{ width: '98%', margin: '0 auto' }}>
                <div className='countInfo' style={{ textAlign: 'center' }}>
                    <div className='floatLeft'>申请日期：{applyDate || '--'}</div>
                    <span>行程起止日期：{startTime || '--'} — {endTime || '--'}</span>
                    <div className='floatRight'>共{totalTrip}笔行程，合计：{parseFloat(totalAmount).toFixed(2)}</div>
                </div>
                <p style={{ marginBottom: 5 }}>行程列表</p>
                {
                    clientHeight ? (
                        <ScrollWapper height={clientHeight - 130} onMounted={this.onMounted}>
                            <Table
                                loading={loading}
                                columns={columns}
                                dataSource={list}
                                pagination={false}
                                rowKey='invoiceNo'
                            />
                        </ScrollWapper>
                    ) : (
                        <Table
                            loading={loading}
                            columns={columns}
                            dataSource={list}
                            pagination={false}
                            rowKey='invoiceNo'
                        />
                    )
                }

                <div className='tblBottom clearfix' style={{ marginTop: 10 }}>
                    <Pagination
                        size='small'
                        current={pageNo}
                        total={parseInt(totalElement)}
                        showSizeChanger={true}
                        showQuickJumper={true}
                        className='floatRight'
                        pageSize={pageSize}
                        pageSizeOptions={['10', '30', '50']}
                        onShowSizeChange={(c, size) => this.fetchList(c, size)}
                        onChange={(c, size) => this.fetchList(c, size)}
                    />
                </div>
            </div>
        );
    }
}

DDInvoiceInfo.propTypes = {
    tripOrdersCount: PropTypes.object.isRequired,
    serialNo: PropTypes.string.isRequired,
    clientHeight: PropTypes.number,
    queryTripUrl: PropTypes.string
};

export default DDInvoiceInfo;
import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, Table, message } from 'antd';

class ShowRelateBill extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            pageNo: 1,
            pageSize: 10,
            totalElement: 0,
            loading: true,
            listData: []
        };
    }

    componentDidMount = async() => {
        this._isMounted = true;
        this.freshList(this.props.serialNo);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this._isMounted && nextProps.serialNo && nextProps.serialNo !== this.props.serialNo) {
            this.freshList(nextProps.serialNo);
        }
    }

    freshList = async(serialNo, pageNo = this.state.pageNo, pageSize = this.state.pageSize) => {
        this.setState({
            loading: true
        });
        const res = await this.props.onQueryRelateBill({ serialNo, pageNo, pageSize });
        if (res.errcode === '0000') {
            this.setState({
                loading: false,
                listData: res.data || [],
                pageNo,
                pageSize,
                totalElement: res.totalElement
            });
        } else {
            message.info(res.description);
            this.setState({
                loading: false
            });
        }
    }

    render() {
        const colums = [
            { title: '序号', key: 'indexNum', align: 'left', render: (v, r, i) => { return i + 1; } },
            { title: '报销单号', dataIndex: 'expenseNum', align: 'left', render: (v) => { return v || '--'; } },
            { title: '报销人', dataIndex: 'expenseName', align: 'left', render: (v) => { return v || '--'; } },
            { title: '报销时间', dataIndex: 'expenseTime', align: 'left', render: (v) => { return v || '--'; } },
            { title: '报销事由', dataIndex: 'remark', align: 'left', render: (v) => { return v || '--'; } }
        ];

        const { serialNo } = this.props;
        const { listData, loading, pageNo, pageSize, totalElement } = this.state;
        return (
            <div className='showRelate'>
                <Table
                    loading={loading}
                    columns={colums}
                    dataSource={listData}
                    pagination={false}
                    rowKey='id'
                />
                <div className='tblBottom'>                    
                    <Pagination
                        size='small'
                        current={pageNo}
                        total={totalElement}
                        showSizeChanger
                        showQuickJumper
                        className='floatRight'
                        pageSize={pageSize}
                        pageSizeOptions={['10', '30', '50']}
                        onShowSizeChange={(c, size) => this.freshList(serialNo, c, size)}
                        onChange={(c, size) => this.freshList(serialNo, c, size)}
                    />
                </div>
            </div>
        );
    }
}


ShowRelateBill.propTypes = {    
    serialNo: PropTypes.string.isRequired,
    onQueryRelateBill: PropTypes.func.isRequired
};
export default ShowRelateBill;
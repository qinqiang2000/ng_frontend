import React from 'react';
import PropTypes from 'prop-types';
import { pwyFetch } from '@piaozone.com/utils';
import { Pagination, Table, message } from 'antd';

class PushAccountList extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            pageNo: 1,
            pageSize: 10,
            totalElement: 0,
            loading: false
        };
    }

    componentDidMount = async() => {
        this._isMounted = true;
        //this.freshList(this.props.serialNo);  后台没做接口
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    freshList = async(pageNo = this.state.pageNo, pageSize = this.state.pageSize) => {
        this.setState({
            loading: true
        });
        const res = await pwyFetch(this.props.queryPushAccountLogsUrl, {
            method: 'post',
            data: { pageNo, pageSize }
        });
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
            { title: '推送时间', dataIndex: 'pushTime', align: 'left', render: (v) => { return v || '--'; } },
            { title: '企业租户', dataIndex: 'tenantName', align: 'left', render: (v) => { return v || '--'; } },
            { title: '企业组织', dataIndex: 'companyName', align: 'left', render: (v) => { return v || '--'; } }
        ];

        const { loading, pageNo, pageSize } = this.state;
        const { listData = [] } = this.props;
        const list = listData.slice((pageNo - 1) * pageSize, pageNo * pageSize);
        return (
            <div className='showRelate'>
                <Table
                    loading={loading}
                    columns={colums}
                    dataSource={list}
                    pagination={false}
                    rowKey='id'
                />
                <div className='tblBottom'>
                    <Pagination
                        size='small'
                        current={pageNo}
                        total={listData.length}
                        showSizeChanger
                        showQuickJumper
                        className='floatRight'
                        pageSize={pageSize}
                        pageSizeOptions={['10', '30', '50']}
                        onShowSizeChange={(c, size) => this.setState({ pageNo: c, pageSize: size })}
                        onChange={(c, size) => this.setState({ pageNo: c, pageSize: size })}
                        // onShowSizeChange={(c, size) => this.freshList(c, size)}
                        // onChange={(c, size) => this.freshList(c, size)}
                    />
                </div>
            </div>
        );
    }
}


PushAccountList.propTypes = {
    listData: PropTypes.array.isRequired,
    queryPushAccountLogsUrl: PropTypes.string.isRequired
};
export default PushAccountList;
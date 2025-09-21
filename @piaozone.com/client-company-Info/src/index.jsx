import React from 'react';
import { Table, Input, message, Pagination, Button } from 'antd';
import { kdRequest } from '@piaozone.com/utils';
import './common/style.less';
import PropTypes from 'prop-types';
const Search = Input.Search;

class ClientCompanyInfo extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            selectedRows: [],
            keyName: '',
            pageNo: 1,
            pageSize: 10,
            listData: []
        };
    }

    componentDidMount() {
        this.refreshList();
    }

    componentWillReceiveProps(nextProps) {
        const { openCom } = nextProps;
        if (!openCom) {
            this.setState({
                selectedRows: [],
                selectedRowKeys: []
            });
        }
    }

    refreshList = async(pageNo = this.state.pageNo, pageSize = this.state.pageSize, keyName) => {
        message.loading('查询中');
        const res = await kdRequest({
            url: this.props.queryCompanyAuthor,
            data: {
                pageNo,
                pageSize,
                clientId: '',
                revenueNumber: '',
                queryParam: keyName || ''
            },
            method: 'POST'
        });
        setTimeout(() => {
            message.destroy();
        }, 500);
        if (res.errcode == '0000') {
            if (res.data && res.data.length > 0) {
                this.setState({
                    listData: res.data,
                    companyConfig: true,
                    totalElement: res.totalElement
                });
            } else {
                this.setState({
                    listData: [],
                    companyConfig: true,
                    totalElement: 0
                });
                message.error('未查询到相关组织');
            }
        } else {
            message.error(res.description);
        }
    }

    saveCompanyList = () => {
        const { selectedRows } = this.state;
        if (selectedRows.length > 1) {
            message.info('仅允许选择一条数据！');
        } else {
            this.props.onNext(selectedRows[0]);
        }
    }

    onCancel = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRows: []
        });
        this.props.onCancel();
    }

    render() {
        const { selectedRows, selectedRowKeys, keyName, listData, pageNo, pageSize, totalElement } = this.state;
        const tableColumns = [
            {
                title: '税号',
                dataIndex: 'revenueNumber',
                key: 'revenueNumber',
                align: 'center'
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                align: 'left'
            },
            {
                title: '发票云Clientid',
                dataIndex: 'clientId',
                key: 'clientid',
                align: 'center',
                render: (v) => {
                    const len = v.length;
                    const start = v.substring(0, 5);
                    const end = v.substring(len - 5);
                    return start + '**********' + end;
                }
            }
        ];
        const tableProps = {
            key: 'table',
            rowKey: 'companyId',
            columns: tableColumns,
            dataSource: listData,
            pagination: false
        };
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys,
                    selectedRows
                });
            }
        };
        return (
            <div className='configCompanyInfo'>
                <div>
                    <div className='row' style={{ marginBottom: 20 }}>
                        <span>请单选一个需要配置的企业</span>
                        <div className='inputRow'>
                            <Search
                                placeholder='搜索企业名称和税号'
                                value={keyName}
                                onSearch={(val) => { this.refreshList(1, 10, val); }}
                                onChange={(e) => { this.setState({ keyName: e.target.value.trim() }); }}
                            />
                        </div>
                    </div>
                    <Table {...tableProps} rowSelection={rowSelection} />
                    <div className='tableBottom'>
                        <div className='floatRight'>
                            共<span className='count'> {totalElement} </span>条数据
                        </div>
                        <Pagination
                            size='small'
                            current={pageNo}
                            total={totalElement}
                            showSizeChanger
                            className='switchPages'
                            pageSize={pageSize}
                            pageSizeOptions={['10', '30', '50']}
                            onChange={(e, size) => { this.setState({ pageNo: e, pageSize: size, selectedRowKeys: [] }); this.refreshList(e, size); }}
                            onShowSizeChange={(e, size) => { this.setState({ pageNo: e, pageSize: size, selectedRowKeys: [] }); this.refreshList(e, size); }}
                        />
                    </div>
                    <div className='btn' style={{ padding: '10px 0', textAlign: 'center' }}>
                        <Button
                            type='primary'
                            className='newAddBtn'
                            onClick={this.onCancel}
                            style={{ marginRight: 15 }}
                        >
                            取消
                        </Button>
                        <Button
                            type='primary'
                            className='newAddBtn'
                            onClick={this.saveCompanyList}
                            disabled={selectedRows.length === 0}
                        >
                            下一步
                        </Button>
                    </div>
                </div>
            </div>
        );
    };
}

ClientCompanyInfo.propTypes = {
    onNext: PropTypes.func,
    onCancel: PropTypes.func,
    onSaveInfo: PropTypes.func,
    queryCompanyAuthor: PropTypes.string.isRequired,
    openCom: PropTypes.bool
};

export default ClientCompanyInfo;
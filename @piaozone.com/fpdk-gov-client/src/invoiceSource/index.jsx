import React from 'react';
import { message, Input, Table, Button, Pagination, Modal } from 'antd';
import { pwyFetch } from '@piaozone.com/utils';
import PropTypes from 'prop-types';
import './style.less';
const Search = Input.Search;
class InvoiceSource extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            searchState: false,
            loading: false,
            scrollWidth: 1500,
            pageNo: 1,
            pageSize: 10,
            listData: [],
            inputValue: ''
        };
    }

    freshList = async(pageNo = this.state.pageNo, pageSize = this.state.pageSize) => {
        message.loading('加载中...', 0);
        const res = await pwyFetch(this.props.getListUrl, {
            method: 'post',
            data: {
                pageNo,
                pageSize,
                value: this.state.inputValue
            }
        });
        message.destroy();
        if (res.errcode == '0000') {
            if (res.data && res.data.length > 0) {
                const list = res.data.map((item) => {
                    return {
                        name: item
                    };
                });
                this.setState({
                    listData: list,
                    pageNo: parseInt(pageNo),
                    totalElement: res.totalElement
                });
            } else {
                this.setState({
                    listData: [],
                    totalElement: 0
                });
            }
        } else {
            message.info(res.description);
        }
    }

    onRowClick = (opt) => {
        const { name } = opt;
        this.setState({
            searchState: false,
            inputValue: name
        });
        this.props.onOk(name);
    }

    render() {
        const { loading, listData, pageNo, pageSize, inputValue, searchState, totalElement } = this.state;
        const { labelName } = this.props;
        const tableColumns = [
            {
                title: '名称',
                dataIndex: 'name',
                align: 'left'
            }
        ];
        const tableProps = {
            key: 'index',
            loading,
            columns: tableColumns,
            dataSource: listData,
            pagination: false,
            rowKey: 'serialNo'
        };
        return (
            <div className='searchItem'>
                <label>{labelName}：</label>
                <Search
                    type='text'
                    style={{ width: 220 }}
                    value={inputValue}
                    placeholder={this.props.placeHolderTxt}
                    maxLength={100}
                    onChange={(e) => {
                        this.setState({
                            inputValue: e.target.value.trim()
                        });
                        this.props.onOk(e.target.value.trim());
                    }}
                    onSearch={(v) => { this.setState({ searchState: true }); this.freshList(pageNo, pageSize); }}
                />
                <Modal
                    visible={searchState}
                    width={1200}
                    title={this.props.title}
                    onCancel={() => { this.setState({ searchState: false }); }}
                    footer={false}
                >
                    <div className='invoiceSource'>
                        <div className='searchCont'>
                            <div className='row'>
                                <Input
                                    style={{ width: 220, marginRight: 10 }}
                                    type='text'
                                    value={inputValue}
                                    placeholder={this.props.placeHolderTxt}
                                    onChange={(e) => {
                                        this.setState({ inputValue: e.target.value.trim() });
                                        this.props.onOk(e.target.value.trim());
                                    }}
                                />
                                <Button type='primary' onClick={() => { this.freshList(1, pageSize); }}>搜索</Button>
                            </div>
                        </div>
                        <Table onRowClick={this.onRowClick} {...tableProps} />
                        <div className='tblBottom'>
                            <Pagination
                                size='small'
                                current={pageNo}
                                total={totalElement}
                                showSizeChanger
                                className='floatRight'
                                pageSize={pageSize}
                                pageSizeOptions={['10', '30', '50']}
                                onShowSizeChange={(c, size) => this.freshList(c, size)}
                                onChange={(c, size) => this.freshList(c, size)}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };
}

InvoiceSource.propTypes = {
    placeHolderTxt: PropTypes.string,
    title: PropTypes.string,
    labelName: PropTypes.string,
    keyName: PropTypes.object,
    getListUrl: PropTypes.string,
    onOk: PropTypes.func
};

export default InvoiceSource;
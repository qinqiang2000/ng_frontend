import React from 'react';
import { Button, Table, DatePicker, message, Input, Select } from 'antd';
import moment from 'moment';
import { INPUT_INVOICE_TYPES, inputFullInvoiceDict } from '../commons/constants';
import { MultiSelect } from '@piaozone.com/multi-select';
import PropTypes from 'prop-types';


const { RangePicker, MonthPicker } = DatePicker;
const { Column } = Table;
const { Option } = Select;

// 勾选状态
const ALL_ISFAUTHENTICATE = [
    { text: '未勾选', value: 0 },
    { text: '预勾选', value: 5 },
    { text: '已勾选', value: 1 },
    { text: '已认证', value: 2 }
];
// 抵扣状态
const ALL_DEDUCTIONPURPOSE = [
    { text: '已抵扣', value: '1' },
    { text: '不抵扣', value: '2' },
    { text: '未抵扣', value: '0' }
];

class Statics extends React.Component {
    constructor(props) {
        super(...arguments);
        this._isMounted = false;
        this.state = {
            listData: [],
            loading: false,
            searchOpt: {
                collectTime: [moment().startOf('month'), moment()],
                invoiceTime: null,
                invoiceTypes: INPUT_INVOICE_TYPES.map(item => {
                    return {
                        label: item.text,
                        value: item.value,
                        checked: true
                    };
                }),
                collectUser: '', //采集人电话
                taxPeriod: '', // 勾选税期
                isFauthenticate: '', // 0未勾选、5预勾选、1已勾选、2已认证 null全部
                deductionPurpose: '' // 1抵扣 2不抵扣 “”（空字符串）未抵扣 null全部
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.query();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getSearchOpt = (searchOpt) => {
        const { invoiceTime, collectTime, ...otherOpt } = searchOpt;
        const invoiceTimeStart = invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '';
        const invoiceTimeEnd = invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '';
        const collectTimeStart = collectTime && collectTime[0] ? collectTime[0].format('YYYY-MM-DD') : '';
        const collectTimeEnd = collectTime && collectTime[1] ? collectTime[1].format('YYYY-MM-DD') : '';
        if (collectTimeStart === '' && invoiceTimeStart === '') {
            message.info('采集日期，开票日期不能同时为空');
            return;
        }
        if (collectTime && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
            message.info('数据过多, 采集日期跨度不能大于31天');
            return false;
        }
        if (invoiceTime && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
            message.info('数据过多, 开票日期跨度不能大于31天');
            return false;
        }
        const invoiceTypes = searchOpt.invoiceTypes.filter((item) => {
            return item.checked;
        }).map((item) => {
            return item.value;
        }).join(',');

        return {
            ...otherOpt,
            invoiceTypes,
            invoiceTimeStart,
            invoiceTimeEnd,
            collectTimeStart,
            collectTimeEnd
        };
    }

    exportExcel = async() => {
        this.props.onExportCount(this.getSearchOpt(this.state.searchOpt));
    }

    query = async() => {
        const opt = this.getSearchOpt(this.state.searchOpt);
        if (!opt) {
            return;
        }
        this.setState({
            loading: true
        });
        const res = await this.props.onQueryStatics(opt);
        this.setState({
            loading: false
        });
        if (res.errcode === '0000') {
            const resData = res.data || [];
            this.setState({
                listData: resData
            });
        } else {
            message.info(res.description);
        }
    }

    selectInvoice = (i) => {
        const searchOpt = this.state.searchOpt;
        this.setState({
            searchOpt: {
                ...this.state.searchOpt,
                invoiceTypes: searchOpt.invoiceTypes.map((item, j) => {
                    if (i === j) {
                        return {
                            ...item,
                            checked: !item.checked
                        };
                    } else {
                        return item;
                    }
                })
            }
        });
    }

    onCheckAllChange = (flag) => {
        const searchOpt = this.state.searchOpt;
        this.setState({
            searchOpt: {
                ...this.state.searchOpt,
                invoiceTypes: searchOpt.invoiceTypes.map((item, j) => {
                    return {
                        ...item,
                        checked: !flag
                    };
                })
            }
        });
    }

    render() {
        const { searchOpt, listData, loading } = this.state;
        return (
            <div className='topBtns statics' style={{ minHeight: 350 }}>
                <div className='row'>
                    <div className='searchItem inlineBlock'>
                        <label>采集日期：</label>
                        <RangePicker
                            disabledDate={(current) => {
                                return current > moment();
                            }}
                            className='rangeDate'
                            style={{ width: 220 }}
                            onChange={(d) => { this.setState({ searchOpt: { ...searchOpt, collectTime: d } }); }}
                            value={searchOpt.collectTime}
                            allowClear={true}
                        />
                    </div>

                    <div className='searchItem inlineBlock'>
                        <label>开票日期：</label>
                        <RangePicker
                            disabledDate={(current) => {
                                return current > moment();
                            }}
                            className='rangeDate' style={{ width: 220 }}
                            onChange={(d) => { this.setState({ searchOpt: { ...searchOpt, invoiceTime: d } }); }}
                            value={searchOpt.invoiceTime}
                            allowClear={true}
                        />
                    </div>
                    <div className='searchItem inlineBlock'>
                        <label>抵扣状态：</label>
                        <Select
                            style={{ width: 220 }}
                            value={searchOpt.deductionPurpose}
                            onChange={(v) => this.setState({ searchOpt: { ...searchOpt, deductionPurpose: v } })}
                        >
                            <Option value=''>全部</Option>
                            {
                                ALL_DEDUCTIONPURPOSE.map(item => {
                                    return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                })
                            }
                        </Select>
                    </div>
                    <div className='searchItem inlineBlock' style={{ verticalAlign: 'top' }}>
                        <label>发票种类：</label>
                        <MultiSelect
                            list={searchOpt.invoiceTypes}
                            style={{ width: 321 }}
                            listBoxStyle={{ width: 425 }}
                            listItemStyle={{ width: 120 }}
                            placeholder='请选择发票种类'
                            onCheckChange={this.selectInvoice}
                            onCheckAllChange={this.onCheckAllChange}
                        />
                    </div>
                </div>
                <div className='row'>
                    <div className='searchItem inlineBlock'>
                        <label>采集人手机号：</label>
                        <Input
                            type='text'
                            style={{ width: 220 }}
                            value={searchOpt.collectUser}
                            maxLength='11'
                            onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, collectUser: e.target.value.replace(/[^0-9]/g, '') } }); }}
                        />
                    </div>
                    <div className='searchItem inlineBlock'>
                        <label>勾选状态：</label>
                        <Select
                            style={{ width: 220 }}
                            value={searchOpt.isFauthenticate}
                            onChange={(v) => this.setState({ searchOpt: { ...searchOpt, isFauthenticate: v } })}
                        >
                            <Option value=''>全部</Option>
                            {
                                ALL_ISFAUTHENTICATE.map(item => {
                                    return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                })
                            }
                        </Select>
                    </div>
                    <div className='searchItem inlineBlock'>
                        <label>勾选税期：</label>
                        <MonthPicker
                            value={searchOpt.taxPeriod && moment(searchOpt.taxPeriod, 'YYYYMM')}
                            placeholder='请选择勾选税期'
                            disabled={!(searchOpt.isFauthenticate === 1 || searchOpt.isFauthenticate === 2)}
                            format='YYYYMM'
                            onChange={(e) => { this.setState({ searchOpt: { ...searchOpt, taxPeriod: e ? e.format('YYYYMM') : '' } }); }}
                            disabledDate={(c) => {
                                return c > moment();
                            }}
                            style={{ width: 220 }}
                        />
                    </div>
                    <Button type='primary' style={{ marginLeft: 15 }} onClick={() => this.query()}>查询</Button>
                    <Button loading={this.props.exportStaticIng} style={{ marginLeft: 15 }} onClick={this.exportExcel}>导出EXCEL</Button>
                </div>
                <Table dataSource={listData} pagination={false} rowKey='invoiceType' loading={loading} bordered={true}>
                    <Column
                        title='序号'
                        key='xh'
                        align='left'
                        render={(v, r, i) => {
                            return i + 1;
                        }}
                    />

                    <Column
                        title='发票种类'
                        key='invoiceType'
                        dataIndex='invoiceType'
                        align='left'
                        render={(v, r) => {
                            if (v === 0) {
                                return '合计';
                            } else if (v !== 11) {
                                return inputFullInvoiceDict['k' + v];
                            } else {
                                return '其它发票';
                            }
                        }}
                    />

                    <Column
                        title='发票金额（含税）'
                        key='totalAmount'
                        dataIndex='totalAmount'
                        align='left'
                        render={(v, r) => {
                            const num = parseFloat(v);
                            if (isNaN(num)) {
                                return '0.00';
                            } else {
                                return num.toFixed(2);
                            }
                        }}
                    />

                    <Column
                        title='进项税额'
                        key='jxse'
                        align='left'
                        dataIndex='taxAmount'
                        render={(v, r) => {
                            const num = parseFloat(v);
                            if (isNaN(num)) {
                                return '0.00';
                            } else {
                                return num.toFixed(2);
                            }
                        }}
                    />

                    <Column
                        title='票据份数'
                        key='fs'
                        align='left'
                        dataIndex='totalCount'
                        render={(v, r) => {
                            return v;
                        }}
                    />
                </Table>
            </div>
        );
    }
}



Statics.propTypes = {
    onQueryStatics: PropTypes.func.isRequired,
    onExportCount: PropTypes.func.isRequired,
    exportStaticIng: PropTypes.bool
};

export default Statics;
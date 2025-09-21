import React from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Input, Select, Tooltip } from 'antd';
import moment from 'moment';
import { INPUT_INVOICE_TYPES, invoiceStatus } from '../../commons/constants';

const invoice_expense_status = [
    { text: '未用', value: 1 },
    { text: '在用', value: 30 },
    { text: '已用', value: 60 }
];

const { Option } = Select;
const { RangePicker } = DatePicker;
const isPushToAccount_status = [
    { text: '是', value: 1 },
    { text: '否', value: 2 }
];

const AppletSearch = function({ searchOpt, isAddedTax, onChangeSearch, onSearch, emptyClick }) {
    return (
        <div className='topBtns'>
            <div className='row minHeight' style={{ maxWidth: 1280, display: 'inline-block' }}>
                <div className='searchItem inlineBlock'>
                    <label>发票种类：</label>
                    <Select
                        value={searchOpt.invoiceType}
                        style={{ width: 220 }}
                        onChange={(v) => {
                            onChangeSearch({
                                searchOpt: {
                                    ...searchOpt,
                                    invoiceType: v
                                }
                            });
                        }}
                    >
                        <Option value=''>全部</Option>
                        {
                            INPUT_INVOICE_TYPES.map((item) => {
                                if ([28, 29, 30].indexOf(item.value) == '-1') {
                                    return (
                                        <Option value={item.value} key={item.value}>{item.text}</Option>
                                    );
                                }
                            })
                        }
                    </Select>
                </div>
                <div className='searchItem inlineBlock'>
                    <label>采集日期：</label>
                    <RangePicker
                        disabledDate={(current) => { return current > moment(); }}
                        className='rangeDate' style={{ width: 220 }}
                        onChange={(d) => onChangeSearch({ searchOpt: { ...searchOpt, collectTime: d } })}
                        value={searchOpt.collectTime}
                        allowClear={true}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>开票日期：</label>
                    <RangePicker
                        disabledDate={(current) => { return current > moment(); }}
                        className='rangeDate' style={{ width: 220 }}
                        onChange={(d) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceTime: d } })}
                        value={searchOpt.invoiceTime}
                        allowClear={true}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>发票代码：</label>
                    <Input
                        placeholder='输入发票代码'
                        type='text'
                        maxLength={12}
                        className='searchInput' style={{ width: 220 }}
                        onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceCode: e.target.value } })}
                        value={searchOpt.invoiceCode}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>发票号码：</label>
                    <Input
                        maxLength={20}
                        placeholder='输入发票号码'
                        type='text'
                        className='searchInput' style={{ width: 220 }}
                        onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceNo: e.target.value } })}
                        value={searchOpt.invoiceNo}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>发票是否查验：</label>
                    <div style={{ display: 'inline-block', width: 220 }}>
                        <span
                            className={searchOpt.isCheck == '1' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, isCheck: '1' } }); }}
                        >
                            是
                        </span>
                        <span
                            className={searchOpt.isCheck == '2' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, isCheck: '2' } }); }}
                        >
                            否
                        </span>
                    </div>
                </div>

                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>发票状态：</label>
                    <Select
                        style={{ width: 220 }}
                        value={searchOpt.invoiceStatus}
                        onChange={(v) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceStatus: v } })}
                    >
                        <Option value=''>全部</Option>
                        {
                            invoiceStatus.map((item, index) => {
                                return <Option value={item.value} key={item.value}>{item.text}</Option>;
                            })
                        }
                    </Select>
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>销方名称：</label>
                    <Input
                        placeholder='请输入企业名称'
                        type='text'
                        className='searchInput' style={{ width: 220 }}
                        onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, salerName: e.target.value } })}
                        value={searchOpt.salerName}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>发票使用状态：</label>
                    <Select
                        style={{ width: 220 }}
                        value={searchOpt.expendStatus}
                        onChange={(v) => onChangeSearch({
                            searchOpt: {
                                ...searchOpt,
                                expendStatus: v
                            }
                        })}
                    >
                        <Option value=''>全部</Option>
                        {
                            invoice_expense_status.map((item) => {
                                return <Option value={item.value} key={item.value}>{item.text}</Option>;
                            })
                        }
                    </Select>
                </div>
                <div className='searchItem inlineBlock'>
                    <label>推送到台账：</label>
                    <Select
                        style={{ width: 220 }}
                        value={searchOpt.isPushToAccount}
                        onChange={(v) => onChangeSearch({
                            searchOpt: {
                                ...searchOpt,
                                isPushToAccount: v
                            }
                        })}
                    >
                        <Option value=''>全部</Option>
                        {
                            isPushToAccount_status.map((item) => {
                                return <Option value={item.value} key={item.value}>{item.text}</Option>;
                            })
                        }
                    </Select>
                </div>
            </div>
            <div style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: 28 }}>
                <Tooltip title='采集日期过滤查询不到发票时，建议使用开票日期过滤查询'>
                    <Button type='primary' onClick={onSearch}>查询</Button>
                </Tooltip>
                <Button className='btn' icon='reload' onClick={emptyClick} style={{ borderStyle: 'none', marginLeft: 15 }}>清空</Button>
            </div>
        </div>
    );
};

AppletSearch.propTypes = {
    searchOpt: PropTypes.object,
    isAddedTax: PropTypes.bool,
    onChangeSearch: PropTypes.func,
    onSearch: PropTypes.func,
    emptyClick: PropTypes.func
};

export default AppletSearch;
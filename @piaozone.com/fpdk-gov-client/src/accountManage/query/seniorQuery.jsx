import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Input, Select, Tooltip, Icon } from 'antd';
import moment from 'moment';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import { INPUT_INVOICE_TYPES, invoice_expense_status, invoiceStatus } from '../../commons/constants';
import InvoiceSource from '../../invoiceSource';
const { Option } = Select;
const { RangePicker, MonthPicker } = DatePicker;
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
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;
//采集日期 开票日期   审核通过时间  发票使用状态 采集人手机号 采集人名称 系统来源  单据审核人
const SeniorQuery = function({ userSource, getInvoiceSourceUrl, gitReviewerUrl, onSearch }) {
    // 分众添加的搜索条件
    const [showMore, setShowMore] = useState(false);
    const [searchOpt, setSearchOpt] = useState({
        expenseNum: '',
        collectTime: [moment().startOf('month'), moment()],
        expendTime: [null, null],
        invoiceTime: [null, null],
        authInvoiceDate: [null, null],
        invoiceStatus: '',
        invoiceCode: '',
        invoiceNo: '',
        salerName: '',
        equalNameValue: '',
        signOptionValue: '',
        expendStatus: '',
        isFauthenticate: '', // 0未勾选、5预勾选、1已勾选、2已认证 null全部
        collectUser: '', //采集人电话
        collectorName: '', //采集人名称
        invoiceType: '', //发票类型
        deductionPurpose: '', // 1抵扣 2不抵扣 “”（空字符串）未抵扣 null全部
        isCheck: 1 //1：是， 2： 否
    });
    const isAddedTax = addedInvoiceTypes.indexOf(searchOpt.invoiceType) > -1 || searchOpt.invoiceType === '';
    const otherItems = (
        <>
            <div className='searchItem inlineBlock'>
                <InvoiceSource
                    placeHolderTxt='请输入发票的来源业务系统'
                    title='来源系统列表'
                    labelName='系统来源'
                    name='expenseSystemSource'
                    onOk={(val) => { setSearchOpt({ ...searchOpt, expenseSystemSource: val }); }}
                    getListUrl={getInvoiceSourceUrl}
                />
            </div>
            <div className='searchItem inlineBlock'>
                <InvoiceSource
                    placeHolderTxt='请输入发票的审核人'
                    title='系统审核人列表'
                    labelName='单据审核人'
                    name='expenseReviewer'
                    onOk={(val) => { setSearchOpt({ ...searchOpt, expenseReviewer: val }); }}
                    getListUrl={gitReviewerUrl}
                />
            </div>
        </>
    );

    const emptyClick = () => {
        console.log('清空');
        setSearchOpt({
            expenseNum: '',
            collectTime: [moment().startOf('month'), moment()],
            expendTime: [null, null],
            invoiceTime: [null, null],
            authInvoiceDate: [null, null],
            invoiceStatus: '',
            invoiceCode: '',
            invoiceNo: '',
            salerName: '',
            equalNameValue: '',
            signOptionValue: '',
            expendStatus: '',
            isFauthenticate: '', // 0未勾选、5预勾选、1已勾选、2已认证 null全部
            collectUser: '', //采集人电话
            collectorName: '', //采集人名称
            invoiceType: '', //发票类型
            deductionPurpose: '', // 1抵扣 2不抵扣 “”（空字符串）未抵扣 null全部
            isCheck: 1 //1：是， 2： 否
        });
    };

    const searchClick = () => {
        const result = {
            searchOpt: {
                ...searchOpt,
                searchType: 'senior'
            },
            searchType: 'senior'
        };
        onSearch(result);
    };

    return (
        <div className='topBtns'>
            <div className={!showMore ? 'row minHeight' : 'row'} style={{ maxWidth: 1300, display: 'inline-block' }}>
                <div className='searchItem inlineBlock'>
                    <label>发票种类：</label>
                    <Select
                        value={searchOpt.invoiceType}
                        style={{ width: 220 }}
                        onChange={(v) => {
                            setSearchOpt({
                                ...searchOpt,
                                invoiceType: v
                            });
                        }}
                    >
                        <Option value=''>全部</Option>
                        {
                            INPUT_INVOICE_TYPES.map((item) => {
                                return (
                                    <Option value={item.value} key={item.value}>{item.text}</Option>
                                );
                            })
                        }
                    </Select>
                </div>
                <div className='searchItem inlineBlock'>
                    <label>采集日期：</label>
                    <RangePicker
                        disabledDate={(current) => { return current > moment(); }}
                        className='rangeDate' style={{ width: 220 }}
                        onChange={(d) => setSearchOpt({ ...searchOpt, collectTime: d })}
                        value={searchOpt.collectTime}
                        allowClear={true}
                    />

                </div>

                <div className='searchItem inlineBlock'>
                    <label>开票日期：</label>
                    <RangePicker
                        disabledDate={(current) => { return current > moment(); }}
                        className='rangeDate' style={{ width: 220 }}
                        onChange={(d) => setSearchOpt({ ...searchOpt, invoiceTime: d })}
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
                        onChange={(e) => setSearchOpt({ ...searchOpt, invoiceCode: e.target.value })}
                        value={searchOpt.invoiceCode}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>发票号码：</label>
                    <Input
                        maxLength={10}
                        placeholder='输入发票号码'
                        type='text'
                        className='searchInput' style={{ width: 220 }}
                        onChange={(e) => setSearchOpt({ ...searchOpt, invoiceNo: e.target.value })}
                        value={searchOpt.invoiceNo}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>发票是否查验：</label>
                    <div style={{ display: 'inline-block', width: 220 }}>
                        <span
                            className={searchOpt.isCheck == '1' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { setSearchOpt({ ...searchOpt, isCheck: '1' }); }}
                        >
                            是
                        </span>
                        <span
                            className={searchOpt.isCheck == '2' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { setSearchOpt({ ...searchOpt, isCheck: '2' }); }}
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
                        onChange={(v) => setSearchOpt({ ...searchOpt, invoiceStatus: v })}
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
                        onChange={(e) => setSearchOpt({ ...searchOpt, salerName: e.target.value })}
                        value={searchOpt.salerName}
                    />
                </div>
                {
                    userSource != '8' ? (
                        <div className='searchItem inlineBlock'>
                            <label>发票使用状态：</label>
                            <Select
                                style={{ width: 220 }}
                                value={searchOpt.expendStatus}
                                onChange={(v) => setSearchOpt({
                                    ...searchOpt,
                                    expendStatus: v,
                                    accountDate: v === 65 || v === '' ? searchOpt.accountDate : null
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
                    ) : null
                }
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>业务单号：</label>
                    <Input
                        placeholder='请输入业务单号'
                        type='text'
                        className='searchInput' style={{ width: 220 }}
                        onChange={(e) => setSearchOpt({ ...searchOpt, expenseNum: e.target.value })}
                        value={searchOpt.expenseNum}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>审核通过时间：</label>
                    <RangePicker
                        disabledDate={(current) => { return current > moment(); }}
                        className='rangeDate' style={{ width: 220 }}
                        onChange={(d) => setSearchOpt({ ...searchOpt, expendTime: d })}
                        value={searchOpt.expendTime}
                        allowClear={true}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>入账属期：</label>
                    <MonthPicker
                        value={searchOpt.accountDate}
                        placeholder='请选择入账属期'
                        disabled={searchOpt.expendStatus !== 65 && searchOpt.expendStatus !== ''}
                        format='YYYYMM'
                        onChange={(e) => { setSearchOpt({ ...searchOpt, accountDate: e }); }}
                        disabledDate={(c) => {
                            return c.format('X') > moment().endOf('month').format('X');
                        }}
                        style={{ width: 220 }}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>采集人手机号：</label>
                    <Input
                        type='text'
                        style={{ width: 220 }}
                        value={searchOpt.collectUser}
                        maxLength={11}
                        onChange={(e) => {
                            setSearchOpt({ ...searchOpt, collectUser: e.target.value.replace(/[^0-9]/g, '') });
                        }}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>采集人名称：</label>
                    <Input
                        type='text'
                        style={{ width: 220 }}
                        value={searchOpt.collectorName}
                        maxLength={11}
                        onChange={(e) => { setSearchOpt({ ...searchOpt, collectorName: e.target.value }); }}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>勾选状态：</label>
                    <Select
                        style={{ width: 220 }}
                        value={searchOpt.isFauthenticate}
                        onChange={(v) => setSearchOpt({ ...searchOpt, isFauthenticate: v })}
                    >
                        <Option value=''>全部</Option>
                        {
                            ALL_ISFAUTHENTICATE.map(item => {
                                return <Option value={item.value} key={item.value}>{item.text}</Option>;
                            })
                        }
                    </Select>
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>认证日期：</label>
                    <RangePicker
                        disabled={searchOpt.isFauthenticate !== 2}
                        disabledDate={(current) => { return current > moment(); }}
                        className='rangeDate'
                        style={{ width: 220 }}
                        onChange={(v) => setSearchOpt({ ...searchOpt, authInvoiceDate: v })}
                        value={searchOpt.authInvoiceDate}
                    />
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label>纸票是否签收：</label>
                    <div style={{ display: 'inline-block' }}>
                        <span
                            className={searchOpt.signOptionValue == '' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { setSearchOpt({ ...searchOpt, signOptionValue: '' }); }}
                        >
                            全部
                        </span>
                        <span
                            className={searchOpt.signOptionValue == '1' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { setSearchOpt({ ...searchOpt, signOptionValue: '1' }); }}
                        >
                            是
                        </span>
                        <span
                            className={searchOpt.signOptionValue == '2' ? 'active checkItem' : 'checkItem'}
                            onClick={() => { setSearchOpt({ ...searchOpt, signOptionValue: '2' }); }}
                        >
                            否
                        </span>
                    </div>
                </div>
                <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                    <label style={{ width: 156 }}>发票抬头是否一致：</label>
                    <span
                        className={searchOpt.equalNameValue == '' ? 'active checkItem' : 'checkItem'}
                        onClick={() => { setSearchOpt({ ...searchOpt, equalNameValue: '' }); }}
                    >
                        全部
                    </span>
                    <span
                        className={searchOpt.equalNameValue == 1 ? 'active checkItem' : 'checkItem'}
                        onClick={() => { setSearchOpt({ ...searchOpt, equalNameValue: 1 }); }}
                    >
                        是
                    </span>
                    <span
                        className={searchOpt.equalNameValue == 2 ? 'active checkItem' : 'checkItem'}
                        onClick={() => { setSearchOpt({ ...searchOpt, equalNameValue: 2 }); }}
                    >
                        否
                    </span>
                </div>
                {
                    userSource != '8' ? (
                        <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
                            <label>抵扣状态：</label>
                            <Select
                                style={{ width: 220 }}
                                value={searchOpt.deductionPurpose}
                                onChange={(v) => setSearchOpt({ ...searchOpt, deductionPurpose: v })}
                            >
                                <Option value=''>全部</Option>
                                {
                                    ALL_DEDUCTIONPURPOSE.map(item => {
                                        return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                    })
                                }
                            </Select>
                        </div>
                    ) : null
                }
                {otherItems}
            </div>
            <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                <Tooltip title='采集日期过滤查询不到发票时，建议使用开票日期过滤查询'>
                    <Button type='primary' onClick={searchClick} style={{ marginLeft: 30 }}>查询</Button>
                </Tooltip>
                <Button className='btn' icon='reload' onClick={emptyClick} style={{ borderStyle: 'none', marginLeft: 15 }}>清空</Button>
            </div>
            <div className='moreTip' style={{ textAlign: 'center' }}>
                {
                    showMore ? (
                        <span onClick={() => setShowMore(false)}>收起更多<Icon size='small' type='up' /></span>
                    ) : (
                        <span onClick={() => setShowMore(true)}>显示更多搜索条件<Icon size='small' type='down' /></span>
                    )
                }
            </div>
        </div>
    );
};

SeniorQuery.propTypes = {
    userSource: PropTypes.string,
    getInvoiceSourceUrl: PropTypes.func,
    gitReviewerUrl: PropTypes.func,
    onSearch: PropTypes.func
};

export default SeniorQuery;
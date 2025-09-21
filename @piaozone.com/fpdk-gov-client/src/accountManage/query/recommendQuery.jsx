import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Select, Tooltip } from 'antd';
import moment from 'moment';
import InvoiceSource from '../../invoiceSource';
const { Option } = Select;
const { MonthPicker } = DatePicker;
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
const RecommendQuery = function({ onSearch, userSource, getInvoiceSourceUrl, gitReviewerUrl }) {
    const [searchOpt, setSearchOpt] = useState({
        collectDateOfMonth: moment(),
        invoiceDateOfMonth: moment(), //
        isFauthenticate: '', // 勾选状态 0未勾选、5预勾选、1已勾选、2已认证 null全部
        deductionPurpose: '', // 抵扣状态 1抵扣 2不抵扣 “”（空字符串）未抵扣 null全部
        signOptionValue: '', // 是否签收  ""全部 "1"是 "2"否
        expenseSystemSource: '', // 系统来源
        expenseReviewer: '', // 系统审核人
        equalsBuyerName: '', // 抬头一致
        equalsBuyerTaxNo: '' // 税号一致
    });

    const emptyClick = () => {
        setSearchOpt({
            collectDateOfMonth: null,
            invoiceDateOfMonth: null,
            isFauthenticate: '',
            deductionPurpose: '',
            signOptionValue: '',
            expenseSystemSource: '',
            expenseReviewer: '',
            equalsBuyerName: '',
            equalsBuyerTaxNo: ''
        });
    };

    const searchClick = () => {
        const result = {
            searchOpt: {
                ...searchOpt,
                searchType: 'recommend'
            },
            searchType: 'recommend'
        };
        onSearch(result);
    };
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
    return (
        <div className='topBtns'>
            <div className='row' style={{ maxWidth: 1300, display: 'inline-block' }}>
                <div className='searchItem inlineBlock'>
                    <label>采集月份：</label>
                    <MonthPicker
                        className='rangeDate'
                        style={{ width: 220 }}
                        value={searchOpt.collectDateOfMonth}
                        placeholder='请选择采集月份'
                        format='YYYY-MM'
                        onChange={(e) => { setSearchOpt({ ...searchOpt, collectDateOfMonth: e }); }}
                        disabledDate={(c) => {
                            return c.format('X') > moment().endOf('month').format('X');
                        }}
                    />
                </div>
                <div className='searchItem inlineBlock'>
                    <label>开票月份：</label>
                    <MonthPicker
                        className='rangeDate'
                        style={{ width: 220 }}
                        value={searchOpt.invoiceDateOfMonth}
                        placeholder='请选择开票月份'
                        format='YYYY-MM'
                        onChange={(e) => { setSearchOpt({ ...searchOpt, invoiceDateOfMonth: e }); }}
                        disabledDate={(c) => {
                            return c.format('X') > moment().endOf('month').format('X');
                        }}
                    />
                </div>
                <div className='searchItem inlineBlock'>
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
                {
                    userSource != '8' ? (
                        <div className='searchItem inlineBlock'>
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
                <div className='searchItem inlineBlock'>
                    <label>纸票是否签收：</label>
                    <div style={{ display: 'inline-block', width: 220 }}>
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
                <Tooltip title='采集月份查询不到发票时，建议使用开票月份查询'>
                    <Button type='primary' onClick={searchClick} style={{ marginLeft: 30 }}>查询</Button>
                </Tooltip>
                <Button className='btn' icon='reload' onClick={emptyClick} style={{ borderStyle: 'none', marginLeft: 15 }}>清空</Button>
            </div>
        </div>
    );
};

RecommendQuery.propTypes = {
    userSource: PropTypes.string,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string,
    onSearch: PropTypes.func
};

export default RecommendQuery;

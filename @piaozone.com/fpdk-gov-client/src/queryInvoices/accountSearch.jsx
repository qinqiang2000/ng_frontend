import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select, DatePicker } from 'antd';
import { INPUT_INVOICE_TYPES } from '../commons/constants';
import moment from 'moment';
const { Option } = Select;

const AccountSearch = function({ onSearch }) {
    // 分众添加的搜索条件
    const [searchOpt, setSearchOpt] = useState({
        invoiceType: '',
        invoiceCode: null, // 发票，票据号码
        invoiceNo: null, // 发票，票据代码
        invoiceDate: null,
        electronicTicketNum: null, // 电子客票号
        printNum: null, // 飞机印刷序列号
        trainNum: null, // 车次
        printingSequenceNo: null, // 火车印刷序号
        exit: null, // 出口
        taxPaidProofNo: null, // 完税证明号
        taxAuthorityName: null, // 税务机关名称
        number: null, //收据号码
        customDeclarationNo: null // 缴款书号码

    });
    const allInvoiceTypes = INPUT_INVOICE_TYPES.filter((item) => {
        return item.value != 11;
    });
    const onQuery = () => {
        onSearch(searchOpt);
    };

    const emptyClick = () => {
        setSearchOpt({
            invoiceType: '',
            invoiceCode: null, // 发票，票据号码
            invoiceNo: null, // 发票，票据代码
            invoiceDate: null,
            electronicTicketNum: null, // 电子客票号
            printNum: null, // 飞机印刷序列号
            trainNum: null, // 车次
            printingSequenceNo: null, // 火车印刷序号
            exit: null, // 出口
            taxPaidProofNo: null, // 完税证明号
            taxAuthorityName: null, // 税务机关名称
            number: null, //收据号码
            customDeclarationNo: null // 缴款书号码
        });
    };
    let disabled = true;
    if ([1, 2, 3, 4, 5, 7, 8, 12, 13, 14, 15, 16, 17, 20, 23, 25].indexOf(searchOpt.invoiceType) != '-1') {
        disabled = !searchOpt.invoiceCode || !searchOpt.invoiceNo;
    } else if (searchOpt.invoiceType === 9) {
        disabled = !searchOpt.invoiceDate || !searchOpt.trainNum || !searchOpt.printingSequenceNo;
    } else if (searchOpt.invoiceType === 10) {
        disabled = !searchOpt.electronicTicketNum || !searchOpt.printNum;
    } else if (searchOpt.invoiceType === 17) {
        disabled = !searchOpt.invoiceCode || !searchOpt.invoiceNo || !searchOpt.exit;
    } else if (searchOpt.invoiceType === 19) {
        disabled = !searchOpt.taxPaidProofNo || !searchOpt.taxAuthorityName;
    } else if (searchOpt.invoiceType === 21) {
        disabled = !searchOpt.customDeclarationNo;
    } else if (searchOpt.invoiceType === 24) {
        disabled = !searchOpt.number;
    } else if ([26, 27, 28, 29].indexOf(searchOpt.invoiceType) != '-1') {
        disabled = !searchOpt.invoiceNo;
    }

    return (
        <div className='topBtns'>
            <div className='row minHeight' style={{ maxWidth: 1300, display: 'inline-block' }}>
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
                        <Option value=''>请选择</Option>
                        {
                            allInvoiceTypes.map((item) => {
                                return (
                                    <Option value={item.value} key={item.value}>{item.text}</Option>
                                );
                            })
                        }
                    </Select>
                </div>
                {
                    [1, 2, 3, 4, 5, 7, 8, 12, 13, 14, 15, 16, 17, 20, 23].indexOf(searchOpt.invoiceType) != '-1' ? (
                        <div className='searchItem inlineBlock'>
                            <label>发票代码：</label>
                            <Input
                                placeholder='输入发票代码'
                                type='text'
                                maxLength={12}
                                value={searchOpt.invoiceCode}
                                className='searchInput' style={{ width: 220 }}
                                onChange={(e) => {
                                    setSearchOpt({
                                        ...searchOpt,
                                        invoiceCode: e.target.value.trim()
                                    });
                                }}
                            />
                        </div>
                    ) : null
                }
                {
                    [1, 2, 3, 4, 5, 7, 8, 12, 13, 14, 15, 16, 17, 20, 23, 26, 27, 28, 29].indexOf(searchOpt.invoiceType) != '-1' ? (
                        <div className='searchItem inlineBlock'>
                            <label>发票号码：</label>
                            <Input
                                maxLength={20}
                                placeholder='输入发票号码'
                                type='text'
                                className='searchInput' style={{ width: 220 }}
                                onChange={(e) => {
                                    setSearchOpt({
                                        ...searchOpt,
                                        invoiceNo: e.target.value.trim()
                                    });
                                }}
                                value={searchOpt.invoiceNo}
                            />
                        </div>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 9 ? (
                        <>
                            <div className='searchItem inlineBlock'>
                                <label>乘车日期：</label>
                                <DatePicker
                                    className='inputPicker'
                                    placeholder='选择乘车日期'
                                    disabledDate={(d) => { return d && d > moment().endOf('day'); }}
                                    onChange={(e) => { setSearchOpt({ ...searchOpt, invoiceDate: e }); }}
                                    value={searchOpt.invoiceDate ? moment(searchOpt.invoiceDate, 'YYYY-MM-DD') : null}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>车次：</label>
                                <Input
                                    placeholder='输入车次'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            trainNum: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.trainNum}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>印刷序号：</label>
                                <Input
                                    placeholder='输入印刷序号'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            printingSequenceNo: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.printingSequenceNo}
                                />
                            </div>
                        </>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 17 ? (
                        <div className='searchItem inlineBlock'>
                            <label>出口：</label>
                            <Input
                                placeholder='输入出口'
                                type='text'
                                className='searchInput' style={{ width: 220 }}
                                onChange={(e) => {
                                    setSearchOpt({
                                        ...searchOpt,
                                        exit: e.target.value.trim()
                                    });
                                }}
                                value={searchOpt.exit}
                            />
                        </div>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 10 ? (
                        <>
                            <div className='searchItem inlineBlock'>
                                <label>电子客票号：</label>
                                <Input
                                    placeholder='输入电子客票号'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            electronicTicketNum: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.electronicTicketNum}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>印刷序列号：</label>
                                <Input
                                    placeholder='输入印刷序列号'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            printNum: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.printNum}
                                />
                            </div>
                        </>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 19 ? (
                        <>
                            <div className='searchItem inlineBlock'>
                                <label>完税证明号：</label>
                                <Input
                                    placeholder='输入完税证明号'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            taxPaidProofNo: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.taxPaidProofNo}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>税务机关名称：</label>
                                <Input
                                    placeholder='输入税务机关名称'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            taxAuthorityName: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.taxAuthorityName}
                                />
                            </div>
                        </>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 24 ? (
                        <div className='searchItem inlineBlock'>
                            <label>收据号码：</label>
                            <Input
                                placeholder='输入收据号码'
                                type='text'
                                className='searchInput' style={{ width: 220 }}
                                onChange={(e) => {
                                    setSearchOpt({
                                        ...searchOpt,
                                        number: e.target.value.trim()
                                    });
                                }}
                                value={searchOpt.number}
                            />
                        </div>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 21 ? (
                        <div className='searchItem inlineBlock'>
                            <label>缴款书号码：</label>
                            <Input
                                placeholder='输入缴款书号码'
                                type='text'
                                className='searchInput' style={{ width: 220 }}
                                onChange={(e) => {
                                    setSearchOpt({
                                        ...searchOpt,
                                        customDeclarationNo: e.target.value.trim()
                                    });
                                }}
                                value={searchOpt.customDeclarationNo}
                            />
                        </div>
                    ) : null
                }
                {
                    searchOpt.invoiceType == 25 ? (
                        <>
                            <div className='searchItem inlineBlock'>
                                <label>票据代码：</label>
                                <Input
                                    maxLength={8}
                                    placeholder='输入8位票据代码'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            invoiceCode: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.invoiceCode}
                                />
                            </div>
                            <div className='searchItem inlineBlock'>
                                <label>票据号码：</label>
                                <Input
                                    maxLength={10}
                                    placeholder='输入10位票据号码'
                                    type='text'
                                    className='searchInput' style={{ width: 220 }}
                                    onChange={(e) => {
                                        setSearchOpt({
                                            ...searchOpt,
                                            invoiceNo: e.target.value.trim()
                                        });
                                    }}
                                    value={searchOpt.invoiceNo}
                                />
                            </div>
                        </>
                    ) : null
                }
            </div>
            <div style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: 15 }}>
                <Button type='primary' disabled={disabled} onClick={onQuery}>查询</Button>
                <Button className='btn' icon='reload' onClick={emptyClick} style={{ borderStyle: 'none', marginLeft: 15 }}>清空</Button>
            </div>
        </div>
    );
};

AccountSearch.propTypes = {
    onSearch: PropTypes.func
};

export default AccountSearch;
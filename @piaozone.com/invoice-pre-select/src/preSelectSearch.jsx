import React from 'react';
import { DatePicker, Input, Select, Tag } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import InvoiceSource from './invoiceSource';
import { entryDateFun } from './preSelectCol';
import './preSelectSearch.less';
const { CheckableTag } = Tag;
const { Option } = Select;
const INPUT_INVOICE_TYPES = invoiceTypes.INPUT_INVOICE_TYPES.filter((item) => {
    if (item.value == 2 || item.value == 4 || item.value == 12 || item.value == 15 || item.value == 27) {
        return item;
    }
});
const { RangePicker } = DatePicker;
const GX_STATUS = [
    { text: '未勾选', value: '0' }, // 合并 未勾选和已勾选
    { text: '预勾选', value: '5' }
];

const DK_STATUS = [
    { text: '未抵扣', value: '' },
    { text: '不抵扣', value: '2' }, // 合并 未勾选和已勾选
    { text: '抵扣', value: '1' }
];

const INVOICES_STATUS = [
    { text: '正常', value: '0' }, // 合并 未勾选和已勾选
    { text: '失控', value: '1' },
    { text: '作废', value: '2' },
    { text: '红冲', value: '3' },
    { text: '异常', value: '4' },
    { text: '非正常', value: '5' },
    { text: '红字发票待确认', value: '6' },
    { text: '部分红冲', value: '7' },
    { text: '全额红冲', value: '8' }
];

const invoice_expense_status = [
    { text: '未用', value: 1 },
    { text: '在用', value: 30 },
    { text: '已用', value: 60 },
    { text: '已入账', value: 65 }
];

class PreSelectSearch extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            entryDate: entryDateFun(),
            selectAll: false
        };
    }

    onSelectAll = () => {
        const { entryDate, selectAll } = this.state;
        entryDate.forEach((item, j) => {
            item.checked = !selectAll;
        });
        this.getAccountDate(entryDate, !selectAll);
    }

    handleChangeTag = (i) => {
        const { entryDate } = this.state;
        entryDate.forEach((item, j) => {
            if (i == j) {
                item.checked = !item.checked;
            }
        });
        this.getAccountDate(entryDate, true);
    }

    getAccountDate = (entryDate, selectAll) => {
        let all = selectAll;
        const accountDateArr = [];
        for (const item of entryDate) {
            if (item.checked) {
                accountDateArr.push(item.value);
            }
            if (!item.checked) {
                all = false;
            }
        }
        this.setState({
            selectAll: all,
            accountDate: accountDateArr.join(''),
            entryDate
        });
        this.props.changeOpt('accountDate', accountDateArr.join(','));
    }

    render() {
        const {
            collectTime,
            invoiceTime,
            invoiceCode,
            invoiceNoStart,
            invoiceNoEnd,
            salerName,
            collectUser,
            preSelector,
            invoiceType,
            deductionPurpose,
            isFauthenticate,
            invoiceStatus,
            preSelectTime,
            isCheck,
            expendStatus,
            expenseSystemSource,
            expenseReviewer
        } = this.props.searchOpt;
        const { entryDate, selectAll } = this.state;
        const { userSource, changeOpt } = this.props;
        const currentGxFlag = GX_STATUS.filter((item) => {
            return item.value == isFauthenticate;
        });
        return (
            <div className='preSelectSearch' id='preSelectSearch'>
                <div className='topBtns'>
                    <div className='row'>
                        <div className='searchItem inlineBlock'>
                            <label>发票代码：</label>
                            <Input
                                placeholder='输入发票代码'
                                type='text'
                                maxLength={12}
                                className='searchInput' style={{ width: 262 }}
                                onChange={(e) => changeOpt('invoiceCode', e.target.value)}
                                value={invoiceCode}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label style={{ marginLeft: 0 }}>发票号码：</label>
                            <Input
                                maxLength={20}
                                type='text'
                                className='searchInput' style={{ width: 110 }}
                                onChange={(e) => changeOpt('invoiceNoStart', e.target.value)}
                                value={invoiceNoStart}
                            />
                            <span style={{ padding: '0 15px' }}>—</span>
                            <Input
                                maxLength={20}
                                type='text'
                                className='searchInput' style={{ width: 110 }}
                                onChange={(e) => changeOpt('invoiceNoEnd', e.target.value)}
                                value={invoiceNoEnd}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label style={{ marginLeft: 0 }}>销方名称：</label>
                            <Input
                                placeholder='请输入企业名称'
                                type='text'
                                className='searchInput' style={{ width: 262 }}
                                onChange={(e) => changeOpt('salerName', e.target.value)}
                                value={salerName}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>发票种类：</label>
                            <Select
                                value={invoiceType}
                                style={{ width: 262 }}
                                onChange={(e) => changeOpt('invoiceType', e)}
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
                            <label>开票日期：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 262 }}
                                onChange={(d) => changeOpt('invoiceTime', d)}
                                value={invoiceTime}
                                allowClear={true}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label style={{ marginLeft: 0 }}>采集日期：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 262 }}
                                onChange={(d) => changeOpt('collectTime', d)}
                                value={collectTime}
                                allowClear={true}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label style={{ marginLeft: 0 }}>采集人手机号：</label>
                            <Input
                                type='text'
                                style={{ width: 262 }}
                                placeholder='请输入采集人的手机号'
                                value={collectUser}
                                maxLength={11}
                                onChange={(e) => changeOpt('collectUser', e.target.value.replace(/[^0-9]/g, ''))}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>发票状态：</label>
                            <Select
                                style={{ width: 262 }}
                                value={INVOICES_STATUS[invoiceStatus].text}
                                onChange={(e) => changeOpt('invoiceStatus', e)}
                            >
                                {
                                    INVOICES_STATUS.map((item) => {
                                        return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                    })
                                }
                            </Select>
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>勾选状态：</label>
                            <Select
                                style={{ width: 262 }}
                                value={currentGxFlag[0].text}
                                onChange={(v) => changeOpt('isFauthenticate', v)}
                            >
                                {
                                    GX_STATUS.map((item) => {
                                        return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                    })
                                }
                            </Select>
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label style={{ marginLeft: 0 }}>抵扣状态：</label>
                            <Select
                                style={{ width: 262 }}
                                value={deductionPurpose}
                                onChange={(v) => changeOpt('deductionPurpose', v)}
                            >
                                {
                                    DK_STATUS.map((item) => {
                                        return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                    })
                                }
                            </Select>
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label style={{ marginLeft: 0 }}>预勾选人：</label>
                            <Input
                                type='text'
                                style={{ width: 262 }}
                                placeholder='请输入平台用户名'
                                value={preSelector}
                                onChange={(e) => changeOpt('preSelector', e.target.value)}
                            />
                        </div>
                        <div className='searchItem inlineBlock'>
                            <label>预勾选时间：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 262 }}
                                onChange={(d) => changeOpt('preSelectTime', d)}
                                value={preSelectTime}
                                allowClear={true}
                            />
                        </div>
                        <div className='row' style={{ marginBottom: 0 }}>
                            <div className='searchItem inlineBlock'>
                                <label>发票是否查验：</label>
                                <span
                                    className={isCheck == '1' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => changeOpt('isCheck', '1')}
                                >
                                    是
                                </span>
                                <span
                                    className={isCheck == '2' ? 'active checkItem' : 'checkItem'}
                                    onClick={() => changeOpt('isCheck', '2')}
                                >
                                    否
                                </span>
                            </div>
                            {
                                userSource != '8' ? (
                                    <>
                                        <div className='searchItem inlineBlock'>
                                            <InvoiceSource
                                                placeHolderTxt='请输入发票的来源业务系统'
                                                title='来源系统列表'
                                                labelName='系统来源'
                                                name='expenseSystemSource'
                                                buttonVal={expenseSystemSource}
                                                onOk={(val) => { changeOpt('expenseSystemSource', val); }}
                                                getListUrl={this.props.getInvoiceSourceUrl}
                                            />
                                        </div>
                                        <div className='searchItem inlineBlock'>
                                            <InvoiceSource
                                                placeHolderTxt='请输入发票的审核人'
                                                title='系统审核人列表'
                                                labelName='单据审核人'
                                                name='expenseReviewer'
                                                buttonVal={expenseReviewer}
                                                onOk={(val) => { changeOpt('expenseReviewer', val); }}
                                                getListUrl={this.props.gitReviewerUrl}
                                            />
                                        </div>
                                    </>
                                ) : null
                            }
                            <div className='searchItem inlineBlock'>
                                <label>发票使用状态：</label>
                                <Select
                                    style={{ width: 220 }}
                                    value={expendStatus}
                                    onChange={(v) => changeOpt('expendStatus', v)}
                                >
                                    <Option value=''>全部</Option>
                                    {
                                        invoice_expense_status.map((item) => {
                                            return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                        })
                                    }
                                </Select>
                            </div>
                        </div>
                        <div className='row' style={{ marginBottom: 0 }}>
                            <div className='searchItem inlineBlock'>
                                <label className='tagName'>入账属期：</label>
                                <div className='tags' style={{ display: 'inline-block' }}>
                                    <div className='region'>
                                        <CheckableTag
                                            checked={selectAll}
                                            className={selectAll ? 'invoicesTag checked' : 'invoicesTag'}
                                            onChange={this.onSelectAll}
                                        >
                                            全部
                                        </CheckableTag>
                                        {
                                            entryDate.map((item, i) => {
                                                return (
                                                    <CheckableTag
                                                        key={i}
                                                        checked={item.checked}
                                                        className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                        onChange={() => { this.handleChangeTag(i); }}
                                                    >
                                                        {item.text}
                                                    </CheckableTag>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

PreSelectSearch.propTypes = {
    searchOpt: PropTypes.object,
    changeOpt: PropTypes.func,
    userSource: PropTypes.string,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string
};

export default PreSelectSearch;
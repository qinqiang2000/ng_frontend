import React from 'react';
import { Input, Button, Radio, DatePicker, Tag, Select } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import './less/invoicesSearch.less';
import InvoiceSource from '../invoiceSource';
const { Option } = Select;
const { CheckableTag } = Tag;
const { RangePicker } = DatePicker;
const fplxCt = [
    { text: '全部', value: '-1' },
    { text: '增值税专用发票', value: '01' },
    { text: '增值税电子专用发票', value: '10' },
    { text: '机动车发票', value: '03' },
    { text: '通行费电子发票', value: '14' }
    // { text: '全电专票', value: '27' }
];

const fpztCt = [
    { text: '全部', value: '-1' },
    { text: '正常', value: '0' },
    { text: '失控', value: '1' },
    { text: '作废', value: '2' },
    { text: '红冲', value: '3' },
    { text: '异常', value: '4' },
    { text: '红字发票待确认', value: '6' },
    { text: '部分红冲', value: '7' },
    { text: '全额红冲', value: '8' }
];

class GxInvoicesSearch extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            gxzt: '0',
            fpzt: '0',
            fpdm: '',
            fphm: '',
            salerName: '',
            collectUser: '',
            //isEntryVoucher: '1', // 0未入凭证、1入凭证
            accountDate: null,
            fplx: '01',
            allChecked: true,
            rangeDate: [moment().startOf('month'), moment()],
            collectorTime: [moment().startOf('month'), moment()],
            entryDate: this.props.entryDate
        };
    }

    searchClick = () => {
        this.props.onSearch();
    }

    handleChangeTag = (i) => {
        const { entryDate } = this.state;
        if (i == '0') {
            const { allChecked } = this.state;
            if (!allChecked) {
                entryDate.forEach((item, j) => {
                    item.checked = true;
                });
            } else {
                entryDate.forEach((item, j) => {
                    item.checked = false;
                });
            }
        } else {
            entryDate.forEach((item, j) => {
                if (i == j) {
                    item.checked = !item.checked;
                }
            });
        }
        let all = true;
        const accountDateArr = [];
        for (var j = 0; j < entryDate.length; j++) {
            if (entryDate[j].checked) {
                accountDateArr.push(entryDate[j].value);
            }
            if (!entryDate[j].checked && j > 0) {
                all = false;
            }
        }
        if (!all) {
            entryDate[0].checked = false;
        } else {
            entryDate[0].checked = true;
        }
        this.props.changeOpt('accountDate', accountDateArr.join(','));
        this.setState({
            accountDate: accountDateArr.join(''),
            allChecked: all,
            entryDate
        });
    }

    render() {
        const {
            fpdm,
            fphm,
            salerName,
            fplx,
            rangeDate,
            fpzt,
            gxzt,
            collectorTime,
            collectUser,
            //isEntryVoucher,
            preSelector
        } = this.props.searchOpt;
        let fplxTxt = ''; let fpztTxt = '';
        for (const item of fplxCt) {
            if (item.value == fplx) {
                fplxTxt = item.text;
            }
        }
        for (const item of fpztCt) {
            if (item.value == fpzt) {
                fpztTxt = item.text;
            }
        }
        const { skssq = '', clientType } = this.props || {};
        const ssq = skssq.substr(0, 6);
        const deadLineDate = skssq.substr(7, 8);
        const minDate = moment('2017-01-01', 'YYYY-MM-DD');
        const maxDate = moment();
        const changeOpt = this.props.changeOpt;
        const { entryDate } = this.state;
        const { userSource } = this.props;
        return (
            <div className='gxInvoicesSearch'>
                <div className='tip'>
                    <div style={{ display: 'inline-block' }}>
                        <span>当前税控所属期：<span className='ssq'>{skssq ? moment(ssq, 'YYYYMM').format('YYYY年MM月') : '--'}</span></span>
                        <span className='gray'>(当前可进行勾选操作的截止日期为：{skssq ? moment(deadLineDate, 'YYYYMMDD').format('YYYY年MM月DD日') : '--'})</span>
                    </div>
                </div>
                <div className='row'>
                    <div className='inputItem'>
                        <label>发票代码：</label>
                        <Input value={fpdm} onChange={(e) => changeOpt('fpdm', e.target.value.trim())} maxLength={12} />
                    </div>
                    <div className='inputItem'>
                        <label>发票号码：</label>
                        <Input value={fphm} onChange={(e) => changeOpt('fphm', e.target.value.trim())} maxLength={20} />
                    </div>
                    <div className='inputItem'>
                        <label style={{ marginLeft: 20 }}>开票方名称：</label>
                        <Input value={salerName} onChange={(e) => changeOpt('salerName', e.target.value.trim())} style={{ width: 165 }} />
                    </div>
                    <Button type='primary' onClick={this.searchClick} style={{ margin: '0 15px 0 25px' }}>查询发票</Button>
                    <Button onClick={this.props.onReset}>重置条件</Button>
                </div>

                <div className='row'>
                    <div className='inputItem'>
                        <label>勾选状态：</label>
                        <Radio.Group onChange={(e) => changeOpt('gxzt', e.target.value)} value={gxzt}>
                            <Radio value='0'>未勾选</Radio>
                            {
                                clientType === 1 ? (
                                    <Radio value='5'>预勾选</Radio>
                                ) : null
                            }
                            <Radio value='1'>已勾选</Radio>
                        </Radio.Group>
                    </div>
                    <div className='inputItem'>
                        <label style={{ width: 100 }}>{gxzt === '0' ? '开票日期：' : '勾选日期：'}</label>
                        <RangePicker
                            allowClear={false}
                            value={rangeDate}
                            format='YYYY-MM-DD'
                            onChange={(d) => changeOpt('rangeDate', d)}
                            disabledDate={(c) => {
                                return c.format('X') < minDate.format('X') || c.format('X') > maxDate.format('X');
                            }}
                        />
                    </div>
                    <div className='inputItem'>
                        <label style={{ width: 100 }}>采集日期：</label>
                        <RangePicker
                            allowClear={false}
                            value={collectorTime}
                            format='YYYY-MM-DD'
                            onChange={(d) => changeOpt('collectorTime', d)}
                            disabledDate={(c) => {
                                return c > moment();
                            }}
                        />
                    </div>
                </div>
                <div className='row fplxRow'>
                    <div className='inputItem'>
                        <label>发票类型：</label>
                        <Select
                            value={fplxTxt}
                            style={{ width: 220 }}
                            onChange={(v) => changeOpt('fplx', v)}
                        >
                            {
                                fplxCt.map((item) => {
                                    return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                })
                            }
                        </Select>
                    </div>
                    <div className='inputItem' style={{ display: clientType === 1 ? 'inline-block' : 'none' }}>
                        <label style={{ marginLeft: 50 }}>采集人：</label>
                        <Input
                            value={collectUser}
                            onChange={(e) => changeOpt('collectUser', e.target.value.trim())}
                            maxLength={11}
                            style={{ width: 165 }}
                            placeholder='输入手机号'
                        />
                    </div>
                    <div className='inputItem'>
                        <label style={{ marginLeft: 50 }}>发票状态：</label>
                        <Select
                            value={fpztTxt}
                            style={{ width: 220 }}
                            onChange={(v) => changeOpt('fpzt', v)}
                        >
                            {
                                fpztCt.map((item) => {
                                    return <Option value={item.value} key={item.value}>{item.text}</Option>;
                                })
                            }
                            
                        </Select>
                    </div>
                </div>
                <div className='row'>
                    <div className='inputItem' style={{ display: clientType === 1 ? 'inline-block' : 'none' }}>
                        <label>预勾选人：</label>
                        <Input
                            value={preSelector}
                            onChange={(e) => changeOpt('preSelector', e.target.value.trim())}
                            maxLength={11}
                            style={{ width: 165 }}
                            placeholder='预勾选人名称'
                        />
                    </div>
                    {
                        userSource != 8 ? (
                            <>
                                <div className='searchItem inlineBlock' style={{ marginLeft: 60 }}>
                                    <InvoiceSource
                                        placeHolderTxt='请输入发票的来源业务系统'
                                        title='来源系统列表'
                                        labelName='系统来源'
                                        name='expenseSystemSource'
                                        onOk={(val) => { changeOpt('expenseSystemSource', val); }}
                                        getListUrl={this.props.getInvoiceSourceUrl}
                                    />
                                </div>
                                <div className='searchItem inlineBlock' style={{ marginLeft: 70 }}>
                                    <InvoiceSource
                                        placeHolderTxt='请输入发票的审核人'
                                        title='系统审核人列表'
                                        labelName='单据审核人'
                                        name='expenseReviewer'
                                        onOk={(val) => { changeOpt('expenseReviewer', val); }}
                                        getListUrl={this.props.gitReviewerUrl}
                                    />
                                </div>
                            </>
                        ) : null
                    }
                </div>
                {
                    userSource != 8 ? (
                        <div className='row'>
                            {/* <div className='inputItem'>
                                <label>是否入账：</label>
                                <Radio.Group onChange={(e) => changeOpt('isEntryVoucher', e.target.value)} value={isEntryVoucher}>
                                    <Radio value='1'>是</Radio>
                                    <Radio value='0'>否</Radio>
                                </Radio.Group>
                            </div> */}
                            <div className='inputItem'>
                                <label>入账属期：</label>
                                <div className='tags' style={{ display: 'inline-block' }}>
                                    {
                                        entryDate && entryDate.length > 0 ? (
                                            <div className='region'>
                                                {
                                                    entryDate.map((item, i) => {
                                                        if (i < 13) {
                                                            return (
                                                                <CheckableTag
                                                                    key={i}
                                                                    checked={item.checked}
                                                                    className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                                    onChange={(e) => this.handleChangeTag(i)}
                                                                    style={{ backgroundColor: 'none' }}
                                                                >
                                                                    {item.text}
                                                                </CheckableTag>
                                                            );
                                                        }
                                                    })
                                                }
                                                {/* <label
                                                    className='more'
                                                    onClick={() => { this.setState({ moreEntryDate: !moreEntryDate }); }}
                                                >
                                                    {moreEntryDate ? '收起' : '更多'}
                                                </label> */}
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    }
}

GxInvoicesSearch.propTypes = {
    searchOpt: PropTypes.object,
    onSearch: PropTypes.func.isRequired,
    changeOpt: PropTypes.func,
    onReset: PropTypes.func,
    entryDate: PropTypes.array,
    userSource: PropTypes.number,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string
};

export default GxInvoicesSearch;
import React from 'react';
import { Input, Button, Radio, DatePicker, Tag, Icon } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import './less/invoicesSearch.less';
const { CheckableTag } = Tag;
const { RangePicker } = DatePicker;
var entryDate = [{ checked: false, value: 'all', text: '全部' }];
var data = new Date();
data.setMonth(data.getMonth() + 1, 1); //获取到当前月份,设置月份
for (var i = 0; i < 12; i++) {
    data.setMonth(data.getMonth() - 1); //每次循环一次 月份值减1
    var m = data.getMonth() + 1;
    m = m < 10 ? '0' + m : m + '';
    entryDate.push({ checked: false, value: data.getFullYear() + m, text: data.getFullYear() + '/' + m });
}
class GxInvoicesSearch extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            gxzt: '0',
            fpzt: '0',
            customDeclarationNo: '',
            deptName: '',
            declareNo: '',
            collectUser: '',
            accountDate: null,
            fplx: '21',
            allChecked: true,
            rangeDate: [moment().startOf('month'), moment()],
            collectorTime: [moment().startOf('month'), moment()]
        };
    }

    handleChangeTag = (i) => {
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
            allChecked: all
        });
    }

    render() {
        const {
            customDeclarationNo,
            deptName,
            declareNo,
            rangeDate,
            fpzt,
            gxzt,
            collectorTime,
            collectUser,
            expenseSystemSource,
            expenseReviewer
        } = this.props.searchOpt;
        const { skssq = '', clientType, isShowAccount, showChooseModal, defaultAccount } = this.props || {};
        const { userSource } = this.props;
        const ssq = skssq.substr(0, 6);
        const deadLineDate = skssq.substr(7, 8);
        const minDate = moment('2017-01-01', 'YYYY-MM-DD');
        const maxDate = moment();
        const changeOpt = this.props.changeOpt;
        return (
            <div className='gxInvoicesSearch'>
                <div className='tip choose'>
                    <div style={{ display: 'inline-block' }}>
                        <span>当前税款所属期：
                            {
                                skssq ? (
                                    <span className='ssq'>{moment(ssq, 'YYYYMM').format('YYYY年MM月')}</span>
                                ) : (
                                    <Icon type='loading' spin={true} style={{ fontSize: 16, color: '#08c', padding: '0 5px' }} />
                                )
                            }
                        </span>
                        <span className='gray'>(当前可进行勾选操作的截止日期为：{skssq ? moment(deadLineDate, 'YYYYMMDD').format('YYYY年MM月DD日') : '--'})</span>
                    </div>
                    {
                        isShowAccount && (
                            <div>电子税局账号：{defaultAccount.name} <span className='btn' onClick={() => showChooseModal()}>切换</span></div>
                        )
                    }
                </div>
                <div className='row'>
                    <div className='inputItem'>
                        <label className='comSpan'>缴款书号码：</label>
                        <Input
                            style={{ width: 228 }}
                            value={customDeclarationNo}
                            onChange={(e) => changeOpt('customDeclarationNo', e.target.value.trim())}
                            maxLength={60}
                        />
                    </div>
                    <div className='inputItem'>
                        <label className='comSpan' style={{ width: 100 }}>缴款单位一名称：</label>
                        <Input
                            style={{ width: 228 }}
                            value={deptName}
                            onChange={(e) => changeOpt('deptName', e.target.value.trim())}
                        />
                    </div>

                    <Button type='primary' onClick={this.props.onSearch} style={{ margin: '0 15px 0 25px' }}>查询发票</Button>
                    <Button onClick={this.props.onReset}>重置条件</Button>
                </div>

                <div className='row'>
                    <div className='inputItem' style={{ marginBottom: 10 }}>
                        <label className='comSpan'>报关单编号：</label>
                        <Input
                            style={{ width: 228 }}
                            value={declareNo}
                            onChange={(e) => changeOpt('declareNo', e.target.value.trim())}
                        />
                    </div>
                    <div className='inputItem' style={{ marginBottom: 10 }}>
                        <label className='comSpan' style={{ width: 100 }}>{gxzt === '0' ? '填发日期：' : '勾选日期：'}</label>
                        <RangePicker
                            value={rangeDate}
                            format='YYYY-MM-DD'
                            onChange={(d) => changeOpt('rangeDate', d)}
                            disabledDate={(c) => {
                                return c.format('X') < minDate.format('X') || c.format('X') > maxDate.format('X');
                            }}
                        />
                    </div>
                    <div className='inputItem' style={{ display: clientType === 1 ? 'inline-block' : 'none', marginBottom: 10 }}>
                        <label className='comSpan'>采集人：</label>
                        <Input
                            value={collectUser}
                            onChange={(e) => changeOpt('collectUser', e.target.value.trim())}
                            style={{ width: 228 }}
                            placeholder='输入手机号'
                        />
                    </div>
                    <div className='inputItem' style={{ marginBottom: 10 }}>
                        <label className='comSpan'>采集日期：</label>
                        <RangePicker
                            value={collectorTime}
                            format='YYYY-MM-DD'
                            onChange={(d) => changeOpt('collectorTime', d)}
                            disabledDate={(c) => {
                                return c > moment();
                            }}
                        />
                    </div>
                    <div className='inputItem' style={{ marginBottom: 10 }}>
                        <label className='comSpan'>勾选状态：</label>
                        <Radio.Group onChange={(e) => changeOpt('gxzt', e.target.value)} value={gxzt} style={{ width: 230 }}>
                            <Radio value='0'>未勾选</Radio>
                            <Radio value='1'>已勾选</Radio>
                        </Radio.Group>
                    </div>
                    <div className='inputItem' style={{ marginBottom: 10 }}>
                        <label className='comSpan'>发票状态：</label>
                        <Radio.Group onChange={(e) => changeOpt('fpzt', e.target.value)} value={fpzt}>
                            <Radio value='-1'>全部</Radio>
                            <Radio value='0'>正常</Radio>
                            <Radio value='1'>失控</Radio>
                            <Radio value='2'>作废</Radio>
                            <Radio value='3'>红冲</Radio>
                            <Radio value='4'>异常</Radio>
                        </Radio.Group>
                    </div>
                    {
                        userSource != '8' ? (
                            <>
                                <div className='row'>
                                    <div className='inputItem'>
                                        <label className='comSpan'>系统来源：</label>
                                        <Input
                                            type='text'
                                            style={{ width: 220 }}
                                            value={expenseSystemSource}
                                            maxLength={100}
                                            onChange={(e) => changeOpt('expenseSystemSource', e.target.value.trim())}
                                        />
                                    </div>
                                    <div className='inputItem'>
                                        <label className='comSpan'>单据审核人：</label>
                                        <Input
                                            type='text'
                                            style={{ width: 220 }}
                                            value={expenseReviewer}
                                            maxLength={100}
                                            onChange={(e) => changeOpt('expenseReviewer', e.target.value.trim())}
                                        />
                                    </div>
                                </div>
                                <div className='inputItem'>
                                    <label className='comSpan'>入账属期：</label>
                                    <div className='tags' style={{ display: 'inline-block' }}>
                                        {
                                            entryDate.length > 0 ? (
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
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                </div>
                            </>
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

GxInvoicesSearch.propTypes = {
    searchOpt: PropTypes.object,
    onSearch: PropTypes.func.isRequired,
    changeOpt: PropTypes.func,
    onReset: PropTypes.func,
    userSource: PropTypes.string
};

export default GxInvoicesSearch;
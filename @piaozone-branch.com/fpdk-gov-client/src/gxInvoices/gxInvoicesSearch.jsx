import React from 'react';
import { Input, Button, Radio, DatePicker } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import './less/invoicesSearch.less';

const { RangePicker, MonthPicker } = DatePicker;

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
            isEntryVoucher: '1', // 0未入凭证、1入凭证
            accountDate: null,
            fplx: '01',
            rangeDate: [moment().startOf('month'), moment()],
            collectorTime: [moment().startOf('month'), moment()]
        };
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
            isEntryVoucher,
            accountDate,
            preSelector
        } = this.props.searchOpt;
        const { skssq = '', clientType } = this.props || {};
        const isEntryVoucherFlag = this.props.isEntryVoucher;
        const ssq = skssq.substr(0, 6);
        const deadLineDate = skssq.substr(7, 8);
        const minDate = moment('2017-01-01', 'YYYY-MM-DD');
        const maxDate = moment();
        const changeOpt = this.props.changeOpt;
        return (
            <div className='gxInvoicesSearch'>
                <div className='tip'>
                    <div style={{ display: 'inline-block' }}>
                        <span>当前税款所属期：<span className='ssq'>{skssq ? moment(ssq, 'YYYYMM').format('YYYY年MM月') : '--'}</span></span>
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
                        <Input value={fphm} onChange={(e) => changeOpt('fphm', e.target.value.trim())} maxLength={10} />
                    </div>
                    <div className='inputItem'>
                        <label>开票方名称：</label>
                        <Input value={salerName} onChange={(e) => changeOpt('salerName', e.target.value.trim())} style={{ width: 165 }} />
                    </div>
                    <Button type='primary' onClick={this.props.onSearch} style={{ margin: '0 15px 0 25px' }}>查询发票</Button>
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
                        <Radio.Group onChange={(e) => changeOpt('fplx', e.target.value)} value={fplx}>
                            <Radio value='-1' style={{ width: 75 }}>全部</Radio>
                            <Radio value='01' style={{ width: 135 }}>增值税专用发票</Radio>
                            <Radio value='10' style={{ width: 165 }}>增值税电子专用发票</Radio>
                            <Radio value='03'>机动车发票</Radio>
                            <Radio value='14'>通行费电子发票</Radio>
                        </Radio.Group>
                    </div>
                    <div className='inputItem' style={{ display: clientType === 1 ? 'inline-block' : 'none' }}>
                        <label style={{ marginLeft: 40 }}>采集人：</label>
                        <Input
                            value={collectUser}
                            onChange={(e) => changeOpt('collectUser', e.target.value.trim())}
                            maxLength={11}
                            style={{ width: 165 }}
                            placeholder='输入手机号'
                        />
                    </div>
                </div>

                <div className='row'>
                    <div className='inputItem'>
                        <label>发票状态：</label>
                        <Radio.Group onChange={(e) => changeOpt('fpzt', e.target.value)} value={fpzt}>
                            <Radio value='-1'>全部</Radio>
                            <Radio value='0'>正常</Radio>
                            <Radio value='1'>失控</Radio>
                            <Radio value='2'>作废</Radio>
                            <Radio value='3'>红冲</Radio>
                            <Radio value='4'>异常</Radio>
                        </Radio.Group>
                    </div>
                    <div className='inputItem' style={{ display: clientType === 1 ? 'inline-block' : 'none' }}>
                        <label style={{ marginLeft: 40 }}>预勾选人：</label>
                        <Input
                            value={preSelector}
                            onChange={(e) => changeOpt('preSelector', e.target.value.trim())}
                            maxLength={11}
                            style={{ width: 165 }}
                            placeholder='预勾选人名称'
                        />
                    </div>
                </div>
                <div className='row' style={{ display: isEntryVoucherFlag === 1 ? 'block' : 'none' }}>
                    <div className='inputItem'>
                        <label>是否入账：</label>
                        <Radio.Group onChange={(e) => changeOpt('isEntryVoucher', e.target.value)} value={isEntryVoucher}>
                            <Radio value='1'>是</Radio>
                            <Radio value='0'>否</Radio>
                        </Radio.Group>
                    </div>
                    <div className='inputItem'>
                        <label style={{ width: 62 }}>入账属期：</label>
                        <MonthPicker
                            value={accountDate}
                            disabled={isEntryVoucher === '0'}
                            placeholder='请选择入账属期'
                            format='YYYYMM'
                            onChange={(e) => changeOpt('accountDate', e)}
                            disabledDate={(c) => {
                                return c.format('X') < minDate.format('X') || c.format('X') > moment().endOf('month').format('X');
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

GxInvoicesSearch.propTypes = {
    // gxrqfw: PropTypes.string,
    searchOpt: PropTypes.object,
    onSearch: PropTypes.func.isRequired,
    isEntryVoucher: PropTypes.number,
    changeOpt: PropTypes.func,
    onReset: PropTypes.func
};

export default GxInvoicesSearch;
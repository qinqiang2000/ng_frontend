//公路汽车票

import React from 'react';
import { Select, Input, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import Immutable from 'immutable';

const Option = Select.Option;

class TrafficBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }


    onSave = async() => {
        const {
            invoiceCode,
            invoiceNo,
            totalAmount,
            invoiceDate,
            currency,
            totalTaxAmount,
            stationGetOff,
            stationGetOn,
            time,
            passengerName,
            insurancePremium = 0,
            cardNumber
        } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceDate,
            invoiceCode,
            invoiceNo,
            passengerName,
            totalAmount,
            currency,
            totalTaxAmount,
            stationGetOff,
            stationGetOn,
            insurancePremium,
            cardNumber,
            time
        });
        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const {
            invoiceCode,
            invoiceNo,
            totalAmount,
            invoiceDate,
            currency,
            stationGetOff,
            stationGetOn,
            time,
            passengerName,
            insurancePremium = 0,
            cardNumber
        } = billData;
        const todayTimestamp = moment().format('X');
        const { disabledEdit, invoiceType } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled = !invoiceCode || !invoiceNo || !invoiceDate || !totalAmount || !stationGetOn || !stationGetOff;
        let disabledText = '';
        if (disabled) {
            disabledText = '必填字段不能为空';
        } else if (notModify) {
            disabledText = '数据未发生变化';
        }

        disabled = disabled || notModify;

        return (
            <div className='noneAddedBillForm'>
                <ScrollWrapper height={this.props.clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            <div className='clearfix' key='modify'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft'>
                                    <label className='require'>发票代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={12}
                                        type='text'
                                        value={invoiceCode}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, invoiceCode: e.target.value.trim() }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label className='require'>发票号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={10}
                                        type='text'
                                        value={invoiceNo}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, invoiceNo: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft col1'>
                                    <label className='require'>日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        disabled={disabledEdit}
                                        disabledDate={(d) => { return (d.format('X') > todayTimestamp); }}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, invoiceDate: e ? e.format('YYYY-MM-DD') : '' }
                                        })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null} format='YYYY-MM-DD'
                                    />
                                </div>
                                <div className='inputItem floatLeft '>
                                    <label className='require'>票价：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={totalAmount}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, totalAmount: e.target.value.trim() }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label>币别：</label>
                                    <Select
                                        disabled={disabledEdit}
                                        style={{ width: '100%' }}
                                        value={currency}
                                        onChange={(v) => this.setState({ billData: { ...billData, currency: v } })}
                                    >
                                        <Option value=''>请选择币别</Option>
                                        <Option value='CNY'>人民币</Option>
                                        <Option value='HKD'>港币</Option>
                                        <Option value='USD'>美元</Option>
                                    </Select>
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft col1'>
                                    <label>时间：</label>
                                    <TimePicker
                                        disabled={disabledEdit}
                                        className='inputPicker'
                                        placeholder='选择乘车时间'
                                        format='HH:mm'
                                        onChange={(date) => this.setState({ billData: { ...billData, time: date ? date.format('YYYY-MM-DD') : '' } })}
                                        value={time ? moment(time, 'HH:mm') : null}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>出发站：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={stationGetOn}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, stationGetOn: e.target.value.trim() }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label className='require'>到达站：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={stationGetOff}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, stationGetOff: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label>姓名：</label>
                                    <Input
                                        type='text'
                                        value={passengerName}
                                        onChange={e => this.setState({
                                            billData: { ...billData, passengerName: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className=''>保险费：</label>
                                    <Input
                                        type='text'
                                        value={insurancePremium}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                insurancePremium: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>证件号码：</label>
                                    <Input
                                        maxLength={18}
                                        type='text'
                                        value={cardNumber}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                cardNumber: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    onSave={this.onSave}
                    onClose={this.props.onClose}
                    saving={saving}
                    disabledText={disabledText}
                    disabled={disabled}
                    disabledEdit={disabledEdit}
                />
            </div>
        );
    }
}


export default TrafficBill;
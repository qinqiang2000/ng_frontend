//轮船票

import React from 'react';
import { Input, DatePicker, Select } from 'antd';
import moment from 'moment';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import BaseBill from './baseBill';
import Immutable from 'immutable';

const Option = Select.Option;

class ShipBill extends BaseBill {
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
            passengerName,
            invoiceDate,
            totalAmount,
            currency,
            stationGetOn,
            stationGetOff
        } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceCode,
            invoiceNo,
            passengerName,
            invoiceDate,
            totalAmount,
            currency,
            stationGetOn,
            stationGetOff
        });
        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const { passengerName, invoiceDate, totalAmount, currency, stationGetOn, stationGetOff, invoiceCode, invoiceNo } = this.state.billData;
        const todayTimestamp = moment().format('X');

        const { disabledEdit, invoiceType } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled = !invoiceCode || !invoiceNo || !totalAmount || !invoiceDate || !stationGetOn || !stationGetOff || !passengerName;
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
                                        type='text'
                                        value={invoiceCode}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceCode: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label className='require'>发票号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceNo}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceNo: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft col1'>
                                    <label className='require'>金额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={totalAmount}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                totalAmount: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>乘船日期：</label>
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
                                <div className='inputItem floatLeft'>
                                    <label className='require'>乘船人：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={passengerName}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                passengerName: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft col1'>
                                    <label className='require'>出发地：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={stationGetOn}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                stationGetOn: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label className='require'>到达地：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={stationGetOff}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                stationGetOff: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>币别：</label>
                                    <Select
                                        disabled={disabledEdit}
                                        value={currency}
                                        style={{ width: '100%' }}
                                        onChange={(v) => this.setState({ billData: { ...billData, currency: v } })}
                                    >
                                        <Option value=''>请选择币别</Option>
                                        <Option value='CNY'>人民币</Option>
                                        <Option value='HKD'>港币</Option>
                                        <Option value='USD'>美元</Option>
                                    </Select>
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


export default ShipBill;
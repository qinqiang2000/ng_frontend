//过路过桥

import React from 'react';
import { Input, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import Immutable from 'immutable';
import BaseBill from './baseBill';

class TrafficBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        const { invoiceCode, invoiceNo, totalAmount, place, invoiceDate, time, entrance, exit } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceCode,
            invoiceNo,
            totalAmount,
            place,
            invoiceDate,
            time,
            entrance,
            exit
        });
        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const { invoiceCode, invoiceNo, totalAmount, place, invoiceDate, time, entrance, exit } = billData;
        let disabled = !invoiceNo || !invoiceDate || !totalAmount || !exit;

        const todayTimestamp = moment().format('X');
        const { disabledEdit, invoiceType } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
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
                                    <label>发票代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={12}
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
                                        maxLength={10}
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
                                <div className='inputItem floatLeft'>
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
                                    <label>入口：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={entrance}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                entrance: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label className='require'>出口：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={exit}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                exit: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>开票日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        disabled={disabledEdit}
                                        disabledDate={(d) => { return (d.format('X') > todayTimestamp); }}
                                        onChange={(e) => this.setState({ billData: { ...billData, invoiceDate: e ? e.format('YYYY-MM-DD') : '' } })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null}
                                        format='YYYY-MM-DD'
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
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
                                    <label>所在地：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={place}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                place: e.target.value.trim()
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
import React from 'react';
import { Input, message, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import Immutable from 'immutable';

class TaxBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        const {
            place,
            invoiceCode,
            invoiceNo,
            mileage,
            totalAmount,
            invoiceDate,
            timeGetOn,
            timeGetOff
        } = this.state.billData;

        if (!invoiceCode.trim()) {
            message.info('发票代码不能为空');
            return;
        }
        if (!invoiceNo.trim()) {
            message.info('发票号码不能为空');
            return;
        }

        this.setState({
            saving: true
        });

        await this.props.onOk({
            place,
            invoiceCode,
            invoiceNo,
            mileage,
            totalAmount,
            invoiceDate,
            timeGetOn,
            timeGetOff
        });
        this.setState({
            saving: false
        });
    };

    render() {
        const saving = this.state.saving;
        const billData = this.state.billData;
        const {
            invoiceCode,
            invoiceNo,
            mileage,
            totalAmount,
            invoiceDate,
            timeGetOff,
            timeGetOn,
            place
        } = billData;
        const { disabledEdit, invoiceType, clientHeight } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled = !invoiceCode || !invoiceNo || !invoiceDate || !totalAmount || !place;
        let disabledText = '';
        if (disabled) {
            disabledText = '必填字段不能为空';
        } else if (notModify) {
            disabledText = '数据未发生变化';
        }
        disabled = disabled || notModify;
        return (
            <div className='noneAddedBillForm'>
                <ScrollWrapper height={clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            <div className='clearfix'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft'>
                                    <label className='require'>发票代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceCode}
                                        onChange={e =>
                                            this.setState({
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
                                        onChange={e => this.setState({
                                            billData: { ...billData, invoiceNo: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>乘车日期：</label>
                                    <DatePicker
                                        disabled={disabledEdit}
                                        className='inputPicker'
                                        placeholder='选择乘车日期'
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null}
                                        onChange={date => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceDate: date ? date.format('YYYY-MM-DD') : ''
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>上车时间：</label>
                                    <TimePicker
                                        disabled={disabledEdit}
                                        className='inputPicker'
                                        placeholder='选择上车时间'
                                        format='HH:mm'
                                        value={timeGetOn ? moment(timeGetOn, 'HH:mm') : null}
                                        onChange={date => this.setState({
                                            billData: {
                                                ...billData,
                                                timeGetOn: date ? date.format('HH:mm') : ''
                                            }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft'>
                                    <label>下车时间：</label>
                                    <TimePicker
                                        disabled={disabledEdit}
                                        className='inputPicker'
                                        placeholder='选择下车时间'
                                        format='HH:mm'
                                        value={timeGetOff ? moment(timeGetOff, 'HH:mm') : null}
                                        onChange={date => this.setState({
                                            billData: {
                                                ...billData,
                                                timeGetOff: date ? date.format('HH:mm') : ''
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix' style={{ marginBottom: 0 }}>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>金额（含税）：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={totalAmount}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                totalAmount: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>所在地：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={place}
                                        onChange={e => this.setState({
                                            billData: { ...billData, place: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>打车里程：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={mileage}
                                        onChange={e => this.setState({
                                            billData: { ...billData, mileage: e.target.value.trim() }
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

export default TaxBill;

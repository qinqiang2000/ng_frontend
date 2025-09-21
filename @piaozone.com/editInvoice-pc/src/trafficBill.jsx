//公路汽车票

import React from 'react';
import { Button, Input, DatePicker, TimePicker, Select } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
const Option = Select.Option;
class TrafficBill extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSave = this.onSave.bind(this);
        const billData = props.billData || {};

        const { insurancePremium = 0, snapshotUrl, invoiceCode, invoiceNo, totalAmount, invoiceDate, currency = '', cardNumber = '', totalTaxAmount, stationGetOff, stationGetOn, time, passengerName } = billData;
        this.state = {
            imgSrc: snapshotUrl,
            insurancePremium,
            invoiceCode,
            invoiceNo,
            totalAmount,
            invoiceDate: invoiceDate ? moment(billData.invoiceDate, 'YYYY-MM-DD') : null,
            currency,
            cardNumber,
            totalTaxAmount,
            stationGetOff,
            stationGetOn,
            passengerName,
            time: time ? moment(props.billData.time, 'HH:mm') : null,
            saving: false
        };
    }

    onSave = async() => {
        const { invoiceCode, invoiceNo, totalAmount, invoiceDate, currency, cardNumber, totalTaxAmount, stationGetOff, stationGetOn, time, passengerName, insurancePremium } = this.state;

        let invoiceTmpDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';

        this.setState({
            saving: true
        });


        await this.props.onOk({
            ...this.props.billData,
            insurancePremium,
            invoiceDate: invoiceTmpDate,
            passengerName,
            invoiceCode,
            invoiceNo,
            totalAmount,
            currency,
            cardNumber,
            totalTaxAmount,
            stationGetOff,
            stationGetOn,
            time: time ? time.format('HH:mm') : ''
        });


        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        // totalTaxAmount
        const { insurancePremium, invoiceCode, invoiceNo, totalAmount, saving, imgSrc, invoiceDate, currency, cardNumber, stationGetOff, stationGetOn, time, passengerName } = this.state;
        const todayTimestamp = moment().format('X');
        const disabled = !invoiceCode || !invoiceNo || !invoiceDate || !totalAmount || !stationGetOn || !stationGetOn || !stationGetOff;
        return (
            <div className='noneAddedBillForm'>
                <div className='inputItems'>
                    {
                        !disabledEdit ? [
                            <div className='tip' key='text'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。</div>,                            
                            <div className='clearfix' key='btns'>
                                {this.props.children}
                                <div className='inputItem floatLeft'>
                                    <label className='alignRight width70'><span className='require'>*</span>票价：</label>
                                    <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />                            
                                </div>
                                <div className='inputItem floatLeft'>
                                    <Button type='primary' onClick={this.onSave} loading={saving} disabled={disabled}>确定修改</Button>
                                </div>
                            </div>
                        ] : null
                    }

                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>发票代码：</label>
                            <Input disabled={disabledEdit} maxLength={12} type='text' value={invoiceCode} onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>发票号码：</label>
                            <Input disabled={disabledEdit} maxLength={10} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>日期：</label>
                            <DatePicker 
                                disabled={disabledEdit} 
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }} 
                                onChange={(e) => this.setState({ invoiceDate: e })} 
                                value={invoiceDate} format='YYYY-MM-DD' 
                            />
                        </div>
                    </div>

                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>出发站：</label>
                            <Input disabled={disabledEdit} type='text' value={stationGetOn} onChange={(e) => this.setState({ stationGetOn: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>到达站：</label>
                            <Input disabled={disabledEdit} type='text' value={stationGetOff} onChange={(e) => this.setState({ stationGetOff: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>保险费：</label>
                            <Input disabled={disabledEdit} type='text' value={insurancePremium} onChange={(e) => this.setState({ insurancePremium: e.target.value.trim() })} />
                        </div>
                    </div>
                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>                            
                            <label>姓名：</label>
                            <Input disabled={disabledEdit} type='text' value={passengerName} onChange={(e) => this.setState({ passengerName: e.target.value.trim() })} />                            
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>时间：</label>
                            <TimePicker
                                disabled={disabledEdit}
                                className='rangeDate'
                                placeholder='选择乘车时间'
                                format={'HH:mm'}
                                onChange={(date) => this.setState({ time: date })}
                                value={time}
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>币别：</label>
                            <Select disabled={disabledEdit} value={currency} style={{ width: 190 }} onChange={(v) => this.setState({ currency: v })}>
                                <Option value=''>请选择币别</Option>
                                <Option value='CNY'>人民币</Option>
                                <Option value='HKD'>港币</Option>
                                <Option value='USD'>美元</Option>
                            </Select>
                        </div>
                    </div>
                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label>证件号码：</label>
                            <Input
                                maxLength={18}
                                disabled={disabledEdit}
                                type='text'
                                value={cardNumber}
                                onChange={(e) => this.setState({ cardNumber: e.target.value.trim() })}
                            />
                        </div>
                    </div>
                </div>
                <div className='outImg'>
                    <ShowImage src={imgSrc} pixel={this.props.billData.pixel} region={this.props.billData.region} orientation={this.props.billData.orientation} />
                </div>
            </div>
        );
    }
}


TrafficBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default TrafficBill;
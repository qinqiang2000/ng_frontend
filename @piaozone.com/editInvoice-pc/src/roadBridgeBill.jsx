//过路过桥

import React from 'react';
import { Button, Input, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';

class TrafficBill extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSave = this.onSave.bind(this);
        const billData = props.billData || {};
        this.serialNo = billData.serialNo;
        const { snapshotUrl, invoiceCode = '', invoiceNo = '', totalAmount = '', place = '', invoiceDate, time, entrance = '', exit = '' } = billData;

        this.state = {
            imgSrc: snapshotUrl,
            invoiceCode,
            invoiceNo,
            totalAmount,
            place,
            invoiceDate: invoiceDate ? moment(billData.invoiceDate, 'YYYY-MM-DD') : null,
            time: time ? moment(props.billData.time, 'HH:mm') : null,
            entrance,
            exit,
            saving: false
        };
    }

    onSave = async() => {
        const { invoiceCode, invoiceNo, totalAmount, place, invoiceDate, time, entrance, exit } = this.state;
        
        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceCode,
            invoiceNo,
            totalAmount,
            place,
            invoiceDate: invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '',
            time: time ? time.format('HH:mm') : '',
            entrance,
            exit
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { invoiceCode, invoiceNo, totalAmount, place, saving, imgSrc, invoiceDate, time, entrance, exit } = this.state;
        const disabled = !invoiceNo || !invoiceDate || !totalAmount || !exit;
        const todayTimestamp = moment().format('X');
        return (
            <div className='noneAddedBillForm'>
                <div className='inputItems'>
                    {
                        !disabledEdit ? [
                            <div className='tip' key='text'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。</div>,
                            <div className='clearfix' key='btns'>
                                {this.props.children}
                                <div className='inputItem floatLeft'>
                                    <Button type='primary' onClick={this.onSave} loading={saving} disabled={disabled}>确定修改</Button>
                                </div>
                            </div>
                        ] : null
                    }

                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label>发票代码：</label>
                            <Input disabled={disabledEdit} maxLength={12} type='text' value={invoiceCode} onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>发票号码：</label>
                            <Input disabled={disabledEdit} maxLength={10} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>开票日期：</label>
                            <DatePicker 
                                disabled={disabledEdit} 
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }} 
                                onChange={(e) => this.setState({ invoiceDate: e })} 
                                value={invoiceDate} 
                                format='YYYY-MM-DD'
                            />
                        </div>
                    </div>

                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>金额：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>入口：</label>
                            <Input disabled={disabledEdit} type='text' value={entrance} onChange={(e) => this.setState({ entrance: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>出口：</label>
                            <Input disabled={disabledEdit} type='text' value={exit} onChange={(e) => this.setState({ exit: e.target.value.trim() })} />
                        </div>

                    </div>

                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label>时间：</label>
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
                            <label className='alignRight width70'>所在地：</label>
                            <Input disabled={disabledEdit} type='text' value={place} onChange={(e) => this.setState({ place: e.target.value.trim() })} />
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
//轮船票

import React from 'react';
import { Button, Input, DatePicker, Select } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
const Option = Select.Option;

class ShipBill extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSave = this.onSave.bind(this);
        const billData = props.billData || {};

        const { invoiceCode = '', invoiceNo = '', snapshotUrl, passengerName, invoiceDate, totalAmount, currency = '', stationGetOn, stationGetOff } = billData;
        this.state = {
            invoiceCode,
            invoiceNo,
            imgSrc: snapshotUrl,
            passengerName,
            invoiceDate: invoiceDate ? moment(billData.invoiceDate, 'YYYY-MM-DD') : null,
            totalAmount,
            currency,
            stationGetOn,
            stationGetOff,
            saving: false
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
        } = this.state;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceCode,
            invoiceNo,
            passengerName,
            invoiceDate: invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '',
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
        const disabledEdit = this.props.disabledEdit;
        const { invoiceDate, totalAmount, currency, stationGetOn, stationGetOff, saving, imgSrc, invoiceCode, invoiceNo, passengerName } = this.state;
        const todayTimestamp = moment().format('X');
        const disabled = !invoiceCode || !invoiceNo || !invoiceDate || !totalAmount || !stationGetOn || !stationGetOff;

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
                            <label><span className='require'>*</span>发票代码：</label>
                            <Input disabled={disabledEdit} type='text' value={invoiceCode} onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>发票号码：</label>
                            <Input disabled={disabledEdit} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>乘船人：</label>
                            <Input disabled={disabledEdit} type='text' value={passengerName} onChange={(e) => this.setState({ passengerName: e.target.value.trim() })} />
                        </div>
                    </div>

                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>乘船日期：</label>
                            <DatePicker 
                                disabled={disabledEdit} 
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }} 
                                onChange={(e) => this.setState({ invoiceDate: e })} 
                                value={invoiceDate} 
                                format='YYYY-MM-DD' 
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>出发地：</label>
                            <Input disabled={disabledEdit} type='text' value={stationGetOn} onChange={(e) => this.setState({ stationGetOn: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>到达地：</label>
                            <Input disabled={disabledEdit} type='text' value={stationGetOff} onChange={(e) => this.setState({ stationGetOff: e.target.value.trim() })} />
                        </div>
                    </div>
                </div>
                <div className='clearfix' style={{ marginTop: 10 }}>
                    <div className='inputItem floatLeft col1'>
                        <label><span className='require'>*</span>金额：</label>
                        <Input disabled={disabledEdit} maxLength={10} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
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
                <div className='outImg'>
                    <ShowImage src={imgSrc} pixel={this.props.billData.pixel} region={this.props.billData.region} orientation={this.props.billData.orientation} />
                </div>
            </div>
        );
    }
}

ShipBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default ShipBill;
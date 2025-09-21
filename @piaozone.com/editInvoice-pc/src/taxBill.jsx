import React from 'react';
import { Button, Input, message, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';

class TaxBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const { snapshotUrl, invoiceCode = '', invoiceNo = '', mileage = '', totalAmount = '', invoiceDate, timeGetOff, timeGetOn, place } = this.props.billData;
        this.state = {
            imgSrc: snapshotUrl,
            invoiceCode,
            invoiceNo,
            mileage,
            totalAmount,
            invoiceDate: invoiceDate ? moment(invoiceDate) : null,
            timeGetOn: timeGetOn ? moment(timeGetOn, 'HH:mm') : null,
            timeGetOff: timeGetOff ? moment(timeGetOff, 'HH:mm') : null,
            place,
            saving: false
        };
    }

    onSave = async() => {
        let {
            place,
            invoiceCode,
            invoiceNo,
            mileage,
            totalAmount,
            invoiceDate,
            timeGetOn,
            timeGetOff
        } = this.state;
        
        timeGetOn = timeGetOn ? timeGetOn.format('HH:mm') : '';
        timeGetOff = timeGetOff ? timeGetOff.format('HH:mm') : '';
        invoiceDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';

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
            ...this.props.billData,
            place,
            invoiceType: 8,
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
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { invoiceCode, invoiceNo, mileage, totalAmount, saving, invoiceDate, timeGetOff, timeGetOn, imgSrc, place } = this.state;
        const disabled = !invoiceCode || !invoiceNo || !invoiceDate || !place || !totalAmount;
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
                            <label><span className='require'>*</span>发票代码：</label>
                            <Input disabled={disabledEdit} type='text' value={invoiceCode} onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>发票号码：</label>
                            <Input disabled={disabledEdit} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>乘车日期：</label>
                            <DatePicker
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }}
                                disabled={disabledEdit}
                                className='rangeDate'
                                placeholder='选择乘车日期'
                                onChange={(date) => this.setState({ invoiceDate: date })}
                                value={invoiceDate}
                            />
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>金额（含税）：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>所在地：</label>
                            <Input disabled={disabledEdit} type='text' value={place} onChange={(e) => this.setState({ place: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>打车里程：</label>
                            <Input disabled={disabledEdit} type='text' value={mileage} onChange={(e) => this.setState({ mileage: e.target.value.trim() })} />
                        </div>
                    </div>

                    <div className='clearfix'>                        
                        <div className='inputItem floatLeft col1'>
                            <label>上车时间：</label>
                            <TimePicker
                                disabled={disabledEdit}
                                className='rangeDate'
                                placeholder='选择上车时间'
                                format={'HH:mm'}
                                onChange={(date) => this.setState({ timeGetOn: date })}
                                value={timeGetOn}
                            />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>下车时间：</label>
                            <TimePicker
                                disabled={disabledEdit}
                                className='rangeDate'
                                placeholder='选择下车时间'
                                format={'HH:mm'}
                                onChange={(date) => this.setState({ timeGetOff: date })}
                                value={timeGetOff}
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


TaxBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default TaxBill;
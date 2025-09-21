//其他发票

import React from 'react';
import { Button, Input, DatePicker } from 'antd';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
import moment from 'moment';

class QuotaBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const { invoiceCode = '', invoiceNo = '', invoiceDate, totalAmount = '', remark = '', snapshotUrl } = billData;
        let newInvoiceDate = null;
        try {
            newInvoiceDate = invoiceDate ? moment(invoiceDate) : null;
        } catch (error) {
            newInvoiceDate = null;
        }
        this.state = {
            imgSrc: snapshotUrl,
            invoiceCode,
            invoiceNo,
            totalAmount,
            invoiceDate: newInvoiceDate,
            remark,
            saving: false
        };
    }

    onSave = async() => {
        const {
            invoiceCode,
            invoiceNo,
            totalAmount,
            remark
        } = this.state;

        let invoiceDate = this.state.invoiceDate;
        invoiceDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';
        
        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceCode,
            invoiceNo,
            totalAmount,
            invoiceDate,
            remark
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { invoiceCode, invoiceNo, totalAmount, invoiceDate, saving, remark, imgSrc } = this.state;
        const disabled = !totalAmount;
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
                            <label className='alignRight width70'>发票号码：</label>
                            <Input disabled={disabledEdit} maxLength={50} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>金额：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>
                    </div>
                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label>开票日期：</label>
                            <DatePicker
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }} 
                                disabled={disabledEdit}
                                className='rangeDate'
                                placeholder='选择日期'
                                onChange={(date) => this.setState({ invoiceDate: date })}
                                value={invoiceDate}                                
                            />
                        </div>
                        <div className='inputItem floatLeft hidden'>
                            <label><span className='require'>*</span>备注：</label>
                            <Input disabled={disabledEdit} type='text' value={remark} onChange={(e) => this.setState({ remark: e.target.value.trim() })} />
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


QuotaBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default QuotaBill;
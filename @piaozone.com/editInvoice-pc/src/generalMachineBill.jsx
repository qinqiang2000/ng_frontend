import React from 'react';
import { Button, Input, DatePicker } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
//通用机打
class GeneralMachineBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.recognitionSerialNo = billData.recognitionSerialNo;
        const { snapshotUrl, invoiceCode = '', invoiceNo = '', invoiceDate, totalAmount = '', salerName = '', buyerName = '', salerTaxNo, buyerTaxNo } = billData;

        this.state = {
            imgSrc: snapshotUrl,
            invoiceCode,
            invoiceNo,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            totalAmount,
            salerName,
            salerTaxNo,
            buyerTaxNo,
            buyerName,
            disabledEdit: false,
            saving: false
        };
    }

    onSave = async() => {
        const {
            invoiceCode,
            invoiceNo,
            invoiceDate,
            totalAmount,
            salerName,
            salerTaxNo,
            buyerName,
            buyerTaxNo
        } = this.state;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceCode,
            invoiceNo,
            invoiceDate: invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '',
            totalAmount,
            salerName,
            salerTaxNo,
            buyerName,
            buyerTaxNo
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const { invoiceCode, invoiceNo, invoiceDate, totalAmount, salerName, salerTaxNo, buyerName, saving, imgSrc, buyerTaxNo } = this.state;
        const disabledEdit = this.props.disabledEdit;
        const todayTimestamp = moment().format('X');
        const disabled = !invoiceCode || !invoiceNo || !invoiceDate || !totalAmount;

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
                            <Input maxLength={12} disabled={disabledEdit} type='text' value={invoiceCode} onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>发票号码：</label>
                            <Input maxLength={10} disabled={disabledEdit} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
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
                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>合计金额：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>销方名称：</label>
                            <Input disabled={disabledEdit} type='text' value={salerName} onChange={(e) => this.setState({ salerName: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>销方税号：</label>
                            <Input disabled={disabledEdit} type='text' value={salerTaxNo} onChange={(e) => this.setState({ salerTaxNo: e.target.value.trim() })} />
                        </div>
                    </div>
                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label>购方名称：</label>
                            <Input disabled={disabledEdit} type='text' value={buyerName} onChange={(e) => this.setState({ buyerName: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>购方税号：</label>
                            <Input disabled={disabledEdit} type='text' value={buyerTaxNo} onChange={(e) => this.setState({ buyerTaxNo: e.target.value.trim() })} />
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

GeneralMachineBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default GeneralMachineBill;
import React from 'react';
import { Button, Input, DatePicker } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';

//购置税发票
class PurchaseTaxBill extends React.Component {
    constructor(props) {
        super(...arguments);

        const billData = props.billData || {};
        this.recognitionSerialNo = billData.recognitionSerialNo;
        const { taxAuthorityName = '', invoiceDate, totalAmount = '', taxPaidProofNo = '', buyerTaxNo = '', snapshotUrl } = billData;
        this.state = {
            taxAuthorityName,
            imgSrc: snapshotUrl,
            totalAmount,
            taxPaidProofNo,
            buyerTaxNo,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            disabledEdit: false,
            saving: false
        };
    }

    onSave = async() => {
        const {
            taxAuthorityName,
            totalAmount,
            taxPaidProofNo,
            buyerTaxNo,
            invoiceDate
        } = this.state;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            taxAuthorityName,
            totalAmount,
            taxPaidProofNo,
            buyerTaxNo,
            invoiceDate: invoiceDate ? invoiceDate.format('YYYY-MM-DD') : ''
        });

        this.setState({
            saving: false
        });
    }


    render() {
        const disabledEdit = this.props.disabledEdit;
        const { taxAuthorityName, invoiceDate, totalAmount, saving, imgSrc, taxPaidProofNo, buyerTaxNo } = this.state;
        const disabled = !taxAuthorityName || !taxPaidProofNo || !buyerTaxNo || !invoiceDate || !totalAmount;
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
                            <label><span className='require'>*</span>纳税人识别号：</label>
                            <Input disabled={disabledEdit} type='text' value={buyerTaxNo} onChange={(e) => this.setState({ buyerTaxNo: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width95'><span className='require'>*</span>完税证明号码：</label>
                            <Input disabled={disabledEdit} type='text' value={taxPaidProofNo} onChange={(e) => this.setState({ taxPaidProofNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>填发日期：</label>
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
                            <label><span className='require'>*</span>税务机关名称：</label>
                            <Input disabled={disabledEdit} type='text' value={taxAuthorityName} onChange={(e) => this.setState({ taxAuthorityName: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width95'><span className='require'>*</span>金额：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
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

PurchaseTaxBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default PurchaseTaxBill;
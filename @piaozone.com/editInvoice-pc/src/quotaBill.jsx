//定额发票

import React from 'react';
import { Button, Input } from 'antd';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';

class QuotaBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const { invoiceCode = '', invoiceNo = '', totalAmount = '', place = '', snapshotUrl } = billData;

        this.state = {
            imgSrc: snapshotUrl,
            invoiceCode,
            invoiceNo,
            totalAmount,
            place,
            saving: false
        };
    }

    onSave = async() => {
        const {
            invoiceCode,
            invoiceNo,
            totalAmount,
            place
        } = this.state;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceCode,
            invoiceNo,
            totalAmount,
            place
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { invoiceCode, invoiceNo, totalAmount, place, saving, imgSrc } = this.state;
        const disabled = !invoiceCode || !invoiceNo || !totalAmount || !place;

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
                            <Input disabled={disabledEdit} maxLength={12} type='text' value={invoiceCode} onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>发票号码：</label>
                            <Input disabled={disabledEdit} maxLength={10} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>金额：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>
                    </div>
                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>所在地：</label>
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


QuotaBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default QuotaBill;
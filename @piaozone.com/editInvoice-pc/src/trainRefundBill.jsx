import React from 'react';
import { Button, Input, message } from 'antd';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
import ShowImage from './showImage';

class TrainRefundBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const { snapshotUrl, number = '', totalAmount = '' } = billData;
        this.state = {
            imgSrc: snapshotUrl,
            number,
            totalAmount,
            disabledEdit: false,
            saving: false
        };
    }

    onSave = async() => {
        const { number = '', totalAmount = '' } = this.state;

        if (number === '') {
            message.destroy();
            message.info('收据号码不能为空');
            return false;
        }

        if (totalAmount === '') {
            message.destroy();
            message.info('金额不能为空');
            return false;
        }

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceType: 24,
            number,
            totalAmount
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { imgSrc, saving, number = '', totalAmount = '' } = this.state;
        const disabled = !number || !totalAmount;
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

                    <div className='clearfix' style={{ marginTop: 8 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>收据号码：</label>
                            <Input type='text' disabled={disabledEdit} value={number} onChange={(e) => this.setState({ number: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>总金额：</label>
                            <Input type='text' disabled={disabledEdit} value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
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


TrainRefundBill.propTypes = {
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool,
    onOk: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
};

export default TrainRefundBill;
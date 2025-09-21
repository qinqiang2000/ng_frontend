import React from 'react';
import { Button, Input, message, DatePicker } from 'antd';
import moment from 'moment';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
import ShowImage from './showImage';

class CustomsBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const { snapshotUrl, invoiceDate, totalAmount, customDeclarationNo = '', deptName = '', secondDeptName = '' } = billData;
        this.state = {
            imgSrc: snapshotUrl,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            totalAmount,
            customDeclarationNo,
            deptName,
            secondDeptName,
            disabledEdit: false,
            saving: false
        };
    }

    onSave = async() => {
        const { invoiceDate, totalAmount, customDeclarationNo = '', deptName = '', secondDeptName = '' } = this.state;
        let invoiceTmpDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';

        if (customDeclarationNo === '') {
            message.info('缴款书号码不能为空');
            return false;
        }

        if (invoiceTmpDate === '') {
            message.destroy();
            message.info('请选择填发日期');
            return false;
        }

        if (totalAmount === '') {
            message.destroy();
            message.info('合计金额不能为空');
            return false;
        }

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceType: 21,
            invoiceDate: invoiceTmpDate,
            totalAmount,
            customDeclarationNo,
            deptName,
            secondDeptName,
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { imgSrc, saving, invoiceDate, totalAmount, customDeclarationNo = '', deptName = '', secondDeptName = '' } = this.state;
        const disabled = !customDeclarationNo || !invoiceDate || !totalAmount;
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

                    <div className='clearfix' style={{ marginTop: 8 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>缴款书号码：</label>
                            <Input type='text' disabled={disabledEdit} value={customDeclarationNo} onChange={(e) => this.setState({ customDeclarationNo: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight'><span className='require'>*</span>填发日期：</label>
                            <DatePicker
                                className='rangeDate'
                                placeholder='选择填发日期'
                                onChange={(v) => this.setState({ invoiceDate: v })}
                                value={invoiceDate}
                                disabled={disabledEdit}
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }}
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>总金额：</label>
                            <Input type='text' disabled={disabledEdit} value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label>缴款单位一名称：</label>
                            <Input type='text' disabled={disabledEdit} value={deptName} onChange={(e) => this.setState({ deptName: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight'>缴款单位二名称：</label>
                            <Input type='text' disabled={disabledEdit} value={secondDeptName} onChange={(e) => this.setState({ secondDeptName: e.target.value.trim() })} />
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


CustomsBill.propTypes = {
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool,
    onOk: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
};

export default CustomsBill;
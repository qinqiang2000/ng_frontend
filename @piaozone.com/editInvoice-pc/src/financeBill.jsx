import React from 'react';
import { Button, Input, message, DatePicker } from 'antd';
import moment from 'moment';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
import ShowImage from './showImage';

class FinanceBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const {
            snapshotUrl,
            invoiceCode = '',
            invoiceNo = '',
            checkCode = '',
            invoiceDate,
            totalAmount = '',
            invoicingPartyName = '',
            invoicingPartyCode = '',
            payerPartyCode = '',
            payerPartyName = '',
            reviewer = ''
        } = billData;
        this.state = {
            imgSrc: snapshotUrl,
            disabledEdit: false,
            saving: false,
            invoiceCode,
            invoiceNo,
            checkCode,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName,
            reviewer
        };
    }

    onSave = async() => {
        const {
            invoiceCode,
            invoiceNo,
            checkCode,
            invoiceDate,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName,
            reviewer
        } = this.state;
        let invoiceTmpDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';
        if (invoiceCode === '') {
            message.info('票据代码不能为空');
            return false;
        }

        if (invoiceNo === '') {
            message.destroy();
            message.info('票据号码不能为空');
            return false;
        }

        if (totalAmount === '') {
            message.destroy();
            message.info('总金额不能为空');
            return false;
        }

        if (invoiceTmpDate === '' ) {
            message.info('开票日期不能为空');
            return false;
        }

        if (checkCode === '') {
            message.info('校验码不能为空');
            return false;
        }

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceType: 25,
            invoiceCode,
            invoiceNo,
            checkCode,
            invoiceDate: invoiceTmpDate,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName,
            reviewer
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const {
            imgSrc,
            saving,
            invoiceCode,
            invoiceNo,
            checkCode,
            invoiceDate,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName,
            reviewer
        } = this.state;
        const disabled = !invoiceCode || !invoiceNo || !checkCode || !invoiceDate || !totalAmount;
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
                            <label><span className='require'>*</span>票据代码：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={invoiceCode}
                                onChange={(e) => this.setState({ invoiceCode: e.target.value.trim() })}
                            />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>票据号码：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={invoiceNo}
                                onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })}
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>总金额：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={totalAmount}
                                onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })}
                            />
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>开票日期：</label>
                            <DatePicker
                                placeholder="选择开票日期"
                                onChange={(e) => this.setState({ invoiceDate: e })}
                                value={invoiceDate}
                                disabled={disabledEdit}
                                format='YYYY-MM-DD'
                            />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>校验码：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={checkCode}
                                onChange={(e) => this.setState({ checkCode: e.target.value.trim() })}
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>开票单位名称：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={invoicingPartyName}
                                onChange={(e) => this.setState({ invoicingPartyName: e.target.value.trim() })}
                            />
                        </div>
                    </div>
                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label>开票单位代码：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={invoicingPartyCode}
                                onChange={(e) => this.setState({ invoicingPartyCode: e.target.value.trim() })}
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>交款人名称：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={payerPartyName}
                                onChange={(e) => this.setState({ payerPartyName: e.target.value.trim() })}
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>交款人代码：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={payerPartyCode}
                                onChange={(e) => this.setState({ payerPartyCode: e.target.value.trim() })}
                            />
                        </div>
                    </div>
                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label>复核人：</label>
                            <Input
                                type='text'
                                disabled={disabledEdit}
                                value={reviewer}
                                onChange={(e) => this.setState({ reviewer: e.target.value.trim() })}
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


FinanceBill.propTypes = {
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool,
    onOk: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
};

export default FinanceBill;
import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';

//通用机打
class GeneralMachineBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
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
            buyerTaxNo,
            companySeal
        } = this.state.billData;
        this.setState({
            saving: true
        });
        await this.props.onOk({
            invoiceCode,
            invoiceNo,
            invoiceDate,
            totalAmount,
            salerName,
            salerTaxNo,
            buyerName,
            companySeal,
            buyerTaxNo
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const clientHeight = this.props.clientHeight;
        const { invoiceCode, invoiceNo, invoiceDate, totalAmount, salerName, salerTaxNo, buyerName, buyerTaxNo } = billData;
        const todayTimestamp = moment().format('X');
        let disabled = !invoiceCode || !invoiceNo || !totalAmount || !invoiceDate;
        const { disabledEdit, invoiceType } = this.props;
        const notModify = window._.isEqual({ ...billData, invoiceType: invoiceType }, this.props.billData);
        let disabledText = '';
        if (disabled) {
            disabledText = '必填字段不能为空';
        } else if (notModify) {
            disabledText = '数据未发生变化';
        }

        disabled = disabled || notModify;
        return (
            <div className='noneAddedBillForm'>
                <ScrollWrapper height={clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            {
                                !disabledEdit
                                    ? <>
                                        <div className='tip hidden' key='tip'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。</div>
                                        <div className='clearfix' key='modify'>
                                            {this.props.SelectType()}
                                            <div className='inputItem floatLeft'>
                                                <label className='require'>发票代码：</label>
                                                <Input maxLength={12} disabled={disabledEdit} type='text' value={invoiceCode} onChange={(e) => this.setState({ billData: { ...billData, invoiceCode: e.target.value.trim() } })} />
                                            </div>

                                            <div className='inputItem floatLeft'>
                                                <label className='require'>发票号码：</label>
                                                <Input maxLength={10} disabled={disabledEdit} type='text' value={invoiceNo} onChange={(e) => this.setState({ billData: { ...billData, invoiceNo: e.target.value.trim() } })} />
                                            </div>
                                        </div>
                                      </> : null
                            }

                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>开票日期：</label>
                                    <DatePicker className='inputPicker' disabled={disabledEdit} disabledDate={(d) => { return (d.format('X') > todayTimestamp); }} onChange={(e) => this.setState({ billData: { ...billData, invoiceDate: e ? e.format('YYYY-MM-DD') : '' } })} value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null} format='YYYY-MM-DD' />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>合计金额：</label>
                                    <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ billData: { ...billData, totalAmount: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>购方名称：</label>
                                    <Input disabled={disabledEdit} type='text' value={buyerName} onChange={(e) => this.setState({ billData: { ...billData, buyerName: e.target.value.trim() } })} />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label>购方税号：</label>
                                    <Input disabled={disabledEdit} type='text' value={buyerTaxNo} onChange={(e) => this.setState({ billData: { ...billData, buyerTaxNo: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>销方名称：</label>
                                    <Input disabled={disabledEdit} type='text' value={salerName} onChange={(e) => this.setState({ billData: { ...billData, salerName: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>销方税号：</label>
                                    <Input disabled={disabledEdit} type='text' value={salerTaxNo} onChange={(e) => this.setState({ billData: { ...billData, salerTaxNo: e.target.value.trim() } })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    disabledEdit={disabledEdit}
                    onSave={this.onSave}
                    onClose={this.props.onClose}
                    saving={saving}
                    disabledText={disabledText}
                    disabled={disabled}
                />
            </div>
        );
    }
}


export default GeneralMachineBill;
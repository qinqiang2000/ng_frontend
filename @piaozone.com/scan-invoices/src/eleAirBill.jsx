import React from 'react';
import {Input, DatePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import Immutable from 'immutable';

class EleAirBill extends BaseBill{
    constructor(props){
        super(...arguments);
        const billData = props.billData || {};
        this.initBillData = Immutable.fromJS(billData);
        this.state = {
            billData
        };
    }

    onSave = async() => {
        this.setState({
            saving: true
        });
        const { billData } = this.state;
        await this.props.onOk({
            ...billData
        });
        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const clientHeight = this.props.clientHeight;
        const {
            ticketPrice='',
            totalAmount='',
            insurancePremium,
            otherTotalTaxAmount,
            customerName,
            electronicTicketNum,
            customerIdentityNum,
            invoiceDate,
            carrierDate,
            issueDate,
            airportConstructionFee,
            fuelSurcharge,
            totalTaxAmount,
            invoiceNo,
            buyerName,
            buyerTaxNo,
            originalInvoiceNo,
            invoiceType
        } = billData;
        const { disabledEdit, checkCount, lastCheckTime } = this.props;
        let disabled = !invoiceNo || !invoiceDate || !issueDate || !(ticketPrice + '') || !totalAmount || !totalTaxAmount || !buyerName;
        disabled = disabledEdit || disabled;
        let disabledText = '';
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        if(disabled){
            disabledText = disabledEdit ? '已经查验过的发票不允许编辑' : '必填字段不能为空';
        }else if(notModify){
            disabledText = '数据未发生变化';
        }
        return (
            <div className="noneAddedBillForm">
                <ScrollWrapper height={clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className="inputItems" ref="inputItems">
                            {
                                disabled ? (
                                    <div className='tip'>备注：查验次数：{checkCount}次，最后查验时间：{lastCheckTime}</div>
                                ) : (
                                    <div className='tip'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。查验次数：{checkCount}次，最后查验时间：{lastCheckTime}</div>
                                )
                            }
                            <div className="clearfix" key="modify">
                                {this.props.SelectType()}
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">发票号码：</label>
                                    <Input maxLength={20} disabled={disabledEdit} type="text" value={invoiceNo} onChange={(e)=>this.setState({billData:{...billData, invoiceNo: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">合计金额：</label>
                                    <Input type="text" disabled={disabledEdit} value={totalAmount} onChange={(e)=>this.setState({billData:{...billData, totalAmount: e.target.value.trim()}})}  />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">开票日期：</label>
                                    <DatePicker
                                        className="inputPicker"
                                        placeholder="选择开票日期"
                                        onChange={(v)=>this.setState({billData:{...billData, issueDate: v?v.format('YYYY-MM-DD'):''}})}
                                        value={issueDate ? moment(issueDate, 'YYYY-MM-DD'):null}
                                        disabled={disabledEdit}
                                        disabledDate={(d) => { return d && d > moment().endOf('day')}}
                                    />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>乘机日期：</label>
                                    <DatePicker
                                        className="inputPicker"
                                        placeholder="选择乘机日期"
                                        onChange={(v)=>this.setState({billData:{...billData, carrierDate: v?v.format('YYYY-MM-DD'):''}})}
                                        value={carrierDate ? moment(carrierDate, 'YYYY-MM-DD'):null}
                                        disabled={disabledEdit}
                                        // disabledDate={(d) => { return d && d > moment().endOf('day')}}
                                    />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">票价：</label>
                                    <Input type="text" disabled={disabledEdit} value={ticketPrice} onChange={(e)=>this.setState({billData:{...billData, ticketPrice: e.target.value.trim()}})}  />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">增值税税额：</label>
                                    <Input type="text" disabled={disabledEdit} value={totalTaxAmount} onChange={(e)=>this.setState({billData:{...billData, totalTaxAmount: e.target.value.trim()}})}  />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className="require">购方名称：</label>
                                    <Input type='text' disabled={disabledEdit} value={buyerName} onChange={(e)=>this.setState({billData:{...billData, buyerName: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>民航发票基金：</label>
                                    <Input type="text" disabled={disabledEdit} value={airportConstructionFee} onChange={(e)=>this.setState({billData:{...billData, airportConstructionFee: e.target.value.trim()}})}  />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>燃油附加费：</label>
                                    <Input type="text" disabled={disabledEdit} value={fuelSurcharge} onChange={(e)=>this.setState({billData:{...billData, fuelSurcharge: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>电子客票号码：</label>
                                    <Input type="text" disabled={disabledEdit} value={electronicTicketNum} onChange={(e)=>this.setState({billData:{...billData, electronicTicketNum: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>保险费：</label>
                                    <Input type="text" disabled={disabledEdit} value={isNaN(parseFloat(insurancePremium))?'':insurancePremium} onChange={(e)=>this.setState({billData:{...billData, insurancePremium: e.target.value.trim()}})}  />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>其他税费：</label>
                                    <Input type="text" disabled={disabledEdit} value={otherTotalTaxAmount} onChange={(e)=>this.setState({billData:{...billData, otherTotalTaxAmount: e.target.value.trim()}})}  />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>购方税号：</label>
                                    <Input type='text' disabled={disabledEdit} value={buyerTaxNo} onChange={(e)=>this.setState({billData:{...billData,buyerTaxNo: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>身份证号：</label>
                                    <Input maxLength={18} disabled={disabledEdit} type="text" value={customerIdentityNum} onChange={(e)=>this.setState({billData:{...billData, customerIdentityNum: e.target.value.trim()}})} />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>原票号码：</label>
                                    <Input type='text' disabled={disabledEdit} value={originalInvoiceNo} onChange={(e)=>this.setState({billData:{...billData,originalInvoiceNo: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>旅客姓名：</label>
                                    <Input type="text" disabled={disabledEdit} value={customerName} onChange={(e)=>this.setState({billData:{...billData, customerName: e.target.value.trim()}})} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    onShowLedgerdata={this.props.onShowLedgerdata}
                    currentOperate={false}
                    invoiceState={true}
                    disabledEdit={disabledEdit}
                    onSave={this.onSave}
                    onClose={this.props.onClose}
                    onPrintInvoice={this.props.onPrintInvoice}
                    saving={saving}
                    disabledText={disabledText}
                    disabled={disabled}
                />
            </div>
        )
    }

}


export default EleAirBill;
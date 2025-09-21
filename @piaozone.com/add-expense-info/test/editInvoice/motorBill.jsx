import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';

//未识别或未查验成功的增值税发票
class MotorBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        this.setState({
            saving: true
        });
        const { billData } = this.state;
        billData.fpje = billData.invoiceMoney;
        const invoiceAmount = billData.invoiceAmount;
        await this.props.onOk({
            ...billData,
            invoiceAmount
        });
    }


    render() {
        const billData = this.state.billData || [];
        const { saving } = this.state;
        const { invoiceType, disabledEdit = false, clientHeight, ShowImage, SelectType } = this.props;
        const { buyerTaxNo = '', invoiceCode = '', invoiceNo = '', invoiceDate = '', checkCode = '', totalAmount = '', salerName = '', salerTaxNo = '', buyerName = '', snapshotUrl = '', totalTaxAmount = '', invoiceAmount = '' } = billData;
        const todayTimestamp = moment().format('X');
        let disabled = !invoiceCode || !invoiceNo || !invoiceDate || !buyerName || !totalAmount;

        if (invoiceType == 5) {
            disabled = disabled || checkCode.length < 5;
        } else if ([2, 4, 12].indexOf(invoiceType) != -1) {
            disabled = disabled || !invoiceAmount;
        } else if ([1, 3, 15].indexOf(invoiceType) != -1) {
            disabled = disabled || checkCode.length < 5 || !invoiceAmount;
        }

        disabled = disabledEdit || disabled;
        const notModify = window._.isEqual({ ...billData, invoiceType: invoiceType }, this.props.billData);
        let disabledText = '';
        if (disabled) {
            disabledText = disabledEdit ? '已经查验过的发票不允许编辑' : '必填字段不能为空';
        } else if (notModify) {
            disabledText = '数据未发生变化';
        }
        return (
            <div className='noneAddedBillForm'>
                <ScrollWrapper height={clientHeight - 100}>
                    <div>
                        {ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            {
                                disabledEdit ? (
                                    <div className='tip'>备注：已经查验成功的发票不允许修改。</div>
                                ) : null
                            }
                            <div className='clearfix'>
                                {SelectType()}
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>发票代码：</label>
                                    <Input maxLength={12} disabled={disabledEdit} type='text' value={invoiceCode} onChange={(e) => this.setState({ billData: { ...billData, invoiceCode: e.target.value.trim(), fpdm: e.target.value.trim() } })} />
                                </div>

                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>发票号码：</label>
                                    <Input maxLength={10} disabled={disabledEdit} type='text' value={invoiceNo} onChange={(e) => this.setState({ billData: { ...billData, invoiceNo: e.target.value.trim(), fphm: e.target.value.trim() } })} />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>开票日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        disabled={disabledEdit}
                                        disabledDate={(d) => { return (d.format('X') > todayTimestamp); }}
                                        onChange={(e) => this.setState({ billData: { ...billData, invoiceDate: e ? e.format('YYYY-MM-DD') : '', kprq: e ? e.format('YYYY-MM-DD') : '' } })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null}
                                        format='YYYY-MM-DD'
                                    />
                                </div>

                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>不含税金额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceAmount}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceMoney: e.target.value.trim(),
                                                invoiceAmount: e.target.value.trim(),
                                                fpje: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>合计金额：</label>
                                    <Input
                                        type='text'
                                        disabled={disabledEdit}
                                        value={totalAmount}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                totalAmount: e.target.value.trim(),
                                                jshjje: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>购方名称：</label>
                                    <Input type='text' disabled={disabledEdit} value={buyerName} onChange={(e) => this.setState({ billData: { ...billData, buyerName: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>购方税号：</label>
                                    <Input type='text' disabled={disabledEdit} value={buyerTaxNo} onChange={(e) => this.setState({ billData: { ...billData, buyerTaxNo: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>税额：</label>
                                    <Input disabled={disabledEdit} type='text' value={totalTaxAmount} onChange={(e) => this.setState({ billData: { ...billData, totalTaxAmount: e.target.value.trim(), se: e.target.value.trim(), taxAmount: e.target.value.trim() } })} />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>销方名称：</label>
                                    <Input disabled={disabledEdit} type='text' value={salerName} onChange={(e) => this.setState({ billData: { ...billData, salerName: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft  paddLeft90'>
                                    <label>销方税号：</label>
                                    <Input disabled={disabledEdit} type='text' value={salerTaxNo} onChange={(e) => this.setState({ billData: { ...billData, salerTaxNo: e.target.value.trim() } })} />
                                </div>
                            </div>

                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    invoiceState={true}
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


export default MotorBill;
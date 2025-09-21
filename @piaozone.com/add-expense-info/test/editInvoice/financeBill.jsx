import React from 'react';
import { Input, DatePicker } from 'antd';
import BaseBill from './baseBill';
import BottomBtn from './bottomBtn';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import moment from 'moment';
class FinanceBill extends BaseBill {
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
            checkCode,
            invoiceDate,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName
        } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceCode,
            invoiceNo,
            checkCode,
            invoiceDate,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName
        });
    };

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const clientHeight = this.props.clientHeight;
        const { disabledEdit, invoiceType } = this.props;
        const {
            invoiceCode,
            invoiceNo,
            checkCode,
            invoiceDate,
            totalAmount,
            invoicingPartyName,
            invoicingPartyCode,
            payerPartyCode,
            payerPartyName
        } = billData;
        let disabled = !invoiceCode || !invoiceNo || !invoiceDate || !checkCode || !totalAmount;

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
                            <div className='clearfix'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>票据代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceCode}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceCode: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>票据号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceNo}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceNo: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>总金额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={totalAmount}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    totalAmount: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>开票日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        placeholder='选择填发日期'
                                        onChange={v =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    invoiceDate: v ? v.format('YYYY-MM-DD') : ''
                                                }
                                            })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null}
                                        disabled={disabledEdit}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>校验码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={checkCode}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    checkCode: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>开票单位代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoicingPartyCode}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    invoicingPartyCode: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>开票单位名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoicingPartyName}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    invoicingPartyName: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>交款人名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={payerPartyName}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    payerPartyName: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>交款人代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={payerPartyCode}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    payerPartyCode: e.target.value.trim()
                                                }
                                            })}
                                    />
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

export default FinanceBill;

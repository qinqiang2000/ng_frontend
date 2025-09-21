//定额发票

import React from 'react';
import { Input } from 'antd';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import BaseBill from './baseBill';

class QuotaBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        const { invoiceCode, invoiceNo, totalAmount, place, companySeal } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceCode,
            invoiceNo,
            totalAmount,
            place,
            companySeal
        });
    };

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const { disabledEdit, invoiceType } = this.props;
        const {
            invoiceCode,
            invoiceNo,
            totalAmount,
            place
        } = billData;
        let disabled = !invoiceCode || !invoiceNo || !totalAmount || !place;

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
                <ScrollWrapper height={this.props.clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            <div className='clearfix'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft'>
                                    <label className='require'>发票代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={12}
                                        type='text'
                                        value={invoiceCode}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    invoiceCode: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>发票号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={10}
                                        type='text'
                                        value={invoiceNo}
                                        onChange={e =>
                                            this.setState({
                                                billData: { ...billData, invoiceNo: e.target.value.trim() }
                                            })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft col1'>
                                    <label className='require'>金额：</label>
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
                                <div className='inputItem floatLeft'>
                                    <label className='require'>所在地</label>
                                    <Input
                                        type='text'
                                        value={place}
                                        onChange={e =>
                                            this.setState({
                                                billData: { ...billData, place: e.target.value.trim() }
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

export default QuotaBill;

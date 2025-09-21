//其它发票

import React from 'react';
import { Input } from 'antd';
import BaseBill from './baseBill';
import BottomBtn from './bottomBtn';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import Immutable from 'immutable';

class OtherBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        const { totalAmount, invoiceNo, remark } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            totalAmount,
            invoiceNo,
            remark
        });
        this.setState({
            saving: false
        });
    };

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const clientHeight = this.props.clientHeight;
        const { disabledEdit, invoiceType } = this.props;
        const { totalAmount, invoiceNo, remark } = billData;
        let disabled = !totalAmount;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
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
                            <div className='clearfix' key='modify'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft'>
                                    <label className='require'>金额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={totalAmount}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                totalAmount: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>发票号码：</label>
                                    <Input
                                        maxLength={10}
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
                            <div className='inputItems' ref='inputItems'>
                                <div className='inputItem floatLeft'>
                                    <label>备注：</label>
                                    <Input
                                        type='text'
                                        value={remark}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                remark: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    onSave={this.onSave}
                    onClose={this.props.onClose}
                    saving={saving}
                    disabledText={disabledText}
                    disabled={disabled}
                    disabledEdit={disabledEdit}
                />
            </div>
        );
    }
}

export default OtherBill;

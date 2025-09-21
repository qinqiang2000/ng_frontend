//公路汽车票

import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import Immutable from 'immutable';

class CustomsBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        const {
            invoiceDate,
            totalAmount,
            customDeclarationNo = '',
            deptName = '',
            secondDeptName = ''
        } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceDate,
            totalAmount,
            customDeclarationNo,
            deptName,
            secondDeptName
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const {
            invoiceDate,
            totalAmount,
            customDeclarationNo = '',
            deptName = '',
            secondDeptName = ''
        } = billData;
        const todayTimestamp = moment().format('X');
        const { disabledEdit, invoiceType } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled = !customDeclarationNo || !invoiceDate || !totalAmount;
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
                            <div className='clearfix' key='modify'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>缴款书号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={50}
                                        type='text'
                                        value={customDeclarationNo}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, customDeclarationNo: e.target.value.trim() }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>填发日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        disabled={disabledEdit}
                                        disabledDate={(d) => { return (d.format('X') > todayTimestamp); }}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, invoiceDate: e ? e.format('YYYY-MM-DD') : '' }
                                        })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null} format='YYYY-MM-DD'
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft col1'>
                                    <label className='require'>总金额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        maxLength={10}
                                        type='text'
                                        value={totalAmount}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, totalAmount: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>缴款单位一名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={deptName}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, deptName: e.target.value.trim() }
                                        })}
                                    />
                                </div>

                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>缴款单位二名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={secondDeptName}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, secondDeptName: e.target.value.trim() }
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

export default CustomsBill;
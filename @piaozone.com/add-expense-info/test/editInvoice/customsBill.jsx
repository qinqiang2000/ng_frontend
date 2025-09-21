import React from 'react';
import { Input, DatePicker } from 'antd';
import BaseBill from './baseBill';
import BottomBtn from './bottomBtn';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import moment from 'moment';
class CustomsBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData
        };
    }

    onSave = async() => {
        const { invoiceDate, totalAmount, customDeclarationNo, deptName, secondDeptName } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            invoiceDate,
            totalAmount,
            customDeclarationNo,
            deptName, // 缴款单位一
            secondDeptName // 缴款单位二
        });
    };

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const clientHeight = this.props.clientHeight;
        const { disabledEdit, invoiceType } = this.props;
        const { invoiceDate, totalAmount, customDeclarationNo, deptName, secondDeptName } = billData;
        let disabled = !customDeclarationNo || !invoiceDate || !totalAmount;

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
                                    <label className='require'>缴款书号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={customDeclarationNo}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                customDeclarationNo: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>合计金额：</label>
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
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>填发日期：</label>
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
                                    <label>交款单位名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={deptName}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                deptName: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>进口代理公司：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={secondDeptName}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                secondDeptName: e.target.value.trim()
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

export default CustomsBill;

import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import BaseBill from './baseBill';

class FinanceBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: { ...billData },
            saving: false,
            scrollHeight: 0
        };
    }

    componentDidMount() {
        this._isAmounted = true;
        this.setState({
            scrollHeight: this.props.clientHeight - this.refs.inputItems.offsetHeight - 6
        });
    }

    componentWillUnmount() {
        this._isAmounted = false;
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
        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
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
        const { disabledEdit, invoiceType } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled = !invoiceCode || !invoiceNo || !checkCode || !invoiceDate || !totalAmount;
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
                                    <label className='require'>票据代码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceCode}
                                        onChange={(e) => this.setState({
                                            billData: { ...billData, invoiceCode: e.target.value.trim() }
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
                                            billData: { ...billData, invoiceNo: e.target.value.trim() }
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
                                        placeholder='请输入总金额'
                                        value={totalAmount}
                                        onChange={e => this.setState({
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
                                        placeholder='选择行程日期'
                                        onChange={v => this.setState({
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
                                        onChange={e => this.setState({
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
                                    <label>开票单位名称：</label>
                                    <Input
                                        type='text'
                                        value={invoicingPartyCode}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                invoicingPartyCode: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>开票单位代码：</label>
                                    <Input
                                        type='text'
                                        value={invoicingPartyName}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                invoicingPartyName: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='alignRight'>交款人名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={payerPartyName}
                                        onChange={e => this.setState({
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
                                        type='text'
                                        value={payerPartyCode}
                                        onChange={e => this.setState({
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


FinanceBill.propTypes = {
    SelectType: PropTypes.object.isRequired,
    ShowImage: PropTypes.object.isRequired,
    invoiceType: PropTypes.number.isRequired,
    clientHeight: PropTypes.number.isRequired,
    disabledEdit: PropTypes.bool,
    billData: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    onOk: PropTypes.func
};

export default FinanceBill;

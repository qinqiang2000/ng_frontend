import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

//台账全电票查看
class EleSecondHandCarBill extends BaseBill {
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
        await this.props.onOk({
            ...billData
        });
        this.setState({
            saving: false
        });
    }


    render() {
        const billData = this.state.billData || [];
        const { saving } = this.state;
        const { invoiceType, disabledEdit = false, clientHeight, ShowImage, SelectType, checkCount, lastCheckTime } = this.props;
        const {
            buyerTaxNo = '',
            invoiceNo = '',
            invoiceDate = '',
            totalAmount = '',
            salerName = '',
            salerTaxNo = '',
            buyerName = '',
            totalTaxAmount = '',
            invoiceAmount = ''
        } = billData;
        const todayTimestamp = moment().format('X');
        let disabled = !invoiceNo || !invoiceDate || !buyerName || !totalAmount;
        disabled = disabledEdit || disabled;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
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
                                disabled ? (
                                    <div className='tip'>备注：查验次数：{checkCount}次，最后查验时间：{lastCheckTime}</div>
                                ) : (
                                    <div className='tip'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。查验次数：{checkCount}次，最后查验时间：{lastCheckTime}</div>
                                )
                            }

                            <div className='clearfix'>
                                {SelectType()}
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>发票号码：</label>
                                    <Input
                                        maxLength={20}
                                        disabled={disabledEdit}
                                        type='text'
                                        value={invoiceNo}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceNo: e.target.value.trim(),
                                                fphm: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>开票日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        disabled={disabledEdit}
                                        disabledDate={(d) => { return (d.format('X') > todayTimestamp); }}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceDate: e ? e.format('YYYY-MM-DD') : '',
                                                kprq: e ? e.format('YYYY-MM-DD') : ''
                                            }
                                        })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null}
                                        format='YYYY-MM-DD'
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>车价合计</label>
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
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className='require'>购方名称：</label>
                                    <Input
                                        type='text'
                                        disabled={disabledEdit}
                                        value={buyerName}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                buyerName: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>购方税号：</label>
                                    <Input
                                        type='text'
                                        disabled={disabledEdit}
                                        value={buyerTaxNo}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                buyerTaxNo: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className='clearfix'>
                                {/* <div className='inputItem floatLeft paddLeft90'>
                                    <label>税额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={totalTaxAmount}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                totalTaxAmount: e.target.value.trim(),
                                                se: e.target.value.trim(),
                                                taxAmount: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div> */}
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>销方名称：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={salerName}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                salerName: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>销方税号：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        value={salerTaxNo}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                salerTaxNo: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            {/* <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>不含税金额</label>
                                    <Input
                                        type='text'
                                        disabled={disabledEdit}
                                        value={invoiceAmount}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                invoiceAmount: e.target.value.trim(),
                                                jshjje: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div> */}
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    onShowLedgerdata={this.props.onShowLedgerdata}
                    currentOperate={this.props.currentOperate}
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
        );
    }
}

EleSecondHandCarBill.propTypes = {
    activeIndex: PropTypes.object.isRequired,
    billData: PropTypes.object.isRequired,
    onDelete: PropTypes.func,
    onClose: PropTypes.func,
    onOk: PropTypes.func
};

export default EleSecondHandCarBill;
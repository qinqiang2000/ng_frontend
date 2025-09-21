import React from 'react';
import { Input, message, Select, DatePicker } from 'antd';
import moment from 'moment';
import BaseBill from './baseBill';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';

const Option = Select.Option;
class AirBill extends BaseBill {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const { seatGradeList } = billData;
        const { seatList } = this.seatListMap(seatGradeList);
        this.state = {
            billData,
            seatList
        };
    }

    seatListMap(seatGradeList) { //飞机舱位等级
        let seatList = [];
        if (seatGradeList && seatGradeList.length > 0) {
            seatList = seatGradeList.map((item) => {
                return {
                    label: item.seatGrade + '：' + item.seatName,
                    value: item.seatGrade
                };
            });
        } else {
            seatList = [
                { label: 'F：头等舱', value: 'F' },
                { label: 'C：公务舱（商务舱）', value: 'C' },
                { label: 'Y：普通舱（经济舱）', value: 'Y' }
            ];
        }
        return {
            seatList
        };
    }

    onSave = async() => {
        const { fuelSurcharge, insurancePremium = '', otherTotalTaxAmount = '', airportConstructionFee, airNum = '', printNum = '', invoiceAmount = '', totalAmount = '', customerName = '', electronicTicketNum = '', customerIdentityNum = '', flightNum = '', invoiceDate, seatGrade = '', placeOfDeparture = '', destination = '' } = this.state.billData;
        if (invoiceDate === '') {
            message.destroy();
            message.info('请选择乘机日期');
            return false;
        }

        if (electronicTicketNum === '') {
            message.destroy();
            message.info('请输入电子客票号码');
            return false;
        }
        if (printNum === '') {
            message.destroy();
            message.info('请输入印刷序列号');
            return false;
        }
        if (parseFloat(totalAmount) < parseFloat(otherTotalTaxAmount)) {
            message.info('总价不能小于其他税费', 1.5);
            return false;
        }
        this.setState({
            saving: true
        });
        
        await this.props.onOk({
            invoiceDate,
            fuelSurcharge,
            airportConstructionFee,
            airNum,
            printNum,
            invoiceAmount,
            totalAmount,
            customerName,
            electronicTicketNum,
            customerIdentityNum,
            flightNum,
            seatGrade,
            placeOfDeparture,
            destination,
            insurancePremium: isNaN(parseFloat(insurancePremium)) ? '' : insurancePremium,
            otherTotalTaxAmount
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const clientHeight = this.props.clientHeight;
        const { printNum, invoiceAmount = '', totalAmount = '', insurancePremium, otherTotalTaxAmount, customerName, electronicTicketNum, customerIdentityNum, flightNum, invoiceDate, seatGrade, placeOfDeparture, destination, airportConstructionFee, fuelSurcharge } = billData;
        let disabled = !customerIdentityNum || !printNum || !electronicTicketNum || !invoiceAmount || !totalAmount || !invoiceDate || !placeOfDeparture || !destination || !otherTotalTaxAmount;
        const { disabledEdit, invoiceType } = this.props;
        const { seatList } = this.state;
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
                                !disabledEdit ? [
                                    <div className='tip hidden' key='tip'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。</div>,
                                    <div className='clearfix' key='modify'>
                                        {this.props.SelectType()}
                                        <div className='inputItem floatLeft'>
                                            <label className='require'>身份证号：</label>
                                            <Input maxLength={18} disabled={disabledEdit} type='text' value={customerIdentityNum} onChange={(e) => this.setState({ billData: { ...billData, customerIdentityNum: e.target.value.trim() } })} />
                                        </div>

                                        <div className='inputItem floatLeft'>
                                            <label className='require'>票价：</label>
                                            <Input type='text' disabled={disabledEdit} value={invoiceAmount} onChange={(e) => this.setState({ billData: { ...billData, invoiceAmount: e.target.value.trim() } })} />
                                        </div>
                                    </div>
                                ] : null
                            }

                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft110'>
                                    <label className='require'>电子客票号码：</label>
                                    <Input type='text' disabled={disabledEdit} value={electronicTicketNum} onChange={(e) => this.setState({ billData: { ...billData, electronicTicketNum: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>总价：</label>
                                    <Input type='text' disabled={disabledEdit} value={totalAmount} onChange={(e) => this.setState({ billData: { ...billData, totalAmount: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>顾客姓名：</label>
                                    <Input type='text' disabled={disabledEdit} value={customerName} onChange={(e) => this.setState({ billData: { ...billData, customerName: e.target.value.trim() } })} />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft110'>
                                    <label className='require'>乘机日期：</label>
                                    <DatePicker
                                        className='inputPicker'
                                        placeholder='选择行程日期'
                                        onChange={(v) => this.setState({ billData: { ...billData, invoiceDate: v ? v.format('YYYY-MM-DD') : '' } })}
                                        value={invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null}
                                        disabled={disabledEdit}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>印刷序列号：</label>
                                    <Input placeholder='请输入印刷序列号' disabled={disabledEdit} type='text' value={printNum} onChange={(e) => this.setState({ billData: { ...billData, printNum: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft twoCols'>
                                    <label className='require'>行程：</label>
                                    <span className='colItem colItem1'>
                                        <Input type='text' disabled={disabledEdit} placeholder='开始行程' value={placeOfDeparture} onChange={(e) => this.setState({ billData: { ...billData, placeOfDeparture: e.target.value.trim() } })} />
                                    </span>
                                    <span className='joinCut'>-</span>
                                    <span className='colItem'>
                                        <Input type='text' disabled={disabledEdit} placeholder='结束行程' value={destination} onChange={(e) => this.setState({ billData: { ...billData, destination: e.target.value.trim() } })} />
                                    </span>
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft110'>
                                    <label className='require'>其他税费：</label>
                                    <Input type='text' disabled={disabledEdit} value={otherTotalTaxAmount} onChange={(e) => this.setState({ billData: { ...billData, otherTotalTaxAmount: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>座位等级：</label>
                                    <Select
                                        defaultValue='请选择座位等级'
                                        value={seatGrade}
                                        style={{ width: '100%' }}
                                        onChange={(v) => this.setState({ billData: { ...billData, seatGrade: v } })}
                                        disabled={disabledEdit}
                                    >
                                        {
                                            seatList.map((item) => {
                                                return (
                                                    <Option value={item.value} key={item.value}>{item.label}</Option>
                                                );
                                            })
                                        }
                                    </Select>
                                </div>


                                <div className='inputItem floatLeft'>
                                    <label>机场建设费：</label>
                                    <Input type='text' disabled={disabledEdit} value={airportConstructionFee} onChange={(e) => this.setState({ billData: { ...billData, airportConstructionFee: e.target.value.trim() } })} />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft paddLeft110'>
                                    <label>燃油附加费：</label>
                                    <Input type='text' disabled={disabledEdit} value={fuelSurcharge} onChange={(e) => this.setState({ billData: { ...billData, fuelSurcharge: e.target.value.trim() } })} />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>保险费：</label>
                                    <Input type='text' disabled={disabledEdit} value={isNaN(parseFloat(insurancePremium)) ? '' : insurancePremium} onChange={(e) => this.setState({ billData: { ...billData, insurancePremium: e.target.value.trim() } })} />
                                </div>


                                <div className='inputItem floatLeft'>
                                    <label>航班号：</label>
                                    <Input type='text' disabled={disabledEdit} value={flightNum} onChange={(e) => this.setState({ billData: { ...billData, flightNum: e.target.value.trim() } })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    onSave={disabledEdit ? null : this.onSave}
                    onClose={this.props.onClose}
                    saving={saving}
                    disabledText={disabledText}
                    disabled={disabled}
                />
            </div>
        );
    }
}


export default AirBill;
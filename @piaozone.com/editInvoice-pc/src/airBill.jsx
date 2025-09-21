import React from 'react';
import { Button, Input, message, Select, DatePicker } from 'antd';
import moment from 'moment';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
import ShowImage from './showImage';
const Option = Select.Option;
const flight = [
    {label: '无', value: '0'},
    {label: '国内', value: '1'},
    {label: '国际', value: '2'}
];

class AirBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const { snapshotUrl, totalAmount = '', airNum = '', fuelSurcharge = '', airportConstructionFee = '0', insurancePremium,  printNum = '', invoiceAmount = '', customerName = '', electronicTicketNum = '', customerIdentityNum = '', flightNum = '', internationalFlag = '0', invoiceDate, seatGrade = '', placeOfDeparture = '', destination = '', otherTotalTaxAmount = '' } = billData;
        const { seatGradeList } = billData;
        const { seatList } = this.seatListMap(seatGradeList);
        this.state = {
            imgSrc: snapshotUrl,
            airportConstructionFee,
            insurancePremium: insurancePremium || '0',
            fuelSurcharge,
            airNum,
            printNum,
            totalAmount,
            invoiceAmount,
            customerName,
            electronicTicketNum,
            customerIdentityNum,
            flightNum,
            internationalFlag,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            seatGrade,
            placeOfDeparture,
            destination,
            otherTotalTaxAmount,
            disabledEdit: false,
            saving: false,
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
                }
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
        const { fuelSurcharge, airportConstructionFee, insurancePremium, airNum = '', printNum = '', invoiceAmount = '', customerName = '', electronicTicketNum = '', customerIdentityNum = '', flightNum = '', internationalFlag = '0', invoiceDate, seatGrade = '', placeOfDeparture = '', destination = '', totalAmount = '', otherTotalTaxAmount } = this.state;
        let invoiceTmpDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';

        if (invoiceTmpDate === '') {
            message.destroy();
            message.info('请选择乘机日期');
            return false;
        }

        if (electronicTicketNum === '') {
            message.destroy();
            message.info('请输入电子客票号码');
            return false;
        }

        // if (parseFloat(totalAmount) < parseFloat(otherTotalTaxAmount)) {
        //     message.info('总价不能小于其他税费', 1.5);
        //     return false;
        // }

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceType: 10,
            invoiceDate: invoiceTmpDate,
            fuelSurcharge,
            airportConstructionFee,
            insurancePremium,
            airNum,
            printNum,
            invoiceAmount,
            totalAmount,
            customerName,
            electronicTicketNum,
            customerIdentityNum,
            flightNum,
            internationalFlag,
            seatGrade,
            placeOfDeparture,
            destination,
            otherTotalTaxAmount
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const { imgSrc, printNum, customerName, invoiceAmount = '', electronicTicketNum, customerIdentityNum, flightNum, internationalFlag, invoiceDate, seatGrade, placeOfDeparture, destination, airportConstructionFee, insurancePremium, fuelSurcharge, totalAmount, otherTotalTaxAmount, saving } = this.state;
        const disabled = !electronicTicketNum || !placeOfDeparture || !destination || !invoiceAmount || !otherTotalTaxAmount || !invoiceDate || !totalAmount || !printNum;
        const { seatList } = this.state;
        const todayTimestamp = moment().format('X');
        return (
            <div className='noneAddedBillForm'>
                <div className='inputItems'>
                    {
                        !disabledEdit ? [
                            <div className='tip' key='text'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。</div>,
                            <div className='clearfix' key='btns'>
                                {this.props.children}
                                <div className='inputItem floatLeft'>
                                    <Button type='primary' onClick={this.onSave} loading={saving} disabled={disabled}>确定修改</Button>
                                </div>
                            </div>
                        ] : null
                    }

                    <div className='clearfix' style={{ marginTop: 8 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>电子客票号码：</label>
                            <Input type='text' disabled={disabledEdit} value={electronicTicketNum} onChange={(e) => this.setState({ electronicTicketNum: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>身份证号：</label>
                            <Input maxLength={18} disabled={disabledEdit} type='text' value={customerIdentityNum} onChange={(e) => this.setState({ customerIdentityNum: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>行程：</label>
                            <Input type='text' disabled={disabledEdit} placeholder='开始行程' value={placeOfDeparture} onChange={(e) => this.setState({ placeOfDeparture: e.target.value.trim() })} style={{ width: 90 }} />
                            <span className='joinCut'>-</span>
                            <Input type='text' disabled={disabledEdit} placeholder='结束行程' value={destination} onChange={(e) => this.setState({ destination: e.target.value.trim() })} style={{ width: 90 }} />
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>总价：</label>
                            <Input type='text' disabled={disabledEdit} value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>顾客姓名：</label>
                            <Input type='text' disabled={disabledEdit} value={customerName} onChange={(e) => this.setState({ customerName: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>乘机日期：</label>
                            <DatePicker
                                className='rangeDate'
                                placeholder='选择行程日期'
                                onChange={(v) => this.setState({ invoiceDate: v })}
                                value={invoiceDate}
                                disabled={disabledEdit}
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }}
                            />
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>票价：</label>
                            <Input type='text' disabled={disabledEdit} value={invoiceAmount} onChange={(e) => this.setState({ invoiceAmount: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>印刷序列号：</label>
                            <Input placeholder='请输入印刷序列号' disabled={disabledEdit} type='text' value={printNum} onChange={(e) => this.setState({ printNum: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'><span className='require'>*</span>其他税费：</label>
                            <Input type='text' disabled={disabledEdit} value={otherTotalTaxAmount} onChange={(e) => this.setState({ otherTotalTaxAmount: e.target.value.trim() })} />
                        </div>


                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label>燃油附加费：</label>
                            <Input type='text' disabled={disabledEdit} value={fuelSurcharge} onChange={(e) => this.setState({ fuelSurcharge: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>航班号：</label>
                            <Input type='text' disabled={disabledEdit} value={flightNum} onChange={(e) => this.setState({ flightNum: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width85'>座位等级：</label>
                            <Select
                                defaultValue='请选择座位等级'
                                value={seatGrade}
                                style={{ width: 190 }}
                                onChange={(v) => this.setState({ seatGrade: v })}
                                disabled={disabledEdit}
                            >
                                {
                                    seatList.map((item)=>{
                                        return (
                                            <Option value={item.value} key={item.value}>{item.label}</Option>
                                        )
                                    })
                                }
                            </Select>
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft' style={{ marginLeft: 0 }}>
                            <label>机场建设费：</label>
                            <Input type='text' disabled={disabledEdit} value={airportConstructionFee} onChange={(e) => this.setState({ airportConstructionFee: e.target.value.trim() })} />
                        </div>
                        <div className="inputItem floatLeft">
                            <label className='alignRight width85'>保险费：</label>
                            <Input type="text" disabled={disabledEdit} value={isNaN(parseFloat(insurancePremium))? '' :insurancePremium} onChange={(e) => this.setState({ insurancePremium: e.target.value.trim() })}  />
                        </div>
                        <div className="inputItem floatLeft">
                            <label className='alignRight width85'>国际国内标识：</label>
                            <Select
                                defaultValue='请选择国际国内航班标识'
                                value={flight[internationalFlag].label}
                                style={{ width: 190 }}
                                onChange={(v)=>this.setState({ internationalFlag: v })}
                                disabled={disabledEdit}
                            >
                                {
                                    flight.map((item) => {
                                        return (
                                            <Option value={item.value} key={item.value}>{item.label}</Option>
                                        )
                                    })
                                }
                            </Select>
                        </div>
                    </div>
                </div>
                <div className='outImg'>
                    <ShowImage src={imgSrc} pixel={this.props.billData.pixel} region={this.props.billData.region} orientation={this.props.billData.orientation} />
                </div>
            </div>
        );
    }
}


AirBill.propTypes = {
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool,
    onOk: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
};

export default AirBill;
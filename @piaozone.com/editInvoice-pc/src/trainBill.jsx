import React from 'react';
import { Button, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
const ywlxArr=[ //火车票的业务类型
    { label: '售', value: 1 },
    { label: '退', value: 2 }
];
const Option = Select.Option;

class TrainBill extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSave = this.onSave.bind(this);
        const billData = this.props.billData;
        const {
            snapshotUrl,
            passengerName = '',
            printingSequenceNo = '',
            totalAmount = '',
            stationGetOn = '',
            stationGetOff = '',
            trainNum = '',
            invoiceDate,
            seat = '',
            trainSno = '',
            customerIdentityNum = '',
            businessType = 1
        } = billData;
        this.state = {
            imgSrc: snapshotUrl,
            passengerName,
            customerIdentityNum,
            printingSequenceNo,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            seat,
            trainSno,
            businessType,
            disabledEdit: false,
            saving: false
        };
    }


    async onSave() {
        const {
            passengerName,
            printingSequenceNo,
            customerIdentityNum,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            invoiceDate,
            seat,
            businessType
        } = this.state;
        let invoiceTmpDate = invoiceDate ? invoiceDate.format('YYYY-MM-DD') : '';

        this.setState({
            saving: true
        });
        await this.props.onOk({
            ...this.props.billData,
            passengerName,
            printingSequenceNo,
            customerIdentityNum,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            seat,
            businessType,
            invoiceDate: invoiceTmpDate
        });

        this.setState({
            saving: false
        });
    }

    render() {
        const disabledEdit = this.props.disabledEdit;
        const {
            passengerName,
            printingSequenceNo,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            saving,
            invoiceDate,
            imgSrc,
            seat,
            customerIdentityNum,
            businessType
        } = this.state;
        const disabled = !printingSequenceNo || !trainNum || !totalAmount || !stationGetOn || !stationGetOff || !invoiceDate;
        const todayTimestamp = moment().format('X');
        const ywlx = ywlxArr.filter((item) => {
            return item.value == businessType;
        });
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

                    <div className='clearfix ' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>车次：</label>
                            <Input disabled={disabledEdit} type='text' placeholder='请输入车次' value={trainNum} onChange={(e) => this.setState({ trainNum: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>印刷序号：</label>
                            <Input disabled={disabledEdit} type='text' placeholder='请输入印刷序号' value={printingSequenceNo} onChange={(e) => this.setState({ printingSequenceNo: e.target.value.trim() })} />

                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>乘车日期：</label>
                            <DatePicker
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }}
                                className='rangeDate'
                                placeholder='选择行程日期'
                                onChange={(v) => this.setState({ invoiceDate: v })}
                                value={invoiceDate}
                                disabled={disabledEdit}
                            />
                        </div>
                    </div>

                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>金额（含税）：</label>
                            <Input disabled={disabledEdit} type='text' value={totalAmount} onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })} />
                        </div>

                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>行程：</label>
                            <Input disabled={disabledEdit} type='text' placeholder='开始行程' value={stationGetOn} onChange={(e) => this.setState({ stationGetOn: e.target.value.trim() })} style={{ width: 90 }} />
                            <span className='joinCut'>-</span>
                            <Input disabled={disabledEdit} type='text' placeholder='结束行程' value={stationGetOff} onChange={(e) => this.setState({ stationGetOff: e.target.value.trim() })} style={{ width: 90 }} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>身份证号：</label>
                            <Input maxLength={18} disabled={disabledEdit} type='text' value={customerIdentityNum} onChange={(e) => this.setState({ customerIdentityNum: e.target.value.trim() })} />
                        </div>
                    </div>
                    <div className='clearfix'>
                        <div className='inputItem floatLeft col1'>
                            <label>座位等级：</label>
                            <Select disabled={disabledEdit} value={seat} style={{ width: 190 }} onChange={(v) => this.setState({ seat: v })}>
                                <Option value=''>选择座位等级</Option>
                                <Option value='二等座'>二等座</Option>
                                <Option value='一等座'>一等座</Option>
                                <Option value='特等座'>特等座</Option>
                                <Option value='商务座'>商务座</Option>
                                <Option value='无座'>无座</Option>
                            </Select>
                        </div>
                        <div className="inputItem floatLeft">
                            <label className='alignRight width70'>业务类型：</label>
                            <Select
                                disabled={disabledEdit}
                                value={ywlx[0].label}
                                style={{ width: 190 }}
                                onChange={(v) => this.setState({  businessType: v })}
                            >
                                {
                                    ywlxArr.map((item) => {
                                        return (
                                            <Option value={item.value} key={item.value}>{item.label}</Option>
                                        )
                                    })
                                }
                            </Select>
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'>姓名：</label>
                            <Input type='text' disabled={disabledEdit} value={passengerName} onChange={(e) => this.setState({ passengerName: e.target.value.trim() })} />
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

TrainBill.propTypes = {
    onOk: PropTypes.func.isRequired,
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired
};

export default TrainBill;
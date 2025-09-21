import React from "react";
import { Input, Select, DatePicker } from "antd";
import moment from "moment";
import Immutable from 'immutable';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';

const Option = Select.Option;

class EleTrainBill extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSave = this.onSave.bind(this);
        const billData = props.billData || {};
        this.initBillData = Immutable.fromJS(billData);

        this.state = {
            billData: { ...billData },
            saving: false,
            scrollHeight: 0
        };
    }

    async onSave() {
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
        const billData = this.state.billData;
        const saving = this.state.saving;
        const {
            invoiceNo,
            carrierDate,
            issueDate,
            typeOfBusiness,
            customerIdentityNum,
            passengerName,
            totalTaxAmount,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            seat,
            buyerName,
            buyerTaxNo,
            originalInvoiceNo
        } = this.state.billData;
        const { disabledEdit, invoiceType, checkCount, lastCheckTime } = this.props;

        
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled =
            !invoiceNo ||
            !issueDate ||
            !totalAmount ||
            !buyerName;
        let disabledText = "";
        disabled = disabledEdit || disabled;

        if (disabled) {
            disabledText = "必填字段不能为空";
        } else if (notModify) {
            disabledText = "数据未发生变化";
        }
        return (
            <div className="noneAddedBillForm">
                <ScrollWrapper height={this.props.clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className="inputItems" ref="inputItems">
                                {
                                    disabled ? (
                                        <div className='tip'>备注：查验次数：{checkCount}次，最后查验时间：{lastCheckTime}</div>
                                    ) : (
                                        <div className='tip'>备注：修改发票种类后，请到对应票种下面查看对应的发票数据。查验次数：{checkCount}次，最后查验时间：{lastCheckTime}</div>
                                    )
                                }
                                <div className="clearfix" key="modify">
                                {this.props.SelectType()}
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">发票号码：</label>
                                    <Input
                                        type="text"
                                        disabled={disabledEdit}
                                        value={invoiceNo}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    invoiceNo: e.target.value.trim()
                                                }
                                            })
                                        }
                                    />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>乘车日期：</label>
                                    <DatePicker
                                        className="inputPicker"
                                        placeholder="选择行程日期"
                                        onChange={v =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    carrierDate: v ? v.format("YYYY-MM-DD") : ""
                                                }
                                            })
                                        }
                                        value={carrierDate ? moment(carrierDate,"YYYY-MM-DD") : null}
                                        // disabledDate={(d) => { return d && d > moment().endOf('day')}}
                                        disabled={disabledEdit}
                                    />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">票价：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type="text"
                                        value={totalAmount}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    totalAmount: e.target.value.trim()
                                                }
                                            })
                                        }
                                    />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>证件号码：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type="text"
                                        value={customerIdentityNum}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    customerIdentityNum: e.target.value.trim()
                                                }
                                            })
                                        }
                                    />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>姓名：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type="text"
                                        value={passengerName}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    passengerName: e.target.value.trim()
                                                }
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>税额：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type="text"
                                        value={totalTaxAmount}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    totalTaxAmount: e.target.value.trim()
                                                }
                                            })
                                        }
                                    />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>业务类型：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type="text"
                                        placeholder="请输入"
                                        value={typeOfBusiness}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    typeOfBusiness: e.target.value.trim()
                                                }
                                            })
                                        }
                                    />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>原票号码：</label>
                                    <Input type='text' disabled={disabledEdit} value={originalInvoiceNo} onChange={(e)=>this.setState({billData:{...billData,originalInvoiceNo: e.target.value.trim()}})} />
                                </div>
                            </div>

                            <div className="clearfix">
                                <div className="inputItem floatLeft twoCols paddLeft90">
                                    <label>行程：</label>
                                    <span className="colItem colItem1">
                                        <Input
                                            disabled={disabledEdit}
                                            type="text"
                                            placeholder="出发站"
                                            value={stationGetOn}
                                            onChange={e =>
                                                this.setState({
                                                    billData: {
                                                        ...billData,
                                                        stationGetOn: e.target.value.trim()
                                                    }
                                                })
                                            }
                                        />
                                    </span>
                                    <span className="joinCut">-</span>
                                    <span className="colItem">
                                        <Input
                                            disabled={disabledEdit}
                                            type="text"
                                            placeholder="到达站"
                                            value={stationGetOff}
                                            onChange={e =>
                                                this.setState({
                                                    billData: {
                                                        ...billData,
                                                        stationGetOff: e.target.value.trim()
                                                    }
                                                })
                                            }
                                        />
                                    </span>
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>车次：</label>
                                    <Input disabled={disabledEdit} type="text" value={trainNum} onChange={(e)=>this.setState({billData:{...billData, trainNum: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label>席别：</label>
                                    <Select
                                        disabled={disabledEdit}
                                        value={seat}
                                        style={{ width: "100%" }}
                                        onChange={v =>
                                            this.setState({ billData: { ...billData,seat: v } })
                                        }
                                    >
                                        <Option value="">选择座位等级</Option>
                                        <Option value="二等座">二等座</Option>
                                        <Option value="一等座">一等座</Option>
                                        <Option value="特等座">特等座</Option>
                                        <Option value="商务座">商务座</Option>
                                        <Option value="软卧">软卧</Option>
                                        <Option value="无座">无座</Option>
                                    </Select>
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label className="require">购方名称：</label>
                                    <Input type='text' disabled={disabledEdit} value={buyerName} onChange={(e)=>this.setState({billData:{...billData,buyerName: e.target.value.trim()}})} />
                                </div>
                                <div className='inputItem floatLeft paddLeft90'>
                                    <label>购方税号：</label>
                                    <Input type='text' disabled={disabledEdit} value={buyerTaxNo} onChange={(e)=>this.setState({billData:{...billData,buyerTaxNo: e.target.value.trim()}})} />
                                </div>
                                <div className="inputItem floatLeft paddLeft90">
                                    <label className="require">开票日期：</label>
                                    <DatePicker
                                        className="inputPicker"
                                        placeholder="选择开票日期"
                                        onChange={v =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    issueDate: v ? v.format("YYYY-MM-DD") : ""
                                                }
                                            })
                                        }
                                        value={issueDate ? moment(issueDate,"YYYY-MM-DD") : null}
                                        disabledDate={(d) => { return d && d > moment().endOf('day')}}
                                        disabled={disabledEdit}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollWrapper>
                <BottomBtn
                    onShowLedgerdata={this.props.onShowLedgerdata}
                    currentOperate={false}
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

export default EleTrainBill;

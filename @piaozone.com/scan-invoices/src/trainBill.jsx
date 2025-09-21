import React from 'react';
import { Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import BaseBill from './baseBill';
const Option = Select.Option;
const ywlxArr = [ //火车票的业务类型
    { label: '售', value: 1 },
    { label: '退', value: 2 }
];

class TrainBill extends BaseBill {
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
            scrollHeight:
                this.props.clientHeight - this.refs.inputItems.offsetHeight - 6
        });
    }

    componentWillUnmount() {
        this._isAmounted = false;
    }

    onSave = async() => {
        const {
            passengerName,
            printingSequenceNo,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            invoiceDate,
            seat,
            customerIdentityNum,
            businessType
        } = this.state.billData;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            passengerName,
            printingSequenceNo,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            seat,
            invoiceDate,
            customerIdentityNum,
            businessType
        });
        this.setState({
            saving: false
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const {
            passengerName,
            printingSequenceNo,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            customerIdentityNum,
            invoiceDate,
            seat,
            businessType
        } = this.state.billData;
        const { disabledEdit, invoiceType } = this.props;
        const notModify = Immutable.is(Immutable.fromJS({ ...billData, invoiceType: invoiceType }), this.initBillData);
        let disabled =
            !printingSequenceNo ||
            !trainNum ||
            !invoiceDate ||
            !totalAmount ||
            !stationGetOn ||
            !stationGetOff;
        let disabledText = '';
        if (disabled) {
            disabledText = '必填字段不能为空';
        } else if (notModify) {
            disabledText = '数据未发生变化';
        }
        disabled = disabled || notModify;
        const ywlx = ywlxArr.filter((item) => {
            return item.value == businessType;
        });

        return (
            <div className='noneAddedBillForm'>
                <ScrollWrapper height={this.props.clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            <div className='clearfix' key='modify'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft twoCols'>
                                    <label className='require'>行程：</label>
                                    <span className='colItem colItem1'>
                                        <Input
                                            disabled={disabledEdit}
                                            type='text'
                                            placeholder='开始行程'
                                            value={stationGetOn}
                                            onChange={e => this.setState({
                                                billData: {
                                                    ...billData,
                                                    stationGetOn: e.target.value.trim()
                                                }
                                            })}
                                        />
                                    </span>
                                    <span className='joinCut'>-</span>
                                    <span className='colItem'>
                                        <Input
                                            disabled={disabledEdit}
                                            type='text'
                                            placeholder='结束行程'
                                            value={stationGetOff}
                                            onChange={e => this.setState({
                                                billData: {
                                                    ...billData,
                                                    stationGetOff: e.target.value.trim()
                                                }
                                            })}
                                        />
                                    </span>
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>车次：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        placeholder='请输入车次'
                                        value={trainNum}
                                        onChange={e => this.setState({
                                            billData: { ...billData, trainNum: e.target.value.trim() }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>印刷序号：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        placeholder='请输入印刷序号'
                                        value={printingSequenceNo}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                printingSequenceNo: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>乘车日期：</label>
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
                                <div className='inputItem floatLeft'>
                                    <label className='require'>票价：</label>
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
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label>姓名：</label>
                                    <Input
                                        type='text'
                                        value={passengerName}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                passengerName: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>坐位等级：</label>
                                    <Select
                                        disabled={disabledEdit}
                                        value={seat}
                                        style={{ width: '100%' }}
                                        onChange={v => this.setState({ billData: { ...billData, seat: v } })}
                                    >
                                        <Option value=''>选择坐位等级</Option>
                                        <Option value='二等座'>二等座</Option>
                                        <Option value='一等座'>一等座</Option>
                                        <Option value='特等座'>特等座</Option>
                                        <Option value='商务座'>商务座</Option>
                                        <Option value='无座'>无座</Option>
                                    </Select>
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='alignRight width70'>身份证号：</label>
                                    <Input
                                        maxLength={18}
                                        disabled={disabledEdit}
                                        type='text'
                                        value={customerIdentityNum}
                                        onChange={e => this.setState({
                                            billData: {
                                                ...billData,
                                                customerIdentityNum: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className='clearfix'>
                                <div className='inputItem floatLeft'>
                                    <label className='alignRight width70'>业务类型：</label>
                                    <Select
                                        disabled={disabledEdit}
                                        value={ywlx[0].label}
                                        style={{ width: 190 }}
                                        onChange={v => this.setState({
                                            billData: {
                                                ...billData,
                                                businessType: v
                                            }
                                        })}
                                    >
                                        {
                                            ywlxArr.map((item) => {
                                                return (
                                                    <Option value={item.value} key={item.value}>{item.label}</Option>
                                                );
                                            })
                                        }
                                    </Select>
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


TrainBill.propTypes = {
    SelectType: PropTypes.object.isRequired,
    ShowImage: PropTypes.object.isRequired,
    invoiceType: PropTypes.number.isRequired,
    clientHeight: PropTypes.number.isRequired,
    disabledEdit: PropTypes.bool,
    billData: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    onOk: PropTypes.func
};

export default TrainBill;

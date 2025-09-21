import React from 'react';
import PropTypes from 'prop-types';
import { Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import BottomBtn from './bottomBtn';

const Option = Select.Option;

class TrainBill extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSave = this.onSave.bind(this);
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

    componentWillReceiveProps(nextProps) {
        if (this._isAmounted) {
            if (
                !window._.isEqual(
                    { ...this.state.billData, invoiceType: this.props.invoiceType },
                    nextProps.billData
                )
            ) {
                this.setState({
                    billData: nextProps.billData,
                    saving: false
                });
            } else if (this.state.saving) {
                this.setState({
                    saving: false
                });
            }
        }
    }

    async onSave() {
        const {
            passengerName,
            printingSequenceNo,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            invoiceDate,
            seat,
            customerIdentityNum
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
            customerIdentityNum,
            invoiceDate
        });
    }

    render() {
        const billData = this.state.billData;
        const saving = this.state.saving;
        const {
            passengerName,
            printingSequenceNo,
            customerIdentityNum,
            totalAmount,
            stationGetOn,
            stationGetOff,
            trainNum,
            invoiceDate,
            seat
        } = this.state.billData;
        const { disabledEdit, invoiceType } = this.props;

        const notModify = window._.isEqual(
            { ...billData, invoiceType: invoiceType },
            this.props.billData
        );
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

        return (
            <div className='noneAddedBillForm'>
                <ScrollWrapper height={this.props.clientHeight - 100}>
                    <div>
                        {this.props.ShowImage()}
                        <div className='inputItems' ref='inputItems'>
                            <div className='clearfix' key='modify'>
                                {this.props.SelectType()}
                                <div className='inputItem floatLeft'>
                                    <label>姓名：</label>
                                    <Input
                                        type='text'
                                        disabled={disabledEdit}
                                        value={passengerName}
                                        onChange={e =>
                                            this.setState({
                                                billData: {
                                                    ...billData,
                                                    passengerName: e.target.value.trim()
                                                }
                                            })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label className='require'>车次：</label>
                                    <Input
                                        disabled={disabledEdit}
                                        type='text'
                                        placeholder='请输入车次'
                                        value={trainNum}
                                        onChange={e =>
                                            this.setState({
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
                                        onChange={e =>
                                            this.setState({
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
                                <div className='inputItem floatLeft'>
                                    <label className='require'>票价：</label>
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
                                <div className='inputItem floatLeft twoCols'>
                                    <label className='require'>行程：</label>
                                    <span className='colItem colItem1'>
                                        <Input
                                            disabled={disabledEdit}
                                            type='text'
                                            placeholder='开始行程'
                                            value={stationGetOn}
                                            onChange={e =>
                                                this.setState({
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
                                            onChange={e =>
                                                this.setState({
                                                    billData: {
                                                        ...billData,
                                                        stationGetOff: e.target.value.trim()
                                                    }
                                                })}
                                        />
                                    </span>
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>身份证号：</label>
                                    <Input
                                        maxLength={18}
                                        disabled={disabledEdit}
                                        type='text'
                                        value={customerIdentityNum}
                                        onChange={(e) => this.setState({
                                            billData: {
                                                ...billData,
                                                customerIdentityNum: e.target.value.trim()
                                            }
                                        })}
                                    />
                                </div>
                                <div className='inputItem floatLeft'>
                                    <label>座位等级：</label>
                                    <Select
                                        disabled={disabledEdit}
                                        value={seat}
                                        style={{ width: '100%' }}
                                        onChange={v =>
                                            this.setState({ billData: { ...billData, seat: v } })}
                                    >
                                        <Option value=''>选择座位等级</Option>
                                        <Option value='二等座'>二等座</Option>
                                        <Option value='一等座'>一等座</Option>
                                        <Option value='特等座'>特等座</Option>
                                        <Option value='商务座'>商务座</Option>
                                        <Option value='无座'>无座</Option>
                                    </Select>
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

TrainBill.propTypes = {
    billData: PropTypes.object,
    clientHeight: PropTypes.number,
    ShowImage: PropTypes.func,
    SelectType: PropTypes.func,
    onOk: PropTypes.func,
    onClose: PropTypes.func,
    invoiceType: PropTypes.number,
    disabledEdit: PropTypes.bool
};

export default TrainBill;

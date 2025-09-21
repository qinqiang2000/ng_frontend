//附件

import React from 'react';
import { Input } from 'antd';
import ScanImage from '@piaozone.com/scan-image';
import BottomBtn from './bottomBtn';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import { changeKingdeeUrl } from './tools';
import PropTypes from 'prop-types';

const { TextArea } = Input;

class AttachBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            rotationAngle: billData.frotationAngle || 0,
            billData: billData
        };
    }

    onSave = async() => {
        const { attachmentName, remark = '', serialNo = '' } = this.state.billData;
        this.setState({
            saving: true
        });
        const info = {
            attachmentName,
            remark,
            serialNo,
            frotationAngle: this.state.rotationAngle
        };
        if (typeof this.props.onOk === 'function') {
            await this.props.onOk(info);
        }
        this.setState({
            saving: false
        });
    };

    onRotateDeg = async(rotationAngle) => {
        this.setState({
            rotationAngle
        });
        return { errcode: '0000' };
    }

    createWrapper = () => {
        const { billData, rotationAngle } = this.state;
        const { scrollHeight, clientWidth, total, index } = this.props;
        const { attachmentName, snapshotUrl, remark, serialNo } = billData;
        return (
            <div>
                <div className='outImg' style={{ height: scrollHeight }}>
                    {
                        scrollHeight > 0 ? (
                            <ScanImage
                                id={serialNo}
                                width={clientWidth}
                                height={scrollHeight}
                                visible={this.props.visbile}
                                disabledMouseWheel={true}
                                total={total}
                                index={index}
                                imgSrc={changeKingdeeUrl(snapshotUrl)}
                                displayFlag='showImage'
                                rotateDeg={rotationAngle}
                                onRotateDeg={this.onRotateDeg}
                            />
                        ) : null
                    }
                </div>
                <div className='inputItems' ref='inputItems'>
                    <div className='clearfix'>
                        <div className='inputItem floatLeft' style={{ width: '100%' }}>
                            <label className='require'>附件名称：</label>
                            <Input
                                type='text'
                                value={attachmentName}
                                onChange={(e) => {
                                    this.setState({
                                        billData: {
                                            ...billData,
                                            attachmentName: e.target.value.trim()
                                        }
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className='clearfix'>
                        <div className='inputItem floatLeft' style={{ width: '100%' }}>
                            <label>备注信息：</label>
                            <TextArea
                                value={remark}
                                style={{ resize: 'none', height: 60 }}
                                onChange={(e) => {
                                    this.setState({
                                        billData: {
                                            ...billData,
                                            remark: e.target.value.trim()
                                        }
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { billData, saving } = this.state;
        const { clientHeight } = this.props;
        const { attachmentName } = billData;
        const disabled = !attachmentName;
        return (
            <div className='noneAddedBillForm'>
                {
                    clientHeight ? (
                        <ScrollWrapper height={clientHeight - 50}>
                            {this.createWrapper()}
                        </ScrollWrapper>
                    ) : this.createWrapper()
                }

                <BottomBtn
                    onSave={this.onSave}
                    onClose={this.props.onClose}
                    saving={saving}
                    disabled={disabled}
                />
            </div>
        );
    }
}

AttachBill.propTypes = {
    billData: PropTypes.array.isRequired,
    clientHeight: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    scrollHeight: PropTypes.number,
    clientWidth: PropTypes.number,
    total: PropTypes.number,
    index: PropTypes.number,
    visbile: PropTypes.bool
};

export default AttachBill;

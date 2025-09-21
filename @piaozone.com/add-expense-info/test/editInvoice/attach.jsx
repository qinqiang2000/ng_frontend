//附件
import React from 'react';
import { Input, message } from 'antd';
import ScanImage from '@piaozone.com/scan-image';
import BottomBtn from './bottomBtn';
import ScrollWrapper from '@piaozone.com/scroll-wrapper';
import { changeKingdeeUrl } from '$commons/utils/tools';
import { updateAttach } from '../../services/imported';
const { TextArea } = Input;

class AttachBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            rotationAngle: billData.rotationAngle || 0,
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
            rotationAngle: this.state.rotationAngle
        };
        message.loading('处理中...');
        const res = await updateAttach(info);
        message.destroy();
        this.setState({
            saving: false
        });
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return;
        }
        if (typeof this.props.onOk === 'function') {
            await this.props.onOk(info);
        }
        message.success('保存成功');
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
        const { clientHeight, disabledEdit } = this.props;
        const { attachmentName } = billData;
        const disabled = !attachmentName;
        const deleteInfo = {};
        if (typeof this.props.onDelete === 'function' && !disabledEdit) {
            deleteInfo.onDelete = () => this.props.onDelete(billData);
        }
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
                    onSave={disabledEdit ? null : this.onSave}
                    onClose={this.props.onClose}
                    saving={saving}
                    disabled={disabled}
                    {...deleteInfo}
                />
            </div>
        );
    }
}

export default AttachBill;

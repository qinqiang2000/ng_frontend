/* eslint-disable */
import React from 'react';
import { Button, Tooltip, Spin } from 'antd';
import tipImg from './img/tips_icon.png';

const spanStyles = {
    display: 'inline-block',
    width: '145px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}
class UploadStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: props.status || 'initial',
            t: this.props.t,
            errMsg: props.errMsg
        };
    }
    componentWillReceiveProps(props) {
        this.setState({
            status: props.status,
            errMsg: props.errMsg
        });
    }

    tryAgain = () => {
        // 重新上传(失败重试)
        typeof this.props.tryAgain === 'function' && this.props.tryAgain();
    };
    deleteItem = ()=>{
        typeof this.props.deleteItem === 'function' && this.props.deleteItem();
    }
    render() {
        const { status, t, errMsg } = this.state;
        const repeatbillMsg = '同一批次同一个影像单据编号只能有一条记录，请删除重复数据后再提交'
        if (status === 'error') {
            return (
                <React.Fragment>
                    <Tooltip title={errMsg?.description} placement='top'>
                        <img
                            src={tipImg}
                            style={{ marginRight: 5, width: 24, height: 24 }}
                            alt={t('imgscan.uploadfail')}
                        />
                    </Tooltip>
                    <Button type='primary' size='small' style={{ fontSize: 12 }} onClick={this.tryAgain}>
                        {t('imgscan.reuploadbtn')}
                    </Button>
                </React.Fragment>
            );
        } else if (status === 'uploading') {
            return (
                <React.Fragment>
                    <Spin size='small' style={{ marginRight: 5 }} />
                    <span style={{ fontSize: 12, color: '#1890ff' }}>{t('imgscan.uploading')}</span>
                </React.Fragment>
            );
        } else if (status === 'success') {
            return <span style={{ fontSize: 12, color: '#52c41a' }}>{t('imgscan.uploadsuccess')}</span>;
        } else if (status === 'repeat') {
            return <span style={{ fontSize: 12, color: '#f5222d' }}>{t('imgscan.repeatbill')}</span>;
        } else if (status === 'waiting') {
            return <span style={{ fontSize: 12, color: '#1890ff' }}>{t('imgscan.waiting')}</span>;
        } else if (status === 'exist') {
            return (
                <React.Fragment>
                    <Tooltip title={repeatbillMsg} placement='top'>
                        <img
                            src={tipImg}
                            style={{ marginRight: 5, width: 24, height: 24 }}
                        />
                    </Tooltip>
                    <span style={{
                        fontSize: 12,
                        color: '#f5222d',
                        ...spanStyles
                    }} >{t('imgscan.msg.m38')}</span>
                </React.Fragment>
            );
        } else if (status === 'check-error') {
            return (
                <React.Fragment>
                    <Tooltip title={errMsg?.limitCheckDescription ?? errMsg?.description } placement='top'>
                        <img
                            src={tipImg}
                            style={{ marginRight: 5, width: 24, height: 24 }}
                        />
                    </Tooltip>
                    <span style={{
                        fontSize: 12,
                        color: '#f5222d',
                        ...spanStyles
                    }} >{errMsg?.description}</span>
                </React.Fragment>
            )
        } else if (status === 'duplicateInvoice') {
            return (
                <React.Fragment>
                    <Tooltip title={errMsg?.description } placement='top'>
                        <img
                            src={tipImg}
                            style={{ marginRight: 5, width: 24, height: 24 }}
                        />
                    </Tooltip>
                    <span style={{ fontSize: 12, color: '#f5222d', ...spanStyles }} >{errMsg?.description}</span>
                </React.Fragment>
            )
        } else if (status === 'cancel'){
            return (
                <React.Fragment>
                   <span style={{ fontSize: 12, color: '#f5222d',cursor:'pointer' }} title={"发票文件超过4M ，不能正常进行识别查验，请删除该影像文件，调整大小后重新上传"}>{'发票文件超大，请删除调整重传'}</span>
                   <img
                            src={tipImg}
                            style={{ marginRight: 5, cursor:'pointer', width: 24, height: 24 }}
                            title={"发票文件超过4M ，不能正常进行识别查验，请删除该影像文件，调整大小后重新上传"}
                        />
                </React.Fragment>
            )
        } else if (status === 'recognitionErr') {
            return <span style={{ fontSize: 12, color: '#f5222d' }}>识别失败</span>;
        } else if (status === 'recognitionSuccess') {
            return <span style={{ fontSize: 12, color: '#52c41a' }}>识别成功</span>;
        } else if (status === 'waitingforScanning') {
            return <span style={{ fontSize: 12, color: '#1890ff' }}>{t('imgscan.waitingforScanning')}</span>;
        }
        return null;
    }
}

export default UploadStatus;

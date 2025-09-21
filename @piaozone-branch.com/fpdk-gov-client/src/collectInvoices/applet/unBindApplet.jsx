import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
const iconTp = require('../../commons/img/icon_tp.png');
const UnBindApplet = function({ onGetWxQr }) {
    const [showMiniProgramQrErr, setShowMiniProgramQrErr] = useState('');
    const [miniQrSrc, setMiniQrSrc] = useState('');
    const [oldUserKey, setOldUserKey] = useState('');
    useEffect(() => {
        getWxQr();
    }, []);

    const getWxQr = async() => {
        const res = await onGetWxQr({ oldUserKey });
        let errMsg;
        if (res.errcode === '0000') {
            const resData = res.data;
            if (resData.qrCodeBase64) {
                const { userKey } = resData; //repeat
                setMiniQrSrc('data:image/png;base64,' + resData.qrCodeBase64);
                setOldUserKey(userKey);
            } else {
                errMsg = '获取二维码数据为空';
                setShowMiniProgramQrErr(errMsg + '，点击重试！');
                setMiniQrSrc('');
            }
        } else {
            errMsg = res.description + '[' + res.errcode + ']';
            setShowMiniProgramQrErr(errMsg + '，点击重试！');
            setMiniQrSrc('');
        }
    };
    return (
        <div className='unBindApplet'>
            <div style={{ textAlign: 'center' }}>
                <div className='tipCont'>
                    <p style={{ textIndent: '-6px' }}>【说明】</p>
                    <p>1、扫码绑定小程序采集发票</p>
                    <p>2、选择小程序中的发票推送到企业台账。</p>
                    <p>3、一人一码，请勿将二维码提供给其他人使用。</p>
                    <p style={{ color: '#fbc21a' }}>
                        <img src={iconTp} alt='tips' style={{ width: 18, verticalAlign: 'text-bottom', marginRight: 5 }} />扫码后等待2-5秒钟后，自动刷新绑定结果。
                    </p>
                </div>
                <div className='appletBox' style={{ border: '1px solid #f2f2f2' }}>
                    <p style={{ lineHeight: '280px' }}>
                        {
                            miniQrSrc ? (
                                <img src={miniQrSrc} style={{ width: 280 }} />

                            ) : showMiniProgramQrErr ? (
                                <p
                                    style={{ fontSize: 12, color: 'red', textAlign: 'center', padding: '15px 0', cursor: 'pointer' }}
                                    onClick={getWxQr}
                                >
                                    {showMiniProgramQrErr}
                                </p>
                            ) : (
                                <Icon type='loading' style={{ fontSize: 30, color: '#aaa' }} />
                            )
                        }
                    </p>
                    <p className='appletTips'>微信扫一扫</p>
                </div>
            </div>
        </div>
    );
};

UnBindApplet.propTypes = {
    onGetWxQr: PropTypes.func.isRequired
};

export default UnBindApplet;
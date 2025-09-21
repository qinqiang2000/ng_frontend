import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Spin, Button, message } from 'antd';

import { sleep, getCityInfoByTaxNo } from './utils/common';
import { getEtaxAuthCode, getEtaxAuthCheckResult } from './services/common';

function EtaxAppQrCode(props = {}) {
    const { taxNo = '', loginAccount, qrType } = props;
    const { loginAccountUid, city: propsCity } = loginAccount;
    const [loading, setLoading] = useState(false);
    const [city, citySet] = useState('');
    const [qrInfo, setQrInfo] = useState({});
    const [authLoading, authLoadingSet] = useState(false);
    const isLoaded = useRef(false);
    const rzidRef = useRef('');
    const activeTabRef = useRef(props.activeTab);

    useEffect(() => {
        isLoaded.current = true;
        return () => {
            isLoaded.current = false;
        };
    }, []);

    useEffect(() => {
        citySet(propsCity || getCityInfoByTaxNo(taxNo)?.city || '');
    }, [taxNo]);

    useEffect(() => {
        activeTabRef.current = Number(props.activeTab);
        queryCode();
    }, [props.activeTab]);

    function queryCode() {
        // 首页调用拦截时非当前tab
        if (activeTabRef.current !== qrType) {
            console.log('activeTab diff');
            return;
        };
        if (qrInfo.base64) {
            queryRzResult(qrInfo.rzid, 10);
        } else {
            queryQrCode();
        }
    }

    // 获取认证二维码信息
    const queryQrCode = async() => {
        setLoading(true);
        const res = await getEtaxAuthCode({
            type: qrType,
            account: loginAccountUid
        });
        setLoading(false);
        if (res.errcode !== '0000') {
            setQrInfo({
                status: 2,
                errcode: res.errcode,
                description: res.description
            });
            return;
        }
        const resData = res.data || {};
        rzidRef.current = resData.rzid;
        setQrInfo({
            status: 1, // 1、获取到二维码，并可以进行认证，2、获取二维码识别或者二维码失效需要重新获取，3，扫脸认证成功
            rzid: resData.rzid,
            base64: resData.base64
        });
        queryRzResult(resData.rzid, 10);
    };

    // 轮询认证状态
    const queryRzResult = async(rzid, num, startTime = (+new Date())) => {
        if (!isLoaded.current) {
            console.log('unLoad');
            return;
        }
        if (rzidRef.current !== rzid) {
            console.log('rzid diff');
            return;
        };
        if (activeTabRef.current !== qrType) {
            console.log('activeTab diff');
            return;
        };
        if (((+new Date()) - startTime > 10 * 60 * 1000)) {
            setQrInfo({
                status: 2,
                description: '认证操作最大时长，请重新获取二维码再认证'
            });
            return false;
        }
        const res = await getEtaxAuthCheckResult({
            checkId: rzid,
            type: qrType,
            account: loginAccountUid
        });
        if (res.errcode === '0000') {
            setQrInfo({
                status: 3,
                description: res.description
            });
            props.callback({
                errcode: '0000',
                description: '认证成功！'
            }, {
                loginAccountUid
            });
            return;
        } else if (res.errcode !== '91307') {
            const description = res.description || '税局认证结果获取异常';
            if (~description.indexOf('认证二维码失效') || res.errcode === '91300' || res.errcode === '91400') {
                setQrInfo({
                    status: 2,
                    errcode: res.errcode,
                    description
                });
                // 终止获取
                return;
            } else {
                message.error(res.description);
            }
        }
        authLoadingSet(false);
        // 主动认证且查询到本次认证的结果为未认证
        if (!num) {
            if (res.errcode === '1611') {
                message.error('未查询到税局反馈，请先扫码认证');
            }
            return;
        };
        await sleep(5000);
        await queryRzResult(rzid, num - 1, startTime);
    };

    // 显示登录
    const showLogin = async() => {
        props.visibleLoginSet(true);
    };

    // 完成认证
    const authResult = async() => {
        authLoadingSet(true);
        queryRzResult(qrInfo.rzid);
    };

    return (
        <>
            <p className='tip'>请使用 <b>{qrType === 1 ? `${city}税务` : '个人所得税'}APP</b> 扫描二维码进行身份认证</p>
            <div className='qrBox etax'>
                <div className='qrInfo'>
                    {
                        loading ? (
                            <Spin style={{ marginTop: 100 }} />
                        ) : (
                            <>
                                {
                                    qrInfo.base64 ? (
                                        <img
                                            className='qrImg'
                                            src={qrInfo.base64}
                                            style={{
                                                opacity: qrInfo.status === 2 || qrInfo.status === 3 ? 0.1 : 1
                                            }}
                                        />
                                    ) : null
                                }
                                {
                                    qrInfo.status === 2 ? (
                                        <div className='qrWarning'>
                                            <div className='qrWarn-box'>
                                                {/* { 登录已失效且不能自动登录 } */}
                                                {(qrInfo.errcode === '91300' || qrInfo.errcode === '91400') && loginAccount.autoLogin !== true ? (
                                                    <>
                                                        <p className='errMsg'>电子税局登录失效，请重试！</p>
                                                        <Button loading={loading} size='small' onClick={showLogin} type='primary'>请登录</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className='errMsg'>{qrInfo.description}</p>
                                                        <Button loading={loading} size='small' onClick={queryQrCode} type='primary'>请刷新</Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : qrInfo.status === 3 ? (
                                        <div className='qrWarning'>
                                            <div className='qrWarn-box'>
                                                <p className='successMsg'>认证成功</p>
                                            </div>
                                        </div>
                                    ) : null
                                }
                            </>
                        )
                    }
                </div>
            </div>
            <div className='authBtn'>
                <Button size='large' type='primary' loading={authLoading} onClick={authResult}>完成认证</Button>
            </div>
        </>
    );
}

EtaxAppQrCode.propTypes = {
    taxNo: PropTypes.string.isRequired,
    loginAccount: PropTypes.object.isRequired,
    qrType: PropTypes.number.isRequired,
    activeTab: PropTypes.string.isRequired,
    visibleLoginSet: PropTypes.func.isRequired,
    callback: PropTypes.func.isRequired
};

export default EtaxAppQrCode;

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Radio, message, Modal, Icon, Tooltip } from 'antd';

import { getLongLinkName, getFpdkType, encryptByJSEncrypt } from '../../utils/common';
import { wxRelationQueryInfo, wxRelationQuerySendMsg, wxQrcodeCreate, etaxLoginStatus, getAppConfig } from '../../services/common';
import useIsMounted from '../../hooks/useIsMounted';

export default function MobileLogin(props) {
    // 已检测标识
    const hadInitRef = useRef(false);
    // 第一次检测异常时已提示标识
    const [hadInitTip, hadInitTipSet] = useState(false);
    // 功能支持标识
    const supportForQuickLoginRef = useRef(false);
    // 第一次检测异常时的提示
    const [supportErrorDes, supportErrorDesSet] = useState(null);
    const [loading, loadingSet] = useState(false);
    const isMountedRef = useIsMounted();
    const { loginAccountUid = '', checkAuth = false } = props.loginAccount;
    const longLinkName = getLongLinkName();
    const fpdk_type = getFpdkType();

    useImperativeHandle(props.onRef, () => {
        return {
            queryLoginResult
        };
    });

    useEffect(() => {
        // 第一次检测不提示
        functionSupport(true);
    }, []);

    // 功能支持
    const functionSupport = async(init = false) => {
        if (!init) {
            // 第一次检测不提示
            message.loading('初始化中...', 0);
            loadingSet(true);
        }
        const res = await getAppConfig({
            taxNo: props.taxNo
        });
        if (!init) {
            // 第一次检测不提示
            loadingSet(false);
            message.destroy();
        }
        // 已检测标识
        hadInitRef.current = true;
        if (res.errcode === '0000') {
            const data = res.data;
            if (data.appVersion > '0.0.47') {
                // 支持快捷登录的版本
                supportForQuickLoginRef.current = true;
                // 初始化时 登录途径1微信登录主动点击微信登录
                if (init && props.loginType === '1') {
                    mobileLogin();
                }
            } else if (!init) {
                // 非初始化
                message.warning('请先更新发票智慧管家到最新版本后再操作！');
            }
        } else {
            if (init) {
                // 第一次检测不提示 检测的异常提示
                supportErrorDesSet(res.description);
            } else {
                message.error(res.description);
            }
        }
    };

    // 移动端登录
    const mobileLogin = async() => {
        if (hadInitRef.current) {
            // 已检测
            if (supportForQuickLoginRef.current) {
                if (loginAccountUid) {
                    getWxRelation();
                } else {
                    getWxQrcod();
                }
            } else {
                if (hadInitTip) {
                    functionSupport();
                } else {
                    hadInitTipSet(true);
                    if (supportErrorDes) {
                        message.error(supportErrorDes);
                    } else {
                        message.warning('请先更新发票智慧管家到最新版本后再操作！');
                    }
                }
            }
        } else {
            // 检测中
            message.info('初始化中...');
        }
    };

    // 查询税局账号和公众号绑定信息
    const getWxRelation = async() => {
        loadingSet(true);
        message.loading('查询中...', 0);
        const res = await wxRelationQueryInfo({ taxNo: props.taxNo, loginAccountUid });
        message.destroy();
        loadingSet(false);
        if (res.errcode !== '0000') {
            message.error(res.description);
            return res;
        }
        const { bindFlag, openId } = res.data || {};
        // 是否已绑定
        if (bindFlag === 1) {
            relationSendMsg(openId);
        } else {
            getWxQrcod();
        }
    };

    // 获取微信二维码
    const getWxQrcod = async() => {
        loadingSet(true);
        message.loading('获取中...', 0);
        const res = await wxQrcodeCreate({
            qrcodeType: '1',
            qrcodeSource: '2',
            taxNo: props.taxNo,
            longLinkName,
            data: encryptByJSEncrypt(props.loginAccount)
        });
        message.destroy();
        loadingSet(false);
        if (res.errcode === '0000') {
            const { imgUrl } = res.data;
            if (loginAccountUid) {
                Modal.confirm({
                    centered: true,
                    title: '温馨提示',
                    content: (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                marginRight: '30px'
                            }}
                        >
                            <p>{loginAccountUid}为税局认证绑定的用户，请该用户通过微信扫码关注后完成登录。</p>
                            <img width='140' height='140' src={imgUrl} alt='服务号二维码' />
                        </div>
                    ),
                    cancelText: '取消',
                    okText: '获取登录结果',
                    onOk: () => {
                        queryLoginResult(10);
                    }
                });
            } else {
                Modal.info({
                    centered: true,
                    title: '温馨提示',
                    content: (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                marginRight: '30px'
                            }}
                        >
                            <p>请税局认证绑定的用户通过微信扫码关注后完成登录。</p>
                            <img width='140' height='140' src={imgUrl} alt='服务号二维码' />
                        </div>
                    ),
                    okText: '知道了'
                });
            }
        } else {
            message.error(res.description);
        }
        return res;
    };

    // 推送模板消息
    const relationSendMsg = async(openId) => {
        loadingSet(true);
        message.loading('推送中...', 0);
        const res = await wxRelationQuerySendMsg({
            openId,
            area: props.cityInfo.city,
            taxNo: props.taxNo,
            longLinkName,
            loginAccountUid: encodeURI(loginAccountUid),
            data: encryptByJSEncrypt(props.loginAccount),
            checkAuth, // 身份认证
            fpdk_type,
            operationType: props.operationType
        });
        message.destroy();
        loadingSet(false);
        if (res.errcode === '0000') {
            if (props.isQuickLogin) {
                setTimeout(() => {
                    // showQueryLoginResultModal();
                    // setInterval(() => {
                    queryLoginResult(10);
                    // }, 10000);
                }, 30000);
            } else {
                Modal.confirm({
                    centered: true,
                    title: '温馨提示',
                    content: (
                        <>
                            <p>已向用户{loginAccountUid}绑定的微信用户推送服务号消息，请通知该用户在金蝶发票云服务号中完成验证登录。</p>
                            <p>如需解绑微信用户，请该用户{loginAccountUid}在发票智慧管家-企业信息配置-企业详情中操作。</p>
                        </>
                    ),
                    cancelText: '关闭提示',
                    okText: '获取登录结果',
                    onOk: () => {
                        showQueryLoginResultModal();
                    }
                });
            }
        } else {
            message.error(res.description);
        }
        return res;
    };

    // 提示查询中
    const showQueryLoginResultModal = () => {
        const controller = new AbortController();
        const modal = Modal.info({
            centered: true,
            title: '温馨提示',
            content: <><Icon type='loading' />正在获取登录结果...</>,
            okText: '取消查询',
            okButtonProps: { type: 'default' },
            onOk: () => {
                controller.abort();
            }
        });
        clientQueryLoginResult(controller.signal, modal);
    };

    // 客户端查询登录结果
    const clientQueryLoginResult = async(signal, modal) => {
        const res = await etaxLoginStatus({
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                account: loginAccountUid,
                checkAuth
            })
        });
        if (res.errcode === '0000') {
            // // 查询成功
            modal.destroy();
            // disabledCheckAuth 轮询时无需再去检测扫脸认证
            props.callback(res, { loginAccountUid, disabledCheckAuth: true });
        } else if (res.errcode === '91307' && isMountedRef.current) {
            // 91307还未登录成功需要再次轮询 页面未卸载
            setTimeout(() => {
                queryLoginResult(signal, modal);
            }, 10000);
        } else {
            modal.destroy();
            message.error(res.description);
        }
    };

    // 快捷登录查询登录结果
    const queryLoginResult = async(num) => {
        if (!num) return;
        message.destroy();
        const res = await etaxLoginStatus({
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                account: loginAccountUid,
                checkAuth
            })
        });
        if (res.errcode === '0000') {
            // // 查询成功
            // modal.destroy();
            // disabledCheckAuth 轮询时无需再去检测扫脸认证
            message.success('正在查询登录结果，请勿关闭弹窗', 0);
            props.callback(res, { loginAccountUid, disabledCheckAuth: true });
        } else if (res.errcode === '91307' && isMountedRef.current) {
            // 91307还未登录成功需要再次轮询 页面未卸载
            if (num > 1) {
                setTimeout(() => {
                    queryLoginResult(num - 1);
                }, 1000);
            } else {
                message.success('当前账号未登录', 3);
            }
        } else {
            // modal.destroy();
            message.error(res.description);
        }
    };

    return (
        loginAccountUid ? (
            <Tooltip title={`用户${loginAccountUid}绑定的微信用户可以在金蝶发票云服务号完成登录。`}>
                <Radio disabled={loading} onClick={mobileLogin} value='1'>微信登录</Radio>
            </Tooltip>
        ) : <Radio disabled={loading} onClick={mobileLogin} value='1'>微信登录</Radio>
    );
}

MobileLogin.propTypes = {
    taxNo: PropTypes.string.isRequired,
    cityInfo: PropTypes.object.isRequired,
    loginAccount: PropTypes.object.isRequired,
    callback: PropTypes.func.isRequired,
    loginType: PropTypes.string,
    onRef: PropTypes.func,
    isQuickLogin: PropTypes.bool,
    operationType: PropTypes.string
};

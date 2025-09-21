import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Modal, message, Icon } from 'antd';

import './style.less';
import LoginCom from './login';
import useIsMounted from './hooks/useIsMounted';
import EtaxAppQrCode from './etaxQrCom';
import { getEtaxNeedAuthStatus, etaxLoginType } from './services/common';
import topTips from './img/icon_ts.png';

message.config({
    top: 200,
    duration: 1.5,
    maxCount: 2
});

const DefaultLoginAccount = {
    needLogin: true, // 是否需要登录
    autoLogin: false, // 是否自动登录 新时代不支持暂时忽略
    checkAuth: false, // 是否身份认证
    saveAccountFlag: true
};

const { TabPane } = Tabs;
export default function EtaxLoginNewtimeai(props) {
    // 新时代登录窗口必传税号
    const { taxNo = '', operationType, needLoginType, cityInfo } = props;
    const [isLoaded, isLoadedSet] = useState(false);
    const [loginAccount, loginAccountSet] = useState(DefaultLoginAccount);
    const isMountedRef = useIsMounted();
    const [visibleLogin, visibleLoginSet] = useState(true);
    const [activeTab, setActiveTab] = useState('1');
    const [hideSuccessModal] = useState(props.hideSuccessModal || false);

    useEffect(() => {
        if (isMountedRef.current) {
            init();
        }
        return () => {
            // 关闭所有提示
            message.destroy();
        };
    }, [isMountedRef]);

    // 切换
    const onChangeTab = (v) => {
        setActiveTab(v);
    };

    // 初始化
    async function init() {
        // 隐私模式开启阻止第三方Cookie并通过iframe嵌入访问时，无法设置session
        // 组件引入方式设置全局变量
        window.__INITIAL_STATE__ = {
            TAX_NO: props.taxNo,
            API_PRE_PATH: props.API_PRE_PATH,
            client_type: props.client_type,
            longLinkName: props.longLinkName,
            fpdk_type: props.fpdk_type,
            operationType: props.operationType,
            ...window.__INITIAL_STATE__
        };
        try {
            let data = {};
            if (props.loginAccount && typeof props.loginAccount === 'string') {
                data = JSON.parse(props.loginAccount);
            } else {
                data = props.loginAccount;
            }

            // 先获取
            data = await getLoginAccount(data);
            // 再合并默认值
            data = {
                ...DefaultLoginAccount,
                ...data
            };

            loginAccountSet(data);
            // 身份认证 无需登录
            if (data.checkAuth && (data.autoLogin || !data.needLogin)) {
                visibleLoginSet(false);
            }
        } catch (err) {
            console.error('loginAccount error', err);
        }
        isLoadedSet(true);
    }

    // 获取账号状态
    const getLoginAccount = async(params) => {
        if (!params?.loginAccountUid) {
            // 无loginAccountUid 不请求
            return params;
        }
        // if (params?.city) {
        //     // 兼容 有城市无需请求
        //     return params;
        // }
        if (Reflect.apply(Object.prototype.hasOwnProperty, params, ['needLogin'])) {
            // 有needLogin 代表是从auth_code中获取的 无需请求
            return params;
        }

        const res = await etaxLoginType({
            account: params.loginAccountUid,
            taxNo
        }, { operationType });
        if (res.errcode !== '0000') {
            // 请求异常
            console.log('获取账号信息 error', res);
            return params;
        }
        const { city, etaxAccountType = -1, etaxRoleType, autoLogin } = res.data || {};

        return {
            ...params,
            needLogin: etaxAccountType === -1,
            city, // 城市
            etaxRoleType, // 角色身份
            autoLogin // 是否自动登录
        };
    };

    const loginCallback = (res, opt) => {
        if (res.errcode === '0000') {
            if (loginAccount.checkAuth) {
                scanFaceCheck(opt.loginAccountUid);
            } else {
                baseCallback(res, opt);
            }
        } else {
            Modal.error({
                title: '温馨提示',
                content: res.description
            });
        }
    };

    // 是否需要身份认证
    const scanFaceCheck = async(loginAccountUid) => {
        message.loading('查询中', 0);
        const res = await getEtaxNeedAuthStatus({
            account: loginAccountUid,
            taxNo
        });
        message.destroy();
        if (res.errcode === '0000') {
            const data = res.data || {};
            if (data.needFaceRecognition === true) {
                visibleLoginSet(false);
            } else {
                baseCallback({
                    errcode: '0000',
                    description: '认证成功！'
                }, {
                    loginAccountUid
                });
            }
        } else {
            Modal.error({
                title: '温馨提示',
                content: res.description,
                okText: '重新查询',
                onOk: () => {
                    scanFaceCheck(loginAccountUid);
                }
            });
        }
    };

    // 回调
    const baseCallback = (res, opt) => {
        if (typeof props.callback === 'function') {
            // 组件引入
            props.callback(res, opt);
        } else {
            if (res.errcode === '0000') {
                if (!hideSuccessModal) {
                    noCallbackSuccessModal(res);
                } else {
                    const text = ~(res.description || '').indexOf('认证') ? '认证' : '登录';
                    // 星瀚
                    message.loading(`正在查询${text}结果，请勿关闭弹窗`, 0);
                    console.log(res.description);
                    setTimeout(() => {
                        message.destroy();
                        if (!res.description.includes('成功')) {
                            message.error(res.description);
                        }
                    }, 1500);
                }
            } else {
                Modal.error({
                    title: '温馨提示',
                    content: res.description
                });
            }
        }
    };

    // 无回调时的成功提示
    const noCallbackSuccessModal = (res) => {
        Modal.success({
            centered: true,
            title: '温馨提示',
            content: res.description,
            onOk: () => {
                // 客户端回调
                // eslint-disable-next-line
                window.pwyElectron?.ipcRenderer.send('closeEtaxLogin');
                // 网页端关闭页面
                window.close();
                // 微信关闭页面
                // eslint-disable-next-line
                window.WeixinJSBridge?.call('closeWindow');
            }
        });
    };

    return (
        <div className={`realPersonAuth ${props.className || ''}`} style={props.style}>
            {isLoaded ? (
                <div className='realPersonAuth-box'>
                    {visibleLogin ? (
                        <LoginCom
                            taxNo={taxNo}
                            loginAccount={loginAccount}
                            callback={loginCallback}
                            operationType={operationType}
                            needLoginType={needLoginType}
                            cityInfo={cityInfo}
                        />
                    ) : (
                        <div className='realPersonAuth-main'>
                            <div className='topTip'>
                                <img src={topTips} />
                                为了您开票的安全便捷，稳定可靠，请按照指引完成身份认证处理！
                            </div>
                            <Tabs animated={false} onChange={onChangeTab} activeKey={activeTab}>
                                <TabPane tab='电子税局APP扫脸认证' key='1'>
                                    <EtaxAppQrCode
                                        taxNo={taxNo}
                                        loginAccount={loginAccount}
                                        qrType={1}
                                        activeTab={activeTab}
                                        visibleLoginSet={visibleLoginSet}
                                        callback={baseCallback}
                                    />
                                </TabPane>
                                <TabPane tab='个人所得税APP扫脸认证' key='2'>
                                    <EtaxAppQrCode
                                        taxNo={taxNo}
                                        loginAccount={loginAccount}
                                        qrType={2}
                                        activeTab={activeTab}
                                        visibleLoginSet={visibleLoginSet}
                                        callback={baseCallback}
                                    />
                                </TabPane>
                            </Tabs>
                        </div>
                    )}
                </div>
            ) : (
                <div className='flexCenter'>
                    <Icon type='loading' style={{ fontSize: 40, color: '#3598ff' }} />
                </div>
            )}
        </div>
    );
}

EtaxLoginNewtimeai.defaultProps = {
    className: '',
    style: {},
    API_PRE_PATH: '',
    client_type: 4,
    longLinkName: '',
    fpdk_type: '3',
    operationType: ''
};

EtaxLoginNewtimeai.propTypes = {
    taxNo: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    API_PRE_PATH: PropTypes.string,
    client_type: PropTypes.number,
    longLinkName: PropTypes.string,
    fpdk_type: PropTypes.string,
    callback: PropTypes.func,
    hideSuccessModal: PropTypes.bool,
    loginAccount: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    operationType: PropTypes.string
};

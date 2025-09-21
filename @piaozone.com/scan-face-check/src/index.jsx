import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Modal, message, Icon } from 'antd';
import './style.less';

import EtaxLogin from '@piaozone.com/etax-login';
import EtaxAppQrCode from './etaxQrCom';
import { getEtaxNeedAuthStatus, etaxAccountInfo } from './services/common';
import topTips from './img/icon_ts.png';
import { accountHidePart } from './utils/common';

message.config({
    top: 200,
    duration: 1.5,
    maxCount: 2
});

const { TabPane } = Tabs;

export default function RealPersonAuth(props) {
    const { taxNo = '' } = props;
    const [isLoaded, isLoadedSet] = useState(false);
    const [loginAccount, loginAccountSet] = useState({});
    const [visibleLogin, visibleLoginSet] = useState(true);
    const [hideSuccessModal] = useState(props.hideSuccessModal || false);
    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        init();
        return () => {
            // 关闭所有提示
            message.destroy();
        };
    }, []);

    const onChangeTab = (v) => {
        setActiveTab(v);
    };

    const init = async() => {
        // 存储全局变量
        window.__INITIAL_STATE__ = {
            TAX_NO: props.taxNo,
            API_PRE_PATH: props.API_PRE_PATH,
            client_type: props.client_type,
            longLinkName: props.longLinkName,
            fpdk_type: props.fpdk_type,
            ...window.__INITIAL_STATE__
        };

        let data;
        try {
            if (props.loginAccount && typeof props.loginAccount === 'string') {
                data = JSON.parse(props.loginAccount);
            } else {
                data = props.loginAccount;
            }
        } catch (err) {
            console.error('loginAccount error', err);
        }

        data = await getLoginAccount(data) || {};

        loginAccountSet(data);
        // 有账号 身份认证 自动登录或者不需要登录
        if (data.loginAccountUid && data.checkAuth && (data.autoLogin || !data.needLogin)) {
            // 隐藏登录
            visibleLoginSet(false);
        }
        // 确保loginAccount已加载，保证EtaxLogin初始化OK
        isLoadedSet(true);
    };

    // 获取账号状态
    const getLoginAccount = async(params) => {
        if (!params?.loginAccountUid) {
            // 无loginAccountUid 不请求
            return params;
        }
        if (params?.city) {
            // 有城市无需请求
            return params;
        }

        const res = await etaxAccountInfo({
            taxNo: props.taxNo,
            loginAccountUid: params.loginAccountUid
        });
        if (res.errcode !== '0000') {
            // 请求异常
            console.log('获取账号信息 error', res);
            return params;
        }
        const { city, autoLogin, needLogin, etaxRoleType } = res.data || {};

        return {
            ...params,
            autoLogin, // 是否自动登录
            needLogin,
            city, // 城市
            etaxRoleType // 角色身份
        };
    };

    // 登录回调
    const loginCallback = (res, opt) => {
        const { checkAuth, loginAccountUid: initLoginAccountUid } = loginAccount;
        const { loginAccountUid = initLoginAccountUid, disabledCheckAuth } = opt || {};
        if (res.errcode === '0000') {
            // disabledCheckAuth 轮询时无需再去检测扫脸认证
            if (!disabledCheckAuth && checkAuth) {
                scanFaceCheck(loginAccountUid);
            } else {
                baseCallback({
                    ...res,
                    description: checkAuth ? '认证成功！' : '登录成功！'
                }, opt);
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
            noCache: true
        });
        message.destroy();
        if (res.errcode === '0000') {
            if (res.data === true) {
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
        <div className='realPersonAuth'>
            {isLoaded ? (
                <div className='realPersonAuth-box'>
                    {visibleLogin ? (
                        <div className='scanFaceCheckLogin'>
                            <div className='scanFaceCheckLogin-box'>
                                <EtaxLogin
                                    taxNo={taxNo}
                                    API_PRE_PATH={props.API_PRE_PATH}
                                    client_type={props.client_type}
                                    longLinkName={props.longLinkName}
                                    fpdk_type={props.fpdk_type}
                                    callback={loginCallback}
                                    loginAccount={loginAccount}
                                    wxOpenId={props.wxOpenId}
                                    qrcodeId={props.qrcodeId}
                                    loginType={props.loginType}
                                    operationType={props.operationType}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='realPersonAuth-main'>
                            <div className='topTip'>
                                <img src={topTips} />
                                为了您开票的安全便捷，稳定可靠，请按照指引完成身份认证处理！
                            </div>
                            <div className='content'>
                                <div className='content-text'>
                                    <label>企业税号 :</label>
                                    <div>{taxNo}</div>
                                </div>
                                <div className='content-text'>
                                    <label>认证账号 :</label>
                                    <div>{accountHidePart(loginAccount.loginAccountUid)}</div>
                                </div>
                                <div className='content-text'>
                                    <label>所属地区 :</label>
                                    <div>{loginAccount.city}</div>
                                </div>
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

RealPersonAuth.defaultProps = {
    API_PRE_PATH: '',
    client_type: 4,
    longLinkName: '',
    fpdk_type: '3'
};

RealPersonAuth.propTypes = {
    taxNo: PropTypes.string.isRequired,
    API_PRE_PATH: PropTypes.string,
    client_type: PropTypes.number,
    longLinkName: PropTypes.string,
    fpdk_type: PropTypes.string,
    callback: PropTypes.func,
    hideSuccessModal: PropTypes.bool,
    loginAccount: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    wxOpenId: PropTypes.string,
    qrcodeId: PropTypes.string,
    // 登录途径 默认不传网页版登录 1微信登录主动点击微信登录 2隐藏登录途径 3编辑
    loginType: PropTypes.string,
    // operationType 通道类型 1开票 2收票
    operationType: PropTypes.string
};

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Select, message, Modal, Radio, Button, Icon } from 'antd';

import { urlHandler } from '@piaozone.com/utils';

import './style.less';
import { getCityInfoByTaxNo } from './utils/cityInfo';
import { CITYS, ROLES } from './constants';
import { getAPI_PRE_PATH } from './utils/common';
import { wxRelationQuerySave, etaxAccountInfo } from './services/common';
import MobileBind from './components/mobileBind';
import useIsMounted from './hooks/useIsMounted';
import MobileLogin from './components/mobileLogin';
import CodeLogin from './components/mobileLogin/codeLogin';

message.config({
    top: 200,
    duration: 1.5,
    maxCount: 2
});

const { Option } = Select;
export default function EtaxLogin(props) {
    const isMountedRef = useIsMounted();
    const [isLoaded, isLoadedSet] = useState(false);
    const [visibleCity, visibleCitySet] = useState(true);
    const [cityInfo, cityInfoSet] = useState({
        code: '',
        city: '',
        autoLogin: false,
        com: null
    });
    const { autoLogin, com: LoginCom } = cityInfo;
    const [hideSuccessModal] = useState(props.hideSuccessModal || false);
    const [loginAccount, loginAccountSet] = useState({});
    const [visibleMobileBind, visibleMobileBindSet] = useState(false);
    const [fromQrcode] = useState(!!props.wxOpenId);
    const [visibleQuickLogin, visibleQuickLoginSet] = useState(false);
    const [needBindWx, needBindWxSet] = useState(false);
    const [showMask, showMaskSet] = useState(false);

    // 判断当前宿主环境是否为移动端
    const isMobile = useMemo(() => {
        const UA = window.navigator.userAgent;
        const isMobile = /Mobile/.test(UA);
        return isMobile;
    }, [window.navigator.userAgent]);

    useEffect(() => {
        if (isMountedRef.current) {
            init();
        }
        return () => {
            // 关闭所有提示
            message.destroy();

            // 清除绑定标识缓存
            sessionStorage.removeItem('hadEtaxBindWechat');
        };
    }, [isMountedRef]);

    // 初始化
    async function init() {
        // 隐私模式开启阻止第三方Cookie并通过iframe嵌入访问时，无法设置session
        // 存储全局变量
        window.__INITIAL_STATE__ = {
            API_PRE_PATH: props.API_PRE_PATH,
            client_type: props.client_type,
            longLinkName: props.longLinkName,
            fpdk_type: props.fpdk_type,
            ...window.__INITIAL_STATE__
        };
        // 账号信息
        try {
            let data;
            if (props.loginAccount && typeof props.loginAccount === 'string') {
                data = JSON.parse(props.loginAccount);
            } else {
                data = props.loginAccount;
            }

            data = await getLoginAccount(data);

            const { etaxRoleType, ...otherLoginAccount } = data || {};
            // 用户角色
            let roleText = ROLES[0].value;
            if (etaxRoleType) {
                roleText = (ROLES.find((item) => item.key === etaxRoleType || item.value === etaxRoleType))?.value || roleText;
            }
            // 设置账号
            loginAccountSet({
                ...otherLoginAccount,
                roleText
            });

            // 设置城市
            const cityInfo = CITYS.find((item) => item.city === data?.city) || getCityInfoByTaxNo(props.taxNo);
            cityInfoSet(cityInfo);

            // 上海旧版不支持快捷登录 旧版loginAccountUid用的是字符，大于长度21 二字姓名-身份证号
            const isShanghaiOld = cityInfo.city === '上海' && data?.loginAccountUid?.length > 21;
            // 快捷登录
            // 不支持自动登录的地区 有账号 loginType不等于3（编辑） 非上海旧版
            if (!cityInfo.autoLogin && data?.loginAccountUid && props.loginType !== '3' && !isShanghaiOld) {
                // autoLogin为true都是自动登录，这种还需要登录都是异常情况
                visibleQuickLoginSet(true);
            }
            // 扫码访问
            if (fromQrcode) {
                // 第一次扫码登录绑定
                firstMobileLoginBind(data);
            }
            isLoadedSet(true);
        } catch (err) {
            console.error('loginAccount error', err);
        }
    }

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
        const { city, needLogin, etaxRoleType } = res.data || {};

        return {
            ...params,
            needLogin,
            city, // 城市
            etaxRoleType // 角色身份
        };
    };

    // 第一次扫码登录绑定
    const firstMobileLoginBind = async(data) => {
        const hadEtaxBindWechat = sessionStorage.getItem('hadEtaxBindWechat') === 'true';
        // wxOpenId有值移动端访问：需绑定
        // qrcodeId有值为扫码访问：未绑定， 无值为推送消息访问：已绑定
        // hadEtaxBindWechat已绑定
        if (props.wxOpenId && props.qrcodeId && !hadEtaxBindWechat) {
            visibleMobileBindSet(true);
            if (data?.loginAccountUid) {
                // 有账号直接绑定
                etaxBindWechat(data.loginAccountUid);
            } else {
                // 无账号登录完成后再绑定
                needBindWxSet(true);
            }
        }
    };

    // 全电账号绑定微信
    const etaxBindWechat = async(loginAccountUid) => {
        const res = await wxRelationQuerySave({
            loginAccountUid,
            taxNo: props.taxNo,
            openId: props.wxOpenId
        });
        if (res.errcode === '0000') {
            // 绑定成功
            sessionStorage.setItem('hadEtaxBindWechat', 'true');
        } else {
            needBindWxSet(true);
            message.error(res.description);
        }
    };

    // 城市切换
    const onChangeCity = (city) => {
        const cityInfo = CITYS.find(item => item.city === city);
        cityInfoSet(cityInfo);
    };

    // 登录回调
    const loginCallback = (res, opt = {}) => {
        // 移动端
        if (res.errcode === '0000') {
            if (opt.loginAccountUid) {
                if (fromQrcode && needBindWx) {
                    etaxBindWechat(opt.loginAccountUid);
                }
            } else {
                console.error('无loginAccountUid，移动端登录时电子税局账号将绑定失败');
            }
        }

        if (typeof props.callback === 'function') {
            // 组件引入
            props.callback(res, {
                ...opt,
                loginType: autoLogin ? 1 : (opt.loginType || 2), // 自动登录 先判断配置再判断传参 1支持 2不支持 自行控制
                loginUrl: getAPI_PRE_PATH() + '/fpdk/etax/common/login',
                checkLoginUrl: getAPI_PRE_PATH() + '/fpdk/etax/login/type'
            });
        } else {
            if (res.errcode === '0000') {
                if (!hideSuccessModal) {
                    noCallbackSuccessModal();
                } else {
                    // 星瀚
                    message.loading('正在查询登录结果，请勿关闭弹窗', 0);
                    showMaskSet(true);
                    console.log('登录成功！');
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
    const noCallbackSuccessModal = () => {
        Modal.success({
            centered: true,
            title: '温馨提示',
            content: '登录成功！',
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

    // 刷新
    const refreshFun = () => {
        const { refresh } = urlHandler.urlSearch(location.search);
        if (refresh === 'true') {
            location.reload();
        } else {
            location.href = `${location.href}${~location.search.indexOf('?') ? '&' : '?'}refresh=true`;
        }
    };

    // 移动端第一次登录绑定提示
    if (visibleMobileBind) {
        return <MobileBind onClose={() => visibleMobileBindSet(false)} />;
    }

    // 快捷登录
    if (visibleQuickLogin) {
        return (
            <CodeLogin
                taxNo={props.taxNo}
                cityInfo={cityInfo}
                loginAccount={loginAccount}
                hideMobileLogin={() => visibleQuickLoginSet(false)}
                callback={loginCallback}
                isMobile={isMobile}
                loginType={props.loginType}
                operationType={props.operationType}
            />
        );
    }

    return (
        <div className='pwy-etax-login'>
            {isLoaded ? (
                <div className={`pwy-etax-main ${props.className || ''}`} style={props.style}>
                    <div className='loginForm'>
                        {
                            visibleCity ? (
                                <>
                                    <div className='loginItem'>
                                        <label className='loginLabel'>地区：</label>
                                        <Select
                                            showSearch
                                            filterOption={(input, option) => (option.props?.label || '').includes(input)}
                                            className='loginInput'
                                            value={cityInfo.city}
                                            onChange={onChangeCity}
                                            placeholder='请选择'
                                        >
                                            {CITYS.filter((o) => o.com).map((o) => (
                                                <Option label={o.city} key={o.code} value={o.city}>
                                                    {o.city}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </>
                            ) : null
                        }

                        {LoginCom ? (
                            <>
                                {/* isMobile  移动端不展示登录途径 */}
                                {props.loginType !== '2' && visibleCity && !fromQrcode && !isMobile ? (
                                    <div className='loginItem'>
                                        <label className='loginLabel'>登录途径：</label>
                                        <Radio.Group className='loginInput' value='local'>
                                            <Radio value='local'>网页端登录</Radio>
                                            <MobileLogin
                                                taxNo={props.taxNo}
                                                cityInfo={cityInfo}
                                                loginAccount={loginAccount}
                                                callback={loginCallback}
                                                loginType={props.loginType}
                                                isQuickLogin={visibleQuickLogin}
                                                operationType={props.operationType}
                                            />
                                        </Radio.Group>
                                    </div>
                                ) : null}
                                <LoginCom
                                    callback={loginCallback}
                                    cityInfo={cityInfo}
                                    hideSuccessModal={hideSuccessModal}
                                    taxNo={props.taxNo}
                                    visibleCity={visibleCity}
                                    visibleCitySet={visibleCitySet}
                                    loginAccount={loginAccount}
                                    operationType={props.operationType}
                                />
                            </>
                        ) : (
                            <div className='loginItem'>
                                暂时不支持该地区的税局登录
                                <Button size='small' type='link' icon='reload' onClick={refreshFun}>刷新</Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className='flexCenter'>
                    <Icon type='loading' style={{ fontSize: 40, color: '#3598ff' }} />
                </div>
            )}
            {showMask &&
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 1000,
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,.45)',
                    filter: 'alpha(opacity=50)'
                }}
                />}
        </div>
    );
}

EtaxLogin.defaultProps = {
    className: '',
    style: {},
    API_PRE_PATH: '',
    client_type: 4,
    longLinkName: '',
    fpdk_type: '3'
};

EtaxLogin.propTypes = {
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
    wxOpenId: PropTypes.string,
    qrcodeId: PropTypes.string,
    // 登录途径 默认不传网页版登录 1微信登录主动点击微信登录 2隐藏登录途径 3编辑
    loginType: PropTypes.string,
    // 操作类型：1开票 2收票(默认)
    operationType: PropTypes.string
};

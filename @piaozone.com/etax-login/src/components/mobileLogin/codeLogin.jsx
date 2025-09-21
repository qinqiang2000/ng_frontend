import React, { useState, useEffect, useRef, createRef, memo } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, message, Radio, Modal } from 'antd';

import LoginInstructions from '../loginInstructions';
import useSmsCountdown from '../../hooks/useSmsCountdown';
import './codeLogin.less';
import * as commonService from '../../services/common';
import * as shanghaiService from '../../services/shanghai';
import { encryptByJSEncrypt } from '../../utils/common';
import MobileLogin from '../mobileLogin';
import Roles from '../roles';

const MemoSingleInput = memo(SingleInput);
export default function CodeLogin(props) {
    const { loginAccountUid, roleText: propsRoleText } = props.loginAccount;
    const [visibleLoginInstructions, visibleLoginInstructionsSet] = useState(false);
    const [loading, loadingSet] = useState(false);
    const [isInProcessing, isInProcessingSet] = useState(false);
    const [shortMsgCode, shortMsgCodeSet] = useState('');
    const [isFirstGetSms, isFirstGetSmsSet] = useState(true);
    const [counter, setCounter] = useSmsCountdown();
    const [info, infoSet] = useState({
        roleText: propsRoleText
    });
    const [loginLoading, loginLoadingSet] = useState(false);
    // 登录途径
    const [loginPath, loginPathSet] = useState(props.loginType === '1' ? '1' : '');
    const MobileLoginRef = React.createRef();

    // 获取短信验证码
    const getShortMsgCode = async() => {
        isInProcessingSet(true);
        message.loading('发送中...', 0);
        const loginAccount = {
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                isQuickLogin: true,
                city: props.cityInfo.city,
                account: loginAccountUid
            })
        };
        let res;
        if (props.cityInfo.city === '上海' && loginAccountUid.length > 21) {
            res = await shanghaiService.sendShortMsg(loginAccount, { operationType: props.operationType });
        } else {
            res = await commonService.sendShortMsg(loginAccount, { operationType: props.operationType });
        }
        message.destroy();
        isInProcessingSet(false);
        const { errcode, description, data = {} } = res;
        if (errcode === '0000') {
            if (data.etaxAccountType) {
                props.callback(res, {
                    loginAccount,
                    loginAccountUid
                });
            } else {
                message.success('发送成功');
                setCounter(Number(data) || 120);
                isFirstGetSmsSet(false);
            }
        } else {
            Modal.error({
                title: '温馨提示',
                content: description,
                ok: () => {
                    if (errcode === 'passwordError' || ~description.indexOf('密码错误') || ~description.indexOf('用户密码登录错误')) {
                        props.hideMobileLogin();
                    }
                }
            });
        }
    };

    // 登录
    const login = async() => {
        if (!shortMsgCode) {
            message.warn('请输入短信验证码！');
            return;
        }
        if (shortMsgCode.length !== 6) {
            message.warn('请输入6位短信验证码！');
            return;
        }
        loadingSet(true);
        message.loading('登录中...', 0);
        const loginAccount = {
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                isQuickLogin: true,
                city: props.cityInfo.city,
                account: loginAccountUid,
                shortMsgCode,
                roleText: info.roleText
            })
        };
        const res = await commonService.commonLogin(loginAccount, { operationType: props.operationType });
        loadingSet(false);
        message.destroy();

        const { errcode, description } = res;
        if (errcode === '0000') {
            props.callback(res, {
                loginAccount,
                loginAccountUid
            });
        } else {
            Modal.error({
                title: '温馨提示',
                content: errcode === '91300' ? '当前登录已经失效，请重新获取验证码' : description,
                onOk: () => {
                    if (errcode === '91300') {
                        setCounter(-1);
                        shortMsgCodeSet('');
                    }
                }
            });
        }
    };
    // pc端显示输入框
    const PcInputComponent = () => {
        return (
            <div>
                {
                    loginPath === '1' ? (
                        <div className='smsCode'>
                            <div style={{ color: '#5582f3' }}>已向登录账号绑定的微信用户推送服务号通知，请通知该用户在金蝶发票云服务号中完成验证登录</div>
                        </div>
                    )
                        : (
                            <div className='smsCode'>
                                <div className='codeLabel' style={{ fontSize: 16, color: '#666' }}>输入税局登录验证码</div>
                                <div style={{ borderBottom: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
                                    <Input
                                        id='PcInputComponent'
                                        value={shortMsgCode}
                                        onChange={(e) => shortMsgCodeSet(e.target.value.trim())}
                                        className='codeLoginInput'
                                        placeholder='请输入税局登录验证码'
                                    />
                                    {isFirstGetSms
                                        ? (
                                            <Button
                                                className='codeLoginyzmBtn'
                                                type='link'
                                                size='small'
                                                disabled={loading || isInProcessing}
                                                onClick={getShortMsgCode}
                                            >
                                                获取验证码
                                            </Button>
                                        )
                                        : (
                                            <Button
                                                type='link'
                                                size='small'
                                                className='codeLoginyzmBtn'
                                                disabled={loading || isInProcessing || ~counter}
                                                onClick={getShortMsgCode}
                                                style={{ color: counter ? '#5582F3' : '' }}
                                            >
                                                {~counter ? `${counter}s` : <span style={{ color: '#999' }}>获取验证码</span>}
                                            </Button>
                                        )}
                                </div>
                            </div>

                        )
                }
            </div>
        );
    };
    // 移动端显示输入框
    const InputComponent = () => {
        return (
            <div className='smsCode'>
                <div className='smsLabel'>输入税局登录验证码</div>
                <div className='smsInputs'>
                    <MemoSingleInput disabled={loading} value={shortMsgCode} length={6} onChange={shortMsgCodeSet} />
                </div>
                <div className='smsTip'>
                    {isFirstGetSms
                        ? <Button type='link' disabled={loading || isInProcessing} onClick={getShortMsgCode}>获取验证码</Button>
                        : (
                            <Button
                                type='link'
                                disabled={loading || isInProcessing || ~counter}
                                onClick={getShortMsgCode}
                            >
                                重新发送
                                {~counter ? `(${counter}s)` : null}
                            </Button>
                        )}
                </div>
            </div>
        );
    };

    const onCodeLabel = (e) => {
        loginPathSet(e.target.value);
    };

    const loginResult = async() => {
        loginLoadingSet(true);
        await MobileLoginRef.current.queryLoginResult(1);
        loginLoadingSet(false);
    };

    return (
        <div className='etax-codeLogin'>
            <div className='tip ellipsis'>您的账号正在登录电子发票服务平台</div>
            <div className='codeForm'>
                <div className='codeItem'>
                    <label className='codeLabel'>企业税号</label>
                    <div className='codeInput ellipsis'>{props.taxNo}</div>
                </div>
                <div className='codeItem'>
                    <label className='codeLabel'>登录地址</label>
                    <div className='codeInput ellipsis'>{props.cityInfo.city}税局</div>
                </div>
                <div className='codeItem'>
                    <label className='codeLabel'>登录用途</label>
                    <div className='codeInput ellipsis'>启动服务</div>
                </div>
                <div className='codeItem'>
                    <label className='codeLabel'>登录账号</label>
                    <div className='codeInput ellipsis'>{loginAccountUid}</div>
                </div>
                {props.loginType !== '2' && !props.isMobile ? (
                    <div className='codeItem'>
                        <label className='codeLabel'>登录途径</label>
                        <Radio.Group className='codeInput' value={loginPath} onChange={onCodeLabel}>
                            <Radio value=''>网页端登录</Radio>
                            <MobileLogin
                                taxNo={props.taxNo}
                                cityInfo={props.cityInfo}
                                loginAccount={props.loginAccount}
                                callback={props.callback}
                                loginType={props.loginType}
                                onRef={MobileLoginRef}
                                isQuickLogin={true}
                                operationType={props.operationType}
                            />
                        </Radio.Group>
                    </div>
                ) : null}
                <div className='codeItem'>
                    <label className='codeLabel'>身份类型</label>
                    <Roles
                        className='codeInput'
                        currentRole={info.roleText}
                        size={props.isMobile ? 'small' : 'default'}
                        onChangeRole={(role) => {
                            infoSet({
                                ...info,
                                roleText: role
                            });
                        }}
                    />
                </div>
            </div>
            {props.isMobile ? InputComponent() : PcInputComponent()}
            <div className='login'>
                {
                    loginPath === '1' ? <Button size='large' type='primary' loading={loginLoading} onClick={loginResult}>刷新登录结果</Button>
                        : <Button size='large' type='primary' disabled={loading} onClick={login}>确认提交</Button>
                }
            </div>
            <div className='footer'>
                为保障您和贵司的合法权益，请您了解
                <a onClick={() => visibleLoginInstructionsSet(true)}>登录须知</a>
            </div>
            <LoginInstructions visible={visibleLoginInstructions} onClose={() => visibleLoginInstructionsSet(false)} />
        </div>
    );
}

CodeLogin.propTypes = {
    taxNo: PropTypes.string,
    cityInfo: PropTypes.object,
    loginAccount: PropTypes.object,
    hideMobileLogin: PropTypes.func,
    callback: PropTypes.func,
    isMobile: PropTypes.bool,
    loginType: PropTypes.string,
    operationType: PropTypes.string
};

function SingleInput(props) {
    const valueRef = useRef(props.value);
    const focusRef = useRef(false);

    const array = new Array(props.length).fill('');
    const inputRefs = useRef(array.map(() => createRef()));

    useEffect(() => {
        document.addEventListener('paste', pasteData);
        return () => {
            document.removeEventListener('paste', pasteData);
        };
    }, []);

    // 粘贴
    const pasteData = (e) => {
        if (focusRef.current) {
            const clipdata = e.clipboardData || window.clipboardData;
            inputCallback(clipdata.getData('text/plain').replace(/\D/g, '').substring(0, props.length));
        }
    };

    // 输入回调
    const inputCallback = (v) => {
        valueRef.current = v;
        typeof props.onChange === 'function' && props.onChange(v);
    };

    // 输入
    const onChangeSingleInput = (e, i) => {
        const v = e.target.value.replace(/\D/g, '');
        const valueAry = valueRef.current.split('');
        valueAry[i] = v;
        inputCallback(valueAry.join(''));
        // 聚焦下一个
        if (v && i < props.length - 1) {
            inputRefs.current[i + 1].current.focus();
        }
    };

    // 聚焦
    const onFocusSingleInput = (i) => {
        focusRef.current = true;
        // 文字末尾或者最后一个输入框
        const valueLength = valueRef.current.length;
        const isRight = i === valueLength || i === props.length - 1;
        // 避免循环调用
        if (!isRight) {
            inputRefs.current[Math.min(valueLength, props.length - 1)].current.focus();
        }
    };

    // 失焦
    const onBlurSingleInput = () => {
        focusRef.current = false;
    };

    const onKeyDownSingleInput = (e, i) => {
        // 删除
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
            inputCallback(valueRef.current.substring(0, i - 1));
            inputRefs.current[i - 1].current.focus();
        }
    };

    return (array.map((v, i) => {
        return (
            <Input
                type='text'
                inputMode='numeric'
                disabled={props.disabled}
                ref={inputRefs.current[i]}
                key={i}
                maxLength={1}
                value={valueRef.current[i]}
                onChange={(e) => onChangeSingleInput(e, i)}
                onFocus={() => onFocusSingleInput(i)}
                onBlur={() => onBlurSingleInput()}
                onKeyDown={(e) => onKeyDownSingleInput(e, i)}
            />
        );
    }));
}

SingleInput.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    length: PropTypes.number.isRequired,
    onChange: PropTypes.func
};

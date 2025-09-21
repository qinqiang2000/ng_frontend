import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Modal, message } from 'antd';

import * as commonService from '../../services/common';
import useSmsCountdown from '../../hooks/useSmsCountdown';
import { encryptByJSEncrypt } from '../../utils/common';
import Roles from '../roles';

function Login(props) {
    const [loading, loadingSet] = useState(false);
    const [isInProcessing, isInProcessingSet] = useState(false);
    const { loginAccountUid, roleText: propsRoleText } = props.loginAccount;
    const [info, infoSet] = useState({
        step: 1,
        taxNo: props.taxNo,
        account: loginAccountUid || '',
        accountPasswd: '',
        phone: '',
        shortMsgCode: '',
        roleText: propsRoleText
    });
    const { step, taxNo, account, accountPasswd, phone, shortMsgCode, roleText } = info;
    const [counter, setCounter] = useSmsCountdown();

    function onChangeInfo(name, value) {
        infoSet({
            ...info,
            [name]: value
        });
    }

    // 第一步登录
    const stepOneLogin = async() => {
        if (!account) {
            message.warn('请输入居民身份证号码/手机号码/用户名！');
            return;
        }
        if (!accountPasswd) {
            message.warn('请输入个人用户密码！');
            return;
        }
        const loginAccount = {
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                city: props.cityInfo.city,
                taxNo,
                account,
                accountPasswd
            })
        };
        loadingSet(true);
        const res = await commonService.stepOneLogin(loginAccount, { operationType: props.operationType });
        loadingSet(false);
        if (res.errcode !== '0000') {
            Modal.error({
                title: '温馨提示',
                content: res.description
            });
            return;
        }

        const data = res.data || {};
        props.visibleCitySet(false);
        if (data.etaxAccountType) {
            infoSet({
                ...info,
                companyName: data.companyName,
                etaxAccountType: data.etaxAccountType
            });
            props.callback(res, {
                loginAccount,
                loginAccountUid: account
            });
        } else {
            infoSet({
                ...info,
                step: 2,
                phone: data.phone || data,
                shortMsgCode: ''
            });
        }
    };

    // 发送短信验证码
    const sendShortMsg = async() => {
        const loginAccount = {
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                city: props.cityInfo.city,
                taxNo,
                account,
                accountPasswd,
                phone,
                shortMsgCode
            })
        };
        isInProcessingSet(true);
        message.loading('发送中...', 0);
        const res = await commonService.sendShortMsg(loginAccount, { operationType: props.operationType });
        message.destroy();
        isInProcessingSet(false);
        const { errcode, description } = res;

        if (errcode === '0000') {
            message.success('发送成功');
            setCounter(120);
        } else {
            Modal.error({
                title: '温馨提示',
                content: errcode === '91300' ? '当前第一步登录已经失效，请重新登录' : description,
                onOk: () => {
                    if (errcode === '91300') {
                        infoSet({
                            ...info,
                            step: 1,
                            shortMsgCode: ''
                        });
                    }
                }
            });
        }
    };

    // 第二步登录
    const stepTwoLogin = async() => {
        if (!shortMsgCode) {
            message.warn('请输入短信验证码！');
            return;
        }

        const loginAccount = {
            taxNo,
            data: encryptByJSEncrypt({
                city: props.cityInfo.city,
                taxNo,
                account,
                accountPasswd,
                phone,
                shortMsgCode,
                roleText
            })
        };

        loadingSet(true);
        message.loading('登录中...', 0);
        const res = await commonService.commonLogin(loginAccount, { operationType: props.operationType });
        // 星瀚 不显示成功弹窗hideSuccessModal为true 显示loading
        if (!(props.hideSuccessModal && res.errcode === '0000')) {
            // hideSuccessModal默认false显示成功弹窗 关闭loading
            message.destroy();
            loadingSet(false);
        }

        if (res.errcode === '91300') {
            Modal.error({
                title: '温馨提示',
                content: '当前第一步登录已经失效，请重新登录',
                onOk: () => {
                    setCounter(-1);
                    infoSet({
                        ...info,
                        shortMsgCode: '',
                        accountPasswd: '',
                        step: 1
                    });
                }
            });
            return;
        }

        props.callback(res, {
            loginAccount,
            loginAccountUid: info.account
        });
    };

    // 返回第一步
    const returnFistStep = () => {
        props.visibleCitySet(true);
        setCounter(-1);
        infoSet({
            ...info,
            step: 1
        });
    };

    if (info.etaxAccountType) {
        return (
            <div>
                <h1 style={{ textAlign: 'center' }}>登录成功</h1>
                <div className='loginItem mb10'>
                    <label className='loginLabel'>企业名称：</label>
                    <label className='loginInput ellipsis'>{info.companyName}</label>
                </div>
                <div className='loginItem mb10'>
                    <label className='loginLabel'>企业税号：</label>
                    <label className='loginInput ellipsis'>{taxNo}</label>
                </div>

                <div className='loginItem mb10'>
                    <label className='loginLabel'>账号：</label>
                    <label className='loginInput ellipsis'>{account}</label>
                </div>
            </div>
        );
    }

    if (step === 1) {
        return (
            <>
                <div className='loginItem'>
                    <label className='loginLabel'>税号：</label>
                    <Input
                        className='loginInput'
                        disabled
                        value={taxNo}
                        onChange={(e) => onChangeInfo('taxNo', e.target.value.trim())}
                        placeholder='统一社会信用代码/纳税人识别号'
                    />
                </div>
                <div className='loginItem'>
                    <label className='loginLabel'>账号：</label>
                    <Input
                        autoComplete='off'
                        className='loginInput'
                        disabled={loading || !!loginAccountUid}
                        value={account}
                        onChange={(e) => onChangeInfo('account', e.target.value.trim())}
                        placeholder='居民身份证号码/手机号码/用户名'
                    />
                </div>
                <div className='loginItem'>
                    <label className='loginLabel'>密码：</label>
                    <Input.Password
                        autoComplete='off'
                        className='loginInput'
                        disabled={loading}
                        value={accountPasswd}
                        onChange={(e) => onChangeInfo('accountPasswd', e.target.value.trim())}
                        onPressEnter={stepOneLogin}
                        placeholder='个人用户密码'
                    />
                </div>
                <div className='loginItem'>
                    <Button type='primary' onClick={stepOneLogin} loading={loading}>登录</Button>
                </div>
            </>
        );
    }
    return (
        <>
            <div className='loginItem'>
                <label className='loginLabel'>身份类型：</label>
                <Roles
                    className='loginInput'
                    currentRole={roleText}
                    onChangeRole={(role) => {
                        infoSet({
                            ...info,
                            roleText: role
                        });
                    }}
                />
            </div>
            <div className='loginItem'>
                <label className='loginLabel'>当前手机号：</label>
                <Input
                    className='loginInput'
                    value={phone}
                    readOnly={true}
                />
            </div>
            <div className='loginItem'>
                <label className='loginLabel'>短信验证码：</label>
                <Input
                    className='loginInput'
                    disabled={loading}
                    maxLength={6}
                    value={shortMsgCode}
                    onChange={(e) => infoSet({ ...info, shortMsgCode: e.target.value.trim() })}
                    onPressEnter={stepTwoLogin}
                    placeholder='请输入短信验证码'
                    suffix={<span>{~counter ? `${counter}s` : ''}</span>}
                />
                <Button
                    disabled={loading || isInProcessing || ~counter}
                    className='loginCode'
                    type='primary'
                    onClick={sendShortMsg}
                >
                    获取验证码
                </Button>
            </div>
            <div className='loginItem'>
                <Button className='mr20' onClick={returnFistStep}>上一步</Button>
                <Button disabled={loading} type='primary' onClick={stepTwoLogin}>登录</Button>
            </div>
        </>
    );
}

Login.propTypes = {
    callback: PropTypes.func,
    cityInfo: PropTypes.object,
    hideSuccessModal: PropTypes.bool,
    taxNo: PropTypes.string,
    loginAccount: PropTypes.object,
    visibleCitySet: PropTypes.func,
    operationType: PropTypes.string
};

export default Login;

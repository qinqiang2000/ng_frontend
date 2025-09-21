import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, message, Radio, Select, Modal } from 'antd';

import * as commonService from '../../services/common';
import * as shanghaiService from '../../services/shanghai';
import useSmsCountdown from '../../hooks/useSmsCountdown';
import { encryptByJSEncrypt } from '../../utils/common';

const { Option } = Select;
function Shanghai(props) {
    const [loading, loadingSet] = useState(false);
    const [isInProcessing, isInProcessingSet] = useState(false);
    const { loginAccountUid } = props.loginAccount;
    const [info, infoSet] = useState({
        step: 1,
        taxNo: props.taxNo,
        account: loginAccountUid || props.taxNo,
        accountPasswd: '',
        accountList: [],
        realUserName: loginAccountUid || '',
        realLoginType: -1,
        realUserPassword: '',
        realPhone: '',
        shortMsgCode: ''
    });
    const { step, account, taxNo, accountPasswd, accountList, realUserName, realPhone, realUserPassword, realLoginType, shortMsgCode } = info;
    const [counter, setCounter] = useSmsCountdown();
    function onChangeInfo(name, value) {
        infoSet({
            ...info,
            [name]: value,
            account: name === 'realUserName' ? value : account
        });
    }

    // 第一次登录方式
    const firstLogin = async() => {
        if (!accountPasswd) {
            message.warn('请输入密码！');
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
        const res = await shanghaiService.queryUserList(loginAccount);
        loadingSet(false);
        if (res.errcode !== '0000') {
            Modal.error({
                title: '温馨提示',
                content: res.description
            });
            return;
        }
        const list = res.data || [];
        props.visibleCitySet(false);
        if (list?.etaxAccountType) {
            props.callback(res, {
                loginAccount,
                loginAccountUid: info.realUserName
            });
        } else {
            const isTrue = list.some((o) => o.value === realUserName);
            infoSet({
                ...info,
                step: 2,
                accountList: list,
                realUserName: isTrue ? realUserName : (list[0]?.value || ''),
                realLoginType: 1,
                realUserPassword: '',
                realPhone: '',
                shortMsgCode: ''
            });
        }
    };

    // 选择登录方式
    const selectLoginType = async(type = 1) => {
        const data = {
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                city: props.cityInfo.city,
                taxNo,
                account,
                accountPasswd,
                realUserName,
                realLoginType: type
            })
        };
        message.loading('获取数据中...', 0);
        const res = await shanghaiService.selectLoginType(data);
        message.destroy();
        if (res.errcode !== '0000') {
            Modal.error({
                title: '温馨提示',
                content: res.description
            });
            return;
        }
        infoSet({
            ...info,
            realLoginType: type,
            shortMsgCode: '',
            realPhone: res.data || '',
            realUserPassword: ''
        });
    };

    // 发送短信验证码
    const sendShortMsg = async() => {
        const data = {
            taxNo: props.taxNo,
            data: encryptByJSEncrypt({
                city: props.cityInfo.city,
                taxNo,
                account,
                accountPasswd,
                realUserName,
                realLoginType
            })
        };
        isInProcessingSet(true);
        message.loading('发送中...', 0);
        const res = await shanghaiService.sendShortMsg(data, { operationType: props.operationType });
        message.destroy();
        isInProcessingSet(false);
        const { errcode, description } = res;

        if (errcode === '0000') {
            message.success('发送成功！');
            setCounter(180);
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

    // 开始登录
    const startLogin = async() => {
        if (realLoginType === 1 && !realUserPassword) {
            message.warn('请输入自然人用户密码！');
            return;
        }
        if (realLoginType === 2 && !shortMsgCode) {
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
                realUserName,
                realLoginType,
                realUserPassword,
                shortMsgCode
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
            message.info('当前第一步登录已经失效，请重新登录!');
            setCounter(-1);
            infoSet({
                ...info,
                step: 1,
                accountPasswd: ''
            });
            return;
        }

        props.callback(res, {
            loginAccount,
            loginAccountUid: info.realUserName,
            loginType: realLoginType
        });
    };

    const returnFistStep = () => {
        props.visibleCitySet(true);
        setCounter(-1);
        infoSet({
            ...info,
            step: 1
        });
    };

    if (step === 1) {
        return (
            <>
                <div className='loginItem'>
                    <label className='loginLabel'>账号：</label>
                    <Input
                        className='loginInput'
                        disabled
                        value={taxNo}
                        onChange={(e) => onChangeInfo('taxNo', e.target.value.trim())}
                        placeholder='纳税人识别号/统一社会信用代码'
                    />
                </div>
                <div className='loginItem'>
                    <label className='loginLabel'>密码：</label>
                    <Input.Password
                        className='loginInput'
                        disabled={loading}
                        value={accountPasswd}
                        autoComplete='off'
                        onChange={(e) => onChangeInfo('accountPasswd', e.target.value.trim())}
                        onPressEnter={firstLogin}
                        placeholder='初始密码：法定代表人身份证件号码'
                    />
                </div>
                <div className='loginItem'>
                    <Button type='primary' onClick={firstLogin} loading={loading}>登录</Button>
                </div>
            </>
        );
    }
    return (
        <>
            <div className='loginItem'>
                <label className='loginLabel'>账号选择：</label>
                <Select
                    className='loginInput'
                    disabled={loading || loginAccountUid}
                    onChange={(e) => onChangeInfo('realUserName', e)}
                    value={realUserName}
                >
                    {accountList.map(item => (
                        <Option key={item.name} value={item.value}>{item.value}</Option>
                    ))}
                </Select>
            </div>
            <div className='loginItem'>
                <label className='loginLabel'>验证方式：</label>
                <Radio.Group className='loginInput' disabled={loading} onChange={(e) => selectLoginType(e.target.value)} value={realLoginType}>
                    <Radio value={1}>账号密码登录</Radio>
                    <Radio value={2}>短信登录</Radio>
                </Radio.Group>
            </div>
            {
                realLoginType === 1 ? (
                    <div className='loginItem'>
                        <label className='loginLabel'>密码：</label>
                        <Input.Password
                            className='loginInput'
                            placeholder='请输入自然人用户密码'
                            value={realUserPassword}
                            autoComplete='off'
                            onChange={(e) => infoSet({ ...info, realUserPassword: e.target.value })}
                            onPressEnter={startLogin}
                        />
                    </div>
                ) : (
                    <>
                        <div className='loginItem'>
                            <label className='loginLabel'>当前手机号：</label>
                            <Input
                                className='loginInput'
                                value={realPhone}
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
                                onPressEnter={startLogin}
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
                    </>
                )
            }
            <div className='loginItem'>
                <Button className='mr20' onClick={returnFistStep}>上一步</Button>
                <Button disabled={loading} type='primary' onClick={startLogin}>登录</Button>
            </div>
        </>
    );
}

Shanghai.propTypes = {
    callback: PropTypes.func,
    cityInfo: PropTypes.object,
    hideSuccessModal: PropTypes.bool,
    taxNo: PropTypes.string,
    loginAccount: PropTypes.object,
    visibleCitySet: PropTypes.func,
    operationType: PropTypes.string
};

export default Shanghai;

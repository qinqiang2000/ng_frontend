import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, message, Button } from 'antd';

import * as commonService from '../../services/common';
import { encryptByJSEncrypt } from '../../utils/common';
import Roles from '../roles';

function AutoLogin(props) {
    const [loading, loadingSet] = useState(false);
    const { loginAccountUid, roleText: propsRoleText } = props.loginAccount;
    const [info, infoSet] = useState({
        city: props.cityInfo.city,
        taxNo: props.taxNo,
        account: loginAccountUid || '',
        accountPasswd: '',
        roleText: propsRoleText
    });
    const { taxNo, accountPasswd, account, roleText } = info;

    function onChangeInfo(name, value) {
        infoSet({
            ...info,
            [name]: value
        });
    }

    const login = async() => {
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
            data: encryptByJSEncrypt(info)
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

        props.callback(res, {
            loginAccount,
            loginAccountUid: account
        });
    };

    return (
        <>
            <div className='loginItem'>
                <label className='loginLabel'>税号：</label>
                <Input
                    className='loginInput'
                    disabled
                    value={taxNo}
                    onChange={(e) => onChangeInfo('taxNo', e.target.value.trim())}
                    placeholder='请输入社会信用代码/识别号'
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
                    placeholder='个人用户密码'
                    onPressEnter={login}
                />
            </div>
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
                <Button disabled={loading} type='primary' onClick={login}>登录</Button>
            </div>
        </>
    );
}

AutoLogin.propTypes = {
    callback: PropTypes.func,
    cityInfo: PropTypes.object,
    hideSuccessModal: PropTypes.bool,
    taxNo: PropTypes.string,
    loginAccount: PropTypes.object,
    operationType: PropTypes.string
};

export default AutoLogin;

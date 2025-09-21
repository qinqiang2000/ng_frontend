import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { message, Input, Button, Modal, Select, Checkbox, Tabs, Radio } from 'antd';
import useSmsCountdown from './hooks/useSmsCountdown';
import { loginRequest, qrcodeLoginRequest, qxyAccountConfigQuery } from './services/common';
import { getCityInfoByTaxNo } from './utils/common';
import { CITYS, ROLES, LOGIN_TYPES } from './constants';
import reviewIcon from './img/review.png';

const { TabPane } = Tabs;

const DEFAULT_CITYINFO = {
    code: '',
    city: ''
};

const DEFAULT_ROLEINFO = {
    roleCode: '',
    roleText: ''
};

const DEFAULT_LOGIN_TYPES = {
    code: '',
    text: ''
};

let currentTabKey = '1';
let timeerQrcodeLoginRes = null;
let isPollingQrcodeLoginStatus = false;

export default function Login(props) {
    const { taxNo, operationType, needLoginType, cityInfo: preCityInfo } = props;
    const { loginAccountUid = '' } = props.loginAccount || {};
    const [loading, loadingSet] = useState(false);
    const [accountDisable] = useState(!!loginAccountUid);
    const [info, infoSet] = useState({
        step: 1,
        account: loginAccountUid,
        phone: '',
        password: '',
        authCode: '',
        appSecret: '',
        appKey: '',
        phoneNum: ''
    });
    const [cityInfo, cityInfoSet] = useState(DEFAULT_CITYINFO);
    const [roleInfo, roleInfoSet] = useState(DEFAULT_ROLEINFO);
    const [loginType, loginTypeSet] = useState(needLoginType ? LOGIN_TYPES[0] : { code: '', text: '' });
    const [counter, setCounter] = useSmsCountdown();
    const [isSavePassword, setIsSavePassword] = useState(false);
    const [tabKey, tabKeySet] = useState('1');
    const [scanType, scanTypeSet] = useState(2);
    const [scanCodeInfo, scanCodeInfoSet] = useState({
        qrcode: reviewIcon,
        qrcodeId: ''
    });

    const { step, phone, account, password, authCode, appSecret, appKey, phoneNum } = info;
    useEffect(() => {
        const savePasswordFlag = localStorage.getItem(`etaxLoginisSavePassword-${taxNo}-${account}`);
        setIsSavePassword(!!savePasswordFlag);

        const loginInfo = getLoginInfo();
        if (loginInfo && loginInfo.password) {
            onChangeInfo('password', loginInfo.password);
        }
        const nextCityInfo = (preCityInfo && preCityInfo.city) ? preCityInfo : getCityInfoByTaxNo(taxNo);
        onChangeCity(localStorage.getItem(`etaxLoginCity-${taxNo}`) || nextCityInfo?.city || '');
        onChangeRole(localStorage.getItem(`etaxLoginRoleText-${taxNo}-${account}`) || '开票员');

        return () => {
            clearTimeout(timeerQrcodeLoginRes);
            isPollingQrcodeLoginStatus = false;
        }
    }, [taxNo]);
    /*
    useEffect(() => {
        const { loginAccountUid = '' } = props.loginAccount || {};
        infoSet({
            ...info,
            account: loginAccountUid
        });
        accountDisableSet(!!loginAccountUid);
    }, [props.loginAccount]);
    */
    // 编辑
    function onChangeInfo(name, value) {
        infoSet({
            ...info,
            [name]: value
        });
    }

    // 城市切换
    const onChangeCity = (city) => {
        const cInfo = CITYS.find(item => item.city === city);
        cityInfoSet(cInfo || DEFAULT_CITYINFO);
    };

    // 城市切换
    const onChangeRole = (roleText) => {
        const rInfo = ROLES.find(item => item.roleText === roleText);
        roleInfoSet(rInfo || DEFAULT_ROLEINFO);
    };

    // 城市切换
    const onChangeLoginType = async(loginTypeText) => {
        const rInfo = LOGIN_TYPES.find(item => item.text === loginTypeText);
        loginTypeSet(rInfo || DEFAULT_LOGIN_TYPES);
        console.log('--rInfo-', rInfo);
        if (rInfo.code === LOGIN_TYPES[3].code) {
            const res = await qxyAccountConfigQuery({
                account,
                taxNo
            });
            const { errcode, description = '', data } = res;
            if (errcode !== '0000') {
                console.log(description, '获取企小云配置出错');
                return;
            }
            const { fappId, fsecret } = data || {};
            infoSet({
                ...info,
                appKey: fappId || '',
                appSecret: fsecret || ''
            });
        } else {
            infoSet({
                ...info,
                appKey: '',
                appSecret: ''
            });
        }
    };

    const onChangeSavePassword = (e) => {
        console.log(e.target.checked)
        setIsSavePassword(e.target.checked);
    }

    // 第一步登录
    const firstLogin = () => {
        const { saveAccountFlag = true } = props.loginAccount || {};
        if (!account || !password) {
            message.warn('账户和密码不能为空!');
            return;
        }

        if (!cityInfo || !cityInfo.city) {
            message.warn('地区不能为空!');
            return;
        }

        if (loginType.code === LOGIN_TYPES[3].code && (!appSecret || !appKey)) {
            message.warn('appKey、appSecret不能为空!');
            return;
        }

        if (loginType.code === LOGIN_TYPES[2].code) {
            if (!phoneNum) {
                message.warn('手机号不能为空!');
                return;
            }
            if (phoneNum.length !== 11) {
                message.warn({ content: '手机号码为11位！' });
                return;
            }
            const reg = /^1[0-9]{10}$/;
            if (!reg.test(phoneNum)) {
                message.warn('请填写正确格式的手机号！');
                return;
            }
        }

        commonlogin({
            account,
            password,
            saveAccountFlag, // 自动登录的企业
            taxNo,
            city: cityInfo.city,
            cityCode: cityInfo.code,
            roleText: roleInfo.roleText,
            roleCode: roleInfo.roleCode,
            loginType: loginType.code,
            appSecret,
            appKey,
            phoneNum
        });
    };

    // 第二步登录
    const startLogin = () => {
        const { saveAccountFlag = true } = props.loginAccount || {};
        if (!authCode) {
            message.warn('短信验证码不能为空!');
            return;
        }
        commonlogin({
            account,
            password,
            authCode,
            saveAccountFlag,
            taxNo,
            city: cityInfo.city,
            cityCode: cityInfo.code,
            roleText: roleInfo.roleText,
            roleCode: roleInfo.roleCode,
            loginType: loginType.code,
            appSecret,
            appKey
        });
    };

    // 请求
    const commonlogin = async(data) => {
        console.log(data, '---data')
        loadingSet(true);
        message.loading('登录中', 0);
        const res = await loginRequest(data, { operationType });
        message.destroy();
        loadingSet(false);

        const { errcode, description = '', data: resData = {} } = res;
        if (errcode !== '0000') {
            Modal.error({
                title: '温馨提示',
                content: description
            });
            return;
        }
        if (data.password && data.account && data.taxNo) {
            saveLoginInfo(data.password, data.account, data.taxNo);
        }
        if (data.roleText) {
            localStorage.setItem(`etaxLoginRoleText-${taxNo}-${account}`, data.roleText);
        }
        if (data.city) {
            localStorage.setItem(`etaxLoginCity-${taxNo}`, data.city);
        }
        const { uuid } = resData;
        if (uuid) {
            // 登录成功
            props.callback(res, {
                loginAccountUid: account
            });
        } else {
            // 第一步登录成功
            const phone = description.match(/\d{3}.{5}\d{3}/);
            infoSet({
                ...info,
                step: 2,
                phone: phone ? phone[0] : account
            });
            setCounter(120);
        }
    };

    // 返回上一步
    const returnFistStep = () => {
        setCounter(-1);
        infoSet({
            ...info,
            step: 1,
            phone: '',
            authCode: ''
        });
    };

    // 存储用户名和密码
    const saveLoginInfo = (password, account, taxNo) => {
        const now = new Date();
        const expire = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 三十天后过期
        let passwordCode = typeof btoa === 'function' ? btoa(encodeURIComponent(password)) : password;
        let expireCode = expire.toISOString();
        if (!isSavePassword) {
            passwordCode = '';
            expireCode = '';
        }
        localStorage.setItem(`etaxLoginisSavePassword-${taxNo}-${account}`, isSavePassword ? 'true' : '');
        localStorage.setItem(`etaxLoginPassword-${taxNo}-${account}`, passwordCode);
        localStorage.setItem(`etaxLoginExpireAt-${taxNo}-${account}`, expireCode);
    }

    // 检查登录信息是否过期
    const hasLoginInfoExpired = () => {
        const expireAt = localStorage.getItem(`etaxLoginExpireAt-${taxNo}-${account}`);
        if (expireAt) {
            const now = new Date();
            return now > new Date(expireAt);
        }
        return true; // 如果没有设置过期时间，则视为过期
    }

    // 获取存储的用户名和密码
    const getLoginInfo = () => {
        if (hasLoginInfoExpired()) {
            return '';
        }
        const cpassword = localStorage.getItem(`etaxLoginPassword-${taxNo}-${account}`) || '';
        let password;
        if (typeof window.atob === 'function') {
            try {
                password = decodeURIComponent(atob(cpassword));
            } catch (error) {
                console.log('旧密码编码变化需要重新输入', error);
                return '';
            }
        } else {
            password = cpassword;
        }
        return {
            password
        };
    }

    const onChangeTabs = (key) => {
        tabKeySet(key);
        currentTabKey = key;
        isPollingQrcodeLoginStatus = false;
        if (key === '1' && counter === -1) {
            firstLogin();
        } else if (key === '2') {
            initFetchQrcodeLogin();
        }
    }

    const onChangeScanType = e => {
        console.log('radio checked', e.target.value);
        scanTypeSet(e.target.value);

        initFetchQrcodeLogin(e.target.value);
    };

    const reviewFunc = () => {
        if (!scanCodeInfo.qrcodeId) {
            initFetchQrcodeLogin();
        }
    }

    const initFetchQrcodeLogin = (qrcodeType) => {
        isPollingQrcodeLoginStatus = false;
        clearTimeout(timeerQrcodeLoginRes);
        qrcodeLoginFunc(1, qrcodeType); // 刷新二维码
    }

    const qrcodeLoginFunc = async (loginStep, curScanType, curQrcodeId) => {
        const { saveAccountFlag = true } = props.loginAccount || {};
        if (!account || !password) {
            message.warn('账户和密码不能为空!');
            return;
        }

        if (!cityInfo || !cityInfo.city) {
            message.warn('地区不能为空!');
            return;
        }

        const data = {
            account,
            password,
            taxNo,
            saveAccountFlag,
            city: cityInfo.city,
            cityCode: cityInfo.code,
            roleText: roleInfo.roleText,
            roleCode: roleInfo.roleCode,
            loginType: loginType.code,
            qrcodeType: curScanType || scanType,
            loginStep: loginStep || 1,
            qrcodeId: curQrcodeId || scanCodeInfo.qrcodeId
        };
        if (parseInt(data.loginStep) === 1) {
            loadingSet(true);
            message.loading('正在获取二维码', 0);
        }
        const res = await qrcodeLoginRequest(data, { operationType }); // 1803: 二维码失效, 1804: 登录中
        message.destroy();
        loadingSet(false);
        const { errcode, description = '', data: resData = {} } = res;
        if (errcode !== '0000' && errcode !== '1804') {
            message.warn(description || '请求失效，请重试!');
            isPollingQrcodeLoginStatus = false;
            scanCodeInfoSet({
                qrcode: reviewIcon,
                qrcodeId: ''
            });
            return;
        }
        const { qrcodeId, qrcode, uuid } = resData || {};
        if (parseInt(data.loginStep) === 1) {
            isPollingQrcodeLoginStatus = true;

            const base64PrefixRegex = /^data:([a-zA-Z]+\/[a-zA-Z+.-]+)?;base64,/i;
            const base64Code = base64PrefixRegex.test(qrcode) ? qrcode : `data:image/jpg;base64,${qrcode}`;
            scanCodeInfoSet({
                qrcodeId,
                qrcode: base64Code
            });
            infoSet({
                ...info,
                step: 2
            });
        }

        if (uuid) {
            isPollingQrcodeLoginStatus = false;
            // 修改成功
            props.callback(res, {
                loginAccountUid: account
            });
        } else {
            if ((qrcodeId || data.qrcodeId) && currentTabKey === '2' && isPollingQrcodeLoginStatus) {
                timeerQrcodeLoginRes = setTimeout(() => {
                    qrcodeLoginFunc(2, data.qrcodeType, qrcodeId || data.qrcodeId);
                }, 1000);
            } else {
                isPollingQrcodeLoginStatus = false;
                scanCodeInfoSet({
                    qrcode: reviewIcon,
                    qrcodeId: ''
                });
            }
        }
    }

    return (
        <div className='pwy-etax-login'>
            <div className={`pwy-etax-main ${props.className || ''}`} style={props.style}>
                <div className='loginForm'>
                    {step === 1 ? (
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
                                    {CITYS.map((o) => (
                                        <Option label={o.city} key={o.code} value={o.city}>
                                            {o.city}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div className='loginItem'>
                                <label className='loginLabel'>税号：</label>
                                <Input
                                    placeholder='统一社会信用代码/纳税人识别号'
                                    className='loginInput'
                                    disabled
                                    value={taxNo}
                                />
                            </div>
                            <div className='loginItem'>
                                <label className='loginLabel'>账户：</label>
                                <Input
                                    placeholder='居民身份证号码/手机号码/用户名'
                                    className='loginInput'
                                    disabled={accountDisable}
                                    value={account}
                                    autoComplete='off'
                                    onChange={(e) => onChangeInfo('account', e.target.value.trim())}
                                />
                            </div>
                            <div className='loginItem'>
                                <label className='loginLabel'>密码：</label>
                                <Input.Password
                                    placeholder='个人用户密码'
                                    className='loginInput'
                                    value={password}
                                    autoComplete='off'
                                    onChange={(e) => onChangeInfo('password', e.target.value.trim())}
                                    onPressEnter={firstLogin}
                                />
                            </div>
                            <div className='loginItem'>
                                <label className='loginLabel'>角色：</label>
                                <Select
                                    className='loginInput'
                                    value={roleInfo.roleText}
                                    onChange={onChangeRole}
                                    placeholder='请选择'
                                >
                                    {ROLES.map((item) => <Option key={item.roleCode} value={item.roleText}>{item.roleText}</Option>)}
                                </Select>
                            </div>
                            {
                                needLoginType && (
                                    <div className='loginItem'>
                                        <label className='loginLabel'>登录类型：</label>
                                        <Select
                                            className='loginInput'
                                            value={loginType.text}
                                            onChange={onChangeLoginType}
                                            placeholder='请选择'
                                        >
                                            {LOGIN_TYPES.map((item) => <Option key={item.code} value={item.text}>{item.text}</Option>)}
                                        </Select>
                                    </div>
                                )
                            }
                            {
                                loginType.code === LOGIN_TYPES[3].code && (
                                    <>
                                        <div className='loginItem'>
                                            <label className='loginLabel'>企享云appKey：</label>
                                            <Input
                                                placeholder='企享云appKey'
                                                className='loginInput'
                                                value={appKey}
                                                autoComplete='off'
                                                onChange={(e) => onChangeInfo('appKey', e.target.value.trim())}
                                                onPressEnter={firstLogin}
                                            />
                                        </div>
                                        <div className='loginItem'>
                                            <label className='loginLabel'>企享云appSecre：</label>
                                            <Input
                                                placeholder='企享云appSecre'
                                                className='loginInput'
                                                value={appSecret}
                                                autoComplete='off'
                                                onChange={(e) => onChangeInfo('appSecret', e.target.value.trim())}
                                                onPressEnter={firstLogin}
                                            />
                                        </div>
                                    </>
                                )
                            }
                            {
                                loginType.code === LOGIN_TYPES[2].code && (
                                    <>
                                        <div className='loginItem'>
                                            <label className='loginLabel'>手机号：</label>
                                            <Input
                                                maxLength={11}
                                                placeholder='手机号'
                                                className='loginInput'
                                                disabled={accountDisable}
                                                value={phoneNum}
                                                autoComplete='off'
                                                onChange={(e) => onChangeInfo('phoneNum', e.target.value.trim())}
                                            />
                                        </div>
                                        <div className="appAutoLogin" style={{
                                            color: '#666'
                                        }}>
                                            须在能收取税局短信验证码的手机上，安装发票云自动登录APP，并保持APP常驻运行，APP将自动收取验证码上传税局，完成登录。
                                        <a style={{ color: '#1677ff' }} href='https://jdpiaozone.yuque.com/nbklz3/dn5ehb/oghbn3vph14nz4ss?singleDoc#' target='_blank'>点击查看APP 使用说明</a>
                                        </div>
                                    </>
                                )
                            }
                            <div className='loginItem loginItemPassword'>
                                {/* <label className='loginLabel'></label> */}
                                <Checkbox
                                    style={{ fontSize: '12px' }}
                                    checked={isSavePassword}
                                    onChange={onChangeSavePassword}
                                >
                                    记住密码（此设备保留本地30天有效，非安全设备勿选）
                                </Checkbox >
                            </div>
                            <div className='loginItem loginItemButtons'>
                                <Button type='primary' onClick={firstLogin} loading={loading}>登录</Button>
                                {(loginType.code === LOGIN_TYPES[0].code || !needLoginType) && (
                                    <Button onClick={() => onChangeTabs('2')} loading={loading}>扫码登录</Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <Tabs activeKey={tabKey} onChange={onChangeTabs}>
                            <TabPane tab="短信登录" key="1">
                                <div className='tabsCodeCont'>
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
                                            maxLength={6}
                                            value={authCode}
                                            onChange={(e) => infoSet({ ...info, authCode: e.target.value.trim() })}
                                            placeholder='请输入短信验证码'
                                            suffix={<span>{~counter ? `${counter}s` : ''}</span>}
                                            onPressEnter={startLogin}
                                        />
                                        <Button
                                            disabled={~counter || loading}
                                            className='loginCode'
                                            type='primary'
                                            onClick={firstLogin}
                                        >
                                            获取验证码
                                        </Button>
                                    </div>
                                    <div className='loginItem'>
                                        <Button className='mr20' onClick={returnFistStep}>上一步</Button>
                                        <Button type='primary' onClick={startLogin} loading={loading}>登录</Button>
                                    </div>
                                </div>
                            </TabPane>
                            { (loginType.code === LOGIN_TYPES[0].code || !needLoginType) && (<TabPane tab="扫码登录" key="2">
                                <div className='scan-login'>
                                    <div style={{margin: '6px 0 26px 0'}}><span className='title'>选择扫码APP</span><span>请使用选择的APP扫描二维码进行登录</span></div>
                                    <Radio.Group onChange={onChangeScanType} value={scanType} style={{fontSize: '14px'}} disabled={loading}>
                                        <Radio value={2}>电子税务局APP</Radio>
                                        <Radio value={1} style={{marginLeft: '30px'}}>个人所得税APP</Radio>
                                    </Radio.Group>
                                    <div className='imgCont'>
                                        <img src={scanCodeInfo.qrcode} className='codeImg' alt='' onClick={reviewFunc} style={!scanCodeInfo.qrcodeId ? {border: '1px solid #e2e2e2'} : {}}/>
                                        { !scanCodeInfo.qrcodeId && <div className='tip'>二维码失效，点击刷新</div> }
                                        { scanCodeInfo.qrcodeId && <div>长按二维码下载</div>}
                                    </div>
                                </div>
                            </TabPane>)}
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}

Login.propTypes = {
    taxNo: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    callback: PropTypes.func,
    loginAccount: PropTypes.object,
    operationType: PropTypes.string
};

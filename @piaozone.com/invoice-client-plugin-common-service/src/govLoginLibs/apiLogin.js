
/* global window, localStorage, sessionStorage, location */
/* eslint-disable func-names */
export async function apiLogin(innerOpt = {}) {
    const setCookie = window.pwyNightmare.setCookie;
    let result;
    const taxNo = innerOpt.taxNo || '';
    const account = innerOpt.account;
    const accountPasswd = innerOpt.accountPasswd;
    const redirectURI = innerOpt.redirectURI;
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
        return false;
    }
    if (typeof window.tpassTools !== 'function') {
        return {
            errcode: '0000',
            data: {
                errMsg: '由于税局升级影响，请稍后再试！'
            }
        };
    }
    try {
        // b.interceptors.response.use console.log(e.config.baseURL, e.config.url, JSON.stringify(t));
        result = await window.tpassTools({
            url: '/auth/enterprise/quick/accountLogin',
            method: 'post',
            data: {
                client_id: clientId,
                account: account,
                password: accountPasswd,
                redirect_uri: redirectURI,
                creditCode: taxNo
            }
        });
        const loginSuccess = async(loginResult) => {
            const datagram = loginResult.datagram;
            localStorage.setItem('token', datagram.access_token);
            localStorage.setItem('code', datagram.code);
            setCookie('token', datagram.access_token);
            let url;
            if (redirectURI.indexOf('?') !== -1) {
                url = redirectURI + '&code=' + datagram.code + '&state=test';
            } else {
                url = redirectURI + '?code=' + datagram.code + '&state=test';
            }
            /*
            const userInfoRes = await window.tpassTools({
                url: '/auth/oauth2/userinfo',
                method: 'post',
                data: {
                    access_token: datagram.access_token
                }
            });
            if (userInfoRes.datagram && userInfoRes.datagram.user_id) {
                const dataStr = encodeURIComponent(JSON.stringify(userInfoRes.datagram));
                const encryData = (new window.TpassEncoderDecoder()).encode(dataStr);
                localStorage.setItem('userinfo', encryData);
                localStorage.setItem('userType', userInfoRes.datagram.user_type);
                localStorage.setItem('agentId', userInfoRes.datagram.agency_enterprise_id);
            }

            return {
                errcode: '0000',
                data: {
                    url: url,
                    token: datagram.access_token,
                    new_key16: localStorage.getItem('new_key16'),
                    clientId: localStorage.getItem('clientId'),
                    natureuuid: localStorage.getItem('natureuuid'),
                    'X-NATURE-IP': localStorage.getItem('X-NATURE-IP'),
                    ded: localStorage.getItem('ded'),
                    userId: userInfoRes.datagram.user_id,
                    newEtaxFlag: userInfoRes.datagram.newEtaxFlag,
                    user_type: userInfoRes.datagram.user_type,
                    areaPrefix: localStorage.getItem('areaPrefix')
                }
            };
            */
            return {
                errcode: '0000',
                description: '操作成功',
                data: {
                    url: url
                }
            };
        };

        // 直接登录成功，不需要选择角色
        if (result.datagram.access_token) {
            return await loginSuccess(result);
        }

        let roleType = innerOpt.roleType || '09';
        const relationPoList = result.datagram.relationPoList || [];
        const roleTypeList = [];
        // [{"zrrlx":"03","qrzt":"00"}, {"zrrlx":"08","qrzt":"00"},{"zrrlx":"09","qrzt":"00"}]
        for (let i = 0; i < relationPoList.length; i++) {
            const curItem = relationPoList[i];
            if (curItem.qrzt === '00') {
                roleTypeList.push(curItem.zrrlx);
            }
        }
        if (roleTypeList.length === 0) {
            return {
                errcode: '0000',
                data: {
                    errMsg: '有效的角色为空，请先到税局确认角色后再登录!'
                }
            };
        }
        if (!roleTypeList.includes(roleType)) {
            if (roleTypeList.includes('02')) {
                roleType = '02';
            } else if (roleTypeList.includes('09')) {
                roleType = '09';
            } else if (roleTypeList.includes('03')) {
                roleType = '03';
            } else {
                roleType = roleTypeList[0];
            }
        }
        result = await window.tpassTools({
            url: '/auth/enterprise/quick/quickLogin',
            method: 'post',
            data: {
                client_id: clientId,
                redirect_uri: redirectURI,
                relatedType: roleType,
                uuid: result.datagram.uuid
            }
        });
        return await loginSuccess(result);
    } catch (error) {
        const value = error.message || '税局请求异常，请稍后再试!';
        const errMsg = value.indexOf('该用户未注册，请在自然人业务入口进行用户注册') !== -1 ? '登录失败，请检查账号是否存在或信息是否正确' : value;
        return {
            errcode: '0000',
            data: {
                errMsg
            }
        };
    }
}

// 不用输入，直接通过底层方法调用登录
export async function apiFirstLogin(innerOpt = {}) {
    const taxNo = innerOpt.taxNo || '';
    const account = innerOpt.account;
    const accountPasswd = innerOpt.accountPasswd;
    const redirectURI = innerOpt.redirectURI;
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
        return false;
    }
    if (typeof window.tpassTools !== 'function') {
        return {
            errcode: '0000',
            data: {
                errMsg: '由于税局升级影响，请稍后再试！'
            }
        };
    }
    try {
        const res = await window.tpassTools({
            url: '/auth/enterprise/quick/factorAccountLogin',
            method: 'post',
            data: {
                client_id: clientId,
                account: account,
                password: accountPasswd,
                redirect_uri: redirectURI,
                creditCode: taxNo
            }
        });
        const result = {
            uuid: res.datagram.uuid,
            account
        };
        const resultKey = encodeURIComponent(taxNo + account + 'login-result');
        sessionStorage.setItem(resultKey, JSON.stringify(result));
        const resData = res.datagram || {};
        const mobile = resData.mobile || '';
        if (!mobile) {
            return {
                errcode: '0000',
                data: {
                    errMsg: '税局请求异常，请稍后再试!'
                }
            };
        }
        return {
            errcode: '0000',
            data: {
                phone: mobile
            }
        };
    } catch (error) {
        const errMsg = error.message || '税局请求异常，请稍后再试!';
        return {
            errcode: '0000',
            data: {
                errMsg
            }
        };
    }
}

export async function sendMsgPreCheck(innerOpt = {}) {
    const url = location.href;
    if (typeof window.tpassTools !== 'function') {
        return true;
    }
    if (!/https:\/\/tpass\..+\.chinatax\.gov\.cn:8443/.test(url)) {
        return false;
    }
    const taxNo = innerOpt.taxNo || '';
    const account = innerOpt.account;
    const resultKey = encodeURIComponent(taxNo + account + 'login-result');
    const loginResultStr = sessionStorage.getItem(resultKey);
    if (!loginResultStr) {
        return false;
    }
    const loginResult = JSON.parse(loginResultStr);
    if (!loginResult.uuid) {
        return false;
    }
    return true;
}

// 底层方法发送短信
export async function apiSendShortMsg(innerOpt = {}) {
    const taxNo = innerOpt.taxNo || '';
    const account = innerOpt.account;
    if (typeof window.tpassTools !== 'function') {
        return {
            errcode: '95000',
            description: '由于税局升级影响，请稍后再试！'
        };
    }
    const resultKey = encodeURIComponent(taxNo + account + 'login-result');
    const loginResultStr = sessionStorage.getItem(resultKey);
    const loginResult = JSON.parse(loginResultStr);
    try {
        const res = await window.tpassTools({
            url: '/auth/user/second/sendSmsCodeByUuid',
            method: 'post',
            data: {
                uuid: loginResult.uuid
            }
        });

        const resData = res.datagram || {};
        const smscode_id = resData.smscode_id || '';
        const mobile = resData.mobile || '';
        if (!smscode_id || !mobile) {
            return {
                errcode: '95000',
                description: '税局请求异常，请稍后再试'
            };
        }
        const result = {
            ...loginResult,
            smscode_id: smscode_id
        };
        sessionStorage.setItem(resultKey, JSON.stringify(result));
        return {
            errcode: '0000',
            description: '操作成功'
        };
    } catch (error) {
        const errMsg = error.message || '税局请求异常，请稍后再试!';
        return {
            errcode: '95000',
            description: errMsg
        };
    }
}

// 底层方法第二步登录
export async function apiSecondLogin(innerOpt = {}) {
    if (typeof window.tpassTools !== 'function') {
        return {
            errcode: '95000',
            description: '由于税局升级影响，请稍后再试！'
        };
    }
    const setCookie = window.pwyNightmare.setCookie;
    const taxNo = innerOpt.taxNo || '';
    const account = innerOpt.account;
    const redirectURI = innerOpt.redirectURI;
    const resultKey = encodeURIComponent(taxNo + account + 'login-result');
    const loginStr = sessionStorage.getItem(resultKey) || '{}';
    const loginResult = JSON.parse(loginStr);
    const locationUrl = location.href;
    const clientId = localStorage.getItem('clientId');
    if (!/https:\/\/tpass\..+\.chinatax\.gov\.cn:8443/.test(locationUrl) || !loginResult.smscode_id) {
        return {
            errcode: '95000',
            description: '第一步登录已失效，请重新获取验证码再登录!'
        };
    }

    const loginSuccess = async(successResult) => {
        const datagram = successResult.datagram;
        localStorage.setItem('token', datagram.access_token);
        localStorage.setItem('code', datagram.code);
        setCookie('token', datagram.access_token);
        let url;
        if (redirectURI.indexOf('?') !== -1) {
            url = redirectURI + '&code=' + datagram.code + '&state=test';
        } else {
            url = redirectURI + '?code=' + datagram.code + '&state=test';
        }
        /*
        const userInfoRes = await window.tpassTools({
            url: '/auth/oauth2/userinfo',
            method: 'post',
            data: {
                access_token: datagram.access_token
            }
        });
        if (userInfoRes.datagram && userInfoRes.datagram.user_id) {
            const dataStr = encodeURIComponent(JSON.stringify(userInfoRes.datagram));
            const encryData = (new window.TpassEncoderDecoder()).encode(dataStr);
            localStorage.setItem('userinfo', encryData);
            localStorage.setItem('userType', userInfoRes.datagram.user_type);
            localStorage.setItem('agentId', userInfoRes.datagram.agency_enterprise_id);
        }

        return {
            errcode: '0000',
            data: {
                url: url,
                token: datagram.access_token,
                new_key16: localStorage.getItem('new_key16'),
                clientId: localStorage.getItem('clientId'),
                natureuuid: localStorage.getItem('natureuuid'),
                'X-NATURE-IP': localStorage.getItem('X-NATURE-IP'),
                ded: localStorage.getItem('ded'),
                userId: userInfoRes.datagram.user_id,
                newEtaxFlag: userInfoRes.datagram.newEtaxFlag,
                user_type: userInfoRes.datagram.user_type,
                areaPrefix: localStorage.getItem('areaPrefix')
            }
        };
        */
        return {
            errcode: '0000',
            description: '操作成功',
            data: {
                url: url
            }
        };
    };

    try {
        const res = await window.tpassTools({
            url: '/auth/enterprise/quick/SmsMessageLogin',
            method: 'post',
            data: {
                client_id: clientId,
                redirect_uri: redirectURI,
                smscode_id: loginResult.smscode_id,
                smsCode: innerOpt.smsCode,
                uuid: loginResult.uuid
            }
        });

        let datagram = res.datagram;
        if (datagram.access_token) {
            return await loginSuccess(res);
        }

        let roleType = innerOpt.roleType || '09';
        if (datagram.relationPoList) {
            const relationPoList = datagram.relationPoList || [];
            const roleTypeList = [];
            for (let i = 0; i < relationPoList.length; i++) {
                const curItem = relationPoList[i];
                // 已经确认的角色
                if (curItem.qrzt === '00') {
                    roleTypeList.push(curItem.zrrlx);
                }
            }
            if (roleTypeList.length === 0) {
                return {
                    errcode: '95000',
                    description: '有效的角色为空，请先到税局确认角色后再登录!'
                };
            }
            if (!roleTypeList.includes(roleType)) {
                if (roleTypeList.includes('02')) {
                    roleType = '02';
                } else if (roleTypeList.includes('09')) {
                    roleType = '09';
                } else if (roleTypeList.includes('03')) {
                    roleType = '03';
                } else {
                    roleType = roleTypeList[0];
                }
            }
            const result = await window.tpassTools({
                url: '/auth/enterprise/quick/quickLogin',
                method: 'post',
                data: {
                    client_id: clientId,
                    redirect_uri: redirectURI,
                    relatedType: roleType,
                    uuid: datagram.uuid
                }
            });
            datagram = result.datagram || {};
            if (datagram.access_token) {
                return await loginSuccess(result);
            }
        }
        return {
            errcode: '95000',
            description: '税局登录异常，请重试'
        };
    } catch (error) {
        const errMsg = error.message || '税局请求异常，请稍后再试!';
        return {
            errcode: '95000',
            description: errMsg
        };
    }
}
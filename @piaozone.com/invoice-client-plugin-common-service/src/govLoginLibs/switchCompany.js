/* global window document,localStorage */
/* eslint-disable func-names,complexity */

// tpassEncoderDecoder 位置
// _0x38f240 = _0x424cde['\x64\x65\x63\x72\x79\x70\x74'](_0xd9c249, _0x57f7a3);
export async function changeUser(opt = {}) {
    const taxNo = opt.taxNo;
    let relatedType = opt.relatedType || '09';
    const token = window.localStorage.getItem('token');
    let result;
    if (typeof window.tpassTools !== 'function') {
        return {
            errcode: '95000',
            description: '税局执行异常异常，请稍后再试!'
        };
    }

    const setCookie = function(e, t, n) {
        n = n || 0;
        let r = '';
        if (n !== 0) {
            const o = new Date();
            o.setTime(o.getTime() + 1e3 * n);
            r = '; expires=' + o.toGMTString();
        }
        if (n === -1) {
            const hostname = window.location.hostname;
            document.cookie = e + '=' + escape(t) + r + ';domain=.' + hostname + '; path=/';
            document.cookie = e + '=' + escape(t) + r + '; path=/';
        } else {
            document.cookie = e + '=' + escape(t) + r + '; path=/';
        }
    };

    const clearCookie = function(name) {
        setCookie(name, '', -1);
    };

    const tpassEncoderDecoder = window.TpassEncoderDecoder ? new window.TpassEncoderDecoder() : window.pwyNightmare.tpassDecoder;
    try {
        const userinfoStr = localStorage.getItem('userinfo');
        const userinfo = JSON.parse(decodeURIComponent(tpassEncoderDecoder.decode(userinfoStr)));
        // 先查询税号信息
        result = await window.tpassTools({
            url: '/idm/internal/relation/selectRelationList',
            method: 'post',
            data: {
                reg_number: userinfo.reg_number,
                fid: userinfo.enterprise_id,
                uid: userinfo.user_id,
                uniqueIdentity: taxNo,
                optype: '1',
                queryScene: '112',
                relatedStatus: '',
                maskingFlag: '0',
                enterpriseName: '',
                pageNo: 1,
                pageSize: 10,
                syncFlag: ''
            }
        });
        const relationResult = result.datagram || {};
        const relationList = relationResult.relationList || [];
        if (relationList.length < 1) {
            return {
                errcode: '95000',
                description: `该账号未查询到该企业(${taxNo})，请检查!`
            };
        }
        const newUserInfo = relationList[0];
        // 根据企业id查询角色
        result = await window.tpassTools({
            url: '/idm/internal/relation/selectRelationList',
            method: 'post',
            data: {
                reg_number: newUserInfo.reg_number,
                fid: newUserInfo.fid,
                uid: newUserInfo.uid,
                optype: '1',
                queryScene: '115',
                pageNo: 1,
                pageSize: 100,
                syncFlag: ''
            }
        });
        const roleResult = result.datagram || {};
        const roleList = roleResult.relationList || [];
        const rightRoleList = [];
        for (let i = 0; i < roleList.length; i++) {
            const curItem = roleList[i];
            const { confirmStatus, realationStatus } = curItem;
            if (confirmStatus === '00') {
                rightRoleList.push(realationStatus);
            }
        }
        if (rightRoleList.length === 0) {
            return {
                errcode: '95000',
                description: `该企业(${taxNo})有效角色为空，请检查!`
            };
        }
        // 传入的角色不在可以切换的角色列表中
        if (!rightRoleList.includes(relatedType)) {
            if (rightRoleList.includes('02')) { // 财务负责人
                relatedType = '02';
            } else if (rightRoleList.includes('09')) { // 开票员
                relatedType = '09';
            } else if (rightRoleList.includes('03')) { // 办税员
                relatedType = '03';
            } else {
                relatedType = rightRoleList[0];
            }
        }
        const areaCode = window.localStorage.getItem('areaPrefix');
        result = await window.tpassTools({
            header: {
                Authonrization: token
            },
            url: '/auth/oauth2/changeUser',
            method: 'post',
            data: {
                'creditCode': taxNo,
                'relatedType': relatedType,
                'agencyCreditCode': '',
                'areaCode': areaCode
            }
        });
        const changeUserDatagram = result.datagram || {};
        if (!changeUserDatagram.access_token) {
            return {
                errcode: '95000',
                description: '税局请求异常，请稍后再试!'
            };
        }
        localStorage.setItem('token', changeUserDatagram.access_token);
        localStorage.setItem('code', changeUserDatagram.code);

        clearCookie('token');
        setCookie('token', changeUserDatagram.access_token);

        const logoutAll = function(urls) {
            if (urls.length === 0) {
                return [];
            }
            const requests = urls.map((url) => {
                return new Promise((resolve) => {
                    const image = new window.Image();
                    const delimiter = url.indexOf('?') >= 0 ? '&tmp=' : '?tmp=';
                    image.onload = () => resolve(true);
                    image.onerror = () => resolve(true);
                    image.src = url + delimiter + Math.floor(Math.random() * 100000);
                });
            });
            return Promise.all(requests);
        };

        const analyticsResponse = await window.tpassTools({
            url: '/auth/oauth2/getDpUrl',
            method: 'post',
            data: {}
        });

        if (analyticsResponse && analyticsResponse.datagram && analyticsResponse.datagram.url) {
            const urls = analyticsResponse.datagram.url.split(',');
            await logoutAll(urls);
        }

        const finalResponse = await window.tpassTools({
            url: '/acl/app/getRedirect',
            method: 'post',
            data: {
                applicationId: localStorage.getItem('clientId')
            }
        });
        const userInfoRes = await window.tpassTools({
            url: '/auth/oauth2/userinfo',
            method: 'post',
            data: {
                access_token: changeUserDatagram.access_token
            }
        });
        if (userInfoRes.datagram && userInfoRes.datagram.user_id) {
            const userInfo = userInfoRes.datagram;
            const dataStr = encodeURIComponent(JSON.stringify(userInfoRes.datagram));
            const encryData = tpassEncoderDecoder.encode(dataStr);
            localStorage.setItem('userinfo', encryData);
            localStorage.setItem('userType', userInfoRes.datagram.user_type);
            localStorage.setItem('agentId', userInfoRes.datagram.agency_enterprise_id);
            let redirectUrl = '';
            if (userInfo.newEtaxFlag !== '1') {
                redirectUrl = userInfo.user_type === '1'
                    ? (finalResponse.datagram && finalResponse.datagram.zrrcdxdz)
                    : (finalResponse.datagram && finalResponse.datagram.redirectUrl);
            } else {
                redirectUrl = userInfo.user_type === '1'
                    ? (finalResponse.datagram.dz_zrrcdxdz || finalResponse.datagram.zrrcdxdz)
                    : (finalResponse.datagram.dz_cdxdz || finalResponse.datagram.redirectUrl);
            }
            const delimiter = redirectUrl.indexOf('?') >= 0 ? '&code=' : '?code=';
            return {
                errcode: '0000',
                description: '操作成功',
                data: {
                    url: redirectUrl + delimiter + changeUserDatagram.code
                }
            };
        }
        return {
            errcode: '95000',
            description: '税局请求异常，请稍后再试!'
        };
    } catch (error) {
        const errMsg = error.message || '税局请求异常，请稍后再试!';
        return {
            errcode: '95000',
            token,
            taxNo,
            relatedType,
            description: errMsg
        };
    }
}

export function waitSwitchCompany() {
    const obj1 = document.querySelector('.search-form input[placeholder="请输入统一社会信用代码"]');
    const obj2 = document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]');
    if (obj1) {
        return {
            errcode: '0000',
            data: true
        };
    }
    if (obj2) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }
    return false;
}

export async function waitSwitchCompanyEnd({ roleText = '' }) {
    // 登录失效
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }

    if (document.querySelector('[aria-label="身份类型选择"] .el-button--primary:last-child')) {
        // 选择角色为隐藏状态不需要处理角色
        const displayStyle = document.querySelector('[aria-label="身份类型选择"]').parentElement.getAttribute('style');
        if (displayStyle.indexOf('none') !== -1) {
            return false;
        }
        let roleIndex = -1;
        const roleList = [];
        const selectItems = document.querySelectorAll('.el-radio-group .el-radio');
        for (let i = 0; i < selectItems.length; i++) {
            const curItem = selectItems[i];
            const curText = curItem.innerText;
            roleList.push(curText);
            if (curText.indexOf(roleText) !== -1) {
                curItem.click();
                roleIndex = i;
            }
        }
        if (roleIndex === -1) {
            if (roleList.indexOf('财务负责人') !== -1) {
                roleText = '财务负责人';
            } else if (roleList.indexOf('开票员') !== -1) {
                roleText = '开票员';
            } else if (roleList.indexOf('办税员') !== -1) {
                roleText = '办税员';
            } else {
                roleText = roleList[0];
            }

            for (let i = 0; i < selectItems.length; i++) {
                const curItem = selectItems[i];
                if (curItem.innerText.indexOf(roleText) !== -1) {
                    curItem.click();
                    roleIndex = i;
                }
            }
        }

        if (roleIndex === -1) {
            return {
                errcode: '0000',
                data: {
                    errMsg: '该账号没有电子税局开票和用票权限'
                }
            };
        }

        const selectObj = document.querySelector('.el-radio-group .el-radio.is-checked');
        if (!selectObj || selectObj.innerText.indexOf(roleText) === -1) {
            selectItems[roleIndex].click();
        }

        return {
            errcode: '0000',
            data: {
                seletor: '[aria-label="身份类型选择"] .el-button--primary:last-child'
            }
        };
    }

    const bodyText = document.body.innerText || '';
    if (bodyText.indexOf('蓝字发票开具') !== -1 || bodyText.indexOf('税务数字账户') !== -1) {
        return {
            errcode: '0000',
            data: true
        };
    }
    if (bodyText.indexOf('我要办税') !== -1 && bodyText.indexOf('常用功能') !== -1 && bodyText.indexOf('我的信息') !== -1) {
        return {
            errcode: '0000',
            data: true
        };
    }
    return false;
}

// 检测输入的值是否正确
export async function checkInput({ value, selector }) {
    const obj = document.querySelector(selector);
    if (obj && obj.value === value) {
        return true;
    }
    return false;
}

export async function switchCompany({ logoutSelector = '', taxNo }) {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]') ||
    (logoutSelector && document.querySelector(logoutSelector))) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }
    const loadingObj = document.querySelector('.el-loading-mask');
    const style = loadingObj.getAttribute('style');

    // 还在加载中
    if (style.indexOf('none') !== -1) {
        return false;
    }
    await window.pwyNightmare.sleep(1000);
    const rows = document.querySelectorAll('.el-table__body tbody .el-table__row');
    if (!rows || rows.length === 0) {
        return {
            errcode: '0000',
            data: {
                errMsg: '当前账号未查询到该企业(' + taxNo + ')'
            }
        };
    }
    for (let i = 0; i < rows.length; i++) {
        const curItem = rows[i];
        const text = curItem.innerText || '';
        if (text.indexOf(taxNo) !== -1) {
            return {
                errcode: '0000',
                data: {
                    selector: `.el-table__body .el-table__row:nth-child(${i + 1}) button:first-child`
                }
            };
        }
    }
    return {
        errcode: '0000',
        data: {
            errMsg: '当前账号未查询到该企业（' + taxNo + '）'
        }
    };
}

export function searchAccountCenter(opt = {}) {
    const { titleSelector, accountSelector } = opt;
    if (document.querySelector('.search-form .el-button--primary')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    // 登录失效的判断
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }

    if (!document.querySelector(titleSelector)) {
        return false;
    }
    document.querySelector(titleSelector).click();
    const list = document.querySelectorAll(accountSelector);
    if (list.length === 0) {
        return false;
    }

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const text = item.innerText;
        if (text.indexOf('账户中心') !== -1) {
            const clickItem = item.querySelector('a');
            if (clickItem) {
                clickItem.click();
            } else {
                item.click();
            }
            return {
                errcode: '0000',
                data: true
            };
        }
    }
    return false;
}

export function clickSwitch(opt = {}) {
    const loginBtn = opt.loginBtn || '';
    if (loginBtn && document.querySelector(loginBtn)) {
        document.querySelector(loginBtn).click();
        return false;
    }
    if (document.querySelector('.search-form .el-button--primary')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    // 登录失效的判断
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }
    const list = document.querySelectorAll('.el-menu .el-submenu');
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item.innerText.indexOf('身份切换') !== -1) {
            item.querySelector('.el-submenu__title').click();
            break;
        }
    }
    return false;
}

// 检查是否在企业切换界面
export function checkIsExchangePage(opt = {}) {
    if (document.querySelector('.search-form .el-button--primary')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    // 登录失效的判断
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }
    /*
    const currentURL = window.location.href;
    if (!/^https:\/\/tpass.[a-zA-Z0-9]+.chinatax.gov.cn:8443/.test(currentURL)) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }
    */
    if (typeof window.tpassTools === 'function') {
        return {
            errcode: '0000',
            data: true
        };
    }
    return false;
}

export async function clearAllUrls(opt = {}) {
    const urls = opt.urls;
    for (let i = 0; i < urls.length; i++) {
        const image = new window.Image();
        const url = urls[i];
        const delimiter = url.indexOf('?') >= 0 ? '&tmp=' : '?tmp=';
        image.src = url + delimiter + Math.floor(Math.random() * 100000);
    }
}

export const switchOptions = {
    'shenzhen': {
        titleSelector: '.wdxxT', // 我的信息选择器
        accountSelector: '#wdxx-menu .menu-item'
    }
};
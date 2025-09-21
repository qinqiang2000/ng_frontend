/* eslint-disable */

export const initPage = () => {
    // 税局已升级，需要重新进入首页
    if (document.body.innerText.indexOf('页面不存在或已删除') !== -1) {
        location.href = document.querySelector('a').href;
        return false;
    }

    if (typeof $ !== 'function') {
        return false;
    }

    if (!$('#okButton').is(':hidden')) {
        $('#okButton').click();
    }
    if ($('#password1').length === 0) {
        return false;
    }
    return {
        errcode: '0000',
        description: 'success',
        data: true
    };
}

export const inputLogins = (opt = {}) => {
    $('#password1').val(opt.caPassword);
    $('#password').val(opt.caPassword);

    if (opt.ptPassword) {
        $('#password2').val(opt.ptPassword);
        $('#password3').val(opt.ptPassword);
    }
};

export const waitLogin = () => {
    let msgObj = $('#popup_message');
    const getCookie = window.pwyNightmare.getCookie;
    const token = getCookie('token');
    const companyName = getCookie('nsrmc');
    const skssq = getCookie('skssq');
    const gxrqfw = getCookie('gxrqfw');
    // 已经登录到后台
    if (location.href.indexOf('main') !== -1) {
        // 小规模纳税人没有税期
        if (token && companyName) {
            if (typeof closehzfp === 'function') {
                closehzfp();
            }
            const hasHiddenDkgx = $('#header li[name="menu_dkgx"]').is(':hidden');
            return {
                errcode: '0000',
                description: 'success',
                data: {
                    companyType: hasHiddenDkgx ? '02' : '03',
                    companyName,
                    skssq,
                    gxrqfw,
                    baseUrl: location.origin + IP
                }
            };
        }
        return false;
    }
    // 平台密码出现了问题
    if ($('#ptmmTs').css('display') !== 'none') {
        let tips = $('#ptmmTs').text().replace('重置平台密码', '');
        tips = tips.replace(/^\s+/g,'').replace(/\s+$/g,'');
        if (tips.indexOf('请输入平台密码') !== -1) {
            return {
                errcode: '0000',
                description: 'success',
                data: {
                    errMsg: '当前企业设置了平台密码，请输入平台密码后再操作'
                }
            };
        } else if (tips) {
            return {
                errcode: '0000',
                description: 'success',
                data: {
                    errMsg: tips
                }
            };
        }
    }
    try {
        if (msgObj.length > 0) {
            const errMsg = msgObj.text();
            // 继续等待
            if (errMsg.indexOf('正在进入') !== -1 || errMsg.indexOf('正在重试') !== -1 || errMsg.indexOf('请稍候') !== -1) {
                return false;
            }
            return {
                errcode: '0000',
                description: 'success',
                data: {
                    errMsg: errMsg
                }
            };
        }
        msgObj = $('.theme-popbod span');
        if (msgObj.length > 0) {
            const errMsg = msgObj.text();
            // 继续等待
            if (errMsg.indexOf('正在进入') !== -1 || errMsg.indexOf('正在重试') !== -1 || errMsg.indexOf('请稍候') !== -1) {
                return false;
            }
            const msgArr = [];
            for (let i = 0; i < msgObj.length; i++) {
                const curItem = msgObj.eq(i);
                const curStyle = curItem.attr('style') || '';
                if (curStyle.indexOf('red') !== -1) {
                    let text = curItem.text() || '';
                    text = text.replace(/^[0-9]、/, '');
                    msgArr.push(text);
                }
            }
            return {
                errcode: '0000',
                description: 'success',
                data: {
                    errMsg: msgArr.join('\n')
                }
            };
        }
    } catch (error) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: '税局请求异常，请稍后再试!'
            }
        };
    }
    return false;
};
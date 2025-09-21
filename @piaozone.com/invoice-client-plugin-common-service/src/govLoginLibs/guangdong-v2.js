/* global window document $ location */
/* eslint-disable func-names */
export function checkIsLoginAndOpen() {
    const localUrl = window.location.href;
    if (localUrl.indexOf('https://dppt.guangdong.chinatax.gov.cn:8443') !== -1 && window.pwyHelpers) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }
    if (localUrl.indexOf('https://dppt.guangdong.chinatax.gov.cn:8443') === -1) {
        return {
            errcode: '0000',
            data: {
                isLogined: false
            }
        };
    }
    return false;
}

export async function tryLoginWait({ checkClickBtn }) {
    if (document.querySelector('.layui-layer-btn a')) {
        document.querySelector('.layui-layer-btn a').click();
    }
    // 已经是登录状态
    if (document.querySelector('#wybs')) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }

    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    if (checkClickBtn) {
        const loginObj = document.querySelector('.dlbox .loginico');
        if (loginObj) {
            return {
                errcode: '0000',
                data: {
                    selector: '.dlbox .loginico'
                }
            };
        }
    }

    return false;
}


export async function waitLoginIcon() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }
    if (document.querySelector('.layui-layer-btn a')) {
        document.querySelector('.layui-layer-btn a').click();
    }
    // 已经是登录状态
    if (document.querySelector('#wybs')) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }
    const loginObj = document.querySelector('.dlbox .loginico');
    if (loginObj) {
        loginObj.click();
        return {
            errcode: '0000',
            data: true
        };
    }
    if (document.body.innerText === '') {
        await window.pwyNightmare.sleep(3000);
    }
    return false;
}

export function waitInputs() {
    if (document.querySelector('#wybs')) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }
    document.querySelector('.scanTxt').click();
    return false;
}

export function drayBtn() {
    return new Promise((resolve) => {
        try {
            const btn = document.querySelector('.el-form-item__content .handler');
            if (!document.querySelector('.el-form-item__content .drag_text') || !btn) {
                resolve({
                    errcode: '3000',
                    description: '对象不存在'
                });
                return;
            }
            const list = [];
            const mousedown = document.createEvent('MouseEvents');
            const rect = btn.getBoundingClientRect();
            const x = rect.x;
            const y = rect.y;
            list.push({ x, y, dx: 0, dy: 0 });

            mousedown.initMouseEvent('mousedown', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
            btn.dispatchEvent(mousedown);

            (function next(startX, startY, dx, dy) {
                const mousemove = document.createEvent('MouseEvents');
                const _x = startX + dx;
                const _y = startY + dy;
                mousemove.initMouseEvent('mousemove', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                btn.dispatchEvent(mousemove);
                list.push({ x: _x, y: _y, dx, dy });
                // btn.dispatchEvent(mousemove);
                const dragTextObj = document.querySelector('.el-form-item__content .drag_text');
                if (dragTextObj.innerText === '验证通过') {
                    const mouseup = document.createEvent('MouseEvents');
                    mouseup.initMouseEvent('mouseup', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                    btn.dispatchEvent(mouseup);
                    resolve({
                        errcode: '0000',
                        description: 'success',
                        data: list
                    });
                } else {
                    const tempDx = Math.ceil(Math.random() * 30) + 20;
                    setTimeout(() => {
                        next(_x, _y, tempDx, dy);
                    }, 100);
                }
            })(x, y, 0, 0);
        } catch (error) {
            resolve({
                errcode: '5000',
                description: error.toString()
            });
        }
    });
}

export function checkInputErr(data = {}) {
    const { taxNo, account, accountPasswd } = data;
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]').value !== taxNo ||
    document.querySelector('input[placeholder="居民身份证号码/手机号码/用户名"]').value !== account ||
    document.querySelector('input[placeholder="个人用户密码"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

export function checkLoginErr(opt = {}) {
    const wybsObj = document.querySelector('#wybs');
    if (wybsObj) {
        return {
            errcode: '0000',
            data: true
        };
    }
    const selectItems = document.querySelectorAll('.el-radio-group .el-radio');
    if (selectItems && selectItems.length > 0) {
        return {
            errcode: '0000',
            data: true
        };
    }

    // 密码被锁定返回提示
    const messageBoxWrapper = document.querySelector('.el-message-box__wrapper');
    if (messageBoxWrapper && messageBoxWrapper.style.display !== 'none') {
        const retrievePasswordPrompt = document.querySelector('.el-message-box .el-message-box__content #retrieve_password');
        if (retrievePasswordPrompt && retrievePasswordPrompt.innerText) {
            if (retrievePasswordPrompt.innerText.indexOf('忘记密码') !== -1) {
                return {
                    errcode: '0000',
                    description: 'success',
                    data: {
                        errMsg: '由于认证错误次数过多，您的账号已被电子税局锁定。请前往税局使用“忘记密码”功能修改后，再返回此页面重新登录'
                    }
                };
            }
        }
    }

    const errObj = document.querySelector('.el-form-item__error');
    if (errObj && errObj.innerText) {
        const errMsg = errObj.innerText.replace(/^请输入/, '');
        const parentNode = errObj.parentNode;
        parentNode.removeChild(errObj);
        return {
            errcode: '0000',
            data: {
                errMsg
            }
        };
    }
    const msgObj1 = document.querySelector('.el-message-box__message');
    if (msgObj1 && msgObj1.innerText) {
        return {
            errcode: '0000',
            data: {
                errMsg: msgObj1.innerText
            }
        };
    }

    // 确认当前角色
    if (document.querySelector('.el-message-box .el-button.el-button--primary')) {
        document.querySelector('.el-message-box .el-button.el-button--primary').click();
    }

    const msgObj = document.querySelector('.el-message__content');
    if (msgObj && msgObj.innerText) {
        const errMsg = msgObj.innerText;
        const parentNode = msgObj.parentNode;
        parentNode.removeChild(msgObj);
        return {
            errcode: '0000',
            data: {
                errMsg
            }
        };
    }
    return false;
}

export function selectRole(opt = {}) {
    const wybsObj = document.querySelector('#wybs');
    if (wybsObj) {
        return {
            errcode: '0000',
            data: true
        };
    }
    // 确认当前角色
    if (document.querySelector('.el-message-box .el-button.el-button--primary')) {
        document.querySelector('.el-message-box .el-button.el-button--primary').click();
    }
    // 用户协议
    const agreementList = document.querySelectorAll('.el-dialog') || [];
    for (let i = 0; i < agreementList.length; i++) {
        const node = agreementList[i];
        const dialogHeader = node && node.querySelector('.el-dialog__header');
        if (dialogHeader && dialogHeader.innerText.indexOf('用户协议') !== -1) {
            const btn = agreementList[i].querySelector('.el-dialog__footer .el-button');
            if (btn) {
                btn.click();
            }
            break;
        }
    }

    let roleText = opt.roleText || '开票员';
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

    if (document.querySelector('[aria-label="身份类型选择"] .el-button--primary:last-child')) {
        document.querySelector('[aria-label="身份类型选择"] .el-button--primary:last-child').click();
    } else if (document.querySelector('.el-dialog__body button.el-button--primary')) {
        document.querySelector('.el-dialog__body button.el-button--primary').click();
    } else {
        return false;
    }

    return {
        errcode: '0000',
        data: { roleIndex }
    };
}


export async function gotoAccountCenter() {
    const sycdMenus = window.sessionStorage.getItem('sycdMenus');
    if (!sycdMenus) {
        return false;
    }

    if (typeof window.xssFilter !== 'function' || !window.$) {
        return false;
    }
    const allMenus = JSON.parse(sycdMenus);
    const wdxxInfo = allMenus.menus.yhGncds.filter((item) => {
        return item.cdid === 'qysycd-r';
    })[0].yhGncds.filter((item) => {
        return item.cdmc === '我的信息';
    })[0].yhGncds.filter((item) => {
        return item.cdmc === '账户中心';
    })[0];
    let url = window.xssFilter(wdxxInfo.realUrl);
    const m1 = window.xssFilter(wdxxInfo.topMenu);
    const m2 = '';
    const qxkzsx = '';
    const cdmc = '账户中心';
    // 往会话中添加自然人信息，给申报功能使用，只需要请求服务，不需要处理--fyl
    // eslint-disable-next-line
    window.$.post(window.contPath + '/portalSer/setZrrxx.do', { 'realurl': url, 'action': 'goIndexUrl' }, (d) => {});
    const tabTitle = window.getURLParameter2(url, 'tabTitle');
    const gnDm = window.getURLParameter2(url, 'gnDm');
    const cdId = window.getURLParameter2(url, 'cdId');
    const index_1 = url.indexOf('?');
    const index_2 = url.lastIndexOf('?');
    if (index_1 !== index_2) {
        url = window.urlReplaceAll(url);
        url = url.substring(0, index_1) + '?' + url.substring(index_1 + 1);
    }
    const cdmcEncode = encodeURIComponent(cdmc);
    const res = await window.fetch(window.contPath + '/portalSer/checkLogin.do', {
        method: 'post',
        dataType: 'json',
        data: {}
    });
    const d = await res.json();
    const isLogin = d.isLogin;
    if (isLogin === 'N') {
        return {
            errcode: '0000',
            data: {
                checkLogin: d,
                isLogout: true
            }
        };
    }

    const baseUrl = location.origin + '/xxmh/html/index_origin.html?gopage=true';
    const sfKhd = window.sfKhd;
    if (sfKhd === 'y') {
        url = `${baseUrl}&m1=${m1}&m2=${m2}&fromWhere=&qxkzsx=${qxkzsx}&tabTitle=${tabTitle}&cdId=${cdId}&gnDm=${gnDm}&sfKhd=y&cdmc=${cdmcEncode}`;
    } else {
        url = `${baseUrl}&m1=${m1}&m2=${m2}&fromWhere=&qxkzsx=${qxkzsx}&tabTitle=${tabTitle}&cdId=${cdId}&gnDm=${gnDm}&cdmc=${cdmcEncode}`;
    }
    return {
        errcode: '0000',
        data: {
            url
        }
    };
}

export function waitLoginInfo() {
    const sureBut = document.querySelector('.el-message-box .el-message-box__btns .el-button');
    if (sureBut && sureBut.innerText === '确定') {
        sureBut.click();
    }
    const tipDialog = document.querySelector('.layui-layer-dialog .layui-layer-btn a:last-child');
    if (tipDialog) {
        tipDialog.click();
        return false;
    }

    const loginInput = document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]');
    if (loginInput && !loginInput.value) {
        return {
            errcode: '0000',
            data: {
                isLogout: true
            }
        };
    }

    const wybsObj = $('#wybs');
    if (wybsObj.length === 0) {
        if (document.querySelector('.dlbox .loginico')) {
            document.querySelector('.dlbox .loginico').click();
            return false;
        }
        return false;
    }

    wybsObj.click();
    let szzhItem;
    let openInvoiceItem;
    const wybsItems = $('.layui-tab-content .layui-tab-item').eq(2).find('.itme-icon');
    if (wybsItems.length === 0) {
        return false;
    }
    for (let i = 0; i < wybsItems.length; i++) {
        const item = wybsItems.eq(i);
        const text = item.text();
        if (text.indexOf('开票业务') !== -1) {
            openInvoiceItem = i;
        } else if (text.indexOf('数字账户') !== -1) {
            szzhItem = i;
        }
    }

    const companyName = document.querySelector('#userName');
    const msgObj = document.querySelector('.el-message.el-message--warning');
    const loginMsg = msgObj && msgObj.innerText ? msgObj.innerText : '';
    if (companyName || loginMsg) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                szzhCompany: szzhItem,
                openInvoiceCompany: openInvoiceItem,
                companyName: companyName.innerText || '',
                errMsg: loginMsg
            }
        };
    }
    return false;
}

export function clearErr() {
    const msgObj = document.querySelectorAll('.el-message.el-message--warning');
    if (msgObj && msgObj.length > 0) {
        for (let i = 0; i < msgObj.length; i++) {
            document.body.removeChild(msgObj[i]);
        }
    }
    return true;
}

export function clickToSzzh(opt = {}) {
    window.open = function(path) {
        window.location.href = path;
    };
    if ($('.layui-tab-content .layui-tab-item')) {
        $('.layui-tab-content .layui-tab-item').eq(2).find('.itme-icon').eq(opt.index).find('a').click();
        return {
            errcode: '0000',
            data: true
        };
    }
    return false;
}


export function waitSzzhTreeNode(opt = {}) {
    window.open = function(path) {
        window.location.href = path;
    };
    const szzhList = document.querySelectorAll('.page_app_list .page_app_item');
    if (szzhList && szzhList.length > 0) {
        return {
            errcode: '0000',
            description: 'success',
            data: {}
        };
    }
    return false;
}

export function waitRedirect() {
    const ck = window.pwyNightmare.getCookie('SSO_SECURITY_CHECK_TOKEN');
    const localUrl = location.href;
    if (ck && localUrl.indexOf('https://dppt.guangdong.chinatax.gov.cn:8443') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                szzhDomain: document.location.host,
                szzhUrl: document.location.href,
                baseUrl: document.location.origin
            }
        };
    }
    return false;
}

export function apiWaitLogin() {
    // 已经是登录状态
    if (document.querySelector('#wybs')) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }

    if (document.querySelector('.loginBtnText')) {
        document.querySelector('.loginBtnText').click();
    }

    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    const obj = document.querySelector('#ssoXxmhUrl');
    if (!obj) {
        return false;
    }
    const loginUrl = obj.value;
    if (loginUrl.indexOf('http') === 0) {
        return {
            errcode: '0000',
            data: {
                loginUrl
            }
        };
    }
    return false;
}
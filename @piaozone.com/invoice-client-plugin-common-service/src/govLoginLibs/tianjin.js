/* global window document */
/* eslint-disable func-names */
export function clearTip() {
    if (document.querySelector('.notice .known')) {
        document.querySelector('.notice .known').click();
        return false;
    }
    return true;
}

export function chooseLoginVersion() {
    if (document.querySelector('.title-login-register .login-font')) {
        document.querySelector('.title-login-register .login-font').click();
        return false;
    }
    return true;
}

export function checkInputErr(data = {}) {
    const { taxNo, account, accountPasswd } = data;
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]').value !== taxNo ||
    document.querySelector('input[placeholder="居民身份证号码/手机号码/用户名"]').value !== account ||
    document.querySelector('input[placeholder="个人用户密码(初始密码为证件号码后六位)"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

export function waitInputs() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }
    // 已经是登录状态
    // 旧
    const wybsItem = document.querySelector('.nav-tabs .tagO a');
    // 新
    const wybsItems = document.querySelectorAll('.t-head-menu__inner .t-menu .menuItem');
    if (wybsItem || (wybsItems && wybsItems.length > 0)) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }
    if (document.querySelector('.notice .known')) {
        document.querySelector('.notice .known').click();
        return false;
    }

    if (document.querySelector('.loginBtn')) {
        document.querySelector('.loginBtn').click();
    }

    if (document.querySelector('.title-login-user')) {
        document.querySelector('.title-login-user').click();
    }

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

export function selectRole(opt = {}) {
    // 旧
    const wybsObj = document.querySelector('.nav-tabs .tagO a');
    // 新
    const wybsItems = document.querySelectorAll('.t-head-menu__inner .t-menu .menuItem');
    // 没有角色选择直接进入后台
    if ((wybsItems && wybsItems.length > 0) || wybsObj) {
        return {
            errcode: '0000',
            description: 'success',
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
    if (!selectItems || selectItems.length < 1) {
        return false;
    }
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
        if (roleList.indexOf('法定代表人') !== -1) {
            roleText = '法定代表人';
        } else if (roleList.indexOf('财务负责人') !== -1) {
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

    let roleDialogIndex = -1;
    const dialogTitles = document.querySelectorAll('.el-dialog .el-dialog__title');
    for (let i = 0; i < dialogTitles.length; i++) {
        const curDialog = dialogTitles[i];
        if (curDialog.innerText.indexOf('身份类型选择') !== -1) {
            roleDialogIndex = i;
        }
    }
    if (roleDialogIndex > -1) {
        const roleDialog = document.querySelectorAll('.el-dialog')[roleDialogIndex];
        const roleSubmitButton = roleDialog.querySelector('.el-dialog .el-dialog__footer .el-button');
        if (roleSubmitButton) {
            roleSubmitButton.click();
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

export function clearErr() {
    const msgObj = document.querySelectorAll('.el-message.el-message--warning');
    if (msgObj && msgObj.length > 0) {
        for (let i = 0; i < msgObj.length; i++) {
            document.body.removeChild(msgObj[i]);
        }
    }
    return true;
}


export function checkLoginErr(opt = {}) {
    // 旧
    const wybsObj = document.querySelector('.nav-tabs .tagO a');
    // 新
    const wybsItems = document.querySelectorAll('.t-head-menu__inner .t-menu .menuItem');
    // 没有角色选择直接进入后台
    if ((wybsItems && wybsItems.length > 0) || wybsObj) {
        return {
            errcode: '0000',
            description: 'success',
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

    // 确认当前角色
    if (document.querySelector('.el-message-box .el-button.el-button--primary')) {
        document.querySelector('.el-message-box .el-button.el-button--primary').click();
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


export function waitLoginRedirect(opt = {}) {
    const wybsItem = document.querySelector('.nav-tabs .tagO a');
    const newWybsItems = document.querySelectorAll('.t-head-menu__inner .t-menu .menuItem'); // https://etax.tianjin.chinatax.gov.cn/loginb/
    const pageContent = document.querySelector('.page-content');
    let openInvoiceItem;
    let szzhItem;
    let companyName;

    // 旧
    // 我要办税是否出现
    if (!wybsItem && !newWybsItems.length) {
        if (document.querySelector('.title-login-user')) {
            document.querySelector('.title-login-user').click();
            return false;
        }
        return false;
    }
    if (wybsItem) {
        wybsItem.click();
        const iframe = document.getElementById('profile').querySelector('iframe');
        if (!iframe) {
            return false;
        }
        const wybsItems = iframe.contentWindow.document.querySelectorAll('.menuContainerLi-span');
        // const wybsItems = document.querySelectorAll('#menu-content .wybs .menu-item');
        if (!wybsItems || wybsItems.length < 2) {
            return false;
        }
        for (let i = 0; i < wybsItems.length; i++) {
            const item = wybsItems[i];
            const text = item.innerText;
            if (text.indexOf('开票业务') !== -1) {
                openInvoiceItem = i;
            } else if (text.indexOf('数字账户') !== -1) {
                szzhItem = i;
            }
        }
        companyName = document.querySelector('.userNameInfo_name')?.innerText || '';
    }
    // 新
    if (newWybsItems.length > 0 && pageContent) {
        if (pageContent.innerText.indexOf('税务数字账户') !== -1) {
            szzhItem = 0;
        }
        if (pageContent.innerText.indexOf('蓝字发票开具') !== -1) {
            openInvoiceItem = 0;
        }
        companyName = document.querySelector('.twoLind')?.innerText || '';
    }

    return {
        errcode: '0000',
        description: 'success',
        data: {
            szzhCompany: szzhItem,
            openInvoiceCompany: openInvoiceItem,
            companyName
        }
    };
}

export function openSzzh() {
    window.open = function(path) {
        window.location.href = path;
    };
    const ck = window.pwyNightmare.getCookie('SSO_SECURITY_CHECK_TOKEN');
    const localUrl = window.location.href;
    if (ck && localUrl.indexOf('https://dppt.tianjin.chinatax.gov.cn:8443') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true,
                szzhDomain: document.location.host,
                szzhUrl: document.location.href,
                baseUrl: document.location.origin
            }
        };
    }
    if (!document.querySelector('.leftPanel-ul .leftPanel-li-div')) {
        return false;
    }
    document.querySelector('.leftPanel-ul .leftPanel-li-div').click();
    return false;
}


export async function tryLoginWait({ checkClickBtn }) {
    // 清除弹窗
    if (document.querySelector('.notice .known')) {
        document.querySelector('.notice .known').click();
        return false;
    }

    // 已经是登录状态
    const wybsItem = document.querySelector('.nav-tabs .tagO a');
    const newWybsItems = document.querySelectorAll('.t-head-menu__inner .t-menu .menuItem');
    if (wybsItem || (newWybsItems.length > 0 && document.querySelector('.page-content'))) {
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
        if (document.querySelector('.title-login-user')) {
            return {
                errcode: '0000',
                data: {
                    selector: '.title-login-user'
                }
            };
        }
    }
    return false;
}

export function apiWaitLogin() {
    // 已经是登录状态
    if (document.querySelector('.nav-tabs .tagO a')) {
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

    if (!window.WSSW || !window.WSSW.kxLoingUrl) {
        return false;
    }

    const loginUrl = window.WSSW.kxLoingUrl;
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
/* global window document location */
/* eslint-disable func-names */
export function stepOneInit() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }
    // 关闭提醒
    if (document.querySelector('.layui-layer-iframe .layui-layer-setwin .layui-layer-close1')) {
        document.querySelector('.layui-layer-iframe .layui-layer-setwin .layui-layer-close1').click();
        return false;
    }

    if (document.querySelector('.tou .liebiao2')) {
        document.querySelector('.tou .liebiao2').click();
    }
    return false;
}

export async function tryLoginWait({ checkClickBtn }) {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }

    // 关闭提醒
    if (document.querySelector('.layui-layer-iframe .layui-layer-setwin .layui-layer-close1')) {
        document.querySelector('.layui-layer-iframe .layui-layer-setwin .layui-layer-close1').click();
    }

    const listTip = document.querySelectorAll('.mini-tools-close');
    for (let i = 0; i < listTip.length; i++) {
        listTip[i].click();
    }

    if (checkClickBtn) {
        const loginObj = document.querySelector('.tou .liebiao2');
        if (loginObj) {
            return {
                errcode: '0000',
                data: {
                    selector: '.tou .liebiao2'
                }
            };
        }
    }

    const wybsItem = document.querySelector('#wybsTab');

    if (wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogined: true
            }
        };
    }

    const bodyText = document.body.innerText || '';
    if (bodyText.indexOf('蓝字发票开具') !== -1 || bodyText.indexOf('税务数字账户') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogined: true
            }
        };
    }
    return false;
}

export function clearErr() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj) {
        document.body.removeChild(msgObj);
    }
    return true;
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

export async function checkStepOneLogin(data = {}) {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    const msgObj2 = document.querySelector('.el-form-item__error');
    if (msgObj && msgObj.innerText) {
        let errMsg = msgObj.innerText;
        if (errMsg.indexOf('，请重新输入') !== -1) {
            errMsg = errMsg.replace(/^输入的/, '').replace('，请重新输入', '!');
        }
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: errMsg
            }
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

    if (msgObj2 && msgObj2.innerText) {
        const parentNode = msgObj2.parentNode;
        parentNode.removeChild(msgObj2);
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: msgObj2.innerText
            }
        };
    }

    const obj = document.querySelector('input[placeholder="请输入手机号码"]');
    if (obj && obj.value) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                phone: obj.value
            }
        };
    }

    // 直接登录成功
    if (document.querySelector('#wybsTab')) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
    }

    const tabs = document.querySelectorAll('.justifyCenterEnd .normalCls');
    for (let i = 0; i < tabs.length; i++) {
        const msgButton = tabs[i];
        if (msgButton.innerText.indexOf('短信验证') > -1) {
            window.pwyNightmare.sleep(300);
            msgButton.click();
            return false;
        }
    }

    if (document.querySelector('#qrcodeDiv')) {
        const tempObjs = document.querySelectorAll('.formContent .bottom span.forget');
        if (tempObjs && tempObjs[1]) {
            tempObjs[1].click();
        }
        return false;
    }

    return false;
}

export function checkIsStepTwo() {
    const obj = document.querySelector('input[placeholder="请输入手机号码"]');
    const sendObj = document.querySelector('.formContent .el-form-item__content button');
    if (sendObj && obj && obj.value) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                phone: obj.value
            }
        };
    }
    return false;
}

export function checkIsStepTwoOrLogin() {
    const obj = document.querySelector('input[placeholder="请输入手机号码"]');
    const sendObj = document.querySelector('.formContent .el-form-item__content button');
    if (sendObj && obj && obj.value) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                phone: obj.value
            }
        };
    }

    const localUrl = window.location.href;
    if (/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(localUrl)) {
        return {
            errcode: '0000',
            data: {
                isLogin: true,
                isFinish: true
            }
        };
    }

    const wybsItem = document.querySelector('#wybsTab');
    if (wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
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

export function checkSendResult() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj && msgObj.innerText) {
        return {
            errcode: '0000',
            data: {
                errMsg: msgObj.innerText
            },
            description: 'success1'
        };
    }
    const btn = document.querySelector('.formContent .el-form-item__content button');
    const num = parseInt(btn?.innerText || '');
    // 进入倒计时提示
    if (!isNaN(num) && num < 120) {
        return {
            errcode: '0000',
            description: 'success',
            data: true
        };
    }
    return false;
}

export function selectRole(opt = {}) {
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

    const wybsItem = document.querySelector('#wybsTab');
    if (wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
    }
    const bodyText = document.body.innerText || '';
    if (bodyText.indexOf('蓝字发票开具') !== -1 || bodyText.indexOf('税务数字账户') !== -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: true
        };
    }
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj && msgObj.innerText) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: msgObj.innerText
            }
        };
    }

    // 可能回到首页，需要重新点击登录按钮
    const listTip = document.querySelectorAll('.mini-tools-close');
    for (let i = 0; i < listTip.length; i++) {
        listTip[i].click();
    }

    if (document.querySelector('.right-menu .login-btn')) {
        document.querySelector('.right-menu .login-btn').click();
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

export function waitLoginRedirect() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj && msgObj.innerText) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: msgObj.innerText
            }
        };
    }

    const wybsItem = document.querySelector('.layui-tab-title .layui-this');
    const bodyText = document.body.innerText || '';
    let openInvoiceItem;
    let szzhItem;
    if (bodyText.indexOf('蓝字发票开具') !== -1) {
        openInvoiceItem = 1;
    }
    if (bodyText.indexOf('税务数字账户') !== -1) {
        szzhItem = 1;
    }
    const newTitle = document.querySelector('.current-user-name');
    if (newTitle && (openInvoiceItem || szzhItem)) {
        const list = newTitle.getAttribute('title').split('，');
        if (list[1]) {
            return {
                errcode: '0000',
                description: 'success',
                data: {
                    szzhCompany: szzhItem,
                    openInvoiceCompany: openInvoiceItem,
                    companyName: list[1],
                    companyType: '03'
                }
            };
        }
    }

    // 我要办税是否出现
    if (!wybsItem) {
        if (document.querySelector('.tou .liebiao2')) {
            document.querySelector('.tou .liebiao2').click();
            return false;
        }
        return false;
    }
    wybsItem.click();

    const wybsItems = document.querySelectorAll('.layui-show .zxgl');
    if (!wybsItems || wybsItems.length < 1) {
        return false;
    }

    const tipBoxObj = document.querySelector('.layui-layer-setwin .layui-layer-close');
    if (tipBoxObj) {
        tipBoxObj.click();
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

    const companyName = document.querySelector('.layui-bg-green .usrtxt') || {};
    if (companyName) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                szzhCompany: szzhItem,
                openInvoiceCompany: openInvoiceItem,
                companyName: companyName.title,
                companyType: '03'
            }
        };
    }
    return false;
}


export function checkErr() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj && msgObj.innerText) {
        return msgObj.innerText;
    }
    return '';
}

export function redirectOpenInvoice() {
    const len = document.querySelectorAll('.invoice-entrance-content .invoice-entrance-choose').length;
    if (len > 0) {
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

export function fn_init_menu() {
    window.open = function(path) {
        location.href = path;
    };
}

export function waitOpenTreeNode(opt = {}) {
    window.open = function(path) {
        location.href = path;
    };
    const localUrl = window.location.href;
    if (/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(localUrl)) {
        return {
            errcode: '0000',
            data: true
        };
    }

    const tipBoxObj = document.querySelector('.layui-layer-setwin .layui-layer-close');
    if (tipBoxObj) {
        tipBoxObj.click();
    }

    const wybsItem = document.querySelector('#wybsTab');
    // 我要办税是否出现
    if (wybsItem) {
        wybsItem.click();
    }

    if (document.querySelectorAll('#menu-content .wybs .menu-item')[opt.index]) {
        const obj = document.querySelectorAll('#menu-content .wybs .menu-item')[opt.index];
        return {
            errcode: '0000',
            data: {
                url: obj.getAttribute('data-url') || obj.href
            }
        };
    }

    return false;
}

export function redirectOpenPage() {
    window.open = function(path) {
        location.href = path;
    };
    const obj = document.querySelector('a[title="蓝字发票开具"]');
    if (obj) {
        obj.click();
        return {
            errcode: '0000',
            description: 'success',
            data: true
        };
    }
    return false;
}

export function waitRedirect() {
    const ck = window.pwyNightmare.getCookie('SSO_SECURITY_CHECK_TOKEN');
    const localUrl = window.location.href;
    if (ck && /https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(localUrl)) {
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
    if (document.querySelector('.layui-tab-title .layui-this')) {
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
    if (typeof window.login === 'function') {
        window.login();
    }
    return false;
}

/* global window document */
/* eslint-disable func-names */
export function stepOneInit() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }

    const listTip = document.querySelectorAll('.modal-content .modal-header .bootstrap-dialog-header .bootstrap-dialog-close-button .close');
    for (let i = 0; i < listTip.length; i++) {
        listTip[i].click();
    }
    // 登录按钮
    if (document.querySelector('.header-login')) {
        document.querySelector('.header-login').click();
        return false;
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
    // 我要办税是否出现
    // 直接登录成功
    const wybs = document.querySelector('.main-title').children;
    if (wybs && wybs[1].innerText === '我要办税') {
        return {
            errcode: '0000',
            description: 'success',
            data: true
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

    // 我要办税是否出现
    const wybs = document.querySelector('.main-title').children;
    if (wybs && wybs[1].innerText === '我要办税') {
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

// 拖动滑块
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
    // 我要办税是否出现
    const wybs = document.querySelector('.main-title') && document.querySelector('.main-title').children;
    if (wybs && wybs[1].innerText === '我要办税') {
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
    const listTip = document.querySelectorAll('.modal-content .modal-header .bootstrap-dialog-header .bootstrap-dialog-close-button .close');
    for (let i = 0; i < listTip.length; i++) {
        listTip[i].click();
    }
    if (document.querySelector('.function .function_top #ksLogin')) {
        document.querySelector('.function .function_top #ksLogin').click();
    }

    // 选择角色
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

// 登录成功，获取当前账户的权限（开票和数字账户权限）
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

    // 关闭弹出提示
    const closeShuiJuModal = document.querySelector('.modal-dialog .modal-content .modal-footer button');
    if (closeShuiJuModal) {
        closeShuiJuModal.click();
    }
    // 关闭温馨提示弹出提示
    const closeInfoModal = document.querySelector('.Eject_box_box .Eject_content_title .a_chose');
    if (closeInfoModal) {
        closeInfoModal.click();
    }

    const closezhixiModal = document.querySelector('.layui-layer .layui-layer-btn a');
    if (closezhixiModal) {
        closezhixiModal.click();
    }

    const wybs = document.querySelector('.main-title').children;
    if (wybs && wybs[1].innerText === '我要办税') {
        wybs[1].click();
        window.pwyNightmare.sleep(1500);
    }

    let openInvoiceItem;
    let szzhItem;
    if (!document.querySelector('#iframeb')) {
        if (window.tpassUrl && window.tpassLoginUrl && window.tpassClientId) {
            const _tpassUrl = window.tpassUrl + window.tpassLoginUrl + window.tpassClientId;
            window.location.href = _tpassUrl;
            return false;
        }
        return false;
    }
    const wybsItems = document.querySelector('#iframeb').contentDocument.querySelector('.border-container div').children;

    for (let i = 0; i < wybsItems.length; i++) {
        const item = wybsItems[i];
        const text = item.innerText;
        if (text.indexOf('开票业务') !== -1) {
            openInvoiceItem = i;
        } else if (text.indexOf('数字账户') !== -1) {
            szzhItem = i;
        }
    }

    // 点击按钮才会出公司名称
    const headerUser = document.querySelector('.header-user span');
    if (headerUser) {
        headerUser.click();
    }

    const companyName = document.querySelector('.gswjdiv p').innerText;
    // 获取公司名称
    if (companyName) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                szzhCompany: szzhItem,
                openInvoiceCompany: openInvoiceItem,
                companyName: companyName,
                companyType: '03'
            }
        };
    }
    return false;
}

export async function tryLoginWait({ checkClickBtn }) {
    // 清除弹窗
    const listTip = document.querySelectorAll('.modal-content .modal-header .bootstrap-dialog-header .bootstrap-dialog-close-button .close');
    for (let i = 0; i < listTip.length; i++) {
        listTip[i].click();
    }

    if (document.querySelector('#iframeb')) {
        // 已经是登录状态
        const wybsItems = document.querySelector('#iframeb').contentDocument.querySelector('.border-container div').children;
        if (wybsItems && wybsItems.length > 0) {
            return {
                errcode: '0000',
                data: {
                    isLogined: true
                }
            };
        }
    }

    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    if (checkClickBtn) {
        if (document.querySelector('.header-login')) {
            return {
                errcode: '0000',
                data: {
                    selector: '.header-login'
                }
            };
        }
    }
    return false;
}

export function apiWaitLogin() {
    const obj1 = document.querySelector('#iframeb');
    if (obj1) {
        const wybsItems = document.querySelector('#iframeb').contentDocument.querySelector('.border-container div').children;
        // 已经是登录状态
        if (wybsItems && wybsItems.length > 0) {
            return {
                errcode: '0000',
                data: {
                    isLogined: true
                }
            };
        }
    }

    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }
    if (typeof window.tpassLogin === 'function') {
        window.tpassLogin();
    }
    return false;
}
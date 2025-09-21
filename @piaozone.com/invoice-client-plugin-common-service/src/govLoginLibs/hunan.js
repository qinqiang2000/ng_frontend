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
    // 关闭温馨提示窗口
    const closeBtn = document.querySelector('.layui-admin .layui-icon');
    if (closeBtn) {
        closeBtn.click();
    }

    // 新版登录
    const loginBtn = document.querySelector('.top-login');
    if (loginBtn) {
        loginBtn.click();
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
    const wybsItem = document.querySelector('#doTax');
    if (wybsItem) {
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
    const wybsItem = document.querySelector('#doTax');
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

// 第一步登录滑动滑块
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
    // 我要办税
    const wybsItem = document.querySelector('#doTax');
    if (wybsItem) {
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
    // 错误提示
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

    /*
    // 新办税员选择
    const businessRow = document.querySelectorAll('.business-row');
    if (businessRow && businessRow.length > 0) {
        if (businessRow[0].querySelector('.business-col-radio')) {
            businessRow[0].querySelector('.business-col-radio').click();
        }
        const confirmButton = document.querySelector('#confirm-button');
        if (confirmButton) {
            confirmButton.click();
        }
    }
    */

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

    const businessRow = document.querySelectorAll('.business-row');
    if (businessRow && businessRow.length > 0) {
        if (businessRow[0].querySelector('.business-col-radio')) {
            businessRow[0].querySelector('.business-col-radio').click();
        }
        const confirmButton = document.querySelector('#confirm-button');
        if (confirmButton) {
            confirmButton.click();
            return false;
        }
    }

    // 新版根据菜单判断是否有权限
    const newWybsItems = document.querySelectorAll('.t-tabs__content .main a');

    // 根据菜单判断是否有权限
    const wybsItems = document.querySelectorAll('#banshuiUl .parentsLi');
    if (!wybsItems.length && !newWybsItems.length) {
        return false;
    }

    let openInvoiceItem;
    let szzhItem;
    if (wybsItems.length) {
        for (let i = 0; i < wybsItems.length; i++) {
            const item = wybsItems[i];
            const text = item.innerText;
            if (text.indexOf('开票业务') !== -1) {
                openInvoiceItem = i;
            } else if (text.indexOf('数字账户') !== -1) {
                szzhItem = i;
            }
        }
    } else if (newWybsItems.length) {
        for (let i = 0; i < newWybsItems.length; i++) {
            const item = newWybsItems[i];
            const text = item.innerText;
            if (text.indexOf('蓝字发票开具') !== -1) {
                openInvoiceItem = i;
            } else if (text.indexOf('数字账户') !== -1) {
                szzhItem = i;
            }
        }
    }

    // document.querySelector('.top-login-users ul').children[0].querySelector('a').title.split('+')[0].replace(' ', '');
    // '湘潭金基房地产开发有限公司 '
    const companyName = document.querySelector('.top-login-users ul')?.children[0]?.querySelector('a')?.title.split('+')[0]?.replace(' ', '') ||
        document.querySelector('.leftTopItem .twoLind').innerHTML || '';
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

    const wybsItem = document.querySelector('#doTax');
    if (wybsItem) {
        // 已经是登录状态
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
        if (document.querySelector('.header-tools a')) {
            return {
                errcode: '0000',
                data: {
                    selector: '.header-tools a'
                }
            };
        }
    }
    return false;
}

export function apiWaitLogin() {
    // 已经是登录状态
    if (document.querySelector('#banshuiUl')) {
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

    if (typeof window.toLogin !== 'function') {
        return false;
    }

    window.toLogin();
    return false;
}
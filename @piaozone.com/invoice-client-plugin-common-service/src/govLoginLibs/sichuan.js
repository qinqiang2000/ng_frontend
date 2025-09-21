
/* global window document */
/* eslint-disable func-names */
// 页面初始化
export async function stepOneInit() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }
    // 间隔2s执行
    await window.pwyNightmare.sleep(2000);

    const quickItem = document.querySelector('.fpxx-list ul li a');
    const menuItem = document.querySelector('.t-head-menu__inner .t-menu .menuItem');
    const wybsItem = document.querySelector('#rightTab .tabList');
    if (quickItem || menuItem || wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
    }

    if (window.helper && typeof window.helper.closeMiniwindow === 'function') {
        window.helper.closeMiniwindow('commonTipsWin');
    }

    if (document.querySelector('.main .login-btn .menu-login')) {
        document.querySelector('.main .login-btn .menu-login').click();
    }
    return false;
}

// 清除弹窗
export function clearErr() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj) {
        document.body.removeChild(msgObj);
    }
    return true;
}

// 获取第一步登录结果
export function checkStepOneLogin() {
    // 手机号
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

    // 错误提示
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
    return false;
}

// 确认是否在第二步，是否已登录。是否已进入电子税局
export function checkIsStepTwo() {
    // 清理弹框
    if (window.helper && typeof window.helper.closeMiniwindow === 'function') {
        window.helper.closeMiniwindow('dzqmxy');
        window.helper.closeMiniwindow('dzzp-mask');
        window.helper.closeMiniwindow('ftls');
    }
    const quickItem = document.querySelector('.fpxx-list ul li a');
    const menuItem = document.querySelector('#rightTab .tabList');
    const wybsItem = document.querySelector('.t-head-menu__inner .t-menu .menuItem');
    if (quickItem || menuItem || wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
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

// 第二步登录获取短信发送结果
export function checkSendResult() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj && msgObj.innerText) {
        return {
            errcode: '0000',
            data: {
                errMsg: msgObj.innerText
            },
            description: 'success'
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

// 第一步检查输入是否正确
export function checkInputErr(data = {}) {
    const { taxNo, account, accountPasswd } = data;
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]').value !== taxNo ||
    document.querySelector('input[placeholder="居民身份证号码/手机号码/用户名"]').value !== account ||
    document.querySelector('input[placeholder="个人用户密码(初始密码为证件号码后六位)"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

// 第二步登录选择角色
export function selectRole(opt = {}) {
    let roleText = opt.roleText || '开票员';
    let roleIndex = -1;
    const roleList = [];

    const quickItem = document.querySelector('.fpxx-list ul li a');
    const menuItem = document.querySelector('#rightTab .tabList');
    const wybsItem = document.querySelector('.t-head-menu__inner .t-menu .menuItem');
    if (quickItem || menuItem || wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
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

// 获取第二步登录结果
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

    // 清理弹框
    if (window.helper && typeof window.helper.closeMiniwindow === 'function') {
        window.helper.closeMiniwindow('dzqmxy');
        window.helper.closeMiniwindow('dzzp-mask');
        window.helper.closeMiniwindow('ftls');
    }

    const quickItem = document.querySelector('.fpxx-list ul li a');
    const menuItem = document.querySelector('.t-head-menu__inner .t-menu .menuItem');
    const wybsItem = document.querySelector('#rightTab .tabList');
    if (!quickItem && !menuItem && !wybsItem) {
        if (document.querySelector('.main .login-btn .menu-login')) {
            document.querySelector('.main .login-btn .menu-login').click();
            return false;
        }
        return false;
    }

    let openInvoiceItem;
    let szzhItem;

    if (quickItem) {
        const quickList = document.querySelectorAll('.fpxx-list ul li a');
        if (!quickList.length) {
            return false;
        }
        for (let i = 0; i < quickList.length; i++) {
            const text = quickList[i].innerText;
            if (text.indexOf('蓝字发票开具') !== -1) {
                openInvoiceItem = i;
            } else if (text.indexOf('税务数字账户') !== -1) {
                szzhItem = i;
            }
        }
    } else if (menuItem) {
        const pageContent = document.querySelector('.page-content');
        if (!pageContent) {
            return false;
        }
        if (pageContent.innerText.indexOf('蓝字发票开具') !== -1) {
            openInvoiceItem = 0;
        }
        if (pageContent.innerText.indexOf('税务数字账户') !== -1) {
            szzhItem = 0;
        }
    } else {
        document.querySelectorAll('#rightTab .tabList')[2].click();

        let wybsItems = document.querySelectorAll('#menu-content .menu-tab');
        if (!wybsItems || wybsItems.length < 2) {
            return false;
        }
        wybsItems = document.querySelectorAll('#menu-content .menu-tab')[2].querySelectorAll('.menu-item');
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
    }

    const companyName = document.querySelector('#current-user-name') || document.querySelector('.twoLind');
    return {
        errcode: '0000',
        description: 'success',
        data: {
            szzhCompany: szzhItem,
            openInvoiceCompany: openInvoiceItem,
            companyName: companyName?.innerText?.trim() || ''
        }
    };
}

// 尝试登录
export async function tryLoginWait({ checkClickBtn }) {
    // 已经是登录状态
    const quickItem = document.querySelector('.fpxx-list ul li a');
    const menuItem = document.querySelector('.t-head-menu__inner .t-menu .menuItem');
    const wybsItem = document.querySelector('#rightTab .tabList');
    if (quickItem || menuItem || wybsItem) {
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
        const loginObj = document.querySelector('.main .login-btn .menu-login');
        if (loginObj) {
            return {
                errcode: '0000',
                data: {
                    selector: '.main .login-btn .menu-login'
                }
            };
        }
    }

    return false;
}

export function apiWaitLogin() {
    // 已经是登录状态
    if (document.querySelector('#rightTab .tabList')) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }
    // const bodyText = document.body.innerText || '';
    // if (bodyText.indexOf('蓝字发票开具') !== -1 || bodyText.indexOf('税务数字账户') !== -1) {
    //     return {
    //         errcode: '0000',
    //         description: 'success',
    //         data: {
    //             isLogined: true
    //         }
    //     };
    // }

    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    if (typeof window.goLogin === 'function') {
        window.goLogin();
    }
    return false;
}
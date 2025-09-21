/* global window document */
/* eslint-disable func-names, complexity */
export function stepOneInit() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }
    if (document.querySelector('.layui-layer-close1')) {
        document.querySelector('.layui-layer-close1').click();
        return false;
    }
    if (document.querySelector('#id_mh_login_span')) {
        document.querySelector('#id_mh_login_span').click();
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

export function checkStepOneLogin(data = {}) {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    const msgObj2 = document.querySelector('.el-form-item__error');
    // 短信登录按钮
    const obj = document.querySelector('.formContent .tabsCls .justifyCenterEnd > div:nth-child(3) > span');
    if (obj) {
        return {
            errcode: '0000',
            description: 'success',
            data: true
        };
    }

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

    // const tabs = document.querySelectorAll('.justifyCenterEnd .normalCls');
    // for (let i = 0; i < tabs.length; i++) {
    //     const msgButton = tabs[i];
    //     if (msgButton.innerText.indexOf('短信验证') > -1) {
    //         window.pwyNightmare.sleep(300);
    //         msgButton.click();
    //         return false;
    //     }
    // }

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

// 第一步获取手机号
export function getPhoneNumber() {
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
}

export function checkIsStepTwo() {
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

    let wybsItem;
    const tabUl = document.querySelectorAll('#top_tab_ul li');
    for (let i = 0; i < tabUl.length; i++) {
        const text = tabUl[i].innerText || '';
        if (~text.indexOf('我要办税')) {
            wybsItem = i;
        }
    }

    if (typeof wybsItem !== 'undefined') {
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

export function checkInputErr(data = {}) {
    const { taxNo, account, accountPasswd } = data;
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]').value !== taxNo ||
    document.querySelector('input[placeholder="居民身份证号码/手机号码/用户名"]').value !== account ||
    document.querySelector('input[placeholder="个人用户密码"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

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


export function waitLoginRedirect() {
    window.open = function(path) {
        document.location.href = path;
    };

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

    const wykpBtn = document.querySelector('.u_wykp');
    if (wykpBtn) {
        wykpBtn.click();
    }
    const iframe = document.querySelector('#main_iframe');
    if (!iframe) {
        if (document.querySelector('#id_mh_login_span')) {
            document.querySelector('#id_mh_login_span').click();
            return false;
        }
        return false;
    }
    let wybsItem;
    // 左侧业务栏
    const tabUl = iframe.contentWindow.document.querySelector('.wxn_list').children;
    for (let i = 0; i < tabUl.length; i++) {
        const text = tabUl[i].innerText || '';
        if (~text.indexOf('开票业务') || ~text.indexOf('数字账户')) {
            // 给个默认值1，仅作判断
            wybsItem = 1;
        }
    }
    if (typeof wybsItem === 'undefined') {
        return false;
    }

    // 根据菜单判断是否有权限
    let openInvoiceItem;
    let szzhItem;
    // for (let i = 0; i < contDivs.length; i++) {
    //     const text = contDivs[i].innerText || '';
    //     if (~text.indexOf('开票业务')) {
    //         openInvoiceItem = i;
    //     } else if (~text.indexOf('数字账户')) {
    //         szzhItem = i;
    //     }
    // }
    const kpyw = iframe.contentWindow.document.querySelector('li[id="79592"]')?.innerText || '';
    const swszzh = iframe.contentWindow.document.querySelector('li[id="79597"]')?.innerText || '';
    if (~kpyw.indexOf('开票业务')) {
        openInvoiceItem = 1;
    }
    if (~swszzh.indexOf('数字账户')) {
        szzhItem = 2;
    }

    // 公司名称
    let companyName = document.querySelector('#kf-main-header-nsrmc')?.innerText || '';
    if (companyName) {
        companyName = companyName.replace('【 ', '');
    }
    return {
        errcode: '0000',
        description: 'success',
        data: {
            companyName,
            wybsItem,
            openInvoiceCompany: openInvoiceItem,
            szzhCompany: szzhItem
        }
    };
}

export function selectRole(opt = {}) {
    // 兼容没有选角色的用户
    const wykpBtn = document.querySelector('.u_wykp');
    if (wykpBtn) {
        wykpBtn.click();
        return {
            errcode: '0000',
            data: true
        };
    }
    let wybsItem;
    const tabUl = document.querySelectorAll('#top_tab_ul li');
    for (let i = 0; i < tabUl.length; i++) {
        const text = tabUl[i].innerText || '';
        if (~text.indexOf('我要办税')) {
            wybsItem = i;
        }
    }

    if (tabUl.length && ~wybsItem) {
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

export async function tryLoginWait({ checkClickBtn }) {
    // 清除弹窗
    if (document.querySelector('.layui-layer-close1')) {
        document.querySelector('.layui-layer-close1').click();
        return false;
    }
    const iframe = document.querySelector('#main_iframe');
    // 左侧业务栏
    let wybsItem;
    if (iframe) {
        wybsItem = iframe?.document.querySelector('.wxn_list').children;
    }
    // 已经是登录状态
    // const wybsItem = document.querySelector('#top_tab_ul');
    if (wybsItem) {
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
        if (document.querySelector('#id_mh_login_span')) {
            return {
                errcode: '0000',
                data: {
                    selector: '#id_mh_login_span'
                }
            };
        }
    }
    return false;
}

export async function apiWaitLogin() {
    const iframe = document.querySelector('#main_iframe');
    // 左侧业务栏
    let wybsItem;
    if (iframe) {
        wybsItem = iframe?.document.querySelector('.wxn_list').children;
    }

    // 已经是登录状态
    if (wybsItem) {
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
    const obj = document.querySelector('#id_mh_login_img');
    if (!obj) {
        return false;
    }

    obj.click();
    await window.pwyNightmare.sleep(300);
    return false;
}
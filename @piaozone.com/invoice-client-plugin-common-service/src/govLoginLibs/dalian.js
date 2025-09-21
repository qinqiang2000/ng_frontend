/* global window document */
/* eslint-disable func-names */
// 页面加载
export function chooseLoginVersion() {
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]')) {
        return {
            errcode: '0000',
            data: true
        };
    }

    const wybsItem = document.querySelector('#home-tab a[title="我要办税"]');
    if (wybsItem) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
    }

    // 已经是登录状态, 需要退出登录
    if (document.querySelector('#loginOut')) {
        document.querySelector('#loginOut').click();
        return false;
    }

    // 清除弹窗
    if (document.querySelector('.layui-layer-page .layui-layer-close')) {
        document.querySelector('.layui-layer-page .layui-layer-close').click();
        return false;
    }

    const button = document.querySelector('#login');
    if (button && button.innerText.indexOf('登录') > -1) {
        button.click();
    }
    return false;
}

// 清除第一步登录提示
export function clearErr() {
    const msgObj = document.querySelector('.el-message.el-message--warning');
    if (msgObj) {
        document.body.removeChild(msgObj);
    }
    return true;
}

// 隐藏验证码
export function hideDragYzm() {
    const dom = document.querySelector('#slideVerify')?.parentNode?.parentNode?.parentNode;
    if (dom) {
        dom.click();
    }
    return true;
}

// 获取验证码
export async function queryYzm() {
    return new Promise((resolve) => {
        const yzmID = document.querySelector('#slideVerify');
        const yzmLoading = yzmID.querySelector('.el-loading-mask');
        if (!yzmID || !yzmLoading || yzmLoading.style.display !== 'none') {
            resolve(false);
            return;
        }
        const imageEle = yzmID.querySelector('.slider-verify-loading ~ img');
        const imagebackEle = yzmID.getElementsByClassName('el-loading-mask')[0].previousSibling;
        const getBase64Image = window.pwyNightmare.getBase64Image;
        resolve({
            errcode: '0000',
            description: 'success',
            data: {
                image: getBase64Image(imageEle),
                imageback: getBase64Image(imagebackEle)
            }
        });
    });
}

// 第一步检查输入是否正确
export function checkInputErr(data = {}) {
    const { taxNo, account, accountPasswd } = data;
    if (document.querySelector('input[placeholder="统一社会信用代码/纳税人识别号"]').value !== taxNo ||
    document.querySelector('input[placeholder="居民身份证号码/手机号码/用户名"]').value !== account ||
    document.querySelector('input[placeholder="个人用户密码"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

// 获取第一步登录结果
export function checkStepOneLogin() {
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

    const slideBtn = document.querySelector('.slide-verify-slider .slide-verify-slider-mask-item');
    if (slideBtn) {
        if (slideBtn.style.left !== '1px') {
            // 验证码验证中
            return false;
        }
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: 'slideVerify'
            }
        };
    }

    if (document.querySelector('#qrcodeDiv')) {
        document.querySelectorAll('.formContent .bottom span.forget')[1].click();
        return false;
    }

    const resPhone = document.querySelector('.formContent .tabsCls .justifyCenterEnd > div:nth-child(3) > span');
    if (resPhone) {
        return {
            errcode: '0000',
            description: 'success',
            data: true
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

// 确认是否在第二步，是否已登录。是否已进入电子税局
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

    const wybsItem = document.querySelector('.header-tab .wybsT');
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
export function drayBtn(param) {
    return new Promise((resolve) => {
        try {
            const btn = document.querySelector('.slide-verify-slider .slide-verify-slider-mask-item');
            if (!document.querySelector('.slide-verify-slider .slide-verify-slider-text') || !btn) {
                resolve({
                    errcode: '3000',
                    description: '对象不存在'
                });
                return;
            }
            const mousedown = document.createEvent('MouseEvents');
            const rect = btn.getBoundingClientRect();
            const x = rect.x;
            const y = rect.y;

            // 微调
            const targetX = Math.ceil(param.x + x);

            mousedown.initMouseEvent('mousedown', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
            btn.dispatchEvent(mousedown);

            (function next(startX, startY, dx, dy) {
                const mousemove = document.createEvent('MouseEvents');
                const _x = startX + dx;
                const _y = startY + dy;
                mousemove.initMouseEvent('mousemove', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                btn.dispatchEvent(mousemove);
                if (_x >= targetX) {
                    const mouseup = document.createEvent('MouseEvents');
                    mouseup.initMouseEvent('mouseup', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                    btn.dispatchEvent(mouseup);
                    resolve({
                        errcode: '0000',
                        description: 'success'
                    });
                } else {
                    let tempDx = Math.ceil(Math.random() * 30) + 20;
                    const diff = targetX - _x;
                    if (tempDx >= diff) {
                        tempDx = diff;
                    }
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

// 选择角色
export function selectRole(opt = {}) {
    // 版本更新提示
    if (document.querySelector('#bf-as-guide-core') && document.querySelector('#neverGuide')) {
        document.querySelector('#neverGuide').click();
    }
    // 我要办税
    const wybsItem = document.querySelectorAll('#home-tab a[title="我要办税"]');
    if (wybsItem && wybsItem.length > 0) {
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

// 获取第二步登录结果
export function waitLoginRedirect(opt = {}) {
    if (document.querySelector('#bf-as-guide-core') && document.querySelector('#neverGuide')) { // 版本更新提示
        document.querySelector('#neverGuide').click();
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

    // const wybsItem = document.querySelectorAll('#home-tab a');
    const wybsItem = document.querySelectorAll('#home-tab a[title="我要办税"]');

    // 我要办税是否出现
    if (!wybsItem || wybsItem.length < 1) {
        const loginObj = document.querySelector('#login');
        if (loginObj) {
            loginObj.click();
            return false;
        }
        return false;
    }

    wybsItem[0].click();
    const itemContanir = document.querySelectorAll('#home-tab-tab .home-tab-item');
    let wybsItems = [];
    if (itemContanir.length > 2) {
        wybsItems = itemContanir[2].querySelectorAll('.tab-pic a');
    }
    if (!wybsItems || wybsItems.length === 0) {
        return false;
    }

    let openInvoiceItem;
    let szzhItem;

    for (let i = 0; i < wybsItems.length; i++) {
        const item = wybsItems[i];
        const text = item.innerText;
        if (text.indexOf('开票业务') !== -1) {
            openInvoiceItem = i;
        } else if (text.indexOf('数字账户') !== -1) {
            szzhItem = i;
        }
    }

    const companyName = document.querySelector('.user-info .username');

    if (companyName) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                szzhCompany: szzhItem,
                openInvoiceCompany: openInvoiceItem,
                companyName: companyName.getAttribute('title'),
                companyType: '03'
            }
        };
    }
    return false;
}


export async function tryLoginWait({ checkClickBtn }) {
    // 清除弹窗
    if (document.querySelector('.layui-layer-page .layui-layer-close')) {
        document.querySelector('.layui-layer-page .layui-layer-close').click();
        return false;
    }

    // 已经是登录状态
    const wybsItem = document.querySelector('#home-tab a[title="我要办税"]');
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
        const button = document.querySelector('#login');
        if (button) {
            return {
                errcode: '0000',
                data: {
                    selector: '#login'
                }
            };
        }
    }
    return false;
}

export function apiWaitLogin() {
    // 已经是登录状态
    if (document.querySelector('#home-tab a[title="我要办税"]')) {
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

    if (!window.kxLoginUrl || window.kxLoginUrl.indexOf('http') === -1) {
        return false;
    }

    return {
        errcode: '0000',
        data: {
            loginUrl: window.kxLoginUrl
        }
    };
}
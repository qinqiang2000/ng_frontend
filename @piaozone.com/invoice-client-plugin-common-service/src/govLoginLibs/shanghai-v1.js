/* global $ window document */
// 页面初始化
export function loginInitWait() {
    if (typeof $ === 'undefined') {
        return false;
    }
    if ($('.login-btn').length === 0) {
        return false;
    }

    if ($('.mini-tools-close').length > 0) {
        $('.mini-tools-close').click();
    }

    const bodyText = document.body.innerText || '';
    if (~bodyText.indexOf('数电票开具及发票勾选业务')) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
    }

    if (document.querySelector('input[placeholder="纳税人识别号/统一社会信用代码"]')) {
        return {
            errcode: '0000',
            data: true,
            description: 'success'
        };
    }
    return false;
}

// 第一步检查输入是否正确
export function checkInputErr(data = {}) {
    const { taxNo, accountPasswd } = data;
    if (document.querySelector('input[placeholder="纳税人识别号/统一社会信用代码"]').value !== taxNo ||
    document.querySelector('input[placeholder="初始密码：法定代表人身份证件号码"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

// 第一步获取验证码
export async function queryYzm(innerOpt = {}) {
    return new Promise((resolve) => {
        $('.yzmpic').removeClass('hide').addClass('show');
        const yzmID = $('#yzmID');
        const yzmObj = $('#clickTipCaptcha');
        if (yzmID.length === 0 || yzmObj.length === 0 || yzmObj.attr('src').length < 10) {
            resolve(false);
            return;
        }
        const getBase64Image = window.pwyNightmare.getBase64Image;
        yzmID.click();
        let url = getBase64Image(document.getElementById('clickTipCaptcha'));
        if (!innerOpt.refresh) {
            resolve({
                errcode: '0000',
                description: 'success',
                data: {
                    remark: $('#yzmID').text(),
                    yzmWidth: $('#clickTipCaptcha').width(),
                    yzmHeight: $('#clickTipCaptcha').height(),
                    yzmBase64: url
                }
            });
            return;
        }
        const curImg = document.getElementById('clickTipCaptcha');
        curImg.onload = function onload() {
            url = getBase64Image(curImg);
            resolve({
                errcode: '0000',
                description: 'success',
                data: {
                    remark: $('#yzmID').text(),
                    yzmWidth: $('#clickTipCaptcha').width(),
                    yzmHeight: $('#clickTipCaptcha').height(),
                    yzmBase64: url
                }
            });
        };
        $('.yzmpic .pic-ico').click();
    });
}

// 第一步点击验证码
export async function clickSelectYzm(myOpt = {}) {
    function clickYzm(clickArr) {
        return new Promise((resolve1) => {
            const btn = document.querySelector('#clickTipCaptcha');
            const rect = btn.getBoundingClientRect();
            const startX = rect.x;
            const startY = rect.y;
            (function next(index) {
                if (index >= clickArr.length) {
                    resolve1({
                        errcode: '0000',
                        description: 'success'
                    });
                    return;
                }
                const delay = 100 + Math.ceil(Math.random() * 100);
                setTimeout(() => {
                    const _x = startX + parseInt(clickArr[index].x);
                    const _y = startY + parseInt(clickArr[index].y);
                    const event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, true, window, 0, 0, 0, _x, _y, false, false, false, false, 0, null);
                    document.querySelector('#clickTipCaptcha').dispatchEvent(event);
                    next(index + 1);
                }, delay);
            })(0);
        });
    }
    $('.yzmpic').removeClass('hide').addClass('show');
    await clickYzm(myOpt.clickArr);
    const oldSrc = $('#clickTipCaptcha').attr('src');
    await window.pwyNightmare.sleep(1000);
    if (oldSrc !== $('#clickTipCaptcha').attr('src')) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                status: 'yzmErr'
            }
        };
    }
    return {
        errcode: '0000',
        description: 'success'
    };
}

// 第二步选择账号
export function selectUserName(opt = {}) {
    if (typeof $ === 'undefined') {
        return false;
    }

    // 登录方式未出现
    const loginTypes = $('.ant-modal-body .ant-radio-group label');
    if (loginTypes.length < 2) {
        return false;
    }

    // 切换验证方式时的提示
    if ($('.ant-confirm .ant-btn-primary').length > 0) {
        $('.ant-confirm .ant-btn-primary').click();
    }

    const objList = $('.ant-select-dropdown ul li');
    if (objList.length === 0) {
        return false;
    }

    // 打开下拉框
    $('.ant-select-selection').click();
    let index = -1;
    for (let i = 0; i < objList.length; i++) {
        const curItem = objList.eq(i);
        const name = curItem.text();
        if (name === opt.name) {
            index = i;
        }
    }
    if (index === -1) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg: '实名用户名错误，请检查'
            }
        };
    }
    $('.ant-select-dropdown ul li').eq(index).click();
    return {
        errcode: '0000',
        description: 'success'
    };
}

// 第二步获取手机号
export function getPhoneNo() {
    const errObj = $('.ant-modal-content .ant-confirm-content');
    if (errObj.length > 0) {
        const errMsg = errObj.text().replace(/（.*）/, '');
        $('.ant-confirm .ant-btn-primary').click();
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg
            }
        };
    }

    const obj = $('#sjhm');
    if (obj.length === 0) {
        return false;
    }
    return {
        errcode: '0000',
        description: 'success',
        data: obj.val()
    };
}

// 第一步登录成功获取账号列表
export async function getUserList() {
    // 间隔2s执行
    await window.pwyNightmare.sleep(1000);

    if (typeof $ === 'undefined') {
        return false;
    }
    const errObj = $('.ant-modal-content .ant-confirm-content');
    if (errObj.length > 0) {
        const errMsg = errObj.text();
        $('.ant-confirm .ant-btn-primary').click();
        return {
            errcode: '0000',
            description: 'success',
            data: {
                errMsg
            }
        };
    }
    $('.ant-select-selection').click();
    const objList = $('.ant-select-dropdown ul li');
    if (objList.length === 0) {
        return false;
    }
    const list = [];
    for (let i = 0; i < objList.length; i++) {
        const curItem = objList.eq(i);
        const name = curItem.find('span').eq(0).text();
        list.push({
            name: name,
            value: curItem.text()
        });
    }
    $('.ant-select-selection').click();
    // 避免数据未加载
    const isEmpty = list.find((item) => item.name === '');
    if (isEmpty) {
        return false;
    }
    return {
        errcode: '0000',
        description: 'success',
        data: list
    };
}

// 检查是否已经进入第二次登录
export function checkIsStepTwo() {
    if (typeof $ === 'undefined') {
        return false;
    }

    const objList = $('.ant-select-dropdown ul li');
    if (objList.length > 0) {
        return {
            errcode: '0000',
            description: 'success'
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

// 第二步获取短信发送结果
export function waitSendShortMsg() {
    const errObj = $('.ant-confirm-content');
    if (errObj && errObj.text() !== '') {
        $('.ant-confirm .ant-btn-primary').click();
        return {
            errcode: '0000',
            description: 'success',
            data: {
                status: 'fail',
                errMsg: errObj.text()
            }
        };
    }
    const btnText = $('.ant-modal-body .user-login .getcode').text();
    if (btnText !== '发送短信') {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                status: 'success',
                btnText: btnText,
                errMsg: $('.ant-confirm-content').text()
            }
        };
    }
    return false;
}
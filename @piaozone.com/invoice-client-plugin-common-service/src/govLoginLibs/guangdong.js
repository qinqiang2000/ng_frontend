
/* eslint-disable */

export function initWait() {
    if (typeof $ === 'undefined') {
        return false;
    }

    if (document.querySelector('#wybs')) {
        return {
            errcode: '0000',
            data: {
                isLogined: true
            }
        };
    }

    if (document.querySelector('.layui-layer-btn a')) {
        document.querySelector('.layui-layer-btn a').click();
    }

    if (document.querySelector('#kxText')) {
        document.querySelector('#kxText').click();
    }

    if ($('#notice h1').length > 0 && $('#notice h1').text().indexOf('维护公告') !== -1) {
        return {
            errcode: '0000',
            data: {
                errMsg: '税局维护升级中，请稍后再试！'
            }
        }
    }
    if ($('#mmdl_QieHuan').length === 0) {
        return false;
    }
    return {
        errcode: '0000',
        data: {}
    };
}

export function checkInputErr(data = {}) {
    const { taxNo, account, accountPasswd } = data;
    if (document.querySelector('input[placeholder="社会信用代码/识别号"]').value !== taxNo ||
    document.querySelector('input[placeholder="用户名/实名手机号码"]').value !== account ||
    document.querySelector('input[placeholder="用户密码"]').value !== accountPasswd) {
        return true;
    }
    return false;
}

export function oldDrayBtn() {
    return new Promise((resolve) => {
        try {
            var btn = document.querySelector('.nc_scale span');
            if (!document.querySelector('#nc_1__scale_text') || !btn) {
                resolve({
                    errcode: '3000',
                    description: '对象不存在'
                });
                return;
            }
            const list = [];
            var mousedown = document.createEvent('MouseEvents');
            var rect = btn.getBoundingClientRect();
            var x = rect.x;
            var y = rect.y;
            list.push({ x, y, dx: 0, dy: 0 });

            mousedown.initMouseEvent('mousedown', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
            btn.dispatchEvent(mousedown);

            (function next(startX, startY, dx, dy){
                var mousemove = document.createEvent('MouseEvents');
                var _x = startX + dx;
                var _y = startY + dy;
                mousemove.initMouseEvent('mousemove', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                btn.dispatchEvent(mousemove);
                list.push({ x: _x, y: _y, dx, dy });
                // btn.dispatchEvent(mousemove);
                const dragTextObj = document.querySelector('#nc_1__scale_text');
                if(dragTextObj.innerText === '验证通过') {
                    var mouseup = document.createEvent('MouseEvents');
                    mouseup.initMouseEvent('mouseup', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                    btn.dispatchEvent(mouseup);
                    resolve({
                        errcode: '0000',
                        description: 'success',
                        data: list
                    });
                } else {
                    var tempDx = Math.ceil(Math.random() * 30) + 20;
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
    })
}

export function loginWait(nOpt = {}) {
    const isRedirect = document.body.innerText.indexOf('登录跳转中') !== -1;
    const myGetCookie = window.pwyNightmare.getCookie;
    const c1 = myGetCookie('dzswjType');
    const c2 = myGetCookie('SERVERID');
    const msgObj = document.querySelector('.layui-layer-content');
    const loginMsg = msgObj && msgObj.innerText ? msgObj.innerText : '';
    if (isRedirect || (c1 && c2)) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                loginMsg: loginMsg
            }
        };
    }
    return false;
}

export function szzhWait(myOpt) {
    const curHref = document.location.href;
    const ck = window.pwyNightmare.getCookie('SSO_SECURITY_CHECK_TOKEN');
    if (ck) {
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

    if (typeof $ === 'undefined') {
        return false;
    }

    if (curHref.indexOf(myOpt.swszzhUrl) === -1) {
        $.post("/xxmh/portalSer/setZrrxx.do", {}, function (d) {});
        location.href = myOpt.swszzhUrl;
    }
    return false;
}

export function checkError() {
    const msgObj = document.querySelector('.layui-layer-content');
    if (msgObj && msgObj.innerText) {
        return msgObj.innerText;
    }
    return '';
}

export function govLogin(lOpt = {}) {
    return new Promise((resolve) => {
        const errcodeInfo = window.pwyNightmare.errcodeInfo;
        // 进行登录
        let loginType = 'up';
        let xyxxs = [];
        const contextPath = '/sso';
        const mySubmitAfterAll = function() {
            var beforePassword = $("#passWord").val();
            var afterPassword = encode(beforePassword);
            $("#passWord").val(afterPassword);
            $("#upLoginForm").submit();
            $("#passWord").val(beforePassword);
            resolve(errcodeInfo.success);
        };

        const myCheckGrxxbhf = function(d, loginModleType, nextFunction) {
            var neededShowGrxxbhf = false;
            var saveReq = [];
            xyxxs = d.grxxbhfXyxx;
            if (d.grxxbhfXyxx&&d.grxxbhfXyxx.length>0) {
                d.grxxbhfXyxx.forEach(function(data){
                    if(!data.xysfyqd){
                        saveReq.push({"xy_uuid":data.xy_uuid});
                        neededShowGrxxbhf = true;
                    }
                });
            }
            if(neededShowGrxxbhf){
                $.ajax({
                    type : "get",
                    url : contextPath+"/auth/saveGrxxbhfXyxx.do",
                    data : {req:JSON.stringify(saveReq)},
                    async : false,
                    success : function(data){
                        data = eval("(" + data + ")");
                        aDataSet = data;
                        if(aDataSet.rtnCode != '0') {
                            resolve({
                                ...errcodeInfo.argsErr,
                                description: aDataSet.message
                            })
                            return;
                        }else{
                            nextFunction(d, loginModleType, mySubmitAfterAll);
                        }
                    }
                });
            } else {
                nextFunction(d, loginModleType, mySubmitAfterAll);
            }
        };
        const mySendDxyzm = function(data, loginModleType, nextFuntion) {
            nextFuntion(data, loginModleType);
        };

        const myValidatePassword = function(data){
            var loginModleType = $("#loginModleType").val();
            $.ajax({
                url : contextPath + "/loginportal/checkZhmm.do",
                data : data,
                type : 'post',
                async : true,//true为异步请求，能加载 layer.load 事件；false为同步，无法加载
                dataType : 'json',
                success : function(data) {
                    if ("" != data && null != data) {
                        if ("success" == data.returnCode && ""!= data.sjhm && null != data.sjhm) {
                            // resolve({
                            //     ...errcodeInfo.argsErr,
                            //     description: '当前账号开启了短信验证，暂时不支持服务端直接调用'
                            // });
                            myCheckGrxxbhf(data, loginModleType, mySendDxyzm);
                        } else {
                            resolve({
                                ...errcodeInfo.argsErr,
                                description: data.message
                            });
                        }
                    } else {
                        resolve(errcodeInfo.govErr);
                    }
                },
                error : function(data) {
                    resolve(errcodeInfo.govErr);
                }
            });
        };

        const myUpLogin = function(linkUrl) {
            var type = "";
            var userName=$("#userName").val().trim();
            var userNameOrSjhm = $("#userNameOrSjhm").val().trim();
            var passWord=$("#passWord").val().trim();
            var zjhm=$("#zjhm").val().trim();
            var sjhm=$("#sjhm").val().trim();
            var sjyzm=$("#sjyzm").val().trim();
            var loginModleType = $("#loginModleType").val();
            //去掉多余的空格字符后重新赋值给标签，用于form表单提交
            $("#userName").val(userName);
            $("#userNameOrSjhm").val(userNameOrSjhm);
            $("#sjhm").val(sjhm);
            $("#zjhm").val(zjhm);

            if(loginModleType=="zrrLogin"){
                $('input[type=radio][name=loginTab]:checked').each(function(){
                    if($(this).val()=="usernameLogin"){
                        type="0";
                    }else if($(this).val()=="phoneLogin"){
                        type="4";
                    }else if($(this).val()=="zjhmLogin"){
                        type="5";
                    }
                });
            } else if(loginModleType=="qyLogin" || loginModleType=="dlrLogin" || loginModleType=="kqybyhLogin") {
                var pattern4 = /^1[0-9]{3}$/; //前四位为数字，用户名前四位不可能为数字
                var pattern11 = /^1[0-9]{10}$/; //手机号码11位正则表达式
                if(userNameOrSjhm.length==11 && pattern4.test(userNameOrSjhm.substring(0,4)) && pattern11.test(userNameOrSjhm)){
                    type="4";
                    $("#sjhm").val(userNameOrSjhm);
                    sjhm = userNameOrSjhm;
                }else{
                    type="0";
                    $("#userName").val(userNameOrSjhm);
                    userName = userNameOrSjhm;
                }
                if(loginModleType=="kqybyhLogin"){
                    $('input[type=radio][name=loginTabKqy]:checked').each(function(){
                        if($(this).val()=="kqybyhLogin"){
                            $("#kqybyhType").val("0");
                        }else if($(this).val()=="kqsydjnsrLogin"){
                            $("#kqybyhType").val("1");
                        }
                    });
                }
            }

            $("#loginType").val(type);
            if("true"!=sfyxqydl){
                $("#sjly").val(0);
            }else{
                var number = "0123456789";
                if((userName!=""&&number.indexOf(userName)!=-1) || checkNeedToShowSjly($("#userName").val())){
                    $("#sjly").val(2);
                }else{
                    $("#sjly").val(0);
                }
            }

            if(loginModleType=="qyLogin" || loginModleType=="kqybyhLogin"){
                var shxydmOrsbh=$("#shxydmOrsbh").val().trim();
                if(shxydmOrsbh==""||shxydmOrsbh==null || shxydmOrsbh=="undefined" || shxydmOrsbh=="社会信用代码/识别号"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '社会信用代码/识别号不能为空'
                    });
                    return;
                }
                $("#shxydmOrsbh").val(shxydmOrsbh);
            }else if(loginModleType=="dlrLogin"){
                var zjjgShxydmOrsbh=$("#zjjgShxydmOrsbh").val().trim();
                if(zjjgShxydmOrsbh==""||zjjgShxydmOrsbh==null || zjjgShxydmOrsbh =="undefined" || zjjgShxydmOrsbh=="中介机构社会信用代码/识别号") {
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '中介机构社会信用代码/识别号不能为空！'
                    });
                    return;
                }
                $("#zjjgShxydmOrsbh").val(zjjgShxydmOrsbh);
            }
            if(loginModleType=="qyLogin" || loginModleType=="dlrLogin" || loginModleType=="kqybyhLogin"){
                if(userNameOrSjhm==""||userNameOrSjhm==null||"undefined"==userNameOrSjhm||userNameOrSjhm=="用户名/实名手机号码"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '用户名/实名手机号码不能为空！'
                    });
                    return;
                }
            }

            if(type=="0"){
                if(userName==""||userName==null||"undefined"==typeof(userName)||userName=="用户名"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '用户名不能为空！'
                    });
                    return;
                }
                if(passWord==""||passWord==null||"undefined"==typeof(passWord)||passWord=="用户密码"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '用户密码不能为空！'
                    });
                    return;
                }
            }
            if(type=="4"){
                if(sjhm==""||sjhm==null||"undefined"==typeof(sjhm)||sjhm=="实名手机号码"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '手机号码不能为空！'
                    });
                    return;
                }
                if(passWord==""||passWord==null||"undefined"==typeof(passWord)||passWord=="用户密码"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '密码不能为空！'
                    });
                    return;
                }
            }
            if(type=="5"){
                if(zjhm==""||zjhm==null||"undefined"==typeof(zjhm)||zjhm=="证件号码"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '证件号码不能为空！'
                    });
                    return;
                }
                if(passWord==""||passWord==null||"undefined"==typeof(passWord)||passWord=="用户密码"){
                    resolve({
                        ...errcodeInfo.argsErr,
                        description: '用户密码不能为空！'
                    });
                    return;
                }
            }

            //开启短信验证码校验，走短信验证码流程
            //6月19日要求暂时先自然人登录需要短信验证码流程，那么其它登录方式需要展示滑块验证码
            /* if("Y"==dxyzmControl || dxyzmLoginType.indexOf(loginModleType)>0){
                var flagType1 = document.cookie.indexOf("dzswjType0="+encode(userName));
                var flagType2 = document.cookie.indexOf("dzswjType4="+encode(sjhm));
                var flagType3 = document.cookie.indexOf("dzswjType5="+encode(zjhm));
                if(flagType1 < 0 && flagType2 < 0 && flagType3 < 0){
                    var data ={loginType:encode(type),	password:encode(passWord),userName:encode(userName),sjhm:encode(sjhm),zjhm:encode(zjhm),zjlxDm:$("#zjlxDm option:selected").val(),sjly:$("#sjly").val()};
                    validatePasswordBeforeSendDxyzm(data);
                    return;
                }else{
                    $("#isFirstfsdx").val("N");
                }
            } */

            //由于个人信息保护法需求，这里需要先验证登录，然后展示协议，手机验证码也放到这里实现
            if("Y"==tqyzdlControl){
                var shxydmOrsbh = '';
                if(loginModleType == 'qyLogin'){
                    shxydmOrsbh = $("#shxydmOrsbh").val();
                }
                if(loginModleType == 'dlrLogin'){
                    shxydmOrsbh = $("#zjjgShxydmOrsbh").val();
                }
                var data ={loginType:encode(type),	password:encode(passWord),userName:encode(userName),sjhm:encode(sjhm),zjhm:encode(zjhm),zjlxDm:$("#zjlxDm option:selected").val(),sjly:$("#sjly").val(), loginModleType: encode(loginModleType), shxydmOrsbh: encode(shxydmOrsbh)};
                //校验登录
                myValidatePassword(data);
                return;
            }
            mySubmitAfterAll();
        };

        // 拖动滑块
        const drayBtn = function() {
            var btn = document.querySelector('.nc_scale span')
            var mousedown = document.createEvent('MouseEvents');
            var rect = btn.getBoundingClientRect();
            var x = rect.x;
            var y = rect.y;

            mousedown.initMouseEvent('mousedown', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
            btn.dispatchEvent(mousedown);

            (function next(dx, dy){
                var mousemove = document.createEvent('MouseEvents');
                var _x = x + dx;
                var _y = y + dy;
                mousemove.initMouseEvent('mousemove', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                btn.dispatchEvent(mousemove);
                btn.dispatchEvent(mousemove);
                if(_x - x >= 350) {
                    var mouseup = document.createEvent('MouseEvents');
                    mouseup.initMouseEvent('mouseup', true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                    btn.dispatchEvent(mouseup);
                    setTimeout(() => {
                        const curHref = window.location.href;
                        myUpLogin(curHref);
                    }, 200)
                }
                else{
                    var tempDx = dx + Math.ceil(Math.random() * 50);
                    setTimeout(() => {
                        next(tempDx, dy);
                    }, 60)
                }
            })(0, 0);
        }

        document.getElementById('shxydmOrsbh').value = lOpt.taxNo;
        document.getElementById('userNameOrSjhm').value = lOpt.accout;
        document.getElementById('passWord').value = lOpt.accoutPasswd;
        setTimeout(() => {
            if (document.querySelector(".nc_scale span")) {
                setTimeout(() => {
                    drayBtn();
                }, 1000);
            } else {
                const curHref = window.location.href;
                myUpLogin(curHref);
            }
        }, 1000);
    })
}

export function getRedirectUrl() {
    const errcodeInfo = window.pwyNightmare.errcodeInfo;
    var tempStrBt = window.strbt || '';
    if(tempStrBt !== ''){
        $.post('/xxmh/userInfoController/setForwardBt.do', {"forwardbt": tempStrBt}, function (d) {

        });
    }
    var ssoXxmhUrl = $('#ssoXxmhUrl').val();
    if(ssoXxmhUrl && ssoXxmhUrl.indexOf("http")==0){
        return {
            ...errcodeInfo.success,
            data: ssoXxmhUrl
        };
    }
    return errcodeInfo.govErr;
}
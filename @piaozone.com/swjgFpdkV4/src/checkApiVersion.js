import * as diskApi from './diskApi';

export const getApiVersion = async function(certPass, operateUrl) {
    var vs = await diskApi.getVersionApi(true, operateUrl);
    var cryptType = 1; // 默认使用旧版
    var alg;
    if (vs == null) {
        cryptType = 1;
        alg = 0;
    } else {
        cryptType = 0;
        var vsVersion = vs.version || '';
        if (vsVersion) {
            vsVersion = vsVersion.replace(/[^0-9]/, '');
            vsVersion = parseInt(vsVersion);
        } else {
            vsVersion = 0;
        }
        if(vsVersion < 10){
            cryptType = 1;
            alg = 0;
        } else {
            var obj = await diskApi.verifyPinApi(certPass, false, 1);
            if (obj.errcode !== '0000') {
                obj = await diskApi.verifyPinApi(certPass, false, 0);
                if (obj.errcode === '0000') {
                    alg = 0;
                }
            } else if (obj.errcode === '0000') {
                alg = 1;
            }

            if (obj.errcode !== '0000') {
                return obj;
            }
        }
    }

    return {
        errcode: '0000',
        data: {
            cryptType,
            alg
        }
    };
}

export const checkTaxNo = function(cert) {
    var strRegx = /^[0-9a-zA-Z]+$/;
    if (cert == '') {
        return {
            errcode: '7000',
            description: '读取证书信息失败，未获取到合法的纳税人信息,请重新提交请求或检查金税盘、税控盘或税务Ukey是否插入'
        };
    } else if (!strRegx.test(cert)) {
        return {
            errcode: '7000',
            description: '读取到的纳税人信息（纳税人识别号：' + cert + '）不合法！请重试！'
        };
    } else {
        return {
            errcode: '0000',
            description: 'success'
        }
    }
}

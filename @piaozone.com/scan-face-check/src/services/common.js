import { kdRequest } from '../utils/kdRequest';
import { encryptByJSEncrypt } from '../utils/common';

// 获取认证二维码信息
export async function getEtaxAuthCode(data) {
    const res = await kdRequest('/fpdk/etax/scanFace/check/qr/info', {
        method: 'POST',
        data: encryptByJSEncrypt(data)
    });
    return res;
}

// 轮询认证状态
export async function getEtaxAuthCheckResult(data) {
    const res = await kdRequest('/fpdk/etax/query/scanFace/check/result', {
        method: 'POST',
        data: encryptByJSEncrypt(data)
    });
    return res;
}

// 获取电子税局是否需要身份认证
export async function getEtaxNeedAuthStatus(data) {
    const res = await kdRequest('/fpdk/etax/login/auth', {
        method: 'POST',
        data: encryptByJSEncrypt(data)
    });
    return res;
}

// 获取登录状态
export async function etaxAccountInfo(data) {
    const res = await kdRequest('/fpdk/etax/account/info', {
        method: 'GET',
        data,
        isFpdkService: true
    });
    return res;
}

import { encryptKdRequest } from '../utils/kdRequest';

// 电子税局登录
export async function loginRequest(data, opt) {
    const res = await encryptKdRequest('/newEra/issueLogin', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

// 获取认证二维码信息
export async function getEtaxAuthCode(data) {
    const res = await encryptKdRequest('/newEra/faceImg', {
        method: 'POST',
        data
    });
    return res;
}

// 轮询认证状态
export async function getEtaxAuthCheckResult(data) {
    const res = await encryptKdRequest('/newEra/faceState', {
        method: 'POST',
        data
    });
    return res;
}

// 获取电子税局是否需要身份认证
export async function getEtaxNeedAuthStatus(data) {
    const res = await encryptKdRequest('/newEra/faceAuth', {
        method: 'POST',
        data
    });
    return res;
}

// 获取登录状态
export async function etaxLoginType(data, opt) {
    const res = await encryptKdRequest('/fpdk/etax/login/type', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

export async function qrcodeLoginRequest(data, opt) {
    const res = await encryptKdRequest('/fpdk/etax/qrcode/login', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

export async function qxyAccountConfigQuery(data, opt) {
    const res = await encryptKdRequest('/fpdk/qxy/account/config/query', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}


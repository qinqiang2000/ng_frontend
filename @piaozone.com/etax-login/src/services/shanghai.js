import { kdRequest } from '../utils/kdRequest';

// 查询用户列表
export async function queryUserList(data) {
    const res = await kdRequest('/fpdk/etax/shanghai/queryUserList', {
        method: 'POST',
        data
    });
    return res;
}

// 发送短信验证码
export async function sendShortMsg(data, opt) {
    const res = await kdRequest('/fpdk/etax/shanghai/sendShortMsg', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

export async function selectLoginType(data) {
    const res = await kdRequest('/fpdk/etax/shanghai/selectLoginType', {
        method: 'POST',
        data
    });
    return res;
}

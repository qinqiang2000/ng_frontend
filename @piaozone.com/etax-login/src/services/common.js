import { kdRequest } from '../utils/kdRequest';

// 查询税局账号和公众号绑定信息
export async function wxRelationQueryInfo(data) {
    const res = await kdRequest('/m28/bill/digital/relation/query/info', {
        method: 'POST',
        data,
        isFpdkService: true
    });
    return res;
}

// 发送模板消息
export async function wxRelationQuerySendMsg(data) {
    const res = await kdRequest('/m28/bill/digital/relation/send/msg', {
        method: 'POST',
        data,
        isFpdkService: true
    });
    return res;
}

// 生成二维码接口
export async function wxQrcodeCreate(data) {
    const res = await kdRequest('/scan/manage/qrcode/create', {
        method: 'POST',
        data,
        isFpdkService: true
    });
    return res;
}

// 保存税局账号和公众号绑定信息
export async function wxRelationQuerySave(data) {
    const res = await kdRequest('/m28/bill/digital/relation/save', {
        method: 'POST',
        data,
        isFpdkService: true
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

// 获取登录结果
export async function etaxLoginStatus(data, opt) {
    const res = await kdRequest('/fpdk/etax/login/status', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

// 通用第一步登陆
export async function stepOneLogin(data, opt) {
    const res = await kdRequest('/fpdk/etax/common/stepOneLogin', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

// 通用发送短信验证码
export async function sendShortMsg(data, opt) {
    const res = await kdRequest('/fpdk/etax/common/sendShortMsg', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

// 通用登录
export async function commonLogin(data, opt) {
    const res = await kdRequest('/fpdk/etax/common/login', {
        method: 'POST',
        data,
        ...opt
    });
    return res;
}

// 获取app配置
export async function getAppConfig(data) {
    const res = await kdRequest('/web/getAppConfig', {
        method: 'POST',
        data
    });
    return res;
}

import Login from './components/logins/login';
import AutoLogin from './components/logins/autoLogin';
import Shanghai from './components/logins/shanghai';

// code暂时未用到
// autoLogin 是否自动登录 需与@piaozone.com\invoice-client-plugin-common-route\src\constants.ts，@piaozone.com\invoice-client-plugin-common-route\src\controller地区的取值保持一致
// city 税局地区中文 用于通用路由匹配税局地区服务 需与@piaozone.com\invoice-client-plugin-common-route\src\constants.ts中保持一致
export const CITYS = [
    { code: '1100', city: '北京', autoLogin: false, com: Login },
    { code: '1200', city: '天津', autoLogin: false, com: Login },
    { code: '1300', city: '河北', autoLogin: false, com: Login },
    { code: '1400', city: '山西', autoLogin: false, com: Login },
    { code: '1500', city: '内蒙古', autoLogin: false, com: Login },
    { code: '2100', city: '辽宁', autoLogin: false, com: Login },
    { code: '2102', city: '大连', autoLogin: false, com: Login },
    { code: '2200', city: '吉林', autoLogin: false, com: Login },
    { code: '2300', city: '黑龙江', autoLogin: false, com: Login },
    { code: '3100', city: '上海', autoLogin: false, com: Shanghai },
    { code: '3200', city: '江苏', autoLogin: false, com: Login },
    { code: '3300', city: '浙江', autoLogin: true, com: AutoLogin },
    { code: '3302', city: '宁波', autoLogin: false, com: Login },
    { code: '3400', city: '安徽', autoLogin: false, com: Login },
    { code: '3500', city: '福建', autoLogin: false, com: Login },
    { code: '3502', city: '厦门', autoLogin: false, com: Login },
    { code: '3600', city: '江西', autoLogin: false, com: Login },
    { code: '3700', city: '山东', autoLogin: false, com: Login },
    { code: '3702', city: '青岛', autoLogin: false, com: Login },
    { code: '4100', city: '河南', autoLogin: false, com: Login },
    { code: '4200', city: '湖北', autoLogin: true, com: AutoLogin },
    { code: '4300', city: '湖南', autoLogin: false, com: Login },
    { code: '4400', city: '广东', autoLogin: true, com: AutoLogin },
    { code: '4403', city: '深圳', autoLogin: false, com: Login },
    { code: '4500', city: '广西', autoLogin: false, com: Login },
    { code: '4600', city: '海南', autoLogin: false, com: Login },
    { code: '5000', city: '重庆', autoLogin: false, com: Login },
    { code: '5100', city: '四川', autoLogin: false, com: Login },
    { code: '5200', city: '贵州', autoLogin: false, com: Login },
    { code: '5300', city: '云南', autoLogin: false, com: Login },
    { code: '5400', city: '西藏', autoLogin: false, com: Login },
    { code: '6100', city: '陕西', autoLogin: false, com: Login },
    { code: '6200', city: '甘肃', autoLogin: false, com: Login },
    { code: '6300', city: '青海', autoLogin: false, com: Login },
    { code: '6400', city: '宁夏', autoLogin: false, com: Login },
    { code: '6500', city: '新疆', autoLogin: false, com: Login }
];

export const ROLES = [
    { key: 1, value: '开票员' },
    { key: 2, value: '办税员' },
    { key: 3, value: '财务负责人' },
    { key: 4, value: '法定代表人' }
];

// eslint-disable-next-line
export const JSENCRYPT_PUBLICKEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDof5+g7CVWjLd65qHH1rBf7+Q01TZi2J+iObXwyCDGrBXaDhC7al2YELDm890kUtqGFfV0og5oPw9k1lIx48NW4og5b1TyV1T2DAmxBOCwQWMAdWJz9pzMUEe4SHkSIzwjmaKaf0rxi3xCNNc7GfSgu4MIAIudUBol2g6vsFPhpQIDAQAB';
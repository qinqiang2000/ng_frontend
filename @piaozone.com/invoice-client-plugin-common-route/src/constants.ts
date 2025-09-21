export const ntLockPreKey = 'nt-page-lock-pre';

export const ntLockLoginPreKey = 'nt-login-lock-pre';

// 请求中加锁，防止保活影响
export const ntLockRequestPreKey = 'nt-login-lock-request-pre';

export const loginedListKey = 'loginedPageList';

// 数电账号 地区验证码发送限制
export const etaxAreaShortMsgCodeSendPreKey = 'etax-area-shortMsgCode-send-';

// code暂时未用到
// autoLogin 是否自动登录 锁的时间配置，需与@piaozone.com\etax-login\src\constants.js，@piaozone.com\invoice-client-plugin-common-route\src\controller地区的取值保持一致
// city 税局地区中文 用于通用路由匹配税局地区服务 需与@piaozone.com\etax-login\src\constants.js中保持一致
// name 税局地区拼音 用于匹配服务，需与@piaozone.com\invoice-client-plugin-common-service\src\index.js的税局地区服务名称保持一致
export const ETAX_LOGIN_OPTIONS = [
    { code: '1100', autoLogin: false, city: '北京', name: 'beijing' },
    { code: '1200', autoLogin: false, city: '天津', name: 'tianjin' },
    { code: '1300', autoLogin: false, city: '河北', name: 'hebei' },
    { code: '1400', autoLogin: false, city: '山西', name: 'shanxi' },
    { code: '1500', autoLogin: false, city: '内蒙古', name: 'neimenggu' },
    { code: '2100', autoLogin: false, city: '辽宁', name: 'liaoning' },
    { code: '2102', autoLogin: false, city: '大连', name: 'dalian' },
    { code: '2200', autoLogin: false, city: '吉林', name: 'jilin' },
    { code: '2300', autoLogin: false, city: '黑龙江', name: 'heilongjiang' },
    { code: '3100', autoLogin: false, city: '上海', name: 'shanghai' },
    { code: '3200', autoLogin: false, city: '江苏', name: 'jiangsu' },
    { code: '3300', autoLogin: true, city: '浙江', name: 'zhejiang' },
    { code: '3302', autoLogin: false, city: '宁波', name: 'ningbo' },
    { code: '3400', autoLogin: false, city: '安徽', name: 'anhui' },
    { code: '3500', autoLogin: false, city: '福建', name: 'fujian' },
    { code: '3502', autoLogin: false, city: '厦门', name: 'xiamen' },
    { code: '3600', autoLogin: false, city: '江西', name: 'jiangxi' },
    { code: '3700', autoLogin: false, city: '山东', name: 'shandong' },
    { code: '3702', autoLogin: false, city: '青岛', name: 'qingdao' },
    { code: '4100', autoLogin: false, city: '河南', name: 'henan' },
    { code: '4200', autoLogin: true, city: '湖北', name: 'hubei' },
    { code: '4300', autoLogin: false, city: '湖南', name: 'hunan' },
    { code: '4400', autoLogin: true, city: '广东', name: 'guangdong' },
    { code: '4403', autoLogin: false, city: '深圳', name: 'shenzhen' },
    { code: '4500', autoLogin: false, city: '广西', name: 'guangxi' },
    { code: '4600', autoLogin: false, city: '海南', name: 'hainan' },
    { code: '5000', autoLogin: false, city: '重庆', name: 'chongqing' },
    { code: '5100', autoLogin: false, city: '四川', name: 'sichuan' },
    { code: '5200', autoLogin: false, city: '贵州', name: 'guizhou' },
    { code: '5300', autoLogin: false, city: '云南', name: 'yunnan' },
    { code: '5400', autoLogin: false, city: '西藏', name: 'xizang' },
    { code: '6100', autoLogin: false, city: '陕西', name: 'shaanxi' },
    { code: '6200', autoLogin: false, city: '甘肃', name: 'gansu' },
    { code: '6300', autoLogin: false, city: '青海', name: 'qinghai' },
    { code: '6400', autoLogin: false, city: '宁夏', name: 'ningxia' },
    { code: '6500', autoLogin: false, city: '新疆', name: 'xinjiang' }
];

export const ETAX_LOGIN_ROLES = [
    { key: 1, value: '开票员' },
    { key: 2, value: '办税员' },
    { key: 3, value: '财务负责人' },
    { key: 4, value: '法定代表人' }
];

// 企业认证 针对变迁了城市的税号
export const FIX_TAXNO_CITY = [
    { taxNo: '91350623MA8TQ5X707', city: '厦门' },
    { taxNo: '91420100MA49JYGG1H', city: '江苏' },
    { taxNo: '91441202MA53U9GQ15', city: '深圳' },
    { taxNo: '914403003119439031', city: '深圳' },
    { taxNo: '91371100MA3QTPPL3R', city: '青岛' },
    { taxNo: '91310000MA1FW1DH1A', city: '安徽' },
    { taxNo: '91330201MA2KPE0B39', city: '浙江' },
    { taxNo: '91370214MACHXKM847', city: '上海' },
    { taxNo: '91330483MA28AQK513', city: '北京' },
    { taxNo: '91310114MA1GW4CQ88', city: '安徽' },
    { taxNo: '91110102678757314E', city: '上海' }
];

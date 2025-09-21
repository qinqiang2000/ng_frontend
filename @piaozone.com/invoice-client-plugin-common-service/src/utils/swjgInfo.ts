/*  eslint-disable object-property-newline */
export interface fpdkCityTitemType {
    code: string;
    city: string;
    url: string;
    name: string;
    eUrl?: string;
    eLoginUrl?: string;
    swszzhUrl?: string;
}

export const fpdkCitys : fpdkCityTitemType[] = [
    { code: '1100', city: '北京', name: 'beijing', url: 'https://fpdk.beijing.chinatax.gov.cn/' },
    { code: '1200', city: '天津', name: 'tianjin', url: 'https://fpdk.tianjin.chinatax.gov.cn/' },
    { code: '1300', city: '河北', name: 'hebei', url: 'https://fpdk.hebei.chinatax.gov.cn/' },
    { code: '1400', city: '山西', name: 'shanxi', url: 'https://fpdk.shanxi.chinatax.gov.cn/' },
    { code: '1500', city: '内蒙古', name: 'neimenggu', url: 'https://fpdk.neimenggu.chinatax.gov.cn/' },
    // 辽宁税局抵扣平台ssl协议太低，不能在chrome，firefox, edge中打开，通过发票云服务端代理
    { code: '2100', city: '辽宁', name: 'liaoning', url: 'https://fpdk.liaoning.chinatax.gov.cn/' },
    // { code: '2100', city: '辽宁', name: 'liaoning', url: 'https://fpdk-liaoning.piaozone.com/' },
    { code: '2102', city: '大连', name: 'dalian', url: 'https://sbf.dalian.chinatax.gov.cn:8401/' },
    { code: '2200', city: '吉林', name: 'jilin', url: 'https://fpdk.jilin.chinatax.gov.cn:4431/' },
    { code: '2300', city: '黑龙江', name: 'heilongjiang', url: 'https://fpdk.heilongjiang.chinatax.gov.cn/' },
    { code: '3100', city: '上海', name: 'shanghai', url: 'https://fpdk.shanghai.chinatax.gov.cn/' },
    { code: '3200', city: '江苏', name: 'jiangsu', url: 'https://fpdk.jiangsu.chinatax.gov.cn:81/' },
    { code: '3300', city: '浙江', name: 'zhejiang', url: 'https://fpdk.zhejiang.chinatax.gov.cn/' },
    { code: '3302', city: '宁波', name: 'ningbo', url: 'https://fpdk.ningbo.chinatax.gov.cn/' },
    { code: '3400', city: '安徽', name: 'anhui', url: 'https://fpdk.anhui.chinatax.gov.cn/' },
    { code: '3500', city: '福建', name: 'fujian', url: 'https://fpdk.fujian.chinatax.gov.cn/' },
    { code: '3502', city: '厦门', name: 'xiamen', url: 'https://fpdk.xiamen.chinatax.gov.cn/' },
    { code: '3600', city: '江西', name: 'jiangxi', url: 'https://fpdk.jiangxi.chinatax.gov.cn/' },
    { code: '3700', city: '山东', name: 'shandong', url: 'https://fpdk.shandong.chinatax.gov.cn/' },
    { code: '3702', city: '青岛', name: 'qingdao', url: 'https://fpdk.qingdao.chinatax.gov.cn/' },
    { code: '4100', city: '河南', name: 'henan', url: 'https://fpdk.henan.chinatax.gov.cn/' },
    { code: '4200', city: '湖北', name: 'hubei', url: 'https://fpdk.hubei.chinatax.gov.cn/' },
    { code: '4300', city: '湖南', name: 'hunan', url: 'https://fpdk.hunan.chinatax.gov.cn/' },
    {
        code: '4400',
        city: '广东',
        name: 'guangdong',
        url: 'https://fpdk.guangdong.chinatax.gov.cn/',
        eUrl: 'https://etax.guangdong.chinatax.gov.cn',
        eLoginUrl: 'https://etax.guangdong.chinatax.gov.cn/sso/login?service=http://etax.guangdong.chinatax.gov.cn/xxmh/html/index_login.html',
        // 税务数字账户跳转地址
        swszzhUrl: 'https://dppt.guangdong.chinatax.gov.cn:8443/szzhzz/spHandler?cdlj=digital-tax-account'
    },
    { code: '4403', city: '深圳', name: 'shenzhen', url: 'https://fpdk.shenzhen.chinatax.gov.cn/' },
    { code: '4500', city: '广西', name: 'guangxi', url: 'https://fpdk.guangxi.chinatax.gov.cn/' },
    { code: '4600', city: '海南', name: 'hainan', url: 'https://fpdk.hainan.chinatax.gov.cn/' },
    { code: '5000', city: '重庆', name: 'chongqing', url: 'https://fpdk.chongqing.chinatax.gov.cn/' },
    { code: '5100', city: '四川', name: 'sichuan', url: 'https://fpdk.sichuan.chinatax.gov.cn/' },
    { code: '5200', city: '贵州', name: 'guizhou', url: 'https://fpdk.guizhou.chinatax.gov.cn/' },
    { code: '5300', city: '云南', name: 'yunnan', url: 'https://fpdk.yunnan.chinatax.gov.cn/' },
    { code: '5400', city: '西藏', name: 'xizang', url: 'https://fpdk.xizang.chinatax.gov.cn/' },
    { code: '6100', city: '陕西', name: 'shaanxi', url: 'https://fpdk.shaanxi.chinatax.gov.cn/' },
    { code: '6200', city: '甘肃', name: 'gansu', url: 'https://fpdk.gansu.chinatax.gov.cn/' },
    { code: '6300', city: '青海', name: 'qinghai', url: 'https://fpdk.qinghai.chinatax.gov.cn/' },
    { code: '6400', city: '宁夏', name: 'ningxia', url: 'https://fpdk.ningxia.chinatax.gov.cn/' },
    { code: '6500', city: '新疆', name: 'xinjiang', url: 'https://fpdk.xinjiang.chinatax.gov.cn/' }
];

// 根据企业税号获取税务地址信息
export function getSwjgInfoByTaxNo(taxNo: string) : fpdkCityTitemType | false {
    if (taxNo === '') {
        return false;
    }

    let code = '';
    // 三证合一税号
    if (taxNo.length === 18) {
        code = taxNo.substr(2, 4);
    } else if (taxNo.length === 15) {
        code = taxNo.substr(0, 4);
    } else {
        return false;
    }

    let cityItem : fpdkCityTitemType[] = fpdkCitys.filter((item) => {
        return item.code === code;
    });

    if (cityItem.length !== 0) {
        return cityItem[0];
    }

    code = code.substr(0, 2) + '00';

    cityItem = fpdkCitys.filter((item) => {
        return item.code === code;
    });

    if (cityItem.length !== 0) {
        return cityItem[0];
    }
    return false;
}

// 根据城市名称获取税务地址信息
export function getSwjgInfoByCity(city: string) : fpdkCityTitemType | false {
    if (!city) {
        return false;
    }
    const cityItem = fpdkCitys.filter((item) => {
        return item.city === city;
    });
    if (cityItem.length !== 0) {
        return cityItem[0];
    }
    return false;
}

// 根据城市名称获取税务地址信息
export function getSwjgInfoByCityName(cityName: string) : fpdkCityTitemType | false {
    if (!cityName) {
        return false;
    }
    const cityItem = fpdkCitys.filter((item) => {
        return item.name === cityName;
    });
    if (cityItem.length !== 0) {
        return cityItem[0];
    }
    return false;
}
/* eslint-disable */
import { getInvoiceType } from './tools';

export const getEtaxInvoiceType = (typeText, fpdm = '') => { // 全电模式采集表头
    typeText = typeText.trim();
    if (typeText === '增值税专用发票' || typeText === '纸质发票（增值税专用发票）' || typeText === '数电纸质发票（增值税专用发票）') {
        return 4;
    }

    // 电子普通发票里面包含了通行费发票
    if (typeText === '增值税电子普通发票') {
        const temptType = getInvoiceType(fpdm);
        if (temptType === 15) {
            return 15;
        }
        return 1;
    }

    if (typeText === '增值税电子专用发票') {
        return 2;
    }

    if (typeText === '增值税普通发票') {
        const temptType = getInvoiceType(fpdm);
        if (temptType === 5) {
            return 5;
        } else if (temptType === 15) {
            return 15;
        }
        return 3;
    }

    if (typeText === '纸质发票（普通发票）' || typeText === '数电纸质发票（普通发票）' ) {
        return 3;
    }

    if (typeText.indexOf('机动车') !== -1) {
        return 12;
    }

    if (typeText.indexOf('二手车') !== -1) {
        return 13;
    }

    if (typeText.indexOf('海关缴款书') !== -1) {
        return 21;
    }

    let isQdfp = false;
    if (~typeText.indexOf('全电发票') || ~typeText.indexOf('数电票')) {
        isQdfp = true;
    }

    if (isQdfp && typeText.indexOf('普通发票') !== -1) {
        return 26;
    }

    if (isQdfp && typeText.indexOf('增值税专用发票') !== -1) {
        return 27;
    }

    if (typeText.indexOf('电子发票') !== -1 && typeText.indexOf('普通发票') !== -1 && fpdm.length < 5) {
        return 26;
    }

    if (typeText.indexOf('电子发票') !== -1 && typeText.indexOf('增值税专用发票') !== -1 && fpdm.length < 5) {
        return 27;
    }

    if (typeText.indexOf('卷票') !== -1) {
        return 5;
    }

    if (typeText.indexOf('通行费') !== -1) {
        return 15;
    }

    return -1;
};

export function getGovInvoiceTypeText(govType) {
    const dict = {
        'k81': '数电票（增值税专用发票）',
        'k82': '数电票（普通发票）',
        'k01': '增值税专用发票',
        'k08': '增值税电子专用发票',
        'k03': '机动车销售统一发票',
        'k10': '增值税电子普通发票',
        'k04': '增值税普通发票'
    };
    return dict['k' + govType] || '';
}

export function transformGovType(type) { // 全电模式采集表头
    const dict = {
        'k82': 26, // 数电票-普通发票
        'k81': 27, // 数电票-增值税专用发票
        'k31': 27, // 数电发票-增值税专用发票 支持旧组件
        'k01': 4, // 增值税专用发票
        'k08': 2, // 增值税电子专用发票
        'k03': 12, // 机动车销售统一发票
        'k10': 15, // 增值税电子普通发票
        'k04': 3, // 增值税普通发票
        'k21': 21, // 海关缴款书
        'k14': 15, // 旧版综合服务平台发票类型转换为通行费发票
        'k85': 4, // 数电纸质发票（增值税专用发票）归类到增值税专用发票
        'k86': 3 // 数电纸质发票（普通发票）归类到增值税普通发票
    };
    return dict['k' + type] || -1;
}

export function transformFpyType(type) {
    const dict = {
        'k26': '82', // 数电票-普通发票
        'k27': '81', // 数电票-增值税专用发票
        'k4': '01', // 增值税专用发票
        'k2': '08', // 增值税电子专用发票
        'k12': '03', // 机动车销售统一发票
        'k15': '10', // 增值税电子普通发票
        'k3': '04', // 增值税普通发票
        'k21': '21'
    };
    return dict['k' + type] || -1;
}

export const getInvoiceStatus = (typeText) => {
    typeText = typeText.trim();
    // 发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
    return typeText;
};

export const getInvoiceStatusByText = (text = '') => {
    const typeText = text.trim();
    if (typeText === '正常') {
        return '0';
    }
    if (typeText.indexOf('已红冲') !== -1) {
        if (typeText.indexOf('全额') !== -1) {
            return '8';
        }
        if (typeText.indexOf('部分') !== -1) {
            return '7';
        }
    }
    if (typeText.indexOf('作废') !== -1) {
        return '2';
    }
    return '4';
};
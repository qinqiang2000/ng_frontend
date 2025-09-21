/* eslint-disable */
import { getInvoiceType } from './tools';

export const getEtaxInvoiceType = (typeText, fpdm = '') => { // 全电模式采集表头
    typeText = typeText.trim();
    if (typeText === '增值税专用发票' || typeText === '纸质发票（增值税专用发票）' || typeText === '数电纸质发票（增值税专用发票）' || typeText === '数电纸质发票(增值税专用发票)' || typeText === '纸质发票(增值税专用发票)' ) {
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

    if (typeText === '纸质发票（普通发票）' || typeText === '数电纸质发票（普通发票）' || typeText === '数电纸质发票(普通发票)' || typeText === '纸质发票(普通发票)' ) {
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

    if (typeText.includes('航空') && typeText.includes('数电票')) {
        return 28;
    }

    if (typeText.includes('铁路') && typeText.includes('数电票')) {
        return 29;
    }

    return -1;
};

export const getGovInvoiceType = (typeText) => {
    typeText = typeText.trim();
    if (typeText.includes('增值税专用发票')) {
        if (typeText.includes('数电纸质发票')) {
            return '85';
        }
        if (typeText.includes('全电发票') || typeText.includes('数电票')) {
            return '81';
        }
        return '01';
    }

    if (typeText.includes('增值税电子普通发票')) {
        return '10';
    }
    if (typeText.includes('增值税电子专用发票')) {
        return '08';
    }

    if (typeText === '增值税普通发票') {
        return '04';
    }

    if (typeText.includes('普通发票')) {
        if (typeText.includes('数电纸质发票')) {
            return '86';
        }
        if (typeText.includes('全电发票') || typeText.includes('数电票')) {
            return '82';
        }
        return '04';
    }

    if (typeText.includes('机动车')) {
        if (typeText.includes('数电纸质发票')) {
            return '87';
        }
        if (typeText.includes('全电发票') || typeText.includes('数电票')) {
            return '83';
        }
        return '03';
    }

    if (typeText.includes('二手车')) {
        if (typeText.includes('数电纸质发票')) {
            return '88';
        }
        if (typeText.includes('全电发票') || typeText.includes('数电票')) {
            return '84';
        }
        return '15';
    }

    if (typeText.includes('海关缴款书')) {
        return '21';
    }

    if (typeText.includes('卷票') || typeText.includes('卷式')) {
        return '11';
    }

    if (typeText.includes('通行费')) {
        return '14';
    }

    if (typeText.includes('航空') && typeText.includes('数电票')) {
        return '61';
    }

    if (typeText.includes('铁路') && typeText.includes('数电票')) {
        return '51';
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
        'k04': '增值税普通发票',
        'k85': '数电纸质发票(增值税专用发票)',
        'k86': '数电纸质发票(普通发票)',
        'k87': '数电纸质发票(机动车销售统一发票)',
        'k14': '道路通行费电子普通发票',
        'k61': '数电票(航空运输电子客票行程单)',
        'k51': '数电票(铁路电子客票)'
    };
    return dict['k' + govType] || '';
}

export function transformGovType(type, fpdm = '') { // 全电模式采集表头
    const dict = {
        'k10': 1, // 电子普通发票
        'k11': 5, // 增值税普通发票（卷式）
        'k82': 26, // 数电票-普通发票
        'k81': 27, // 数电票-增值税专用发票
        'k31': 27, // 全电发票-增值税专用发票 支持旧组件
        'k01': 4, // 增值税专用发票
        'k08': 2, // 增值税电子专用发票
        'k03': 12, // 机动车销售统一发票
        // 'k10': 15, // 增值税电子普通发票
        'k04': 3, // 增值税普通发票
        'k21': 21, // 海关缴款书
        'k14': 15, // 旧版综合服务平台发票类型转换为通行费发票
        'k85': 4, // 数电纸质发票（增值税专用发票）归类到增值税专用发票
        'k86': 3, // 数电纸质发票（普通发票）归类到增值税普通发票
        'k87': 12, // 数电纸质发票（机动车销售统一发票）
        'k88': 13, // 数电纸质发票（二手车销售统一发票）
        'k15': 13, // 二手车
        'k51': 29, // 数电票（铁路电子客票)
        'k61': 28 // 数电票（航空运输电子客票行程单)
    };
    let invoiceType = dict['k' + type] || -1;
    if (!fpdm || invoiceType === -1) {
        return invoiceType;
    }
    // 电子普通发票
    if (type === '10') {
        const temptType = getInvoiceType(fpdm);
        if (temptType === 15) {
            return 15;
        }
        return 1;
    }
    // 普通发票
    if (type === '04') {
        const temptType = getInvoiceType(fpdm);
        if (temptType === 5) {
            return 5;
        } else if (temptType === 15) {
            return 15;
        }
        return 3;
    }
    return invoiceType;
}

export function transformFpyType(type, etaxInvoiceNo = '') {
    const dict = {
        'k1': '10', // 增值税电子普通发票
        'k5': '11', // 增值税普通发票（卷式）
        'k26': '82', // 数电票-普通发票
        'k27': '81', // 数电票-增值税专用发票
        'k4': '01', // 增值税专用发票
        'k2': '08', // 增值税电子专用发票
        'k12': '03', // 机动车销售统一发票
        'k15': '14', // 增值税电子普通发票
        'k3': '04', // 增值税普通发票
        'k21': '21', // 海关缴款书
        'k13': '15', // 二手车
        'k28': '61', // 数电票（航空运输电子客票行程单)
        'k29': '51' // 数电票（铁路电子客票)
    };
    const govType = dict['k' + type];
    if (!govType) {
        return -1;
    }

    // 没有数电号码，直接返回
    if (!etaxInvoiceNo) {
        return govType;
    }
    // 数电纸质发票（普通发票）
    if (govType === '04') {
        return '86';
    }
    // 数电纸质发票（增值税专用发票）
    if (govType === '01') {
        return '85';
    }
    // 数电纸质发票（机动车销售统一发票）
    if (govType === '03') {
        return '87';
    }
    // 数电纸质发票（二手车销售统一发票）
    if (govType === '15') {
        return '88';
    }
    return -1;
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
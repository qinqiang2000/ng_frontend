/* eslint-disable */
// import moment from 'moment';
export const allowDownloadTypes = [4, 12, 3, 1, 5, 13, 15, 2];
export const fpyInvoiceTypes = [4, 12, 3, 1, 5, 13, 15, 2, 28];
export const govInvoiceTypes = ['01', '03', '04', '10', '11', '15', '14', '08', '61'];
export const jxxTypes = [1, 2];

const invoiceTypeNames = ['增值税专用发票', '机动车销售统一发票', '增值税普通发票', '增值税普通发票（电子)', '增值税普通发票（卷票）', '二手车销售统一发发票', '通行费电子发票', '增值税专用发票（电子）', '数电发票（航空运输电子客票行程单）'];

const jxxTypeNames = ['进项', '销项'];

export function getJxxName(type) {
    const index = jxxTypes.indexOf(type);
    return index === -1 ? -1 : jxxTypeNames[index];
}


export function transformFpyTypeToGov(type) {
    const dict = {
        'k26': '32', // 数电票-普通发票
        'k27': '31', // 数电票-增值税专用发票
        'k4': '01', // 增值税专用发票
        'k2': '08', // 增值税电子专用发票
        'k12': '03', // 机动车销售统一发票
        'k1': '10', // 增值税电子普通发票
        'k3': '04', // 增值税普通发票
        'k5': '11', // 增值税卷式发票
        'k15': '14', // 道路通行费电子普通发票
        'k13': '15', // 二手车销售统一发票
        'k21': '21'
    };
    return dict['k' + type] || -1;
}

export function getInvoiceTypeName(invoiceType, flag = 'fpy') {
    if (flag === 'fpy') {
        invoiceType = parseInt(invoiceType);
        const index = fpyInvoiceTypes.indexOf(invoiceType);
        return index === -1 ? -1 : invoiceTypeNames[index];
    }
    const index = govInvoiceTypes.indexOf(invoiceType);
    return index === -1 ? -1 : invoiceTypeNames[index];
}

// 返回-1则表示不存在非法的发票类型，否则存在不支持的发票类型
export function checkInvoiceTyes(invoiceTypes = []) {
    let result = -1;
    for (let i = 0; i < invoiceTypes.length; i++) {
        if (fpyInvoiceTypes.indexOf(parseInt(invoiceTypes[i])) === -1) {
            result = i;
            break;
        }
    }
    return result;
}

export function checkCategories(categories = []) {
    let result = -1;
    for (let i = 0; i < categories.length; i++) {
        if (jxxTypes.indexOf(parseInt(categories[i])) === -1) {
            result = i;
            break;
        }
    }
    return result;
}

export function transformInvoiceTypeToFpy(invoiceType) {
    const index = govInvoiceTypes.indexOf(invoiceType);
    if (index !== -1) {
        return fpyInvoiceTypes[index];
    }
    return -1;
}

export function transformInvoiceTypesToFpy(invoiceTypes) {
    const result = [];
    for (let i = 0; i < invoiceTypes.length; i++) {
        const curType = invoiceTypes[i];
        const index = govInvoiceTypes.indexOf(curType);
        if (index !== -1) {
            result.push(fpyInvoiceTypes[index]);
        }
    }
    return result;
}

export function transformInvoiceTypeToGov(invoiceType) {
    const curType = parseInt(invoiceType);
    const index = fpyInvoiceTypes.indexOf(curType);
    if (index !== -1) {
        return govInvoiceTypes[index];
    }
    return -1;
}

export function transformInvoiceTypesToGov(invoiceTypes, filterFlag) {
    const result = [];
    for (let i = 0; i < invoiceTypes.length; i++) {
        const type = transformInvoiceTypeToGov(invoiceTypes[i]);
        if (filterFlag) {
            if (type !== -1) {
                result.push(type);
            }
        } else {
            result.push(type);
        }
    }
    return result;
}

export function getInvoiceTypeByName(name, type = 'gov') {
    let invoiceType = '-1';
    if (name.indexOf('二手车') !== -1) {
        invoiceType = '15';
    } else if (name.indexOf('通行费') !== -1) {
        invoiceType = '14';
    } else if (name.indexOf('机动车') !== -1) {
        invoiceType = '03';
    } else if (name.indexOf('专用发票') !== -1) {
        invoiceType = '01';
    } else if (name.indexOf('海关') !== -1) {
        invoiceType = '17';
    } else if (name.indexOf('增值税普通发票') !== -1) {
        if (name.indexOf('电子') !== -1) {
            invoiceType = '10';
        } else if (name.indexOf('卷票') !== -1) {
            invoiceType = '11';
        } else {
            invoiceType = '04';
        }
    }

    if (invoiceType === -2) {
        return -1;
    }

    if (type === 'gov') {
        return invoiceType;
    }

    const index = govInvoiceTypes.indexOf(invoiceType);
    return fpyInvoiceTypes[index];
}

// 税局限制只能申请起止日期在相同月份，根据日期进行拆分
export function getSplitDowloadApplyOpt(opt = {}, nextFlag) {
    const { searchOpt, index = 0 } = opt;
    let nextIndex = index;
    let result = [];
    const startDate = moment(searchOpt.startDate, 'YYYY-MM-DD');
    const endDate = moment(searchOpt.endDate, 'YYYY-MM-DD');
    let nextDate = moment(searchOpt.startDate, 'YYYY-MM-DD');
    let goOnFlag = true;

    // 本身就在一个月不需要拆分
    if (searchOpt.endDate.substr(0, 7) === searchOpt.startDate.substr(0, 7)) {
        result = [searchOpt];
    } else {
        do {
            result.push({
                ...searchOpt,
                startDate: nextDate.startOf('month').diff(startDate, 'days') < 0 ? startDate.format('YYYY-MM-DD') : nextDate.format('YYYY-MM-01'),
                endDate: nextDate.endOf('month').diff(endDate, 'days') > 0 ? endDate.format('YYYY-MM-DD') : nextDate.endOf('month').format('YYYY-MM-DD')
            });

            nextDate = nextDate.add(1, 'month').startOf('month');
            if (nextDate.diff(endDate, 'days') > 0) {
                goOnFlag = false;
            }
        } while (goOnFlag);
    }

    if (nextFlag) {
        nextIndex = index + 1;
    }

    if (nextIndex < result.length) {
        return {
            index: nextIndex,
            list: result
        };
    }

    return {
        index: -1,
        list: result
    };
}

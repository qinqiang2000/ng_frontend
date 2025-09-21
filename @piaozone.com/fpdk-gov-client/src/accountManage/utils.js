import { invoiceTypes } from '@piaozone.com/pwyConstants';
import moment from 'moment';
const addedInvoiceTypes = invoiceTypes.ADDED_INVOICE_TYPES;

const getSeniorParam = (searchOpt) => {
    const { invoiceTime, collectTime, expendTime, authInvoiceDate, accountDate, ...otherOpt } = searchOpt;
    const invoiceType = searchOpt.invoiceType;
    let result = {
        ...otherOpt,
        accountDate: accountDate ? accountDate.format('YYYYMM') : '',
        invoiceTimeStart: invoiceTime && invoiceTime[0] ? invoiceTime[0].format('YYYY-MM-DD') : '', //发票日期起
        invoiceTimeEnd: invoiceTime && invoiceTime[1] ? invoiceTime[1].format('YYYY-MM-DD') : '', //发票日期止
        collectTimeStart: collectTime && collectTime[0] ? collectTime[0].format('YYYY-MM-DD') : '', //采集日期起
        collectTimeEnd: collectTime && collectTime[1] ? collectTime[1].format('YYYY-MM-DD') : '',
        expendStartTime: expendTime && expendTime[0] ? expendTime[0].format('YYYY-MM-DD') : '', //审核通过时间
        expendEndTime: expendTime && expendTime[1] ? expendTime[1].format('YYYY-MM-DD') : '',
        authStartTime: authInvoiceDate && authInvoiceDate[0] ? authInvoiceDate[0].format('YYYY-MM-DD') : '', // 认证日期
        authEndTime: authInvoiceDate && authInvoiceDate[1] ? authInvoiceDate[1].format('YYYY-MM-DD') : '' // 认证日期
    };

    if (invoiceType !== '' && addedInvoiceTypes.indexOf(invoiceType) === -1) {
        result = {
            ...result,
            invoiceCode: '',
            invoiceNo: '',
            salerName: '',
            invoiceStatus: '',
            isFauthenticate: '',
            authStartTime: '',
            authEndTime: '',
            signOptionValue: '',
            equalNameValue: ''
        };
    }
    return result;
};

const getRecommendParam = (searchOpt) => {
    const { collectDateOfMonth, invoiceDateOfMonth, ...otherOpt } = searchOpt;
    const result = {
        ...otherOpt,
        collectDateOfMonth: collectDateOfMonth ? collectDateOfMonth.format('YYYYMM') : '',
        invoiceDateOfMonth: invoiceDateOfMonth ? invoiceDateOfMonth.format('YYYYMM') : ''
    };
    return result;
};

const viditSeniorQuery = (searchOpt) => {
    const optResult = getSeniorParam(searchOpt);
    const {
        expendStartTime = '',
        expendEndTime = '',
        collectTimeStart = '',
        collectTimeEnd = '',
        invoiceTimeStart = '',
        invoiceTimeEnd = ''
    } = optResult;
    return new Promise((resolve, reject) => {
        if (collectTimeStart === '' && invoiceTimeStart === '' && expendStartTime === '') {
            resolve({ errcode: '0001', description: '采集日期，开票日期，审核通过时间不能同时为空' });
        } else if (!collectTimeStart) { // 采集时间为空
            if (!expendStartTime && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                resolve({ errcode: '0001', description: '数据过多, 开票日期跨度不能大于31天' });
            } else if (!invoiceTimeStart && moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31) {
                resolve({ errcode: '0001', description: '数据过多, 审核通过时间跨度不能大于31天' });
            } else if (
                moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31 &&
                moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31
            ) {
                resolve({ errcode: '0001', description: '数据过多, 开票日期和审核通过时间跨度不能同时大于31天' });
            }
        } else if (!invoiceTimeStart) { // 开票日期为空
            if (!expendStartTime && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                resolve({ errcode: '0001', description: '数据过多, 采集日期跨度不能大于31天' });
            } else if (!collectTimeStart && moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31) {
                resolve({ errcode: '0001', description: '数据过多, 审核通过时间跨度不能大于31天' });
            } else if (
                (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
                (moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31)
            ) {
                resolve({ errcode: '0001', description: '数据过多, 采集日期和审核通过时间跨度不能同时大于31天' });
            }
        } else if (!expendStartTime) { // 审核报销时间为空
            if (!invoiceTimeStart && moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                resolve({ errcode: '0001', description: '数据过多, 采集日期跨度不能大于31天' });
            } else if (!collectTimeStart && moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) {
                resolve({ errcode: '0001', description: '数据过多, 开票日期跨度不能大于31天' });
            } else if (
                (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
                (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31)
            ) {
                resolve({ errcode: '0001', description: '数据过多, 采集日期和开票日期跨度不能同时大于31天' });
            }
        } else if ( // 采集日期、开票日期都不为空
            (moment(collectTimeEnd, 'YYYY-MM-DD').diff(moment(collectTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
            (moment(invoiceTimeEnd, 'YYYY-MM-DD').diff(moment(invoiceTimeStart, 'YYYY-MM-DD'), 'days') > 31) &&
            (moment(expendEndTime, 'YYYY-MM-DD').diff(moment(expendStartTime, 'YYYY-MM-DD'), 'days') > 31)
        ) {
            resolve({ errcode: '0001', description: '数据过多, 采集日期、开票日期、审核通过时间跨度不能同时大于31天' });
        }
        resolve({ errcode: '0000', description: '成功', data: optResult });
    });
};


const viditRecommendQuery = (searchOpt) => {
    const optResult = getRecommendParam(searchOpt);
    const {
        collectDateOfMonth,
        invoiceDateOfMonth
    } = optResult;
    return new Promise((resolve, reject) => {
        if (collectDateOfMonth === '' && invoiceDateOfMonth === '') {
            resolve({ errcode: '0001', description: '采集月份和开票月份不能同时为空' });
        }
        resolve({ errcode: '0000', description: '成功', data: optResult });
    });
};

export const checkParam = async(opt, type) => {
    if (type === 'senior') {
        const res = await viditSeniorQuery(opt);
        return res;
    } else {
        const res = await viditRecommendQuery(opt);
        return res;
    }
};

export const getSearchOpt = (opt, type) => {
    if (type === 'senior') {
        const res = getSeniorParam(opt);
        return res;
    } else {
        const res = getRecommendParam(opt);
        return res;
    }
};

const checkRecommendTime = (searchOpt) => {
    let errMsg = '';
    let disabledLoad = false;
    const { collectDateOfMonth, invoiceDateOfMonth } = searchOpt;
    if (!collectDateOfMonth && !invoiceDateOfMonth) {
        disabledLoad = true;
        errMsg = '采集月份和开票月份不能都为空';
    }
    if (disabledLoad) {
        return { errcode: '3001', description: errMsg };
    }
    return {
        errcode: '0000',
        description: 'success'
    };
};

const checkSeniorTime = (searchOpt) => {
    let errMsg = '';
    let disabledLoad = false;
    const { invoiceTime, collectTime, expendTime } = searchOpt;
    if (!invoiceTime[0] && !collectTime[0] && !expendTime[0]) {
        disabledLoad = true;
        errMsg = '采集日期、开票日期、审核通过时间不能都为空';
    } else {
        let invoiceTimeTxt = '';
        let collectTimeTxt = '';
        let expendTimeTxt = '';
        if (invoiceTime[0]) {
            if (invoiceTime[1].diff(invoiceTime[0], 'days') > 31) {
                invoiceTimeTxt = '开票日期、';
                disabledLoad = true;
            }
        }
        if (collectTime[0]) {
            if (collectTime[1].diff(collectTime[0], 'days') > 31) {
                collectTimeTxt = '采集日期、';
                disabledLoad = true;
            }
        }

        if (expendTime[0]) {
            if (expendTime[1].diff(expendTime[0], 'days') > 31) {
                expendTimeTxt = '审核通过时间';
                disabledLoad = true;
            }
        }
        errMsg = invoiceTimeTxt + collectTimeTxt + expendTimeTxt + '的起止日期不能超过一个月';
    }
    if (disabledLoad) {
        return { errcode: '3001', description: errMsg };
    }
    return {
        errcode: '0000',
        description: 'success'
    };
};

export const checkSelectTime = (searchOpt, type) => {
    if (type === 'senior') {
        const res = checkSeniorTime(searchOpt);
        return res;
    } else {
        const res = checkRecommendTime(searchOpt);
        return res;
    }
};
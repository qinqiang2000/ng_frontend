import { invoiceTypes } from '@piaozone.com/pwyConstants';

const { INPUT_INVOICE_TYPES_DICT, INPUT_INVOICE_TYPES } = invoiceTypes;
export const invoiceStatusArr = [
    { value: '', text: '全部', checked: true },
    { value: 0, text: '正常' },
    { value: 3, text: '红冲' },
    { value: 2, text: '作废' },
    { value: 1, text: '失控' },
    { value: 4, text: '异常' },
    { value: 6, text: '红字发票待确认' },
    { value: 7, text: '部分红冲' },
    { value: 8, text: '全额红冲' }
];

export const expendStatusArr = [{
    value: '',
    text: '全部',
    checked: true
}, {
    value: 1,
    text: '未报销'
}, {
    value: 30,
    text: '审核中'
}, {
    value: 60,
    text: '已报销未入账'
}, {
    value: 65,
    text: '已报销已入账'
}];

export const authenticateFlagArr = [{
    value: 0,
    text: '未勾选',
    checked: true
}, {
    value: 1,
    text: '已勾选'
}];

export const originalStateArr = [{
    value: '',
    text: '全部',
    checked: true
}, {
    value: 0,
    text: '否'
}, {
    value: 1,
    text: '是'
}];

export const transportDeductionArr = [{
    value: '',
    text: '全部',
    checked: true
}, {
    value: 0,
    text: '否'
}, {
    value: 1,
    text: '是'
}];

export const createAccountDate = (len) => {
    const entryDate = [{
        text: '全部',
        value: '',
        checked: true
    }];
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 1); //获取到当前月份, 设置月份
    for (var i = 0; i < len; i++) {
        date.setMonth(date.getMonth() - 1); //每次循环一次, 月份值减1
        var m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m + '';
        entryDate.push({ checked: false, value: date.getFullYear() + m, text: date.getFullYear() + '/' + m });
    }
    return entryDate;
};

export const getDkgxSearchInvoiceTypes = (dkgxFlag = 1) => {
    const fullInvoiceInfoTypes = [];
    for (let i = 0; i < INPUT_INVOICE_TYPES.length; i++) {
        const item = INPUT_INVOICE_TYPES[i];
        if (item.allowDeduction === 1 && item.value !== 11) {
            if (dkgxFlag === 1 && item.allowGovdk === 1) { // 税局发票种类
                fullInvoiceInfoTypes.push({
                    checked: false,
                    ...item
                });
            } else if (dkgxFlag === 2 && item.allowGovdk !== 1) { // 非税局发票种类
                fullInvoiceInfoTypes.push({
                    checked: false,
                    ...item
                });
            }
        }
    }
    const fullInvoiceTypes = [];
    const govDkInvoiceTypes = [];
    const trafficInvoiceTypes = [];
    for (let i = 0; i < fullInvoiceInfoTypes.length; i++) {
        const item = fullInvoiceInfoTypes[i];
        fullInvoiceTypes.push(item.value);
        if (item.allowGovdk === 1) {
            govDkInvoiceTypes.push(item.value);
        } else {
            trafficInvoiceTypes.push(item.value);
        }
    }
    return {
        govDkInvoiceTypes,
        fullInvoiceTypes,
        trafficInvoiceTypes,
        fullInvoiceInfoTypes: [{ text: '全部', value: '', checked: true }].concat(fullInvoiceInfoTypes)
    };
};

export const getAllowGovDkTypes = (selectTypes) => {
    const types = selectTypes.split(',');
    const result = [];
    for (let i = 0; i < types.length; i++) {
        if (INPUT_INVOICE_TYPES_DICT['k' + types[i]] && INPUT_INVOICE_TYPES_DICT['k' + types[i]].allowGovdk) {
            result.push(types[i]);
        }
    }
    return result.join(',');
};


export const getCheckedValue = (data = [], returnType = 'string') => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.checked) {
            result.push(item.value);
        }
    }
    if (returnType === 'string') {
        return result.join(',');
    }
    return result;
};


export const getChangeOpt = (searchOpt = {}, k, info, flag) => {
    let newOpt = { ...searchOpt };
    let newArr = [];
    const curArr = searchOpt[k];
    if (flag === 'single') { // 单选控制
        if (!info.checked) {
            newArr = curArr.map((item) => {
                return {
                    ...item,
                    checked: info.value === item.value
                };
            });
            newOpt = {
                ...searchOpt,
                [k]: newArr
            };
        }
    } else if (typeof info.text !== 'undefined' && typeof info.value !== 'undefined') { // 多选控制
        let selectAllFlag = false;
        if (info.value === '') {
            selectAllFlag = true;
        } else {
            selectAllFlag = false;
        }
        let isChecked = false;
        for (let i = 0; i < curArr.length; i++) {
            const item = curArr[i];
            let checkFlag;
            if (selectAllFlag) {
                checkFlag = (item.value === info.value);
            } else {
                checkFlag = item.value === info.value ? !info.checked : (item.value === '' ? false : item.checked);
            }
            if (checkFlag) {
                isChecked = true;
            }
            newArr.push({
                ...item,
                checked: checkFlag
            });
        }
        // 都取消的时候，自动将全部进行勾选
        if (!isChecked && newArr[0].value === '') {
            newArr[0].checked = true;
        }
        newOpt = {
            ...searchOpt,
            [k]: newArr
        };
    } else {
        newOpt = {
            ...searchOpt,
            [k]: info
        };
    }
    return newOpt;
};

export const getRecomentChecked = (recomment, searchOpt) => {
    const commentKeys = Object.keys(recomment);
    let checkResult = true;
    for (let i = 0; i < commentKeys.length; i++) {
        const curKey = commentKeys[i];
        if (!checkResult) {
            break;
        }
        for (let j = 0; j < searchOpt[curKey].length; j++) {
            if (searchOpt[curKey][j].checked) {
                if (recomment[curKey].indexOf(searchOpt[curKey][j].value) === -1) {
                    checkResult = false;
                    break;
                }
            }
        }
    }
    return checkResult;
};

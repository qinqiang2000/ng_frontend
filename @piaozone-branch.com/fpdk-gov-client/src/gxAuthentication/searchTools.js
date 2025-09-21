import moment from 'moment';

export const initSearchOpt = {
    preSelector: '',
    gxzt: '0',
    fpzt: '0',
    fpdm: '',
    fphm: '',
    salerName: '',
    collectUser: '',
    isEntryVoucher: '1', // 0未入凭证、1入凭证
    accountDate: '',
    fplx: '01',
    rangeDate: [moment().startOf('month'), moment()],
    gxDate: [moment().startOf('month'), moment()],
    collectorTime: [moment().startOf('month'), moment()]
};

export const customsInitSearchOpt = {
    customDeclarationNo: '',
    deptName: '',
    declareNo: '',
    preSelector: '',
    gxzt: '0',
    fpzt: '0',
    collectUser: '',
    isEntryVoucher: '1', // 0未入凭证、1入凭证
    accountDate: '',
    fplx: '21',
    rangeDate: [moment().startOf('month'), moment()],
    collectorTime: [moment().startOf('month'), moment()]
};

export const getSearchOpt = function(searchOpt) {
    const { collectUser, fplx, rangeDate, fpzt, gxzt, gxDate, collectorTime, isEntryVoucher, accountDate, ...other } = searchOpt;
    let rq_q = '';
    let rq_z = '';
    if (rangeDate[0]) {
        rq_q = rangeDate[0].format('YYYY-MM-DD');
        rq_z = rangeDate[1].format('YYYY-MM-DD');
    }
    let gxStartTime = '';
    let gxEndTime = '';
    if (gxDate) {
        gxStartTime = gxDate[0] ? gxDate[0].format('YYYY-MM-DD') : '';
        gxEndTime = gxDate[1] ? gxDate[1].format('YYYY-MM-DD') : '';
    }
    const createStartTime = collectorTime[0] ? collectorTime[0].format('YYYY-MM-DD') : '';
    const createEndTime = collectorTime[1] ? collectorTime[1].format('YYYY-MM-DD') : '';

    return {
        ...other,
        preSelector: searchOpt.preSelector || '',
        accountDate,
        isEntryVoucher,
        fpzt,
        rzzt: '0',
        gxzt,
        collectUser,
        fplx,
        rq_q,
        rq_z,
        gxStartTime,
        gxEndTime,
        createStartTime,
        createEndTime
    };
};

export const entryDateFun = function() {
    var entryDate = [{ checked: false, value: 'all', text: '全部' }];
    var data = new Date();
    data.setMonth(data.getMonth() + 1, 1); //获取到当前月份,设置月份
    for (var i = 0; i < 12; i++) {
        data.setMonth(data.getMonth() - 1); //每次循环一次 月份值减1
        var m = data.getMonth() + 1;
        m = m < 10 ? '0' + m : m + '';
        entryDate.push({ checked: false, value: data.getFullYear() + m, text: data.getFullYear() + '/' + m });
    }
    return entryDate;
};

export const changeSearchOpt = function(initOpt) {
    const searchOpt = {
        ...getSearchOpt(initOpt),
        deductionPurpose: initOpt.gxzt === '0' ? '' : '1' //1抵扣，2不抵扣
    };
    let fplx = initOpt.fplx;
    if (fplx === '-1') {
        fplx = '';
    } else if (fplx === '01') {
        fplx = '4';
    } else if (fplx === '03') {
        fplx = '12';
    } else if (fplx === '10') {
        fplx = '2';
    } else if (fplx === '14') {
        fplx = '15';
    }

    let gxzt = initOpt.gxzt || '';
    gxzt = gxzt.toString();

    const param = {
        preSelector: searchOpt.preSelector,
        moduleType: '1', //通过勾选模块去查询，减少票种范围
        deductionPurpose: searchOpt.deductionPurpose || '', //抵扣用途
        collectorEndTime: searchOpt.collectorEndTime || '',
        collectorStartTime: searchOpt.collectorStartTime || '',
        startTime: gxzt === '0' ? searchOpt.rq_q : '',
        endTime: gxzt === '0' ? searchOpt.rq_z : '',
        startSelectTime: gxzt === '1' ? searchOpt.rq_q : '',
        endSelectTime: gxzt === '1' ? searchOpt.rq_z : '',
        preSelectTimeStart: gxzt === '5' ? searchOpt.rq_q : '',
        preSelectTimeEnd: gxzt === '5' ? searchOpt.rq_z : '',
        startAuthTime: searchOpt.startAuthTime || '',
        endAuthTime: searchOpt.endAuthTime || '',
        equalNameValue: searchOpt.equalNameValue || '',
        expendStatus: searchOpt.expendStatus || '',
        invoiceCode: searchOpt.fpdm || '',
        invoiceNo: searchOpt.fphm || '',
        invoiceStatus: searchOpt.fpzt == -1 ? '' : searchOpt.fpzt,
        isEqualsName: searchOpt.isEqualsName || '', //发票抬头是否一致， 1是，2否
        isSign: searchOpt.isSign || '', //纸票是否签收 1是，2否
        salerName: searchOpt.salerName || '', //销方名称
        isFauthenticate: gxzt === '-1' ? '4' : gxzt, // 0:未勾选，1勾选，2勾选认证，3扫描认证  4 未勾选和勾选合并数据
        type: fplx,
        isEntryVoucher: searchOpt.isEntryVoucher,
        accountDate: searchOpt.accountDate
    };
    return param;
};
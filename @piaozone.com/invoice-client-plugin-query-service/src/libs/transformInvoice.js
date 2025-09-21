/* eslint-disable */
import { getInvoiceType } from './tools';
// import log from '$logs/index';

//0:正常、1：失控、2：作废、3：红冲、4：异常
export function changeInvoiceStatus(govStatus) {
    if (govStatus.indexOf('正常') !== -1) {
        return '0';
    } else if (govStatus.indexOf('失控') !== -1) {
        return '1';
    } else if (govStatus.indexOf('作废') !== -1) {
        return '2';
    } else if (govStatus.indexOf('全额红冲') !== -1 || govStatus.indexOf('全额冲红') !== -1) {
        // return '8';
        return '3'; // 各个erp可能还没有兼容好全额红冲新值，返回红冲字段
    } else if (govStatus.indexOf('部分红冲') !== -1 || govStatus.indexOf('部分冲红') !== -1) {
        return '7';
    } else if (govStatus.indexOf('红冲') !== -1 || govStatus.indexOf('冲红') !== -1) {
        return '3';
    } else {
        return '4';
    }
}

export function changeInvoiceNewStatus(govStatus) {
    if (govStatus === 'hzdqr') { // 红票待确认
        return '9';
    }
    return govStatus;
}

//转换税局的发票类型
export function changeInvoiceType(type, fpdm) {
    type = type.trim();
    if (fpdm === '' || fpdm === '全电发票' || fpdm === '数电票') {
        if (type === '08') {
            return 27;
        }
    }
    if (type === '01' || type === '增值税专用发票') {
        return 4;
    } else if (type === '03' || type === '机动车发票') {
        return 12;
    } else if (type === '14' || type === '通行费电子发票') {
        return 15;
    } else if (type === '08' || type === '增值税电子专用发票') {
        return 2; // 电子专票
    } else if (type === '08xdpzz' || type === '纸质发票（增值税专用发票）') { // 数电票类型
        return 4;
    } else if (type === '08xdp' || type === '电子发票（增值税专用发票）') { // 数电票-增值税专用发票
        return 27;
    } else if (fpdm) {
        return getInvoiceType(fpdm);
    } else {
        return type;
    }
    return type;
}


// 抵扣用途
export function changeDkyt(data) {
    let dkFlag = '';
    if (data == '1' || data == '4') { //用于抵扣
        dkFlag = '1';
    } else if (data == '6') { //不抵扣
        dkFlag = '2';
    } else if (data == '2') { //用于退税
        dkFlag = '3';
    } else if (data == '3' || data == '5') { //用于代办退税
        dkFlag = '4';
    } else if (data == '8') { // 未准予代办退税
        dkFlag = '5';
    } else if (data == '7') { // 未准予退税
        dkFlag = '6';
    }
    return dkFlag;
}

export function transformData(allData, rzzt, skssq) {
    var tax_period = ''; //认证属期
    if (rzzt == '1') {
        skssq = decodeURIComponent(skssq);
        tax_period = skssq.split(';')[0];
    }

    return {
        invoiceCode: allData[1], //发票代码
        invoiceType: getInvoiceType(allData[1]), //进项只会有纸质专票
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        invoiceStatus: allData[7], //发票状态
        checkFlag: allData[8], //是否勾选
        selectTime: allData[9] || '', //勾选时间
        checkAuthenticateFlag: allData[10] || '0', //是否勾选认证
        selectAuthenticateTime: allData[11] || '', //勾选认证时间
        scanAuthenticateFlag: allData[12] || '0', //是否扫码认证
        scanAuthenticateTime: allData[13] || '', //扫码认证时间
        salerTaxNo: allData[14], //销方税号
        taxPeriod: tax_period
    };
}

export function transOldRzformData(allData) {
    return {
        invoiceCode: allData[1], //发票代码
        invoiceType: getInvoiceType(allData[1]), //进项只会有纸质专票
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        invoiceStatus: allData[7] == '0' ? '0' : '0', //发票状态
        checkFlag: '0', //是否勾选
        selectTime: '', //勾选时间
        checkAuthenticateFlag: '0', //是否勾选认证
        selectAuthenticateTime: '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        salerTaxNo: allData[8] || '' //销方税号
    };
}

export function transRzformData(allData, rzyf) {
    return {
        invoiceCode: allData[1], //发票代码
        invoiceType: getInvoiceType(allData[1]), //进项只会有纸质专票
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        invoiceStatus: allData[10] === '正常' ? '0' : '0', //发票状态
        checkFlag: '0', //是否勾选
        selectTime: '', //勾选时间
        checkAuthenticateFlag: allData[7] === '勾选认证' ? '1' : '0', //是否勾选认证
        selectAuthenticateTime: allData[7] === '勾选认证' ? allData[8] : '', //勾选认证时间
        scanAuthenticateFlag: allData[7] === '扫描认证' ? '1' : '0', //是否扫码认证
        scanAuthenticateTime: allData[7] === '扫描认证' ? allData[8] : '', //扫码认证时间
        salerTaxNo: allData[11], //销方税号
        taxPeriod: rzyf
    };
}

// 未到期发票
export function wdqTransformData(allData, otherInfo = {}) {
    return {
        invoiceType: changeInvoiceType(allData[7], allData[1]), //转换为发票云发票类型
        invoiceCode: allData[1], //发票代码
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        invoiceStatus: changeInvoiceNewStatus(allData[8]), //发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
        checkFlag: '0', //是否勾选
        deductionPurpose: '', //抵扣勾选标志
        effectiveTaxAmount: allData[6],
        selectTime: '', //勾选时间
        manageStatus: allData[9],
        authenticateFlag: '0', // 统一勾选及认证标志
        checkAuthenticateFlag: '0', //是否勾选认证
        selectAuthenticateTime: '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        salerTaxNo: '', //销方税号
        taxPeriod: '',
        ...otherInfo
    };
}

//未勾选和已勾选数据格式
/* eslint-disable */
//["0=0=0", "3302184130", "11591819", "2019-10-31", "金蝶软件（中国）有限公司", "11320.75", "679.25", "0=679.25", "0", "01", "1", "0", "-", "0", "<a onclick=cxFpmx('3302184130','11591819','2019-10-31','01','kR%2BDzkhdzkMKLWsN4xXNjnw217%2F6461%2BRGwe9ZG3jrs%3D','宁波市国际贸易投资发展有限公司宁波泛太平洋大酒店','0'); href='javascript:void(0);'><font color=red>查看明细信息</a>", "+s9hJYBzAADrmS16kaqKsA=="]
//["1=0=0", "4403183130", "14190538", "2019-03-29", "金蝶软件（中国）有限公司", "6206.9", "993.1", "1=993.1", "0", "01", "1", "1", "2019-10-31 14:41:46", "0", "<a onclick=cxFpmx('4403183130','14190538','2019-03-29','01','no%2BFMSOf1rNNriK0ETqxLzt0z2xdavv2MedWLfltuHI%3D','金蝶软件（中国）有限公司','0'); href='javascript:void(0);'><font color=red>查看明细信息</a>", "XfuOYY1CDwc4fOZYRsCrYQ=="],
/* eslint-disable */
export function dkgxQueryTransformData(allData, skssq, otherInfo = {}) {
    var tax_period = '';
    var checkFlag = allData[11] == 0 ? '0' : '1';
    if (checkFlag === '1') {
        skssq = decodeURIComponent(skssq);
        tax_period = skssq.split(';')[0];
    }
    const yxseArr = allData[7].split('=');
    return {
        invoiceType: changeInvoiceType(allData[9], allData[1]), //转换为发票云发票类型
        invoiceCode: allData[1] === '全电发票' || allData[1] === '数电票' ? '' : allData[1], //发票代码
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        salerTaxNo: '', //销方税号
        invoiceStatus: changeInvoiceNewStatus(allData[8]), //发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
        refreshStatus: true, // 明确刷新勾选及认证状态
        checkFlag, //是否勾选
        deductionPurpose: checkFlag == '0' ? '' : '1', //抵扣勾选标志
        effectiveTaxAmount: checkFlag == '0' ? allData[6] : yxseArr[1],
        // effectiveTaxAmount: yxseArr[1],   // 使用税局的有效可抵扣税额作为有效税额
        selectTime: checkFlag == '0' ? '' : allData[12] || '', //勾选时间
        manageStatus: allData[13],
        authenticateFlag: checkFlag == '0' ? 0 : 1, // 统一勾选及认证标志
        checkAuthenticateFlag: '0', //是否勾选认证
        selectAuthenticateTime: '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        taxPeriod: tax_period,
        ...otherInfo
    };
}

//['0=0=0', "3302184130", "11591819", "2019-10-31", "宁波市国际贸易投资发展有限公司", "11320.75", "679.25", "0", "01", "1", "0", "0=-", "0", "<a onclick=cxFpmx('3302184130','11591819','2019-10-31','01','kR%2BDzkhdzkMKLWsN4xXNjn7mxdfJEl504OwEiBW153g%3D','宁波市国际贸易投资发展有限公司宁波泛太平洋大酒店','0'); href='javascript:void(0);'><font color=red>查看明细信息</a>"]
//["1=0",   "4403221130", "04230141", "2022-08-16", "深圳市恒鑫运科技有限公司",       "4141.89",  "248.51", "1", "0",  "01", "1", "1", "1=2022-08-17 14:17:44","0","<a onclick=cxFpmx('4403221130','04230141','2022-08-16','01','9144030067188445XC','深圳市恒鑫运科技有限公司','0','0'); href='javascript:void(0);'><font color=red>查看明细信息</a>"]
//不抵扣勾选查询
export function bdkgxQueryTransformData(allData, skssq, otherInfo = {}) {
    var tax_period = '';
    var t = allData[12].split('=');
    if (t[0] !== '0') {
        skssq = decodeURIComponent(skssq);
        tax_period = skssq.split(';')[0];
    }
    return {
        invoiceType: changeInvoiceType(allData[9], allData[1]), //转换为发票云发票类型
        invoiceCode: allData[1] === '全电发票' || allData[1] === '数电票' ? '' : allData[1], //发票代码
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        effectiveTaxAmount: allData[6], //税额
        invoiceStatus: changeInvoiceNewStatus(allData[8]), //发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
        manageStatus: allData[13],
        refreshStatus: true, // 通知后台刷新勾选状态
        deductionPurpose: t[0] === '0' ? '' : '2', //不抵扣勾选标志
        checkFlag: t[0] === '0' ? '0' : '1', //是否勾选
        selectTime: t[0] === '0' ? '' : t[1], //勾选时间
        authenticateFlag: t[0] === '0' ? 0 : 1,
        checkAuthenticateFlag: '0', //是否勾选认证
        selectAuthenticateTime: '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        salerTaxNo: '', //销方税号
        taxPeriod: tax_period,
        ...otherInfo
    };
}

//抵扣统计
export function lssqTransformData(allData, rzyf, otherInfo = {}) {
    const dkFlag = allData[10] === '抵扣' ? '1' : '2'; //抵扣或不抵扣
    let invoiceType = allData[9].indexOf('机动车') !== -1 ? 12 : getInvoiceType(allData[1]);
    if (allData[2] && allData[2].length === 20) {
        invoiceType = 27;
    }
    return {
        invoiceType: invoiceType, //进项只会有纸质专票
        invoiceCode: allData[1] === '全电发票' || allData[1] === '数电票' ? '' : allData[1], //发票代码
        invoiceNo: allData[2], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        invoiceAmount: allData[5], //不含税金额
        taxAmount: allData[6], //税额
        totalTaxAmount: allData[6], //税额
        effectiveTaxAmount: allData[7],
        deductionPurpose: dkFlag,
        invoiceStatus: changeInvoiceStatus(allData[11]), //税局返回中文，需要转换wi发票云格式，0:正常、1：失控、2：作废、3：红冲、4：异常
        manageStatus: allData[12] === '正常' ? '0' : '1', //管理状态，0正常，1异常
        checkFlag: '1', //是否勾选
        refreshStatus: true, // 通知后台刷新勾选状态
        authenticateFlag: 2, //勾选认证
        selectTime: allData[8] || '', //勾选时间
        checkAuthenticateFlag: '1', //是否勾选认证
        selectAuthenticateTime: allData[8] || '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        salerTaxNo: '', //销方税号
        taxPeriod: rzyf,
        ...otherInfo
    };
}

// 单票查询
export function dpTransformData(allData, otherInfo = {}) {
    //1抵扣 2不抵扣 3用于退税 4用于代办退税 5未准予代办退税 6未准予退税
    const dkFlag = changeDkyt(allData[18]);
    return {
        invoiceType: changeInvoiceType(allData[2], allData[0]),
        invoiceCode: allData[1].length === 20 ? '' : allData[0], //发票代码，数电票没有发票代码
        invoiceNo: allData[1], //发票号码
        invoiceDate: allData[3], //开票日期
        salerName: allData[4], //销方名称
        salerTaxNo: allData[5], //销方税号
        invoiceAmount: allData[7], //不含税金额
        taxAmount: allData[8], //税额
        totalTaxAmount: allData[8], //税额
        effectiveTaxAmount: allData[17], //有效税额
        deductionPurpose: dkFlag,
        refreshStatus: true, // 通知后台刷新勾选状态
        invoiceStatus: allData[9], //需要转换为发票云格式，0:正常、1：失控、2：作废、3：红冲、4：异常
        manageStatus: allData[19], //管理状态，0正常，1异常
        checkFlag: allData[12], //是否勾选
        selectTime: allData[12] == '0' ? '' : allData[13], //勾选时间
        authenticateFlag: allData[15].length > 3 ? 2 : (allData[12] == '0' ? 0 : 1), //勾选及认证
        checkAuthenticateFlag: allData[15].length > 3 ? 1 : 0, //是否勾选认证
        selectAuthenticateTime: allData[15] || '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        taxPeriod: allData[6],
        ...otherInfo
    };
}

// 抵扣勾选采集海关缴款书
export function dkgxJksTransformData(allData) {
    return {
        customDeclarationNo: allData[1], // 缴款书号码
        invoiceDate: allData[2], // 填发日期
        taxAmount: allData[3], //税款金额
        totalTaxAmount: allData[3], //税款金额
        effectiveTaxAmount: allData[4], //有效税款金额
        authenticateFlag: allData[6] === '0' ? 0 : 1, // 是否勾选
        checkFlag: allData[6] === '0' ? 0 : 1, // 是否勾选
        selectTime: allData[6] == '0' ? '' : allData[7].split('=')[1], //勾选时间
        manageStatus: allData[8] === '0' ? 0 : 1, //管理状态，0正常，1异常
        sqhdzt: allData[9] === '0' ? 0 : 1, // 是否录入不符项
    };
}

// 抵扣统计
export function dktjJksTransformData(allData, tjyf) {
    return {
        customDeclarationNo: allData[1], // 缴款书号码
        invoiceDate: allData[2], // 填发日期
        taxAmount: allData[3], //税款金额
        totalTaxAmount: allData[3], //税款金额
        effectiveTaxAmount: allData[4], //有效税款金额
        authenticateFlag: 2, // 勾选、认证标志
        checkFlag: 1, // 是否勾选
        selectTime: allData[5], //勾选时间
        checkAuthenticateFlag: 1, //是否勾选认证
        selectAuthenticateTime: allData[5], //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        taxPeriod: tjyf,
        deductionPurpose: allData[6] === '抵扣' ? '1' : '2', // 抵扣和不抵扣
        manageStatus: allData[7] === '正常' ? 0 : 1, //管理状态，0正常，1异常
    };
}

// 未到期缴款书
export function wdqJksTransformData(allData) {
    return {
        customDeclarationNo: allData[1], // 缴款书号码
        invoiceDate: allData[2], // 填发日期
        taxAmount: allData[3], //税款金额
        totalTaxAmount: allData[3], //税款金额
        effectiveTaxAmount: allData[4], //有效税款金额
        authenticateFlag: 0, // 勾选、认证标志
        checkFlag: 0, // 是否勾选
        selectTime: '', //勾选时间
        checkAuthenticateFlag: 0, //是否勾选认证
        selectAuthenticateTime: '', //勾选认证时间
        scanAuthenticateFlag: '0', //是否扫码认证
        scanAuthenticateTime: '', //扫码认证时间
        taxPeriod: '',
        deductionPurpose: '', // 抵扣和不抵扣
        manageStatus: allData[7] === '正常' ? 0 : 1, //管理状态，0正常，1异常
    };
}
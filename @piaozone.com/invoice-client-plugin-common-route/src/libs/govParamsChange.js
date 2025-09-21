/* eslint-disable spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda,no-undef */
// import moment from 'moment';
// import errcodeInfo from '$client/errcodeInfo';
import { transformFpyType, transformGovType } from './etaxInvoiceType';

// 转换税局的发票类型
export function changeFpyInvoiceType(type = '') {
    if (type === '') {
        return '-1';
    }

    type = parseInt(type);
    if (type === 4) {
        return '01';
    } else if (type === 12) {
        return '03';
    } else if (type === 15) {
        return '14';
    } else if (type === 2) {
        return '08'; // 电子专票
    }
    return type;

}


export function changeEtaxQueryParam(opt) {
    const searchOpt = opt.searchOpt;
    if (typeof searchOpt !== 'object') {
        return errcodeInfo.argsErr;
    }
    const startTime = searchOpt.startTime || searchOpt.rq_q || '';
    const endTime = searchOpt.endTime || searchOpt.rq_z || '';
    const salerTaxNo = searchOpt.salerTaxNo || searchOpt.xfsbh || '';
    const invoiceCode = searchOpt.invoiceCode || searchOpt.fpdm || '';
    const invoiceNo = searchOpt.invoiceNo || searchOpt.fphm || '';
    const filterByInvoiceDate = !!searchOpt.filterByInvoiceDate;

    let invoiceType = -1;
    let authenticateFlags = '';
    let invoiceStatus = -1;
    const customDeclarationNo = searchOpt.customDeclarationNo;
    // 勾选时间
    const qrrzrq_q = searchOpt.qrrzrq_q || '';
    const qrrzrq_z = searchOpt.qrrzrq_z || '';

    // 新版不支持这个参数，只是为了兼容旧版参数，实际会返回空数组
    let manageStatus = typeof searchOpt.glzt === 'undefined' ? 0 : parseInt(searchOpt.glzt);
    if (manageStatus === -1) {
        manageStatus = 0;
    }
    if (!startTime || !endTime) {
        return {
            ...errcodeInfo.argsErr,
            description: '开票起止日期不能为空'
        };
    }

    if (startTime.length !== 10 || endTime.length !== 10) {
        return {
            ...errcodeInfo.argsErr,
            description: '开票起止日期格式错误，正确格式为YYYY-MM-DD'
        };
    }

    const curDateInt = parseInt(moment().format('YYYYMMDD'));

    // 大于今天
    if (parseInt(endTime.replace(/-/g, '')) > curDateInt) {
        return {
            ...errcodeInfo.argsErr,
            description: '参数错误，最大日期不能超过今天！'
        };
    }


    if (parseInt(endTime.replace(/-/g, '')) < parseInt(startTime.replace(/-/g, ''))) {
        return {
            ...errcodeInfo.argsErr,
            description: '参数错误，开始日期不能大于结束日期'
        };
    }

    /*
    if (moment(endTime).diff(moment(startTime), 'month') > 6) {
        return {
            ...errcodeInfo.argsErr,
            description: '参数错误，开票日期范围不能超过6个月'
        };
    }
    */

    invoiceType = searchOpt.invoiceType || -1;
    if (invoiceType !== -1) {
        if (transformFpyType(invoiceType) === -1) {
            return {
                ...errcodeInfo.argsErr,
                description: '发票类型暂时不支持，请检查！'
            };
        }
        invoiceType = parseInt(invoiceType);
    }
    // 新版参数
    if (typeof searchOpt.authenticateFlags !== 'undefined') {
        authenticateFlags = searchOpt.authenticateFlags || '';
        if (typeof searchOpt.invoiceStatus === 'undefined' || searchOpt.invoiceStatus === '') {
            invoiceStatus = -1;
        } else {
            invoiceStatus = parseInt(searchOpt.invoiceStatus);
        }
    } else {
        const rzzt = typeof searchOpt.rzzt === 'undefined' ? -1 : (searchOpt.rzzt === '' ? -1 : parseInt(searchOpt.rzzt));
        const gxzt = typeof searchOpt.gxzt === 'undefined' ? -1 : parseInt(searchOpt.gxzt);
        const rzfs = typeof searchOpt.rzfs === 'undefined' ? -1 : parseInt(searchOpt.rzfs);
        const tempArr = [];
        if (typeof searchOpt.fpzt === 'undefined' || searchOpt.fpzt === '') {
            invoiceStatus = -1;
        } else {
            invoiceStatus = parseInt(searchOpt.fpzt);
        }
        if (typeof searchOpt.fplx === 'undefined' || searchOpt.fplx === '') {
            invoiceType = -1;
        } else {
            invoiceType = transformGovType(searchOpt.fplx);
        }
        // 未认证
        if (rzzt === 0 || rzzt === -1) {
            if (gxzt === 0) {
                tempArr.push(0);
            } else if (gxzt === 1) {
                tempArr.push(1);
            } else if (gxzt === -1) {
                tempArr.push(0);
                tempArr.push(1);
            }
        }

        // 已认证
        if (rzzt === 1 || rzzt === -1) {
            if (rzfs === -1) {
                tempArr.push(2);
                tempArr.push(3);
            } else if (rzfs === 0) {
                tempArr.push(2);
            } else if (rzfs === 1) { // 扫描认证
                tempArr.push(3);
            }
        }
        if (tempArr.length === 0) {
            return {
                ...errcodeInfo.argsErr,
                description: '勾选认证参数异常，请检查'
            };
        }
        authenticateFlags = tempArr.join(',');
    }
    return {
        errcode: '0000',
        data: {
            ...opt,
            searchOpt: typeof searchOpt.customDeclarationNo !== 'undefined' ? {
                filterByInvoiceDate,
                authenticateFlags,
                invoiceStatus,
                startTime,
                endTime,
                customDeclarationNo,
                qrrzrq_q,
                qrrzrq_z,
                manageStatus
            } : {
                filterByInvoiceDate,
                invoiceCode,
                invoiceNo,
                salerTaxNo,
                authenticateFlags,
                invoiceStatus,
                invoiceType,
                startTime,
                endTime,
                qrrzrq_q,
                qrrzrq_z,
                manageStatus
            }
        }
    };
}

export function changeQueryInvoicesParam(opt) {
    const searchOpt = opt.searchOpt;
    if (typeof searchOpt !== 'object') {
        return {
            errcode: 'argsError',
            description: '查询参数为错误，请检查！'
        };
    }
    let authenticateFlags = searchOpt.authenticateFlags || searchOpt.authenticateFlag || '';
    let rzzt = '';
    let gxzt = '-1';
    let rzfs = '-1';
    if (typeof searchOpt.authenticateFlags !== 'undefined' || typeof searchOpt.authenticateFlag !== 'undefined') {
        if (authenticateFlags !== '') {
            authenticateFlags = authenticateFlags.split(',').map((n) => {
                return parseInt(n);
            });

            // 未认证和认证的标志都存在
            if ((authenticateFlags.indexOf(2) !== -1 ||
                    authenticateFlags.indexOf(3) !== -1) && (authenticateFlags.indexOf(0) !== -1 ||
                    authenticateFlags.indexOf(1) !== -1)
            ) {
                rzzt = '';
                if (authenticateFlags.indexOf(2) !== -1 && authenticateFlags.indexOf(3) !== -1) {
                    rzfs = '-1';
                } else if (authenticateFlags.indexOf(2) !== -1) { // 勾选认证
                    rzfs = '0';
                } else if (authenticateFlags.indexOf(3) !== -1) { // 扫描认证
                    rzfs = '1';
                }

                if (authenticateFlags.indexOf(0) !== -1 && authenticateFlags.indexOf(1) !== -1) { // 未认证未勾选和已勾选
                    gxzt = '-1';
                } else if (authenticateFlags.indexOf(0) !== -1) { // 未勾选
                    gxzt = '0';
                } else if (authenticateFlags.indexOf(1) !== -1) { // 未认证已勾选
                    gxzt = '1';
                }
            } else if (authenticateFlags.indexOf(2) !== -1 || authenticateFlags.indexOf(3) !== -1) { // 勾选认证或扫描认证
                rzzt = '1';
                if (authenticateFlags.indexOf(2) !== -1 && authenticateFlags.indexOf(3) !== -1) {
                    rzfs = '-1';
                } else if (authenticateFlags.indexOf(2) !== -1) { // 勾选认证
                    rzfs = '0';
                } else if (authenticateFlags.indexOf(3) !== -1) { // 扫描认证
                    rzfs = '1';
                }
            } else { // 未认证
                rzzt = '0';
                if (authenticateFlags.indexOf(0) !== -1 && authenticateFlags.indexOf(1) !== -1) { // 未认证未勾选和已勾选
                    gxzt = '-1';
                } else if (authenticateFlags.indexOf(0) !== -1) { // 未勾选
                    gxzt = '0';
                } else if (authenticateFlags.indexOf(1) !== -1) { // 未认证已勾选
                    gxzt = '1';
                }
            }
        }
    } else {
        rzzt = searchOpt.rzzt;
        gxzt = searchOpt.gxzt;
        rzfs = searchOpt.rzfs;
    }
    let rq_q;
    let rq_z;
    if (typeof searchOpt.rq_q !== 'undefined') {
        rq_q = searchOpt.rq_q;
    } else if (gxzt === '1' || gxzt === 1) {
        rq_q = searchOpt.gxStartTime || searchOpt.startTime || '';
    } else {
        rq_q = searchOpt.startTime || '';
    }

    if (typeof searchOpt.rq_z !== 'undefined') {
        rq_z = searchOpt.rq_z;
    } else if (gxzt === '1' || gxzt === 1) {
        rq_z = searchOpt.gxEndTime || searchOpt.endTime || '';
    } else {
        rq_z = searchOpt.endTime || '';
    }

    return {
        ...opt,
        dataIndex: opt.dataIndex ? parseInt(opt.dataIndex) : 0, // 统一转换为整数
        dataFromIndex: opt.dataFromIndex ? parseInt(opt.dataFromIndex) : 0, // 统一转换为整数
        searchOpt: {
            ...searchOpt,
            fpdm: searchOpt.invoiceCode || searchOpt.fpdm || '',
            fphm: searchOpt.invoiceNo || searchOpt.fphm || '',
            xfsbh: typeof searchOpt.xfsbh !== 'undefined' ? searchOpt.xfsbh : searchOpt.salerTaxNo || '',
            fpzt: typeof searchOpt.fpzt !== 'undefined' ? searchOpt.fpzt : searchOpt.invoiceStatus === '' ? '-1' : searchOpt.invoiceStatus,
            fplx: typeof searchOpt.fplx !== 'undefined' ? searchOpt.fplx : changeFpyInvoiceType(searchOpt.invoiceType),
            rq_q,
            rq_z,
            rzzt,
            gxzt,
            rzfs
        }
    };
}


export function changeDkgxParam(opt) {
    const invoices = opt.invoices || [];
    if (invoices.length > 0 && typeof opt.authenticateFlag !== 'undefined') {
        const fpdms = [];
        const fphms = [];
        const kprqs = [];
        const yxses = [];
        const ses = [];
        for (let i = 0; i < invoices.length; i++) {
            fpdms.push(invoices[i].invoiceCode || '');
            fphms.push(invoices[i].invoiceNo || '');
            kprqs.push(invoices[i].invoiceDate || '');
            yxses.push(invoices[i].effectiveTaxAmount || '');
            ses.push(invoices[i].totalTaxAmount || '');
        }

        return {
            fpdm: fpdms.join('='),
            fphm: fphms.join('='),
            kprq: kprqs.join('='),
            yxse: yxses.join('='),
            se: ses.join('='),
            zt: opt.authenticateFlag // 0, 1
        };
    }
    return opt;

}

export function changeEtaxDkgxParam(opt, dkFlag = 'dk') {
    const invoices = opt.invoices || [];
    let authenticateFlag = typeof opt.authenticateFlag === 'undefined' ? '' : opt.authenticateFlag;
    let isOldVersion = true;
    if (typeof opt.invoices !== 'undefined' && typeof opt.authenticateFlag !== 'undefined') {
        isOldVersion = false;
    }
    const resultList = [];
    if (isOldVersion) {
        if (!opt.fphm || !opt.kprq) {
            return errcodeInfo.argsErr;
        }
        const fpdms = opt.fpdm.split('=');
        const fphms = opt.fphm.split('=');
        const kprqs = opt.kprq.split('=');
        const ses = opt?.se?.split('=');
        const notDeductibleTypes = opt.notDeductibleTypes || [];
        let yxses;
        // 旧版不抵扣没有传有效税额，直接用税额代替
        if (dkFlag === 'bdk') {
            yxses = opt?.se?.split('=');
        } else {
            yxses = opt?.yxse?.split('=');
        }
        if (fphms.length !== kprqs.length) {
            return errcodeInfo.argsErr;
        }
        authenticateFlag = parseInt(opt.zt);
        if (authenticateFlag !== 0 && authenticateFlag !== 1) {
            return errcodeInfo.argsErr;
        }
        for (let i = 0; i < fphms.length; i++) {
            resultList.push({
                notDeductibleType: notDeductibleTypes[i],
                invoiceCode: fpdms[i] ? fpdms[i] : '',
                invoiceNo: fphms[i],
                invoiceDate: kprqs[i],
                effectiveTaxAmount: yxses ? yxses[i] : '',
                totalTaxAmount: ses ? ses[i] : '',
                authenticateFlag: opt.zt
            });
        }

    } else {
        if (authenticateFlag === '') {
            return errcodeInfo.argsErr;
        }
        authenticateFlag = parseInt(authenticateFlag);
        if (authenticateFlag !== 0 && authenticateFlag !== 1) {
            return errcodeInfo.argsErr;
        }


        for (let i = 0; i < invoices.length; i++) {
            resultList.push(invoices[i]);
        }
    }
    return {
        ...errcodeInfo.success,
        data: {
            authenticateFlag,
            invoices: resultList,
            clientType: opt.clientType,
            taxNo: opt.taxNo || ''
        }
    };
}


export function changeBdkgxParam(opt) {
    const invoices = opt.invoices || [];
    if (invoices.length > 0 && typeof opt.authenticateFlag !== 'undefined') {
        const fpdms = [];
        const fphms = [];
        const kprqs = [];
        const ses = [];
        const bdkyys = [];
        for (let i = 0; i < invoices.length; i++) {
            const curItem = invoices[i];
            fpdms.push(curItem.invoiceCode || '');
            fphms.push(curItem.invoiceNo || '');
            kprqs.push(curItem.invoiceDate || '');
            ses.push(curItem.totalTaxAmount || '');
            bdkyys.push(curItem.notDeductibleType || '');
        }

        return {
            fpdm: fpdms.join('='),
            fphm: fphms.join('='),
            kprq: kprqs.join('='),
            se: ses.join('='),
            bdkyy: bdkyys.join('='),
            zt: opt.authenticateFlag // 0, 1
        };
    }
    return opt;

}

export function changeCollectOutput(invoices = []) {
    const newInvoices = invoices.map((item) => {
        const {
            taxAmount,
            ...otherItem
        } = item;
        return {
            ...otherItem,
            totalTaxAmount: taxAmount,
            taxAmount
        };
    });

    return newInvoices;
}


export function changeGxOutput(resData = {}, description = '') {
    const { success = [], fail = [], ...other } = resData;
    return {
        ...other,
        success: success.map((item) => {
            return {
                taxPeriod: item.taxPeriod || '',
                invoiceCode: item.fpdm,
                invoiceNo: item.fphm,
                invoiceDate: item.kprq,
                selectResult: '1',
                description: 'success'
            };
        }),
        fail: fail.map((item) => {
            return {
                taxPeriod: item.taxPeriod || '',
                invoiceCode: item.fpdm,
                invoiceNo: item.fphm,
                invoiceDate: item.kprq,
                selectResult: '23',
                description
            };
        })
    };
}

// 采集缴款书字段转换
export function changeQueryJksParam(opt) {
    const searchOpt = opt.searchOpt;
    if (typeof searchOpt !== 'object') {
        return {
            errcode: 'argsError',
            description: '查询参数为错误，请检查！'
        };
    }
    let rzzt = typeof searchOpt.rzzt === 'undefined' ? -1 : searchOpt.rzzt;
    let gxzt = typeof searchOpt.gxzt === 'undefined' ? -1 : searchOpt.gxzt;
    if (typeof searchOpt.authenticateFlags !== 'undefined') {
        const authenticateFlags = searchOpt.authenticateFlags || '';
        if (authenticateFlags === '') {
            rzzt = -1;
            gxzt = -1;
        } else {
            const authenticateFlagArr = authenticateFlags.split(',');
            if (authenticateFlagArr.indexOf('0') !== -1 && authenticateFlagArr.indexOf('1') !== -1) {
                gxzt = -1;
            } else if (authenticateFlagArr.indexOf('0') !== -1) {
                gxzt = 0;
            } else if (authenticateFlagArr.indexOf('1') !== -1) {
                gxzt = 1;
            }

            if (authenticateFlagArr.indexOf('2') !== -1) {
                rzzt = 1;
            } else {
                rzzt = 0;
            }
        }
    }

    return {
        ...opt,
        searchOpt: {
            ...searchOpt,
            rzzt,
            gxzt,
            rq_q: searchOpt.startTime || searchOpt.rq_q,
            rq_z: searchOpt.endTime || searchOpt.rq_z,
            jkshm: searchOpt.customBillNo // 海关缴款书号码
        }
    };

}

// 生成当前往期已勾选、认证的查询参数
export function createDqwcYgxQueryParam(opt, tokenInfo) {
    const { searchOpt = {} } = opt;
    const taxPeriod = searchOpt.taxPeriod || '';
    const invoiceType = searchOpt.invoiceType || -1;
    let authenticateFlags;
    let startTime = '';
    let endTime = '';
    let gxStartTime = '';
    let gxEndTime = '';
    const curTaxPeriod = tokenInfo.taxPeriod;
    const gxrqfwArr = tokenInfo.gxrqfw.split('-');
    const taxPeriodStartDate = moment(taxPeriod, 'YYYYMM').format('YYYY-MM-01');
    const isDq = taxPeriod === curTaxPeriod;
    if (isDq) {
        const isConfirm = tokenInfo.isConfirm;
        authenticateFlags = isConfirm ? '2' : '1';
        startTime = isConfirm ? taxPeriodStartDate : moment(gxrqfwArr[0], 'YYYYMMDD').format('YYYY-MM-DD');
        endTime = isConfirm ? taxPeriodStartDate : moment(gxrqfwArr[1], 'YYYYMMDD').format('YYYY-MM-DD');
        gxStartTime = isConfirm ? '' : moment().add(-1, 'month').format('YYYY-MM-01');
        gxEndTime = isConfirm ? '' : moment().format('YYYY-MM-DD');
    } else {
        authenticateFlags = '2,3';
        startTime = taxPeriodStartDate;
        endTime = taxPeriodStartDate;
        gxStartTime = '';
        gxEndTime = '';
    }

    return {
        ...opt,
        searchOpt: {
            invoiceCode: '',
            invoiceNo: '',
            salerTaxNo: '',
            authenticateFlags,
            invoiceStatus: -1,
            invoiceType,
            manageStatus: 0,
            startTime,
            endTime,
            gxStartTime,
            gxEndTime,
            filterByInvoiceDate: false
        }
    };
}

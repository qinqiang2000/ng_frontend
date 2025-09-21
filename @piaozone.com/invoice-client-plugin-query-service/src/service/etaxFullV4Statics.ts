import t from '../libs/validate';
// 发票统计
/* eslint-disable no-undef,complexity,max-len */

const govFullInvoiceTypes = [
    '01',
    '03',
    '04',
    '08',
    '10',
    '11',
    '14',
    '15',
    '51',
    '61',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88'
];
// 进销项发票申请
export class EtaxFullV4Static extends BaseService {
    async checkArgs(opt: any) {
        const ctx = this.ctx;
        const {
            dataType,
            govInvoiceTypes,
            govInvoiceType,
            startDate,
            endDate,
            invoiceStatus
        } = opt;
        let fplxDm;
        if (govInvoiceType) {
            fplxDm = [govInvoiceType];
        } else if (govInvoiceTypes.includes('-1')) {
            fplxDm = [];
        } else {
            const fullInvoiceTyps = govFullInvoiceTypes;
            for (let i = 0; i < govInvoiceTypes.length; i++) {
                const curType = govInvoiceTypes[i];
                if (!fullInvoiceTyps.includes(curType)) {
                    return {
                        ...errcodeInfo.args,
                        description: `发票类型错误：${curType}`
                    };
                }
            }
            fplxDm = govInvoiceTypes;
        }

        let fpztDm = [];
        if (invoiceStatus === 0) {
            fpztDm.push('01');
        } else if (!invoiceStatus || invoiceStatus === -1) {
            fpztDm = ['01', '02', '03', '04'];
        } else if (invoiceStatus === 2) {
            fpztDm.push('02');
        } else if (invoiceStatus === 7) { // 部分红冲
            fpztDm.push('04');
        } else if (invoiceStatus === 8) { // 全额红冲
            fpztDm.push('03');
        } else {
            return {
                ...errcodeInfo.args,
                description: `不支持的发票状态: ${invoiceStatus}`
            };
        }

        return {
            ...errcodeInfo.success,
            data: {
                fpztDm,
                gjbq: dataType === 1 ? '2' : '1', // 税局进项项类型，
                fplxDm,
                kprqq: startDate,
                kprqz: endDate
            }
        };
    }

    async queryCount(tokenInfo: any, govOpts: any) {
        const ctx = this.ctx;
        const countUrl = '/szzhzz/qlfpcx/v1/queryFpjcxx';
        // 查询数量
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, countUrl, govOpts);
        if (res.errcode !== '0000') {
            return res;
        }
        const { Total } = res.data || {};
        if (typeof Total === 'undefined') {
            return errcodeInfo.govErr;
        }

        return {
            ...errcodeInfo.success,
            data: {
                count: Total
            }
        };
    }

    async queryJeSe(tokenInfo: any, govOpts: any) {
        const ctx = this.ctx;
        const urlPath = '/szzhzz/qlfpcx/v1/queryFpjeseHj';
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, govOpts);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Hjse, Hjje } = resData;
        if (typeof Hjje === 'undefined' || typeof Hjse === 'undefined') {
            return errcodeInfo.govErr;
        }
        return {
            ...errcodeInfo.success,
            data: {
                invoiceAmount: typeof Hjje === 'string' ? Hjje : Hjje.toFixed(2),
                totalTaxAmount: typeof Hjse === 'string' ? Hjse : Hjse.toFixed(2)
            }
        };
    }

    async statistics(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        ctx.service.log.info('表头异步接口统计参数', opt);
        const checkRes = await this.checkArgs(opt);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        if (checkRes.hasData === false) {
            return {
                ...errcodeInfo.success,
                data: []
            };
        }
        const {
            fpztDm,
            gjbq,
            fplxDm,
            kprqq,
            kprqz
        } = checkRes.data;
        const requestData = {
            gjbq: gjbq,
            fpztDm: fpztDm,
            fplyDm: 0, // 发票来源，0全部
            fplxDm: fplxDm,
            kprqq: kprqq,
            kprqz: kprqz,
            tfrqq: kprqq,
            tfrqz: kprqz,
            sflzfp: '',
            dtBz: 'N',
            pageNumber: 1,
            pageSize: 20
        };
        const countRes = await this.queryCount(tokenInfo, requestData);
        ctx.service.log.info('查询数量返回', countRes);
        if (countRes.errcode !== '0000') {
            return countRes;
        }
        const { count } = countRes.data || {};
        if (count === 0) {
            return {
                ...errcodeInfo.success,
                data: {
                    count,
                    invoiceAmount: '0.00',
                    totalTaxAmount: '0.00'
                }
            };
        }
        const res = await this.queryJeSe(tokenInfo, requestData);
        ctx.service.log.info('查询金额合计返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { invoiceAmount, totalTaxAmount } = resData;
        return {
            ...errcodeInfo.success,
            data: {
                count,
                invoiceAmount,
                totalTaxAmount
            }
        };
    }

    async apply(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        const checkOptType = t.type({
            dataType: t.enum([1, 2], '进销项类型'),
            govInvoiceType: t.enum(govFullInvoiceTypes, {
                message: '税局发票类型',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (!opt.govInvoiceTypes) {
                        return '税局发票类型不能为空';
                    }
                    return true;
                }
            }),
            govInvoiceTypes: t.arrayEnum(['-1', ...govFullInvoiceTypes], {
                message: '税局发票类型',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (!opt.govInvoiceType) {
                        return '税局发票类型不能为空';
                    }
                    return true;
                }
            }),
            startDate: (name: string, value: string) => {
                // 需要查询未勾选发票时，开始开票日期必须正确
                if (opt.checkStatus === -1 || opt.checkStatus === 0) {
                    let msg = t.formatDate('YYYY-MM-DD', '开票开始日期')(name, value);
                    if (msg) {
                        return msg;
                    }
                    // 结束日期可以为空
                    msg = t.formatDate('YYYY-MM-DD', { message: '开票结束日期', allowEmpty: true })('endDate', opt.endDate);
                    if (msg) {
                        return msg;
                    }
                    const intStartDate = parseInt(value.replace(/-/g, ''));
                    const endDate = opt.endDate || moment('YYYYMMDD');
                    const intEndDate = parseInt(endDate.replace(/-/g, ''));
                    if (intStartDate > intEndDate) {
                        return 'startDate必须小于等于endDate';
                    }

                    if (moment(endDate, 'YYYY-MM-DD').diff(moment(value, 'YYYY-MM-DD'), 'days') > 365) {
                        return 'endDate - startDate必须小于等于365天';
                    }
                }
                return null;
            },
            invoiceStatus: t.enum([-1, 0, 2, 7, 8], { message: '发票状态', allowEmpty: true })
        });
        const decode = t.decode(opt, checkOptType);
        // 参数校验失败
        if (decode) {
            return {
                ...errcodeInfo.argsErr,
                description: decode
            };
        }
        const res = await this.statistics(tokenInfo, opt);
        const resData = res.data || {};
        // 回调结果
        await ctx.service.invoiceSave.updateSyncResult({
            ...res,
            data: {
                batchNo: opt.batchNo,
                ...resData
            }
        });
        return res;
    }
}


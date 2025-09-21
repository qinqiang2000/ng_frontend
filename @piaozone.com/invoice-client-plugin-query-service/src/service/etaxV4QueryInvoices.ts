import t from '../libs/validate';
// 可勾选的税局发票类型
export const govGxInvoiceTypes = [
    '01',
    '03',
    '04',
    '08',
    '10',
    '14',
    '81',
    '82',
    '85',
    '86',
    '87',
    '61',
    '51'
];

// 可勾选的发票云发票类型
export const gxInvoiceTypes = [
    1,
    2,
    3,
    4,
    12,
    15,
    26,
    27,
    28,
    29
];

export const govFpyInvoiceTypeDict = {
    'k1': '10',
    'k2': '08',
    'k3': '04',
    'k4': '01',
    'k12': '03',
    'k15': '14',
    'k26': '82',
    'k27': '81',
    'k28': '61',
    'k29': '51'
};

// 表头异步接口
export class EtaxV4QueryInvoices extends BaseService {

    // 分页查询抵扣未勾选发票
    async queryDkwgxInvoice(loginData: any, opt: any) {
        const ctx = this.ctx;
        const { access_token } = ctx.request.query;
        let invoices: any = [];
        let dataIndex = 0;
        let nextDataFromIndex = 0;
        let goOn = false;
        let fpcyRes;
        do {
            const optParam = { ...opt, continueFlag: true, dataIndex, dataFromIndex: nextDataFromIndex };
            ctx.service.log.info('optParam', optParam);
            fpcyRes = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, loginData, optParam);
            ctx.service.log.info('etaxQueryInvoices.queryInvoices res', fpcyRes);
            if (fpcyRes.errcode !== '0000') {
                ctx.service.log.info('获取抵扣未勾选比对数据异常, 参数：', optParam);
                ctx.service.log.info('获取抵扣未勾选比对数据异常, 返回：', fpcyRes);
                break;
            } else {
                dataIndex = fpcyRes.nextDataIndex;
                nextDataFromIndex = fpcyRes.nextDataFromIndex;
                if (fpcyRes.endFlag) {
                    goOn = false;
                } else {
                    goOn = dataIndex < fpcyRes.totalNum;
                }
                invoices = invoices.concat(fpcyRes.data);
            }
        } while (goOn);
        return { ...fpcyRes, data: invoices };
    }

    createDqwcYgxQueryParam(tokenInfo: any, searchOpt: any) {
        const taxPeriod = searchOpt.taxPeriod || '';
        let authenticateFlags;
        let startTime = '';
        let endTime = '';
        let gxStartTime = '';
        let gxEndTime = '';
        const curTaxPeriod = tokenInfo.taxPeriod;
        const gxrqfwArr = tokenInfo.gxrqfw.split('-');
        const taxPeriodStartDate = moment(taxPeriod, 'YYYYMM').format('YYYY-MM-01');
        const isDq = taxPeriod === curTaxPeriod;
        let dataFrom = 'dktjQuery';
        if (isDq) {
            const isConfirm = tokenInfo.isConfirm;
            authenticateFlags = isConfirm ? '2' : '1';
            startTime = isConfirm ? taxPeriodStartDate : moment(gxrqfwArr[0], 'YYYYMMDD').format('YYYY-MM-DD');
            endTime = isConfirm ? taxPeriodStartDate : moment(gxrqfwArr[1], 'YYYYMMDD').format('YYYY-MM-DD');
            gxStartTime = isConfirm ? '' : moment().add(-1, 'month').format('YYYY-MM-01');
            gxEndTime = isConfirm ? '' : moment().format('YYYY-MM-DD');
            dataFrom = isConfirm ? 'dktjQuery' : 'dkgxquery';
        } else {
            authenticateFlags = '2,3';
            startTime = taxPeriodStartDate;
            endTime = taxPeriodStartDate;
            gxStartTime = '';
            gxEndTime = '';
        }
        const invoiceType = searchOpt.invoiceType;
        const govInvoiceTypes = searchOpt.govInvoiceTypes;
        return {
            useQuery: true, // 当期的用这个参数控制是否走列表查询，不走导出，不影响已认证模块的excel导出
            dataIndex: 0,
            dataFromIndex: 0,
            disabledFilter: true, // 异步接口的参数税局都支持，不需要过滤
            getInvoiceTime: true,
            dataFrom,
            searchOpt: {
                dataFrom,
                invoiceCode: '',
                invoiceNo: '',
                salerTaxNo: '', // // 已勾选和已认证数据查询全部
                authenticateFlags,
                invoiceStatus: -1, // 已勾选和已认证数据查询全部
                invoiceType,
                govInvoiceTypes,
                manageStatus: 0,
                startTime,
                endTime,
                gxStartTime,
                gxEndTime
            }
        };
    }

    async queryDkygxInvoices(loginData: any, searchOpt: any) {
        const ctx = this.ctx;
        const { access_token } = ctx.request.query;
        const resOpt: any = this.createDqwcYgxQueryParam(loginData, searchOpt);
        let fpcyRes;
        let invoices: any = [];
        let goOn = false;
        let dataIndex = resOpt.dataIndex || 0;
        let nextDataFromIndex = resOpt.nextDataFromIndex || 0;
        do {
            const optParam = { ...resOpt, continueFlag: true, dataIndex, dataFromIndex: nextDataFromIndex };
            ctx.service.log.info('optParam', optParam);
            fpcyRes = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, loginData, optParam);
            ctx.service.log.info('etaxQueryInvoices.queryInvoices res', fpcyRes);
            if (fpcyRes.errcode !== '0000') {
                ctx.service.log.info('获取抵扣勾选比对数据异常, 参数：', optParam);
                ctx.service.log.info('获取抵扣勾选比对数据异常, 返回：', fpcyRes);
                break;
            } else {
                dataIndex = fpcyRes.nextDataIndex;
                nextDataFromIndex = fpcyRes.nextDataFromIndex;
                if (fpcyRes.endFlag) {
                    goOn = false;
                } else {
                    goOn = dataIndex < fpcyRes.totalNum;
                }
                invoices = invoices.concat(fpcyRes.data);
            }
        } while (goOn);
        return { ...fpcyRes, data: invoices };
    }

    // 查询不抵扣已勾选
    async queryBdkygxInvoices(loginData: any = {}, searchOpt: any = {}) {
        const ctx = this.ctx;
        const invoiceType = searchOpt.invoiceType;
        const govInvoiceTypes = searchOpt.govInvoiceTypes;
        const resOpt = {
            getInvoiceTime: true,
            dataIndex: 0,
            dataFromIndex: 0,
            searchOpt: {
                rzzt: '1',
                pageSize: 500,
                invoiceCode: '',
                invoiceNo: '',
                taxPeriod: searchOpt.taxPeriod || '',
                salerTaxNo: '',
                startTime: '2017-01-01',
                endTime: moment(searchOpt.taxPeriod, 'YYYYMM').endOf('month').format('YYYY-MM-DD'),
                invoiceStatus: searchOpt.invoiceStatus,
                invoiceType: invoiceType,
                govInvoiceTypes
            }
        };
        let fpcyRes;
        let invoices: any = [];
        let goOn = false;
        let dataIndex = resOpt.dataIndex || 0;
        do {
            const optParam = { ...resOpt, dataIndex };
            fpcyRes = await ctx.service.etaxQueryInvoices.bdkgxQueryInvoices(loginData, optParam);
            if (fpcyRes.errcode !== '0000') {
                ctx.service.log.info('获取不抵扣勾选比对数据异常, 参数：', optParam);
                ctx.service.log.info('获取不抵扣勾选比对数据异常, 返回：', fpcyRes);
                break;
            } else {
                dataIndex = fpcyRes.nextDataIndex;
                goOn = dataIndex < fpcyRes.totalNum;
                invoices = invoices.concat(fpcyRes.data);
            }
        } while (goOn);

        return { ...fpcyRes, data: invoices };
    }

    // 查询退税已勾选发票
    async queryTsygxInvoices(tokenInfo: any, searchOpt: any) {
        const ctx = this.ctx;
        const { access_token } = ctx.request.query;
        const taxPeriod = searchOpt.taxPeriod;
        const invoiceType = searchOpt.invoiceType;
        const govInvoiceTypes = searchOpt.govInvoiceTypes;
        const curTaxPeriod = tokenInfo.taxPeriod;
        const gxrqfwArr = tokenInfo.gxrqfw.split('-');
        const taxPeriodStartDate = moment(taxPeriod, 'YYYYMM').format('YYYY-MM-01');
        const isDq = taxPeriod === curTaxPeriod;
        let newSearchOpt;
        if (isDq) {
            const isConfirm = tokenInfo.isConfirm;
            const startTime = isConfirm ? taxPeriodStartDate : moment(gxrqfwArr[0], 'YYYYMMDD').format('YYYY-MM-DD');
            const endTime = isConfirm ? taxPeriodStartDate : moment(gxrqfwArr[1], 'YYYYMMDD').format('YYYY-MM-DD');
            const gxStartTime = isConfirm ? '' : moment().add(-1, 'month').format('YYYY-MM-01');
            const gxEndTime = isConfirm ? '' : moment().format('YYYY-MM-DD');
            newSearchOpt = {
                rzzt: '1',
                invoiceNo: '',
                invoiceCode: '',
                startTime,
                endTime,
                gxStartTime,
                gxEndTime,
                invoiceType,
                govInvoiceTypes
            };
        } else {
            newSearchOpt = {
                rzssq: taxPeriod,
                invoiceType,
                invoiceNo: '',
                invoiceCode: '',
                govInvoiceTypes
            };
        }
        const opt = {
            getInvoiceTime: true,
            searchOpt: newSearchOpt
        };
        let res;
        if (isDq) {
            res = await ctx.service.etaxQueryTaxReturnInvoices.tsgxExport(access_token, tokenInfo, opt);
        } else {
            res = await ctx.service.etaxQueryTaxReturnInvoices.tsytExport(access_token, tokenInfo, opt);
        }
        return res;
    }

    async updateSyncResult(batchNo: string, res: any) {
        const ctx = this.ctx;
        const resData = res.data || [];
        // 查询异常，更新任务状态
        if (res.errcode !== '0000' && !res.data) {
            const updateRes = await ctx.service.invoiceSave.updateSyncResult({
                ...res,
                data: {
                    batchNo: batchNo
                }
            });
            ctx.service.log.info('更新异步任务状态返回', updateRes);
            return res;
        }

        // 任务成功，上传结果到s3
        const res2 = await ctx.service.invoiceSave.uploadSyncResult(batchNo, resData);
        if (res2.errcode !== '0000') {
            const updateRes = await ctx.service.invoiceSave.updateSyncResult({
                ...res2,
                data: {
                    batchNo: batchNo
                }
            });
            ctx.service.log.info('上传存储异常，更新异步任务状态返回', res2, updateRes);
            return res;
        }

        const { originalUrl } = res2.data || {};
        const returnRes = {
            ...res,
            data: {
                batchNo: batchNo,
                fileList: [{
                    resCount: resData.length,
                    resFile: originalUrl
                }]
            }
        };
        const updateRes = await ctx.service.invoiceSave.updateSyncResult(returnRes);
        ctx.service.log.info('更新异步任务状态返回', updateRes);
        return returnRes;
    }

    async confirmedInvoiceQuery(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        const {
            deductionPurpose,
            taxPeriod
        } = opt;
        const deductionPurposeList = deductionPurpose.includes('-1') ? ['1', '2', '3'] : deductionPurpose;
        const typeRes = this.getInvoiceTypes(opt);
        if (typeRes.errcode !== '0000') {
            return typeRes;
        }
        const { govInvoiceTypes, invoiceType } = typeRes.data;
        const { pageId } = ctx.request.query;
        let curTaxPeriod = tokenInfo.taxPeriod;
        let gxrqfw = tokenInfo.gxrqfw;
        if (!curTaxPeriod) {
            const res1 = await ctx.service.etaxLogin.dqskssq(pageId);
            if (res1.errcode !== '0000') {
                return res1;
            }
            const curMonth = moment().format('YYYYMM');
            curTaxPeriod = res1.data;
            tokenInfo.taxPeriod = curTaxPeriod;
            if (curTaxPeriod === curMonth) {
                gxrqfw = '20170101-' + moment().format('YYYYMMDD');
            } else {
                gxrqfw = '20170101-' + moment(curTaxPeriod, 'YYYYMM').endOf('month').format('YYYYMMDD');
            }
            tokenInfo.gxrqfw = gxrqfw;
            // 查询是否查询当期
            await pwyStore.set(etaxLoginedCachePreKey + pageId, tokenInfo, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, tokenInfo);
        }

        if (taxPeriod === curTaxPeriod) {
            const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(tokenInfo);
            ctx.service.log.info('当期税期是否已确认', confirmRes);
            if (confirmRes.errcode !== '0000') {
                return confirmRes;
            }
            const isConfirm = confirmRes.data === 'Y';
            tokenInfo.isConfirm = isConfirm;
            await pwyStore.set(etaxLoginedCachePreKey + pageId, tokenInfo, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, tokenInfo);
            // 查询当期，统计表未确认，数据为空
            if (!isConfirm) {
                return {
                    ...errcodeInfo.success,
                    data: []
                };
            }
        }

        let resultList: any = [];
        const newOpt = {
            govInvoiceTypes,
            invoiceType,
            taxPeriod,
            salerTaxNo: '',
            invoiceStatus: -1
        };
        for (let i = 0; i < deductionPurposeList.length; i++) {
            const curValue = deductionPurposeList[i];
            let res;
            if (curValue === '1') { // 历史已抵扣
                res = await this.queryDkygxInvoices(tokenInfo, newOpt);
                ctx.service.log.info('查询抵扣已认证发票返回', res);
            } else if (curValue === '2') { // 历史不抵扣
                res = await this.queryBdkygxInvoices(tokenInfo, newOpt);
                ctx.service.log.info('查询不抵扣已认证发票返回', res);
            } else if (curValue === '3') { // 历史已退税
                res = await this.queryTsygxInvoices(tokenInfo, newOpt);
                ctx.service.log.info('查询退税已认证发票返回', res);
            }
            if (res.errcode !== '0000') {
                return res;
            }
            const resData = res.data || [];
            resultList = resultList.concat(resData);
        }
        return {
            ...errcodeInfo.success,
            data: resultList
        };
    }

    async confirmedInvoiceApply(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        ctx.service.log.info('历史已抵扣发票查询参数', opt);
        const checkOptType = t.type({
            invoiceTypes: t.arrayEnum([-1, ...gxInvoiceTypes], {
                message: '发票云发票类型',
                enumAllValue: -1,
                allowEmpty: () => {
                    if (!opt.govInvoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            govInvoiceTypes: t.arrayEnum(['-1', ...govGxInvoiceTypes], {
                message: '税局发票类型',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (!opt.invoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            deductionPurpose: t.arrayEnum(['-1', '1', '2', '3', '4', '5', '6'], {
                message: '抵扣用途',
                enumAllValue: '-1'
            }),
            taxPeriod: t.commonCheck((name: string, value: string) => {
                const check = t.formatDate('YYYYMM', '税款所属期')(name, value);
                if (check) {
                    return check;
                }
                const intValue = parseInt(value);
                const intCurMonth = parseInt(moment().format('YYYYMM'));
                if (intValue > intCurMonth) {
                    return '税款所属期不能大于当前月';
                }
                return null;
            })
        });
        const decode = t.decode(opt, checkOptType);
        // 参数校验失败
        if (decode) {
            return {
                ...errcodeInfo.argsErr,
                description: decode
            };
        }

        let res = await this.confirmedInvoiceQuery(tokenInfo, opt);
        // 税局异常直接重试一次
        if (res.description?.includes('税局异常')) {
            res = await this.confirmedInvoiceQuery(tokenInfo, opt);
        }
        const upRes = await this.updateSyncResult(opt.batchNo, res);
        return upRes;
    }

    // 通过govInvoiceTypes和invoiceType获取税局的发票类型
    getInvoiceTypes(opt: any) {
        let govInvoiceTypes: any = '';
        let invoiceType : any = '';
        if (opt.govInvoiceTypes) {
            if (opt.govInvoiceTypes.includes('-1')) {
                invoiceType = -1;
            } else {
                govInvoiceTypes = opt.govInvoiceTypes;
            }
            return {
                ...errcodeInfo.success,
                data: {
                    govInvoiceTypes,
                    invoiceType
                }
            };
        }
        const invoiceTypeArgs = opt.invoiceTypes || [];
        if (invoiceTypeArgs.includes(-1)) {
            invoiceType = -1;
            return {
                ...errcodeInfo.success,
                data: {
                    govInvoiceTypes,
                    invoiceType
                }
            };
        }
        invoiceType = invoiceTypeArgs.join(',') || -1;
        return {
            ...errcodeInfo.success,
            data: {
                invoiceType,
                govInvoiceTypes
            }
        };
    }

    // 查询未勾选或已勾选发票
    async unConfirmedInvoiceQuery(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        const { disableCache, pageId } = ctx.request.query;
        const typeRes = this.getInvoiceTypes(opt);
        if (typeRes.errcode !== '0000') {
            return typeRes;
        }
        const { govInvoiceTypes, invoiceType } = typeRes.data;
        const deductionPurpose = opt.deductionPurpose;
        let listResult: any = [];
        // 需要查询未勾选发票
        if (opt.checkStatus === -1 || opt.checkStatus === 0) {
            const wgxOpt = {
                useQuery: true, // 当期的用这个参数控制是否走列表查询，不走导出
                dataIndex: 0,
                dataFromIndex: 0,
                disabledFilter: true, // 异步接口的参数税局都支持，不需要过滤
                getInvoiceTime: true,
                dataFrom: 'dkgxquery',
                exclude: 'wdqQuery',
                searchOpt: {
                    invoiceCode: '',
                    invoiceNo: '',
                    salerTaxNo: '',
                    authenticateFlags: '0',
                    invoiceStatus: typeof opt.invoiceStatus === 'undefined' ? -1 : opt.invoiceStatus,
                    invoiceType,
                    govInvoiceTypes,
                    manageStatus: 0,
                    startTime: opt.startDate,
                    endTime: opt.endDate,
                    gxStartTime: '',
                    gxEndTime: ''
                }
            };
            const res = await this.queryDkwgxInvoice(tokenInfo, wgxOpt);
            ctx.service.log.info('抵扣未勾选查询返回', res);
            if (res.errcode !== '0000') {
                ctx.service.log.info('抵扣未勾选查询返回, 异常', res);
                return res;
            }
            listResult = listResult.concat(res.data);
        }

        // 只需要查询未勾选发票
        if (opt.checkStatus === 0) {
            return {
                ...errcodeInfo.success,
                data: listResult
            };
        }

        let curTaxPeriod = tokenInfo.taxPeriod;
        let gxrqfw = tokenInfo.gxrqfw;
        if (!curTaxPeriod) {
            const res1 = await ctx.service.etaxLogin.dqskssq(pageId);
            if (res1.errcode !== '0000') {
                return res1;
            }
            const curMonth = moment().format('YYYYMM');
            curTaxPeriod = res1.data;
            tokenInfo.taxPeriod = curTaxPeriod;
            if (curTaxPeriod === curMonth) {
                gxrqfw = '20170101-' + moment().format('YYYYMMDD');
            } else {
                gxrqfw = '20170101-' + moment(curTaxPeriod, 'YYYYMM').endOf('month').format('YYYYMMDD');
            }
            tokenInfo.gxrqfw = gxrqfw;
            // 查询是否查询当期
            await pwyStore.set(etaxLoginedCachePreKey + pageId, tokenInfo, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, tokenInfo);
        }

        const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(tokenInfo);
        ctx.service.log.info('当前税期是否已确认', confirmRes);
        if (confirmRes.errcode !== '0000') {
            return confirmRes;
        }
        // 统计表已经确认，没有已勾选数据
        if (confirmRes.data === 'Y') {
            return {
                ...errcodeInfo.success,
                data: listResult
            };
        }
        const deductionPurposeList = deductionPurpose.includes('-1') ? ['1', '2', '3'] : deductionPurpose;
        const newOpt = {
            govInvoiceTypes,
            invoiceType,
            taxPeriod: curTaxPeriod,
            salerTaxNo: '',
            invoiceStatus: -1
        };
        for (let i = 0; i < deductionPurposeList.length; i++) {
            const curValue = deductionPurposeList[i];
            let res;

            if (curValue === '1') { // 抵扣已勾选
                res = await this.queryDkygxInvoices(tokenInfo, newOpt);
                ctx.service.log.info('查询抵扣已认证发票返回', res);
            } else if (curValue === '2') { // 不抵扣已勾选
                res = await this.queryBdkygxInvoices(tokenInfo, newOpt);
                ctx.service.log.info('查询不抵扣已认证发票返回', res);
            } else if (curValue === '3') { // 退税已勾选
                res = await this.queryTsygxInvoices(tokenInfo, newOpt);
                ctx.service.log.info('查询退税已认证发票返回', res);
            }
            if (res.errcode !== '0000') {
                return res;
            }
            const resData = res.data || [];
            listResult = listResult.concat(resData);
        }
        return {
            ...errcodeInfo.success,
            data: listResult
        };
    }

    async unConfirmedInvoiceApply(tokenInfo: any, opt: any) {
        const ctx = this.ctx;
        ctx.service.log.info('未抵扣发票查询参数', opt);
        // 生成校验类型
        const checkOptType = t.type({
            invoiceTypes: t.arrayEnum([-1, ...gxInvoiceTypes], {
                message: '发票云发票类型',
                enumAllValue: -1,
                allowEmpty: () => {
                    if (!opt.govInvoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            govInvoiceTypes: t.arrayEnum(['-1', ...govGxInvoiceTypes], {
                message: '税局发票类型',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (!opt.invoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            deductionPurpose: t.arrayEnum(['-1', '1', '2', '3', '4', '5', '6'], {
                message: '抵扣用途',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (opt.checkStatus === -1 || opt.checkStatus === 1) {
                        return '当checkStatus为-1或1时, deductionPurpose不能为空';
                    }
                    return true;
                }
            }),
            checkStatus: t.enum([-1, 0, 1], '勾选状态'),
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
                    const endDate = opt.endDate || moment().format('YYYYMMDD');
                    const intEndDate = parseInt(endDate.replace(/-/g, ''));
                    const intCurDate = parseInt(moment().format('YYYYMMDD'));
                    if (intStartDate > intCurDate || intEndDate > intCurDate) {
                        return '起止开票日期不能大于今天';
                    }
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
        if (!opt.endDate) {
            opt.endDate = moment().format('YYYY-MM-DD');
        }
        let res = await this.unConfirmedInvoiceQuery(tokenInfo, opt);
        // 税局异常直接重试一次
        if (res.description?.includes('税局异常')) {
            res = await this.unConfirmedInvoiceQuery(tokenInfo, opt);
        }
        const upRes = await this.updateSyncResult(opt.batchNo, res);
        return upRes;
    }
}
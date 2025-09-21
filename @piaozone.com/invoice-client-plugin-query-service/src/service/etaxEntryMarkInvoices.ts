/* eslint-disable no-undef,complexity,max-len,quotes */

// import { getEtaxListOpt } from '../libs/getListOpt';
// import { transDkgxInvoices, transBdkgxInvoices, transWdqInvoices, transDktjInvoices } from '../libs/etaxTransform';
// import { getUUId } from '../utils/getUid';
import { transMarkInvoicesToFpy, transMarkInvoicesToGov, invoiceRiskLevelDict, invoiceStatusDict } from '../libs/markTransform';
import { transformFpyType } from '../libs/etaxInvoiceType';
import t from '../libs/validate';
export const govFullInvoiceTypes = [
    '01',
    '03',
    '08',
    '81',
    '82',
    '04',
    '10', // 电子普通发票
    '15',
    '14', // 通行费
    '85', // 数电纸质发票（增值税专用发票）
    '86', // 数电纸质发票（普通发票）
    '87', // 数电纸质发票（机动车销售统一发票）
    '88', // 数电纸质发票（二手车销售统一发票）
    '61'
];

export const fpyFullInvoiceTypes = [1, 2, 3, 4, 12, 13, 15, 26, 27, 28];
export class EtaxEntryMarkInvoices extends BaseService {

    async checkQueryMarkArgs(opt: any) {
        const ctx = this.ctx;
        const checkType = t.type({
            pageSize: (name: string, value: number) => {
                // 可以为空
                if (typeof value === 'undefined' || value === null) {
                    return null;
                }
                if (value > 499) {
                    return '分页大小(pageSize)最大为499';
                }
                return null;
            },
            startDate: (name: string, value: string) => {
                let msg = t.formatDate('YYYY-MM-DD', '开票开始日期')(name, value);
                if (msg) {
                    return msg;
                }
                // 结束日期可以为空
                msg = t.formatDate('YYYY-MM-DD', { message: '开票结束日期' })('endDate', opt.endDate);
                if (msg) {
                    return msg;
                }
                const intStartDate = parseInt(value.replace(/-/g, ''));
                const endDate = opt.endDate;
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
                return null;
            },
            entryMarkStatus: t.enum(['01', '02', '03', '06'], '入账状态'),
            invoiceTypes: t.arrayEnum([-1, ...fpyFullInvoiceTypes], {
                message: '发票云发票类型',
                enumAllValue: -1,
                allowEmpty: () => {
                    if (!opt.govInvoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            govInvoiceTypes: t.arrayEnum(['-1', ...govFullInvoiceTypes], {
                message: '税局发票类型',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (!opt.invoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            })
        });
        const decode = t.decode(opt, checkType);
        // 参数校验失败
        if (decode) {
            return {
                ...errcodeInfo.argsErr,
                description: decode
            };
        }
        let govFplxs: any = [];
        if (opt.govInvoiceTypes) {
            if (opt.govInvoiceTypes.includes('-1')) {
                govFplxs = [...govFullInvoiceTypes];
            } else {
                govFplxs = opt.govInvoiceTypes;
            }
        } else if (opt.invoiceTypes) {
            if (opt.invoiceTypes.includes(-1)) {
                govFplxs = [...govFullInvoiceTypes];
            } else {
                const invoicesTypes = opt.invoiceTypes;
                for (let i = 0; i < invoicesTypes.length; i++) {
                    const curInvoiceType = invoicesTypes[i];
                    const curGovFplx = transformFpyType(curInvoiceType);
                    if (curGovFplx === -1) {
                        ctx.service.log.info('不支持的发票类型', curInvoiceType);
                        return {
                            ...errcodeInfo.argsErr,
                            description: '不支持的发票类型，请检查'
                        };
                    }
                    govFplxs.push(curGovFplx);
                    if (curGovFplx === '04') { // 数电纸质发票（普通发票）
                        govFplxs.push('86');
                    } else if (curGovFplx === '01') { // 数电纸质发票（增值税专用发票）
                        govFplxs.push('85');
                    } else if (curGovFplx === '03') { // 数电纸质发票（机动车销售统一发票）
                        govFplxs.push('87');
                    } else if (curGovFplx === '15') { // 数电纸质发票（二手车销售统一发票）
                        govFplxs.push('88');
                    }
                }
            }
        }
        return {
            ...errcodeInfo.success,
            data: {
                govFplxs,
                entryMarkStatus: opt.entryMarkStatus,
                pageSize: opt.pageSize || 499
            }
        };
    }

    async queryPageMarkInvoice(tokenInfo: any = {}, opt: any = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('入账标识查询', opt);
        const dataIndex = opt.dataIndex || 0;
        const { govFplxs, pageSize, entryMarkStatus } = opt;
        const jsonData: any = {
            fpbq: '',
            fpdm: '',
            fpfxdj: '',
            fphm: (opt.invoiceNo && opt.invoiceNo.length === 20) ? opt.invoiceNo : '',
            fplxDm: govFplxs,
            fply: '',
            fpztDm: ['0', '7', '2', '8', '3'],
            gxzt: [],
            hgjkshm: '',
            kprqq: (opt.startDate || '').substr(0, 10),
            kprqz: (opt.endDate || '').substr(0, 10),
            pageNumber: Math.floor(dataIndex / pageSize) + 1,
            pageSize,
            pzbqDm: '',
            pzzl: '1',
            rzyt: entryMarkStatus, // 入账状态：未入账："01", 已入账（企业所得税税前扣除）："02", 已入账（企业所得税不扣除）："03", 入账撤销："06"
            xsfmc: '',
            xsfnsrsbh: opt.salerTaxNo || '',
            xzjg: '',
            zzfphm: (opt.invoiceNo && opt.invoiceNo.length !== 20) ? opt.invoiceNo : '',
            zzfpdm: opt.invoiceCode || ''
        };
        ctx.service.log.info('入账标识查询参数', jsonData);
        const urlPath = '/ypfw/FprzController/v1/queryFprzxx';

        const res: any = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        ctx.service.log.fullInfo('入账标识查询结果', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const { DateList } = res.data;
        const { Total, List = [] } = DateList;
        const nextList = transMarkInvoicesToFpy(List);
        return {
            ...errcodeInfo.success,
            data: nextList,
            totalNum: Total,
            nextDataIndex: dataIndex + nextList.length,
            endFlag: pageSize > nextList.length
        };
    }

    // 传了批次号，需要循环查询完成后，更新任务状态
    async queryMarkInvoice(tokenInfo: any = {}, opt: any = {}) {
        const ctx = this.ctx;
        const checkRes = await this.checkQueryMarkArgs(opt);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const {
            govFplxs,
            entryMarkStatus,
            pageSize
        } = checkRes.data || {};
        const requestOpt = {
            ...opt,
            govFplxs,
            entryMarkStatus,
            pageSize
        };
        if (!opt.batchNo) {
            const res = await this.queryPageMarkInvoice(tokenInfo, requestOpt);
            return res;
        }
        const res = await this.queryAllUnRzInvoices(tokenInfo, requestOpt);
        // 税局处理失败，更新结果
        if (res.errcode !== '0000') {
            const updateRes = await ctx.service.invoiceSave.updateSyncResult({
                ...res,
                data: {
                    batchNo: opt.batchNo
                }
            });
            ctx.service.log.info('更新异步任务状态返回', updateRes);
            return res;
        }
        const resData = res.data || [];
        // 上传结果到s3失败，
        const res2 = await ctx.service.invoiceSave.uploadSyncResult(opt.batchNo, resData);
        // 上传结果到s3失败，更新为失败
        if (res2.errcode !== '0000') {
            const updateRes = await ctx.service.invoiceSave.updateSyncResult({
                ...res2,
                data: {
                    batchNo: opt.batchNo
                }
            });
            ctx.service.log.info('上传结果失败，更新异步任务状态返回', res2, updateRes);
            return res;
        }

        const { originalUrl } = res2.data || {};
        // 处理成功，更新结果
        const updateRes = await ctx.service.invoiceSave.updateSyncResult({
            ...errcodeInfo.success,
            data: {
                batchNo: opt.batchNo,
                fileList: [{
                    resFile: originalUrl,
                    resCount: resData.length
                }]
            }
        });
        ctx.service.log.info('更新异步任务状态返回', updateRes);
        return res;
    }

    async queryAllUnRzInvoices(userInfo: any = {}, opt: any = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('循环查询入账列表开始');
        let fpcyRes = { ...errcodeInfo.govErr };
        let invoices: any = [];
        let goOn = false;
        let dataIndex = opt.dataIndex || 0;
        do {
            const optParam = { ...opt, dataIndex };
            fpcyRes = await this.queryPageMarkInvoice(userInfo, optParam);
            if (fpcyRes.errcode !== '0000') {
                ctx.service.log.info('获取入账标识查询数据异常, 参数：', optParam);
                ctx.service.log.info('获取入账标识查询数据异常, 返回：', fpcyRes);
                break;
            } else {
                dataIndex = fpcyRes.nextDataIndex;
                goOn = dataIndex < fpcyRes.totalNum;
                invoices = invoices.concat(fpcyRes.data || []);
                ctx.service.log.info('queryAllUnRzInvoices dataIndex', dataIndex, fpcyRes.totalNum);
            }
        } while (goOn);

        return { ...fpcyRes, data: invoices };
    }

    // 根据入账标识的发票列表，计算出搜索条件
    getSearchOpt(list: any, entryMarkStatus: string): any {
        const initDate = list[0].invoiceDate.substr(0, 10);
        let startDate = initDate;
        let endDate = initDate;
        let startTimeInt = parseInt(startDate.replace(/-/g, ''));
        let endTimeInt = parseInt(endDate.replace(/-/g, ''));
        for (let i = 1; i < list.length; i++) {
            const curData = list[i];
            const curInvoiceDate = curData.invoiceDate.substr(0, 10);
            const invoiceDateInt = parseInt(curInvoiceDate.replace(/-/g, ''));
            if (startTimeInt > invoiceDateInt) {
                startDate = curInvoiceDate;
                startTimeInt = invoiceDateInt;
            }
            if (endTimeInt < invoiceDateInt) {
                endDate = curInvoiceDate;
                endTimeInt = invoiceDateInt;
            }
        }
        return {
            entryMarkStatus,
            govFplxs: '',
            pageSize: 499,
            startDate,
            endDate
        };
    }

    filterByGov(paramsList: any, govList: any) {
        const ctx = this.ctx;
        ctx.service.log.info('filterByGov------');
        const failList = [];
        const findList = [];
        const gxListDict: any = {};
        for (let i = 0; i < govList.length; i++) {
            const curData = govList[i];
            const dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            gxListDict[dataKey] = curData;
        }
        ctx.service.log.info('govList gxListDict------', gxListDict);
        for (let j = 0; j < paramsList.length; j++) {
            const curData = paramsList[j];
            const dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            const govCurData = gxListDict[dataKey] || {};
            if (govCurData) {
                findList.push({
                    entryResult: '1',
                    etaxInvoiceNo: curData.etaxInvoiceNo,
                    invoiceCode: curData.invoiceCode,
                    invoiceNo: curData.invoiceNo,
                    invoiceDate: curData.invoiceDate,
                    mxuuid: govCurData.mxuuid,
                    rzuuid: govCurData.rzuuid
                });
            } else {
                curData.entryResult = '31';
                curData.description = '税局入账异常';
                failList.push(curData);
            }
        }

        return {
            failList,
            findList
        };
    }

    async checkByGov(tokenInfo: any, successList: any, entryMarkStatus: string) {
        const ctx = this.ctx;
        const params = this.getSearchOpt(successList, entryMarkStatus);
        ctx.service.log.fullInfo('入账状态标识反查税局参数', params);
        const govRes = await this.queryAllUnRzInvoices(tokenInfo, params);
        if (govRes.errcode !== '0000') {
            return govRes;
        }
        ctx.service.log.fullInfo('入账状态标识反查结果返回', successList, govRes.data);
        const { failList, findList } = this.filterByGov(successList, govRes.data);
        return {
            ...errcodeInfo.success,
            data: {
                failList,
                findList
            }
        };
    }

    async checkOpts(initOpt: any = {}, type = 'submit') {
        const { invoices, nextEntryMarkStatus } = initOpt;
        const CheckInvoiceItemType = t.type({
            buyerTaxNo: t.notEmpty('购方税号'),
            salerName: t.notEmpty('销方名称'),
            salerTaxNo: t.notEmpty('销方税号'),
            invoiceType: (name: string, value: any, obj: any) => {
                if (typeof obj.govInvoiceType === 'undefined' && typeof value === 'undefined') {
                    return '税局发票类型和发票云发票类型必须选择一种传值';
                }
                if (obj.govInvoiceType) {
                    return t.enum(govFullInvoiceTypes, '税局发票类型')('govInvoiceType', obj.govInvoiceType);
                }
                return t.enum(fpyFullInvoiceTypes, '发票云发票类型')(name, value);
            },
            invoiceCode: (name: string, value: any, obj: any) => {
                const etaxTypes = [26, 27, 28];
                const govEtaxTypes = ['61', '81', '82'];
                if (typeof obj.govInvoiceType !== 'undefined' && !govEtaxTypes.includes(obj.govInvoiceType) && !value) {
                    return '非数电票发票代码不能为空';
                }
                if (typeof obj.invoiceType !== 'undefined' && !etaxTypes.includes(obj.invoiceType) && !value) {
                    return '非数电票发票代码不能为空';
                }
                return null;
            },
            etaxInvoiceNo: (name: string, value: any, obj: any) => {
                const etaxPaperInvoiceTypes = ['85', '86', '87', '88'];
                if (typeof obj.govInvoiceType !== 'undefined' && etaxPaperInvoiceTypes.includes(obj.govInvoiceType)) {
                    if (!value) {
                        return '数电纸质发票类型etaxInvoiceNo不能为空';
                    }
                    if (value.length !== 20) {
                        return 'etaxInvoiceNo错误, 请传入20位正确的数电纸质发票的数电号码';
                    }
                }
                return null;
            },
            invoiceNo: t.notEmpty('发票号码'),
            invoiceDate: t.formatDate('YYYY-MM-DD HH:mm:SS', '开票日期'),
            invoiceAmount: t.notEmpty('不含税金额'),
            totalTaxAmount: t.notEmpty('总税额'),
            invoiceStatus: t.enum([0, 2, 7, 8], '发票状态'),
            invoiceRiskLevel: t.enum(['正常', '异常凭证', '疑点发票'], '发票风险等级描述'),
            entryMarkStatus: (name: string, value: any, obj: any) => {
                if (type === 'update') {
                    return t.enum(['01', '02', '03', '06'], '入账更新时历史的入账状态')(name, value);
                }
                return null;
            },
            entryMarkDate: (name: string, value: any, obj: any) => {
                // 入账时需要传入账日期
                if (nextEntryMarkStatus === '02' || nextEntryMarkStatus === '03') {
                    const flag = t.formatDate('YYYY-MM-DD', '入账日期')(name, value);
                    if (flag) {
                        return flag;
                    }
                    if (parseInt(value.replace(/-/g, '')) > parseInt(moment().format('YYYYMMDD'))) {
                        return '入账日期不能大于当前日期';
                    }
                }
                return null;
            },
            mxuuid: (name: string, value: any, obj: any) => {
                if (type === 'update' && !value) {
                    return '入账更新时mxuuid不能为空';
                }
                return null;
            },
            rzuuid: (name: string, value: any, obj: any) => {
                if (type === 'update' && !value) {
                    return '入账更新时rzuuid不能为空';
                }
                return null;
            }
        });
        const checkOptType = t.type({
            nextEntryMarkStatus: t.enum(['02', '03', '06'], '新的入账状态'),
            invoices: t.array(CheckInvoiceItemType, '入账的发票')
        });

        const decode = t.decode(initOpt, checkOptType);
        if (decode) {
            return {
                ...errcodeInfo.argsErr,
                description: decode
            };
        }
        const govList = transMarkInvoicesToGov(invoices);
        const jsonData = govList.map((item: any) => {
            let gxuuids = item.ZzfpDm + item.Zzfphm;
            if (item.Fphm && item.Fphm.length === 20) { // 数电票
                gxuuids = item.Fphm;
            }
            return {
                zhbz: item.Zhbz,
                gmfnsrsbh: item.Gmfnsrsbh,
                zzfpDm: item.ZzfpDm,
                kprq: item.Kprq,
                fphm: item.Fphm,
                zzfphm: item.Zzfphm,
                xsfnsrsbh: item.Xsfnsrsbh,
                xsfmc: item.Xsfmc,
                je: item.Je,
                se: item.Se,
                // fprzztDm: '00',
                fpfxdjDm: item.FpfxdjDm,
                fpfxdjmc: item.Fpfxdjmc,
                fplxDm: item.FplxDm,
                fplxmc: item.Fplxmc,
                fpkjztDm: item.FpkjztDm,
                fpkjztmc: item.Fpkjztmc,
                fppzDm: item.FppzDm,
                fplyDm: item.FplyDm,
                // kjhzfpdydlzfphm: "",
                rzytDm: nextEntryMarkStatus,
                rzyt_dm1: item.entryMarkStatus || '',
                rzsj: item.Rzsj,
                gxuuids: gxuuids,
                Mxuuid: item.Mxuuid || '',
                Rzuuid: item.Rzuuid || ''
            };
        });

        return {
            ...errcodeInfo.success,
            data: jsonData
        };
    }

    // 入账提交和更新入口
    async syncEntryMakInvoices(tokenInfo: any = {}, initOpt: any = {}, type = 'submit') {
        const ctx = this.ctx;
        let res: any;
        if (type === 'submit') {
            res = await this.entryMarkInvoices(tokenInfo, initOpt);
        } else {
            res = await this.entryMarkUpdateInvoices(tokenInfo, initOpt);
        }
        if (!initOpt.batchNo) {
            return res;
        }
        // 存在批次号，需要更新任务状态
        if (res.errcode !== '0000') {
            ctx.service.log.info('入账操作异常', res);
            const updateRes = await ctx.service.invoiceSave.updateSyncResult({
                ...res,
                data: {
                    batchNo: initOpt.batchNo
                }
            });
            ctx.service.log.info('更新异步任务状态返回', updateRes);
            return res;
        }
        ctx.service.log.info('入账操作成功', res);
        const resData = res.data || {};
        // 上传结果到s3
        const res2 = await ctx.service.invoiceSave.uploadSyncResult(initOpt.batchNo, resData);
        // 上传结果到s3失败，更新为失败
        if (res2.errcode !== '0000') {
            const updateRes = await ctx.service.invoiceSave.updateSyncResult({
                ...res2,
                data: {
                    batchNo: initOpt.batchNo
                }
            });
            ctx.service.log.info('上传存储异常，更新异步任务状态返回', res2, updateRes);
            return res;
        }
        const { originalUrl } = res2.data || {};
        // 处理成功，更新结果
        const resUpdate = await ctx.service.invoiceSave.updateSyncResult({
            ...errcodeInfo.success,
            data: {
                batchNo: initOpt.batchNo,
                fileList: [{
                    resFile: originalUrl,
                    resCount: ''
                }]
            }
        });
        ctx.service.log.info('更新异步任务状态返回', resUpdate);
        return res;
    }

    // 入账提交
    async entryMarkInvoices(tokenInfo: any = {}, initOpt: any = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('入账标识提交参数', initOpt);
        const optRes: any = await this.checkOpts(initOpt, 'submit');
        ctx.service.log.info('入账标识信息参数检查返回', optRes);
        if (optRes.errcode !== '0000') {
            return optRes;
        }

        const jsonData = optRes.data;
        ctx.service.log.info('可以进行入账标识提交的参数', jsonData);
        const urlPath = '/ypfw/FprzController/v1/saveFprzxx';
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);

        ctx.service.log.info('入账标识提交返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const checkRes: any = await this.checkByGov(tokenInfo, initOpt.invoices, initOpt.nextEntryMarkStatus);
        const { findList: cFindList, failList: allFailList } = checkRes.data;
        return {
            ...errcodeInfo.success,
            description: allFailList.length === 0 ? '操作成功' : '部分发票操作成功',
            data: {
                success: cFindList, // 状态改变成功
                fail: allFailList // 状态改变失败或者参数异常
            }
        };
    }

    // 入账更新
    async entryMarkUpdateInvoices(tokenInfo: any = {}, initOpt: any = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('入账标识更新参数', initOpt);
        const { nextEntryMarkStatus } = initOpt;
        if (nextEntryMarkStatus === '01') {
            return {
                ...errcodeInfo.argsErr,
                description: '已入账发票，无法调整成未入账状态'
            };
        }
        const optRes: any = await this.checkOpts(initOpt, 'update');
        ctx.service.log.info('入账标识调整checkOpts', optRes);
        if (optRes.errcode !== '0000') {
            return optRes;
        }
        const jsonData = optRes.data;
        ctx.service.log.info('可以进行入账标识调整参数', jsonData);
        const urlPath = '/ypfw/FprzController/v1/updateFprzxx';
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo,
            urlPath,
            jsonData
        );

        ctx.service.log.fullInfo('入账标识调整提交返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const checkRes: any = await this.checkByGov(tokenInfo, initOpt.invoices, initOpt.nextEntryMarkStatus);
        const { findList: cFindList, failList: allFailList } = checkRes.data;
        return {
            ...errcodeInfo.success,
            description: allFailList.length === 0 ? '操作成功' : '部分发票操作成功',
            data: {
                success: cFindList, // 状态改变成功
                fail: allFailList // 状态改变失败
            }
        };
    }
}
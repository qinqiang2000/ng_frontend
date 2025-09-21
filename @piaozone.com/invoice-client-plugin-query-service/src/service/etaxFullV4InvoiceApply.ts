/* eslint-disable no-undef,complexity,max-len */
import t from '../libs/validate';
import { govFullInvoiceTypes, fpyFullInvoiceTypes } from './etaxQueryFullInvoices';
const { syncQueryInvoiceSplitCache } = require('../constant.js');
const { join: pathJoin } = path;
const { transformGovType } = require('../libs/etaxInvoiceType');

// 进销项发票申请
export class EtaxFullV4InvoiceApply extends BaseService {
    // 检测参数是否正确
    async checkArgs(fOpt: any) {
        const ctx = this.ctx;
        const searchOpt = fOpt || {};
        let invoiceTypeArgs = searchOpt.invoiceTypes;
        const govInvoiceTypes = searchOpt.govInvoiceTypes;
        ctx.service.log.info('参数检查', searchOpt);
        if (!searchOpt.batchNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '批次号不能为空'
            };
        }

        let FplxDm: any = [];
        if (govInvoiceTypes && !govInvoiceTypes.includes('-1')) {
            FplxDm = govInvoiceTypes;
        } else {
            if ((invoiceTypeArgs && invoiceTypeArgs.includes(-1)) || (govInvoiceTypes && govInvoiceTypes.includes('-1'))) {
                invoiceTypeArgs = [-1];
            }
            let fplxRes: any = {};
            for (let i = 0; i < invoiceTypeArgs.length; i++) {
                fplxRes = ctx.service.etaxQueryFullInvoices.getInvoiceTypesParams(Number(invoiceTypeArgs[i]));
                if (fplxRes.errcode !== '0000') {
                    return fplxRes;
                }
                FplxDm = [...FplxDm, ...fplxRes.data];
            }
        }

        const { startDate, endDate } = searchOpt;
        let dataType = searchOpt.dataType;
        let fpztdm = ['01', '02', '03', '04'];
        const invoiceStatus = searchOpt.invoiceStatus === 0 ? 0 : parseInt(searchOpt.invoiceStatus || -1);
        if (invoiceStatus === -1) {
            fpztdm = ['01', '02', '03', '04'];
        } else if (invoiceStatus === 0) {
            fpztdm = ['01'];
        } else if (invoiceStatus === 2) {
            fpztdm = ['02'];
        } else if (invoiceStatus === 7) {
            fpztdm = ['04'];
        } else if (invoiceStatus === 8) {
            fpztdm = ['03'];
        } else {
            return {
                ...errcodeInfo.argsErr,
                description: `发票状态参数错误: ${invoiceStatus}`
            };
        }

        // 与税局参数值不一样
        if (dataType === 1) {
            dataType = 2;
        } else {
            dataType = 1;
        }
        const bodyJson = {
            Gjbq: dataType + '', // 1销项，2进项
            FpztDm: fpztdm,
            FplyDm: '0', // 发票来源
            FplxDm: FplxDm,
            Kprqq: startDate,
            Kprqz: endDate,
            DtBz: 'N',
            Sflzfp: '',
            PageNumber: 1,
            PageSize: 0
        };

        return {
            ...errcodeInfo.success,
            data: bodyJson
        };
    }

    // 查询全量列表
    async queryFullList(tokenInfo: any, govOpt: any, fopt: any) {
        const ctx = this.ctx;
        const urlPath = '/szzhzz/qlfpcx/v1/queryFpjcxx';
        const pageSize = fopt.pageSize || 100;
        const bodyJson = {
            'gjbq': govOpt.Gjbq,
            'fpztDm': govOpt.FpztDm,
            'fplyDm': '0',
            'fplxDm': govOpt.FplxDm,
            'kprqq': govOpt.Kprqq,
            'kprqz': govOpt.Kprqz,
            'tfrqq': govOpt.Kprqq,
            'tfrqz': govOpt.Kprqz,
            'sflzfp': '',
            'dtBz': 'N',
            'pageNumber': 1,
            'pageSize': pageSize
        };
        let goOn = true;
        let fullCount = 0;
        let fullInvoiceAmount = 0;
        let fullTotalTaxAmount = 0;
        const resultList = [];
        let hasError = false;
        const allInvoiceNos: any = [];
        let firstTotal;
        ctx.service.log.info('新增号码重复、总数变动拦截');
        do {
            const totalRes = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyJson);
            ctx.service.log.info('分页查询结果----', bodyJson.pageNumber, totalRes);
            if (totalRes.errcode !== '0000') {
                ctx.service.log.info('列表查询异常', totalRes);
                hasError = true;
                return totalRes;
            }
            const { List = [], Total } = totalRes.data || {};
            if (bodyJson.pageNumber === 1) {
                firstTotal = Total;
            } else if (firstTotal !== Total) { // 总发票数量发生变动
                ctx.service.log.info('发票总数变动导致异常', firstTotal, Total);
                hasError = true;
                return errcodeInfo.govErr;
            }
            const fphmList = [];
            for (let i = 0; i < List.length; i++) {
                const item = List[i];
                const curInvoiceNo = item.Fphm;
                // 发票号码出现重复，直接按照异常处理防止缺数据
                if (allInvoiceNos.includes(curInvoiceNo)) {
                    ctx.service.log.info('分页数据变动导致重复', curInvoiceNo);
                    hasError = true;
                    return errcodeInfo.govErr;
                }
                fphmList.push(curInvoiceNo);
                allInvoiceNos.push(curInvoiceNo);
            }
            if (fphmList.length > 0) {
                const res = await this.downloadFullFile(tokenInfo, {
                    ...bodyJson,
                    dcsjl: fphmList.length,
                    xzFphm: fphmList
                }, fopt);
                if (res.errcode !== '0000') {
                    goOn = false;
                    hasError = true;
                    return res;
                }
                const resData = res.data || {};
                const { invoiceNum, invoiceAmount = 0, totalTaxAmount = 0 } = resData.statisticsInfo || {};
                fullCount += invoiceNum;
                fullInvoiceAmount += parseFloat(invoiceAmount);
                fullTotalTaxAmount += parseFloat(totalTaxAmount);
                resultList.push({
                    resCount: resData.totalNum,
                    resFile: resData.fileUrl
                });
            }
            if (List.length < pageSize) {
                goOn = false;
            }
            bodyJson.pageNumber += 1;
        } while (goOn);

        const searchOpt = {
            govInvoiceTypes: fopt.govInvoiceTypes,
            invoiceStatus: fopt.invoiceStatus,
            startDate: fopt.startDate,
            endDate: fopt.endDate,
            dataType: fopt.dataType
        };
        if (hasError) {
            return errcodeInfo.govErr;
        }
        return {
            ...errcodeInfo.success,
            searchOpt,
            tongjiData: {
                fullCount: fullCount,
                fullInvoiceAmount: fullInvoiceAmount.toFixed(2),
                fullTotalTaxAmount: fullTotalTaxAmount.toFixed(2)
            },
            data: resultList
        };
    }

    // 检测发票数量是否超出范围
    async checkFpCount(tokenInfo: any, bodyJson: any, hashKey: string) { // 检查查询结果是否超过5000, 是否能直接下载
        const ctx = this.ctx;
        const kprqq = bodyJson.Kprqq;
        const kprqz = bodyJson.Kprqz;
        const days = moment(kprqz, 'YYYY-MM-DD').diff(moment(kprqq, 'YYYY-MM-DD'), 'days') + 1;
        const cachInfo = this.getSplitCahe(hashKey, kprqq, kprqz);
        // 有缓存之间提前
        if (cachInfo) {
            ctx.service.log.info('缓存的拆分信息', kprqq, kprqz, cachInfo);
            return {
                ...errcodeInfo.success,
                data: {
                    days,
                    total: cachInfo.total,
                    needSplit: cachInfo.needSplit
                }
            };
        }
        let urlPath = '/szzhzz/qlfpcx/v1/queryFpjcxx';
        const totalRes = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyJson);
        ctx.service.log.info('全量下票检查发票是否为空', kprqq, kprqz, totalRes);
        if (totalRes.errcode !== '0000') {
            return totalRes;
        }
        const { Total } = totalRes.data || {};
        if (Total === 0) {
            return {
                ...errcodeInfo.success,
                data: {
                    days,
                    total: Total,
                    needSplit: false
                }
            };
        }

        urlPath = '/szzhzz/DpldcsqController/v1/checkFpCount';
        const nextBodyJson = {
            ...bodyJson,
            dcsjl: Total
        };
        const countRes = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, nextBodyJson) || {}; // { data: { Code, FpmxCount，Dcsjl } }
        ctx.service.log.info('全量下票检查发票是否可以同步导出', kprqq, kprqz, countRes);
        if (countRes.description.indexOf('请限制开票日期') !== -1) {
            return {
                ...errcodeInfo.success,
                data: {
                    days,
                    total: Total,
                    needSplit: true
                }
            };
        }
        if (countRes.errcode === '95000' && countRes.description && countRes.description.indexOf('导出数据量不能为空或不能为零') !== -1) {
            return {
                ...errcodeInfo.success,
                data: {
                    days,
                    total: 0,
                    needSplit: false
                }
            };
        }
        if (countRes.errcode !== '0000') {
            return countRes;
        }
        const { Code, code, FpmxCount, Dcsjl } = countRes.data || {};
        return {
            ...countRes,
            data: {
                FpmxCount,
                Dcsjl,
                days,
                total: Total,
                needSplit: Code === 'N' || code === 'N'
            }
        };
    }

    // 计算下一个日期
    async getNextDate(tokenInfo: any, bodyJson: any, startDate: string, endDate: string, totalCheck: {
        hashKey: string,
        total: number,
        days: number,
        needSplit: boolean
    }) {
        const ctx = this.ctx;
        ctx.service.log.info('开始获取下一个日期', startDate, endDate);
        const nextDateObj = moment(startDate, 'YYYY-MM-DD');
        const endDateObj = moment(endDate, 'YYYY-MM-DD');
        let days: number = endDateObj.diff(nextDateObj, 'days');
        const hashKey = totalCheck.hashKey;
        if (!totalCheck.needSplit) {
            return {
                ...errcodeInfo.success,
                data: {
                    date: endDate,
                    total: totalCheck.total,
                    needSplit: totalCheck.needSplit
                }
            };
        }

        const kprqq = startDate;
        if (totalCheck.total > totalCheck.days * 2000) {
            ctx.service.log.info('总数量过大，直接取开始日期', totalCheck.total, days);
            days = 0;
        }
        const kprqz = days === 0 ? startDate : endDate;
        const incNum: any = Math.floor(days / 2);
        nextDateObj.add(incNum, 'days');

        const allowRes = await this.checkFpCount(tokenInfo, {
            ...bodyJson,
            Kprqq: kprqq,
            Kprqz: kprqz
        }, hashKey);
        if (allowRes.errcode !== '0000') {
            return allowRes;
        }
        const checkData = allowRes.data || {};
        // 更新拆分缓存
        this.updateSplitCache(hashKey, kprqq, kprqz, {
            total: checkData.total,
            needSplit: checkData.needSplit
        });

        // 没有超出范围或者已经是单天了
        if (!checkData.needSplit || kprqq === kprqz) {
            return {
                ...errcodeInfo.success,
                data: {
                    date: kprqz,
                    total: checkData.total,
                    needSplit: checkData.needSplit
                }
            };
        }

        const res: any = await this.getNextDate(tokenInfo, bodyJson, kprqq, nextDateObj.format('YYYY-MM-DD'), {
            hashKey,
            days: checkData.days,
            total: checkData.total,
            needSplit: checkData.needSplit
        });
        return res;
    }

    // 获取拆分缓存
    getSplitCahe(hashKey: string, startDate: string, endDate: string) {
        const subCacheKey = [startDate, endDate].join('_');
        const cachInfo = pwyStore.get(hashKey) || {};
        const curCache = cachInfo[subCacheKey] || {};
        if (typeof curCache.total !== 'undefined' && typeof curCache.needSplit !== 'undefined') {
            return curCache;
        }
        return false;
    }

    // 更新拆分缓存
    updateSplitCache(hashKey: string, startDate: string, endDate: string, info: any) {
        const subCacheKey = [startDate, endDate].join('_');
        const cachInfo = pwyStore.get(hashKey) || {};
        cachInfo[subCacheKey] = info;
        pwyStore.set(hashKey, cachInfo, 24 * 60 * 60);
    }

    // 根据发票数量进行动态拆分
    async splitQueryByInvoiceCount(tokenInfo: any, opt: any = {}, hashKey: string) {
        const ctx = this.ctx;
        const countRes = await this.checkFpCount(tokenInfo, opt, hashKey);
        if (countRes.errcode !== '0000') {
            return countRes;
        }

        const { total, needSplit, days } = countRes.data;
        // 更新拆分缓存
        this.updateSplitCache(hashKey, opt.Kprqq, opt.Kprqz, {
            total,
            needSplit
        });
        if (total === 0) {
            return {
                ...errcodeInfo.success,
                data: {
                    needSplit: false,
                    total: 0
                }
            };
        }

        // 不需要拆分
        if (!needSplit) {
            return {
                ...errcodeInfo.success,
                data: {
                    needSplit: false,
                    total,
                    list: [{
                        exportInfo: {
                            total,
                            needSplit
                        },
                        opt
                    }]
                }
            };
        }

        let nextStartObj = moment(opt.Kprqq, 'YYYY-MM-DD');
        const maxEnd = parseInt(opt.Kprqz.replace(/-/g, ''));
        let nextDateInt;
        const list = [];
        do {
            const kprqq = nextStartObj.format('YYYY-MM-DD');
            ctx.service.log.info('获取当期结束日期', kprqq, opt.Kprqz);
            const nextDateRes = await this.getNextDate(tokenInfo, opt, kprqq, opt.Kprqz, {
                hashKey,
                days,
                total,
                needSplit
            });
            if (nextDateRes.errcode !== '0000') {
                return nextDateRes;
            }
            ctx.service.log.info('获取当期结束日期返回', kprqq, opt.Kprqz, nextDateRes);
            const nextDateInfo = nextDateRes.data || {};
            const kprqz = nextDateInfo.date;
            // 中间有任何不能之间同步导出的之间返回
            /*
            if (nextDateInfo.needSplit) {
                return {
                    ...errcodeInfo.govErr,
                    description: `${kprqq}到${kprqz}总发票数量${nextDateInfo.total}, 超出税局同步查询发票范围`,
                    code: 'N'
                };
            }
            */

            list.push({
                exportInfo: {
                    total: nextDateInfo.total,
                    needSplit: nextDateInfo.needSplit
                },
                opt: {
                    ...opt,
                    Kprqq: kprqq,
                    Kprqz: kprqz
                }
            });
            nextStartObj = moment(kprqz, 'YYYY-MM-DD').add(1, 'days');
            nextDateInt = parseInt(nextStartObj.format('YYYYMMDD'));
        } while (nextDateInt <= maxEnd);
        return {
            ...errcodeInfo.success,
            data: {
                total,
                needSplit: true,
                list
            }
        };
    }

    async downloadFullFile(tokenInfo: any, bodyJson: any, opt: any) {
        const ctx = this.ctx;
        ctx.service.log.info('全量异步下票-开始下载excel文件', opt);
        const { fpdk_type } = ctx.request.query;
        const taxNo = tokenInfo.taxNo;
        const disableCache = !!opt.disableCache;
        const { dataType, invoiceTypes, govInvoiceTypes } = opt;
        const fileDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'fullInvoiceFile');
        const strBody = JSON.stringify(bodyJson);
        const md5Key = hex_md5(taxNo + strBody);
        const fileName = md5Key + '.xlsx';
        let res: any = {};
        const filePath = pathJoin(fileDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath, 24 * 60 * 60 * 1000) && !disableCache;
        ctx.service.log.info('全量异步下票-是否走缓存', isExsit);
        if (!isExsit) {
            ctx.service.log.info('全量异步下票-查询下载downloadId参数', bodyJson);
            const urlPath = '/szzhzz/qlfpcx/v1/queryFpjcxxId';
            res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyJson);

            if (res.errcode !== '0000') {
                return res;
            }
            const downloadId = res.data || '';
            if (!downloadId) {
                return errcodeInfo.govErr;
            }

            const exportUrl = '/szzhzz/qlfpcx/v1/queryFpjcxxDc?Id=' + downloadId;
            ctx.service.log.info('全量异步下载下票-下载文件地址：', exportUrl);
            res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath: fileDirPath,
                passFetch: true,
                fileName
            });
            ctx.service.log.info('全量异步下票-下载文件结果', res);
            if (res.errcode !== '0000') {
                return res;
            }
        }
        const uploadExcelArgs = {
            disableCache: true,
            taxNo,
            dataType,
            md5Key,
            fpdk_type,
            status: '',
            searchOpt: {
                ...opt,
                invoiceType: typeof govInvoiceTypes !== 'undefined' ? '-1' : invoiceTypes.join(',')
            }
        };
        ctx.service.log.info('全量异步下票-上传excel参数', uploadExcelArgs);
        const saveRes = await ctx.service.invoiceSaveFiles.saveExcel(filePath, uploadExcelArgs);
        return saveRes;
    }

    async apply(tokenInfo: any, originOpt: any) {
        const ctx = this.ctx;
        const checkOptType = t.type({
            dataType: t.enum([1, 2], '进销项类型'),
            invoiceTypes: t.arrayEnum([-1, ...fpyFullInvoiceTypes], {
                message: '发票云发票类型',
                enumAllValue: -1,
                allowEmpty: () => {
                    if (!originOpt.govInvoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            govInvoiceTypes: t.arrayEnum(['-1', ...govFullInvoiceTypes], {
                message: '税局发票类型',
                enumAllValue: '-1',
                allowEmpty: () => {
                    if (!originOpt.invoiceTypes) {
                        return '发票云发票类型或税局发票类型，请选择其中一种类型查询';
                    }
                    return true;
                }
            }),
            startDate: (name: string, value: string) => {
                let msg = t.formatDate('YYYY-MM-DD', '开票开始日期')(name, value);
                if (msg) {
                    return msg;
                }
                msg = t.formatDate('YYYY-MM-DD', { message: '开票结束日期' })('endDate', originOpt.endDate);
                if (msg) {
                    return msg;
                }
                const intStartDate = parseInt(value.replace(/-/g, ''));
                const endDate = originOpt.endDate;
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
            invoiceStatus: t.enum([-1, 0, 2, 7, 8], { message: '发票状态', allowEmpty: true }),
            fileTypes: t.arrayEnum([-1, 1, 2, 3], {
                message: '版式文件类型',
                enumAllValue: -1,
                allowEmpty: () => {
                    if (originOpt.applyFileFlag === true) {
                        return '申请版式文件时，版式文件类型不能为空!';
                    }
                    return true;
                }
            })
        });
        const decode = t.decode(originOpt, checkOptType);
        // 参数校验失败
        if (decode) {
            return {
                ...errcodeInfo.argsErr,
                description: decode
            };
        }
        const res = await this.query(tokenInfo, originOpt);
        const returnRes: any = {
            errcode: res.errcode,
            description: res.description,
            data: {
                batchNo: originOpt.batchNo,
                fileList: res.data || []
            }
        };

        if (res.tongjiData) {
            returnRes.data.tongjiData = res.tongjiData;
        }

        const updateRes = await ctx.service.invoiceSave.updateSyncResult(returnRes);
        ctx.service.log.info('更新异步任务状态返回', updateRes);

        if (res.errcode === '0000') {
            const { endDate, dataType } = originOpt;
            const curDateObj = moment();
            const endDateObj = moment(endDate, 'YYYY-MM-DD');
            // 进项包含近4天内的发票不统计
            if (dataType === 1 && curDateObj.diff(endDateObj, 'days') < 4) {
                return returnRes;
            }
            // 进项包含近1天内的发票不统计
            if (dataType === 2 && curDateObj.diff(endDateObj, 'days') < 1) {
                return returnRes;
            }
            const searchOpt = res.searchOpt || {};
            const { fullCount, fullInvoiceAmount, fullTotalTaxAmount } = res.tongjiData || {};
            const tongjiRes = await ctx.service.etaxFullV4Statics.statistics(tokenInfo, searchOpt);
            if (tongjiRes.errcode === '0000') {
                const { count, invoiceAmount, totalTaxAmount } = tongjiRes.data;
                const tip = `${fullCount}: ${count}, ${fullInvoiceAmount}: ${invoiceAmount}, ${fullTotalTaxAmount}: ${totalTaxAmount}`;
                if (count !== fullCount || invoiceAmount !== fullInvoiceAmount || totalTaxAmount !== fullTotalTaxAmount) {
                    ctx.service.log.info('全量查询与统计结果不一致', tip, searchOpt);
                } else {
                    ctx.service.log.info('全量查询与统计结果相同', tip, searchOpt);
                }
            } else {
                ctx.service.log.info('全量查询后调用统计失败', tongjiRes);
            }
        }
        return returnRes;
    }

    async query(tokenInfo: any, originOpt: any) {
        const ctx = this.ctx;
        const { taxNo, disabledCache } = ctx.request.query || {};
        const {
            dataType,
            govInvoiceTypes,
            invoiceTypes,
            startDate,
            endDate,
            batchNo,
            invoiceStatus
        } = originOpt;
        ctx.service.log.info('申请全量参数', originOpt);
        const fopt: any = {
            taxNo,
            dataType,
            govInvoiceTypes,
            invoiceTypes,
            startDate,
            endDate,
            invoiceStatus,
            batchNo,
            pageNo: '',
            pageSize: originOpt.pageSize || 100
        };
        const hashKey = syncQueryInvoiceSplitCache + hex_md5(JSON.stringify(fopt));
        fopt.disableCache = !!disabledCache;
        const cacheInfo = pwyStore.get(hashKey);
        ctx.service.log.fullInfo('拆分缓存', cacheInfo);
        // 禁用缓存时删除拆分缓存
        if (fopt.disableCache) {
            await pwyStore.delete(hashKey);
        }

        const checkRes = await this.checkArgs(fopt);
        ctx.service.log.info('异步全量处理开始', !!disabledCache, fopt);
        if (checkRes.errcode !== '0000') {
            ctx.service.log.info('参数异常', checkRes);
            return checkRes;
        }
        const checkResData = checkRes.data || {};
        const searchOpt = {
            govInvoiceTypes: checkResData.FplxDm,
            invoiceStatus: typeof invoiceStatus === 'undefined' ? -1 : invoiceStatus,
            startDate,
            endDate,
            dataType
        };
        if (originOpt.usePageQuery) {
            const resList = await this.queryFullList(tokenInfo, checkResData, fopt);
            return {
                ...resList,
                searchOpt
            };
        }
        const splitRes = await this.splitQueryByInvoiceCount(tokenInfo, checkResData, hashKey);
        ctx.service.log.info('拆分信息返回：', splitRes);
        // 拆分异常, 主要异常主要是请求税局数量和单天超出导出范围
        if (splitRes.errcode !== '0000') {
            return splitRes;
        }
        const { total, needSplit, list = [] } = splitRes.data || {};
        ctx.service.log.info('异步全量收票-当前范围总发票数量', dataType, invoiceTypes, startDate, endDate, total);
        ctx.service.log.info('异步全量收票-当前范围是否需要拆分', needSplit);
        // 没有数据
        if (total === 0) {
            const returnData = {
                ...errcodeInfo.success,
                searchOpt,
                data: [],
                tongjiData: {
                    fullCount: 0,
                    fullInvoiceAmount: 0,
                    fullTotalTaxAmount: 0
                },
                description: '当前日期范围无发票数据'
            };
            return returnData;
        }
        const splitList = [];
        let resultList: any = [];
        let fullCount = 0;
        let fullInvoiceAmount = 0;
        let fullTotalTaxAmount = 0;
        for (let i = 0; i < list.length; i++) {
            const exportInfo = list[i].exportInfo;
            const curItem = list[i].opt;
            const curKprqq = curItem.Kprqq;
            const curKprqz = curItem.Kprqz;
            ctx.service.log.info(`${curKprqq}到${curKprqz}发票数量`, curKprqq, curKprqz, exportInfo);
            splitList.push({
                ...exportInfo,
                kprqq: curKprqq,
                kprqz: curKprqz
            });
            // 没有发票数据不需要处理
            if (exportInfo.total === 0) {
                continue;
            }

            try {
                // 需要拆分的流程直接走分页逻辑
                if (exportInfo.needSplit) {
                    const resList = await this.queryFullList(tokenInfo, curItem, fopt);
                    ctx.service.log.info('异步全量-拆分后分页查询返回', resList);
                    if (resList.errcode !== '0000') {
                        return resList;
                    }
                    const tongjiData = resList.tongjiData;
                    const listData: any = resList.data;
                    fullCount += tongjiData.fullCount;
                    fullInvoiceAmount += parseFloat(tongjiData.fullInvoiceAmount);
                    fullTotalTaxAmount += parseFloat(tongjiData.fullTotalTaxAmount);
                    resultList = resultList.concat(listData);
                } else {
                    const res = await this.downloadFullFile(tokenInfo, curItem, fopt);
                    ctx.service.log.info('异步全量-拆分下载返回', curItem.Kprqq, curItem.Kprqz, res);
                    if (res.errcode !== '0000') {
                        return res;
                    }
                    const resData = res.data || {};
                    const { invoiceNum, invoiceAmount = 0, totalTaxAmount = 0 } = resData.statisticsInfo || {};
                    fullCount += invoiceNum;
                    fullInvoiceAmount += parseFloat(invoiceAmount);
                    fullTotalTaxAmount += parseFloat(totalTaxAmount);
                    resultList.push({
                        resCount: resData.totalNum,
                        resFile: resData.fileUrl
                    });
                }
            } catch (error) {
                ctx.service.log.info('异步全量-拆分下载异常', error);
                return errcodeInfo.fpyInnerErr;
            }
        }
        ctx.service.log.info('异步全量处理成功', total, splitList);
        return {
            ...errcodeInfo.success,
            searchOpt,
            tongjiData: {
                fullCount: fullCount,
                fullInvoiceAmount: fullInvoiceAmount.toFixed(2),
                fullTotalTaxAmount: fullTotalTaxAmount.toFixed(2)
            },
            data: resultList
        };
    }
}
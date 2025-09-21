/* eslint-disable no-undef,complexity,max-len */

const { syncQueryInvoiceSplitCache } = require('../constant.js');
const { join: pathJoin } = path;

// 进销项发票申请
export class EtaxFullInvoiceApply extends BaseService {
    // 检测参数是否正确
    async checkArgs(fOpt: any) {
        const ctx = this.ctx;
        const searchOpt = fOpt.searchOpt || {};
        let invoiceType = searchOpt.invoiceType;
        if (!invoiceType) {
            invoiceType = -1;
        }

        if (!searchOpt.batchNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '批次号不能为空'
            };
        }

        const invoiceTypeArgs = invoiceType === -1 ? [-1] : `${invoiceType}`.split(',');
        let fplxRes: any = {};
        let FplxDm: any = [];
        for (let i = 0; i < invoiceTypeArgs.length; i++) {
            fplxRes = ctx.service.etaxQueryFullInvoices.getInvoiceTypesParams(Number(invoiceTypeArgs[i]));
            if (fplxRes.errcode !== '0000') {
                return fplxRes.errcode;
            }
            FplxDm = [...FplxDm, ...fplxRes.data];
        }
        const checkRes = ctx.service.etaxQueryFullInvoices.createArgs(searchOpt, true); // 检查参数

        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const bodyJson = {
            ...checkRes.data,
            FplxDm,
            PageNumber: 1,
            PageSize: 0
        };
        return {
            ...errcodeInfo.success,
            data: bodyJson
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
            if (nextDateInfo.needSplit) {
                return {
                    ...errcodeInfo.govErr,
                    description: `${kprqq}到${kprqz}总发票数量${nextDateInfo.total}, 超出税局同步查询发票范围`,
                    code: 'N'
                };
            }

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

    async downloadFullFile(tokenInfo: any, bodyJson: any, fopt: any) {
        const ctx = this.ctx;
        ctx.service.log.info('全量异步下票-开始下载excel文件', fopt);
        const { fpdk_type } = ctx.request.query;
        const taxNo = tokenInfo.taxNo;
        const opt = fopt.searchOpt;
        const disableCache = !!fopt.disableCache;
        const { dataType } = opt;
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
        ctx.service.log.info('全量异步下票-上传excel参数', {
            taxNo,
            dataType,
            md5Key,
            fpdk_type,
            status: '',
            batchNo: opt.batchNo,
            searchOpt: opt
        });

        const saveRes = await ctx.service.invoiceSaveFiles.saveExcel(filePath, {
            disableCache: !!fopt.disableCache,
            taxNo,
            dataType,
            md5Key,
            fpdk_type,
            status: '',
            searchOpt: opt
        });
        ctx.service.log.info('全量异步下票-上传excel结果', saveRes);
        if (saveRes.errcode !== '0000') {
            return saveRes;
        }

        const data = saveRes.data || '';
        return {
            ...errcodeInfo.success,
            data: [data]
        };
    }

    // 发票下载结束，通知后台开始入库
    async noticeFinish(batchNo: string) {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query || {};
        const url = '/m17/bill/analysis/tax/batchno/finish?batchNo=' + batchNo + '&access_token=' + access_token;
        ctx.service.log.info('异步下票-完毕通知后端，数据开始入库', url);
        const resTip = await ctx.helper.curl(url, {
            method: 'GET',
            dataType: 'json',
            headers: {
                'revenueNumber': taxNo
            }
        });
        ctx.service.log.info('异步下票结束通知后返回', resTip);
        return resTip;
    }

    async apply(tokenInfo: any, originOpt: any) {
        const ctx = this.ctx;
        const { taxNo, disabledCache } = ctx.request.query || {};
        const {
            dataType,
            invoiceType,
            startDate,
            endDate,
            batchNo,
            invoiceStatus,
            disableCache
        } = originOpt;

        const fopt = {
            disableCache: disabledCache || disableCache,
            searchOpt: {
                taxNo,
                dataType,
                invoiceType,
                startTime: startDate,
                endTime: endDate,
                invoiceStatus: invoiceStatus || -1,
                batchNo,
                pageNo: '',
                pageSize: 500
            }
        };
        const hashKey = syncQueryInvoiceSplitCache + hex_md5(JSON.stringify(fopt.searchOpt));
        const cacheInfo = pwyStore.get(hashKey);
        ctx.service.log.fullInfo('拆分缓存', cacheInfo);
        // 禁用缓存时删除拆分缓存
        if (fopt.disableCache) {
            await pwyStore.delete(hashKey);
        }

        const checkRes = await this.checkArgs(fopt);

        ctx.service.log.info('异步全量处理开始', !!disabledCache, fopt);

        // status:
        // -1 请求过程中异常，会重试
        // -2 明确错误不再重试
        // 4 税局处理成功有数据，syncDataStatus不传
        // 4 税局处理成功没有数据，syncDataStatus传1
        if (checkRes.errcode !== '0000') {
            await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, -2, taxNo, checkRes);
            ctx.service.log.info('参数异常', checkRes);
            return checkRes;
        }

        const splitRes = await this.splitQueryByInvoiceCount(tokenInfo, checkRes.data, hashKey);
        // 拆分异常, 主要异常主要是请求税局数量和单天超出导出范围
        if (splitRes.errcode !== '0000') {
            ctx.service.log.info('拆分异常', splitRes);
            const status = splitRes.code === 'N' ? -2 : -1;
            await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, status, taxNo, splitRes);
            return splitRes;
        }
        const { total, needSplit, list = [] } = splitRes.data || {};
        ctx.service.log.info('异步全量收票-当前范围总发票数量', dataType, invoiceType, startDate, endDate, total);
        ctx.service.log.info('异步全量收票-当前范围是否需要拆分', needSplit);

        // 没有数据
        if (total === 0) {
            const returnData = {
                ...errcodeInfo.success,
                data: [],
                description: '当前日期范围无发票数据'
            };
            await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, 4, taxNo, returnData, 1);
            return returnData;
        }
        const splitList = [];
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
                const res = await this.downloadFullFile(tokenInfo, curItem, fopt);
                if (res.errcode !== '0000') {
                    await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, -1, taxNo, res);
                    return res;
                }
                ctx.service.log.info('异步全量-拆分下载返回', curItem.Kprqq, curItem.Kprqz, res);
            } catch (error) {
                ctx.service.log.info('异步全量-拆分下载异常', error);
                await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, -1, taxNo, errcodeInfo.fpyInnerErr);
                return errcodeInfo.fpyInnerErr;
            }
        }
        ctx.service.log.info('异步全量处理成功');
        const noticeRes = await this.noticeFinish(batchNo);
        ctx.service.log.info('通知返回', noticeRes);
        const finishRes = {
            errcode: noticeRes.errcode,
            description: `当前总数: ${total}, 采集描述：${noticeRes.description}`
        };
        const finishStatus = noticeRes.errcode === '0000' ? 4 : -1;
        await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, finishStatus, taxNo, finishRes);
        return {
            ...noticeRes,
            data: {
                batchNo,
                dataType,
                invoiceType,
                startDate,
                endDate,
                total,
                splitList
            }
        };
    }
}
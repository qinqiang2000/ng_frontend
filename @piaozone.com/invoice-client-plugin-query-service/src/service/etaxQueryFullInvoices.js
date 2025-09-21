/* eslint-disable no-undef, no-unused-vars, complexity*/

// import { BaseService } from './baseService';
// import errcodeInfo from '$client/errcodeInfo';
// import moment from 'moment';
import { jxInvoices, jxInvoicesJson, jxInvoicesFuJian, jxInvoicesByTitle } from '../libs/fullInvoiceExcel';
// import { join as pathJoin } from 'path';
import { hex_md5 } from '../libs/md5';
import { sleep } from '../libs/tools';
// import { getUrlYzm } from '$utils/tools';
const { join: pathJoin } = path;
const encrypt = aesEncrypt;

export const govFullInvoiceTypes = [
    '01',
    '03',
    '08',
    '81',
    '82',
    '04',
    '10', // 电子普通发票
    '15',
    '11', // 卷票
    '14', // 通行费
    '85', // 数电纸质发票（增值税专用发票）
    '86', // 数电纸质发票（普通发票）
    '87', // 数电纸质发票（机动车销售统一发票）
    '88', // 数电纸质发票（二手车销售统一发票）
    '61'
];

export const fpyFullInvoiceTypes = [1, 2, 3, 4, 5, 12, 13, 15, 26, 27, 28];
export class EtaxQueryFullInvoices extends BaseService {
    getInvoiceTypesParams(invoiceType) {
        let fplxDmArr = [];
        // 1、普通电子发票, 2、电子发票专票, 3、普通纸质发票, 4、专用纸质发票, 5、普通纸质卷票发票,
        if (invoiceType === -1) {
            // 全部发票，旧版只支持，2，电子专票，4增值税专用发票，12机动车发票，15通行费发票
            fplxDmArr = govFullInvoiceTypes;
        } else {
            const fplxType = { // 85 数电纸质发票（增值税专用发票）, 86 数电纸质发票（普通发票）
                'k26': '82', // 数电票-普通发票
                'k27': '81', // 数电票-增值税专用发票
                'k4': '01', // 增值税专用发票
                'k2': '08', // 增值税电子专用发票
                'k12': '03', // 机动车销售统一发票
                'k13': '15', // 二手车销售统一发票
                'k1': '10', // 增值税电子普通发票
                'k15': '10', // 通行费发票税局也是电子普通发票
                'k3': '04', // 增值税普通发票
                'k5': '11' // 卷票
            };
            if (!fplxType['k' + invoiceType]) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `不支持的发票类型:${invoiceType}`
                };
            }
            // 税局没有单独的通行费发票，它可能包含在电子普通发票和纸质普通发票里面
            if (invoiceType === 15) {
                fplxDmArr = ['10', '04', '14'];
            } else if (invoiceType === 12) { // 机动车发票，数电纸质发票（机动车销售统一发票）
                fplxDmArr = ['03', '87'];
            } else if (invoiceType === 13) { // 二手车销售统一发票，数电纸质发票（二手车销售统一发票）
                fplxDmArr = ['15', '88'];
            } else if (invoiceType === 4) {
                fplxDmArr = ['01', '85'];
            } else if (invoiceType === 3) {
                fplxDmArr = ['04', '86'];
            } else {
                fplxDmArr = [fplxType['k' + invoiceType]];
            }
        }
        const result = new Set(fplxDmArr);
        return {
            errcode: '0000',
            data: [...result]
        };
    }

    createArgs(opt, disableInvoiceType) {
        // const ctx = this.ctx;
        let invoiceType = parseInt(opt.invoiceType || -1);

        // 控制指定查询的数量不超过100
        if (opt.invoices) {
            // if (opt.invoices.length > 100) {
            //     return {
            //         ...errcodeInfo.argsErr,
            //         description: '指定发票的数量不能超过100'
            //     };
            // }
            invoiceType = -1;
        }

        // const fplxRes = this.getInvoiceTypesParams(invoiceType);
        let fplxRes = {};
        if (!disableInvoiceType) {
            fplxRes = this.getInvoiceTypesParams(invoiceType);
        }

        const startTime = opt.startTime;
        const endTime = opt.endTime;
        if (!startTime || !endTime) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票日期起止不能为空'
            };
        }
        if (startTime.length !== 10 && endTime.length !== 10) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票日期起止格式错误'
            };
        }
        const tpEndTime = moment(endTime, 'YYYY-MM-DD');
        const tpStartTime = moment(startTime, 'YYYY-MM-DD');
        if (tpEndTime.diff(tpStartTime, 'days') < 0) {
            return {
                ...errcodeInfo.argsErr,
                description: '开始日期必须小于截止日期'
            };
        }

        // 如果指定发票，起止日期范围可以在一年内
        if (opt.invoices) {
            const isLeapYear = tpEndTime.isLeapYear();
            const r = tpEndTime.diff(tpStartTime, 'days');
            if (r > 365 || (isLeapYear && r > 366)) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '开票日期起止范围不能超过1年'
                };
            }
        } else if (tpEndTime.diff(tpStartTime, 'days') > 31) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票日期起止范围不能超过31天'
            };
        }

        if (!disableInvoiceType && fplxRes.errcode !== '0000') {
            return fplxRes;
        }

        let fpztdm = ['01', '02', '03', '04'];
        const invoiceStatus = opt.invoiceStatus === 0 ? 0 : parseInt(opt.invoiceStatus || -1);
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
        } else if (invoiceStatus === 3) { // 红冲
            fpztdm = ['03', '04']; // 全额红冲，和部分红冲
        } else {
            return errcodeInfo.argsErr;
        }

        let dataType = parseInt(opt.dataType);

        if (dataType !== 1 && dataType !== 2) {
            return {
                ...errcodeInfo.argsErr,
                description: '查询类型参数错误'
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
            FplxDm: fplxRes.data,
            Kprqq: opt.startTime,
            Kprqz: opt.endTime,
            DtBz: 'N',
            Sflzfp: ''
        };

        if (opt.invoiceCode) {
            bodyJson.ZzfpDm = opt.invoiceCode;
        }

        if (opt.invoiceNo) {
            bodyJson.Zzfphm = opt.invoiceNo;
        }

        if (opt.qdInvoiceNo) {
            bodyJson.fphm = opt.qdInvoiceNo;
        }

        // 指定发票号码时，状态都恢复为全部
        if (opt.invoices) {
            bodyJson.XzFphm = opt.invoices;
            bodyJson.Fpztdm = ['01', '02', '03', '04'];
        }

        return {
            ...errcodeInfo.success,
            data: bodyJson
        };
    }

    // 定时任务申请
    async timerApply(access_token, tokenInfo) {
        const ctx = this.ctx;
        const { clientType = 4 } = ctx.request.body;
        if (clientType !== 4) {
            return errcodeInfo.argsErr;
        }
        const curDate = moment();
        const applyDate = curDate.format('YYYY-MM-DD HH:mm:ss');
        // 通行费包含在电子普通发票里面
        const fullInvoiceTypes = [1, 2, 3, 4, 12, 13];
        await ctx.service.etaxQueryFullInvoices.handleErrorApply(access_token, tokenInfo);
        // 先申请当前月
        await ctx.service.etaxQueryFullInvoices.downloadApply(access_token, tokenInfo, {
            searchOpt: {
                startDate: curDate.format('YYYY-MM-01'),
                endDate: curDate.format('YYYY-MM-DD'),
                categories: [1, 2],
                invoiceTypes: fullInvoiceTypes
            }
        });

        const dNum = curDate.get('date');
        // 需要申请前一个月的发票
        if (dNum >= 2) {
            const res = await ctx.service.downloadApplyCheck.getPreMonthUnApply(access_token, applyDate, clientType);
            if (res.errcode !== '0000') {
                return res;
            }
            const resData = res.data || [];
            for (let i = 0; i < resData.length; i++) {
                const curData = resData[i];
                const applyData = {
                    searchOpt: {
                        startDate: curData.startDate,
                        endDate: curData.endDate,
                        categories: curData.categories,
                        invoiceTypes: curData.invoiceTypes.filter((type) => {
                            return fullInvoiceTypes.indexOf(type) !== -1;
                        })
                    }
                };
                await ctx.service.etaxQueryFullInvoices.downloadApply(access_token, tokenInfo, applyData);
            }
        }
        return errcodeInfo.success;
    }

    // 处理错误申请
    async handleErrorApply(access_token, tokenInfo) {
        const ctx = this.ctx;
        const res = await ctx.service.downloadApplyAccount.query(access_token, {
            applyStatus: [1]
        });

        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || [];
        for (let i = 0; i < resData.length; i++) {
            const curData = resData[i];
            const { fapplyDate = '', fstartDate, fendDate, fdownloadType, finvoiceType } = curData;
            const startDateStr = fstartDate.substr(0, 10);
            const endDateStr = fendDate.substr(0, 10);
            if (!fapplyDate) {
                continue;
            }
            const applyData = {
                applyDate: fapplyDate,
                startDateStr,
                endDateStr,
                dataType: fdownloadType,
                invoiceType: finvoiceType
            };
            await this.handleOneApply(access_token, tokenInfo, applyData, true);
        }
        return errcodeInfo.success;
    }

    // 处理一条申请记录
    async handleOneApply(access_token, tokenInfo, data = {}, syncFlag) {
        const ctx = this.ctx;
        const { clientType = 4 } = ctx.request.body;
        const {
            dataType,
            invoiceType,
            startDateStr,
            endDateStr,
            applyDate
        } = data;

        const applyeData = {
            applyDate: applyDate,
            applyStatus: 9, // 正在处理中
            startDate: startDateStr,
            endDate: endDateStr,
            invoiceNumber: 0,
            totalAmount: 0,
            totalTaxAmount: 0,
            categories: [dataType],
            invoiceTypes: [invoiceType],
            failDescription: ''
        };
        ctx.service.log.info('start downloadApply', applyeData);
        await ctx.service.downloadApplyAccount.save(access_token, applyeData);
        const handleApply = async() => {
            const res = await ctx.service.etaxQueryFullInvoices.queryInvoices(access_token, tokenInfo, {
                clientType,
                searchOpt: {
                    dataType: dataType,
                    invoiceType: invoiceType,
                    invoiceCode: '',
                    invoiceNo: '',
                    salerTaxNo: '',
                    invoiceStatus: '',
                    startTime: startDateStr,
                    endTime: endDateStr
                },
                dataIndex: 0
            });
            const resData = res.data || [];
            const tongjiInfo = res.tongjiInfo || {};
            let applyStatus = 7;
            let failDescription = '';
            if (res.errcode !== '0000') {
                failDescription = res.description;
                applyStatus = 1;
            } else if (resData.length === 0) {
                applyStatus = 4;
            }
            // 现在只支持通用token的日志保存，后台还没有接口支持
            if (clientType === 4) {
                await ctx.service.downloadApplyAccount.save(access_token, {
                    applyDate: applyDate,
                    applyStatus,
                    startDate: startDateStr,
                    endDate: endDateStr,
                    invoiceNumber: tongjiInfo.invoiceNum,
                    totalAmount: tongjiInfo.totalAmount,
                    totalTaxAmount: tongjiInfo.totalTaxAmount,
                    categories: [dataType],
                    invoiceTypes: [invoiceType],
                    failDescription: failDescription
                });
            }
        };

        // 同步模式
        if (syncFlag === true) {
            await handleApply();
        } else {
            ctx.runInBackground(async() => {
                await sleep(2000);
                await handleApply();
            });
        }
        return errcodeInfo.success;
    }

    // 进销项申请兼容
    async downloadApply(access_token, tokenInfo, fopt = {}) {
        const ctx = this.ctx;
        const searchOpt = fopt.searchOpt || {};
        const invoiceTypes = searchOpt.invoiceTypes || [];
        const categories = searchOpt.categories || [];
        const startDate = moment(searchOpt.startDate, 'YYYY-MM-DD');
        const endDate = moment(searchOpt.endDate, 'YYYY-MM-DD');
        const taxNo = tokenInfo.taxNo || '';
        const cacheKey = hex_md5(JSON.stringify(fopt) + taxNo);
        const isCached = await ctx.app.redis.get(cacheKey);
        const clientType = parseInt(fopt.clientType || 4);
        if (isCached) {
            return {
                ...errcodeInfo.argsErr,
                description: '10分钟内，请勿重复申请!'
            };
        }
        // 锁定10分钟
        await ctx.app.redis.set(cacheKey, 1, 'EX', 10 * 60);
        for (let i = 0; i < categories.length; i++) {
            const dataType = categories[i];
            for (let j = 0; j < invoiceTypes.length; j++) {
                const invoiceType = invoiceTypes[j];
                let nextDate = moment(searchOpt.startDate, 'YYYY-MM-DD');
                let goOnFlag = true;
                do {
                    const startDateStr = nextDate.startOf('month').diff(startDate, 'days') < 0
                        ? startDate.format('YYYY-MM-DD') : nextDate.format('YYYY-MM-01');
                    const endDateStr = nextDate.endOf('month').diff(endDate, 'days') > 0
                        ? endDate.format('YYYY-MM-DD') : nextDate.endOf('month').format('YYYY-MM-DD');
                    const applyDate = moment().format('YYYY-MM-DD HH:mm:ss');

                    await ctx.service.etaxQueryFullInvoices.handleOneApply(access_token, tokenInfo, {
                        startDateStr,
                        endDateStr,
                        applyDate,
                        invoiceType,
                        dataType
                    }, clientType);

                    nextDate = nextDate.add(1, 'month').startOf('month');
                    if (nextDate.diff(endDate, 'days') > 0 || nextDate.diff(moment(), 'days') > 0) {
                        goOnFlag = false;
                    }
                } while (goOnFlag);
            }
        }
        return errcodeInfo.success;
    }


    // 通过接口查询是否有发票
    async queryInvoiceApi(access_token, tokenInfo, fopt = {}, isSupportInvoiceTypes) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        // let dataIndex = fopt.dataIndex || 0;
        // dataIndex = parseInt(dataIndex);
        ctx.service.log.info('通过接口查询是否有发票 开始 --------------', fopt, isSupportInvoiceTypes);
        let FplxDm = [];
        if (isSupportInvoiceTypes) {
            const invoiceTypeArgs = (opt.invoiceType === -1 || !opt.invoiceType) ? [-1] : `${opt.invoiceType}`.split(',');
            let fplxRes = {};
            for (let i = 0; i < invoiceTypeArgs.length; i++) {
                fplxRes = this.getInvoiceTypesParams(Number(invoiceTypeArgs[i]));
                if (fplxRes.errcode === '0000') {
                    FplxDm = [...FplxDm, ...fplxRes.data];
                }
            }
            if (fplxRes.errcode !== '0000') {
                return fplxRes;
            }
        }
        const checkRes = this.createArgs(opt, isSupportInvoiceTypes);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        if (!isSupportInvoiceTypes) {
            FplxDm = checkRes.data.FplxDm;
        }

        const bodyJson = {
            ...checkRes.data,
            FplxDm,
            PageNumber: 1,
            PageSize: 10
        };
        ctx.service.log.info('通过接口查询是否有发票 请求参数 --------------', bodyJson);
        // const strBody = JSON.stringify(bodyJson);
        const urlPath = '/szzhzz/qlfpcx/v1/queryFpjcxx';

        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: strBody
        // });
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyJson);
        ctx.service.log.info('通过接口查询是否有发票 结果 --------------', res);
        return res;
    }

    // 通过导出查询
    /* eslint-disable */
    async queryInvoices(access_token, tokenInfo, fopt = {}, needData, originFile) {
        const ctx = this.ctx;
        ctx.service.log.info('plugin service --------------', fopt);
        const { fpdk_type } = ctx.request.query;
        const taxNo = tokenInfo.taxNo;
        const opt = fopt.searchOpt || {};
        const { pageNo = '', pageSize = 500 } = opt;
        const dataType = parseInt(opt.dataType);
        // let dataIndex = fopt.dataIndex || 0;
        // dataIndex = parseInt(dataIndex);
        const clientType = parseInt(fopt.clientType || 4);
        const checkRes = this.createArgs(opt);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const bodyJson = {
            ...checkRes.data,
            PageNumber: 1,
            PageSize: 0
        };
        const fileDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'fullInvoice');
        const strBody = JSON.stringify(bodyJson);
        const md5Key = hex_md5(taxNo + strBody);
        const fileName = md5Key + '.xlsx';

        // 尝试读取json缓存中的数据
        // const jsonFileName = hex_md5(taxNo + strBody) + '.json';
        // const jsonFilePath = pathJoin(fileDirPath, jsonFileName);
        // const isExsitJsonFile = ctx.service.collectCacheTool.checkFileIsExsit(jsonFilePath, 24 * 60 * 60 * 1000);
        // if (isExsitJsonFile) { // 读取json缓存
        //     const dataJson = jxInvoicesJson(jsonFilePath);
        //     ctx.service.log.info('读取json缓存', typeof dataJson.data, jsonFilePath);
        //     if (dataJson.errcode === '0000') {
        //         // 分页处理
        //         const { pageNo = '', pageSize = 500 } = opt;
        //         const jsonData = JSON.parse(dataJson.data);
        //         const resDataJson = await ctx.service.ntTools.paginationProcessing(jsonData, pageNo, pageSize);

        //         if (fpdk_type === '3' && resDataJson.errcode === '0000' && resDataJson.data.length > 0 && !notSave) {
        //             const saveInfo = {
        //                 taxNo,
        //                 clientType,
        //                 dataType,
        //                 pageNo: pageNo,
        //                 pageSize: pageSize,
        //                 totalElement: jsonData.length
        //             };
        //             const saveRes = await this.saveEtax(resDataJson.data, saveInfo);
        //             if (!saveRes || saveRes.errcode !== '0000') {
        //                 return saveRes || errcodeInfo.fpyInnerErr;
        //             }
        //         }
        //         if (resDataJson.errcode === '0000') {
        //             ctx.service.log.info('resDataJson.data.length', resDataJson.data.length);
        //             return resDataJson;
        //         }
        //     } else {
        //         ctx.service.log.info('读取json缓存出错', dataJson);
        //     }
        // }

        const specialCacheTime = 3 * 60 * 60 * 1000;
        const specialCacheTimeTaxNo = [];
        const isSpecialCacheTimeTaxNo = specialCacheTimeTaxNo.some(c => c === taxNo);

        let filePath = pathJoin(fileDirPath, fileName);
        let isExsit = fs.existsSync(filePath);
        isExsit = isSpecialCacheTimeTaxNo ? (ctx.service.collectCacheTool.checkFileIsExsit(filePath, specialCacheTime) && !fopt.disableCache) : isExsit;
        ctx.service.log.info('isSpecialCacheTimeTaxNo', isSpecialCacheTimeTaxNo, 'fileName:', fileName, 'filePath:', filePath, );
        let res;
        // 计算有效时间、缓存
        let timeout = 0;
        if (isExsit && !isSpecialCacheTimeTaxNo) {
            const fileStat = fs.statSync(filePath);
            const createTime = parseInt(fileStat.ctimeMs);
            const ruleTimeout = +new Date(`${moment().format('YYYY-MM-DD')} 05:00:00`); // 当天凌晨五点
            const curTime = +new Date(); // 当前时间
            const minTimeout = 60 * 60 * 1000; // 最小时间

            if (createTime > ruleTimeout - minTimeout) {// 04:00:00 -- 23:59:59
                timeout = 24 * 60 * 60 * 1000 + ruleTimeout - curTime;
            } else if (createTime <= ruleTimeout - minTimeout) {
                timeout = ruleTimeout - curTime;
                ctx.service.log.info('timeout-1', timeout);
                if (timeout > 24 * 60 * 60 * 1000 || timeout < 0) {
                    timeout = 0;
                }
            }
            ctx.service.log.info('createTime', createTime);
            isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath, timeout) && !fopt.disableCache;
        }
        ctx.service.log.info('excel 是否走缓存:', isExsit, `disableCache: ${fopt.disableCache}`, 'timeout:', timeout);
        if (!isExsit) {
            // 缓存文件不存在则需要检测登录,并对登录失效的状态重新登录
            const checkRes2 = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes2.errcode !== '0000') {
                return checkRes2;
            }
            tokenInfo = checkRes2.data;
            if (tokenInfo.etaxAccountType !== 2 && tokenInfo.etaxAccountType !== 3) {
                return { ...errcodeInfo.govEtaxAccountTypeErr };
            }

            if (typeof opt.invoices === 'undefined') {
                const isSupportInvoiceTypes = false;
                // const res1 = await this.queryInvoiceApi(access_token, tokenInfo, fopt, isSupportInvoiceTypes);
                const res1 = await this.checkFpCount(access_token, tokenInfo, bodyJson, fopt, isSupportInvoiceTypes); // 检查是否有发票，是否能一次性下载完
                if (res1.errcode !== '0000') {
                    return res1;
                }
                // const { List = [] } = res1.data || {};
                if (res1.Total === 0) {
                    return {
                        ...errcodeInfo.success,
                        data: [],
                        tongjiInfo: {
                            totalAmount: '0',
                            totalTaxAmount: '0',
                            invoiceAmount: '0',
                            invoiceNum: 0
                        }
                    };
                }
                const { Code, code } = res1.data; // code:Y、N, FpmxCount, Dcsjl
                if (Code === 'N' || code === 'N') { // 查询结果超过5000条数据，或者明细超过40000条，则把查询日期按天拆分；
                    ctx.service.log.info('同步下载--全量发票无法一次下载完--走拆分逻辑');
                    const isSynchronization = true;
                    const fileRes = await this.queryInvoicesFileStart(access_token, tokenInfo, fopt, bodyJson, res1, isSynchronization);
                    if (fileRes.errcode !== '0000') {
                        return fileRes;
                    }
                    let dataRes = await this.getAndSpliceInvocies(fileRes.data, fopt);
                    dataRes= {
                        totalElement: res1.Total,
                        ...dataRes
                    };
                    if (ctx.request.query.fetchOrigin === 'local' || needData) {
                        return dataRes;
                    }
                    const res = await ctx.service.invoiceCache.saveLongMsgInvoices('', dataRes);
                    return res; // 走拆分下载--异步逻辑，实际是同步
                }
            }

            ctx.service.log.info('全量发票查询参数', bodyJson);
            const urlPath = '/szzhzz/qlfpcx/v1/queryFpjcxxId';

            // res = await ctx.service.nt.ntCurl(tokenInfo.pageId, '/szzhzz/qlfpcx/v1/queryFpjcxxDc?t=' + (+new Date()), {
            // res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
            //     dataType: 'json',
            //     method: 'post',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: strBody
            // });
            res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyJson);

            if (res.errcode !== '0000') {
                return res;
            }
            const downloadId = res.data || '';
            if (!downloadId) {
                return errcodeInfo.govErr;
            }

            const exportUrl = '/szzhzz/qlfpcx/v1/queryFpjcxxDc?Id=' + downloadId + '&timeStampId=' + (+new Date());
            ctx.service.log.info('exportUrl', exportUrl);
            res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath: fileDirPath,
                passFetch: true,
                fileName
            });
            if (res.errcode !== '0000') {
                return res;
            }
            filePath = res.data.filePath;
        }
        if (originFile) {
            ctx.service.log.info('------返回原始文件路径-------');
            return {
                ...errcodeInfo.success,
                dataType,
                filePath,
                md5Key,
                fopt
            };
        }
        ctx.service.log.info('------开始上传excel文件到后端解析-------');

        // ---------后端解析 start---------
        res = await ctx.service.invoiceSaveFiles.saveExcel(filePath, {
            disableCache: !!fopt.disableCacheExcel,
            taxNo,
            clientType,
            dataType,
            md5Key,
            fpdk_type,
            searchOpt: opt.invoices ? {
                ...opt,
                invoiceType: -1,
                invoiceStatus: ''
            } : opt
        });
        ctx.service.log.info('------后端解析excel文件 结果--------', res);
        if (res.errcode === '0000') {
            let originalUrl = res.data; // 'http://172.18.1.34:7001/doc/free/fileInfo/preview/f11417881737721323524109438153';
            if (typeof res.data !== 'string') {
                originalUrl = res.data.fileUrl
            }
            if (ctx.request.query.fetchOrigin === 'local' || needData) {
                res = await ctx.service.invoiceSaveFiles.getData(originalUrl);
                ctx.service.log.info('------读取文件 结果--------', res);
                return res;
            }
            const { client_id, tenantNo } = ctx.request.query;
            const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
            return {
                errcode: '0000',
                msgType: 'downloadFile',
                data: encrypt(JSON.stringify({ url: originalUrl }), encryptKey)
            };
        }

        // ---------后端解析 end---------
        ctx.service.log.info('------后端解析excel文件失败，采取客户端解析--------');
        return res;
        /*
        // if (tokenInfo.homeUrl.indexOf("fujian") !== -1) {
        //     res = jxInvoicesFuJian(filePath, opt);
        // } else {
        //     res = jxInvoices(filePath, opt);
        // }
        res = jxInvoicesByTitle(filePath, opt, ctx);
        ctx.service.log.info('------客户端解析结果--------', opt);
        res = this.filterMotorVehicleDesc(res);

        // ctx.service.log.info('------开始生成json文件--------');
        // // 把数据存在json文件
        // const resJsonFile = await ctx.service.nt.ntWriteJson(tokenInfo.pageId, jsonFilePath, {
        //     saveDirPath: fileDirPath,
        //     data: res.data
        // });
        // ctx.service.log.info('------生成json文件成功--------', resJsonFile);
        // 分页处理
        const pageRes = await ctx.service.ntTools.paginationProcessing(res.data, pageNo, pageSize);
        if (pageRes.errcode !== '0000') {
            return pageRes;
        }
        res = {
            ...pageRes,
            tongjiInfo: res.tongjiInfo
        }
         const resData = res.data || [];

        if (fpdk_type === '3' && resData.length > 0 && !needData) {
            const saveRes = await this.saveEtax(resData, {
                taxNo,
                clientType,
                dataType,
                pageNo: pageNo,
                pageSize: pageSize,
                totalElement: resData.length
            });
            if (!saveRes || saveRes.errcode !== '0000') {
                return saveRes || errcodeInfo.fpyInnerErr;
            }
        }
        if (ctx.request.query.fetchOrigin === 'local' || needData) {
            return res;
        }
        const resStr = JSON.stringify(res);
        if (resStr.length < 1000) {
            ctx.service.log.info('------数据长度比较小不需要s3缓存--------', resStr.length);
            return res;
        }
        const LongRes = await ctx.service.invoiceCache.saveLongMsgInvoices('', resStr);
        ctx.service.log.info('------长报文缓存结果--------', LongRes);
        return LongRes;
        */
    }

    async saveEtax(resData, opt = {}) {
        const ctx = this.ctx;
        const { dataType } = opt;
        let saveRes = errcodeInfo.success;
        // 1销项，2进项
        if (dataType === 1) {
            saveRes = await ctx.service.invoiceSave.saveEtaxInputFullInvoices(resData, opt);
        } else {
            saveRes = await ctx.service.invoiceSave.saveEtaxOutputFullInvoices(resData, opt);
        }
        if (!saveRes || saveRes.errcode !== '0000') {
            return saveRes || errcodeInfo.fpyInnerErr;
        }
        return {
            ...errcodeInfo.success
        };
    }

    filterMotorVehicleDesc(res) { // 机动车如果只有一行明细，把明细里面的税率等信息提取到表头里面
        const ctx = this.ctx;
        const list = res.data;
        const nextList = [];
        for(let i = 0; i < list.length; i++) {
            let curInvoice = list[i]
            if (parseInt(curInvoice.invoiceType) === 12) {
                if (curInvoice.items && curInvoice.items.length > 1) {
                    ctx.service.log.info('该机动车发票明细不止一条：', curInvoice.invoiceNo, curInvoice.invoiceCode, curInvoice.items);
                }
                if (curInvoice.items && curInvoice.items.length > 0) {
                    const firstItem = curInvoice.items[0];
                    curInvoice = {
                        ...curInvoice,
                        ...firstItem
                    }
                }

            }
            nextList.push(curInvoice);
        }

        return {
            ...res,
            data: nextList
        }
    }

    async getAndSpliceInvocies(datas, fopt) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        const { pageNo, pageSize } = opt;
        let totalDatas = [];
        ctx.service.log.info('同步拆分下载全量发票--文件数量', datas.length, opt);
        for (let i = 0; i < datas.length; i++) {
            const dataRes = datas[i];
            const originalUrl = dataRes.fileUrl;

            const res = await ctx.service.invoiceSaveFiles.getData(originalUrl);
            if (res.errcode !== '0000') {
                ctx.service.log.info('同步拆分下载全量发票--读取文件出错', res);
                return res;
            }
            ctx.service.log.info('同步拆分下载全量发票--文件序号：', i, '数据数量：', res.data.length);
            totalDatas = totalDatas.concat(res.data);
            if (Number(pageNo) >= 1 && pageSize) {
                if (totalDatas.length >= pageNo * pageSize) {
                    const currentPageInvoiceStartNum = (Number(pageNo) - 1) * pageSize;
                    const currentPageInvoiceEndNum = pageNo * pageSize;
                    ctx.service.log.info('同步拆分下载全量发票--截取位置', currentPageInvoiceStartNum, currentPageInvoiceEndNum) ;
                    totalDatas = totalDatas.slice(currentPageInvoiceStartNum, currentPageInvoiceEndNum);
                    ctx.service.log.info('同步拆分下载全量发票--总体数量', totalDatas.length);
                    break;
                }
            }
        }
        return {
            ...errcodeInfo.success,
            tongjiInfo: {
                invoiceNum: totalDatas.length
            },
            pageNo,
            pageSize,
            data: totalDatas
        }
    }

    /*
        1、查询日期区间不得大于31天；
        2、如果查询结果超过5000条数据，则把查询日期按天拆分；
        3、如果按天拆分数据还是大于5000条，当天只能分页(每页目前只能是100条)获取数据；
        4、客户端只下载excel表，不解析(业务端下载表后自己解析，可参考客户端解析方式)，也不会入库到发票云；
        5、客户端下载excel表格后上传到S3，S3返回url，待全部文件上传成功后，客户端把url按上传顺序放入数组中，保存到S3；
        6、excel的命名方式：查询条件md5加密；
    */
    async queryInvoicesFile(access_token, tokenInfo, fopt = {}) { // 全量异步下票
        const ctx = this.ctx;
        ctx.service.log.info('全量异步下票2 plugin service --------------');
        const opt = fopt.searchOpt || {};
        const invoiceTypeArgs = opt.invoiceType === -1 ? [-1] : `${opt.invoiceType}`.split(',');
        let FplxDm = [];
        let fplxRes = {};
        for (let i = 0; i < invoiceTypeArgs.length; i++) {
            fplxRes = this.getInvoiceTypesParams(Number(invoiceTypeArgs[i]));
            if (fplxRes.errcode === '0000') {
                FplxDm = [...FplxDm, ...fplxRes.data];
            }
        }
        if (fplxRes.errcode !== '0000') {
            return fplxRes;
        }
        const checkRes = this.createArgs(opt, true); // 检查参数

        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const { batchNo} = opt;
        if (!batchNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '批次号不能为空'
            };
        }

        const bodyJson = {
            ...checkRes.data,
            FplxDm,
            PageNumber: 1,
            PageSize: 0
        };
        ctx.service.log.info('全量异步下票-参数', bodyJson);
        const isSupportInvoiceTypes = true;
        const countRes = await this.checkFpCount(access_token, tokenInfo, bodyJson, fopt, isSupportInvoiceTypes); // 这里也可检查登录是否失效
        ctx.service.log.info('全量异步下票-未拆分-是否可以全部导出 ', countRes);
        if (countRes.errcode !== '0000') {
            return countRes;
        }
        if (countRes.Total === 0) {
            return {
                ...errcodeInfo.success,
                Total: 0
            }
        }
        const isSynchronization = false;
        const res = await this.queryInvoicesFileStart(access_token, tokenInfo, fopt, bodyJson, countRes, isSynchronization);
        return res;
    }

    async queryInvoicesFileStart(access_token, tokenInfo, fopt = {}, bodyJson, countRes, isSynchronization) { // isSynchronization是否同步
        const ctx = this.ctx;
        const downloadTypeTip = isSynchronization ? '同步' : '异步';
        let res = {};
        const { Code, code } = countRes.data; // code:Y、N, FpmxCount, Dcsjl
        if (Code === 'N' || code === 'N') { // 查询结果超过5000条数据，则把查询日期按天拆分；
            // ctx.service.log.info('查验数据总数返回1：', countRes);
            const total = countRes.Total;
            res = await this.disassembleDate(access_token, tokenInfo, bodyJson, total, fopt, isSynchronization);
        } else {
            res = await this.downloadFullFile(tokenInfo, bodyJson, fopt, true, isSynchronization);
        }
        ctx.service.log.info(`全量${downloadTypeTip}下票-最终结果2`, res);
        if (res.errcode === '0000' && res.data) {
            ctx.service.log.info(`全量${downloadTypeTip}下票-文件数量`, res.data.length);
        }
        return res;
    }

    async checkFpCount(access_token, tokenInfo, bodyJson, fopt, isSupportInvoiceTypes) { // 检查查询结果是否超过5000, 是否能直接下载
        const ctx = this.ctx;
        const totalRes = await this.queryInvoiceApi(access_token, tokenInfo, fopt, isSupportInvoiceTypes);
        ctx.service.log.info('全量下票-checkFpCount-queryInvoiceApi接口-结果', totalRes);
        if (totalRes.errcode !== '0000') {
            return totalRes;
        }
        const { Total } = totalRes.data || {};
        if (Total === 0) {
            return {
                ...errcodeInfo.success,
                Total
            }
        }
        // if (!List || List.length === 0) {}
        const urlPath = '/szzhzz/DpldcsqController/v1/checkFpCount';
        const nextBodyJson = {
            ...bodyJson,
            dcsjl: Total
        }
        const countRes = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, nextBodyJson) || {}; // { data: { Code, FpmxCount，Dcsjl } }
        ctx.service.log.info('全量下票-checkFpCount-检测能否一次性下载完-结果', countRes);
        if (countRes.errcode === '95000' && countRes.description && countRes.description.indexOf('导出数据量不能为空或不能为零') !== -1) {
            return {
                ...errcodeInfo.success,
                Code: 'Y',
                Total: 0,
            }
        }
        return {
            ...countRes,
            Total
        }
    }

    isDownloadInvoiceNumEnough(fopt, downloadInvoiceTotalNum) { // 分页取数据，无需一次性全部下载
        const opt = fopt.searchOpt || {};
        const { pageNo, pageSize } = opt;
        if (Number(pageNo) >= 1 && pageSize) {
            return downloadInvoiceTotalNum >= pageSize * pageNo;
        }
        return false;
    }

    async disassembleDate(access_token, tokenInfo, bodyJson, count, fopt, isSynchronization) {
        const ctx = this.ctx;
        const downloadTypeTip = isSynchronization ? '同步' : '异步';
        ctx.service.log.info(`全量${downloadTypeTip}下票-按天拆分开始`);
        let uploadFileRes = [];
        let downloadInvoiceTotalNum = 0;
        const {
            Kprqq,
            Kprqz,
        } = bodyJson;
        let startTime = moment(Kprqq);
        const endTime = moment(Kprqz);
        if (startTime.format('X') === endTime.format('X')) {
            const pagingRes = await this.paging(tokenInfo, bodyJson, count, fopt, startTime.format('X') === endTime.format('X'), isSynchronization);
            if (pagingRes.errcode !== '0000') {
                return pagingRes;
            };
            return {
                ...errcodeInfo.success,
                data: [...pagingRes.data]
            };
        }
        let errorRes = null;
        while (startTime.format('X') <= endTime.format('X')) {
            let res = {};
            const curDate = startTime.format('YYYY-MM-DD');
            const nextBodyJson = {
                ...bodyJson,
                Kprqq: curDate,
                Kprqz: curDate,
                PageNumber: 1,
                PageSize: 0
            }
            fopt.searchOpt.startTime = curDate;
            fopt.searchOpt.endTime = curDate;
            ctx.service.log.info(`全量${downloadTypeTip}下票-按天拆分-日期-参数`, curDate, nextBodyJson);
            const isSupportInvoiceTypes = true;
            const countRes = await this.checkFpCount(access_token, tokenInfo, nextBodyJson, fopt, isSupportInvoiceTypes);
            ctx.service.log.info(`全量${downloadTypeTip}下票-按天拆分-是否可以全部导出`, countRes);
            if (countRes.errcode !== '0000') {
                errorRes = countRes;
                break;
            }
            if (countRes.Total === 0) {
                startTime = startTime.add(1, 'days');
                continue;
            }
            const { Code, code } = countRes.data; // code:Y、N
            if (Code === 'N' || code === 'N') { // 查询结果超过5000条数据，则需要分页；
                const total = countRes.Total;
                res = await this.paging(tokenInfo, nextBodyJson, total, fopt, startTime.format('X') === endTime.format('X'), isSynchronization);
            } else {
                res = await this.downloadFullFile(tokenInfo, nextBodyJson, fopt, startTime.format('X') === endTime.format('X'), isSynchronization);
            }
            if (res.errcode !== '0000') {
                errorRes = res;
                ctx.service.log.info(`全量${downloadTypeTip}下票-按日拆分获取数据异常`, res);
                break;
            }
            uploadFileRes = [...uploadFileRes, ...res.data];
            downloadInvoiceTotalNum = downloadInvoiceTotalNum + res.data[0].totalNum;
            const isasych = this.isDownloadInvoiceNumEnough(fopt, downloadInvoiceTotalNum);
            if (isSynchronization && isasych) {
                break;
            }
            startTime = startTime.add(1, 'days');
        }
        if (errorRes) {
            return errorRes;
        }
        return {
            ...errcodeInfo.success,
            data: uploadFileRes
        };
    }

    async paging(tokenInfo, bodyJson, fpmxCount, fopt, isLastDate, isSynchronization) {
        const ctx = this.ctx;
        const downloadTypeTip = isSynchronization ? '同步' : '异步';
        ctx.service.log.info(`全量${downloadTypeTip}下票-分页开始`, `当前日期总数：${fpmxCount}`);
        let uploadFileRes = [];
        let downloadInvoiceTotalNum = 0;
        let goOn = false;
        let PageNumber = 1;
        const PageSize = 100;
        let errorRes = null;
        do {
            const nextBodyJson = {
                ...bodyJson,
                PageNumber,
                PageSize
            }
            goOn = fpmxCount > PageNumber * PageSize;
            const isEnd = isLastDate && !goOn; // 最后一天，并且最后一页
            const fpcyRes = await this.downloadFullFile(tokenInfo, nextBodyJson, fopt, isEnd, isSynchronization);
            if (fpcyRes.errcode !== '0000') {
                errorRes = fpcyRes;
                ctx.service.log.info(`全量${downloadTypeTip}下票-分页获取数据异常`, fpcyRes);
                break;
            } else {
                uploadFileRes = [...uploadFileRes, ...fpcyRes.data];
                downloadInvoiceTotalNum = downloadInvoiceTotalNum + fpcyRes.data[0].totalNum;
                if (isSynchronization && this.isDownloadInvoiceNumEnough(fopt, downloadInvoiceTotalNum)) {
                    break;
                }
                PageNumber = PageNumber + 1;
            }
        } while (goOn);
        if (errorRes) {
            return errorRes;
        }
        return {
            ...errcodeInfo.success,
            data: uploadFileRes
        };
    }

    async downloadFullFile(tokenInfo, bodyJson, fopt, isEnd, isSynchronization) {
        const ctx = this.ctx;
        const downloadTypeTip = isSynchronization ? '同步' : '异步';
        ctx.service.log.info(`全量${downloadTypeTip}下票-开始下载excel文件`, `是否需要更改状态${!!isEnd}`, fopt);
        const { fpdk_type } = ctx.request.query;
        const taxNo = tokenInfo.taxNo;
        const opt = fopt.searchOpt;
        const disableCache = !!fopt.disableCache;
        const { dataType } = opt;
        const fileDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'fullInvoiceFile');
        const strBody = JSON.stringify(bodyJson);
        const md5Key = hex_md5(taxNo + strBody);
        const fileName = md5Key + '.xlsx';
        let res = {};
        const filePath = pathJoin(fileDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath, 24 * 60 * 60 * 1000) && !disableCache;
        ctx.service.log.info(`全量${downloadTypeTip}下票-是否走缓存`, isExsit);
        if (!isExsit) {
            ctx.service.log.info(`全量${downloadTypeTip}下票-查询下载downloadId参数`, bodyJson);
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
            ctx.service.log.info(`全量${downloadTypeTip}下票-下载文件地址：`, exportUrl);
            res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath: fileDirPath,
                passFetch: true,
                fileName
            });
            ctx.service.log.info(`全量${downloadTypeTip}下票-下载文件结果`, res);
            if (res.errcode !== '0000') {
                return res;
            }
        }

        // let nextStatus = '';
        // if (isEnd) {
        //     nextStatus = fopt.status;
        //     if (fopt.status === 1) {
        //         nextStatus = 4;
        //     }
        //     if (fopt.status === 3) {
        //         if (fopt.isInvoiceSuccess) {
        //             nextStatus = 4;
        //         } else {
        //             nextStatus = 2;
        //         }
        //         if (dataType === 2) { // 销项没有表头
        //             nextStatus = 4;
        //         }
        //     }
        // }
        let pageNo = opt.pageNo;
        if (isSynchronization) {
            pageNo = ''; // 同步需要把数据都拿回来
        }
        ctx.service.log.info(`全量${downloadTypeTip}下票-上传excel参数`, {
            taxNo,
            dataType,
            md5Key,
            fpdk_type,
            status: '',
            batchNo: opt.batchNo,
            searchOpt: {
                ...opt,
                pageNo
            }
        });
        // 保存excel文件到S3
        // const saveRes = await ctx.service.invoiceSaveFiles.uploadExcel(filePath, {
        const saveRes = await ctx.service.invoiceSaveFiles.saveExcel(filePath, {
            disableCache: !!fopt.disableCache,
            taxNo,
            dataType,
            md5Key,
            fpdk_type,
            status: '',
            searchOpt: {
                ...opt,
                pageNo
            }
        });
        ctx.service.log.info(`全量${downloadTypeTip}下票-上传excel结果`, saveRes);
        if (saveRes.errcode !== '0000') {
            return saveRes;
        }
        const data = saveRes.data || '';
        return {
            ...errcodeInfo.success,
            data: [data]
        };

    }
    /* 异步下载发票结束 */

    /* 根据发票号码下载发票--开始 */
    async downloadFullFileByXzFphm(access_token, tokenInfo, data, fopt) {
        const ctx = this.ctx;
        ctx.service.log.info('全量XzFphm下票-开始,需要获取的总发票明细数量', data.length);
        const { fpdk_type } = ctx.request.query;
        let missInvoices = [];
        const taxNo = tokenInfo.taxNo;
        const splitOpt = fopt.splitOpt || {};
        const listSubs = this.splitInvoiceByDate(data, splitOpt);
        ctx.service.log.fullInfo('全量XzFphm下票-发票拆解参数、结果', splitOpt, listSubs);
        ctx.service.log.fullInfo('全量XzFphm下票-发票拆解总批次', listSubs.length);
        for (let i = 0; i < listSubs.length; i++) {
            const item = listSubs[i];
            const { list, endDate, startDate, listOrigin } = item;
            ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-发票数量:`, list.length, '日期范围', endDate, startDate);
            fopt.searchOpt = {
                ...fopt.searchOpt,
                startTime: startDate.substring(0, 10),
                endTime: endDate.substring(0, 10),
                invoices: list
            }
            const resFull = await this.queryInvoices(access_token, tokenInfo, fopt, false, true);
            if (resFull.errcode !== '0000') {
                ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-结果异常`, resFull);
                return resFull;
            }
            const { md5Key, filePath, dataType } = resFull;
            const saveRes = await ctx.service.invoiceSaveFiles.saveExcel(filePath, {
                disableCache: !!fopt.disableCache,
                taxNo,
                dataType,
                md5Key,
                fpdk_type,
                searchOpt: {
                    ...fopt.searchOpt,
                    pageSize: 5000
                }
            });
            if (saveRes.errcode !== '0000') {
                ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-上传excel-结果异常`, list.length, saveRes);
                return saveRes;
            }
            const { totalNum, fileUrl } = saveRes.data;
            ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-下载成功数量:`, totalNum, saveRes);
            if (totalNum !== list.length) { // 当前批次没有下载完整
                ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-当前批次下载不完整`, '日期范围', endDate, startDate, `总数：${list.length}`, `实际下载：${totalNum}`, `相差：${list.length - totalNum}`);
                const resMissInvoice = await this.filterMissInvoices(listOrigin, fileUrl);
                if (resMissInvoice.errcode !== '0000') {
                    ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-过滤未下载的发票异常`, resMissInvoice);
                } else {
                    ctx.service.log.info(`全量XzFphm下票-下载文件批次${i}-过滤未下载的发票数量结果`, resMissInvoice.data.length);
                    missInvoices = [...missInvoices, ...resMissInvoice.data]
                }
            }
        }
        if (missInvoices.length !== 0) {
            if (fopt.splitOpt?.maxDuration !== 1) { // 已经单条下载过，不再触发下载
                fopt.splitOpt = { maxDuration: 1 };
                return await this.downloadFullFileByXzFphm(access_token, tokenInfo, missInvoices, fopt);
            }
        }
        ctx.service.log.fullInfo('全量XzFphm下票-下载已经结束，未下载完成数量为：', missInvoices.length, missInvoices);
        return {
            ...errcodeInfo.success,
            missInvoices
        }
    }

    async filterMissInvoices(list, filePath) {
        const ctx = this.ctx;
        const missInvoices = [];
        const res = await ctx.service.invoiceSaveFiles.getData(filePath);
        if (res.errcode !== '0000') {
            return res;
        }
        const { data } = res;
        for (let i = 0; i < list.length; i++) {
            const curInvoice = list[i];
            const invoiceStr = curInvoice.etaxInvoiceNo ? curInvoice.etaxInvoiceNo : (curInvoice.invoiceCode || '') + curInvoice.invoiceNo;
            const invoice = data.find((t) => {
                const curInvoiceStr = t.etaxInvoiceNo ? t.etaxInvoiceNo : (t.invoiceCode || '') + t.invoiceNo;
                return curInvoiceStr === invoiceStr;
            })
            if (!invoice) { // 源数据没有，就没下载到
                missInvoices.push(curInvoice);
            }
        }
        return {
            ...errcodeInfo.success,
            data: missInvoices
        };
    }

    splitInvoiceByDate(data, opt = {}) {
        const { maxDuration = 30, maxCount = 5000, sortType = 'dec' } = opt;
        const sortInvoices = data.sort((a, b) => {
            const aDate = moment(a.invoiceDate, 'YYYY-MM-DD');
            const bDate = moment(b.invoiceDate, 'YYYY-MM-DD');
            if (sortType === 'dec') {
                return bDate.diff(aDate, 'days');
            }
            return aDate.diff(bDate, 'days');
        });
        const startDate = moment(sortInvoices[0].invoiceDate, 'YYYY-MM-DD');
        const listSubs = [];
        let nextDate = startDate;
        let index = 0;
        do {
            let subItems = {list: [], listOrigin: []};
            let newNextDate;
            if (sortType === 'dec') {
                newNextDate = nextDate.subtract(maxDuration, 'days');
            } else {
                newNextDate = nextDate.add(maxDuration, 'days');
            }
            let i = index;
            for (; i < sortInvoices.length; i++) {
                const curInvoice = sortInvoices[i];
                const invoiceStr = curInvoice.etaxInvoiceNo ? curInvoice.etaxInvoiceNo : (curInvoice.invoiceCode || '') + curInvoice.invoiceNo;
                const invoiceDate = moment(curInvoice.invoiceDate, 'YYYY-MM-DD');
                const diffResult = sortType === 'dec' ? newNextDate.diff(invoiceDate, 'days'): invoiceDate.diff(newNextDate, 'days');
                if (diffResult > 0) {
                    break;
                }
                if (subItems.list.length === 0) {
                    if (sortType === 'dec') {
                        subItems.endDate = curInvoice.invoiceDate;
                    } else {
                        subItems.startDate = curInvoice.invoiceDate;
                    }
                }
                if (subItems.list.length < maxCount) {
                    if (sortType === 'dec') {
                        subItems.startDate = curInvoice.invoiceDate;
                    } else {
                        subItems.endDate = curInvoice.invoiceDate;
                    }

                    subItems.list.push(invoiceStr);
                    subItems.listOrigin.push(curInvoice);
                } else {
                    listSubs.push(subItems);
                    subItems = { list: [], startDate: curInvoice.invoiceDate, endDate: curInvoice.invoiceDate };
                    subItems.list.push(invoiceStr);
                    subItems.listOrigin.push(curInvoice);
                }
            }
            index = i;
            if (subItems.list.length > 0) {
                listSubs.push(subItems);
            }
            nextDate = newNextDate;
        } while(index < sortInvoices.length);
        return listSubs;
    }
    /* 根据发票号码下载发票--结束 */

}
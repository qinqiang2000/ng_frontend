/* eslint-disable no-undef */
import { paramJson } from '../libs/tools';
import wdqExcelInvoices from '../libs/wdqExcel';
import { wgxInvoices, ygxInvoices } from '../libs/dkgxExcel';
import { yqrInvoices } from '../libs/dktjExcel';
import { bdkYgxInvoices } from '../libs/bdkgxExcel';
import { govFpyInvoiceTypeDict, govGxInvoiceTypes } from './etaxV4QueryInvoices';
import { getParamStr } from '../utils/tools';
const { join: pathJoin } = path;

export class EtaxExportInvoice extends BaseService {
    getQueryArgs(preOpt) {
        return {
            searchOpt: preOpt.searchOpt,
            dataFrom: preOpt.dataFrom,
            dataFromIndex: preOpt.index,
            dataIndex: preOpt.dataIndex,
            name: preOpt.name
        };
    }

    getInvoiceTypesParamsByAry(invoiceTypeArgs, k, splitTxfFlag) {
        let FplxDm = '';
        let fplxRes = {};
        for (let i = 0; i < invoiceTypeArgs.length; i++) {
            fplxRes = this.getInvoiceTypesParams(Number(invoiceTypeArgs[i]), k, splitTxfFlag);
            if (fplxRes.errcode === '0000') {
                FplxDm = FplxDm ? FplxDm + '&' + fplxRes.data : fplxRes.data;
            } else {
                return fplxRes;
            }
        }
        return {
            ...fplxRes,
            data: FplxDm
        };
    }

    getInvoiceTypesParams(invoiceType, k = 'fplxDm', splitTxfFlag) {
        const ctx = this.ctx;
        let fplxDmArr = [];
        const { fixEtaxInvoiceType } = ctx.request.query;
        if (invoiceType === -1) {
            // 全部发票，旧版只支持，2，电子专票，4增值税专用发票，12机动车发票，15通行费发票
            fplxDmArr = govGxInvoiceTypes.map((govType) => {
                return k + '=' + govType;
            });
            if (splitTxfFlag) {
                fplxDmArr.push(k + '=14');
            }
        } else if (fixEtaxInvoiceType === '1' && invoiceType === 2) { // 不支持数电的星空需要转换电子专票类型
            // 同时查询电子专票和数电专票
            fplxDmArr = [
                k + '=08',
                k + '=81'
            ];
        } else {
            const fplxType = govFpyInvoiceTypeDict;
            if (!fplxType['k' + invoiceType]) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `不支持的发票类型:${invoiceType}`
                };
            }
            if (Number(invoiceType) === 12) {
                fplxDmArr = [k + '=03', k + '=87']; // 数电机动车，数电纸质机动车
            } else if (Number(invoiceType) === 3) {
                fplxDmArr = [k + '=86', k + '=04'];
            } else if (Number(invoiceType) === 4) {
                fplxDmArr = [k + '=85', k + '=01'];
            } else if (splitTxfFlag && Number(invoiceType) === 15) { // 通行费发票独立出来
                fplxDmArr = [k + '=10', k + '=14'];
            } else {
                fplxDmArr = [k + '=' + fplxType['k' + invoiceType]];
            }
        }
        return {
            errcode: '0000',
            data: fplxDmArr.join('&')
        };
    }

    async wdqInvoices(tokenInfo = {}, fopt = {}) {
        const ctx = this.ctx;
        const searchOpt = fopt.searchOpt;

        const { authenticateFlags = '' } = searchOpt;
        const authenticateFlagArr = authenticateFlags.split(',');
        // 未到期发票都是未勾选
        if (authenticateFlags !== '' && authenticateFlagArr.indexOf('0') === -1) {
            return {
                ...errcodeInfo.success,
                data: []
            };
        }

        const curDateInt = parseInt(moment().format('YYYYMMDD'));
        // 当前月与税期相同，不存在未到期发票
        if (moment().format('YYYYMM') === tokenInfo.taxPeriod) {
            ctx.service.log.info('当前月与税期相同，不存在未到期发票');
            return {
                ...errcodeInfo.success,
                data: []
            };
        }

        const startTimeInt = parseInt(searchOpt.startTime.replace(/-/g, ''));
        const endTimeInt = parseInt(searchOpt.endTime.replace(/-/g, ''));
        const curMonthStartInt = parseInt(moment().format('YYYYMM01'));
        // 起止日期不在未到期发票范围内
        if (endTimeInt < curMonthStartInt) {
            ctx.service.log.info('起止日期不在未到期发票范围内');
            return {
                ...errcodeInfo.success,
                data: []
            };
        }
        const startDate = startTimeInt > curMonthStartInt ? searchOpt.startTime : moment().format('YYYY-MM-01');
        const endDate = endTimeInt > curDateInt ? moment().format('YYYY-MM-DD') : searchOpt.endTime;
        const newOpt = {
            ...searchOpt,
            startTime: startDate,
            endTime: endDate,
            disableCache: fopt.disableCache
        };
        ctx.service.log.info('未到期发票查询实际参数', newOpt);
        const res = await this.wdqExport(tokenInfo, newOpt);
        if (res.errcode !== '0000') {
            return res;
        }
        return res;
    }

    async wdqExport(tokenInfo = {}, opt = {}) {
        const ctx = this.ctx;
        // const baseUrl = tokenInfo.baseUrl;
        const taxNo = tokenInfo.taxNo;
        const urlOpt = {
            type: 'fp',
            queryParams: JSON.stringify({
                'fplb': 'fp',
                'fply': ['1', '2'], // 1综合服务平台，2电子发票服务平台
                'fplx': [],
                'fppz': [],
                'tdyslx': [],
                'kprqq': opt.startTime,
                'kprqz': opt.endTime
            })
        };
        // const timeStampId = `timeStampId=${+new Date()}`;
        // const urlParamStr = paramJson(urlOpt) + '&' + timeStampId;
        const urlParamStr = paramJson(urlOpt);
        const saveDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'wdqInvoices');
        const fileName = hex_md5(urlParamStr + taxNo) + '.xlsx';
        let filePath = pathJoin(saveDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath) && !opt.disableCache;
        ctx.service.log.info('wdqExport 未到期是否走缓存:', isExsit, `disableCache: ${opt.disableCache}`);
        if (!isExsit) {
            // const exportUrl = baseUrl + '/szzhzz/WdgxrqfpcxController/v1/export2Excel?' + urlParamStr;
            const timeStampId = `timeStampId=${+new Date()}`;
            const exportUrl = '/szzhzz/WdgxrqfpcxController/v1/export2Excel?' + urlParamStr + '&' + timeStampId;
            ctx.service.log.info('wdqExport exportUrl', exportUrl);
            const res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath,
                passFetch: true,
                fileName,
                isFetchDownload: true
            });

            if (res.errcode !== '0000') {
                ctx.service.log.info('未到期发票查询异常, 先忽略', res);
                return {
                    ...errcodeInfo.success,
                    data: [],
                    totalNum: 0,
                    nextDataIndex: 0
                };
            }
            filePath = res.data.filePath;
        }

        ctx.service.log.info('wdqExport filePath', filePath);
        // const filePath = 'E:\\temp\\临时文件\\未到勾选日期发票信息.xlsx';
        const res2 = wdqExcelInvoices(filePath, {
            // buyerName: tokenInfo.companyName,
            buyerTaxNo: tokenInfo.taxNo
        });
        ctx.service.log.info('wdqExport 结果返回', res2);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const data = res2.data || [];
        return {
            ...errcodeInfo.success,
            data,
            totalNum: data.length,
            nextDataIndex: data.length
        };
    }

    async bdkgxExport(tokenInfo, fopt = {}, originFile) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt;
        const taxNo = tokenInfo.taxNo;
        // const baseUrl = tokenInfo.baseUrl;
        const urlJson1 = {
            gxztDm: typeof opt.gxztDm === 'undefined' ? 1 : opt.gxztDm,
            fpbbDm: -1
        };
        let authenticateFlag;
        // 支持不抵扣未勾选、已勾选、已认证的导出
        if (urlJson1.gxztDm === 1) {
            const checkRes = await ctx.service.etaxQueryInvoices.getYgxInvoiceAuthenticateFlag(tokenInfo);
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            authenticateFlag = checkRes.data;
        } else {
            authenticateFlag = 0;
        }

        // let fpztStr = ;
        // if (opt.invoiceStatus === -1) {
        //     fpztStr = 'fpzt=0&fpzt=2&fpzt=8&fpzt=7';
        // } else if (opt.invoiceStatus === 3) {
        //     fpztStr = 'fpzs=7';
        // } else if (opt.invoiceStatus === 2) {
        //     fpztStr = 'fpzs=2';
        // } else if (opt.invoiceStatus === 0) {
        //     fpztStr = 'fpzt=0';
        // } else {
        //     fpztStr = 'fpzt=0&fpzt=2&fpzt=8&fpzt=7';
        // }

        const urlJson2 = {
            skssq: opt.taxPeriod || '',
            qdfphm: opt.qdInvoiceNo || '',
            fpdm: opt.invoiceCode || '',
            fphm: opt.invoiceNo || '',
            xfsbh: opt.salerTaxNo || '',
            kprqq: opt.startTime || '',
            kprqz: opt.endTime || '',
            xfmc: '',
            znxzmbh: '',
            fxdjDm: -1
        };
        const fxdjDmStr = opt.fxdjDm ? 'fxdjDm=' + opt.fxdjDm : 'fxdjDm=01&fxdjDm=02&fxdjDm=03';
        const fpztDmStr = opt.invoiceStatus === '-1' ? 'fpzt=0&fpzt=2&fpzt=7&fpzt=8' : 'fpzt=' + opt.invoiceStatus;

        let govInvoiceTypes;
        if (opt.govInvoiceTypes) {
            govInvoiceTypes = getParamStr(opt.govInvoiceTypes, 'pz');
        } else {
            const invoiceTypeArgs = (!opt.invoiceType || opt.invoiceType === -1) ? [-1] : `${opt.invoiceType}`.split(',');
            const fplxDmRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs, 'pz', true);
            if (fplxDmRes.errcode !== '0000') {
                return fplxDmRes;
            }
            govInvoiceTypes = fplxDmRes.data;
        }

        const urlParamStr = paramJson(urlJson1) + '&' + govInvoiceTypes + '&' + paramJson(urlJson2) + '&' + fxdjDmStr + '&' + fpztDmStr;
        const saveDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'bdkgxInvoices');
        const md5Key = hex_md5(urlParamStr + taxNo);
        const fileName = md5Key + '.xlsx';
        let filePath = pathJoin(saveDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath) && !fopt.disableCache;
        ctx.service.log.info('bdkgxExport 不抵扣是否走缓存:', isExsit, `disableCache: ${fopt.disableCache}`);
        if (!isExsit) {
            const timeStampId = `timeStampId=${+new Date()}`;
            const exportUrl = '/ypfw/bdkgx/v1/bdkgxfpxxdc?' + urlParamStr + '&' + timeStampId;
            // const exportUrl = baseUrl + '/ypfw/bdkgx/v1/bdkgxfpxxdc?' + urlParamStr;
            ctx.service.log.info('bdkgxInvoices exportUrl', exportUrl);
            const res1 = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath,
                passFetch: true,
                fileName,
                isFetchDownload: true
            });
            if (res1.errcode !== '0000') {
                return res1;
            }
            filePath = res1.data.filePath;
        }

        ctx.service.log.info('bdkgxInvoices exportUrl filePath', filePath);
        if (originFile) {
            return {
                ...errcodeInfo.success,
                taxPeriod: tokenInfo.taxPeriod,
                filePath,
                md5Key,
                fopt
            };
        }
        // const filePath = 'E:\\temp\\临时文件\\不抵扣勾选增值税发票信息 (1).xlsx';
        const taxPeriod = tokenInfo.taxPeriod;
        const res = bdkYgxInvoices(filePath, taxPeriod, {
            getInvoiceTime: fopt.getInvoiceTime,
            searchTaxPeriod: opt.taxPeriod || '', // 查询的历史税期
            authenticateFlag,
            // buyerName: tokenInfo.companyName,
            buyerTaxNo: tokenInfo.taxNo
        });
        ctx.service.log.info('bdkgxInvoices 结果返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const data = res.data || [];
        return {
            errcode: '0000',
            data: data,
            totalNum: data.length,
            nextDataIndex: data.length
        };
    }

    async dkgxExport(tokenInfo, fopt = {}, disableCache, originFile) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt;
        // const baseUrl = tokenInfo.baseUrl;
        const taxNo = tokenInfo.taxNo;
        const gxztDm = opt.rzzt || '0';

        const checkRes = await ctx.service.etaxQueryInvoices.getYgxInvoiceAuthenticateFlag(tokenInfo, gxztDm);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const authenticateFlag = checkRes.data;
        const checkRes2 = await ctx.service.etaxQueryInvoices.checkDkgxHasRepeateData(tokenInfo, {
            gxzt: gxztDm,
            continueFlag: fopt.continueFlag,
            startTime: opt.startTime,
            endTime: opt.endTime,
            authenticateFlags: opt.authenticateFlags
        }, authenticateFlag);

        if (checkRes2.errcode !== '0000') {
            return checkRes2;
        }
        if (checkRes2.data) {
            return {
                ...errcodeInfo.success,
                totalNum: 0,
                data: []
            };
        }

        // let fpztDm = '-1';
        // if (opt.invoiceStatus === -1) {
        //     fpztDm = '-1';
        // } else if (opt.invoiceStatus === 3) {
        //     fpztDm = '8';
        // } else if (opt.invoiceStatus === 2) {
        //     fpztDm = '2';
        // } else {
        //     fpztDm = opt.invoiceStatus;
        // }

        const urlOpt1 = {
            gxztDm: gxztDm, // 勾选状态0未勾选，1已勾选
            fpbbDm: '-1' // 发票来源，-1全部，1增值税发票管理平台, 2电子发票服务平台
            // fpztDm: fpztDm // 发票状态 -1全部，0正常，2作废，7部分红冲，8全额红冲
        };

        const urlOpt2 = {
            znxzmbh: opt.znxzmbh || '', // 转内销证明编号
            qdfphm: opt.qdInvoiceNo || '', // 数电票号码
            fpdm: opt.invoiceCode || '',
            fphm: opt.invoiceNo || '',
            xfsbh: opt.salerTaxNo || '', // 销方识别号
            xfmc: '', // 销方名称
            // fxdjDm: opt.fxdjDm || ['01', '02', '03'], // 发票风险等级 -1全部，01正常，03疑点发票，02异常凭证
            kprq_q: opt.startTime || '', // 开票起止日期
            kprq_z: opt.endTime || '',
            gxrqQ: opt.gxStartTime || '',
            gxrqZ: opt.gxEndTime || '',
            pageNumber: 1,
            pageSize: 10
        };

        const fxdjDmStr = opt.fxdjDm ? 'fxdjDm=' + opt.fxdjDm : 'fxdjDm=01&fxdjDm=02&fxdjDm=03';
        const fpztDmStr = opt.invoiceStatus === '-1' ? 'fpztDm=0&fpztDm=2&fpztDm=7&fpztDm=8' : 'fpztDm=' + opt.invoiceStatus;

        let govInvoiceTypes;
        if (opt.govInvoiceTypes) {
            govInvoiceTypes = getParamStr(opt.govInvoiceTypes, 'fplxDm');
        } else {
            const invoiceTypeArgs = (!opt.invoiceType || opt.invoiceType === -1) ? [-1] : `${opt.invoiceType}`.split(',');
            const fplxDmRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs, 'fplxDm', true);
            if (fplxDmRes.errcode !== '0000') {
                return fplxDmRes;
            }
            govInvoiceTypes = fplxDmRes.data;
        }

        const urlParamStr = paramJson(urlOpt1) + '&' + govInvoiceTypes + '&' + paramJson(urlOpt2) + '&' + fxdjDmStr + '&' + fpztDmStr;
        // const saveDirPath = pathJoin(ctx.app.config.pwyNtUserDataPath, 'download', taxNo, 'dkgxInvoices');
        const saveDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'dkgxInvoices');
        const md5Key = hex_md5(urlParamStr + taxNo);
        const fileName = md5Key + '.xlsx';
        let filePath = pathJoin(saveDirPath, fileName);
        ctx.service.log.info('fileName:', fileName, 'filePath:', filePath);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath) && !fopt.disableCache && !disableCache;
        ctx.service.log.info('dkgxExport 抵扣是否走缓存:', isExsit, `disableCache: ${fopt.disableCache}`, disableCache);
        // const exportUrl = baseUrl + '/ypfw/dkgx/v1/exportFpxx?' + urlParamStr;
        if (!isExsit) {
            const timeStampId = `timeStampId=${+new Date()}`;
            const exportUrl = '/ypfw/dkgx/v1/exportFpxx?' + urlParamStr + '&' + timeStampId;
            ctx.service.log.info('dkgxExport exportUrl1', exportUrl);
            const res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath,
                passFetch: true,
                fileName,
                isFetchDownload: true
            });
            ctx.service.log.info('抵扣勾选数据导出 地址及返回', exportUrl, res);
            if (res.errcode !== '0000') {
                return res;
            }
            filePath = res.data.filePath;
        }

        ctx.service.log.info('dkgxInvoices download filePath', filePath);
        if (originFile) {
            return {
                ...errcodeInfo.success,
                taxPeriod: tokenInfo.taxPeriod,
                filePath,
                md5Key,
                fopt
            };
        }
        let res2;
        if (gxztDm === '1') {
            // const filePath = 'E:\\temp\\临时文件\\抵扣勾选增值税发票信息 (1).xlsx';
            res2 = ygxInvoices(filePath, tokenInfo.taxPeriod, {
                authenticateFlag,
                // buyerName: tokenInfo.companyName,
                buyerTaxNo: tokenInfo.taxNo
            });
        } else {
            // const filePath = 'E:\\temp\\临时文件\\抵扣勾选增值税发票信息.xlsx';
            res2 = wgxInvoices(filePath, {
                // buyerName: tokenInfo.companyName,
                buyerTaxNo: tokenInfo.taxNo
            });
        }
        ctx.service.log.info('dkgxInvoices 结果返回', res2);
        if (res2.errcode !== '0000') {
            return res2;
        }

        const data = res2.data || [];
        return {
            ...errcodeInfo.success,
            data,
            totalNum: data.length,
            nextDataIndex: data.length
        };
    }


    async dktjExport(tokenInfo, fopt = {}, originFile) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt;
        const taxNo = tokenInfo.taxNo;
        // const baseUrl = tokenInfo.baseUrl;
        const { rzssq = '', authenticateFlags } = opt;
        const continueFlag = fopt.continueFlag;
        const checkRes = await ctx.service.etaxQueryInvoices.checkDktjHasData(tokenInfo, { continueFlag, rzssq, authenticateFlags });

        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        if (!checkRes.data) {
            return {
                ...errcodeInfo.success,
                data: [],
                totalNum: 0,
                nextDataIndex: 0
            };
        }

        const urlJson1 = {
            Fplxbz: 8,
            FjgGfsbh: '',
            Gfsbh: '',
            Skssq: rzssq,
            isTotal: true,
            title: '合计', // 合计
            tableType: 'deduction',
            deductionType: 1,
            PageNumber: 1,
            PageSize: 10,
            fphm: opt.qdInvoiceNo || '', // 数电票号码
            zzfpDm: opt.invoiceCode || '',
            zzfpHm: opt.invoiceNo || '',
            xfsbh: opt.salerTaxNo || ''
        };

        let govInvoiceTypes;
        if (opt.govInvoiceTypes) {
            govInvoiceTypes = getParamStr(opt.govInvoiceTypes, 'pz');
        } else {
            const invoiceTypeArgs = (!opt.invoiceType || opt.invoiceType === -1) ? [-1] : `${opt.invoiceType}`.split(',');
            const fplxDmRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs, 'pz', true);
            if (fplxDmRes.errcode !== '0000') {
                return fplxDmRes;
            }
            govInvoiceTypes = fplxDmRes.data;
        }

        const urlJson2 = {
            gxrzsjq: opt.qrrzrq_q || '',
            gxrzsjz: opt.qrrzrq_z || '',
            FpbbDm: -1,
            znxzmbh: ''
        };

        const urlParamStr = paramJson(urlJson1) + '&' + govInvoiceTypes + '&' + paramJson(urlJson2);
        const saveDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'dktjInvoices');
        const md5Key = hex_md5(urlParamStr + taxNo);
        const fileName = md5Key + '.xlsx';
        let filePath = pathJoin(saveDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath) && !fopt.disableCache;
        ctx.service.log.info('fileName:', fileName, 'filePath:', filePath);
        ctx.service.log.info('dktjExport 抵扣统计是否走缓存:', isExsit, `disableCache: ${fopt.disableCache}`);
        if (!isExsit) {
            // const exportUrl = baseUrl + '/ypfw/ytqr/v1/fpxxcxdc?' + urlParamStr;
            const timeStampId = `timeStampId=${+new Date()}`;
            const exportUrl = '/ypfw/ytqr/v1/fpxxcxdc?' + urlParamStr + '&' + timeStampId;
            ctx.service.log.info('dktjExport exportUrl', exportUrl);
            const res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath,
                passFetch: true,
                fileName,
                isFetchDownload: true
            });

            if (res.errcode !== '0000') {
                return res;
            }
            filePath = res.data.filePath;
        }

        // const filePath = 'E:\\temp\\临时文件\\用途确认合计发票信息.xlsx';
        ctx.service.log.info('dktjExport filePath', filePath);
        if (originFile) {
            return {
                ...errcodeInfo.success,
                taxPeriod: opt.rzssq,
                filePath,
                md5Key,
                fopt
            };
        }
        const res2 = yqrInvoices(filePath, opt.rzssq, {
            getInvoiceTime: fopt.getInvoiceTime,
            // buyerName: tokenInfo.companyName,
            buyerTaxNo: tokenInfo.taxNo
        });
        ctx.service.log.info('dktjExport 结果返回', res2);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const data = res2.data || [];
        return {
            ...errcodeInfo.success,
            data,
            totalNum: data.length,
            nextDataIndex: data.length
        };
    }
}

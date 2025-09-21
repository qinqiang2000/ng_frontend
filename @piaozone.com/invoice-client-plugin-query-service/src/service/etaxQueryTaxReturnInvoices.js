/* eslint-disable no-undef,max-len,no-return-assign,no-unreachable */
// import { getEtaxListOpt } from '../libs/getListOpt';
import { paramJson } from '../libs/tools';
import { wgxInvoices, ygxInvoices } from '../libs/tsgxExcel';
import { ygxYtInvoices } from '../libs/tsytExcel';
import { createDqwcYgxQueryParam } from '../libs/govParamsChange';
// import { transDkgxInvoices, transBdkgxInvoices, transWdqInvoices, transDktjInvoices } from '../libs/etaxTransform';
import { getUUId } from '../utils/getUid';
import { getParamStr } from '../utils/tools';
import { govFpyInvoiceTypeDict, govGxInvoiceTypes } from './etaxV4QueryInvoices';
const { join: pathJoin } = path;

export class EtaxQueryTaxReturnInvoices extends BaseService {

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

    getInvoiceTypesParams(invoiceType, k = 'pz', splitTxfFlag) {
        const ctx = this.ctx;
        let fplxDmArr = [];
        const { fixEtaxInvoiceType } = ctx.request.query;
        if (!invoiceType || invoiceType === -1) {
            // 全部发票，旧版只支持，2，电子专票，4增值税专用发票，12机动车发票，15通行费发票
            fplxDmArr = govGxInvoiceTypes.map((govType) => {
                return k + '=' + govType;
            });
        } else if (fixEtaxInvoiceType === '1' && invoiceType === 2) { // 不支持全电的星空需要转换电子专票类型
            // 同时查询电子专票和全电专票
            fplxDmArr = [
                k + '=08',
                k + '=81'
            ];
        } else {
            const fplxType = govFpyInvoiceTypeDict;
            if (!fplxType['k' + invoiceType]) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '不支持的发票类型'
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

    getQueryArgs(preOpt) {
        return {
            searchOpt: preOpt.searchOpt,
            dataFrom: preOpt.dataFrom,
            dataFromIndex: preOpt.index,
            dataIndex: preOpt.dataIndex,
            name: preOpt.name
        };
    }

    getEtaxListOpt(opt, nextFlag, resInfo = {}, nextNum = 1) { // 默认取一个
        // const ctx = this.ctx;
        let { errcode, nextDataIndex = 0, totalNum = 0 } = resInfo;
        let optListIndex = opt.dataFromIndex;
        if (optListIndex === '' || typeof optListIndex === 'undefined') {
            optListIndex = 0;
        } else if (typeof optListIndex === 'string') {
            optListIndex = parseInt(optListIndex);
        }
        const searchOpt = opt.searchOpt;
        let authenticateFlagArr;
        if (!searchOpt.authenticateFlags) {
            authenticateFlagArr = ['0', '1', '2', '3'];
        } else {
            authenticateFlagArr = searchOpt.authenticateFlags.split(',');
        }

        const dataFrom = opt.dataFrom || '';
        const rq_q = searchOpt.startTime;
        const rq_z = searchOpt.endTime;
        const maxRq = rq_z ? moment(rq_z, 'YYYY-MM-DD') : moment();
        const getDktjListOpt = () => {
            const startRq_q = rq_q || moment().format('YYYY-MM-DD');
            let intStartRq_q = moment(startRq_q, 'YYYY-MM-DD');

            if (nextFlag) {
                if (errcode !== '0000' || nextDataIndex >= totalNum) {
                    nextDataIndex = 0;
                }
            } else {
                nextDataIndex = opt.dataIndex;
            }

            const result = [];
            while (intStartRq_q.format('X') <= maxRq.format('X')) {
                const searchParam = { ...searchOpt };
                const name = '退税用途确认发票';
                result.push({
                    ...opt,
                    searchOpt: {
                        ...searchParam,
                        rzssq: intStartRq_q.format('YYYYMM')
                    },
                    dataIndex: nextDataIndex,
                    dataFrom: 'tsytQuery',
                    name
                });

                intStartRq_q = intStartRq_q.add(1, 'month');
            }
            return result;
        };

        if (nextFlag) {
            if (nextDataIndex >= totalNum || errcode !== '0000') {
                nextDataIndex = 0;
                optListIndex += 1;
            }
        } else {
            nextDataIndex = opt.dataIndex;
        }

        let list = [];

        // 退税已勾选
        if ((dataFrom === '' || dataFrom === 'tsgxQuery')) {
            if (authenticateFlagArr.indexOf('1') !== -1) {
                list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '1' }, dataIndex: nextDataIndex, dataFrom: 'tsgxQuery', name: '当期退税已勾选发票' });
            }
        }

        if (authenticateFlagArr.indexOf('2') !== -1 && (dataFrom === '' || dataFrom === 'tsytQuery')) {
            list = list.concat(getDktjListOpt());
        }
        if (optListIndex >= list.length) {
            return { index: -1 };
        }
        return { index: optListIndex, opt: list[optListIndex] };
    }

    async queryInvoice(access_token, tokenInfo, fopt = {}) {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        fopt = {
            ...fopt,
            access_token,
            gxrqfw: tokenInfo.gxrqfw
        };
        const { dataFromIndex } = fopt;
        let queryArgs = this.getQueryArgs(fopt);

        let res;
        if (dataFromIndex === 0) {
            ctx.service.log.info('queryYgxInvoice tsgxExport------', fopt);
            res = await this.tsgxExport(access_token, tokenInfo, fopt);
            queryArgs = {
                ...queryArgs,
                dataFrom: 'tsgxQuery',
                dataIndex: 0,
                'name': '当期退税已勾选发票'
            };
        } else {
            const optInfo = this.getEtaxListOpt(fopt);
            if (optInfo.index === -1) {
                ctx.service.log.info('getEtaxListOpt 返回', optInfo);
                return {
                    ...errcodeInfo.argsErr,
                    description: '参数dataFromIndex超出范围'
                };
            }
            ctx.service.log.info('queryYgxInvoice tsytExport------', optInfo);
            queryArgs = this.getQueryArgs(optInfo.opt);
            res = await this.tsytExport(access_token, tokenInfo, optInfo.opt);
        }

        const { nextDataIndex = 0, totalNum = 0, data = [] } = res;
        if (res.errcode !== '0000') {
            return {
                ...res,
                totalNum: 0,
                data: [],
                serialNo: fopt.serialNo || '',
                startTime: '',
                nextDataFromIndex: fopt.dataFromIndex || 0,
                nextDataIndex: fopt.dataIndex || 0,
                queryArgs,
                endFlag: true
            };
        }

        let saveRes = errcodeInfo.success;
        if (fpdk_type === '3') {
            const clientType = fopt.clientType || 4;
            const taxNo = fopt.taxNo;
            saveRes = await ctx.service.invoiceSave.saveCommons(
                { ...fopt, clientType, taxNo, fpdk_type },
                { ...res }
            );
        }

        // 获取下一个循环步骤的索引，totalNum使用实际从税局获取的发票数量保证税局分页正常
        // let endFlag = false;
        // let nextDataFromIndex = 1;
        const continueFlag = typeof fopt.continueFlag === 'undefined' ? true : fopt.continueFlag;
        // if (parseInt(dataFromIndex) !== 0) {
        const nextOptInfo = this.getEtaxListOpt(fopt, true, { errcode: saveRes.errcode, nextDataIndex, totalNum });
        const nextDataFromIndex = nextOptInfo.index;
        const endFlag = !continueFlag || nextOptInfo.index === -1;
        // }

        return {
            errcode: saveRes.errcode,
            description: saveRes.description,
            totalNum: data.length,
            data: data,
            serialNo: saveRes.serialNo || getUUId(),
            startTime: saveRes.startTime || (+new Date()),
            nextDataFromIndex,
            nextDataIndex: 0,
            queryArgs,
            endFlag
        };
    }

    async tsgxExport(access_token, tokenInfo, fopt = {}, noCache) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt;
        ctx.service.log.info('plugin tsgxGxExport11 ------', opt.rzzt);
        const taxNo = tokenInfo.taxNo;
        const ygxztDm = (opt.rzzt || opt.rzzt === 0) ? opt.rzzt : '1'; // 勾选状态 0未勾选，1已勾选
        const urlOpt = {
            qdfphm: (opt.invoiceNo && opt.invoiceNo.length === 20) ? opt.invoiceNo : '', // 数电票号码
            zzfpDm: opt.invoiceCode || '',
            zzfpHm: (opt.invoiceNo && opt.invoiceNo.length !== 20) ? opt.invoiceNo : '',
            xfsbh: opt.salerTaxNo || '', // 销方识别号
            xfmc: opt.salerName || '', // 销方名称
            kprqq: opt.startTime || '', // 开票起止日期
            kprqz: opt.endTime || '',
            gxrqQ: opt.gxStartTime || '', // 勾选开始日期
            gxrqZ: opt.gxEndTime || '', // 勾选结束日期
            ygxztDm,
            fpbbDm: ''
        };

        ctx.service.log.info('退税扣勾选数据导出 参数', urlOpt);
        let govInvoiceTypes;
        if (opt.govInvoiceTypes) {
            govInvoiceTypes = getParamStr(opt.govInvoiceTypes, 'pz');
        } else {
            const invoiceTypeArgs = (!opt.invoiceType || opt.invoiceType === -1) ? [-1] : `${opt.invoiceType}`.split(',');
            const fplxDmRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs, 'pz');
            if (fplxDmRes.errcode !== '0000') {
                return fplxDmRes;
            }
            govInvoiceTypes = fplxDmRes.data;
        }

        const urlParamStr = paramJson(urlOpt) + '&' + govInvoiceTypes;
        const saveDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'tsgxInvoices');

        const fileName = hex_md5(urlParamStr + taxNo) + '.xlsx';
        let filePath = pathJoin(saveDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath);
        const exportUrl = '/ypfw/ckts/v1/dcChtsFpXi?' + urlParamStr;
        ctx.service.log.info('退税扣勾选数据导出 exportUrl', exportUrl);
        ctx.service.log.info('退税发票下载是否走缓存', !(!isExsit || noCache), `isExsit: ${isExsit},  noCache: ${noCache}`);
        if (!isExsit || noCache) {
            const res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath,
                passFetch: true,
                fileName,
                isFetchDownload: true
            });
            ctx.service.log.info('退税扣勾选数据导出 返回', exportUrl, res);
            if (res.errcode !== '0000') {
                return res;
            }
            filePath = res.data.filePath;
        }

        ctx.service.log.info('tsgxExport download filePath', filePath);
        let res2;
        if (parseInt(ygxztDm) === 1) {
            res2 = ygxInvoices(filePath, tokenInfo.taxPeriod, {
                buyerTaxNo: tokenInfo.taxNo
            });
            ctx.service.log.info('退税已勾选查询结果', res2);
        } else {
            res2 = wgxInvoices(filePath, tokenInfo.taxPeriod, {
                buyerTaxNo: tokenInfo.taxNo
            });
            ctx.service.log.info('退税未勾选查询结果', res2);
        }
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

    async tsytExport(access_token, tokenInfo, fopt = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('退税用途确认导出 参数1', fopt);

        const opt = fopt.searchOpt;
        const taxNo = tokenInfo.taxNo;
        const urlOpt = {
            zzfpDm: opt.invoiceCode || '',
            zzfpHm: (opt.invoiceNo && opt.invoiceNo.length !== 20) ? opt.invoiceNo : '',
            xfsbh: opt.salerTaxNo || '', // 销方识别号
            xfmc: '', // 销方名称
            fpbbDm: '',
            fphm: (opt.invoiceNo && opt.invoiceNo.length === 20) ? opt.invoiceNo : '', // 数电票号码
            lsbz: '01',
            fplb: '01',
            skssq: opt.rzssq || '' // 属期
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

        const urlParamStr = paramJson(urlOpt) + '&' + govInvoiceTypes;
        const saveDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'tsytInvoices');

        const fileName = hex_md5(urlParamStr + taxNo) + '.xlsx';
        let filePath = pathJoin(saveDirPath, fileName);
        const isExsit = ctx.service.collectCacheTool.checkFileIsExsit(filePath);
        const exportUrl = '/ypfw/cktsytqr/v1/exportDetailByPz?' + urlParamStr;
        ctx.service.log.info('exportUrl', isExsit, exportUrl);
        if (!isExsit) {
            const res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath,
                passFetch: true,
                fileName,
                isFetchDownload: true
            });
            ctx.service.log.info('退税用途确认导出 地址及返回1', exportUrl, res);
            if (res.errcode !== '0000') {
                return res;
            }
            filePath = res.data.filePath;
        }
        const taxPeriod = opt.rzssq || tokenInfo.taxPeriod;
        ctx.service.log.info('download filePath', filePath);
        ctx.service.log.info('invoiceType--', opt.invoiceType);
        const res2 = ygxYtInvoices(filePath, taxPeriod, {
            buyerTaxNo: tokenInfo.taxNo,
            getInvoiceTime: fopt.getInvoiceTime
        }, opt.invoiceType);
        ctx.service.log.info('退税用途确认查询结果1', res2);

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

    async ygxInvoices(access_token, tokenInfo, fopt = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('退税用途已勾选或已确认 参数', fopt);
        const opt = fopt.searchOpt;
        const dataFromIndex = fopt.dataFromIndex;
        const { taxPeriod } = opt;
        if (!taxPeriod || taxPeriod.length !== 6) {
            return {
                ...errcodeInfo.argsErr,
                description: '税期参数不能为空或格式错误，正确格式为（YYYYMM）'
            };
        }

        const resOpt = createDqwcYgxQueryParam(fopt, tokenInfo);
        resOpt.searchOpt.authenticateFlags = '1,2';
        if (parseInt(dataFromIndex) === 1) { // 已确认用途
            resOpt.searchOpt.startTime = moment(taxPeriod, 'YYYYMM').format('YYYY-MM-01');
            resOpt.searchOpt.endTime = moment().format('YYYY-MM-DD');
        }
        ctx.service.log.info('退税用途已勾选或已确认 转化参数', resOpt);
        const res = await this.queryInvoice(access_token, tokenInfo, resOpt);
        if (parseInt(dataFromIndex) === 1) { // 已确认用途
            res.nextDataFromIndex = -1;
            res.endFlag = true;
            res.nextDataIndex = 0;
        }
        ctx.service.log.info('退税用途已勾选或已确认 结果', res);
        return res;

        // return {
        //     ...res,
        //     endFlag: true,
        //     nextDataIndex: 0 // 没做分页
        // };
    }
}
/* eslint-disable no-undef,complexity,max-len */

import { getEtaxListOpt } from '../libs/getListOpt';
import { transDkgxInvoices, transBdkgxInvoices, transWdqInvoices, transDktjInvoices } from '../libs/etaxTransform';
import { getUUId } from '../utils/getUid';
import { govGxInvoiceTypes, govFpyInvoiceTypeDict } from './etaxV4QueryInvoices';
// import { getUrlYzm } from '$utils/tools';
export class EtaxQueryInvoices extends BaseService {
    getQueryArgs(preOpt) {
        return {
            searchOpt: preOpt.searchOpt,
            dataFrom: preOpt.dataFrom,
            dataFromIndex: preOpt.index,
            dataIndex: preOpt.dataIndex,
            name: preOpt.name
        };
    }

    // 检查参数是否支持，以前不支持的参数直接返回空
    checkSupport(searchOpt = {}) {
        if (typeof searchOpt.manageStatus !== 'undefined' && parseInt(searchOpt.manageStatus) !== 0) {
            return false;
        }
        const invoiceStatus = parseInt(searchOpt.invoiceStatus);
        // 失控状态，异常状态税局不支持查询
        if (invoiceStatus === 1 || invoiceStatus === 4) {
            return false;
        }
        return true;
    }

    async queryInvoices(access_token, tokenInfo = {}, initOpt = {}, notSave, originFile) {
        const ctx = this.ctx;
        ctx.service.log.info('plugin service1 --------------', initOpt);
        const { fpdk_type, taxNo } = ctx.request.query;
        initOpt = {
            ...initOpt,
            access_token,
            gxrqfw: tokenInfo.gxrqfw
        };

        const optInfo = getEtaxListOpt(initOpt);
        ctx.service.log.info('optInfo------------', optInfo);
        const preOpt = optInfo.opt;
        const preIndex = optInfo.index;

        if (preIndex === -1 || !this.checkSupport(initOpt.searchOpt)) {
            return {
                ...errcodeInfo.success,
                totalNum: 0,
                data: [],
                serialNo: initOpt.serialNo || '',
                startTime: '',
                nextDataFromIndex: initOpt.dataFromIndex || 0,
                nextDataIndex: initOpt.dataIndex || 0,
                queryArgs: {
                    searchOpt: initOpt.searchOpt,
                    dataFrom: '',
                    dataFromIndex: 0,
                    dataIndex: 0,
                    name: ''
                },
                endFlag: true
            };
        }

        const queryArgs = this.getQueryArgs(preOpt);
        if (preIndex === -1) {
            return {
                ...errcodeInfo.argsErr,
                queryArgs,
                endFlag: true
            };
        }
        const opt = optInfo.opt;
        ctx.service.log.info('opt1------------', opt);
        const dataFrom = preOpt.dataFrom;
        ctx.service.log.info('当前 dataFrom', dataFrom);
        const continueFlag = typeof initOpt.continueFlag === 'undefined' ? true : initOpt.continueFlag;
        let res;
        if (dataFrom === 'wdqQuery') {
            res = await ctx.service.etaxExportInvoice.wdqInvoices(tokenInfo, opt);
            // res = await this.wdqQueryInvoices(tokenInfo, opt);
        } else if (dataFrom === 'dkgxquery') {
            const useQueryList = ['91440300MA5G9GK78Y1'];
            if (opt.searchOpt.invoiceStatus === -1) {
                opt.searchOpt.invoiceStatus = '-1';
            } else if (opt.searchOpt.invoiceStatus === 3) {
                opt.searchOpt.invoiceStatus = '8';
            } else if (opt.searchOpt.invoiceStatus === 2) {
                opt.searchOpt.invoiceStatus = '2';
            }
            // 指定用query方式查询，目前税局抵扣勾选模块导出的发票开票日期没有秒
            if (useQueryList.includes(taxNo) || opt.useQuery) {
                res = await this.dkgxQueryInvoices(tokenInfo, opt);
            } else {
                res = await ctx.service.etaxExportInvoice.dkgxExport(tokenInfo, opt, false, originFile);
            }
        } else if (dataFrom === 'dktjQuery') {
            const useQueryList = ['91440300MA5G9GK78Y1'];
            if (useQueryList.includes(taxNo)) {
                res = await this.dktjQueryInvoices(tokenInfo, opt);
            } else {
                res = await ctx.service.etaxExportInvoice.dktjExport(tokenInfo, opt, originFile);
            }
        } else if (dataFrom === 'bdkgxquery') {
            if (originFile) {
                // excel导出不抵扣原因获取不到
                res = await ctx.service.etaxExportInvoice.bdkgxExport(tokenInfo, opt, originFile);
            } else {
                res = await this.bdkgxQueryInvoices(tokenInfo, opt);
            }
        }
        if (originFile) { // 返回源文件
            // 获取下一个循环步骤的索引，totalNum使用实际从税局获取的发票数量保证税局分页正常
            const nextOptInfo = getEtaxListOpt(initOpt, true, { errcode: errcodeInfo.success.errcode, nextDataIndex: 0, totalNum: 0 });

            const endFlag = !continueFlag || nextOptInfo.index === -1;
            return {
                ...res,
                nextDataFromIndex: nextOptInfo.index,
                queryArgs,
                endFlag
            };
        }
        const { nextDataIndex = 0, totalNum = 0, data = [], errcode, description } = res;
        if (res.errcode !== '0000') {
            return {
                ...res,
                totalNum: 0,
                data: [],
                serialNo: initOpt.serialNo || '',
                startTime: '',
                nextDataFromIndex: initOpt.dataFromIndex || 0,
                nextDataIndex: initOpt.dataIndex || 0,
                queryArgs,
                endFlag: true
            };
        }
        // 税局抵扣统计发票不支持开票日期查询，需要自己过滤
        const checkTime = (dataFrom === 'dktjQuery' && initOpt.searchOpt.filterByInvoiceDate);
        let filterData = [];
        // 不需要过来，可以调用后自行过滤或者税局对应模块的参数已经支持不需要过滤
        if (opt.disabledFilter) {
            filterData = data;
        } else {
            // 根据筛选条件删除与查询条件不一致的发票
            filterData = ctx.service.collectCacheTool.filterInvoices(data, opt.searchOpt, checkTime);
        }
        ctx.service.log.info('filterData length', filterData.length);
        let saveRes = errcodeInfo.success;
        if (fpdk_type === '3' && !notSave) {
            const clientType = initOpt.clientType || 4;
            saveRes = await ctx.service.invoiceSave.saveCommons({ ...initOpt, clientType, taxNo, fpdk_type }, { errcode, description, data: filterData });
        }

        //
        // 获取下一个循环步骤的索引，totalNum使用实际从税局获取的发票数量保证税局分页正常
        const nextOptInfo = getEtaxListOpt(initOpt, true, { errcode: saveRes.errcode, nextDataIndex, totalNum });
        const endFlag = !continueFlag || nextOptInfo.index === -1;

        return {
            errcode: saveRes.errcode,
            description: saveRes.description,
            totalNum: filterData.length,
            data: filterData,
            serialNo: saveRes.serialNo || getUUId(),
            startTime: saveRes.startTime || (+new Date()),
            nextDataFromIndex: nextOptInfo.index,
            nextDataIndex: nextOptInfo.index === preIndex ? nextDataIndex : 0,
            queryArgs,
            endFlag
        };
    }

    async querySingleInvoice(access_token, tokenInfo = {}, opt = {}) {
        const ctx = this.ctx;
        const list = [{
            invoiceCode: opt.invoiceCode,
            invoiceNo: opt.invoiceNo
        }];
        const clientType = opt.clientType || 4;
        const res = await ctx.service.fpyQueryInvoices.queryByCodeNos(access_token, list, tokenInfo, clientType);
        return res;
    }

    getInvoiceTypesParamsByAry(invoiceTypeArgs, splitTxfFlag) {
        let FplxDm = [];
        let fplxRes = {};
        for (let i = 0; i < invoiceTypeArgs.length; i++) {
            fplxRes = this.getInvoiceTypesParams(Number(invoiceTypeArgs[i]), splitTxfFlag);
            if (fplxRes.errcode === '0000') {
                FplxDm = [...FplxDm, ...fplxRes.data];
            } else {
                return fplxRes;
            }
        }
        const result = new Set(FplxDm);
        return {
            ...fplxRes,
            data: [...result]
        };
    }

    getInvoiceTypesParams(invoiceType, splitTxfFlag) {
        const ctx = this.ctx;
        let fplxDmArr = [];
        const { fixEtaxInvoiceType } = ctx.request.query;
        if (invoiceType === -1) {
            // 全部发票，旧版只支持，2，电子专票，4增值税专用发票，12机动车发票，15通行费发票
            fplxDmArr = [...govGxInvoiceTypes];
        } else if (fixEtaxInvoiceType === '1' && invoiceType === 2) { // 不支持数电的星空需要转换电子专票类型
            // 同时查询电子专票和数电专票
            fplxDmArr = [
                '08',
                '81'
            ];
        } else {
            const fplxType = govFpyInvoiceTypeDict;
            if (!fplxType['k' + invoiceType]) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `不支持的发票类型: ${invoiceType}`
                };
            }

            if (Number(invoiceType) === 12) {
                fplxDmArr = ['03', '87']; // 数电机动车， 数电纸质机动车
            } else if (Number(invoiceType) === 3) {
                fplxDmArr = ['86', '04'];
            } else if (Number(invoiceType) === 4) {
                fplxDmArr = ['85', '01'];
            } else if (splitTxfFlag && Number(invoiceType) === 15) { // 通行费发票独立出来
                fplxDmArr = ['10', '14'];
            } else {
                fplxDmArr = [fplxType['k' + invoiceType]];
            }
        }
        return {
            errcode: '0000',
            data: fplxDmArr
        };
    }

    // 还未处理，目前账号没有未到期发票
    async wdqQueryInvoices(tokenInfo, fopt) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        const invoiceTypeArgs = opt.invoiceType === -1 ? [-1] : `${opt.invoiceType}`.split(',');
        const fplxRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs);
        // const fplxRes = this.getInvoiceTypesParams(opt.invoiceType);
        if (fplxRes.errcode !== '0000') {
            return fplxRes;
        }
        const pageSize = 100;

        const jsonData = {
            Fplb: 'fp',
            Fply: ['2', '1'],
            Fplx: fplxRes.data,
            Fppz: [],
            Tdyslx: [],
            Kprqq: opt.startTime,
            Kprqz: opt.endTime,
            Fpdm: opt.invoiceCode,
            Fphm: opt.invoiceNo,
            Qdfphm: opt.qdInvoiceNo || '',
            Current: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize,
            Total: 0,
            ShowJumper: true
        };
        const urlPath = '/szzhzz/WdgxrqfpcxController/v1/queryWdgxrqfpxx';

        const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
            dataType: 'json',
            method: 'post',
            body: JSON.stringify(jsonData)
        });
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Total = 0, List = [] } = resData || {};
        const listData = transWdqInvoices(List, {
            // buyerName: tokenInfo.companyName,
            buyerTaxNo: tokenInfo.taxNo
        });
        return {
            ...errcodeInfo.success,
            data: listData,
            totalNum: Total,
            nextDataIndex: dataIndex + List.length
        };
    }

    // 抵扣勾选
    async dkgxQueryInvoices(tokenInfo, fopt) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        const gxztDm = opt.rzzt || '0';

        const checkRes = await this.getYgxInvoiceAuthenticateFlag(tokenInfo, gxztDm);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const checkRes2 = await ctx.service.etaxQueryInvoices.checkDkgxHasRepeateData(tokenInfo, {
            gxzt: gxztDm,
            continueFlag: fopt.continueFlag,
            startTime: opt.startTime,
            endTime: opt.endTime,
            authenticateFlags: opt.authenticateFlags
        }, checkRes.data);

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

        const tongjiIsConfirm = checkRes.data === 2;

        let fpztDm = ['0', '2', '7', '8'];
        if (opt.invoiceStatus === -1 || opt.invoiceStatus === '-1') {
            fpztDm = ['0', '2', '7', '8'];
        } else if (opt.invoiceStatus === 3) {
            fpztDm = ['7'];
        } else if (opt.invoiceStatus === 2) {
            fpztDm = ['2'];
        } else {
            fpztDm = [opt.invoiceStatus + ''];
        }
        let govInvoiceTypes;
        if (opt.govInvoiceTypes) {
            govInvoiceTypes = opt.govInvoiceTypes;
        } else {
            const invoiceTypeArgs = opt.invoiceType === -1 ? [-1] : `${opt.invoiceType}`.split(',');
            const fplxRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs, true);
            if (fplxRes.errcode !== '0000') {
                return fplxRes;
            }
            govInvoiceTypes = fplxRes.data;
        }

        let Qdfphm = '';
        let Fphm = opt.invoiceNo;
        if (opt.invoiceNo && opt.invoiceNo.length === 20) { // 全量发票
            Qdfphm = opt.invoiceNo;
            Fphm = '';
        }
        const pageSize = fopt.pageSize || 500;
        const jsonData = {
            GxztDm: gxztDm,
            FpbbDm: '-1', // 发票来源，-1全部，1增值税发票管理平台, 2电子发票服务平台
            KprqQ: opt.startTime,
            KprqZ: opt.endTime,
            FpztDm: fpztDm,
            FplxDm: govInvoiceTypes,
            Znxzmbh: '',
            Qdfphm, // opt.qdInvoiceNo || '',
            Fpdm: opt.invoiceCode,
            Fphm, // opt.invoiceNo,
            Xfsbh: opt.salerTaxNo || '',
            Xfmc: '',
            FxdjDm: opt.fxdjDm ? [opt.fxdjDm] : ['01', '02', '03'], // 发票风险等级 -1全部，01正常，03疑点发票，02异常凭证
            GfsbhArr: [],
            ywlx: opt.ywlx || ['16', '12', '99'], // 业务类型 全部： ['08', '16', '12', '99'], 16:农产品收购，12:农产品销售，08: 通行费，
            gxrqQ: opt.startTimeGx || '', // 勾选开始日期
            gxrqZ: opt.endTimeGx || '', // 勾选结束日期
            ycfpbsDm: [
                '00',
                '03',
                '04',
                '07',
                '02',
                '06',
                '01',
                '05',
                '99'
            ],
            PageNumber: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize
        };
        ctx.service.log.info('抵扣发票查询参数', jsonData);
        const urlPath = '/ypfw/dkgx/v1/queryFpxx';

        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);

        ctx.service.log.info('抵扣发票查询返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || {};

        const { Total = 0, List = [] } = resData || {};
        const listData = transDkgxInvoices(List, tokenInfo.taxPeriod, {
            getInvoiceTime: fopt.getInvoiceTime,
            buyerTaxNo: tokenInfo.taxNo
        }, tongjiIsConfirm);
        ctx.service.log.info('抵扣发票查询返回transDkgxInvoices', res);
        return {
            ...errcodeInfo.success,
            data: listData,
            totalNum: Total,
            nextDataIndex: dataIndex + List.length
        };
    }

    // 不抵抵扣勾选, 要根据统计表状态确定是否已经勾选认证
    async bdkgxQueryInvoices(tokenInfo, fopt, returnOriginData) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        const gxztDm = opt.rzzt || '0';
        ctx.service.log.info('不抵扣发票查询参数 fopt', fopt);
        const checkRes = await this.getYgxInvoiceAuthenticateFlag(tokenInfo, gxztDm);
        ctx.service.log.info('不抵扣发票查询：getYgxInvoiceAuthenticateFlag', checkRes);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const tongjiIsConfirm = checkRes.data === 2;

        let fpztDm = ['0', '2', '8', '7'];
        if (parseInt(opt.invoiceStatus) === -1) {
            fpztDm = ['0', '2', '8', '7'];
        } else if (parseInt(opt.invoiceStatus) === 3 || parseInt(opt.invoiceStatus) === 7) {
            fpztDm = ['7'];
        } else if (parseInt(opt.invoiceStatus) === 8) {
            fpztDm = ['8'];
        } else if (parseInt(opt.invoiceStatus) === 2) {
            fpztDm = ['2'];
        } else if (parseInt(opt.invoiceStatus) === 0) {
            fpztDm = ['0'];
        } else {
            fpztDm = ['0', '2', '8', '7'];
        }
        let govInvoiceTypes;
        if (opt.govInvoiceTypes) {
            govInvoiceTypes = opt.govInvoiceTypes;
        } else {
            const invoiceTypeArgs = opt.invoiceType === -1 ? [-1] : `${opt.invoiceType}`.split(',');
            const fplxRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs, true);
            ctx.service.log.info('不抵扣发票查询：getInvoiceTypesParams', fplxRes);
            if (fplxRes.errcode !== '0000') {
                return fplxRes;
            }
            govInvoiceTypes = fplxRes.data;
        }

        const pageSize = opt.pageSize || 100;
        let Qdfphm = '';
        let Fphm = opt.invoiceNo;
        if (opt.invoiceNo && opt.invoiceNo.length === 20) { // 全量发票
            Qdfphm = opt.invoiceNo;
            Fphm = '';
        }

        const jsonData = {
            skssq: opt.taxPeriod || '', // 可以指定税期查询
            GxztDm: gxztDm,
            FpbbDm: '-1', // 发票来源，-1全部，1增值税发票管理平台, 2电子发票服务平台
            Pz: govInvoiceTypes,
            Fpzt: fpztDm,
            Qdfphm,
            Fpdm: opt.invoiceCode,
            Fphm,
            Xfsbh: opt.salerTaxNo,
            Kprqq: opt.startTime,
            Kprqz: opt.endTime,
            Xfmc: '',
            Znxzmbh: '',
            FxdjDm: opt.fxdjDm ? [opt.fxdjDm] : ['01', '02', '03'], // 发票风险等级 -1全部，01正常，03疑点发票，02异常凭证
            GfsbhArr: [],
            PageNumber: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize
        };
        ctx.service.log.info('不抵扣发票查询参数', jsonData);
        const urlPath = '/ypfw/bdkgx/v1/zzsfpxxcx';

        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);

        ctx.service.log.info('不抵扣发票查询返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Total = 0, List = [] } = resData || {};
        // 需要提取原始数据
        if (returnOriginData) {
            return res;
        }
        const listData = transBdkgxInvoices(List, tokenInfo.taxPeriod, {
            getInvoiceTime: fopt.getInvoiceTime,
            buyerTaxNo: tokenInfo.taxNo
        }, tongjiIsConfirm);
        ctx.service.log.info('不抵扣发票查询返回 listData', listData);
        return {
            ...errcodeInfo.success,
            data: listData,
            totalNum: Total,
            nextDataIndex: dataIndex + List.length
        };
    }

    // 检查已勾选发票的认证状态
    async getYgxInvoiceAuthenticateFlag(tokenInfo, gxztDm = '1') {
        const ctx = this.ctx;
        let authenticateFlag = 1;

        if (gxztDm === '1') {
            if (typeof tokenInfo.isConfirm !== 'undefined') {
                authenticateFlag = tokenInfo.isConfirm ? 2 : 1;
            } else {
                const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(tokenInfo);
                if (confirmRes.errcode !== '0000') {
                    return confirmRes;
                }
                authenticateFlag = confirmRes.data === 'N' ? 1 : 2;
            }
        }
        return {
            ...errcodeInfo.success,
            data: authenticateFlag
        };
    }

    // 在连续请求的情况下，避免以勾选和当期已确认发票重复, ygxRzzt为已勾选发票的认证状态
    async checkDkgxHasRepeateData(tokenInfo, opt = {}, ygxRzzt) {
        // const ctx = this.ctx;
        const {
            gxzt, // 当前是查询的已勾选发票，对应查询未勾选发票没有重复数据
            continueFlag,
            startTime,
            endTime,
            authenticateFlags
        } = opt;

        if (!startTime || !endTime || !continueFlag || parseInt(ygxRzzt) !== 2 || parseInt(gxzt) !== 1) {
            return {
                ...errcodeInfo.success,
                data: false
            };
        }

        if (startTime.length !== 10 || endTime.length !== 10) {
            return errcodeInfo.argsErr;
        }

        let tempFlags = 1;
        if (authenticateFlags === '' || authenticateFlags === -1) {
            tempFlags = 2;
        } else {
            const tempArr = authenticateFlags.split(',');
            if (tempArr.indexOf('2') !== -1 || tempArr.indexOf('3') !== -1) {
                tempFlags = 2;
            }
        }
        // 1只查询已勾选, 2需要查询已认证发票
        if (tempFlags === 1) {
            return {
                ...errcodeInfo.success,
                data: false
            };
        }

        const startMonthInt = parseInt(startTime.substr(0, 7).replace(/-/g, ''));
        const endMonthInt = parseInt(endTime.substr(0, 7).replace(/-/g, ''));
        const taxPeriodInt = parseInt(tokenInfo.taxPeriod);
        // 查询范围不包含当前已认证发票
        if (taxPeriodInt > endMonthInt || taxPeriodInt < startMonthInt) {
            return {
                ...errcodeInfo.success,
                data: false
            };
        }

        return {
            ...errcodeInfo.success,
            data: true
        };
    }

    // 检查当前税期是否有已认证发票数据
    async checkDktjHasData(tokenInfo, opt = {}) {
        const ctx = this.ctx;
        const { rzssq } = opt;
        const { pageId } = ctx.request.query || {};
        const taxPeriodRes = await ctx.service.etaxLogin.dqskssq(pageId);
        if (taxPeriodRes.errcode !== '0000') {
            return taxPeriodRes;
        }
        const taxPeriod = taxPeriodRes.data || tokenInfo.taxPeriod;
        // 查询的税期大于当前税期
        if (parseInt(rzssq) > parseInt(taxPeriod)) {
            return {
                ...errcodeInfo.success,
                data: false
            };
        }
        // 查询当前税期已确认的发票
        if (rzssq === taxPeriod) {
            const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(tokenInfo);
            if (confirmRes.errcode !== '0000') {
                return confirmRes;
            }
            const confirmStatus = confirmRes.data;
            // 统计表是未确认状态
            if (confirmStatus === 'N') {
                return {
                    ...errcodeInfo.success,
                    data: false
                };
            }
        }
        return {
            ...errcodeInfo.success,
            data: true
        };
    }

    // 已认证抵扣统计的发票
    async dktjQueryInvoices(tokenInfo, fopt) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        if (!opt.rzssq) {
            return errcodeInfo.argsErr;
        }
        const invoiceTypeArgs = opt.invoiceType === -1 ? [-1] : `${opt.invoiceType}`.split(',');
        const fplxRes = this.getInvoiceTypesParamsByAry(invoiceTypeArgs);
        if (fplxRes.errcode !== '0000') {
            return fplxRes;
        }

        const continueFlag = fopt.continueFlag;
        const { rzssq = '', authenticateFlags } = opt;
        const checkRes = await this.checkDktjHasData(tokenInfo, { continueFlag, rzssq, authenticateFlags });
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
        const pageSize = fopt.pageSize || 500;
        const jsonData = {
            FjgGfsbh: '',
            Gfsbh: '',
            Skssq: rzssq,
            PageNumber: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize,
            FpbbDm: '-1',
            IsTotal: true,
            Title: '合计',
            TableType: 'deduction',
            DeductionType: '1',
            Fphm: opt.qdInvoiceNo || '',
            ZzfpDm: opt.invoiceCode,
            ZzfpHm: opt.invoiceNo,
            Xfsbh: opt.salerTaxNo,
            Pz: fplxRes.data,
            Gxrzsjq: '',
            Gxrzsjz: '',
            Znxzmbh: '',
            Qrqcbz: '0',
            Fplxbz: '8'
        };
        ctx.service.log.info('dktjQuery jsonData', jsonData);
        const urlPath = '/ypfw/ytqr/v1/fpxxcx';
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: jsonData
        // });
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};

        const { Total = 0, List = [] } = resData || {};
        const listData = transDktjInvoices(List, opt.rzssq, {
            // buyerName: tokenInfo.companyName,
            buyerTaxNo: tokenInfo.taxNo
        });
        return {
            ...errcodeInfo.success,
            data: listData,
            totalNum: Total,
            nextDataIndex: dataIndex + List.length
        };
    }

}
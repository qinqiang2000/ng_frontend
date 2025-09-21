/* eslint-disable complexity, no-undef */
// import { BaseController } from './baseController';
// import { changeQueryInvoicesParam, changeFpyInvoiceType, changeBdkgxParam, changeEtaxQueryParam } from '$client/fpdk-gov/libs/govParamsChange';
// import { easydkqueryOutPut, recvinvOutPut, recvinvMerge, easydkqueryMerge } from '$client/fpdk-gov/libs/transformOldCom';
// import { transformInvoiceTypeToFpy } from '$client/fpdk-gov/libs/downloadApplyTool';
// import errcodeInfo from '$client/errcodeInfo';
// import { sleep } from '$utils/tools';
// import { encrypt as aes128Encrypt } from '$utils/aes';
// import { tokenCachePreKey, etaxLoginedCachePreKey } from '$client/fpdk-gov/constant';
// import pwyStore from '$client/electronStore';
// import moment from 'moment';

import { PluginBaseController } from './pluginBaseController';
import { changeQueryInvoicesParam, changeFpyInvoiceType, changeBdkgxParam, changeEtaxQueryParam } from '../libs/govParamsChange';
import { easydkqueryOutPut, recvinvOutPut, recvinvMerge, easydkqueryMerge } from '../libs/transformOldCom';
import { transformInvoiceTypeToFpy } from '../libs/downloadApplyTool';

const aes128Encrypt = aesEncrypt;
// 企业通用token信息存储前缀
const tokenCachePreKey = 'company-zf-token-info-';
// 电子税局登录缓存前缀
const etaxLoginedCachePreKey = 'company-etax-login-info-';

function sleep(timeout?: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timeout || 1000);
    });
}

export class FpdkOldCom extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    // 单张查询
    async queryFpyDataByDmhm(userData : any = {}, requestOpt: any = {}) {
        const ctx = this.ctx;
        const fpdm = requestOpt.fpdm || '';
        const fphm = requestOpt.fphm || '';
        const data = {
            page: 1,
            pageSize: 1,
            invoiceCode: fpdm,
            invoiceNo: fphm
        };
        const url = `/m6/bill/sync/collect/unit/query/invoice?taxNo=${userData.taxNo}`;
        const cacheInfo = pwyStore.get(tokenCachePreKey + userData.taxNo) || {};
        let encrypeKey = cacheInfo.encrypeKey;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3') {
            const res1 = await ctx.service.ntTools.tokenInfoGetEncryptKey();
            if (res1.errcode !== '0000') {
                return res1;
            }
            encrypeKey = res1.data?.encryptKey;
        }
        const res = await ctx.service.fpdkRequest.fpyCurl(url, {
            data: aes128Encrypt(JSON.stringify(data), encrypeKey),
            method: 'POST',
            dataType: 'json',
            contentType: 'text/plain'
        }, { taxNo: userData.taxNo });
        ctx.service.log.info('queryFpyDataByDmhm单张查询返回', data, res);
        if (res.errcode !== '0000') {
            return {
                ...res,
                invoice: [],
                startDate: '',
                endDate: '',
                copies: 0,
                totalMoney: '0.00'
            };
        }
        const info = recvinvOutPut(res.data);
        return {
            ...errcodeInfo.success,
            invoice: info.invoice,
            startDate: '',
            endDate: '',
            copies: info.invoice.length,
            totalMoney: info.totalMoney
        };
    }

    // 查询发票云数据
    async queryFpyData(userData : any = {}, originOpt: any = {}, flag = 'recvinv') {
        const ctx = this.ctx;
        const requestOpt = originOpt.data || {};
        let invoiceTypes = '2,4,12,15,27';
        const isSingleQuery = requestOpt.fpdm && requestOpt.fphm;
        // 单张查询
        if (isSingleQuery) {
            const res = await this.queryFpyDataByDmhm(userData, requestOpt);
            return res;
        }
        // 批量查询
        if (requestOpt.fplx) {
            // 旧版发票类型为05
            const fplx = requestOpt.fplx === '05' ? '08' : requestOpt.fplx;
            // 数电发票税局旧平台类型为31,新平台为81
            const invoiceType = (fplx === '31' || fplx === '81') ? 27 : transformInvoiceTypeToFpy(fplx);
            if (invoiceType === -1) {
                return {
                    ...errcodeInfo.argsErr,
                    invoice: [],
                    startDate: requestOpt.rq_q,
                    endDate: requestOpt.rq_z,
                    copies: 0,
                    totalMoney: '0.00',
                    description: '发票类型参数错误或不支持'
                };
            }
            invoiceTypes = invoiceType.toString();
        }
        let rzzt = -1;
        if (typeof requestOpt.rzzt !== 'undefined' && requestOpt.rzzt !== '') {
            rzzt = parseInt(requestOpt.rzzt);
        }

        let gxzt = -1;
        if (typeof requestOpt.gxzt !== 'undefined' && requestOpt.gxzt !== '') {
            gxzt = -1;
        }
        let fpzt = -1;
        if (typeof requestOpt.fpzt !== 'undefined' && requestOpt.fpzt !== '') {
            fpzt = parseInt(requestOpt.fpzt);
        }

        const authenticateFlags : any = [];
        if (rzzt === -1 || rzzt === 0) {
            if (gxzt === -1) {
                authenticateFlags.push('1');
                authenticateFlags.push('0');
            } else if (gxzt === 0) {
                authenticateFlags.push('0');
            } else {
                authenticateFlags.push('1');
            }
        }

        if (rzzt === -1 || rzzt === 1) {
            authenticateFlags.push('2');
            authenticateFlags.push('3');
        }
        const url = `/m6/bill/sync/collect/unit/query/invoice?taxNo=${userData.taxNo}`;
        const taxPeriods = [];
        // 已认证需要传税期范围
        if (authenticateFlags.indexOf('2') !== -1 || authenticateFlags.indexOf('3') !== -1) {
            let nextDateMonth = requestOpt.rq_q.replace(/-/g, '').substr(0, 6);
            let nextDateMonthInt = parseInt(nextDateMonth);
            const maxDateMonthInt = parseInt(requestOpt.rq_z.replace(/-/g, '').substr(0, 6));
            for (let i = nextDateMonthInt; i <= maxDateMonthInt; i++) {
                taxPeriods.push(nextDateMonth);
                nextDateMonth = moment(nextDateMonth, 'YYYYMM').add(1, 'months');
                nextDateMonthInt = parseInt(nextDateMonth);
            }
        }
        const fpyParams = {
            page: 1,
            pageSize: 500,
            startTime: authenticateFlags.indexOf('0') === -1 ? null : requestOpt.rq_q,
            endTime: authenticateFlags.indexOf('0') === -1 ? null : requestOpt.rq_z,
            invoiceTypes,
            authenticateFlags: authenticateFlags.join(','),
            salerTaxNo: requestOpt.xfsbh || null,
            buyerTaxNo: userData.taxNo || null,
            invoiceStatus: fpzt === -1 ? null : fpzt,
            startSelectTime: authenticateFlags.indexOf('1') === -1 ? null : requestOpt.rq_q,
            endSelectTime: authenticateFlags.indexOf('1') === -1 ? null : requestOpt.rq_z,
            taxPeriods: taxPeriods.length === 0 ? null : taxPeriods.join(',')
        };

        const cacheInfo = pwyStore.get(tokenCachePreKey + userData.taxNo) || {};
        let encrypeKey = cacheInfo.encrypeKey;
        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3') {
            const res1 = await ctx.service.ntTools.tokenInfoGetEncryptKey();
            if (res1.errcode !== '0000') {
                return res1;
            }
            encrypeKey = res1.data?.encryptKey;
        }
        let result : any = [];
        let res;
        let goOn = true;
        let nextPage = 1;
        let invoiceAmount = 0.00;
        do {
            fpyParams.page = nextPage;
            ctx.service.log.info('发票云批量查询参数', fpyParams);
            res = await ctx.service.fpdkRequest.fpyCurl(url, {
                data: aes128Encrypt(JSON.stringify(fpyParams), encrypeKey),
                method: 'POST',
                dataType: 'json',
                contentType: 'text/plain'
            }, { taxNo: userData.taxNo });

            const currentPage = res.currentPage || 0;
            if (res.errcode === '0000') {
                const resData = res.data || [];
                ctx.service.log.info('发票云批量查询返回', resData.length);
                let tempInfo : any = {};
                if (flag === 'recvinv') {
                    tempInfo = recvinvOutPut(res.data);
                } else {
                    tempInfo = easydkqueryOutPut(res.data);
                }
                const tempArr = tempInfo.invoice;
                invoiceAmount += parseFloat(tempInfo.totalMoney);
                result = result.concat(tempArr);
            } else {
                ctx.service.log.info('发票云批量查询url及参数', url, fpyParams);
                ctx.service.log.info('发票云批量查询异常，返回', res);
            }

            nextPage = currentPage + 1;
            if (!res.data || res.data.length === 0) {
                goOn = false;
            }
        } while (goOn);
        return {
            ...errcodeInfo.success,
            invoice: result,
            startDate: requestOpt.rq_q,
            endDate: requestOpt.rq_z,
            copies: result.length,
            totalMoney: invoiceAmount.toFixed(2)
        };
    }

    // 循环获取税局数据
    async queryAllGovData(userData: any, requestOpt : any, flag = 'recvinv') {
        const ctx = this.ctx;
        let res : any;
        let goOn = true;
        let arrList : any = [];
        let nextDataIndex = 0;
        let nextDataFromIndex = 0;
        let invoiceAmount = 0.00;
        let hasError = false;
        let description = 'success';
        let errcode = '0000';
        const { fpdk_type, access_token, pageId, fixEtaxInvoiceType } = ctx.request.query;
        do {
            requestOpt.dataIndex = nextDataIndex;
            requestOpt.dataFromIndex = nextDataFromIndex;
            try {
                if (fpdk_type === '3') {
                    res = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, userData, requestOpt);
                } else {
                    res = await ctx.service.queryInvoicesV4.queryInvoices(userData, requestOpt);
                }
            } catch (error) {
                ctx.service.log.info('税局查询异常', userData, error);
                res = errcodeInfo.govErr;
            }

            nextDataIndex = res.nextDataIndex || 0;
            nextDataFromIndex = res.nextDataFromIndex || 0;
            if (res.errcode === '0000') {
                let tempArr : any = [];
                let tempInfo : any = {};
                if (flag === 'recvinv') {
                    tempInfo = recvinvOutPut(res.data, fixEtaxInvoiceType);
                } else if (flag === 'easydkquery') {
                    tempInfo = easydkqueryOutPut(res.data, fixEtaxInvoiceType);
                }
                tempArr = tempInfo.invoice;
                invoiceAmount += parseFloat(tempInfo.totalMoney);
                arrList = arrList.concat(tempArr);
                if (res.endFlag) {
                    goOn = false;
                } else {
                    await sleep(800);
                }
            } else if (res.errcode === '91300') { // 电子税局登录失效
                if (fpdk_type === '3') {
                    await ctx.service.ntTools.updateRemoteLoginStatus(pageId, '');
                    pwyStore.delete(etaxLoginedCachePreKey + pageId);
                }
                goOn = false;
                hasError = true;
                errcode = res.errcode;
                description = res.description;
            } else if (res.endFlag === true || typeof res.endFlag === 'undefined') {
                hasError = true;
                goOn = false;
            }
        } while (goOn);
        return {
            errcode,
            description,
            hasError: hasError,
            invoice: arrList,
            copies: arrList.length,
            startDate: requestOpt.searchOpt.rq_q,
            endDate: requestOpt.searchOpt.rq_z,
            totalMoney: invoiceAmount.toFixed(2)
        };
    }

    async easydkquery() {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        let requestData = ctx.request.body;
        ctx.service.log.info('easydkquery plugin------ 请求参数', requestData);
        let checkRes;
        if (fpdk_type === '3') {
            requestData = requestData.data;
            checkRes = await ctx.service.ntTools.checkEtaxLogined();
        } else {
            checkRes = await ctx.service.ntTools.checkIsLogined();
        }
        const {
            checkdate_start,
            checkdate_end,
            sellertaxcode,
            invcode = '',
            invnum = ''
        } = requestData;
        const userInfo = checkRes.data || {};
        const { access_token } = userInfo;
        let govList : any = [];
        if (checkRes.errcode !== '0000') {
            // 没有获取到token无法通过后台补充数据
            if (!access_token) {
                ctx.service.log.info('获取token异常无法通过后台补充数据');
                return await this.responseJson(checkRes);
            }
        } else {
            const searchOpt = {
                startTime: checkdate_start,
                endTime: checkdate_end,
                salerTaxNo: sellertaxcode,
                authenticateFlags: '2,3',
                fpdm: invcode,
                fphm: invnum
            };
            let requestOpt;
            if (fpdk_type === '3') {
                const tempRes : any = changeEtaxQueryParam({
                    searchOpt
                });
                if (tempRes.errcode !== '0000') {
                    return await this.responseJson(tempRes);
                }
                requestOpt = tempRes.data;
            } else {
                requestOpt = changeQueryInvoicesParam({ searchOpt });
            }
            ctx.service.log.info('参数转换', requestOpt);
            const res = await this.queryAllGovData(checkRes.data, requestOpt, 'easydkquery');

            // 电子税局直接返回结果，先不通过后台补充数据
            // if (fpdk_type === '3') {
            //     return await this.responseJson(res);
            // }

            // 不管税局成功或失败都需要合并后台数据
            // if (res.errcode === '0000' && !res.hasError) {
            //     ctx.service.log.info('税局请求完全成功，不需要通过后台补充数据!');
            //     return await this.responseJson(res);
            // }
            govList = res.invoice || [];
        }
        /*
        ctx.service.log.info('税局获取数据异常，通过后台补充数据！');
        const fpyRes = await this.queryFpyData(userInfo, {
            data: {
                fpdm: invcode,
                fphm: invnum,
                rq_q: checkdate_start,
                rq_z: checkdate_end,
                rzzt: 1,
                gxzt: -1,
                fpzt: -1
            }
        }, 'easydkquery');
        */
        const fpyList: any = [];

        const mergeInfo = easydkqueryMerge(fpyList, govList);
        return await this.responseJson({
            ...errcodeInfo.success,
            ...mergeInfo,
            startDate: checkdate_start,
            endDate: checkdate_end
        });
    }

    // 勾选数据查询
    async recvinv() {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        let requestData = ctx.request.body;
        ctx.service.log.info('recvinv plugin------ 请求参数', requestData);
        let checkRes;
        if (fpdk_type === '3') {
            requestData = requestData.data;
            checkRes = await ctx.service.ntTools.checkEtaxLogined();
        } else {
            checkRes = await ctx.service.ntTools.checkIsLogined();
        }

        const data = requestData.data;
        const userInfo = checkRes.data || {};
        const { access_token } = userInfo;
        let govList : any = [];
        // 税局登录校验失败
        if (checkRes.errcode !== '0000') {
            // 获取发票云token成功才能通过后台数据补充
            if (!access_token) {
                ctx.service.log.info('获取token异常无法通过后台补充数据');
                return await this.responseJson(checkRes);
            }
        } else {
            // 登录成功后采集税局发票
            // 旧版发票类型为05
            const fplx = data.fplx === '05' ? '08' : (data.fplx || '');
            let requestOpt;
            if (fpdk_type === '3') {
                const tempRes : any = changeEtaxQueryParam({
                    searchOpt: {
                        ...data,
                        fplx
                    }
                });
                if (tempRes.errcode !== '0000') {
                    return await this.responseJson(tempRes);
                }
                requestOpt = tempRes.data;
            } else {
                requestOpt = changeQueryInvoicesParam({
                    searchOpt: {
                        ...data,
                        fplx
                    }
                });
            }
            ctx.service.log.info('参为税局转换', requestOpt);
            const res = await this.queryAllGovData(userInfo, requestOpt, 'recvinv');
            ctx.service.log.info('税局获取数据结果', res);
            if (res.errcode === '91300') {
                return await this.responseJson(errcodeInfo.govLogout);
            }
            // 电子税局请求直接返回结果，先不通过后台补充数据
            // if (fpdk_type === '3') {
            //     return await this.responseJson(res);
            // }
            // 不管税局成功或失败都需要合并后台数据
            // if (res.errcode === '0000' && !res.hasError) {
            //     ctx.service.log.info('税局请求完全成功，不需要通过后台补充数据!');
            //     return await this.responseJson(res);
            // }
            govList = res.invoice || [];
        }

        // ctx.service.log.info('税局获取数据异常，通过后台补充数据！');
        const fpyRes = await this.queryFpyData(userInfo, requestData);
        ctx.service.log.info('通过后台补充数据结果', fpyRes);
        const fpyList = fpyRes.invoice || [];
        // const fpyList: any = [];
        const mergeInfo = recvinvMerge(fpyList, govList);
        return await this.responseJson({
            ...errcodeInfo.success,
            ...mergeInfo,
            startDate: data.rq_q,
            endDate: data.rq_z
        });
    }

    // 发票勾选
    async fpcheck() {
        const ctx = this.ctx;
        let requestData = ctx.request.body;
        const { fpdk_type } = ctx.request.query;
        ctx.service.log.info('plugin------ 请求参数', requestData);
        let checkRes;
        if (fpdk_type === '3') {
            requestData = requestData.data;
            checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            const loginData = checkRes.data;
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
        } else {
            checkRes = await ctx.service.ntTools.checkIsLogined();
        }
        const {
            messageId,
            request_path,
            ...otherData
        } = requestData;
        const userInfo = checkRes.data || {};
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        // 电子税局旧版兼容
        if (fpdk_type === '3') {
            const access_token = ctx.request.query.access_token;
            const res = await ctx.service.etaxDkgxInvoices.dkgxInvoices(userInfo, otherData, access_token);
            return await this.responseJson(res);
        }
        const otherOpt = changeBdkgxParam(otherData);
        const res = await ctx.service.gxInvoiceV4.dkgx(userInfo, otherOpt);
        return await this.responseJson(res);
    }

    // 发票勾选确认
    async fpcheckconfirm() {
        const ctx = this.ctx;
        let requestData = ctx.request.body;
        ctx.service.log.info('plugin------ 请求参数', requestData);
        const { fpdk_type } = ctx.request.query;
        let checkRes;
        if (fpdk_type === '3') {
            requestData = requestData.data;
            checkRes = await ctx.service.ntTools.checkEtaxLogined();
            const loginData = checkRes.data;
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
        } else {
            checkRes = await ctx.service.ntTools.checkIsLogined();
        }

        const {
            messageId,
            request_path,
            ...otherData
        } = requestData;
        const userInfo = checkRes.data || {};
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        // 电子税局旧版兼容
        if (fpdk_type === '3') {
            const access_token = ctx.request.query.access_token;
            const res = await ctx.service.etaxDkgxInvoices.dkgxInvoices(userInfo, otherData, access_token);
            return await this.responseJson(res);
        }
        const res = await ctx.service.gxInvoiceV4.gxConfirm(userInfo, otherData);
        return await this.responseJson(res);
    }

    // 获取税款所属期
    async taxqrgycx() {
        const ctx = this.ctx;
        const requestData = ctx.request.body;
        const { fpdk_type } = ctx.request.query;
        let checkRes;
        ctx.service.log.info('plugin------ 请求参数', requestData);
        if (fpdk_type === '3') {
            checkRes = await ctx.service.ntTools.checkEtaxLogined();
            const loginData = checkRes.data;
            if (loginData.etaxAccountType !== 2 && loginData.etaxAccountType !== 3) {
                return await this.responseJson(errcodeInfo.govEtaxAccountTypeErr);
            }
        } else {
            checkRes = await ctx.service.ntTools.checkIsLogined();
        }
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        const cacheInfo = checkRes.data || {};
        const res = {
            ...errcodeInfo.success,
            data: {
                skssq: cacheInfo.skssq,
                gxrqfw: cacheInfo.gxrqfw
            }
        };
        return await this.responseJson(res);
    }

    // 单张发票查询
    async invoicequery() {
        const ctx = this.ctx;
        const { access_token, fpdk_type, taxNo = '' } = ctx.request.query;
        ctx.service.log.info('plugin------');
        const requestData = ctx.request.body;
        const {
            invoice_code,
            invoice_num,
            clientType = 4
        } = requestData;
        let tokenInfo = {
            taxNo
        };
        ctx.service.log.info('请求参数', requestData);
        // 电子税局不支持单张查询，直接查询发票云数据库
        if (fpdk_type !== '3') {
            const checkRes = await ctx.service.ntTools.checkIsLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes);
            }
            tokenInfo = checkRes.data;
        }
        const opt = {
            fpdm: invoice_code,
            fphm: invoice_num
        };

        if (fpdk_type === '3') {
            ctx.service.log.info('不支持的参数', fpdk_type);
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '电子税局不支持单张查询，请使用批量查询'
            });
            /*
            const list = [{
                invoiceCode: invoice_code,
                invoiceNo: invoice_num
            }];
            const res = await ctx.service.fpyQueryInvoices.queryByCodeNos(access_token, list, tokenInfo, clientType);
            return await this.responseJson(res);
            */
        }
        const res = await ctx.service.queryInvoicesV4.queryByfpdmFphm(tokenInfo, opt);
        return await this.responseJson(res);
    }
}
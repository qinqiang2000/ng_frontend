/* eslint-disable no-undef,complexity,max-len */
import { changeEtaxQueryParam, createDqwcYgxQueryParam } from '../libs/govParamsChange';
import { ntLockLoginPreKey } from '../constant';
// 进销项发票申请
export class EtaxAsyncQueryInvoices extends BaseService {
    /*
        status:
        1、表头已经下载，只需要下载全量发票明细;
        2、发票明细已经下载，只需要下载表头数据（销项数据没有表头下载，如果为销项可以直接修改为状态4）;
        3、表头明细都没有下载，都需要下载（销项数据没有表头下载）;
        4、表头明细都已经下载，发票智慧管家不处理直接返回成功，后台这种状态也不应该再调用发票智慧管家;
    */
    async queryEtaxInvoiceApply(access_token, tokenInfo, fopt) {
        const ctx = this.ctx;
        // const { cityPageId } = ctx.request.query;
        ctx.service.log.info('异步下票-开始1', fopt);
        const { startDate, endDate, batchNo, dataType, status, checkAuthenticateFlag, startTaxPeriod, endTaxPeriod } = fopt || {};
        if (!batchNo || !dataType || !status) {
            return {
                ...errcodeInfo.argsErr
            };
        }
        if (Number(dataType) === 1 && typeof checkAuthenticateFlag === 'undefined') {
            return {
                ...errcodeInfo.argsErr,
                description: '认证标志必填'
            };
        }
        if ((!checkAuthenticateFlag || Number(checkAuthenticateFlag) === 0) && (!startDate || !endDate)) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票日期必填'
            };
        }
        if (Number(checkAuthenticateFlag) === 1) {
            if (!tokenInfo.taxPeriod) {
                ctx.service.log.info('登录缓存信息', tokenInfo);
                return {
                    ...errcodeInfo.argsErr,
                    description: '未获取到当期税期'
                };
            }
            if (!startTaxPeriod || !endTaxPeriod) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '税期必填'
                };
            }
            if (parseInt(endTaxPeriod) < parseInt(startTaxPeriod)) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '开始税期不能大于截至税期'
                };
            }
            if (parseInt(endTaxPeriod) > parseInt(tokenInfo.taxPeriod)) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '截至税期不能大于当期税期'
                };
            }
        }
        const tpEndTime = moment(endDate, 'YYYY-MM-DD');
        const tpStartTime = moment(startDate, 'YYYY-MM-DD');
        if (tpEndTime.diff(tpStartTime, 'days') > 31) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票日期起止范围不能超过31天'
            };
        }
        if (!fopt.invoiceType) {
            fopt.invoiceType = -1;
        }
        // // 下票锁定切换税号10分钟
        // const lockRes1 = await ctx.service.redisLock.set(ntLockLoginPreKey + cityPageId, (+new Date()), 10 * 60);
        // ctx.service.log.info('异步下票-登录锁设置返回', lockRes1);
        // // 获取锁异常
        // if (lockRes1.errcode !== '0000') { // 其它异常
        //     ctx.service.log.info(cityPageId, '下票失败, 获取锁异常', lockRes1.description);
        //     return lockRes1;
        // }

        // // redis锁已经存在，设置失败
        // if (lockRes1.data?.result === false) {
        //     return {
        //         ...errcodeInfo.govErr,
        //         description: '该账号正在登录中, 请稍后再试!'
        //     };
        // }
        // // 防止切换过程中接口调用异常
        // ctx.request.query.ignoreLock = true;
        this.QueryAllEtaxInvoiceApplyAuthenticate(access_token, tokenInfo, fopt);
        return {
            ...errcodeInfo.success,
            data: {
                batchNo
            }
        };
    }

    async QueryAllEtaxInvoiceApplyAuthenticate(access_token, userInfo, fopt) {
        const ctx = this.ctx;
        // const { cityPageId } = ctx.request.query;
        const {
            dataType,
            status,
            invoiceType,
            startDate,
            endDate,
            batchNo,
            invoiceStatus,
            checkAuthenticateFlag, // 0 未认证，1已认证
            disableYgxInvoice,
            disableCache,
            taxNo
        } = fopt;
        let nextStatus = 4;
        let result = {};
        let syncDataStatus = null;

        if (Number(dataType) === 2 || Number(checkAuthenticateFlag) === 0) { // 销项明细，或者未认证，直接按照开票日期下载发票明细
            const optFull = {
                disableCache,
                searchOpt: {
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
            ctx.service.log.info('异步下票-发票明细-参数', optFull);
            // 改成只上传文件
            optFull.status = status;
            const resFull = await ctx.service.etaxQueryFullInvoices.queryInvoicesFile(access_token, userInfo, optFull);
            ctx.service.log.info('异步下票-发票明细-结果', resFull);
            if (resFull.errcode !== '0000') {
                nextStatus = -1;
            }
            if (resFull.errcode === '90401') { // 参数错误
                nextStatus = -2;
                result = resFull;
            }
            if (resFull.errcode === '0000' && resFull.Total === 0) {
                syncDataStatus = 1;
            }
        }
        if (Number(dataType) === 1 && Number(checkAuthenticateFlag) === 1) { // 已认证，当期已勾选 + 往期已认证加对应的明细
            let resYgx = { errcode: '0000' };
            const taxPeriodArys = this.spliTaxPeriod(fopt.startTaxPeriod, fopt.endTaxPeriod);
            const cIndex = taxPeriodArys.length - 1;
            const maxTaxPeriod = taxPeriodArys[cIndex];
            ctx.service.log.info('异步下票-最大属期', maxTaxPeriod);
            ctx.service.log.info('异步下票-当期属期', userInfo.taxPeriod);
            let isConfirm = false;
            if (maxTaxPeriod === userInfo.taxPeriod) { // 查看当期税期是否已认证
                const confirmRes = await ctx.service.etaxGxConfirm.isGxConfirm(userInfo);
                ctx.service.log.info('异步下票-当期是否认证-结果', confirmRes);
                if (confirmRes.errcode !== '0000') {
                    nextStatus = -1;
                }
                isConfirm = confirmRes.data === 'Y';
                userInfo.isConfirm = isConfirm;
                if (!isConfirm) { // 当期税期未认证
                    ctx.service.log.info('异步下票-当期已勾选未认证');
                    taxPeriodArys.pop();
                }
            } else if (parseInt(maxTaxPeriod) < parseInt(userInfo.taxPeriod)) {
                isConfirm = true;
                userInfo.isConfirm = isConfirm;
            }
            ctx.service.log.info('异步下票-最大属期 是否已经认证', isConfirm);
            // 当期已勾选未认证
            if (!disableYgxInvoice && !isConfirm) {
                ctx.service.log.info('异步下票-当期已勾选-开始');
                resYgx = await this.queryYgxTitle(access_token, userInfo, fopt);
                if (resYgx.errcode !== '0000') {
                    ctx.service.log.info('异步下票-当期已勾选-结果异常', resYgx);
                    nextStatus = -1;
                }
                if (resYgx.errcode === '90401') { // 参数错误
                    nextStatus = -2;
                    result = resYgx;
                }
                ctx.service.log.info('异步下票-当期已勾选-完毕', resYgx);
            }
            // 往期已认证
            if (disableYgxInvoice || (!disableYgxInvoice && resYgx.errcode === '0000')) {
                const resYrz = await this.queryYrzTitle(access_token, userInfo, fopt, taxPeriodArys);
                if (resYrz.errcode !== '0000') {
                    ctx.service.log.info('异步下票-已认证-结果异常', resYrz);
                    nextStatus = -1;
                }
                if (resYrz.errcode === '90401') { // 参数错误
                    nextStatus = -2;
                    result = resYrz;
                }
                ctx.service.log.info('异步下票-已认证-完毕', resYrz);
            }
        }
        const res2 = await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, nextStatus, taxNo, result, syncDataStatus);
        ctx.service.log.info('异步下票-完毕!', nextStatus, res2);

        if (nextStatus === 4) {
            // 通知后端，数据开始入库
            const url = '/m17/bill/analysis/tax/batchno/finish?batchNo=' + batchNo + '&access_token=' + access_token;
            ctx.service.log.info('异步下票-完毕 通知后端，数据开始入库', url);
            const resTip = await ctx.helper.curl(url, {
                method: 'GET',
                dataType: 'json',
                headers: {
                    'revenueNumber': taxNo
                }
            });
            ctx.service.log.info('异步下票-完毕 通知后端，数据开始入库 结果', resTip);
        }
        // // 切换税号解除锁定
        // await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);
        // ctx.service.log.info('异步下票-完毕-解锁', cityPageId);

    }

    async queryYrzTitle(access_token, userInfo, fopt, taxPeriodArys) {
        const ctx = this.ctx;
        ctx.service.log.info('异步下票-已认证表头-开始', typeof createDqwcYgxQueryParam);
        const {
            disableCache,
            invoiceType,
            batchNo,
            invoiceStatus,
            taxNo
        } = fopt;
        ctx.service.log.info('异步下票-已认证表头-税期范围', taxPeriodArys, typeof createDqwcYgxQueryParam);
        for (let i = 0; i < taxPeriodArys.length; i++) {
            const opt = {
                disableCache,
                searchOpt: {
                    invoiceType,
                    taxPeriod: taxPeriodArys[i]
                }
            };
            const notSave = true;
            const originFile = true;
            const resOpt = createDqwcYgxQueryParam(opt, userInfo);
            const resYrzTitle = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, userInfo, resOpt, notSave, originFile);
            ctx.service.log.info(`异步下票-已认证表头-批次${i}-结果、参数`, resYrzTitle, resOpt);
            if (resYrzTitle.errcode !== '0000') {
                return resYrzTitle;
            }
            const {
                queryArgs,
                filePath,
                taxPeriod,
                md5Key
            } = resYrzTitle;
            const resYrzUploadTitle = await ctx.service.invoiceSaveFiles.uploadTitleExcel(filePath, {
                ...opt,
                dataFromIndex: 4,
                taxNo,
                md5Key,
                taxPeriod,
                dataFrom: queryArgs.dataFrom,
                curDataFromIndex: opt.dataFromIndex
            });
            ctx.service.log.info(`异步下票-已认证表头-批次${i}-上传excel结果`, resYrzUploadTitle);
            if (resYrzUploadTitle.errcode !== '0000') {
                return resYrzUploadTitle;
            }
            const { totalNum } = resYrzUploadTitle.data;
            if (totalNum > 0) {
                const resYrzFull = await this.downloadYrzOrYgxFullInvoice(access_token, userInfo, resYrzUploadTitle, {
                    disableCache,
                    searchOpt: {
                        dataType: 1,
                        invoiceType,
                        invoiceStatus: invoiceStatus || -1,
                        batchNo,
                        pageNo: '',
                        pageSize: 5000
                    }
                }, '已认证');
                ctx.service.log.info(`异步下票-已认证表头-批次${i}-查询明细结果`, resYrzFull);
                if (resYrzFull.errcode !== '0000') {
                    return resYrzFull;
                }
            }
        }
        return errcodeInfo.success;
    }
    async queryYgxTitle(access_token, userInfo, fopt) {
        const ctx = this.ctx;
        const {
            disableCache,
            invoiceType,
            invoiceStatus,
            batchNo,
            taxNo
        } = fopt;
        // const { gxczjzrq } = userInfo;
        // const opt = {
        //     dataFromIndex: 1,
        //     continueFlag: true,
        //     searchOpt: {
        //         authenticateFlags: '1',
        //         invoiceType,
        //         startTime: moment(gxczjzrq).format('YYYY-MM-DD'),
        //         endTime: moment().format('YYYY-MM-DD'),
        //         invoiceStatus: invoiceStatus || -1
        //     }
        // };
        const curTaxPeriod = userInfo.taxPeriod;
        const opt = {
            disableCache,
            searchOpt: {
                invoiceType,
                taxPeriod: curTaxPeriod
            }
        };

        let resDownTitle = { errcode: '0000' };
        let resYgxUploadTitle = { errcode: '0000' };
        let resYrzFull = { errcode: '0000' };
        let goOn = false;
        let resOpt = createDqwcYgxQueryParam(opt, userInfo);
        do {
            ctx.service.log.info('异步下票-已勾选表头-参数', resOpt);
            const originFile = true;
            resDownTitle = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, userInfo, resOpt, true, originFile);
            if (resDownTitle.errcode === '0000') {
                const {
                    nextDataFromIndex,
                    endFlag,
                    queryArgs,
                    filePath,
                    taxPeriod,
                    md5Key
                } = resDownTitle;
                ctx.service.log.info('异步下票-已勾选表头-结果', resDownTitle);
                if (filePath) { // 返回文件路径才会去上传文件
                    resYgxUploadTitle = await ctx.service.invoiceSaveFiles.uploadTitleExcel(filePath, {
                        ...opt,
                        taxNo,
                        md5Key,
                        batchNo,
                        taxPeriod,
                        dataFromIndex: queryArgs.dataFrom === 'dkgxquery' ? 1 : 2,
                        dataFrom: queryArgs.dataFrom
                    });
                    ctx.service.log.info(`异步下票-已勾选表头-${nextDataFromIndex}-上传excel结果`, resYgxUploadTitle);
                    // if (resYgxUploadTitle.errcode !== '0000') {
                    //     return resYgxUploadTitle;
                    // }
                    const { totalNum } = resYgxUploadTitle.data;
                    if (totalNum > 0) {
                        resYrzFull = await this.downloadYrzOrYgxFullInvoice(access_token, userInfo, resYgxUploadTitle, {
                            disableCache,
                            searchOpt: {
                                dataType: 1,
                                invoiceType,
                                invoiceStatus: invoiceStatus || -1,
                                batchNo,
                                pageNo: '',
                                pageSize: 5000
                            }
                        }, '已勾选');
                        ctx.service.log.info(`异步下票-已勾选表头-${nextDataFromIndex}-查询明细结果`, resYrzFull);
                        // if (resYrzFull.errcode !== '0000') {
                        //     return resYrzFull;
                        // }
                    }
                }
                if (!endFlag && resYgxUploadTitle.errcode === '0000') {
                    goOn = true;
                    opt.dataFromIndex = nextDataFromIndex;
                    resOpt = createDqwcYgxQueryParam(opt, userInfo);
                } else {
                    goOn = false;
                }
            } else {
                ctx.service.log.info('进异步下票-表头-结果异常', resDownTitle);
                goOn = false;
            }
        } while (goOn);

        if (resDownTitle.errcode !== '0000') {
            return resDownTitle;
        }
        if (resYgxUploadTitle.errcode !== '0000') {
            return resYgxUploadTitle;
        }
        if (resYrzFull.errcode !== '0000') {
            return resYrzFull;
        }
        return errcodeInfo.success;
    }
    async downloadYrzOrYgxFullInvoice(access_token, userInfo, resUploadTitle, opt, flag) { // 下载已认证发票明细
        const ctx = this.ctx;
        ctx.service.log.info(`异步下票-表头-${flag}发票明细下载开始`);
        const { fileUrl } = resUploadTitle.data;
        const res = await ctx.service.invoiceSaveFiles.getData(fileUrl);
        if (res.errcode !== '0000') {
            ctx.service.log.info(`异步下票-表头-${flag}发票明细下载开始-读取已认证发票异常`, res);
            return resYrzFull;
        }
        const { data } = res;
        const resFull = await ctx.service.etaxQueryFullInvoices.downloadFullFileByXzFphm(access_token, userInfo, data, opt);
        ctx.service.log.info(`异步下票-表头-${flag}发票明细下载开始-结果`, resFull);
        return resFull;
    }

    spliTaxPeriod(startTaxPeriod, endTaxPeriod) {
        if (startTaxPeriod && !endTaxPeriod) {
            return [startTaxPeriod];
        }
        const taxPeriodArys = [];
        let curTaxPeriod = startTaxPeriod;
        let goOn = false;
        do {
            if (parseInt(curTaxPeriod) > parseInt(endTaxPeriod)) {
                goOn = false;
            } else {
                taxPeriodArys.push(curTaxPeriod);
                curTaxPeriod = moment(curTaxPeriod).add(1, 'months').format('YYYYMM');
                goOn = true;
            }
        } while (goOn);
        return taxPeriodArys;
    }
    // 老版本
    async queryAllEtaxInvoiceApply(access_token, userInfo, fopt) {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query;
        const {
            dataType,
            status,
            invoiceType,
            startDate,
            endDate,
            batchNo,
            invoiceStatus,
            authenticateFlags,
            taxNo
        } = fopt;
        let resDownTitle = { errcode: '0000' };
        let resUploadTitle = { errcode: '0000' };
        let resFull = { errcode: '0000' };
        let resYrzFull = { errcode: '0000' };
        if (status === 1 || status === 3) {
            const optFull = {
                searchOpt: {
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
            ctx.service.log.info('异步下票-发票明细-参数', optFull);
            // 改成只上传文件
            optFull.isInvoiceSuccess = resDownTitle.errcode === '0000' && resUploadTitle.errcode === '0000';
            optFull.status = status;
            resFull = await ctx.service.etaxQueryFullInvoices.queryInvoicesFile(access_token, userInfo, optFull);
            ctx.service.log.info('异步下票-发票明细-结果', resFull);
            // if (resFull.errcode === '0000' && status === 1) { // 上传明细发票已经更新了状态
            //     return;
            // }
        }
        if (dataType === 1 && (status === 2 || status === 3)) {
            let goOn = false;
            let opt = {
                dataFromIndex: '',
                continueFlag: true,
                searchOpt: {
                    authenticateFlags,
                    invoiceType,
                    startTime: startDate,
                    endTime: endDate,
                    invoiceStatus: invoiceStatus || -1
                }
            };
            if (Number(invoiceType) === 21) { // 海关缴款
                ctx.service.log.info('异步下票-表头-海关缴款');
                const checkRes = changeEtaxQueryParam(opt);
                opt = checkRes.data;
            }
            do {
                ctx.service.log.info('异步下票-表头-参数', opt);
                if (Number(invoiceType) === 21) { // 海关缴款
                    resDownTitle = await ctx.service.etaxQueryJks.queryInvoices(access_token, userInfo, opt);
                } else {
                    const originFile = true;
                    resDownTitle = await ctx.service.etaxQueryInvoices.queryInvoices(access_token, userInfo, opt, true, originFile);
                }
                if (resDownTitle.errcode === '0000') {
                    const {
                        nextDataFromIndex,
                        endFlag,
                        queryArgs,
                        filePath,
                        taxPeriod,
                        md5Key
                    } = resDownTitle;
                    ctx.service.log.info('异步下票-表头-结果', resDownTitle);
                    // if (res.data && res.data.length > 0) {
                    // res1 = await ctx.service.invoiceCache.fullInvoiceUpload(batchNo, 1, res.data);
                    if (filePath) { // 返回文件路径才会去上传文件
                        resUploadTitle = await ctx.service.invoiceSaveFiles.uploadTitleExcel(filePath, {
                            ...opt,
                            taxNo,
                            md5Key,
                            taxPeriod,
                            dataFrom: queryArgs.dataFrom,
                            curDataFromIndex: opt.dataFromIndex
                        });
                        if (queryArgs && queryArgs.dataFrom === 'dktjQuery' && resUploadTitle.errcode === '0000') { // 已认证，需要再去请求明细，结果不做校验
                            resYrzFull = await this.downloadYrzOrYgxFullInvoice(access_token, userInfo, resUploadTitle, {
                                searchOpt: {
                                    dataType: 1,
                                    invoiceType,
                                    startTime: startDate,
                                    endTime: endDate,
                                    invoiceStatus: invoiceStatus || -1,
                                    batchNo,
                                    pageNo: '',
                                    pageSize: 5000
                                }
                            });
                        }
                    }
                    if (!endFlag && resUploadTitle.errcode === '0000') {
                        goOn = true;
                        if (Number(nextDataFromIndex) === 3) { // 未到期不请求
                            opt.dataFromIndex = 4;
                        } else {
                            opt.dataFromIndex = nextDataFromIndex;
                        }
                    } else {
                        goOn = false;
                    }
                } else {
                    ctx.service.log.info('进异步下票-表头-结果异常', resDownTitle);
                    goOn = false;
                }
            } while (goOn);
        }
        // 切换税号解除锁定
        await ctx.service.redisLock.delete(ntLockLoginPreKey + cityPageId);

        let curStatus = status;
        const isInvoiceSuccess = resDownTitle.errcode === '0000' && resUploadTitle.errcode === '0000' && resYrzFull.errcode === '0000';
        const isFullInvoiceSuccess = resFull.errcode === '0000';


        if (status === 1) { // 表头已经下载，只需要下载全量发票明细
            curStatus = !isFullInvoiceSuccess ? status : 4;
        }

        if (status === 2 && dataType === 1) { // 发票明细已经下载，只需要下载表头数据（销项数据没有表头下载，如果为销项可以直接修改为状态4）
            curStatus = !isInvoiceSuccess ? status : 4;
        }

        if (status === 3 && dataType === 1) { // 表头明细都没有下载，都需要下载（销项数据没有表头下载）
            if (!isFullInvoiceSuccess) {
                curStatus = status;
            } else {
                curStatus = !isInvoiceSuccess ? 2 : 4;
            }
        }

        if (status === 3 && dataType !== 1) { // 表头明细都没有下载，但是不是进项没有表头
            curStatus = !isFullInvoiceSuccess ? status : 4;
        }
        const res2 = await ctx.service.invoiceSaveFiles.fullInvoiceStatusUpdate(batchNo, curStatus, taxNo);
        ctx.service.log.info('异步下票-更新状态', isInvoiceSuccess, isFullInvoiceSuccess);
        ctx.service.log.info('异步下票-完毕', curStatus, res2);
    }
}
/* eslint-disable no-undef, no-unused-vars, complexity*/

import { jxInvoicesByTitle } from '../libs/fullHgjkInvoiceExcel';
// import { join as pathJoin } from 'path';
import { hex_md5 } from '../libs/md5';
// import { getUrlYzm } from '$utils/tools';
const { join: pathJoin } = path;

export class EtaxQueryHgjkFullInvoices extends BaseService {

    createArgs(opt) {
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

        const bodyJson = {
            tfrqq: opt.startTime,
            tfrqz: opt.endTime
        };

        if (opt.customDeclarationNo) {
            bodyJson.hgjkshm = opt.customDeclarationNo;
        }

        return {
            ...errcodeInfo.success,
            data: bodyJson
        };
    }

    /* eslint-disable */
    async queryInvoices(access_token, tokenInfo, fopt = {}, needData, originFile) {
        const ctx = this.ctx;
        ctx.service.log.info('plugin service --------------', fopt);
        const { fpdk_type } = ctx.request.query;
        const taxNo = tokenInfo.taxNo;
        const opt = fopt.searchOpt || {};
        const { pageNo = '', pageSize = 500 } = opt;
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
        const fileDirPath = pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'fullInvoiceHgjk');
        const strBody = JSON.stringify(bodyJson);
        const md5Key = hex_md5(taxNo + strBody);
        const fileName = md5Key + '.xlsx';

        let filePath = pathJoin(fileDirPath, fileName);
        ctx.service.log.info('fileName:', fileName, 'filePath:', filePath);
        let res;
        // 计算有效时间、缓存
        let timeout = 0;
        let isExsit = fs.existsSync(filePath);
        if (isExsit) {
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

            ctx.service.log.info('海关缴款书-全量发票-id查询 参数', bodyJson);
            const urlPath = '/szzhzz/fpcx/v1/queryHgjksjcxxId';

            res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyJson);
            ctx.service.log.info('海关缴款书-全量发票-id查询 结果', res);
            if (res.errcode !== '0000') {
                return res;
            }
            const downloadId = res.data || '';
            if (!downloadId) {
                return errcodeInfo.govErr;
            }
            const exportUrl = '/szzhzz/fpcx/v1/queryHgjksjcxxDc?Id=' + downloadId + '&timeStampId=' + (+new Date());
            ctx.service.log.info('海关缴款书-全量发票查询导出excel exportUrl', exportUrl);
            res = await ctx.service.nt.ntDownload(tokenInfo.pageId, exportUrl, {
                saveDirPath: fileDirPath,
                passFetch: true,
                fileName
            });
            ctx.service.log.info('海关缴款书-全量发票查询导出excel 结果', res);
            if (res.errcode !== '0000') {
                return res;
            }
            filePath = res.data.filePath;
        }
        res = jxInvoicesByTitle(filePath, opt, ctx);
        ctx.service.log.info('------客户端解析结果--------', res);
        const pageRes = await ctx.service.ntTools.paginationProcessing(res.data, pageNo, pageSize);
        if (pageRes.errcode !== '0000') {
            return pageRes;
        }
        
        const resData = pageRes.data || [];
        if (fpdk_type === '3' && resData.length > 0 && !needData) {
            const saveRes = await this.saveEtax(resData, {
                taxNo,
                clientType,
                pageNo: pageNo,
                pageSize: pageSize,
                totalElement: resData.length
            });
            if (!saveRes || saveRes.errcode !== '0000') {
                return saveRes || errcodeInfo.fpyInnerErr;
            }
        }
        ctx.service.log.info('海关缴款书-全量发票查询导出 返回结果数量', 'totalElement: ', pageRes.totalElement, 'invoiceNum: ', pageRes.data.length);
        return {
            tongjiInfo: {
                invoiceNum: pageRes.data.length
            },
            ...pageRes
        };
    }

    async saveEtax(resData, opt = {}) {
        const ctx = this.ctx;
        let saveRes = errcodeInfo.success;
        saveRes = await ctx.service.invoiceSave.saveEtaxInputFullInvoices(resData, opt);
        if (!saveRes || saveRes.errcode !== '0000') {
            return saveRes || errcodeInfo.fpyInnerErr;
        }
        return {
            ...errcodeInfo.success
        };
    }
}
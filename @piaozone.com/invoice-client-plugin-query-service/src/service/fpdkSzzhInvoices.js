/* eslint-disable spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda,max-len,object-curly-spacing,key-spacing,comma-spacing,quotes,no-undef */
// 抵扣平台查询数字账户
// import errcodeInfo from '$client/errcodeInfo';
// import { BaseService } from './baseService';
import handleResult from '../libs/handleResult';
// import moment from 'moment';
import { transformFpyTypeToGov } from '../libs/downloadApplyTool';
import { mkdirsSync, paramJson, getAllFiles, randomSleep } from '../libs/tools';
// import hex_md5 from '$utils/md5';
// import fs from 'fs';
// import path from 'path';
import { downloadFile } from '../govLibs-zf/downloadFile';
// import compressing from 'compressing';
import { analysisExcel } from '../libs/analysisGovExcel/index';
import rmDir from '../libs/rmdir';

export class QuerySzzhInvoices extends BaseService {
    checkArgs(opt) {
        const startDate = opt.startDate || opt.startTime;
        const endDate = opt.endDate || opt.endTime;
        const invoiceType = opt.invoiceType;
        let dataType = opt.dataType;
        let invoiceStatus = opt.invoiceStatus;
        if (typeof invoiceStatus === 'undefined') {
            invoiceStatus = -1;
        }
        if (!startDate || !endDate || !invoiceType || !dataType) {
            return {
                ...errcodeInfo.argsErr,
                description: '参数错误，起止开票日期、发票类型，数据类型都不能为空'
            };
        }

        dataType = parseInt(dataType);
        if (dataType !== 1 && dataType !== 2) {
            return {
                ...errcodeInfo.argsErr,
                description: '数据类型参数错误'
            };
        }
        const govType = transformFpyTypeToGov(invoiceType);
        if (govType === -1) {
            return {
                ...errcodeInfo.argsErr,
                description: '发票类型错误，请检查！'
            };
        }

        if (startDate.length !== 10 || endDate.length !== 10) {
            return {
                ...errcodeInfo.argsErr,
                description: '起止开票日期格式不正确，请检查格式是否为YYYY-MM-DD'
            };
        }
        if (startDate.substr(0, 7) !== endDate.substr(0, 7)) {
            return {
                ...errcodeInfo.argsErr,
                description: '起止开票日期必须在同一个月'
            };
        }

        const startDateInt = parseInt(startDate.replace(/-/g, ''));
        const endDateInt = parseInt(endDate.replace(/-/g, ''));
        const curDateInt = parseInt(moment().format('YYYYMMDD'));
        if (startDateInt > endDateInt) {
            return {
                ...errcodeInfo.argsErr,
                description: '开始日期需要小于等于结束日期'
            };
        }

        if (endDate > curDateInt) {
            return {
                ...errcodeInfo.argsErr,
                description: '最大日期不能超过今天'
            };
        }

        return {
            ...errcodeInfo.success,
            data: {
                clientType: opt.clientType || 4,
                startDate,
                endDate,
                invoiceType: parseInt(invoiceType),
                govType,
                dataType,
                invoiceStatus
            }
        };
    }

    async queryTotalInfo(userInfo = {}, opt = {}) {
        const ctx = this.ctx;
        const taxNo = userInfo.taxNo;
        const {
            startDate,
            endDate,
            govType,
            dataType,
            invoiceStatus
        } = opt;
        let fply = -1;
        if (govType == '030' || govType == '31' || govType == '32') {
            fply = 1;
        }

        const searchParam = {
            id: 'count',
            fpdm: '',
            fphm: '',
            rq_q: startDate,
            rq_z: endDate,
            fplxs: govType,
            cert: taxNo,
            fply, //: -1,
            zzhlx: dataType === 1 ? 0 : 1, // 进销项数据类型
            nsrsbhs: '',
            fpzt: invoiceStatus,
            IPXZ: true
        };
        const res = await ctx.service.fpdkRequest.curl(taxNo, '/szzhfpcx.do', {
            method: 'POST',
            data: searchParam
        });
        ctx.service.log.info('查询数字账号 查询参数', searchParam);
        ctx.service.log.info('查询数字账号当前发票总数3', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const { key1, key3 } = res.data || {};
        if (key1 !== '200') {
            return handleResult(res.data);
        }
        return {
            ...errcodeInfo.success,
            data: {
                totalNum: key3
            }
        };
    }

    analysisData(userInfo = {}, opt = {}, filePath) {
        return new Promise((resolve) => {
            const ctx = this.ctx;
            const targetFilePath = path.join(path.dirname(filePath), path.basename(filePath).replace(/\.zip$/, ''));
            try {
                compressing.zip.uncompress(filePath, targetFilePath)
                    .then(async() => {
                        const fileRes = await getAllFiles(targetFilePath);
                        if (fileRes.errcode !== '0000') {
                            rmDir(targetFilePath, 0, true);
                            resolve(fileRes);
                            return;
                        }
                        const fileDatas = fileRes.data || [];
                        let result = [];
                        for (let i = 0; i < fileDatas.length; i++) {
                            const res = analysisExcel(fileDatas[i], opt);
                            if (res.errcode !== '0000') {
                                rmDir(targetFilePath, 0, true);
                                resolve(res);
                                return;
                            }
                            result = result.concat(res.data);
                        }
                        rmDir(targetFilePath, 0, true);
                        resolve({
                            ...errcodeInfo.success,
                            data: result
                        });
                    })
                    .catch((err) => {
                        // 文件处理异常 删除异常文件
                        fs.unlinkSync(filePath);
                        ctx.service.log.info('文件处理异常', err);
                        resolve({
                            ...errcodeInfo.fpyInnerErr,
                            description: '下载超时，请重试' // '文件处理异常'
                        });
                    });
            } catch (error) {
                // 数字账户文件解压失败 删除失败文件
                fs.unlinkSync(filePath);
                ctx.service.log.info('数字账户文件解压失败', error);
                resolve(errcodeInfo.fpyInnerErr);
            }
        });
    }

    getExportParam(taxNo, opt = {}) {
        const searchStr = paramJson({
            cert: taxNo,
            id: 'export',
            fpdm: '',
            fphm: '',
            rq_q: opt.startDate,
            rq_z: opt.endDate,
            fplxs: opt.govType,
            fply: -1,
            zzhlx: opt.dataType === 1 ? 0 : 1,
            fpzt: opt.invoiceStatus,
            nsrsbhs: ''
        }, true);
        return searchStr;
    }

    // 导出数电平台excel数据
    async exportInvoices(userInfo = {}, searchStr, filePath, retry = 0) {
        const ctx = this.ctx;
        const taxNo = userInfo.taxNo;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        if (!ntInfo || !ntInfo[taxNo]) {
            return errcodeInfo.govLogout;
        }
        const nt = ntInfo[taxNo];

        await randomSleep(3000, 5000);
        ctx.service.log.info('exportInvoices 参数', {
            searchStr,
            url: '/szzhfpcx.do',
            IPXZ: true
        });
        const res = await nt.evaluate(downloadFile, {
            searchStr,
            url: '/szzhfpcx.do',
            IPXZ: true
        });
        if (res.errcode !== '0000') {
            if (res.errcode === '91300') {
                await ctx.service.ntTools.closePage(taxNo);
                return res;
            }
            if (retry > 3) {
                return res;
            }
            return await this.exportInvoices(userInfo, searchStr, filePath, retry + 1);
        }
        const bf = Buffer.from(res.data, 'base64');
        fs.writeFileSync(filePath, bf);
        return {
            ...errcodeInfo.success,
            data: filePath
        };
    }

    // async queryInvoices(fopt = {}) {
    //     const ctx = this.ctx;
    //     ctx.service.log.info('税盘全量 插件 plugin ------ 请求参数：', fopt);
    //     const opt = typeof fopt.searchOpt === 'object' ? fopt.searchOpt : fopt;
    //     const checkRes = this.checkArgs(opt);
    //     if (checkRes.errcode !== '0000') {
    //         return checkRes;
    //     }

    //     const loginRes = await ctx.service.ntTools.checkIsLogined({
    //         disabledCheckNt: true,
    //         disabledAutoLogin: true
    //     });
    //     if (loginRes.errcode !== '0000') {
    //         return loginRes;
    //     }
    //     const userInfo = loginRes.data || {};
    //     const { taxNo } = userInfo;
    //     const dirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo);
    //     const newOpt = checkRes.data || {};
    //     const searchStr = this.getExportParam(taxNo, newOpt);
    //     const fileName = hex_md5(searchStr) + '.zip';
    //     const filePath = path.join(dirPath, fileName);
    //     ctx.service.log.info('数字账户数据文件路径', filePath);

    //     // 检查缓存是否存在，不存在则查询税局
    //     if (!ctx.service.tools.checkFileIsExsit(filePath)) {
    //         // 检查税局登录的浏览器是否正常打开
    //         const ntRes = await ctx.service.ntTools.checkIsExsit({ taxNo });
    //         ctx.service.log.info('检查是否已经登录', ntRes);
    //         if (ntRes.errcode !== '0000') {
    //             return ntRes;
    //         }
    //         if (!ntRes.data) {
    //             return errcodeInfo.govLogout;
    //         }
    //         mkdirsSync(dirPath);
    //         const totalRes = await this.queryTotalInfo(userInfo, newOpt);
    //         if (totalRes.errcode !== '0000') {
    //             return totalRes;
    //         }
    //         const { totalNum } = totalRes.data;
    //         if (totalNum === 0) {
    //             return {
    //                 ...errcodeInfo.success,
    //                 data: [],
    //                 tongjiInfo: {
    //                     totalAmount: '0',
    //                     totalTaxAmount: '0',
    //                     invoiceAmount: '0',
    //                     invoiceNum: 0
    //                 }
    //             };
    //         }

    //         if (totalNum > 2000) {
    //             return {
    //                 ...errcodeInfo.argsErr,
    //                 description: '当前发票数据过多，请缩短开票日期范围后再试!'
    //             };
    //         }

    //         const res = await this.exportInvoices(userInfo, searchStr, filePath);
    //         ctx.service.log.info('下载数字账号 参数', searchStr);
    //         ctx.service.log.info('下载数字账号当前发票 结果', res);
    //         if (res.errcode !== '0000') {
    //             return res;
    //         }
    //     }
    //     const res = await this.analysisData(userInfo, newOpt, filePath);
    //     if (res.errcode !== '0000') {
    //         return res;
    //     }

    //     const resFullData = res.data || [];

    //     // 分页处理
    //     const { pageNo = '', pageSize = 500 } = newOpt;
    //     const resPagination = await ctx.service.ntTools.paginationProcessing(resFullData, pageNo, pageSize);
    //     if (resPagination.errcode !== '0000') {
    //         return res;
    //     }
    //     const resData = resPagination.data || [];

    //     let saveRes;
    //     const clientType = newOpt.clientType;

    //     if (newOpt.dataType === 1) {
    //         saveRes = await ctx.service.invoiceSave.saveInputFullInvoices(resData, {
    //             clientType,
    //             taxNo
    //         });
    //     } else {
    //         saveRes = await ctx.service.invoiceSave.saveOutputFullInvoices(resData, {
    //             clientType,
    //             taxNo
    //         });
    //     }

    //     // 入库异常，或者10分钟内相同数据不支持重复采集
    //     if (saveRes.errcode !== '0000' && saveRes.errcode !== '0632') {
    //         return saveRes;
    //     }

    //     return resPagination;
    // }
    async queryInvoices(fopt = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('税盘全量 插件 plugin1 ------ 请求参数1：', fopt);
        const opt = typeof fopt.searchOpt === 'object' ? fopt.searchOpt : fopt;
        const checkRes = this.checkArgs(opt);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const loginRes = await ctx.service.ntTools.checkIsLogined({
            disabledCheckNt: true,
            disabledAutoLogin: true
        });
        if (loginRes.errcode !== '0000') {
            return loginRes;
        }
        const userInfo = loginRes.data || {};
        const { taxNo } = userInfo;
        const dirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo);
        const newOpt = checkRes.data || {};
        const searchStr = this.getExportParam(taxNo, newOpt);
        const fileName = hex_md5(searchStr) + '.zip';
        const filePath = path.join(dirPath, fileName);
        ctx.service.log.info('数字账户数据文件路径', filePath);

        const res = await this.getFile(taxNo, userInfo, newOpt, dirPath, searchStr, filePath);
        if (res.errcode !== '0000') {
            return res;
        }
        if (newOpt.invoiceType === 4 || newOpt.invoiceType === 3) { // 增值税专用发票，要把  纸质发票（增值税专用发票），也请求回来
            const govType = newOpt.invoiceType === 4 ? '008' : '010';
            const newOptDzp = { ...newOpt, govType };
            const searchStrDzp = this.getExportParam(taxNo, newOptDzp);
            const fileNameDzp = hex_md5(searchStrDzp) + '.zip';
            const filePathDzp = path.join(dirPath, fileNameDzp);
            ctx.service.log.info('下载 纸质发票（增值税专用发票）开始------');
            ctx.service.log.info('下载数字账号 参数', searchStrDzp);
            const resDzp = await this.getFile(taxNo, userInfo, newOptDzp, dirPath, searchStrDzp, filePathDzp);
            if (resDzp.errcode !== '0000') {
                return resDzp;
            }
            const resFullDataDzp = resDzp.data || [];
            res.data = [...res.data, ...resFullDataDzp];
        }
        const resFullData = res.data || [];
        ctx.service.log.fullInfo('下载发票 全数据', resFullData);
        // 分页处理
        return await this.saveResPagination(newOpt, resFullData, taxNo, opt);
    }

    async getFile(taxNo, userInfo, newOpt, dirPath, searchStr, filePath) {
        const ctx = this.ctx;
        // 检查缓存是否存在，不存在则查询税局
        if (!ctx.service.tools.checkFileIsExsit(filePath)) {
            const ntRes = await ctx.service.ntTools.checkIsExsit({ taxNo });
            ctx.service.log.info('检查是否已经登录', ntRes);
            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            if (!ntRes.data) {
                return errcodeInfo.govLogout;
            }
            mkdirsSync(dirPath);
            const totalRes = await this.queryTotalInfo(userInfo, newOpt);
            if (totalRes.errcode !== '0000') {
                return totalRes;
            }
            const { totalNum } = totalRes.data;
            if (totalNum === 0) {
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

            if (totalNum > 2000) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '当前发票数据过多，请缩短开票日期范围后再试!'
                };
            }

            const res = await this.exportInvoices(userInfo, searchStr, filePath);
            ctx.service.log.info('下载数字账号 参数', searchStr);
            ctx.service.log.info('下载数字账号当前发票 结果', res);
            if (res.errcode !== '0000') {
                return res;
            }
        }
        const res = await this.analysisData(userInfo, newOpt, filePath);
        if (res.errcode !== '0000') {
            return res;
        }
        return res;
    }

    async saveResPagination(newOpt, resFullData, taxNo, opt) {
        const ctx = this.ctx;
        // 分页处理
        const { pageNo = '', pageSize = 500 } = opt;
        const resPagination = await ctx.service.ntTools.paginationProcessing(resFullData, pageNo, pageSize);
        if (resPagination.errcode !== '0000') {
            return resPagination;
        }
        const resData = resPagination.data || [];

        let saveRes;
        const clientType = newOpt.clientType;

        if (newOpt.dataType === 1) {
            saveRes = await ctx.service.invoiceSave.saveInputFullInvoices(resData, {
                clientType,
                taxNo
            });
        } else {
            saveRes = await ctx.service.invoiceSave.saveOutputFullInvoices(resData, {
                clientType,
                taxNo
            });
        }

        // 入库异常，或者10分钟内相同数据不支持重复采集
        if (saveRes.errcode !== '0000' && saveRes.errcode !== '0632') {
            return saveRes;
        }

        return resPagination;
    }
}
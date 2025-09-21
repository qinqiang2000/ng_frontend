/* eslint-disable no-undef */
// import { BaseService } from './baseService';
// import errcodeInfo from '$client/errcodeInfo';
// import moment from 'moment';
import { transformFpyType } from '../libs/etaxInvoiceType';
import { createDkgxExcelData, getDkgxFailResult } from '../libs/dkgxExcel';
// import { join as pathJoin } from 'path';
import { getUid, getMinMaxDate, findGxResult } from '../libs/tools';
import { changeEtaxDkgxParam } from '../libs/govParamsChange';
// import { getUrlYzm } from '$utils/tools';

const { join: pathJoin } = path;

export class EtaxDkgxInvoices extends BaseService {
    // // 获取所有未认证的发票
    async queryAllUnRzInvoices(userInfo, opt) {
        const ctx = this.ctx;
        let fpcyRes = { ...errcodeInfo.govErr };
        let invoices = [];
        let goOn = false;
        let dataIndex = opt.dataIndex;
        do {
            const optParam = { ...opt, dataIndex, dataFrom: 'dkgxquery' };
            fpcyRes = await ctx.service.etaxQueryInvoices.dkgxQueryInvoices(userInfo, optParam);
            if (fpcyRes.errcode !== '0000') {
                ctx.service.log.info('获取抵扣勾选比对数据异常, 参数：', optParam);
                ctx.service.log.info('获取抵扣勾选比对数据异常, 返回：', fpcyRes);
                break;
            } else {
                dataIndex = fpcyRes.nextDataIndex;
                goOn = dataIndex < fpcyRes.totalNum;
                invoices = invoices.concat(fpcyRes.data);
                ctx.service.log.info('queryAllUnRzInvoices dataIndex', dataIndex, fpcyRes.totalNum);
            }
        } while (goOn);

        return { ...fpcyRes, data: invoices };
    }

    // 根据勾选的发票列表，计算出搜索条件
    getSearchOpt(list, authenticateFlag) {
        const defaultOpt = {
            invoiceType: -1,
            invoiceStatus: 0,
            authenticateFlags: '',
            salerTaxNo: '',
            rzzt: parseInt(authenticateFlag) === 1 ? 0 : 1,
            startTime: list[0].invoiceDate,
            endTime: list[0].invoiceDate
        };
        if (list.length === 1) {
            const item = list[0];
            return {
                searchOpt: {
                    ...defaultOpt,
                    invoiceCode: item.invoiceCode,
                    invoiceNo: item.invoiceNo
                }
            };
        }
        let startTime = list[0].invoiceDate;
        let endTime = list[0].invoiceDate;
        let startTimeInt = parseInt(startTime.replace(/-/g, ''));
        let endTimeInt = parseInt(endTime.replace(/-/g, ''));
        for (let i = 1; i < list.length; i++) {
            const curData = list[i];
            const invoiceDateInt = parseInt(curData.invoiceDate.replace(/-/g, ''));
            if (startTimeInt > invoiceDateInt) {
                startTime = curData.invoiceDate;
                startTimeInt = invoiceDateInt;
            }
            if (endTimeInt < invoiceDateInt) {
                endTime = curData.invoiceDate;
                endTimeInt = invoiceDateInt;
            }
        }

        return {
            searchOpt: {
                ...defaultOpt,
                startTime,
                endTime
            }
        };
    }

    // 将需要勾选的list转换为dict，方便后面筛选
    getGxListDict(gxList = []) {
        const gxListDict = {};
        for (let i = 0; i < gxList.length; i++) {
            const curData = gxList[i];
            const dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            gxListDict[dataKey] = {
                etaxInvoiceNo: curData.etaxInvoiceNo || '',
                invoiceCode: curData.invoiceCode,
                invoiceNo: curData.invoiceNo,
                effectiveTaxAmount: curData.effectiveTaxAmount,
                invoiceDate: curData.invoiceDate
            };
        }
        return gxListDict;
    }

    // 根据目前的发票数据过滤出来会勾选失败的发票
    getPreGxInvoicesDict(resultList, gxListDict, tokenInfo) {
        // const ctx = this.ctx;
        const resultDict = {};
        const gxrqfw = tokenInfo.gxrqfw;
        const maxDate = gxrqfw.split('-')[1];
        const maxDateInt = parseInt(maxDate.replace(/-/g, ''));

        for (let i = 0; i < resultList.length; i++) {
            const curData = resultList[i];
            const dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            const gxDictData = gxListDict[dataKey];
            // 只查找需要勾选的
            if (!gxDictData) {
                continue;
            }

            const govType = curData.govInvoiceType ? curData.govInvoiceType : transformFpyType(curData.invoiceType);
            const invoiceStatus = parseInt(curData.invoiceStatus);
            const invoiceDateInt = parseInt(curData.invoiceDate.replace(/-/g, ''));
            let fpyInvoiceDate = curData.invoiceDate || '';
            if (fpyInvoiceDate.length > 10 && gxDictData.invoiceDate && gxDictData.invoiceDate.length < 11) {
                fpyInvoiceDate = fpyInvoiceDate.substr(0, 10); // 开票日期
            }
            if (govType === -1) {
                resultDict[dataKey] = '31_暂时不支持的发票类型';
            } else if (invoiceStatus === 2) {
                resultDict[dataKey] = '11_发票已作废';
            } else if (invoiceStatus === 8) {
                resultDict[dataKey] = '12_发票已全额红冲';
            } else if (invoiceStatus === 1) {
                resultDict[dataKey] = '15_发票已失控';
            } else if (invoiceStatus === 4) {
                resultDict[dataKey] = '3_发票异常';
            } else if (curData.invoiceAmount < 0) {
                resultDict[dataKey] = '16_红字发票不能抵扣勾选操作';
            } else if (fpyInvoiceDate !== gxDictData.invoiceDate) {
                resultDict[dataKey] = '31_开票日期错误';
            } else if (maxDateInt < invoiceDateInt) {
                resultDict[dataKey] = '10_开票日期超过可操作发票范围';
            } else {
                resultDict[dataKey] = {
                    etaxInvoiceNo: curData.etaxInvoiceNo,
                    invoiceType: curData.invoiceType,
                    govType: govType,
                    invoiceCode: curData.invoiceCode,
                    invoiceNo: curData.invoiceNo,
                    invoiceAmount: curData.invoiceAmount,
                    totalTaxAmount: curData.totalTaxAmount,
                    invoiceDate: curData.invoiceDate,
                    effectiveTaxAmount: gxDictData.effectiveTaxAmount
                };
            }
        }
        return resultDict;
    }

    // 税局和发票云公用的过滤部分，查找出补齐参数的list, 未查询到list，勾选会失败的list
    commonfilter(resData = [], list = [], flag = 'fpy', tokenInfo) {
        const ctx = this.ctx;
        const gxListDict = this.getGxListDict(list);
        const filterDict = this.getPreGxInvoicesDict(resData, gxListDict, tokenInfo);
        const findList = [];
        const notFindList = [];
        const findFailList = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const dKey = ['k', item.invoiceCode, item.invoiceNo].join('_');
            const commonData = {
                invoiceType: item.invoiceType,
                invoiceAmount: item.invoiceAmount,
                totalTaxAmount: item.totalTaxAmount,
                invoiceCode: item.invoiceCode,
                invoiceNo: item.invoiceNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount
            };
            const curFilterData = filterDict[dKey];
            if (!curFilterData) {
                if (flag === 'fpy') {
                    notFindList.push(commonData);
                } else {
                    let tempGovType;
                    if (item.govInvoiceType) {
                        tempGovType = item.govInvoiceType;
                    } else {
                        tempGovType = transformFpyType(item.invoiceType, item.etaxInvoiceNo);
                    }
                    ctx.service.log.info('税局发票类型', tempGovType, item);
                    if (tempGovType === -1 || !item.invoiceAmount || !item.totalTaxAmount) {
                        findFailList.push({
                            ...commonData,
                            selectResult: 2,
                            description: '未查询到该发票'
                        });
                    } else {
                        findList.push({
                            ...commonData,
                            govType: tempGovType,
                            invoiceType: item.invoiceType,
                            invoiceAmount: item.invoiceAmount,
                            totalTaxAmount: item.totalTaxAmount,
                            etaxInvoiceNo: item.etaxInvoiceNo || ''
                        });
                    }
                }
            } else if (typeof curFilterData === 'string') {
                const result = curFilterData.split('_');
                findFailList.push({
                    ...commonData,
                    selectResult: result[0],
                    description: result[1]
                });
            } else if (typeof curFilterData === 'object') {
                findList.push({
                    ...commonData,
                    govType: curFilterData.govType,
                    invoiceType: curFilterData.invoiceType,
                    invoiceAmount: curFilterData.invoiceAmount,
                    totalTaxAmount: curFilterData.totalTaxAmount,
                    etaxInvoiceNo: curFilterData.etaxInvoiceNo
                });
            }
        }
        return {
            findList,
            notFindList,
            findFailList
        };
    }

    // 通过发票云尽可能补充参数，和查询出勾选会失败的发票
    async filterByFpyQuery(access_token, list, tokenInfo, clientType) {
        const ctx = this.ctx;
        const res = await ctx.service.fpyQueryInvoices.queryByCodeNos(access_token, list, tokenInfo, clientType);
        ctx.service.log.info('通过发票云尽可能补充参数', res);
        if (res.errcode !== '0000') {
            return {
                ...errcodeInfo.success,
                data: {
                    findList: [],
                    findFailList: [],
                    notFindList: list
                }
            };
        }
        const resData = res.data || {};
        const filterInfo = this.commonfilter(resData, list, 'fpy', tokenInfo);
        return {
            ...errcodeInfo.success,
            data: {
                findList: filterInfo.findList,
                findFailList: filterInfo.findFailList,
                notFindList: filterInfo.notFindList
            }
        };
    }

    // 通过税局补齐参数
    async filterByGovQuery(tokenInfo, list, dkFlag = 'dkgx', authenticateFlag) {
        const ctx = this.ctx;
        const fopt = this.getSearchOpt(list, authenticateFlag);
        ctx.service.log.info('发票抵扣勾选通过税局补齐查询参数', dkFlag, fopt);
        let res;
        if (list.length > 1) {
            res = await ctx.service.etaxExportInvoice.dkgxExport(tokenInfo, fopt, true);
        } else {
            res = await ctx.service.etaxQueryInvoices.dkgxQueryInvoices(tokenInfo, fopt);
        }
        ctx.service.log.info('发票抵扣勾选通过税局补齐查询结果', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || [];
        const filterInfo = this.commonfilter(resData, list, dkFlag, tokenInfo);
        return {
            ...errcodeInfo.success,
            data: {
                findList: filterInfo.findList,
                findFailList: filterInfo.findFailList,
                notFindList: filterInfo.notFindList
            }
        };
    }


    // 统一返回勾选结果
    async getGxResult(taxPeriod, successList = [], failList = [], authenticateFlag, errRes = {}) {
        const fail = failList.map((item) => {
            return {
                taxPeriod: taxPeriod,
                invoiceCode: item.invoiceCode,
                invoiceNo: item.invoiceNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount,
                selectResult: item.selectResult || '8-[001]',
                description: item.description || '勾选异常'
            };
        });
        const success = successList.map((item) => {
            return {
                invoiceCode: item.invoiceCode,
                invoiceNo: item.invoiceNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount,
                taxPeriod: taxPeriod,
                selectDate: moment().format('YYYY-MM-DD'),
                selectResult: '1',
                description: 'success'
            };
        });
        if (success.length === 0) {
            return {
                errcode: errRes.errcode || '93000',
                description: errRes.description || '勾选出错，请检查',
                taxPeriod,
                data: {
                    taxPeriod,
                    success,
                    fail
                }
            };
        }

        let description = errRes.description;
        if (failList.length === 0) {
            description = authenticateFlag === 0 ? '取消抵扣勾选提交成功' : '抵扣勾选提交成功';
        } else {
            description = authenticateFlag === 0 ? '部分取消抵扣勾选提交成功' : '部分抵扣勾选提交成功';
        }

        if (failList.length === 0) {
            return {
                errcode: '0000',
                taxPeriod,
                description,
                data: {
                    taxPeriod,
                    success,
                    fail
                }
            };
        }

        return {
            errcode: '90001',
            description,
            taxPeriod,
            data: {
                taxPeriod,
                success,
                fail
            }
        };
    }

    // 文件批量勾选，可以获取失败原因
    async getDkgxResultReason(tokenInfo, lsh = '') {
        const ctx = this.ctx;
        if (!lsh) {
            return errcodeInfo.argsErr;
        }
        const taxNo = tokenInfo.taxNo;
        const url = '/ypfw/dkgx/v1/exportGxrz?Lsh=' + encodeURIComponent(lsh);
        const res1 = await ctx.service.nt.ntDownload(tokenInfo.pageId, url, {
            saveDirPath: pathJoin(ctx.app.config.govDownloadZipDir, taxNo, 'dkgxInvoices'),
            fileName: 'dkgxInvoices-result-' + getUid() + '.xlsx',
            passFetch: true
        });
        ctx.service.log.info('查询批量抵扣勾选地址及返回', url, res1);
        if (res1.errcode !== '0000') {
            return res1;
        }
        const filePath = res1.data.filePath;
        const res = getDkgxFailResult(filePath);
        ctx.service.log.info('查询批量抵扣勾选失败记录返回', res);
        return res;
    }

    async dkgxByImportFile(opt = {}) {
        const ctx = this.ctx;
        const {
            tokenInfo,
            authenticateFlag
        } = opt;
        let failList = [];
        let success = [];
        const realGxList = opt.realGxList;
        const taxNo = tokenInfo.taxNo;
        const resInfo = createDkgxExcelData(realGxList, authenticateFlag, taxNo);
        ctx.service.log.fullInfo('批量抵扣勾选，参数1', resInfo);
        const res2 = await ctx.service.nt.ntImportExcel(tokenInfo.pageId, '/ypfw/dkgx/v1/importFpxx', {
            list: resInfo.list,
            cols: resInfo.cols,
            fileName: taxNo + '.xlsx'
        });

        // 提交批量勾选失败
        if (res2.errcode !== '0000') {
            ctx.service.log.info('批量抵扣勾选异常，关键参数', resInfo);
            return res2;
        }

        const resData = res2.data || {};
        const { Lsh, FailCount } = resData;
        ctx.service.log.info('批量抵扣勾选返回', res2);
        // 全部勾选成功
        if (FailCount === 0) {
            success = realGxList;
            if (parseInt(authenticateFlag) !== 0) {
                return {
                    ...errcodeInfo.success,
                    data: {
                        success,
                        fail: []
                    }
                };
            }
        }
        if (FailCount !== 0) {
            const resonRes = await this.getDkgxResultReason(tokenInfo, Lsh);
            // 查询勾选结果失败
            if (resonRes.errcode !== '0000') {
                return resonRes;
            }
            const { failInfo } = resonRes.data || {};
            for (let i = 0; i < realGxList.length; i++) {
                const curData = realGxList[i];
                const k1 = 'k' + curData.invoiceCode + '' + curData.invoiceNo;
                const k2 = 'k' + curData.etaxInvoiceNo;
                // 失败的
                if (failInfo[k1]) {
                    failList.push({
                        ...curData,
                        ...failInfo[k1]
                    });
                // 失败记录里面可能存在重复勾选和撤销勾选的，认为是处理成功
                } else if (curData.etaxInvoiceNo && failInfo[k2]) { // 数电纸质发票勾选异常
                    failList.push({
                        ...curData,
                        ...failInfo[k2]
                    });
                } else {
                    success.push(curData);
                }
            }
        }
        ctx.service.log.fullInfo('是否是撤销勾选', authenticateFlag);
        // 撤销勾选，检查一遍已撤销勾选的发票，是否存能查到，如果查不到，那么该发票可能是已认证发票，无法撤销勾选
        if (parseInt(authenticateFlag) === 0) {
            const checkRes = await this.gxInvoiceResultCheck(success, tokenInfo, authenticateFlag);
            ctx.service.log.fullInfo('撤销勾选结果检查 res', checkRes);
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            const { success: cSuccess, fail } = checkRes.data;
            success = cSuccess;
            failList = [...failList, ...fail];
        }
        // 勾选，如果已经勾，返回勾选成功，这里税局会提示：发票已勾选,不可重复勾选
        // 勾选，如果已经认证，返回发票不存在，这里税局可能会提示：发票已勾选,不可重复勾选，也可能提示：发票不存在
        if (parseInt(authenticateFlag) === 1 && failList.length > 0) {
            const needCheckList = [];
            const noNeedCheckList = [];
            for (let i = 0; i < failList.length; i++) {
                const curInvoice = failList[i];
                if (curInvoice.description.indexOf('发票已勾选') > -1) {
                    needCheckList.push(curInvoice);
                } else {
                    noNeedCheckList.push(curInvoice);
                }
            }
            if (needCheckList.length > 0) {
                const checkRes = await this.gxInvoiceResultCheck(needCheckList, tokenInfo, authenticateFlag);
                ctx.service.log.fullInfo('勾选结果检查 res', checkRes);
                if (checkRes.errcode !== '0000') {
                    return checkRes;
                }
                const { success: cSuccess, fail } = checkRes.data;
                success = [...success, ...cSuccess];
                failList = [...noNeedCheckList, ...fail];
            }
        }
        return {
            ...errcodeInfo.success,
            data: {
                success: success,
                fail: failList
            }
        };
    }

    // 通过税局json接口调用
    async gxByJsonData(opt = {}) {
        const ctx = this.ctx;
        const {
            tokenInfo,
            authenticateFlag
        } = opt;
        const realGxList = opt.realGxList;
        const taxNo = tokenInfo.taxNo;
        const newFphms = [];
        const newFpdms = [];

        const jsonData = {
            FpList: realGxList.map((item) => {
                let FplxDm = item.govType;
                let Qdfphm = item.invoiceCode + item.invoiceNo;
                if (item.etaxInvoiceNo) {
                    Qdfphm = item.etaxInvoiceNo;
                    if (FplxDm === '01') {
                        FplxDm = '85'; // 数电纸质发票（增值税专用发票）归类到增值税专用发票
                    } else if (FplxDm === '04') {
                        FplxDm = '86'; // 数电纸质发票（普通发票）归类到增值税普通发票
                    }
                }
                let Fpdm = item.invoiceCode;
                if (item.invoiceNo.length === 20) { // 数电票
                    Qdfphm = item.invoiceNo;
                    Fpdm = item.invoiceNo.substring(0, 12);
                }
                newFphms.push(item.invoiceNo);
                newFpdms.push(item.invoiceCode);
                return {
                    Qdfphm: Qdfphm, // item.invoiceCode + item.invoiceNo,
                    Znxzmbh: '',
                    Fpdm: Fpdm, // item.invoiceCode,
                    Fphm: item.invoiceNo,
                    Kprq: item.invoiceDate,
                    Gfsbh: taxNo,
                    Gxlx: authenticateFlag.toString(),
                    FplxDm,
                    Je: item.invoiceAmount,
                    Se: item.totalTaxAmount
                };
            }),
            'HgwsList': [],
            'WspzList': []
        };

        ctx.service.log.info('通过接口方式调用抵扣勾选参数', jsonData);
        const urlPath = '/ypfw/dkgx/v1/dkgxSubmit';
        // const res2 = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        const res2 = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);

        ctx.service.log.info('通过接口方式调用抵扣勾选返回', res2);

        // 勾选失败
        if (res2.errcode !== '0000') {
            return res2;
        }

        const resData = res2.data || {};
        if (resData.indexOf('提交成功') === -1) {
            return {
                ...errcodeInfo.govErr,
                description: typeof resData === 'string' ? resData : '勾选异常'
            };
        }
        const taxPeriod = decodeURIComponent(tokenInfo.skssq).split(';')[0] || '';
        if (realGxList.length > 0) {
            // 抵扣勾选，先判断是否有缓存成功的
            const invoiceSuccessArr = [];
            const newKprqs = realGxList.map((item) => {
                return item.invoiceDate;
            });
            const minMaxDate = getMinMaxDate(newKprqs, invoiceSuccessArr);
            const searchGxOpt = {
                searchOpt: {
                    rzzt: authenticateFlag,
                    endTime: minMaxDate.max,
                    startTime: minMaxDate.min,
                    endTimeGx: parseInt(authenticateFlag) === 1 ? moment().format('YYYY-MM-DD') : '',
                    startTimeGx: parseInt(authenticateFlag) === 1 ? moment().subtract(1, 'months').format('YYYY-MM-01') : '',
                    invoiceType: -1,
                    invoiceStatus: -1
                }
            };

            const fpcyRes = await this.queryAllUnRzInvoices(tokenInfo, {
                ...searchGxOpt,
                taxNo
            });
            // ctx.helper.loggerInfo('--fpcyRes--', fpcyRes);
            let resultTip = { ...errcodeInfo.govErr };
            if (fpcyRes.errcode === '0000') {
                const findResult = findGxResult(newFpdms, newFphms, newKprqs, fpcyRes.data, taxPeriod);
                ctx.service.log.info('发票抵扣勾选对比结果', findResult);
                const { fail = [] } = findResult.data;
                const { successInvoices } = findResult;
                const failAry = fail.map((item) => {
                    const { fpdm, fphm, kprq } = item;
                    return {
                        invoiceCode: fpdm,
                        invoiceNo: fphm,
                        invoiceDate: kprq,
                        effectiveTaxAmount: realGxList.find((itm) => itm.invoiceNo === fphm).effectiveTaxAmount,
                        taxPeriod
                    };
                });
                findResult.data.fail = failAry;
                findResult.data.success = successInvoices;

                // ctx.service.log.info('--findResult--', findResult);
                const errList = [];
                const sucessList = invoiceSuccessArr.concat(findResult.data.success || []);
                if (findResult.errcode === '0000') { // 完全成功
                    resultTip.data = {
                        taxPeriod,
                        success: sucessList,
                        fail: []
                    };
                    resultTip.description = parseInt(authenticateFlag) === 1 ? '发票抵扣勾选成功！' : '发票抵扣取消勾选成功';
                } else { // 部分成功
                    resultTip = { ...errcodeInfo.govGxSomeSuccess };
                    resultTip.data = {
                        taxPeriod,
                        success: sucessList,
                        fail: errList.concat(findResult.data.fail)
                    };
                }

                if (sucessList.length === 0) {
                    resultTip.errcode = errcodeInfo.gxtjSuccess.errcode;
                    if (parseInt(authenticateFlag) === 1) {
                        resultTip.description = '勾选异常，请确认在电子税局“税务数字账户-- 发票勾选确认-抵扣类勾选--未勾选”，能查询到该发票';
                    } else {
                        resultTip.description = '勾选异常，请确认在电子税局“税务数字账户-- 发票勾选确认-抵扣类勾选--已勾选”，能查询到该发票';
                    }
                } else {
                    resultTip.errcode = '0000';
                }
            } else {
                ctx.service.log.info('税局勾选成功，但比对结果获取发票列表时失败，勾选返回：', res2.data);
                ctx.service.log.info('获取比对结果异常，返回：', fpcyRes);
                // 勾选成功，但比对结果获取发票列表时失败
                resultTip.errcode = errcodeInfo.gxtjSuccess.errcode;
                if (parseInt(authenticateFlag) === 1) {
                    resultTip.description = '勾选异常，请确认在电子税局“税务数字账户-- 发票勾选确认-抵扣类勾选--未勾选”，能查询到该发票';
                } else {
                    resultTip.description = '勾选异常，请确认在电子税局“税务数字账户-- 发票勾选确认-抵扣类勾选--已勾选”，能查询到该发票';
                }
            }
            return resultTip;
        }

        return {
            ...errcodeInfo.success,
            data: {
                taxPeriod,
                success: realGxList,
                fail: []
            }
        };
    }

    /* eslint-disable */
    async dkgxInvoices(tokenInfo, requestData, access_token = '') {
        const ctx = this.ctx;
        ctx.service.log.info('plugin server ----------');
        const { fpdk_type, taxNo, tenantNo } = ctx.request.query;
        let list = requestData.invoices;
        let authenticateFlag =  parseInt(requestData.authenticateFlag);
        if (!requestData.invoices && requestData.fphm) {
            const listResult = changeEtaxDkgxParam(requestData);
            if (listResult.errcode !== '0000') {
                return {
                    ...errcodeInfo.argsErr
                };
            }
            list = listResult.data.invoices;
            authenticateFlag = parseInt(requestData.zt);
        }
        ctx.service.log.fullInfo('抵扣勾选列表', list);
        const taxPeriod = tokenInfo.taxPeriod;
        const clientType = requestData.clientType || 4;
        if (!tokenInfo.gxrqfw || !tokenInfo.skssq) {
            return errcodeInfo.govLogout;
        }
        let realGxList = [];
        let failList = [];
        const gxFullInfo = {
            tokenInfo,
            realGxList,
            failList,
            access_token,
            clientType,
            authenticateFlag
        };
        let fullRealGxList = [];
        let fullFailList = [];
        // const firstItem = list[0];
        // let isQuanDian = false;
        // if (firstItem.invoiceNo && firstItem.invoiceNo.length === 20) {
        //     isQuanDian = true;
        // }
        // let isShudianPaper = false;
        // if ((Number(firstItem.invoiceType) === 3 || Number(firstItem.invoiceType) === 4) && !firstItem.etaxInvoiceNo) { // 有可能是数电纸质票
        //     isShudianPaper = true;
        // }
        const checkFullRes = this.checkInvoiceIsFull(list);
        const { checkNotFullInvoice, checkFullInvoice } = checkFullRes;
        // 税局需要的勾选字段都齐全不需要补齐数据，直接调用税局勾选
        // if (((firstItem.invoiceCode && firstItem.invoiceNo) || isQuanDian) && firstItem.invoiceDate &&
        //     firstItem.invoiceAmount && firstItem.totalTaxAmount && firstItem.effectiveTaxAmount && firstItem.invoiceType && !isShudianPaper) {
        if (checkFullInvoice && checkFullInvoice.length > 0) {
            // 由于是相关的list进行过滤，所以notFindList为空
            const filterData = this.commonfilter(checkFullInvoice, checkFullInvoice, 'fpy', tokenInfo);
            ctx.service.log.info('发票信息完整 对参数进行过滤校验 结果', filterData);
            const { findList = [], findFailList = [] } = filterData;
            // if (findList.length === 0) {
            //     return this.getGxResult(taxPeriod, [], findFailList, authenticateFlag);
            // }
            fullRealGxList = findList;
            fullFailList = findFailList;
            // realGxList = findList;
            // failList = findFailList;
            // gxFullInfo.realGxList = findList;
            // gxFullInfo.failList = findFailList;
        }
        if (checkNotFullInvoice && checkNotFullInvoice.length > 0) { // 需要补全发票信息
            ctx.service.log.info('勾选补全发票信息--开始 ---------------');
            const filter1Res = await this.filterByFpyQuery(access_token, checkNotFullInvoice, tokenInfo, clientType);
            if (filter1Res.errcode !== '0000') {
                return this.getGxResult(taxPeriod, [], checkNotFullInvoice, authenticateFlag, filter1Res);
            }
            ctx.service.log.info('勾选补全发票信息--通过发票云尽可能补充参数 返回1', filter1Res);

            // const filter1Res = { data: { findList: [], notFindList: list, findFailList: [] }};
            const { findList = [], notFindList = [], findFailList = [] } = filter1Res.data;
            realGxList = findList;
            failList = findFailList;
            // 通过发票云处理就提前判断全部勾选失败
            if (findList.length === 0 && notFindList.length === 0) {
                return this.getGxResult(taxPeriod, [], findFailList, authenticateFlag);
            }

            const shudianPaperNofind = [];
            findList.forEach(item => {
                const { invoiceType, etaxInvoiceNo } = item;
                const invoiceTypeInt = parseInt(invoiceType);
                if ((invoiceTypeInt === 3 || invoiceTypeInt === 4 || invoiceTypeInt === 12 || invoiceTypeInt === 13) && !etaxInvoiceNo) { // 有可能是数电纸质票
                    shudianPaperNofind.push(item);
                }
            })
            ctx.service.log.info('勾选补全发票信息--可能是数电纸票且 没有数电号码的发票数量', shudianPaperNofind.length);
            if (shudianPaperNofind.length > 0) { // 尝试从税局补充 etaxInvoiceNo
                const filter2Res = await this.filterByGovQuery(tokenInfo, shudianPaperNofind, 'dkgx', authenticateFlag);
                ctx.service.log.info('勾选补全发票信息--数电纸票-通过税局补充参数返回 可能是数电纸质票 结果', filter2Res);
                if (filter2Res.errcode !== '0000') {
                    return this.getGxResult(taxPeriod, [], checkNotFullInvoice, authenticateFlag, filter2Res);
                }
                const govResData = filter2Res.data;
                const govFindList = govResData.findList || [];
                const isShudianPaperRes = govFindList.filter(item => item.etaxInvoiceNo);
                for(let i = 0; i < isShudianPaperRes.length; i ++) {
                    const { invoiceCode, invoiceNo, etaxInvoiceNo } = isShudianPaperRes[i];
                    const curIndex = realGxList.findIndex(item => {
                        return  `${invoiceCode}_${invoiceNo}` === `${item.invoiceCode}_${item.invoiceNo}`
                    });
                    if (curIndex !== -1) {
                        realGxList[curIndex].etaxInvoiceNo = etaxInvoiceNo;
                    }
                }
            }
            ctx.service.log.info('勾选补全发票信息--通过发票云 未补齐的发票 notFindList ', notFindList);
            if (notFindList.length > 0) {
                const filter2Res = await this.filterByGovQuery(tokenInfo, notFindList, 'dkgx', authenticateFlag);
                if (filter2Res.errcode !== '0000') {
                    return this.getGxResult(taxPeriod, [], checkNotFullInvoice, authenticateFlag, filter2Res);
                }
                ctx.service.log.info('勾选补全发票信息--通过税局补充参数 返回', filter2Res);
                const govResData = filter2Res.data;
                const govFindList = govResData.findList || [];
                const govFailList = govResData.findFailList || [];
                realGxList = realGxList.concat(govFindList);
                failList = failList.concat(govFailList);
            }

            // if (realGxList.length === 0) {
            //     return this.getGxResult(taxPeriod, [], failList, authenticateFlag);
            // }

            // gxFullInfo.realGxList = realGxList;
            // gxFullInfo.failList = failList;
        }
        realGxList = realGxList.concat(fullRealGxList);
        failList = failList.concat(fullFailList);
        if (realGxList.length === 0) {
            ctx.service.log.info('勾选--发票信息查询补齐完毕 没有完整的发票信息可勾选');
            return this.getGxResult(taxPeriod, [], failList, authenticateFlag);
        }
        gxFullInfo.realGxList = realGxList;
        gxFullInfo.failList = failList;
        ctx.service.log.info('勾选--发票信息查询补齐完毕 开始勾选');
        let res;
        // json格式勾选获取不到勾选原因，可以只处理单张勾选
        // if (gxFullInfo.realGxList.length === 1 || tokenInfo.homeUrl.indexOf('shanghai') !== -1) {
        //     res = await this.gxByJsonData(gxFullInfo);
        // } else {
        //     res = await this.dkgxByImportFile(gxFullInfo);
        // }
        ctx.service.log.fullInfo('勾选发票列表', gxFullInfo.realGxList);
        /*
        if (taxNo === '9133021234054117XY' || taxNo === '914419007510962180' || tenantNo === '366471819466957824' || taxNo === '91110113MA00GKL02E') {
            res = await this.dkgxByImportFile(gxFullInfo);
        } else {
            res = await this.gxByJsonData(gxFullInfo);
        }
        */
        const baseUrl = tokenInfo?.baseUrl || '';
        if (baseUrl.indexOf('hunan') !== -1 || tenantNo === '5368709125') {
            ctx.service.log.info('湖南税局走json方式勾选');
            res = await this.gxByJsonData(gxFullInfo);
        } else {
            res = await this.dkgxByImportFile(gxFullInfo);
            if (res.errcode === '91300') {
                return errcodeInfo.govLogout;
            }

            // 文件导入的方式税局有频率拦截
            if (res.errcode === '95001') {
                res = await this.gxByJsonData(gxFullInfo);
            }
        }
        ctx.service.log.info('dkgxByImportFile 结果', res);
        if (res.errcode !== '0000') {
            failList = failList.concat(realGxList.map((item) => {
                return {
                    ...item,
                    description: res.description
                };
            }));
            return this.getGxResult(taxPeriod, [], failList, authenticateFlag, res);
        }

        const { success } = res.data || {};
        const fail = failList.concat(res.data.fail || []);
        // 直接返回, 商家平台自己完成发票状态的更新
        if (fpdk_type === '4' || parseInt(clientType) === 3) {
            return this.getGxResult(taxPeriod, success, fail, authenticateFlag);
        }

        const saveRes = await ctx.service.invoiceSave.updateFpyGxInfo(success, authenticateFlag, 1, {
            access_token,
            clientType,
            taxNo,
            taxPeriod
        });
        // 后台保存失败
        if (saveRes.errcode !== '0000') {
            ctx.service.log.fullInfo('dkgx save success', success);
            const failList2 = success.map((item) => {
                return {
                    ...item,
                    description: saveRes.description
                };
            });
            return this.getGxResult(taxPeriod, [], fail.concat(failList2), authenticateFlag, saveRes);
        }
        return this.getGxResult(taxPeriod, success, fail, authenticateFlag);
    }

    // 变更税款所属税期
    async changeSkssq(tokenInfo, decryedData) {
        const ctx = this.ctx;
        const { Bghskssq } = decryedData;
        if (!Bghskssq) {
            return {
                ...errcodeInfo.argsErr
            };
        }
        // 变更税期与当前税期相同
        if (tokenInfo.taxPeriod === Bghskssq) {
            return {
                ...errcodeInfo.argsErr,
                description: '变更后税款所属期为当前税款所属期'
            }
        }
        const urlPath = '/ypfw/bgskssq/v1/skssqSqbg?Bghskssq=' + Bghskssq;
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, '', {
            method: 'get'
        });

        ctx.service.log.info('变更税款所属税期返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || {};
        if (resData.Code === '500') {
            return {
                ...errcodeInfo.argsErr,
                description: resData.Message
            };
        }

        return {
            ...errcodeInfo.success,
            description: resData.Message
        };
    }

    async gxInvoiceResultCheck(realGxList, tokenInfo, authenticateFlag) {
        const ctx = this.ctx;
        const taxNo = tokenInfo.taxNo;
        ctx.service.log.info('发票抵扣勾选对比 开始1', realGxList);
        if (realGxList.length > 0) {

            const newFphms = [];
            const newFpdms = [];
            for (let i = 0; i < realGxList.length; i ++) {
                newFphms.push(realGxList[i].invoiceNo);
                newFpdms.push(realGxList[i].invoiceCode);
            }
            // 抵扣勾选，先判断是否有缓存成功的
            const newKprqs = realGxList.map((item) => {
                return item.invoiceDate;
            });
            const minMaxDate = getMinMaxDate(newKprqs);
            const searchGxOpt = {
                searchOpt: {
                    rzzt: authenticateFlag,
                    endTime: minMaxDate.max,
                    startTime: minMaxDate.min,
                    endTimeGx: parseInt(authenticateFlag) === 1 ? moment().format('YYYY-MM-DD') : '',
                    startTimeGx: parseInt(authenticateFlag) === 1 ? `${moment().format('YYYY-MM')}-01` : '',
                    invoiceType: -1,
                    invoiceStatus: -1
                }
            };

            const fpcyRes = await this.queryAllUnRzInvoices(tokenInfo, {
                ...searchGxOpt,
                taxNo
            });
            // ctx.helper.loggerInfo('--fpcyRes--', fpcyRes);
            const taxPeriod = decodeURIComponent(tokenInfo.skssq).split(';')[0] || '';
            let resultTip = { ...errcodeInfo.success };
            if (fpcyRes.errcode === '0000') {
                const findResult = findGxResult(newFpdms, newFphms, newKprqs, fpcyRes.data, taxPeriod);
                ctx.service.log.info('发票抵扣勾选对比结果', findResult);
                const { fail = [] } = findResult.data;
                const { successInvoices = [] } = findResult;
                const failAry = fail.map((item) => {
                    const { fpdm, fphm, kprq } = item;
                    let curDescription = '发票不存在';
                    return {
                        invoiceCode: fpdm,
                        invoiceNo: fphm,
                        invoiceDate: kprq,
                        effectiveTaxAmount: realGxList.find((itm) => itm.invoiceNo === fphm).effectiveTaxAmount,
                        taxPeriod,
                        description: curDescription
                    };
                });
                if (findResult.errcode === '0000') { // 完全成功
                    resultTip.data = {
                        taxPeriod,
                        success: successInvoices,
                        fail: []
                    };
                } else { // 部分成功
                    resultTip.data = {
                        taxPeriod,
                        success: successInvoices,
                        fail: failAry
                    };
                }
                return resultTip;
            }
            return fpcyRes;

        }
        return {
            ...errcodeInfo.success,
            data: {
                success: parseInt(authenticateFlag) === 0 ? realGxList : [],
                fail: parseInt(authenticateFlag) === 1 ? realGxList : []
            }
        };
    }

    checkInvoiceIsFull(invoices) {
        const ctx = this.ctx;
        ctx.service.log.info('发票信息检查 开始');
        const checkFullInvoice = [];
        const checkNotFullInvoice = [];
        for(let i = 0; i < invoices.length; i++) {
            const item = invoices[i];
            let isQuanDian = false;
            if (item.invoiceNo && item.invoiceNo.length === 20) {
                isQuanDian = true;
            }
            let isShudianPaper = false;
            const govEtaxTypes = ['85', '86', '87', '88'];
            if (item.govInvoiceType) {
                // 数电纸质发票没有传etaxInvoiceNo需要补全
                if (govEtaxTypes.includes(item.govInvoiceType) && !item.etaxInvoiceNo) {
                    isShudianPaper = true;
                }
            } else if ((Number(item.invoiceType) === 3 || Number(item.invoiceType) === 4) && !item.etaxInvoiceNo) { // 有可能是数电纸质票
                isShudianPaper = true;
            }

            if (((item.invoiceCode && item.invoiceNo) || isQuanDian) && item.invoiceDate &&
            item.invoiceAmount && item.totalTaxAmount && item.effectiveTaxAmount && (item.invoiceType || item.govInvoiceType) && !isShudianPaper) {
                checkFullInvoice.push(item);
            } else {
                checkNotFullInvoice.push(item);
            }
        }
        ctx.service.log.fullInfo('发票信息检查 结果', {
            checkFullInvoice,
            checkNotFullInvoice
        });
        return {
            checkFullInvoice,
            checkNotFullInvoice
        }
    }
}
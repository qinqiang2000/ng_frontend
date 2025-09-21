/* eslint-disable no-undef */

import { createDkgxExcelData, getDkgxFailResult } from '../libs/jksDkgxExcel';
import { getUid, getMinMaxDate, findJgxGxResult } from '../libs/tools';

const { join: pathJoin } = path;
export class EtaxJksDkgx extends BaseService {
    // // 获取所有未认证的发票
    async queryAllUnRzInvoices(userInfo, opt) {
        const ctx = this.ctx;
        let fpcyRes = { ...errcodeInfo.govErr };
        let invoices = [];
        let goOn = false;
        let dataIndex = opt.dataIndex;
        do {
            const optParam = { ...opt, dataIndex, dataFrom: 'dkgxquery' };
            fpcyRes = await ctx.service.etaxQueryJks.dkgxQueryInvoices(userInfo, optParam);
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
            rzzt: authenticateFlag === 1 ? 0 : 1,
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
        const startTimeInt = parseInt(startTime.replace(/-/g, ''));
        const endTimeInt = parseInt(endTime.replace(/-/g, ''));
        for (let i = 1; i < list.length; i++) {
            const curData = list[i];
            const invoiceDateInt = parseInt(curData.invoiceDate.replace(/-/g, ''));
            if (startTimeInt > invoiceDateInt) {
                startTime = curData.invoiceDate;
            }
            if (endTimeInt < invoiceDateInt) {
                endTime = curData.invoiceDate;
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
            const dataKey = ['k', curData.customDeclarationNo].join('_');
            gxListDict[dataKey] = {
                customDeclarationNo: curData.customDeclarationNo,
                effectiveTaxAmount: curData.effectiveTaxAmount,
                invoiceDate: curData.invoiceDate
            };
        }
        return gxListDict;
    }

    // 根据目前的发票数据过滤出来会勾选失败的发票
    getPreGxInvoicesDict(resultList, gxListDict, tokenInfo) {
        const resultDict = {};
        const gxrqfw = tokenInfo.gxrqfw;
        const maxDate = gxrqfw.split('-')[1];
        const maxDateInt = parseInt(maxDate.replace(/-/g, ''));

        for (let i = 0; i < resultList.length; i++) {
            const curData = resultList[i];
            const dataKey = ['k', curData.customDeclarationNo].join('_');
            const gxDictData = gxListDict[dataKey];
            // 只查找需要勾选的
            if (!gxDictData) {
                continue;
            }

            const govType = 21;
            const invoiceStatus = parseInt(curData.invoiceStatus);
            const invoiceDateInt = parseInt(curData.invoiceDate.replace(/-/g, ''));
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
            } else if (curData.invoiceDate !== gxDictData.invoiceDate) {
                resultDict[dataKey] = '31_开票日期错误';
            } else if (maxDateInt < invoiceDateInt) {
                resultDict[dataKey] = '10_开票日期超过可操作发票范围';
            } else {
                resultDict[dataKey] = {
                    invoiceType: 21,
                    govType: govType,
                    customDeclarationNo: curData.customDeclarationNo,
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
        const gxListDict = this.getGxListDict(list);
        const filterDict = this.getPreGxInvoicesDict(resData, gxListDict, tokenInfo);
        const findList = [];
        const notFindList = [];
        const findFailList = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const dKey = ['k', item.customDeclarationNo].join('_');
            const commonData = {
                customDeclarationNo: item.customDeclarationNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount
            };
            const curFilterData = filterDict[dKey];
            if (!curFilterData) {
                if (flag === 'fpy') {
                    notFindList.push(commonData);
                } else {
                    findFailList.push({
                        ...commonData,
                        selectResult: 2,
                        description: '未查询到该发票'
                    });
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
                    totalTaxAmount: curFilterData.totalTaxAmount
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
        const res = await ctx.service.fpyQueryInvoices.queryByCodeNos(access_token, list, clientType);
        if (res.errcode !== '0000') {
            return res;
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
        ctx.service.log.info('通过税局补齐缴款书勾选查询参数', dkFlag, fopt);
        let res;
        if (list.length > 1) {
            res = await ctx.service.etaxExportInvoice.dkgxExport(tokenInfo, fopt);
        } else {
            res = await ctx.service.etaxQueryInvoices.dkgxQueryInvoices(tokenInfo, fopt);
        }

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
                customDeclarationNo: item.customDeclarationNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount,
                selectResult: item.selectResult || '8-[001]',
                description: item.description || '勾选异常'
            };
        });
        const success = successList.map((item) => {
            return {
                customDeclarationNo: item.customDeclarationNo,
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
    async getGxResultReason(tokenInfo, lsh = '') {
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
        ctx.service.log.info('缴款书抵扣勾选请求地址及返回', url, res1);
        if (res1.errcode !== '0000') {
            return res1;
        }
        const filePath = res1.data.filePath;
        const res = getDkgxFailResult(filePath);
        ctx.service.log.info('缴款书抵扣勾选查询勾选失败结果', res);
        return res;
    }

    async gxByImportFile(opt = {}) {
        const ctx = this.ctx;
        const {
            tokenInfo,
            authenticateFlag
        } = opt;
        const failList = [];
        const realGxList = opt.realGxList;
        const taxNo = tokenInfo.taxNo;
        const resInfo = createDkgxExcelData(realGxList, authenticateFlag, taxNo);
        const res2 = await ctx.service.nt.ntImportExcel(tokenInfo.pageId, '/ypfw/dkgx/v1/importHgws', {
            list: resInfo.list,
            cols: resInfo.cols,
            fileName: taxNo + '.xlsx'
        });

        // 提交批量勾选失败
        if (res2.errcode !== '0000') {
            ctx.service.log.info('缴款书批量抵扣勾选异常, 返回', res2);
            ctx.service.log.info('缴款书批量抵扣勾选异常, 关键参数', resInfo);
            return res2;
        }

        const resData = res2.data || {};
        const { Lsh, FailCount } = resData;
        ctx.service.log.info('缴款书批量抵扣勾选返回', res2);
        // 全部勾选成功
        if (FailCount === 0) {
            return {
                ...errcodeInfo.success,
                data: {
                    success: realGxList,
                    fail: failList
                }
            };
        }

        const resonRes = await this.getGxResultReason(tokenInfo, Lsh);
        // 查询勾选结果失败
        if (resonRes.errcode !== '0000') {
            return resonRes;
        }

        const success = [];
        const { failInfo } = resonRes.data || {};
        for (let i = 0; i < realGxList.length; i++) {
            const curData = realGxList[i];
            const k = 'k' + curData.customDeclarationNo;
            // 失败的
            if (failInfo[k]) {
                failList.push({
                    ...curData,
                    ...failInfo[k]
                });
            // 失败记录里面可能存在重复勾选和撤销勾选的，认为是处理成功
            } else {
                success.push(curData);
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
        ctx.service.log.info('缴款书抵扣勾选参数', realGxList);
        const taxNo = tokenInfo.taxNo;
        const hgwsList = [];
        const newKprqs = [];
        if (realGxList.length === 0) {
            return {
                ...errcodeInfo.success,
                data: {
                    success: [],
                    fail: []
                }
            };
        }

        for (let i = 0; i < realGxList.length; i++) {
            const item = realGxList[i];
            newKprqs.push(item.invoiceDate);
            hgwsList.push({
                znxzmbh: '',
                hgjkshm: item.customDeclarationNo,
                tfrq: item.invoiceDate,
                gfsbh: taxNo,
                gxlx: authenticateFlag.toString(),
                skje: item.invoiceAmount
            });
        }
        const jsonData = {
            fpList: [],
            'hgwsList': hgwsList,
            'wspzList': []
        };

        ctx.service.log.info('缴款书抵扣勾选税局参数', jsonData);
        const urlPath = '/ypfw/dkgx/v1/dkgxSubmit';
        const res2 = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        ctx.service.log.info('缴款书抵扣勾选税局返回', res2);

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
        // 抵扣勾选，先判断是否有缓存成功的
        const invoiceSuccessArr = [];
        const minMaxDate = getMinMaxDate(newKprqs, invoiceSuccessArr);
        const searchGxOpt = {
            searchOpt: {
                rzzt: authenticateFlag,
                endTime: minMaxDate.max,
                startTime: minMaxDate.min,
                gxEndTime: parseInt(authenticateFlag) === 1 ? moment().format('YYYY-MM-DD') : '',
                gxStartTime: parseInt(authenticateFlag) === 1 ? moment().subtract(1, 'months').format('YYYY-MM-01') : '',
                invoiceType: -1,
                invoiceStatus: -1
            }
        };

        const fpcyRes = await this.queryAllUnRzInvoices(tokenInfo, {
            ...searchGxOpt,
            taxNo
        });
        ctx.service.log.fullInfo('查询勾选结果返回', fpcyRes);
        if (fpcyRes.errcode !== '0000') {
            return fpcyRes;
        }
        const findResult = findJgxGxResult(realGxList, fpcyRes.data, taxPeriod);
        ctx.service.log.info('缴款书抵扣勾选对比结果', findResult);
        return findResult;
    }

    async gxInvoices(tokenInfo, requestData, access_token = '') {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        const list = requestData.invoices;
        const authenticateFlag = requestData.authenticateFlag;
        const taxPeriod = tokenInfo.taxPeriod;
        const clientType = requestData.clientType;
        if (!tokenInfo.gxrqfw || !tokenInfo.skssq) {
            return errcodeInfo.govLogout;
        }
        let realGxList = [];
        let failList = [];
        const firstItem = list[0];
        const gxFullInfo = {
            tokenInfo,
            realGxList,
            failList,
            access_token,
            clientType,
            authenticateFlag
        };
        // 税局需要的勾选字段都齐全不需要补齐数据，直接调用税局勾选
        if (firstItem.customDeclarationNo && firstItem.invoiceDate &&
            firstItem.totalTaxAmount && firstItem.effectiveTaxAmount) {
            const filterData = this.commonfilter(list, list, 'fpy', tokenInfo);
            ctx.service.log.info('对参数进行过滤校验----', filterData);
            const { findList = [], findFailList = [] } = filterData;
            if (findList.length === 0) {
                return this.getGxResult(taxPeriod, [], findFailList, authenticateFlag);
            }
            realGxList = findList;
            failList = findFailList;
            gxFullInfo.realGxList = findList;
            gxFullInfo.failList = findFailList;
        } else {
            /*
            const filter1Res = await this.filterByFpyQuery(access_token, list, tokenInfo, clientType);
            if (filter1Res.errcode !== '0000') {
                return this.getGxResult(taxPeriod, [], list, authenticateFlag, filter1Res);
            }
            */
            const filter1Res = { data: { findList: [], notFindList: list, findFailList: [] } };
            const { findList = [], notFindList = [], findFailList = [] } = filter1Res.data;
            realGxList = findList;
            failList = findFailList;
            // 通过发票云处理就提前判断全部勾选失败
            if (findList.length === 0 && notFindList.length === 0) {
                return this.getGxResult(taxPeriod, [], findFailList, authenticateFlag);
            }

            if (notFindList.length > 0) {
                const filter2Res = await this.filterByGovQuery(tokenInfo, notFindList, 'dkgx', authenticateFlag);
                ctx.service.log.info('filterByGovQuery res', filter2Res);
                if (filter2Res.errcode !== '0000') {
                    return this.getGxResult(taxPeriod, [], list, authenticateFlag, filter2Res);
                }
                const govResData = filter2Res.data;
                const govFindList = govResData.findList || [];
                const govFailList = govResData.findFailList || [];
                realGxList = realGxList.concat(govFindList);
                failList = failList.concat(govFailList);
            }

            if (realGxList.length === 0) {
                return this.getGxResult(taxPeriod, [], failList, authenticateFlag);
            }

            gxFullInfo.realGxList = realGxList;
            gxFullInfo.failList = failList;
        }

        // let res;
        ctx.service.log.info('开始海关缴款书抵扣勾选', gxFullInfo);
        // json格式勾选获取不到勾选原因，可以只处理单张勾选
        // if (gxFullInfo.realGxList.length === 1) {
        //     res = await this.gxByImportFile(gxFullInfo);
        //     // res = await this.gxByJsonData(gxFullInfo);
        // } else {
        //     res = await this.gxByImportFile(gxFullInfo);
        // }
        const res = await this.gxByImportFile(gxFullInfo);
        if (res.errcode !== '0000' && typeof res.data?.fail === 'undefined') {
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
        // 直接返回
        if (fpdk_type === '4') {
            return this.getGxResult(taxPeriod, success, fail, authenticateFlag);
        }
        const saveRes = await ctx.service.invoiceSave.updateFpyGxInfo(success, authenticateFlag, 1, access_token, clientType);
        // 后台保存失败
        if (saveRes.errcode !== '0000') {
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
}
/* eslint-disable no-undef */
// import { BaseService } from './baseService';
// import errcodeInfo from '$client/errcodeInfo';
// import moment from 'moment';
import { createBdkgxExcelData, getBdkgxFailResult } from '../libs/bdkgxExcel';
import { transformGovType } from '../libs/etaxInvoiceType';
// import { join as pathJoin } from 'path';
import { getUid, getMinMaxDate, findGxResult } from '../libs/tools';
import { changeEtaxDkgxParam } from '../libs/govParamsChange';
// import { getUrlYzm } from '$utils/tools';
const { join: pathJoin } = path;

export class EtaxBdkgxInvoices extends BaseService {
    // 获取所有未认证的发票
    async queryAllBdkGxInvoices(userInfo, opt) {
        const ctx = this.ctx;
        let fpcyRes;
        let invoices = [];
        let goOn = false;
        let dataIndex = opt.dataIndex;
        do {
            const optParam = { ...opt, dataIndex, dataFrom: 'bdkgxquery' };
            fpcyRes = await ctx.service.etaxQueryInvoices.bdkgxQueryInvoices(userInfo, optParam);
            if (fpcyRes.errcode !== '0000') {
                ctx.service.log.info('获取不抵扣勾选比对数据异常, 参数：', optParam);
                ctx.service.log.info('获取不抵扣勾选比对数据异常, 返回：', fpcyRes);
                break;
            } else {
                dataIndex = fpcyRes.nextDataIndex;
                goOn = dataIndex < fpcyRes.totalNum;
                invoices = invoices.concat(fpcyRes.data);
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
    getGxListDict(gxList = [], authenticateFlag) {
        const gxListDict = {};
        for (let i = 0; i < gxList.length; i++) {
            const curData = gxList[i];
            const dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            let reson = '';
            let notDeductibleType = '';
            // 不抵扣勾选
            if (authenticateFlag === 1) {
                notDeductibleType = curData.notDeductibleType;
                reson = this.getBdkText(notDeductibleType);
                if (reson === -1) {
                    return {
                        ...errcodeInfo.argsErr,
                        description: '不抵扣勾选原因参数错误，请检查'
                    };
                }
            }

            gxListDict[dataKey] = {
                etaxInvoiceNo: curData.etaxInvoiceNo,
                invoiceCode: curData.invoiceCode,
                invoiceNo: curData.invoiceNo,
                effectiveTaxAmount: curData.effectiveTaxAmount,
                invoiceDate: curData.invoiceDate,
                notDeductibleType: notDeductibleType,
                notDeductibleText: reson,
                GxztDm: authenticateFlag === 1 ? '0' : '1'
            };
        }
        return {
            ...errcodeInfo.success,
            data: gxListDict
        };
    }

    // 根据目前的发票数据过滤出来会勾选失败的发票
    getPreGxInvoicesDict(resultList, gxListDict, tokenInfo) {
        const resultDict = {};
        const gxrqfw = tokenInfo.gxrqfw;
        const maxDate = gxrqfw.split('-')[1];
        const maxDateInt = parseInt(maxDate.replace(/-/g, ''));

        for (let i = 0; i < resultList.length; i++) {
            const curData = resultList[i];
            let dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            if (!curData.invoiceNo || (curData.Fphm && curData.Fphm.length === 20)) { // 数电票
                dataKey = ['k', '', curData.Fphm].join('_');
            }
            const gxDictData = gxListDict[dataKey];
            // 只查找需要勾选的
            if (!gxDictData) {
                continue;
            }

            const govType = curData.FplxDm;
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
                resultDict[dataKey] = '16_红字发票不能不抵扣勾选操作';
            } else if (curData.invoiceDate !== gxDictData.invoiceDate) {
                resultDict[dataKey] = '31_传入的开票日期错误';
            } else if (maxDateInt < invoiceDateInt) {
                resultDict[dataKey] = '10_开票日期超过可操作发票范围';
            } else {
                resultDict[dataKey] = curData;
            }
        }
        return resultDict;
    }

    // 转换不抵扣原始文本
    getBdkText(type) {
        const dict = {
            'k1': '用于非应税项目',
            'k2': '用于免税项目',
            'k3': '用于集体福利或者个人消费',
            'k4': '非正常损失的',
            'k5': '其他'
        };
        return dict['k' + type] || -1;
    }

    // 税局和发票云公用的过滤部分，查找出补齐参数的list, 未查询到list，勾选会失败的list
    commonfilter(resData = [], list = [], gxListDict, tokenInfo) {
        const filterDict = this.getPreGxInvoicesDict(resData, gxListDict, tokenInfo);
        const findList = [];
        const notFindList = [];
        const findFailList = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            let dKey = ['k', item.invoiceCode, item.invoiceNo].join('_');
            if (item.invoiceNo.length === 20) { // 数电票
                dKey = ['k', '', item.invoiceNo].join('_');
            }
            this.ctx.service.log.info('dKey', dKey);
            const commonData = {
                invoiceCode: item.invoiceCode,
                invoiceNo: item.invoiceNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount,
                etaxInvoiceNo: item.etaxInvoiceNo
            };
            const curFilterData = filterDict[dKey];
            if (!curFilterData) {
                findFailList.push({
                    ...commonData,
                    selectResult: '2',
                    description: '未查询到该发票'
                });
            } else if (typeof curFilterData === 'string') {
                const result = curFilterData.split('_');
                findFailList.push({
                    ...commonData,
                    selectResult: result[0],
                    description: result[1]
                });
            } else if (typeof curFilterData === 'object') {
                findList.push(curFilterData);
            }
        }
        return {
            findList,
            notFindList,
            findFailList
        };
    }

    async loopQueryBdkInvoices(tokenInfo, fopt, list = [], gxListDict) {
        const ctx = this.ctx;
        const listData = [];
        let findNum = 0;
        const pageSize = 500;
        const requestOpt = {
            ...fopt,
            searchOpt: {
                ...fopt.searchOpt,
                pageSize
            }
        };

        let nextDataIndex = 0;
        let res = errcodeInfo.success;
        let goOn = true;
        do {
            requestOpt.nextDataIndex = nextDataIndex;
            res = await ctx.service.etaxQueryInvoices.bdkgxQueryInvoices(tokenInfo, requestOpt, true);
            ctx.service.log.info('不抵扣发票查询 loopQueryBdkInvoices res', res);
            if (res.errcode !== '0000') {
                goOn = false;
                break;
            }
            const resData = res.data || {};
            const { Total = 0, List = [] } = resData || {};
            nextDataIndex = requestOpt.nextDataIndex + List.length;
            for (let i = 0; i < List.length; i++) {
                const curData = List[i];
                let dKey = ['k', curData.ZzfpDm, curData.ZzfpHm].join('_');
                if (!curData.ZzfpDm || !curData.ZzfpHm) { // 数电票
                    dKey = ['k', '', curData.Fphm].join('_');
                }
                const gxData = gxListDict[dKey];
                let etaxInvoiceNo = '';
                if (Number(curData.FplxDm) === 85 || Number(curData.FplxDm) === 86) { // 数电票号码, 数电纸质发票才有
                    etaxInvoiceNo = curData.ZzfpHm;
                }
                if (gxData) {
                    findNum += 1;
                    const tempData = {
                        ...curData,
                        etaxInvoiceNo,
                        GxztDm: gxData.GxztDm,
                        govType: curData.FplxDm,
                        invoiceType: transformGovType(curData.FplxDm),
                        invoiceCode: curData.ZzfpDm,
                        invoiceNo: curData.ZzfpHm || curData.Fphm,
                        invoiceDate: curData.Kprq.substr(0, 10),
                        totalTaxAmount: curData.totalTaxAmount || curData.Se,
                        invoiceAmount: curData.invoiceAmount || curData.Je,
                        effectiveTaxAmount: curData.Yxdkse,
                        invoiceStatus: parseInt(curData.Fpzt),
                        salerName: curData.Xfmc,
                        salerTaxNo: curData.Xfsbh
                    };
                    if (gxData.notDeductibleType) {
                        // 税局参数为字符串类型
                        tempData.BdkyyDm = gxData.notDeductibleType + '';
                        tempData.Sglrdbdkyy = gxData.notDeductibleText;
                    }
                    listData.push(tempData);
                }

                if (findNum === list.length) {
                    goOn = false;
                    break;
                }
            }
            if (nextDataIndex >= Total) {
                goOn = false;
            }
        } while (goOn);

        if (res.errcode !== '0000') {
            return res;
        }
        return {
            ...errcodeInfo.success,
            data: listData
        };
    }

    // 通过税局补齐参数
    async filterByGovQuery(tokenInfo, list, authenticateFlag) {
        const ctx = this.ctx;
        const fopt = this.getSearchOpt(list, authenticateFlag);
        ctx.service.log.info('发票不抵扣勾选通过税局补齐查询参数', fopt);
        const gxListDictRes = this.getGxListDict(list, authenticateFlag);
        if (gxListDictRes.errcode !== '0000') {
            return gxListDictRes;
        }

        const gxListDict = gxListDictRes.data;
        const res = await this.loopQueryBdkInvoices(tokenInfo, fopt, list, gxListDict);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || [];
        const filterInfo = this.commonfilter(resData, list, gxListDict, tokenInfo);
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
            description = authenticateFlag === 0 ? '取消抵扣勾选提交成功' : '不抵扣勾选提交成功';
        } else {
            description = authenticateFlag === 0 ? '部分取消抵扣勾选提交成功' : '部分不抵扣勾选提交成功';
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
    async getBdkgxResultReason(tokenInfo, lsh = '') {
        const ctx = this.ctx;
        if (!lsh) {
            return errcodeInfo.argsErr;
        }
        const taxNo = tokenInfo.taxNo;
        const url = '/ypfw/bdkgx/v1/sbmxupload?Lsh=' + encodeURIComponent(lsh) + '&Bz=Y';
        const res1 = await ctx.service.nt.ntDownload(tokenInfo.pageId, url, {
            saveDirPath: pathJoin(ctx.app.config.govDownloadZipDir, 'download', taxNo, 'bdkgxInvoices'),
            fileName: 'bdkgxInvoices-result-' + getUid() + '.xlsx',
            passFetch: true
        });
        ctx.service.log.info('发票不抵扣勾选地址及返回', url, res1);
        if (res1.errcode !== '0000') {
            return res1;
        }
        const filePath = res1.data.filePath;
        const res = getBdkgxFailResult(filePath);
        ctx.service.log.info('发票不抵扣勾选失败原因', res);
        return res;
    }

    async bdkgxByImportFile(opt = {}) {
        const ctx = this.ctx;
        const {
            tokenInfo,
            authenticateFlag
        } = opt;
        const failList = [];
        const realGxList = opt.realGxList;
        const taxNo = tokenInfo.taxNo;
        const list = realGxList.map((item) => {
            let qdInvoiceNo = '';
            let invoiceNo = item.invoiceNo;
            if (item.invoiceNo) {
                qdInvoiceNo = item.invoiceNo.length === 20 ? item.invoiceNo : '';
                invoiceNo = item.invoiceNo.length === 20 ? '' : item.invoiceNo;
            } else if (item.Fphm) { // 数电票
                qdInvoiceNo = item.Fphm.length === 20 ? item.Fphm : '';
                invoiceNo = item.Fphm.length === 20 ? '' : item.Fphm;
            }
            return {
                qdInvoiceNo,
                invoiceType: item.invoiceType,
                govType: item.govType,
                invoiceCode: item.invoiceCode,
                invoiceNo,
                invoiceDate: item.invoiceDate,
                effectiveTaxAmount: item.effectiveTaxAmount,
                invoiceAmount: item.invoiceAmount,
                totalTaxAmount: item.totalTaxAmount,
                invoiceStatus: item.invoiceStatus,
                salerTaxNo: item.salerTaxNo,
                salerName: item.salerName,
                notDeductibleType: item.notDeductibleType
            };
        });
        const resInfo = createBdkgxExcelData(list, parseInt(authenticateFlag), taxNo);
        const res2 = await ctx.service.nt.ntImportExcel(tokenInfo.pageId, '/ypfw/bdkgx/v1/zzsbdkgximport', {
            list: resInfo.list,
            cols: resInfo.cols,
            field: 'multipartFile',
            fileName: taxNo + '.xlsx'
        });

        // 提交批量勾选失败
        if (res2.errcode !== '0000') {
            ctx.service.log.info('发票不抵扣勾选异常，返回', res2);
            ctx.service.log.info('发票不抵扣勾选异常，关键参数', resInfo);
            return res2;
        }

        const resData = res2.data || {};
        const { Lsh, Gxsbfs, Code, Message } = resData;
        if (Code !== '200') {
            return {
                ...errcodeInfo.govErr,
                description: Message || errcodeInfo.govErr.description
            };
        }
        ctx.service.log.info('发票批量不抵扣勾选返回', res2);
        // 全部勾选成功
        if (Gxsbfs === 0) {
            return {
                ...errcodeInfo.success,
                data: {
                    success: realGxList,
                    fail: failList
                }
            };
        }

        const resonRes = await this.getBdkgxResultReason(tokenInfo, Lsh);
        // 查询勾选结果失败
        if (resonRes.errcode !== '0000') {
            return resonRes;
        }

        const success = [];
        const { failInfo } = resonRes.data || {};
        for (let i = 0; i < realGxList.length; i++) {
            const curData = realGxList[i];
            const k = 'k' + curData.invoiceCode + '' + curData.invoiceNo;
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

    /* eslint-disable */
    async bdkgxByJsonData(opt = {}) {
        const ctx = this.ctx;
        const {
            tokenInfo,
            authenticateFlag
        } = opt;
        const taxNo = tokenInfo.taxNo;
        // const failList = [];
        const realGxList = opt.realGxList;
        const newFphms = [];
        const newFpdms = [];
        const newKprqs = [];
        ctx.service.log.info('bdkgxByJsonData realGxList', realGxList);

        const bodyData = realGxList.map((item) => {
            const {
                invoiceCode,
                invoiceNo,
                invoiceDate,
                effectiveTaxAmount,
                invoiceAmount,
                totalTaxAmount,
                invoiceStatus,
                salerTaxNo,
                salerName,
                invoiceType,
                notDeductibleType,
                etaxInvoiceNo,
                ...otherData
            } = item;
            newFphms.push(invoiceNo);
            newFpdms.push(invoiceCode || '');
            newKprqs.push(invoiceDate);

            let govInvoiceType = invoiceType;
            let fphm = invoiceNo.length === 20 ? invoiceNo : '';
            if (etaxInvoiceNo) {
                fphm = etaxInvoiceNo;
                if (govInvoiceType === '01') {
                    govInvoiceType = '85'; // 数电纸质发票（增值税专用发票）归类到增值税专用发票
                } else if (govInvoiceType === '04') {
                    govInvoiceType = '86'; // 数电纸质发票（普通发票）归类到增值税普通发票
                }
            }

            // 只返回税局的表头是数据
            return {
                "bdkyyDm": notDeductibleType || '5',
                "fpbbDm": invoiceNo.length !== 20 ? '1' : '2',
                "fplxDm": govInvoiceType,
                "fpzt": '0',
                "fxdjDm": "01",
                "gfsbh": taxNo,
                "gxztDm": parseInt(authenticateFlag) === 1 ? '0' : '1', // 不抵扣勾选税局是相反的状态
                "hxytDm": "0",
                "je": invoiceAmount,
                "kprq": invoiceDate,
                "pzbq": invoiceNo.length !== 20 ? '02' : '01',
                "se": totalTaxAmount,
                "sglrdbdkyy": "不抵扣",
                // "tid": "6fc7c7ab-f09e-4c08-a1b0-b4cfe661f275",
                "xfmc": salerName,
                "xfsbh": salerTaxNo,
                "yhzsdbz": "N",
                "yxdkse": effectiveTaxAmount,
                "yyvisible": false,
                "znxzmbh": "",
                "zzfpDm": invoiceCode || '',
                "zzfpHm": invoiceNo.length !== 20 ? invoiceNo : '',
                "fphm": fphm,
                ...otherData
            }
        });

        ctx.service.log.info('发票不抵扣勾选接口请求参数', bodyData);
        const urlPath = '/ypfw/bdkgx/v1/zzsbdkgx';
        // const res2 = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(bodyData)
        // });
        const res2 = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyData);
        ctx.service.log.info('发票不抵扣勾选接口返回', res2);
        if (res2.errcode !== '0000') {
            return res2;
        }

        const resData = res2.data || {};
        if (resData.Code !== '200') {
            return {
                ...errcodeInfo.govErr,
                description: '勾选异常'
            };
        }
        const taxPeriod = decodeURIComponent(tokenInfo.skssq).split(';')[0] || '';
        if (realGxList.length > 0) {
            // 不抵扣勾选，先判断是否有缓存成功的
            const invoiceSuccessArr = [];
            const minMaxDate = getMinMaxDate(newKprqs, invoiceSuccessArr);
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
            const fpcyRes = await this.queryAllBdkGxInvoices(tokenInfo, {
                ...searchGxOpt,
                taxNo
            });

            let resultTip = { ...errcodeInfo.govErr };
            const errList = [];
            if (fpcyRes.errcode === '0000') {
                const findResult = findGxResult([...newFpdms], [...newFphms], newKprqs, fpcyRes.data, taxPeriod);
                ctx.service.log.info('发票不抵扣勾选对比结果', findResult);
                const { fail = [] } = findResult.data;
                const { successInvoices } = findResult;
                const failAry = fail.map((item) => {
                    const { fpdm, fphm, kprq } = item;
                    return {
                        invoiceCode: fpdm,
                        invoiceNo: fphm,
                        invoiceDate: kprq,
                        taxPeriod,
                        effectiveTaxAmount: realGxList.find((itm) => itm.invoiceNo === fphm).effectiveTaxAmount,
                        ...item
                    }
                });
                findResult.data.fail = failAry;
                findResult.data.success = successInvoices;

                if (findResult.errcode === '0000') {
                    resultTip.data = {
                        taxPeriod,
                        ...findResult.data
                    };
                    resultTip.description = parseInt(authenticateFlag) === 1 ? '发票不抵扣勾选成功！' : '发票不抵扣取消勾选成功';
                } else {
                    // resultTip = { ...errcodeInfo.govGxSomeSuccess };
                    resultTip.description = '部分发票勾选成功！'
                    resultTip.data = {
                        taxPeriod,
                        ...findResult.data,
                        fail: errList.concat(findResult.data.fail)
                    };
                }

                const sucessList = resultTip.data.success || [];
                if (sucessList.length === 0) {
                    resultTip.errcode = errcodeInfo.gxtjSuccess.errcode;
                    if (parseInt(authenticateFlag) === 1) {
                        resultTip.description = '勾选异常，请确认在电子税局“税务数字账户-- 发票勾选确认-不抵扣类勾选--未勾选”，能查询到该发票';
                    } else {
                        resultTip.description = '勾选异常，请确认在电子税局“税务数字账户-- 发票勾选确认-不抵扣类勾选--已勾选”，能查询到该发票';
                    }
                } else {
                    resultTip.errcode = '0000';
                }
            } else {
                // 勾选成功，但比对结果获取发票列表时失败
                resultTip.errcode = fpcyRes.errcode;
                resultTip.description = fpcyRes.description;
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

    // 不抵扣勾选
    /* eslint-disable */
    async bdkgxInvoices(tokenInfo, requestData, access_token = '') {
        const ctx = this.ctx;
        ctx.service.log.info('plugin server1 --------');
        const { fpdk_type, taxNo } = ctx.request.query;
        let list = requestData.invoices;
        let authenticateFlag = requestData.authenticateFlag;
        if (!requestData.invoices && requestData.fphm) {
            const listResult = changeEtaxDkgxParam(requestData);
            if (listResult.errcode !== '0000') {
                return {
                    ...errcodeInfo.argsErr
                };
            }
            list = listResult.data.invoices;
            authenticateFlag = requestData.zt;
        }

        const clientType = requestData.clientType || 4;
        const taxPeriod = tokenInfo.taxPeriod;
        const firstItem = list[0];
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
        let useImportExcel = false;
        let isQuanDian = false;
        if (firstItem.invoiceNo && firstItem.invoiceNo.length === 20) {
            isQuanDian = true;
        }
        let isShudianPaper = false;
        if ((Number(firstItem.invoiceType) === 3 || Number(firstItem.invoiceType) === 4) && !firstItem.etaxInvoiceNo) { // 有可能是数电纸质票
            isShudianPaper = true;
        }
        // 不抵扣参数完整，直接调用税局
        if (((firstItem.invoiceCode && firstItem.invoiceNo) || isQuanDian) && firstItem.invoiceDate && firstItem.salerTaxNo &&
            firstItem.salerName && firstItem.invoiceAmount && firstItem.totalTaxAmount && firstItem.effectiveTaxAmount &&
            (firstItem.invoiceType || firstItem.govInvoiceType) && !isShudianPaper) {
            const gxListDictRes = this.getGxListDict(list, authenticateFlag);
            if (gxListDictRes.errcode !== '0000') {
                return gxListDictRes;
            }

            const gxListDict = gxListDictRes.data;
            const filterData = this.commonfilter(list, list, gxListDict, tokenInfo);
            ctx.service.log.info('对参数进行过滤校验', filterData);
            const { findList = [], findFailList = [] } = filterData;
            if (findList.length === 0) {
                return this.getGxResult(taxPeriod, [], findFailList, authenticateFlag);
            }
            realGxList = findList;
            failList = findFailList;
            gxFullInfo.realGxList = findList;
            gxFullInfo.failList = findFailList;
            useImportExcel = true;
        } else {
            const filterRes = await this.filterByGovQuery(tokenInfo, list, authenticateFlag);
            if (filterRes.errcode !== '0000') {
                return this.getGxResult(taxPeriod, [], list, authenticateFlag, filterRes);
            }
            const govResData = filterRes.data;
            const govFindList = govResData.findList || [];
            const govFailList = govResData.findFailList || [];
            realGxList = realGxList.concat(govFindList);
            failList = failList.concat(govFailList);
            if (realGxList.length === 0) {
                return this.getGxResult(taxPeriod, [], failList, authenticateFlag);
            }
            gxFullInfo.realGxList = realGxList;
            gxFullInfo.failList = failList;
        }
        // let res;
        // ctx.service.log.info('是否走 bdkgxByImportFile', gxFullInfo.realGxList.length, useImportExcel);
        // if ((gxFullInfo.realGxList.length === 1 && !useImportExcel) || tokenInfo.homeUrl.indexOf('shanghai') !== -1) {
        //     res = await this.bdkgxByJsonData(gxFullInfo);
        // } else {
        //     res = await this.bdkgxByImportFile(gxFullInfo);
        // }
        ctx.service.log.info('勾选发票列表', isShudianPaper, gxFullInfo.realGxList);
        const res = await this.bdkgxByJsonData(gxFullInfo);

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
        const saveRes = await ctx.service.invoiceSave.updateFpyGxInfo(success, authenticateFlag, 2, {
            access_token,
            clientType,
            taxNo,
            taxPeriod
        });
        // 后台保存失败
        if (saveRes.errcode !== '0000') {
            ctx.service.log.fullInfo('bdkgx save success', success);
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
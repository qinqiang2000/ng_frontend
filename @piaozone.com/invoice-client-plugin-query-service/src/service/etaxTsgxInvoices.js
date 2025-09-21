/* eslint-disable no-undef,max-len */
import { getMinMaxDate, findGxResult } from '../libs/tools';
import { transformFpyType } from '../libs/etaxInvoiceType';

export class EtaxTsgxInvoices extends BaseService {

    getTongArr(dktjxx) {
        const tjInfoArr = [];
        // const tjInfoDict = {};
        for (let i = 0; i < dktjxx.length; i++) {
            const { fppzDm, hjfs, hjse } = dktjxx[i]; // FppzDm, Hjfs, Hjse, Tjsj, Skssq
            if (fppzDm === '01') { // 增值税专用发票
                // tjInfoDict['k01'] = [Hjfs, Hjse, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '4',
                    deductibleNum: hjfs,
                    // deductibleAmount: 0,
                    deductibleTax: hjse,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fppzDm === '04') { // 缴款书
                // tjInfoDict['k21'] = [Hjfs, Hjse, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '21',
                    deductibleNum: hjfs,
                    deductibleTax: hjse,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            }
            // else if (FppzDm === '8') { // 合计
            //     tjInfoDict['k99'] = [Hjfs, Hjse, 0, 0, 0].join('=');
            //     tjInfoArr.push({
            //         invoiceType: '99',
            //         deductibleNum: Hjfs,
            //         deductibleTax: Hjse,
            //         unDeductibleNum: 0,
            //         unDeductibleAmount: 0,
            //         unDeductibleTax: 0
            //     });
            // }
        }
        // const sortKeys = ['01', '21'];
        // let tjInfo = '';
        // if (tjInfoArr.length > 0) {
        //     tjInfo = [];
        //     for (let i = 0; i < sortKeys.length; i++) {
        //         const curKey = sortKeys[i];
        //         const curData = tjInfoDict['k' + curKey];
        //         if (curData) {
        //             tjInfo.push(curKey + '=' + curData);
        //         } else {
        //             tjInfo.push(curKey + '=0=0=0=0=0');
        //         }
        //     }
        //     tjInfo = tjInfo.join(';') + ';';
        // }

        return {
            tjInfoArr,
            tjInfo: ''
        };
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

            gxListDict[dataKey] = {
                etaxInvoiceNo: curData.etaxInvoiceNo,
                invoiceCode: curData.invoiceCode,
                invoiceNo: curData.invoiceNo,
                effectiveTaxAmount: curData.effectiveTaxAmount,
                invoiceDate: curData.invoiceDate,
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
        // const gxrqfw = tokenInfo.gxrqfw;
        // const maxDate = gxrqfw.split('-')[1];
        // const maxDateInt = parseInt(maxDate.replace(/-/g, ''));

        for (let i = 0; i < resultList.length; i++) {
            const curData = resultList[i];
            let dataKey = ['k', curData.invoiceCode, curData.invoiceNo].join('_');
            if (!curData.invoiceNo || (curData.Fphm && curData.Fphm.length === 20)) { // 全电票
                dataKey = ['k', '', curData.Fphm].join('_');
            }
            const gxDictData = gxListDict[dataKey];
            // 只查找需要勾选的
            if (!gxDictData) {
                continue;
            }

            const govType = curData.FplxDm;
            const invoiceStatus = parseInt(curData.invoiceStatus);
            // const invoiceDateInt = parseInt(curData.invoiceDate.replace(/-/g, ''));
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
                resultDict[dataKey] = '16_红字发票不能退税勾选操作';
            } else if (curData.invoiceDate !== gxDictData.invoiceDate) {
                resultDict[dataKey] = '31_传入的开票日期错误';
            } else {
                resultDict[dataKey] = curData;
            }
            // else if (maxDateInt < invoiceDateInt) {
            //     resultDict[dataKey] = '10_开票日期超过可操作发票范围';
            // }
        }
        return resultDict;
    }

    // 转换退税原始文本
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
    commonfilter(resData = [], list = [], gxListDict, tokenInfo, authenticateFlag) {
        const filterDict = this.getPreGxInvoicesDict(resData, gxListDict, tokenInfo);
        this.ctx.service.log.fullInfo('filterDict', filterDict);
        const findList = [];
        const notFindList = [];
        const findFailList = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            let dKey = ['k', item.invoiceCode, item.invoiceNo].join('_');
            if (item.invoiceNo.length === 20) { // 全电票
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
                const tip = parseInt(authenticateFlag) === 1 ? '已勾选' : '尚未勾选';
                findFailList.push({
                    ...commonData,
                    selectResult: '2',
                    description: '未查询到该发票，请确认该发票是否' + tip
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
        const pageSize = 500;
        const requestOpt = {
            ...fopt,
            searchOpt: {
                ...fopt.searchOpt,
                pageSize
            }
        };
        const res = await ctx.service.etaxQueryTaxReturnInvoices.tsgxExport('', tokenInfo, requestOpt, true);
        if (res.errcode !== '0000') {
            return res;
        }
        return res;
    }

    // 通过税局补齐参数
    async filterByGovQuery(tokenInfo, list, authenticateFlag) {
        const ctx = this.ctx;
        const fopt = this.getSearchOpt(list, authenticateFlag);
        ctx.service.log.info('发票退税勾选通过税局补齐查询参数', fopt);
        const gxListDictRes = this.getGxListDict(list, authenticateFlag);
        if (gxListDictRes.errcode !== '0000') {
            return gxListDictRes;
        }

        const gxListDict = gxListDictRes.data;
        const res = await this.loopQueryBdkInvoices(tokenInfo, fopt, list, gxListDict);
        if (res.errcode !== '0000') {
            return res;
        }
        ctx.service.log.fullInfo('发票退税勾选通过税局补齐查询参数 税局返回', res);
        const resData = res.data || [];
        const filterInfo = this.commonfilter(resData, list, gxListDict, tokenInfo, authenticateFlag);
        ctx.service.log.info('发票退税勾选通过税局补齐查询参数 过滤返回', res);
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
            description = authenticateFlag === 0 ? '取消退税勾选提交成功' : '退税勾选提交成功';
        } else {
            description = authenticateFlag === 0 ? '部分取消退税勾选提交成功' : '部分退税勾选提交成功';
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

    /* eslint-disable */
    async tsgxByJsonData(opt = {}) {
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
        ctx.service.log.info('tsgxByJsonData realGxList', realGxList);
        ctx.service.log.info('authenticateFlag', authenticateFlag);

        const CktsFpGxParamList= realGxList.map((item) => {
            const {
                invoiceCode,
                invoiceNo,
                invoiceDate,
                // effectiveTaxAmount,
                invoiceAmount,
                totalTaxAmount,
                // invoiceStatus,
                salerTaxNo,
                salerName,
                invoiceType,
                etaxInvoiceNo
                // ...otherData
            } = item;
            newFphms.push(invoiceNo);
            newFpdms.push(invoiceCode || '');
            newKprqs.push(invoiceDate);

            let govInvoiceType = item.govInvoiceType ? item.govInvoiceType : transformFpyType(invoiceType);
            let fphm = invoiceNo.length === 20 ? invoiceNo : '';
            if (etaxInvoiceNo) { // 数电纸质发票
                fphm = etaxInvoiceNo;
            }
            if (govInvoiceType === '01') {
                govInvoiceType = '85'; // 数电纸质发票（增值税专用发票）归类到增值税专用发票
            } else if (govInvoiceType === '04') {
                govInvoiceType = '86'; // 数电纸质发票（普通发票）归类到增值税普通发票
            }

            return {
                "GxBz": parseInt(authenticateFlag) === 1 ? 0 : 1,
                "fpbbDm": invoiceNo.length !== 20 ? '1' : '2',
                "fpzt": "0",
                "fxdjDm": "01",
                "gfsbh": taxNo,
                "hzsdZt": "N",
                "je": invoiceAmount,
                "kprq": invoiceDate,
                "pz": govInvoiceType,
                "se": totalTaxAmount,
                // tid: "970a0d3d-430f-451a-b66c-b9df59b7f877"
                "xfmc": salerName,
                "xfsbh": salerTaxNo,
                "ygxztDm": parseInt(authenticateFlag) === 1 ? 0 : 1,
                "zzfpDm": invoiceCode,
                "zzfpHm": invoiceNo.length !== 20 ? invoiceNo : '',
                "fphm": fphm
            }
        });
        const bodyData = { CktsFpGxParamList };
        ctx.service.log.info('发票退税勾选接口请求参数', bodyData);
        const urlPath = '/ypfw/ckts/v1/dzPlTjBcGxCz'; // '/ypfw/bdkgx/v1/zzsbdkgx';
        // const res2 = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(bodyData)
        // });
        const res2 = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, bodyData);
        ctx.service.log.info('发票退税勾选接口请求地址', urlPath);
        ctx.service.log.info('发票退税勾选接口返回', res2);
        if (res2.errcode !== '0000') {
            return res2;
        }

        // const resData = res2.data || {};
        // if (resData.Code !== '200') {
        //     return {
        //         ...errcodeInfo.govErr,
        //         description: '勾选异常'
        //     };
        // }
        const taxPeriod = decodeURIComponent(tokenInfo.skssq).split(';')[0] || '';
        if (realGxList.length > 0) {
            // 退税勾选，先判断是否有缓存成功的
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

            const fpcyRes = await ctx.service.etaxQueryTaxReturnInvoices.tsgxExport('', tokenInfo, {
                ...searchGxOpt,
                taxNo
            }, true);
            let resultTip = { ...errcodeInfo.govErr };
            const errList = [];
            if (fpcyRes.errcode === '0000') {
                const findResult = findGxResult([...newFpdms], [...newFphms], newKprqs, fpcyRes.data, taxPeriod);
                ctx.service.log.info('发票退税勾选对比结果', findResult);
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
                    resultTip.description = parseInt(authenticateFlag) === 1 ? '发票退税勾选成功！' : '发票退税取消勾选成功';
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
                        resultTip.description = '退税勾选提交成功，当前发票勾选状态可能未发生变化，税局正在处理中';
                    } else {
                        resultTip.description = '退税取消勾选提交成功，当前发票勾选状态可能未发生变化，税局正在处理中';
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

    // 退税勾选
    /* eslint-disable */
    async tsgxInvoices(tokenInfo, requestData, access_token = '') {
        const ctx = this.ctx;
        const { fpdk_type, taxNo } = ctx.request.query;
        let list = requestData.invoices;
        let authenticateFlag = requestData.authenticateFlag;

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
        let isQuanDian = false;
        if (firstItem.invoiceNo && firstItem.invoiceNo.length === 20) {
            isQuanDian = true;
        }
        let isShudianPaper = false;
        if ((Number(firstItem.invoiceType) === 3 || Number(firstItem.invoiceType) === 4) && !firstItem.etaxInvoiceNo) { // 有可能是数电纸质票
            isShudianPaper = true;
        }

        // 退税参数完整，直接调用税局
        if (((firstItem.invoiceCode && firstItem.invoiceNo) || isQuanDian) && firstItem.invoiceDate && firstItem.salerTaxNo &&
            firstItem.salerName && firstItem.invoiceAmount && firstItem.totalTaxAmount &&
            (firstItem.invoiceType || firstItem.govInvoiceType) && !isShudianPaper) {
            const gxListDictRes = this.getGxListDict(list, authenticateFlag);
            if (gxListDictRes.errcode !== '0000') {
                return gxListDictRes;
            }

            const gxListDict = gxListDictRes.data;
            const filterData = this.commonfilter(list, list, gxListDict, tokenInfo, authenticateFlag);
            ctx.service.log.info('对参数进行过滤校验', filterData);
            const { findList = [], findFailList = [] } = filterData;
            if (findList.length === 0) {
                return this.getGxResult(taxPeriod, [], findFailList, authenticateFlag);
            }
            realGxList = findList;
            failList = findFailList;
            gxFullInfo.realGxList = findList;
            gxFullInfo.failList = findFailList;
        } else {
            const filterRes = await this.filterByGovQuery(tokenInfo, list, authenticateFlag);
            ctx.service.log.info('退税勾选发票列表通过税局补全', filterRes);
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

        ctx.service.log.info('退税勾选发票列表', gxFullInfo.realGxList);
        const res = await this.tsgxByJsonData(gxFullInfo);
        ctx.service.log.info('退税勾选返回', res);
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
        const saveRes = await ctx.service.invoiceSave.updateFpyGxInfo(success, authenticateFlag, 3, {
            access_token,
            clientType,
            taxNo,
            taxPeriod
        });
        // 后台保存失败
        if (saveRes.errcode !== '0000') {
            ctx.service.log.fullInfo('tsgx save success', success);
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


    // 用途确认
    async tsytComfirm(tokenInfo, fopt = {}, access_token) {
        const ctx = this.ctx;
        let taxPeriod = tokenInfo.taxPeriod;
        const { fpdk_type } = ctx.request.query;
        const { clientType = 4 } = ctx.request.body;
        const taxNo = tokenInfo.taxNo;

        const jsonData = {
            skssq: taxPeriod
        };
        const urlPath = '/ypfw/cktsytqr/v1/ytqr';
        ctx.service.log.info('用途确认 参数', jsonData);
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        ctx.service.log.info('用途确认 返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const res2 = await this.querytsytb(tokenInfo, { taxPeriod, Lsbz: '1' })
        ctx.service.log.info('用途查询 返回', res2);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const { tjInfo } = res2.data
        if (fpdk_type === '4') {
            return {
                ...errcodeInfo.success,
                allowChangeSsqBySeason: false
            };
        }
        if (parseInt(clientType) === 4 && tjInfo) { // 有已经确认用途的票 才保存
            const saveRes = await ctx.service.invoiceSave.gxConfirmSave({ tjInfo, taxPeriod, taxNo }, access_token);
            return saveRes;
        }
        return errcodeInfo.success;
        // return {
        //     ...errcodeInfo.govErr,
        //     description: '勾选确认异常，请稍后再试'
        // };
    }

    // 查询退税统计表
    async querytsytb(tokenInfo, opt) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { isComfirm } = opt;
        const taxPeriod = opt.taxPeriod || tokenInfo.taxPeriod || '';
        if (!taxPeriod || taxPeriod.length !== 6 ) {
            return {
                ...errcodeInfo.argsErr,
                description: '税期参数不能为空或格式错误，正确格式为（YYYYMM）'
            };
        }
        // const jsonData = {
        //     Skssq: taxPeriod,
        //     Lsbz: '01'
        // };
        let Lsbz = '01'; // 已认证
        if (isComfirm && parseInt(isComfirm) === 2) {
            Lsbz = '00'
        }
        const urlPath = `/ypfw/cktsytqr/v1/getTjxx?Skssq=${taxPeriod}&Lsbz=${Lsbz}`;
        ctx.service.log.fullInfo('查询退税用途表 参数 地址', urlPath);
        const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
            dataType: 'json',
            method: 'GET'
        });
        // const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);

        ctx.service.log.fullInfo('查询退税用途表 返回', taxPeriod, res);
        if (res.errcode !== '0000') {
            return res;
        }
        let resData = res.data || [];
        // 可能不是试点数字账号企业

        if (!Array.isArray(resData)) {
            resData = Object.values(resData);
        }
        // const dktjxx = resData.dktjxx || [];
        const { tjInfoArr, tjInfo } = this.getTongArr(resData);
        // 01增值税专用发票，03机动车销售发票，14通行费电子发票，24出口转内销发票，99总计
        ctx.service.log.fullInfo('查询退税用途表 tjInfoArr', tjInfoArr);
        ctx.service.log.fullInfo('查询退税用途表 tjInfo', tjInfo);
        return {
            ...errcodeInfo.success,
            data: {
                taxPeriod: resData.skssq || taxPeriod,
                skssq: tokenInfo.skssq || '',
                gxrqfw: tokenInfo.gxrqfw || '',
                updateTime: '',
                // createTjbbStatus: '05',
                // isAllowQxTj: false, // 当前是否允许取消统计报表
                // isAllowQrtj: false, // 当前是否允许确认签名
                allowChangeSsqBySeason: false, // 按季切换税款所属期标志
                tjInfo: '', // 统计信息 金税盘才有
                tjInfoArr
            }
        };
    }

    // 查询退税统计表
    async queryWqtsytb(tokenInfo, opt) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const taxPeriod = opt.taxPeriod || tokenInfo.taxPeriod || '';
        if (!taxPeriod || taxPeriod.length !== 6 ) {
            return {
                ...errcodeInfo.argsErr,
                description: '税期参数不能为空或格式错误，正确格式为（YYYYMM）'
            };
        }

        const urlPath = `/ypfw/ypcommon/v1/ksqyxx`;
        ctx.service.log.fullInfo('查询退税用途表 参数 地址', urlPath);
        const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
            dataType: 'json',
            method: 'GET'
        });
        return res;
    }

}
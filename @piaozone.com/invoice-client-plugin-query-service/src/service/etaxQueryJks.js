/* eslint-disable no-undef,complexity,max-len */
import { getEtaxListOpt } from '../libs/getListOpt';
import { transDkgxJks, transBdkgxJks, transWdqJks, transDktjJks } from '../libs/etaxTransformJks';
import { getUUId } from '../utils/getUid';

export class EtaxQueryJks extends BaseService {
    async queryInvoices(access_token, tokenInfo = {}, initOpt = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('海关缴款书 请求参数', initOpt);
        const { fpdk_type } = ctx.request.query;
        initOpt = {
            ...initOpt,
            access_token,
            gxrqfw: tokenInfo.gxrqfw
        };

        const optInfo = getEtaxListOpt(initOpt);

        const preOpt = optInfo.opt;
        const preIndex = optInfo.index;
        if (preIndex === -1) {
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

        const queryArgs = ctx.service.etaxQueryInvoices.getQueryArgs(preOpt);
        if (preIndex === -1) {
            return {
                ...errcodeInfo.argsErr,
                queryArgs,
                endFlag: true
            };
        }

        const opt = optInfo.opt;
        const dataFrom = preOpt.dataFrom;
        const continueFlag = typeof initOpt.continueFlag === 'undefined' ? true : initOpt.continueFlag;
        ctx.service.log.info('海关缴款书 请求参数 dataFrom', dataFrom);
        let res;
        if (dataFrom === 'wdqQuery') {
            res = await this.wdqQueryInvoices(tokenInfo, opt);
        } else if (dataFrom === 'dkgxquery') {
            res = await this.dkgxQueryInvoices(tokenInfo, opt);
        } else if (dataFrom === 'dktjQuery') {
            res = await this.dktjQueryInvoices(tokenInfo, opt);
        } else if (dataFrom === 'bdkgxquery') {
            res = await this.bdkgxQueryInvoices(tokenInfo, opt);
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
        // 根据筛选条件删除与查询条件不一致的发票
        const checkTime = (dataFrom === 'dktjQuery' && initOpt.searchOpt.filterByInvoiceDate);
        const filterData = ctx.service.collectCacheTool.filterJks(data, opt.searchOpt, checkTime);
        let saveRes = errcodeInfo.success;
        if (fpdk_type === '3') {
            const taxNo = tokenInfo.taxNo;
            const clientType = initOpt.clientType || 4;
            saveRes = await ctx.service.invoiceSave.saveJks({ ...initOpt, clientType, taxNo }, { errcode, description, data: filterData });
        }

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

    // 还未处理，目前账号没有未到期发票
    async wdqQueryInvoices(tokenInfo, fopt) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        // 当前月与税期相同，不存在未到期发票
        if (moment().format('YYYYMM') === tokenInfo.taxPeriod) {
            return {
                ...errcodeInfo.success,
                data: []
            };
        }

        const startTimeInt = parseInt(opt.startTime.replace(/-/g, ''));
        const endTimeInt = parseInt(opt.endTime.replace(/-/g, ''));
        const curMonthStartInt = parseInt(moment().format('YYYYMM01'));
        // 起止日期不在未到期发票范围内
        if (endTimeInt < curMonthStartInt) {
            return {
                ...errcodeInfo.success,
                data: []
            };
        }

        const curDateInt = parseInt(moment().format('YYYYMMDD'));
        const startDate = startTimeInt > curMonthStartInt ? opt.startTime : moment().format('YYYY-MM-01');
        const endDate = endTimeInt > curDateInt ? moment().format('YYYY-MM-DD') : opt.endTime;

        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        const pageSize = 100;
        const jsonData = {
            Fplb: 'hgjks',
            Fply: [],
            Fplx: [],
            Fppz: [],
            Hgjkshm: opt.customDeclarationNo || '',
            Tdyslx: [],
            Kprqq: '',
            Kprqz: '',
            Tfrqq: startDate,
            Tfrqz: endDate,
            Current: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize,
            Total: 0,
            ShowJumper: true
        };
        const urlPath = '/szzhzz/WdgxrqfpcxController/v1/queryWdgxrqjksxx';
        ctx.service.log.info('wdqQueryInvoices 请求参数', jsonData);
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        ctx.service.log.info('wdqQueryInvoices 请求结果', res);
        if (res.errcode !== '0000') {
            ctx.service.log.info('未到期发票查询异常', jsonData, res);
            return res;
        }
        const resData = res.data || {};
        const { Total = 0, List = [] } = resData || {};
        const listData = transWdqJks(List);
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
        // const taxNo = tokenInfo.taxNo;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        const gxztDm = opt.rzzt || '0';

        const checkRes = await ctx.service.etaxQueryInvoices.getYgxInvoiceAuthenticateFlag(tokenInfo, gxztDm);
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
        const pageSize = 100;
        const jsonData = {
            GxztDm: gxztDm,
            Znxzmbh: '',
            TfrqQ: opt.startTime || '',
            TfrqZ: opt.endTime || '',
            GxrqQ: opt.gxStartTime || '',
            gxrqZ: opt.gxEndTime || '',
            Hgjkshm: opt.customDeclarationNo || '',
            GfsbhArr: [],
            PageNumber: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize
        };
        const urlPath = '/ypfw/dkgx/v1/queryHgws';
        ctx.service.log.info('dkgxQueryInvoices 请求参数', jsonData);
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        ctx.service.log.info('dkgxQueryInvoices 请求结果', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || {};
        const { Total = 0, List = [] } = resData || {};
        const listData = transDkgxJks(List, tokenInfo.taxPeriod, {}, tongjiIsConfirm);
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
        // const taxNo = tokenInfo.taxNo;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        const gxztDm = opt.rzzt || '0';

        const checkRes = await ctx.service.etaxQueryInvoices.getYgxInvoiceAuthenticateFlag(tokenInfo, gxztDm);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const tongjiIsConfirm = checkRes.data === 2;

        const pageSize = opt.pageSize || 100;

        const jsonData = {
            GxztDm: gxztDm,
            Znxzmbh: '',
            Jkshm: opt.customDeclarationNo || '',
            Tfrqq: opt.startTime,
            Tfrqz: opt.endTime,
            GfsbhArr: [],
            PageNumber: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize
        };
        const urlPath = '/ypfw/bdkgx/v1/hgxxcx';
        ctx.service.log.info('bdkgxQueryInvoices 请求参数', jsonData);
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        ctx.service.log.info('bdkgxQueryInvoices 请求结果', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Total = 0, List = [] } = resData || {};
        // 需要提取原始数据
        if (returnOriginData) {
            return res;
        }

        const listData = transBdkgxJks(List, tokenInfo.taxPeriod, {}, tongjiIsConfirm);
        return {
            ...errcodeInfo.success,
            data: listData,
            totalNum: Total,
            nextDataIndex: dataIndex + List.length
        };
    }

    // 已认证抵扣统计的发票
    async dktjQueryInvoices(tokenInfo, fopt, znxpz, prevData) {
        const ctx = this.ctx;
        const opt = fopt.searchOpt || {};
        let dataIndex = fopt.dataIndex || 0;
        dataIndex = parseInt(dataIndex);
        if (!opt.rzssq) {
            return errcodeInfo.argsErr;
        }

        const continueFlag = fopt.continueFlag;
        const { rzssq = '', authenticateFlags } = opt;
        const checkRes = await ctx.service.etaxQueryInvoices.checkDktjHasData(tokenInfo, { continueFlag, rzssq, authenticateFlags });
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

        const pageSize = 200;
        // {"FjgGfsbh":"","Gfsbh":"","Skssq":"202406","Fplxbz":"8","isTotal":true,"title":"合计","tableType":"deduction","deductionType":"1","PageNumber":1,"PageSize":50,"Qrqcbz":"0","jkshm":"","gxrzsjq":"","gxrzsjz":"","znxpz":"N","jkdwSh":""}
        const jsonData = {
            FjgGfsbh: '',
            Gfsbh: '',
            Skssq: rzssq,
            PageNumber: Math.floor(dataIndex / pageSize) + 1,
            PageSize: pageSize,
            IsTotal: true,
            Title: '合计',
            TableType: 'deduction',
            DeductionType: '1',
            Jkshm: opt.customDeclarationNo || '',
            Znxzmbh: '',
            Gxrzsjq: '',
            Gxrzsjz: '',
            JkdwSh: '',
            znxpz: znxpz || 'N',
            Fplxbz: '8'
        };
        const urlPath = '/ypfw/ytqr/v1/hgxxcx';
        ctx.service.log.info('dktjQueryInvoices 查询参数', jsonData);
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        if (res.errcode !== '0000') {
            return res;
        }
        ctx.service.log.info('dktjQueryInvoices 查询结果', res);
        if (!znxpz && res.data) {
            return this.dktjQueryInvoices(tokenInfo, fopt, 'Y', res.data);
        }
        const TotalN = prevData.Total || 0;
        const ListN = prevData.List || [];

        const resData = res.data || {};
        const { Total = 0, List = [] } = resData || {};
        const allList = ListN;
        for (let i = 0; i < List.length; i++) {
            const { Jkshm } = List[i];
            if (!allList.find((item) => item.Jkshm === Jkshm)) {
                allList.push(List[i]);
            }
        }

        const listData = transDktjJks(allList, opt.rzssq);
        return {
            ...errcodeInfo.success,
            data: listData,
            totalNum: Total + TotalN,
            nextDataIndex: dataIndex + allList.length
        };
    }
}
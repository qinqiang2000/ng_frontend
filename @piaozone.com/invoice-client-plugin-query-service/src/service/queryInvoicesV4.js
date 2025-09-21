/* eslint-disable no-undef,comma-dangle,spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda,max-len,object-curly-spacing,key-spacing,comma-spacing,quotes */
// import errcodeInfo from '$client/errcodeInfo';
// import { BaseService } from './baseService';
import { getListOptV4 } from '../libs/getListOpt';
import { dkgxQueryTransformData, lssqTransformData, bdkgxQueryTransformData, dpTransformData, wdqTransformData } from '../libs/transformInvoice';
import handleResult from '../libs/handleResult';
import { computeInvoicesInfo, aoDataDict } from '../libs/tools';
import { zfLoginedCachePreKey } from '../constant';
// import pwyStore from '$client/electronStore';
// import moment from 'moment';
// import { hex_md5 } from '../libs/md5';

export class QueryInvoicesV4 extends BaseService {
    getQueryArgs(preOpt) {
        return {
            searchOpt: preOpt.searchOpt,
            dataFrom: preOpt.dataFrom,
            dataFromIndex: preOpt.index,
            dataIndex: preOpt.dataIndex,
            name: preOpt.name
        };
    }

    async getInvoicePublicData(taxNo) {
        const cacheInfo = pwyStore.get(zfLoginedCachePreKey + taxNo);
        const otherInfo = {
            buyerName: cacheInfo.companyName,
            buyerTaxNo: taxNo
        };
        return otherInfo;
    }

    // 未到期发票查询
    async wdqQuery(userInfo = {}, opt, disabledCache) {
        const ctx = this.ctx;
        let result;
        const { taxNo, skssq } = userInfo;
        const { dataIndex, searchOpt } = opt;
        const skssqs = skssq.split(';');
        if (skssqs[0] === moment().format('YYYYMM')) {
            ctx.service.log.info('当前月与税期在同一个月，不存在未到期发票');
            return {
                errcode: '0000',
                totalNum: 0,
                data: [],
                invoiceInfo: computeInvoicesInfo([])
            };
        }

        const pageSize = searchOpt.pageSize || ctx.app.config.queryInvoicesPageSize;
        let curIndex = dataIndex || 0;

        const searchParam = {
            fphm: searchOpt.fphm || '',
            fpdm: searchOpt.fpdm || '',
            kprq_q: searchOpt.kprq_q || searchOpt.rq_q,
            kprq_z: searchOpt.kprq_z || searchOpt.rq_z,
            cxfw: searchOpt.cxfw || '0', // 查询范围0为增值税发票, 目前只支持0的类型
            cert: taxNo,
            ycfpbs: -1, // 新增风险状态字段
            /* eslint-disable-next-line */
            aoData: JSON.stringify([{ name: 'sEcho', value: 1 }, { name: 'iColumns', value: 9 }, { name: 'sColumns', value: ',,,,,,,,' }, { name: 'iDisplayStart', value: curIndex }, { name: 'iDisplayLength', value: pageSize }, { name: 'mDataProp_0', value: 0 }, { name: 'mDataProp_1', value: 1 }, { name: 'mDataProp_2', value: 2 }, { name: 'mDataProp_3', value: 3 }, { name: 'mDataProp_4', value: 4 }, { name: 'mDataProp_5', value: 5 }, { name: 'mDataProp_6', value: 6 }, { name: 'mDataProp_7', value: 7 }, { name: 'mDataProp_8', value: 8 }]),
            fply: searchOpt.fply || 0 // 默认查询0、税控发票，1、数电票，-1，全部类型
        };

        // 缓存路径
        const cacheFilePath = ctx.service.tools.getCachePath(taxNo, 'wdqQuery_' + hex_md5(JSON.stringify(searchParam)));
        // 获取缓存结果，60分钟是否有效，无效则自动删除
        const cacheResult = ctx.service.tools.getCacheResult(cacheFilePath, 60 * 60 * 1000, disabledCache);
        if (cacheResult) {
            ctx.service.log.info('直接提取未到期缓存数据');
            return cacheResult;
        }

        const publicKeyRes = await ctx.service.fpdkRequest.curl(taxNo, '/querymm.do', {
            data: {
                cert: taxNo,
                funType: '03'
            },
            method: 'POST',
            tokenKey: 'none'
        });

        if (publicKeyRes.errcode !== '0000') {
            ctx.service.log.info('未到期发票查询，quermm接口异常返回', publicKeyRes);
            return publicKeyRes;
        }

        const { publickey, ts } = publicKeyRes.data;
        searchParam.ts = ts;
        searchParam.publickey = publickey;
        const resCollect = await ctx.service.fpdkRequest.curl(taxNo, '/wdqcx.do', {
            method: 'POST',
            data: searchParam,
            tokenKey: 'key3'
        });
        ctx.service.log.fullInfo('未到期发票查询，税局返回', resCollect);
        if (resCollect.errcode !== '0000') {
            ctx.service.log.info('未到期发票查询异常，请求税局参数', searchParam);
            return resCollect;
        }
        const jsonData = resCollect.data;
        const key1 = jsonData.key1;
        if (key1 === '200') {
            const key2 = jsonData.key2;
            if (key2) {
                const invoiceData = key2.aaData;
                const invoiceDataLen = invoiceData.length;
                const datas = [];
                if (invoiceDataLen > 0) {
                    const otherInfo = await this.getInvoicePublicData(taxNo);
                    for (let i = 0; i < invoiceDataLen; i++) {
                        const item = wdqTransformData(invoiceData[i], otherInfo);
                        datas.push(item);
                    }
                    curIndex += invoiceDataLen;
                }
                const totalNum = key2.iTotalRecords;
                result = {
                    errcode: '0000',
                    description: 'success',
                    nextDataIndex: curIndex,
                    totalNum,
                    data: datas,
                    invoiceInfo: computeInvoicesInfo(datas)
                };
                ctx.service.tools.cacheResult(cacheFilePath, result);
            } else {
                result = { ...errcodeInfo.govErr };
            }
        } else {
            result = handleResult(jsonData);
        }

        //如果采集发票为空，尝试重新获取三次
        if (result.errcode !== '0000') {
            ctx.service.log.info('未到期发票查询异常, 请求税局参数：', searchParam);
        }
        return result;
    }

    //不抵扣勾选
    async bdkgxquery(userInfo = {}, opt) {
        const ctx = this.ctx;
        const { taxNo, skssq, gxrqfw } = userInfo;
        const { dataIndex, searchOpt } = opt;
        const pageSize = searchOpt.pageSize || ctx.app.config.queryInvoicesPageSize;
        let curIndex = dataIndex || 0;
        let result = { ...errcodeInfo.govErr, data: [] };
        const curDateStr = +new Date() + '';
        const gxrqfws = gxrqfw.split('-');
        const minDate = moment(gxrqfws[0], 'YYYYMMDD');
        const maxDate = moment(gxrqfws[1], 'YYYYMMDD');

        const rzzt = parseInt(searchOpt.rzzt);
        ctx.service.log.info('不抵扣勾选 bdkgxquery 开始');
        if (rzzt === 1) {
            const tempMinDate = moment().subtract(1, 'months').format('YYYYMM01');
            const curIntEndDate = parseInt(searchOpt.rq_z.replace(/-/g, ''));
            // 已勾选发票勾选日期最大为前一个
            if (curIntEndDate < parseInt(tempMinDate)) {
                ctx.service.log.info('根据勾选日期判断不抵扣已勾选发票不存在', searchOpt.rq_z, tempMinDate);
                result = {
                    errcode: '0000',
                    description: 'success',
                    nextDataIndex: curIndex,
                    totalNum: 0,
                    data: [],
                    invoiceInfo: computeInvoicesInfo([])
                };
                return result;
            }
        }

        //不抵扣勾选只能收取前一个税期的发票
        let rq_q = searchOpt.rq_q;
        let rq_z = searchOpt.rq_z;

        if (rzzt === 0) {
            if (!rq_q || (rq_q && moment(rq_q, 'YYYY-MM-DD').format('X') < minDate.format('X'))) {
                rq_q = minDate.format('YYYY-MM-DD');
            }

            if (!rq_z || (rq_z && moment(rq_z, 'YYYY-MM-DD').format('X') > maxDate.format('X'))) {
                rq_z = maxDate.format('YYYY-MM-DD');
            }
        }

        let glzt = searchOpt.glzt;
        // if (typeof glzt === 'undefined' || glzt === -1 || glzt === '-1') { // -1全部， 0 正常，1 非正常， 2 疑点发票
        //     glzt = '0'; // 全部
        // } else if (parseInt(glzt) === 0) { // 正常
        //     glzt = '1';
        // } else if (parseInt(glzt) === 1) { // 异常
        //     glzt = '2';
        // }
        if (typeof glzt === 'undefined' || glzt === -1 || glzt === '-1') { // -1全部， 0 正常，1 非正常， 2 疑点发票
            glzt = '-1'; // 全部
        } else if (parseInt(glzt) === 0) { // 正常
            glzt = '0';
        } else if (parseInt(glzt) === 1) { // 异常
            glzt = '1';
        }

        let fphm = searchOpt.fphm || '';
        let fpdm = searchOpt.fpdm || '';
        let fply = searchOpt.fply || -1; // -1 全部 1 数电票，0 税控发票
        if (fphm.length === 20) {
            fpdm = fphm.slice(0, 12); // 数电票代码取前面12位
            fphm = fphm.slice(12); // 数电号码截取后面8位
            fply = 1;
        }

        const searchParam = {
            method: 'fpquery',
            fphm, //: searchOpt.fphm || '',
            fpdm, //: searchOpt.fpdm || '',
            rq_q: rq_q, //未认证时为开始开票日期，已认证时为开始确认或扫描日期
            rq_z: rq_z, //未认证时为结束开票日期，已认证时为结束确认或扫描日期
            xfsbh: searchOpt.xfsbh || '', //销方税号
            // fpzt: searchOpt.fpzt || '-1', //-1全部，0正常，2作废，4异常，1失控，3红冲，5、认证异常, 税局没有这个字段，暂时屏蔽
            fplx: searchOpt.fplx || '-1', //-1全部，01增值税专用发票，02货运专用发票，03机动车发票，14通行费发票
            rzzt: searchOpt.rzzt || '0', //0未认证/未勾选，1已认证/已勾选
            glzt, //管理状态, 不抵扣勾选, 0为全部，1为正常, 2异常
            cert: taxNo,
            ycfpbs: -1, // 新增风险状态字段
            gfsbh: taxNo,
            /* eslint-disable-next-line */
            aoData: JSON.stringify([{ name: 'sEcho', value: 1 }, { name: 'iColumns', value: 14 }, { name: 'sColumns', value: ',,,,,,,,,,,,,' }, { name: 'iDisplayStart', value: curIndex }, { name: 'iDisplayLength', value: pageSize }, { name: 'mDataProp_0', value: 0 }, { name: 'mDataProp_1', value: 1 }, { name: 'mDataProp_2', value: 2 }, { name: 'mDataProp_3', value: 3 }, { name: 'mDataProp_4', value: 4 }, { name: 'mDataProp_5', value: 5 }, { name: 'mDataProp_6', value: 6 }, { name: 'mDataProp_7', value: 7 }, { name: 'mDataProp_8', value: 8 }, { name: 'mDataProp_9', value: 9 }, { name: 'mDataProp_10', value: 10 }, { name: 'mDataProp_11', value: 11 }, { name: 'mDataProp_12', value: 12 }, { name: 'mDataProp_13', value: 13 }]),
            sjly: searchOpt.sjly || -1, // -1 全部 0 扫描认证 1系统推送 3异常凭证转入
            fply //: searchOpt.fply || 0 // -1 全部 1 数电票，0 税控发票
        };

        searchParam.rtm = curDateStr;
        ctx.service.log.info('不抵扣统计查询参数', searchParam);
        const resCollect = await ctx.service.fpdkRequest.curl(taxNo, '/bdkgx.do', {
            method: 'POST',
            data: searchParam
        });
        ctx.service.log.fullInfo('不抵扣勾选查询税局返回', resCollect);
        if (resCollect.errcode !== '0000') {
            ctx.service.log.info('不抵扣勾选查询异常，请求税局参数', searchParam);
            return resCollect;
        }

        const jsonData = resCollect.data;
        const key1 = jsonData.key1;
        if (key1 == '200') {
            const key3 = jsonData.key3;
            if (key3) {
                const invoiceData = key3.aaData;
                const invoiceDataLen = invoiceData.length;
                const datas = [];

                if (invoiceDataLen > 0) {
                    const otherInfo = await this.getInvoicePublicData(taxNo);
                    for (let i = 0; i < invoiceDataLen; i++) {
                        const item = bdkgxQueryTransformData(invoiceData[i], skssq, otherInfo);
                        datas.push(item);
                    }
                    curIndex += invoiceDataLen;
                }
                const totalNum = key3.iTotalRecords;
                result = {
                    errcode: '0000',
                    description: 'success',
                    nextDataIndex: curIndex,
                    totalNum,
                    data: datas,
                    invoiceInfo: computeInvoicesInfo(datas)
                };
            } else {
                result = { ...errcodeInfo.govErr };
            }
        } else {
            result = handleResult(jsonData);
        }

        if (result.errcode !== '0000') {
            ctx.service.log.info('不抵扣勾选查询异常, 请求税局参数：', searchParam);
        }
        return result;
    }

    async dkgxquery(userInfo = {}, opt) {
        const ctx = this.ctx;
        const curDateStr = +new Date() + '';
        const { skssq, gxrqfw, taxNo } = userInfo;
        const { dataIndex, searchOpt } = opt;
        const pageSize = searchOpt.pageSize || ctx.app.config.queryInvoicesPageSize;
        let curIndex = dataIndex || 0;
        let result = { ...errcodeInfo.govErr, data: [] };
        const gxrqfws = gxrqfw.split('-');
        const minDate = moment(gxrqfws[0], 'YYYYMMDD');
        const maxDate = moment(gxrqfws[1], 'YYYYMMDD');
        const rzzt = parseInt(searchOpt.rzzt);
        ctx.service.log.info('抵扣统计 dkgxquery 开始');

        if (rzzt === 1) {
            const tempMinDate = moment().subtract(1, 'months').format('YYYYMM01');
            const curIntEndDate = parseInt(searchOpt.rq_z.replace(/-/g, ''));
            // 已勾选发票勾选日期最大为前一个
            if (curIntEndDate < parseInt(tempMinDate)) {
                ctx.service.log.info('根据勾选日期判断已勾选发票不存在', searchOpt.rq_z, tempMinDate);
                result = {
                    errcode: '0000',
                    description: 'success',
                    nextDataIndex: curIndex,
                    totalNum: 0,
                    data: [],
                    invoiceInfo: computeInvoicesInfo([])
                };
                return result;
            }
        }

        //抵扣勾选只能收取前一个税期的发票
        let rq_q = searchOpt.rq_q;
        let rq_z = searchOpt.rq_z;

        if (rzzt === 0) {
            if (!rq_q || (rq_q && moment(rq_q, 'YYYY-MM-DD').format('X') < minDate.format('X'))) {
                rq_q = minDate.format('YYYY-MM-DD');
            }

            if (!rq_z || (rq_z && moment(rq_z, 'YYYY-MM-DD').format('X') > maxDate.format('X'))) {
                rq_z = maxDate.format('YYYY-MM-DD');
            }
        }
        let fply = searchOpt.fply || 0;
        if (searchOpt.invoiceType == 27) {
            fply = 1;
        } else if (!searchOpt.invoiceType || searchOpt.invoiceType === -1) {
            fply = -1;
        }

        let fplx = searchOpt.fplx || '-1';
        if (searchOpt.invoiceType == 27) {
            fplx = '08';
        } else if (fplx === '31') {
            fplx = '08';
        }

        // ctx.service.log.info('抵扣勾选查询 发票来源', fply, searchOpt.invoiceType, fplx);
        let fphm = searchOpt.fphm || '';
        let fpdm = searchOpt.fpdm || '';
        if (fphm.length === 20) {
            fpdm = fphm.slice(0, 12); // 数电票代码取前面12位
            fphm = fphm.slice(12); // 数电号码截取后面8位
            fply = 1;
        }
        const searchParam = {
            id: 'dkgxquery',
            fphm, //: searchOpt.fphm || '',
            fpdm, //: searchOpt.fpdm || '',
            rq_q: rq_q, //未认证时为开始开票日期，已认证时为开始确认或扫描日期
            rq_z: rq_z, //未认证时为结束开票日期，已认证时为结束确认或扫描日期
            // yqzt: searchOpt.yqzt || '-1', //本征收期后逾期 -1全部，0逾期，1未逾期
            xfsbh: searchOpt.xfsbh || '', //销方税号
            fpzt: typeof searchOpt.fpzt === 'undefined' ? '-1' : searchOpt.fpzt, //-1全部，0正常，2作废，4异常，1失控，3红冲，5、认证异常
            fplx, // : searchOpt.fplx || '-1', //-1全部，01增值税专用发票，03机动车发票，14通行费发票, 08xdp 电子发票（增值税专用发票）, 08 增值税电子专用发票
            rzzt: searchOpt.rzzt || '0', //抵扣勾选界面是通过rzzt来控制是否勾选
            glzt: (typeof searchOpt.glzt === 'undefined' || searchOpt.glzt === '') ? '-1' : searchOpt.glzt, //管理状态
            cert: taxNo,
            sjly: searchOpt.sjly || -1, // -1 全部 0 扫描认证 1系统推送 3异常凭证转入
            fply, //: searchOpt.fply || 0, // -1 默认全部， 1 数电票，0税控发票
            aoData: aoDataDict.dkgxquery(curIndex, pageSize),
            ycfpbs: -1, // 新增风险状态字段
            gfsbh: ''
        };

        searchParam.rtm = curDateStr;
        ctx.service.log.info('抵扣勾选查询参数', searchParam);
        const resCollect = await ctx.service.fpdkRequest.curl(taxNo, '/dkgx.do', {
            method: 'POST',
            data: searchParam
        });
        ctx.service.log.fullInfo('抵扣勾选查询税局返回', resCollect);
        if (resCollect.errcode !== '0000') {
            ctx.service.log.info('抵扣勾选异常，税局请求参数', searchParam);
            return resCollect;
        }
        const jsonData = resCollect.data;

        const key1 = jsonData.key1;
        if (key1 == '200') {
            const key3 = jsonData.key3;
            if (key3) {
                const invoiceData = key3.aaData;
                const invoiceDataLen = invoiceData.length;
                const datas = [];

                if (invoiceDataLen > 0) {
                    const otherInfo = await this.getInvoicePublicData(taxNo);
                    for (let i = 0; i < invoiceDataLen; i++) {
                        const item = dkgxQueryTransformData(invoiceData[i], skssq, otherInfo);
                        datas.push(item);
                    }
                    curIndex += invoiceDataLen;
                }

                const totalNum = key3.iTotalRecords;
                result = {
                    errcode: '0000',
                    description: 'success',
                    nextDataIndex: curIndex,
                    totalNum,
                    data: datas,
                    invoiceInfo: computeInvoicesInfo(datas)
                };
            } else {
                result = { ...resCollect };
            }
        } else {
            result = handleResult(jsonData);
        }

        if (result.errcode !== '0000') {
            ctx.service.log.info('抵扣勾选查询异常, 税局请求参数：', searchParam);
        }
        return result;
    }


    async dktjQuery(userInfo = {}, opt = {}) {
        const ctx = this.ctx;
        const { skssq, taxNo } = userInfo;
        const { dataIndex, searchOpt } = opt;
        const id = searchOpt.id || 'dkmx';
        const pageSize = searchOpt.pageSize || ctx.app.config.queryInvoicesPageSize;
        let result = { ...errcodeInfo.govErr, data: [] };
        let curIndex = dataIndex || 0;
        let totalNum = 0;
        const rq_q = searchOpt.rq_q;
        const optTjyf = searchOpt.tjyf;

        let tjyf = optTjyf;
        if (!tjyf) {
            tjyf = rq_q ? moment(rq_q, 'YYYY-MM-DD').format('YYYYMM') : moment().format('YYYYMM');
        }

        if (parseInt(tjyf) < 201910) { //小于201910税局不支持查询，直接返回为空
            return {
                errcode: '0000',
                description: 'success',
                nextDataIndex: 0,
                // govToken: govToken,
                totalNum: 0,
                data: [],
                invoiceInfo: computeInvoicesInfo([])
            };
        }
        const qt = (tjyf === skssq.substr(0, 6) ? 'dq' : 'wq'); // 当前和往期
        let fphm = searchOpt.fphm || '';
        let fpdm = searchOpt.fpdm || '';
        let fly = searchOpt.fpy || -1;
        if (fphm.length === 20) {
            fpdm = fphm.slice(0, 12); // 数电票代码取前面12位
            fphm = fphm.slice(12); // 数电号码截取后面8位
        }
        if (fphm.length === 20 || Number(searchOpt.invoiceType) === 27) {
            fly = 1;
        }
        const searchParam = {
            id: id,
            cert: taxNo,
            tjyf,
            fpdm, //: searchOpt.fpdm || '',
            fphm, //: searchOpt.fphm || '',
            qt: qt,
            fly, //: searchOpt.fpy || 0, // 发票来源 -1 全部，1 数电票 0 税控发票
            aoData: aoDataDict[id](curIndex, pageSize)
        };

        if (id === 'dkmx') {
            searchParam.xfsbh = searchOpt.xfsbh || '';
            searchParam.qrrzrq_q = searchOpt.qrrzrq_q || '';
            searchParam.qrrzrq_z = searchOpt.qrrzrq_z || '';
            searchParam.fply = searchOpt.fply || '0'; //0全部，1抵扣，2不抵扣
        } else if (id === 'ckznxmx') {
            searchParam.zmbh = searchOpt.zmbh || '';
            searchParam.xfsbh = searchOpt.xfsbh || '';
            searchParam.qrrzrq_q = searchOpt.qrrzrq_q || '';
            searchParam.qrrzrq_z = searchOpt.qrrzrq_z || '';
            searchParam.fply = searchOpt.fply || '0';
        } else if (id === 'dkycfpmx') {
            searchParam.kprq_q = searchOpt.kprq_q || '';
            searchParam.kprq_z = searchOpt.kprq_z || '';
        } else if (id === 'dkycckznxfpmx') {
            searchParam.zmbh = searchOpt.zmbh || '';
            searchParam.kprq_q = searchOpt.kprq_q || '';
            searchParam.kprq_z = searchOpt.kprq_z || '';
        }

        let cacheFilePath;
        // 往期已认证才查询缓存
        if (qt === 'wq') {
            // 缓存路径
            cacheFilePath = ctx.service.tools.getCachePath(taxNo, 'wqdktj_' + hex_md5(JSON.stringify(searchParam)));
            const maxCacheTime = 24 * 60 * 60 * 1000;
            const cacheResult = ctx.service.tools.getCacheResult(cacheFilePath, maxCacheTime);
            if (cacheResult) {
                ctx.service.log.info('直接提取抵扣统计缓存数据', cacheFilePath);
                return cacheResult;
            }
        }

        ctx.service.log.info('抵扣统计查询参数', searchParam);
        const resCollect = await ctx.service.fpdkRequest.curl(taxNo, '/dktj.do', {
            method: 'POST',
            data: searchParam
        });
        ctx.service.log.fullInfo('抵扣统计查询税局返回', resCollect);
        if (resCollect.errcode !== '0000') {
            ctx.service.log.info('抵扣统计查询异常, 请求税局参数：', searchParam);
            return resCollect;
        }

        const jsonData = resCollect.data;
        const key1 = jsonData.key1;
        if (key1 === '200') {
            const invoiceData = jsonData.key3.aaData;
            const invoiceDataLen = invoiceData.length;
            const datas = [];
            const otherInfo = await this.getInvoicePublicData(taxNo);
            for (let i = 0; i < invoiceDataLen; i++) {
                const item = lssqTransformData(invoiceData[i], tjyf, otherInfo);
                datas.push(item);
            }

            curIndex += invoiceDataLen;
            totalNum = jsonData.key3.iTotalRecords;
            result = {
                errcode: '0000',
                description: 'success',
                confirmStatus: 1, // 已确认
                nextDataIndex: curIndex,
                totalNum,
                data: datas,
                invoiceInfo: computeInvoicesInfo(datas)
            };
            if (qt === 'wq') {
                ctx.service.tools.cacheResult(cacheFilePath, result);
            }
        } else if (key1 === 'n4501122') { // 只允许确认后查看数据
            result = {
                errcode: '0000',
                confirmStatus: 2, // 未确认
                description: 'success',
                nextDataIndex: 0,
                totalNum: 0,
                data: [],
                invoiceInfo: computeInvoicesInfo([])
            };
        } else {
            result = handleResult(jsonData);
        }

        if (result.errcode !== '0000') {
            ctx.service.log.info('抵扣统计查询异常, 请求税局参数：', searchParam);
        }

        return result;
    }

    // 单票查询
    async queryByfpdmFphm(userInfo, opt) {
        const ctx = this.ctx;
        let result;
        const { taxNo, skssq } = userInfo;
        const publicKeyRes = await ctx.service.fpdkRequest.curl(taxNo, '/querymm.do', {
            data: {
                cert: taxNo,
                funType: '03'
            },
            method: 'POST',
            tokenKey: 'none'
        });
        ctx.service.log.info('单张查询税局querymm接口返回', publicKeyRes);
        if (publicKeyRes.errcode !== '0000') {
            return publicKeyRes;
        }

        const curDateStr = +new Date() + '';
        let fply = opt.fply || 0;
        if (opt.fphm.length === 20) {
            fply = 1;
        }
        const searchParam = {
            fply: fply || 0, // 1，数电票，0税控发票
            fphm: fply === 0 ? opt.fphm : opt.fphm.slice(12), // 数电截取后面8位
            fpdm: fply === 0 ? opt.fpdm : opt.fphm.slice(0, 12), // 数电票取前面12位
            // fpdm: fply === 0 ? opt.fpdm : '', // 数电票不需要传入发票代码
            cxfw: opt.cxfw || '0', // 查询范围0为增值税发票, 1海关缴款书
            cert: taxNo,
            ssq: skssq.substr(0, 6),
            aoData: JSON.stringify([{"name":"sEcho","value":1},{"name":"iColumns","value":8},{"name":"sColumns","value":",,,,,,,"},{"name":"iDisplayStart","value":0},{"name":"iDisplayLength","value":50},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7}]),
            rtm: curDateStr
        };
        const resCollect = await ctx.service.fpdkRequest.curl(taxNo, '/dpcx.do', {
            method: 'POST',
            tokenKey: 'key3',
            data: searchParam
        });
        ctx.service.log.info('单张查询税局返回', resCollect);
        if (resCollect.errcode !== '0000') {
            ctx.service.log.info('单张查询异常, 请求税局参数：', searchParam);
            return resCollect;
        }

        const jsonData = resCollect.data;
        const key1 = jsonData.key1;
        if (key1 === '200') {
            const invoiceData = jsonData.key2.split('=') || [];
            const otherInfo = await this.getInvoicePublicData(taxNo);
            const resData = jsonData.key2 ? [dpTransformData(invoiceData, otherInfo)] : [];
            result = {
                errcode: resData.length > 0 ? '0000' : '95103',
                description: resData.length > 0 ? 'success' : '未查询到该发票',
                data: resData
            };
        } else {
            result = handleResult(jsonData);
        }
        ctx.service.log.info('单张查询 解析', result);
        if (result.errcode !== '0000') {
            ctx.service.log.info('单张查询异常, 请求税局参数：', searchParam);
            return result;
        }

        const saveRes = await ctx.service.invoiceSave.saveCommons({
            taxNo,
            clientType: 4
        }, result);

        if (saveRes.errcode !== '0000') {
            ctx.service.log.info('单张查询入库异常, 后台返回', saveRes);
            return saveRes;
        }
        return result;
    }

    async queryInvoices(userInfo, initOpt) {
        const ctx = this.ctx;
        ctx.service.log.info('税盘 表头请求参数 plugin initOpt ---', initOpt);
        const optInfo = getListOptV4(initOpt);
        ctx.service.log.info('税盘 表头请求参数 plugin optInfo ---', optInfo);
        const preOpt = optInfo.opt;
        const preIndex = optInfo.index;
        const { clientType = 4 } = initOpt;

        const queryArgs = this.getQueryArgs(preOpt);
        if (preIndex === -1) {
            return {
                ...errcodeInfo.argsErr,
                queryArgs,
                endFlag: true
            };
        }

        const opt = optInfo.opt;
        const searchOpt = opt.searchOpt || {};
        const dataFrom = preOpt.dataFrom;
        const continueFlag = typeof initOpt.continueFlag === 'undefined' ? true : initOpt.continueFlag;
        let isSingleQuery = false;
        let res;
        ctx.service.log.info('勾选数据查询当前类型及参数', dataFrom, opt);
        if (searchOpt.fpdm && searchOpt.fphm) {
            isSingleQuery = true;
            res = await ctx.service.queryInvoicesV4.queryByfpdmFphm(userInfo, {
                fpdm: searchOpt.fpdm,
                fphm: searchOpt.fphm,
                fply: searchOpt.fply
            });
        } else if (dataFrom === 'dkgxquery') {
            res = await ctx.service.queryInvoicesV4.dkgxquery(userInfo, opt);
        } else if (dataFrom === 'bdkgxquery') {
            res = await ctx.service.queryInvoicesV4.bdkgxquery(userInfo, opt);
        } else if (dataFrom === 'dktjQuery') {
            res = await ctx.service.queryInvoicesV4.dktjQuery(userInfo, opt);
        } else if (dataFrom === 'wdqQuery') {
            res = await ctx.service.queryInvoicesV4.wdqQuery(userInfo, opt);
        } else {
            return {
                ...errcodeInfo.argsErr,
                queryArgs,
                endFlag: true
            };
        }

        const { nextDataIndex = 0, totalNum = 0, data, errcode, description } = res;
        const taxNo = userInfo.taxNo;

        ctx.service.log.info('QueryInvoicesV4.queryInvoices--', res);
        let filterList = [];
        if (Array.isArray(data)) {
            filterList = [...data];
        }

        // 税局个别模块不支持部分参数过滤，使用自定义过滤
        if (res.errcode === '0000') {
            let checkTime = false;
            // 根据开票日期过滤
            if (searchOpt.filterByInvoiceDate) {
                checkTime = true;
            }
            const filterData = ctx.service.collectCacheTool.filterInvoices(data, initOpt.searchOpt, checkTime);
            filterList = [...filterData];
        }

        const saveRes = await ctx.service.invoiceSave.saveCommons({
            ...initOpt,
            clientType,
            taxNo
        }, {
            errcode,
            description,
            data: filterList
        });

        const nextOptInfo = getListOptV4(initOpt, true, { errcode: saveRes.errcode, nextDataIndex, totalNum });
        // 连续标志为false, 下一个分页为-1，税局登录失效, 单张查询则endFlag标志为true
        const endFlag = !continueFlag || nextOptInfo.index === -1 || errcode === '91300' || isSingleQuery;

        return {
            ...res,
            data: filterList,
            serialNo: saveRes.serialNo,
            startTime: saveRes.startTime,
            errcode: saveRes.errcode,
            description: saveRes.description,
            nextDataFromIndex: nextOptInfo.index,
            nextDataIndex: nextOptInfo.index === preIndex ? nextDataIndex : 0,
            queryArgs,
            endFlag
        };
    }
}
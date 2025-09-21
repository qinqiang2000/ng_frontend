
// import { BaseService } from './baseService';
// import errcodeInfo from '$client/errcodeInfo';
// import { getUrlYzm } from '$utils/tools';
// import moment from 'moment';

/*eslint-disable*/
export class EtaxGxConfirm extends BaseService {
    getTongArrNew(dktjxx) {
        const tjInfoArr = [];
        const tjInfoDict = {};
        for (let i = 0; i < dktjxx.length; i++) {
            const { Fplx, Hjfs, Sehj, Hjje } = dktjxx[i];
            const { fplx = Fplx, hjfs = Hjfs, sehj = Sehj, hjje = Hjje} = dktjxx[i];
            if (fplx === '0') { // 增值税专用发票
                tjInfoDict['k01'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '4',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            }  if (fplx === '1') { // 农产品 收购发票 : 数电票（普通发票）、数电票（普通发票）
                // tjInfoDict['k31'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '41',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } if (fplx === '2') { // 农产品销售发票：免税自产农产品普通发票:  增值税电子普通发票、数电票（普通发票）
                // tjInfoDict['k31'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '42',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '3') { // 通行费
                tjInfoDict['k14'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '15',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '4') { // 其他普通发票
                // tjInfoDict['k14'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '44',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '5') { // 机动车
                tjInfoDict['k03'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '12',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '6') { // 缴款书
                tjInfoDict['k21'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '21',
                    deductibleNum: hjfs,
                    deductibleAmount: 0,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '7') { // 代扣代缴完税凭证
                // tjInfoDict['k14'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '47',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '21') { // 航空运输电子客票行程单
                // tjInfoDict['k14'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '28',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '22') { // 数电票（铁路电子客票）
                // tjInfoDict['k14'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '29',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '8') { // 合计
                tjInfoDict['k99'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '99',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            }
        }
        const sortKeys = ['01', '03', '14', '21', '24', '99'];
        let tjInfo = '';
        if (tjInfoArr.length > 0) {
            tjInfo = [];
            for (let i = 0; i < sortKeys.length; i++) {
                const curKey = sortKeys[i];
                const curData = tjInfoDict['k' + curKey];
                if (curData) {
                    tjInfo.push(curKey + '=' + curData);
                } else {
                    tjInfo.push(curKey + '=0=0=0=0=0');
                }
            }
            tjInfo = tjInfo.join(';') + ';';
        }

        return {
            tjInfoArr,
            tjInfo
        };
    }
    getTongArr(dktjxx) {
        const tjInfoArr = [];
        const tjInfoDict = {};
        for (let i = 0; i < dktjxx.length; i++) {
            const { Fplx, Hjfs, Sehj, Hjje } = dktjxx[i];
            const { fplx = Fplx, hjfs = Hjfs, sehj = Sehj, hjje = Hjje} = dktjxx[i];
            if (fplx === '0') { // 增值税专用发票
                tjInfoDict['k01'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '4',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '3') { // 通行费
                tjInfoDict['k14'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '15',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '5') { // 机动车
                tjInfoDict['k03'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '12',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '6') { // 缴款书
                tjInfoDict['k21'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '21',
                    deductibleNum: hjfs,
                    deductibleAmount: 0,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            } else if (fplx === '8') { // 合计
                tjInfoDict['k99'] = [hjfs, hjje, sehj, 0, 0, 0].join('=');
                tjInfoArr.push({
                    invoiceType: '99',
                    deductibleNum: hjfs,
                    deductibleAmount: hjje,
                    deductibleTax: sehj,
                    unDeductibleNum: 0,
                    unDeductibleAmount: 0,
                    unDeductibleTax: 0
                });
            }
        }
        const sortKeys = ['01', '03', '14', '21', '24', '99'];
        let tjInfo = '';
        if (tjInfoArr.length > 0) {
            tjInfo = [];
            for (let i = 0; i < sortKeys.length; i++) {
                const curKey = sortKeys[i];
                const curData = tjInfoDict['k' + curKey];
                if (curData) {
                    tjInfo.push(curKey + '=' + curData);
                } else {
                    tjInfo.push(curKey + '=0=0=0=0=0');
                }
            }
            tjInfo = tjInfo.join(';') + ';';
        }

        return {
            tjInfoArr,
            tjInfo
        };
    }

    // 生成统计表
    async createTjb(tokenInfo) {
        const ctx = this.ctx;
        const res = await this.queryDqtjb(tokenInfo);
        ctx.service.log.info('生成统计表 createTjb', res, tokenInfo);
        if (res.errcode !== '0000') {
            return res;
        }

        const createTjbbStatus = res.data.createTjbbStatus;
        // 已经生成统计表
        if (createTjbbStatus !== '01') {
            return res;
        }

        // const res2 = await ctx.service.nt.ntCurl(tokenInfo.pageId, '/ypfw/ytqr/v1/sqtj?t=' + (+new Date()), {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify({
        //         Gfsbh: '',
        //         Skssq: tokenInfo.taxPeriod,
        //         Bz: 'N'
        //     })
        // });
        ctx.service.log.info('生成统计表 参数', {
            Gfsbh: '',
            Skssq: tokenInfo.taxPeriod,
            Bz: 'N'
        });
        const urlPath = '/ypfw/ytqr/v1/sqtj';
        const res2 = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, {
            Gfsbh: '',
            Skssq: tokenInfo.taxPeriod,
            Bz: 'N'
        });
        // const res2 = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify({
        //         Gfsbh: '',
        //         Skssq: tokenInfo.taxPeriod,
        //         Bz: 'N'
        //     })
        // });
        ctx.service.log.info('生成统计表返回', res2);
        const resData = res2.data || {};
        if (resData.code !== '200' && resData.Bs !== 0) {
            return {
                ...errcodeInfo.argsErr,
                description: '生成统计表异常，请检查!'
            };
        }

        const res3 = await this.queryDqtjb(tokenInfo);
        if (res3.errcode !== '0000') {
            return res3;
        }
        return res3;
    }

    async isGxConfirm(tokenInfo, retry = 0) {
        const ctx = this.ctx;
        const taxPeriod = tokenInfo.taxPeriod;
        const curMonth = moment().format('YYYYMM');

        if (curMonth === taxPeriod) {
            return {
                ...errcodeInfo.success,
                data: 'N'
            };
        }
        const urlPath = '/ypfw/ytqr/v1/searchqrbz?Skssq=' + taxPeriod;
        const res1 = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, { returnOrigin: true, dataType: 'text' });
        ctx.service.log.info('税局查询统计表确认状态，返回', res1);
        if (res1.errcode !== '0000') {
            return res1;
        }
        const resData = res1.data;
        if (resData === 'Y' || resData === 'N') {
            return res1;
        }
        if (retry < 3) {
            ctx.service.log.info('税局查询统计表确认状态进入重试', retry);
            return await this.isGxConfirm(tokenInfo, retry + 1);
        }

        if (typeof resData === 'string') {
            try {
                const jsonData = JSON.parse(resData);
                const { Message = '税局请求异常, 请稍后再试', Code } = jsonData.Response?.Error || {};
                return {
                    ...errcodeInfo.govErr,
                    description: Code ? Message + `[${Code}]` : Message
                };
            } catch (error) {
                ctx.service.log.info('税局查询统计表确认状态异常');
            }
        }
        return {
            ...errcodeInfo.govErr,
            data: resData
        };
    }

    // 取消统计表
    async qxTjb(tokenInfo) {
        const ctx = this.ctx;
        const { clientType = 4 } = ctx.request.body || {};
        const { fpdk_type, access_token } = ctx.request.query;
        let taxPeriod = tokenInfo.taxPeriod;
        const taxNo = tokenInfo.taxNo;
        const res = await this.queryDqtjb(tokenInfo);
        ctx.service.log.info('取消统计表前，查询统计表返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        if (!taxPeriod) {
            taxPeriod = res.data?.taxPeriod;
        }

        const createTjbbStatus = res.data.createTjbbStatus;
        // 未生成统计表
        if (createTjbbStatus === '01') {
            if (fpdk_type === '4') {
                return {
                    ...errcodeInfo.success,
                    data: {
                        taxPeriod
                    }
                };
            }
            // 商家平台和通用token，撤销统计表时更新发票状态
            if (parseInt(clientType) === 3 || parseInt(clientType) === 4) {
                const saveRes = await ctx.service.invoiceSave.fpy_qxsb({ taxPeriod, clientType, taxNo }, access_token);
                if (saveRes.errcode !== '0000') {
                    return saveRes;
                }
            }
            return {
                ...errcodeInfo.success,
                data: {
                    taxPeriod
                }
            };
        }

        if (!res.data.isAllowQxTj) {
            return {
                ...errcodeInfo.argsErr,
                description: '当前状态不允许取消统计表'
            };
        }

        let urlPath = '/ypfw/ytqr/v1/tjxxupdate';
        // 取消统计表前需要先取消确认
        const resQxConfirm = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, {
            Gfsbh: '',
            Skssq: taxPeriod,
            Zt: '4'
        });
        // const resQxConfirm = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify({
        //         Gfsbh: '',
        //         Skssq: taxPeriod,
        //         Zt: '4'
        //     })
        // });

        if (resQxConfirm.errcode !== '0000') {
            return resQxConfirm;
        }

        const jsonData = {
            Gfsbh: '',
            Skssq: taxPeriod,
            Zt: '3'
        };

        urlPath = '/ypfw/ytqr/v1/tjxxupdate';
        // 撤销统计表
        // const res1 = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        const res1 = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);

        ctx.service.log.info('取消统计表返回', res1);

        if (res1.errcode !== '0000') {
            return res1;
        }

        if (res1.data === '200') {
            if (fpdk_type === '4') {
                return {
                    ...errcodeInfo.success,
                    data: {
                        taxPeriod
                    }
                };
            }
            if (parseInt(clientType) === 3 || parseInt(clientType) === 4) {
                const saveRes = await ctx.service.invoiceSave.fpy_qxsb({ taxPeriod, clientType, taxNo }, access_token);
                if (saveRes.errcode !== '0000') {
                    return saveRes;
                }
            }
            return {
                ...errcodeInfo.success,
                data: {
                    taxPeriod
                }
            };
        }
        return {
            ...errcodeInfo.govErr,
            description: '取消统计表异常，请检查！'
        };
    }


    // 查询往期统计表
    async queryWqtjb(tokenInfo, opt) {
        const ctx = this.ctx;
        ctx.service.log.fullInfo('查询往期统计表 plugin', opt);
        const taxPeriod = opt.taxPeriod || '';
        if (!taxPeriod || taxPeriod.length !== 6) {
            return {
                ...errcodeInfo.argsErr,
                description: '税期参数不能为空或格式错误，正确格式为（YYYYMM）'
            };
        }
        const jsonData = {
            Gfsbh: '',
            Skssq: taxPeriod
        };
        ctx.service.log.fullInfo('查询往期统计表 参数', jsonData);
        const urlPath = '/ypfw/ytqr/v1/tjxxcx';
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        ctx.service.log.fullInfo('查询往期统计表 返回', taxPeriod, res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        // 可能不是试点数字账号企业

        const dktjxx = resData.dktjxx || resData.Dktjxx || [];
        ctx.service.log.fullInfo('dktjxx', dktjxx);
        ctx.service.log.fullInfo('统计表类型 allTjbb:', opt.allTjbb);
        let tjxxRes = {};
        if (Number(opt.allTjbb) === 1) {
            tjxxRes = this.getTongArrNew(dktjxx);
        } else {
            tjxxRes = this.getTongArr(dktjxx);
        }
        const { tjInfoArr, tjInfo } = tjxxRes;
        // 01增值税专用发票，03机动车销售发票，14通行费电子发票，24出口转内销发票，99总计

        return {
            ...errcodeInfo.success,
            data: {
                taxPeriod: resData.skssq,
                skssq: tokenInfo.skssq || '',
                gxrqfw: tokenInfo.gxrqfw || '',
                updateTime: '',
                createTjbbStatus: '05',
                isAllowQxTj: false, // 当前是否允许取消统计报表
                isAllowQrtj: false, // 当前是否允许确认签名
                allowChangeSsqBySeason: false, // 按季切换税款所属期标志
                tjInfo, // 统计信息
                tjInfoArr
            }
        };
    }

    // 查询当期统计表
    async queryDqtjb(tokenInfo) {
        const ctx = this.ctx;
        const jsonData = {
            Gfsbh: '',
            Skssq: ''
        };
        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, '/ypfw/ytqr/v1/tjxxcx?t=' + (+new Date()), {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        const urlPath = '/ypfw/ytqr/v1/tjxxcx';

        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        ctx.service.log.fullInfo('查询当期统计表 返回结果', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || {};
        let tjzt = '01';
        let isAllowQxTj = true;
        let isAllowQrtj = false;
        let isAllowGxInvoice = true;
        const taxPeriod = tokenInfo.taxPeriod || resData.skssq || resData.Skssq;
        const dktjxx = resData.dktjxx || resData.Dktjxx || [];
        ctx.service.log.fullInfo('dktjxx', dktjxx);
        // const { tjInfoArr, tjInfo } = this.getTongArr(dktjxx);
        let tjxxRes = {};
        const { decryedData } = ctx.request.body;
        ctx.service.log.fullInfo('统计表类型 allTjbb:', decryedData);
        if (decryedData && Number(decryedData.allTjbb) === 1) {
            tjxxRes = this.getTongArrNew(dktjxx);
        } else {
            tjxxRes = this.getTongArr(dktjxx);
        }
        const { tjInfoArr, tjInfo } = tjxxRes;
        ctx.service.log.fullInfo('tjInfoArr', tjInfoArr);
        if (tjInfoArr.length === 0) {
            isAllowGxInvoice = true;
            isAllowQrtj = false;
            isAllowQxTj = false;
            tjzt = '01';
        } else {
            // 已经生成统计表，查询是否已经确认
            const confirmRes = await this.isGxConfirm({ ...tokenInfo, taxPeriod });
            if (confirmRes.errcode !== '0000') {
                return confirmRes;
            }
            const isConfirm = confirmRes.data === 'Y';
            isAllowGxInvoice = false;
            isAllowQrtj = !isConfirm;
            isAllowQxTj = true;
            if (isConfirm) {
                tjzt = '05';
            } else {
                tjzt = '02';
            }
        }

        return {
            ...errcodeInfo.success,
            data: {
                taxPeriod: resData.skssq || resData.Skssq,
                skssq: tokenInfo.skssq || '',
                gxrqfw: tokenInfo.gxrqfw || '',
                updateTime: '',
                createTjbbStatus: tjzt,
                isAllowQxTj: isAllowQxTj, // 当前是否允许取消统计报表
                isAllowQrtj: isAllowQrtj, // 当前是否允许确认签名
                isAllowGxInvoice: isAllowGxInvoice, // 不能勾选发票，true表示能勾选发票
                allowChangeSsqBySeason: false, // 按季切换税款所属期标志
                tjInfo, // 统计信息
                tjInfoArr
            }
        };
    }

    async gxConfirm(tokenInfo) {
        const ctx = this.ctx;
        let taxPeriod = tokenInfo.taxPeriod;
        const { fpdk_type, access_token } = ctx.request.query;
        const { clientType = 4 } = ctx.request.body;
        const res1 = await this.queryDqtjb(tokenInfo);
        const taxNo = tokenInfo.taxNo;
        if (res1.errcode !== '0000') {
            return res1;
        }
        const res1Data = res1.data || {};
        if (!taxPeriod) {
            taxPeriod = res1Data.taxPeriod;
        }
        if (res1Data.createTjbbStatus === '01') {
            return {
                ...errcodeInfo.argsErr,
                description: '请先生成统计表，然后确认统计'
            };
        }

        const tjInfo = res1Data.tjInfo;

        const jsonData = {
            Gfsbh: '',
            Skssq: taxPeriod,
            Zt: '2'
        };
        ctx.service.log.fullInfo('勾选确认统计表 参数', jsonData);
        const urlPath = '/ypfw/ytqr/v1/tjxxupdate';

        // const res = await ctx.service.nt.ntCurl(tokenInfo.pageId, urlPath, {
        //     dataType: 'json',
        //     method: 'post',
        //     body: JSON.stringify(jsonData)
        // });
        const res = await ctx.service.nt.ntEncryCurl(tokenInfo, urlPath, jsonData);
        ctx.service.log.info('勾选确认返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data;
        if (resData === '200') {
            if (fpdk_type === '4') {
                return {
                    ...errcodeInfo.success,
                    allowChangeSsqBySeason: false
                };
            }
            if (parseInt(clientType) === 4) {
                const saveRes = await ctx.service.invoiceSave.gxConfirmSave({ tjInfo, taxPeriod, taxNo }, access_token);
                return saveRes;
            }
            return errcodeInfo.success;
        }

        if (resData === '222') {
            return {
                ...errcodeInfo.argsErr,
                description: '当前未到勾选确认日期'
            };
        }
        if (resData === '333') {
            return {
                ...errcodeInfo.argsErr,
                description: '当前数据与统计信息不符请撤销统计后再进行申请确认'
            };
        }
        if (resData === '444') {
            return {
                ...errcodeInfo.argsErr,
                description: '已勾选发票有存在因红字锁定发票，无法进行汇总统计'
            };
        }
        return {
            ...errcodeInfo.govErr,
            description: '勾选确认异常，请稍后再试'
        };
    }
}
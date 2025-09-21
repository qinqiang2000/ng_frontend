/* eslint-disable no-inline-comments,complexity */
import { companyOpenInvoiceLimitPreKey } from '../constant';

export class OpenInvoiceQuery extends BaseService {
    // 查询蓝字发票开具信息
    async queryBlueInvoiceOpenInfo(loginData: any = {}) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { taxNo, disableCache } = queryInfo;
        const cacheInfo = pwyStore.get(companyOpenInvoiceLimitPreKey + taxNo) || {};
        const cacheOpenLimitInfo = cacheInfo.openLimitInfo || {};
        const etaxAccountType = loginData.etaxAccountType;
        if (etaxAccountType && etaxAccountType !== 1 && etaxAccountType !== 3) {
            return {
                ...errcodeInfo.argsErr,
                description: '当前账户没有开票业务相关权限'
            };
        }

        // 授信额度没有过期
        if (cacheOpenLimitInfo.availableVolume && parseInt(moment().format('YYYYMMDDHHmm')) < cacheInfo.expireDate && !disableCache) {
            ctx.service.log.info('缓存授信额度', cacheInfo);
            return {
                ...errcodeInfo.success,
                data: cacheOpenLimitInfo
            };
        }

        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const checkData = checkRes.data || {};
        const res = await this.queryNoCacheBlueInvoiceOpenInfo(checkData);
        return res;
    }

    async queryNoCacheBlueInvoiceOpenInfo(loginData : any) {
        const ctx = this.ctx;
        const pageId = loginData.pageId;
        const taxNo = loginData.taxNo;
        const etaxAccountType = loginData.etaxAccountType;
        if (etaxAccountType && etaxAccountType !== 1 && etaxAccountType !== 3) {
            return {
                ...errcodeInfo.argsErr,
                description: '当前账户没有开票业务相关权限'
            };
        }
        const urlPath = '/kpfw/sjtj/v1/info';
        const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
            method: 'post',
            dataType: 'json',
            contentType: 'json',
            body: {
                Kpysfid: taxNo,
                Nsrsbh: taxNo
            }
        });
        ctx.service.log.info('授信额度查询url', urlPath);
        ctx.service.log.info('授信额度返回', res);
        if (res.errcode !== '0000') {
            ctx.service.log.fullInfo('授信额度查询异常', res);
            return res;
        }
        const resData = res.data || {};
        const openLimitInfo = {
            openedCopies: resData.Bykjlpzs, // 开具的份数
            openedTaxAmount: resData.Fpejse, // 开具的总税额
            openedInvoiceAmount: resData.Fphjje, // 开具的总金额
            availableVolume: resData.Sysxed, // 可用授信额度
            totalVolume: resData.Zsxed // 总授信额度
        };
        if (openLimitInfo.totalVolume) {
            this.updateOpenInfo(pageId, openLimitInfo);
            return {
                ...errcodeInfo.success,
                data: openLimitInfo
            };
        }
        return errcodeInfo.govErr;
    }

    updateOpenInfo(pageId: string, openLimitInfo: any) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { taxNo } = queryInfo;
        pwyStore.set(companyOpenInvoiceLimitPreKey + taxNo, {
            openLimitInfo,
            expireDate: parseInt(moment().add(2, 'hours').format('YYYYMMDDHHmm'))
        }, 12 * 60 * 60);
    }

    updateAvailableVolume(pageId: string, amount: string) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const limitInfoFull = pwyStore.get(companyOpenInvoiceLimitPreKey + queryInfo.taxNo);
        const limitInfo = limitInfoFull ? limitInfoFull.openLimitInfo : {};
        if (!limitInfo.availableVolume) {
            ctx.service.log.info('授信额度信息为空', limitInfo);
            return {
                availableVolume: '',
                totalVolume: ''
            };
        }
        const newAvailable = parseFloat(limitInfo.availableVolume) - parseFloat(amount);
        const newAvailable2 = newAvailable.toFixed(2);
        this.updateOpenInfo(pageId, {
            ...limitInfo,
            availableVolume: newAvailable2
        });
        return {
            availableVolume: newAvailable2,
            totalVolume: limitInfo.totalVolume
        };
    }

    deleteOpenInfo(pageId: string) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        pwyStore.delete(companyOpenInvoiceLimitPreKey + queryInfo.taxNo);
    }

    // 分页查询开票历史
    async queryOpenInvoices(loginData: any = {}, opt : any = {}) {
        const ctx = this.ctx;
        const urlPath = '/szzhzz/qlfpcx/v1/queryFpjcxx';
        const fplxType : any = {
            'k26': '82', // 数电票-普通发票
            'k27': '81', // 数电票-增值税专用发票
            'k3': '86',
            'k4': '85',
            'k28': '61' // 数电航空
        };
        const dickGovType : any = {
            'k82': 26, // 数电票-普通发票
            'k81': 27, // 数电票-增值税专用发票
            'k85': 4,
            'k86': 3,
            'k61': 28
        };
        let FplxDm = [
            '81', // 数电专用发票
            '82', // 数电普通发票
            '85', // 数电纸质发票（增值税专用发票）
            '86', // 数电纸质发票（普通发票）
            '61'
        ];
        const { invoiceAmount, totalTaxAmount, totalAmount } = opt;
        if (opt.invoiceType) {
            const govInvoiceType = fplxType['k' + opt.invoiceType];
            if (!fplxType['k' + opt.invoiceType]) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '发票类型参数错误'
                };
            }
            FplxDm = [govInvoiceType];
        }

        if (!opt.startDate || !opt.endDate) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票起止日期不能为空'
            };
        }

        const requestParam = {
            'FplxDm': FplxDm,
            'fpztDm': ['01', '02', '03', '04'],
            dfnsrmc: opt.buyerName || '',
            gmfmc: opt.buyerName || '',
            'dfnsrsbh': opt.buyerTaxNo || '',
            'gmfnsrsbh': opt.buyerTaxNo || '',
            'kprqq': opt.startDate,
            'kprqz': opt.endDate,
            'dtBz': 'N',
            'sflzfp': 'Y',
            'gjbq': typeof opt.gjbq === 'undefined' ? '1' : opt.gjbq,
            'fplyDm': '2',
            'fphm': opt.invoiceNo || '',
            'tfrqq': opt.startDate,
            'tfrqz': opt.endDate,
            'pageNumber': opt.page || 1,
            'pageSize': opt.pageSize || 50
        };
        if (requestParam.pageSize > 50) {
            return {
                ...errcodeInfo.argsErr,
                description: '最大分页值不能超过50'
            };
        }
        ctx.service.log.info('开票数据查询参数', urlPath, requestParam);
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, requestParam);
        ctx.service.log.info('开票数据查询返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        if (typeof resData.List === 'undefined' && resData.Total && resData.Total > 0) {
            return {
                ...errcodeInfo.govErr,
                description: '税局返回数据异常'
            };
        }

        const { List = [], Total } = resData;
        const result = [];
        for (let i = 0; i < List.length; i++) {
            const item = List[i];
            const invoiceType = dickGovType['k' + item.FplxDm];
            if (!invoiceType) {
                continue;
            }
            // 按照金额过滤
            if ((!invoiceAmount || parseFloat(invoiceAmount).toFixed(2) === parseFloat(item.Hjje).toFixed(2)) &&
            (!totalAmount || parseFloat(totalAmount).toFixed(2) === parseFloat(item.Jshj).toFixed(2)) &&
            (typeof totalTaxAmount === 'undefined' || totalAmount === '' || parseFloat(totalTaxAmount).toFixed(2) === parseFloat(item.Hjse).toFixed(2))) {
                result.push({
                    invoiceCode: item.ZzfpDm || '',
                    invoiceNo: item.Zzfphm || item.Fphm || '',
                    etaxInvoiceNo: item.Fphm || '',
                    invoiceType: invoiceType,
                    buyerTaxNo: item.Gmfnsrsbh,
                    buyerName: item.Gmfmc,
                    salerTaxNo: item.Xsfnsrsbh,
                    salerName: item.Xsfmc,
                    totalAmount: item.Jshj,
                    totalTaxAmount: item.Hjse,
                    invoiceAmount: item.Hjje,
                    invoiceDate: item.Kprq,
                    fplydm: item.FplyDm,
                    gjbqdm: item.Gjbq,
                    sjlybz: item.Sjlybz
                });
            }
        }
        return {
            ...errcodeInfo.success,
            data: result,
            pageNo: requestParam.pageNumber,
            totalElement: Total,
            pageSize: requestParam.pageSize,
            isEnd: List.length < requestParam.pageSize
        };
    }

    // 开票详情查询
    async queryOpenInvoiceDetail(loginData: any = {}, opt : any = {}) {
        const ctx = this.ctx;
        if (!loginData || !loginData.loginedCookies) {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            loginData = checkRes.data;
        }
        const urlPath = '/szzhzz/fppmcx/v1/queryFppmxx';
        const dickGovType : any = {
            'k02': 26, // 数电票-普通发票
            'k01': 27 // 数电票-增值税专用发票
        };
        let paperInvoiceNo = '';
        let etaxInvoiceNo = opt.etaxInvoiceNo || '';
        if (opt.invoiceNo?.length === 20) {
            etaxInvoiceNo = opt.invoiceNo;
        } else if (opt.invoiceNo) {
            paperInvoiceNo = opt.invoiceNo;
        }
        const requestParam = {
            'Qdfphm': etaxInvoiceNo,
            'Fpdm': opt.invoiceCode || '',
            'Fphm': paperInvoiceNo || '',
            'Fplydm': opt.fplydm || '2',
            'GjbqDm': opt.gjbqdm || '1',
            'Kprq': opt.invoiceDate,
            'Sjlybz': opt.sjlybz || '00000000000'
        };
        ctx.service.log.info('开票数据详情，查询参数', urlPath, requestParam);
        // const res : any = await ctx.service.nt.commonRequest(urlPath, {
        //     method: 'POST',
        //     dataType: 'json',
        //     body: requestParam
        // }, loginData);
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, requestParam);
        ctx.service.log.fullInfo('开票数据详情，查询返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        let invoiceType = dickGovType['k' + resData.FppzDm];
        if (!invoiceType) {
            return {
                ...errcodeInfo.argsErr,
                description: '不支持的发票类型'
            };
        }
        // 数电纸质发票，发票票种代码返回和数电票-增值税专用发票相同
        if (resData.Zzfphm) {
            if (resData.FppzDm === '01') {
                invoiceType = 4; // 数电-纸质专用发票，类型和之前保持一致
            } else if (resData.FppzDm === '02') {
                invoiceType = 3; // 数电-纸质普通发票，类型和之前保持一致
            }
        }
        return {
            ...errcodeInfo.success,
            data: {
                invoiceCode: resData.Fpdm || '',
                invoiceNo: resData.Zzfphm || resData.Fphm, // 数电纸质发票这里的值是纸质发票号码，数电票为20发票号码
                etaxInvoiceNo: resData.Fphm || '',
                invoiceType: invoiceType,
                buyerTaxNo: resData.Gmfnsrsbh,
                buyerName: resData.Gmfmc,
                salerTaxNo: resData.Xsfnsrsbh,
                salerName: resData.Xsfmc,
                salerAddress: resData.Xsfdz,
                salerCardName: resData.Xsfkhh,
                salerPhone: resData.Xsflxdh,
                salerCardNumber: resData.Xsfyhzh,
                totalAmount: resData.Jshj,
                totalTaxAmount: resData.Hjse,
                invoiceAmount: resData.Hjje,
                invoiceDate: resData.Kprq,
                remark: resData.Bz,
                drawer: resData.Kpr,
                items: resData.MxzbList.map((item: any) => {
                    return {
                        index: item.Xh,
                        goodsName: item.Hwhyslwfwmc,
                        num: item.Spsl,
                        unitPrice: item.Dj,
                        unit: item.Dw,
                        taxAmount: item.Se,
                        detailAmount: item.Je,
                        goodsCode: item.Sphfwssflhbbm,
                        taxRate: item.Slv,
                        specModel: item.Ggxh
                    };
                })
            }
        };
    }
}

/* eslint-disable complexity */
import { fixedFloatNumber, clearChars } from '$utils/tools';
import { getUUId } from '$utils/getUid';
import { simulateClick } from '../libs/randomClick';

export interface fileUrlType {
    ofdUrl?: string;
    pdfUrl?: string;
    xmlUrl?: string;
    snapshotUrl?: string;
}

export interface openResultType extends fileUrlType {
    status?: number;
    invoiceCode: string; // 数电纸票代码
    invoiceNo: string; // 数电纸票号码
    etaxInvoiceNo: string; // 数电号码
    invoiceDate: string;
    govSerialNo: string;
    serialNo: string;
    availableVolume?: string,
    totalVolume?: string
}

interface zzfpSearchOptType {
    invoiceCode?: string;
    invoiceNo?: string;
    etaxInvoiceNo?: string;
    buyerTaxNo?: string;
    startDate: string;
    endDate: string;
    pageNo?: number,
    pageSize?: number;
 }

 interface zzfpzfOptType {
    invoiceCode: string;
    invoiceNo: string;
    salerTaxNo: string;
    etaxInvoiceNo?: string;
    reason: string; // 01，开票有误，03,服务终止，04 销售折让, 05 其他
 }

export class OpenEtaxPaperInvoice extends BaseService {
    // 获取纸质发票字段
    getPaperInvoiceItem(paperInfo: any) {
        const result = {
            ZpFppzDm: paperInfo.paperInvoiceCategoryCode,
            Sfwzzfp: 'Y',
            Fpdm: paperInfo.invoiceCode,
            Zzfphm: paperInfo.invoiceNo,
            JsfsDm: '99', // 目前开具纸质专票税局传了99
            fppzl: '02'
        };
        return result;
    }

    async getDqzzkbfpdmhm(loginData: any, invoiceOpenData: any) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const taxNo = queryInfo.taxNo;
        const invoiceCopyType = +(invoiceOpenData.invoiceCopyType || queryInfo.invoiceCopyType || '');
        let fpzlDm;
        if (invoiceOpenData.invoiceType === '4') {
            if (invoiceCopyType === 6) {
                fpzlDm = '1160'; // 增值税专用发票（中文六联无金额限制版）
            } else {
                fpzlDm = '1130'; // 默认 增值税专用发票（中文三联无金额限制版）
            }
        } else if (invoiceOpenData.invoiceType === '3') {
            if (invoiceCopyType === 5 || taxNo === '9112010573037328XN') { // 这个百洋税号普票默认开5联
                fpzlDm = '05'; // 2016版增值税普通发票（五联折叠票）
            } else { // 不传默认开二联
                fpzlDm = '04'; // 默认 2016版增值税普通发票（二联折叠票）
            }
        }
        if (!fpzlDm) {
            return {
                ...errcodeInfo.argsErr,
                description: '暂时不支持该票种的开具'
            };
        }
        const { decryedData = {} } = ctx.request.body;
        // debug开票模式不在调用税局
        if (decryedData.debugOpenInvoice === true) {
            return {
                ...errcodeInfo.success,
                data: {
                    invoiceCode: ((+new Date()) + '').substring(0, 12),
                    invoiceNo: ((+new Date()) + '').substring(0, 10),
                    paperInvoiceCategoryCode: fpzlDm,
                    jsfsDm: fpzlDm
                }
            };
        }
        const urlPath = '/kpfw/lzfpkj/v1/getDqzzkbfpdmhm';
        const bodyData = {
            nsrsbh: invoiceOpenData.salerTaxNo,
            fpzlDm: fpzlDm
        };
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, bodyData);
        if (res.errcode !== '0000') {
            return res;
        }
        const {
            FpDm,
            Fphm,
            Syfpzs // 剩余发票张数
        } = res.data;
        if (Syfpzs <= 0) {
            return {
                ...errcodeInfo.argsErr,
                description: '当前票种剩余张数为0，请选择其它票种开具！'
            };
        }
        if (!FpDm || !Fphm) {
            return {
                ...errcodeInfo.argsErr,
                description: '查询当前票种代码号码异常'
            };
        }
        return {
            ...errcodeInfo.success,
            data: {
                invoiceCode: FpDm,
                invoiceNo: Fphm,
                paperInvoiceCategoryCode: fpzlDm,
                jsfsDm: fpzlDm
            }
        };
    }

    async queryOpenUid(loginData: any, invoiceOpenData: any) {
        const ctx = this.ctx;
        const { decryedData = {} } = ctx.request.body;
        const serialNo: string = invoiceOpenData.serialNo;
        let govSerialNo;
        // debug开票模式不在调用税局
        if (decryedData.debugOpenInvoice === true) {
            govSerialNo = getUUId();
        } else {
            const urlPath = '/kpfw/fjxx/v1/kjlp/get';
            const uidRes : any = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
                method: 'GET',
                dataType: 'json'
            });
            ctx.service.log.info('查询开具前的唯一id返回', uidRes);
            if (uidRes.errcode !== '0000') {
                return uidRes;
            }
            govSerialNo = uidRes.data;
        }
        const saveRes = await ctx.service.openHistory.add({
            status: 2,
            serialNo,
            govSerialNo
        });
        if (saveRes.errcode !== '0000') {
            return saveRes;
        }
        return {
            ...errcodeInfo.success,
            data: {
                govSerialNo
            }
        };
    }

    async startOpenInvoice(loginData: any, invoiceOpenData: any, cachedGovSerialNo: string = '', openHistory: {
        createTime: number,
        updateTime: number
    }) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { decryedData = {}, etaxAccountInfo } = ctx.request.body;
        const { city } = etaxAccountInfo || {};
        const serialNo = invoiceOpenData.serialNo;
        // 销方税号严格比对，登录保存的税号，开票的销售方税号与地址栏税号必须一致
        if (loginData.taxNo !== invoiceOpenData.salerTaxNo || invoiceOpenData.salerTaxNo !== queryInfo.taxNo) {
            ctx.service.log.info('startOpenInvoice企业信息不一致，请检查', loginData.taxNo, queryInfo.taxNo, invoiceOpenData.salerTaxNo);
            return {
                ...errcodeInfo.argsErr,
                description: '开票信息与当前账户不一致'
            };
        }

        ctx.service.log.fullInfo('对开票数据格式进行转换');
        const bodyDataRes = ctx.service.openSingleInvoice.changeOpeninvoiceData(invoiceOpenData);
        if (bodyDataRes.errcode !== '0000') {
            return bodyDataRes;
        }

        const dmhmRes = await this.getDqzzkbfpdmhm(loginData, invoiceOpenData);
        if (dmhmRes.errcode !== '0000') {
            return dmhmRes;
        }

        let govSerialNo = '';
        if (cachedGovSerialNo) {
            govSerialNo = cachedGovSerialNo;
            const upRes = await ctx.service.openHistory.update({
                status: 2,
                serialNo,
                govSerialNo
            });
            // 防止重复开票
            if (upRes.errcode !== '0000') {
                return upRes;
            }
        } else {
            const uidRes = await this.queryOpenUid(loginData, invoiceOpenData);
            if (uidRes.errcode !== '0000') {
                return uidRes;
            }
            govSerialNo = uidRes.data.govSerialNo || '';
        }
        const realKjlp = govSerialNo.substring(0, govSerialNo.length - 1);
        const paperInfo = this.getPaperInvoiceItem((dmhmRes.data || {}));
        const bodyData = {
            ...bodyDataRes.data,
            ...paperInfo,
            Kjlp: realKjlp
        };

        // 开具发票
        let urlPath = '/kpfw/lzfpkj/v1/tyfpkj';
        const businessType = invoiceOpenData.businessType;
        if (businessType) {
            if (businessType === '03') { // 建筑服务
                urlPath = '/kpfw/lzfpkj/v1/jzfwfpkj';
            } else if (businessType === '06') { // 不动产租赁
                urlPath = '/kpfw/lzfpkj/v1/bdczlfpkj';
            } else if (businessType === '05') { // 不动产销售
                urlPath = '/kpfw/lzfpkj/v1/bdcxsfpkj';
            } else if (businessType === '04') { // 货物运输
                urlPath = '/kpfw/lzfpkj/v1/hwysfpkj';
            } else {
                return {
                    ...errcodeInfo.argsErr,
                    description: '暂不支持该特殊行业票种的开具'
                };
            }
        }

        ctx.service.log.fullInfo('调用税局的开票地址', urlPath);
        ctx.service.log.fullInfo('调用税局的开票参数', bodyData);

        // 不触发实际开票，直接返回成功
        if (decryedData.debugOpenInvoice === true) {
            ctx.service.log.info('debugOpenInvoice开具成功');
            const openResult : any = {
                invoiceType: decryedData.invoiceType,
                invoiceCode: ('' + (+new Date())).substring(0, 12),
                invoiceNo: ('' + (+new Date())).substring(0, 8),
                etaxInvoiceNo: '6666666' + (+new Date()),
                invoiceDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                govSerialNo: govSerialNo,
                serialNo: serialNo
            };
            await ctx.service.openHistory.update({
                status: 1,
                ...openResult
            });
            return {
                ...errcodeInfo.success,
                data: openResult
            };
        }

        let openRes : any = errcodeInfo.govErr;
        try {
            // 开票状态 1开具成功 2开具中 3开具异常 4开票串号 5校验开票数据异常 6失败允许重试
            openRes = await ctx.service.nt.ntEncryCurl(loginData, urlPath, bodyData, {
                disabledRetry: true,
                timeout: 120000
            });
            ctx.service.log.info('税局开具返回', openRes);
            const description = openRes.description || '';
            // 可能因为到税局实名认证，导致提示：身份认证成功时间查询失败:请重新登录后继续办理业务
            if (description.indexOf('请重新登录') !== -1) {
                return errcodeInfo.govLogout;
            }
        } catch (error) {
            // 开具异常 失败存疑 规定时间内需查询税局
            await ctx.service.openHistory.update({
                status: 3,
                serialNo
            });
            ctx.service.log.info('税局开具异常 error', error.toString());
            return errcodeInfo.govErr;
        }

        let Fphm;
        let Kprq;
        let Fpdm = paperInfo.Fpdm; // 数电纸质发票代码
        let Zzfphm = paperInfo.Zzfphm; // 数电纸质发票号码

        if (openRes.errcode !== '0000') {
            const description = openRes.description || errcodeInfo.govErr.description;
            ctx.service.log.info('税局开具异常', description);
            const needCheckType = ctx.service.openSingleInvoice.isNeedCheckOpenedInvoice(openRes, invoiceOpenData);
            if (needCheckType) {
                const res = await ctx.service.openSingleInvoice.checkIsOpenInvoice(loginData, invoiceOpenData, openHistory);
                if (res.errcode !== '0000') {
                    // 开具异常 失败存疑 规定时间内需查询税局
                    await ctx.service.openHistory.update({
                        status: 3,
                        serialNo
                    });
                    // 税局明确返回已经开具成功
                    if (needCheckType === 1) {
                        return errcodeInfo.govOpenedInvoice;
                    }
                    return res;
                }
                const checkData = res.data || {};
                Fphm = checkData.etaxInvoiceNo || '';
                Kprq = checkData.invoiceDate || '';
                Fpdm = checkData.invoiceCode;
                Zzfphm = checkData.invoiceNo;
                if (!Fphm || !Kprq) {
                    // 开具异常 失败存疑 规定时间内需查询税局
                    await ctx.service.openHistory.update({
                        status: 3,
                        serialNo
                    });
                    if (needCheckType === 1) {
                        return errcodeInfo.govOpenedInvoice;
                    }
                    return {
                        ...errcodeInfo.govErr,
                        description: '开票请求已失效，请重新进行开票操作'
                    };
                }
            } else {
                // 其它 6允许重试
                await ctx.service.openHistory.update({
                    status: 6,
                    serialNo,
                    govSerialNo: ''
                });
                return {
                    ...openRes,
                    description
                };
            }
        } else {
            const openData = openRes.data || {};
            Fphm = openData.Fphm || '';
            Kprq = openData.Kprq || '';
            if (typeof openData.Data === 'string' && openData.T) {
                // 开具异常 失败存疑 规定时间内需查询税局
                await ctx.service.openHistory.update({
                    status: 3,
                    serialNo
                });
                return {
                    ...errcodeInfo.govErr,
                    description: '开票请求已失效，请重新进行开票操作'
                };
            }
        }

        if (Fphm && Kprq) {
            ctx.service.log.info(city, '税局开具成功');
            const openResult : openResultType = {
                status: 1,
                invoiceCode: Fpdm, // 数电纸质发票代码
                invoiceNo: Zzfphm, // 数电纸质发票号码
                etaxInvoiceNo: Fphm, // 数电号码
                invoiceDate: Kprq,
                govSerialNo: govSerialNo,
                serialNo: serialNo
            };
            // 更新开票历史
            await ctx.service.openHistory.update({
                serialNo,
                ...openResult
            });
            const returnRes = {
                ...errcodeInfo.success,
                data: openResult
            };
            ctx.service.log.info(city, '开具成功', returnRes);
            return returnRes;
        }
        // 开具异常 失败存疑 规定时间内需查询税局
        await ctx.service.openHistory.update({
            status: 3,
            serialNo
        });
        ctx.service.log.info('开具异常, 未返回发票号码或开票日期');
        return {
            ...errcodeInfo.govErr,
            description: '税局返回异常, 请稍后再试！'
        };
    }

    createChTips(result : any = {}, onlyInvoiceInfo = false) {
        const descriptionArr = onlyInvoiceInfo ? [] : ['开票可能出现串号'];
        if (result.invoiceNo) {
            descriptionArr.push(`发票号码：${result.invoiceNo}`);
        }
        if (result.invoiceDate) {
            descriptionArr.push(`开票日期：${result.invoiceDate}`);
        }
        if (result.pdfUrl) {
            descriptionArr.push(`pdf地址：${result.pdfUrl}`);
        }
        if (!onlyInvoiceInfo) {
            descriptionArr.push('请确认后联系管理员再开票!');
        }
        return descriptionArr.join(',');
    }

    // 检查开具的发票号码是否正确
    async handleCheckFphm(loginData: any, fileJSONData: any, openResult: any) {
        const ctx = this.ctx;
        const {
            serialNo,
            invoiceCode,
            invoiceNo,
            etaxInvoiceNo,
            invoiceDate
        } = openResult || {};
        const { decryedData = {} } = ctx.request.body;
        if (decryedData.debugOpenInvoice === true) {
            ctx.service.log.info('debug模式不校验串号');
            await ctx.service.openHistory.update({
                status: 1,
                serialNo
            });
            return errcodeInfo.success;
        }

        let res;
        let targetInvoiceInfo : any = {};

        const isOkForTargetInvoiceInfo = (originData: any, targetData: any) => {
            const isOk = targetData && targetData.invoiceAmount && targetData.totalAmount && typeof targetData.totalTaxAmount !== 'undefined';
            if (originData?.businessType === '16') {
                // 收购票
                return isOk && targetData.buyerTaxNo;
            }
            return isOk && targetData.salerTaxNo;
        };

        if (!isOkForTargetInvoiceInfo(fileJSONData, targetInvoiceInfo)) {
            // 文件校验数据接口调用异常，使用税局查询
            res = await ctx.service.openInvoiceQuery.queryOpenInvoiceDetail(loginData, {
                invoiceType: fileJSONData.invoiceType,
                invoiceCode,
                invoiceNo,
                etaxInvoiceNo,
                invoiceDate
            });
            if (res.errcode === '0000') {
                targetInvoiceInfo = res.data || {};
            } else {
                ctx.service.log.info('查询开票数据异常', res);
                if (res.errcode === '91300') {
                    await ctx.service.openHistory.update({
                        status: 5,
                        serialNo
                    });
                    return res;
                }
            }
        }

        // 两次查询都查询失败
        if (!isOkForTargetInvoiceInfo(fileJSONData, targetInvoiceInfo)) {
            ctx.service.log.fullInfo('开票数据获取不完整，校验失败', targetInvoiceInfo);
            // 串号校验获取发票数据失败
            await ctx.service.openHistory.update({
                status: 5,
                serialNo
            });
            return {
                ...errcodeInfo.govErr,
                description: this.createChTips(openResult, true) + ', 校验开票数据异常，请重试!',
                data: {
                    status: 5
                }
            };
        }

        const isOkForFileJSONData = (originData: any, targetData: any) => {
            const isOk = (parseInt(originData.invoiceType) === parseInt(targetData.invoiceType)) &&
            (fixedFloatNumber(originData.invoiceAmount, 2) === fixedFloatNumber(targetData.invoiceAmount, 2)) &&
            (fixedFloatNumber(originData.totalAmount, 2) === fixedFloatNumber(targetData.totalAmount, 2)) &&
            (fixedFloatNumber(originData.totalTaxAmount, 2) === fixedFloatNumber(targetData.totalTaxAmount, 2)) &&
            // 备注信息通过ofd获取不到
            (clearChars(originData.remark) === clearChars(targetData.remark));

            if (originData?.businessType === '16') {
                // 收购票
                return (
                    isOk && originData.salerTaxNo === targetData.buyerTaxNo &&
                    (!originData.buyerTaxNo || (originData.buyerTaxNo === targetData.salerTaxNo)) &&
                    // 购方名称ofd获取不到
                    (!originData.buyerTaxNo || (clearChars(originData.buyerName) === clearChars(targetData.salerName)))
                );
            }

            return (
                isOk && originData.salerTaxNo === targetData.salerTaxNo &&
                (!originData.buyerTaxNo || (originData.buyerTaxNo === targetData.buyerTaxNo)) &&
                // 购方名称ofd获取不到
                (!originData.buyerTaxNo || (clearChars(originData.buyerName) === clearChars(targetData.buyerName)))
            );
        };

        if (isOkForFileJSONData(fileJSONData, targetInvoiceInfo)) {
            ctx.service.log.fullInfo('开票数据核对成功');
            await ctx.service.openHistory.update({
                status: 1,
                serialNo
            });
            return {
                ...errcodeInfo.success,
                data: targetInvoiceInfo
            };
        }
        ctx.service.log.fullInfo('开票数据核对失败', targetInvoiceInfo);
        await ctx.service.openHistory.update({
            status: 4,
            serialNo
        });
        return {
            ...errcodeInfo.govOpenInvoiceChError,
            description: this.createChTips(openResult),
            data: {
                status: 4
            }
        };
    }

    // 获取RPA预生成发票链接
    getRPAPreGenerationUrl(serialNo: string) {
        const ctx = this.ctx;
        const { tenantNo, taxNo } = ctx.request.query;

        if (!tenantNo || !taxNo || !serialNo) {
            return errcodeInfo.argsErr;
        }

        // 预览文件类型：0-pdf;1-ofd、2-png、3-xml，默认pdf
        return {
            ...errcodeInfo.success,
            data: {
                ofdUrl: '',
                pdfUrl: '',
                xmlUrl: '',
                snapshotUrl: `${ctx.app.config.baseUrl}/rpa/free/preview/${tenantNo}/${taxNo}/${serialNo}?type=2`
            }
        };
    }

    async open(fileJSONData: any) {
        const ctx = this.ctx;
        const serialNo = fileJSONData.serialNo;
        ctx.service.log.info('查询是否已经开具过发票');
        const oldRes = await ctx.service.openHistory.query(serialNo);
        ctx.service.log.info('查询是否已经开具过发票接口返回', oldRes);
        if (oldRes.errcode !== '0000') {
            return oldRes;
        }
        const oldResData = oldRes.data || {};
        const updateTime = oldResData.updateTime;
        const createTime = oldResData.createTime;
        let openStatus = oldResData.status;
        // 处于开具中的状态，最后更新时间大于10分钟可能更新接口异常了，开具状态修改开具失败，允许重新通过税局的流水号重新开具
        if (updateTime && openStatus === 2 && (+new Date() - updateTime > 10 * 60 * 1000)) {
            openStatus = 3;
        }

        if (openStatus === 4) {
            return {
                ...errcodeInfo.govOpenInvoiceChError,
                description: this.createChTips(oldResData)
            };
        }

        // 获取RPA预生成发票链接
        const resRPAPreGeneration = this.getRPAPreGenerationUrl(serialNo);
        if (resRPAPreGeneration.errcode !== '0000') {
            return resRPAPreGeneration;
        }
        const RPAPreGenerationUrl = resRPAPreGeneration.data || {};
        // 已经开具成功过的发票，直接返回
        if (oldResData && oldResData.invoiceCode && oldResData.invoiceNo) {
            ctx.service.log.info('openStatus', openStatus);
            // 默认置空开票人
            let drawer = '';
            // 上次校验串号出现异常，需要重新校验
            if (openStatus === 5) {
                const queryInfo = ctx.request.query || {};
                const curLoginData = await pwyStore.get(etaxLoginedCachePreKey + queryInfo.pageId);
                // 校验串号
                const chRes: any = await this.handleCheckFphm(curLoginData, fileJSONData, {
                    govSerialNo: oldResData.govSerialNo,
                    serialNo,
                    invoiceCode: oldResData.invoiceCode || '', // 数电纸票代码
                    invoiceNo: oldResData.invoiceNo, // 数电纸票号码
                    etaxInvoiceNo: oldResData.etaxInvoiceNo || '', // 数电号码
                    invoiceDate: oldResData.invoiceDate
                });
                // 检查串号异常
                if (chRes.errcode !== '0000') {
                    return chRes;
                }
                drawer = chRes.data?.drawer || '';
            }
            const cacheResult : openResultType = {
                invoiceCode: oldResData.invoiceCode || '', // 数电纸票代码
                invoiceNo: oldResData.invoiceNo || '', // 数电纸票号码
                etaxInvoiceNo: oldResData.etaxInvoiceNo || '', // 数电号码
                invoiceDate: oldResData.invoiceDate || '',
                govSerialNo: oldResData.govSerialNo || '',
                serialNo,
                drawer,
                ...RPAPreGenerationUrl,
                availableVolume: '',
                totalVolume: ''
            };
            // 异步 aws传入的数电开票需要保存完整的开票数据
            ctx.service.openHistory.uploadFullInfo(fileJSONData, cacheResult);
            return {
                ...errcodeInfo.success,
                data: cacheResult
            };
        }
        // 如果传入税局的流水号，则直接使用传入的流水号进行开具，主要用于测试验证税局重复开票的拦截，正式环境可以不用传govSerialNo
        let cachedGovSerialNo = fileJSONData.govSerialNo || oldResData.govSerialNo || '';
        if (openStatus === 2) {
            return {
                ...errcodeInfo.argsErr,
                description: '该发票正在开具中，请勿重复开具！'
            };
        }
        ctx.service.log.info('开票校验 start');
        const excelRes = await ctx.service.etaxOpen.etaxOpenVerification({ ...fileJSONData });
        ctx.service.log.info('开票校验 end', excelRes);
        if (excelRes.errcode !== '0000') {
            return excelRes;
        }
        const invoiceAmount = fileJSONData.invoiceAmount;

        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const loginData = checkRes.data || {};
        const openLimitRes = await ctx.service.openInvoiceQuery.queryBlueInvoiceOpenInfo(loginData);
        if (openLimitRes.errcode !== '0000') {
            return openLimitRes;
        }
        const { availableVolume } = openLimitRes.data || {};
        if (invoiceAmount > availableVolume) {
            // 授信额度不足时需要删除本地额度，下次开票再和同步税局同步
            ctx.service.openInvoiceQuery.deleteOpenInfo(loginData.pageId);
            return {
                ...errcodeInfo.argsErr,
                description: '可用授信额度不足，请到税局调整后再开票！'
            };
        }

        const ntRes = await ctx.service.nt.getNt(loginData);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        const nt = ntRes.data;

        const clickRes = await nt.evaluate(simulateClick);
        ctx.service.log.info('simulateClick res', clickRes);

        // 开具返回
        let invoiceCode = '';
        let invoiceNo;
        let etaxInvoiceNo = '';
        let invoiceDate;
        let govSerialNo;

        // 2开具中 3开具异常 失败存疑 规定时间内需查询税局
        if (openStatus === 2 || openStatus === 3) {
            const checkIsOpenRes = await ctx.service.openSingleInvoice.checkIsOpenInvoice(loginData, fileJSONData, {
                createTime,
                updateTime
            });
            ctx.service.log.info('open checkIsOpenInvoice', checkIsOpenRes);
            if (checkIsOpenRes.errcode !== '0000') {
                return checkIsOpenRes;
            }
            const checkData = checkIsOpenRes.data || {};
            invoiceCode = checkData.invoiceCode || '';
            invoiceNo = checkData.invoiceNo || '';
            etaxInvoiceNo = checkData.etaxInvoiceNo || '';
            invoiceDate = checkData.invoiceDate || '';
            govSerialNo = cachedGovSerialNo;

            if (invoiceNo && invoiceDate) {
                ctx.service.log.info('checkIsOpenInvoice 税局开具成功');
                // 更新开票历史
                await ctx.service.openHistory.update({
                    serialNo,
                    invoiceNo,
                    invoiceDate,
                    govSerialNo
                });
            } else {
                const currentTime = +new Date();
                if (updateTime > currentTime - 3 * 60 * 1000) {
                    return {
                        ...errcodeInfo.argsErr,
                        description: '该发票查询为空，请3分钟后稍后再试！'
                    };
                }
                // 兼容 解决开具状态为开具中的三分钟后无法继续开票的问题
                await ctx.service.openHistory.update({
                    status: 6,
                    serialNo,
                    govSerialNo: ''
                });
                cachedGovSerialNo = '';
            }
        }

        if (!(invoiceNo && invoiceDate)) {
            const openRes = await this.startOpenInvoice(loginData, fileJSONData, '', createTime);
            ctx.service.log.info('通过单张接口开具发票返回', openRes);
            if (openRes.errcode !== '0000') {
                return {
                    errcode: openRes.errcode,
                    description: openRes.description
                };
            }
            const openResData = openRes.data || {};
            invoiceCode = openResData.invoiceCode || '';
            invoiceNo = openResData.invoiceNo;
            etaxInvoiceNo = openResData.etaxInvoiceNo || '';
            invoiceDate = openResData.invoiceDate;
            govSerialNo = openResData.govSerialNo;
        }

        let availableVolumeRes = {
            availableVolume: '',
            totalVolume: ''
        };
        // 有本地缓存开具状态已经更新过授信额度，不需要再更新
        availableVolumeRes = await ctx.service.openInvoiceQuery.updateAvailableVolume(loginData.pageId, invoiceAmount);
        ctx.service.log.info('授信额度更新返回', loginData.pageId, invoiceAmount, availableVolumeRes);

        // 校验串号
        const chRes: any = await this.handleCheckFphm(loginData, fileJSONData, {
            serialNo,
            invoiceCode,
            invoiceNo,
            etaxInvoiceNo,
            invoiceDate
        });
        // 检查串号异常
        if (chRes.errcode !== '0000') {
            return chRes;
        }
        const { drawer = '' } = chRes.data || {};

        const openResult: openResultType = {
            invoiceCode,
            invoiceNo,
            etaxInvoiceNo,
            invoiceDate,
            govSerialNo,
            serialNo,
            drawer,
            ...RPAPreGenerationUrl,
            ...availableVolumeRes // availableVolume, totalVolume
        };

        // 异步 aws传入的数电开票需要保存完整的开票数据
        ctx.service.openHistory.uploadFullInfo(fileJSONData, openResult);
        return {
            ...errcodeInfo.success,
            data: openResult
        };
    }


    // 纸质发票查询
    async paperInvoiceSearch(loginData: any, opt: zzfpSearchOptType) {
        const ctx = this.ctx;
        const {
            invoiceCode = '',
            invoiceNo,
            etaxInvoiceNo = '',
            buyerTaxNo = '',
            startDate = '',
            endDate = '',
            pageNo = 1,
            pageSize = 10
        } = opt || {};
        const urlPath = '/kpfw/fpcx/v1/fpcxPage';
        if (!startDate || !endDate) {
            return {
                ...errcodeInfo.argsErr,
                description: '纸质发票查询参数错误，起止开票日期不能为空'
            };
        }

        const paramJson = {
            fppzdm: '', // 01 纸质专用发票, 02 普通发票
            fphm: etaxInvoiceNo,
            fpdm: invoiceCode,
            fphmq: invoiceNo,
            fphmz: invoiceNo,
            gmfnsrsbh: buyerTaxNo,
            gmfmc: '',
            kprqq: startDate,
            kprqz: endDate,
            pageNumber: pageNo,
            pageSize: pageSize
        };

        const res = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
            method: 'post',
            dataType: 'json',
            contentType: 'json',
            body: paramJson
        });
        ctx.service.log.info('纸质发票查询参数', paramJson);
        ctx.service.log.info('纸质发票查询返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const result = [];
        const { List = [], Total } = res.data || {};
        for (let i = 0; i < List.length; i++) {
            const item = List[i];
            const { Zfbz1, Zfsj, FppzDm } = item;
            let invoiceType;
            if (FppzDm === '01') {
                invoiceType = 4;
            } else if (FppzDm === '02') {
                invoiceType = 3;
            } else {
                ctx.service.info('纸质发票查询过滤掉不支持的发票类型', item);
                continue;
            }
            let invoiceStatus = 0;
            // 存在作废标志和作废时间
            if (Zfbz1 && Zfsj) {
                invoiceStatus = 2;
            }

            const curResult = {
                businessType: item.TdyslxDm || '', // 特定业务 特定要素类型代码
                salerName: item.Xsfmc,
                salerTaxNo: item.Xsfnsrsbh,
                salerCardNumber: item.Xsfyhzh || '',
                salerCardName: item.Xsfkhh || '',

                buyerName: item.Gmfmc,
                buyerTaxNo: item.Gmfnsrsbh || '',
                buyerCardNumber: item.Gmfyhzh || '',
                buyerCardName: item.Gmfkhh || '',

                invoiceType,
                etaxInvoiceNo: item.Fphm || '',
                invoiceCode: item.Fpdm || '',
                invoiceNo: item.Zzfphm || '',
                invoiceDate: item.Kprq,

                invoiceAmount: item.Hjje,
                totalTaxAmount: item.Hjse,
                taxAmount: item.Hjse,
                totalAmount: item.Jshj,

                invoiceStatus,
                invalidDate: Zfsj,

                remark: item.Bz || ''
            };
            result.push(curResult);
        }
        return {
            ...errcodeInfo.success,
            pageNo,
            pageSize,
            totalElement: Total,
            data: result
        };
    }

    // 纸质发票作废
    async cancelPaperInvoice(loginData: any, info: zzfpzfOptType) {
        const ctx = this.ctx;
        const { taxNo } = ctx.request.query || {};
        const { invoiceCode, invoiceNo, salerTaxNo = '', reason = '' } = info || {};
        let description = '';
        // 01，开票有误，03,服务中止，04 销售退回, 05 其他
        const reasonDict : any = {
            'k01': '开票有误',
            'k03': '服务中止',
            'k04': '销售退回',
            'k05': '其他'
        };

        const reasonText = reasonDict['k' + reason] || '';
        if (!invoiceCode) {
            description = '作废纸质发票代码不能为空';
        } else if (!invoiceNo) {
            description = '作废纸质发票号码不能为空';
        } else if (!salerTaxNo) {
            description = '销方税号不能为空';
        } else if (!reason || !reasonText) {
            description = '作废原因参数错误，请求检查！';
        }

        if (description) {
            return {
                ...errcodeInfo.argsErr,
                description
            };
        }

        const res = await this.paperInvoiceSearch(loginData, {
            invoiceCode,
            invoiceNo,
            startDate: moment().format('YYYY-MM-01'),
            endDate: moment().format('YYYY-MM-DD')
        });
        ctx.service.log.info('查询纸质发票信息返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || [];
        if (resData.length < 1) {
            return {
                ...errcodeInfo.argsErr,
                description: '当月范围未查询到该纸质发票，请检查该发票是否存在或者是否已经作废'
            };
        }
        const fixedInvoice = resData[0];
        // 已经作废直接返回成功
        if (fixedInvoice.invoiceStatus === 2) {
            return errcodeInfo.success;
        }

        const etaxInvoiceNo = resData[0].etaxInvoiceNo || '';

        const paramJson : any = {
            zfbz: 'Y',
            fpxxList: [
                {
                    fpdm: invoiceCode,
                    kpfnsrsbh: salerTaxNo,
                    zfyy: reasonText,
                    zzfphm: invoiceNo,
                    fphm: etaxInvoiceNo
                }
            ]
        };
        const urlPath = '/kpfw/zzfpzf/v1/zzfpzf';
        const openRes = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
            method: 'post',
            dataType: 'json',
            contentType: 'json',
            body: paramJson
        }); // true为不走加密
        ctx.service.log.info('作废纸质发票参数', paramJson);
        ctx.service.log.info('作废纸质发票返回', openRes);
        if (openRes.errcode !== '0000') {
            return openRes;
        }
        const resData2 = openRes.data || {};
        const resInfoList = resData2.ResInfoList || [];
        const resInfo = resInfoList[0] || {};
        if (resInfo.Zzfphm !== invoiceNo || resInfo.Fpdm !== invoiceCode) {
            return {
                ...errcodeInfo.govErr,
                description: '税局返回异常, 请稍后再试！'
            };
        }

        const message = resInfo.Message || resInfo.Msg || '税局请求异常，请稍后再试!';
        if (message.indexOf('作废成功') !== -1) {
            await ctx.service.openHistory.updateCancelPaperInvoice({
                taxNo,
                invoiceCode,
                invoiceNo,
                etaxInvoiceNo,
                invalidDate: moment().format('YYYY-MM-DD HH:mm:ss')
            });
            return errcodeInfo.success;
        }

        return {
            ...errcodeInfo.govErr,
            description: message
        };
    }
}

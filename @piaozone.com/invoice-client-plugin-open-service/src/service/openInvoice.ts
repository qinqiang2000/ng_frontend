/* eslint-disable-next-line */
/* global errcodeInfo BaseService etaxLoginedCachePreKey pwyStore setTimeout path fs xlsx base_xlsx moment qrcode urllib log hex_md5 httpRequest */
import { getUUId } from '$utils/getUid';
import { createGovRequest } from '$utils/govHelps';
import { mkdirs as mkdirsSync } from '$utils/tools';

interface invoiceInfoType {
    serialNo: string;
    govSerialNo: string;
    invoiceDate: string;
    invoiceNo: string;
    fileType?: 'OFD' | 'XML' | 'PDF';
    invoiceType?: string; // 发票类型，26数电普票，27数电专票
    type: string; // 红蓝票 0， 蓝票，1红票
    govInvoiceQrUrl?: string;
    downloadType?: string; // 用于区分开票文件的下载和进销项下载（不需要关联到数据库）
}

interface UploadFileReturn {
    errcode: string;
    description: string;
    data: {
        originalUrl: string;
    }
}

export class OpenInvoice extends BaseService {
    async commonRequest(loginData: any, url: string = '', opt : any = {}, requestType = '', retry = 0) {
        const ctx = this.ctx;
        // 导入批量开具模板

        if (!loginData.publicKeyInfo) {
            const preRes = await ctx.service.nt.queryPublicKey(loginData);
            if (preRes.errcode !== '0000') {
                return preRes;
            }
            loginData = {
                ...loginData,
                publicKeyInfo: preRes.data
            };
        }
        const createRes = createGovRequest(url, opt, loginData, requestType);
        if (createRes.errcode !== '0000') {
            return createRes;
        }
        const { requestOpt, requestUrl } = createRes.data || {};
        const tempRequstOpt = { ...requestOpt };
        const res = await httpRequest(requestUrl, requestOpt);
        ctx.service.log.info('OpenInvoice commonRequest, 请求地址', requestUrl);
        if (res.status === 302) {
            ctx.service.log.fullInfo('OpenInvoice commonRequest, 税局返回异常，请求返回302', tempRequstOpt);
            pwyStore.delete(etaxLoginedCachePreKey + loginData.pageId);
            return errcodeInfo.govLogout;
        } else if (typeof res.errcode !== 'undefined') {
            ctx.service.log.fullInfo('OpenInvoice commonRequest, 税局请求异常, requestOpt', tempRequstOpt);
            ctx.service.log.fullInfo('OpenInvoice commonRequest, 税局返回异常，请求返回', res);
            return res;
        }

        if (requestType === 'download') {
            return res;
        }
        let jsonData;
        const resData = res.data;
        try {
            jsonData = JSON.parse(resData);
        } catch (error) {
            ctx.service.log.fullInfo('OpenInvoice commonRequest, 税局请求异常, requestOpt', tempRequstOpt);
            ctx.service.log.info('OpenInvoice commonRequest, 税局数据处理异常, res', res, error.toString());
            return errcodeInfo.govErr;
        }

        // 税局返回为空
        if (!jsonData.Response) {
            ctx.service.log.fullInfo('OpenInvoice commonRequest, 税局请求异常, requestOpt', tempRequstOpt);
            ctx.service.log.info('OpenInvoice commonRequest, 税局数据处理异常, res', res);
            return errcodeInfo.govErr;
        }
        if (jsonData.Response.Error) {
            ctx.service.log.fullInfo('OpenInvoice commonRequest, 税局请求异常, requestOpt', tempRequstOpt);
            ctx.service.log.info('OpenInvoice commonRequest, 税局数据处理异常, res', res);
            const { Message = '税局请求异常, 请稍后再试', Code } = jsonData.Response.Error;
            // 税局提示需要重新登录
            if (Message.indexOf('请重新登录') !== -1) {
                pwyStore.delete(etaxLoginedCachePreKey + loginData.pageId);
                return errcodeInfo.govLogout;
            }
            return {
                ...errcodeInfo.govErr,
                description: Code ? Message + `[${Code}]` : Message
            };
        }

        if (jsonData.Response && jsonData.Response.Data) {
            // 税局登录失效
            if (jsonData.Response.Data.CodeMsg === 'refresh') {
                pwyStore.delete(etaxLoginedCachePreKey + loginData.pageId);
                return errcodeInfo.govLogout;
            }
            return {
                ...errcodeInfo.success,
                data: jsonData.Response.Data
            };
        }
        // 禁止重试的直接返回
        if (opt.disabledRetry) {
            ctx.service.log.fullInfo('税局请求异常, jsonData', jsonData);
            return errcodeInfo.govErr;
        }

        // 允许重试的请求，可以重试请求
        ctx.service.log.info('retry request', retry);
        if (retry > 2) {
            return errcodeInfo.govErr;
        }
        const newRes: any = await this.commonRequest(loginData, url, opt, requestType, retry + 1);
        return newRes;
    }

    createItems(item: any, originItem: any) {
        const result = [];
        for (let i = 0; i < originItem.length; i++) {
            const curOriginItem = originItem[i];
            const discountType = curOriginItem.discountType + '';
            const goodsName = curOriginItem.goodsName + '';
            let xmmc = goodsName;
            const spfwjc = goodsName.split('*')[1] || '';
            const jcIndex = goodsName.indexOf('*', 1);
            if (jcIndex !== -1) {
                xmmc = goodsName.substring(jcIndex + 1);
            }

            // 正常明细行
            if (discountType === '0') {
                // 后台数据需要传不含税明细金额
                result.push({
                    JzjtlxDm: '', // 即征即退类型代码
                    SsyhzclxDm: curOriginItem.SsyhzclxDm || '', // 税收优惠政策类型代码
                    Sl: curOriginItem.num || '', // 数量，税局为string
                    Xmmc: xmmc,
                    Spfwjc: spfwjc, // 简称
                    Sphfwssflhbbm: curOriginItem.goodsCode || '', // 税收分类编码
                    Ggxh: curOriginItem.specModel || '',
                    Dw: curOriginItem.unit || '',
                    Dj: curOriginItem.unitPrice || '',
                    Slv: curOriginItem.taxRate + '', // 税率，税局字符串
                    Je: parseFloat(curOriginItem.detailAmount), // number
                    Se: curOriginItem.taxAmount || '',
                    Kce: curOriginItem.deduction || '', // 扣除额
                    Xh: i + 1,
                    Zkje: curOriginItem.discountAmount ? parseFloat(curOriginItem.discountAmount) : '',
                    Spsl: curOriginItem.num ? parseFloat(curOriginItem.num) : '', // number
                    FphxzDm: discountType
                });
            // 被折扣行
            } else if (discountType === '2') {
                result.push({
                    JzjtlxDm: '', // 即征即退类型代码
                    SsyhzclxDm: curOriginItem.SsyhzclxDm || '', // 税收优惠政策类型代码
                    Sl: curOriginItem.num || '', // 数量，税局为string
                    Xmmc: xmmc,
                    Spfwjc: spfwjc, // 简称
                    Sphfwssflhbbm: curOriginItem.goodsCode || '', // 税收分类编码
                    Ggxh: curOriginItem.specModel || '',
                    Dw: curOriginItem.unit || '',
                    Dj: curOriginItem.unitPrice || '',
                    Slv: curOriginItem.taxRate + '', // 税率，税局字符串
                    Je: parseFloat(curOriginItem.detailAmount), // number
                    Se: curOriginItem.taxAmount || '',
                    Kce: curOriginItem.deduction || '', // 扣除额
                    Xh: i + 1,
                    Zkje: curOriginItem.discountAmount ? parseFloat(curOriginItem.discountAmount) : '',
                    Spsl: curOriginItem.num ? parseFloat(curOriginItem.num) : '', // number
                    Zkxh1: 0,
                    FphxzDm: discountType
                });
            // 折扣行
            } else if (discountType === '1') {
                result.push({
                    Xh: i + 1,
                    FphxzDm: '1',
                    Zkxh1: 0,
                    Xmmc: xmmc,
                    Spfwjc: spfwjc, // 简称
                    Je: parseFloat(curOriginItem.detailAmount), // number,
                    Slv: curOriginItem.taxRate + '', // 税率，税局字符串
                    Se: curOriginItem.taxAmount || '',
                    Spsl: curOriginItem.num ? parseFloat(curOriginItem.num) : '' // number
                });
            }
        }
        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    // 根据excel导入的数据格式生成开票数据字段
    /* eslint-disable-next-line complexity */
    changeOpeninvoiceData(invoiceOpenData: any, govUid: string) {
        const outItem = invoiceOpenData.govData;
        const originData = invoiceOpenData.originData;
        const item = outItem.PlkjRequestVO;
        const {
            invoiceAmount,
            totalTaxAmount,
            totalAmount
        } = originData;
        const originItem = originData.items || [];
        if (!invoiceAmount || !totalTaxAmount || !totalAmount) {
            return {
                ...errcodeInfo.argsErr,
                description: '参数错误, 开具金额，税额，价税合计不能为空！'
            };
        }

        const newItemsRes = this.createItems(item.MxzbList, originItem);
        let newItems = [];
        if (newItemsRes.errcode !== '0000') {
            return newItemsRes;
        }
        newItems = newItemsRes.data;
        return {
            'EwmId': '',
            'FppzDm': item.FppzDm,
            'TdyslxDm': item.TdyslxDm,
            'ZpFppzDm': item.ZpFppzDm || '',
            'Sfwzzfp': item.Sfwzzfp || 'N',
            'CezslxDm': item.CezslxDm || '',
            'JazslxDm': item.JazslxDm || '',
            'Xsfdz': originData.salerAddress, // '广东省东莞市松山湖园区工业西路15号1栋902室',
            'Xsfkhh': originData.salerCardName, // '招商银行股份有限公司东莞松山湖支行',
            'Xsflxdh': originData.salerPhone, // '13823695960',
            'Xsfmc': originData.salerName, // '金蝶云科技有限公司',
            'Xsfnsrsbh': originData.salerTaxNo, // '91441900MA53JJ2740',
            'Xsfshxydm': '',
            'Xsfyhzh': originData.salerCardNumber, // '769908088710666',
            'Cpuid': item.Cpuid || '',
            'CpydjToolow': item.CpydjToolow || '',
            'Fhr': item.Fhr || '',
            'Fpdm': item.Fpdm || '',
            'Zzfphm': item.Zzfphm || '',
            'Fphm': item.Fphm || '',
            'FpkjfsDm': item.FpkjfsDm || '',
            'Gmfdjxh': item.Gmfdjxh || '',
            'Gmfdz': item.Gmfdz || '',
            'Gmfjbr': item.Gmfdz || '',
            'Gmfkhh': item.Gmfkhh || '',
            'Gmflxdh': item.Gmflxdh || '',
            'Gmfmc': item.Gmfmc,
            'Gmfnsrsbh': item.Gmfnsrsbh,
            'Gmfshxydm': item.Gmfshxydm || '',
            'Gmfyhzh': item.Gmfyhzh,
            'Hjje': item.Hjje || originData.invoiceAmount,
            'Hjse': item.Hjse || originData.totalTaxAmount,
            'Htbh': item.Htbh || '',
            'Ip': item.Ip || '',
            'Jbrlxdh': item.Jbrlxdh || '',
            'Jbrsfzjhm': item.Jbrsfzjhm || '',
            'JbrsfzjzlDm': item.JbrsfzjzlDm || '',
            'Jehj': item.Jehj || 0,
            'JsfsDm': item.JsfsDm || '',
            'Jshj': item.Jshj || originData.totalAmount,
            'Kce': item.Kce || 0,
            'Kpfnsrsbh': outItem.Kpfnsrsbh || '',
            'Kpr': originData.drawer || '', // item.Kpr 开票人
            'Kprq': item.Kprq || '',
            'Kprsrrzdzxx': item.Kprsrrzdzxx || '',
            'Macdz': item.Macdz || '',
            'Nsrdqm': item.Nsrdqm || '',
            'Nsywfssj': item.Nsywfssj || '',
            'Ptbm': item.Ptbm || '',
            'Sflzfpbz': item.Sflzfpbz || 'Y',
            'SgfplxDm': item.SgfplxDm || '',
            'Sjkpdzxx': item.Sjkpdzxx || '',
            'Skr': item.Skr || '',
            'Skyh': item.Skyh || '',
            'Skyhmc': item.Skyhmc || '',
            'Skzh': item.Skzh || '',
            'Spsl': item.Spsl || '',
            'SrrzId': item.SrrzId || '',
            'XsfDjxh': item.XsfDjxh || '',
            'Bz': item.Bz || '',
            'CurTemplate': item.CurTemplate || '',
            'Hsbz': item.Hsbz,
            'Kjly': item.Kjly || '',
            'GmfZrrbs': item.GmfZrrbs,
            'XsfZrrbs': item.XsfZrrbs,
            'EscxstyfpZzfpdm': item.EscxstyfpZzfpdm || '',
            'EscxstyfpZzfphm': item.EscxstyfpZzfphm || '',
            'EscxstyfpFphm': item.EscxstyfpFphm || '',
            'MxzbList': newItems,
            'CepzmxList': item.CepzmxList,
            'JzfwTdys': item.JzfwTdys,
            'JzfwfpmxList': item.JzfwfpmxList || [],
            'BdcTdys': item.BdcTdys || null,
            'BdcMxTdysList': item.BdcMxTdysList || [],
            'HwysfwdzfpmxbList': item.HwysfwdzfpmxbList || null,
            'LkysfwTdysList': item.LkysfwTdysList || null,
            'DzccsTdys': item.DzccsTdys || null,
            'TxfList': item.TxfList || null,
            'TljhLhsgj': item.TljhLhsgj || null,
            'JdcxsTdysList': item.JdcxsTdysList || [],
            'EscxsTdys': item.EscxsTdys || {},
            'EscxsTdysList': item.EscxsTdysList || [],
            'Ylfw': item.Ylfw || null,
            'Qtzjhmbz': item.Qtzjhmbz || false,
            'Fplsh': outItem.Lsh,
            'Gmfyx': '', // 购方邮箱
            'JbrgjDm': item.JbrgjDm || '',
            'JbrZrrNsrsbh': item.JbrZrrNsrsbh || '',
            'FjysList': item.FjysList || [],
            'CktsTdysList': item.CktsTdysList || null,
            'Kjlp': govUid
        };
    }

    // 只通过s3上次文件返回地址
    async s3UploadFile(opt: {
        filePath: string;
    }): Promise<UploadFileReturn> {
        const ctx = this.ctx;
        const { access_token, taxNo, client_id } = ctx.request.query;
        const { filePath } = opt;
        const reqid = ctx.uid;
        const url = ctx.app.config.baseUrl + '/rpa/file/upload/v1?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'common'
            },
            data: {
                user: client_id,
                createSnapshot: 0
            },
            files: { file: filePath }
        });
        ctx.service.log.info('数电文件上传返回', res);
        return res;
    }

    /**
     * 文件上传
     * @param {opt} opt 文件上传对象
     * @returns {UploadFileReturn} 文件上传结果
     */
    async uploadFile(opt: {
        serialNo: string;
        invoiceNo: string;
        govSerialNo: string;
        invoiceDate: string;
        filePath: string;
        fileType: string;
    }): Promise<UploadFileReturn> {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query;
        const { serialNo, invoiceNo, govSerialNo = '', invoiceDate, filePath, fileType } = opt;

        const reqid = ctx.uid;
        const url = ctx.app.config.baseUrl + '/rpa/file/upload/v2?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const paramData = {
            serialNo, // 开票流水号
            invoiceNo, // 发票代码
            govSerialNo, // 税局开票流水号
            invoiceDate, // 开票日期
            status: '1', // 当前为开票成功上传 开票状态0:未开票 1，开具成功，2, 开具中，3，开具失败
            fileSuffix: fileType.toLowerCase(), // 文件类型
            timestamp: (+new Date())
        };
        ctx.service.log.info('数电开票文件上传url', url);
        ctx.service.log.info('数电开票文件上传相关参数', filePath, paramData);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'common'
            },
            data: paramData,
            files: { file: filePath }
        });
        ctx.service.log.info('数电开票文件上传返回', res);
        return res;
    }

    /**
     * 进项文件上传
     * @param {opt} opt 文件上传对象
     * @returns {UploadFileReturn} 文件上传结果
     */
    async uploadInputFile(opt: {
        serialNo: string;
        invoiceNo: string;
        invoiceDate: string;
        filePath: string;
        fileType: string;
    }): Promise<UploadFileReturn> {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query;
        const { serialNo = '', invoiceNo, invoiceDate, filePath, fileType } = opt;

        const reqid = ctx.uid;
        const url = ctx.app.config.baseUrl + '/rpa/input/invoice/download/update?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const fileTypeLow = fileType.toLowerCase();
        let fileTypeInt;
        let xmlFile = '';
        let pdfFile = '';
        let ofdFile = '';
        if (fileTypeLow === 'ofd') {
            fileTypeInt = 1;
            ofdFile = filePath;
        } else if (fileTypeLow === 'pdf') {
            fileTypeInt = 2;
            pdfFile = filePath;
        } else if (fileTypeLow === 'xml') {
            fileTypeInt = 3;
            xmlFile = filePath;
        }
        const paramData = {
            taxNo,
            fileType: fileTypeInt,
            xmlFile,
            ofdFile,
            pdfFile,
            invoiceCode: '',
            invoiceDate,
            invoiceNo,
            serialNo
        };

        ctx.service.log.info('进项数电开票文件上传url', url);
        ctx.service.log.info('进项数电开票文件上传相关参数', filePath, paramData);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            contentType: 'json',
            headers: {
                'client-platform': 'common'
            },
            data: paramData
        });
        ctx.service.log.info('进项数电开票文件上传返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        return {
            ...errcodeInfo.success,
            data: {
                originalUrl: filePath
            }
        };
    }

    async fixInvoiceDate(loginData: any, opt: any) {
        const ctx = this.ctx;
        const queryParam = {
            startDate: opt.date,
            endDate: opt.date,
            invoiceNo: opt.invoiceNo,
            gjbq: opt.downloadType === 'openInvoice' ? '1' : '2',
            page: 1,
            pageSize: 10
        };
        let infoRes = await ctx.service.openInvoiceQuery.queryOpenInvoices(loginData, queryParam);
        ctx.service.log.info('修复开票日期查询返回', opt.downloadType, infoRes);
        if (infoRes.errcode !== '0000') {
            return infoRes;
        }
        if (!infoRes.data || infoRes.data?.length === 0) {
            infoRes = await ctx.service.openInvoiceQuery.queryOpenInvoices(loginData, {
                ...queryParam,
                gjbq: queryParam.gjbq === '1' ? '2' : '1'
            });
            ctx.service.log.info('修复开票日期查询返回', opt.downloadType, infoRes);
        }
        if (infoRes.errcode !== '0000') {
            return infoRes;
        }
        if (!infoRes.data || infoRes.data.length === 0) {
            return {
                ...errcodeInfo.argsErr,
                description: '未查询到该发票'
            };
        }
        const invoiceDate = infoRes.data[0].invoiceDate;
        return {
            ...errcodeInfo.success,
            data: invoiceDate
        };
    }

    // 如果已经获取到税局交互二维码地址，可以直接下载发票文件不需要登录
    /* eslint-disable-next-line */
    async downloadInvoiceFile(invoiceInfo: invoiceInfoType) {
        const ctx = this.ctx;
        // downloadType 默认开票类型文件的下载
        const { serialNo, govSerialNo, invoiceNo, fileType } = invoiceInfo;
        let invoiceDate = invoiceInfo.invoiceDate;
        let govInvoiceQrUrl = invoiceInfo.govInvoiceQrUrl || '';
        const downloadType = invoiceInfo.downloadType || 'openInvoice';
        const queryInfo = ctx.request.query;
        const taxNo = queryInfo.taxNo;
        const saveDirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo, 'openInvoice');
        let filePath = '';
        if (fileType === 'OFD') {
            filePath = path.join(saveDirPath, invoiceNo + '.ofd');
        } else if (fileType === 'PDF') {
            filePath = path.join(saveDirPath, invoiceNo + '.pdf');
        } else if (fileType === 'XML') {
            filePath = path.join(saveDirPath, invoiceNo + '.zip');
        } else {
            return {
                ...errcodeInfo.argsErr,
                description: '文件类型参数错误'
            };
        }
        const { decryedData = {} } = ctx.request.body;

        // 调试开票，不实际到税局下载发票
        if (decryedData.debugOpenInvoice === true) {
            return {
                ...errcodeInfo.success,
                data: {
                    fileType,
                    filePath: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/testFile'
                }
            };
        }

        let kprqStr = invoiceDate.replace(/[^0-9]/g, '');
        ctx.service.log.info('传入的税局发票二维码地址', govInvoiceQrUrl, invoiceNo, invoiceDate);
        // 地址不存在或者不正确时查询开票历史获取税局二维码地址
        if (!govInvoiceQrUrl && govInvoiceQrUrl.indexOf(invoiceNo) === -1 && serialNo) {
            const openRes = await ctx.service.openHistory.query(serialNo);
            ctx.service.log.info('查询开票历史返回', openRes);
            if (openRes.errcode !== '0000') {
                ctx.service.log.info('查询开票历史异常');
            }
            const openResData = openRes.data || {};
            govInvoiceQrUrl = openResData.govInvoiceQrUrl || '';
        }

        if (!govInvoiceQrUrl && govInvoiceQrUrl.indexOf(invoiceNo) === -1) {
            ctx.service.log.info('税局二维码地址为空或不正确，需要检查登录状态然后查询税局', govInvoiceQrUrl);
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            const date = invoiceDate.substring(0, 10);
            const time = invoiceDate.substring(11);
            // 时间不正确进行修复
            if (time === '00:00:00' || time === '') {
                const infoRes = await this.fixInvoiceDate(checkRes.data, {
                    date,
                    invoiceNo,
                    downloadType
                });
                if (infoRes.errcode !== '0000') {
                    return infoRes;
                }
                invoiceDate = infoRes.data;
                ctx.service.log.info('新的开票日期为', invoiceDate);
                invoiceInfo.invoiceDate = invoiceDate;
                kprqStr = invoiceDate.replace(/[^0-9]/g, '');
            }
            const qrRes = await this.getInvoiceQrAddress({
                invoiceNo,
                invoiceDate,
                serialNo
            });
            if (qrRes.errcode === '0000') {
                govInvoiceQrUrl = qrRes.data?.govInvoiceQrUrl || '';
            }
        }

        // 湖北税局先通过登录方式下载
        if (!govInvoiceQrUrl || govInvoiceQrUrl.indexOf('dppt.hubei') !== -1 ||
        govInvoiceQrUrl.indexOf('dppt.heilongjiang') !== -1 || govInvoiceQrUrl.indexOf('dppt.liaoning') !== -1) {
            const resOther = await this.downloadInvoiceFileByLogin(invoiceInfo);
            return resOther;
        }

        const timeStr = (+new Date());
        const urlInfo = moduleUrl.parse(govInvoiceQrUrl);
        const baseUrl = urlInfo.protocol + '//' + urlInfo.host;
        const pathInfo = urlInfo.path.split('/');
        const qrInvoiceInfo = pathInfo[pathInfo.length - 1].split('_');
        const qrDate = qrInvoiceInfo[2].substring(0, 14);
        const jym = qrInvoiceInfo[2].substring(19);
        const userAgent = ctx.service.ntTools.getUserAgent();
        const timeStampId = +new Date();
        const exportUrlPath = `${baseUrl}/kpfw/fpjfzz/v1/exportDzfpwjEwm`;
        const govReqUrl = `${exportUrlPath}?Wjgs=${fileType}&Jym=${jym}&Fphm=${invoiceNo}&Kprq=${qrDate}&Czsj=${timeStr}&fileName=&timeStampId=${timeStampId}`;
        const res = await ctx.service.tools.httpRequest(govReqUrl, {
            method: 'GET',
            timeout: 120000,
            headers: {
                'User-Agent': userAgent,
                'Referer': baseUrl
            }
        });
        const resHeaders = res.headers || {};
        const contentType = resHeaders['content-type'] || '';
        ctx.service.log.info('通过交互二维码下载返回', contentType);
        const dataInfo = {
            govInvoiceQrUrl,
            govInvoiceUrl: govReqUrl
        };

        if (contentType.indexOf('text/html') !== -1 || contentType.indexOf('json') !== -1 ||
        res.status !== 200 || !res.data || res.data?.length === 0) {
            ctx.service.log.info('税局请求异常', govReqUrl, res.data?.length);
            return {
                ...errcodeInfo.govErr,
                data: dataInfo
            };
        }
        mkdirsSync(saveDirPath);
        // 通过接口请求直接拿到buffer
        fs.writeFileSync(filePath, res.data);
        let upRes;
        ctx.service.log.info('文件下载类型', downloadType);
        if (downloadType === 'openInvoice' && serialNo) {
            upRes = await this.uploadFile({
                serialNo,
                invoiceNo,
                govSerialNo,
                invoiceDate,
                filePath,
                fileType
            });
        } else if (downloadType === 'input') { // 进项版式文件上传，防止超时
            const tempUpRes = await this.s3UploadFile({
                filePath
            });
            if (tempUpRes.errcode !== '0000') {
                return {
                    ...tempUpRes,
                    data: dataInfo
                };
            }
            upRes = await this.uploadInputFile({
                serialNo,
                invoiceNo,
                invoiceDate,
                filePath: tempUpRes.data.originalUrl,
                fileType
            });
        } else {
            upRes = await this.s3UploadFile({
                filePath
            });
        }
        if (upRes.errcode !== '0000') {
            return {
                ...upRes,
                data: dataInfo
            };
        }
        return {
            ...errcodeInfo.success,
            data: {
                govInvoiceQrUrl,
                fileType,
                filePath: upRes.data.originalUrl,
                govInvoiceUrl: govReqUrl || ''
            }
        };
    }

    // 需要登录才能下载税局开票文件
    async downloadInvoiceFileByLogin(invoiceInfo: invoiceInfoType) {
        const ctx = this.ctx;
        const { serialNo, govSerialNo, invoiceNo, invoiceDate, fileType, type } = invoiceInfo;
        const queryInfo = ctx.request.query;
        const taxNo = queryInfo.taxNo;
        const saveDirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo, 'openInvoice');
        let filePath = '';
        if (fileType === 'OFD') {
            filePath = path.join(saveDirPath, invoiceNo + '.ofd');
        } else if (fileType === 'PDF') {
            filePath = path.join(saveDirPath, invoiceNo + '.pdf');
        } else if (fileType === 'XML') {
            filePath = path.join(saveDirPath, invoiceNo + '.zip');
        } else {
            return {
                ...errcodeInfo.argsErr,
                description: '文件类型参数错误'
            };
        }

        const kprqStr = invoiceDate.replace(/[^0-9]/g, '');
        let Qzlx = '02';

        // 红票
        if ((type + '') === '1') {
            Qzlx = '';
        }

        const downloadUrl = `/kpfw/fpjfzz/v1/exportDzfpwj?Fphm=${invoiceNo}&Qzlx=${Qzlx}&Kprq=${kprqStr}&Wjgs=${fileType}`;
        ctx.service.log.info('开票文件下载，税局请求地址', downloadUrl);

        const { decryedData = {} } = ctx.request.body;
        // 调试开票，不实际到税局下载发票
        if (decryedData.debugOpenInvoice === true) {
            return {
                ...errcodeInfo.success,
                data: {
                    fileType,
                    filePath: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/testFile'
                }
            };
        }
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const loginData = checkRes.data || {};
        const res : any = await ctx.service.nt.ntDownload(loginData.pageId, downloadUrl, {
            saveDirPath,
            filePath
        });
        if (res.errcode !== '0000') {
            return res;
        }
        ctx.service.log.info('税局文件保存路径', filePath);
        let upRes;
        if (serialNo) {
            upRes = await this.uploadFile({
                serialNo,
                invoiceNo,
                govSerialNo,
                invoiceDate,
                filePath,
                fileType
            });
        } else {
            upRes = await this.s3UploadFile({
                filePath
            });
        }

        if (upRes.errcode !== '0000') {
            return upRes;
        }
        return {
            ...errcodeInfo.success,
            data: {
                fileType,
                filePath: upRes.data.originalUrl
            }
        };
    }

    async downloadInvoiceFiles(invoiceInfo: invoiceInfoType, cacheOpenInfo: any = {}) {
        const ctx = this.ctx;
        const { ofdUrl = '', pdfUrl = '', xmlUrl = '' } = cacheOpenInfo;
        const { serialNo, govSerialNo, invoiceNo, invoiceDate } = invoiceInfo;
        let govInvoiceQrUrl = invoiceInfo.govInvoiceQrUrl || '';
        const fileTypes = ['OFD', 'PDF', 'XML'];
        const needDownloadTypes = [];
        const filePaths : any = {};
        const pList = [];
        let filePath;
        const queryInfo = ctx.request.query;
        const taxNo = queryInfo.taxNo;
        const disableCache = queryInfo.disableCache;
        const saveDirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo, 'openInvoice');
        const { decryedData = {} } = ctx.request.body;
        if (decryedData.debugOpenInvoice === true) {
            const tempUrl = 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/testFile';
            ctx.service.log.info('debug模式不需要下载开票文件');
            return {
                ...errcodeInfo.success,
                data: {
                    ofdUrl: tempUrl,
                    pdfUrl: tempUrl,
                    xmlUrl: tempUrl
                }
            };
        }
        for (let i = 0; i < fileTypes.length; i++) {
            const curType : any = fileTypes[i];
            if (curType === 'OFD' && ofdUrl !== '') {
                filePaths[curType] = ofdUrl;
            } else if (curType === 'PDF' && pdfUrl !== '') {
                filePaths[curType] = pdfUrl;
            } else if (curType === 'XML' && xmlUrl !== '') {
                filePaths[curType] = xmlUrl;
            } else {
                if (curType === 'OFD') {
                    filePath = path.join(saveDirPath, invoiceInfo.invoiceNo + '.ofd');
                } else if (curType === 'PDF') {
                    filePath = path.join(saveDirPath, invoiceInfo.invoiceNo + '.pdf');
                } else if (curType === 'XML') {
                    filePath = path.join(saveDirPath, invoiceInfo.invoiceNo + '.zip');
                }
                if (ctx.service.tools.checkFileIsExsit(filePath, 24 * 60 * 60 * 1000, disableCache, 500)) { // 缓存存在
                    const upRes = await this.uploadFile({
                        serialNo,
                        invoiceNo,
                        govSerialNo,
                        invoiceDate,
                        filePath,
                        fileType: curType
                    });
                    if (upRes.errcode === '0000' && upRes.data?.originalUrl) {
                        filePaths[curType] = upRes.data.originalUrl;
                    }
                } else {
                    needDownloadTypes.push(curType);
                }
            }
        }

        // 需要下载的文件列表不为空
        if (needDownloadTypes.length > 0) {
            ctx.service.log.info('需要下载的文件类型', needDownloadTypes);
            if (!govInvoiceQrUrl) {
                ctx.service.log.info('交互二维码为空，需要重新获取');
                const qrRes = await this.getInvoiceQrAddress({
                    invoiceNo,
                    invoiceDate,
                    serialNo
                });
                if (qrRes.errcode === '0000') {
                    govInvoiceQrUrl = qrRes.data.govInvoiceQrUrl;
                }
            }
            for (let i = 0; i < needDownloadTypes.length; i++) {
                const curType = needDownloadTypes[i];
                pList.push(new Promise((resolve) => {
                    try {
                        this.downloadInvoiceFile({
                            ...invoiceInfo,
                            fileType: curType,
                            govInvoiceQrUrl
                        }).then((res) => {
                            resolve(res);
                        });
                    } catch (error) {
                        ctx.service.log.info('税局下载文件异常', error);
                        resolve(errcodeInfo.govErr);
                    }
                }));
            }
            try {
                const resList = await Promise.all(pList);
                for (let i = 0; i < resList.length; i++) {
                    const curRes : any = resList[i];
                    if (curRes.errcode === '0000') {
                        const resData = curRes.data || {};
                        filePaths[resData.fileType] = resData.filePath;
                    }
                }
            } catch (error) {
                ctx.service.log.info('downloadInvoiceFiles异常', error);
            }
        }
        return {
            ...errcodeInfo.success,
            data: {
                ofdUrl: filePaths['OFD'] || '',
                pdfUrl: filePaths['PDF'] || '',
                xmlUrl: filePaths['XML'] || ''
            }
        };
    }

    async startOpenInvoice(loginData: any, invoiceOpenData: any) {
        const ctx = this.ctx;
        const { decryedData = {} } = ctx.request.body;
        ctx.service.log.info('查询开具前的唯一id');
        let urlPath = '/kpfw/fjxx/v1/kjlp/get';
        // 查询开具前的唯一id
        const uidRes : any = await this.commonRequest(loginData, urlPath, {
            method: 'GET',
            dataType: 'text'
        });
        ctx.service.log.info('查询开具前的唯一id返回', uidRes);
        if (uidRes.errcode !== '0000') {
            return uidRes;
        }

        const outItem = invoiceOpenData.govData;
        ctx.service.log.fullInfo('对开票数据格式进行转换');
        const bodyData = this.changeOpeninvoiceData(invoiceOpenData, uidRes.data);

        // 开具发票
        urlPath = '/kpfw/lzfpkj/v1/tyfpkj';

        ctx.service.log.fullInfo('调用税局的开票地址', urlPath);
        ctx.service.log.fullInfo('调用税局的开票参数', bodyData);

        // 不触发实际开票，直接返回成功
        if (decryedData.debugOpenInvoice === true) {
            ctx.service.log.info('开具成功');
            await this.deleteOpenedBill(loginData, outItem.Lshuuid);
            return {
                ...errcodeInfo.success,
                data: {
                    invoiceNo: '6666666' + (+new Date()),
                    invoiceDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                    govSerialNo: outItem.Lshuuid,
                    serialNo: outItem.Lsh
                }
            };
        }

        const openRes : any = await this.commonRequest(loginData, urlPath, {
            method: 'POST',
            dataType: 'text',
            contentType: 'json',
            body: JSON.stringify(bodyData)
        });
        ctx.service.log.info('税局开具返回', openRes);
        if (openRes.errcode !== '0000') {
            ctx.service.log.fullInfo('开具失败', bodyData);
            return openRes;
        }
        const { Fphm, Kprq } = openRes.data;
        if (Fphm && Kprq) {
            ctx.service.log.info('开具成功');
            await this.deleteOpenedBill(loginData, outItem.Lshuuid);
            return {
                ...errcodeInfo.success,
                data: {
                    invoiceNo: Fphm,
                    invoiceDate: Kprq,
                    govSerialNo: outItem.Lshuuid,
                    serialNo: outItem.Lsh
                }
            };
        }
        ctx.service.log.info('开具异常, 未返回发票号码或开票日期');
        return openRes;
    }

    async deleteOpenedBill(loginData: any, Lshuuid: string) {
        const ctx = this.ctx;
        // const KpfnsrsbhArr = Lshuuid.split(',').map(() => {
        //     return loginData.taxNo;
        // });
        // const Kpfnsrsbh = KpfnsrsbhArr.join(',');
        const urlPath = '/kpfw/kjfs/v1/delpldr';

        ctx.service.log.info('删除旧流水号地址及参数', urlPath);
        const deleteRes : any = await this.commonRequest(loginData, urlPath, {
            method: 'POST',
            dataType: 'text',
            contentType: 'json',
            body: JSON.stringify({
                Kpfnsrsbh: '',
                Lshuuid: Lshuuid
            })
        });
        ctx.service.log.info('删除旧流水号返回', deleteRes);
        return deleteRes;
    }

    // 查询并筛选导入的发票待开列表
    async searchOpenList(loginData: any, fileJSONData: any[]) {
        const ctx = this.ctx;
        const fpyLshArr = fileJSONData.map((item) => {
            return item.serialNo;
        });
        let PageSize = 10;
        if (fpyLshArr.length > 10 && fpyLshArr.length < 20) {
            PageSize = 20;
        } else if (fpyLshArr.length > 20) {
            PageSize = 50;
        }
        let tempList: any[] = [];
        let goOn = true;
        let PageNum = 1;
        do {
            // 查询列表
            const urlPath = '/kpfw/kjfs/v1/pldrFpcx';
            const listRes : any = await this.commonRequest(loginData, urlPath, {
                method: 'POST',
                body: JSON.stringify({
                    PageNum,
                    PageSize
                }),
                dataType: 'text',
                contentType: 'json'
            });
            if (listRes.errcode !== '0000' || listRes.data.FppldrkjVOS.length === 0) {
                goOn = false;
                ctx.service.log.info('查询待开列表异常，税局返回', listRes);
                return listRes;
            }
            const curList = listRes.data.FppldrkjVOS || [];
            tempList = tempList.concat(curList);
            if (curList.length < PageSize) {
                goOn = false;
            } else {
                PageNum += 1;
            }
        } while (goOn);
        const resultList = [];
        const resultLsh : string [] = [];
        // 存在相同流水号，为了避免开具错误，需要重新导入
        const repeatFpyLsh = [];
        const needDeleteGovLsh = [];
        for (let i = 0; i < tempList.length; i++) {
            const curItem = tempList[i];
            const Lsh = curItem.Lsh;
            const index = fpyLshArr.indexOf(Lsh);
            // 需要开票的流水号收集起来，如果有重复，则记录到repeatFpyLsh
            if (index !== -1) {
                if (resultLsh.indexOf(Lsh) === -1) {
                    resultLsh.push(Lsh);
                    resultList.push({
                        govData: curItem,
                        originData: fileJSONData[index]
                    });
                } else if (repeatFpyLsh.indexOf(Lsh) === -1) {
                    repeatFpyLsh.push(Lsh);
                }
            }
        }

        // 查找到重复的税局流水号，然后删除
        if (repeatFpyLsh.length > 0) {
            for (let i = 0; i < tempList.length; i++) {
                const curItem = tempList[i];
                const Lsh = curItem.Lsh;
                const Lshuuid = curItem.Lshuuid;
                if (repeatFpyLsh.indexOf(Lsh) !== -1) {
                    needDeleteGovLsh.push(Lshuuid);
                }
            }
        }

        return {
            ...errcodeInfo.success,
            data: resultList,
            needDeleteGovLsh
        };
    }

    fixOpenGovMsg(msg: string) {
        let description = msg.replace(/批量导入/g, '');
        if (description.indexOf('发票明细信息模板:') !== -1) {
            const indexMatch = description.match(/^发票明细信息模板:第([0-9])行.*$/);
            if (indexMatch && indexMatch.length > 1) {
                const index = parseInt(indexMatch[1]) - 3;
                if (!isNaN(index)) {
                    description = description.replace(/^发票明细信息模板:第([0-9]+)行/, '发票明细信息:第' + index + '行');
                }
            }
        }
        return description;
    }

    async importExcel(loginData: any, filePath: string) {
        const ctx = this.ctx;
        // 导入批量开具excel
        const url = loginData.baseUrl + '/kpfw/excel/v1/importPlkj';
        const res : any = await this.commonRequest(loginData, url, {
            method: 'POST',
            files: { file: filePath },
            dataType: 'text'
        }, 'import');
        if (res.errcode !== '0000') {
            ctx.service.log.info('excel导入异常', res);
            if (res.description.indexOf('导入文件已更新！请重新下载导入模板') !== -1) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '税局接口已升级，请联系发票云！'
                };
            }
            return {
                ...res,
                description: this.fixOpenGovMsg(res.description)
            };
        }
        return res;
    }

    async createOpenExcel(loginData: any, data: any) {
        const ctx = this.ctx;
        const requestBody = ctx.request.body;
        const etaxAccountInfo = requestBody.etaxAccountInfo;
        const USER_DATA_PATH = ctx.app.config.USER_DATA_PATH;
        const etaxName = etaxAccountInfo.etaxName;
        // 读取开票模板
        const tplFilePath = path.join(USER_DATA_PATH, 'download/openInvoice/tpl', etaxName, 'NSR-开票业务-批量导入开票-导入开票模板004.xlsx');
        const wb = base_xlsx.readFile(tplFilePath, { type: 'file' });
        for (const item of data) {
            const { list, sheetName } = item;
            const ws = wb.Sheets[sheetName];
            base_xlsx.utils.sheet_add_json(ws, list, {
                skipHeader: true,
                origin: 'A4'
            });
        }
        // 写入需要开票的数据
        const gxBf = base_xlsx.write(wb, { type: 'buffer' });
        const filePath = path.join(USER_DATA_PATH, 'uploadTemp', etaxAccountInfo.taxNo + '-kp-' + getUUId() + '.xlsx');
        fs.writeFileSync(filePath, gxBf);

        // 返回文件路径
        return {
            ...errcodeInfo.success,
            data: filePath
        };
    }

    // 蓝字发票开具
    /* eslint-disable complexity */
    async openBlueInvoiceByExcel(fileJSONData: any) {
        const ctx = this.ctx;
        ctx.service.log.info('查询是否已经开具过发票');
        const oldRes = await ctx.service.openHistory.query(fileJSONData.serialNo);
        ctx.service.log.info('查询是否已经开具过发票接口返回', oldRes);
        if (oldRes.errcode !== '0000') {
            return oldRes;
        }
        const oldResData = oldRes.data || {};
        // 已经开具成功过的发票，直接返回
        if (oldResData && oldResData.invoiceNo && oldResData.invoiceNo.length > 7) {
            return {
                ...errcodeInfo.success,
                data: {
                    invoiceCode: oldResData.invoiceCode || '',
                    invoiceNo: oldResData.invoiceNo || '',
                    invoiceDate: oldResData.invoiceDate || '',
                    govSerialNo: oldResData.govSerialNo || '',
                    serialNo: oldResData.serialNo || '',
                    ofdUrl: oldResData.ofdUrl || '',
                    pdfUrl: oldResData.pdfUrl || '',
                    xmlUrl: oldResData.xmlUrl || '',
                    availableVolume: '',
                    totalVolume: ''
                }
            };
        }

        ctx.service.log.info('开票校验 start');
        const excelRes = await ctx.service.etaxOpen.generateExcelTemplate(fileJSONData);
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

        const filePath = excelRes.data;
        // await randomSleep(1000, 2000);
        ctx.service.log.info('开始导入开票excel');
        const importRes = await this.importExcel(loginData, filePath);
        ctx.service.log.info('导入开票excel返回', importRes);
        if (importRes.errcode !== '0000') {
            return importRes;
        }
        ctx.service.log.info('开始查询待开列表');
        const listRes = await this.searchOpenList(loginData, [fileJSONData]);
        ctx.service.log.info('查询待开列表返回', listRes);
        if (listRes.errcode !== '0000') {
            return listRes;
        }
        let listData = listRes.data || [];
        let needDeleteGovLsh = listRes.needDeleteGovLsh || [];
        if (needDeleteGovLsh.length > 0) {
            ctx.service.log.info('查询开票列表中有重复流水号，需要删除旧的，然后重新导入');
            const res = await this.deleteOpenedBill(loginData, needDeleteGovLsh.join(','));
            ctx.service.log.info('删除旧流水号返回', res);
            if (res.errcode !== '0000') {
                return res;
            }
            // await randomSleep(1000, 2000);
            ctx.service.log.info('excel模板再次导入');
            const importRes2 = await this.importExcel(loginData, filePath);
            ctx.service.log.info('excel模板再次导入，返回', importRes2);
            if (importRes2.errcode !== '0000') {
                return importRes2;
            }
            ctx.service.log.info('开始再次查询待开列表');
            const listRes2 = await this.searchOpenList(loginData, [fileJSONData]);
            ctx.service.log.info('再次查询待开列表返回', listRes2);
            if (listRes2.errcode !== '0000') {
                return listRes2;
            }
            listData = listRes2.data || [];
            needDeleteGovLsh = listRes2.needDeleteGovLsh || [];
            if (needDeleteGovLsh.length > 0) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '待开数据重复，请检查!'
                };
            }
        }

        if (listData.length === 0) {
            return {
                ...errcodeInfo.argsErr,
                description: '未查询到待开发票数据'
            };
        }

        const invoiceOpenData = listData[0];
        ctx.service.log.info('开始通过开票数据开具发票', invoiceOpenData);

        const openRes = await this.startOpenInvoice(loginData, invoiceOpenData);
        ctx.service.log.info('通过开票数据开具发票返回', openRes);
        if (openRes.errcode !== '0000') {
            return {
                errcode: openRes.errcode,
                description: openRes.description
            };
        }
        const availableVolumeRes = await ctx.service.openInvoiceQuery.updateAvailableVolume(loginData.pageId, invoiceAmount);
        ctx.service.log.info('授信额度更新返回', loginData.pageId, invoiceAmount, availableVolumeRes);
        const { invoiceDate, invoiceNo, govSerialNo, serialNo } = openRes.data || {};
        ctx.service.log.info('开始下载开票文件');

        // 获取RPA预生成发票链接
        const resRPAPreGeneration = ctx.service.openInvoice.getRPAPreGenerationUrl(serialNo);
        if (resRPAPreGeneration.errcode !== '0000') {
            return resRPAPreGeneration;
        }
        const cacheFiles = resRPAPreGeneration.data;

        const openResult = {
            invoiceCode: '',
            invoiceNo,
            invoiceDate,
            govSerialNo,
            serialNo,
            ...cacheFiles,
            ...availableVolumeRes // availableVolume, totalVolume
        };
        // 上传开票历史时需置空固定地址
        await ctx.service.openHistory.add({
            ...openResult,
            status: 1,
            ofdUrl: '',
            pdfUrl: '',
            xmlUrl: ''
        });
        // 先上传开票历史 开具成功异步处理 无校验串号
        this.downloadInvoiceFiles({
            invoiceDate,
            serialNo,
            govSerialNo,
            invoiceNo,
            invoiceType: fileJSONData.invoiceType,
            type: fileJSONData.type
        });
        return {
            ...errcodeInfo.success,
            data: openResult
        };
    }

    // 获取RPA预生成发票链接
    getRPAPreGenerationUrl(serialNo: string) {
        const ctx = this.ctx;
        const { tenantNo, taxNo } = ctx.request.query;

        if (!tenantNo || !taxNo || !serialNo) {
            return errcodeInfo.argsErr;
        }

        // 预览文件类型：0-pdf 1-ofd 2-png 3-xml
        return {
            ...errcodeInfo.success,
            data: {
                ofdUrl: `${ctx.app.config.baseUrl}/rpa/free/preview/${tenantNo}/${taxNo}/${serialNo}?type=1`,
                pdfUrl: `${ctx.app.config.baseUrl}/rpa/free/preview/${tenantNo}/${taxNo}/${serialNo}?type=0`,
                xmlUrl: `${ctx.app.config.baseUrl}/rpa/free/preview/${tenantNo}/${taxNo}/${serialNo}?type=3`,
                snapshotUrl: `${ctx.app.config.baseUrl}/rpa/free/preview/${tenantNo}/${taxNo}/${serialNo}?type=2`
            }
        };
    }

    async getInvoiceQrAddress(opt : {
        invoiceNo: string;
        invoiceDate: string;
        serialNo?: string;
    }) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const { invoiceNo, invoiceDate } = opt;
        if (!invoiceNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '发票号码不能为空'
            };
        }
        if (!invoiceDate || invoiceDate.length !== 19) {
            return {
                ...errcodeInfo.argsErr,
                description: '开票日期参数错误，参数格式为：YYYY-MM-DD HH:mm:ss'
            };
        }

        const urlPath = '/kpfw/fpjfzz/v1/getFpjfEwmjf';
        const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
            method: 'post',
            dataType: 'json',
            contentType: 'json',
            body: {
                fphm: opt.invoiceNo,
                kprq: invoiceDate.replace(/[^0-9]/g, '')
            }
        });
        ctx.service.log.info('税局查询交付二维码返回', res);
        if (res.errcode !== '0000') {
            return {
                errcode: res.errcode,
                description: res.description
            };
        }
        const data = res.data || '';
        if (!data) {
            ctx.service.log.info('税局查询交付二维码返回为空');
            return errcodeInfo.govErr;
        }

        if (data.indexOf(opt.invoiceNo) === -1) {
            ctx.service.log.info('税局查询二维码异常', data);
            return {
                ...errcodeInfo.govErr,
                description: data
            };
        }

        // 有传流水号可以存储到数据库
        if (opt.serialNo) {
            await ctx.service.openHistory.update({
                serialNo: opt.serialNo,
                govInvoiceQrUrl: data
            });
        }

        return {
            ...errcodeInfo.success,
            data: {
                govInvoiceQrUrl: data
            }
        };
    }
}
import { PluginBaseController } from './pluginBaseController';

export class OpenInvoice extends PluginBaseController {
    constructor(opt: BaseControllerOptType) {
        super(opt);
    }

    async queryBlueInvoiceOpenInfo() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequest(true);
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const res = await ctx.service.openInvoiceQuery.queryBlueInvoiceOpenInfo();
        return await this.responseJson(res);
    }

    // 纸质发票作废
    async cancelPaperInvoice() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};
        const res = await ctx.service.openEtaxPaperInvoice.cancelPaperInvoice(loginData, decryedData);
        return await this.responseJson(res);
    }

    async openInvoice() {
        const ctx = this.ctx;
        ctx.service.log.info('plugin openInvoice---------------');
        try {
            const checkRes = await ctx.service.ntTools.checkRequest(true);
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const { decryedData = {} } = ctx.request.body;
            const paperInvoiceType = decryedData.paperInvoiceType || 1;
            let invoiceType = decryedData.invoiceType || '';
            invoiceType = parseInt(invoiceType);
            const type = decryedData.type;
            if (type !== 0 && type !== 1) {
                return await this.responseJson({
                    ...errcodeInfo.argsErr,
                    description: '开票类型错误，请检查!'
                });
            }
            // 数电纸质发票
            if (paperInvoiceType === 2) {
                // 蓝票
                if (type === 0) {
                    const res = await ctx.service.openEtaxPaperInvoice.open(decryedData);
                    return await this.responseJson(res);
                }
                const res = await ctx.service.openRedInvoice.openInvoice(decryedData);
                return await this.responseJson(res);
            } else if (paperInvoiceType === 1) {
                // 数电发票，蓝票
                if (type === 0) {
                    const res = await ctx.service.openSingleInvoice.open(decryedData);
                    return await this.responseJson(res);
                }
                // 数电发票，红票
                const res = await ctx.service.openRedInvoice.openInvoice(decryedData);
                return await this.responseJson(res);
            }
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '数电票类型错误，请检查!'
            });
        } catch (error) {
            ctx.service.log.info('单张开具发票异常', error.toString());
            return await this.responseJson(errcodeInfo.govErr);
        }
    }

    async downloadInvoiceFile() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequest(true);
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { tenantNo } = ctx.request.query;
        const list = ['367076015893019648'];
        if (list.includes(tenantNo)) {
            return await this.responseJson({
                ...errcodeInfo.argsErr
            });
        }
        const { decryedData = {} } = ctx.request.body;
        const { invoiceNo, serialNo, invoiceDate, govInvoiceQrUrl = '' } = decryedData;
        const downloadType = decryedData.downloadType || 'openInvoice';
        let fileType = decryedData.fileType;
        if (fileType === 1) {
            fileType = 'OFD';
        } else if (fileType === 2) {
            fileType = 'PDF';
        } else if (fileType === 3) {
            fileType = 'XML';
        } else {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '文件类型参数错误，请检查！'
            });
        }

        if (!invoiceNo) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '发票号码参数不能为空！'
            });
        }

        if (invoiceNo.length !== 20) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '发票号码参数错误，请检查！'
            });
        }

        if (!invoiceDate) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '开票日期参数不能为空！'
            });
        }

        if (invoiceDate.length !== 19 && invoiceDate.length !== 10) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '开票日期格式错误，请检查！'
            });
        }
        let localFilePath = '';
        const queryInfo = ctx.request.query;
        const taxNo = queryInfo.taxNo;

        const disableCache = queryInfo.disableCache;
        const saveDirPath = path.join(ctx.app.config.govDownloadZipDir, taxNo, 'openInvoice');

        if (fileType === 'OFD') {
            localFilePath = path.join(saveDirPath, invoiceNo + '.ofd');
        } else if (fileType === 'PDF') {
            localFilePath = path.join(saveDirPath, invoiceNo + '.pdf');
        } else if (fileType === 'XML') {
            localFilePath = path.join(saveDirPath, invoiceNo + '.zip');
        }

        // 已经下载过, 或文件已经过期，指定不走缓存，文件大小小于500字节属于异常文件
        if (ctx.service.tools.checkFileIsExsit(localFilePath, 24 * 60 * 60 * 1000, disableCache, 500)) {
            ctx.service.log.info('文件有缓存直接使用', downloadType);
            let upRes;
            if (downloadType === 'openInvoice' && serialNo) {
                upRes = await ctx.service.openInvoice.uploadFile({
                    serialNo: serialNo || '',
                    invoiceNo: invoiceNo,
                    invoiceDate: invoiceDate,
                    filePath: localFilePath,
                    fileType
                });
            } else if (downloadType === 'input') {
                const tempUpRes = await ctx.service.openInvoice.s3UploadFile({
                    filePath: localFilePath
                });
                if (tempUpRes.errcode !== '0000') {
                    return await this.responseJson(tempUpRes);
                }
                upRes = await ctx.service.openInvoice.uploadInputFile({
                    serialNo,
                    invoiceNo,
                    invoiceDate,
                    filePath: tempUpRes.data.originalUrl,
                    fileType
                });
            } else {
                upRes = await ctx.service.openInvoice.s3UploadFile({
                    filePath: localFilePath
                });
            }

            if (upRes.errcode !== '0000') {
                return await this.responseJson(upRes, true);
            }
            return await this.responseJson({
                ...errcodeInfo.success,
                data: {
                    govInvoiceQrUrl,
                    govInvoiceUrl: '',
                    url: upRes.data.originalUrl
                }
            });
        }
        ctx.service.log.info('文件缓存失效需要重新下载');
        const res = await ctx.service.openInvoice.downloadInvoiceFile({
            serialNo: serialNo || '',
            invoiceNo: invoiceNo,
            invoiceDate: invoiceDate,
            fileType,
            govInvoiceQrUrl,
            downloadType
        });
        if (res.errcode !== '0000') {
            return await this.responseJson(res, true);
        }
        const { filePath, govInvoiceQrUrl: qrUrl, govInvoiceUrl = '' } = res.data || {};
        return await this.responseJson({
            ...errcodeInfo.success,
            data: {
                govInvoiceQrUrl: qrUrl || '',
                govInvoiceUrl,
                url: filePath
            }
        });
    }

    async redInvoiceApply() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};
        let scanAuthRes = await ctx.service.scanFaceCheck.getEtaxNeedAuthStatus(loginData);
        ctx.service.log.info('扫脸认证检测返回', scanAuthRes);
        if (scanAuthRes.errcode !== '0000') {
            return await this.responseJson(scanAuthRes, false);
        }

        let needAuth = scanAuthRes.data;
        if (!needAuth) {
            const res = await ctx.service.openRedInvoice.submitRedConfirmBill(loginData, decryedData);
            // 税局返回异常描述，或者录入成功并返回确认单编号
            if (res.errcode !== '0000' || (res.errcode === '0000' && !!res.data?.redConfirmBillNo)) {
                return await this.responseJson(res);
            }
            scanAuthRes = await ctx.service.scanFaceCheck.getEtaxNeedAuthStatus(loginData, true);
            ctx.service.log.info('扫脸认证检测返回, 不走缓存', scanAuthRes);
            if (scanAuthRes.errcode !== '0000') {
                return await this.responseJson(scanAuthRes, false);
            }
            needAuth = scanAuthRes.data;
            // 不是因为扫脸超时导致的异常
            if (!needAuth) {
                return await this.responseJson(errcodeInfo.govErr, false);
            }
        }

        ctx.service.ntTools.AuthLogsUpload(2);
        // 清除缓存
        ctx.service.scanFaceCheck.clearCacheForEtaxNotRequiredAuth();
        await ctx.service.ntTools.lockForWxRelationAndSendMsgOrShowLoginWin({
            needLogin: false,
            checkAuth: true
        });
        return await this.responseJson({
            errcode: '91400',
            description: '扫脸认证已超时, 请先进行人脸认证后再进行录入操作!'
        }, false);
    }

    // 红字确认单撤销
    async revokeRedConfirmBill() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};
        const res = await ctx.service.openRedInvoice.revokeRedConfirmBill(loginData, decryedData);
        return await this.responseJson(res);
    }

    // 红字确认单确认/拒绝
    async updateRedConfirmBill() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};
        const res = await ctx.service.openRedInvoice.updateRedConfirmBill(loginData, decryedData);
        return await this.responseJson(res);
    }

    async queryConfirmBills() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};
        const res = await ctx.service.openRedInvoice.queryConfirmBills(loginData, decryedData);
        return await this.responseJson(res);
    }

    async queryConfirmDetail() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};
        const govRedConfirmBillUuid = decryedData.govRedConfirmBillUuid;
        const salerTaxNo = decryedData.salerTaxNo || '';
        if (!govRedConfirmBillUuid) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '确认单id不能为空'
            });
        }
        const res = await ctx.service.openRedInvoice.queryConfirmBillDetail(loginData, govRedConfirmBillUuid, salerTaxNo);
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        const resData = res.data || {};
        const res2 = await ctx.service.openRedInvoice.transformConfirmDetail(loginData, resData);
        return await this.responseJson(res2);
    }

    async queryOpenedInvoices() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const { decryedData = {} } = ctx.request.body;
        const loginData = checkRes.data || {};

        const res2 = await ctx.service.openInvoiceQuery.queryOpenInvoices(loginData, decryedData);
        return await this.responseJson(res2);
    }

    async openInvoiceStatusUpdate() {
        const ctx = this.ctx;
        const isEncry = typeof ctx.request.body.data === 'string';
        const checkRes = await ctx.service.ntTools.checkRequest(isEncry);
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        const {
            serialNo,
            govSerialNo,
            status,
            invoiceCode,
            invoiceNo,
            invoiceDate,
            ofdUrl,
            pdfUrl,
            xmlUrl
        } = ctx.request.body.decryedData;
        const res = await ctx.service.openHistory.query(serialNo);
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        ctx.service.log.info('旧的发票状态数据', res.data);

        if (status !== 1 && status !== 3 && status !== 4 && status !== 5) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: 'status状态只能为1(开具成功)、3(开具失败)、4（串号）、5（校验串号异常）'
            });
        }

        if (status === 1 && (!invoiceNo || !invoiceDate || invoiceDate.length !== 19)) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '处理为成功状态时，请检查发票号码，开票日期是否正确'
            });
        }
        const updateData: any = {
            serialNo,
            status
        };

        typeof invoiceCode === 'string' && (updateData.invoiceCode = invoiceCode);
        typeof invoiceNo === 'string' && (updateData.invoiceNo = invoiceNo);
        typeof invoiceDate === 'string' && (updateData.invoiceDate = invoiceDate);
        typeof ofdUrl === 'string' && (updateData.ofdUrl = ofdUrl);
        typeof pdfUrl === 'string' && (updateData.pdfUrl = pdfUrl);
        typeof xmlUrl === 'string' && (updateData.xmlUrl = xmlUrl);
        typeof govSerialNo === 'string' && (updateData.govSerialNo = govSerialNo);

        const res2 = await ctx.service.openHistory.update(updateData);
        return await this.responseJson(res2);
    }

    // 开票状态查询
    async openInvoiceStatusQuery() {
        const ctx = this.ctx;
        const requestData = ctx.request.body || {};
        let decryedData = requestData.data;
        const { access_token, taxNo } = ctx.request.query || {};
        let clientType;
        if (requestData.data && typeof requestData.data === 'string') {
            const deRes = await ctx.service.etaxLogin.decryData(requestData.data);
            if (deRes.errcode !== '0000') {
                return deRes;
            }
            decryedData = deRes.data;
            clientType = decryedData.clientType || 4;
        } else {
            clientType = decryedData.clientType || 4;
        }
        const serialNo = decryedData.serialNo;

        if (!serialNo) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '开票流水号不能为空'
            });
        }

        const tokenRes = await ctx.service.fpyTokenInfo.getTokenInfo(access_token, clientType, taxNo);
        if (tokenRes.errcode !== '0000') {
            return tokenRes;
        }
        const { tenantNo, client_id } = tokenRes.data || {};
        ctx.request.query.tenantNo = tenantNo;
        ctx.request.query.client_id = client_id;
        const res = await ctx.service.openHistory.query(serialNo);
        ctx.service.log.info('开票状态查询返回', res);
        if (res.errcode !== '0000') {
            return await this.responseJson(res);
        }
        const {
            govSerialNo,
            invoiceCode = '',
            invoiceNo = '',
            invoiceDate = '',
            ofdUrl = '',
            xmlUrl = '',
            pdfUrl = '',
            status = '6' // 开票状态 1开具成功 2开具中 3开具异常 4开票串号 5校验开票数据异常 6失败允许重试
        } = res.data || {};
        return await this.responseJson({
            ...errcodeInfo.success,
            data: {
                serialNo,
                invoiceCode: invoiceCode ? invoiceCode : '',
                invoiceNo: invoiceNo ? invoiceNo : '',
                invoiceDate: invoiceDate ? invoiceDate : '',
                ofdUrl: ofdUrl ? ofdUrl : '',
                xmlUrl: xmlUrl ? xmlUrl : '',
                pdfUrl: pdfUrl ? pdfUrl : '',
                status,
                govSerialNo: govSerialNo ? govSerialNo : ''
            }
        });
    }

    async queryDetail() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
            return await this.responseJson(checkRes, false);
        }
        const originOpt = ctx.request.body.decryedData || {};
        const { invoiceType, invoiceCode = '', invoiceNo, invoiceDate, etaxInvoiceNo } = originOpt;
        if (!invoiceType || !invoiceNo || !invoiceDate) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '发票类型，发票号码，开票日期都不能为空，请检查！'
            });
        }
        const loginData = checkRes.data || {};
        const res = await ctx.service.openInvoiceQuery.queryOpenInvoiceDetail(loginData, {
            etaxInvoiceNo,
            invoiceType,
            invoiceCode,
            invoiceNo,
            invoiceDate
        });
        return await this.responseJson(res);
    }

    // 查询登录状态
    async getLoginAuthStatus(loginData: any) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { taxNo, roleText } = loginData;
        const lastAliveTime = ctx.bsWindows?.fpdkGovWin?.[pageId]?.lastAliveTime;
        ctx.service.log.info('getEtaxAccountStatus roleText', roleText);
        ctx.service.log.info('getEtaxAccountStatus lastAliveTime', lastAliveTime);
        if (lastAliveTime) {
            const curTime = (+new Date());
            const inactive = curTime - lastAliveTime > 10 * 60 * 1000;
            ctx.service.log.info('getEtaxAccountStatus inactive', inactive);
            if (inactive) {
                // 大于10分钟
                const preCheckRes = await ctx.service.etaxFpdkLogin.common.commonPreCheck({ taxNo, roleText });
                ctx.service.log.info('getEtaxAccountStatus commonPreCheck 1', preCheckRes);
                return {
                    ...errcodeInfo.success,
                    data: {
                        status: !!preCheckRes.data
                    }
                };
            }
            // 小于10分钟
            const url = ctx.bsWindows?.fpdkGovWin?.[pageId]?.getUrl();
            const isRightUrl = /https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(url);
            ctx.service.log.info('getEtaxAccountStatus isRightUrl', isRightUrl);

            if (!isRightUrl) {
                ctx.service.log.info('getEtaxAccountStatus url', url);
            }

            // 有效
            return {
                ...errcodeInfo.success,
                data: {
                    status: isRightUrl
                }
            };
        }

        // 无nt
        const preCheckRes = await ctx.service.etaxFpdkLogin.common.commonPreCheck({ taxNo, roleText });
        ctx.service.log.info('getEtaxAccountStatus commonPreCheck 2', preCheckRes);
        return {
            ...errcodeInfo.success,
            data: {
                status: !!preCheckRes.data
            }
        };

    }

    async getEtaxAccountStatus() {
        const ctx = this.ctx;

        let status = false; // false账号未登录 true账号已登录
        let auth = -1; // -1 无权限 0未认证 1已认证

        const checkRes = await ctx.service.ntTools.checkEtaxLogined({ disabledAutoLogin: true });
        if (checkRes.errcode === '0000') {
            const loginData = checkRes.data;
            const { pageId } = ctx.request.query;
            ctx.request.query.pageId = loginData.pageId; // 已经登录的id
            ctx.request.query.realPageId = pageId; // 当前真实的id
            // 默认未登录
            const { etaxAccountType = -1 } = loginData || {};
            status = etaxAccountType !== -1;
            if (status && (etaxAccountType === 1 || etaxAccountType === 3)) {
                // 已登录 有开票权限
                const authStatusRes = await ctx.service.scanFaceCheck.getEtaxNeedAuthStatus(loginData);
                auth = authStatusRes.data ? 0 : 1;
            }
        }

        return await this.responseJson({
            ...errcodeInfo.success,
            data: {
                status,
                auth
            }
        });
    }

    // 获取二维码永久地址
    async getInvoiceQrAddress() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
            return await this.responseJson(checkRes, false);
        }
        ctx.service.log.info('getInvoiceQrAddress res', checkRes);
        const decryedData = ctx.request.body.decryedData || {};
        const { invoiceNo, invoiceDate, serialNo = '' } = decryedData;
        const res = await ctx.service.openInvoice.getInvoiceQrAddress({
            invoiceNo,
            invoiceDate,
            serialNo
        });
        return await this.responseJson(res);
    }
}

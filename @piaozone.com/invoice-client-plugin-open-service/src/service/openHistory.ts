const encrypt = aesEncrypt;

export interface openedResultType {
    bizType?: string;
    tenantNo: string;
    taxNo: string;
    invoiceDate?: string;
    invoiceCode?: string;
    etaxInvoiceNo?: string;
    invoiceNo?: string;
    xmlUrl?: string;
    ofdUrl?: string;
    pdfUrl?: string;
    snapshotUrl?: string;
    govSerialNo?: string;
    serialNo?: string;
    status?: number;
    drawer?: string;
    govInvoiceQrUrl?: string;
    channelType?: number;
}

export class OpenHistory extends BaseService {
    async request(requestPath: string, data: any = {}, title: string = '') {
        const ctx = this.ctx;
        const reqid = ctx.uid;
        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(data), encryptKey);

        const url = `${requestPath}?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}&tenantNo=${tenantNo}`;
        ctx.service.log.info(title, '请求url', url);
        ctx.service.log.info(title, '请求参数', data);
        ctx.service.log.info(title, '请求encryData', encryData);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.info(title, '请求返回', res);
        return res;
    }

    // 上传开票历史
    async update(openedResult: openedResultType) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const reqid = ctx.uid;
        const {
            serialNo,
            govSerialNo,
            invoiceCode = '',
            invoiceNo = '',
            etaxInvoiceNo = '',
            invoiceDate,
            ofdUrl = '',
            pdfUrl = '',
            xmlUrl = '',
            status,
            govInvoiceQrUrl
        } = openedResult;
        const requestParam : openedResultType = {
            bizType: 'outputInvoice',
            tenantNo,
            taxNo,
            serialNo
        };
        // 只能更新ofdUrl， pdfUrl，xmlUrl
        if (!serialNo) {
            ctx.service.log.info('上传开票历史参数错误', openedResult);
            return {
                ...errcodeInfo.argsErr,
                description: '上传开票历史参数错误，请检查'
            };
        }

        if (typeof govSerialNo !== 'undefined') {
            requestParam.govSerialNo = govSerialNo;
        }

        if (invoiceCode) {
            requestParam.invoiceCode = invoiceCode;
        }

        if (etaxInvoiceNo) {
            requestParam.etaxInvoiceNo = etaxInvoiceNo;
        }

        if (invoiceNo) {
            requestParam.invoiceNo = invoiceNo;
        }

        if (invoiceDate) {
            requestParam.invoiceDate = invoiceDate;
        }

        if (status) {
            requestParam.status = status;
        }

        if (ofdUrl) {
            requestParam.ofdUrl = ofdUrl;
        }
        if (pdfUrl) {
            requestParam.pdfUrl = pdfUrl;
        }
        if (xmlUrl) {
            requestParam.xmlUrl = xmlUrl;
        }

        if (govInvoiceQrUrl) {
            requestParam.govInvoiceQrUrl = govInvoiceQrUrl;
        }
        // 通道类型为rpa
        requestParam.channelType = 0;
        const url = ctx.app.config.baseUrl + '/rpa/output/electric/invoice/save?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('数电开票历史更新，url', url);
        ctx.service.log.info('数电开票历史更新，参数', requestParam);
        ctx.service.log.info('数电开票历史更新，encryData', encryData);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.info('数电开票历史更新返回', res);
        return res;
    }

    // 上传开票历史
    async add(openedResult: openedResultType) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const reqid = ctx.uid;
        const {
            invoiceCode = '',
            etaxInvoiceNo = '',
            invoiceNo = '',
            govSerialNo = '',
            serialNo = '',
            invoiceDate = '',
            ofdUrl = '',
            pdfUrl = '',
            xmlUrl = '',
            status
        } = openedResult;

        if (!serialNo || !govSerialNo) {
            ctx.service.log.info('上传开票历史参数错误', openedResult);
            return {
                ...errcodeInfo.argsErr,
                description: '上传开票历史参数错误，请检查'
            };
        }
        const requestParam : openedResultType = {
            bizType: 'outputInvoice',
            invoiceCode,
            etaxInvoiceNo,
            status,
            tenantNo,
            taxNo,
            invoiceNo,
            govSerialNo,
            serialNo,
            invoiceDate,
            ofdUrl,
            pdfUrl,
            xmlUrl,
            channelType: 0 // 通道类型 0，rpa，1 新时代
        };
        const url = ctx.app.config.baseUrl + '/rpa/output/electric/invoice/save?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('数电开票历史上传url', url);
        ctx.service.log.fullInfo('数电开票历史上传参数', requestParam);
        ctx.service.log.fullInfo('数电开票历史上传encryData', encryData);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.info('数电开票历史上传返回', res);
        return res;
    }

    // aws对接需要上传保存数电开票明细
    async uploadFullInfo(invoiceInfo: any, openedResult: openedResultType) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo, client_id, fpdk_type } = ctx.request.query;
        const reqid = ctx.uid;
        const {
            fpdkType,
            type,
            invoiceType,
            invoiceAmount,
            totalTaxAmount,
            totalAmount, // 总金额
            salerAddress = '', // 销售方地址
            salerCardName = '', // 销售方开户行
            salerPhone = '', // 销售方联系电话
            salerName = '', // 销售方名称
            salerTaxNo = '', // 销售方税号
            salerCardNumber = '', // 销售方银行账户
            buyerAddress = '', // 购买方地址
            buyerCardName = '', // 购买方开户行
            buyerFixedTelephone = '', // 购买方联系电话
            buyerName = '', // 购买方名称
            buyerTaxNo = '', // 购买方纳税人识别号
            buyerCardNumber = '', // 购买方银行账户
            buyerEmail = '', // 购买方邮箱 用于发送邮件
            buyerMobilePhone = '', // 购买方手机，用于发送短信
            agentUser = '', // 经办人
            agentCardType = '', // 经办人身份证件种类代码
            agentCardNo = '', // 经办人身份证件号码
            agentCountry = '', // 经办人国级代码
            agentTaxNo = '', // 经办人自然人纳税人识别号
            originalInvoiceCode = '',
            originalInvoiceDate = '',
            originalInvoiceNo = '',
            govRedConfirmBillUuid = '',
            redReason = '',
            redConfirmBillNo = '',
            redConfirmEnterDate = '',
            remark = '', // 备注
            taxFlag, //  含税标志，含税：Y, 不含税：N
            items, // 明细
            ...otherInvoiceInfo
        } = invoiceInfo;
        const {
            invoiceCode = '',
            invoiceNo = '',
            etaxInvoiceNo = '',
            govSerialNo = '',
            serialNo = '',
            invoiceDate = '',
            ofdUrl = '',
            pdfUrl = '',
            xmlUrl = '',
            snapshotUrl = '',
            drawer = '' // 默认置空开票人
        } = openedResult;

        // 是否星瀚
        const isXinghan = +(fpdk_type || fpdkType) === 4;

        const requestParam : any = {
            type,
            invoiceType,
            invoiceAmount,
            totalTaxAmount,
            totalAmount,

            // 销售方信息
            salerAddress,
            salerCardName,
            salerPhone,
            salerName,
            salerTaxNo,
            salerCardNumber,

            // 购方信息
            buyerAddress,
            buyerCardName,
            buyerFixedTelephone,
            buyerName,
            buyerTaxNo,
            buyerCardNumber,

            // 星瀚的请求在aws不保存邮箱手机，避免邮箱手机推送
            buyerEmail: isXinghan ? '' : buyerEmail,
            buyerMobilePhone: isXinghan ? '' : buyerMobilePhone,

            // 经办人相关
            agentUser,
            agentCardType,
            agentCardNo,
            agentCountry,
            agentTaxNo,

            // 红票相关
            originalInvoiceCode,
            originalInvoiceDate,
            originalInvoiceNo,
            govRedConfirmBillUuid,
            redReason,
            redConfirmBillNo,
            redConfirmEnterDate,

            remark,
            taxFlag,
            items,

            ...otherInvoiceInfo,

            tenantNo,
            taxNo,
            invoiceCode,
            invoiceNo,
            etaxInvoiceNo,
            govSerialNo,
            serialNo,
            invoiceDate,
            ofdUrl,
            pdfUrl,
            xmlUrl,
            snapshotUrl,
            drawer
        };
        const url = ctx.app.config.baseUrl + '/m5/bill/etax/invoice/saveinfo?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('数电完整开票结果上传 url', url);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        if (res.errcode !== '0000') {
            ctx.service.log.fullInfo('数电完整开票结果上传 异常，参数', requestParam);
            ctx.service.log.fullInfo('数电完整开票结果上传 异常，完整encryData', encryData);
        }
        ctx.service.log.info('数电完整开票结果上传 返回', res);
        return res;
    }

    // 新增红字信息表
    async uploadRedConfirmBill(requestData: any, enterInfo: any) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const reqid = ctx.uid;
        const url = ctx.app.config.baseUrl + '/m5/bill/etax/red/invoice/saveinfo?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const requestParam = {
            serialNo: requestData.serialNo,
            invoiceAmount: requestData.invoiceAmount,
            taxFlag: requestData.taxFlag,
            totalAmount: requestData.totalAmount,
            totalTaxAmount: requestData.totalTaxAmount,
            salerTaxNo: enterInfo.Xsfnsrsbh,
            salerName: enterInfo.Xsfmc,
            buyerTaxNo: enterInfo.Gmfnsrsbh,
            buyerName: enterInfo.Gmfmc,
            originalInvoiceDate: enterInfo.Lzkprq,
            originalInvoiceNo: enterInfo.Lzfphm,
            redReason: requestData.redReason,
            redConfirmEnterDate: enterInfo.redConfirmEnterDate,
            redConfirmBillStatus: enterInfo.redConfirmBillStatus,
            redConfirmBillNo: enterInfo.redConfirmBillNo,
            govRedConfirmBillUuid: enterInfo.govRedConfirmBillUuid,
            items: enterInfo.HzqrxxmxList.map((item : any) => {
                return {
                    discountType: '0',
                    goodsName: item.Hwhyslwfwmc,
                    goodsCode: item.Sphfwssflhbbm,
                    taxAmount: item.Se,
                    detailAmount: item.Je,
                    deduction: '',
                    preferentialPolicy: '',
                    taxRate: item.Sl1,
                    unitPrice: item.Fpspdj,
                    num: item.Fpspsl,
                    unit: item.Dw || '',
                    vatException: '',
                    specModel: item.Ggxh || ''
                };
            })
        };
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('红票录入结果保存url', url);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        if (res.errcode !== '0000') {
            ctx.service.log.fullInfo('红票录入结果保存异常，完整参数', requestParam);
            ctx.service.log.fullInfo('红票录入结果保存异常，完整encryData', encryData);
        }
        ctx.service.log.info('红票录入结果保存返回', res);
        return res;
    }

    // 更新红字信息表状态
    async uploadRedConfirmBillStatus(requestParam: {
        govRedConfirmBillUuid: string,
        redConfirmBillStatus: string
    }) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const reqid = ctx.uid;
        const url = ctx.app.config.baseUrl + '/m5/bill/etax/red/invoice/update/status?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('更新红字信息表状态url', url);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        if (res.errcode !== '0000') {
            ctx.service.log.fullInfo('更新红字信息表状态异常，完整参数', requestParam);
            ctx.service.log.fullInfo('更新红字信息表状态异常，完整encryData', encryData);
        }
        ctx.service.log.info('更新红字信息表状态返回', res);
        return res;
    }

    // 更新作废发票
    async updateCancelPaperInvoice(requestParam: {
        taxNo: string,
        invoiceCode: string,
        invoiceNo: string,
        etaxInvoiceNo?: string,
        invalidDate: string
    }) {
        const ctx = this.ctx;
        if (!requestParam.invoiceCode || !requestParam.invoiceNo || !requestParam.invalidDate) {
            return {
                ...errcodeInfo.argsErr,
                description: '更新作废状态参数错误，发票代码，发票号码，作废时间都不能为空'
            };
        }

        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const reqid = ctx.uid;
        const url = ctx.app.config.baseUrl + '/m5/bill/etax/invalid/invoice?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('更新作废状态url', url);
        ctx.service.log.fullInfo('更新作废状态异常，完整参数', requestParam);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        if (res.errcode !== '0000') {
            ctx.service.log.fullInfo('更新作废状态异常，完整encryData', encryData);
        }
        ctx.service.log.info('更新作废状态返回', res);
        return res;
    }

    async query(serialNo: string) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo } = ctx.request.query;
        const reqid = ctx.uid;
        if (!serialNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '查询开票历史参数错误，请检查'
            };
        }
        const requestPath = ctx.app.config.baseUrl + '/rpa/output/electric/invoice/queryBySerialNo';
        const url = `${requestPath}/${serialNo}?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}&tenantNo=${tenantNo}`;
        ctx.service.log.info('查询开票历史 url', url);
        const res = await ctx.helper.curl(url, {
            dataType: 'json',
            headers: {
                'client-platform': 'common'
            }
        });
        return res;
    }

    async queryOpenedListByInvoiceNos(invoiceNos: string[]) {
        const ctx = this.ctx;
        const { access_token, taxNo, tenantNo, client_id } = ctx.request.query;
        const reqid = ctx.uid;
        if (!invoiceNos) {
            return {
                ...errcodeInfo.argsErr,
                description: '查询开票列表参数为空'
            };
        }
        const requestPath = ctx.app.config.baseUrl + '/rpa/output/electric/invoice/queryByInvoiceNo';
        const url = `${requestPath}?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}&tenantNo=${tenantNo}`;

        const requestParam = {
            invoiceNos
        };
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        ctx.service.log.info('查询开票列表url', url);
        ctx.service.log.fullInfo('查询开票列表，完整参数', requestParam);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.fullInfo('查询开票列表返回', res);
        return res;
    }

    // 开票文件后台解析
    async analysis(fileUrl: string) {
        const ctx = this.ctx;
        if (!fileUrl) {
            return {
                ...errcodeInfo.argsErr,
                description: '解析的文件地址不能为空'
            };
        }
        const requestParam = {
            url: fileUrl
        };
        const requestPath = ctx.app.config.baseUrl + '/rpa/output/electric/invoice/voucher/analysis';
        const res = await this.request(requestPath, requestParam, '文件解析');
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        return {
            ...errcodeInfo.success,
            data: {
                buyerTaxNo: resData.buyerTaxNo,
                buyerName: resData.buyerName,
                salerTaxNo: resData.salerTaxNo,
                salerName: resData.salerName,
                invoiceType: resData.invoiceType,
                invoiceNo: resData.invoiceNo,
                totalAmount: resData.totalAmount,
                totalTaxAmount: resData.taxAmount,
                invoiceAmount: resData.amount,
                invoiceDate: resData.invoiceDate,
                remark: resData.remark
            }
        };
    }
}

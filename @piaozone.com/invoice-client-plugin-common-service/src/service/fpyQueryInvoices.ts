import { isEmpty } from '../utils/tools';

export class FpyQueryInvoices extends BaseService {
    async queryByCodeNos(access_token: string, list: any[] = [], tokenInfo: any, clientType: any) {
        const ctx = this.ctx;
        const baseUrl = ctx.app.config.baseUrl;
        let requestUrl;
        clientType = parseInt(clientType);
        if (clientType === 2) {
            requestUrl = '/m9/bill/company/token?invoiceToken=';
        } else if (clientType === 3) {
            requestUrl = '/portal/platform/inputinvoice/collect/select/invoice/query?access_token=';
        } else if (clientType === 4 || clientType === 5) {
            requestUrl = '/m17/bill/fpdk/select/invoice/query?access_token=';
        } else {
            return {
                ...errcodeInfo.argsErr,
                description: 'clientType参数错误'
            };
        }
        requestUrl += access_token + '&random=' + Math.random();
        const bodyData = {
            buyerTaxNo: tokenInfo.taxNo,
            invoiceList: list.map((item) => {
                return {
                    invoiceCode: item.invoiceCode,
                    invoiceNo: item.invoiceNo
                };
            })
        };
        const res = await ctx.helper.curl(baseUrl + requestUrl, {
            dataType: 'json',
            method: 'post',
            contentType: 'json',
            headers: {
                revenueNumber: tokenInfo.taxNo
            },
            data: bodyData
        });
        if (res) {
            let data = res;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    ctx.service.log.info('根据代码号码查询发票异常', err);
                    return errcodeInfo.fpyInnerErr;
                }
            }
            if (data.errcode !== '0000') {
                ctx.service.log.info('根据代码号码查询发票异常', bodyData, data);
                return data;
            }
            const listData = data.data || [];
            const result = {
                ...data,
                data: listData.map((item: any) => {
                    const authenticateFlag = item.authenticateFlag;
                    const totalTaxAmount = (item.totalTaxAmount || item.taxAmount) + '';
                    const dataResult = {
                        etaxInvoiceNo: item.etaxInvoiceNo,
                        invoiceType: item.type || item.invoiceType,
                        invoiceCode: item.invoiceCode,
                        invoiceNo: item.invoiceNo,
                        invoiceDate: item.invoiceDate,
                        salerName: item.salerName,
                        salerTaxNo: item.salerTaxNo,
                        buyerName: item.buyerName,
                        buyerTaxNo: item.buyerTaxNo,
                        invoiceAmount: item.invoiceAmount + '',
                        totalTaxAmount,
                        effectiveTaxAmount: isEmpty(item.effectiveTaxAmount) ? totalTaxAmount : item.effectiveTaxAmount,
                        deductionPurpose: isEmpty(item.deductionPurpose) ? '' : item.deductionPurpose,
                        invoiceStatus: isEmpty(item.invoiceStatus) ? '' : item.invoiceStatus + '',
                        manageStatus: isEmpty(item.manageStatus) ? '0' : item.manageStatus + '',
                        authenticateFlag: authenticateFlag,
                        checkFlag: authenticateFlag === 0 ? '0' : '1',
                        selectTime: item.selectTime && moment(item.selectTime).format('YYYY-MM-DD') || '',
                        checkAuthenticateFlag: authenticateFlag === 2 ? '1' : '0',
                        selectAuthenticateTime: item.selectAuthenticateTime || '',
                        scanAuthenticateFlag: authenticateFlag === 3 ? '1' : '0',
                        scanAuthenticateTime: item.scanAuthenticateTime || '',
                        taxPeriod: item.taxPeriod || ''
                    };
                    return dataResult;
                })
            };
            return result;
        }
        return errcodeInfo.fpyInnerErr;
    }

    // 上传登录状态信息
    async uploadAccountInfo(loginStatus: number) {
        const ctx = this.ctx;
        const baseUrl = ctx.app.config.baseUrl;
        const { taxNo, tenantNo, access_token, reqid, client_id } = ctx.request.query;
        const { decryedData } = ctx.request.body;
        if (!decryedData?.account) {
            return errcodeInfo.success;
        }
        const info = {
            taxNo,
            account: decryedData.account,
            loginStatus // 1 已经登录电子税局，2没登录，3登录中
        };

        // 上传登录日志, 新时代登录后台已经有登录上报，登录成功这里不需要
        if (Number(loginStatus) === 2) { // 1 已经登录电子税局，2 登录失效
            await ctx.service.ntTools.loginLogsUpload(loginStatus);
        }

        const resName = await ctx.service.ntTools.getLongLinkName(tenantNo);
        if (resName.errcode !== '0000') {
            return errcodeInfo.govAuthFail;
        }
        const longLinkName = resName.data;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryStr = aesEncrypt(JSON.stringify(info), encryptKey);
        // 将登录的节点上传后台
        const url = `${baseUrl}/bill-websocket/v2/updateAccountInfo?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}&name=${longLinkName}`;
        ctx.service.log.info('uploadAccountInfo参数', url, info);
        const res = await ctx.helper.curl(url, {
            dataType: 'json',
            method: 'POST',
            data: {
                data: encryStr
            },
            headers: {
                'content-type': 'application/json'
            }
        });
        ctx.service.log.info('uploadAccountInfo res', res);
        return res;
    }
}

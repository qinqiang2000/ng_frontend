/* eslint-disable no-undef,no-unused-vars,no-trailing-spaces,max-len,spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda */
const encrypt = aesEncrypt;
export class InvoiceSaveFiles extends BaseService {

    async saveExcel(filePath, opt) { // 上传发票明细
        const ctx = this.ctx;
        const { access_token, reqid } = ctx.request.query;
        const { pageNo = '', pageSize = 500, dataType = '', batchNo = '' } = opt.searchOpt;
        const invoiceType = opt.searchOpt.invoiceType || -1;
        ctx.service.log.info('发票明细excel--后端解析 地址、参数--------', filePath, opt);
        if (!fs.existsSync(filePath)) {
            return {
                ...errcodeInfo.args,
                description: '文件不存在'
            };
        }
        // 先通过s3上传
        const s3Res = await ctx.service.s3Upload.uploadFileToS3(filePath);
        ctx.service.log.info('发票明细excel--后端解析--上传S3结果：', s3Res);
        if (s3Res.errcode !== '91500' && s3Res.errcode !== '0000') {
            ctx.service.log.info('发票明细excel--后端解析--文件上传S3出错：', s3Res);
            return {
                ...s3Res,
                description: s3Res.description || '文件上传S3出错'
            };
        }
        let fileUrl = '';
        if (s3Res.errcode === '0000') { // s3连接成功
            fileUrl = s3Res.data;
        }
        const baseUrl = ctx.app.config.baseUrl;
        const url = `${baseUrl}/m17/bill/analysis/tax/excel?access_token=${access_token}&reqid=${reqid || +new Date()}`;
        const data = {
            batchNo,
            disableCache: !!opt.disableCache,
            fileUrl,
            fileHash: opt.md5Key,
            invoiceType,
            fpdkType: opt.fpdk_type || '',
            dataType,
            pageSize,
            pageNo
        };
        const bodyJson = fileUrl ? {
            method: 'POST',
            dataType: 'json',
            data,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'revenueNumber': opt.taxNo
            }
        } : {
            method: 'POST',
            dataType: 'json',
            files: {
                'invoieTaxExcel': filePath
            },
            data: {
                ...data,
                disableCache: opt.disableCache ? 'true' : 'false'
            },
            headers: {
                'revenueNumber': opt.taxNo
            }
        };
        ctx.service.log.info('发票明细excel--后端解析--请求路径、参数：', url, bodyJson);
        ctx.service.log.info('发票明细excel--后端解析--是否走缓存：', !opt.disableCache);
        const res = await ctx.helper.curl(url, bodyJson);
        ctx.service.log.info('发票明细excel--后端解析--结果', res);
        return res;
    }

    async getData(url) {
        const ctx = this.ctx;
        ctx.service.log.info('请求路径：', url);
        const res = await ctx.helper.curl(url, {
            method: 'GET',
            dataType: 'json'
        });
        return res;
    }

    async uploadExcel(filePath, opt) {
        const ctx = this.ctx;
        const { access_token } = ctx.request.query;
        ctx.service.log.info('uploadExcel 文件到后端 地址、参数--------', filePath, opt);
        const { pageNo = '', pageSize = 500, dataType = '', batchNo = '' } = opt.searchOpt;
        const invoiceType = opt.searchOpt.invoiceType || -1;
        if (!fs.existsSync(filePath)) {
            return {
                ...errcodeInfo.args,
                description: '文件不存在'
            };
        }
        
        const baseUrl = ctx.app.config.baseUrl;
        const url = `${baseUrl}/m17/bill/analysis/etax/excel?access_token=${access_token}`;
        ctx.service.log.info('上传excel-请求路径：', url);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            files: {
                'invoieTaxExcel': filePath
            },
            data: {
                fpdkType: opt.fpdk_type,
                fileHash: opt.md5Key,
                status: opt.status,
                invoiceType,
                dataType,
                batchNo
            },
            headers: {
                // 'content-type': 'multipart/form-data',
                'revenueNumber': opt.taxNo
            }
        });
        return res;
    }

    /*
        excelType: 文件类型//1抵扣未勾选，2抵扣已勾选，3已认证，4未到期,5不抵扣勾选
        dataFromIndex: 0抵扣未勾选，1抵扣已勾选，2不抵扣勾选，3未到期，4已认证
    */

    async uploadTitleExcel(filePath, opt) {
        const ctx = this.ctx;
        ctx.service.log.info('发票表头excel--后端解析 地址、参数：', filePath, opt);
        const titleExcelType = {
            0: 1,
            1: 2,
            2: 5,
            3: 4,
            4: 3
        };
        const { access_token, reqid } = ctx.request.query;
        const { pageNo = '', pageSize = 99999, taxPeriod, md5Key, taxNo, dataFromIndex, batchNo = '' } = opt;
        const invoiceType = opt.invoiceType || -1;
        const excelType = titleExcelType[Number(dataFromIndex)];
        if (!fs.existsSync(filePath)) {
            return {
                ...errcodeInfo.args,
                description: '文件不存在'
            };
        }
        // 先通过s3上传
        const s3Res = await ctx.service.s3Upload.uploadFileToS3(filePath);
        ctx.service.log.info('发票表头excel--后端解析--文件上传S3结果：', s3Res);
        if (s3Res.errcode !== '91500' && s3Res.errcode !== '0000') {
            ctx.service.log.info('发票表头excel--后端解析--文件上传S3出错：', s3Res);
            return {
                ...s3Res,
                description: s3Res.description || '文件上传S3出错'
            };
        }
        let fileUrl = '';
        if (s3Res.errcode === '0000') { // s3连接成功
            fileUrl = s3Res.data;
        }
        const baseUrl = ctx.app.config.baseUrl;
        const url = `${baseUrl}/m17/bill/analysis/tax/title/excel?access_token=${access_token}&reqid=${reqid || +new Date()}`;
        const data = {
            batchNo,
            disableCache: !!opt.disableCache,
            excelType,
            fileUrl,
            taxPeriod,
            fileHash: md5Key,
            invoiceType,
            pageSize,
            pageNo
        };
        const bodyJson = fileUrl ? {
            method: 'POST',
            dataType: 'json',
            data,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'revenueNumber': taxNo
            }
        } : {
            method: 'POST',
            dataType: 'json',
            files: {
                'invoieTaxExcel': filePath
            },
            data: { ...data, disableCache: opt.disableCache ? 'true' : 'false' },
            headers: {
                // 'content-type': 'multipart/form-data',
                'revenueNumber': taxNo
            }
        };
        ctx.service.log.info('发票表头excel--后端解析--请求路径、参数：', url, bodyJson);
        ctx.service.log.info('发票表头excel--后端解析--是否走缓存：', !opt.disableCache);
        const res = await ctx.helper.curl(url, bodyJson);
        ctx.service.log.info('发票表头excel--后端解析--结果：', res);
        return res;
    }

    // Rap全电发票数据状态更新接口
    async fullInvoiceStatusUpdate(batchNo, status, taxNo, result, syncDataStatus) {
        const ctx = this.ctx;
        const { access_token, tenantNo, client_id } = ctx.request.query;
        const baseUrl = ctx.app.config.baseUrl;
        const url = `${baseUrl}/rpa/fullInvoice/status/update?access_token=${access_token}&reqid=${+new Date()}`;

        let requestParam = {
            batchNo,
            status,
            taxNo
        };
        if (syncDataStatus) { // 没有数据，直接告诉后台，总结任务
            requestParam.syncDataStatus = syncDataStatus;
        }
        if (status === -2) {
            requestParam = {
                ...requestParam,
                errorCode: result.errcode,
                description: result.description
            };
        }
        ctx.service.log.info('Rap全电发票数据状态更新接口', url);
        ctx.service.log.info('Rap全电发票数据状态更新接口', requestParam);
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);

        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'content-type': 'application/json',
                'client-platform': 'digital_invoice',
                'encType': '0'
            },
            data: encryData
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('Rap全电发票数据状态更新接口 返回', res);
            return {
                ...res,
                description: res.description || 'Rap全电发票数据状态更新接口出错'
            };
        }
        return res;
    }
}
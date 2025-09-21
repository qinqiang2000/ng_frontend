/* eslint-disable no-undef,spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda */
import { getUid } from '../libs/tools';

export class InvoiceSave extends BaseService {
    // 电子税局进项入库
    async saveEtaxInputFullInvoices(invoices, opt = {}) {
        const ctx = this.ctx;
        const taxNo = opt.taxNo;
        let saveUrl = '';
        let clientType = opt.clientType || 4;
        clientType = parseInt(clientType);

        if (clientType === 4) {
            saveUrl = '/m17/bill/inputinvoice/saveinvoice/async';
        } else if (clientType === 2) {
            saveUrl = '/m9/bill/download/inputinvoice/saveinvoice';
        } else if (clientType === 3) {
            saveUrl = '/portal/platform/inputinvoice/saveinvoice/async';
        }
        const requestData = {
            pageNo: opt.pageNo,
            pageSize: opt.pageSize,
            totalElement: opt.totalElement,
            taxNo,
            invoices,
            sourceType: '13'
        };
        const baseUrl = ctx.app.config.baseUrl;
        ctx.service.log.info('全量进项入库地址', baseUrl + saveUrl);
        ctx.service.log.info('全量进项入库参数', requestData);
        const res = await ctx.service.fpdkRequest.fpyCurl(baseUrl + saveUrl, {
            data: requestData,
            dataType: 'json',
            contentType: 'json',
            method: 'POST'
        }, {
            taxNo,
            clientType
        });
        ctx.service.log.info('全量进项入库返回', res);
        return res;
    }

    // 电子税局销项入库
    async saveEtaxOutputFullInvoices(invoices, opt = {}) {
        const ctx = this.ctx;
        const taxNo = opt.taxNo;
        let saveUrl = '';
        let clientType = opt.clientType || 4;
        clientType = parseInt(clientType);
        if (clientType === 4) {
            saveUrl = '/m17/bill/outputinvoice/saveinvoice/async';
        } else if (clientType === 2) {
            saveUrl = '/m9/bill/download/outputinvoice/saveinvoice';
        } else if (clientType === 3) {
            saveUrl = '/portal/platform/ouputinvoice/saveinvoice';
        }

        const baseUrl = ctx.app.config.baseUrl;
        const requestData = {
            pageNo: opt.pageNo,
            pageSize: opt.pageSize,
            totalElement: opt.totalElement,
            taxNo,
            invoices,
            sourceType: '13'
        };
        ctx.service.log.info('全量销项入库地址', baseUrl + saveUrl);
        ctx.service.log.info('全量销项入库参数', requestData);
        const res = await ctx.service.fpdkRequest.fpyCurl(baseUrl + saveUrl, {
            data: requestData,
            dataType: 'json',
            contentType: 'json',
            method: 'POST'
        }, {
            taxNo,
            clientType
        });
        ctx.service.log.info('全量销项入库返回', res);
        return res;
    }

    // 全量进项数据保存
    async saveInputFullInvoices(invoices, opt = {}) {
        const ctx = this.ctx;
        const { taxNo = '' } = opt;
        let clientType = opt.clientType || 4;
        let saveUrl = '';
        clientType = parseInt(clientType);
        if (clientType === 4) {
            saveUrl = '/m17/bill/inputinvoice/saveinvoice';
        } else if (clientType === 2) {
            saveUrl = '/m9/bill/download/inputinvoice/saveinvoice';
        } else if (clientType === 3) {
            saveUrl = '/portal/platform/inputinvoice/saveinvoice/async';
        }

        const baseUrl = ctx.app.config.baseUrl;
        const curlOpt = {
            data: {
                invoices,
                sourceType: '9' // 税盘下载
            },
            dataType: 'json',
            contentType: 'json',
            method: 'POST'
        };
        const res = await ctx.service.fpdkRequest.fpyCurl(baseUrl + saveUrl, curlOpt, {
            taxNo,
            clientType
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('进项全量入库异常', baseUrl + saveUrl, res);
        }
        return res;
    }

    // 全量销项数据保存
    async saveOutputFullInvoices(invoices, opt = {}) {
        const ctx = this.ctx;
        let saveUrl = '';
        const { taxNo = '' } = opt;
        let clientType = opt.clientType || 4;
        clientType = parseInt(clientType);
        if (clientType === 4) {
            saveUrl = '/m17/bill/outputinvoice/saveinvoice';
        } else if (clientType === 2) {
            saveUrl = '/m9/bill/download/outputinvoice/saveinvoice';
        } else if (clientType === 3) {
            saveUrl = '/portal/platform/ouputinvoice/saveinvoice';
        }

        const baseUrl = ctx.app.config.baseUrl;
        const curlOpt = {
            data: {
                invoices,
                sourceType: '9' // 税盘下载
            },
            dataType: 'json',
            contentType: 'json',
            method: 'POST'
        };
        const res = await ctx.service.fpdkRequest.fpyCurl(baseUrl + saveUrl, curlOpt, {
            taxNo,
            clientType
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('进项全量入库异常', baseUrl + saveUrl, res);
        }
        return res;
    }

    async saveCommons(initOpt, res) {
        const ctx = this.ctx;
        const baseUrl = ctx.app.config.baseUrl;
        const data = res.data || [];
        let { errcode = '0000', description = 'success' } = res;
        const serialNo = initOpt.serialNo || getUid();
        const startTime = initOpt.startTime || +new Date();
        let saveRes;
        if (data.length === 0 || errcode !== '0000') {
            saveRes = {
                startTime,
                serialNo,
                errcode,
                description
            };
        } else {
            saveRes = await this.save(data, {
                serialNo: serialNo,
                startTime: startTime,
                startDate: initOpt.searchOpt ? initOpt.searchOpt.rq_q : moment().format('YYYY-MM-DD'),
                endDate: initOpt.searchOpt ? initOpt.searchOpt.rq_z : moment().format('YYYY-MM-DD'),
                errcode: errcode,
                description: description,
                versionNo: initOpt.versionNo || '',
                clientType: initOpt.clientType || 4,
                taxNo: initOpt.taxNo
            }, baseUrl, initOpt.fpdk_type);
        }

        if (errcode === '0000' && saveRes.errcode === '0000') {
            errcode = saveRes.errcode;
            description = saveRes.description;
        } else if (errcode === '0000' && saveRes.errcode !== '0000') {
            errcode = saveRes.errcode;
            description = saveRes.description;
        }

        return {
            startTime,
            serialNo,
            errcode,
            description
        };
    }

    async unCheckInvoicesSave(invoices, opt = {}) {
        const ctx = this.ctx;
        const { clientType = 4, taxNo } = opt;
        let url = '/m17/bill/download/invoice/account/updateinvoice';
        if (clientType === 2) {
            url = '/m9/bill/download/invoice/account/updateinvoice';
        }

        if (invoices.length === 0) {
            return errcodeInfo.success;
        }

        const res = await ctx.service.fpdkRequest.fpyCurl(ctx.app.config.baseUrl + url, {
            invoices,
            sourceType: '9'
        }, {
            taxNo,
            clientType
        });

        return res;
    }

    async save(invoices, uploadOpt, url, fpdk_type) {
        const ctx = this.ctx;
        const clientType = uploadOpt.clientType || 4;
        const taxNo = uploadOpt.taxNo;

        if (clientType) {
            const baseUrl = ctx.app.config.baseUrl;
            const requestParam = {
                invoices,
                serialNo: uploadOpt.serialNo,
                startTime: uploadOpt.startTime,
                startDate: uploadOpt.startDate,
                endDate: uploadOpt.endDate,
                inputErrcode: uploadOpt.errcode,
                inputErrDescription: uploadOpt.description
            };
            const startTime = +new Date();
            let saveUrl;
            if (clientType == 1 || clientType == 2) { //税采通和客户端
                saveUrl = '/m9/bill/collectInvoice/collectInputInvoice';
                requestParam.resource = '1';
                requestParam.sourceType = (fpdk_type === '3' || fpdk_type === '4') ? '13' : '9'; //发票数据来源 "01":收票组件,"02":"网站收票","03":"客户端收票"
                requestParam.versionNo = uploadOpt.versionNo || ''; //客户端的版本号
            } else if (clientType == 3) { // 商家平台
                saveUrl = '/portal/platform/inputinvoice/collect/batchinsert';
                requestParam.orderNo = uploadOpt.orderNo || uploadOpt.serialNo;
                requestParam.resource = '3';
                requestParam.sourceType = (fpdk_type === '3' || fpdk_type === '4') ? '13' : '9'; //网站收票
                requestParam.versionNo = '';
            } else if (clientType == 4 || clientType == 5) { // 4为通用token, 5为新版税采通
                requestParam.orderNo = uploadOpt.orderNo || uploadOpt.serialNo;
                saveUrl = '/m17/bill/inputinvoice/collector/async';
                requestParam.resource = clientType === 4 ? '4' : '5';
                requestParam.sourceType = (fpdk_type === '3' || fpdk_type === '4') ? '13' : '9'; //发票数据来源 "01":收票组件,"02":"网站收票","03":"客户端收票" 04 新版本组件通用token调用
                requestParam.versionNo = uploadOpt.versionNo || ''; //客户端的版本号
                requestParam.taxNo = taxNo;
            } else {
                return {
                    ...errcodeInfo.argsErr,
                    description: 'clientType参数错误，请检查！'
                };
            }
            ctx.service.log.info('可勾选发票入库 地址', baseUrl + saveUrl);
            ctx.service.log.info('可勾选发票入库 参数 sourceType', requestParam.sourceType, fpdk_type);
            ctx.service.log.info('可勾选发票入库 参数', requestParam);
            const curlOpt = {
                method: 'POST',
                data: requestParam,
                dataType: 'json',
                contentType: 'json'
            };
            const res = await ctx.service.fpdkRequest.fpyCurl(baseUrl + saveUrl, curlOpt, {
                taxNo,
                clientType
            });
            if (res.errcode !== '0000') {
                ctx.service.log.info('存储发票表头数据异常，请求地址', baseUrl + saveUrl);
                ctx.service.log.info('存储发票表头数据异常, 请求参数', requestParam);
                ctx.service.log.info('存储发票表头数据异常，后台返回', res);
                return errcodeInfo.fpySaveErr;
            }
            ctx.service.log.info('存储发票表头数据', (+new Date()) - startTime);
            return res;
        }
        return errcodeInfo.success;
    }

    async updateFpyGxInfo(successData = [], zt, deductionPurpose, opt = {}) {
        const ctx = this.ctx;
        zt = parseInt(zt);
        const { clientType = 4, taxNo, taxPeriod } = opt;
        deductionPurpose = parseInt(deductionPurpose);

        if (clientType === 3) { // 商家平台自己完成更新
            return errcodeInfo.success;
        }

        if (successData.length === 0) {
            return { errcode: '0000', description: 'success' };
        }

        const updateGxPath = ctx.app.config.baseUrl + '/m17/bill/inputinvoice/batch/select/update';
        const requestData = successData.map((item) => {
            if (taxPeriod) {
                item.taxPeriod = taxPeriod;
            }
            return {
                serialNo: '',
                ...item,
                effectiveTaxAmount: (zt === 1 && deductionPurpose === 1) ? (item.effectiveTaxAmount || item.totalTaxAmount) : '',
                deductionPurpose: deductionPurpose,
                manageStatus: '0',
                authenticateFlag: zt //0未勾选，1已勾选
            };
        });
        const curlOpt = {
            data: requestData,
            method: 'post',
            dataType: 'json',
            contentType: 'json'
        };
        const upRes = await ctx.service.fpdkRequest.fpyCurl(updateGxPath, curlOpt, {
            taxNo,
            clientType
        });
        if (upRes.errcode !== '0000') {
            ctx.service.log.info('勾选更新后台异常，requestUrl：', updateGxPath);
            ctx.service.log.info('勾选更新后台异常，请求参数：', requestData);
            ctx.service.log.info('勾选更新后台异常, 后台返回：', upRes);
        }
        return upRes;
    }

    async gxConfirmSave(data = {}) {
        const ctx = this.ctx;
        const { tjInfo, taxPeriod, taxNo } = data;
        const updateGxPath = ctx.app.config.baseUrl + '/m17/bill/inputinvoice/auth/update';
        const requestData = {
            param: tjInfo,
            taxPeriod,
            taxNo
        };
        const upRes = await ctx.service.fpdkRequest.fpyCurl(updateGxPath, {
            data: requestData,
            dataType: 'json',
            method: 'post',
            contentType: 'json'
        }, {
            taxNo,
            clientType: 4
        });

        if (upRes.errcode !== '0000') {
            ctx.service.log.info('更新勾选确认出错，requestUrl', updateGxPath);
            ctx.service.log.info('更新勾选确认出错，requestData', requestData);
            ctx.service.log.info('更新勾选确认出错，后台返回', upRes);
        }
        return {
            ...errcodeInfo.success,
            data: {
                taxPeriod,
                allowChangeSsqBySeason: false
            }
        };
    }

    // 撤销申报表时，发票云勾选认证状态应该回退到勾选状态
    async fpy_qxsb(opt) {
        const ctx = this.ctx;
        const {
            taxNo,
            taxPeriod,
            clientType = 4
        } = opt;

        let updatePath;
        if (clientType === 4) { // 通用token
            updatePath = '/m17/bill/inputinvoice/revoke';
        } else if (clientType === 3) { // 商家平台
            updatePath = '/portal/platform/inputinvoice/collect/revoke';
        } else {
            return errcodeInfo.argsErr;
        }

        const requestData = {
            taxPeriod,
            taxNo
        };

        const requestUrl = ctx.app.config.baseUrl + updatePath;
        const upRes = await ctx.service.fpdkRequest.fpyCurl(requestUrl, {
            data: requestData,
            method: 'POST',
            dataType: 'json',
            contentType: 'json'
        }, {
            taxNo,
            clientType
        });

        if (upRes.errcode !== '0000') {
            ctx.service.log.info('撤销统计请求出错，requestUrl', requestUrl);
            ctx.service.log.info('撤销统计请求出错，requestData', requestData);
            ctx.service.log.info('撤销统计请求出错，返回', upRes);
        }
        return upRes;
    }


    async saveJks(initOpt, res) {
        const ctx = this.ctx;
        let url = '/m17/bill/inputinvoice/custom/collector';
        const clientType = initOpt.clientType || 4;
        const data = res.data || [];
        let { errcode = '0000', description = 'success' } = res;
        const serialNo = initOpt.serialNo || getUid();
        const startTime = initOpt.startTime || +new Date();
        const accessToken = initOpt.access_token || '';
        const versionNo = initOpt.versionNo || '';
        const taxNo = initOpt.taxNo;
        if (accessToken === '' || data.length === 0) {
            return {
                startTime,
                serialNo,
                errcode,
                description
            };
        }

        const requestParam = {
            taxNo,
            invoices: data,
            startTime: startTime,
            startDate: initOpt.searchOpt ? initOpt.searchOpt.rq_q : moment().format('YYYY-MM-DD'),
            endDate: initOpt.searchOpt ? initOpt.searchOpt.rq_z : moment().format('YYYY-MM-DD'),
            inputErrcode: errcode,
            inputErrDescription: description,
            clientType,
            resource: '4',
            sourceType: '04', //发票数据来源 "01":收票组件,"02":"网站收票","03":"客户端收票" 04 新版本组件通用token调用
            versionNo,
            serialNo: serialNo,
            orderNo: initOpt.orderNo || serialNo
        };

        if (clientType === 4) {
            requestParam.resource = '4';
            requestParam.sourceType = '04';
            url = '/m17/bill/inputinvoice/custom/collector';
        }
        ctx.service.log.info('海关缴款书入库参数', requestParam);
        const requestUrl = ctx.app.config.baseUrl + url;
        const saveRes = await ctx.service.fpdkRequest.fpyCurl(requestUrl, {
            data: requestParam,
            method: 'POST',
            dataType: 'json',
            contentType: 'json'
        }, {
            taxNo,
            clientType
        });

        if (errcode === '0000' && saveRes.errcode === '0000') {
            errcode = saveRes.errcode;
            description = saveRes.description;
        } else if (errcode === '0000' && saveRes.errcode !== '0000') {
            errcode = saveRes.errcode;
            description = saveRes.description;
        }
        if (saveRes.errcode !== '0000') {
            ctx.service.log.info('海关缴款书入库异常，requestUrl：', requestUrl);
            ctx.service.log.info('海关缴款书入库异常，部分请求参数：', JSON.stringify(requestParam).substr(0, 500));
            ctx.service.log.info('海关缴款书入库异常， 后台返回：', saveRes);
        }
        return {
            startTime,
            serialNo,
            errcode,
            description
        };
    }

    // 更新新版异步任务的处理状态
    async updateSyncResult(result) {
        const ctx = this.ctx;
        const { access_token, tenantNo, client_id, operationType = '', reqid, taxNo } = ctx.request.query || {};
        const baseUrl = ctx.app.config.baseUrl;
        const basePath = `${baseUrl}/rpa/etax/newera/etax/task/callback/result/update`;
        const newTimeUrl = `${basePath}?access_token=${access_token}&taxNo=${taxNo}&operationType=${operationType}&reqid=${reqid}`;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        ctx.service.log.info('tenantNo', tenantNo, client_id, encryptKey);
        const encryData = aesEncrypt(JSON.stringify(result), encryptKey);
        ctx.service.log.info('updateSyncResult url', newTimeUrl, result);
        const res = await ctx.helper.curl(newTimeUrl, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        return res;
    }

    getStream(data) {
        const list = [];
        let index = 0;
        do {
            list.push(data.substring(index, index + 1024));
            index += 1024;
        } while (index < data.length);
        const readable = Readable.from(list);
        return readable;
    }

    // 上传异步结果
    async uploadSyncResult(batchNo, result) {
        const ctx = this.ctx;
        const { access_token, operationType = '', reqid, taxNo } = ctx.request.query || {};
        const baseUrl = ctx.app.config.baseUrl;
        const basePath = `${baseUrl}/doc/invoice/client/data/upload`;
        const requestUrl = `${basePath}?access_token=${access_token}&taxNo=${taxNo}&operationType=${operationType}&reqid=${reqid}`;
        const form = new NodeFormData();
        const stream = this.getStream(JSON.stringify(result));
        form.append('file', stream, {
            filename: `${batchNo}.txt`,
            contentType: 'text/plain'
        });
        form.append('delayDelMinuteTime', 365 * 24 * 60);
        const requestHeaders = {
            ...form.getHeaders(),
            'client-platform': 'common'
        };
        const res = await ctx.helper.curl(requestUrl, {
            method: 'POST',
            dataType: 'json',
            headers: requestHeaders,
            stream: form
        });
        ctx.service.log.info('请求头', requestHeaders);
        ctx.service.log.info('文件上传返回', res);
        return res;
    }
}
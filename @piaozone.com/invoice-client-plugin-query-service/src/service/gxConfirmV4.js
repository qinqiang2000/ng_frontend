/* eslint-disable spaced-comment,complexity,no-inline-comments,object-property-newline,no-lonely-if,eqeqeq,object-curly-newline,max-lines,yoda,no-undef,quotes,max-len */

import { companyZfbasePreKey } from '../constant';
import { transformInvoiceTypeToFpy } from '../libs/downloadApplyTool';

export class GxConfirmV4 extends BaseService {
    async commRequest(urlPath, opt, requestData, tokenKey = 'key2') {
        const ctx = this.ctx;
        const id = opt.taxNo;
        if (!id) {
            return errcodeInfo.argsErr;
        }

        const res = await ctx.service.fpdkRequest.curl(id, urlPath, {
            data: requestData,
            method: 'POST',
            tokenKey
        });

        if (res.errcode !== '0000') {
            return res;
        }

        const jsonData = res.data;
        if (jsonData.key1 === '200') {
            return {
                ...errcodeInfo.success,
                data: jsonData
            };
        }
        ctx.service.log.info('gxComfirm commRequest url：', urlPath);
        ctx.service.log.info('gxComfirm commRequest 参数：', requestData);
        ctx.service.log.info('gxComfirm commRequest 返回', res.data);
        return handleResult(jsonData);
    }

    async wq_tjcx(opt = {}, requestData = {}) {
        const ctx = this.ctx;
        const { taxPeriod } = requestData;
        const { taxNo } = opt;
        let jsonData;
        const cacheFilePath = ctx.service.tools.getCachePath(taxNo, 'wqtjcx_' + taxPeriod);
        // 往期统计表缓存24小时
        const cacheResult = ctx.service.tools.getCacheResult(cacheFilePath, 24 * 60 * 60 * 1000);
        if (cacheResult) {
            ctx.service.log.info('直接提取往期统计表缓存数据');
            jsonData = cacheResult;
        } else {
            const res = await this.commRequest('/dktj.do', opt, {
                id: 'wqdktj',
                cert: taxNo,
                tjyf: taxPeriod,
                qt: 'wq'
            });
            ctx.service.log.info('历史税款所属期查询返回', res);
            if (res.errcode !== '0000') {
                return res;
            }
            jsonData = res.data;
            ctx.service.tools.cacheResult(cacheFilePath, jsonData);
        }
        const key4 = jsonData.key4;
        return {
            errcode: '0000',
            description: 'success',
            data: {
                createTjbbStatus: '05',
                tjInfo: key4,
                tjInfoArr: this.getTjInfoArr(key4),
                updateTime: jsonData.key5, // 报表更新时间
                taxPeriod
            }
        };
    }

    clearDqtjCache(taxNo, taxPeriod) {
        const ctx = this.ctx;
        const cacheFilePath = ctx.service.tools.getCachePath(taxNo, 'dqtjcx_' + taxPeriod);
        ctx.service.tools.clearCacheFile(cacheFilePath);
    }

    getTjInfoArr(tjInfo = '') {
        const tempArr = tjInfo.split(';');
        const result = [];
        for (let i = 0; i < tempArr.length; i++) {
            const curItemArr = tempArr[i].split('=');
            let invoiceType = transformInvoiceTypeToFpy(curItemArr[0]);
            if (curItemArr[0] === '99') {
                invoiceType = '99';
            }
            if (curItemArr[0] === '99' || invoiceType !== -1) {
                result.push({
                    invoiceType: invoiceType + '',
                    deductibleNum: curItemArr[1],
                    deductibleAmount: curItemArr[2],
                    deductibleTax: curItemArr[3],
                    unDeductibleNum: curItemArr[4],
                    unDeductibleAmount: curItemArr[5],
                    unDeductibleTax: curItemArr[6]
                });
            }
        }
        return result;
    }

    // 统计查询
    async dq_tjcx(opt = {}) {
        const ctx = this.ctx;
        const { taxNo, gxrqfw, skssq } = opt;
        const curTaxPeriod = skssq.substr(0, 6);
        const cacheFilePath = ctx.service.tools.getCachePath(taxNo, 'dqtjcx_' + curTaxPeriod);
        let jsonData;
        // 往期统计表缓存24小时
        const cacheResult = ctx.service.tools.getCacheResult(cacheFilePath, 24 * 60 * 60 * 1000);
        if (cacheResult) {
            ctx.service.log.info('提取当前统计表缓存');
            jsonData = cacheResult;
        } else {
            const res = await this.commRequest('/dktj.do', opt, {
                id: 'dktj',
                cert: taxNo,
                rtm: (+new Date() + ''),
                qt: 'dq'
            });

            ctx.service.log.info('当前属期统计表查询结果', res);
            if (res.errcode !== '0000') {
                return res;
            }
            jsonData = res.data;
            if (jsonData.key3 !== '21') {
                ctx.service.tools.cacheResult(cacheFilePath, jsonData);
            }
        }

        const key2 = jsonData.key2;
        // 22 没有统计数据，不为21：dqyf>DQSSQ 当前的统计报表是在非申报期内生成的，所以无法确认签名，请撤销统计后重新申请统计并完成确认签名
        const key3 = jsonData.key3;

        // 统计数据, 格式如下
        // 01=1=9962.26=597.74=0=0=0;03=0=0=0=0=0=0;14=0=0=0=0=0=0;24=0=0=0=0=0=0;99=1=9962.26=597.74=0=0=0;
        // ;分割顺序（增值税专用发票，机动车销售发票，通行费电子发票，出口转内销发票，总计）
        // =分割顺序（抵扣份数，抵扣金额，抵扣有效税额，不抵扣份数，不抵扣金额，不抵扣有效税额）
        const key4 = jsonData.key4;


        // 报表更新时间
        const key5 = jsonData.key5; //统计完成时间
        // var key6 = jsonData.key6;

        // 01 未生成统计报表, 02 已生成统计报表，并可以进行确认签名, 03 token第十位为0表示可以按季切换税款所属期（token.split(MENUSPLIT)[10]）
        const key7 = jsonData.key7;
        // 01可以取消统计
        const key8 = jsonData.key8;

        // var key9 = jsonData.key9;
        const key10 = jsonData.key10; // 所属月份
        const key11 = jsonData.key11; // 申请时间
        const key12 = jsonData.key12;

        const DQSSQ = key10;
        const infoArr = skssq.split(';');
        const dqyf = infoArr[2];
        const curDateMonth = moment().format('YYYYMM');
        // 是否生成统计报表
        // 01：未生成统计报表，
        // 02：已生成统计报表，并可以进行确认签名,
        // 03: 预统计，您当前的统计报表是在非申报期内生成的，所以无法确认签名，请撤销统计后重新申请统计并完成确认签名,
        // 04: 已生成统计报表，但不能进行确认签名
        // 21：统计报表还在生成中...
        // 22: 没有符合条件的记录, 请先勾选发票，然后生成统计报表
        // 05: 已签名

        let createTjbbStatus = '';
        let isAllowGxInvoice = true; //是否允许勾选发票
        let isAllowQxTj = false; //是否允许取消统计
        let isAllowQrtj = false; //是否允许确认统计
        let allowChangeSsqBySeason = false; //按季切换税款所属期标志
        let description = '请先生成统计报表，如果已经生成, 可以进行确认签名或撤销统计报表操作';

        if (key7 === '01') {
            createTjbbStatus = '01';
            description = '未生成统计报表, 请先生成统计报表';
        } else {
            if (key3 === '20') {
                createTjbbStatus = '04';
                description = '已生成统计报表，但不能进行确认签名';
                if (curDateMonth !== DQSSQ) { //统计完成，自然月和当前所属期不同，则不能再勾选
                    isAllowGxInvoice = false;
                }
            } else if (key3 === '21') {
                createTjbbStatus = '21';
                description = '统计报表还在生成中...';
            } else if (key3 == '22') {
                // 没有符合条件的记录
                createTjbbStatus = '22';
                description = '没有符合条件的记录, 请先勾选发票，然后生成统计报表';
            }
        }

        if (key7 === '02') {
            createTjbbStatus = '02';
            isAllowQrtj = true;
            description = '已生成统计报表，可以进行确认签名';
        } else if (key7 === '03') {
            const isQh = key2.split('~')[10];//按季切换税款所属期标志
            if (isQh == '0') {
                allowChangeSsqBySeason = true;
                description = '请根据需要按季切换税款所属期';
            }
        } else {
            if (key3 != '21' && createTjbbStatus === '') {
                if (dqyf > DQSSQ) {
                    createTjbbStatus = '03';
                    description = '您当前的统计报表是在非申报期内生成的，所以无法确认签名，请撤销统计后重新申请统计并完成确认签名';
                }
            }
        }

        if (key8 == '01') {
            description = 'success';
            isAllowQxTj = true;
            if (createTjbbStatus === '') {
                createTjbbStatus = '04';
                description = '已生成统计报表，但不能进行确认签名';
            }
        }

        const newDqtj = {
            description: description,
            data: {
                skssq: skssq, //税控所属期
                taxPeriod: DQSSQ,
                gxrqfw,
                updateTime: key5,
                applyTime: key11,
                confirmSignTime: key12,
                belongMonth: DQSSQ, //所属月份
                createTjbbStatus: key12 ? '05' : createTjbbStatus,
                isAllowQxTj,
                isAllowQrtj,
                isAllowGxInvoice,
                allowChangeSsqBySeason,
                tjInfo: key4,
                tjsjstr: jsonData.key9,
                tjInfoArr: this.getTjInfoArr(key4)
            }
        };

        return {
            errcode: '0000',
            ...newDqtj
        };
    }

    // 申请生成抵扣统计报表
    async dkrzsb_sqscdktjbb(opt = {}) {
        // const ctx = this.ctx;
        const { taxNo, skssq } = opt;
        let res = await this.dq_tjcx(opt);
        if (res.errcode !== '0000') {
            return res;
        }

        const createTjbbStatus = res.data.createTjbbStatus;

        if (createTjbbStatus === '21') {
            return errcodeInfo.govCreatingTjbb;
        } else if (createTjbbStatus === '02' || createTjbbStatus === '04' || createTjbbStatus === '20' || createTjbbStatus === '05') { //已经生成, 直接返回统计信息
            return res; //直接返回已经生成的统计表
        } else if (createTjbbStatus === '03') { //您当前的统计报表是在非申报期内生成的，所以无法确认签名，请撤销统计后重新申请统计并完成确认签名
            return res; //errcodeInfo.govCreateTjbbNotInSbq;
        } else if (createTjbbStatus === '01') { //未生成统计报表
            const DQSSQ = skssq.substr(0, 6);
            const sign = hex_md5(encodeURIComponent(DQSSQ));
            res = await this.commRequest('/dkrzsb.do', opt, {
                id: 'sqscdktjbb',
                cert: taxNo,
                tjyf: DQSSQ,
                rtm: (+new Date() + ''),
                sign
            });
            // 生成统计表后需要清理掉旧缓存
            this.clearDqtjCache(taxNo, DQSSQ);
            if (res.errcode !== '0000') {
                return res;
            }

            return {
                errcode: '0000',
                description: '申请生成抵扣统计表成功，请等待抵扣统计表生成后，再进行抵扣统计表的签名确认',
                data: {
                    taxPeriod: DQSSQ,
                    updateTime: res.data.key3
                }
            };
        }
        return {
            ...errcodeInfo.govErr,
            description: '您当前的统计报表查询异常，请稍后再试'
        };
    }

    // 撤销生成抵扣统计报表
    async dkrzsb_qxsb(opt, requestData = {}) {
        const ctx = this.ctx;
        const { clientType = 4 } = requestData;
        const { taxNo } = opt;
        const skssq = opt.skssq;
        let res = await this.dq_tjcx(opt);
        if (res.errcode !== '0000') {
            return res;
        }

        const { createTjbbStatus, isAllowQxTj } = res.data;

        // 允许取消统计
        if (isAllowQxTj) {
            const DQSSQ = skssq.substr(0, 6);
            const sign = hex_md5(encodeURIComponent(DQSSQ));
            res = await this.commRequest('/dkrzsb.do', opt, {
                id: 'qxsb',
                cert: taxNo,
                tjyf: DQSSQ,
                rtm: (+new Date() + ''),
                sign
            });

            // 撤销统计表后需要清理掉旧缓存
            this.clearDqtjCache(taxNo, DQSSQ);

            if (res.errcode !== '0000') {
                return res;
            }

            const saveRes = await ctx.service.invoiceSave.fpy_qxsb({
                taxPeriod: DQSSQ,
                clientType,
                taxNo
            });
            if (saveRes.errcode !== '0000') {
                return saveRes;
            }
            return {
                ...errcodeInfo.success,
                description: '抵扣统计表撤销成功，您可以继续勾选发票然后再次生成统计',
                data: {
                    taxPeriod: DQSSQ
                }
            };
        }

        if (createTjbbStatus === '01') { //未生成统计报表
            return errcodeInfo.govUnCreateTjbb;
        } else if (createTjbbStatus == '22') { //未生成统计报表
            return errcodeInfo.govNoDataCreateTjbb;
        } else if (createTjbbStatus == '21') {
            return errcodeInfo.govCreatingTjbb;
        }
        return {
            ...errcodeInfo.govErr,
            description: '您当前的统计报表查询异常，请稍后再试'
        };
    }

    // 申报确认第一次请求
    async dkrzsb_qrsbOne(opt) {
        // const ctx = this.ctx;
        const { taxNo, cryptType = '0', alg = '0', skssq } = opt;
        // 先查询统计信息
        let res = await this.dq_tjcx(opt);

        if (res.errcode !== '0000') {
            return res;
        }

        const jsonData = res.data;
        if (!jsonData.isAllowQrtj) {
            const createTjbbStatus = jsonData.createTjbbStatus;
            if (createTjbbStatus === '01') { //未生成统计报表
                return errcodeInfo.govUnCreateTjbb;
            } else if (createTjbbStatus == '22') { //未生成统计报表
                return errcodeInfo.govNoDataCreateTjbb;
            } else if (createTjbbStatus == '21') {
                return errcodeInfo.govCreatingTjbb;
            } else if (createTjbbStatus === '03') { //
                return errcodeInfo.govCreateTjbbNotInSbq;
            }
            return {
                ...errcodeInfo.govCxTjbbErr,
                description: '当前统计表状态不能进行确认签名操作, 请稍后再试'
            };
        }

        //统计信息没问题，继续进行申报确认第一步
        const rtype = '0';
        const DQSSQ = skssq.substr(0, 6);
        const validate = DQSSQ + rtype;
        const sign = hex_md5(encodeURIComponent(validate));

        res = await this.commRequest('/dkrzsb.do', opt, {
            id: 'qrsb',
            cert: taxNo,
            tjyf: DQSSQ,
            rtype,
            sign
        });

        if (res.errcode !== '0000') {
            return res;
        }

        return {
            errcode: '0000',
            description: 'success',
            data: {
                cryptType, //签名的判断
                alg: alg + '',
                taxPeriod: DQSSQ,
                tjInfo: jsonData.tjInfo,
                tjsjstr: jsonData.tjsjstr, //返回统计数据
                signKey2: res.data.key2 //返回用于需要本地签名的key2
            }
        };
    }

    // 申报确认第二次请求
    async dkrzsb_qrsbTwo(opt, requestData = {}) {
        // const ctx = this.ctx;
        const { tjInfo = '', tjsjstr = '', alg = '0', clientType = '', password = '', taxNo } = requestData;
        const skssq = opt.skssq;
        let tjsjsign = requestData.tjsjsign || '';
        if (password === '') {
            return {
                errcode: '91000',
                description: '确认密码不能为空，请前往税局设置确认密码后再操作，如果已经设置请传递正确的确认密码！'
            };
        }

        tjsjsign = (new Date()).getTime() + 'a'; // 新版签名参数值
        const DQSSQ = skssq.substr(0, 6);
        const rtype = '1';
        const validate = DQSSQ + tjsjsign + rtype + tjsjstr;
        const sign = hex_md5(encodeURIComponent(validate));
        const comfirmParams = {
            id: 'qrsb',
            cert: taxNo,
            tjyf: DQSSQ,
            tjsjsign: tjsjsign,
            tjsjstr: tjsjstr,
            password: password,
            rtype: rtype,
            sign: sign,
            alg: alg
        };

        const res = await this.commRequest('/dkrzsb.do', opt, comfirmParams);
        // 确认统计表操作后清理掉旧缓存
        this.clearDqtjCache(taxNo, DQSSQ);

        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const key4 = resData.key4;
        if (key4 === '0') {
            return errcodeInfo.gxConfirmPwdError;
        }

        const MENUSPLIT = '~';
        const key2 = resData.key2; //newToken
        const isQh = key2.split(MENUSPLIT)[10]; //按季切换税款所属期标志

        const allowChangeSsqBySeason = (isQh == '0');

        // 商家平台调用目前自己完成更新
        if (clientType !== 3) {
            const saveRes = await this.ctx.service.invoiceSave.gxConfirmSave({
                tjInfo,
                taxPeriod: DQSSQ,
                taxNo
            });
            if (saveRes.errcode !== '0000') {
                return {
                    errcode: saveRes.errcode,
                    description: '税局抵扣确认签名成功，但发票云回写数据失败，请联系发票云或者通过采集重新同步数据！',
                    data: {
                        taxPeriod: DQSSQ,
                        allowChangeSsqBySeason //按季切换税款所属期标志
                    }
                };
            }
        }

        return {
            errcode: '0000',
            description: '抵扣统计表确认签名成功，在申报完成前您可以撤销统计，系统将撤销抵扣统计表和确认签名，撤销完成后可以继续勾选发票！',
            data: {
                taxPeriod: DQSSQ,
                allowChangeSsqBySeason //按季切换税款所属期标志
            }
        };
    }

    async getConfirmSign(opt = {}, originData, isLast) {
        const ctx = this.ctx;
        const passwd = encodeURIComponent(opt.caPassword || '');
        const { alg = 0 } = opt;
        const data = (0 == alg) ? {
            password: passwd,
            data: originData,
            signAlgId: 'SHA1withRSA',
            dwFlag: '0x400000',
            dwProvType: 1
        } : {
            password: passwd,
            data: originData,
            signAlgId: 'GBECSM3',
            dwFlag: '0x400000',
            dwProvType: 2050,
            strContainer: '//SM2/SM2CONTAINER0002'
        };
        const apiUrl = 'https://127.0.0.1:28000/api/signData';
        const res = await ctx.helper.curl(apiUrl, {
            method: 'POST',
            data,
            dataType: 'json'
        });
        if (res.code === 0 && res.p7Signature) {
            return {
                ...errcodeInfo.success,
                data: res.p7Signature,
                alg
            };
        }
        if (isLast) {
            return {
                ...errcodeInfo.argsErr,
                description: res.msg
            };
        }

        const res2 = await this.getConfirmSign({
            ...opt,
            alg: alg === 0 ? 1 : 0
        }, originData, true);
        return res2;
    }

    // 勾选确认完全由客户端一次完成
    async gxConfirm(opt = {}) {
        const ctx = this.ctx;
        const { taxNo, skssq } = opt;
        const companyBaseInfo = pwyStore.get(companyZfbasePreKey + taxNo) || {};
        const gxConfirmPassword = companyBaseInfo.gxConfirmPassword || '';
        if (!gxConfirmPassword) {
            return {
                ...errcodeInfo.gxConfirmPwdError,
                description: '勾选确认密码不能为空，请检查发票智慧管家客户端配置！'
            };
        }
        // 先查询统计信息
        let res = await this.dq_tjcx(opt);

        if (res.errcode !== '0000') {
            return res;
        }

        const jsonData = res.data;
        if (!jsonData.isAllowQrtj) {
            const createTjbbStatus = jsonData.createTjbbStatus;
            if (createTjbbStatus === '01') { //未生成统计报表
                return errcodeInfo.govUnCreateTjbb;
            } else if (createTjbbStatus == '22') { //未生成统计报表
                return errcodeInfo.govNoDataCreateTjbb;
            } else if (createTjbbStatus == '21') {
                return errcodeInfo.govCreatingTjbb;
            } else if (createTjbbStatus === '03') { //
                return errcodeInfo.govCreateTjbbNotInSbq;
            }
            return {
                ...errcodeInfo.govCxTjbbErr,
                description: '当前统计表状态不能进行确认签名操作, 请检查后再试！'
            };
        }

        // 统计信息没问题，继续进行申报确认第一步
        const rtype = '0';
        const DQSSQ = skssq.substr(0, 6);
        const validate = DQSSQ + rtype;
        const sign = hex_md5(encodeURIComponent(validate));

        res = await this.commRequest('/dkrzsb.do', opt, {
            id: 'qrsb',
            cert: taxNo,
            tjyf: DQSSQ,
            rtype,
            sign
        }, 'none');

        ctx.service.log.info('第一次确认返回', res);

        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || {};
        const signKey2 = resData.key2 || '';
        const tjsjstr = jsonData.tjsjstr || '';

        const signRes = await this.getConfirmSign(companyBaseInfo, tjsjstr + signKey2);
        if (signRes.errcode !== '0000') {
            return signRes;
        }
        const confirmData = {
            tjsjsign: signRes.data,
            password: gxConfirmPassword,
            tjInfo: jsonData.tjInfo,
            tjsjstr: tjsjstr,
            alg: signRes.alg + '',
            taxNo
        };
        res = await this.dkrzsb_qrsbTwo(opt, confirmData);
        return res;
    }
}

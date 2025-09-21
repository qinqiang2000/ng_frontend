/* eslint-disable complexity */
/* global errcodeInfo BaseService etaxLoginedCachePreKey pwyStore setTimeout path fs xlsx base_xlsx moment qrcode urllib log hex_md5 httpRequest */
import { getUpperMoney } from '$client/libs/changeMoney';
import { getUUId } from '$utils/getUid';
import { accMul, Add, Minus } from '$utils/index';
import { etaxInvoiceTypeToFPYInvoiceType, FPYInvoiceTypeToEtaxInvoiceType } from '$client/constant';

export class OpenRedInvoice extends BaseService {
    // 批量分页完整查询红字确认单
    async queryFullConfirmBills(loginData: any, opt : {
        startDate: string,
        endDate: string,
        keyLabel: string,
        originalEtaxInvoiceNo: string,
        originalInvoiceNo: string,
        originalInvoiceCode: string,
        invoiceAmount: number
    }) {
        const ctx = this.ctx;
        let goOn = false;
        let index = 0;
        const keyLabel = opt.keyLabel || '1'; // keyLabel 1销方 2购方
        const fullOpt = {
            identity: keyLabel === '1' ? '0' : '1', // identity 0销方 1购方
            startDate: opt.startDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
            endDate: opt.endDate || moment().format('YYYY-MM-DD'),
            page: 1,
            pageSize: 50
        };
        const originalEtaxInvoiceNo = opt.originalEtaxInvoiceNo || '';
        const originalInvoiceNo = opt.originalInvoiceNo || '';
        const originalInvoiceCode = opt.originalInvoiceCode || '';
        const invoiceAmount = Math.abs(opt.invoiceAmount);
        // 需要匹配的数电号码
        const targetEtaxInvoiceNo = originalInvoiceCode.length > 10 ? (originalEtaxInvoiceNo || originalInvoiceNo) : originalInvoiceNo;

        const findResult: any = {};
        do {
            const res = await this.queryConfirmBills(loginData, fullOpt);
            const resData = res.data || [];
            for (let i = 0; i < resData.length; i++) {
                const {
                    redConfirmBillNo,
                    govRedConfirmBillUuid,
                    redConfirmEnterDate,
                    blueInvoiceNo = '',
                    redConfirmBillStatus,
                    redInvoiceAmount
                } = resData[i];
                if (targetEtaxInvoiceNo === blueInvoiceNo && redConfirmBillStatus === '01' && invoiceAmount === Math.abs(redInvoiceAmount)) {
                    findResult.redConfirmBillNo = redConfirmBillNo;
                    findResult.govRedConfirmBillUuid = govRedConfirmBillUuid;
                    findResult.redConfirmBillStatus = redConfirmBillStatus;
                    findResult.redConfirmEnterDate = redConfirmEnterDate;
                    goOn = false;
                    break;
                }
            }
            const totalElement = res.totalElement || 0;
            index += resData.length;
            if (res.errcode !== '0000') {
                ctx.service.log.info('queryFullConfirmBills err', fullOpt, res);
            }
            if (res.errcode !== '0000' || index >= totalElement) {
                goOn = false;
            } else {
                fullOpt.page += 1;
                goOn = true;
            }
        } while (goOn);
        return {
            ...errcodeInfo.success,
            data: findResult
        };
    }

    // 录入提交前查询是否可以录入确认单
    async preSubmitRedConfirmBill(loginData: any, invoiceData: any) {
        const ctx = this.ctx;
        const {
            originalInvoiceCode = '',
            originalInvoiceNo = '',
            businessType = '',
            originalInvoiceType,
            keyLabel = '1',
            enterStartDate
        } = invoiceData;
        let originalEtaxInvoiceNo = invoiceData.originalEtaxInvoiceNo || '';
        let FplyDm = '2';

        // 申请方 默认1销方申请 2购方申请
        if (!(keyLabel === '1' || keyLabel === '2')) {
            return {
                errcode: '0001',
                description: '红字申请单申请方‘keyLabel’限制为1或2'
            };
        }

        // 录入纸质发票时，数电号码为空，这里税局要求传代码和号码的拼接字段
        if (!originalEtaxInvoiceNo && originalInvoiceCode.length > 8) {
            originalEtaxInvoiceNo = originalInvoiceCode + '' + originalInvoiceNo;
            FplyDm = '1';
        }

        const paramJson : any = {
            Lzfpqdhm: originalInvoiceCode.length > 8 ? originalEtaxInvoiceNo : originalInvoiceNo,
            Lzfphm: originalInvoiceCode.length > 8 ? originalInvoiceNo : '', // 发票代码存在时为数电纸质发票
            Lzfpdm: originalInvoiceCode,
            Gmfnsrsbh: invoiceData.buyerTaxNo,
            Xsfnsrsbh: invoiceData.salerTaxNo,
            Lzkprq: invoiceData.originalInvoiceDate, // 格式 2022-10-18 13:51:51
            Sflzfp: 'Y',
            Kpfnsrsbh: keyLabel === '2' ? '' : invoiceData.salerTaxNo,
            FplyDm,
            Gjbq: keyLabel,
            TdyslxDm: businessType
        };
        const govType = FPYInvoiceTypeToEtaxInvoiceType[('k' + originalInvoiceType) as keyof typeof FPYInvoiceTypeToEtaxInvoiceType];
        paramJson.FplxDm = govType || '';

        const urlPath = '/kpfw/hzqrxxQuery/v1/initHzqrxxByLzfp';
        ctx.service.log.info('录入检测请求', urlPath, paramJson);
        // const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
        //     method: 'post',
        //     dataType: 'json',
        //     contentType: 'json',
        //     body: paramJson
        // });
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        ctx.service.log.fullInfo('录入检测请求返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Code, Message = '' } = resData;
        // 录入检测到数据不能提交红字确认单
        if (Code === 'N') {
            if (Message.indexOf('没有可红冲的金额') !== -1) {
                const checkRes = await this.queryFullConfirmBills(loginData, {
                    startDate: enterStartDate, // moment().format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD'),
                    keyLabel: invoiceData.keyLabel,
                    originalEtaxInvoiceNo: invoiceData.originalEtaxInvoiceNo,
                    originalInvoiceNo: invoiceData.originalInvoiceNo,
                    originalInvoiceCode: invoiceData.originalInvoiceCode,
                    invoiceAmount: invoiceData.invoiceAmount
                });
                const checkData = checkRes.data || {};
                if (checkData.govRedConfirmBillUuid) {
                    return {
                        ...errcodeInfo.success,
                        data: checkData
                    };
                }
            }
            return {
                ...errcodeInfo.argsErr,
                description: Message
            };
        }
        return {
            ...errcodeInfo.success,
            data: resData
        };
    }

    // 录入红字确认单
    async submitRedConfirmBill(loginData: any, invoiceData: any) {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        const fpdkType = invoiceData.fpdkType || fpdk_type;
        const preRes = await this.preSubmitRedConfirmBill(loginData, invoiceData);
        if (preRes.errcode !== '0000') {
            return preRes;
        }
        // 确认单已经存在，直接返回
        if (preRes.data?.govRedConfirmBillUuid) {
            return {
                ...errcodeInfo.success,
                data: preRes.data
            };
        }
        const { redReason, items } = invoiceData;
        // 转换为正值
        const invoiceAmount = Math.abs(invoiceData.invoiceAmount);
        const totalTaxAmount = Math.abs(invoiceData.totalTaxAmount);

        // 01 开票有误 不允许部分冲红
        // 02 销货退回 只允许修改数量，不允许修改单价
        // 03 服务终止 允许修改总金额和数量，不允许修改单价。
        // 04 销售折让 不能修改单价和数量。
        if (!(redReason === '01' || redReason === '02' || redReason === '03' || redReason === '04')) {
            return {
                errcode: '0001',
                description: '待录入红字确认单的红冲原因限制为01，02，03，04'
            };
        }

        const preData = preRes.data || {};
        const { Lzhjje, Lzhjse, HzqrxxmxList, ZzsytDm, XfsytDm, FprzztDm } = preData;

        // 部分红冲标识
        let partRedSign = false;
        if (invoiceAmount < Lzhjje) {
            // 部分红冲 小于原蓝票的金额合计(不含税)都只能部分红冲
            partRedSign = true;

            if (redReason === '01') {
                // 开票有误
                return {
                    errcode: '0001',
                    description: '红冲原因为开票有误时不允许部分红冲，已进行部分红冲的只能选择销货退回/服务中止/销售折让'
                };
            }
            /*
            // 临时屏蔽，目前ZzsytDm返回03是已认证状态
            if (!(ZzsytDm === '00' || ZzsytDm === '01' || ZzsytDm === '03' || XfsytDm === '01' || FprzztDm === '01')) {
                // 当发票的增值税用途状态为“已勾选未确认/已确认”或发票入账状态为“已入账”或消费税用途为“已勾选库存”时，允许由销方或购方发起部分红冲。
                // ZzsytDm 增值税用途状态 00已勾选未确认 01已确认 03未勾选（有时返回已认证）
                // XfsytDm 消费税用途代码 00未勾选库存 01已勾选库存
                // FprzztDm 发票入账状态代码 00未入账 01已入账
                ctx.service.log.info('submitRedConfirmBill XfsytDm FprzztDm', XfsytDm, FprzztDm);
                return {
                    errcode: '0001',
                    description: '原蓝票增值税用途状态为“已勾选未确认/已确认”或发票入账状态为“已入账”或消费税用途为“已勾选库存”时，才可以发起部分红冲'
                };
            }
            */

            if (!items) {
                return {
                    errcode: '0001',
                    description: '待录入红字确认单部分红冲时明细不能为空'
                };
            }

            if (Reflect.apply(Object.prototype.toString, items, []) !== '[object Array]') {
                return {
                    errcode: '0001',
                    description: '待录入红字确认单的明细数据类型限制为Array'
                };
            }

            let temJe = 0;
            let temSe = 0;
            for (let i = 0; i < items.length; i++) {
                const { discountType, lineNumber } = items[i] || {};
                let { num, detailAmount, taxAmount } = items[i] || {};
                if (!lineNumber) {
                    return {
                        errcode: '0001',
                        description: '待录入红字确认单的明细行号不能为空'
                    };
                }
                if (!/^\d+$/.test(lineNumber)) {
                    return {
                        errcode: '0001',
                        description: '待录入红字确认单的明细行号应为以1开始的数值'
                    };
                }
                if (discountType && discountType !== '0') {
                    return {
                        errcode: '0001',
                        description: '待录入红字确认单的明细需合并被折扣行与折扣行'
                    };
                }
                if (redReason === '04' && num) {
                    return {
                        errcode: '0001',
                        description: '待录入红字确认单的红冲原因为销售折让时明细数量和单价应置空'
                    };
                }
                const HzqrxxmxItem = HzqrxxmxList.find((item: any) => +item.Xh === +lineNumber);
                if (!HzqrxxmxItem) {
                    ctx.service.log.fullInfo('submitRedConfirmBill HzqrxxmxItem', items, HzqrxxmxList);
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单的明细行号${lineNumber}与可红冲的明细行号${HzqrxxmxList.map((item: any) => item.Xh).join()}不匹配`
                    };
                }
                // 转换为正值
                num = Math.abs(num);
                detailAmount = Math.abs(detailAmount);
                taxAmount = Math.abs(taxAmount);
                const { Fpspdj, Sl1 } = HzqrxxmxItem;
                let { Fpspsl, Je, Se } = HzqrxxmxItem;
                // 转换为正值
                Fpspsl = Math.abs(Fpspsl);
                Je = Math.abs(Je);
                Se = Math.abs(Se);
                if (!detailAmount) {
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单明细行号${lineNumber}的总价(不含税)不能为0`
                    };
                }
                if (detailAmount > Je) {
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单明细行号${lineNumber}的总价(不含税)${detailAmount}应小于等于可红冲明细行号${lineNumber}的总价(不含税)${Je}`
                    };
                }
                // 待录入有数量，可红冲有数量
                if (num && Fpspsl) {
                    if (num > Fpspsl) {
                        return {
                            errcode: '0001',
                            description: `待录入红字确认单明细行号${lineNumber}的数量${num}应小于等于可红冲明细行号${lineNumber}的数量${Fpspsl}`
                        };
                    }
                    if (Math.abs(Minus(accMul(num, Fpspdj), detailAmount)) > 0.01) {
                        return {
                            errcode: '0001',
                            description: `待录入红字确认单明细行号${lineNumber}的数量${num} * 单价(不含税)${Fpspdj}与总价(不含税)${detailAmount}的误差大于0.01`
                        };
                    }
                }
                if (taxAmount > Se) {
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单明细行号${lineNumber}的税额${taxAmount}应小于等于可红冲明细行号${lineNumber}的税额${Se}`
                    };
                }
                if (Math.abs(Minus(accMul(detailAmount, Sl1), taxAmount)) > 0.06) {
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单明细行号${lineNumber}的总价(不含税)${detailAmount} * 税率${Sl1}与税额${taxAmount}的误差大于0.06`
                    };
                }
                if (detailAmount === Je && taxAmount !== Se) {
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单与可红冲明细行号${lineNumber}的总价(不含税)相等，但税额${taxAmount}与${Se}不一致`
                    };
                }

                // 税率为0时，可红冲税额一直为0，无需校验
                if (Se && detailAmount !== Je && taxAmount === Se) {
                    return {
                        errcode: '0001',
                        description: `待录入红字确认单与可红冲明细行号${lineNumber}的税额相等，但总价(不含税)${detailAmount}与${Je}不一致`
                    };
                }
                temJe = Add(temJe, detailAmount || 0);
                temSe = Add(temSe, taxAmount || 0);
            }

            if (invoiceAmount !== temJe) {
                return {
                    errcode: '0001',
                    description: `待录入红字确认单的金额合计(不含税)${invoiceAmount}与明细金额合计(不含税)${temJe}不一致`
                };
            }

            if (totalTaxAmount !== temSe) {
                return {
                    errcode: '0001',
                    description: `待录入红字确认单的总税额${totalTaxAmount}与明细总税额${temSe}不一致`
                };
            }
        } else {
            // 全额红冲
            if (invoiceAmount !== Lzhjje) {
                return {
                    errcode: '0001',
                    description: `待录入红字确认单的金额合计(不含税)${invoiceAmount}与原蓝票的金额合计(不含税)${Lzhjje}不一致`
                };
            }
            if (totalTaxAmount !== Lzhjse) {
                return {
                    errcode: '0001',
                    description: `待录入红字确认单的总税额${totalTaxAmount}与原蓝票的总税额${Lzhjse}不一致`
                };
            }
        }

        const Hzcxje = -invoiceAmount;
        const Hzcxse = -totalTaxAmount;
        const Jshj = Add(Hzcxje, Hzcxse);
        const jshjdx = getUpperMoney(Jshj);
        if (!jshjdx) {
            ctx.service.log.info('submitRedConfirmBill getUpperMoney error', Jshj);
            return {
                ...errcodeInfo.argsErr,
                description: '金额有误，请检查!'
            };
        }

        let list;
        if (partRedSign) {
            // 部分红冲
            list = items.map((mx: any) => {
                const { lineNumber, num, detailAmount, taxAmount } = mx;
                const item = HzqrxxmxList.find((hzmx: any) => +hzmx.Xh === +lineNumber);
                const oldSe = -parseFloat(item.Se);
                const oldJe = -parseFloat(item.Je);
                return {
                    ...item,
                    Oldse: oldSe,
                    Oldje: oldJe,
                    Oldfpspsl: null,
                    Fpspsl: redReason !== '04' && item.Fpspsl ? -Math.abs(num) : null, // 数量 04销售折让时置空数量
                    Oldfpspdj: redReason === '04' ? '' : item.Fpspdj, // 04销售折让时置空单价
                    Fpspdj: redReason === '04' ? '' : item.Fpspdj, // 04销售折让时置空单价
                    Taxfpspdj: redReason === '04' ? '' : item.Fpspdj, // 04销售折让时置空单价
                    Je: -Math.abs(detailAmount), // 不含税金额
                    Se: -Math.abs(taxAmount), // 税额
                    Taxje: Math.abs(Add(detailAmount, taxAmount)) // 含税金额
                };
            });
        } else {
            // 全额红冲
            list = HzqrxxmxList.map((item: any) => {
                const oldSe = -parseFloat(item.Se);
                const oldJe = -parseFloat(item.Je);
                return {
                    ...item,
                    Oldse: oldSe,
                    Oldje: oldJe,
                    Oldfpspsl: null,
                    Fpspsl: redReason === '04' ? '' : item.Fpspsl, // 04销售折让时置空数量
                    Oldfpspdj: redReason === '04' ? '' : item.Fpspdj, // 04销售折让时置空单价
                    Fpspdj: redReason === '04' ? '' : item.Fpspdj, // 04销售折让时置空单价
                    Taxfpspdj: redReason === '04' ? '' : item.Fpspdj, // 04销售折让时置空单价
                    Taxje: Add(oldSe, oldJe)
                };
            });
        }

        const paramJson: any = {
            ...preData,
            Hzcxje,
            Hzcxse,
            Jshj,
            ChyyDm: redReason,
            Jshjdx: jshjdx,
            HzqrxxmxList: list
        };

        const urlPath = '/kpfw/hzqrxxSave/v1/saveHzqrxxForHztzd';
        // const pageId = loginData.pageId;
        ctx.service.log.fullInfo('录入提交', urlPath, paramJson);
        // debug 模式不真实录入
        if (invoiceData.debugOpenInvoice === true) {
            const returnData = {
                redConfirmBillNo: '6666666' + (+new Date()),
                redConfirmEnterDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                govRedConfirmBillUuid: getUUId()
            };
            // aws红字录入需要自己保存确认单信息
            if (parseInt(fpdkType) === 3) {
                await ctx.service.openHistory.uploadRedConfirmBill(invoiceData, { ...paramJson, ...returnData });
            }
            return {
                ...errcodeInfo.success,
                data: returnData
            };
        }

        // const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
        //     method: 'post',
        //     dataType: 'json',
        //     contentType: 'json',
        //     body: paramJson
        // });
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        ctx.service.log.info('录入提交返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Code, Message, Hzfpxxqrdbh, Lrrq, Uuid, HzqrxxztDm } = resData;
        const returnData = {
            redConfirmBillNo: Hzfpxxqrdbh,
            redConfirmEnterDate: Lrrq,
            govRedConfirmBillUuid: Uuid,
            redConfirmBillStatus: HzqrxxztDm
            // addTaxUseState: preData.ZzsytDm, // 增值税用途状态 03未勾选
            // exciseUseState: preData.XfsytDm, // 消费税用途状态, 00未勾选
            // invoiceEntryState: preData.FprzztDm // 入账状态， 00未入账
        };

        if (Code === 'N') {
            if (Message.indexOf('存在进行中的红字确认单保存操作') !== -1) {
                const checkRes = await this.queryFullConfirmBills(loginData, {
                    startDate: invoiceData.enterStartDate,
                    endDate: moment().format('YYYY-MM-DD'),
                    keyLabel: invoiceData.keyLabel,
                    originalEtaxInvoiceNo: invoiceData.originalEtaxInvoiceNo,
                    originalInvoiceNo: invoiceData.originalInvoiceNo,
                    originalInvoiceCode: invoiceData.originalInvoiceCode,
                    invoiceAmount: invoiceData.invoiceAmount
                });
                const checkData = checkRes.data || {};
                if (!checkData.govRedConfirmBillUuid) {
                    return {
                        ...errcodeInfo.argsErr,
                        description: Message
                    };
                }
                returnData.redConfirmBillNo = checkData.redConfirmBillNo;
                returnData.redConfirmEnterDate = checkData.redConfirmEnterDate;
                returnData.govRedConfirmBillUuid = checkData.govRedConfirmBillUuid;
                returnData.redConfirmBillStatus = checkData.redConfirmBillStatus;
            } else {
                return {
                    ...errcodeInfo.argsErr,
                    description: Message
                };
            }
        }

        // 税局返回了确认单编号才上传
        if (returnData.redConfirmBillNo) {
            // aws红字录入需要自己保存确认单信息
            ctx.service.openHistory.uploadRedConfirmBill(invoiceData, {
                ...paramJson,
                ...returnData
            });
        }

        return {
            ...errcodeInfo.success,
            data: returnData
        };
    }

    // 查询确认单参数校验
    checkQueryConfirmBillArgs(opt: any) {
        const {
            identity = '', // 0, 销售方，1，购买方，必须传一个，不能为空
            startDate = '', // 录入开始日期，不能为空
            endDate = '', // 录入结束日期，不能为空
            enterIdentity = '', // 录入方身份 0销售方，1购买方，可以为空，为空则全部
            redConfirmBillStatus = '', // 确认单状态，可以为空
            invoiceOpenState = '', // 开具状态，可以为空
            page = 1,
            pageSize = 50
        } = opt;

        if (identity !== '0' && identity !== '1') {
            return {
                ...errcodeInfo.argsErr,
                description: '购销方身份参数错误'
            };
        }
        const dateReg = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
        const curDateInt = parseInt(moment().format('YYYYMMDD'));
        if (!startDate || !endDate || !dateReg.test(startDate) || !dateReg.test(endDate)) {
            return {
                ...errcodeInfo.argsErr,
                description: '录入起止日期不能为空或格式错误,格式为(YYYY-MM-DD)'
            };
        }
        const startDateInt = parseInt(startDate.replace(/-/g, ''));
        const endDateInt = parseInt(endDate.replace(/-/g, ''));
        if (startDateInt > endDateInt) {
            return {
                ...errcodeInfo.argsErr,
                description: '开始日期不能大于结束日期'
            };
        }
        if (startDateInt > curDateInt || endDateInt > curDateInt) {
            return {
                ...errcodeInfo.argsErr,
                description: '起止日期参数不能大于今天'
            };
        }

        if (!page || page < 1) {
            return {
                ...errcodeInfo.argsErr,
                description: 'page参数错误'
            };
        }

        if (pageSize > 50) {
            return {
                ...errcodeInfo.argsErr,
                description: '分页最大值不能超过50'
            };
        }

        if (redConfirmBillStatus !== '' && ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].indexOf(redConfirmBillStatus) === -1) {
            return {
                ...errcodeInfo.argsErr,
                description: '确认单状态参数错误'
            };
        }

        if (invoiceOpenState !== '' && invoiceOpenState !== 'Y' && invoiceOpenState !== 'N') {
            return {
                ...errcodeInfo.argsErr,
                description: '确认单开具状态参数错误'
            };
        }

        if (enterIdentity !== '' && enterIdentity !== '0' && enterIdentity !== '1') {
            return {
                ...errcodeInfo.argsErr,
                description: '录入方身份参数错误'
            };
        }
        return errcodeInfo.success;
    }

    async queryConfirmBills(loginData: any, opt: any) {
        const ctx = this.ctx;
        const {
            identity = '', // 0, 销售方，1，购买方，必须传一个，不能为空
            startDate = '', // 录入开始日期，不能为空
            endDate = '', // 录入结束日期，不能为空
            otherSideName = '', // 对方纳税人名称，可以为空
            enterIdentity = '', // 录入方身份 0销售方，1购买方，可以为空，为空则全部
            redConfirmBillStatus = '', // 确认单状态，可以为空
            invoiceOpenState = '', // 开具状态，可以为空
            page = 1,
            pageSize = 50
        } = opt;

        const checkRes = this.checkQueryConfirmBillArgs(opt);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const paramJson = {
            Gxfxz: identity, // 0 销售方，1，购买方
            Qrdzt: redConfirmBillStatus, // 确认单状态
            Dfnsrmc: otherSideName, // 对方纳税人名称
            Kprqq: startDate, // 录入开始日期
            Kprqz: endDate, // 录入结束日期
            Kpzt: invoiceOpenState, // Y已开具，N未开具, 空字符串为全部
            Lrfsf: enterIdentity, // 录入方身份
            PageNumber: page || 1,
            PageSize: pageSize || 50
        };
        const result = [];
        const urlPath = '/kpfw/hzqrxxQuery/v1/queryHzqrxxForHzqrd';

        ctx.service.log.info('查询确认单url', urlPath);
        ctx.service.log.info('查询确认单参数', paramJson);
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Total, List } = resData;
        for (let i = 0; i < List.length; i++) {
            const item = List[i];
            const LzfplxDm2 = 'k' + item.LzfplxDm2;
            let invoiceType = etaxInvoiceTypeToFPYInvoiceType[LzfplxDm2 as keyof typeof etaxInvoiceTypeToFPYInvoiceType];
            if (!invoiceType) {
                // 未匹配到发票类型
                ctx.service.log.info('未匹配到发票类型 LzfplxDm2', LzfplxDm2);
                // 设置默认的发票类型
                if (item.LzfppzDm === '01') {
                    invoiceType = 27;
                } else {
                    invoiceType = 26;
                }
            }

            const itemData = {
                redConfirmEnterDate: item.Lrrq || '', // 确认的编号录入日期，精确到秒
                redConfirmBillNo: item.Hzfpxxqrdbh || '', // 确认单编号
                govRedConfirmBillUuid: item.Uuid || '', // 税局确认单uuid
                // 红字确认状态代码01无需确认，02销方录入待购方确认，03购方录入待销方确认，04购销双方已确认，05作废（销方录入购方否认），
                // 06作废（购方录入销方否认），07作废（超72小时未确认），08作废（发起方已撤销），09作废（确认后撤销），10作废（异常凭证）
                redConfirmBillStatus: item.HzqrxxztDm,
                redReason: item.ChyyDm, // 红冲原因 01开票有误

                enterIdentity: item.Lrfsf, // 录入方身份 0销售方，1购买方

                buyerName: item.Gmfmc, // 购方名称
                buyerTaxNo: item.Gmfnsrsbh, // 购方税号
                salerName: item.Xsfmc, // 销方名称
                salerTaxNo: item.Xsfnsrsbh, // 销方税号

                redInvoiceNo: item.Hzfphm || '', // 已经开具红票的发票号码
                redInvoiceDate: item.Hzkprq || '', // 已经开具的红票的开票日期，精确到秒
                redInvoiceAmount: item.Hzcxje, // 已经开具的红票的金额
                redTaxAmount: item.Hzcxse, // 已经开具的红票的税额

                blueInvoiceType: invoiceType, // 蓝字发票类型
                blueInvoiceCode: item.Lzfpdm || '', // 蓝字发票代码
                blueInvoiceNo: item.Lzfphm || '', // 蓝字发票号码
                blueInvoiceAmount: item.Lzhjje, // 蓝字发票不含税总金额
                blueTaxAmount: item.Lzhjse, // 蓝字发票税额
                blueInvoiceDate: item.Lzkprq // 蓝字发票日期，精确到秒
            };
            result.push(itemData);
        }
        return {
            ...errcodeInfo.success,
            data: result,
            pageNo: paramJson.PageNumber,
            totalElement: Total,
            pageSize: paramJson.PageSize
        };
    }

    async transformConfirmDetail(loginData: any, data: any) {
        const ctx = this.ctx;
        const LzfplxDm2 = 'k' + data.LzfplxDm2;
        const invoiceType = etaxInvoiceTypeToFPYInvoiceType[LzfplxDm2 as keyof typeof etaxInvoiceTypeToFPYInvoiceType];
        if (!invoiceType) {
            ctx.service.log.info('暂不支持该发票类型确认单的查询 LzfplxDm2', LzfplxDm2);
            return {
                ...errcodeInfo.argsErr,
                description: '暂不支持该发票类型确认单的查询'
            };
        }
        const itemData = {
            redConfirmEnterDate: data.Lrrq || '', // 确认的编号录入日期，精确到秒
            redConfirmBillNo: data.Hzfpxxqrdbh || '', // 确认单编号
            govRedConfirmBillUuid: data.Uuid || '', // 税局确认单uuid
            // 红字确认状态代码01无需确认，02销方录入待购方确认，03购方录入待销方确认，04购销双方已确认，05作废（销方录入购方否认），
            // 06作废（购方录入销方否认），07作废（超72小时未确认），08作废（发起方已撤销），09作废（确认后撤销），10作废（异常凭证）
            redConfirmBillStatus: data.HzqrxxztDm,
            redReason: data.ChyyDm, // 红冲原因 01开票有误

            enterIdentity: data.Lrfsf, // 录入方身份 0销售方，1购买方

            buyerName: data.Gmfmc, // 购方名称
            buyerTaxNo: data.Gmfnsrsbh, // 购方税号
            salerName: data.Xsfmc, // 销方名称
            salerTaxNo: data.Xsfnsrsbh, // 销方税号

            redInvoiceNo: data.Hzfphm || '', // 已经开具红票的发票号码
            redInvoiceDate: data.Hzkprq || '', // 已经开具的红票的开票日期，精确到秒
            redInvoiceAmount: data.Hzcxje, // 已经开具的红票的金额
            redTaxAmount: data.Hzcxse, // 已经开具的红票的税额

            blueInvoiceType: invoiceType, // 蓝字发票类型
            blueInvoiceCode: data.Lzfpdm || '', // 蓝字发票代码
            blueInvoiceNo: data.Lzfphm || '', // 蓝字发票号码
            blueInvoiceAmount: data.Lzhjje, // 蓝字发票不含税总金额
            blueTaxAmount: data.Lzhjse, // 蓝字发票税额
            blueInvoiceDate: data.Lzkprq, // 蓝字发票日期，精确到秒

            enterAccountStateCode: data.FprzztDm, // 入账状态代码：00 未入账
            addTaxUseCode: data.ZzsytDm, // 增值税用途状态代码：03未勾选
            consumerTaxUseCode: data.XfsytDm, // 消费税用途状态: 00未勾选

            items: data.HzqrxxmxList.map((item: any) => {
                return {
                    blueInvoiceItemIndex: item.Lzmxxh, // 蓝字发票明细序号
                    index: item.Xh, // 序号
                    uuid: item.Uuid, // 确认单明细uuid
                    goodsName: item.Hwhyslwfwmc || '', // 项目名称
                    specModel: item.Ggxh || '', // 规格型号
                    unit: item.Dw || '', // 单位
                    num: item.Fpspsl, // 数量
                    unitPrice: item.Fpspdj, // 单价
                    detailAmount: item.Je, // 不含税金额
                    taxAmount: item.Se, // 税额
                    taxRate: item.Sl1, // 税率
                    goodsCode: item.Sphfwssflhbbm // 商品编码
                };
            })
        };
        return {
            ...errcodeInfo.success,
            data: itemData
        };
    }

    // 撤销红字确认单
    async revokeRedConfirmBill(loginData: any, data: any) {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        const { govRedConfirmBillUuid, salerTaxNo } = data || {};

        if (!govRedConfirmBillUuid) {
            return {
                ...errcodeInfo.argsErr,
                description: '红字确认单uuid不能为空'
            };
        }

        if (!salerTaxNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '红字确认单销方税号不能为空'
            };
        }

        const urlPath = '/kpfw/hzqrxxUpdate/v1/hzqrxxRevoke';
        const paramJson = {
            Uuid: govRedConfirmBillUuid,
            Xsfnsrsbh: salerTaxNo
        };
        ctx.service.log.info('撤销红字确认单url', urlPath);
        ctx.service.log.info('撤销红字确认单参数', paramJson);
        const resRevoke: any = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        if (resRevoke.errcode !== '0000') {
            return resRevoke;
        }
        const { Code, Message } = resRevoke.data;
        if (Code !== 'Y') {
            return {
                ...errcodeInfo.argsErr,
                description: Message
            };
        }

        // 查询红字确认单状态
        const resQuery = await this.queryConfirmBillDetail(loginData, govRedConfirmBillUuid, salerTaxNo);
        if (resQuery.errcode !== '0000') {
            return resQuery;
        }
        const detail = resQuery.data || {};

        const result = {
            govRedConfirmBillUuid,
            redConfirmBillStatus: detail.HzqrxxztDm
        };
        // aws红字录入需要自己保存确认单信息
        if (parseInt(fpdk_type) === 3) {
            await ctx.service.openHistory.uploadRedConfirmBillStatus(result);
        }

        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    // 确认or拒绝红字确认单
    async updateRedConfirmBill(loginData: any, data: any) {
        const ctx = this.ctx;
        const { fpdk_type } = ctx.request.query;
        const { govRedConfirmBillUuid, salerTaxNo, confirmationType } = data || {};

        if (!govRedConfirmBillUuid || !salerTaxNo || !confirmationType) {
            return errcodeInfo.argsErr;
        }

        if (!(confirmationType === 'Y' || confirmationType === 'N')) {
            return {
                errcode: '0001',
                description: '红字确认单确认类型‘confirmationType’限制为Y或N'
            };
        }

        const urlPath = '/kpfw/hzqrxxUpdate/v1/hzqrxxUpdate';
        const paramJson = {
            Uuid: govRedConfirmBillUuid,
            Xsfnsrsbh: salerTaxNo,
            Qrlx: confirmationType
        };
        ctx.service.log.info('确认/拒绝红字确认单url', urlPath);
        ctx.service.log.info('确认/拒绝红字确认单参数', paramJson);
        const resRevoke: any = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        if (resRevoke.errcode !== '0000') {
            return resRevoke;
        }
        const { Code, Message } = resRevoke.data;
        if (Code !== 'Y') {
            return {
                ...errcodeInfo.argsErr,
                description: Message
            };
        }

        // 查询红字确认单状态
        const resQuery = await this.queryConfirmBillDetail(loginData, govRedConfirmBillUuid, salerTaxNo);
        if (resQuery.errcode !== '0000') {
            return resRevoke;
        }
        const detail = resQuery.data || {};

        const result = {
            govRedConfirmBillUuid,
            redConfirmBillStatus: detail.HzqrxxztDm
        };
        // aws红字录入需要自己保存确认单信息
        if (parseInt(fpdk_type) === 3) {
            await ctx.service.openHistory.uploadRedConfirmBillStatus(result);
        }

        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    // 查询红字确认单详情
    async queryConfirmBillDetail(loginData: any, govRedConfirmBillUuid: string, salerTaxNo?: string) {
        const ctx = this.ctx;
        const urlPath = '/kpfw/hzqrxxQuery/v1/queryHzqrxxDetail';
        const paramJson = {
            Uuid: govRedConfirmBillUuid,
            Xsfnsrsbh: salerTaxNo || loginData.taxNo
        };
        ctx.service.log.info('查询确认单详情url', urlPath);
        ctx.service.log.info('查询确认单详情参数', paramJson);
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        if (res.errcode !== '0000') {
            return res;
        }
        const { Code, Message } = res.data;
        if (Code !== 'Y') {
            return {
                ...errcodeInfo.argsErr,
                description: Message
            };
        }
        return res;
    }

    async checkOpenRedInvoice(loginData: any, fileJSONData: any = {}) {
        const ctx = this.ctx;
        const qRes = await this.queryConfirmBillDetail(loginData, fileJSONData.govRedConfirmBillUuid);
        ctx.service.log.fullInfo('checkOpenRedInvoice queryConfirmBillDetail res', qRes);
        if (qRes.errcode !== '0000') {
            return qRes;
        }
        const detail = qRes.data || {};

        if (detail.Hzfpxxqrdbh !== fileJSONData.redConfirmBillNo) {
            return {
                errcode: '0001',
                description: `红字确认单编号（${detail.Hzfpxxqrdbh}）与根据红字确认单税局uuid获取的编号（${fileJSONData.redConfirmBillNo}）不一致`
            };
        }
        let invoiceNo = fileJSONData.originalInvoiceNo;

        // 数电纸质发票先获取originalEtaxInvoiceNo字段进行判断
        if (detail.Lzfphm?.length === 20) {
            invoiceNo = fileJSONData.originalEtaxInvoiceNo || fileJSONData.originalInvoiceNo;
        }

        if (detail.Lzfphm !== invoiceNo) {
            return {
                errcode: '0001',
                description: `红字确认单（${detail.Lzfphm}）与原蓝票（${invoiceNo}）的发票号码不一致`
            };
        }

        if (detail.Xsfnsrsbh !== fileJSONData.salerTaxNo) {
            return {
                errcode: '0001',
                description: `红字确认单（${detail.Xsfnsrsbh}）与原蓝票（${fileJSONData.salerTaxNo}）的销方税号不一致`
            };
        }
        if (detail.Gmfnsrsbh !== '000000000000000' && fileJSONData.buyerTaxNo && detail.Gmfnsrsbh !== fileJSONData.buyerTaxNo) {
            return {
                errcode: '0001',
                description: `红字确认单（${detail.Gmfnsrsbh}）与原蓝票（${fileJSONData.buyerTaxNo}）的购方税号不一致`
            };
        }
        // 兼容无时分秒的发票红冲
        let redDate = detail.Lzkprq || '';
        let blueDate = fileJSONData.originalInvoiceDate || '';
        const isValidDate = moment(blueDate, 'YYYY-MM-DD HH:mm:ss').isValid();
        if (isValidDate) {
            const time = blueDate.split(' ');
            if (time[1] === '00:00:00') {
                redDate = redDate.substring(0, 10);
                blueDate = time[0];
            }
        }
        if (redDate !== blueDate) {
            return {
                errcode: '0001',
                description: `红字确认单（${redDate}）与原蓝票（${blueDate}）的开票日期不一致`
            };
        }
        const { HzqrxxztDm, Hzfphm, Hzkprq } = detail; // ZzsytDm, XfsytDm, FprzztDm
        // 已经开过红票
        if (Hzfphm && Hzkprq) {
            return {
                ...errcodeInfo.success,
                data: detail
            };
        }
        // 红字确认状态代码01无需确认，02销方录入待购方确认，03购方录入待销方确认，04购销双方已确认，05作废（销方录入购方否认），
        // 06作废（购方录入销方否认），07作废（超72小时未确认），08作废（发起方已撤销），09作废（确认后撤销），10作废（异常凭证）
        const confirmStatusDict : any = {
            'k01': '无需确认',
            'k02': '销方录入待购方确认',
            'k03': '购方录入待销方确认',
            'k04': '购销双方已确认',
            'k05': '作废（销方录入购方否认）',
            'k06': '作废（购方录入销方否认）',
            'k07': '作废（超72小时未确认）',
            'k08': '作废（发起方已撤销）',
            'k09': '作废（确认后撤销）',
            'k10': '作废（异常凭证）'
        };
        const confirmText : string = confirmStatusDict['k' + HzqrxxztDm] || '';
        if (!confirmText) {
            return {
                ...errcodeInfo.govRedBillError,
                description: '查询红字发票确认单状态异常'
            };
        }
        if (HzqrxxztDm !== '01' && HzqrxxztDm !== '04') {
            return {
                ...errcodeInfo.govRedBillError,
                description: '开票失败, 当前红字发票确认单状态为： ' + confirmText
            };
        }

        const urlPath = '/kpfw/hzfpkj/v1/initCheck';
        const paramJson : any = {
            Code: 'Y',
            Message: '保存成功!',
            Uuid: detail.Uuid,
            Hzfpxxqrdbh: detail.Hzfpxxqrdbh,
            Lrfsf: detail.Lrfsf,
            Xsfnsrsbh: detail.Xsfnsrsbh,
            Xsfmc: null,
            Gmfnsrsbh: detail.Gmfnsrsbh,
            Gmfmc: null,
            Dfnsrsbh: null,
            Dfnsrmc: null,
            Lzfpdm: detail.Lzfpdm || null,
            Lzfphm: detail.Lzfphm,
            Lzkprq: detail.Lzkprq,
            Lzhjje: null,
            Lzhjse: null,
            LzfppzDm: detail.LzfppzDm,
            LzfpTdyslxDm: detail.LzfpTdyslxDm || null,
            LzfplxDm2: null,
            ZzsytDm: null,
            XfsytDm: null,
            FprzztDm: null,
            Hzcxje: null,
            Hzcxse: null,
            Hzqrdmxsl: detail.Hzqrdmxsl,
            ChyyDm: null,
            HzqrxxztDm: detail.HzqrxxztDm,
            Qrrq: null,
            Ykjhzfpbz: detail.Ykjhzfpbz,
            Hzfphm: null,
            Hzkprq: null,
            Yxbz: null,
            Lrrsfid: null,
            Xgrsfid: null,
            Lrrq: detail.Lrrq,
            Xgrq: null,
            Sjcsdq: null,
            Sjgsdq: null,
            SjtbSj: null,
            YwqdDm: null,
            Dqnsrsbh: detail.Dqnsrsbh,
            Gxsf: detail.Gxsf,
            MxButtonCtrlDm: [
                'fh',
                'cx',
                'qkp'
            ],
            Qrfmc: detail.Qrfmc,
            Jshj: fileJSONData.totalAmount,
            Sfzzfpbz: detail.Sfzzfpbz,
            XsfssjswjgDm: null,
            XsfdsjswjgDm: null,
            XsfzgswjDm: null,
            GmfssjswjgDm: null,
            GmfdsjswjgDm: null,
            GmfzgswjDm: null,
            CezslxDm: null,
            HzqrxxmxList: null,
            FplyDm: null,
            Gjbq: null,
            Kpfnsrsbh: loginData.taxNo,
            Sfypsdnsrbz: null,
            Ybfhcbz: null,
            HzfplxDm2: null,
            Dsfnsrsbh: null,
            Dsfmc: null,
            FpkjfsDm: detail.FpkjfsDm
        };

        ctx.service.log.info('红字发票开票检查url', urlPath);
        ctx.service.log.info('红字发票开票检查参数', paramJson);
        // const pageId = loginData.pageId;
        // const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
        //     method: 'post',
        //     dataType: 'json',
        //     contentType: 'json',
        //     body: paramJson
        // });
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
        ctx.service.log.info('红字发票开票检查返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const { Code, Message } = resData;
        if (Code === '00') {
            return {
                ...errcodeInfo.success,
                data: detail
            };
        }
        return {
            ...errcodeInfo.govErr,
            description: Message
        };
    }

    // 红票开具
    async openInvoice(fileJSONData: any = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('plugin service --------------');
        const {
            govRedConfirmBillUuid,
            redConfirmBillNo,
            salerTaxNo,
            originalInvoiceNo,
            originalInvoiceCode,
            invoiceAmount,
            totalTaxAmount,
            totalAmount,
            invoiceType,
            serialNo
        } = fileJSONData;
        if (!govRedConfirmBillUuid) {
            ctx.service.log.info('openInvoice govRedConfirmBillUuid error', govRedConfirmBillUuid);
            return {
                errcode: '0001',
                description: '发票红冲时红字确认单税局uuid不能为空'
            };
        }
        if (!redConfirmBillNo) {
            ctx.service.log.info('openInvoice redConfirmBillNo error', redConfirmBillNo);
            return {
                errcode: '0001',
                description: '发票红冲时红字发票信息确认单编号不能为空'
            };
        }
        if (!salerTaxNo) {
            ctx.service.log.info('openInvoice salerTaxNo error', salerTaxNo);
            return {
                errcode: '0001',
                description: '发票红冲时销方税号不能为空'
            };
        }
        if (!originalInvoiceNo) {
            ctx.service.log.info('openInvoice originalInvoiceNo error', originalInvoiceNo);
            return {
                errcode: '0001',
                description: '发票红冲时原蓝票发票号码不能为空'
            };
        }
        if (!serialNo) {
            ctx.service.log.info('openInvoice serialNo error', serialNo);
            return {
                errcode: '0001',
                description: '发票红冲时流水号不能为空'
            };
        }

        ctx.service.log.info('查询是否已经开具过发票');
        const oldRes = await ctx.service.openHistory.query(serialNo);
        ctx.service.log.info('查询是否已经开具过发票接口返回', oldRes);
        if (oldRes.errcode !== '0000') {
            return oldRes;
        }
        const oldResData = oldRes.data || {};
        const cacheFiles = {
            ofdUrl: oldResData.ofdUrl || '',
            pdfUrl: oldResData.pdfUrl || '',
            xmlUrl: oldResData.xmlUrl || '',
            snapshotUrl: oldResData.snapshotUrl || ''
        };
        let openResult: any = {};

        // 获取RPA预生成发票链接
        const resRPAPreGeneration = ctx.service.openInvoice.getRPAPreGenerationUrl(serialNo);
        if (resRPAPreGeneration.errcode !== '0000') {
            return resRPAPreGeneration;
        }
        const RPAPreGenerationUrl = resRPAPreGeneration.data;

        // 已经开具成功过的发票，直接返回
        if (oldResData && oldResData.invoiceNo && oldResData.invoiceNo.length > 7) {
            openResult = {
                invoiceCode: oldResData.invoiceCode || '',
                invoiceNo: oldResData.invoiceNo || '',
                invoiceDate: oldResData.invoiceDate || '',
                govSerialNo: oldResData.govSerialNo || '',
                serialNo: oldResData.serialNo || '',
                drawer: '',
                ...RPAPreGenerationUrl,
                availableVolume: '',
                totalVolume: ''
            };
            // 上传开票历史时需置空固定地址
            await ctx.service.openHistory.add({
                ...openResult,
                status: 1,
                ofdUrl: '',
                pdfUrl: '',
                xmlUrl: ''
            });

            // 先上传开票历史 重新下载异步处理
            ctx.service.openInvoice.downloadInvoiceFiles({
                serialNo: fileJSONData.serialNo,
                govSerialNo: oldResData.govSerialNo || '',
                invoiceDate: oldResData.invoiceDate,
                invoiceNo: oldResData.invoiceNo,
                invoiceType: '', // 发票类型，26数电普票，27数电专票
                type: 1 // 红蓝票 0， 蓝票，1红票
            }, cacheFiles);
            // 异步 aws传入的数电开票需要保存完整的开票数据
            ctx.service.openHistory.uploadFullInfo(fileJSONData, openResult);
            return {
                ...errcodeInfo.success,
                data: openResult
            };
        }

        const loginRes = await ctx.service.ntTools.checkEtaxLogined();
        if (loginRes.errcode !== '0000') {
            return loginRes;
        }
        const loginData = loginRes.data || {};
        const checkRes = await this.checkOpenRedInvoice(loginData, fileJSONData);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        const { Hzfphm, Hzkprq, LzfpTdyslxDm, Kpr } = checkRes.data || {};

        // 已经开完发票
        if (Hzfphm && Hzkprq) {
            openResult = {
                invoiceCode: '',
                invoiceNo: Hzfphm,
                invoiceDate: Hzkprq,
                govSerialNo: fileJSONData.serialNo || '', // 红票没有税局流水号，使用发票云流水号
                serialNo: fileJSONData.serialNo || '',
                drawer: Kpr,
                ...RPAPreGenerationUrl,
                availableVolume: '',
                totalVolume: ''
            };

            // 上传开票历史时需置空固定地址
            await ctx.service.openHistory.add({
                ...openResult,
                status: 1,
                ofdUrl: '',
                pdfUrl: '',
                xmlUrl: ''
            });

            // 先上传开票历史 重新下载异步处理
            ctx.service.openInvoice.downloadInvoiceFiles({
                serialNo: fileJSONData.serialNo,
                govSerialNo: fileJSONData.serialNo || '', // 红票没有税局流水号，使用发票云流水号
                invoiceDate: Hzkprq,
                invoiceNo: Hzfphm,
                invoiceType: '', // 发票类型，26数电普票，27数电专票
                type: 1 // 红蓝票 0， 蓝票，1红票
            }, cacheFiles);
        } else {
            // 初始化开票
            let urlPath = '/kpfw/hzfpkj/v1/initHpkj';
            const paramJson : any = {
                Bz: 'kp',
                Uuid: govRedConfirmBillUuid,
                Lzfphm: originalInvoiceNo,
                Xsfnsrsbh: salerTaxNo,
                LzfpTdyslxDm: LzfpTdyslxDm,
                Lzfpdm: originalInvoiceCode || null,
                Sfzzfpbz: 'N'
            };

            ctx.service.log.info('红票开具检查url', urlPath);
            ctx.service.log.fullInfo('红票开具检查参数', paramJson);
            // const pageId = loginData.pageId;
            // const res = await ctx.service.nt.ntCurl(pageId, urlPath, {
            //     method: 'post',
            //     dataType: 'json',
            //     contentType: 'json',
            //     body: paramJson
            // });
            const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, paramJson);
            ctx.service.log.fullInfo('红票开具检查返回', res);
            if (res.errcode !== '0000') {
                return res;
            }
            const resData = res.data || {};
            const { Hjje, Hjse, Jshj } = resData;
            if (totalAmount !== Jshj) {
                return {
                    errcode: '0001',
                    description: `红字确认单（${totalAmount}）与原蓝票（${Jshj}）的价税合计不一致`
                };
            }
            if (invoiceAmount !== Hjje) {
                return {
                    errcode: '0001',
                    description: `红字确认单（${invoiceAmount}）与原蓝票（${Hjje}）的金额合计(不含税)不一致`
                };
            }
            if (totalTaxAmount !== Hjse) {
                return {
                    errcode: '0001',
                    description: `红字确认单（${totalTaxAmount}）与原蓝票（${Hjse}）的总税额不一致`
                };
            }
            urlPath = '/kpfw/hzfpkj/v1/saveHzfpkjxx';
            let Jshjchn;
            if (resData.Jshjchn) {
                if (resData.Jshjchn.indexOf('负数') === -1) {
                    Jshjchn = `(负数)${resData.Jshjchn}`;
                } else {
                    Jshjchn = resData.Jshjchn;
                }
            } else {
                Jshjchn = getUpperMoney(Jshj);
            }
            const paramJson2 : any = {
                ...resData,
                Jshjchn,
                Sfzzfp: 'N',
                Fpdm: '',
                Zzfphm: ''
            };
            ctx.service.log.info('红票开具url', urlPath);
            ctx.service.log.fullInfo('红票开具参数', paramJson2);

            // debug模式不真实开票
            if (fileJSONData.debugOpenInvoice === true) {
                openResult = {
                    invoiceCode: '',
                    invoiceNo: '6666666' + (+new Date()),
                    invoiceDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                    govSerialNo: fileJSONData.serialNo || '', // 红票没有税局流水号，使用发票云流水号
                    serialNo: fileJSONData.serialNo,
                    drawer: '',
                    ofdUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/ofdFile',
                    pdfUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/pdfFile',
                    xmlUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/xmlFile',
                    availableVolume: '',
                    totalVolume: ''
                };
            } else {
                // 开红票接口不需要加密
                const openRes = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
                    method: 'post',
                    dataType: 'json',
                    contentType: 'json',
                    body: paramJson2
                }, true); // true为不走加密
                ctx.service.log.info('红票开具返回', openRes);
                if (openRes.errcode !== '0000') {
                    return openRes;
                }
                const { Code, Message, Fphm, Kprq } = openRes.data || {};
                if (Code !== '00') {
                    return {
                        ...errcodeInfo.govErr,
                        description: Message
                    };
                }
                const availableVolumeRes = await ctx.service.openInvoiceQuery.updateAvailableVolume(loginData.pageId, invoiceAmount);
                ctx.service.log.info('授信额度更新返回', availableVolumeRes);

                // 查询开票数据
                const resQuery = await ctx.service.openInvoiceQuery.queryOpenInvoiceDetail(loginData, {
                    invoiceType: fileJSONData.invoiceType,
                    invoiceNo: Fphm,
                    invoiceDate: Kprq
                });

                // 电子税局账号开票人
                let drawer = '';
                // 查询异常不处理，顶多没开票人
                if (resQuery.errcode === '0000') {
                    drawer = resQuery?.data?.drawer;
                }

                openResult = {
                    invoiceCode: '',
                    invoiceNo: Fphm,
                    invoiceDate: Kprq,
                    govSerialNo: fileJSONData.serialNo || '', // 红票没有税局流水号，使用发票云流水号
                    serialNo: fileJSONData.serialNo || '',
                    drawer,
                    ...RPAPreGenerationUrl,
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

                // 先上传开票历史 开具成功异步处理
                ctx.service.openInvoice.downloadInvoiceFiles({
                    serialNo: fileJSONData.serialNo,
                    govSerialNo: fileJSONData.serialNo || '', // 红票没有税局流水号，使用发票云流水号
                    invoiceDate: Kprq,
                    invoiceNo: Fphm,
                    invoiceType: '', // 发票类型，26数电普票，27数电专票
                    type: 1 // 红蓝票 0， 蓝票，1红票
                });
            }
        }

        // 兼容代码 兼容字符串与数值
        if (+invoiceType === 1 || +invoiceType === 3) {
            // 数电普票
            fileJSONData.invoiceType = 26;
        } else if (+invoiceType === 2 || +invoiceType === 4) {
            // 数电专票
            fileJSONData.invoiceType = 27;
        }

        // 异步 aws传入的数电开票需要保存完整的开票数据
        ctx.service.openHistory.uploadFullInfo(fileJSONData, openResult);
        return {
            ...errcodeInfo.success,
            data: openResult
        };
    }
}
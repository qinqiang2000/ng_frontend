/* eslint-disable no-inline-comments, object-property-newline, complexity, max-len */
import {
    ValidateObject,
    BaseInfo,
    BaseExcelOption,
    DetailExcelOption,
    SpecialExcelOption,
    ExtraExcelOption,
    InvoiceNameKey,
    SHEET_SPECIAL_INFO,
    InvoiceSheetNameKey,
    SpecificInfoOptions,
    BaseInfoForSale,
    ArrayInfoValidateOpt,
    DifferenceTaxInfo,
    ReductionTaxInfo
} from '$client/validate/etaxOpen';
import { getUUId } from '$utils/getUid';
import { isNullOrUndefinedOrEmpty, accDiv, Add, accMul, Minus, toFixedSafe } from '$utils/index';
import { mkdirs } from '$utils/tools';

export class EtaxOpen extends BaseService {
    // 下载开票模板
    async downloadOpenTpl(cityCode: string, filePath: string) {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query;
        const reqid = ctx.uid;
        if (!cityCode) {
            return {
                ...errcodeInfo.argsErr,
                description: '查询开票模板参数错误，请检查!'
            };
        }
        const baseUrl = ctx.app.config.baseUrl;
        const url = `${baseUrl}/rpa/output/invoice/city/template/query/${cityCode}?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}`;
        const res = await httpRequest(url, {
            method: 'GET',
            headers: {
                'client-platform': 'digital_invoice'
            }
        });
        if (typeof res.errcode !== 'undefined') {
            ctx.service.log.info('开票模板查询异常', res);
            return res;
        }
        mkdirs(path.dirname(filePath));
        fs.writeFileSync(filePath, res.data);
        return errcodeInfo.success;
    }

    async createOpenExcel(data: any, requestData: any, isLocal: boolean) {
        const ctx = this.ctx;
        const requestBody = ctx.request.body;
        const etaxAccountInfo = requestBody.etaxAccountInfo || {};
        const USER_DATA_PATH = ctx.app.config.USER_DATA_PATH;
        const etaxName = etaxAccountInfo.etaxName;
        // 读取开票模板
        let tplFilePath;
        if (isLocal) {
            // 本地测试
            tplFilePath = path.join(USER_DATA_PATH, 'zhuoyu', 'NSR-开票业务-批量导入开票-导入开票模板.xlsx');
        } else {
            tplFilePath = path.join(USER_DATA_PATH, 'download/openInvoice/tpl', etaxName, 'openInvoiceTemplate.xlsx');
        }
        let isExist = true;
        // 不存在直接返回
        if (!fs.existsSync(tplFilePath)) {
            isExist = false;
        } else {
            const stat = fs.statSync(tplFilePath);
            const fileSize = stat.size;
            // 10kb
            if (fileSize < 10240) {
                fs.unlinkSync(tplFilePath);
                isExist = false;
            }
        }
        if (!isExist) {
            ctx.service.log.info('开票模板不存在，开始下载', etaxAccountInfo.cityCode, tplFilePath);
            const downLoadRes = await this.downloadOpenTpl(etaxAccountInfo.cityCode, tplFilePath);
            if (downLoadRes.errcode !== '0000') {
                return {
                    ...errcodeInfo.argsErr,
                    description: '开票模板未配置'
                };
            }
        }

        const wb = base_xlsx.readFile(tplFilePath, { type: 'file' });
        const SheetKeys = Object.keys(wb.Sheets);
        for (const item of data) {
            const { list, sheetName, cols } = item;
            const currentSheet = SheetKeys.find((key) => ~key.indexOf(sheetName));
            const ws = wb.Sheets[currentSheet];
            if (ws) {
                base_xlsx.utils.sheet_add_json(ws, list, {
                    skipHeader: true,
                    origin: 'A4'
                });
                if (cols) {
                    ws['!cols'] = cols;
                }
            } else {
                ctx.service.log.info('createOpenExcel error', SheetKeys, currentSheet);
            }
        }
        // 写入需要开票的数据
        const gxBf = base_xlsx.write(wb, { type: 'buffer' });

        let filePath;
        let resOpenData;
        if (isLocal) {
            // 本地测试
            filePath = path.join(USER_DATA_PATH, 'zhuoyu', `${moment().format('YYYY-MM-DD-HH-mm-ss')}.xlsx`);
            resOpenData = ctx.service.openSingleInvoice.changeOpeninvoiceData(requestData);
        } else {
            filePath = path.join(USER_DATA_PATH, 'uploadTemp', etaxAccountInfo.taxNo + '-kp-' + getUUId() + '.xlsx');
        }
        fs.writeFileSync(filePath, gxBf);

        // 返回文件路径
        return {
            ...errcodeInfo.success,
            data: filePath,
            resOpenData
        };
    }

    // 数电开票校验
    async etaxOpenVerification(requestData: any) {
        const ctx = this.ctx;

        const startTime = +new Date();
        ctx.service.log.fullInfo('etaxOpenVerification start', requestData);

        // 数据校验
        const data = JSON.parse(JSON.stringify(requestData));
        const res: any = this.validateData(data);

        ctx.service.log.info('etaxOpenVerification end', +new Date() - startTime);
        if (res.errcode !== '0000') {
            return res;
        }
        return errcodeInfo.success;
    }

    // 生成开票的excel模板
    async generateExcelTemplate(requestData: any, isLocal: boolean = false) {
        const ctx = this.ctx;

        const startTime = +new Date();
        ctx.service.log.fullInfo('generateExcelTemplate start', requestData);

        // 数据校验
        const data = JSON.parse(JSON.stringify(requestData));
        let res: any = this.validateData(data);
        if (res.errcode !== '0000') {
            return res;
        }

        // 数据转换
        res = this.validateData(res.data, true);
        if (res.errcode !== '0000') {
            return res;
        }

        const excelData = this.createExcelData(res.data);
        const resExcel = await this.createOpenExcel(excelData, requestData, isLocal);

        ctx.service.log.info('generateExcelTemplate end', +new Date() - startTime);
        return resExcel;
    }

    // 金额校验
    amountValidate(data: any) {
        const { taxFlag, invoiceAmount, totalTaxAmount, totalAmount, differenceTaxType, totalDeduction = 0, items } = data;

        // 是否含税 区分数据转换
        const isHasTax = this.ctx.onlyConvert ? taxFlag === '是' : +taxFlag === 1;

        // 差额征税
        const isDifferenceTax = differenceTaxType === '01' || differenceTaxType === '02';

        // FIXME EXCEL不需要 invoiceAmount
        if (typeof invoiceAmount !== 'number') {
            return {
                ...errcodeInfo.argsErr,
                description: '发票金额合计（不含税）的数据类型限制为Number'
            };
        }

        // FIXME EXCEL不需要 totalTaxAmount
        if (typeof totalTaxAmount !== 'number') {
            return {
                ...errcodeInfo.argsErr,
                description: '总税额的数据类型限制为Number'
            };
        }

        // FIXME EXCEL不需要 totalAmount
        if (typeof totalAmount !== 'number') {
            return {
                ...errcodeInfo.argsErr,
                description: '价税合计的数据类型限制为Number'
            };
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const { discountType, detailAmount, taxRate, taxAmount, deduction, discountAmount } = item;
            // 默认不含税
            let temp = detailAmount;
            // 含税 兼容字符串与数值
            if (isHasTax) {
                temp = accDiv(detailAmount, Add(1, taxRate));
            }
            let minuText = '';
            // 差额征税：减去扣除额
            if (isDifferenceTax) {
                temp = Minus(temp, deduction || 0);
                minuText = deduction || 0 ? '减去扣除额' : '';
            }
            // 正常行才减去折扣额 被折扣行无需处理
            if (discountType === '0') {
                // 减去折扣额
                temp = Minus(temp, discountAmount || 0);
                minuText += discountAmount || 0 ? '减去折扣额' : '';
            }
            // 计算税额
            temp = +toFixedSafe(accMul(temp, taxRate));
            // 单行税额校验：| 不含税金额 * 税率（不含税税率）（四舍五入） - 税额|<=0.06。
            // 折扣行税额校验：| 不含税金额 * 税率（不含税税率）（四舍五入） - 税额|<=0.01。
            const maximum = discountType === '1' ? 0.01 : 0.06;
            const difference = Math.abs(Minus(temp, taxAmount));
            if (difference > maximum) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `明细第${i + 1}行${discountType === '1' ? '折扣行' : ''}不含税金额${minuText} * 税率四舍五入后${temp}与税额${taxAmount}的误差大于${maximum}`
                };
            }
        }

        // tem0 汇总不含税金额
        // tem1 汇总计算税额 不含税金额 * 税率
        // tem2 汇总扣除额
        // tem3 汇总非计算税额
        let totals = [0, 0, 0, 0];
        let hasDeduction = false; // 明细是否有扣除额
        if (isHasTax) {
            // 含税
            // 汇总不含税金额，汇总计算税额
            totals = items.reduce((all: number[], item: any) => {
                const tem2 = item.deduction || 0;
                // 汇总不含税金额未减去扣除额，因此无需减去扣除额
                let tem0 = accDiv(item.detailAmount, Add(1, item.taxRate));
                // 正常行才减去折扣额 被折扣行无需处理
                if (item.discountType === '0') {
                    tem0 = Minus(tem0, item.discountAmount || 0);
                }
                // 汇总计算税额需不含税金额减去扣除额再进行计算
                const tem1 = accMul(Minus(tem0, tem2), item.taxRate);
                // 兼容字符串与数值
                if (!hasDeduction && +tem2 !== 0) {
                    hasDeduction = true;
                }
                return [Add(all[0], tem0), Add(all[1], tem1), Add(all[2], tem2), Add(all[3], item.taxAmount || 0)];
            }, [0, 0, 0, 0]);
        } else {
            // 不含税
            // 汇总不含税金额，汇总计算税额
            totals = items.reduce((all: number[], item: any) => {
                const tem2 = item.deduction || 0;
                // 汇总不含税金额未减去扣除额，因此无需减去扣除额
                let tem0 = item.detailAmount;
                // 正常行才减去折扣额 被折扣行无需处理
                if (item.discountType === '0') {
                    tem0 = Minus(tem0, item.discountAmount || 0);
                }
                // 汇总计算税额需不含税金额减去扣除额再进行计算
                const tem1 = accMul(Minus(tem0, tem2), item.taxRate);
                // 兼容字符串与数值
                if (!hasDeduction && +tem2 !== 0) {
                    hasDeduction = true;
                }
                return [Add(all[0], tem0), Add(all[1], tem1), Add(all[2], tem2), Add(all[3], item.taxAmount || 0)];
            }, [0, 0, 0, 0]);
        }
        // 汇总不含税金额校验：所有明细行不含税金额之和需等于金额合计（不含税）。
        if (Math.abs(totals[0] - (+invoiceAmount)) > 0.01) {
            return {
                ...errcodeInfo.argsErr,
                description: `所有明细行的不含税金额之和${totals[0]}不等于金额合计（不含税）${invoiceAmount}`
            };
        }
        // 汇总非计算税额：所有明细行税额之和需等于总税额。
        if (totals[3] !== +totalTaxAmount) {
            return {
                ...errcodeInfo.argsErr,
                description: `所有明细行的税额之和${totals[3]}不等于总税额${totalTaxAmount}`
            };
        }
        // 汇总计算税额校验：| 不含税金额 * 税率（不含税税率）（第1行）+......+不含税金额 * 税率（第N行）- 合计税额|<=1.27。
        if (Math.abs(Minus(totals[1], totalTaxAmount)) > 1.27) {
            return {
                ...errcodeInfo.argsErr,
                description: `所有明细行的不含税金额 * 税率之和${totals[1]}与合计税额${totalTaxAmount}的误差大于1.27`
            };
        }
        // 扣除额校验
        if (isDifferenceTax) {
            // 差额征税 汇总扣除额校验
            if (totals[2] !== totalDeduction) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `所有明细行的扣除额之和${totals[2]}不等于合计扣除额${totalDeduction}`
                };
            }
        } else if (hasDeduction) {
            // 非差额征税 明细扣除额校验
            return {
                ...errcodeInfo.argsErr,
                description: '非差额征税时明细行的扣除额禁止输入'
            };
        }
        // 金额合计（不含税）加总税额需等于价税合计
        const sum = Add(invoiceAmount, totalTaxAmount);
        // 兼容字符串与数值
        if (sum !== +totalAmount) {
            return {
                ...errcodeInfo.argsErr,
                description: `发票金额合计（不含税）加总税额之和${sum}不等于价税合计${totalAmount}`
            };
        }
        return {
            ...errcodeInfo.success,
            data
        };
    }

    // 合并折扣行 excel开票才需要
    // 行类型 discountType
    // 行金额 detailAmount
    // 折扣金额 discountAmount
    // 税额 taxAmount
    mergeDiscountLine(data: any) {
        const { items } = data;
        const newItems = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].discountType === '0') {
                // 正常行
                newItems.push(items[i]);
            } else if (items[i].discountType === '2') {
                // 折扣行
                if (items[i + 1]) {
                    if (items[i + 1].discountType === '1') {
                        // 折扣行校验：折扣行的商品名称应与原发票行一致
                        if (items[i].goodsName !== items[i + 1].goodsName) {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `明细第${i + 2}行折扣行的商品名称应与第${i + 1}行被折扣行一致`
                            };
                        }
                        // 调整为正常行
                        // 添加折扣金额并转换为正值
                        // 反算税额
                        newItems.push({
                            ...items[i],
                            discountType: '0',
                            discountAmount: -(items[i + 1].detailAmount || 0),
                            taxAmount: Add(items[i].taxAmount, items[i + 1].taxAmount)
                        });
                        // 跳过被折扣行
                        i++;
                    } else {
                        return {
                            ...errcodeInfo.argsErr,
                            description: `明细第${i + 1}行被折扣行缺少折扣行`
                        };
                    }
                } else {
                    return {
                        ...errcodeInfo.argsErr,
                        description: `明细第${i + 1}行被折扣行缺少折扣行`
                    };
                }
            } else if (items[i].discountType === '1') {
                // 折扣行
                return {
                    ...errcodeInfo.argsErr,
                    description: `明细第${i + 1}行折扣行缺少被折扣行`
                };
            } else {
                // 其它行
                return {
                    ...errcodeInfo.argsErr,
                    description: `明细第${i + 1}行行类型赋值错误应为0、1、2`
                };
            }
        }
        return {
            ...errcodeInfo.success,
            data: {
                ...data,
                items: newItems
            }
        };
    }

    // 更新数电开票校验
    async updateEtaxOpenValidate() {
        const ctx = this.ctx;
        ctx.service.log.info('updateEtaxOpenValidate start');
        const wb = base_xlsx.readFile(path.join('F:', 'NSR-开票业务-批量导入开票-导入开票模板004.xlsx'), { type: 'file' });
        const error: any[] = [];

        // max
        const regMax = /限(\d+)字符/;

        const result = wb.Workbook.Sheets.map((sheet: any) => {
            // Hidden 0显示 1隐蔽 2非常隐蔽
            const { name: sheetName, Hidden } = sheet;
            ctx.service.log.info('updateEtaxOpenValidate sheetName', sheetName);

            const nameKeySheet = InvoiceSheetNameKey.find((nameKey) => sheetName.includes(nameKey.name));
            // sheet唯一标识，默认sheetName
            let sheetKey = sheetName;
            if (nameKeySheet) {
                sheetKey = nameKeySheet.key;
            }

            // sheetAoaData
            // 0 第一行为说明
            // 1 第二行为输入校验
            // 2 第三行为字段名称
            const sheetAoaData : any[] = base_xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });

            // 填写说明
            let description = sheetName;
            let data;
            if (Hidden === 0) {
                description = [...new Set(sheetAoaData[0])].toString();

                data = sheetAoaData[2].map((name: string, index: number) => {

                    // key
                    const nameKeyInvoice = InvoiceNameKey.find((nameKey) => name.includes(nameKey.name));
                    let key = null;
                    if (nameKeyInvoice) {
                        key = nameKeyInvoice.key;
                    } else {
                        error.push(`${sheetName} 中的 ${name} 未匹配到key值`);
                    }

                    // max
                    let max : any = regMax.exec(sheetAoaData[1][index]);
                    if (max) {
                        max = Number(max[1]);
                    } else {
                        error.push(`${sheetName} 中的 ${name} 未匹配到max值`);
                    }

                    // required
                    const required = !!(~sheetAoaData[1][index].indexOf('有条件必填') || !~sheetAoaData[1][index].indexOf('非必填'));

                    // type
                    let type = null;
                    if (sheetKey === SHEET_SPECIAL_INFO) {
                        // 跳过发票流水号
                        if (index !== 0) {
                            const nameKeySpecial = SpecificInfoOptions.find((nameKey) => sheetAoaData[0][index].includes(nameKey.name));
                            if (nameKeySpecial) {
                                type = nameKeySpecial.key;
                            } else {
                                error.push(`${sheetName} 中的 ${name} 未匹配到type值`);
                            }
                        }
                    }
                    return {
                        name,
                        key,
                        max,
                        required,
                        type
                    };
                });
            } else {
                data = sheetAoaData.flat();
                if (sheetName === 'excelVersion') {
                    data = data.filter((o: any) => !!o).toString();
                }
            }
            return {
                name: sheetName,
                key: sheetKey,
                Hidden,
                description,
                data
            };
        });
        ctx.service.log.info('updateEtaxOpenValidate end');
        return {
            ...errcodeInfo.success,
            data: result,
            error
        };
    }

    /**
     * 数据校验
     * @param {object} data 待校验的开票数据
     * @param {boolean} onlyConvert 是否数据转换 默认false
     * @returns {object} 校验结果
     */
    validateData(data: any, onlyConvert: boolean = false) {
        const ctx = this.ctx;
        if (!data) {
            return errcodeInfo.argsErr;
        }
        // 数据转换
        ctx.onlyConvert = onlyConvert;

        let res: any;
        ctx.service.log.info('validateData start');
        // FIXME EXCEL不需要 发票销售方信息校验
        res = this.baseValidate(data, BaseInfoForSale);
        if (res.errcode !== '0000') {
            ctx.service.log.info('baseInfoForSale error', res);
            return res;
        }

        // 发票基本信息校验
        res = this.baseValidate(res.data, BaseInfo);
        if (res.errcode !== '0000') {
            ctx.service.log.info('baseInfo error', res);
            return res;
        }

        // 发票明细校验
        res = this.detailInfoValidate(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('detailInfoValidate error', res);
            return res;
        }

        // 特定业务信息校验
        res = this.specificBusinessValidate(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('specificBusinessValidate error', res);
            return res;
        }

        // 发票附加信息校验
        res = this.extraInfoValidate(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('extraInfoValidate error', res);
            return res;
        }

        // FIXME EXCEL不需要 EXCEL不支持差额征税
        // 差额征税校验
        res = this.differenceTaxValidate(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('differenceTaxValidate error', res);
            return res;
        }

        // FIXME EXCEL不需要 EXCEL不支持减按征税
        // 减按征税校验
        res = this.reductionTaxValidate(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('reductionTaxValidate error', res);
            return res;
        }

        // 金额校验
        res = this.amountValidate(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('amountValidate error', res);
            return res;
        }

        // 合并折扣行
        res = this.mergeDiscountLine(res.data);
        if (res.errcode !== '0000') {
            ctx.service.log.info('mergeDiscountLine error', res);
            return res;
        }
        ctx.service.log.info('validateData end');

        return {
            ...errcodeInfo.success,
            data: res.data
        };
    }

    // 公共校验
    baseValidate(data: any, validateInfo: ValidateObject[]) {
        for (const item of validateInfo) {
            const { name, key, max, required, validate, convert } = item;

            const value = data[key];

            const notValid = isNullOrUndefinedOrEmpty(value);

            if (this.ctx.onlyConvert) {
                // 数据转换
                if (!notValid && convert) {
                    data[key] = convert(value);
                }
                continue;
            }

            // 必填参数
            if (notValid) {
                if (typeof required === 'boolean') {
                    if (required) {
                        return {
                            ...errcodeInfo.argsErr,
                            description: `${name}不能为空`
                        };
                    }
                } else {
                    const resRequired = required(data);
                    if (resRequired.required) {
                        return {
                            ...errcodeInfo.argsErr,
                            description: `${name}${resRequired.description}不能为空`
                        };
                    }
                }
            }

            // 有值
            if (!notValid) {
                // 字符长度
                if (max < value.length) {
                    return {
                        ...errcodeInfo.argsErr,
                        description: `${name}限制为${max}字符`
                    };
                }

                // 格式校验
                if (validate) {
                    const res = validate(value, data);
                    if (!res.result) {
                        return {
                            ...errcodeInfo.argsErr,
                            description: `${name}${res.description}`
                        };
                    }
                }
            }
        }

        return {
            ...errcodeInfo.success,
            data
        };
    }

    // 特定业务校验
    specificBusinessValidate(data: any) {
        if (!data.businessType) {
            return {
                ...errcodeInfo.success,
                data
            };
        }

        // 数据转换时需使用name 区分数据转换
        const option = SpecificInfoOptions.find((o) => this.ctx.onlyConvert ? o.name === data.businessType : o.code === data.businessType);
        const { isSupported, name, key, validates } = option || {};
        if (!option) {
            return {
                ...errcodeInfo.argsErr,
                description: '特定业务类型参数错误'
            };
        }

        // 是否支持
        if (!isSupported) {
            return {
                ...errcodeInfo.argsErr,
                description: `暂不支持开具特定业务类型${name}`
            };
        }

        // 是否需要校验
        if (validates) {
            if (!data[key]) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `特定业务${name}特定信息不能为空`
                };
            }

            // 数组校验
            if (ArrayInfoValidateOpt[key]) {
                return this.arrayInfoValidate(data, key);
            }
            // 非数组校验
            const res: any = this.baseValidate(data[key], validates);
            if (res.errcode !== '0000') {
                return res;
            }
            data[key] = res.data;
        }

        return {
            ...errcodeInfo.success,
            data
        };
    }

    // 发票明细信息校验
    detailInfoValidate(data: any) {
        // 明细信息
        if (!data.items) {
            return {
                ...errcodeInfo.argsErr,
                description: '明细不能为空'
            };
        }

        return this.arrayInfoValidate(data, 'items');
    }

    // 发票附加信息校验
    extraInfoValidate(data: any) {
        // 附加信息 可为空
        if (!data.extraList) {
            return {
                ...errcodeInfo.success,
                data
            };
        }

        return this.arrayInfoValidate(data, 'extraList');
    }

    // 差额征税校验
    differenceTaxValidate(data: any) {
        const { differenceTaxType, totalDeduction, deductionList, reductionTaxType, businessType, items = [] } = data;

        // 无差额征税类型
        if (!differenceTaxType) {
            return {
                ...errcodeInfo.success,
                data
            };
        }

        // 差额征税时，不支持减按征税
        if (reductionTaxType) {
            return {
                ...errcodeInfo.argsErr,
                description: '差额征税时，不支持减按征税'
            };
        }

        // 特殊业务限制
        if (businessType) {
            // 数据转换时需使用name 区分数据转换
            const option = SpecificInfoOptions.find((o) => this.ctx.onlyConvert ? o.name === data.businessType : o.code === data.businessType);
            if (option.prohibitedDifferenceTax) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `特定业务${option.name}不支持差额征税`
                };
            }
        }

        // 明细限制
        if (items[0]?.discountType !== '0') {
            return {
                ...errcodeInfo.argsErr,
                description: '差额征税时，明细不支持添加折扣'
            };
        }
        if (items?.length > 1) {
            return {
                ...errcodeInfo.argsErr,
                description: '差额征税时，明细行数限制为1'
            };
        }

        // 差额征税
        let res: any;
        res = this.baseValidate(data, DifferenceTaxInfo);
        if (res.errcode !== '0000') {
            return res;
        }

        if (differenceTaxType === '02') {
            // 差额开票
            // 差额扣除额清单校验
            res = this.arrayInfoValidate(res.data, 'deductionList');
            if (res.errcode !== '0000') {
                return res;
            }

            // 差额扣除额清单的扣除额汇总
            const total = deductionList.reduce((all: number, item: any) => {
                return Add(all, item.deduction);
            }, 0);
            if (total !== totalDeduction) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `所有差额扣除额清单的扣除额之和${total}不等于合计扣除额${totalDeduction}`
                };
            }
        }

        return res;
    }

    // 减按征税校验
    reductionTaxValidate(data: any) {
        const { differenceTaxType, reductionTaxType, businessType, items } = data;

        // 无减按征税类型
        if (!reductionTaxType) {
            return {
                ...errcodeInfo.success,
                data
            };
        }

        // 减按征税时，不支持差额征税
        if (differenceTaxType) {
            return {
                ...errcodeInfo.argsErr,
                description: '减按征税时，不支持差额征税'
            };
        }

        // 特殊业务限制
        if (businessType) {
            // 数据转换时需使用name 区分数据转换
            const option = SpecificInfoOptions.find((o) => this.ctx.onlyConvert ? o.name === data.businessType : o.code === data.businessType);
            if (option.prohibitedReductionTax) {
                return {
                    ...errcodeInfo.argsErr,
                    description: `特定业务${option.name}不支持减按征税`
                };
            }
        }

        // 明细限制
        for (const item of items) {
            if (item.discountType !== '0') {
                return {
                    ...errcodeInfo.argsErr,
                    description: '减按征税时，明细不支持添加折扣'
                };
            }
        }

        // 减按征税
        const res = this.baseValidate(data, ReductionTaxInfo);
        return res;
    }

    // 数组信息校验
    arrayInfoValidate(data: any, validateKey: string) {
        const { validateName, validateInfo, required: requiredArray } = ArrayInfoValidateOpt[validateKey] || {};
        if (!validateName || !validateInfo) {
            return {
                ...errcodeInfo.argsErr,
                description: `${validateName}校验配置异常`
            };
        }

        const validateObj = data[validateKey];

        // 数组
        if (Object.prototype.toString.call(validateObj) !== '[object Array]') {
            return {
                ...errcodeInfo.argsErr,
                description: `${validateName}数据类型限制为Array`
            };
        }
        // 是否需要 数组长度
        if (requiredArray && !validateObj.length) {
            return {
                ...errcodeInfo.argsErr,
                description: `${validateName}行数不能为0`
            };
        }

        // 特定业务明细追加校验配置
        let specificInfoOption;
        // 明细追加校验
        if (validateKey === 'items') {
            // 数据转换时需使用name 区分数据转换
            specificInfoOption = SpecificInfoOptions.find((o) => this.ctx.onlyConvert ? o.name === data.businessType : o.code === data.businessType);
            // 特定业务明细追加校验
            if (specificInfoOption?.appendDetailValidate) {
                const { lineLimit, required: requiredValidate } = specificInfoOption.appendDetailValidate;
                const isValidate = typeof requiredValidate === 'function' ? requiredValidate(data) : {
                    required: true,
                    description: ''
                };
                if (lineLimit && isValidate.required) {
                    // 两行项目明细，非被折扣行与折扣行
                    const doubleAndNotDiscount = validateObj.length === 2 && !(validateObj[0].discountType === '2' && validateObj[1].discountType === '1');
                    // 非两行项目明细 行数大于限制
                    const notDoubleAndOverLimit = validateObj.length !== 2 && validateObj.length > lineLimit;
                    if (notDoubleAndOverLimit || doubleAndNotDiscount) {
                        return {
                            ...errcodeInfo.argsErr,
                            description: `特定业务${specificInfoOption.name}${isValidate.description}，${validateName}限制为${lineLimit}行项目明细`
                        };
                    }
                }
            }
        }
        for (let index = 0; index < validateObj.length; index++) {
            const detailData = validateObj[index];
            for (const item of validateInfo) {
                const { name, key, max, required, validate, convert } = item;

                // 添加流水号 已在baseValidate校验
                if (key === 'serialNo') {
                    detailData[key] = data[key];
                    continue;
                }

                const notValid = isNullOrUndefinedOrEmpty(detailData[key]);

                if (this.ctx.onlyConvert) {
                    // 数据转换
                    if (!notValid && convert) {
                        detailData[key] = convert(detailData[key]);
                    }
                    continue;
                }

                // 特定业务明细追加校验 跳过折扣行
                let prohibited;
                if (validateKey === 'items' && detailData?.discountType !== '1' && specificInfoOption?.appendDetailValidate) {
                    const { lineInfo, required: requiredValidate } = specificInfoOption.appendDetailValidate;
                    const isValidate = typeof requiredValidate === 'function' ? requiredValidate(data) : {
                        required: true,
                        description: ''
                    };
                    // 有追加校验
                    if (lineInfo[key] && isValidate.required) {
                        const appendRequired = lineInfo[key].required;
                        prohibited = lineInfo[key].prohibited;
                        // 必填
                        if (appendRequired && notValid) {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `特定业务${specificInfoOption.name}${isValidate.description}，${validateName}第${index + 1}行${name}不能为空`
                            };
                        }

                        // 禁止输入
                        if (prohibited && !notValid) {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `特定业务${specificInfoOption.name}${isValidate.description}，${validateName}第${index + 1}行${name}禁止输入`
                            };
                        }

                        // 输入校验
                        if (lineInfo[key].validate) {
                            const res = lineInfo[key].validate(detailData[key], detailData);
                            if (!res.result) {
                                return {
                                    ...errcodeInfo.argsErr,
                                    description: `特定业务${specificInfoOption.name}${isValidate.description}，${validateName}第${index + 1}行${name}${res.description}`
                                };
                            }
                        }
                    }
                }

                // 必填参数
                // 特定业务明细追加校验禁止输入时，跳过必填校验
                if (notValid && !prohibited) {
                    if (typeof required === 'boolean') {
                        if (required) {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `${validateName}第${index + 1}行${name}不能为空`
                            };
                        }
                    } else {
                        const resRequired = required(detailData);
                        if (resRequired.required) {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `${validateName}第${index + 1}行${name}${resRequired.description}不能为空`
                            };
                        }
                    }
                }

                // 有值
                if (!notValid) {
                    // 字符长度
                    if (max < detailData[key].length) {
                        if (key === 'goodsName') {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `${validateName}第${index + 1}行${name}与“*简称*”限制为${max}字符`
                            };
                        }
                        return {
                            ...errcodeInfo.argsErr,
                            description: `${validateName}第${index + 1}行${name}限制为${max}字符`
                        };
                    }

                    // 格式校验
                    if (validate) {
                        const res = validate(detailData[key], detailData);
                        if (!res.result) {
                            return {
                                ...errcodeInfo.argsErr,
                                description: `${validateName}第${index + 1}行${name}${res.description}`
                            };
                        }
                    }
                }
            }
        }

        return {
            ...errcodeInfo.success,
            data
        };
    }

    // 生成excel数据
    createExcelData(data: any) {
        const sheet1Data: any = {};
        for (const key of BaseExcelOption.keys) {
            sheet1Data[key] = data[key];
        }
        const sheet1 = {
            sheetName: '1-',
            list: [sheet1Data],
            header: BaseExcelOption.header,
            headerDisplay: BaseExcelOption.display,
            cols: BaseExcelOption.cols
        };

        const sheet2Data = data.items.map((o: any) => {
            const item: any = {};
            for (const key of DetailExcelOption.keys) {
                item[key] = o[key];
            }
            return item;
        });
        const sheet2 = {
            sheetName: '2-',
            list: sheet2Data,
            header: DetailExcelOption.header,
            headerDisplay: DetailExcelOption.display,
            cols: DetailExcelOption.cols
        };

        let sheet3Data = [{}];
        // 特定业务类型 数据转换时需使用name
        const option = SpecificInfoOptions.find((o) => this.ctx.onlyConvert ? o.name === data.businessType : o.code === data.businessType);
        const { key: SpecificInfoKey, validates } = option || {};
        if (validates) {
            // 初始化特定业务数据 并添加流水号
            const baseItem = Object.fromEntries(SpecialExcelOption.keys.map((key) => [key, key === 'serialNo' ? data.serialNo : '']));
            if (ArrayInfoValidateOpt[SpecificInfoKey]) {
                // 数组
                sheet3Data = (data[SpecificInfoKey] || []).map((o: any) => {
                    const item: any = {
                        ...baseItem
                    };
                    // 赋值
                    for (const validate of validates) {
                        item[validate.excelKey] = o[validate.key];
                    }
                    return item;
                });
            } else {
                // 对象
                const item: any = {
                    ...baseItem
                };
                // 赋值
                for (const validate of validates) {
                    item[validate.excelKey] = data[SpecificInfoKey][validate.key];
                }
                sheet3Data = [item];
            }
        }
        const sheet3 = {
            sheetName: '3-',
            list: sheet3Data,
            header: SpecialExcelOption.header,
            headerDisplay: SpecialExcelOption.display,
            cols: SpecialExcelOption.cols
        };

        const sheet4Data = (data.extraList || []).map((o: any) => {
            const item: any = {};
            for (const key of ExtraExcelOption.keys) {
                item[key] = o[key];
            }
            return item;
        });
        const sheet4 = {
            sheetName: '4-',
            list: sheet4Data,
            header: ExtraExcelOption.header,
            headerDisplay: ExtraExcelOption.display,
            cols: ExtraExcelOption.cols
        };

        return [
            sheet1,
            sheet2,
            sheet3,
            sheet4
        ];
    }
}
/* eslint-disable no-inline-comments, object-property-newline */

import { accMul, Minus, isNullOrUndefinedOrEmpty } from '$utils/index';
import { etaxZzstsgl, etaxSfzjlx, etaxGjhdq, etaxJtgjlx, etaxJzjtlx, etaxOpenReason } from '$client/constant';

const EVIDENCETYPE_KEY_NAME = {
    '01': '数电票',
    '02': '增值税专用发票',
    '03': '增值税普通发票',
    '04': '营业税发票',
    '05': '财政票据',
    '06': '法院裁决书',
    '07': '契税完税凭证',
    '08': '其他发票类',
    '09': '其他扣除凭证'
};

const INVOICETYPES = [
    { key: 26, value: '普通发票' }, // 数电普票
    { key: 27, value: '增值税专用发票' }, // 数电专票
    { key: 3, value: '数电纸质普通发票' }, // 数电纸质普通发票
    { key: 4, value: '数电纸质专用发票' } // 数电纸质专用发票
];
export const SHEET_SPECIAL_INFO = 'specialInfo';

// excel sheet name-key
export const InvoiceSheetNameKey = [
    { name: '发票基本信息', key: 'baseInfo' },
    { name: '发票明细信息', key: 'detailInfo' },
    { name: '特定业务信息', key: SHEET_SPECIAL_INFO },
    { name: '附加要素信息', key: 'extraInfo' }
];

// 发票信息 name-key
export const InvoiceNameKey = [
    { name: '发票流水号', key: 'serialNo' },
    { name: '发票类型', key: 'invoiceType' },
    { name: '特定业务类型', key: 'businessType' },
    { name: '是否含税', key: 'taxFlag' },
    { name: '受票方自然人标识', key: 'naturalPersonFlag' },
    { name: '购买方名称', key: 'buyerName' },
    { name: '证件类型', key: 'cardType' },
    { name: '购买方纳税人识别号', key: 'buyerTaxNo' },
    { name: '购买方地址', key: 'buyerAddress' },
    { name: '购买方电话', key: 'buyerFixedTelephone' },
    { name: '购买方开户银行', key: 'buyerCardName' },
    { name: '购买方银行账号', key: 'buyerCardNumber' },
    { name: '备注', key: 'remark' },
    { name: '是否展示购买方银行账号', key: 'showBuyerCard' },
    { name: '销售方开户行', key: 'salerCardName' },
    { name: '销售方银行账号', key: 'salerCardNumber' },
    { name: '是否展示销售方银行账号', key: 'showSalerCard' },
    { name: '购买方邮箱', key: 'buyerEmail' },
    { name: '购买方经办人姓名', key: 'agentUser' },
    { name: '购买方经办人证件类型', key: 'agentCardType' },
    { name: '购买方经办人证件号码', key: 'agentCardNo' },
    { name: '经办人国籍(地区)', key: 'agentCountry' },
    { name: '经办人自然人纳税人识别号', key: 'agentTaxNo' },
    { name: '放弃享受减按1%征收率原因', key: 'openReason' },
    { name: '收款人', key: 'payee' },
    { name: '复核人', key: 'reviewer' },
    { name: '项目名称', key: 'goodsName' },
    { name: '商品和服务税收编码', key: 'goodsCode' },
    { name: '规格型号', key: 'specModel' },
    { name: '单位', key: 'unit' },
    { name: '数量', key: 'num' },
    { name: '单价', key: 'unitPrice' },
    { name: '金额', key: 'detailAmount' },
    { name: '税率', key: 'taxRate' },
    { name: '折扣金额', key: 'discountAmount' },
    { name: '是否使用优惠政策', key: 'preferentialPolicy' },
    { name: '优惠政策类型', key: 'vatException' },
    { name: '即征即退类型', key: 'taxFreeType' },
    { name: '建筑服务发生地', key: 'simpleAddress' },
    { name: '发生地详细地址', key: 'detailAddress' },
    { name: '建筑项目名称', key: 'buildingName' },
    { name: '土地增值税项目编号', key: 'landTaxNo' },
    { name: '跨地市标志', key: 'crossCitySign' },
    { name: '起运地', key: 'startPlace' },
    { name: '到达地', key: 'endPlace' },
    { name: '运输工具种类', key: 'transportType' },
    { name: '运输工具牌号', key: 'licensePlate' },
    { name: '运输货物名称', key: 'transportGoods' },
    { name: '房屋产权证书', key: 'estateId' },
    { name: '不动产权证号码', key: 'estateId' },
    { name: '不动产地址', key: 'simpleAddress' },
    { name: '不动产详细地址', key: 'detailAddress' },
    { name: '不动产单元代码', key: 'estateCode' },
    { name: '网签合同备案编码', key: 'estateCode' },
    { name: '核定计税价格', key: 'approvedPrice' },
    { name: '实际成交含税金额', key: 'actualTurnover' },
    { name: '面积单位', key: 'areaUnit' },
    { name: '租赁期起', key: 'startLeaseDate' },
    { name: '租赁期止', key: 'endLeaseDate' },
    { name: '保险单号', key: 'insuranceId' },
    { name: '车牌号', key: 'licensePlate' },
    { name: '船舶登记号', key: 'licensePlate' },
    { name: '税款所属期起', key: 'startTaxPeriod' },
    { name: '税款所属期止', key: 'endTaxPeriod' },
    { name: '代收车船税金额', key: 'collectedTaxAmount' },
    { name: '滞纳金金额', key: 'latePaymentAmount' },
    { name: '金额合计', key: 'insuranceAmount' },
    { name: '车辆识别代码', key: 'vin' },
    { name: '车架号码', key: 'vin' },
    { name: '出行人', key: 'traveler' },
    { name: '出行人证件类型', key: 'cardType' },
    { name: '出行人证件号码', key: 'cardNo' },
    { name: '出行日期', key: 'travelDate' },
    { name: '出发地', key: 'startPlace' },
    { name: '交通工具类型', key: 'transportType' },
    { name: '等级', key: 'seatClass' },
    { name: '业务流水号', key: 'businessSerialNo' },
    { name: '门诊号', key: 'clinicNo' },
    { name: '就诊日期', key: 'treatmentDate' },
    { name: '医疗机构类型', key: 'institutionType' },
    { name: '医保类型', key: 'insuranceType' },
    { name: '医保编号', key: 'insuranceNo' },
    { name: '性别', key: 'sex' },
    { name: '医保统筹基金支付', key: 'fundPayment' },
    { name: '其他支付', key: 'otherPayment' },
    { name: '个人账户支付', key: 'accountPayment' },
    { name: '个人现金支付', key: 'cashPayment' },
    { name: '个人支付', key: 'personalPayment' },
    { name: '个人自费', key: 'personalExpense' },
    { name: '病例号', key: 'caseNo' },
    { name: '住院号', key: 'hospitalNo' },
    { name: '住院科别', key: 'hospitalDepartment' },
    { name: '住院时间', key: 'hospitalStay' },
    { name: '预缴金额', key: 'advanceAmount' },
    { name: '补缴金额', key: 'supplementaryAmount' },
    { name: '退费金额', key: 'refundAmount' },
    { name: '是否用于办理拖拉机和联合收割机登记', key: 'forRegister' },
    { name: '发动机号码', key: 'engineNo' },
    { name: '底盘号/机架号', key: 'chassisNo' },
    { name: '附加要素名称', key: 'extraName' },
    { name: '附加要素内容', key: 'extraValue' }
];

/**
 * @param {object} 必填结果
 * @property {boolean} required 必填true 非必填false
 * @property {string} description 无效描述
 */
interface RequiredReturn {
    required: boolean;
    description: string;
}
/**
 * 检测当前值是否必填
 * @param {any} data 根据值所在对象确定；为明细时-当前明细对象，为发票时-当前发票对象
 * @returns {RequiredReturn} 必填检验
 */
type RequiredFun = (data: any) => RequiredReturn;

/**
 * @param {object} 校验结果
 * @property {boolean} result 有效true 无效false
 * @property {string} description 无效描述
 */
interface ValidateReturn {
    result: boolean;
    description: string;
}
/**
 * 检测当前值是否有效
 * @param {number | string} v 当前值
 * @param {any} data 根据值所在对象确定；为明细值-当前明细对象，为发票值-当前发票对象
 * @returns {object} ValidateReturn 校验结果
 */
type ValidateFun = (v: number | string, data: any) => ValidateReturn;

export interface ValidateObject {
    name: string; // 名称
    key: string; // key
    excelKey?: string; // excelKey
    wch: number; // excel的字符宽度
    max: number; // 字符长度
    required: boolean | RequiredFun; // 是否必填
    validate: ValidateFun; // 输入校验
    convert?: (v: number | string) => number | string; // 输入转换
}

interface ExcelOption {
    keys: string[];
    header: string[];
    display: { [key: string]: string }[]
    cols: { wch: number }[]
}

/* required function start */
// 证件类型
function ifCardType(data: any): RequiredReturn {
    return {
        required: data.businessType === '16',
        description: '在特定业务类型为16农产品收购时'
    };
}

// 购买方名称
function ifBuyerTaxNo(data: any): RequiredReturn {
    // 兼容字符串与数值
    if (+data.invoiceType === 27) {
        return {
            required: true,
            description: '在发票类型为27数电票（增值税专用发票）时'
        };
    }
    // 兼容字符串与数值
    if (+data.invoiceType === 4) {
        return {
            required: true,
            description: '在发票类型为4数电纸质专用发票时'
        };
    }
    if (data.businessType === '16') {
        return {
            required: true,
            description: '在特定业务类型为16农产品收购时'
        };
    }
    return {
        required: false,
        description: '非必填'
    };
}

// 明细数量：是否有明细单价
function ifDetailNum(data: any): RequiredReturn {
    return {
        required: !isNullOrUndefinedOrEmpty(data.unitPrice),
        description: '在有单价时'
    };
}

// 明细单价：是否有明细数量 convertOneOrZero
function ifDetailUnitPrice(data: any): RequiredReturn {
    return {
        required: !isNullOrUndefinedOrEmpty(data.num),
        description: '在有数量时'
    };
}

// 明细优惠政策类型：是否使用优惠政策
function ifVatException(data: any): RequiredReturn {
    return {
        // 兼容字符串与数值
        required: +data.preferentialPolicy === 1,
        description: '在使用优惠政策为1时'
    };
}

// 不动产销售实际成交含税金额：是否有核定计税价格
function ifEstateSaleApprovedPrice(data: any): RequiredReturn {
    return {
        required: !isNullOrUndefinedOrEmpty(data.approvedPrice),
        description: '在有核定计税价格时'
    };
}

// 差额征税数电票号码
function ifDeductionListEtaxInvoiceNo(data: any): RequiredReturn {
    return {
        required: data.evidenceType === '01' && isNullOrUndefinedOrEmpty(data.invoiceCode) && isNullOrUndefinedOrEmpty(data.invoiceCode),
        description: '在凭证类型为01数电票时'
    };
}

// 差额征税发票代码
function ifDeductionListInvoiceCode(data: any): RequiredReturn {
    if (data.evidenceType === '01') {
        return {
            required: isNullOrUndefinedOrEmpty(data.etaxInvoiceNo),
            description: '在凭证类型为01数电纸质发票时'
        };
    }
    if (data.evidenceType === '02' || data.evidenceType === '03' || data.evidenceType === '04') {
        return {
            required: true,
            description: `在凭证类型为${data.evidenceType}${EVIDENCETYPE_KEY_NAME[data.evidenceType as keyof typeof EVIDENCETYPE_KEY_NAME]}时`
        };
    }
    return {
        required: false,
        description: '非必填'
    };
}

// 差额征税发票号码
function ifDeductionListInvoiceNo(data: any): RequiredReturn {
    if (data.evidenceType === '01') {
        return {
            required: isNullOrUndefinedOrEmpty(data.etaxInvoiceNo),
            description: '在凭证类型为01数电纸质发票时'
        };
    }
    if (data.evidenceType === '02' || data.evidenceType === '03' || data.evidenceType === '04') {
        return {
            required: true,
            description: `在凭证类型为${data.evidenceType}${EVIDENCETYPE_KEY_NAME[data.evidenceType as keyof typeof EVIDENCETYPE_KEY_NAME]}时`
        };
    }
    return {
        required: false,
        description: '非必填'
    };
}

// 差额征税开票日期
function ifDeductionListInvoiceDate(data: any): RequiredReturn {
    return {
        required: data.evidenceType === '01' || data.evidenceType === '02' || data.evidenceType === '03' || data.evidenceType === '04',
        description: `在凭证类型为${data.evidenceType}${EVIDENCETYPE_KEY_NAME[data.evidenceType as keyof typeof EVIDENCETYPE_KEY_NAME]}时`
    };
}

// 差额征税备注
function ifDeductionListRemark(data: any): RequiredReturn {
    return {
        required: data.evidenceType === '08' || data.evidenceType === '09',
        description: `在凭证类型为${data.evidenceType}${EVIDENCETYPE_KEY_NAME[data.evidenceType as keyof typeof EVIDENCETYPE_KEY_NAME]}时`
    };
}

// 交通工具等级
function ifTransportSeatClass(data: any): RequiredReturn {
    // 1飞机、2火车、7船舶
    return {
        required: data.transportType === '1' || data.transportType === '2' || data.transportType === '7',
        description: `在运输工具种类为${data.transportType}${etaxJtgjlx[data.transportType as keyof typeof etaxJtgjlx]}时`
    };
}

// 发动机号码
function ifTractorEngineNo(data: any): RequiredReturn {
    return {
        required: data.forRegister === 'Y' && !data.chassisNo,
        description: '在办理登记为Y时与底盘号/机架号至少填写一项'
    };
}

// 底盘号/机架号
function ifTractorChassisNo(data: any): RequiredReturn {
    return {
        required: data.forRegister === 'Y' && !data.engineNo,
        description: '在办理登记为Y时与发动机号码至少填写一项'
    };
}

// 办理登记
function ifTractorForRegister(data: any): RequiredReturn {
    return {
        required: data?.tractorInfo?.forRegister === 'Y',
        description: '在办理登记为Y时'
    };
}

// 购买方经办人证件号码
function ifAgentCardNo(data: any): RequiredReturn {
    return {
        required: data.agentCardType,
        description: '在购买方经办人证件类型有值时'
    };
}

/* required function end */

/* validate function start */
// 发票类型
function isInvoiceType(invoiceType: number | string): ValidateReturn {
    // 兼容字符串与数值
    return {
        result: !!INVOICETYPES.find((item) => item.key === +invoiceType),
        description: `限制为${INVOICETYPES.map((item) => `${item.value}‘${item.key}’`)}`
    };
}

// 特定业务类型
function isBusinessType(value: string): ValidateReturn {
    return {
        result: !!SpecificInfoOptions.find((item) => item.code === value),
        description: '参数错误'
    };
}

// 受票方自然人标识
function isNaturalPersonFlag(value: string, data: any): ValidateReturn {
    const res = isYOrN(value);
    if (!res.result) {
        return res;
    }
    const invoiceTypeInfo = INVOICETYPES.find((item) => item.key === +data.invoiceType);
    return {
        result: !(value === 'Y' && (invoiceTypeInfo?.key === 27 || invoiceTypeInfo?.key === 4)),
        description: `为Y时，不得开具${invoiceTypeInfo?.value}，请选择普通发票`
    };
}

// 商品名称
function isGoodsName(value: string): ValidateReturn {
    // 匹配简称 与 项目名称
    // 简称匹配规则与openSingleInvoice.ts的保持一致
    const matchValue = value.match(/^(\*(.+?)\*)?(.*)$/s);
    if (!matchValue[2]) {
        // 简称
        return {
            result: false,
            description: '必须包含“*简称*”'
        };
    }
    return {
        // 项目名称需小于100字符
        result: matchValue[3].length <= 100,
        description: '去除“*简称*”限制为100字符'
    };
}

// 数字
function isNum(value: string): ValidateReturn {
    return {
        result: /^\d+$/.test(value),
        description: '限制为数字'
    };
}

// 数字字母
function isNumLetter(value: string): ValidateReturn {
    return {
        result: /^[a-zA-Z0-9]+$/.test(value),
        description: '限制为数字字母'
    };
}

// 数字字母连字符
function isNumLetterHyphen(value: string): ValidateReturn {
    return {
        result: /^[a-zA-Z0-9-]+$/.test(value),
        description: '限制为数字字母连字符'
    };
}

// 太长
function isRemarOverlong(value: string): ValidateReturn { // 提交到税局限制在240以内，但是提示只能输入200，因为可能包含一些换行符号，也是为了跟新通道一致
    return {
        result: value.length < 240,
        description: '限制为200字符以内'
    };
}

// 数字字母下划线连字符
function isNumLetterLine(value: string): ValidateReturn {
    return {
        result: /^[\w-]+$/.test(value),
        description: '限制为数字字母连字符下划线'
    };
}

// 1或0 兼容字符串与数值
function isOneOrZero(value: string | number): ValidateReturn {
    // 兼容字符串与数值
    return {
        result: +value === 1 || +value === 0,
        description: '限制为1或0'
    };
}

// Y或N
function isYOrN(value: string | number): ValidateReturn {
    return {
        result: value === 'Y' || value === 'N',
        description: '限制为Y或N'
    };
}

// 证件类型
function isCardType(value: string | number): ValidateReturn {
    // 103 税务登记证
    // 201 居民身份证
    // 208 外国护照
    // 210 港澳居民来往内地通行证
    // 213 台湾居民来往大陆通行证
    // 215 外国人居留证
    // 219 香港永久性居民身份证
    // 220 台湾身份证
    // 221 澳门特别行政区永久性居民身份证
    // 233 外国人永久居留身份证（外国人永久居留证）
    // 299 其他个人证件
    const keys = ['103', '201', '208', '210', '213', '215', '219', '220', '221', '233', '299'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 不动产详细地址
function isEstateDetailAddress(value: string | number): ValidateReturn {
    const keys = ['街', '路', '村', '乡', '镇', '道'];
    return {
        result: keys.some((v) => String(value).includes(v)),
        description: `必须包含“${keys.join('、')}”等关键词之一`
    };
}

// 不动产面积单位 ㎡的ASCII码为\u33a1 m的ASCII码为\u006d
function isEstateAreaUnit(value: string | number): ValidateReturn {
    const keys = ['米', '平方千米', '平方米', '公顷', '亩', 'h㎡', 'k㎡', '㎡'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 数据类型Number
function isTypeofNumber(value: string | number): ValidateReturn {
    return {
        result: typeof value === 'number',
        description: '的数据类型限制为Number'
    };
}

// 数据类型string
function isTypeofString(value: string | number): ValidateReturn {
    return {
        result: typeof value === 'string',
        description: '的数据类型限制为String'
    };
}

// 数值
function isNumberValue(value: string | number): ValidateReturn {
    return {
        result: !isNaN(+value),
        description: '限制为数值'
    };
}

// 十三位小数
function isThirteenDecimalValue(value: string | number, data: any): ValidateReturn {
    const res = isNumberValue(value);
    if (!res.result) {
        return res;
    }

    const tem = String.prototype.split.call(value, '.');

    if (tem[1] && tem[1].length > 13) {
        return {
            result: false,
            description: '小数位限制为13位'
        };
    }

    return {
        result: true,
        description: 'success'
    };
}

// 小于等于1 税率
function isTaxRate(value: string | number, data: any): ValidateReturn {
    const res = isNumberValue(value);
    if (!res.result) {
        return res;
    }

    return {
        result: +value <= 1,
        description: '限制为小于等于1'
    };
}

// 明细金额
function isDetailAmount(value: string | number, data: any): ValidateReturn {
    let res = isNumberValue(value);
    if (!res.result) {
        return res;
    }
    // 非折扣行 数量不为空 单价不为空
    if (data.discountType !== '1' && !isNullOrUndefinedOrEmpty(data.num) && !isNullOrUndefinedOrEmpty(data.unitPrice)) {
        const tem = accMul(data.num, data.unitPrice);
        res = {
            result: Math.abs(Minus(value, tem)) <= 0.01,
            description: `与数量*单价的乘积${tem}的差值应小于等于0.01`
        };
    }
    return res;
}

// 明细折扣金额
function isDetailDiscountAmount(value: string | number, data: any): ValidateReturn {
    let res = isNumberValue(value);
    if (!res.result) {
        return res;
    }
    // 正常行0
    if (data.discountType === '0' && !isNullOrUndefinedOrEmpty(value)) {
        res = {
            result: Math.abs(+value) <= data.detailAmount,
            description: '应小于等于金额'
        };
    }
    return res;
}

// 明细优惠政策类型
function isVatException(value: string | number, data: any): ValidateReturn {
    const res = isTypeofString(value);
    if (!res.result) {
        return res;
    }
    return {
        result: !!etaxZzstsgl.find((item) => item.label === value || item.value === value),
        description: '参数错误'
    };
}

// 明细即征即退类型
function isTaxFreeType(value: string | number, data: any): ValidateReturn {
    // vatException 值有被转换 convert
    if (~data.vatException.indexOf('即征即退')) {
        const res = isTypeofString(value);
        if (!res.result) {
            return res;
        }
        return {
            result: !!etaxJzjtlx[value as keyof typeof etaxJzjtlx],
            description: '参数错误'
        };
    }

    return {
        result: !value,
        description: '在优惠政策内容非即征即退时禁止输入'
    };
}

// 日期YYYYMMDD
function isDateByYYYYMMDD(value: string): ValidateReturn {
    return isFormatDate(value, 'YYYYMMDD');
}

// 日期YYYY-MM-DD
function isDateByYYYYMMDDAndhHyphen(value: string): ValidateReturn {
    return isFormatDate(value, 'YYYY-MM-DD');
}

// 日期base format
function isFormatDate(value: string, format: string): ValidateReturn {
    return {
        result: value.length === format.length && moment(value, format).isValid(),
        description: `数据格式限制为‘${format}’`
    };
}

// 购买方经办人证件类型代码
function isEtaxSfzjlx(value: string | number): ValidateReturn {
    const res = isTypeofString(value);
    if (!res.result) {
        return res;
    }
    return {
        result: !!etaxSfzjlx[value as keyof typeof etaxSfzjlx],
        description: '参数错误'
    };
}

// 经办人国籍(地区)代码
function isEtaxGjhdq(value: string | number): ValidateReturn {
    const res = isTypeofString(value);
    if (!res.result) {
        return res;
    }
    return {
        result: !!etaxGjhdq[value as keyof typeof etaxGjhdq],
        description: '参数错误'
    };
}

// 货物运输运输工具种类
function isFreightTransportType(value: string | number): ValidateReturn {
    const keys = ['铁路运输', '公路运输', '水路运输', '航空运输', '管道运输', '其它运输工具'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 差额征税类型
function isDifferenceTaxType(value: string | number): ValidateReturn {
    const keys = ['01', '02'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 合计扣除额
function isTotalDeduction(value: string | number, data: any): ValidateReturn {
    const res = isTypeofNumber(value);
    if (!res.result) {
        return res;
    }

    // 全额开票
    if (data.differenceTaxType === '01') {
        return {
            result: value === 0,
            description: '在差额征税类型为01全额开票时应为0'
        };
    }

    // 差额开票
    if (data.differenceTaxType === '02' && value === 0) {
        return {
            result: false,
            description: '在差额征税类型为02差额开票时不能为0'
        };
    }

    return {
        result: +value <= data.invoiceAmount,
        description: '应小于等于金额合计(不含税)'
    };
}

// 差额扣除额清单凭证类型
function isDeductionListEvidenceType(value: string | number): ValidateReturn {
    // 01 数电票、02 增值税专用发票、03 增值税普通发票、04 营业税发票、05 财政票据、06 法院裁决书、07 契税完税凭证、08 其他发票类、09 其他扣除凭证
    const keys = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 差额扣除额清单数电票号码
function isDeductionListEtaxInvoiceNo(value: string | number): ValidateReturn {
    return {
        result: /^\d{20}$/.test(String(value)),
        description: '参数错误'
    };
}

// 差额扣除额清单扣除额
function isDeductionListDeduction(value: string | number, data: any): ValidateReturn {
    const res = isTypeofNumber(value);
    if (!res.result) {
        return res;
    }
    return {
        result: +value <= data.evidenceAmount,
        description: '应小于等于凭证合计金额'
    };
}

// 减按征税类型
function isReductionTaxType(value: string | number): ValidateReturn {
    const keys = ['01', '02', '03', '04', '05', '51', '52', '53'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 成品油明细单位校验
function isUnitForRefinedOil(value: string | number): ValidateReturn {
    // 吨 升
    const keys = ['吨', '升'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 拖拉机明细单位校验
function isUnitForTractor(value: string | number): ValidateReturn {
    // 辆
    const keys = ['辆'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 拖拉机明细数量校验
function isNumForTractor(value: string | number): ValidateReturn {
    // 辆
    return {
        result: +value === 1,
        description: '限制为1'
    };
}

// 附加要素类型
function isExtraType(value: string | number): ValidateReturn {
    const keys = ['string', 'number', 'date'];
    return {
        result: keys.some((v) => value === v),
        description: `限制为${keys.join('、')}`
    };
}

// 附加要素内容
function isExtraValue(value: string, data: any): ValidateReturn {
    if (data.extraType === 'date') {
        return isDateByYYYYMMDDAndhHyphen(value);
    }
    if (data.extraType === 'number') {
        return {
            result: !isNaN(Number(value)),
            description: '数据类型限制为数值'
        };
    }
    // 默认为文本
    return {
        result: true,
        description: 'success'
    };
}

// 交通工具类型
function isEtaxJtgjlx(value: string): ValidateReturn {
    const res = isTypeofString(value);
    if (!res.result) {
        return res;
    }
    return {
        result: !!etaxJtgjlx[value as keyof typeof etaxJtgjlx],
        description: '参数错误'
    };
}

// 交通工具类型等级
function isTransportSeatClass(value: string | number, data: any): ValidateReturn {
    if (data.transportType === '1') {
        // 飞机
        const keys = ['公务舱', '头等舱', '经济舱'];
        return {
            result: keys.some((v) => value === v),
            description: `限制为${keys.join('、')}`
        };
    }
    if (data.transportType === '2') {
        // 火车
        const keys = ['一等座', '二等座', '软席（软座、软卧）', '硬席（硬座、硬卧）'];
        return {
            result: keys.some((v) => value === v),
            description: `限制为${keys.join('、')}`
        };
    }
    if (data.transportType === '7') {
        // 船舶
        const keys = ['一等舱', '二等舱', '三等舱'];
        return {
            result: keys.some((v) => value === v),
            description: `限制为${keys.join('、')}`
        };
    }
    return {
        result: true,
        description: 'success'
    };
}
// 购买方名称字符要大于一
function isBuyerName(value: string, data: any): ValidateReturn {
    // 收票方为自然人，购方名称必须大于一个字符
    if (data.naturalPersonFlag === 'Y') {
        return {
            result: value && value.length > 1,
            description: '长度错误，当受票方（发票抬头）为自然人时购方名称需大于一个字符'
        };
    }
    const checkResult = value && value.length > 0;
    return {
        result: checkResult,
        description: checkResult ? 'sucess' : '至少需要一个字符'
    };
}
// 开具理由
function isOpenReason(value: string): ValidateReturn {
    return {
        result: !!etaxOpenReason[value as keyof typeof etaxOpenReason],
        description: '参数错误'
    };
}
/* validate function end */

/* convert function start */
// 发票类型代码 => 文本
function convertInvoiceType(value: string | number) {
    // 兼容字符串与数值
    const obj = INVOICETYPES.find((item) => item.key === +value);
    return obj.value;
}

// 特定业务类型代码 => 文本
function convertBusinessType(value: string | number) {
    const obj = SpecificInfoOptions.find((item) => item.code === value);
    return obj.name;
}

// 1、0 => 是、否
function convertOneOrZero(value: string | number) {
    // 兼容字符串与数值
    return +value === 1 ? '是' : +value === 0 ? '否' : value;
}

// Y、N => 是、否
function convertYOrN(value: string | number) {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
}

// 购买方经办人证件类型代码 => 文本
function convertEtaxSfzjlx(value: string | number) {
    return etaxSfzjlx[value as keyof typeof etaxSfzjlx];
}

// 经办人国籍(地区)代码 => 文本
function convertEtaxGjhdq(value: string | number) {
    return etaxGjhdq[value as keyof typeof etaxGjhdq];
}

// 明细商品名称
function convertGoodsName(value: string) {
    const matchValue = value.match(/^(\*.+?\*)?(.*)$/s);
    return matchValue[2];
}

// 明细优惠政策类型
function convertVatException(value: string | number) {
    return etaxZzstsgl.find((item) => item.label === value || item.value === value)?.label;
}

// 明细即征即退类型
function convertTaxFreeType(value: string | number) {
    return etaxJzjtlx[value as keyof typeof etaxJzjtlx];
}

// 交通工具类型
function convertEtaxJtgjlx(value: string | number) {
    return etaxJtgjlx[value as keyof typeof etaxJtgjlx];
}

// 开具理由
function convertOpenReason(value: string | number) {
    return etaxOpenReason[value as keyof typeof etaxOpenReason];
}
/* convert function end */

// 生成excel配置
function getExcelOption(data: ValidateObject[]): ExcelOption {
    const display: any = {};
    const header = data.map((o) => {
        display[o.excelKey || o.key] = o.name;
        return o.excelKey || o.key;
    });

    return {
        keys: data.map((o) => o.excelKey || o.key),
        header,
        display,
        cols: data.map((o) => ({ wch: o.wch }))
    };
}

// 发票流水号
const SerialNo: ValidateObject = { name: '发票流水号', key: 'serialNo', wch: 13, max: 50, required: true, validate: isNumLetterLine };

// 发票基本信息
export const BaseInfo: ValidateObject[] = [
    SerialNo,
    { name: '发票类型', key: 'invoiceType', wch: 13, max: 10, required: true, validate: isInvoiceType, convert: convertInvoiceType },
    { name: '特定业务类型', key: 'businessType', wch: 13, max: 10, required: false, validate: isBusinessType, convert: convertBusinessType },
    { name: '是否含税', key: 'taxFlag', wch: 13, max: 2, required: true, validate: isOneOrZero, convert: convertOneOrZero },
    { name: '受票方自然人标识', key: 'naturalPersonFlag', wch: 13, max: 2, required: false, validate: isNaturalPersonFlag, convert: convertYOrN },
    { name: '购买方名称', key: 'buyerName', wch: 29, max: 100, required: true, validate: isBuyerName },
    { name: '证件类型', key: 'cardType', wch: 13, max: 20, required: ifCardType, validate: isCardType, convert: convertEtaxSfzjlx },
    { name: '购买方纳税人识别号', key: 'buyerTaxNo', wch: 13, max: 20, required: ifBuyerTaxNo, validate: isNumLetter },
    { name: '购买方地址', key: 'buyerAddress', wch: 13, max: 100, required: false, validate: null },
    { name: '购买方电话', key: 'buyerFixedTelephone', wch: 13, max: 100, required: false, validate: null },
    { name: '购买方开户银行', key: 'buyerCardName', wch: 13, max: 100, required: false, validate: null },
    { name: '购买方银行账号', key: 'buyerCardNumber', wch: 13, max: 100, required: false, validate: isNumLetterHyphen },
    { name: '备注', key: 'remark', wch: 13, max: 9999, required: false, validate: isRemarOverlong }, // 单张开票页面200字符 excel模板230字符
    { name: '是否展示购买方银行账号', key: 'showBuyerCard', wch: 13, max: 2, required: false, validate: isYOrN, convert: convertYOrN },
    { name: '销售方开户行', key: 'salerCardName', wch: 13, max: 100, required: true, validate: null },
    { name: '销售方银行账号', key: 'salerCardNumber', wch: 13, max: 60, required: true, validate: isNumLetterHyphen },
    { name: '是否展示销售方银行账号', key: 'showSalerCard', wch: 13, max: 2, required: false, validate: isYOrN, convert: convertYOrN },
    { name: '购买方邮箱', key: 'buyerEmail', wch: 13, max: 72, required: false, validate: null },
    { name: '购买方经办人姓名', key: 'agentUser', wch: 13, max: 150, required: false, validate: null },
    { name: '购买方经办人证件类型', key: 'agentCardType', wch: 13, max: 40, required: false, validate: isEtaxSfzjlx, convert: convertEtaxSfzjlx },
    { name: '购买方经办人证件号码', key: 'agentCardNo', wch: 13, max: 30, required: ifAgentCardNo, validate: isNumLetter },
    { name: '经办人国籍(地区)', key: 'agentCountry', wch: 13, max: 40, required: false, validate: isEtaxGjhdq, convert: convertEtaxGjhdq },
    { name: '经办人自然人纳税人识别号', key: 'agentTaxNo', wch: 13, max: 20, required: false, validate: isNumLetter },
    { name: '放弃享受减按1%征收率原因', key: 'openReason', wch: 29, max: 2, required: false, validate: isOpenReason, convert: convertOpenReason },
    { name: '收款人', key: 'payee', wch: 13, max: 16, required: false, validate: null },
    { name: '复核人', key: 'reviewer', wch: 13, max: 16, required: false, validate: null },
    // 发票云字段
    { name: '购买方手机', key: 'buyerMobilePhone', wch: 13, max: 20, required: false, validate: null }
];
// 发票基本信息 excelOption
export const BaseExcelOption = getExcelOption(BaseInfo);

// 发票明细信息
const DetailInfo: ValidateObject[] = [
    SerialNo,
    { name: '项目名称', key: 'goodsName', wch: 13, max: 117, required: true, validate: isGoodsName, convert: convertGoodsName }, // 最大长度100 + 两个* + 最长的简称15 共117
    { name: '商品和服务税收编码', key: 'goodsCode', wch: 13, max: 20, required: true, validate: isNum },
    { name: '规格型号', key: 'specModel', wch: 13, max: 40, required: false, validate: null },
    { name: '单位', key: 'unit', wch: 13, max: 22, required: false, validate: null },
    { name: '数量', key: 'num', wch: 13, max: 16, required: ifDetailNum, validate: isThirteenDecimalValue },
    { name: '单价', key: 'unitPrice', wch: 13, max: 16, required: ifDetailUnitPrice, validate: isThirteenDecimalValue },
    { name: '金额', key: 'detailAmount', wch: 13, max: 16, required: true, validate: isDetailAmount },
    { name: '税率', key: 'taxRate', wch: 13, max: 8, required: true, validate: isTaxRate },
    { name: '折扣金额', key: 'discountAmount', wch: 20, max: 16, required: false, validate: isDetailDiscountAmount },
    { name: '是否使用优惠政策', key: 'preferentialPolicy', wch: 20, max: 2, required: false, validate: isOneOrZero, convert: convertOneOrZero },
    { name: '优惠政策类型', key: 'vatException', wch: 20, max: 15, required: ifVatException, validate: isVatException, convert: convertVatException },
    { name: '即征即退类型', key: 'taxFreeType', wch: 29, max: 46, required: false, validate: isTaxFreeType, convert: convertTaxFreeType }
];
// 发票明细信息 excelOption
export const DetailExcelOption = getExcelOption(DetailInfo);

// 特定业务信息 建筑服务
const BuildSpecialInfo: ValidateObject[] = [
    { name: '建筑服务发生地', key: 'simpleAddress', excelKey: 'B', wch: 13, max: 30, required: true, validate: null },
    { name: '发生地详细地址', key: 'detailAddress', excelKey: 'C', wch: 13, max: 90, required: false, validate: null },
    { name: '建筑项目名称', key: 'buildingName', excelKey: 'D', wch: 20, max: 80, required: true, validate: null },
    { name: '土地增值税项目编号', key: 'landTaxNo', excelKey: 'E', wch: 23, max: 20, required: false, validate: null },
    { name: '跨地市标志', key: 'crossCitySign', excelKey: 'F', wch: 20, max: 2, required: true, validate: isOneOrZero, convert: convertOneOrZero }
];
// 特定业务信息 货物运输服务
const FreightSpecialInfo: ValidateObject[] = [
    { name: '起运地', key: 'startPlace', excelKey: 'G', wch: 14, max: 80, required: true, validate: null },
    { name: '到达地', key: 'endPlace', excelKey: 'H', wch: 14, max: 80, required: true, validate: null },
    { name: '运输工具种类', key: 'transportType', excelKey: 'I', wch: 14, max: 40, required: true, validate: isFreightTransportType },
    { name: '运输工具牌号', key: 'licensePlate', excelKey: 'J', wch: 14, max: 40, required: true, validate: null },
    { name: '运输货物名称', key: 'transportGoods', excelKey: 'K', wch: 14, max: 80, required: true, validate: null }
];
// 特定业务信息 不动产销售
const EstateSaleSpecialInfo: ValidateObject[] = [
    { name: '房屋产权证书/不动产权证号码', key: 'estateId', excelKey: 'L', wch: 20, max: 40, required: false, validate: null },
    { name: '不动产地址', key: 'simpleAddress', excelKey: 'M', wch: 14, max: 30, required: true, validate: null },
    { name: '不动产详细地址', key: 'detailAddress', excelKey: 'N', wch: 14, max: 90, required: true, validate: isEstateDetailAddress },
    { name: '不动产单元代码/网签合同备案编码', key: 'estateCode', excelKey: 'O', wch: 20, max: 28, required: false, validate: null },
    { name: '土地增值税项目编号', key: 'landTaxNo', excelKey: 'P', wch: 15, max: 20, required: false, validate: null },
    { name: '核定计税价格', key: 'approvedPrice', excelKey: 'Q', wch: 14, max: 20, required: false, validate: isNumberValue },
    { name: '实际成交含税金额', key: 'actualTurnover', excelKey: 'R', wch: 18, max: 20, required: ifEstateSaleApprovedPrice, validate: isNumberValue },
    { name: '跨地市标志', key: 'crossCitySign', excelKey: 'S', wch: 18, max: 2, required: true, validate: isOneOrZero, convert: convertOneOrZero },
    { name: '面积单位', key: 'areaUnit', excelKey: 'T', wch: 18, max: 12, required: true, validate: isEstateAreaUnit }

];
// 特定业务信息 不动产租赁
const EstateLeaseSpecialInfo: ValidateObject[] = [
    { name: '房屋产权证书/不动产权证号码', key: 'estateId', excelKey: 'U', wch: 22, max: 40, required: true, validate: null },
    { name: '不动产地址', key: 'simpleAddress', excelKey: 'V', wch: 28, max: 30, required: true, validate: null },
    { name: '不动产详细地址', key: 'detailAddress', excelKey: 'W', wch: 28, max: 90, required: true, validate: isEstateDetailAddress },
    { name: '租赁期起', key: 'startLeaseDate', excelKey: 'X', wch: 17, max: 8, required: true, validate: isDateByYYYYMMDD },
    { name: '租赁期止', key: 'endLeaseDate', excelKey: 'Y', wch: 17, max: 8, required: true, validate: isDateByYYYYMMDD },
    { name: '跨地市标志', key: 'crossCitySign', excelKey: 'Z', wch: 23, max: 2, required: true, validate: isOneOrZero, convert: convertOneOrZero },
    { name: '面积单位', key: 'areaUnit', excelKey: 'AA', wch: 23, max: 12, required: true, validate: isEstateAreaUnit }
];
// 特定业务信息 保险机构代收车船税
const InsuranceSpecialInfo: ValidateObject[] = [
    { name: '保险单号', key: 'insuranceId', excelKey: 'AB', wch: 12, max: 40, required: true, validate: null },
    { name: '车牌号/船舶登记号', key: 'licensePlate', excelKey: 'AC', wch: 19, max: 40, required: true, validate: null },
    { name: '税款所属期起', key: 'startTaxPeriod', excelKey: 'AD', wch: 12, max: 20, required: true, validate: null },
    { name: '税款所属期止', key: 'endTaxPeriod', excelKey: 'AE', wch: 12, max: 20, required: true, validate: null },
    { name: '代收车船税金额', key: 'collectedTaxAmount', excelKey: 'AF', wch: 16, max: 10, required: true, validate: null },
    { name: '滞纳金金额', key: 'latePaymentAmount', excelKey: 'AG', wch: 12, max: 10, required: true, validate: null },
    { name: '金额合计', key: 'insuranceAmount', excelKey: 'AH', wch: 12, max: 10, required: true, validate: null },
    { name: '车辆识别代码/车架号码', key: 'vin', excelKey: 'AI', wch: 23, max: 17, required: true, validate: null }
];
// 特定业务信息 旅客运输服务
const TravelerSpecialInfo: ValidateObject[] = [
    { name: '出行人', key: 'traveler', excelKey: 'AJ', wch: 15, max: 20, required: true, validate: null },
    { name: '出行人证件类型', key: 'cardType', excelKey: 'AK', wch: 15, max: 20, required: true, validate: isEtaxSfzjlx, convert: convertEtaxSfzjlx },
    { name: '出行人证件号码', key: 'cardNo', excelKey: 'AL', wch: 15, max: 20, required: true, validate: isNumLetter },
    { name: '出行日期', key: 'travelDate', excelKey: 'AM', wch: 12, max: 10, required: true, validate: isDateByYYYYMMDDAndhHyphen },
    { name: '出发地', key: 'startPlace', excelKey: 'AN', wch: 12, max: 80, required: true, validate: null },
    { name: '到达地', key: 'endPlace', excelKey: 'AO', wch: 12, max: 80, required: true, validate: null },
    { name: '交通工具类型', key: 'transportType', excelKey: 'AP', wch: 12, max: 2, required: true, validate: isEtaxJtgjlx, convert: convertEtaxJtgjlx },
    { name: '等级', key: 'seatClass', excelKey: 'AQ', wch: 12, max: 10, required: ifTransportSeatClass, validate: isTransportSeatClass }
];
// 特定业务信息 医疗服务（门诊）
const OutpatientSpecialInfo: ValidateObject[] = [
    { name: '业务流水号', key: 'businessSerialNo', excelKey: 'AR', wch: 13, max: 16, required: true, validate: null },
    { name: '门诊号', key: 'clinicNo', excelKey: 'AS', wch: 13, max: 16, required: true, validate: null },
    { name: '就诊日期', key: 'treatmentDate', excelKey: 'AT', wch: 13, max: 16, required: true, validate: null },
    { name: '医疗机构类型', key: 'institutionType', excelKey: 'AU', wch: 13, max: 16, required: true, validate: null },
    { name: '医保类型', key: 'insuranceType', excelKey: 'AV', wch: 13, max: 16, required: true, validate: null },
    { name: '医保编号', key: 'insuranceNo', excelKey: 'AW', wch: 13, max: 16, required: true, validate: null },
    { name: '性别', key: 'sex', excelKey: 'AX', wch: 13, max: 16, required: true, validate: null },
    { name: '医保统筹基金支付', key: 'fundPayment', excelKey: 'AY', wch: 18, max: 16, required: true, validate: null },
    { name: '其他支付', key: 'otherPayment', excelKey: 'AZ', wch: 13, max: 16, required: true, validate: null },
    { name: '个人账户支付', key: 'accountPayment', excelKey: 'BA', wch: 13, max: 16, required: true, validate: null },
    { name: '个人现金支付', key: 'cashPayment', excelKey: 'BB', wch: 13, max: 16, required: true, validate: null },
    { name: '个人支付', key: 'personalPayment', excelKey: 'BC', wch: 13, max: 16, required: true, validate: null },
    { name: '个人自费', key: 'personalExpense', excelKey: 'BD', wch: 13, max: 16, required: true, validate: null }
];
// 特定业务信息 医疗服务（住院）
const InpatientSpecialInfo: ValidateObject[] = [
    { name: '业务流水号', key: 'businessSerialNo', excelKey: 'BE', wch: 17, max: 16, required: true, validate: null },
    { name: '病例号', key: 'caseNo', excelKey: 'BF', wch: 11, max: 16, required: true, validate: null },
    { name: '住院号', key: 'hospitalNo', excelKey: 'BG', wch: 11, max: 16, required: true, validate: null },
    { name: '住院科别', key: 'hospitalDepartment', excelKey: 'BH', wch: 11, max: 16, required: true, validate: null },
    { name: '住院时间', key: 'hospitalStay', excelKey: 'BI', wch: 11, max: 16, required: true, validate: null },
    { name: '预缴金额', key: 'advanceAmount', excelKey: 'BJ', wch: 11, max: 16, required: true, validate: null },
    { name: '补缴金额', key: 'supplementaryAmount', excelKey: 'BK', wch: 11, max: 16, required: true, validate: null },
    { name: '退费金额', key: 'refundAmount', excelKey: 'BL', wch: 11, max: 16, required: true, validate: null },
    { name: '医疗机构类型', key: 'institutionType', excelKey: 'BM', wch: 12, max: 16, required: true, validate: null },
    { name: '医保类型', key: 'insuranceType', excelKey: 'BN', wch: 11, max: 16, required: true, validate: null },
    { name: '医保编号', key: 'insuranceNo', excelKey: 'BO', wch: 11, max: 16, required: true, validate: null },
    { name: '性别', key: 'sex', excelKey: 'BP', wch: 11, max: 16, required: true, validate: null },
    { name: '医保统筹基金支付', key: 'fundPayment', excelKey: 'BQ', wch: 18, max: 16, required: true, validate: null },
    { name: '其他支付', key: 'otherPayment', excelKey: 'BR', wch: 11, max: 16, required: true, validate: null },
    { name: '个人账户支付', key: 'accountPayment', excelKey: 'BS', wch: 11, max: 16, required: true, validate: null },
    { name: '个人现金支付', key: 'cashPayment', excelKey: 'BT', wch: 11, max: 16, required: true, validate: null },
    { name: '个人支付', key: 'personalPayment', excelKey: 'BU', wch: 11, max: 16, required: true, validate: null },
    { name: '个人自费', key: 'personalExpense', excelKey: 'BV', wch: 11, max: 16, required: true, validate: null }
];
// 特定业务信息 拖拉机和联合收割机
const TractorSpecialInfo: ValidateObject[] = [
    { name: '是否用于办理拖拉机和联合收割机登记', key: 'forRegister', excelKey: 'BW', wch: 24, max: 2, required: true, validate: isYOrN, convert: convertYOrN },
    { name: '发动机号码', key: 'engineNo', excelKey: 'BX', wch: 17, max: 40, required: ifTractorEngineNo, validate: null },
    { name: '底盘号/机架号', key: 'chassisNo', excelKey: 'BY', wch: 17, max: 30, required: ifTractorChassisNo, validate: null }
];
// 特定业务信息 excelOption
export const SpecialExcelOption = getExcelOption([
    SerialNo,
    ...BuildSpecialInfo,
    ...FreightSpecialInfo,
    ...EstateSaleSpecialInfo,
    ...EstateLeaseSpecialInfo,
    ...InsuranceSpecialInfo,
    ...TravelerSpecialInfo,
    ...OutpatientSpecialInfo,
    ...InpatientSpecialInfo,
    ...TractorSpecialInfo
]);

// 附加要素信息
const ExtraInfo: ValidateObject[] = [
    SerialNo,
    { name: '附加要素名称', key: 'extraName', wch: 29, max: 20, required: true, validate: null }, // 附加信息维护页面20字符 excel模板50字符
    { name: '附加要素内容', key: 'extraValue', wch: 63, max: 300, required: true, validate: isExtraValue },
    { name: '附加要素类型', key: 'extraType', wch: 13, max: 10, required: false, validate: isExtraType }
];
// 附加要素信息 excelOption
export const ExtraExcelOption = getExcelOption(ExtraInfo);

export interface SpecificInfoOptionsType {
    code: string;
    isSupported: boolean;
    name: string;
    key: string;
    validates: ValidateObject[];
}

// 特定业务分类 配置
export const SpecificInfoOptions: {
    code: string; // 特定要素类型代码
    isSupported: boolean; // 是否支持
    name: string; // 名称 excel导入时需要 不可随意变动
    key: string; // 特殊字段
    validates?: ValidateObject[]; // 特殊字段检验配置
    appendDetailValidate?: { // 追加明细校验
        lineInfo: {
            [name: string]: {
                prohibited?: boolean; // 禁止输入
                required?: boolean; // 必填
                validate?: ValidateFun; // 输入校验
            }
        }
        lineLimit?: number; // 明细行限制
        required?: RequiredFun; // 追加明细校验是否启用 默认启用
    },
    prohibitedDifferenceTax?: boolean; // 禁止差额征税
    prohibitedReductionTax?: boolean; // 禁止减按征税
}[] = [
    {
        code: '01',
        isSupported: true,
        name: '成品油',
        key: 'refinedOil',
        appendDetailValidate: { // 追加明细校验
            lineInfo: {
                'unit': { required: true, validate: isUnitForRefinedOil },
                'num': { required: true },
                'unitPrice': { required: true }
            }
        },
        prohibitedDifferenceTax: true,
        prohibitedReductionTax: true
    },
    {
        code: '02',
        isSupported: false,
        name: '稀土',
        key: '02'
    },
    {
        code: '03',
        isSupported: true,
        name: '建筑服务',
        key: 'buildInfo',
        validates: BuildSpecialInfo,
        appendDetailValidate: {
            lineLimit: 1,
            lineInfo: {
                'specModel': { prohibited: true },
                'unit': { prohibited: true },
                'num': { prohibited: true },
                'unitPrice': { prohibited: true }
            }
        },
        prohibitedReductionTax: true
    },
    {
        code: '04',
        isSupported: true,
        name: '货物运输服务',
        key: 'freightList',
        validates: FreightSpecialInfo,
        prohibitedReductionTax: true
    },
    {
        code: '05',
        isSupported: true,
        name: '不动产销售',
        key: 'estateSaleInfo',
        validates: EstateSaleSpecialInfo,
        appendDetailValidate: {
            lineLimit: 1,
            lineInfo: {
                'specModel': { prohibited: true },
                'unit': { prohibited: true },
                'num': { required: true }
            }
        },
        prohibitedReductionTax: true
    },
    {
        code: '06',
        isSupported: true,
        name: '不动产经营租赁服务',
        key: 'estateLeaseInfo',
        validates: EstateLeaseSpecialInfo,
        appendDetailValidate: {
            lineLimit: 1,
            lineInfo: {
                'specModel': { prohibited: true },
                'unit': { prohibited: true },
                'num': { required: true }
            }
        }
    },
    {
        code: '07',
        isSupported: false,
        name: '代收车船税',
        key: 'insurance',
        validates: InsuranceSpecialInfo
    },
    {
        code: '08',
        isSupported: false,
        name: '通行费', // excel暂无
        key: '08'
    },
    {
        code: '09',
        isSupported: true,
        name: '旅客运输服务',
        key: 'travelerList',
        validates: TravelerSpecialInfo,
        appendDetailValidate: {
            lineLimit: 1,
            lineInfo: {}
        },
        prohibitedReductionTax: true
    },
    {
        code: '10',
        isSupported: false,
        name: '医疗服务（住院）',
        key: 'inpatient',
        validates: InpatientSpecialInfo
    },
    {
        code: '11',
        isSupported: false,
        name: '医疗服务（门诊）',
        key: 'outpatient',
        validates: OutpatientSpecialInfo
    },
    {
        code: '12',
        isSupported: true,
        name: '自产农产品销售',
        key: '12',
        prohibitedDifferenceTax: true,
        prohibitedReductionTax: true
    },
    {
        code: '13',
        isSupported: true,
        name: '拖拉机和联合收割机',
        key: 'tractorInfo',
        validates: TractorSpecialInfo,
        appendDetailValidate: {
            lineLimit: 1,
            lineInfo: {
                'unit': { required: true, validate: isUnitForTractor },
                'num': { validate: isNumForTractor }
            },
            required: ifTractorForRegister
        },
        prohibitedDifferenceTax: true,
        prohibitedReductionTax: true
    },
    {
        code: '14',
        isSupported: false,
        name: '机动车',
        key: '14'
    },
    {
        code: '15',
        isSupported: false,
        name: '二手车',
        key: '15'
    },
    {
        code: '16',
        isSupported: true,
        name: '农产品收购',
        key: '16',
        prohibitedDifferenceTax: true,
        prohibitedReductionTax: true
    },
    {
        code: '17',
        isSupported: false,
        name: '光伏收购',
        key: '17'
    },
    {
        code: '18',
        isSupported: true,
        name: '卷烟',
        key: 'cigarette',
        appendDetailValidate: {
            lineInfo: {
                'unit': { required: true },
                'num': { required: true },
                'unitPrice': { required: true }
            }
        },
        prohibitedDifferenceTax: true,
        prohibitedReductionTax: true
    },
    {
        code: '19',
        isSupported: false,
        name: '出口发票', // excel暂无
        key: '19'
    },
    {
        code: '20',
        isSupported: false,
        name: '专票农产品',
        key: '20'
    },
    {
        code: '21',
        isSupported: false,
        name: '铁路电子客票',
        key: '21'
    },
    {
        code: '22',
        isSupported: false,
        name: '航空运输电子客票行程单',
        key: '22'
    },
    {
        code: '31',
        isSupported: false,
        name: '二手车*',
        key: '21'
    },
    {
        code: '32',
        isSupported: false,
        name: '电子烟',
        key: '21'
    },
    {
        code: '51',
        isSupported: false,
        name: '正常开具',
        key: '51'
    },
    {
        code: '52',
        isSupported: false,
        name: '反向开具',
        key: '52'
    }
];

// 销售方的追加校验
export const BaseInfoForSale: ValidateObject[] = [
    { name: '销售方名称', key: 'salerName', wch: 29, max: 100, required: true, validate: null },
    { name: '销售方纳税人识别号', key: 'salerTaxNo', wch: 13, max: 20, required: true, validate: isNumLetter },
    { name: '销售方地址', key: 'salerAddress', wch: 13, max: 100, required: true, validate: null },
    { name: '销售方电话', key: 'salerPhone', wch: 13, max: 100, required: false, validate: null }
];

// 差额征税校验
export const DifferenceTaxInfo: ValidateObject[] = [
    { name: '差额征税类型', key: 'differenceTaxType', wch: 13, max: 4, required: false, validate: isDifferenceTaxType },
    { name: '合计扣除额', key: 'totalDeduction', wch: 13, max: 16, required: true, validate: isTotalDeduction }
];
// 差额扣除额清单
const DeductionListInfo: ValidateObject[] = [
    { name: '凭证类型', key: 'evidenceType', wch: 13, max: 100, required: true, validate: isDeductionListEvidenceType },
    { name: '数电票号码', key: 'etaxInvoiceNo', wch: 13, max: 20, required: ifDeductionListEtaxInvoiceNo, validate: isDeductionListEtaxInvoiceNo },
    { name: '发票代码', key: 'invoiceCode', wch: 13, max: 20, required: ifDeductionListInvoiceCode, validate: isNum },
    { name: '发票号码', key: 'invoiceNo', wch: 13, max: 10, required: ifDeductionListInvoiceNo, validate: isNum },
    { name: '凭证号码', key: 'evidenceNo', wch: 13, max: 20, required: false, validate: isNumLetterLine },
    { name: '开具日期', key: 'invoiceDate', wch: 13, max: 18, required: ifDeductionListInvoiceDate, validate: isDateByYYYYMMDDAndhHyphen },
    { name: '凭证合计金额', key: 'evidenceAmount', wch: 13, max: 18, required: true, validate: isTypeofNumber },
    { name: '本次扣除金额', key: 'deduction', wch: 13, max: 18, required: true, validate: isDeductionListDeduction },
    { name: '备注', key: 'remark', wch: 13, max: 100, required: ifDeductionListRemark, validate: null }
];
// 减按征税校验
export const ReductionTaxInfo: ValidateObject[] = [
    { name: '减按征税类型', key: 'reductionTaxType', wch: 13, max: 4, required: false, validate: isReductionTaxType }
];

// 使用数组校验的对象
export const ArrayInfoValidateOpt: {
    [key: string]: {
        validateName: string;
        validateInfo: ValidateObject[];
        required: boolean;
    }
} = {
    items: {
        validateName: '明细',
        validateInfo: DetailInfo,
        required: true
    },
    extraList: {
        validateName: '附加要素',
        validateInfo: ExtraInfo,
        required: false
    },
    freightList: {
        validateName: '货物运输服务',
        validateInfo: FreightSpecialInfo,
        required: true
    },
    deductionList: {
        validateName: '差额扣除额清单',
        validateInfo: DeductionListInfo,
        required: true
    },
    travelerList: {
        validateName: '旅客运输服务',
        validateInfo: TravelerSpecialInfo,
        required: false
    }
};
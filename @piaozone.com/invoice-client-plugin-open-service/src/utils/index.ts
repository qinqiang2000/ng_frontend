/**
 * 乘法
 * @param {number|string} arg1 数值
 * @param {number|string} arg2 数值
 * @param {number|string} arg3 数值 - 默认1
 * @returns {number} 结果
 */
export function accMul(arg1: number | string, arg2: number | string, arg3: number | string = 1) {
    let m = 0;
    const s1 = numberToString(arg1);
    const s2 = numberToString(arg2);
    const s3 = numberToString(arg3);
    try {
        m += s1.split('.')[1].length;
    } catch (e) {
        m += 0;
    }
    try {
        m += s2.split('.')[1].length;
    } catch (e) {
        m += 0;
    }
    try {
        m += s3.split('.')[1].length;
    } catch (e) {
        m += 0;
    }
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) * Number(s3.replace('.', '')) / Math.pow(10, m);
}
/**
 * 除法
 * @param {number|string} arg1 数值
 * @param {number|string} arg2 数值
 * @returns {number} 结果
 */
export function accDiv(arg1: number | string, arg2: number | string) {
    let d1;
    let d2;
    const n1 = Number(numberToString(arg1).replace('.', ''));
    const n2 = Number(numberToString(arg2).replace('.', ''));
    if (n2 === 0) {
        return 0;
    }
    try {
        d1 = numberToString(arg1).split('.')[1].length;
    } catch (e) {
        d1 = 0;
    }
    try {
        d2 = numberToString(arg2).split('.')[1].length;
    } catch (e) {
        d2 = 0;
    }
    // 18446934 * 0.1 = 1844693.4000000001 正确值1844693.4
    // 614897800000000000000 / 1e15 = 614897.7999999999 正确值614897.8
    return accMul((n1 / n2), Math.pow(10, d2 - d1));
}
/**
 * 加法
 * @param {number|string} arg1 数值
 * @param {number|string} arg2 数值
 * @returns {number} 结果
 */
export function Add(arg1: number | string, arg2: number | string) {
    let r1;
    let r2;
    try {
        r1 = numberToString(arg1).split('.')[1].length;
    } catch (e) {
        r1 = 0;
    }
    try {
        r2 = numberToString(arg2).split('.')[1].length;
    } catch (e) {
        r2 = 0;
    }
    // 动态控制精度长度
    const n = Math.max(r1, r2);
    const m = Math.pow(10, n);
    return Number(((Number(arg1) * m + Number(arg2) * m) / m).toFixed(n));
}
/**
 * 减法
 * @param {number|string} arg1 数值
 * @param {number|string} arg2 数值
 * @returns {number} 结果
 */
export function Minus(arg1: number | string, arg2: number | string) {
    let r1;
    let r2;
    try {
        r1 = numberToString(arg1).split('.')[1].length;
    } catch (e) {
        r1 = 0;
    }
    try {
        r2 = numberToString(arg2).split('.')[1].length;
    } catch (e) {
        r2 = 0;
    }
    // 动态控制精度长度
    const n = Math.max(r1, r2);
    const m = Math.pow(10, n);
    return Number(((Number(arg1) * m - Number(arg2) * m) / m).toFixed(n));
}
/**
 * 数值转换为字符串
 * @param {number | string} num 数值
 * @returns {string} 字符串
 */
export function numberToString(num: number | string) {
    if (isNaN(Number(num))) {
        console.error(`${num} is not number!`);
        return;
    }
    // 序列化非标准科学计数法
    const str = Number(num).toString();
    const reg = /^([+-])?([\d])+(?:.([\d]+))?[Ee]([+-])?([\d]+)$/;

    if (reg.test(str)) {
        const arr = reg.exec(str);
        // num正负号 正号可省略
        let result = arr[1] === '-' ? '-' : '';
        // 次方
        const nthPower = Number(arr[5]);
        if (nthPower) {
            // 处理小数部分
            arr[3] = arr[3] || '';
            // 次方的正负 正号可省略
            if (arr[4] === '-') {
                let zero = '';
                // 减去整数一位
                for (let i = 0; i < nthPower - 1; i++) {
                    zero += '0';
                }
                result += '0.' + zero + arr[2] + arr[3];
            } else {
                result += arr[2] + arr[3];
                const len = nthPower - arr[3].length;
                if (len >= 0) {
                    let zero = '';
                    for (let i = 0; i < len; i++) {
                        zero += '0';
                    }
                    result += zero;
                } else {
                    result = result.substring(0, result.length + len) + '.' + result.substring(result.length + len);
                }
            }
        } else {
            result += arr[2] + (arr[3] ? '.' + arr[3] : '');
        }
        return result;
    }
    return str;
}
/**
 * 保留小数 金额
 * @param {number|string} num - 数值
 * @param {number} length - 0-20之间，默认2
 * @param {boolean} noFillZero - 不补零，默认 false-补零
 * @returns {string} 指定小数位字符串
 */
export function toFixedSafe(num: number | string, length: number = 2, noFillZero: boolean = false) {
    num = Number(num);
    if (isNaN(num)) {
        console.error(`Error: toFixedSafe() ${num} is NaN`);
        return num + '';
    }
    if (isNaN(length) || length < 0 || length > 20) {
        console.error('Uncaught RangeError: toFixedSelf() digits a rgument must be between 0 and 20');
        return num + '';
    }
    length = Math.floor(length);

    // 符号位
    const flag = num >= 0 ? '' : '-';
    // 正数
    const positive = Math.abs(num);
    // 转为字符串
    const str = numberToString(positive);
    // 小数点的位置
    let dot = str.indexOf('.');

    // 浮点数要扩大的倍数
    // 除法精度问题，如果无法进位时，扩大倍数就为小数长度与需保留小数长度的最小值
    const min = Math.min(dot < 0 ? 0 : (str.length - dot - 1), length);
    let result;
    if (dot === -1 || (dot !== -1 && (str[dot + length + 1] !== '5'))) {
        result = positive.toFixed(min);
    } else {
        result = (positive + Math.pow(10, -(length + 1))).toFixed(min);
    }
    // 0时不加小数点
    if (length && !noFillZero) {
        // 无小数
        dot = result.indexOf('.');
        if (dot === -1) {
            result += '.';
            dot = result.indexOf('.');
        }
        // 处理多次进位
        const len = result.length - (dot + 1);
        if (len < length) {
            for (let i = 0; i < length - len; i++) {
                result += '0';
            }
        }
    }
    return flag + result;
}

/**
 * 保留小数不补零 数量
 * @param {string} val - 值
 * @param {number} len - 小数位最大长度 默认13
 * @returns {string} 字符串
 */
export function toFixedNoZero(val: number | string, len = 13) {
    return toFixedSafe(val, len, true);
}

/**
 * 判断值是否为null | undefined | 空字符串
 * @param {any} v - 值
 * @returns {boolean} 是或否
 */
export function isNullOrUndefinedOrEmpty(v: any) {
    return v === null || typeof v === 'undefined' || v === '';
}
interface checkOpt {
    message?: string;
    allowEmpty?: boolean | Function;
    enumAllValue?: any; // list中用于标识所有的值
}
export default class Validator {
    // 校验是否为空
    static notEmpty(message: string = '') {
        return (name: string, value: any) => {
            if (value === null || value === undefined || (value + '').trim() === '') {
                return `${message}(${name})不能为空`;
            }
            return null;
        };
    }

    static getOptInfo(value: string, opt?: checkOpt | string) {
        let allowEmptyFlag = false;
        let message = '';
        let enumAllValue;
        if (typeof opt === 'string') {
            message = opt || '';
        } else {
            message = opt.message;
            enumAllValue = opt.enumAllValue;
            if (typeof opt.allowEmpty === 'function') {
                allowEmptyFlag = opt.allowEmpty(value);
            } else {
                allowEmptyFlag = opt.allowEmpty;
            }
        }
        return {
            allowEmptyFlag,
            message,
            enumAllValue
        };
    }

    // 校验是否为指定枚举值之一
    static enum(values: any[], opt?: checkOpt | string) {
        return (name: string, value: any) => {
            const { allowEmptyFlag, message } = this.getOptInfo(value, opt);
            if (typeof value === 'undefined' || value === null) {
                if (allowEmptyFlag === true) {
                    return null;
                } else if (typeof allowEmptyFlag === 'string') {
                    return allowEmptyFlag;
                }
                return `${message}(${name})不能为空`;
            }
            if (!values.includes(value)) {
                return `${message}(${name})错误：${value}`;
            }
            return null;
        };
    }

    static arrayEnum(values: any[], opt?: checkOpt | string) {
        return (name: string, value: any) => {
            const { allowEmptyFlag, message, enumAllValue } = this.getOptInfo(value, opt);
            if (typeof value === 'undefined' || value === null) {
                if (allowEmptyFlag === true) {
                    return null;
                }
                if (typeof allowEmptyFlag === 'string') {
                    return allowEmptyFlag;
                }
                return `${message}(${name})不能为空`;
            }

            if (value.length === 0) {
                return `${message}(${name})不能为空`;
            }
            if (typeof value.length === 'undefined' || typeof value !== 'object') {
                return `${message}(${name})类型错误`;
            }
            // array中包含的查询所有的值，直接返回校验成功
            if (typeof enumAllValue !== 'undefined' && value.includes(enumAllValue)) {
                return null;
            }

            // 每个类型进行检测
            for (let i = 0; i < value.length; i++) {
                const curValue = value[i];
                if (!values.includes(curValue)) {
                    return `${message}(${name})错误：${curValue}`;
                }
            }
            return null;
        };
    }

    // 校验日期格式
    static formatDate(format: string, opt? : checkOpt | string) {
        return (name: string, value: string) => {
            const { allowEmptyFlag, message } = this.getOptInfo(value, opt);
            if (typeof value === 'undefined' || value === null || value === undefined || value.trim() === '') {
                if (allowEmptyFlag === true) {
                    return null;
                } else if (typeof allowEmptyFlag === 'string') {
                    return allowEmptyFlag;
                }
                return `${message}(${name})不能为空`;
            }
            if (!moment(value, format, true).isValid()) {
                return `${message}(${name})格式错误`;
            }
            // 这里没有真正的解析日期，只是校验格式
            return null;
        };
    }

    static commonCheck(check: Function) {
        return (name: string, value: string) => {
            return check(name, value);
        };
    }

    // 校验数组类型
    static array(itemValidator: Function, message: string) {
        return (_name: string, value: any) => {
            if (!Array.isArray(value)) {
                return `${message}${_name}不能为空`;
            }
            for (const [index, item] of value.entries()) {
                const error = itemValidator(item);
                if (error) {
                    return `第${index + 1}行${message}: ${error}`; // 这里简化处理，只返回第一个错误
                }
            }
            return null;
        };
    }

    // 校验对象类型
    static type(validators: any, messagePrefix = '') {
        return (value: any) => {
            if (typeof value !== 'object' || value === null) {
                return `${messagePrefix}对象不能为空`;
            }
            for (const [key, validator] of Object.entries(validators)) {
                // 校验器必须是一个函数
                if (typeof validator !== 'function') {
                    throw new Error(`Invalid validator for key "${key}". Validator is not a function.`);
                }
                const error = validator(key, value[key], value);
                if (error) {
                    // 可能需要根据错误类型来处理不同的消息，或者在这里进行消息的格式化
                    return error;
                }
            }
            return null;
        };
    }

    // 解码并校验数据
    static decode(data: any, typeValidator: Function) {
        const error = typeValidator(data);
        if (error) {
            return error;
        }
        return null; // 如果没有错误，则返回原始数据（或根据需要进行处理）
    }
}
export function getUpperMoney(num) {
    if (isNaN(num)) {
        return '';
    }
    if (num === 0) {
        return '零圆整';
    }

    const isNegative = num < 0;

    num = Math.abs(num) + '00';
    const intPos = num.indexOf('.');
    if (intPos !== -1) {
        num = num.substring(0, intPos) + num.substring(intPos + 1, intPos + 3);
    }

    let strUnit = '仟佰拾兆仟佰拾亿仟佰拾万仟佰拾圆角分';
    strUnit = strUnit.substring(strUnit.length - num.length);

    const UppercaseChineseNumbers = '零壹贰叁肆伍陆柒捌玖';
    let strOutput = '';
    for (let i = 0; i < num.length; i++) {
        strOutput += UppercaseChineseNumbers[num.substring(i, i + 1)] + strUnit.substring(i, i + 1);
    }
    let result = strOutput
        .replace(/零[仟佰拾角分]/g, '零')
        .replace(/零{2,}/g, '零')
        .replace(/零([兆|亿|万])/g, '$1')
        .replace(/亿万/, '亿')
        .replace(/零圆/, '圆')
        .replace(/^圆/, '')
        .replace(/^零|零$/g, '');
    if (!/分$/.test(result)) {
        result += '整';
    }
    if (isNegative) {
        result = '(负数)' + result;
    }
    return result;
}
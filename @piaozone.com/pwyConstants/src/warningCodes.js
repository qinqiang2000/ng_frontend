const waringCodes = {
    'k1': '', //正常
    'k2': ''  //'疑似使用旧的监制章'
};

function getWaringCodesResult(codeStr='') {
    const codeArr = codeStr.split(',');
    const result = [];
    for (let i = 0; i < codeArr.length; i++) {
        const curCode = codeArr[i];
        const description = waringCodes['k' + curCode] || '';
        if (description) {
            result.push(description);
        }
    }

    return result;
}

module.exports = {
    waringCodes,
    getWaringCodesResult
}
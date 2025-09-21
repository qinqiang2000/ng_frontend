const trainSeatSelectSource = ['二等座', '一等座', '特等座', '商务座', '无座'];
const airSeatSelectSource = [{
    value: 'F',
    text: '头等舱'
}, {
    value: 'C',
    text: '公务舱（商务舱）'
}, {
    value: 'Y',
    text: '普通舱（经济舱）'
}];

const currencySelectSource = [{
    value: 'CNY',
    text: '人民币'
}, {
    value: 'HKD',
    text: '港币'
}, {
    value: 'USD',
    text: '美元'
}];

module.exports = {
    trainSeatSelectSource,
    airSeatSelectSource,
    currencySelectSource
}

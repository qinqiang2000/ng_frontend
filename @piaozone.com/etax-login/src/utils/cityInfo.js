import { CITYS } from '../constants';

export function getCityInfoByTaxNo(taxNo) {
    if (taxNo === '') {
        return false;
    }

    let code = '';

    if (taxNo.length === 18) { // 三证合一税号
        code = taxNo.substr(2, 4);
    } else if (taxNo.length === 15) {
        code = taxNo.substr(0, 4);
    } else {
        return false;
    }

    let cityItem = CITYS.filter(function(item) {
        return item.code === code;
    });

    if (cityItem.length !== 0) {
        return cityItem[0];
    }
    // 查找不到用前两位加上00进行查找
    code = code.substr(0, 2) + '00';
    cityItem = CITYS.filter(function(item) {
        return item.code === code;
    });

    if (cityItem.length !== 0) {
        return cityItem[0];
    } else {
        // 默认返回广东
        return CITYS.find(item => item.city === '广东');
    }
}

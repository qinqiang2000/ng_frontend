import { tools } from '@piaozone.com/utils';
//检测数组中是否存在某个值, 非全等方式
export const isExist = function(arr, fid) {
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        if (fid == arr[i]) {
            return i;
        }
    }
    return -1;
};

export const getSubStr = function(str, n = 10) {
    if (str) {
        if (str.length >= n) {
            return str.substr(0, n) + '...';
        } else {
            return str;
        }
    }
    return '--';
};

export const getDateSplit = function(nd) {
    const year = nd.substr(0, 4);
    const month = nd.substr(4, 2);
    const day = nd.substr(6, 2);
    return year + '-' + month + '-' + day;
};

export const fileSuffix = (url) => { //获取文件后缀名
    const name = url.substring(url.lastIndexOf('.') + 1);
    return name.toLowerCase();
};

const getAreaInfo = (sItem) => {
    let markColor = '#487BFB';
    if (sItem.errorResult.length > 0) {
        markColor = '#EB5D5D';
    } else if (sItem.waringResult.length > 0) {
        markColor = '#FF933D';
    }
    return {
        rotateDeg: sItem.rotationAngle || 0,
        pixel: sItem.pixel || '',
        region: sItem.region || '',
        markColor
    };
};

export const groupList = (data) => {
    const result = [];
    const listSrc = [];
    for (var i = 0; i < data.length; i++) {
        const curData = { ...data[i] }; //防止影响全局数据
        const errInfo = tools.getInvoiceErrInfo(curData);
        curData.waringResult = errInfo.waringResult;
        curData.errorResult = errInfo.errorResult;
        curData.areaInfo = [].concat(getAreaInfo(curData));
        const src = curData.snapshotUrl;
        const index = listSrc.indexOf(src);
        if (index === -1) {
            const temp = [];
            temp.push(curData);
            listSrc.push(src);
            result.push(temp);
        } else {
            result[index].push(curData);
        }
    }
    return result;
};

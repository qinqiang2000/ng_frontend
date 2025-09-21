/* eslint-disable */
// import fs from 'fs';
// import path from 'path';
// import { exec } from 'child_process';
import { transformInvoiceTypeToFpy } from './downloadApplyTool';

export function createJsonpCallback(xStr = 'xxxxxxxxxxxxxxxxxxxx', fixed = '11020') {
    const d = new Date().getTime();
    const r = xStr.replace(/[x]/g, (c) => {
        return (d + Math.random() * 10) % 10 | 0;
    });

    return 'jQuery' + r + '_' + d;
}

export function sleep(time = 1500, taxNo = '') {
    if (taxNo === '911305005809845195') { // 单独对今麦郎税号延时增加，观察被锁情况
        time = 3000;
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}


export function randomSleep(minTime = 2000, maxTime = 3000) {
    return new Promise((resolve, reject) => {
        const time = minTime + Math.random() * (maxTime - minTime);
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export function createFpdkHeader(baseUrl, cookieFlag = 'login', contentType = 'application/x-www-form-urlencoded; charset=UTF-8') {
    return {
        Accept: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
        /* eslint-disable-next-line */
        Referer: baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-\:\.]+\/)(.*)$/, '$1'), // + 'main.230a631a.html?_=3.1.01',  // eslint检测有误
        Host: baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\/.*$/g, ''),
        'Content-Type': contentType,
        Connection: 'Keep-Alive',
        DNT: 1,
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache'
        // 'Cookie': cookieFlag === 'login'?getLoginCookies():getFpdkCookies()
    };
}


export function getUid() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export function getCookieInfo(setCookies = []) {
    const result = {};
    for (let i = 0; i < setCookies.length; i++) {
        const item = setCookies[i];
        const cookieItem = item.split('; ');
        if (cookieItem.length > 1) {
            const cookieInfo = cookieItem[0].split('=');
            const cookieKey = cookieInfo[0];
            if (cookieInfo.length > 1) {
                result[cookieKey] = cookieInfo[1];
            } else {
                result[cookieKey] = '';
            }
        }
    }
    // result.dzdzsl = '20111236';
    return result;
}

export function getInvoiceType(fpdm) {
    const last3Str = fpdm.substr(fpdm.length - 3);
    const last2Str = fpdm.substr(fpdm.length - 2);
    const firstStr = fpdm.substr(0, 1);
    if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
        return 4; // 专票
    }
    if (fpdm.length == 12) {
        if (firstStr == '0' && last2Str == '12') {
            return 15; // 通行费电子发票
        }

        if (firstStr === '0' && last2Str === '17') {
            return 13; // 二手车
        }

        if (firstStr === '0' && (last2Str === '06' || last2Str === '07')) {
            return 5; // 卷式
        }

        if (firstStr === '0' && last2Str === '13') {
            return 2; // 电子专票
        }
    }

    return 12; // 机动车销售发票
}

export function concatInvoices(invoiceArr, invoiceArr2) {
    if (invoiceArr2.length === 0) {
        return invoiceArr;
    }

    const invoiceCodeNos = invoiceArr.map((item) => {
        return item.invoiceCode + item.invoiceNo;
    });

    const filterDats = invoiceArr2.filter((item) => {
        const k = item.invoiceCode + item.invoiceNo;
        return invoiceCodeNos.indexOf(k) === -1;
    });

    return invoiceArr.concat(filterDats);
}

export function computeInvoicesInfo(invoices) {
    let totalMoney = 0.00;
    let taxAmount = 0.00;
    let invoiceAmount = 0.00;
    if (invoices instanceof Array) {
        if (invoices.length === 0) {
            return {
                totalAmount: totalMoney,
                totalTaxAmount: taxAmount,
                invoiceAmount: invoiceAmount,
                invoiceNum: 0
            };
        }
        for (let i = 0; i < invoices.length; i++) {
            taxAmount += parseFloat(invoices[i].taxAmount);
            invoiceAmount += parseFloat(invoices[i].invoiceAmount);
            totalMoney += parseFloat(invoices[i].invoiceAmount) + parseFloat(invoices[i].taxAmount);
        }

        return {
            totalAmount: totalMoney.toFixed(2),
            totalTaxAmount: taxAmount.toFixed(2),
            invoiceAmount: invoiceAmount.toFixed(2),
            invoiceNum: invoices.length
        };

    } else if (typeof invoices === 'object') {
        taxAmount += parseFloat(invoices.taxAmount);
        invoiceAmount += parseFloat(invoices.invoiceAmount);
        totalMoney += parseFloat(invoices.invoiceAmount) + parseFloat(invoices.taxAmount);
        return {
            totalAmount: totalMoney.toFixed(2),
            totalTaxAmount: taxAmount.toFixed(2),
            invoiceAmount: invoiceAmount.toFixed(2),
            invoiceNum: 1
        };
    }
}


export const aoDataDict = {
    /* eslint-disable */
    dkgxquery: (i, defaultPageSize = 100) => JSON.stringify([{"name":"sEcho","value":1},{"name":"iColumns","value":16},{"name":"sColumns","value":",,,,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13},{"name":"mDataProp_14","value":14},{"name":"mDataProp_15","value":15}]),
    dkycckznxfpmx: (i, defaultPageSize = 100) => JSON.stringify([{ name: 'sEcho', value: 1 }, { name: 'iColumns', value: 14 }, { name: 'sColumns', value: ',,,,,,,,,,,,,' }, { name: 'iDisplayStart', value: i }, { name: 'iDisplayLength', value: defaultPageSize }, { name: 'mDataProp_0', value: 0 }, { name: 'mDataProp_1', value: 1 }, { name: 'mDataProp_2', value: 2 }, { name: 'mDataProp_3', value: 3 }, { name: 'mDataProp_4', value: 4 }, { name: 'mDataProp_5', value: 5 }, { name: 'mDataProp_6', value: 6 }, { name: 'mDataProp_7', value: 7 }, { name: 'mDataProp_8', value: 8 }, { name: 'mDataProp_9', value: 9 }, { name: 'mDataProp_10', value: 10 }, { name: 'mDataProp_11', value: 11 }, { name: 'mDataProp_12', value: 12 }, { name: 'mDataProp_13', value: 13 }]),
    dkycfpmx: (i, defaultPageSize = 100) => JSON.stringify([{"name":"sEcho","value":1},{"name":"iColumns","value":16},{"name":"sColumns","value":",,,,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13},{"name":"mDataProp_14","value":14},{"name":"mDataProp_15","value":15}]),
    dkmx: (i, defaultPageSize = 100) => JSON.stringify([{"name":"sEcho","value":1},{"name":"iColumns","value":15},{"name":"sColumns","value":",,,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13},{"name":"mDataProp_14","value":14}]),
    ckznxmx: (i, defaultPageSize = 100) => JSON.stringify([{"name":"sEcho","value":1},{"name":"iColumns","value":15},{"name":"sColumns","value":",,,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13},{"name":"mDataProp_14","value":14}]),
    fpgxQuery: (i, defaultPageSize = 100) => [{ name: 'sEcho', value: 1 }, { name: 'iColumns', value: 14 }, { name: 'sColumns', value: ',,,,,,,,,,,,,' }, { name: 'iDisplayStart', value: i }, { name: 'iDisplayLength', value: defaultPageSize }, { name: 'mDataProp_0', value: 0 }, { name: 'mDataProp_1', value: 1 }, { name: 'mDataProp_2', value: 2 }, { name: 'mDataProp_3', value: 3 }, { name: 'mDataProp_4', value: 4 }, { name: 'mDataProp_5', value: 5 }, { name: 'mDataProp_6', value: 6 }, { name: 'mDataProp_7', value: 7 }, { name: 'mDataProp_8', value: 8 }, { name: 'mDataProp_9', value: 9 }, { name: 'mDataProp_10', value: 10 }, { name: 'mDataProp_11', value: 11 }, { name: 'mDataProp_12', value: 12 }, { name: 'mDataProp_13', value: 13 }]
    /* eslint-disable */
};


export const paramJson = function(data, disableEncode) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) { //非json对象
            return data;
        }
    }

    const result = [];
    for (const item in data) {
        if (data.hasOwnProperty(item)) {
            if (disableEncode) {
                result.push(item + '=' + data[item]);
            } else {
                result.push(item + '=' + encodeURIComponent(data[item]));
            }
        }
    }
    return result.join('&');
};


export function getMinMaxDate(kprqs) {
    let minDateIndex = 0;
    let maxDateIndex = 0;

    for (let i = 1; i < kprqs.length; i++) {
        const curDate = +new Date(kprqs[i]);
        const maxDate = +new Date(kprqs[maxDateIndex]);
        const minDate = +new Date(kprqs[minDateIndex]);

        if (curDate > maxDate) {
            maxDateIndex = i;
        }

        if (curDate < minDate) {
            minDateIndex = i;
        }
    }

    return { min: kprqs[minDateIndex], max: kprqs[maxDateIndex] };
}

// 从勾选结果中比较是否勾选状态是否变化。
// 在target中查询对应的发票，能找到就归类到success，否则在fail中
export function findGxResult(fpdms, fphms, kprqs, target, taxPeriod = '') {
    const len = fpdms.length;
    const rLen = target.length;
    const errorList = [];
    const rightList = [];
    const successInvoices = [];
    for (let i = 0; i < len; i++) {
        let flag = false;
        const fpdm = fpdms[i];
        const fphm = fphms[i];
        const kprq = kprqs[i];
        for (let j = 0; j < rLen; j++) {
            if ((target[j].invoiceCode + target[j].invoiceNo) === (fpdm + fphm)) {
                successInvoices.push({ ...target[j], taxPeriod });
                rightList.push({ fpdm, fphm, kprq, taxPeriod });
                flag = true;
                break;
            }
        }
        if (!flag) {
            errorList.push({ fpdm, fphm, kprq, taxPeriod: '' });
        }
    }

    if (errorList.length === 0) {
        return { errcode: '0000', description: 'success', data: { success: rightList }, successInvoices };
    } else {
        return { errcode: '3004', data: { fail: errorList, success: rightList }, successInvoices, description: '发票勾选保存失败！' };
    }
}

// 筛选缴款书勾选结果
export function findJgxGxResult(jksList, successList, taxPeriod) {
    const errorList = [];
    const rightList = [];
    for (let i = 0; i < jksList.length; i++) {
        let flag = false;
        const item = jksList[i];
        const customDeclarationNo = item.customDeclarationNo;
        for (let j = 0; j < successList.length; j++) {
            if (successList[j].customDeclarationNo === customDeclarationNo) {
                flag = true;
                rightList.push({
                    ...item,
                    selectResult: '1',
                    description: '处理成功',
                    taxPeriod
                });
            }
        }
        if (!flag) {
            errorList.push({
                ...item,
                selectResult: '31',
                description: '数据校验异常',
                taxPeriod: ''
            });
        }
    }
    if (errorList.length === 0) {
        return {
            errcode: '0000',
            description: '处理成功',
            data: {
                taxPeriod,
                success: rightList,
                fail: errorList
            }
        };
    } else if (rightList.length === 0) {
        return {
            errcode: '95000',
            description: '勾选失败',
            data: {
                taxPeriod,
                success: rightList,
                fail: errorList
            }
        };
    }
    return {
        errcode: '90001',
        description: '部分处理成功',
        data: {
            taxPeriod,
            success: rightList,
            fail: errorList
        }
    };
}

export function checkSe(yxses, ses) {
    const yxseArr = yxses.split('=');
    const seArr = ses.split('=');
    for (let i = 0; i < yxseArr.length; i++) {
        const curYxse = parseFloat(yxseArr[i]);
        const curSe = parseFloat(seArr[i]);
        if (isNaN(curYxse) || isNaN(curSe)) {
            return {
                errcode: '3001',
                description: '参数错误，请检查税额和有效税额'
            };
        } else {
            if (curYxse > curSe) {
                return {
                    errcode: '3001',
                    description: '参数错误，有效税额不能大于税额'
                };
            }
        }
    }

    return {
        errcode: '0000'
    };
}

//根据可以勾选的时间范围过滤发票，errList中为不在这个范围的发票，yxses为可选，旧版本不需要yxse进行勾选
export function filterGxInvoices(gxrqfw, fpdms, fphms, kprqs, yxses) {
    const kprqArr = kprqs.split('=');
    const fpdmArr = fpdms.split('=');
    const fphmArr = fphms.split('=');
    let yxseArr;
    if (yxses) {
        yxseArr = yxses.split('=');
    }

    const tempArr = gxrqfw.split('-');
    const minDate = moment(tempArr[0], 'YYYYMMDD').format('X');
    const maxDate = moment(tempArr[1], 'YYYYMMDD').format('X');
    const kprqArr2 = [];
    const fpdmArr2 = [];
    const fphmArr2 = [];
    const yxseArr2 = [];
    const errList = [];
    for (let i = 0; i < kprqArr.length; i++) {
        const curDate = moment(kprqArr[i], 'YYYY-MM-DD').format('X');
        let fpdm = fpdmArr[i];
        let fphm = fphmArr[i];
        if (yxses && yxseArr[i] < 0) { // 包含有效税额不合法直接过滤
            errList.push({
                fpdm: fpdm,
                fphm: fphm,
                kprq: kprqArr[i]
            });
        } else if (curDate >= minDate && curDate <= maxDate) {
            kprqArr2.push(kprqArr[i]);
            fpdmArr2.push(fpdm);
            fphmArr2.push(fphm);
            if (yxses) {
                yxseArr2.push(yxseArr[i]);
            }
        } else {
            errList.push({
                fpdm: fpdm,
                fphm: fphm,
                kprq: kprqArr[i]
            });
        }
    }
    if (yxses) {
        return {
            kprq: kprqArr2.join('='),
            fpdm: fpdmArr2.join('='),
            fphm: fphmArr2.join('='),
            yxse: yxseArr2.join('='),
            errList
        };
    } else {
        return {
            kprq: kprqArr2.join('='),
            fpdm: fpdmArr2.join('='),
            fphm: fphmArr2.join('='),
            errList
        };
    }
}

export function mkdirsSync(dirname) {
    try {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            } else {
                return false;
            }
        }
    } catch (error) {
        return false;
    }
}


export function isEmptry(v) {
    if(typeof v === 'undefined' || v === false || v === null || v === '') {
        return true;
    }
    return false;
}


export function execCmd(cmdStr, next) {
    return new Promise((resolve, reject) => {
        exec(cmdStr, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                console.log(stderr);
                resolve(errcodeInfo.fpyInnerErr);
            } else {
                resolve(errcodeInfo.success);
            }
        });
    });
}

export function getAllFiles(filePath, dirs = [], result = []) {
    return new Promise((resolve) => {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            dirs.push(filePath);
        } else {
            result.push(filePath);
        }

        if (dirs.length === 0) {
            resolve({ errcode: '0000', data: result });
        } else {
            const curDir = dirs[0];
            fs.readdir(curDir, async(err, files) => {
                if (err) {
                    resolve(errcodeInfo.fileNotFound);
                } else {
                    for (let i = 0; i < files.length; i++) {
                        const curSubDir = path.join(curDir, files[i]);
                        const stat = fs.statSync(curSubDir);
                        if (stat.isDirectory()) {
                            dirs.push(curSubDir);
                        } else {
                            result.push(curSubDir);
                        }
                    }

                    dirs.splice(0, 1);

                    if (dirs.length > 0) {
                        const first = dirs.splice(0, 1);
                        resolve(await getAllFiles(first[0], dirs, result));
                    } else {
                        resolve({ errcode: '0000', data: result });
                    }
                }
            });
        }
    });
}

export function removeFileAndRemoveEmptyDir(filePath, maxParentDir) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        fs.readdir(filePath, (err, files) => {
            if (err) {
                console.log(err);
            } else {
                if (files.length === 0) {
                    if (path.resolve(filePath) !== path.resolve(maxParentDir)) {
                        fs.rmdirSync(filePath);
                    }

                    const nextDir = path.dirname(filePath);
                    if (path.resolve(nextDir) !== path.resolve(maxParentDir)) {
                        removeFileAndRemoveEmptyDir(nextDir, maxParentDir);
                    }
                }
            }
        });
    } else {
        fs.unlinkSync(filePath);
        const pDir = path.dirname(filePath);
        fs.readdir(pDir, (err, files) => {
            if (err) {
                console.log(err);
            } else {
                if (files.length === 0) {
                    if (path.resolve(pDir) !== path.resolve(maxParentDir)) {
                        fs.rmdirSync(pDir);
                    }

                    const nextDir = path.dirname(pDir);
                    if (path.resolve(nextDir) !== path.resolve(maxParentDir)) {
                        removeFileAndRemoveEmptyDir(nextDir, maxParentDir);
                    }
                }
            }
        });
    }
}

export function trim(s = '') {
    return s.replace(/^\s+/g, '').replace(/\s+$/g, '');
}


export const blockchain_filter = function(fpInfo) { //区块链电子发票区分
    let flag = false;
    const { invoiceCode, invoiceNo } = fpInfo;
    if (invoiceCode && invoiceNo) {
        if (invoiceCode.length == 12 && invoiceNo.length == 8) {
            const str5 = invoiceCode.substr(0, 5);
            const str9 = invoiceCode.substr(8, 1);
            if (str5 == '14403' && str9 == '9') {
                flag = true;
            }
        }
    }

    return flag;
};


//根据发票代码判断专票或普票
export const checkInvoiceType = function(fpdm, fphm) {
    const isBlockchain = blockchain_filter({ invoiceCode: fpdm, invoiceNo: fphm });
    if (isBlockchain) {
        return 11; //区块链发票
    }

    const last3Str = fpdm.substr(fpdm.length - 3);
    const last2Str = fpdm.substr(fpdm.length - 2);
    const firstStr = fpdm.substr(0, 1);
    if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
	    return 4; //专票
    } else {
        if (fpdm.length == 12) {
            if (firstStr == '0' && last2Str == '12') {
                return 15; //通行费
            }
            if (firstStr == '0' && last2Str == '06') {
                return 5; //卷式
            }
            if (firstStr == '0' && last2Str == '07') {
                return 5; //卷式
            }
        }
    }
    return 3;
};

export const createRangeNumArr = function(start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
};

export const removeRangeNum = function(arr, start, end) {
    return arr.filter((num) => {
        if (num >= start && num <= end) {
            return false;
        }
        return true;
    });
}

export const splitRangeNum = function(rangeNumArr) {
    const arr = [[rangeNumArr[0]]];
    let arrIndex = 0;
    for (let i = 1; i< rangeNumArr.length; i++) {
        if (rangeNumArr[i] === arr[arrIndex][arr[arrIndex].length - 1] + 1) {
            arr[arrIndex].push(rangeNumArr[i]);
        } else {
            arrIndex += 1;
            arr[arrIndex] = [rangeNumArr[i]];
        }
    }
    return arr;
}

// 获取统计表信息
export const getTjbInfo = function(tjStr) {
    const rows = tjStr.split(';');
    const result = [];
    let totalInfo = {};
    for (let i = 0; i < rows.length; i++) {
        const items = rows[i].split('=');
        if (items.length >= 7 ) {
            const govInvoiceType = items[0];
            if (govInvoiceType !== '99') {
                let invoiceType = transformInvoiceTypeToFpy(govInvoiceType);
                if (govInvoiceType === '14') {
                    invoiceType = 15;
                }

                if (invoiceType !== -1) {
                    result.push({
                        invoiceType,
                        copies: items[1],
                        invoiceAmount: items[2],
                        taxAmount: items[3],
                        unDeductCopies: items[4],
                        unDeductInvoiceAmount: items[5],
                        unDeductTaxAmount: items[6]
                    });
                }
            } else {
                totalInfo = {
                    copies: items[1],
                    invoiceAmount: items[2],
                    taxAmount: items[3],
                    unDeductCopies: items[4],
                    unDeductInvoiceAmount: items[5],
                    unDeductTaxAmount: items[6]
                }
            }
            // 目前发票云还不支持的类型，后续加上
            // if (govInvoiceType === '17') { // 海关缴款书
            //     invoiceType = 17;
            // } else if (govInvoiceType === '24') { // 出口转内销发票
            //     invoiceType = 24;
            // } else if(govInvoiceType === '30') { // 出口转内销海关缴款书
            //     invoiceType = 30;
            // }
        }
    }

    return {
        list: result,
        totalInfo
    }
}

export function getRequestBodyData(ctx) {
    return new Promise((resolve) => {
        const bufs = [];
        ctx.req.on('data', (chunk) => {
            bufs.push(chunk);
        });
        ctx.req.on('end', () => {
            const result = Buffer.concat(bufs).toString('utf8');
            resolve(result);
        });
        ctx.req.on('error', () => {
            resolve('');
        });
    })
}


export function createStaticHeader(type, len) {
    const dStr = new Date().toString().split('+')[0];
    let contentType = 'application/javascript';
    // let contentType = 'text/javascript;charset=gbk';
    if (type === 'stylesheet') {
        contentType = 'text/css';
    } else if (type === 'document') {
        contentType = 'text/html';
    }

    const jsHeaders = {
        server: 'gwwebs',
        date: dStr,
        'content-type': contentType,
        'content-length': '"' + len + '"',
        'last-modified': 'Sun, 26 Apr 2020 01:05:00 GMT',
        connection: 'close',
        vary: 'Accept-Encoding',
        expires: 'Thu, 04 Jun 2020 07:20:44 GMT',
        'cache-control': 'max-age=2592000',
        'accept-ranges': 'bytes'
    };
    return jsHeaders;
}

export function createLocalHeader(data) {
    const len = Buffer.from(data).length;
    const localHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Methods': 'POST',
        Connection: 'keep-alive',
        'Content-Length': '"' + len + '"',
        'Content-Type': 'application/json;charset=UTF-8',
        Server: 'CHINATAX_CRYPT/1.0'
    };
    return localHeaders;
}

export function urlSearch(url=''){
    if (url.indexOf('?') === -1) {
        return {};
    }
    let search = url.split('?')[1];
    search = search.replace(/^\?/, '');
    const urlParams = {};
    const urlParamArr = search.split('&');
    for(let i=0,len = urlParamArr.length; i<len;i++){
        const param = urlParamArr[i].split('=');
        let tempValue = '';
        if(param.length > 1){
            tempValue = decodeURIComponent(param[1]);
        }
        urlParams[param[0]] = tempValue;
    }
    return urlParams;
}


export function fixeNumber(v) {
    let nv = v + '';
    if (/^\..*$/.test(v)) {
        return '0' + nv;
    }
    return nv;
}
import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { login, forwardUrl, getGxPublicKey, clearGovCookie } from './loginToGov';
import { kdRequest, paramJson, cookieHelp } from '@piaozone.com/utils';
import { createJsonpCallback, sleep, createFpdkHeader } from './tools';

var setCookie = cookieHelp.setCookie,
    getCookie = cookieHelp.getCookie,
    clearCookie = cookieHelp.clearCookie;


var defaultPageSize = 100;

var getInvoiceType = function getInvoiceType(fpdm) {
    var last3Str = fpdm.substr(fpdm.length - 3);
    var last2Str = fpdm.substr(fpdm.length - 2);
    var firstStr = fpdm.substr(0, 1);
    if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
        return 4;
    } else {
        if (fpdm.length == 12) {
            if (firstStr == '0' && last2Str == '12') {
                return 15;
            }
        }
    }
    return 12;
};

function transformData(allData, rzzt) {
    var tax_period = '';
    if (rzzt == '1') {
        var skssq = getCookie('skssq');
        skssq = decodeURIComponent(skssq);
        tax_period = skssq.split(';')[0];
    }

    return {

        'invoiceCode': allData[1],
        'invoiceType': getInvoiceType(allData[1]),
        'invoiceNo': allData[2],
        'invoiceDate': allData[3],
        'salerName': allData[4],
        'invoiceAmount': allData[5],
        'taxAmount': allData[6],
        'invoiceStatus': allData[7],
        'checkFlag': allData[8],
        'selectTime': allData[9] || '',
        'checkAuthenticateFlag': allData[10] || '',
        'selectAuthenticateTime': allData[11] || '',
        'scanAuthenticateFlag': allData[12] || '',
        'scanAuthenticateTime': allData[13] || '',
        'salerTaxNo': allData[14],
        'taxPeriod': tax_period
    };
}

function transRzformData(allData, rzyf) {
    return {
        'invoiceCode': allData[1],
        'invoiceType': getInvoiceType(allData[1]),
        'invoiceNo': allData[2],
        'invoiceDate': allData[3],
        'salerName': allData[4],
        'invoiceAmount': allData[5],
        'taxAmount': allData[6],
        'invoiceStatus': allData[10] === '正常' ? '0' : '0',
        'checkFlag': '0',
        'selectTime': '',
        'checkAuthenticateFlag': allData[7] === '勾选认证' ? '1' : '0',
        'selectAuthenticateTime': allData[7] === '勾选认证' ? allData[8] : '',
        'scanAuthenticateFlag': allData[7] === '扫描认证' ? '1' : '0',
        'scanAuthenticateTime': allData[7] === '扫描认证' ? allData[8] : '',
        'salerTaxNo': allData[11],
        'taxPeriod': rzyf
    };
}

function transOldRzformData(allData) {
    return {
        'invoiceCode': allData[1],
        'invoiceType': getInvoiceType(allData[1]),
        'invoiceNo': allData[2],
        'invoiceDate': allData[3],
        'salerName': allData[4],
        'invoiceAmount': allData[5],
        'taxAmount': allData[6],
        'invoiceStatus': allData[7] == '0' ? '0' : '0',
        'checkFlag': '0',
        'selectTime': '',
        'checkAuthenticateFlag': '0',
        'selectAuthenticateTime': '',
        'scanAuthenticateFlag': '0',
        'scanAuthenticateTime': '',
        'salerTaxNo': allData[8] || '' };
}

function concatInvoices(invoiceArr, invoiceArr2) {
    var invoiceCodeNos = invoiceArr.map(function (item) {
        return item.invoiceCode + item.invoiceNo;
    });

    var filterDats = invoiceArr2.filter(function (item) {
        var k = item.invoiceCode + item.invoiceNo;
        return invoiceCodeNos.indexOf(k) === -1;
    });

    return invoiceArr.concat(filterDats);
}

function computeInvoicesInfo(invoices) {
    var totalMoney = 0.00;
    var taxAmount = 0.00;
    var invoiceAmount = 0.00;

    for (var i = 0; i < invoices.length; i++) {
        taxAmount += parseFloat(invoices[i].taxAmount);
        invoiceAmount += parseFloat(invoices[i].invoiceAmount);
        totalMoney += parseFloat(invoices[i].invoiceAmount) + parseFloat(invoices[i].taxAmount);
    }

    return { totalAmount: totalMoney.toFixed(2), totalTaxAmount: taxAmount.toFixed(2), invoiceAmount: invoiceAmount.toFixed(2) };
}

export var fpgxQuery = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(_ref2) {
        var baseUrl = _ref2.baseUrl,
            _ref2$stepHandler = _ref2.stepHandler,
            stepHandler = _ref2$stepHandler === undefined ? function (f) {
            return f;
        } : _ref2$stepHandler,
            _ref2$dataIndex = _ref2.dataIndex,
            dataIndex = _ref2$dataIndex === undefined ? '' : _ref2$dataIndex,
            searchOpt = _ref2.searchOpt,
            _ref2$retry = _ref2.retry,
            retry = _ref2$retry === undefined ? 0 : _ref2$retry;
        var ymbb, govToken, currentPage, pageSize, cert, curIndex, goOn, totalMoney, result, invoices, paramTemp, publicKeyRes, publickey, ts, searchParam, resCollect, jsonData, key1, key2, newToken, key4, invoiceData, invoiceDataLen, datas, i, item, totalNum;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ymbb = getCookie('ymbb');
                        govToken = getCookie('govToken');

                        if (govToken) {
                            _context.next = 4;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '7009', description: 'CA认证失效，请重新CA登录！' });

                    case 4:
                        currentPage = searchOpt.currentPage || 0;
                        pageSize = searchOpt.pageSize || defaultPageSize;
                        cert = searchOpt.cert;
                        curIndex = dataIndex || 0;
                        goOn = dataIndex === '' ? true : false;
                        totalMoney = 0.00;
                        result = { errcode: '0000', data: [] };
                        invoices = [];
                        paramTemp = {
                            'callback': createJsonpCallback(),
                            'fphm': searchOpt.fphm || '',
                            'fpdm': searchOpt.fpdm || '',
                            'rq_q': searchOpt['rq_q'],
                            'rq_z': searchOpt['rq_z'],
                            'xfsbh': searchOpt['xfsbh'] || '',
                            'fpzt': searchOpt['fpzt'] || '-1',
                            'fplx': searchOpt['fplx'] || '-1',
                            'rzzt': searchOpt['rzzt'] || '0' };


                        if (paramTemp.rzzt === '0') {
                            paramTemp.gxzt = searchOpt.gxzt || '-1';
                            paramTemp.rzfs = '';
                        } else if (paramTemp.rzzt === '1') {
                            paramTemp.gxzt = '';
                            paramTemp.rzfs = searchOpt['rzfs'] || '-1';
                        }

                        _context.next = 16;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: cert,
                            funType: '06'
                        });

                    case 16:
                        publicKeyRes = _context.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context.next = 19;
                            break;
                        }

                        return _context.abrupt('return', publicKeyRes);

                    case 19:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;


                        paramTemp.publickey = publickey;
                        paramTemp.ts = ts;

                    case 22:
                        searchParam = paramJson(paramTemp) + '&cert=' + cert + '&token=' + govToken + '&aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A14%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A' + (dataIndex !== '' ? dataIndex : currentPage * defaultPageSize) + '%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A' + pageSize + '%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A3%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A4%7D%2C%7B%22name%22%3A%22mDataProp_5%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22mDataProp_6%22%2C%22value%22%3A6%7D%2C%7B%22name%22%3A%22mDataProp_7%22%2C%22value%22%3A7%7D%2C%7B%22name%22%3A%22mDataProp_8%22%2C%22value%22%3A8%7D%2C%7B%22name%22%3A%22mDataProp_9%22%2C%22value%22%3A9%7D%2C%7B%22name%22%3A%22mDataProp_10%22%2C%22value%22%3A10%7D%2C%7B%22name%22%3A%22mDataProp_11%22%2C%22value%22%3A11%7D%2C%7B%22name%22%3A%22mDataProp_12%22%2C%22value%22%3A12%7D%2C%7B%22name%22%3A%22mDataProp_13%22%2C%22value%22%3A13%7D%5D&ymbb=' + ymbb;
                        _context.next = 25;
                        return sleep();

                    case 25:
                        _context.next = 27;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'gxcx.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 27:
                        resCollect = _context.sent;


                        if (resCollect.errcode === '0000' && resCollect.data) {
                            jsonData = resCollect.data;
                            key1 = jsonData.key1;

                            if (key1 === "00") {
                                goOn = false;
                                result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                            } else if (key1 === "01") {
                                key2 = jsonData.key2;
                                newToken = jsonData.key3;

                                setCookie('govToken', newToken);
                                govToken = newToken;
                                key4 = jsonData.key4;

                                if (key2 !== "") {
                                    invoiceData = key2.aaData;
                                    invoiceDataLen = invoiceData.length;

                                    if (invoiceDataLen > 0) {
                                        datas = [];

                                        for (i = 0; i < invoiceDataLen; i++) {
                                            item = transformData(invoiceData[i], searchOpt['rzzt']);

                                            datas.push(item);
                                            totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                        }

                                        stepHandler({ errcode: '0000', data: datas, searchOpt: searchOpt, dataIndex: curIndex, dataFrom: 'fpgxQuery' });
                                        invoices = invoices.concat(datas);
                                        curIndex += invoiceDataLen;
                                    }
                                    totalNum = key2.iTotalRecords;


                                    if (totalNum > 0) {
                                        if (curIndex >= totalNum) {
                                            goOn = false;
                                        } else {
                                            currentPage += 1;
                                        }
                                    } else {
                                        goOn = false;
                                        result = { 'copies': 0, 'errcode': '0000', totalMoney: totalMoney, 'description': '暂时没有可收取的发票', data: invoices };
                                    }
                                }
                            } else if (key1 === '09') {
                                retry = 4;
                                goOn = false;
                                clearGovCookie();
                                result = { 'errcode': '7009', 'description': 'CA认证失效，请重新登录税控！' };
                            } else if (key1 === '888') {
                                goOn = false;
                                retry = 4;
                                clearGovCookie();
                                result = { 'errcode': '888', 'description': '操作频繁，请稍后再试！' };
                            } else {
                                goOn = false;
                                result = { 'errcode': '8000', 'description': '税局收票出现异常' };
                            }
                        } else {
                            goOn = false;
                            result = { 'errcode': '8000', 'description': '税局收票出现异常' };
                        }

                    case 29:
                        if (goOn) {
                            _context.next = 22;
                            break;
                        }

                    case 30:
                        if (!(result.errcode === '0000')) {
                            _context.next = 34;
                            break;
                        }

                        return _context.abrupt('return', {
                            'errcode': '0000',
                            'data': invoices,
                            'description': 'success',
                            'totalMoney': totalMoney.toFixed(2),
                            'copies': invoices.length,
                            'startDate': searchOpt['rq_q'],
                            'endDate': searchOpt['rq_z']
                        });

                    case 34:
                        if (!(retry > 3)) {
                            _context.next = 39;
                            break;
                        }

                        stepHandler({ 'errcode': result.errcode, data: [], description: result.description, searchOpt: searchOpt, dataIndex: curIndex, dataFrom: 'fpgxQuery' });
                        return _context.abrupt('return', result);

                    case 39:
                        _context.next = 41;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler }, retry + 1);

                    case 41:
                        return _context.abrupt('return', _context.sent);

                    case 42:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function fpgxQuery(_x) {
        return _ref.apply(this, arguments);
    };
}();

export var wdqInvoiceQuery = function () {
    var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(_ref4) {
        var baseUrl = _ref4.baseUrl,
            searchOpt = _ref4.searchOpt,
            _ref4$dataIndex = _ref4.dataIndex,
            dataIndex = _ref4$dataIndex === undefined ? '' : _ref4$dataIndex,
            _ref4$stepHandler = _ref4.stepHandler,
            stepHandler = _ref4$stepHandler === undefined ? function (f) {
            return f;
        } : _ref4$stepHandler;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var govToken, ymbb, cert, result, invoices, totalMoney, curIndex, totalNum, stopFlag, resKey, ts, publickey, paramStr, searchParam, resCollect, jsonData, key1, newToken, invoiceData, invoiceDataLen, datas, i, item;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        govToken = getCookie('govToken');

                        if (govToken) {
                            _context2.next = 3;
                            break;
                        }

                        return _context2.abrupt('return', { errcode: '7009', description: 'CA认证失效，请重新CA登录！' });

                    case 3:
                        ymbb = getCookie('ymbb');
                        cert = searchOpt.cert;
                        result = { errcode: '0000', data: [] };
                        invoices = [];
                        totalMoney = 0.00;
                        curIndex = dataIndex || 0;
                        totalNum = 0;
                        stopFlag = dataIndex === '' ? false : true;
                        _context2.next = 13;
                        return getGxPublicKey({ govToken: govToken, baseUrl: baseUrl, taxNo: cert, funType: '06' });

                    case 13:
                        resKey = _context2.sent;
                        ts = resKey.ts, publickey = resKey.publickey;
                        paramStr = paramJson({
                            callback: createJsonpCallback(),
                            kprq_q: searchOpt['rq_q'],
                            kprq_z: searchOpt['rq_z'],
                            fphm: searchOpt['fpdm'] || '',
                            fpdm: searchOpt['fphm'] || '',
                            cxfw: 1,
                            cert: cert,
                            token: govToken,
                            ymbb: ymbb,
                            ts: ts,
                            publickey: publickey
                        });

                    case 16:
                        searchParam = paramStr + '&aoData=' + encodeURIComponent('[{\"name\":\"sEcho\",\"value\":1},{\"name\":\"iColumns\",\"value\":8},{\"name\":\"sColumns\",\"value\":\",,,,,,,\"},{\"name\":\"iDisplayStart\",\"value\":' + curIndex + '},{\"name\":\"iDisplayLength\",\"value\": 100},{\"name\":\"mDataProp_0\",\"value\":0},{\"name\":\"mDataProp_1\",\"value\":1},{\"name\":\"mDataProp_2\",\"value\":2},{\"name\":\"mDataProp_3\",\"value\":3},{\"name\":\"mDataProp_4\",\"value\":4},{\"name\":\"mDataProp_5\",\"value\":5},{\"name\":\"mDataProp_6\",\"value\":6},{\"name\":\"mDataProp_7\",\"value\":7}]');
                        _context2.next = 19;
                        return sleep();

                    case 19:
                        _context2.next = 21;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'fpcx.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 21:
                        resCollect = _context2.sent;

                        if (!(resCollect.errcode === '0000')) {
                            _context2.next = 56;
                            break;
                        }

                        jsonData = resCollect.data;
                        key1 = jsonData.key1;

                        if (!(key1 === "00")) {
                            _context2.next = 30;
                            break;
                        }

                        stopFlag = true;
                        result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                        _context2.next = 54;
                        break;

                    case 30:
                        if (!(key1 === '01')) {
                            _context2.next = 40;
                            break;
                        }

                        newToken = jsonData.key3;

                        setCookie('govToken', newToken);
                        govToken = newToken;
                        invoiceData = jsonData.key2.aaData;
                        invoiceDataLen = invoiceData.length;


                        if (invoiceDataLen > 0) {
                            datas = [];

                            for (i = 0; i < invoiceDataLen; i++) {
                                item = transOldRzformData(invoiceData[i]);

                                datas.push(item);
                                totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                            }

                            stepHandler({ errcode: '0000', data: datas, searchOpt: searchOpt, dataIndex: curIndex, dataFrom: 'wdqInvoiceQuery' });
                            invoices = invoices.concat(datas);
                            curIndex += invoiceDataLen;
                        }
                        totalNum = jsonData.key2.iTotalRecords;
                        _context2.next = 54;
                        break;

                    case 40:
                        if (!(key1 === '09')) {
                            _context2.next = 48;
                            break;
                        }

                        stopFlag = true;
                        retry = 4;
                        clearGovCookie();
                        result = { 'errcode': '7009', 'description': 'CA认证失效，请重新登录税控！' };
                        return _context2.abrupt('break', 59);

                    case 48:
                        if (!(key1 === '888')) {
                            _context2.next = 54;
                            break;
                        }

                        stopFlag = true;
                        retry = 4;
                        clearGovCookie();
                        result = { 'errcode': '888', 'description': '操作频繁，请稍后再试！' };
                        return _context2.abrupt('break', 59);

                    case 54:
                        _context2.next = 58;
                        break;

                    case 56:
                        stopFlag = true;
                        result = { 'errcode': resCollect.errcode, 'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00 };

                    case 58:
                        if (curIndex < totalNum && !stopFlag) {
                            _context2.next = 16;
                            break;
                        }

                    case 59:
                        if (!(result.errcode === '0000')) {
                            _context2.next = 63;
                            break;
                        }

                        return _context2.abrupt('return', { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length });

                    case 63:
                        if (!(retry > 3)) {
                            _context2.next = 68;
                            break;
                        }

                        stepHandler({ 'errcode': result.errcode, data: [], description: result.description, searchOpt: searchOpt, dataIndex: curIndex, dataFrom: 'wdqInvoiceQuery' });
                        return _context2.abrupt('return', result);

                    case 68:
                        _context2.next = 70;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler }, retry + 1);

                    case 70:
                        return _context2.abrupt('return', _context2.sent);

                    case 71:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function wdqInvoiceQuery(_x2) {
        return _ref3.apply(this, arguments);
    };
}();

export var dktjQuery = function () {
    var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(_ref6) {
        var baseUrl = _ref6.baseUrl,
            searchOpt = _ref6.searchOpt,
            _ref6$dataIndex = _ref6.dataIndex,
            dataIndex = _ref6$dataIndex === undefined ? '' : _ref6$dataIndex,
            _ref6$stepHandler = _ref6.stepHandler,
            stepHandler = _ref6$stepHandler === undefined ? function (f) {
            return f;
        } : _ref6$stepHandler;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var govToken, ymbb, cert, publicKeyRes, publickey, ts, result, invoices, totalMoney, curIndex, totalNum, curYear, curMonthInt, nextYear, nextMonthInt, maxYear, maxMonthInt, tempDateArr, curMonth, currentDate, limitMaxYear, limitMaxMonth, tjyf, stopFlag, nextMonth, searchParam, resCollect, jsonData, key1, newToken, invoiceData, invoiceDataLen, datas, i, item, rq_q;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        govToken = getCookie('govToken');

                        if (govToken) {
                            _context3.next = 3;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '7009', description: 'CA认证失效，请重新CA登录！' });

                    case 3:
                        ymbb = getCookie('ymbb');
                        cert = searchOpt.cert;
                        _context3.next = 7;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: cert,
                            funType: '06'
                        });

                    case 7:
                        publicKeyRes = _context3.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context3.next = 10;
                            break;
                        }

                        return _context3.abrupt('return', publicKeyRes);

                    case 10:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;
                        result = { errcode: '0000', data: [] };
                        invoices = [];
                        totalMoney = 0.00;
                        curIndex = dataIndex || 0;
                        totalNum = 0;
                        curYear = '';
                        curMonthInt = '';
                        nextYear = '';
                        nextMonthInt = '';
                        maxYear = '';
                        maxMonthInt = '';
                        tempDateArr = [];


                        tempDateArr = searchOpt['rq_q'].split('-');
                        curYear = parseInt(tempDateArr[0]);
                        curMonth = tempDateArr[1];

                        curMonthInt = parseInt(curMonth);

                        tempDateArr = searchOpt['rq_z'].split('-');

                        currentDate = new Date();

                        maxYear = currentDate.getFullYear();

                        maxMonthInt = currentDate.getMonth() + 1;

                        limitMaxYear = maxYear;
                        limitMaxMonth = maxMonthInt;


                        if (tempDateArr[0] && tempDateArr[1]) {
                            limitMaxYear = parseInt(tempDateArr[0]);
                            limitMaxMonth = parseInt(tempDateArr[1]);
                        }

                        tjyf = '';
                        stopFlag = dataIndex === '' ? false : true;

                    case 36:
                        curIndex = dataIndex || 0;
                        nextYear = curMonthInt > 11 ? curYear + 1 : curYear;
                        nextMonthInt = curMonthInt > 11 ? 1 : curMonthInt + 1;
                        nextMonth = nextMonthInt > 9 ? nextMonthInt : '0' + nextMonthInt;


                        tjyf = curYear + '' + curMonth;

                    case 41:
                        searchParam = 'cert=' + cert;

                        searchParam += '&callback=' + createJsonpCallback(), searchParam += '&token=' + govToken;
                        searchParam += '&tjyf=' + tjyf;
                        searchParam += '&oper=cx&fpdm=&fphm=&xfsbh=&qrrzrq_q=&qrrzrq_z=&fply=0';
                        searchParam += '&ymbb=' + ymbb;
                        searchParam += '&publickey=' + publickey;
                        searchParam += '&ts=' + ts;

                        searchParam += '&aoData=' + encodeURIComponent('[{\"name\":\"sEcho\",\"value\":1},{\"name\":\"iColumns\",\"value\":11},{\"name\":\"sColumns\",\"value\":\",,,,,,,,,,\"},{\"name\":\"iDisplayStart\",\"value\":' + curIndex + '},{\"name\":\"iDisplayLength\",\"value\":100},{\"name\":\"mDataProp_0\",\"value\":0},{\"name\":\"mDataProp_1\",\"value\":1},{\"name\":\"mDataProp_2\",\"value\":2},{\"name\":\"mDataProp_3\",\"value\":3},{\"name\":\"mDataProp_4\",\"value\":4},{\"name\":\"mDataProp_5\",\"value\":5},{\"name\":\"mDataProp_6\",\"value\":6},{\"name\":\"mDataProp_7\",\"value\":7},{\"name\":\"mDataProp_8\",\"value\":8},{\"name\":\"mDataProp_9\",\"value\":9},{\"name\":\"mDataProp_10\",\"value\":10}]');

                        _context3.next = 51;
                        return sleep();

                    case 51:
                        _context3.next = 53;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'dktj.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 53:
                        resCollect = _context3.sent;


                        if (resCollect.errcode === '0000') {
                            jsonData = resCollect.data;
                            key1 = jsonData.key1;

                            if (key1 === "00") {
                                result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                            } else if (key1 === '01') {
                                newToken = jsonData.key3;

                                setCookie('govToken', newToken);
                                govToken = newToken;
                                invoiceData = jsonData.key2.aaData;
                                invoiceDataLen = invoiceData.length;


                                if (invoiceDataLen > 0) {
                                    datas = [];

                                    for (i = 0; i < invoiceDataLen; i++) {
                                        item = transRzformData(invoiceData[i], tjyf);

                                        datas.push(item);
                                        totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                    }

                                    stepHandler({ 'errcode': '0000', data: datas, dataIndex: curIndex, dataFrom: 'dktjQuery', searchOpt: _extends({}, searchOpt, { rq_q: curYear + '-' + curMonth + '-01' }) });

                                    invoices = invoices.concat(datas);

                                    curIndex += invoiceDataLen;
                                }

                                totalNum = jsonData.key2.iTotalRecords;
                            } else if (key1 === '09') {
                                retry = 4;
                                stopFlag = true;
                                clearGovCookie();
                                result = { 'errcode': '888', 'description': 'CA认证失效，请重新CA登录！' };
                            } else if (key1 === '888') {
                                retry = 4;
                                stopFlag = true;
                                clearGovCookie();
                                result = { 'errcode': '888', 'description': '操作频繁，请稍后再试！' };
                            }
                        } else {
                            result = { 'errcode': resCollect.errcode, 'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00 };
                        }

                    case 55:
                        if (curIndex < totalNum && !stopFlag) {
                            _context3.next = 41;
                            break;
                        }

                    case 56:

                        curYear = nextYear;
                        curMonth = nextMonth;
                        curMonthInt = nextMonthInt;

                    case 59:
                        if (!stopFlag && (nextYear < limitMaxYear || nextYear == limitMaxYear && nextMonthInt <= limitMaxMonth)) {
                            _context3.next = 36;
                            break;
                        }

                    case 60:
                        if (!(result.errcode === '0000')) {
                            _context3.next = 64;
                            break;
                        }

                        return _context3.abrupt('return', { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length });

                    case 64:
                        if (!(retry > 3)) {
                            _context3.next = 70;
                            break;
                        }

                        rq_q = dataIndex === '' ? searchOpt.rq_q : tjyf.substr(0, 4) + '-' + tjyf.substr(4, 2) + '-01';

                        stepHandler({ 'errcode': result.errcode, data: [], description: result.description, dataIndex: curIndex, dataFrom: 'dktjQuery', searchOpt: _extends({}, searchOpt, { rq_q: rq_q }) });
                        return _context3.abrupt('return', result);

                    case 70:
                        _context3.next = 72;
                        return dktjQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler }, retry + 1);

                    case 72:
                        return _context3.abrupt('return', _context3.sent);

                    case 73:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function dktjQuery(_x4) {
        return _ref5.apply(this, arguments);
    };
}();

export var queryFpgx = function () {
    var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(_ref8) {
        var _ref8$passwd = _ref8.passwd,
            passwd = _ref8$passwd === undefined ? '' : _ref8$passwd,
            _ref8$ptPasswd = _ref8.ptPasswd,
            ptPasswd = _ref8$ptPasswd === undefined ? '' : _ref8$ptPasswd,
            searchOpt = _ref8.searchOpt,
            _ref8$stepHandler = _ref8.stepHandler,
            stepHandler = _ref8$stepHandler === undefined ? function (f) {
            return f;
        } : _ref8$stepHandler;
        var res, invoices, copies, totalMoney, baseUrl, colRes1;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (!(passwd === '')) {
                            _context4.next = 2;
                            break;
                        }

                        return _context4.abrupt('return', { errcode: '3000', description: 'CA密码不能为空！' });

                    case 2:
                        _context4.next = 4;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 4:
                        res = _context4.sent;
                        invoices = [];
                        copies = 0;
                        totalMoney = 0.00;

                        if (!(res.errcode === '0000')) {
                            _context4.next = 24;
                            break;
                        }

                        baseUrl = res.data.baseUrl;

                        searchOpt.cert = res.data.taxNo;
                        colRes1 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        _context4.next = 14;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler });

                    case 14:
                        colRes1 = _context4.sent;

                        if (colRes1.errcode === '0000' && colRes1.data.length > 0) {
                            invoices = colRes1.data;
                            copies = colRes1.data.length;
                            totalMoney = parseFloat(colRes1.totalMoney);
                        }

                        totalMoney = totalMoney.toFixed(2);

                        if (!(colRes1.errcode !== '0000')) {
                            _context4.next = 21;
                            break;
                        }

                        return _context4.abrupt('return', colRes1);

                    case 21:
                        return _context4.abrupt('return', {
                            errcode: '0000',
                            data: invoices,
                            copies: copies,
                            totalMoney: totalMoney
                        });

                    case 22:
                        _context4.next = 25;
                        break;

                    case 24:
                        return _context4.abrupt('return', res);

                    case 25:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function queryFpgx(_x6) {
        return _ref7.apply(this, arguments);
    };
}();

export var query = function () {
    var _ref9 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(_ref10) {
        var _ref10$passwd = _ref10.passwd,
            passwd = _ref10$passwd === undefined ? '' : _ref10$passwd,
            _ref10$ptPasswd = _ref10.ptPasswd,
            ptPasswd = _ref10$ptPasswd === undefined ? '' : _ref10$ptPasswd,
            searchOpt = _ref10.searchOpt,
            dataIndex = _ref10.dataIndex,
            _ref10$dataFrom = _ref10.dataFrom,
            dataFrom = _ref10$dataFrom === undefined ? '' : _ref10$dataFrom,
            stepFinish = _ref10.stepFinish;
        var res, stepHandler, invoices, ymbb, baseUrl, colRes1, colRes2, colRes3, colRes4, rzzt, totalInfo;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if (!(passwd === '')) {
                            _context5.next = 2;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '3000', description: 'CA密码不能为空！' });

                    case 2:
                        _context5.next = 4;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 4:
                        res = _context5.sent;

                        stepHandler = function stepHandler(d) {
                            if (typeof stepFinish === 'function') {
                                try {
                                    stepFinish(d);
                                } catch (error) {
                                    console.warn(error);
                                }
                            }
                        };

                        invoices = [];

                        if (!(res.errcode === '0000')) {
                            _context5.next = 107;
                            break;
                        }

                        ymbb = getCookie('ymbb');
                        baseUrl = res.data.baseUrl;

                        searchOpt.cert = res.data.taxNo;
                        colRes1 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes2 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes3 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes4 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        rzzt = searchOpt.rzzt || '';

                        if (!(rzzt === '')) {
                            _context5.next = 53;
                            break;
                        }

                        if (!(dataFrom === '')) {
                            _context5.next = 32;
                            break;
                        }

                        _context5.next = 20;
                        return fpgxQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '0' }) });

                    case 20:
                        colRes1 = _context5.sent;
                        _context5.next = 23;
                        return fpgxQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '1' }) });

                    case 23:
                        colRes2 = _context5.sent;
                        _context5.next = 26;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: searchOpt });

                    case 26:
                        colRes3 = _context5.sent;
                        _context5.next = 29;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 29:
                        colRes4 = _context5.sent;
                        _context5.next = 51;
                        break;

                    case 32:
                        if (!(dataFrom === 'fpgxQuery')) {
                            _context5.next = 41;
                            break;
                        }

                        _context5.next = 35;
                        return fpgxQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '0' }) });

                    case 35:
                        colRes1 = _context5.sent;
                        _context5.next = 38;
                        return fpgxQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '1' }) });

                    case 38:
                        colRes2 = _context5.sent;
                        _context5.next = 51;
                        break;

                    case 41:
                        if (!(dataFrom === 'dktjQuery')) {
                            _context5.next = 47;
                            break;
                        }

                        _context5.next = 44;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: searchOpt });

                    case 44:
                        colRes3 = _context5.sent;
                        _context5.next = 51;
                        break;

                    case 47:
                        if (!(dataFrom === 'wdqInvoiceQuery')) {
                            _context5.next = 51;
                            break;
                        }

                        _context5.next = 50;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 50:
                        colRes4 = _context5.sent;

                    case 51:
                        _context5.next = 95;
                        break;

                    case 53:
                        if (!(rzzt === '0')) {
                            _context5.next = 75;
                            break;
                        }

                        if (!(dataFrom === '')) {
                            _context5.next = 63;
                            break;
                        }

                        _context5.next = 57;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 57:
                        colRes1 = _context5.sent;
                        _context5.next = 60;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 60:
                        colRes4 = _context5.sent;
                        _context5.next = 73;
                        break;

                    case 63:
                        if (!(dataFrom === 'fpgxQuery')) {
                            _context5.next = 69;
                            break;
                        }

                        _context5.next = 66;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 66:
                        colRes1 = _context5.sent;
                        _context5.next = 73;
                        break;

                    case 69:
                        if (!(dataFrom === 'wdqInvoiceQuery')) {
                            _context5.next = 73;
                            break;
                        }

                        _context5.next = 72;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 72:
                        colRes4 = _context5.sent;

                    case 73:
                        _context5.next = 95;
                        break;

                    case 75:
                        if (!(rzzt === '1')) {
                            _context5.next = 95;
                            break;
                        }

                        if (!(dataFrom === '')) {
                            _context5.next = 85;
                            break;
                        }

                        _context5.next = 79;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 79:
                        colRes2 = _context5.sent;
                        _context5.next = 82;
                        return dktjQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 82:
                        colRes3 = _context5.sent;
                        _context5.next = 95;
                        break;

                    case 85:
                        if (!(dataFrom === 'fpgxQuery')) {
                            _context5.next = 91;
                            break;
                        }

                        _context5.next = 88;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 88:
                        colRes2 = _context5.sent;
                        _context5.next = 95;
                        break;

                    case 91:
                        if (!(dataFrom === 'dktjQuery')) {
                            _context5.next = 95;
                            break;
                        }

                        _context5.next = 94;
                        return dktjQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 94:
                        colRes3 = _context5.sent;

                    case 95:

                        if (colRes1.errcode === '0000' && colRes1.data.length > 0) {
                            invoices = concatInvoices(invoices, colRes1.data);
                        }

                        if (colRes2.errcode === '0000' && colRes2.data.length > 0) {
                            invoices = concatInvoices(invoices, colRes2.data);
                        }

                        if (colRes3.errcode === '0000' && colRes3.data.length > 0) {
                            invoices = concatInvoices(invoices, colRes3.data);
                        }

                        if (colRes4.errcode === '0000' && colRes4.data.length > 0) {
                            invoices = concatInvoices(invoices, colRes4.data);
                        }

                        if (!(colRes1.errcode !== '0000' && colRes2.errcode !== '0000' && colRes3.errcode !== '0000' && colRes4.errcode !== '0000')) {
                            _context5.next = 103;
                            break;
                        }

                        return _context5.abrupt('return', colRes1);

                    case 103:
                        totalInfo = computeInvoicesInfo(invoices);
                        return _context5.abrupt('return', _extends({
                            errcode: '0000',
                            data: invoices,
                            copies: invoices.length,
                            totalMoney: totalInfo.totalAmount
                        }, totalInfo));

                    case 105:
                        _context5.next = 108;
                        break;

                    case 107:
                        return _context5.abrupt('return', res);

                    case 108:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function query(_x7) {
        return _ref9.apply(this, arguments);
    };
}();
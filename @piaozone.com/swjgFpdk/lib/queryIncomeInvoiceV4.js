import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var dktjQueryAll = function () {
    var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(_ref6) {
        var baseUrl = _ref6.baseUrl,
            searchOpt = _ref6.searchOpt,
            _ref6$dataIndex = _ref6.dataIndex,
            dataIndex = _ref6$dataIndex === undefined ? '' : _ref6$dataIndex,
            _ref6$stepHandler = _ref6.stepHandler,
            stepHandler = _ref6$stepHandler === undefined ? function (f) {
            return f;
        } : _ref6$stepHandler;
        var res, tempRes;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        res = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };

                        if (searchOpt.id) {
                            _context3.next = 20;
                            break;
                        }

                        _context3.next = 4;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { id: 'dkmx' }) });

                    case 4:
                        tempRes = _context3.sent;


                        if (tempRes.errcode === '0000') {
                            colRes3.data = concatInvoices(colRes3.data, tempRes.data);
                        }

                        _context3.next = 8;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { id: 'ckznxmx' }) });

                    case 8:
                        tempRes = _context3.sent;


                        if (tempRes.errcode === '0000') {
                            res.data = concatInvoices(colRes3.data, tempRes.data);
                        }

                        _context3.next = 12;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { id: 'dkycfpmx' }) });

                    case 12:
                        tempRes = _context3.sent;


                        if (tempRes.errcode === '0000') {
                            res.data = concatInvoices(colRes3.data, tempRes.data);
                        }

                        _context3.next = 16;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { id: 'dkycckznxfpmx' }) });

                    case 16:
                        tempRes = _context3.sent;


                        if (tempRes.errcode === '0000') {
                            res.data = concatInvoices(colRes3.data, tempRes.data);
                        }
                        _context3.next = 23;
                        break;

                    case 20:
                        _context3.next = 22;
                        return dktjQuery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: searchOpt });

                    case 22:
                        res = _context3.sent;

                    case 23:
                        return _context3.abrupt('return', res);

                    case 24:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function dktjQueryAll(_x5) {
        return _ref5.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { login, forwardUrl, getGxPublicKey, clearGovCookie } from './loginToGov';
import { kdRequest, paramJson, cookieHelp } from '@piaozone.com/utils';
import { createJsonpCallback, sleep, createFpdkHeader } from './tools';

var setCookie = cookieHelp.setCookie,
    getCookie = cookieHelp.getCookie,
    clearCookie = cookieHelp.clearCookie;


var defaultPageSize = 100;

var aoDataDict = {
    'dkgxquery': function dkgxquery(i) {
        return [{ "name": "sEcho", "value": 1 }, { "name": "iColumns", "value": 15 }, { "name": "sColumns", "value": ",,,,,,,,,,,,,," }, { "name": "iDisplayStart", "value": i }, { "name": "iDisplayLength", "value": defaultPageSize }, { "name": "mDataProp_0", "value": 0 }, { "name": "mDataProp_1", "value": 1 }, { "name": "mDataProp_2", "value": 2 }, { "name": "mDataProp_3", "value": 3 }, { "name": "mDataProp_4", "value": 4 }, { "name": "mDataProp_5", "value": 5 }, { "name": "mDataProp_6", "value": 6 }, { "name": "mDataProp_7", "value": 7 }, { "name": "mDataProp_8", "value": 8 }, { "name": "mDataProp_9", "value": 9 }, { "name": "mDataProp_10", "value": 10 }, { "name": "mDataProp_11", "value": 11 }, { "name": "mDataProp_12", "value": 12 }, { "name": "mDataProp_13", "value": 13 }, { "name": "mDataProp_14", "value": 14 }];
    },
    'dkycckznxfpmx': function dkycckznxfpmx(i) {
        return [{ "name": "sEcho", "value": 1 }, { "name": "iColumns", "value": 14 }, { "name": "sColumns", "value": ",,,,,,,,,,,,," }, { "name": "iDisplayStart", "value": i }, { "name": "iDisplayLength", "value": defaultPageSize }, { "name": "mDataProp_0", "value": 0 }, { "name": "mDataProp_1", "value": 1 }, { "name": "mDataProp_2", "value": 2 }, { "name": "mDataProp_3", "value": 3 }, { "name": "mDataProp_4", "value": 4 }, { "name": "mDataProp_5", "value": 5 }, { "name": "mDataProp_6", "value": 6 }, { "name": "mDataProp_7", "value": 7 }, { "name": "mDataProp_8", "value": 8 }, { "name": "mDataProp_9", "value": 9 }, { "name": "mDataProp_10", "value": 10 }, { "name": "mDataProp_11", "value": 11 }, { "name": "mDataProp_12", "value": 12 }, { "name": "mDataProp_13", "value": 13 }];
    },
    'dkycfpmx': function dkycfpmx(i) {
        return [{ "name": "sEcho", "value": 1 }, { "name": "iColumns", "value": 15 }, { "name": "sColumns", "value": ",,,,,,,,,,,,,," }, { "name": "iDisplayStart", "value": i }, { "name": "iDisplayLength", "value": defaultPageSize }, { "name": "mDataProp_0", "value": 0 }, { "name": "mDataProp_1", "value": 1 }, { "name": "mDataProp_2", "value": 2 }, { "name": "mDataProp_3", "value": 3 }, { "name": "mDataProp_4", "value": 4 }, { "name": "mDataProp_5", "value": 5 }, { "name": "mDataProp_6", "value": 6 }, { "name": "mDataProp_7", "value": 7 }, { "name": "mDataProp_8", "value": 8 }, { "name": "mDataProp_9", "value": 9 }, { "name": "mDataProp_10", "value": 10 }, { "name": "mDataProp_11", "value": 11 }, { "name": "mDataProp_12", "value": 12 }, { "name": "mDataProp_13", "value": 13 }, { "name": "mDataProp_14", "value": 14 }];
    },
    'dkmx': function dkmx(i) {
        return [{ "name": "sEcho", "value": 1 }, { "name": "iColumns", "value": 14 }, { "name": "sColumns", "value": ",,,,,,,,,,,,," }, { "name": "iDisplayStart", "value": i }, { "name": "iDisplayLength", "value": defaultPageSize }, { "name": "mDataProp_0", "value": 0 }, { "name": "mDataProp_1", "value": 1 }, { "name": "mDataProp_2", "value": 2 }, { "name": "mDataProp_3", "value": 3 }, { "name": "mDataProp_4", "value": 4 }, { "name": "mDataProp_5", "value": 5 }, { "name": "mDataProp_6", "value": 6 }, { "name": "mDataProp_7", "value": 7 }, { "name": "mDataProp_8", "value": 8 }, { "name": "mDataProp_9", "value": 9 }, { "name": "mDataProp_10", "value": 10 }, { "name": "mDataProp_11", "value": 11 }, { "name": "mDataProp_12", "value": 12 }, { "name": "mDataProp_13", "value": 13 }];
    },
    'ckznxmx': function ckznxmx(i) {
        return [{ "name": "sEcho", "value": 1 }, { "name": "iColumns", "value": 13 }, { "name": "sColumns", "value": ",,,,,,,,,,,," }, { "name": "iDisplayStart", "value": i }, { "name": "iDisplayLength", "value": defaultPageSize }, { "name": "mDataProp_0", "value": 0 }, { "name": "mDataProp_1", "value": 1 }, { "name": "mDataProp_2", "value": 2 }, { "name": "mDataProp_3", "value": 3 }, { "name": "mDataProp_4", "value": 4 }, { "name": "mDataProp_5", "value": 5 }, { "name": "mDataProp_6", "value": 6 }, { "name": "mDataProp_7", "value": 7 }, { "name": "mDataProp_8", "value": 8 }, { "name": "mDataProp_9", "value": 9 }, { "name": "mDataProp_10", "value": 10 }, { "name": "mDataProp_11", "value": 11 }, { "name": "mDataProp_12", "value": 12 }];
    }
};

var getInvoiceType = function getInvoiceType(code) {
    if (code === '01') {
        return 4;
    } else if (code === '02') {} else if (code === '03') {
        return 12;
    } else if (code === '14') {
        return 15;
    } else {
        return 4;
    }
};

function dkgxQueryTransformData(allData, rzzt) {
    var tax_period = '';
    if (rzzt == '1') {
        var skssq = getCookie('skssq');
        skssq = decodeURIComponent(skssq);
        tax_period = skssq.split(';')[0];
    }

    return {
        'invoiceType': getInvoiceType(allData[9]),
        'invoiceCode': allData[1],
        'invoiceNo': allData[2],
        'invoiceDate': allData[3],
        'salerName': allData[4],
        'invoiceAmount': allData[5],
        'taxAmount': allData[6],
        'invoiceStatus': allData[8],
        'checkFlag': allData[11],
        'selectTime': allData[12] || '',
        'checkAuthenticateFlag': '',
        'selectAuthenticateTime': '',
        'scanAuthenticateFlag': '0',
        'scanAuthenticateTime': '',
        'salerTaxNo': '',
        'taxPeriod': ''
    };
}

function lssqTransformData(allData, rzyf) {
    var status = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    return {
        'invoiceType': getInvoiceType(allData[1]),
        'invoiceCode': allData[1],
        'invoiceNo': allData[2],
        'invoiceDate': allData[3],
        'salerName': allData[4],
        'invoiceAmount': allData[5],
        'taxAmount': allData[6],
        'invoiceStatus': status,
        'checkFlag': '1',
        'selectTime': allData[8] || '',
        'checkAuthenticateFlag': '1',
        'selectAuthenticateTime': allData[8] || '',
        'scanAuthenticateFlag': '0',
        'scanAuthenticateTime': '',
        'salerTaxNo': '',
        'taxPeriod': rzyf
    };
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

export var dkgxquery = function () {
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
        var ymbb, govToken, currentPage, pageSize, curIndex, goOn, totalMoney, result, invoices, paramTemp, resCollect, jsonData, key1, key3, newToken, key4, invoiceData, invoiceDataLen, datas, i, item, totalNum;
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
                        curIndex = dataIndex || 0;
                        goOn = dataIndex === '' ? true : false;
                        totalMoney = 0.00;
                        result = { errcode: '0000', data: [] };
                        invoices = [];
                        paramTemp = {
                            'id': 'dkgxquery',
                            'fphm': searchOpt.fphm || '',
                            'fpdm': searchOpt.fpdm || '',
                            'rq_q': searchOpt['rq_q'],
                            'rq_z': searchOpt['rq_z'],
                            'xfsbh': searchOpt['xfsbh'] || '',
                            'fpzt': searchOpt['fpzt'] || '-1',
                            'fplx': searchOpt['fplx'] || '-1',
                            'rzzt': searchOpt['rzzt'] || '0',
                            'glzt': searchOpt['glzt'] || '-1',
                            'cert': searchOpt.cert,
                            'token': govToken,
                            'aoData': aoDataDict['dkgxquery'](curIndex),
                            ymbb: ymbb
                        };

                    case 12:
                        _context.next = 14;
                        return sleep();

                    case 14:
                        _context.next = 16;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'dkgx.do?callback=' + createJsonpCallback(),
                                requestData: paramJson(paramTemp),
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 16:
                        resCollect = _context.sent;


                        if (resCollect.errcode === '0000' && resCollect.data) {
                            jsonData = resCollect.data;
                            key1 = jsonData.key1;

                            if (key1 === "00") {
                                goOn = false;
                                result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                            } else if (key1 == "200") {
                                key3 = jsonData.key3;
                                newToken = jsonData.key2;

                                setCookie('govToken', newToken);
                                govToken = newToken;
                                key4 = jsonData.key4;

                                if (key3) {
                                    invoiceData = key3.aaData;
                                    invoiceDataLen = invoiceData.length;

                                    if (invoiceDataLen > 0) {
                                        datas = [];

                                        for (i = 0; i < invoiceDataLen; i++) {
                                            item = dkgxQueryTransformData(invoiceData[i], searchOpt['rzzt']);

                                            datas.push(item);
                                            totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                        }

                                        stepHandler({ errcode: '0000', data: datas, searchOpt: searchOpt, dataIndex: curIndex, dataFrom: 'dkgxquery' });
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

                    case 18:
                        if (goOn) {
                            _context.next = 12;
                            break;
                        }

                    case 19:
                        if (!(result.errcode === '0000')) {
                            _context.next = 23;
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

                    case 23:
                        if (!(retry > 3)) {
                            _context.next = 28;
                            break;
                        }

                        stepHandler({ 'errcode': result.errcode, data: [], description: result.description, searchOpt: searchOpt, dataIndex: curIndex, dataFrom: 'dkgxquery' });
                        return _context.abrupt('return', result);

                    case 28:
                        _context.next = 30;
                        return dkgxquery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler }, retry + 1);

                    case 30:
                        return _context.abrupt('return', _context.sent);

                    case 31:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function dkgxquery(_x2) {
        return _ref.apply(this, arguments);
    };
}();

export var dktjQuery = function () {
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
        var govToken, ymbb, cert, id, result, skssq, tax_period, invoices, totalMoney, curIndex, totalNum, curYear, curMonthInt, nextYear, nextMonthInt, maxYear, maxMonthInt, tempDateArr, curMonth, currentDate, limitMaxYear, limitMaxMonth, tjyf, stopFlag, nextMonth, searchParam, resCollect, jsonData, key1, newToken, invoiceData, invoiceDataLen, datas, i, item, rq_q;
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
                        id = searchOpt.id || 'dkmx';
                        result = { errcode: '0000', data: [] };
                        skssq = getCookie('skssq');

                        skssq = decodeURIComponent(skssq);
                        tax_period = skssq.split(';')[0];
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

                    case 34:
                        curIndex = dataIndex || 0;
                        nextYear = curMonthInt > 11 ? curYear + 1 : curYear;
                        nextMonthInt = curMonthInt > 11 ? 1 : curMonthInt + 1;
                        nextMonth = nextMonthInt > 9 ? nextMonthInt : '0' + nextMonthInt;


                        tjyf = curYear + '' + curMonth;

                    case 39:
                        searchParam = {
                            id: id,
                            cert: cert,
                            token: govToken,
                            tjyf: tjyf,
                            fpdm: '',
                            fphm: '',
                            ymbb: ymbb,
                            qt: tjyf === tax_period ? 'dq' : 'wq',
                            aoData: aoDataDict[id](curIndex)
                        };


                        if (id === 'dkmx') {
                            searchParam.xfsbh = '';
                            searchParam.qrrzrq_q = '';
                            searchParam.qrrzrq_z = '';
                            searchParam.fply = 0;
                        } else if (id === 'ckznxmx') {
                            searchParam.zmbh = '';
                            searchParam.xfsbh = '';
                            searchParam.qrrzrq_q = '';
                            searchParam.qrrzrq_z = '';
                            searchParam.fply = 0;
                        } else if (id === 'dkycfpmx') {
                            searchParam.kprq_q = '';
                            searchParam.kprq_z = '';
                        } else if (id === 'dkycckznxfpmx') {
                            searchParam.zmbh = '';
                            searchParam.kprq_q = '';
                            searchParam.kprq_z = '';
                        }

                        _context2.next = 43;
                        return sleep();

                    case 43:
                        _context2.next = 45;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'dktj.do?callback=' + createJsonpCallback(),
                                requestData: paramJson(searchParam),
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 45:
                        resCollect = _context2.sent;


                        if (resCollect.errcode === '0000') {
                            jsonData = resCollect.data;
                            key1 = jsonData.key1;

                            if (key1 === "00") {
                                result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                            } else if (key1 === '200') {
                                newToken = jsonData.key2;

                                setCookie('govToken', newToken);
                                govToken = newToken;
                                invoiceData = jsonData.key3.aaData;
                                invoiceDataLen = invoiceData.length;


                                if (invoiceDataLen > 0) {
                                    datas = [];

                                    for (i = 0; i < invoiceDataLen; i++) {
                                        item = lssqTransformData(invoiceData[i], tjyf);

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

                    case 47:
                        if (curIndex < totalNum && !stopFlag) {
                            _context2.next = 39;
                            break;
                        }

                    case 48:

                        curYear = nextYear;
                        curMonth = nextMonth;
                        curMonthInt = nextMonthInt;

                    case 51:
                        if (!stopFlag && (nextYear < limitMaxYear || nextYear == limitMaxYear && nextMonthInt <= limitMaxMonth)) {
                            _context2.next = 34;
                            break;
                        }

                    case 52:
                        if (!(result.errcode === '0000')) {
                            _context2.next = 56;
                            break;
                        }

                        return _context2.abrupt('return', { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length });

                    case 56:
                        if (!(retry > 3)) {
                            _context2.next = 62;
                            break;
                        }

                        rq_q = dataIndex === '' ? searchOpt.rq_q : tjyf.substr(0, 4) + '-' + tjyf.substr(4, 2) + '-01';

                        stepHandler({ 'errcode': result.errcode, data: [], description: result.description, dataIndex: curIndex, dataFrom: 'dktjQuery', searchOpt: _extends({}, searchOpt, { rq_q: rq_q }) });
                        return _context2.abrupt('return', result);

                    case 62:
                        _context2.next = 64;
                        return dktjQuery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler }, retry + 1);

                    case 64:
                        return _context2.abrupt('return', _context2.sent);

                    case 65:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function dktjQuery(_x3) {
        return _ref3.apply(this, arguments);
    };
}();

export var query = function () {
    var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(_ref8) {
        var _ref8$passwd = _ref8.passwd,
            passwd = _ref8$passwd === undefined ? '' : _ref8$passwd,
            _ref8$ptPasswd = _ref8.ptPasswd,
            ptPasswd = _ref8$ptPasswd === undefined ? '' : _ref8$ptPasswd,
            searchOpt = _ref8.searchOpt,
            dataIndex = _ref8.dataIndex,
            _ref8$dataFrom = _ref8.dataFrom,
            dataFrom = _ref8$dataFrom === undefined ? '' : _ref8$dataFrom,
            stepFinish = _ref8.stepFinish;

        var res, stepHandler, invoices, ymbb, baseUrl, colRes1, colRes2, _colRes, rzzt, totalInfo;

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
                            _context4.next = 64;
                            break;
                        }

                        ymbb = getCookie('ymbb');
                        baseUrl = res.data.baseUrl;

                        searchOpt.cert = res.data.taxNo;
                        colRes1 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes2 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        _colRes = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        rzzt = searchOpt.rzzt || '';

                        if (!(rzzt === '')) {
                            _context4.next = 43;
                            break;
                        }

                        if (!(dataFrom === '')) {
                            _context4.next = 28;
                            break;
                        }

                        _context4.next = 19;
                        return dkgxquery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '0' }) });

                    case 19:
                        colRes1 = _context4.sent;
                        _context4.next = 22;
                        return dkgxquery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '1' }) });

                    case 22:
                        colRes2 = _context4.sent;
                        _context4.next = 25;
                        return dktjQueryAll({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: searchOpt });

                    case 25:
                        _colRes = _context4.sent;
                        _context4.next = 41;
                        break;

                    case 28:
                        if (!(dataFrom === 'dkgxquery')) {
                            _context4.next = 37;
                            break;
                        }

                        _context4.next = 31;
                        return dkgxquery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '0' }) });

                    case 31:
                        colRes1 = _context4.sent;
                        _context4.next = 34;
                        return dkgxquery({ baseUrl: baseUrl, stepHandler: stepHandler, dataIndex: dataIndex, searchOpt: _extends({}, searchOpt, { rzzt: '1' }) });

                    case 34:
                        colRes2 = _context4.sent;
                        _context4.next = 41;
                        break;

                    case 37:
                        if (!(dataFrom === 'dktjQuery')) {
                            _context4.next = 41;
                            break;
                        }

                        _context4.next = 40;
                        return dktjQueryAll({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 40:
                        _colRes = _context4.sent;

                    case 41:
                        _context4.next = 53;
                        break;

                    case 43:
                        if (!(rzzt === '0')) {
                            _context4.next = 49;
                            break;
                        }

                        _context4.next = 46;
                        return dkgxquery({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 46:
                        colRes1 = _context4.sent;
                        _context4.next = 53;
                        break;

                    case 49:
                        if (!(rzzt === '1')) {
                            _context4.next = 53;
                            break;
                        }

                        _context4.next = 52;
                        return dktjQueryAll({ baseUrl: baseUrl, searchOpt: searchOpt, stepHandler: stepHandler, dataIndex: dataIndex });

                    case 52:
                        _colRes = _context4.sent;

                    case 53:

                        if (colRes1.errcode === '0000' && colRes1.data.length > 0) {
                            invoices = concatInvoices(invoices, colRes1.data);
                        }

                        if (colRes2.errcode === '0000' && colRes2.data.length > 0) {
                            invoices = concatInvoices(invoices, colRes2.data);
                        }

                        if (_colRes.errcode === '0000' && _colRes.data.length > 0) {
                            invoices = concatInvoices(invoices, _colRes.data);
                        }

                        if (!(colRes1.errcode !== '0000' && colRes2.errcode !== '0000' && _colRes.errcode !== '0000')) {
                            _context4.next = 60;
                            break;
                        }

                        return _context4.abrupt('return', colRes1);

                    case 60:
                        totalInfo = computeInvoicesInfo(invoices);
                        return _context4.abrupt('return', _extends({
                            errcode: '0000',
                            data: invoices,
                            copies: invoices.length,
                            totalMoney: totalInfo.totalAmount
                        }, totalInfo));

                    case 62:
                        _context4.next = 65;
                        break;

                    case 64:
                        return _context4.abrupt('return', res);

                    case 65:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function query(_x6) {
        return _ref7.apply(this, arguments);
    };
}();
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.query = exports.dktjQuery = exports.wdqInvoiceQuery = exports.fpgxQuery = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var fpgxQuery = exports.fpgxQuery = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
        var baseUrl = _ref2.baseUrl,
            searchOpt = _ref2.searchOpt,
            _ref2$rzzt = _ref2.rzzt,
            rzzt = _ref2$rzzt === undefined ? '0' : _ref2$rzzt;
        var govToken, currentPage, pageSize, cert, curIndex, goOn, totalMoney, result, invoices, paramTemp, searchParam, resCollect, jsonData, key1, key2, newToken, key4, invoiceData, invoiceDataLen, i, totalNum;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        govToken = getCookie('govToken');

                        if (govToken) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '7009', description: 'CA认证失效，请重新CA登录！' });

                    case 3:
                        currentPage = searchOpt.currentPage || 0;
                        pageSize = searchOpt.pageSize || defaultPageSize;
                        cert = searchOpt.cert;
                        curIndex = 0;
                        goOn = true;
                        totalMoney = 0.00;
                        result = void 0;
                        invoices = [];
                        paramTemp = {
                            'callback': 'jQuery' + +new Date(),
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

                    case 13:
                        searchParam = (0, _utils.paramJson)(paramTemp) + '&cert=' + cert + '&token=' + govToken + '&aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A14%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A' + currentPage * defaultPageSize + '%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A' + pageSize + '%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A3%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A4%7D%2C%7B%22name%22%3A%22mDataProp_5%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22mDataProp_6%22%2C%22value%22%3A6%7D%2C%7B%22name%22%3A%22mDataProp_7%22%2C%22value%22%3A7%7D%2C%7B%22name%22%3A%22mDataProp_8%22%2C%22value%22%3A8%7D%2C%7B%22name%22%3A%22mDataProp_9%22%2C%22value%22%3A9%7D%2C%7B%22name%22%3A%22mDataProp_10%22%2C%22value%22%3A10%7D%2C%7B%22name%22%3A%22mDataProp_11%22%2C%22value%22%3A11%7D%2C%7B%22name%22%3A%22mDataProp_12%22%2C%22value%22%3A12%7D%2C%7B%22name%22%3A%22mDataProp_13%22%2C%22value%22%3A13%7D%5D&ymbb=' + _diskOperate.ymbb;
                        _context.next = 16;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + 'SbsqWW/gxcx.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET'
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
                                        for (i = 0; i < invoiceDataLen; i++) {
                                            invoices.push(transformData(invoiceData[i]));
                                            totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                        }
                                        curIndex += invoiceDataLen;
                                    }

                                    totalNum = key2.iTotalRecords;


                                    if (totalNum > 0) {
                                        if (curIndex >= totalNum) {
                                            result = {
                                                'errcode': '0000',
                                                'data': invoices,
                                                'description': 'success',
                                                'totalMoney': totalMoney.toFixed(2),
                                                'copies': totalNum,
                                                'startDate': searchOpt['rq_q'],
                                                'endDate': searchOpt['rq_z']
                                            };
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
                                goOn = false;
                                result = { 'errcode': '7009', 'description': 'CA认证失效，请重新登录税控！' };
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
                            _context.next = 13;
                            break;
                        }

                    case 19:
                        return _context.abrupt('return', result);

                    case 20:
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

var wdqInvoiceQuery = exports.wdqInvoiceQuery = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(_ref4) {
        var baseUrl = _ref4.baseUrl,
            searchOpt = _ref4.searchOpt;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var govToken, cert, result, invoices, totalMoney, curIndex, totalNum, resKey, ts, publickey, paramStr, searchParam, resCollect, jsonData, key1, newToken, invoiceData, invoiceDataLen, i;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
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
                        cert = searchOpt.cert;
                        result = {};
                        invoices = [];
                        totalMoney = 0.00;
                        curIndex = 0;
                        totalNum = 0;
                        _context2.next = 11;
                        return (0, _loginToGov.getGxPublicKey)({ govToken: govToken, baseUrl: baseUrl, taxNo: cert, funType: '03' });

                    case 11:
                        resKey = _context2.sent;
                        ts = resKey.ts, publickey = resKey.publickey;
                        paramStr = (0, _utils.paramJson)({
                            callback: 'jQuery' + +new Date(),
                            kprq_q: searchOpt['rq_q'],
                            kprq_z: searchOpt['rq_z'],
                            fphm: searchOpt['fpdm'] || '',
                            fpdm: searchOpt['fphm'] || '',
                            cxfw: 1,
                            cert: cert,
                            token: govToken,
                            ymbb: _diskOperate.ymbb,
                            ts: ts,
                            publickey: publickey
                        });

                    case 14:
                        searchParam = paramStr + '&aoData=' + encodeURIComponent('[{\"name\":\"sEcho\",\"value\":1},{\"name\":\"iColumns\",\"value\":8},{\"name\":\"sColumns\",\"value\":\",,,,,,,\"},{\"name\":\"iDisplayStart\",\"value\":' + curIndex + '},{\"name\":\"iDisplayLength\",\"value\": 100},{\"name\":\"mDataProp_0\",\"value\":0},{\"name\":\"mDataProp_1\",\"value\":1},{\"name\":\"mDataProp_2\",\"value\":2},{\"name\":\"mDataProp_3\",\"value\":3},{\"name\":\"mDataProp_4\",\"value\":4},{\"name\":\"mDataProp_5\",\"value\":5},{\"name\":\"mDataProp_6\",\"value\":6},{\"name\":\"mDataProp_7\",\"value\":7}]');
                        _context2.next = 17;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + 'SbsqWW/fpcx.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 17:
                        resCollect = _context2.sent;


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
                                    for (i = 0; i < invoiceDataLen; i++) {
                                        invoices.push(transOldRzformData(invoiceData[i]));
                                        totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                    }
                                    curIndex += invoiceDataLen;
                                }
                                totalNum = jsonData.key2.iTotalRecords;
                            }
                        } else {
                            result = { 'errcode': resCollect.errcode, 'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00 };
                        }

                    case 19:
                        if (curIndex < totalNum) {
                            _context2.next = 14;
                            break;
                        }

                    case 20:

                        result = { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length };

                        if (!(invoices.length !== 0)) {
                            _context2.next = 25;
                            break;
                        }

                        return _context2.abrupt('return', result);

                    case 25:
                        if (!(retry > 3)) {
                            _context2.next = 29;
                            break;
                        }

                        return _context2.abrupt('return', result);

                    case 29:
                        _context2.next = 31;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt }, retry + 1);

                    case 31:
                        return _context2.abrupt('return', _context2.sent);

                    case 32:
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

var dktjQuery = exports.dktjQuery = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref6) {
        var baseUrl = _ref6.baseUrl,
            searchOpt = _ref6.searchOpt;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var govToken, cert, result, invoices, totalMoney, curIndex, totalNum, curYear, curMonthInt, nextYear, nextMonthInt, maxYear, maxMonthInt, tempDateArr, curMonth, currentDate, tjyf, nextMonth, searchParam, resCollect, jsonData, key1, newToken, invoiceData, invoiceDataLen, i;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
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
                        cert = searchOpt.cert;
                        result = {};
                        invoices = [];
                        totalMoney = 0.00;
                        curIndex = 0;
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

                        tjyf = '';

                    case 25:
                        curIndex = 0;
                        nextYear = curMonthInt > 11 ? curYear + 1 : curYear;
                        nextMonthInt = curMonthInt > 11 ? 1 : curMonthInt + 1;
                        nextMonth = nextMonthInt > 9 ? nextMonthInt : '0' + nextMonthInt;


                        tjyf = curYear + '' + curMonth;

                    case 30:
                        searchParam = 'cert=' + cert;

                        searchParam += '&callback=jQuery' + +new Date(), searchParam += '&token=' + govToken;
                        searchParam += '&tjyf=' + tjyf;
                        searchParam += '&oper=cx&fpdm=&fphm=&xfsbh=&qrrzrq_q=&qrrzrq_z=&fply=0';
                        searchParam += '&ymbb=' + _diskOperate.ymbb;

                        searchParam += '&aoData=' + encodeURIComponent('[{\"name\":\"sEcho\",\"value\":1},{\"name\":\"iColumns\",\"value\":11},{\"name\":\"sColumns\",\"value\":\",,,,,,,,,,\"},{\"name\":\"iDisplayStart\",\"value\":' + curIndex + '},{\"name\":\"iDisplayLength\",\"value\":50},{\"name\":\"mDataProp_0\",\"value\":0},{\"name\":\"mDataProp_1\",\"value\":1},{\"name\":\"mDataProp_2\",\"value\":2},{\"name\":\"mDataProp_3\",\"value\":3},{\"name\":\"mDataProp_4\",\"value\":4},{\"name\":\"mDataProp_5\",\"value\":5},{\"name\":\"mDataProp_6\",\"value\":6},{\"name\":\"mDataProp_7\",\"value\":7},{\"name\":\"mDataProp_8\",\"value\":8},{\"name\":\"mDataProp_9\",\"value\":9},{\"name\":\"mDataProp_10\",\"value\":10}]');

                        _context3.next = 38;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + 'SbsqWW/dktj.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 38:
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
                                    for (i = 0; i < invoiceDataLen; i++) {
                                        invoices.push(transRzformData(invoiceData[i]));
                                        totalMoney += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                    }
                                    curIndex += invoiceDataLen;
                                }

                                totalNum = jsonData.key2.iTotalRecords;
                            }
                        } else {
                            result = { 'errcode': resCollect.errcode, 'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00 };
                        }

                    case 40:
                        if (curIndex < totalNum) {
                            _context3.next = 30;
                            break;
                        }

                    case 41:

                        curYear = nextYear;
                        curMonth = nextMonth;
                        curMonthInt = nextMonthInt;

                    case 44:
                        if (nextYear < maxYear || nextYear == maxYear && nextMonthInt <= maxMonthInt) {
                            _context3.next = 25;
                            break;
                        }

                    case 45:

                        result = { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length };

                        if (!(invoices.length !== 0)) {
                            _context3.next = 50;
                            break;
                        }

                        return _context3.abrupt('return', result);

                    case 50:
                        if (!(retry > 3)) {
                            _context3.next = 54;
                            break;
                        }

                        return _context3.abrupt('return', result);

                    case 54:
                        _context3.next = 56;
                        return dktjQuery({ taxNo: taxNo, companyName: companyName, passwd: passwd, ptPasswd: ptPasswd, searchOpt: searchOpt }, retry + 1);

                    case 56:
                        return _context3.abrupt('return', _context3.sent);

                    case 57:
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

var query = exports.query = function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref8) {
        var _ref8$passwd = _ref8.passwd,
            passwd = _ref8$passwd === undefined ? '' : _ref8$passwd,
            _ref8$ptPasswd = _ref8.ptPasswd,
            ptPasswd = _ref8$ptPasswd === undefined ? '' : _ref8$ptPasswd,
            searchOpt = _ref8.searchOpt;
        var res, invoices, copies, totalMoney, baseUrl, colRes1, colRes2, colRes3, colRes4, rzzt;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
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
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd });

                    case 4:
                        res = _context4.sent;
                        invoices = [];
                        copies = 0;
                        totalMoney = 0.00;

                        if (!(res.errcode === '0000')) {
                            _context4.next = 59;
                            break;
                        }

                        baseUrl = res.data.baseUrl;

                        searchOpt.cert = res.data.taxNo;
                        colRes1 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes2 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes3 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        colRes4 = { errcode: '0000', data: [], copies: 0, totalMoney: 0.00 };
                        rzzt = searchOpt.rzzt || '';

                        if (!(rzzt === '')) {
                            _context4.next = 31;
                            break;
                        }

                        _context4.next = 19;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: (0, _extends3.default)({}, searchOpt, { rzzt: '0' }) });

                    case 19:
                        colRes1 = _context4.sent;
                        _context4.next = 22;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: (0, _extends3.default)({}, searchOpt, { rzzt: '1' }) });

                    case 22:
                        colRes2 = _context4.sent;
                        _context4.next = 25;
                        return dktjQuery({ baseUrl: baseUrl, searchOpt: searchOpt });

                    case 25:
                        colRes3 = _context4.sent;
                        _context4.next = 28;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt });

                    case 28:
                        colRes4 = _context4.sent;
                        _context4.next = 47;
                        break;

                    case 31:
                        if (!(rzzt === '0')) {
                            _context4.next = 40;
                            break;
                        }

                        _context4.next = 34;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt });

                    case 34:
                        colRes1 = _context4.sent;
                        _context4.next = 37;
                        return wdqInvoiceQuery({ baseUrl: baseUrl, searchOpt: searchOpt });

                    case 37:
                        colRes4 = _context4.sent;
                        _context4.next = 47;
                        break;

                    case 40:
                        if (!(rzzt === '1')) {
                            _context4.next = 47;
                            break;
                        }

                        _context4.next = 43;
                        return fpgxQuery({ baseUrl: baseUrl, searchOpt: searchOpt });

                    case 43:
                        colRes2 = _context4.sent;
                        _context4.next = 46;
                        return dktjQuery({ baseUrl: baseUrl, searchOpt: searchOpt });

                    case 46:
                        colRes3 = _context4.sent;

                    case 47:

                        if (colRes1.errcode === '0000' && colRes1.data.length > 0) {
                            invoices = colRes1.data;
                            copies = colRes1.copies;
                            totalMoney = parseFloat(colRes1.totalMoney);
                        }

                        if (colRes2.errcode === '0000' && colRes2.data.length > 0) {
                            invoices = invoices.concat(colRes2.data);
                            copies += colRes2.copies;
                            totalMoney = totalMoney + parseFloat(colRes2.totalMoney);
                        }

                        if (colRes3.errcode === '0000') {
                            invoices = invoices.concat(colRes3.data);
                            copies += colRes3.copies;
                            totalMoney = totalMoney + parseFloat(colRes3.totalMoney);
                        }

                        if (colRes4.errcode === '0000') {
                            invoices = invoices.concat(colRes4.data);
                            copies += colRes4.copies;
                            totalMoney = totalMoney + parseFloat(colRes4.totalMoney);
                        }
                        totalMoney = totalMoney.toFixed(2);

                        if (!(colRes1.errcode !== '0000' && colRes2.errcode !== '0000' && colRes3.errcode !== '0000' && colRes4.errcode !== '0000')) {
                            _context4.next = 56;
                            break;
                        }

                        return _context4.abrupt('return', colRes1);

                    case 56:
                        return _context4.abrupt('return', {
                            errcode: '0000',
                            data: invoices,
                            copies: copies,
                            totalMoney: totalMoney
                        });

                    case 57:
                        _context4.next = 60;
                        break;

                    case 59:
                        return _context4.abrupt('return', res);

                    case 60:
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

var _diskOperate = require('./diskOperate');

var _swjgInfo = require('@piaozone.com/swjgInfo');

var _loginToGov = require('./loginToGov');

var _utils = require('@piaozone.com/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var setCookie = _utils.cookieHelp.setCookie,
    getCookie = _utils.cookieHelp.getCookie,
    clearCookie = _utils.cookieHelp.clearCookie;


var defaultPageSize = 100;

function transformData(allData) {
    return {

        'invoiceCode': allData[1],
        'invoiceType': '4',
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
        'salerTaxNo': allData[14] };
}

function transRzformData(allData) {
    return {
        'invoiceCode': allData[1],
        'invoiceType': '4',
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
        'salerTaxNo': '' };
}

function transOldRzformData(allData) {
    return {
        'invoiceCode': allData[1],
        'invoiceType': '4',
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
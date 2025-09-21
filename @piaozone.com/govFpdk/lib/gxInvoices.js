'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.gxConfirm = exports.rollback = exports.querysbzt = exports.getGXSumaryInfo = exports.getGXConfirmList = exports.gx = exports.gxConfirmSkssq = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var gxConfirmSkssq = exports.gxConfirmSkssq = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
        var taxNo = _ref2.taxNo,
            companyName = _ref2.companyName,
            passwd = _ref2.passwd,
            ptPasswd = _ref2.ptPasswd;

        var city, res, _res, govToken, govCompanyType, invoiceToken, resData, e, t, tempToken, tempCookssq, skssqs;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        city = (0, _swjgInfo.getCityNameByTaxNo)(taxNo);

                        if (city) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', { errcode: 'taxNoErr', description: '纳税人识别号有误' });

                    case 3:
                        _context.next = 5;
                        return sessionOutHandler({ taxNo: taxNo, companyName: companyName, passwd: passwd, ptPasswd: ptPasswd });

                    case 5:
                        res = _context.sent;

                        if (!(res.errcode !== '0000')) {
                            _context.next = 8;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 8:
                        _res = res, govToken = _res.govToken, govCompanyType = _res.govCompanyType, invoiceToken = _res.invoiceToken;
                        _context.next = 11;
                        return kdRequestAsync({
                            url: forwadUrl,
                            data: {
                                city: city,
                                requestURI: 'SbsqWW/hqssq.do',
                                requestMethod: 'GET',
                                requestData: encodeURIComponent(param({
                                    callback: 'jQuery' + +new Date(),
                                    cert: taxNo,
                                    token: govToken,
                                    ymbb: _diskOperate.ymbb
                                }))
                            },
                            method: 'POST'
                        });

                    case 11:
                        res = _context.sent;

                        if (!(res.errcode !== '0000')) {
                            _context.next = 14;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 14:

                        if (res.data && res.data.indexOf('jQuery') !== -1) {
                            resData = res.data.replace(/^jQuery[0-9_]+\(/, '').replace(/\)$/, '');
                            e = JSON.parse(resData);
                            t = e.key1;

                            if ('01' === t) {
                                tempToken = e.key2;
                                tempCookssq = e.key3;
                                skssqs = tempCookssq.split(';');

                                setCookie("govToken", tempToken, _loginToGov.govCacheSeconds);
                                setCookie("skssq", tempCookssq, _loginToGov.govCacheSeconds);
                                setCookie("gxrqfw", e.key4, _loginToGov.govCacheSeconds);
                            }
                        }

                    case 15:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function gxConfirmSkssq(_x) {
        return _ref.apply(this, arguments);
    };
}();

var gx = exports.gx = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(gxInfos) {
        var passwd, ptPasswd, fpdm, fphm, kprq, zt, newZt, fpdms, i, _i, loginRes, _loginRes$data, baseUrl, companyType, taxNo, govToken, res, _res2, publickey, ts, searchParam, jsonData, key1, resultTip, minMaxDate, fpcyRes, findResult;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, fpdm = gxInfos.fpdm, fphm = gxInfos.fphm, kprq = gxInfos.kprq, zt = gxInfos.zt;
                        newZt = [];
                        fpdms = fpdm.split('=');

                        if (!(zt === '0')) {
                            _context2.next = 7;
                            break;
                        }

                        for (i = 0; i < fpdms.length; i++) {
                            newZt.push('0');
                        }
                        _context2.next = 12;
                        break;

                    case 7:
                        if (!(zt === '1')) {
                            _context2.next = 11;
                            break;
                        }

                        for (_i = 0; _i < fpdms.length; _i++) {
                            newZt.push('1');
                        }
                        _context2.next = 12;
                        break;

                    case 11:
                        return _context2.abrupt('return', { errcode: '3001', description: '勾选参数错误!' });

                    case 12:
                        _context2.next = 14;
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd });

                    case 14:
                        loginRes = _context2.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context2.next = 17;
                            break;
                        }

                        return _context2.abrupt('return', loginRes);

                    case 17:
                        _loginRes$data = loginRes.data, baseUrl = _loginRes$data.baseUrl, companyType = _loginRes$data.companyType, taxNo = _loginRes$data.taxNo;
                        govToken = getCookie('govToken');

                        if (!(companyType !== '03')) {
                            _context2.next = 21;
                            break;
                        }

                        return _context2.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 21:
                        _context2.next = 23;
                        return (0, _loginToGov.getGxPublicKey)({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '02'
                        });

                    case 23:
                        res = _context2.sent;

                        if (!(res.errcode !== '0000')) {
                            _context2.next = 26;
                            break;
                        }

                        return _context2.abrupt('return', res);

                    case 26:
                        _res2 = res, publickey = _res2.publickey, ts = _res2.ts;
                        searchParam = (0, _utils.paramJson)({
                            fpdm: fpdm,
                            fphm: fphm,
                            kprq: kprq,
                            zt: newZt.join('='),
                            callback: 'jQuery' + +new Date(),
                            cert: taxNo,
                            token: govToken,
                            ts: ts,
                            publickey: publickey,
                            ymbb: _diskOperate.ymbb
                        });
                        _context2.next = 30;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + 'SbsqWW/gxtj.do?' + searchParam,
                                requestData: {},
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 30:
                        res = _context2.sent;

                        if (!(res.errcode === '0000')) {
                            _context2.next = 52;
                            break;
                        }

                        jsonData = res.data;
                        key1 = jsonData.key1;
                        resultTip = { 'errcode': '3003', 'description': '' };

                        if (!(key1 === '001')) {
                            _context2.next = 39;
                            break;
                        }

                        resultTip.description = '数据保存失败！';
                        _context2.next = 49;
                        break;

                    case 39:
                        if (!(key1 === '000')) {
                            _context2.next = 48;
                            break;
                        }

                        setCookie("govToken", jsonData.key2, _loginToGov.govCacheSeconds);
                        minMaxDate = getMinMaxDate(kprq.split('='));
                        _context2.next = 44;
                        return (0, _queryIncomeInvoice.fpgxQuery)({
                            baseUrl: baseUrl,
                            searchOpt: {
                                cert: taxNo,
                                rzzt: '0',
                                gxzt: zt,
                                rq_q: minMaxDate.min,
                                rq_z: minMaxDate.max
                            }
                        });

                    case 44:
                        fpcyRes = _context2.sent;


                        if (fpcyRes.errcode === '0000') {
                            findResult = findGxResult(fpdms, fphm.split('='), fpcyRes.data);

                            if (findResult.errcode === '0000') {
                                resultTip.errcode = '0000';
                                resultTip.description = '发票勾选保存成功！<br/>对于已勾选的发票，您还需要在“确认勾选”模块进行确认提交操作，完成发票的勾选认证';
                            } else {
                                resultTip.errcode = '3004', resultTip.data = findResult.data;
                            }
                        } else {
                            resultTip.errcode = fpcyRes.errcode;
                            resultTip.description = fpcyRes.description;
                        }

                        _context2.next = 49;
                        break;

                    case 48:
                        if (key1 === '09') {
                            clearCookie("govToken");
                            resultTip.description = '会话超时，请重试！';
                        } else if (key1 === '98') {
                            resultTip.description = '外网调用内网异常，请重试！';
                        } else {
                            resultTip.description = '系统异常，错误代码为:' + key1;
                        }

                    case 49:
                        return _context2.abrupt('return', resultTip);

                    case 52:
                        return _context2.abrupt('return', res);

                    case 53:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function gx(_x2) {
        return _ref3.apply(this, arguments);
    };
}();

var getGXConfirmList = exports.getGXConfirmList = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(gxInfos) {
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var passwd, ptPasswd, _gxInfos$qrzt, qrzt, loginRes, _loginRes$data2, baseUrl, companyType, taxNo, govToken, index, totalNum, invoices, result, totalInvoiceAmount, totalTaxAmount, totalAmount, searchParam, res, jsonData, key1, newToken, invoiceData, invoiceDataLen, i;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, _gxInfos$qrzt = gxInfos.qrzt, qrzt = _gxInfos$qrzt === undefined ? '1' : _gxInfos$qrzt;
                        _context3.next = 3;
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd });

                    case 3:
                        loginRes = _context3.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context3.next = 6;
                            break;
                        }

                        return _context3.abrupt('return', loginRes);

                    case 6:
                        _loginRes$data2 = loginRes.data, baseUrl = _loginRes$data2.baseUrl, companyType = _loginRes$data2.companyType, taxNo = _loginRes$data2.taxNo;
                        govToken = getCookie('govToken');

                        if (!(companyType !== '03')) {
                            _context3.next = 10;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 10:
                        index = 0;
                        totalNum = 0;
                        invoices = [];
                        result = {};
                        totalInvoiceAmount = 0.00;
                        totalTaxAmount = 0.00;
                        totalAmount = 0.00;

                    case 17:
                        searchParam = (0, _utils.paramJson)({
                            id: 'queryqrjg',
                            qrzt: qrzt,
                            key1: taxNo,
                            key2: govToken,
                            ymbb: _diskOperate.ymbb
                        });


                        searchParam += '&aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A11%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A' + index + '%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A' + defaultPageSize + '%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A3%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A4%7D%2C%7B%22name%22%3A%22mDataProp_5%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22mDataProp_6%22%2C%22value%22%3A6%7D%2C%7B%22name%22%3A%22mDataProp_7%22%2C%22value%22%3A7%7D%2C%7B%22name%22%3A%22mDataProp_8%22%2C%22value%22%3A8%7D%2C%7B%22name%22%3A%22mDataProp_9%22%2C%22value%22%3A9%7D%2C%7B%22name%22%3A%22mDataProp_10%22%2C%22value%22%3A10%7D%5D';

                        _context3.next = 21;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            method: 'POST',
                            data: {
                                headers: (0, _extends3.default)({}, fpdkHeaders, {
                                    'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                                    'Cookie': getFpdkCookies()
                                }),
                                requestUrl: baseUrl + 'SbsqWW/qrgx.do?ymbb=' + _diskOperate.ymbb + '&callback=' + 'jQuery' + +new Date(),
                                requestMethod: 'POST',
                                requestData: searchParam
                            }
                        });

                    case 21:
                        res = _context3.sent;


                        if (res.errcode === '0000') {
                            jsonData = res.data;
                            key1 = jsonData.key1;

                            if (key1 === '00') {
                                result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                            } else if (key1 === '01') {
                                newToken = jsonData.key3;

                                setCookie('govToken', newToken);
                                invoiceData = jsonData.key2.aaData;
                                invoiceDataLen = invoiceData.length;

                                if (invoiceDataLen > 0) {
                                    for (i = 0; i < invoiceDataLen; i++) {
                                        invoices.push({
                                            invoiceCode: invoiceData[i][1],
                                            invoiceNo: invoiceData[i][2],
                                            invoiceDate: invoiceData[i][3],
                                            invoiceAmount: invoiceData[i][5],
                                            taxAmount: invoiceData[i][6]
                                        });

                                        totalInvoiceAmount += parseFloat(invoiceData[i][5]);
                                        totalTaxAmount += parseFloat(invoiceData[i][6]);
                                        totalAmount += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                    }
                                    index += invoiceDataLen;
                                }
                                totalNum = jsonData.key2.iTotalRecords;
                            } else if (key1 === '09') {
                                clearCookie('govToken');
                                result = { 'errcode': '1000', 'description': 'CA登录失效！', data: [] };
                            }
                        }

                    case 23:
                        if (index < totalNum) {
                            _context3.next = 17;
                            break;
                        }

                    case 24:

                        result = { data: invoices, errcode: '0000', description: 'success', totalTaxAmount: totalTaxAmount.toFixed(2), totalInvoiceAmount: totalInvoiceAmount.toFixed(2), totalAmount: totalAmount.toFixed(2) };

                        if (!(invoices.length !== 0)) {
                            _context3.next = 29;
                            break;
                        }

                        return _context3.abrupt('return', result);

                    case 29:
                        if (!(retry > 3)) {
                            _context3.next = 33;
                            break;
                        }

                        return _context3.abrupt('return', result);

                    case 33:
                        _context3.next = 35;
                        return getGXConfirmList(gxInfos, retry + 1);

                    case 35:
                        return _context3.abrupt('return', _context3.sent);

                    case 36:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getGXConfirmList(_x3) {
        return _ref4.apply(this, arguments);
    };
}();

var getGXSumaryInfo = exports.getGXSumaryInfo = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(gxInfos) {
        var passwd, ptPasswd, baseUrl, res, taxNo, govToken, defatultTip, e, t, s, o, ljhzxxfs, r, i, bchxzzfs, a, signature;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, baseUrl = gxInfos.baseUrl;
                        _context4.next = 3;
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd });

                    case 3:
                        res = _context4.sent;

                        if (!(res.errcode !== '0000')) {
                            _context4.next = 6;
                            break;
                        }

                        return _context4.abrupt('return', res);

                    case 6:
                        taxNo = res.data.taxNo;
                        govToken = res.data.govToken;
                        defatultTip = { errcode: 'err', description: '获取汇总信息出现异常' };
                        _context4.next = 11;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                headers: (0, _extends3.default)({}, fpdkHeaders, {
                                    'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                                    'Cookie': getFpdkCookies()
                                }),
                                requestUrl: baseUrl + 'SbsqWW/qrgx.do',
                                requestData: (0, _utils.paramJson)({
                                    callback: 'jQuery' + +new Date(),
                                    id: 'queryqrhz',
                                    key1: taxNo,
                                    key2: govToken,
                                    ymbb: _diskOperate.ymbb
                                }),
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 11:
                        res = _context4.sent;

                        if (!(res.errcode !== '0000')) {
                            _context4.next = 14;
                            break;
                        }

                        return _context4.abrupt('return', res);

                    case 14:

                        if (res.data) {
                            e = res.data;
                            t = e.key1;
                            s = e.key2;
                            o = e.key4;

                            if (t === '00') {
                                defatultTip.errcode = 'err';
                                defatultTip.description = '获取汇总信息异常，请稍后重试！';
                            } else if ('01' === t) {
                                if ('' !== s) {
                                    if (Number(o) > 0) {
                                        ljhzxxfs = s;
                                        r = s.split("*");
                                        i = r[0].split("~");
                                        bchxzzfs = r[0];
                                        a = r[1].split("~");

                                        ljhzxxfs = r[1];
                                        signature = r[2];

                                        govToken = e.key3;
                                        setCookie("govToken", govToken, _loginToGov.govCacheSeconds);
                                        defatultTip.errcode = '0000';
                                        defatultTip.data = { signature: signature, bchxzzfs: bchxzzfs, ljhzxxfs: ljhzxxfs, hasData: true };
                                        defatultTip.description = '';
                                    } else {
                                        defatultTip.description = '当前没有可以确认的数据！';
                                        defatultTip.errcode = '0000';
                                        defatultTip.data = { hasData: false };
                                    }
                                }
                            } else if ('09' === t) {
                                clearCookie("govToken");
                                defatultTip.description = '税局请求超时，请重试';
                            }
                        }
                        return _context4.abrupt('return', defatultTip);

                    case 16:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getGXSumaryInfo(_x5) {
        return _ref5.apply(this, arguments);
    };
}();

var querysbzt = exports.querysbzt = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref7) {
        var passwd = _ref7.passwd,
            ptPasswd = _ref7.ptPasswd;

        var loginRes, _loginRes$data3, govToken, taxNo, baseUrl, companyType, skssqs, res, t, s, o, data;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd });

                    case 2:
                        loginRes = _context5.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context5.next = 5;
                            break;
                        }

                        return _context5.abrupt('return', res);

                    case 5:
                        _loginRes$data3 = loginRes.data, govToken = _loginRes$data3.govToken, taxNo = _loginRes$data3.taxNo, baseUrl = _loginRes$data3.baseUrl, companyType = _loginRes$data3.companyType;

                        if (!(companyType !== '03')) {
                            _context5.next = 8;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 8:
                        skssqs = decodeURIComponent(getCookie('skssq')).split(';');
                        _context5.next = 11;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                headers: (0, _extends3.default)({}, fpdkHeaders, {
                                    'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                                    'Cookie': getFpdkCookies()
                                }),
                                requestUrl: baseUrl + 'SbsqWW/qrgx.do?callback=' + 'jQuery' + +new Date(),
                                requestData: 'id=querysbzt&key1=' + taxNo + '&key2=' + govToken + '&ymbb=' + _diskOperate.ymbb,
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 11:
                        res = _context5.sent;

                        if (!(res.errcode === '0000')) {
                            _context5.next = 36;
                            break;
                        }

                        t = res.data;
                        s = t.key1;
                        o = t.key2;
                        data = { skssq: skssqs };

                        if (!("0" == o)) {
                            _context5.next = 21;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '7002', description: '查询您税款所属期' + skssqs[0] + '的申报状态出现异常，请稍后再试' });

                    case 21:
                        if (!("01" == s && "3" == o)) {
                            _context5.next = 25;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: 'sbztUnkown', data: data, description: '因未能获取到您税款所属期' + skssqs[0] + '的申报结果状态，请您选择是否已完成税款所属期' });

                    case 25:
                        if (!("01" == s && "2" == o)) {
                            _context5.next = 29;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: 'sbztFinish', data: data, description: '平台获取到您税款所属期' + skssqs[0] + '的申报工作已完成，本批次发票请您在下期进行勾选认证操作!' });

                    case 29:
                        if (!("01" == s && "1" == o)) {
                            _context5.next = 33;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: 'sbztUnkown', data: data, description: '因未能获取到您税款所属期' + skssqs[0] + '的申报结果信息有延迟，请您选择是否已完成税款所属期' });

                    case 33:
                        return _context5.abrupt('return', { errcode: '8001', data: data, description: '获取申报状态异常，请重试' });

                    case 34:
                        _context5.next = 37;
                        break;

                    case 36:
                        return _context5.abrupt('return', res);

                    case 37:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function querysbzt(_x6) {
        return _ref6.apply(this, arguments);
    };
}();

var rollback = exports.rollback = function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(_ref9) {
        var passwd = _ref9.passwd,
            ptPasswd = _ref9.ptPasswd;

        var loginRes, _loginRes$data4, govToken, taxNo, baseUrl, companyType, skssqs, res, e, t;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd });

                    case 2:
                        loginRes = _context6.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context6.next = 5;
                            break;
                        }

                        return _context6.abrupt('return', res);

                    case 5:
                        _loginRes$data4 = loginRes.data, govToken = _loginRes$data4.govToken, taxNo = _loginRes$data4.taxNo, baseUrl = _loginRes$data4.baseUrl, companyType = _loginRes$data4.companyType;

                        if (!(companyType !== '03')) {
                            _context6.next = 8;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 8:
                        skssqs = decodeURIComponent(getCookie('skssq')).split(';');
                        _context6.next = 11;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                headers: (0, _extends3.default)({}, fpdkHeaders, {
                                    'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                                    'Cookie': getFpdkCookies()
                                }),
                                requestUrl: baseUrl + 'SbsqWW/qrgx.do?callback=' + 'jQuery' + +new Date(),
                                requestData: 'id=rollback&key1=' + taxNo + '&key2=' + govToken + '&ymbb=' + _diskOperate.ymbb,
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 11:
                        res = _context6.sent;

                        if (!(res.errcode === '0000')) {
                            _context6.next = 30;
                            break;
                        }

                        e = res.data;
                        t = e.key1;

                        if (!("01" == t)) {
                            _context6.next = 22;
                            break;
                        }

                        clearCookie("govToken");
                        setCookie("govToken", e.key2, _loginToGov.govCacheSeconds);
                        setCookie("skssq", e.key3, _loginToGov.govCacheSeconds);

                        return _context6.abrupt('return', { errcode: '0000', description: 'success' });

                    case 22:
                        if (!('09' == t)) {
                            _context6.next = 27;
                            break;
                        }

                        clearCookie("govToken");
                        return _context6.abrupt('return', { errcode: '1300', description: 'CA会话失效，请重试！' });

                    case 27:
                        return _context6.abrupt('return', { errcode: '1300', description: '更换您的税款所属期出现异常，请重试!' });

                    case 28:
                        _context6.next = 31;
                        break;

                    case 30:
                        return _context6.abrupt('return', res);

                    case 31:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function rollback(_x7) {
        return _ref8.apply(this, arguments);
    };
}();

var gxConfirm = exports.gxConfirm = function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(gxInfos) {
        var passwd, ptPasswd, fpdm, fphm, sbzt, res, _res$data, govToken, taxNo, baseUrl, companyType, skssqs, sbztRes, sumaryRes, _sumaryRes$data, signature, hasData, searchParam;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, fpdm = gxInfos.fpdm, fphm = gxInfos.fphm;
                        sbzt = gxInfos.sbzt || '';
                        _context7.next = 4;
                        return (0, _loginToGov.login)({ passwd: passwd, ptPasswd: ptPasswd }, true);

                    case 4:
                        res = _context7.sent;

                        if (!(res.errcode !== '0000')) {
                            _context7.next = 7;
                            break;
                        }

                        return _context7.abrupt('return', res);

                    case 7:
                        _res$data = res.data, govToken = _res$data.govToken, taxNo = _res$data.taxNo, baseUrl = _res$data.baseUrl, companyType = _res$data.companyType;

                        if (!(companyType !== '03')) {
                            _context7.next = 10;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 10:
                        skssqs = decodeURIComponent(getCookie('skssq')).split(';');

                        if (!(skssqs[0] !== skssqs[2])) {
                            _context7.next = 29;
                            break;
                        }

                        if (!(sbzt === '3')) {
                            _context7.next = 16;
                            break;
                        }

                        return _context7.abrupt('return', { 'errcode': 'stopGoOn', description: '请先确定当前税控所属期的申报状态，再进行确认！' });

                    case 16:
                        _context7.next = 18;
                        return querysbzt({ passwd: passwd, ptPasswd: ptPasswd });

                    case 18:
                        sbztRes = _context7.sent;

                        if (!(sbztRes.errcode === 'sbztUnkown' && sbzt !== '1' && sbzt !== '2')) {
                            _context7.next = 23;
                            break;
                        }

                        return _context7.abrupt('return', sbztRes);

                    case 23:
                        if (!(sbzt.errcode === 'sbztFinish')) {
                            _context7.next = 27;
                            break;
                        }

                        sbzt = '2';
                        _context7.next = 29;
                        break;

                    case 27:
                        if (!(sbzt === '')) {
                            _context7.next = 29;
                            break;
                        }

                        return _context7.abrupt('return', sbztRes);

                    case 29:
                        _context7.next = 31;
                        return getGXSumaryInfo({ passwd: passwd, ptPasswd: ptPasswd, baseUrl: baseUrl });

                    case 31:
                        sumaryRes = _context7.sent;

                        if (!(sumaryRes.errcode !== '0000')) {
                            _context7.next = 34;
                            break;
                        }

                        return _context7.abrupt('return', sumaryRes);

                    case 34:
                        _sumaryRes$data = sumaryRes.data, signature = _sumaryRes$data.signature, hasData = _sumaryRes$data.hasData;

                        if (hasData) {
                            _context7.next = 37;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '3000', description: '当前没有可以确认的发票!' });

                    case 37:
                        searchParam = (0, _utils.paramJson)({
                            id: 'commitqrxx',
                            key1: taxNo,
                            key2: getCookie('govToken'),
                            signature: signature,
                            ymbb: _diskOperate.ymbb
                        });
                        _context7.next = 40;
                        return (0, _utils.kdRequest)({
                            url: _loginToGov.forwardUrl,
                            timeout: 30000,
                            data: {
                                headers: (0, _extends3.default)({}, fpdkHeaders, {
                                    'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                                    'Cookie': getFpdkCookies()
                                }),
                                requestUrl: baseUrl + 'SbsqWW/qrgx.do?callback=' + 'jQuery' + +new Date(),
                                requestData: searchParam,
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 40:
                        res = _context7.sent;


                        if (res.errcode === '0000') {
                            setCookie("govToken", res.token, _loginToGov.govCacheSeconds);
                        }
                        return _context7.abrupt('return', res);

                    case 43:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function gxConfirm(_x8) {
        return _ref10.apply(this, arguments);
    };
}();

var _diskOperate = require('./diskOperate');

var _swjgInfo = require('@piaozone.com/swjgInfo');

var _loginToGov = require('./loginToGov');

var _queryIncomeInvoice = require('./queryIncomeInvoice');

var _utils = require('@piaozone.com/utils');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var setCookie = _utils.cookieHelp.setCookie,
    getCookie = _utils.cookieHelp.getCookie,
    clearCookie = _utils.cookieHelp.clearCookie;

var defaultPageSize = 100;

var fpdkHeaders = {
    'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept-Encoding': 'gzip, deflate',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Connection': 'Keep-Alive',
    'Cache-Control': 'no-cache'
};


function getMinMaxDate(kprqs) {
    var minDateIndex = 0;
    var maxDateIndex = 0;

    for (var i = 1; i < kprqs.length; i++) {
        var curDate = +new Date(kprqs[i]);
        var maxDate = +new Date(kprqs[maxDateIndex]);
        var minDate = +new Date(kprqs[minDateIndex]);

        if (curDate > maxDate) {
            maxDateIndex = i;
        }

        if (curDate < minDate) {
            minDateIndex = i;
        }
    }

    return { min: kprqs[minDateIndex], max: kprqs[maxDateIndex] };
}

function findGxResult(fpdms, fphms, target) {
    var len = fpdms.length;
    var rLen = target.length;
    var result = {};
    var errorList = [];

    for (var i = 0; i < len; i++) {
        var flag = false;
        var fpdm = fpdms[i];
        var fphm = fphms[i];
        for (var j = 0; j < rLen; j++) {
            if (target[j].invoiceCode === fpdm && target[j].invoiceNo === fphm) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            errorList.push({ fpdm: fpdm, fphm: fphm });
        }
    }

    if (errorList.length === 0) {
        return { errcode: '0000', description: 'success' };
    } else {
        return { errcode: '2000', data: errorList, description: '发票勾选保存失败！' };
    }
}

function getFpdkCookies() {
    var skssq = getCookie('skssq');
    var gxrqfw = getCookie('gxrqfw');
    var dqrq = (0, _moment2.default)().format('YYYY-MM-DD');
    var nsrmc = getCookie('nsrmc');
    var token = getCookie('govToken');

    if (token && skssq && gxrqfw) {
        return 'skssq=' + skssq + '; gxrqfw=' + gxrqfw + '; dqrq=' + dqrq + '; nsrmc=' + nsrmc + '; token=' + token;
    } else {
        return false;
    }
}
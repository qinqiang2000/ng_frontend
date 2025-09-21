'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.companyAuth = exports.login = exports.getGxPublicKey = exports.getQrgycx = exports.govCacheSeconds = exports.fpdkSecondLogin = exports.authURI = exports.forwardUrl = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var firstLogin = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref3) {
        var baseUrl = _ref3.baseUrl,
            passwd = _ref3.passwd,
            city = _ref3.city,
            taxNo = _ref3.taxNo,
            clientHello = _ref3.clientHello;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var res, resultData;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!city) {
                            _context.next = 44;
                            break;
                        }

                        _context.next = 3;
                        return (0, _utils.kdRequest)({
                            url: forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + "SbsqWW/login.do",
                                requestData: { 'callback': 'jQuery' + +new Date(), "type": "CLIENT-HELLO", "clientHello": clientHello, "ymbb": _diskOperate.ymbb, mmtype: '2', answer: '' },
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 3:
                        res = _context.sent;

                        if (!res) {
                            _context.next = 37;
                            break;
                        }

                        if (!(res.errcode !== '0000')) {
                            _context.next = 13;
                            break;
                        }

                        if (!(retry > retryMax)) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 10:
                        _context.next = 12;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello }, retry + 1);

                    case 12:
                        return _context.abrupt('return', _context.sent);

                    case 13:
                        if (!res.data) {
                            _context.next = 28;
                            break;
                        }

                        resultData = res.data;

                        if (!(resultData.key2 !== '')) {
                            _context.next = 19;
                            break;
                        }

                        return _context.abrupt('return', (0, _extends3.default)({}, resultData, { errcode: '0000' }));

                    case 19:
                        if (!(retry > retryMax)) {
                            _context.next = 23;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '8000', description: '企业认证异常，请重试!' });

                    case 23:
                        _context.next = 25;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello }, retry + 1);

                    case 25:
                        return _context.abrupt('return', _context.sent);

                    case 26:
                        _context.next = 35;
                        break;

                    case 28:
                        if (!(retry > retryMax)) {
                            _context.next = 32;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '8000', description: '税局访问异常' });

                    case 32:
                        _context.next = 34;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello }, retry + 1);

                    case 34:
                        return _context.abrupt('return', _context.sent);

                    case 35:
                        _context.next = 44;
                        break;

                    case 37:
                        if (!(retry > retryMax)) {
                            _context.next = 41;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '8000', description: '税局访问异常' });

                    case 41:
                        _context.next = 43;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello }, retry + 1);

                    case 43:
                        return _context.abrupt('return', _context.sent);

                    case 44:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function firstLogin(_x) {
        return _ref2.apply(this, arguments);
    };
}();

var getPublicKey = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(serverRandom, taxNo) {
        var funType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '01';
        var city = arguments[3];
        var baseUrl, res, twoResData, govPage, ts, publickey;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        baseUrl = (0, _swjgInfo.getBaseUrl)(city);
                        _context2.next = 3;
                        return (0, _utils.kdRequest)({
                            url: forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + "SbsqWW/querymm.do?callback=jQuery" + +new Date() + '&cert=' + taxNo + '&funType=' + funType,
                                requestData: {},
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 3:
                        res = _context2.sent;

                        if (!res) {
                            _context2.next = 19;
                            break;
                        }

                        if (!(res.errcode !== '0000')) {
                            _context2.next = 7;
                            break;
                        }

                        return _context2.abrupt('return', res);

                    case 7:
                        twoResData = res.data;
                        _context2.prev = 8;
                        govPage = twoResData['page'];
                        ts = twoResData['ts'];
                        publickey = '';


                        if (govPage != '') {
                            publickey = window.$.checkTaxno(taxNo, ts, '', govPage, serverRandom);
                        }

                        return _context2.abrupt('return', { publickey: publickey, ts: ts, errcode: '0000' });

                    case 16:
                        _context2.prev = 16;
                        _context2.t0 = _context2['catch'](8);
                        return _context2.abrupt('return', { errcode: '0003', description: '税局验证异常' });

                    case 19:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[8, 16]]);
    }));

    return function getPublicKey(_x3, _x4) {
        return _ref4.apply(this, arguments);
    };
}();

var getQrgycx = exports.getQrgycx = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref6) {
        var govToken = _ref6.govToken,
            city = _ref6.city,
            taxNo = _ref6.taxNo;
        var baseUrl, p, res, newToken, skssq, gxrqfw;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        baseUrl = (0, _swjgInfo.getBaseUrl)(city);

                        if (baseUrl) {
                            _context3.next = 3;
                            break;
                        }

                        return _context3.abrupt('return', { 'errcode': '1000', 'description': '城市错误', data: [] });

                    case 3:
                        p = { 'cert': taxNo, 'token': govToken, 'rznf': '', 'ymbb': _diskOperate.ymbb };
                        _context3.next = 6;
                        return (0, _utils.kdRequest)({
                            url: forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + 'SbsqWW/qrgycx.do?callback=jQuery' + +new Date() + '&' + (0, _utils.paramJson)(p),
                                requestData: {},
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 6:
                        res = _context3.sent;

                        if (!(res.errcode === '0000')) {
                            _context3.next = 25;
                            break;
                        }

                        _context3.prev = 8;

                        res = res.data;

                        if (!(res.key1 == '01')) {
                            _context3.next = 17;
                            break;
                        }

                        newToken = res.key4;
                        skssq = res.key5;
                        gxrqfw = res.key6;
                        return _context3.abrupt('return', { errcode: '0000', govToken: newToken, gxrqfw: gxrqfw, skssq: skssq });

                    case 17:
                        return _context3.abrupt('return', { errcode: '8000', description: '获取税控所属期出错' });

                    case 18:
                        _context3.next = 23;
                        break;

                    case 20:
                        _context3.prev = 20;
                        _context3.t0 = _context3['catch'](8);
                        return _context3.abrupt('return', { errcode: '8003', description: '税局验证异常' });

                    case 23:
                        _context3.next = 26;
                        break;

                    case 25:
                        return _context3.abrupt('return', { errcode: '8003', description: '税局验证异常' });

                    case 26:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[8, 20]]);
    }));

    return function getQrgycx(_x6) {
        return _ref5.apply(this, arguments);
    };
}();

var getGxPublicKey = exports.getGxPublicKey = function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref8) {
        var govToken = _ref8.govToken,
            baseUrl = _ref8.baseUrl,
            taxNo = _ref8.taxNo,
            funType = _ref8.funType;
        var res, twoResData, govPage, ts, publickey;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return (0, _utils.kdRequest)({
                            url: forwardUrl,
                            timeout: 30000,
                            data: {
                                requestUrl: baseUrl + "SbsqWW/querymm.do?callback=jQuery" + +new Date(),
                                requestData: { cert: taxNo, funType: funType },
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 2:
                        res = _context4.sent;

                        if (!res) {
                            _context4.next = 18;
                            break;
                        }

                        if (!(res.errcode !== '0000')) {
                            _context4.next = 6;
                            break;
                        }

                        return _context4.abrupt('return', res);

                    case 6:
                        twoResData = res.data;
                        _context4.prev = 7;
                        govPage = twoResData['page'];
                        ts = twoResData['ts'];
                        publickey = '';

                        if (govPage != '') {
                            publickey = window.checkInvConf(taxNo, govToken, ts, '', govPage);
                        }
                        return _context4.abrupt('return', { publickey: publickey, ts: ts, errcode: '0000' });

                    case 15:
                        _context4.prev = 15;
                        _context4.t0 = _context4['catch'](7);
                        return _context4.abrupt('return', { errcode: '0003', description: '税局验证异常' });

                    case 18:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[7, 15]]);
    }));

    return function getGxPublicKey(_x7) {
        return _ref7.apply(this, arguments);
    };
}();

var secondLogin = function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref10) {
        var _ref10$loginType = _ref10.loginType,
            loginType = _ref10$loginType === undefined ? 'auth' : _ref10$loginType,
            fid = _ref10.fid,
            companyName = _ref10.companyName,
            _ref10$mmtype = _ref10.mmtype,
            mmtype = _ref10$mmtype === undefined ? '' : _ref10$mmtype,
            clientAuthCode = _ref10.clientAuthCode,
            serverRandom = _ref10.serverRandom,
            ptPasswd = _ref10.ptPasswd,
            taxNo = _ref10.taxNo,
            ts = _ref10.ts,
            publickey = _ref10.publickey,
            _ref10$answer = _ref10.answer,
            answer = _ref10$answer === undefined ? '' : _ref10$answer,
            _ref10$type = _ref10.type,
            type = _ref10$type === undefined ? '' : _ref10$type;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var param2, loginRes;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        param2 = {};


                        if (mmtype === '1') {
                            param2 = {
                                "type": "CLIENT-AUTH",
                                "clientAuthCode": clientAuthCode,
                                "serverRandom": serverRandom,
                                "password": ptPasswd,
                                "cert": taxNo,
                                "ymbb": _diskOperate.ymbb,
                                "ts": ts,
                                "publickey": publickey,
                                "mmtype": "1"
                            };
                        } else if (mmtype === '2') {
                            param2 = {
                                "type": "CLIENT-AUTH",
                                "clientAuthCode": clientAuthCode,
                                "serverRandom": serverRandom,
                                "password": ptPasswd,
                                "cert": taxNo,
                                "ymbb": _diskOperate.ymbb,
                                "ts": ts,
                                "publickey": publickey,
                                "mmtype": "2",
                                "answer": answer
                            };
                        } else {
                            param2 = {
                                "type": "CLIENT-AUTH",
                                "clientAuthCode": clientAuthCode,
                                "serverRandom": serverRandom,
                                "password": ptPasswd,
                                "ts": ts,
                                "publickey": publickey,
                                "cert": taxNo,
                                "ymbb": _diskOperate.ymbb
                            };
                        }

                        loginRes = void 0;

                        if (!(loginType === 'auth')) {
                            _context5.next = 9;
                            break;
                        }

                        _context5.next = 6;
                        return (0, _utils.kdRequest)({
                            url: authURI,
                            data: {
                                fid: fid,
                                type: type,
                                ftax_number: taxNo,
                                companyName: companyName,
                                requestUrl: 'SbsqWW/login.do?callback=jQuery' + +new Date(),
                                requestData: param2,
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 6:
                        loginRes = _context5.sent;
                        _context5.next = 12;
                        break;

                    case 9:
                        _context5.next = 11;
                        return (0, _utils.kdRequest)({
                            url: fpdkSecondLogin,
                            data: {
                                requestData: param2
                            },
                            method: 'POST'
                        });

                    case 11:
                        loginRes = _context5.sent;

                    case 12:
                        if (!loginRes) {
                            _context5.next = 28;
                            break;
                        }

                        if (!(loginRes.errcode === '0000')) {
                            _context5.next = 17;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '0000', data: loginRes.data });

                    case 17:
                        if (!(loginRes.errcode === '0932')) {
                            _context5.next = 27;
                            break;
                        }

                        if (!(retry < retryMax)) {
                            _context5.next = 24;
                            break;
                        }

                        _context5.next = 21;
                        return secondLogin({ loginType: loginType, fid: fid, companyName: companyName, mmtype: mmtype, clientAuthCode: clientAuthCode, serverRandom: serverRandom, ptPasswd: ptPasswd, taxNo: taxNo, ts: ts, publickey: publickey, answer: answer, type: type, city: city }, retry + 1);

                    case 21:
                        return _context5.abrupt('return', _context5.sent);

                    case 24:
                        return _context5.abrupt('return', { errcode: '0932', data: loginRes.data, description: '税局验证异常，请重试！' });

                    case 25:
                        _context5.next = 28;
                        break;

                    case 27:
                        return _context5.abrupt('return', { errcode: '8000', description: loginRes.description });

                    case 28:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function secondLogin(_x8) {
        return _ref9.apply(this, arguments);
    };
}();

var login = exports.login = function () {
    var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(_ref12) {
        var _ref12$passwd = _ref12.passwd,
            passwd = _ref12$passwd === undefined ? '' : _ref12$passwd,
            _ref12$ptPasswd = _ref12.ptPasswd,
            ptPasswd = _ref12$ptPasswd === undefined ? '' : _ref12$ptPasswd,
            _ref12$type = _ref12.type,
            type = _ref12$type === undefined ? '' : _ref12$type,
            _ref12$fid = _ref12.fid,
            fid = _ref12$fid === undefined ? '' : _ref12$fid,
            _ref12$taxNo = _ref12.taxNo,
            taxNo = _ref12$taxNo === undefined ? '' : _ref12$taxNo,
            _ref12$companyName = _ref12.companyName,
            companyName = _ref12$companyName === undefined ? '' : _ref12$companyName,
            _ref12$loginType = _ref12.loginType,
            loginType = _ref12$loginType === undefined ? 'forward' : _ref12$loginType;
        var clearFlag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var oldToken, gxrqfw, skssq, companyType, _baseUrl, _taxNo, nsrmc, taxInfo, diskTaxNo, comInfo, diskCompanyName, city, baseUrl, openRes, clientHelloRes, data, serverPacket, serverRandom, resAuthCodeData, resKeyData, result, _result$data, _result$data$gxrqfw, _gxrqfw, _result$data$skssq, _skssq, _result$data$key, key2, _result$data$key2, key3, _companyType;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        if (!(passwd === '')) {
                            _context6.next = 2;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '3000', description: '税盘密码不能为空!' });

                    case 2:
                        if (!clearFlag) {
                            _context6.next = 12;
                            break;
                        }

                        clearCookie('gxrqfw');
                        clearCookie('skssq');
                        clearCookie('govCompanyType');
                        clearCookie('govToken');
                        clearCookie('baseUrl');
                        clearCookie('taxNo');
                        clearCookie('nsrmc');
                        _context6.next = 21;
                        break;

                    case 12:
                        oldToken = getCookie('govToken');
                        gxrqfw = getCookie('gxrqfw');
                        skssq = getCookie('skssq');
                        companyType = getCookie('govCompanyType');
                        _baseUrl = getCookie('baseUrl');
                        _taxNo = getCookie('taxNo');
                        nsrmc = getCookie('nsrmc');

                        if (!(oldToken && gxrqfw && skssq && companyType && _baseUrl && _taxNo && nsrmc)) {
                            _context6.next = 21;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '0000', data: { gxrqfw: gxrqfw, skssq: skssq, companyType: companyType, govToken: oldToken, baseUrl: _baseUrl, taxNo: _taxNo, nsrmc: nsrmc } });

                    case 21:
                        _context6.next = 23;
                        return (0, _diskOperate.getTaxInfoFromDisk)(passwd, 71);

                    case 23:
                        taxInfo = _context6.sent;

                        if (!(taxInfo.errcode !== '0000')) {
                            _context6.next = 26;
                            break;
                        }

                        return _context6.abrupt('return', taxInfo);

                    case 26:
                        diskTaxNo = taxInfo.data;

                        if (!(loginType === 'auth' && taxNo !== '' && diskTaxNo !== taxNo)) {
                            _context6.next = 29;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: 'taxNoErr', description: '请检查税号是否与税盘一致!' });

                    case 29:
                        _context6.next = 31;
                        return (0, _diskOperate.getTaxInfoFromDisk)(passwd, 27);

                    case 31:
                        comInfo = _context6.sent;

                        if (!(comInfo.errcode !== '0000')) {
                            _context6.next = 34;
                            break;
                        }

                        return _context6.abrupt('return', comInfo);

                    case 34:
                        diskCompanyName = comInfo.data;

                        if (!(loginType === 'auth' && companyName !== '' && diskCompanyName.replaceInclude() !== companyName.replaceInclude())) {
                            _context6.next = 37;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: 'companyNameErr', description: '请检查企业名称是否与税盘一致!' });

                    case 37:
                        city = (0, _swjgInfo.getCityNameByTaxNo)(diskTaxNo);

                        if (city) {
                            _context6.next = 40;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '6000', description: '请检查税号是否正确!' });

                    case 40:
                        baseUrl = (0, _swjgInfo.getBaseUrl)(city);
                        _context6.next = 43;
                        return (0, _diskOperate.openDevice)(passwd);

                    case 43:
                        openRes = _context6.sent;

                        if (!(openRes.errcode !== '0000')) {
                            _context6.next = 46;
                            break;
                        }

                        return _context6.abrupt('return', openRes);

                    case 46:
                        _context6.next = 48;
                        return (0, _diskOperate.getClientHello)(passwd);

                    case 48:
                        clientHelloRes = _context6.sent;

                        if (!(clientHelloRes.errcode !== '0000')) {
                            _context6.next = 51;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: clientHelloRes.errcode, description: clientHelloRes.description });

                    case 51:
                        _context6.next = 53;
                        return firstLogin({
                            baseUrl: baseUrl,
                            passwd: passwd,
                            city: city,
                            taxNo: diskTaxNo,
                            clientHello: clientHelloRes.data
                        }, 1);

                    case 53:
                        data = _context6.sent;

                        if (!(data.errcode === '0000')) {
                            _context6.next = 75;
                            break;
                        }

                        serverPacket = data.key2;
                        serverRandom = data.key3;
                        _context6.next = 59;
                        return (0, _diskOperate.getClientAuthCode)(passwd, serverPacket);

                    case 59:
                        resAuthCodeData = _context6.sent;

                        if (!(resAuthCodeData.errcode !== '0000')) {
                            _context6.next = 62;
                            break;
                        }

                        return _context6.abrupt('return', resAuthCodeData);

                    case 62:
                        _context6.next = 64;
                        return getPublicKey(serverRandom, diskTaxNo, '01', city);

                    case 64:
                        resKeyData = _context6.sent;

                        if (!(resKeyData.errcode !== '0000')) {
                            _context6.next = 67;
                            break;
                        }

                        return _context6.abrupt('return', resKeyData);

                    case 67:
                        _context6.next = 69;
                        return secondLogin({
                            loginType: loginType,
                            fid: fid,
                            type: type,
                            companyName: diskCompanyName,
                            clientAuthCode: resAuthCodeData.data,
                            serverRandom: serverRandom,
                            ptPasswd: ptPasswd,
                            taxNo: diskTaxNo,
                            ts: resKeyData.ts,
                            publickey: resKeyData.publickey
                        }, 1);

                    case 69:
                        result = _context6.sent;


                        if (result.errcode === '0000') {
                            _result$data = result.data, _result$data$gxrqfw = _result$data.gxrqfw, _gxrqfw = _result$data$gxrqfw === undefined ? '' : _result$data$gxrqfw, _result$data$skssq = _result$data.skssq, _skssq = _result$data$skssq === undefined ? '' : _result$data$skssq, _result$data$key = _result$data.key2, key2 = _result$data$key === undefined ? '' : _result$data$key, _result$data$key2 = _result$data.key3, key3 = _result$data$key2 === undefined ? '' : _result$data$key2, _companyType = _result$data.companyType;

                            setCookie('gxrqfw', _gxrqfw, govCacheSeconds);
                            setCookie('skssq', encodeURIComponent(_skssq), govCacheSeconds);
                            setCookie('govCompanyType', _companyType, govCacheSeconds);
                            setCookie('govToken', result.data.govToken, govCacheSeconds);
                            setCookie('baseUrl', baseUrl, govCacheSeconds);
                            setCookie('taxNo', diskTaxNo, govCacheSeconds);
                            setCookie('nsrmc', encodeURIComponent(diskCompanyName), govCacheSeconds);
                        }
                        result.baseUrl = baseUrl;
                        return _context6.abrupt('return', result);

                    case 75:
                        return _context6.abrupt('return', data);

                    case 76:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function login(_x10) {
        return _ref11.apply(this, arguments);
    };
}();

var companyAuth = exports.companyAuth = function () {
    var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(opt) {
        var passwd, _opt$ptPasswd, ptPasswd, _opt$type, type, _opt$fid, fid, _opt$taxNo, taxNo, _opt$companyName, companyName;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        passwd = opt.passwd, _opt$ptPasswd = opt.ptPasswd, ptPasswd = _opt$ptPasswd === undefined ? '' : _opt$ptPasswd, _opt$type = opt.type, type = _opt$type === undefined ? '' : _opt$type, _opt$fid = opt.fid, fid = _opt$fid === undefined ? '' : _opt$fid, _opt$taxNo = opt.taxNo, taxNo = _opt$taxNo === undefined ? '' : _opt$taxNo, _opt$companyName = opt.companyName, companyName = _opt$companyName === undefined ? '' : _opt$companyName;

                        if (!(taxNo === '')) {
                            _context7.next = 5;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '3000', description: '请输入正确的税号!' });

                    case 5:
                        if (!(companyName === '')) {
                            _context7.next = 9;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '3000', description: '认证企业名称不能为空!' });

                    case 9:
                        if (!(fid === '')) {
                            _context7.next = 13;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '3000', description: '认证参数不全，请检查' });

                    case 13:
                        return _context7.abrupt('return', login((0, _extends3.default)({}, opt, { loginType: 'auth' }), true));

                    case 14:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function companyAuth(_x12) {
        return _ref13.apply(this, arguments);
    };
}();

exports.setUrls = setUrls;

var _diskOperate = require('./diskOperate');

var _swjgInfo = require('@piaozone.com/swjgInfo');

var _utils = require('@piaozone.com/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var forwardUrl = exports.forwardUrl = '/portal/forward';
var authURI = exports.authURI = '/portal/companyAuth';
var fpdkSecondLogin = exports.fpdkSecondLogin = '/portal/fpdkLogin';

var setCookie = _utils.cookieHelp.setCookie,
    getCookie = _utils.cookieHelp.getCookie,
    clearCookie = _utils.cookieHelp.clearCookie;


var retryMax = 3;
var govCacheSeconds = exports.govCacheSeconds = 3000;
var pwyCacheSeconds = 3600 * 24 * 2.5;
var callbackStr = 'callback=jQuery' + +new Date();

var headers = ['User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko', 'Referer: https://fpdk.jsgs.gov.cn:81/', 'Host: fpdk.jsgs.gov.cn:81', 'Content-Type: application/x-www-form-urlencoded;charset=utf-8', 'Connection: Keep-Alive', 'X-Requested-With: XMLHttpRequest', 'Cache-Control: no-cache'];

function setUrls(_ref) {
    var _ref$forwardURI = _ref.forwardURI,
        forwardURI = _ref$forwardURI === undefined ? '/portal/forward' : _ref$forwardURI,
        _ref$authURI = _ref.authURI,
        authURI = _ref$authURI === undefined ? '/portal/companyAuth' : _ref$authURI,
        _ref$caOperateUrl = _ref.caOperateUrl,
        caOperateUrl = _ref$caOperateUrl === undefined ? 'http://127.0.0.1:52320/cryptctl' : _ref$caOperateUrl;

    exports.forwardUrl = forwardUrl = forwardURI;
    authURI = authURI;
    (0, _diskOperate.setOperateUrl)(caOperateUrl);
}
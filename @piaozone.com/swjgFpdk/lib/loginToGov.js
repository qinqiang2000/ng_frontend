import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getGloabalInfo = function () {
    var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(baseUrl, text) {
        var m, res, resText;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        m = text.match(/(js\/cookies\.[a-z0-9]+\.js)/);

                        if (!(m && m.length > 0)) {
                            _context.next = 6;
                            break;
                        }

                        _context.next = 4;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-:\.]+\/)(.*)$/, '$1') + m[0],
                                requestData: { op: 'getText' },
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 4:
                        res = _context.sent;


                        if (res.errcode === '0000') {
                            resText = res.data;

                            window.FPDK_GOV_VERSION = resText.replace(/^.*VERSION\ ?=\ ?"(V[[0-9\.]+)".*$/g, '$1');
                            window.FPDK_GOV_VERSION_INT = parseInt(window.FPDK_GOV_VERSION.replace(/[V\.]/g, ''));
                        }

                    case 6:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getGloabalInfo(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
}();

var firstLogin = function () {
    var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(_ref5) {
        var baseUrl = _ref5.baseUrl,
            passwd = _ref5.passwd,
            city = _ref5.city,
            taxNo = _ref5.taxNo,
            clientHello = _ref5.clientHello,
            mmtype = _ref5.mmtype,
            answer = _ref5.answer;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var ymbb, res, resultData;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (!city) {
                            _context3.next = 45;
                            break;
                        }

                        ymbb = getCookie('ymbb');
                        _context3.next = 4;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                city: city,
                                baseUrl: baseUrl,
                                requestUrl: baseUrl + "login.do?callback=" + createJsonpCallback(),
                                requestData: paramJson({ "type": "CLIENT-HELLO", "clientHello": clientHello, "ymbb": ymbb, mmtype: mmtype, answer: answer }),
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 4:
                        res = _context3.sent;

                        if (!res) {
                            _context3.next = 38;
                            break;
                        }

                        if (!(res.errcode !== '0000')) {
                            _context3.next = 14;
                            break;
                        }

                        if (!(retry > retryMax)) {
                            _context3.next = 11;
                            break;
                        }

                        return _context3.abrupt('return', res);

                    case 11:
                        _context3.next = 13;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello, mmtype: mmtype, answer: answer }, retry + 1);

                    case 13:
                        return _context3.abrupt('return', _context3.sent);

                    case 14:
                        if (!res.data) {
                            _context3.next = 29;
                            break;
                        }

                        resultData = res.data;

                        if (!(resultData.key2 !== '')) {
                            _context3.next = 20;
                            break;
                        }

                        return _context3.abrupt('return', _extends({}, resultData, { errcode: '0000' }));

                    case 20:
                        if (!(retry > retryMax)) {
                            _context3.next = 24;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '8000', description: '企业认证异常，请重试!' });

                    case 24:
                        _context3.next = 26;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello, mmtype: mmtype, answer: answer }, retry + 1);

                    case 26:
                        return _context3.abrupt('return', _context3.sent);

                    case 27:
                        _context3.next = 36;
                        break;

                    case 29:
                        if (!(retry > retryMax)) {
                            _context3.next = 33;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '8000', description: '税局访问异常' });

                    case 33:
                        _context3.next = 35;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello, mmtype: mmtype, answer: answer }, retry + 1);

                    case 35:
                        return _context3.abrupt('return', _context3.sent);

                    case 36:
                        _context3.next = 45;
                        break;

                    case 38:
                        if (!(retry > retryMax)) {
                            _context3.next = 42;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '8000', description: '税局访问异常' });

                    case 42:
                        _context3.next = 44;
                        return firstLogin({ baseUrl: baseUrl, passwd: passwd, city: city, taxNo: taxNo, clientHello: clientHello, mmtype: mmtype, answer: answer }, retry + 1);

                    case 44:
                        return _context3.abrupt('return', _context3.sent);

                    case 45:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function firstLogin(_x4) {
        return _ref4.apply(this, arguments);
    };
}();

var getPublicKey = function () {
    var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(serverRandom, taxNo) {
        var funType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '01';
        var city = arguments[3];
        var baseUrl = arguments[4];
        var ymbb, res, twoResData, govPage, ts, publickey;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        ymbb = getCookie('ymbb');


                        if (!baseUrl) {
                            baseUrl = getBaseUrl(city, true);
                        }

                        _context4.next = 4;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + "querymm.do?callback=" + createJsonpCallback(),
                                requestData: paramJson({ cert: taxNo, funType: funType }),
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 4:
                        res = _context4.sent;

                        if (!res) {
                            _context4.next = 21;
                            break;
                        }

                        if (!(res.errcode !== '0000')) {
                            _context4.next = 8;
                            break;
                        }

                        return _context4.abrupt('return', res);

                    case 8:
                        twoResData = res.data;
                        _context4.prev = 9;
                        govPage = twoResData['page'];
                        ts = twoResData['ts'];
                        publickey = '';


                        if (govPage != '') {
                            if (funType === '06') {
                                publickey = $.ck(taxNo, ts, '', govPage, serverRandom);
                            } else {
                                publickey = $.checkTaxno(taxNo, ts, '', govPage, serverRandom);
                            }
                        }

                        return _context4.abrupt('return', { publickey: publickey, ts: ts, errcode: '0000' });

                    case 17:
                        _context4.prev = 17;
                        _context4.t0 = _context4['catch'](9);

                        console.log(_context4.t0);
                        return _context4.abrupt('return', { errcode: '0003', description: '税局验证异常' });

                    case 21:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[9, 17]]);
    }));

    return function getPublicKey(_x6, _x7) {
        return _ref6.apply(this, arguments);
    };
}();

var secondLogin = function () {
    var _ref13 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee8(_ref14) {
        var _ref14$loginType = _ref14.loginType,
            loginType = _ref14$loginType === undefined ? 'auth' : _ref14$loginType,
            city = _ref14.city,
            fid = _ref14.fid,
            companyName = _ref14.companyName,
            _ref14$mmtype = _ref14.mmtype,
            mmtype = _ref14$mmtype === undefined ? '' : _ref14$mmtype,
            _ref14$answer = _ref14.answer,
            answer = _ref14$answer === undefined ? '' : _ref14$answer,
            clientAuthCode = _ref14.clientAuthCode,
            serverRandom = _ref14.serverRandom,
            ptPasswd = _ref14.ptPasswd,
            taxNo = _ref14.taxNo,
            ts = _ref14.ts,
            publickey = _ref14.publickey,
            _ref14$type = _ref14.type,
            type = _ref14$type === undefined ? '' : _ref14$type,
            baseUrl = _ref14.baseUrl;
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var param2, ymbb, currdate, loginRes, resultData, rezt, tokens, companyType, qrgycxRes;
        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        param2 = {};
                        ymbb = getCookie('ymbb');
                        currdate = new Date().getTime();

                        if (mmtype === '1') {
                            param2 = {
                                "type": "CLIENT-AUTH",
                                "clientAuthCode": clientAuthCode,
                                "serverRandom": serverRandom,
                                "password": ptPasswd,
                                "cert": taxNo,
                                "ymbb": ymbb,
                                "ts": ts,
                                "publickey": publickey,
                                "mmtype": "1",
                                currdate: currdate
                            };
                        } else if (mmtype === '2') {
                            param2 = {
                                "type": "CLIENT-AUTH",
                                "clientAuthCode": clientAuthCode,
                                "serverRandom": serverRandom,
                                "password": ptPasswd,
                                "cert": taxNo,
                                "ymbb": ymbb,
                                "ts": ts,
                                "publickey": publickey,
                                "mmtype": "2",
                                "answer": answer,
                                currdate: currdate
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
                                "ymbb": ymbb,
                                currdate: currdate
                            };
                        }

                        loginRes = void 0;

                        if (!(loginType === 'auth')) {
                            _context8.next = 11;
                            break;
                        }

                        _context8.next = 8;
                        return kdRequest({
                            url: authURI,
                            data: {
                                city: city,
                                baseUrl: baseUrl,
                                fid: fid,
                                type: type,
                                ftax_number: taxNo,
                                companyName: companyName,
                                requestUrl: 'login.do?callback=' + createJsonpCallback(),
                                requestData: paramJson(param2),
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 8:
                        loginRes = _context8.sent;
                        _context8.next = 14;
                        break;

                    case 11:
                        _context8.next = 13;
                        return kdRequest({
                            url: forwardUrl,
                            data: {
                                city: city,
                                baseUrl: baseUrl,
                                requestUrl: baseUrl + 'login.do?callback=' + createJsonpCallback(),
                                requestData: paramJson(param2),
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 13:
                        loginRes = _context8.sent;

                    case 14:
                        if (!loginRes) {
                            _context8.next = 71;
                            break;
                        }

                        if (!(loginRes.errcode === '0000')) {
                            _context8.next = 60;
                            break;
                        }

                        resultData = loginRes.data;
                        rezt = resultData.key1;

                        if (!(rezt === '03' || rezt === '02')) {
                            _context8.next = 41;
                            break;
                        }

                        tokens = resultData.key2;
                        companyType = '03';

                        if (tokens[5] == '1' && tokens[8] == '2') {
                            companyType = '02';
                        }

                        if (!(loginType === 'auth')) {
                            _context8.next = 26;
                            break;
                        }

                        return _context8.abrupt('return', {
                            errcode: '0000',
                            data: _extends({}, resultData, {
                                baseUrl: baseUrl,
                                companyType: companyType,
                                taxNo: taxNo
                            })
                        });

                    case 26:
                        qrgycxRes = { errcode: '0000', data: {} };

                        if (!(rezt === '03')) {
                            _context8.next = 33;
                            break;
                        }

                        _context8.next = 30;
                        return getQrgycx({ govToken: tokens, taxNo: taxNo, city: city, baseUrl: baseUrl });

                    case 30:
                        qrgycxRes = _context8.sent;
                        _context8.next = 34;
                        break;

                    case 33:
                        companyType = '02';

                    case 34:
                        if (!(qrgycxRes.errcode === '0000')) {
                            _context8.next = 38;
                            break;
                        }

                        return _context8.abrupt('return', {
                            errcode: '0000',
                            data: _extends({}, resultData, {
                                companyType: companyType
                            }, qrgycxRes.data, {
                                baseUrl: baseUrl,
                                taxNo: taxNo
                            })
                        });

                    case 38:
                        return _context8.abrupt('return', { errcode: qrgycxRes.errcode, description: '获取税控所属期异常!' });

                    case 39:
                        _context8.next = 58;
                        break;

                    case 41:
                        if (!(rezt === '05')) {
                            _context8.next = 45;
                            break;
                        }

                        return _context8.abrupt('return', { description: '平台密码错误次数超过十次，请联系税务机关解锁或明天再试！', errcode: '7005' });

                    case 45:
                        if (!(rezt === '04')) {
                            _context8.next = 49;
                            break;
                        }

                        return _context8.abrupt('return', { description: '平台密码不正确！', errcode: '7004' });

                    case 49:
                        if (!(rezt === '08')) {
                            _context8.next = 53;
                            break;
                        }

                        return _context8.abrupt('return', { description: '平台密码不能为空！', errcode: '7008' });

                    case 53:
                        if (!(rezt === '00')) {
                            _context8.next = 57;
                            break;
                        }

                        return _context8.abrupt('return', { description: resultData.key2, errcode: '7000' });

                    case 57:
                        return _context8.abrupt('return', { description: '企业认证出现异常, 请稍后再试!', errcode: '8000' });

                    case 58:
                        _context8.next = 71;
                        break;

                    case 60:
                        if (!(loginRes.errcode === '0932')) {
                            _context8.next = 70;
                            break;
                        }

                        if (!(retry < retryMax)) {
                            _context8.next = 67;
                            break;
                        }

                        _context8.next = 64;
                        return secondLogin({ loginType: loginType, city: city, fid: fid, companyName: companyName, mmtype: mmtype, clientAuthCode: clientAuthCode, serverRandom: serverRandom, ptPasswd: ptPasswd, taxNo: taxNo, ts: ts, publickey: publickey, answer: answer, type: type, baseUrl: baseUrl }, retry + 1);

                    case 64:
                        return _context8.abrupt('return', _context8.sent);

                    case 67:
                        return _context8.abrupt('return', { errcode: '0932', data: loginRes.data, description: '税局验证异常，请重试！' });

                    case 68:
                        _context8.next = 71;
                        break;

                    case 70:
                        return _context8.abrupt('return', { errcode: '8000', description: loginRes.description });

                    case 71:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function secondLogin(_x12) {
        return _ref13.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { setOperateUrl, openDevice, closeDevice, getClientHello, getClientAuthCode, getTaxInfoFromDisk } from './diskOperate';

import { createJsonpCallback, createFpdkHeader } from './tools';

import { getCityNameByTaxNo, getBaseUrl } from '@piaozone.com/swjgInfo';
import { kdRequest, paramJson } from '@piaozone.com/utils';
import { cookieHelp } from '@piaozone.com/utils';

export var forwardUrl = '/portal/forward';
export var authURI = '/portal/companyAuth';
export var fpdkSecondLogin = '/portal/fpdkLogin';

var $ = require('./swjg_ext');

var setCookie = cookieHelp.setCookie,
    getCookie = cookieHelp.getCookie,
    clearCookie = cookieHelp.clearCookie;


var retryMax = 3;
export var govCacheSeconds = 3000;
var pwyCacheSeconds = 3600 * 24 * 2.5;

export function setUrls(_ref) {
    var _ref$forwardURI = _ref.forwardURI,
        forwardURI = _ref$forwardURI === undefined ? '/portal/forward' : _ref$forwardURI,
        _ref$authURI = _ref.authURI,
        authURI = _ref$authURI === undefined ? '/portal/companyAuth' : _ref$authURI,
        _ref$caOperateUrl = _ref.caOperateUrl,
        caOperateUrl = _ref$caOperateUrl === undefined ? 'http://127.0.0.1:52320/cryptctl' : _ref$caOperateUrl;

    forwardUrl = forwardURI;
    authURI = authURI;
    setOperateUrl(caOperateUrl);
}

export var getYmbb = function () {
    var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(baseUrl) {
        var res, resText, m;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-:\.]+\/)(.*)$/, '$1'),
                                requestData: { op: 'getText' },
                                requestMethod: 'GET',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 2:
                        res = _context2.sent;

                        if (!(res.errcode === '0000')) {
                            _context2.next = 16;
                            break;
                        }

                        resText = res.data;
                        _context2.next = 7;
                        return getGloabalInfo(baseUrl, resText);

                    case 7:
                        m = resText.match(/ymbb = "[0-9\.]*";/);

                        if (!(m && m.length > 0)) {
                            _context2.next = 13;
                            break;
                        }

                        m = m[0].split(' = ')[1].replace(';', '').replace(/"/g, '');
                        return _context2.abrupt('return', { errcode: '0000', data: m });

                    case 13:
                        return _context2.abrupt('return', { errcode: '4000', description: '获取税局数据异常' });

                    case 14:
                        _context2.next = 17;
                        break;

                    case 16:
                        return _context2.abrupt('return', res);

                    case 17:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getYmbb(_x3) {
        return _ref3.apply(this, arguments);
    };
}();

export var querymmTime = function () {
    var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(_ref8) {
        var govToken = _ref8.govToken,
            baseUrl = _ref8.baseUrl,
            taxNo = _ref8.taxNo;
        var ymbb, res;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        ymbb = getCookie('ymbb');
                        _context5.next = 3;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + "querymm.do",
                                requestData: { cert: taxNo, token: govToken, time: 'time' },
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 3:
                        res = _context5.sent;
                        return _context5.abrupt('return', res);

                    case 5:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function querymmTime(_x9) {
        return _ref7.apply(this, arguments);
    };
}();

export var getGxPublicKey = function () {
    var _ref9 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(_ref10) {
        var govToken = _ref10.govToken,
            baseUrl = _ref10.baseUrl,
            taxNo = _ref10.taxNo,
            funType = _ref10.funType;
        var ymbb, res, twoResData, govPage, ts, publickey;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        ymbb = getCookie('ymbb');
                        _context6.next = 3;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + "querymm.do?callback=" + createJsonpCallback(),
                                requestData: 'cert=' + taxNo + '&funType=' + funType,
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 3:
                        res = _context6.sent;

                        if (!res) {
                            _context6.next = 19;
                            break;
                        }

                        if (!(res.errcode !== '0000')) {
                            _context6.next = 7;
                            break;
                        }

                        return _context6.abrupt('return', res);

                    case 7:
                        twoResData = res.data;
                        _context6.prev = 8;
                        govPage = twoResData['page'];
                        ts = twoResData['ts'];
                        publickey = '';

                        if (govPage != '') {
                            if (funType === '06') {
                                publickey = $.ck(taxNo, ts, '', govPage, govToken);
                            } else {
                                publickey = window.checkInvConf(taxNo, govToken, ts, '', govPage);
                            }
                        }
                        return _context6.abrupt('return', { publickey: publickey, ts: ts, errcode: '0000' });

                    case 16:
                        _context6.prev = 16;
                        _context6.t0 = _context6['catch'](8);
                        return _context6.abrupt('return', { errcode: '0003', description: '税局验证异常' });

                    case 19:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[8, 16]]);
    }));

    return function getGxPublicKey(_x10) {
        return _ref9.apply(this, arguments);
    };
}();

export var getQrgycx = function () {
    var _ref11 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7(_ref12) {
        var govToken = _ref12.govToken,
            city = _ref12.city,
            taxNo = _ref12.taxNo,
            baseUrl = _ref12.baseUrl;
        var ymbb, pkInfo, p, res, newToken, skssq, gxrqfw;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        ymbb = getCookie('ymbb');

                        if (!baseUrl) {
                            baseUrl = getBaseUrl(city, true);
                        }

                        if (baseUrl) {
                            _context7.next = 4;
                            break;
                        }

                        return _context7.abrupt('return', { 'errcode': '1000', 'description': '城市错误', data: [] });

                    case 4:
                        pkInfo = { ts: '', publickey: '' };

                        if (!(window.FPDK_GOV_VERSION_INT < 4000)) {
                            _context7.next = 11;
                            break;
                        }

                        _context7.next = 8;
                        return getGxPublicKey({ govToken: govToken, baseUrl: baseUrl, taxNo: taxNo, funType: '06' });

                    case 8:
                        pkInfo = _context7.sent;

                        if (!(pkInfo.errcode !== '0000')) {
                            _context7.next = 11;
                            break;
                        }

                        return _context7.abrupt('return', pkInfo);

                    case 11:
                        p = { 'cert': taxNo, 'token': govToken, 'rznf': '', 'ymbb': ymbb, ts: pkInfo.ts, publickey: pkInfo.publickey, id: 'qrgycx' };
                        _context7.next = 14;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'qrgycx.do?callback=' + createJsonpCallback(),
                                requestData: paramJson(p),
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 14:
                        res = _context7.sent;

                        if (!(res.errcode === '0000')) {
                            _context7.next = 34;
                            break;
                        }

                        _context7.prev = 16;

                        res = res.data;

                        if (!(res.key1 == '01' || window.FPDK_GOV_VERSION_INT >= 4000 && res.key1 == '200')) {
                            _context7.next = 26;
                            break;
                        }

                        newToken = res.key4;
                        skssq = res.key5;
                        gxrqfw = res.key6;

                        setCookie('govToken', newToken, govCacheSeconds);
                        return _context7.abrupt('return', { errcode: '0000', description: 'success', data: { skssq: skssq, gxrqfw: gxrqfw, govToken: newToken } });

                    case 26:
                        return _context7.abrupt('return', { errcode: '8000', description: '获取税控所属期出错' });

                    case 27:
                        _context7.next = 32;
                        break;

                    case 29:
                        _context7.prev = 29;
                        _context7.t0 = _context7['catch'](16);
                        return _context7.abrupt('return', { errcode: '8003', description: '税局验证异常' });

                    case 32:
                        _context7.next = 35;
                        break;

                    case 34:
                        return _context7.abrupt('return', { errcode: '8003', description: '税局验证异常' });

                    case 35:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[16, 29]]);
    }));

    return function getQrgycx(_x11) {
        return _ref11.apply(this, arguments);
    };
}();

export var clearGovCookie = function () {
    var _ref15 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee9() {
        return _regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        clearCookie('ymbb');
                        clearCookie('gxrqfw');
                        clearCookie('skssq');
                        clearCookie('govCompanyType');
                        clearCookie('govToken');
                        clearCookie('baseUrl');
                        clearCookie('taxNo');
                        clearCookie('nsrmc');

                    case 8:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function clearGovCookie() {
        return _ref15.apply(this, arguments);
    };
}();

export var login = function () {
    var _ref16 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee10(_ref17) {
        var _ref17$passwd = _ref17.passwd,
            passwd = _ref17$passwd === undefined ? '' : _ref17$passwd,
            _ref17$ptPasswd = _ref17.ptPasswd,
            ptPasswd = _ref17$ptPasswd === undefined ? '' : _ref17$ptPasswd,
            _ref17$type = _ref17.type,
            type = _ref17$type === undefined ? '' : _ref17$type,
            _ref17$fid = _ref17.fid,
            fid = _ref17$fid === undefined ? '' : _ref17$fid,
            _ref17$taxNo = _ref17.taxNo,
            taxNo = _ref17$taxNo === undefined ? '' : _ref17$taxNo,
            _ref17$companyName = _ref17.companyName,
            companyName = _ref17$companyName === undefined ? '' : _ref17$companyName,
            _ref17$loginType = _ref17.loginType,
            loginType = _ref17$loginType === undefined ? 'forward' : _ref17$loginType,
            _ref17$city = _ref17.city,
            city = _ref17$city === undefined ? '' : _ref17$city,
            _ref17$baseUrl = _ref17.baseUrl,
            baseUrl = _ref17$baseUrl === undefined ? '' : _ref17$baseUrl;
        var clearFlag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var taxInfo, diskTaxNo, oldTaxNo, oldToken, gxrqfw, skssq, companyType, _taxNo, nsrmc, comInfo, diskCompanyName, openRes, ymbbRes, ymbb, clientHelloRes, data, serverPacket, serverRandom, resAuthCodeData, funType, resKeyData, result, _result$data, _result$data$gxrqfw, _gxrqfw, _result$data$skssq, _skssq, _result$data$key, key2, _result$data$key2, key3, _companyType, govToken;

        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        if (!(passwd === '')) {
                            _context10.next = 2;
                            break;
                        }

                        return _context10.abrupt('return', { errcode: '3000', description: '税盘密码不能为空!' });

                    case 2:
                        _context10.next = 4;
                        return getTaxInfoFromDisk(passwd, 71);

                    case 4:
                        taxInfo = _context10.sent;

                        if (!(taxInfo.errcode !== '0000')) {
                            _context10.next = 7;
                            break;
                        }

                        return _context10.abrupt('return', taxInfo);

                    case 7:
                        diskTaxNo = taxInfo.data;

                        if (!clearFlag) {
                            _context10.next = 12;
                            break;
                        }

                        clearGovCookie();
                        _context10.next = 26;
                        break;

                    case 12:
                        oldTaxNo = getCookie('taxNo');

                        if (!(diskTaxNo !== oldTaxNo)) {
                            _context10.next = 17;
                            break;
                        }

                        clearGovCookie();
                        _context10.next = 26;
                        break;

                    case 17:
                        oldToken = getCookie('govToken');
                        gxrqfw = getCookie('gxrqfw');
                        skssq = getCookie('skssq');
                        companyType = getCookie('govCompanyType');

                        if (baseUrl === '') {
                            baseUrl = getCookie('baseUrl');
                        }
                        _taxNo = getCookie('taxNo');
                        nsrmc = getCookie('nsrmc');

                        if (!(oldToken && gxrqfw && skssq && companyType && baseUrl && _taxNo && nsrmc)) {
                            _context10.next = 26;
                            break;
                        }

                        return _context10.abrupt('return', { errcode: '0000', data: { gxrqfw: gxrqfw, skssq: skssq, companyType: companyType, govToken: oldToken, baseUrl: baseUrl, taxNo: _taxNo, nsrmc: nsrmc } });

                    case 26:
                        if (!(loginType === 'auth' && taxNo !== '' && diskTaxNo !== taxNo)) {
                            _context10.next = 28;
                            break;
                        }

                        return _context10.abrupt('return', { errcode: 'taxNoErr', description: '请检查税号是否与税盘一致!' });

                    case 28:
                        _context10.next = 30;
                        return getTaxInfoFromDisk(passwd, 27);

                    case 30:
                        comInfo = _context10.sent;

                        if (!(comInfo.errcode !== '0000')) {
                            _context10.next = 33;
                            break;
                        }

                        return _context10.abrupt('return', comInfo);

                    case 33:
                        diskCompanyName = comInfo.data;

                        if (!(loginType === 'auth' && companyName !== '' && diskCompanyName.replaceInclude() !== companyName.replaceInclude())) {
                            _context10.next = 36;
                            break;
                        }

                        return _context10.abrupt('return', { errcode: 'companyNameErr', description: '请检查企业名称是否与税盘一致!' });

                    case 36:

                        if (city === '') {
                            city = getCityNameByTaxNo(diskTaxNo);
                        }

                        if (city) {
                            _context10.next = 39;
                            break;
                        }

                        return _context10.abrupt('return', { errcode: '6000', description: '请检查税号是否正确!' });

                    case 39:

                        if (baseUrl === '') {
                            baseUrl = getBaseUrl(city, true);
                        }

                        _context10.next = 42;
                        return openDevice(passwd);

                    case 42:
                        openRes = _context10.sent;

                        if (!(openRes.errcode !== '0000')) {
                            _context10.next = 45;
                            break;
                        }

                        return _context10.abrupt('return', openRes);

                    case 45:

                        setCookie('city', encodeURIComponent(city), govCacheSeconds);

                        _context10.next = 48;
                        return getYmbb(baseUrl);

                    case 48:
                        ymbbRes = _context10.sent;

                        if (!(ymbbRes.errcode !== '0000')) {
                            _context10.next = 51;
                            break;
                        }

                        return _context10.abrupt('return', ymbbRes);

                    case 51:
                        ymbb = ymbbRes.data;


                        setCookie('ymbb', ymbb, govCacheSeconds);

                        _context10.next = 55;
                        return getClientHello(passwd);

                    case 55:
                        clientHelloRes = _context10.sent;

                        if (!(clientHelloRes.errcode !== '0000')) {
                            _context10.next = 58;
                            break;
                        }

                        return _context10.abrupt('return', { errcode: clientHelloRes.errcode, description: clientHelloRes.description });

                    case 58:
                        _context10.next = 60;
                        return firstLogin({
                            baseUrl: baseUrl,
                            passwd: passwd,
                            city: city,
                            mmtype: '2',
                            answer: '',
                            taxNo: diskTaxNo,
                            clientHello: clientHelloRes.data
                        }, 1);

                    case 60:
                        data = _context10.sent;

                        if (!(data.errcode === '0000')) {
                            _context10.next = 83;
                            break;
                        }

                        serverPacket = data.key2;
                        serverRandom = data.key3;
                        _context10.next = 66;
                        return getClientAuthCode(passwd, serverPacket);

                    case 66:
                        resAuthCodeData = _context10.sent;

                        if (!(resAuthCodeData.errcode !== '0000')) {
                            _context10.next = 69;
                            break;
                        }

                        return _context10.abrupt('return', resAuthCodeData);

                    case 69:
                        funType = window.FPDK_GOV_VERSION_INT >= 4000 ? '01' : '06';
                        _context10.next = 72;
                        return getPublicKey(serverRandom, diskTaxNo, funType, city);

                    case 72:
                        resKeyData = _context10.sent;

                        if (!(resKeyData.errcode !== '0000')) {
                            _context10.next = 75;
                            break;
                        }

                        return _context10.abrupt('return', resKeyData);

                    case 75:
                        _context10.next = 77;
                        return secondLogin({
                            baseUrl: baseUrl,
                            city: city,
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

                    case 77:
                        result = _context10.sent;


                        if (result.errcode === '0000') {
                            _result$data = result.data, _result$data$gxrqfw = _result$data.gxrqfw, _gxrqfw = _result$data$gxrqfw === undefined ? '' : _result$data$gxrqfw, _result$data$skssq = _result$data.skssq, _skssq = _result$data$skssq === undefined ? '' : _result$data$skssq, _result$data$key = _result$data.key2, key2 = _result$data$key === undefined ? '' : _result$data$key, _result$data$key2 = _result$data.key3, key3 = _result$data$key2 === undefined ? '' : _result$data$key2, _companyType = _result$data.companyType, govToken = _result$data.govToken;

                            setCookie('gxrqfw', _gxrqfw, govCacheSeconds);
                            setCookie('skssq', encodeURIComponent(_skssq), govCacheSeconds);
                            setCookie('govCompanyType', _companyType, govCacheSeconds);
                            setCookie('govToken', govToken, govCacheSeconds);
                            setCookie('baseUrl', baseUrl, govCacheSeconds);
                            setCookie('taxNo', diskTaxNo, govCacheSeconds);
                            setCookie('nsrmc', encodeURIComponent(diskCompanyName), govCacheSeconds);
                        }
                        result.baseUrl = baseUrl;

                        return _context10.abrupt('return', result);

                    case 83:
                        return _context10.abrupt('return', data);

                    case 84:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    return function login(_x14) {
        return _ref16.apply(this, arguments);
    };
}();

export var companyAuth = function () {
    var _ref18 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee11(opt) {
        var passwd, _opt$ptPasswd, ptPasswd, _opt$type, type, _opt$fid, fid, _opt$taxNo, taxNo, _opt$companyName, companyName;

        return _regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        passwd = opt.passwd, _opt$ptPasswd = opt.ptPasswd, ptPasswd = _opt$ptPasswd === undefined ? '' : _opt$ptPasswd, _opt$type = opt.type, type = _opt$type === undefined ? '' : _opt$type, _opt$fid = opt.fid, fid = _opt$fid === undefined ? '' : _opt$fid, _opt$taxNo = opt.taxNo, taxNo = _opt$taxNo === undefined ? '' : _opt$taxNo, _opt$companyName = opt.companyName, companyName = _opt$companyName === undefined ? '' : _opt$companyName;

                        if (!(taxNo === '')) {
                            _context11.next = 5;
                            break;
                        }

                        return _context11.abrupt('return', { errcode: '3000', description: '请输入正确的税号!' });

                    case 5:
                        if (!(companyName === '')) {
                            _context11.next = 9;
                            break;
                        }

                        return _context11.abrupt('return', { errcode: '3000', description: '认证企业名称不能为空!' });

                    case 9:
                        if (!(fid === '')) {
                            _context11.next = 13;
                            break;
                        }

                        return _context11.abrupt('return', { errcode: '3000', description: '认证参数不全，请检查' });

                    case 13:
                        return _context11.abrupt('return', login(_extends({}, opt, { loginType: 'auth' }), true));

                    case 14:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function companyAuth(_x16) {
        return _ref18.apply(this, arguments);
    };
}();

export var companyAuthNew = function () {
    var _ref19 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee12(opt) {
        var passwd, _opt$fid2, fid, _opt$taxNo2, taxNo, _opt$companyName2, companyName, _opt$url, url, city, baseUrl, taxInfo, diskTaxNo, comInfo, diskCompanyName, ymbbRes, ymbb, clientHelloRes, firstLoginRes;

        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        passwd = opt.passwd, _opt$fid2 = opt.fid, fid = _opt$fid2 === undefined ? '' : _opt$fid2, _opt$taxNo2 = opt.taxNo, taxNo = _opt$taxNo2 === undefined ? '' : _opt$taxNo2, _opt$companyName2 = opt.companyName, companyName = _opt$companyName2 === undefined ? '' : _opt$companyName2, _opt$url = opt.url, url = _opt$url === undefined ? '' : _opt$url;
                        city = opt.city || '';
                        baseUrl = opt.baseUrl || '';

                        if (!(taxNo === '')) {
                            _context12.next = 7;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '企业税号不能为空!' });

                    case 7:
                        if (!(companyName === '')) {
                            _context12.next = 11;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '认证企业名称不能为空!' });

                    case 11:
                        if (!(fid === '')) {
                            _context12.next = 15;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '认证参数不全，请检查' });

                    case 15:
                        if (!(passwd === '')) {
                            _context12.next = 17;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '税盘密码不能为空!' });

                    case 17:
                        _context12.next = 19;
                        return getTaxInfoFromDisk(passwd, 71);

                    case 19:
                        taxInfo = _context12.sent;

                        if (!(taxInfo.errcode !== '0000')) {
                            _context12.next = 22;
                            break;
                        }

                        return _context12.abrupt('return', taxInfo);

                    case 22:
                        diskTaxNo = taxInfo.data;

                        if (!(diskTaxNo !== taxNo)) {
                            _context12.next = 25;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '请检查税号是否与税盘一致!' });

                    case 25:
                        _context12.next = 27;
                        return getTaxInfoFromDisk(passwd, 27);

                    case 27:
                        comInfo = _context12.sent;

                        if (!(comInfo.errcode !== '0000')) {
                            _context12.next = 30;
                            break;
                        }

                        return _context12.abrupt('return', comInfo);

                    case 30:
                        diskCompanyName = comInfo.data;

                        if (!(diskCompanyName.replaceInclude() !== companyName.replaceInclude())) {
                            _context12.next = 33;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '请检查企业名称是否与税盘一致!' });

                    case 33:

                        if (city === '') {
                            city = getCityNameByTaxNo(diskTaxNo);
                        }

                        if (city) {
                            _context12.next = 36;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: 'argsErr', description: '请检查税号是否正确!' });

                    case 36:

                        if (baseUrl === '') {
                            baseUrl = getBaseUrl(city, true);
                        }

                        _context12.next = 39;
                        return getYmbb(baseUrl);

                    case 39:
                        ymbbRes = _context12.sent;

                        if (!(ymbbRes.errcode !== '0000')) {
                            _context12.next = 42;
                            break;
                        }

                        return _context12.abrupt('return', ymbbRes);

                    case 42:
                        ymbb = ymbbRes.data;


                        setCookie('ymbb', ymbb, govCacheSeconds);

                        _context12.next = 46;
                        return getClientHello(passwd);

                    case 46:
                        clientHelloRes = _context12.sent;

                        if (!(clientHelloRes.errcode !== '0000')) {
                            _context12.next = 49;
                            break;
                        }

                        return _context12.abrupt('return', { errcode: clientHelloRes.errcode, description: clientHelloRes.description });

                    case 49:
                        _context12.next = 51;
                        return kdRequest({
                            url: url,
                            timeout: 60000,
                            data: {
                                city: city,
                                baseUrl: baseUrl,
                                requestUrl: baseUrl + "login.do",
                                requestData: paramJson({ 'callback': createJsonpCallback(), "type": "CLIENT-HELLO", "clientHello": clientHelloRes.data, "ymbb": ymbb, mmtype: '2', answer: '' }),
                                requestMethod: 'GET',
                                headers: createFpdkHeader(baseUrl)
                            },
                            method: 'POST'
                        });

                    case 51:
                        firstLoginRes = _context12.sent;
                        return _context12.abrupt('return', firstLoginRes);

                    case 53:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));

    return function companyAuthNew(_x17) {
        return _ref19.apply(this, arguments);
    };
}();
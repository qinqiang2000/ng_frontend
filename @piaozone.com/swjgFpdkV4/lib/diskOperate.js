import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { crossHttp, paramJson } from '@piaozone.com/utils';
var caOperateUrl = 'http://127.0.0.1:52320/cryptctl';

export function setOperateUrl(url) {
    caOperateUrl = url;
}

export var openDevice = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(passwd, url) {
        var res;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "opendevice", "args": { "userpin": passwd } },
                            'url': url || caOperateUrl
                        });

                    case 2:
                        res = _context.sent;

                        if (!(res.errcode === '0000')) {
                            _context.next = 7;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '0000' });

                    case 7:
                        return _context.abrupt('return', { errcode: '7000', description: res.errmsg || res.description });

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function openDevice(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

export var closeDevice = function () {
    var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(url) {
        var res;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "closedevice", "args": {} },
                            'url': url || caOperateUrl
                        });

                    case 2:
                        res = _context2.sent;

                        if (!(res.errcode === '0000')) {
                            _context2.next = 7;
                            break;
                        }

                        return _context2.abrupt('return', true);

                    case 7:
                        return _context2.abrupt('return', res.errmsg);

                    case 8:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function closeDevice(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

export var getClientHello = function () {
    var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(passwd, url) {
        var res;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "clienthello", "args": { "userpin": passwd, "dwflags": 0 } },
                            'url': url || caOperateUrl
                        });

                    case 2:
                        res = _context3.sent;

                        if (!(res.errcode === '0000')) {
                            _context3.next = 11;
                            break;
                        }

                        if (!(res.result !== '')) {
                            _context3.next = 8;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '0000', data: res.result });

                    case 8:
                        return _context3.abrupt('return', { errcode: '7000', description: '税盘操作异常' });

                    case 9:
                        _context3.next = 12;
                        break;

                    case 11:
                        return _context3.abrupt('return', { errcode: res.errcode, description: res.errmsg || res.description });

                    case 12:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getClientHello(_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
}();

export var getClientAuthCode = function () {
    var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(passwd, serverPacket, url) {
        var res;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "clientauth", "args": { "userpin": passwd, "strServerHello": serverPacket } },
                            'url': url || caOperateUrl
                        });

                    case 2:
                        res = _context4.sent;

                        if (!(res.errcode === '0000')) {
                            _context4.next = 11;
                            break;
                        }

                        if (!(res.result !== '')) {
                            _context4.next = 8;
                            break;
                        }

                        return _context4.abrupt('return', { errcode: '0000', data: res.result });

                    case 8:
                        return _context4.abrupt('return', { errcode: '7001', description: res.errmsg || res.description });

                    case 9:
                        _context4.next = 12;
                        break;

                    case 11:
                        return _context4.abrupt('return', { errcode: '7001', description: res.errmsg || res.description });

                    case 12:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getClientAuthCode(_x6, _x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}();

export var getTaxInfoFromDisk = function () {
    var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(passwd, type, url) {
        var resData;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "getcertinfo", "args": { "userpin": passwd, "cert": "", "certinfono": type } },
                            'url': url || caOperateUrl
                        });

                    case 2:
                        resData = _context5.sent;

                        if (!(resData.errcode === '0000' && resData.result !== '')) {
                            _context5.next = 7;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '0000', data: resData.result });

                    case 7:
                        return _context5.abrupt('return', { errcode: '7002', description: resData.errmsg || resData.description });

                    case 8:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function getTaxInfoFromDisk(_x9, _x10, _x11) {
        return _ref5.apply(this, arguments);
    };
}();

export var signDataApi = function () {
    var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(originData, passwd) {
        var flag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        var alg = arguments[3];
        var url = arguments[4];
        var r, resData;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        r = {
                            data: originData,
                            alg: "SHA1withRSA",
                            flag: 4194304
                        };
                        _context6.next = 3;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "sign", "args": r },
                            'url': url || caOperateUrl
                        });

                    case 3:
                        resData = _context6.sent;

                        if (!(resData.errcode === '0000' && resData.result !== '')) {
                            _context6.next = 8;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '0000', data: resData.result });

                    case 8:
                        return _context6.abrupt('return', { errcode: '27002', description: resData.errmsg || '获取签名异常' });

                    case 9:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function signDataApi(_x12, _x13) {
        return _ref6.apply(this, arguments);
    };
}();
import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { crossHttp } from '@piaozone.com/utils';
var caOperateUrl = 'http://127.0.0.1:52320/cryptctl';

export function setOperateUrl(url) {
    caOperateUrl = url;
}

export var openDevice = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(passwd) {
        var res;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "opendevice", "args": { "userpin": passwd } },
                            'url': caOperateUrl
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

    return function openDevice(_x) {
        return _ref.apply(this, arguments);
    };
}();

export var closeDevice = function () {
    var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        var res;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "closedevice", "args": {} },
                            'url': caOperateUrl
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

    return function closeDevice() {
        return _ref2.apply(this, arguments);
    };
}();

export var getClientHello = function () {
    var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(passwd) {
        var res;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "clienthello", "args": { "userpin": passwd, "dwflags": 0 } },
                            'url': caOperateUrl
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

    return function getClientHello(_x2) {
        return _ref3.apply(this, arguments);
    };
}();

export var getClientAuthCode = function () {
    var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(passwd, serverPacket) {
        var openRes, res;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return openDevice(passwd);

                    case 2:
                        openRes = _context4.sent;

                        if (!(openRes.errcode !== '0000')) {
                            _context4.next = 5;
                            break;
                        }

                        return _context4.abrupt('return', openRes);

                    case 5:
                        _context4.next = 7;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "clientauth", "args": { "userpin": passwd, "strServerHello": serverPacket } },
                            'url': caOperateUrl
                        });

                    case 7:
                        res = _context4.sent;

                        if (!(res.errcode === '0000')) {
                            _context4.next = 18;
                            break;
                        }

                        _context4.next = 11;
                        return closeDevice();

                    case 11:
                        if (!(res.result !== '')) {
                            _context4.next = 15;
                            break;
                        }

                        return _context4.abrupt('return', { errcode: '0000', data: res.result });

                    case 15:
                        return _context4.abrupt('return', { errcode: '7001', description: res.errmsg || res.description });

                    case 16:
                        _context4.next = 21;
                        break;

                    case 18:
                        _context4.next = 20;
                        return closeDevice();

                    case 20:
                        return _context4.abrupt('return', { errcode: '7001', description: res.errmsg || res.description });

                    case 21:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getClientAuthCode(_x3, _x4) {
        return _ref4.apply(this, arguments);
    };
}();

export var getTaxInfoFromDisk = function () {
    var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(passwd, type) {
        var openRes, resData;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return openDevice(passwd);

                    case 2:
                        openRes = _context5.sent;

                        if (!(openRes.errcode !== '0000')) {
                            _context5.next = 5;
                            break;
                        }

                        return _context5.abrupt('return', openRes);

                    case 5:
                        _context5.next = 7;
                        return crossHttp({
                            'method': 'POST',
                            'data': { "funcname": "getcertinfo", "args": { "userpin": passwd, "cert": "", "certinfono": type } },
                            'url': caOperateUrl
                        });

                    case 7:
                        resData = _context5.sent;
                        _context5.next = 10;
                        return closeDevice();

                    case 10:
                        if (!(resData.errcode === '0000' && resData.result !== '')) {
                            _context5.next = 14;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '0000', data: resData.result });

                    case 14:
                        return _context5.abrupt('return', { errcode: '7002', description: resData.errmsg || resData.description });

                    case 15:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function getTaxInfoFromDisk(_x5, _x6) {
        return _ref5.apply(this, arguments);
    };
}();
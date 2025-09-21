import _regeneratorRuntime from 'babel-runtime/regenerator';

var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { crossHttp, paramJson } from '@piaozone.com/utils';
var caOperateUrl = 'http://127.0.0.1:52320/cryptctl';

export function setOperateUrl(url) {
    caOperateUrl = url;
}

var getApi = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(url, data, o) {
        var res;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return crossHttp({
                            'method': 'POST',
                            'data': paramJson(data),
                            'contentType': 'application/x-www-form-urlencoded;charset=UTF-8',
                            'url': url
                        });

                    case 2:
                        res = _context.sent;
                        return _context.abrupt('return', res);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function getApi(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

export var getVersionApi = function () {
    var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(flag, url) {
        var ip, apiUrl, data;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!url) {
                            url = caOperateUrl;
                        }

                        ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
                        apiUrl = 'https://' + ip + ':28000/api/getVersion';
                        data = {
                            crosFlag: 0
                        };
                        _context2.next = 6;
                        return getApi(apiUrl, data);

                    case 6:
                        return _context2.abrupt('return', _context2.sent);

                    case 7:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getVersionApi(_x4, _x5) {
        return _ref2.apply(this, arguments);
    };
}();

export var verifyPinApi = function () {
    var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(passwd, flag, alg, url) {
        var ip, apiUrl, data, res, errMsg;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        passwd = encodeURIComponent(passwd);
                        if (!url) {
                            url = caOperateUrl;
                        }

                        ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
                        apiUrl = 'https://' + ip + ':28000/api/verifyPin';
                        data = 0 == alg ? {
                            password: passwd,
                            dwProvType: 1
                        } : {
                            password: passwd,
                            dwProvType: 2050,
                            strContainer: '//SM2/SM2CONTAINER0002'
                        };
                        _context3.next = 7;
                        return getApi(apiUrl, data);

                    case 7:
                        res = _context3.sent;

                        if (!(res.code == 0)) {
                            _context3.next = 12;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '0000', data: '0' });

                    case 12:
                        errMsg = res.msg + '(错误代码：' + res.code + ')';
                        return _context3.abrupt('return', { errcode: '7000', description: errMsg });

                    case 14:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function verifyPinApi(_x6, _x7, _x8, _x9) {
        return _ref3.apply(this, arguments);
    };
}();

export var getClientHello = function () {
    var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(passwd, url, alg) {
        var ip, apiUrl, data, res, errMsg;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (!url) {
                            url = caOperateUrl;
                        }

                        ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
                        apiUrl = 'https://' + ip + ':28000/api/clientHello';
                        data = 0 == alg ? {
                            authType: 0,
                            dwProvType: 1
                        } : {
                            authType: 0,
                            dwProvType: 2050,
                            strContainer: '//SM2/SM2CONTAINER0002'
                        };
                        _context4.next = 6;
                        return getApi(apiUrl, data);

                    case 6:
                        res = _context4.sent;

                        if (!(res.code == 0)) {
                            _context4.next = 15;
                            break;
                        }

                        if (!res.clientHello) {
                            _context4.next = 12;
                            break;
                        }

                        return _context4.abrupt('return', { errcode: '0000', data: res.clientHello });

                    case 12:
                        return _context4.abrupt('return', { errcode: '7000', description: '税盘操作异常' });

                    case 13:
                        _context4.next = 17;
                        break;

                    case 15:
                        errMsg = res.msg + '(错误代码：' + res.code + ')';
                        return _context4.abrupt('return', { errcode: '7000', description: errMsg });

                    case 17:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getClientHello(_x10, _x11, _x12) {
        return _ref4.apply(this, arguments);
    };
}();

export var getClientAuthCode = function () {
    var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(passwd, serverPacket, url, alg) {
        var ip, apiUrl, data, res, errMsg;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if (!url) {
                            url = caOperateUrl;
                        }

                        ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
                        apiUrl = 'https://' + ip + ':28000/api/clientAuth';
                        data = 0 == alg ? {
                            password: passwd,
                            serverHello: serverPacket,
                            dwProvType: 1
                        } : {
                            password: passwd,
                            serverHello: serverPacket,
                            dwProvType: 2050,
                            strContainer: '//SM2/SM2CONTAINER0002'
                        };
                        _context5.next = 6;
                        return getApi(apiUrl, data);

                    case 6:
                        res = _context5.sent;

                        if (!(res.code == 0)) {
                            _context5.next = 15;
                            break;
                        }

                        if (!res.clientAuth) {
                            _context5.next = 12;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '0000', data: res.clientAuth });

                    case 12:
                        return _context5.abrupt('return', { errcode: '7000', description: '税盘操作异常' });

                    case 13:
                        _context5.next = 17;
                        break;

                    case 15:
                        errMsg = res.msg + '(错误代码：' + res.code + ')';
                        return _context5.abrupt('return', { errcode: '7000', description: errMsg });

                    case 17:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function getClientAuthCode(_x13, _x14, _x15, _x16) {
        return _ref5.apply(this, arguments);
    };
}();

export var getTaxInfoFromDisk = function () {
    var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(passwd, type, url, alg) {
        var ip, apiUrl, data, res, errMsg;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        if (!url) {
                            url = caOperateUrl;
                        }

                        ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
                        apiUrl = 'https://' + ip + ':28000/api/readCertInfo';
                        data = 0 == alg ? {
                            certInfoNo: type,
                            dwProvType: 1
                        } : {
                            certInfoNo: type,
                            dwProvType: 2050,
                            strContainer: '//SM2/SM2CONTAINER0002'
                        };
                        _context6.next = 6;
                        return getApi(apiUrl, data);

                    case 6:
                        res = _context6.sent;

                        if (!(res.code == 0)) {
                            _context6.next = 15;
                            break;
                        }

                        if (!res.certInfo) {
                            _context6.next = 12;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '0000', data: res.certInfo });

                    case 12:
                        return _context6.abrupt('return', { errcode: '7000', description: '税盘操作异常' });

                    case 13:
                        _context6.next = 17;
                        break;

                    case 15:
                        errMsg = res.msg + '(错误代码：' + res.code + ')';
                        return _context6.abrupt('return', { errcode: '7000', description: errMsg });

                    case 17:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function getTaxInfoFromDisk(_x17, _x18, _x19, _x20) {
        return _ref6.apply(this, arguments);
    };
}();

export var signDataApi = function () {
    var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7(originData, passwd, flag, alg, url) {
        var ip, apiUrl, data, res, errMsg;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        if (!url) {
                            url = caOperateUrl;
                        }

                        ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
                        apiUrl = 'https://' + ip + ':28000/api/signData';
                        data = 0 == alg ? {
                            password: passwd,
                            data: originData,
                            signAlgId: 'SHA1withRSA',
                            dwFlag: '0x400000',
                            dwProvType: 1
                        } : {
                            password: passwd,
                            data: originData,
                            signAlgId: 'GBECSM3',
                            dwFlag: '0x400000',
                            dwProvType: 2050,
                            strContainer: '//SM2/SM2CONTAINER0002'
                        };
                        _context7.next = 6;
                        return getApi(apiUrl, data);

                    case 6:
                        res = _context7.sent;

                        if (!(res.code == 0)) {
                            _context7.next = 15;
                            break;
                        }

                        if (!res.p7Signature) {
                            _context7.next = 12;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '0000', data: res.p7Signature });

                    case 12:
                        return _context7.abrupt('return', { errcode: '7000', description: '税盘操作异常' });

                    case 13:
                        _context7.next = 17;
                        break;

                    case 15:
                        errMsg = res.msg + '(错误代码：' + res.code + ')';
                        return _context7.abrupt('return', { errcode: '7000', description: errMsg });

                    case 17:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function signDataApi(_x21, _x22, _x23, _x24, _x25) {
        return _ref7.apply(this, arguments);
    };
}();
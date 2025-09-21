import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { crossHttp } from '@piaozone.com/utils';
var defaultCaOperateUrl = 'http://127.0.0.1:52320/cryptctl';

export default function MultiPortOperateDisk() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.timeout = opt.timeout || 60000;

    this.allowPorts = opt.ports || ['52320', '61624', '50001', '50051', '50101'];
    this.caOperateUrl = '';
}

MultiPortOperateDisk.prototype = {
    setOperateUrl: function setOperateUrl(url) {
        this.caOperateUrl = url;
    },

    getUrlInfo: function getUrlInfo(url) {
        var urlReg = /^(https?):\/\/([0-9.a-z]*):([0-9]*)\/(.*)$/;
        var urlMatchInfo = url.match(urlReg);
        if (urlMatchInfo.length > 2) {
            return {
                protocol: urlMatchInfo[1],
                hostname: urlMatchInfo[2],
                port: urlMatchInfo[3],
                pathname: urlMatchInfo[4]
            };
        } else {
            return false;
        }
    },
    mergeUrlInfo: function mergeUrlInfo() {
        var oldInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var protocol = oldInfo.protocol,
            hostname = oldInfo.hostname,
            port = oldInfo.port,
            pathname = oldInfo.pathname;

        protocol = info.protocol || protocol;
        hostname = info.hostname || hostname;
        port = info.port || port;
        pathname = info.pathname || pathname;
        if (pathname === '') {
            return protocol + '://' + hostname + ':' + port;
        }
        return protocol + '://' + hostname + ':' + port + '/' + pathname;
    },
    requestDisk: function () {
        var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(url, data, cback) {
            var newInfo, oldInfo, res, errmsg, urlInfo, _res, i, port, curUrl, resInner, _errmsg;

            return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (url) {
                                _context.next = 4;
                                break;
                            }

                            url = defaultCaOperateUrl;
                            _context.next = 11;
                            break;

                        case 4:
                            if (!this.caOperateUrl) {
                                _context.next = 11;
                                break;
                            }

                            newInfo = this.getUrlInfo(url);
                            oldInfo = this.getUrlInfo(this.caOperateUrl);

                            if (!(!newInfo || !oldInfo)) {
                                _context.next = 10;
                                break;
                            }

                            cback({ errcode: '3000', description: '税盘操作地址格式异常' });
                            return _context.abrupt('return');

                        case 10:
                            if (newInfo.protocol !== oldInfo.protocol || newInfo.hostname !== oldInfo.hostname) {
                                this.caOperateUrl = '';
                            }

                        case 11:
                            if (!this.caOperateUrl) {
                                _context.next = 19;
                                break;
                            }

                            _context.next = 14;
                            return crossHttp({
                                'method': 'POST',
                                'data': data,
                                'url': this.caOperateUrl
                            });

                        case 14:
                            res = _context.sent;
                            errmsg = res.errmsg || res.description || '税盘操作异常';

                            if (res.errcode === '0000') {
                                if (res.result !== '') {
                                    cback({ errcode: '0000', data: res.result });
                                } else {
                                    cback({ errcode: '7000', description: errmsg });
                                }
                            } else {
                                cback({ errcode: res.errcode, description: errmsg });
                            }
                            _context.next = 44;
                            break;

                        case 19:
                            urlInfo = this.getUrlInfo(url);
                            _res = {};
                            i = 0;

                        case 22:
                            if (!(i < this.allowPorts.length)) {
                                _context.next = 43;
                                break;
                            }

                            port = this.allowPorts[i];
                            curUrl = this.mergeUrlInfo(urlInfo, { port: port });
                            _context.next = 27;
                            return crossHttp({
                                'method': 'POST',
                                'data': data,
                                'url': curUrl
                            });

                        case 27:
                            resInner = _context.sent;
                            _errmsg = resInner.errmsg || resInner.description || '税盘操作异常';

                            if (!(resInner.errcode === '0000')) {
                                _context.next = 39;
                                break;
                            }

                            if (!(resInner.result !== '')) {
                                _context.next = 36;
                                break;
                            }

                            this.caOperateUrl = curUrl;
                            _res = { errcode: '0000', data: resInner.result };
                            return _context.abrupt('break', 43);

                        case 36:
                            _res = { errcode: '7000', description: _errmsg };

                        case 37:
                            _context.next = 40;
                            break;

                        case 39:
                            _res = { errcode: resInner.errcode, description: _errmsg };

                        case 40:
                            i++;
                            _context.next = 22;
                            break;

                        case 43:
                            cback(_res);

                        case 44:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function requestDisk(_x4, _x5, _x6) {
            return _ref.apply(this, arguments);
        }

        return requestDisk;
    }(),
    getClientHello: function getClientHello(passwd, url) {
        var _this = this;

        return new Promise(function (resolve) {
            var data = { "funcname": "clienthello", "args": { "userpin": passwd, "dwflags": 0 } };
            _this.requestDisk(url, data, function (res) {
                resolve(res);
            });
        });
    },
    getClientAuthCode: function getClientAuthCode(passwd, serverPacket, url) {
        var _this2 = this;

        return new Promise(function (resolve) {
            var data = { "funcname": "clientauth", "args": { "userpin": passwd, "strServerHello": serverPacket } };
            _this2.requestDisk(url, data, function (res) {
                resolve(res);
            });
        });
    },
    getTaxInfoFromDisk: function getTaxInfoFromDisk(passwd, type, url) {
        var _this3 = this;

        return new Promise(function (resolve) {
            var data = { "funcname": "getcertinfo", "args": { "userpin": passwd, "cert": "", "certinfono": type } };
            _this3.requestDisk(url, data, function (res) {
                resolve(res);
            });
        });
    },
    signDataApi: function signDataApi(originData, passwd) {
        var flag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        var _this4 = this;

        var alg = arguments[3];
        var url = arguments[4];

        return new Promise(function (resolve) {
            var r = {
                data: originData,
                alg: "SHA1withRSA",
                flag: 4194304
            };

            var data = { "funcname": "sign", "args": r };
            _this4.requestDisk(url, data, function (res) {
                resolve(res);
            });
        });
    },
    companyAuth: function companyAuth(url, data) {
        var _this5 = this;

        return new Promise(function (resolve) {
            _this5.requestDisk(url, data, function (res) {
                resolve(res);
            });
        });
    }
};
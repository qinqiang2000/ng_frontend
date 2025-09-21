'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.kdRequest = exports.pwyFetch = exports.errcodeInfo = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var kdRequest = exports.kdRequest = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref6) {
        var _ref6$method = _ref6.method,
            method = _ref6$method === undefined ? 'GET' : _ref6$method,
            _ref6$url = _ref6.url,
            url = _ref6$url === undefined ? '' : _ref6$url,
            _ref6$data = _ref6.data,
            data = _ref6$data === undefined ? {} : _ref6$data,
            _ref6$timeout = _ref6.timeout,
            timeout = _ref6$timeout === undefined ? 90000 : _ref6$timeout,
            _ref6$dataType = _ref6.dataType,
            dataType = _ref6$dataType === undefined ? 'json' : _ref6$dataType,
            _ref6$headers = _ref6.headers,
            headers = _ref6$headers === undefined ? { 'Content-Type': 'application/json' } : _ref6$headers;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return pwyFetch(url, { body: data, headers: headers, timeout: timeout, dataType: dataType, method: method.toUpperCase() });

                    case 2:
                        return _context4.abrupt('return', _context4.sent);

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function kdRequest(_x11) {
        return _ref5.apply(this, arguments);
    };
}();

var _cookie_helps = require('./cookie_helps');

var _kdRequest = require('./kdRequest');

var _tools = require('./tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTimeout = 90000;

var errcodeInfo = exports.errcodeInfo = {
    gatewayTimeout: {
        errcode: 'gatewayTimeout',
        description: '网关超时，请稍后再试!'
    },
    serverErr: {
        errcode: 'serverErr',
        description: '服务端异常, 请稍后再试！'
    },
    requestErr: {
        errcode: 'requestErr',
        description: '请求错误, 请检查网络或参数！'
    },
    timeoutErr: {
        errcode: 'timeoutErr',
        description: '请求超时, 请检查网络是否正常！'
    }
};

var createFetch = function createFetch(url, options) {
    return new _promise2.default(function (resolve) {
        var _ref = options || {},
            _ref$dataType = _ref.dataType,
            dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
            method = _ref.method,
            _ref$headers = _ref.headers,
            headers = _ref$headers === undefined ? {} : _ref$headers,
            _ref$mode = _ref.mode,
            mode = _ref$mode === undefined ? 'cors' : _ref$mode,
            _ref$credentials = _ref.credentials,
            credentials = _ref$credentials === undefined ? 'include' : _ref$credentials,
            _ref$redirect = _ref.redirect,
            redirect = _ref$redirect === undefined ? 'follow' : _ref$redirect,
            body = _ref.body,
            onResponseProgress = _ref.onResponseProgress,
            callback = _ref.callback;

        var requestObj = {
            method: method,
            mode: mode,
            credentials: credentials,
            redirect: redirect
        };

        var handler = function handler(res) {
            if (typeof callback === 'function') {
                callback(res);
            } else {
                resolve(res);
            }
        };

        var upperMethod = method.toUpperCase();

        if (dataType === 'json' || dataType === 'text') {
            requestObj.dataType = 'text';
        }

        requestObj.headers = headers;

        if (upperMethod !== 'GET') {
            requestObj.body = body;
        }

        fetch(url, requestObj).then(function (response) {
            if (response.status === 504) {
                handler(errcodeInfo.gatewayTimeout);
            } else if (response.status === 500) {
                handler(errcodeInfo.serverErr);
            } else if (response.status === 400 || response.status === 404) {
                handler(errcodeInfo.requestErr);
            } else {
                var handlerRes = function handlerRes(resText) {
                    var res = void 0;
                    if (dataType === 'json') {
                        try {
                            res = JSON.parse(resText);
                        } catch (err1) {
                            (0, _tools.consoleLog)(err1);
                            res = (0, _extends3.default)({}, errcodeInfo.serverErr);
                        }
                        handler(res);
                    } else {
                        handler(resText);
                    }
                };

                if (typeof onResponseProgress === 'function' && typeof TextDecoder === 'function') {
                    var reader = response.body.getReader();
                    var decoder = new TextDecoder();
                    var bytesReceived = 0;
                    var resText = '';
                    var conentLength = response.headers.get('content-length');
                    conentLength = parseInt(conentLength);
                    return reader.read().then(function processResult(result) {
                        if (result.done) {
                            onResponseProgress(bytesReceived, conentLength);
                            handlerRes(resText);
                            return;
                        }
                        bytesReceived += result.value.length;
                        resText += decoder.decode(result.value);
                        onResponseProgress(bytesReceived, conentLength);
                        return reader.read().then(processResult);
                    });
                } else {
                    response.text().then(function (resText) {
                        handlerRes(resText);
                    }).catch(function (err2) {
                        (0, _tools.consoleLog)(err2);
                        handler(errcodeInfo.requestErr);
                    });
                }
            }
        }).catch(function (err3) {
            (0, _tools.consoleLog)(err3);
            handler(errcodeInfo.requestErr);
        });
    });
};

var __createTimeoutFetch = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(url, options) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _promise2.default.race([createFetch(url, options), new _promise2.default(function (resolve) {
                            setTimeout(function () {
                                var res = (0, _extends3.default)({}, errcodeInfo.timeoutErr);
                                if (typeof options.callback === 'function') {
                                    options.callback(res);
                                } else {
                                    resolve(res);
                                }
                            }, options.timeout || defaultTimeout);
                        })]);

                    case 2:
                        return _context.abrupt('return', _context.sent);

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function __createTimeoutFetch(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
}();

var __XMLHttpRequest = function __XMLHttpRequest(url, options) {
    return new _promise2.default(function (resolve) {
        var xhr = new window.XMLHttpRequest();
        var _options$method = options.method,
            method = _options$method === undefined ? 'GET' : _options$method,
            _options$body = options.body,
            body = _options$body === undefined ? null : _options$body,
            _options$dataType = options.dataType,
            dataType = _options$dataType === undefined ? 'json' : _options$dataType,
            headers = options.headers,
            callback = options.callback,
            onRequestProgress = options.onRequestProgress,
            onResponseProgress = options.onResponseProgress,
            onProgress = options.onProgress;


        var handler = function handler(res) {
            if (typeof callback === 'function') {
                callback(res);
            } else {
                resolve(res);
            }
        };

        var handlerOnProgress = function handlerOnProgress() {
            var loaded = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var total = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            if (typeof onProgress === 'function') {
                try {
                    onProgress(xhr.readyState, xhr.status, loaded, total);
                } catch (error) {
                    (0, _tools.consoleLog)(error);
                }
            }
        };

        handlerOnProgress();
        xhr.open(method, url, true);
        handlerOnProgress();
        xhr.ontimeout = function () {
            handler(errcodeInfo.timeoutErr);
            handlerOnProgress();
        };

        if (typeof onRequestProgress === 'function' || typeof onProgress === 'function') {
            xhr.upload.onprogress = function () {
                var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                if (typeof onRequestProgress === 'function') {
                    try {
                        onRequestProgress(evt.loaded, evt.total);
                    } catch (error) {
                        (0, _tools.consoleLog)(error);
                    }
                }
                handlerOnProgress(evt.loaded, evt.total);
            };
        }

        if (typeof onResponseProgress === 'function' || typeof onProgress === 'function') {
            xhr.onprogress = function () {
                var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                if (typeof onResponseProgress === 'function') {
                    try {
                        onResponseProgress(evt.loaded, evt.total);
                    } catch (error) {
                        (0, _tools.consoleLog)(error);
                    }
                }
                handlerOnProgress(evt.loaded, evt.total);
            };
        }

        xhr.onreadystatechange = function () {
            handlerOnProgress();
            var readyState = xhr.readyState;
            var status = xhr.status;
            if (readyState === 4 && status === 200) {
                var resText = xhr.responseText;
                var res = void 0;
                if (dataType === 'json') {
                    try {
                        res = JSON.parse(resText);
                    } catch (err1) {
                        (0, _tools.consoleLog)(err1);
                        res = (0, _extends3.default)({}, errcodeInfo.serverErr);
                    }
                    handler(res);
                } else {
                    console && console.warn('xhr onreadystatechange resText', resText);
                    handler(resText);
                }
                xhr = null;
            }
        };

        xhr.onerror = function (error) {
            (0, _tools.consoleLog)('xhr error: ', error);
            handler(errcodeInfo.requestErr);
            handlerOnProgress();
        };

        if (headers && headers['Content-Type']) {
            xhr.setRequestHeader('Content-Type', headers['Content-Type']);
        }

        if (headers && headers['x-csrf-token']) {
            xhr.setRequestHeader('x-csrf-token', headers['x-csrf-token']);
        }

        if (dataType === 'json') {
            xhr.responseType = 'text';
        }

        xhr.timeout = options.timeout || defaultTimeout;
        if (method.toLowerCase() === 'post') {
            xhr.send(body);
        } else {
            xhr.send(null);
        }
        handlerOnProgress();
    });
};

var __XDomainRequest = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(url, options) {
        var __innerXdr;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        __innerXdr = new _promise2.default(function (resolve) {
                            var xdr = new window.XDomainRequest();
                            var _options$method2 = options.method,
                                method = _options$method2 === undefined ? 'GET' : _options$method2,
                                _options$body2 = options.body,
                                body = _options$body2 === undefined ? null : _options$body2,
                                callback = options.callback,
                                _options$dataType2 = options.dataType,
                                dataType = _options$dataType2 === undefined ? 'json' : _options$dataType2;

                            var handler = function handler(res) {
                                if (typeof callback === 'function') {
                                    callback(res);
                                } else {
                                    resolve(res);
                                }
                            };

                            xdr.open(method, url);

                            xdr.ontimeout = function () {
                                handler(errcodeInfo.timeoutErr);
                            };

                            xdr.onerror = function (error) {
                                (0, _tools.consoleLog)(error);
                                handler(errcodeInfo.requestErr);
                            };

                            xdr.onload = function () {
                                var resText = xhr.responseText;
                                var res = void 0;
                                if (dataType === 'json') {
                                    try {
                                        res = JSON.parse(resText);
                                    } catch (err1) {
                                        (0, _tools.consoleLog)(err1);
                                        res = (0, _extends3.default)({}, errcodeInfo.serverErr);
                                    }
                                    handler(res);
                                } else {
                                    handler(resText);
                                }
                            };

                            if (method.toLowerCase() === 'post') {
                                xdr.send(body);
                            } else {
                                xdr.send(null);
                            }
                        });
                        _context2.next = 3;
                        return _promise2.default.race([__innerXdr, new _promise2.default(function (r) {
                            setTimeout(function () {
                                var res = (0, _extends3.default)({}, errcodeInfo.timeoutErr);
                                if (typeof callback === 'function') {
                                    callback(res);
                                } else {
                                    r(res);
                                }
                            }, options.timeout || defaultTimeout);
                        })]);

                    case 3:
                        return _context2.abrupt('return', _context2.sent);

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function __XDomainRequest(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
}();

var pwyFetch = exports.pwyFetch = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(url, options) {
        var method, body, headers, upperMethod, contentType, csrfToken, res;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        method = options.method || 'GET';
                        body = options.data || options.body;
                        headers = options.headers || {};
                        upperMethod = method.toUpperCase();
                        contentType = options.contentType || 'json';


                        if (contentType === 'json') {
                            headers['Content-Type'] = 'application/json; charset=UTF-8';
                        }

                        csrfToken = (0, _cookie_helps.getCookie)('csrfToken');

                        if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

                        if (url.indexOf('?') === -1) {
                            url = url + '?_csrf=' + csrfToken;
                        } else {
                            url = url + '&_csrf=' + csrfToken;
                        }

                        if (csrfToken) {
                            try {
                                headers['x-csrf-token'] = csrfToken;
                                (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);
                            } catch (e) {
                                (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);
                            }
                        }

                        options = (0, _extends3.default)({}, options, { headers: headers, body: body });

                        if (upperMethod === 'GET') {
                            if (typeof options.disabledCache === 'undefined' || options.disabledCache === false) {
                                if (url.indexOf('?') === -1) {
                                    url = url + '?random=' + Math.random();
                                } else {
                                    url = url + '&random=' + Math.random();
                                }
                            }

                            if (body && (typeof body === 'undefined' ? 'undefined' : (0, _typeof3.default)(body)) === 'object') {
                                body = (0, _kdRequest.param)(body, true);
                                if (body) {
                                    url += '&' + body;
                                }
                            }
                        }

                        if (upperMethod === 'POST' && body && (typeof body === 'undefined' ? 'undefined' : (0, _typeof3.default)(body)) === 'object' && contentType === 'json') {
                            options = (0, _extends3.default)({}, options, { body: (0, _stringify2.default)(body) });
                        }

                        res = void 0;

                        if (!(window.fetch && !options.onRequestProgress && !options.disabledFetch && !options.onProgress)) {
                            _context3.next = 18;
                            break;
                        }

                        res = __createTimeoutFetch(url, options);
                        _context3.next = 28;
                        break;

                    case 18:
                        if (!window.XMLHttpRequest) {
                            _context3.next = 24;
                            break;
                        }

                        _context3.next = 21;
                        return __XMLHttpRequest(url, options);

                    case 21:
                        res = _context3.sent;
                        _context3.next = 28;
                        break;

                    case 24:
                        if (!window.XDomainRequest) {
                            _context3.next = 28;
                            break;
                        }

                        _context3.next = 27;
                        return __XDomainRequest(url, options);

                    case 27:
                        res = _context3.sent;

                    case 28:
                        return _context3.abrupt('return', res);

                    case 29:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function pwyFetch(_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
}();
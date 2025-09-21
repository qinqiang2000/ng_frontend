'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.kdRequest = exports.param = exports.prePath = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var kdRequest = exports.kdRequest = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref4) {
        var _ref4$urlPre = _ref4.urlPre,
            urlPre = _ref4$urlPre === undefined ? '' : _ref4$urlPre,
            _ref4$method = _ref4.method,
            method = _ref4$method === undefined ? 'GET' : _ref4$method,
            _ref4$url = _ref4.url,
            url = _ref4$url === undefined ? '' : _ref4$url,
            _ref4$data = _ref4.data,
            data = _ref4$data === undefined ? '' : _ref4$data,
            _ref4$mode = _ref4.mode,
            mode = _ref4$mode === undefined ? 'cors' : _ref4$mode,
            _ref4$timeout = _ref4.timeout,
            timeout = _ref4$timeout === undefined ? 60000 : _ref4$timeout,
            _ref4$redirect = _ref4.redirect,
            redirect = _ref4$redirect === undefined ? 'follow' : _ref4$redirect,
            _ref4$dataType = _ref4.dataType,
            dataType = _ref4$dataType === undefined ? 'json' : _ref4$dataType,
            _ref4$credentials = _ref4.credentials,
            credentials = _ref4$credentials === undefined ? 'include' : _ref4$credentials,
            handlerError = _ref4.handlerError,
            _ref4$headers = _ref4.headers,
            headers = _ref4$headers === undefined ? { 'Content-Type': 'application/json' } : _ref4$headers;
        var csrfToken, response, resData;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:

                        if (!/^http/.test(url)) {
                            url = urlPre + url;
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

                        if (!window.fetch) {
                            _context.next = 18;
                            break;
                        }

                        _context.next = 8;
                        return myFetch({
                            url: url,
                            data: data,
                            dataType: dataType,
                            headers: headers,
                            method: method
                        });

                    case 8:
                        response = _context.sent;

                        if (!(response.status !== 200)) {
                            _context.next = 13;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '5000', description: '\u8BF7\u6C42\u51FA\u9519(' + response.status + ')' });

                    case 13:
                        _context.next = 15;
                        return response.text().then(function (res) {
                            if (dataType === 'json') {
                                try {
                                    res = JSON.parse(res);
                                    return res;
                                } catch (e) {
                                    return { errcode: 'jsonErr', description: '返回数据格式异常', data: res };
                                }
                            } else {
                                return res;
                            }
                        }).catch(function (error) {
                            return { errcode: 'serverErr', description: error };
                        });

                    case 15:
                        return _context.abrupt('return', _context.sent);

                    case 16:
                        _context.next = 23;
                        break;

                    case 18:

                        if (method === 'GET') {
                            data = param(data);
                        } else if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object' && dataType === 'json') {
                            data = (0, _stringify2.default)(data);
                        }

                        _context.next = 21;
                        return myXhr({
                            method: method,
                            url: url,
                            data: data,
                            timeout: timeout,
                            credentials: credentials,
                            headers: headers
                        });

                    case 21:
                        resData = _context.sent;
                        return _context.abrupt('return', resData);

                    case 23:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function kdRequest(_x) {
        return _ref3.apply(this, arguments);
    };
}();

var _cookie_helps = require('./cookie_helps');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prePath = exports.prePath = '/';
var param = exports.param = function param(data) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return data;
        }
    }

    var result = [];
    for (var item in data) {
        if (data.hasOwnProperty(item)) {
            result.push(item + '=' + encodeURIComponent(data[item]));
        }
    }
    return result.join('&');
};

var myFetch = function myFetch(_ref) {
    var _ref$method = _ref.method,
        method = _ref$method === undefined ? 'GET' : _ref$method,
        _ref$url = _ref.url,
        url = _ref$url === undefined ? '' : _ref$url,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? '' : _ref$data,
        _ref$mode = _ref.mode,
        mode = _ref$mode === undefined ? 'cors' : _ref$mode,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 60000 : _ref$timeout,
        _ref$redirect = _ref.redirect,
        redirect = _ref$redirect === undefined ? 'follow' : _ref$redirect,
        _ref$dataType = _ref.dataType,
        dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
        _ref$credentials = _ref.credentials,
        credentials = _ref$credentials === undefined ? 'include' : _ref$credentials,
        _ref$headers = _ref.headers,
        headers = _ref$headers === undefined ? { 'Content-Type': 'application/json' } : _ref$headers;

    var requestObj = {
        method: method,
        mode: mode,
        credentials: credentials,
        redirect: redirect
    };

    if (method === 'GET') {
        data = param(data);
    } else if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object' && dataType === 'json') {
        data = (0, _stringify2.default)(data);
    }

    if (method === 'GET') {
        if (url.indexOf('?') === -1) {
            url += '?' + data;
        } else {
            url += '&' + data;
        }
    } else if (method === 'POST') {
        requestObj.body = data;
    }

    if (dataType === 'json') {
        requestObj.headers = headers;
    }

    return fetch(url, requestObj);
};

function myXhr(_ref2) {
    var _ref2$method = _ref2.method,
        method = _ref2$method === undefined ? 'GET' : _ref2$method,
        _ref2$url = _ref2.url,
        url = _ref2$url === undefined ? '' : _ref2$url,
        _ref2$data = _ref2.data,
        data = _ref2$data === undefined ? '' : _ref2$data,
        _ref2$timeout = _ref2.timeout,
        timeout = _ref2$timeout === undefined ? 60000 : _ref2$timeout,
        _ref2$credentials = _ref2.credentials,
        credentials = _ref2$credentials === undefined ? 'include' : _ref2$credentials,
        contentType = _ref2.contentType,
        headers = _ref2.headers,
        success = _ref2.success;

    contentType = headers['Content-Type'] || 'application/json;charset=UTF-8';
    return new _promise2.default(function (resolve, reject) {
        var xhr = void 0;

        if (XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
        if (!xhr && typeof XDomainRequest !== 'undefined') {
            xhr = new XDomainRequest();
        }

        try {
            xhr.timeout = timeout;
        } catch (e) {
            console.warn('设置超时时间异常');
        }

        xhr.ontimeout = function () {
            resolve({ errcode: 'timeoutErr', description: '请求超时！' });
        };

        if (contentType) {
            try {
                xhr.contentType = contentType;
            } catch (e) {
                console.warn('设置contentType异常');
            }
        }

        xhr.onload = function () {
            if (xhr.readyState === 4) {
                var status = xhr.status;
                if (status === 200) {
                    var resData = xhr.responseText;
                    try {
                        resData = JSON.parse(resData);
                        resolve(resData);
                    } catch (e) {
                        resolve({ errcode: 'innerErr', description: '返回数据出错！' });
                    }
                } else {
                    resolve({ errcode: 'requestErr', description: '\u8BF7\u6C42\u51FA\u9519' + status });
                }
            }
        };

        xhr.onerror = function (error) {
            resolve({ errcode: 'requestErr', description: '\u8BF7\u6C42\u5F02\u5E38' });
        };

        xhr.open(method, url, true);

        try {
            xhr.setRequestHeader('Content-Type', contentType);
            if (headers['x-csrf-token']) xhr.setRequestHeader('x-csrf-token', headers['x-csrf-token']);
        } catch (error) {}

        xhr.send(data);
    });
}
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crossHttp = function crossHttp(_ref) {
    var _ref$method = _ref.method,
        method = _ref$method === undefined ? 'POST' : _ref$method,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? '' : _ref$data,
        _ref$withCredentials = _ref.withCredentials,
        withCredentials = _ref$withCredentials === undefined ? false : _ref$withCredentials,
        _ref$dataType = _ref.dataType,
        dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
        _ref$contentType = _ref.contentType,
        contentType = _ref$contentType === undefined ? 'text/plain' : _ref$contentType,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 60000 : _ref$timeout,
        _ref$url = _ref.url,
        url = _ref$url === undefined ? 'http://127.0.0.1:52320/cryptctl' : _ref$url,
        onTimeout = _ref.onTimeout,
        onError = _ref.onError,
        success = _ref.success;

    return new _promise2.default(function (resolve, reject) {
        var xhr = null;
        if (XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }

        if (withCredentials && typeof xhr.withCredentials !== 'undefined') {
            xhr.withCredentials = true;
        }

        if (!xhr && typeof XDomainRequest !== 'undefined') {
            xhr = new XDomainRequest();
        }

        if (xhr) {

            try {
                xhr.timeout = timeout;
                xhr.contentLength = data.length;
            } catch (e) {
                console.warn('设置超时时间异常');
            }

            try {
                xhr.contentType = contentType;
            } catch (e) {
                console.warn('设置contentType异常');
            }

            xhr.onload = function () {
                var result = xhr.responseText;
                if (dataType === 'json') {
                    try {
                        result = JSON.parse(result);
                        resolve(result);
                    } catch (e) {
                        resolve({ description: '服务端异常', errcode: 'serverErr' });
                    }
                } else {
                    resolve(result);
                }
            };

            xhr.ontimeout = function () {
                resolve({ errcode: 'timeout', description: '请求超时,请安装且启动“金蝶发票管理组件”后重试！' }, xhr);
            };

            xhr.onerror = function () {
                resolve({ errcode: 'err', description: '请求异常,请安装且启动“金蝶发票管理组件”后重试！' }, xhr);
            };

            xhr.open(method, url, true);

            if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object') {
                data = (0, _stringify2.default)(data);
            }

            if (typeof data === 'string') {
                xhr.send(data);
            } else {
                resolve({ errcode: 'argsErr', description: '参数格式不正确' });
            }
        } else {
            xhr = null;
            resolve({ errcode: 'accessErr', description: '税盘不支持访问' });
        }
    });
};

exports.default = crossHttp;
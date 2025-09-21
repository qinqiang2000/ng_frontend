'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clearCache = exports.getCache = exports.setCache = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./cookie_helps'),
    setCookie = _require.setCookie,
    clearCookie = _require.clearCookie;

var setCache = exports.setCache = function setCache(key, value, flag) {
    if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
        value = escape((0, _stringify2.default)(value));
    } else {
        value = escape(value);
    }

    if (!localStorage && !sessionStorage) {
        try {
            var timeout = 60 * 60;
            if (!isNaN(parseInt(flag))) {
                timeout = flag;
            }
            setCookie(key, value, timeout);
            return true;
        } catch (e) {
            return false;
        }
    } else {
        if (flag == 'localStorage' && localStorage) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                return false;
            }
        } else if (!isNaN(parseInt(flag))) {
            try {
                setCookie(key, value, flag);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            try {
                sessionStorage.setItem(key, value);
                return true;
            } catch (e) {
                return false;
            }
        }
    }
};

var getCache = exports.getCache = function getCache(key, flag, type) {
    if (!localStorage && !sessionStorage) {
        if (type === 'string') {
            return unescape(getCookie(key));
        } else {
            try {
                var v = unescape(getCookie(key));
                return JSON.parse(v);
            } catch (e) {
                return v;
            }
        }
    } else {
        if (flag == 'localStorage' && localStorage) {
            if (type === 'string') {
                return unescape(localStorage.getItem(key));
            } else {
                try {
                    var v = unescape(localStorage.getItem(key));
                    return JSON.parse(v);
                } catch (e) {
                    return v;
                }
            }
        } else if (flag == 'cookie' || !isNaN(parseInt(flag))) {
            if (type === 'string') {
                return unescape(getCookie(key));
            } else {
                try {
                    var v = unescape(getCookie(key));
                    return JSON.parse(v);
                } catch (e) {
                    return v;
                }
            }
        } else {
            if (type === 'string') {
                return unescape(sessionStorage.getItem(key));
            } else {
                try {
                    var v = unescape(sessionStorage.getItem(key));
                    return JSON.parse(v);
                } catch (e) {
                    return v;
                }
            }
        }
    }
};

var clearCache = exports.clearCache = function clearCache(key, flag) {
    if (!localStorage && !sessionStorage) {
        try {
            clearCookie(key);
            return true;
        } catch (e) {
            return false;
        }
    } else {
        if (flag == 'localStorage' && localStorage) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        } else if (flag == 'cookie' || !isNaN(parseInt(flag))) {
            try {
                clearCookie(key);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        }
    }
};
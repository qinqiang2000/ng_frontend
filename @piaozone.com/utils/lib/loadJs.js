'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadScripts = exports.use = exports.syncUse = exports.getLoadedJs = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLoadedJs = exports.getLoadedJs = function getLoadedJs() {
    var loadedUnAMDScripts = [];

    if ((typeof document === 'undefined' ? 'undefined' : (0, _typeof3.default)(document)) === 'object' && document.getElementsByTagName) {
        var scriptsObj = document.getElementsByTagName('script');
        for (var i = scriptsObj.length; i--;) {
            var src = scriptsObj[i].src || '';
            if (src != '') {
                loadedUnAMDScripts.push(src);
            }
        }
    }
    return loadedUnAMDScripts;
};

var getFullPath = function getFullPath(path, basePath) {
    if (/^https?:\/\/.*$/.test(path)) {
        return path;
    }
    basePath = basePath || window.location.href.replace(/\/[0-0a-zA-Z._-]*$/, '');
    var rootPath = window.location.origin;
    if (/^\/.*$/.test(path)) {
        return rootPath + path;
    } else if (/^\.\/.*$/.test(path)) {
        return basePath + path.replace(/^\./, '');
    } else if (/^\.\.\/.*/.test(path)) {
        var puri = path.split('/');
        var newUri = [];
        for (var i = 0; i < puri.length; i++) {
            if (puri[i] == '..' && rootPath != basePath) {
                basePath = basePath.replace(/\/[0-0a-zA-Z._-]*$/, '');
            } else if (puri[i] != '.' && puri[i] != '..') {
                newUri.push(puri[i]);
            }
        }
        return basePath + '/' + newUri.join('/');
    } else {
        return basePath + path;
    }
};

var syncUse = exports.syncUse = function syncUse(sUrls, callback) {
    var loadedUnAMDScripts = getLoadedJs();
    var urls = [];
    if (typeof sUrls === 'string') {
        urls.push(getFullPath(sUrls));
    } else {
        for (var i = 0, len = sUrls.length; i < len; i++) {
            urls.push(getFullPath(sUrls[i]));
        }
    }

    return function next(i) {
        if (loadedUnAMDScripts.indexOf(urls[i]) == -1) {
            if (i < urls.length) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                if (script.readyState) {
                    script.onreadystatechange = function () {
                        if (script.readyState == 'loaded' || script.readyState == 'complete') {
                            script.onreadystatechange = null;
                            next(i + 1);
                        }
                    };
                } else {
                    script.onload = function () {
                        next(i + 1);
                    };
                }
                script.src = urls[i];
                if (/^.*sea\.js\/?$/.test(urls[i])) {
                    script.id = 'seajsnode';
                }
                document.getElementsByTagName('head')[0].appendChild(script);
                loadedUnAMDScripts.push(urls[i]);
            } else {
                callback();
            }
        } else {
            next(i + 1);
        }
    }(0);
};

var use = exports.use = function use(sUrls, callback) {
    var loadedUnAMDScripts = getLoadedJs();
    var loadedNumber = 0;
    var jsNumber;
    var urls = [];

    if (typeof sUrls === 'string') {
        urls.push(getFullPath(sUrls));
    } else {
        for (var i = sUrls.length; i--;) {
            urls.push(getFullPath(sUrls[i]));
        }
    }
    jsNumber = urls.length;
    for (var _i = jsNumber; _i--;) {
        var jsSrc = urls[_i];
        if (loadedUnAMDScripts.indexOf(jsSrc) == -1) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        script.onreadystatechange = null;
                        if (++loadedNumber == jsNumber) {
                            callback();
                        }
                    }
                };
            } else {
                script.onload = function () {
                    if (++loadedNumber == jsNumber) {
                        callback();
                    }
                };
            }
            script.src = urls[_i];
            if (/^.*sea\.js\/?$/.test(jsSrc)) {
                script.id = 'seajsnode';
            }
            document.getElementsByTagName('head')[0].appendChild(script);
            loadedUnAMDScripts.push(urls[_i]);
        } else {
            if (++loadedNumber == jsNumber) {
                callback();
            }
        }
    }
};

var loadScripts = exports.loadScripts = function loadScripts(sUrls, syncFlag) {
    return new _promise2.default(function (resolve) {
        try {
            if (syncFlag) {
                syncUse(sUrls, function () {
                    resolve(true);
                });
            } else {
                use(sUrls, function () {
                    resolve(true);
                });
            }
        } catch (error) {
            resolve(false);
        }
    });
};
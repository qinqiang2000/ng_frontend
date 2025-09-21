'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var urlSearch = exports.urlSearch = function urlSearch() {
    var search = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    search = search.replace(/^\?/, '');
    var urlParams = {};
    var urlParamArr = search.split('&');
    for (var i = 0, len = urlParamArr.length; i < len; i++) {
        var param = urlParamArr[i].split('=');
        var tempValue = '';
        if (param.length > 1) {
            tempValue = param[1];
        }
        urlParams[param[0]] = tempValue;
    }
    return urlParams;
};
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.readAsBinaryString = exports.getInvoiceErrInfo = exports.isInVisualArea = exports.consoleLog = exports.getUUId = exports.downloadFile = exports.blobToFile = exports.getInvoiceQrInfoNew = exports.getInvoiceQrInfo = exports.checkInvoiceTin = exports.checkInvoiceTitle = exports.getInvoiceTypeName = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _kdRequest = require('./kdRequest');

var _cookie_helps = require('./cookie_helps');

var _pwyConstants = require('@piaozone.com/pwyConstants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INPUT_INVOICE_TYPES_DICT = _pwyConstants.invoiceTypes.INPUT_INVOICE_TYPES_DICT;
var getInvoiceTypeName = exports.getInvoiceTypeName = function getInvoiceTypeName(i) {
    var dict = {
        'k1': '普通电子发票',
        'k2': '电子发票专票',
        'k3': '普通纸质发票',
        'k4': '专用纸质发票',
        'k5': '普通纸质卷式发票',
        'k7': '通用机打票',
        'k8': '的士票',
        'k9': '火车票',
        'k10': '飞机票',
        'k11': '其他票',
        'k12': '机动车发票',
        'k13': '二手车发票',
        'k14': '定额发票',
        'k15': '通行费电子发票',
        'k16': '客运发票',
        'k17': '过路过桥费'
    };

    return dict['k' + i] || '--';
};

var checkInvoiceTitle = exports.checkInvoiceTitle = function checkInvoiceTitle(fplx) {
    var invoiceGhf_mc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var ghf_mc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var checkMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'simple';

    var checkInvoiceTypes = [1, 3, 4, 5, 15];

    var filterReg = /[^A-Za-z0-9\u4e00-\u9fa5]/g;

    if (checkInvoiceTypes.indexOf(parseInt(fplx)) !== -1) {
        invoiceGhf_mc = invoiceGhf_mc.replace(filterReg, '').trim();
        ghf_mc = ghf_mc.replace(filterReg, '').trim();

        if (checkMode === 'strict') {
            if (invoiceGhf_mc === ghf_mc) {
                return 1;
            } else {
                return 2;
            }
        } else if (checkMode === 'simple') {
            if (invoiceGhf_mc.length < 6 || invoiceGhf_mc === ghf_mc) {
                return 1;
            } else {
                return 2;
            }
        }
    } else {
        return 3;
    }
};

var checkInvoiceTin = exports.checkInvoiceTin = function checkInvoiceTin(fplx) {
    var invoiceGhf_tin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var ghf_tin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var invoiceGhf_mc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var checkMode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'simple';

    var checkInvoiceTypes = [1, 3, 4, 5, 15];

    var filterReg = /[^A-Za-z0-9\u4e00-\u9fa5]/g;

    if (checkInvoiceTypes.indexOf(parseInt(fplx)) !== -1) {
        if (checkMode === 'strict') {
            if (invoiceGhf_tin === ghf_tin) {
                return 1;
            } else {
                return 2;
            }
        } else if (checkMode === 'simple') {
            invoiceGhf_mc = invoiceGhf_mc.replace(filterReg, '').trim();
            if (invoiceGhf_mc.length < 6 || invoiceGhf_tin === ghf_tin) {
                return 1;
            } else {
                return 2;
            }
        }
    } else {
        return 3;
    }
};

var getInvoiceQrInfo = exports.getInvoiceQrInfo = function getInvoiceQrInfo(qrStr) {
    var fpInfo = qrStr.replace(/[，]/g, ',').split(',');
    try {
        var fpdm = fpInfo[2];
        var fphm = fpInfo[3];
        var kprq = fpInfo[5];
        var amount = fpInfo[4];
        var jym = fpInfo[6].substr(-6);
        if (!fpdm || !fphm || !kprq) {
            return false;
        } else {
            return fpInfo = {
                fpdm: fpdm,
                fphm: fphm,
                kprq: kprq,
                amount: amount,
                jym: jym
            };
        }
    } catch (e) {
        return false;
    }
};

function urlSearch() {
    var search = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    search = search.replace('?', '&');
    if (typeof search !== "string" || !search) return search;
    return search.split("&").reduce(function (res, cur) {
        var arr = cur.split("=");
        return (0, _assign2.default)((0, _defineProperty3.default)({}, arr[0], arr[1]), res);
    }, {});
}

function checkInvoiceType(fpdm) {
    var last3Str = fpdm.substr(fpdm.length - 3);
    var last2Str = fpdm.substr(fpdm.length - 2);
    var firstStr = fpdm.substr(0, 1);
    var eighthStr = fpdm.substr(7, 1);
    var sixthStr = fpdm.substr(5, 1);
    if (fpdm.length == '10') {
        if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
            return 4;
        } else {
            return 3;
        }
    } else {
        if (fpdm.length == 12) {
            if (firstStr == '0' && last2Str == '12') {
                return 15;
            }
            if (firstStr == '0' && last2Str == '11') {
                return 1;
            }
            if (firstStr == '0' && last2Str == '06') {
                return 5;
            }
            if (firstStr == '0' && last2Str == '07') {
                return 5;
            }
            if (firstStr == '0' && last2Str == '17') {
                return 13;
            }
            if (sixthStr == '1' || sixthStr == '2') {
                if (eighthStr == '2') {
                    return 12;
                }
            }
            if (firstStr == '0' && last2Str == '13') {
                return 2;
            }
        }
    }
    return 3;
}

var getInvoiceQrInfoNew = exports.getInvoiceQrInfoNew = function getInvoiceQrInfoNew(qrStr) {
    if (qrStr.indexOf('https' || 'http') > -1 && qrStr.indexOf('?')) {
        var _urlSearch = urlSearch(qrStr),
            _urlSearch$bill_num = _urlSearch.bill_num,
            bill_num = _urlSearch$bill_num === undefined ? '' : _urlSearch$bill_num,
            _urlSearch$total_amou = _urlSearch.total_amount,
            total_amount = _urlSearch$total_amou === undefined ? '' : _urlSearch$total_amou,
            _urlSearch$hash = _urlSearch.hash,
            hash = _urlSearch$hash === undefined ? '' : _urlSearch$hash;

        if (bill_num != '' && total_amount != '' && hash != '') {
            return { errcode: '0000', qrcodeType: 'web', data: { bill_num: bill_num, total_amount: total_amount, hash: hash }, description: '成功' };
        } else {
            return { errcode: 'fail', qrcodeType: 'web', description: '请扫描发票（电，普，专）' };
        }
    } else {
        var fpInfo = qrStr.replace(/[，]/g, ',').split(',');
        try {
            var index = fpInfo[6].indexOf('20');
            var fpdm = fpInfo[2];
            var fphm = fpInfo[3];
            if (fpInfo[6].length == 8 && index == 0) {
                var kprq = fpInfo[6];
                var amount = fpInfo[5];
                var jym = fpInfo[7].substr(-5);
                return { errcode: '0000', qrcodeType: 'string', data: { fpdm: fpdm, fphm: fphm, kprq: kprq, amount: amount, jym: jym }, description: '成功' };
            } else {
                var _kprq = fpInfo[5];
                var _amount = fpInfo[4];
                var _jym = fpInfo[6].substr(-6);
                if (!fpdm || !fphm || !_kprq) {
                    return { errcode: 'fail', qrcodeType: 'string', description: '请扫描发票（电，普，专）' };
                } else {
                    if (_amount == '' && _jym == '') {
                        return { errcode: 'fail', description: '请扫描发票（电，普，专）' };
                    } else {
                        var fplxArr = [1, 2, 3, 4, 15];
                        var fplx = checkInvoiceType(fpdm);
                        if (fplxArr.indexOf(fplx) == '-1') {
                            return { errcode: 'fail', description: '请扫描发票（电，普，专）' };
                        } else {
                            return { errcode: '0000', qrcodeType: 'string', data: { fpdm: fpdm, fphm: fphm, kprq: _kprq, amount: _amount, jym: _jym }, description: '成功' };
                        }
                    }
                }
            }
        } catch (e) {
            return { errcode: 'fail', description: '请扫描发票（电，普，专）' };
        }
    }
};

var blobToFile = exports.blobToFile = function blobToFile(blobData, filename) {
    var nameArr = filename.split('.');
    var ext = nameArr[nameArr.length - 1];
    var type = 'image/jpeg';
    if (ext === 'png') {
        type = 'image/png';
    } else if (ext === 'bmp') {
        type = 'image/bmp';
    } else if (ext === 'jpg') {
        type = 'image/jpeg';
    } else if (ext === 'pdf') {
        type = 'application/pdf';
    } else {
        type = 'application/octet-stream';
    }

    if (window.File && typeof window.File === 'function') {
        var targetFile = new window.File([blobData], filename, { type: type });
        return targetFile;
    } else {
        return false;
    }
};

var downloadFileXhr = function downloadFileXhr(_ref) {
    var url = _ref.url,
        _ref$key = _ref.key,
        key = _ref$key === undefined ? 'downloadParams' : _ref$key,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data,
        _ref$method = _ref.method,
        method = _ref$method === undefined ? 'POST' : _ref$method,
        startCallback = _ref.startCallback,
        endCallback = _ref.endCallback,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 60000 : _ref$timeout;

    method = method.toLocaleLowerCase();
    startCallback();

    var myEndCallback = function myEndCallback(res) {
        (0, _cookie_helps.clearCookie)('downloadResult');
        typeof endCallback === 'function' && endCallback(res);
    };

    var xhr = new window.XMLHttpRequest();

    var csrfToken = (0, _cookie_helps.getCookie)('csrfToken');
    if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

    if (url.indexOf('?') === -1) {
        url = url + '?_csrf=' + csrfToken;
    } else {
        url = url + '&_csrf=' + csrfToken;
    }

    if (method === 'get') url += '&' + (0, _kdRequest.param)(data);

    xhr.open(method, url, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (csrfToken) {
        try {
            xhr.setRequestHeader('x-csrf-token', csrfToken);
            (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);
        } catch (e) {
            (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);
        }
    }
    xhr.timeout = timeout;
    xhr.onerror = function () {
        myEndCallback({ errcode: '5000', description: '服务端异常，请稍后再试' });
    };

    xhr.ontimeout = function () {
        myEndCallback({ errcode: '5004', description: '请求超时，请稍后再试' });
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            var blob = xhr.response;
            var ctype = xhr.getResponseHeader('Content-Type');
            if (ctype.indexOf('text/html') !== -1) {
                myEndCallback({ errcode: '5000', description: '服务端异常，请稍后再试' });
            } else if (ctype.indexOf('application/json') !== -1) {
                var reader = new window.FileReader();
                reader.onload = function () {
                    var content = reader.result;
                    try {
                        content = JSON.parse(content);
                    } catch (error) {
                        content = { errcode: '5000', description: '服务端异常，请稍后再试' };
                        console.error(error);
                    }
                    myEndCallback(content);
                };
                reader.readAsText(blob);
            } else {
                var disposition = xhr.getResponseHeader('Content-Disposition');

                var dispositionArr = disposition.replace(/\s/g, '').split(';');
                var dispositionObj = {};
                for (var i = 0, len = dispositionArr.length; i < len; i++) {
                    var param = dispositionArr[i].split('=');
                    var temValue = '';
                    if (param[1]) temValue = param[1].replace(/^"/, '').replace(/"$/, '');
                    dispositionObj[param[0]] = temValue;
                }
                var filename = dispositionObj['filename*'] || dispositionObj.filename || 'file';

                if (navigator.msSaveOrOpenBlob) {
                    navigator.msSaveOrOpenBlob(new Blob([blob]), filename);
                } else {
                    var eleLink = document.createElement('a');
                    eleLink.download = decodeURIComponent(filename);
                    eleLink.style.display = 'none';
                    eleLink.href = URL.createObjectURL(new Blob([blob]));
                    document.body.appendChild(eleLink);
                    eleLink.click();
                    document.body.removeChild(eleLink);
                }
                myEndCallback({ errcode: '0000', description: '下载成功' });
            }
        } else {
            myEndCallback({ errcode: '5000', description: '请求异常，请稍后再试' });
        }
    };

    if (method === 'post') {
        var dataStr = (0, _stringify2.default)(data);
        var newData = {};
        newData[key] = dataStr;
        xhr.send((0, _stringify2.default)(newData));
    } else {
        xhr.send();
    }
};

var downloadFile = exports.downloadFile = function downloadFile(opt) {
    var url = opt.url,
        _opt$key = opt.key,
        key = _opt$key === undefined ? 'downloadParams' : _opt$key,
        _opt$data = opt.data,
        data = _opt$data === undefined ? {} : _opt$data,
        _opt$method = opt.method,
        method = _opt$method === undefined ? 'POST' : _opt$method,
        startCallback = opt.startCallback,
        endCallback = opt.endCallback,
        _opt$downloadType = opt.downloadType,
        downloadType = _opt$downloadType === undefined ? 'xhr' : _opt$downloadType,
        _opt$timeout = opt.timeout,
        timeout = _opt$timeout === undefined ? 60000 : _opt$timeout;

    if (window.XMLHttpRequest && window.Blob && window.FileReader && downloadType === 'xhr') {
        downloadFileXhr(opt);
    } else {
        startCallback();
        var iframeId = 'tempDownloadIframe' + +new Date();
        var formId = 'tempFormId_' + +new Date();
        (0, _cookie_helps.clearCookie)('downloadResult');
        var myEndCallback = function myEndCallback(res) {
            var iframEl = document.getElementById(iframeId);
            var formEl = document.getElementById(formId);
            (0, _cookie_helps.clearCookie)('downloadResult');
            iframEl.innerHTML = '';
            iframEl.parentNode.removeChild(iframEl);
            formEl.parentNode.removeChild(formEl);
            typeof endCallback === 'function' && endCallback(res);
        };

        var checkStatus = function checkStatus(startTime) {
            if (+new Date() - startTime > timeout) {
                myEndCallback({ errcode: '5004', description: '请求超时，请稍后再试！' });
            } else {
                var result = (0, _cookie_helps.getCookie)('downloadResult');
                if (result) {
                    if (result === '1') {
                        myEndCallback({ errcode: '0000', description: '下载成功' });
                    } else {
                        result = JSON.parse(unescape(result));
                        myEndCallback(result);
                    }
                } else {
                    setTimeout(function () {
                        checkStatus(startTime);
                    }, 1000);
                }
            }
        };
        var iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.name = iframeId;
        iframe.enctype = 'application/x-www-form-urlencoded';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        var formEl = document.createElement('form');
        formEl.id = formId;
        formEl.target = iframeId;
        formEl.style.display = 'none';
        formEl.method = method;
        formEl.action = url;
        var inputEl = document.createElement('input');
        inputEl.type = 'hidden';
        inputEl.name = key;
        inputEl.value = (typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object' ? (0, _stringify2.default)(data) : data;
        formEl.appendChild(inputEl);
        document.body.appendChild(formEl);
        formEl.submit();
        checkStatus(+new Date());
    }
};

var getUUId = exports.getUUId = function getUUId() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
};

var consoleLog = exports.consoleLog = function consoleLog(tip) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'error';
    var title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if ((0, _typeof3.default)(window.console) === 'object') {
        if (level === 'error') {
            if (title) {
                window.console.error(title, tip);
            } else {
                window.console.error(tip);
            }
        } else if (level === 'warn') {
            if (title) {
                window.console.warn(title, tip);
            } else {
                window.console.warn(tip);
            }
        } else {
            if (title) {
                window.console.log(title, tip);
            } else {
                window.console.log(tip);
            }
        }
    }
};

var isInVisualArea = exports.isInVisualArea = function isInVisualArea(elCls, pObj) {
    var items = pObj.getElementsByClassName(elCls);
    var boxInfo = pObj.getBoundingClientRect();
    var top = boxInfo.top,
        left = boxInfo.left,
        bottom = boxInfo.bottom,
        right = boxInfo.right;

    var result = [];
    for (var i = 0; i < items.length; i++) {
        var itemInfo = items[i].getBoundingClientRect();

        if (itemInfo.top >= top && itemInfo.left >= left && itemInfo.top <= bottom && itemInfo.left <= right) {
            result.push(true);
        } else {
            result.push(false);
        }
    }
    return result;
};

var getInvoiceErrInfo = exports.getInvoiceErrInfo = function getInvoiceErrInfo(invoice) {
    var waringResult = [];
    var errorResult = [];

    var invoiceStatusDict = {
        k1: '该发票已失控',
        k2: '该发票已作废',
        k3: '该发票已红冲',
        k4: '该处于异常状态'
    };

    var invoiceType = invoice.invoiceType,
        invoiceStatus = invoice.invoiceStatus,
        checkStatus = invoice.checkStatus,
        isNotEqualTaxNo = invoice.isNotEqualTaxNo,
        isNotEqualBuyerName = invoice.isNotEqualBuyerName,
        repeatBx = invoice.repeatBx,
        isBlacklist = invoice.isBlacklist,
        isSensitiveWords = invoice.isSensitiveWords,
        _invoice$continuousNo = invoice.continuousNos,
        continuousNos = _invoice$continuousNo === undefined ? [] : _invoice$continuousNo,
        _invoice$warningCode = invoice.warningCode,
        warningCode = _invoice$warningCode === undefined ? '' : _invoice$warningCode,
        isOverdueInvoice = invoice.isOverdueInvoice,
        isRevise = invoice.isRevise;


    var invoiceTypeInfo = INPUT_INVOICE_TYPES_DICT['k' + invoiceType] || {};
    if (invoiceTypeInfo.isAddedTax) {
        if (parseInt(checkStatus) === 2) {
            errorResult.push('查验数据不相符！');
        } else if (parseInt(checkStatus) === 3) {
            errorResult.push('发票还未进行查验！');
        }

        if (invoiceStatusDict['k' + invoiceStatus]) {
            errorResult.push(invoiceStatusDict['k' + invoiceStatus]);
        }
    }

    if (isNotEqualTaxNo) {
        errorResult.push('企业税号与发票购方税号不一致！');
    }

    if (isNotEqualBuyerName) {
        errorResult.push('企业抬头与发票抬头不一致！');
    }

    if (repeatBx === 2) {
        errorResult.push('发票重复报销！');
    }

    if (isBlacklist === 2) {
        errorResult.push('该发票在黑名单中！');
    }

    if (isSensitiveWords === 2) {
        waringResult.push('发票中包含敏感词！');
    }

    if (continuousNos && continuousNos.length > 0) {
        if (parseInt(invoiceType) === 8) {
            waringResult.push('的士票连号，连号号码' + continuousNos.join(','));
        }
    }

    var warningCodeArr = warningCode.split(',');

    if (warningCodeArr.indexOf('3') !== -1) {
        waringResult.push('疑似串号发票！');
    }

    if (isOverdueInvoice === 2) {
        waringResult.push('该发票已过期！');
    }

    if (isRevise === 2) {
        waringResult.push('手工修改过发票字段！');
    }

    return {
        errorResult: errorResult,
        waringResult: waringResult
    };
};

var readAsBinaryString = exports.readAsBinaryString = function readAsBinaryString(file) {
    return new _promise2.default(function (resolve) {
        var reader = new FileReader();
        if (typeof FileReader.prototype.readAsBinaryString === 'function') {
            reader.onload = function (e) {
                resolve(reader.result);
            };
            reader.onerror = function () {
                resolve(null);
            };
            reader.readAsBinaryString(file);
        } else {
            var binary = '';
            reader.onload = function (e) {
                var bytes = new Uint8Array(reader.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                resolve(binary);
            };
            reader.onerror = function () {
                resolve(null);
            };
            reader.readAsArrayBuffer(file);
        }
    });
};
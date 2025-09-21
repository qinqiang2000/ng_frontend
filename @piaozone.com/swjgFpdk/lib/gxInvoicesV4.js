import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { getCityNameByTaxNo } from '@piaozone.com/swjgInfo';

import { login, forwardUrl, getGxPublicKey, govCacheSeconds, clearGovCookie } from './loginToGov';
import { fpgxQuery } from './queryIncomeInvoice';
import { kdRequest, paramJson, cookieHelp } from '@piaozone.com/utils';
import moment from 'moment';
import { createJsonpCallback, createFpdkHeader } from './tools';

var setCookie = cookieHelp.setCookie,
    getCookie = cookieHelp.getCookie,
    clearCookie = cookieHelp.clearCookie;

var defaultPageSize = 100;

export var gxConfirmSkssq = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(_ref2) {
        var taxNo = _ref2.taxNo,
            companyName = _ref2.companyName,
            passwd = _ref2.passwd,
            ptPasswd = _ref2.ptPasswd;

        var city, res, ymbb, _res, govToken, resData, e, t, tempToken, tempCookssq, skssqs;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        city = getCityNameByTaxNo(taxNo);

                        if (city) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', { errcode: 'taxNoErr', description: '纳税人识别号有误' });

                    case 3:
                        _context.next = 5;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 5:
                        res = _context.sent;

                        if (!(res.errcode !== '0000')) {
                            _context.next = 8;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 8:
                        ymbb = getCookie('ymbb');
                        _res = res, govToken = _res.govToken;
                        _context.next = 12;
                        return kdRequest({
                            url: forwardUrl,
                            data: {
                                city: city,
                                requestURI: 'hqssq.do',
                                requestUrl: baseUrl + 'hqssq.do',
                                requestMethod: 'GET',
                                requestData: paramJson({
                                    callback: createJsonpCallback(),
                                    cert: taxNo,
                                    token: govToken,
                                    ymbb: ymbb
                                })
                            },
                            method: 'POST'
                        });

                    case 12:
                        res = _context.sent;

                        if (!(res.errcode !== '0000')) {
                            _context.next = 15;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 15:

                        if (res.data && res.data.indexOf('jQuery') !== -1) {
                            resData = res.data.replace(/^jQuery[0-9_]+\(/, '').replace(/\)$/, '');
                            e = JSON.parse(resData);
                            t = e.key1;

                            if ('01' === t) {
                                tempToken = e.key2;
                                tempCookssq = e.key3;
                                skssqs = tempCookssq.split(';');

                                setCookie("govToken", tempToken, govCacheSeconds);
                                setCookie("skssq", tempCookssq, govCacheSeconds);
                                setCookie("gxrqfw", e.key4, govCacheSeconds);
                            }
                        }

                    case 16:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function gxConfirmSkssq(_x) {
        return _ref.apply(this, arguments);
    };
}();

function getMinMaxDate(kprqs) {
    var minDateIndex = 0;
    var maxDateIndex = 0;

    for (var i = 1; i < kprqs.length; i++) {
        var curDate = +new Date(kprqs[i]);
        var maxDate = +new Date(kprqs[maxDateIndex]);
        var minDate = +new Date(kprqs[minDateIndex]);

        if (curDate > maxDate) {
            maxDateIndex = i;
        }

        if (curDate < minDate) {
            minDateIndex = i;
        }
    }

    return { min: kprqs[minDateIndex], max: kprqs[maxDateIndex] };
}

function findGxResult(fpdms, fphms, target) {
    var len = fpdms.length;
    var rLen = target.length;
    var result = {};
    var errorList = [];
    var rightList = [];
    for (var i = 0; i < len; i++) {
        var flag = false;
        var fpdm = fpdms[i];
        var fphm = fphms[i];
        for (var j = 0; j < rLen; j++) {
            if (target[j].invoiceCode === fpdm && target[j].invoiceNo === fphm) {
                rightList.push({ fpdm: fpdm, fphm: fphm });
                flag = true;
                break;
            }
        }
        if (!flag) {
            errorList.push({ fpdm: fpdm, fphm: fphm });
        }
    }

    if (errorList.length === 0) {
        return { errcode: '0000', description: 'success', data: { 'success': rightList } };
    } else {
        return { errcode: '3004', data: { 'fail': errorList, 'success': rightList }, description: '发票勾选保存失败！' };
    }
}

export var gx = function () {
    var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(gxInfos) {
        var passwd, ptPasswd, fpdm, fphm, kprq, zt, _gxInfos$yxse, yxse, newZt, fpdms, i, _i, loginRes, ymbb, _loginRes$data, baseUrl, companyType, taxNo, govToken, res, _res2, publickey, ts, searchParam, jsonData, key1, resultTip, minMaxDate, fpcyRes, findResult;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, fpdm = gxInfos.fpdm, fphm = gxInfos.fphm, kprq = gxInfos.kprq, zt = gxInfos.zt, _gxInfos$yxse = gxInfos.yxse, yxse = _gxInfos$yxse === undefined ? '' : _gxInfos$yxse;
                        newZt = [];
                        fpdms = fpdm.split('=');

                        if (!(zt === '0')) {
                            _context2.next = 7;
                            break;
                        }

                        for (i = 0; i < fpdms.length; i++) {
                            newZt.push('0');
                        }
                        _context2.next = 12;
                        break;

                    case 7:
                        if (!(zt === '1')) {
                            _context2.next = 11;
                            break;
                        }

                        for (_i = 0; _i < fpdms.length; _i++) {
                            newZt.push('1');
                        }
                        _context2.next = 12;
                        break;

                    case 11:
                        return _context2.abrupt('return', { errcode: '3001', description: '勾选参数错误!' });

                    case 12:
                        _context2.next = 14;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 14:
                        loginRes = _context2.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context2.next = 17;
                            break;
                        }

                        return _context2.abrupt('return', loginRes);

                    case 17:
                        ymbb = getCookie('ymbb');
                        _loginRes$data = loginRes.data, baseUrl = _loginRes$data.baseUrl, companyType = _loginRes$data.companyType, taxNo = _loginRes$data.taxNo;
                        govToken = getCookie('govToken');

                        if (!(companyType !== '03')) {
                            _context2.next = 22;
                            break;
                        }

                        return _context2.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 22:
                        _context2.next = 24;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '02'
                        });

                    case 24:
                        res = _context2.sent;

                        if (!(res.errcode !== '0000')) {
                            _context2.next = 27;
                            break;
                        }

                        return _context2.abrupt('return', res);

                    case 27:
                        _res2 = res, publickey = _res2.publickey, ts = _res2.ts;
                        searchParam = paramJson({
                            id: 'dkgxcommit',
                            fpdm: fpdm,
                            fphm: fphm,
                            kprq: kprq,
                            zt: newZt.join('='),
                            yxse: yxse,
                            cert: taxNo,
                            token: govToken,
                            ts: ts,
                            publickey: publickey,
                            ymbb: ymbb
                        });
                        _context2.next = 31;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                requestUrl: baseUrl + 'dkgx.do?callback=' + createJsonpCallback(),
                                requestData: searchParam,
                                requestMethod: 'POST',
                                headers: createFpdkHeader(baseUrl, 'gx')
                            },
                            method: 'POST'
                        });

                    case 31:
                        res = _context2.sent;

                        if (!(res.errcode === '0000')) {
                            _context2.next = 53;
                            break;
                        }

                        jsonData = res.data;
                        key1 = jsonData.key1;
                        resultTip = { 'errcode': '3003', 'description': '' };

                        if (!(key1 === '001')) {
                            _context2.next = 40;
                            break;
                        }

                        resultTip.description = '数据保存失败！';
                        _context2.next = 50;
                        break;

                    case 40:
                        if (!(key1 === '000')) {
                            _context2.next = 49;
                            break;
                        }

                        setCookie("govToken", jsonData.key2, govCacheSeconds);
                        minMaxDate = getMinMaxDate(kprq.split('='));
                        _context2.next = 45;
                        return fpgxQuery({
                            baseUrl: baseUrl,
                            searchOpt: {
                                cert: taxNo,
                                rzzt: '0',
                                gxzt: zt,
                                rq_q: minMaxDate.min,
                                rq_z: minMaxDate.max
                            }
                        });

                    case 45:
                        fpcyRes = _context2.sent;


                        if (fpcyRes.errcode === '0000') {
                            findResult = findGxResult(fpdms, fphm.split('='), fpcyRes.data);

                            if (findResult.errcode === '0000') {
                                resultTip.errcode = '0000';
                                resultTip.data = findResult.data;
                                resultTip.description = '发票勾选保存成功！<br/>对于已勾选的发票，您还需要在“确认勾选”模块进行确认提交操作，完成发票的勾选认证';
                            } else {
                                resultTip.errcode = '3004', resultTip.data = findResult.data;
                            }
                        } else {
                            resultTip.errcode = fpcyRes.errcode;
                            resultTip.description = fpcyRes.description;
                        }

                        _context2.next = 50;
                        break;

                    case 49:
                        if (key1 === '09') {
                            clearCookie("govToken");
                            resultTip.description = '会话超时，请重试！';
                        } else if (key1 === '98') {
                            resultTip.description = '外网调用内网异常，请重试！';
                        } else {
                            resultTip.description = '系统异常，错误代码为:' + key1;
                        }

                    case 50:
                        return _context2.abrupt('return', resultTip);

                    case 53:
                        return _context2.abrupt('return', res);

                    case 54:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function gx(_x2) {
        return _ref3.apply(this, arguments);
    };
}();

export var getGXConfirmList = function () {
    var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(gxInfos) {
        var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var passwd, ptPasswd, _gxInfos$qrzt, qrzt, loginRes, ymbb, _loginRes$data2, baseUrl, companyType, taxNo, govToken, index, totalNum, invoices, result, totalInvoiceAmount, totalTaxAmount, totalAmount, publicKeyRes, publickey, ts, searchParam, res, jsonData, key1, newToken, invoiceData, invoiceDataLen, i;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, _gxInfos$qrzt = gxInfos.qrzt, qrzt = _gxInfos$qrzt === undefined ? '1' : _gxInfos$qrzt;
                        _context3.next = 3;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 3:
                        loginRes = _context3.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context3.next = 6;
                            break;
                        }

                        return _context3.abrupt('return', loginRes);

                    case 6:
                        ymbb = getCookie('ymbb');
                        _loginRes$data2 = loginRes.data, baseUrl = _loginRes$data2.baseUrl, companyType = _loginRes$data2.companyType, taxNo = _loginRes$data2.taxNo;
                        govToken = getCookie('govToken');

                        if (!(companyType !== '03')) {
                            _context3.next = 11;
                            break;
                        }

                        return _context3.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 11:
                        index = 0;
                        totalNum = 0;
                        invoices = [];
                        result = {};
                        totalInvoiceAmount = 0.00;
                        totalTaxAmount = 0.00;
                        totalAmount = 0.00;
                        _context3.next = 20;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '06'
                        });

                    case 20:
                        publicKeyRes = _context3.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context3.next = 23;
                            break;
                        }

                        return _context3.abrupt('return', publicKeyRes);

                    case 23:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;

                    case 24:
                        searchParam = paramJson({
                            id: 'queryqrjg',
                            qrzt: qrzt,
                            cert: taxNo,
                            token: govToken,
                            ymbb: ymbb,
                            publickey: publickey,
                            ts: ts
                        });


                        searchParam += '&aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A11%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A' + index + '%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A' + defaultPageSize + '%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A3%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A4%7D%2C%7B%22name%22%3A%22mDataProp_5%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22mDataProp_6%22%2C%22value%22%3A6%7D%2C%7B%22name%22%3A%22mDataProp_7%22%2C%22value%22%3A7%7D%2C%7B%22name%22%3A%22mDataProp_8%22%2C%22value%22%3A8%7D%2C%7B%22name%22%3A%22mDataProp_9%22%2C%22value%22%3A9%7D%2C%7B%22name%22%3A%22mDataProp_10%22%2C%22value%22%3A10%7D%5D';

                        _context3.next = 28;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            method: 'POST',
                            data: {
                                headers: createFpdkHeader(baseUrl, 'gx'),
                                requestUrl: baseUrl + 'qrgx.do?ymbb=' + ymbb + '&callback=' + createJsonpCallback(),
                                requestMethod: 'POST',
                                requestData: searchParam
                            }
                        });

                    case 28:
                        res = _context3.sent;


                        if (res.errcode === '0000') {
                            jsonData = res.data;
                            key1 = jsonData.key1;

                            if (key1 === '00') {
                                result = { 'errcode': '1000', 'description': '查询失败！' + jsonData.key2, data: [] };
                            } else if (key1 === '01') {
                                newToken = jsonData.key3;

                                setCookie('govToken', newToken);
                                invoiceData = jsonData.key2.aaData;
                                invoiceDataLen = invoiceData.length;

                                if (invoiceDataLen > 0) {
                                    for (i = 0; i < invoiceDataLen; i++) {
                                        invoices.push({
                                            invoiceCode: invoiceData[i][1],
                                            invoiceNo: invoiceData[i][2],
                                            invoiceDate: invoiceData[i][3],
                                            invoiceAmount: invoiceData[i][5],
                                            taxAmount: invoiceData[i][6],
                                            salerName: invoiceData[i][4],
                                            invoiceStatus: invoiceData[i][7],
                                            selectTime: invoiceData[i][8],
                                            scanTime: invoiceData[i][9] || ''
                                        });

                                        totalInvoiceAmount += parseFloat(invoiceData[i][5]);
                                        totalTaxAmount += parseFloat(invoiceData[i][6]);
                                        totalAmount += parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                                    }
                                    index += invoiceDataLen;
                                }
                                totalNum = jsonData.key2.iTotalRecords;
                            } else if (key1 === '09') {
                                clearCookie('govToken');
                                result = { 'errcode': '1000', 'description': 'CA登录失效！', data: [] };
                            }
                        }

                    case 30:
                        if (index < totalNum) {
                            _context3.next = 24;
                            break;
                        }

                    case 31:

                        result = { data: invoices, errcode: '0000', description: 'success', totalTaxAmount: totalTaxAmount.toFixed(2), totalInvoiceAmount: totalInvoiceAmount.toFixed(2), totalAmount: totalAmount.toFixed(2) };

                        if (!(invoices.length !== 0)) {
                            _context3.next = 36;
                            break;
                        }

                        return _context3.abrupt('return', result);

                    case 36:
                        if (!(retry > 3)) {
                            _context3.next = 40;
                            break;
                        }

                        return _context3.abrupt('return', result);

                    case 40:
                        _context3.next = 42;
                        return getGXConfirmList(gxInfos, retry + 1);

                    case 42:
                        return _context3.abrupt('return', _context3.sent);

                    case 43:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getGXConfirmList(_x3) {
        return _ref4.apply(this, arguments);
    };
}();

export var getGXSumaryInfo = function () {
    var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(gxInfos) {
        var passwd, ptPasswd, baseUrl, res, ymbb, taxNo, govToken, defatultTip, publicKeyRes, publickey, ts, e, t, s, o, ljhzxxfs, r, i, bchxzzfs, a, signature;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, baseUrl = gxInfos.baseUrl;
                        _context4.next = 3;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 3:
                        res = _context4.sent;

                        if (!(res.errcode !== '0000')) {
                            _context4.next = 6;
                            break;
                        }

                        return _context4.abrupt('return', res);

                    case 6:
                        ymbb = getCookie('ymbb');
                        taxNo = res.data.taxNo;
                        govToken = res.data.govToken;
                        defatultTip = { errcode: 'err', description: '获取汇总信息出现异常' };
                        _context4.next = 12;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '06'
                        });

                    case 12:
                        publicKeyRes = _context4.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context4.next = 15;
                            break;
                        }

                        return _context4.abrupt('return', publicKeyRes);

                    case 15:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;
                        _context4.next = 18;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                headers: createFpdkHeader(baseUrl, 'gx'),
                                requestUrl: baseUrl + 'qrgx.do',
                                requestData: paramJson({
                                    callback: createJsonpCallback(),
                                    id: 'queryqrhz',
                                    cert: taxNo,
                                    token: govToken,
                                    ymbb: ymbb,
                                    publickey: publickey,
                                    ts: ts
                                }),
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 18:
                        res = _context4.sent;

                        if (!(res.errcode !== '0000')) {
                            _context4.next = 21;
                            break;
                        }

                        return _context4.abrupt('return', res);

                    case 21:

                        if (res.data) {
                            e = res.data;
                            t = e.key1;
                            s = e.key2;
                            o = e.key4;

                            if (t === '00') {
                                defatultTip.errcode = 'err';
                                defatultTip.description = '获取汇总信息异常，请稍后重试！';
                            } else if ('01' === t) {
                                if ('' !== s) {
                                    if (Number(o) > 0) {
                                        ljhzxxfs = s;
                                        r = s.split("*");
                                        i = r[0].split("~");
                                        bchxzzfs = r[0];
                                        a = r[1].split("~");

                                        ljhzxxfs = r[1];
                                        signature = r[2];

                                        govToken = e.key3;
                                        setCookie("govToken", govToken, govCacheSeconds);
                                        defatultTip.errcode = '0000';
                                        defatultTip.data = { signature: signature, bchxzzfs: bchxzzfs, ljhzxxfs: ljhzxxfs, hasData: true };
                                        defatultTip.description = '';
                                    } else {
                                        defatultTip.description = '当前没有可以确认的数据！';
                                        defatultTip.errcode = '0000';
                                        defatultTip.data = { hasData: false };
                                    }
                                }
                            } else if ('09' === t) {
                                clearCookie("govToken");
                                defatultTip.description = '税局请求超时，请重试';
                            }
                        }
                        return _context4.abrupt('return', defatultTip);

                    case 23:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getGXSumaryInfo(_x5) {
        return _ref5.apply(this, arguments);
    };
}();

export var querysbzt = function () {
    var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(_ref7) {
        var passwd = _ref7.passwd,
            ptPasswd = _ref7.ptPasswd;

        var loginRes, ymbb, _loginRes$data3, govToken, taxNo, baseUrl, companyType, skssqs, publicKeyRes, publickey, ts, res, t, s, o, data;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 2:
                        loginRes = _context5.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context5.next = 5;
                            break;
                        }

                        return _context5.abrupt('return', res);

                    case 5:
                        ymbb = getCookie('ymbb');
                        _loginRes$data3 = loginRes.data, govToken = _loginRes$data3.govToken, taxNo = _loginRes$data3.taxNo, baseUrl = _loginRes$data3.baseUrl, companyType = _loginRes$data3.companyType;

                        if (!(companyType !== '03')) {
                            _context5.next = 9;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 9:
                        skssqs = decodeURIComponent(getCookie('skssq')).split(';');
                        _context5.next = 12;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '06'
                        });

                    case 12:
                        publicKeyRes = _context5.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context5.next = 15;
                            break;
                        }

                        return _context5.abrupt('return', publicKeyRes);

                    case 15:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;
                        _context5.next = 18;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                headers: createFpdkHeader(baseUrl, 'gx'),
                                requestUrl: baseUrl + 'qrgx.do?callback=' + createJsonpCallback(),
                                requestData: 'id=querysbzt&cert=' + taxNo + '&token=' + govToken + '&ymbb=' + ymbb + '&publickey=' + publickey + '&ts=' + ts,
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 18:
                        res = _context5.sent;

                        if (!(res.errcode === '0000')) {
                            _context5.next = 43;
                            break;
                        }

                        t = res.data;
                        s = t.key1;
                        o = t.key2;
                        data = { skssq: skssqs };

                        if (!("0" == o)) {
                            _context5.next = 28;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: '7002', description: '查询您税款所属期' + skssqs[0] + '的申报状态出现异常，请稍后再试' });

                    case 28:
                        if (!("01" == s && "3" == o)) {
                            _context5.next = 32;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: 'sbztUnkown', data: data, description: '因未能获取到您税款所属期' + skssqs[0] + '的申报结果状态，请您选择是否已完成税款所属期' });

                    case 32:
                        if (!("01" == s && "2" == o)) {
                            _context5.next = 36;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: 'sbztFinish', data: data, description: '平台获取到您税款所属期' + skssqs[0] + '的申报工作已完成，本批次发票请您在下期进行勾选认证操作!' });

                    case 36:
                        if (!("01" == s && "1" == o)) {
                            _context5.next = 40;
                            break;
                        }

                        return _context5.abrupt('return', { errcode: 'sbztUnkown', data: data, description: '因未能获取到您税款所属期' + skssqs[0] + '的申报结果信息有延迟，请您选择是否已完成税款所属期' });

                    case 40:
                        return _context5.abrupt('return', { errcode: '8001', data: data, description: '获取申报状态异常，请重试' });

                    case 41:
                        _context5.next = 44;
                        break;

                    case 43:
                        return _context5.abrupt('return', res);

                    case 44:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function querysbzt(_x6) {
        return _ref6.apply(this, arguments);
    };
}();

export var rollback = function () {
    var _ref8 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(_ref9) {
        var passwd = _ref9.passwd,
            ptPasswd = _ref9.ptPasswd;

        var loginRes, ymbb, _loginRes$data4, govToken, taxNo, baseUrl, companyType, skssqs, publicKeyRes, publickey, ts, res, e, t;

        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 2:
                        loginRes = _context6.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context6.next = 5;
                            break;
                        }

                        return _context6.abrupt('return', res);

                    case 5:
                        ymbb = getCookie('ymbb');
                        _loginRes$data4 = loginRes.data, govToken = _loginRes$data4.govToken, taxNo = _loginRes$data4.taxNo, baseUrl = _loginRes$data4.baseUrl, companyType = _loginRes$data4.companyType;

                        if (!(companyType !== '03')) {
                            _context6.next = 9;
                            break;
                        }

                        return _context6.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 9:
                        skssqs = decodeURIComponent(getCookie('skssq')).split(';');
                        _context6.next = 12;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '06'
                        });

                    case 12:
                        publicKeyRes = _context6.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context6.next = 15;
                            break;
                        }

                        return _context6.abrupt('return', publicKeyRes);

                    case 15:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;
                        _context6.next = 18;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                headers: createFpdkHeader(baseUrl, 'gx'),
                                requestUrl: baseUrl + 'qrgx.do?callback=' + createJsonpCallback(),
                                requestData: 'id=rollback&cert=' + taxNo + '&token=' + govToken + '&ymbb=' + ymbb + '&publickey=' + publickey + '&ts=' + ts,
                                requestMethod: 'POST'
                            },
                            method: 'POST'
                        });

                    case 18:
                        res = _context6.sent;

                        if (!(res.errcode === '0000')) {
                            _context6.next = 37;
                            break;
                        }

                        e = res.data;
                        t = e.key1;

                        if (!("01" == t)) {
                            _context6.next = 29;
                            break;
                        }

                        clearCookie("govToken");
                        setCookie("govToken", e.key2, govCacheSeconds);
                        setCookie("skssq", e.key3, govCacheSeconds);
                        return _context6.abrupt('return', { errcode: '0000', description: 'success' });

                    case 29:
                        if (!('09' == t)) {
                            _context6.next = 34;
                            break;
                        }

                        clearGovCookie();
                        return _context6.abrupt('return', { errcode: '1300', description: 'CA会话失效，请重试！' });

                    case 34:
                        return _context6.abrupt('return', { errcode: '1300', description: '更换您的税款所属期出现异常，请重试!' });

                    case 35:
                        _context6.next = 38;
                        break;

                    case 37:
                        return _context6.abrupt('return', res);

                    case 38:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function rollback(_x7) {
        return _ref8.apply(this, arguments);
    };
}();

export var gxConfirm = function () {
    var _ref10 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7(gxInfos) {
        var passwd, ptPasswd, fpdm, fphm, sbzt, res, ymbb, _res$data, govToken, taxNo, baseUrl, companyType, sumaryRes, _sumaryRes$data, signature, hasData, skssqs, sbztRes, publicKeyRes, publickey, ts, searchParam, defatultTip, e, t, s;

        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        passwd = gxInfos.passwd, ptPasswd = gxInfos.ptPasswd, fpdm = gxInfos.fpdm, fphm = gxInfos.fphm;
                        sbzt = gxInfos.sbzt || '';
                        _context7.next = 4;
                        return login({ passwd: passwd, ptPasswd: ptPasswd }, true);

                    case 4:
                        res = _context7.sent;

                        if (!(res.errcode !== '0000')) {
                            _context7.next = 7;
                            break;
                        }

                        return _context7.abrupt('return', res);

                    case 7:
                        ymbb = getCookie('ymbb');
                        _res$data = res.data, govToken = _res$data.govToken, taxNo = _res$data.taxNo, baseUrl = _res$data.baseUrl, companyType = _res$data.companyType;

                        if (!(companyType !== '03')) {
                            _context7.next = 11;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 11:
                        _context7.next = 13;
                        return getGXSumaryInfo({ passwd: passwd, ptPasswd: ptPasswd, baseUrl: baseUrl });

                    case 13:
                        sumaryRes = _context7.sent;

                        if (!(sumaryRes.errcode !== '0000')) {
                            _context7.next = 16;
                            break;
                        }

                        return _context7.abrupt('return', sumaryRes);

                    case 16:
                        _sumaryRes$data = sumaryRes.data, signature = _sumaryRes$data.signature, hasData = _sumaryRes$data.hasData;

                        if (hasData) {
                            _context7.next = 19;
                            break;
                        }

                        return _context7.abrupt('return', { errcode: 'noInvoices', description: '当前没有可以确认的发票!' });

                    case 19:
                        skssqs = decodeURIComponent(getCookie('skssq')).split(';');

                        if (!(skssqs[0] !== skssqs[2])) {
                            _context7.next = 38;
                            break;
                        }

                        if (!(sbzt === '3')) {
                            _context7.next = 25;
                            break;
                        }

                        return _context7.abrupt('return', { 'errcode': 'stopGoOn', description: '请先确定当前税控所属期的申报状态，再进行确认！' });

                    case 25:
                        _context7.next = 27;
                        return querysbzt({ passwd: passwd, ptPasswd: ptPasswd });

                    case 27:
                        sbztRes = _context7.sent;

                        if (!(sbztRes.errcode === 'sbztUnkown' && sbzt !== '1' && sbzt !== '2')) {
                            _context7.next = 32;
                            break;
                        }

                        return _context7.abrupt('return', sbztRes);

                    case 32:
                        if (!(sbzt.errcode === 'sbztFinish')) {
                            _context7.next = 36;
                            break;
                        }

                        sbzt = '2';
                        _context7.next = 38;
                        break;

                    case 36:
                        if (!(sbzt === '')) {
                            _context7.next = 38;
                            break;
                        }

                        return _context7.abrupt('return', sbztRes);

                    case 38:
                        _context7.next = 40;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '06'
                        });

                    case 40:
                        publicKeyRes = _context7.sent;

                        if (!(publicKeyRes.errcode !== '0000')) {
                            _context7.next = 43;
                            break;
                        }

                        return _context7.abrupt('return', publicKeyRes);

                    case 43:
                        publickey = publicKeyRes.publickey, ts = publicKeyRes.ts;
                        searchParam = paramJson({
                            id: 'commitqrxx',
                            cert: taxNo,
                            token: getCookie('govToken'),
                            signature: signature,
                            ymbb: ymbb,
                            publickey: publickey,
                            ts: ts
                        });
                        _context7.next = 47;
                        return kdRequest({
                            url: forwardUrl,
                            timeout: 60000,
                            data: {
                                headers: createFpdkHeader(baseUrl, 'gx'),
                                requestUrl: baseUrl + 'qrgx.do?callback=' + createJsonpCallback(),
                                requestData: searchParam,
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 47:
                        res = _context7.sent;

                        if (!(res.errcode === '0000')) {
                            _context7.next = 57;
                            break;
                        }

                        defatultTip = { 'errcode': res.errcode || '5000', 'description': res.description || '提交出现的异常，请稍后再试' };
                        e = res.data;
                        t = e.key1;
                        s = e.key2;


                        if ('00' == t) {
                            defatultTip.description = '提交确认信息出现异常，请稍后再试';
                        } else if ('01' == t) {
                            if ('Y' == s) {
                                defatultTip.errcode = '0000';
                                defatultTip.description = '确认结果提交完毕，本批次发票勾选认证成功！';
                                defatultTip.token = e.key3;
                                defatultTip.data = e;
                                setCookie("govToken", e.key3, govCacheSeconds);
                            } else if ('YY' == s) {
                                defatultTip.description = '提交出现的异常，请稍后再试';
                            } else if ('NN' == s) {
                                defatultTip.description = '签名校验不一致，无法完成已勾选发票的确认提交，请重新确认已勾选发票信息';
                            } else {
                                defatultTip.description = '提交确认信息出现异常，请稍后再试！';
                            }
                        } else if ('09' == t) {
                            defatultTip.errcode = '1300';
                            defatultTip.description = '会话已超时，请重试！';
                            clearGovCookie();
                        } else if ('10' == t || '20' == t || '98' == t || '99' == t || '101' == t) {
                            defatultTip.description = '提交确认信息出现异常，请稍后再试(' + t + ')';
                        } else {
                            defatultTip.description = '提交确认信息出现异常，请稍后再试(-2)';
                        }
                        return _context7.abrupt('return', defatultTip);

                    case 57:
                        return _context7.abrupt('return', res);

                    case 58:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function gxConfirm(_x8) {
        return _ref10.apply(this, arguments);
    };
}();
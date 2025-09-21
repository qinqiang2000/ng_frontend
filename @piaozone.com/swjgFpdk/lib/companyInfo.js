import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { getCityNameByTaxNo, getBaseUrl } from '@piaozone.com/swjgInfo';

import { login, forwardUrl, getGxPublicKey, govCacheSeconds, clearGovCookie } from './loginToGov';
import { fpgxQuery } from './queryIncomeInvoice';
import { kdRequest, paramJson, cookieHelp } from '@piaozone.com/utils';
import moment from 'moment';

var setCookie = cookieHelp.setCookie,
    getCookie = cookieHelp.getCookie,
    clearCookie = cookieHelp.clearCookie;

var defaultPageSize = 100;

var fpdkHeaders = {
    'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept-Encoding': 'gzip, deflate',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Connection': 'Keep-Alive',
    'Cache-Control': 'no-cache'
};

function getFpdkCookies() {
    var skssq = getCookie('skssq');
    var gxrqfw = getCookie('gxrqfw');
    var dqrq = moment().format('YYYY-MM-DD');
    var nsrmc = getCookie('nsrmc');
    var token = getCookie('govToken');

    if (token && skssq && gxrqfw) {
        return 'skssq=' + skssq + '; gxrqfw=' + gxrqfw + '; dqrq=' + dqrq + '; nsrmc=' + nsrmc + '; token=' + token;
    } else {
        return false;
    }
}

export var nsrcx = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(opt) {
        var passwd, ptPasswd, _opt$creditUrl, creditUrl, loginRes, ymbb, _loginRes$data, baseUrl, companyType, taxNo, govToken, city, res, _res, publickey, ts, searchParam, jsonData, key1, key2, resultData, infoArr, cktsqylx, ylqylx, nsrxz, tbsj, jxqyxx, jxstr, nsrxzYs, token;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        passwd = opt.passwd, ptPasswd = opt.ptPasswd, _opt$creditUrl = opt.creditUrl, creditUrl = _opt$creditUrl === undefined ? forwardUrl : _opt$creditUrl;
                        _context.next = 3;
                        return login({ passwd: passwd, ptPasswd: ptPasswd });

                    case 3:
                        loginRes = _context.sent;

                        if (!(loginRes.errcode !== '0000')) {
                            _context.next = 6;
                            break;
                        }

                        return _context.abrupt('return', loginRes);

                    case 6:
                        ymbb = getCookie('ymbb');
                        _loginRes$data = loginRes.data, baseUrl = _loginRes$data.baseUrl, companyType = _loginRes$data.companyType, taxNo = _loginRes$data.taxNo;
                        govToken = getCookie('govToken');
                        city = getCookie('city');

                        if (!(companyType !== '03')) {
                            _context.next = 12;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '8001', description: '一般纳税人才能进行该操作!' });

                    case 12:
                        _context.next = 14;
                        return getGxPublicKey({
                            govToken: govToken,
                            baseUrl: baseUrl,
                            taxNo: taxNo,
                            funType: '06'
                        });

                    case 14:
                        res = _context.sent;

                        if (!(res.errcode !== '0000')) {
                            _context.next = 17;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 17:
                        _res = res, publickey = _res.publickey, ts = _res.ts;
                        searchParam = paramJson({
                            callback: 'jQuery' + +new Date(),
                            cert: taxNo,
                            token: govToken,
                            ts: ts,
                            publickey: publickey,
                            ymbb: ymbb
                        });
                        _context.next = 21;
                        return kdRequest({
                            url: creditUrl,
                            timeout: 60000,
                            data: {
                                headers: _extends({}, fpdkHeaders, {
                                    'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                                    'Cookie': getFpdkCookies()
                                }),
                                requestURI: 'SbsqWW/nsrcx.do?' + searchParam,
                                requestData: '',
                                city: city,
                                requestMethod: 'GET'
                            },
                            method: 'POST'
                        });

                    case 21:
                        res = _context.sent;

                        if (!(creditUrl !== forwardUrl)) {
                            _context.next = 26;
                            break;
                        }

                        return _context.abrupt('return', res);

                    case 26:
                        if (!(res.errcode === '0000')) {
                            _context.next = 79;
                            break;
                        }

                        jsonData = res.data;
                        key1 = jsonData.key1;

                        if (!(key1 == "00")) {
                            _context.next = 33;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '8001', description: '获取纳税人信息失败！' });

                    case 33:
                        if (!(key1 == "01")) {
                            _context.next = 73;
                            break;
                        }

                        key2 = jsonData.key2;
                        resultData = {};

                        if (!(key2 == '')) {
                            _context.next = 40;
                            break;
                        }

                        return _context.abrupt('return', { errcode: '8003', description: '未查询到信息' });

                    case 40:
                        infoArr = key2.split('=');


                        resultData.qymc = decodeURI(infoArr[0], "UTF-8");
                        resultData.sbzq = infoArr[1] == '0' ? '月' : '季';

                        cktsqylx = infoArr[11];


                        if (cktsqylx == 'SC') {
                            resultData.cktsqylx = '1';
                        } else if (cktsqylx == 'WM') {
                            resultData.cktsqylx = '2';
                        } else if (cktsqylx == 'ZF') {
                            resultData.cktsqylx = '3';
                        } else {
                            resultData.cktsqylx = '';
                        }

                        ylqylx = infoArr[12];


                        if (ylqylx == 'YLJX') {
                            resultData.ylqylx = '1';
                        } else if (ylqylx == 'YLSC') {
                            resultData.ylqylx = '2';
                        } else if (ylqylx == 'YLF') {
                            resultData.ylqylx = '3';
                        }

                        nsrxz = infoArr[13];

                        if (nsrxz == '8') {
                            resultData.nsrxz = '1';
                        } else if (nsrxz == '5') {
                            resultData.nsrxz = '2';
                        } else {
                            resultData.nsrxz = '3';
                        }

                        tbsj = infoArr[14];

                        resultData.datbsj = tbsj;

                        jxqyxx = jsonData.key4;
                        jxstr = jxqyxx.split('=');


                        if (ylqylx == "YLJX") {
                            if (jxstr[0] == '2') {
                                resultData.zfjgbs = '分公司' + '（总公司信息：' + jxstr[2] + '，' + decodeURI(jxstr[3], "UTF-8") + '）';
                            } else if (jxstr[0] == '1') {
                                resultData.zfjgbs = '总公司';
                            } else {
                                resultData.zfjgbs = '';
                            }

                            if (jxstr[1] == '0') {
                                resultData.qcthyqy = '2';
                            } else if (jxstr[1] == '1') {
                                resultData.qcthyqy = '1';
                            }
                        } else {
                            resultData.zfjgbs = '';
                            resultData.qcthyqy = '';
                        }

                        nsrxzYs = infoArr[15];

                        resultData.nsrxzYs = nsrxzYs;
                        resultData.nsrxz = nsrxz;
                        if (nsrxz == '5' || nsrxz == '1' && nsrxzYs == '5') {
                            resultData.rdsjq = infoArr[16];
                            resultData.rdsjz = infoArr[17];
                        } else {
                            resultData.rdsjq = '';
                            resultData.rdsjz = '';
                        }

                        if (infoArr[18] == 'Y') {
                            resultData.tdqy = '1';
                        } else if (infoArr[18] == 'N') {
                            resultData.tdqy = '2';
                        }

                        resultData.oldsh = infoArr[7];
                        resultData.qysh = infoArr[10];

                        resultData.name = decodeURI(infoArr[2], "UTF-8");
                        resultData.tel = infoArr[3];
                        resultData.addr = decodeURI(infoArr[4], "UTF-8");

                        resultData.zipcode = infoArr[5];
                        resultData.mail = infoArr[6];

                        resultData.credit = infoArr[8];

                        token = jsonData.key3;

                        clearCookie("govToken");
                        setCookie("govToken", token, govCacheSeconds);
                        return _context.abrupt('return', { errcode: '0000', data: resultData });

                    case 71:
                        _context.next = 79;
                        break;

                    case 73:
                        if (!(key1 == "09")) {
                            _context.next = 78;
                            break;
                        }

                        clearCookie('govToken');
                        return _context.abrupt('return', { 'errcode': '1300', 'description': '登录失效，请重试!' });

                    case 78:
                        return _context.abrupt('return', res);

                    case 79:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function nsrcx(_x) {
        return _ref.apply(this, arguments);
    };
}();
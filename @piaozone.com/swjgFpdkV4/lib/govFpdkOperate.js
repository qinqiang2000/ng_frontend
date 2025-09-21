import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { kdRequest, cacheHelp, cookieHelp, urlHandler } from '@piaozone.com/utils';

import MultiPortOperateDisk from './multiPortDiskOperate';

import * as diskApi from './diskApi';
import { getApiVersion, checkTaxNo } from './checkApiVersion';

var setCache = cacheHelp.setCache,
    getCache = cacheHelp.getCache,
    clearCache = cacheHelp.clearCache;
var setCookie = cookieHelp.setCookie,
    getCookie = cookieHelp.getCookie,
    clearCookie = cookieHelp.clearCookie;


var govCacheSeconds = 2800;
var defaultTimeout = 70000;

export default function SwjgFpdk(opt) {
    this.baseTaxNo = opt.taxNo || 'fixedTaxNo';
    this.fpdkType = opt.fpdkType ? parseInt(opt.fpdkType) : 1;
    var loginInfo = void 0;
    var govToken = '';
    var cachePasswd = '';
    var cachePtPasswd = '';
    var operateUrl = opt.operateUrl || '';
    if (this.baseTaxNo) {
        govToken = getCookie('govToken-' + this.baseTaxNo);
        if (!govToken) {
            clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
        } else {
            loginInfo = getCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
            if (loginInfo) {
                operateUrl = loginInfo.operateUrl;
                cachePasswd = loginInfo.passwd || '';
                cachePtPasswd = loginInfo.ptPasswd || '';
            } else {
                clearCookie('govToken-' + this.baseTaxNo);
            }
        }
    }

    this.firstLoginUrl = opt.firstLoginUrl || '';
    this.secondLoginUrl = opt.secondLoginUrl || '';
    this.collectUrl = opt.collectUrl || '';
    this.onLoginSuccess = opt.onLoginSuccess;

    this.passwd = opt.passwd || cachePasswd || '';
    this.ptPasswd = opt.ptPasswd || cachePtPasswd || '';
    if (opt.ports && opt.ports.length > 0) {
        this.diskOperate = new MultiPortOperateDisk({ ports: opt.ports });
    } else {
        this.diskOperate = new MultiPortOperateDisk();
    }

    this.operateUrl = operateUrl;
    this.access_token = opt.access_token || '';
    if (loginInfo) {
        this.loginGovInfo = loginInfo;
    }
}

SwjgFpdk.prototype = {
    validateLogin: function () {
        var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(certPass) {
            var versionInfo, _versionInfo$data, cryptType, alg, cert, certInfo, obj, res;

            return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return getApiVersion(certPass, this.operateUrl);

                        case 2:
                            versionInfo = _context.sent;

                            if (!(versionInfo.errcode !== '0000')) {
                                _context.next = 5;
                                break;
                            }

                            return _context.abrupt('return', versionInfo);

                        case 5:
                            _versionInfo$data = versionInfo.data, cryptType = _versionInfo$data.cryptType, alg = _versionInfo$data.alg;
                            cert = '';

                            if (!(cryptType === 1)) {
                                _context.next = 16;
                                break;
                            }

                            _context.next = 10;
                            return this.diskOperate.getTaxInfoFromDisk(certPass, 71, this.operateUrl);

                        case 10:
                            certInfo = _context.sent;

                            if (!(certInfo.errcode !== '0000')) {
                                _context.next = 13;
                                break;
                            }

                            return _context.abrupt('return', certInfo);

                        case 13:
                            cert = certInfo.data;
                            _context.next = 22;
                            break;

                        case 16:
                            _context.next = 18;
                            return diskApi.getTaxInfoFromDisk(certPass, 71, this.operateUrl, alg);

                        case 18:
                            obj = _context.sent;

                            if (!(obj.errcode !== '0000')) {
                                _context.next = 21;
                                break;
                            }

                            return _context.abrupt('return', obj);

                        case 21:
                            cert = obj.data;

                        case 22:
                            res = checkTaxNo(cert);

                            if (!(res.errcode !== '0000')) {
                                _context.next = 25;
                                break;
                            }

                            return _context.abrupt('return', res);

                        case 25:
                            return _context.abrupt('return', {
                                errcode: '0000',
                                data: {
                                    cryptType: cryptType,
                                    alg: alg,
                                    cert: cert
                                }
                            });

                        case 26:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function validateLogin(_x) {
            return _ref.apply(this, arguments);
        }

        return validateLogin;
    }(),
    setConfirmPass: function setConfirmPass(confirmPasswd) {
        this.confirmPasswd = confirmPasswd;
    },
    login: function () {
        var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
            var passwd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var ptPasswd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var access_token = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.access_token;
            var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            var validateRes, _validateRes$data, cryptType, alg, cert, clientHelloRes, taxNo, clientHello, headersJson, res1, _res1$data, ymbb, baseUrl, govVersionInt, serverPacket, serverRandom, resAuthCodeData, sbhData, clientAuthCode, sbh, res2, _res2$data, skssq, gxrqfw, companyName, companyType, resInfo;

            return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            this.passwd = passwd || this.passwd;
                            this.ptPasswd = ptPasswd || this.ptPasswd;
                            passwd = this.passwd;

                            if (!(passwd == '')) {
                                _context2.next = 5;
                                break;
                            }

                            return _context2.abrupt('return', {
                                errcode: '80401',
                                description: 'CA密码不能为空'
                            });

                        case 5:
                            _context2.next = 7;
                            return this.validateLogin(passwd);

                        case 7:
                            validateRes = _context2.sent;

                            if (!(validateRes.errcode !== '0000')) {
                                _context2.next = 10;
                                break;
                            }

                            return _context2.abrupt('return', validateRes);

                        case 10:
                            _validateRes$data = validateRes.data, cryptType = _validateRes$data.cryptType, alg = _validateRes$data.alg, cert = _validateRes$data.cert;
                            clientHelloRes = void 0;

                            if (!(cryptType == 0)) {
                                _context2.next = 18;
                                break;
                            }

                            _context2.next = 15;
                            return diskApi.getClientHello(passwd, this.operateUrl, alg);

                        case 15:
                            clientHelloRes = _context2.sent;
                            _context2.next = 21;
                            break;

                        case 18:
                            _context2.next = 20;
                            return this.diskOperate.getClientHello(passwd, this.operateUrl);

                        case 20:
                            clientHelloRes = _context2.sent;

                        case 21:
                            if (!(clientHelloRes.errcode !== '0000')) {
                                _context2.next = 23;
                                break;
                            }

                            return _context2.abrupt('return', clientHelloRes);

                        case 23:
                            taxNo = cert;
                            clientHello = clientHelloRes.data;
                            headersJson = {
                                'Content-Type': 'application/json'
                            };

                            if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.param_sign) {
                                headersJson['x-csrf-token'] = window.__INITIAL_STATE__.param_sign;
                            }
                            _context2.next = 29;
                            return kdRequest({
                                url: access_token ? this.firstLoginUrl + '?access_token=' + access_token : this.firstLoginUrl,
                                timeout: 60000,
                                method: 'POST',
                                headers: headersJson,
                                data: _extends({
                                    alg: alg,
                                    taxNo: taxNo,
                                    clientHello: clientHello
                                }, opt)
                            });

                        case 29:
                            res1 = _context2.sent;

                            if (!(res1.errcode !== '0000')) {
                                _context2.next = 32;
                                break;
                            }

                            return _context2.abrupt('return', res1);

                        case 32:
                            _res1$data = res1.data, ymbb = _res1$data.ymbb, baseUrl = _res1$data.baseUrl, govVersionInt = _res1$data.govVersionInt, serverPacket = _res1$data.serverPacket, serverRandom = _res1$data.serverRandom;

                            this.govVersionInt = govVersionInt;

                            resAuthCodeData = void 0;

                            if (!(cryptType == 0)) {
                                _context2.next = 41;
                                break;
                            }

                            _context2.next = 38;
                            return diskApi.getClientAuthCode(passwd, serverPacket, this.operateUrl, alg);

                        case 38:
                            resAuthCodeData = _context2.sent;
                            _context2.next = 44;
                            break;

                        case 41:
                            _context2.next = 43;
                            return this.diskOperate.getClientAuthCode(passwd, serverPacket, this.operateUrl);

                        case 43:
                            resAuthCodeData = _context2.sent;

                        case 44:
                            if (!(resAuthCodeData.errcode !== '0000')) {
                                _context2.next = 46;
                                break;
                            }

                            return _context2.abrupt('return', resAuthCodeData);

                        case 46:
                            sbhData = void 0;

                            if (!(cryptType == 0)) {
                                _context2.next = 53;
                                break;
                            }

                            _context2.next = 50;
                            return diskApi.getTaxInfoFromDisk(passwd, 70, this.operateUrl, alg);

                        case 50:
                            sbhData = _context2.sent;
                            _context2.next = 56;
                            break;

                        case 53:
                            _context2.next = 55;
                            return this.diskOperate.getTaxInfoFromDisk(passwd, 70, this.operateUrl);

                        case 55:
                            sbhData = _context2.sent;

                        case 56:
                            if (!(sbhData.errcode !== '0000')) {
                                _context2.next = 58;
                                break;
                            }

                            return _context2.abrupt('return', sbhData);

                        case 58:
                            clientAuthCode = resAuthCodeData.data;
                            sbh = sbhData.data;
                            _context2.next = 62;
                            return kdRequest({
                                url: access_token ? this.secondLoginUrl + '?access_token=' + access_token : this.secondLoginUrl,
                                timeout: defaultTimeout,
                                method: 'POST',
                                headers: headersJson,
                                data: _extends({
                                    alg: alg,
                                    ptPasswd: this.ptPasswd,
                                    taxNo: taxNo,
                                    ymbb: ymbb,
                                    baseUrl: baseUrl,
                                    govVersionInt: govVersionInt,
                                    clientAuthCode: clientAuthCode,
                                    serverRandom: serverRandom,
                                    sbh: sbh
                                }, opt)
                            });

                        case 62:
                            res2 = _context2.sent;

                            if (!(res2.errcode === '0000')) {
                                _context2.next = 74;
                                break;
                            }

                            this.access_token = access_token;
                            _res2$data = res2.data, skssq = _res2$data.skssq, gxrqfw = _res2$data.gxrqfw, companyName = _res2$data.companyName, companyType = _res2$data.companyType;

                            this.loginGovInfo = {
                                passwd: this.passwd,
                                ptPasswd: this.ptPasswd,
                                taxNo: taxNo,
                                govVersionInt: govVersionInt,
                                skssq: skssq,
                                gxrqfw: gxrqfw,
                                companyName: companyName,
                                companyType: companyType,
                                alg: alg,
                                cryptType: cryptType,
                                baseUrl: baseUrl,
                                operateUrl: this.operateUrl
                            };

                            setCookie('govToken-' + this.baseTaxNo, 'govToken', govCacheSeconds);
                            setCache('loginGovInfo-' + this.baseTaxNo, this.loginGovInfo, 'localStorage');

                            resInfo = _extends({}, res2, { data: _extends({}, res2.data, { taxNo: taxNo }) });


                            if (typeof this.onLoginSuccess === 'function') {
                                this.onLoginSuccess(resInfo);
                            }

                            return _context2.abrupt('return', resInfo);

                        case 74:
                            return _context2.abrupt('return', res2);

                        case 75:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function login() {
            return _ref2.apply(this, arguments);
        }

        return login;
    }(),
    holiCommonRequest: function () {
        var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(url) {
            var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var res;
            return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: opt,
                                method: 'POST'
                            });

                        case 3:
                            res = _context3.sent;
                            return _context3.abrupt('return', res);

                        case 7:
                            _context3.prev = 7;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', {
                                errcode: 'arr',
                                description: '请求异常，请稍后再试！'
                            });

                        case 10:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 7]]);
        }));

        function holiCommonRequest(_x6) {
            return _ref3.apply(this, arguments);
        }

        return holiCommonRequest;
    }(),
    commonRequest: function () {
        var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(url) {
            var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var holiRes, _opt$passwd, passwd, _opt$ptPasswd, ptPasswd, urlArr, access_token, res;

            return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!(this.fpdkType === 2)) {
                                _context4.next = 5;
                                break;
                            }

                            _context4.next = 3;
                            return this.holiCommonRequest(url, opt);

                        case 3:
                            holiRes = _context4.sent;
                            return _context4.abrupt('return', holiRes);

                        case 5:
                            _opt$passwd = opt.passwd, passwd = _opt$passwd === undefined ? this.passwd : _opt$passwd, _opt$ptPasswd = opt.ptPasswd, ptPasswd = _opt$ptPasswd === undefined ? this.ptPasswd : _opt$ptPasswd;
                            urlArr = url.split('?');
                            access_token = '';

                            if (urlArr.length === 2) {
                                access_token = urlHandler.urlSearch(urlArr[1]).access_token;
                            }

                            res = void 0;
                            _context4.prev = 10;
                            _context4.next = 13;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: opt,
                                method: 'POST'
                            });

                        case 13:
                            res = _context4.sent;
                            _context4.next = 19;
                            break;

                        case 16:
                            _context4.prev = 16;
                            _context4.t0 = _context4['catch'](10);
                            return _context4.abrupt('return', {
                                errcode: 'arr',
                                description: '请求异常，请稍后再试！'
                            });

                        case 19:
                            if (!(res.errcode === '91300')) {
                                _context4.next = 42;
                                break;
                            }

                            clearCookie('govToken-' + this.baseTaxNo);
                            clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
                            this.loginGovInfo = null;
                            _context4.next = 25;
                            return this.login(passwd, ptPasswd, access_token);

                        case 25:
                            res = _context4.sent;

                            if (!(res.errcode !== '0000')) {
                                _context4.next = 30;
                                break;
                            }

                            return _context4.abrupt('return', res);

                        case 30:
                            _context4.prev = 30;
                            _context4.next = 33;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: opt,
                                method: 'POST'
                            });

                        case 33:
                            res = _context4.sent;
                            _context4.next = 39;
                            break;

                        case 36:
                            _context4.prev = 36;
                            _context4.t1 = _context4['catch'](30);
                            return _context4.abrupt('return', {
                                errcode: 'arr',
                                description: '请求异常，请稍后再试！'
                            });

                        case 39:
                            return _context4.abrupt('return', res);

                        case 40:
                            _context4.next = 43;
                            break;

                        case 42:
                            return _context4.abrupt('return', res);

                        case 43:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[10, 16], [30, 36]]);
        }));

        function commonRequest(_x8) {
            return _ref4.apply(this, arguments);
        }

        return commonRequest;
    }(),
    holiTaxQueryInvoices: function () {
        var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(url, opt) {
            var continueFlag, clientType, stepFinish, goOn, stepFinishHanlder, _opt$serialNo, serialNo, _opt$versionNo, versionNo, _opt$dataIndex, dataIndex, searchOpt, _opt$dataFromIndex, dataFromIndex, _opt$dataFrom, dataFrom, otherOpt, res;

            return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            continueFlag = opt.continueFlag, clientType = opt.clientType, stepFinish = opt.stepFinish;
                            goOn = typeof continueFlag === 'undefined' ? true : continueFlag;

                            stepFinishHanlder = function stepFinishHanlder(stepRes) {
                                if (typeof stepFinish === 'function') {
                                    try {
                                        stepFinish({
                                            endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                                            errcode: stepRes.errcode,
                                            description: stepRes.description,
                                            totalNum: stepRes.totalNum || 0,
                                            data: stepRes.data || [],
                                            invoiceInfo: stepRes.invoiceInfo || {},
                                            queryArgs: typeof stepRes.queryArgs === 'undefined' ? _extends({
                                                searchOpt: opt.searchOpt,
                                                dataFrom: dataFrom || '',
                                                dataFromIndex: dataFromIndex,
                                                dataIndex: dataIndex
                                            }, otherOpt, {
                                                name: name
                                            }) : stepRes.queryArgs
                                        });
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            };

                            _opt$serialNo = opt.serialNo, serialNo = _opt$serialNo === undefined ? '' : _opt$serialNo, _opt$versionNo = opt.versionNo, versionNo = _opt$versionNo === undefined ? '' : _opt$versionNo, _opt$dataIndex = opt.dataIndex, dataIndex = _opt$dataIndex === undefined ? 0 : _opt$dataIndex, searchOpt = opt.searchOpt, _opt$dataFromIndex = opt.dataFromIndex, dataFromIndex = _opt$dataFromIndex === undefined ? 0 : _opt$dataFromIndex, _opt$dataFrom = opt.dataFrom, dataFrom = _opt$dataFrom === undefined ? '' : _opt$dataFrom, otherOpt = _objectWithoutProperties(opt, ['serialNo', 'versionNo', 'dataIndex', 'searchOpt', 'dataFromIndex', 'dataFrom']);

                        case 4:
                            _context5.next = 6;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: _extends({
                                    continueFlag: continueFlag,
                                    serialNo: serialNo,
                                    clientType: clientType,
                                    versionNo: versionNo,
                                    dataIndex: dataIndex,
                                    dataFromIndex: dataFromIndex,
                                    dataFrom: dataFrom
                                }, otherOpt, {
                                    searchOpt: searchOpt
                                }),
                                method: 'POST'
                            });

                        case 6:
                            res = _context5.sent;

                            stepFinishHanlder(res);
                            if (typeof res.nextDataFromIndex !== 'undefined') {
                                if (res.endFlag) {
                                    goOn = false;
                                } else {
                                    dataIndex = res.nextDataIndex || 0;
                                    dataFromIndex = res.nextDataFromIndex || 0;
                                    serialNo = res.serialNo;
                                    if (res.queryArgs) {
                                        name = res.queryArgs.name;
                                    }
                                }
                            } else {
                                goOn = false;
                            }

                        case 9:
                            if (goOn) {
                                _context5.next = 4;
                                break;
                            }

                        case 10:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function holiTaxQueryInvoices(_x10, _x11) {
            return _ref5.apply(this, arguments);
        }

        return holiTaxQueryInvoices;
    }(),
    queryInvoices: function () {
        var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(url, opt) {
            var res1, continueFlag, clientType, stepFinish, _opt$passwd2, passwd, _opt$ptPasswd2, ptPasswd, goOn, res, name, _opt$serialNo2, serialNo, _opt$versionNo2, versionNo, _opt$dataIndex2, dataIndex, searchOpt, _opt$dataFromIndex2, dataFromIndex, _opt$dataFrom2, dataFrom, otherOpt, urlArr, access_token, stepFinishHanlder;

            return _regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!(this.fpdkType === 2)) {
                                _context6.next = 5;
                                break;
                            }

                            _context6.next = 3;
                            return this.holiTaxQueryInvoices(url, opt);

                        case 3:
                            res1 = _context6.sent;
                            return _context6.abrupt('return', res1);

                        case 5:
                            continueFlag = opt.continueFlag, clientType = opt.clientType, stepFinish = opt.stepFinish, _opt$passwd2 = opt.passwd, passwd = _opt$passwd2 === undefined ? this.passwd : _opt$passwd2, _opt$ptPasswd2 = opt.ptPasswd, ptPasswd = _opt$ptPasswd2 === undefined ? this.ptPasswd : _opt$ptPasswd2;
                            goOn = typeof continueFlag === 'undefined' ? true : continueFlag;
                            res = void 0;
                            name = '--';
                            _opt$serialNo2 = opt.serialNo, serialNo = _opt$serialNo2 === undefined ? '' : _opt$serialNo2, _opt$versionNo2 = opt.versionNo, versionNo = _opt$versionNo2 === undefined ? '' : _opt$versionNo2, _opt$dataIndex2 = opt.dataIndex, dataIndex = _opt$dataIndex2 === undefined ? 0 : _opt$dataIndex2, searchOpt = opt.searchOpt, _opt$dataFromIndex2 = opt.dataFromIndex, dataFromIndex = _opt$dataFromIndex2 === undefined ? 0 : _opt$dataFromIndex2, _opt$dataFrom2 = opt.dataFrom, dataFrom = _opt$dataFrom2 === undefined ? '' : _opt$dataFrom2, otherOpt = _objectWithoutProperties(opt, ['serialNo', 'versionNo', 'dataIndex', 'searchOpt', 'dataFromIndex', 'dataFrom']);
                            urlArr = url.split('?');
                            access_token = '';

                            if (urlArr.length === 2) {
                                access_token = urlHandler.urlSearch(urlArr[1]).access_token;
                            }

                            stepFinishHanlder = function stepFinishHanlder(stepRes) {
                                if (typeof stepFinish === 'function') {
                                    try {
                                        stepFinish({
                                            endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                                            errcode: stepRes.errcode,
                                            description: stepRes.description,
                                            totalNum: stepRes.totalNum || 0,
                                            data: stepRes.data || [],
                                            invoiceInfo: stepRes.invoiceInfo || {},
                                            queryArgs: typeof stepRes.queryArgs === 'undefined' ? _extends({
                                                searchOpt: opt.searchOpt,
                                                dataFrom: dataFrom || '',
                                                dataFromIndex: dataFromIndex,
                                                dataIndex: dataIndex
                                            }, otherOpt, {
                                                name: name
                                            }) : stepRes.queryArgs
                                        });
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            };

                        case 14:
                            _context6.next = 16;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: _extends({
                                    continueFlag: continueFlag,
                                    serialNo: serialNo,
                                    clientType: clientType,
                                    versionNo: versionNo,
                                    dataIndex: dataIndex,
                                    dataFromIndex: dataFromIndex,
                                    dataFrom: dataFrom
                                }, otherOpt, {
                                    searchOpt: searchOpt
                                }),
                                method: 'POST'
                            });

                        case 16:
                            res = _context6.sent;

                            if (!(res.errcode === '91300')) {
                                _context6.next = 32;
                                break;
                            }

                            clearCookie('govToken-' + this.baseTaxNo);
                            clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
                            _context6.next = 22;
                            return this.login(passwd, ptPasswd, access_token);

                        case 22:
                            res = _context6.sent;

                            if (!(res.errcode !== '0000')) {
                                _context6.next = 26;
                                break;
                            }

                            stepFinishHanlder(res);
                            return _context6.abrupt('break', 35);

                        case 26:
                            _context6.next = 28;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: _extends({
                                    continueFlag: continueFlag,
                                    serialNo: serialNo,
                                    clientType: clientType,
                                    versionNo: versionNo,
                                    dataIndex: dataIndex,
                                    dataFromIndex: dataFromIndex,
                                    dataFrom: dataFrom
                                }, otherOpt, {
                                    searchOpt: searchOpt
                                }),
                                method: 'POST'
                            });

                        case 28:
                            res = _context6.sent;


                            stepFinishHanlder(res);
                            _context6.next = 33;
                            break;

                        case 32:
                            stepFinishHanlder(res);

                        case 33:

                            if (typeof res.nextDataFromIndex !== 'undefined') {
                                if (res.endFlag) {
                                    goOn = false;
                                } else {
                                    dataIndex = res.nextDataIndex || 0;
                                    dataFromIndex = res.nextDataFromIndex || 0;
                                    serialNo = res.serialNo;
                                    if (res.queryArgs) {
                                        name = res.queryArgs.name;
                                    }
                                }
                            } else {
                                goOn = false;
                            }

                        case 34:
                            if (goOn) {
                                _context6.next = 14;
                                break;
                            }

                        case 35:
                            return _context6.abrupt('return', res);

                        case 36:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function queryInvoices(_x12, _x13) {
            return _ref6.apply(this, arguments);
        }

        return queryInvoices;
    }(),
    gxInvoices: function () {
        var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7(url, opt) {
            var res;
            return _regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            res = void 0;

                            if (!(this.fpdkType === 2)) {
                                _context7.next = 7;
                                break;
                            }

                            _context7.next = 4;
                            return this.holiCommonRequest(url, opt);

                        case 4:
                            res = _context7.sent;
                            _context7.next = 10;
                            break;

                        case 7:
                            _context7.next = 9;
                            return this.commonRequest(url, opt);

                        case 9:
                            res = _context7.sent;

                        case 10:
                            return _context7.abrupt('return', res);

                        case 11:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function gxInvoices(_x14, _x15) {
            return _ref7.apply(this, arguments);
        }

        return gxInvoices;
    }(),
    bdkGxInvoices: function () {
        var _ref8 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee8(url, opt) {
            var res;
            return _regeneratorRuntime.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            res = void 0;

                            if (!(this.fpdkType === 2)) {
                                _context8.next = 7;
                                break;
                            }

                            _context8.next = 4;
                            return this.holiCommonRequest(url, opt);

                        case 4:
                            res = _context8.sent;
                            _context8.next = 10;
                            break;

                        case 7:
                            _context8.next = 9;
                            return this.commonRequest(url, opt);

                        case 9:
                            res = _context8.sent;

                        case 10:
                            return _context8.abrupt('return', res);

                        case 11:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function bdkGxInvoices(_x16, _x17) {
            return _ref8.apply(this, arguments);
        }

        return bdkGxInvoices;
    }(),
    _gxConfirmTwo: function () {
        var _ref9 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee9(url, opt) {
            var res;
            return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.next = 2;
                            return this.commonRequest(url, opt);

                        case 2:
                            res = _context9.sent;
                            return _context9.abrupt('return', res);

                        case 4:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function _gxConfirmTwo(_x18, _x19) {
            return _ref9.apply(this, arguments);
        }

        return _gxConfirmTwo;
    }(),
    gxConfirm: function () {
        var _ref10 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee10(url) {
            var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var resHoli, _opt$sbzt, sbzt, _loginGovInfo, cryptType, alg, res, _res, _res$data, _res$data$tjsjstr, tjsjstr, _res$data$signKey, signKey2, _res$data$tjInfo, tjInfo, _res$data$taxPeriod, taxPeriod, tjsjsign, obj;

            return _regeneratorRuntime.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            if (!(this.fpdkType === 2)) {
                                _context10.next = 5;
                                break;
                            }

                            _context10.next = 3;
                            return this.holiCommonRequest(url, opt);

                        case 3:
                            resHoli = _context10.sent;
                            return _context10.abrupt('return', resHoli);

                        case 5:
                            _opt$sbzt = opt.sbzt, sbzt = _opt$sbzt === undefined ? '' : _opt$sbzt;
                            _loginGovInfo = this.loginGovInfo, cryptType = _loginGovInfo.cryptType, alg = _loginGovInfo.alg;

                            if (!(this.govVersionInt < 4000)) {
                                _context10.next = 14;
                                break;
                            }

                            _context10.next = 10;
                            return this.commonRequest(url, {
                                sbzt: sbzt
                            });

                        case 10:
                            res = _context10.sent;
                            return _context10.abrupt('return', res);

                        case 14:
                            _context10.next = 16;
                            return this.commonRequest(url, {});

                        case 16:
                            _res = _context10.sent;

                            if (!(_res.errcode !== '0000')) {
                                _context10.next = 19;
                                break;
                            }

                            return _context10.abrupt('return', _res);

                        case 19:
                            _res$data = _res.data, _res$data$tjsjstr = _res$data.tjsjstr, tjsjstr = _res$data$tjsjstr === undefined ? '' : _res$data$tjsjstr, _res$data$signKey = _res$data.signKey2, signKey2 = _res$data$signKey === undefined ? '' : _res$data$signKey, _res$data$tjInfo = _res$data.tjInfo, tjInfo = _res$data$tjInfo === undefined ? '' : _res$data$tjInfo, _res$data$taxPeriod = _res$data.taxPeriod, taxPeriod = _res$data$taxPeriod === undefined ? '' : _res$data$taxPeriod;
                            tjsjsign = '';

                            if (!(cryptType == 0)) {
                                _context10.next = 28;
                                break;
                            }

                            _context10.next = 24;
                            return diskApi.signDataApi(tjsjstr + signKey2, this.passwd, true, alg, this.operateUrl);

                        case 24:
                            obj = _context10.sent;

                            if (obj.errcode === '0000') {
                                tjsjsign = obj.data;
                            }
                            _context10.next = 31;
                            break;

                        case 28:
                            _context10.next = 30;
                            return this.diskOperate.signDataApi(tjsjstr + signKey2, this.passwd, '', 0x400000, this.operateUrl);

                        case 30:
                            tjsjsign = _context10.sent;

                        case 31:
                            if (!(tjsjstr && tjsjsign && tjInfo)) {
                                _context10.next = 37;
                                break;
                            }

                            _context10.next = 34;
                            return this._gxConfirmTwo(url, _extends({}, opt, { tjsjstr: tjsjstr, tjsjsign: tjsjsign, tjInfo: tjInfo, taxPeriod: taxPeriod, password: this.confirmPasswd }));

                        case 34:
                            return _context10.abrupt('return', _context10.sent);

                        case 37:
                            return _context10.abrupt('return', {
                                errcode: '82345',
                                description: '获取签名确认数据异常'
                            });

                        case 38:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function gxConfirm(_x20) {
            return _ref10.apply(this, arguments);
        }

        return gxConfirm;
    }(),
    jxxDownloadApply: function () {
        var _ref11 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee11(url, opt) {
            var continueFlag, stepFinish, _opt$passwd3, passwd, _opt$ptPasswd3, ptPasswd, searchOpt, res, index, goOn, urlArr, access_token, stepFinishHanlder;

            return _regeneratorRuntime.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            continueFlag = opt.continueFlag, stepFinish = opt.stepFinish, _opt$passwd3 = opt.passwd, passwd = _opt$passwd3 === undefined ? this.passwd : _opt$passwd3, _opt$ptPasswd3 = opt.ptPasswd, ptPasswd = _opt$ptPasswd3 === undefined ? this.ptPasswd : _opt$ptPasswd3, searchOpt = opt.searchOpt;
                            res = void 0;
                            index = opt.index || 0;
                            goOn = typeof continueFlag === 'undefined' ? true : continueFlag;
                            urlArr = url.split('?');
                            access_token = '';

                            if (urlArr.length === 2) {
                                access_token = urlHandler.urlSearch(urlArr[1]).access_token;
                            }

                            stepFinishHanlder = function stepFinishHanlder(stepRes) {
                                if (typeof stepFinish === 'function') {
                                    try {
                                        stepFinish({
                                            endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                                            errcode: stepRes.errcode,
                                            description: stepRes.description,
                                            nextIndex: stepRes.nextIndex || opt.index,
                                            queryArgs: typeof stepRes.queryArgs === 'undefined' ? {
                                                searchOpt: opt.searchOpt,
                                                index: opt.index
                                            } : stepRes.queryArgs
                                        });
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            };

                        case 8:
                            _context11.next = 10;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: {
                                    continueFlag: continueFlag,
                                    index: index,
                                    searchOpt: searchOpt
                                },
                                method: 'POST'
                            });

                        case 10:
                            res = _context11.sent;

                            if (!(res.errcode === '91300')) {
                                _context11.next = 26;
                                break;
                            }

                            clearCookie('govToken-' + this.baseTaxNo);
                            clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
                            _context11.next = 16;
                            return this.login(passwd, ptPasswd, access_token);

                        case 16:
                            res = _context11.sent;

                            if (!(res.errcode !== '0000')) {
                                _context11.next = 20;
                                break;
                            }

                            stepFinishHanlder(res);
                            return _context11.abrupt('break', 29);

                        case 20:
                            _context11.next = 22;
                            return kdRequest({
                                url: url,
                                timeout: defaultTimeout,
                                data: {
                                    continueFlag: continueFlag,
                                    index: index,
                                    searchOpt: searchOpt
                                },
                                method: 'POST'
                            });

                        case 22:
                            res = _context11.sent;


                            stepFinishHanlder(res);
                            _context11.next = 27;
                            break;

                        case 26:
                            stepFinishHanlder(res);

                        case 27:

                            if (typeof res.nextIndex !== 'undefined') {
                                if (res.endFlag) {
                                    goOn = false;
                                } else {
                                    index = res.nextIndex || 0;
                                }
                            } else {
                                goOn = false;
                            }

                        case 28:
                            if (goOn) {
                                _context11.next = 8;
                                break;
                            }

                        case 29:
                            return _context11.abrupt('return', res);

                        case 30:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function jxxDownloadApply(_x22, _x23) {
            return _ref11.apply(this, arguments);
        }

        return jxxDownloadApply;
    }(),
    getDownloadList: function () {
        var _ref12 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee12(url, opt) {
            var _opt$fplx, fplx, _opt$sjlx, sjlx, _opt$sqrqq, sqrqq, _opt$sqrqz, sqrqz, pageSize, res;

            return _regeneratorRuntime.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _opt$fplx = opt.fplx, fplx = _opt$fplx === undefined ? 0 : _opt$fplx, _opt$sjlx = opt.sjlx, sjlx = _opt$sjlx === undefined ? 0 : _opt$sjlx, _opt$sqrqq = opt.sqrqq, sqrqq = _opt$sqrqq === undefined ? '' : _opt$sqrqq, _opt$sqrqz = opt.sqrqz, sqrqz = _opt$sqrqz === undefined ? '' : _opt$sqrqz, pageSize = opt.pageSize;

                            if (!(this.govVersionInt < 4000)) {
                                _context12.next = 3;
                                break;
                            }

                            return _context12.abrupt('return', {
                                errcode: '83333',
                                description: '新版本税局系统才支持该功能, 请等待税局升级后再试'
                            });

                        case 3:
                            _context12.next = 5;
                            return this.commonRequest(url, {
                                fplx: fplx,
                                sjlx: sjlx,
                                sqrqq: sqrqq,
                                sqrqz: sqrqz,
                                pageSize: pageSize
                            });

                        case 5:
                            res = _context12.sent;
                            return _context12.abrupt('return', res);

                        case 7:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        }));

        function getDownloadList(_x24, _x25) {
            return _ref12.apply(this, arguments);
        }

        return getDownloadList;
    }(),
    downloadWithPath: function () {
        var _ref13 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee13(url, opt) {
            var jymm, res;
            return _regeneratorRuntime.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            jymm = opt.jymm;

                            if (!(this.govVersionInt < 4000)) {
                                _context13.next = 3;
                                break;
                            }

                            return _context13.abrupt('return', {
                                errcode: '83333',
                                description: '新版本税局系统才支持该功能, 请等待税局升级后再试'
                            });

                        case 3:
                            _context13.next = 5;
                            return this.commonRequest(url, {
                                urlPath: opt.urlPath,
                                jymm: jymm
                            });

                        case 5:
                            res = _context13.sent;
                            return _context13.abrupt('return', res);

                        case 7:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this);
        }));

        function downloadWithPath(_x26, _x27) {
            return _ref13.apply(this, arguments);
        }

        return downloadWithPath;
    }()
};
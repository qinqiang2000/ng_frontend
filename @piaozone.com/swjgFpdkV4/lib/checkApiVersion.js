import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import * as diskApi from './diskApi';

export var getApiVersion = function () {
    var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(certPass, operateUrl) {
        var vs, cryptType, alg, vsVersion, obj;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return diskApi.getVersionApi(true, operateUrl);

                    case 2:
                        vs = _context.sent;
                        cryptType = 1;

                        if (!(vs == null)) {
                            _context.next = 9;
                            break;
                        }

                        cryptType = 1;
                        alg = 0;
                        _context.next = 30;
                        break;

                    case 9:
                        cryptType = 0;
                        vsVersion = vs.version || '';

                        if (vsVersion) {
                            vsVersion = vsVersion.replace(/[^0-9]/, '');
                            vsVersion = parseInt(vsVersion);
                        } else {
                            vsVersion = 0;
                        }

                        if (!(vsVersion < 10)) {
                            _context.next = 17;
                            break;
                        }

                        cryptType = 1;
                        alg = 0;
                        _context.next = 30;
                        break;

                    case 17:
                        _context.next = 19;
                        return diskApi.verifyPinApi(certPass, false, 1);

                    case 19:
                        obj = _context.sent;

                        if (!(obj.errcode !== '0000')) {
                            _context.next = 27;
                            break;
                        }

                        _context.next = 23;
                        return diskApi.verifyPinApi(certPass, false, 0);

                    case 23:
                        obj = _context.sent;

                        if (obj.errcode === '0000') {
                            alg = 0;
                        }
                        _context.next = 28;
                        break;

                    case 27:
                        if (obj.errcode === '0000') {
                            alg = 1;
                        }

                    case 28:
                        if (!(obj.errcode !== '0000')) {
                            _context.next = 30;
                            break;
                        }

                        return _context.abrupt('return', obj);

                    case 30:
                        return _context.abrupt('return', {
                            errcode: '0000',
                            data: {
                                cryptType: cryptType,
                                alg: alg
                            }
                        });

                    case 31:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getApiVersion(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

export var checkTaxNo = function checkTaxNo(cert) {
    var strRegx = /^[0-9a-zA-Z]+$/;
    if (cert == '') {
        return {
            errcode: '7000',
            description: '读取证书信息失败，未获取到合法的纳税人信息,请重新提交请求或检查金税盘、税控盘或税务Ukey是否插入'
        };
    } else if (!strRegx.test(cert)) {
        return {
            errcode: '7000',
            description: '读取到的纳税人信息（纳税人识别号：' + cert + '）不合法！请重试！'
        };
    } else {
        return {
            errcode: '0000',
            description: 'success'
        };
    }
};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var diskOperate = require('./diskOperate');
var govFpdkOperate = require('./govFpdkOperate');
var fpdkDiskApi = require('./diskApi');
var checkApiVersion = require('./checkApiVersion');
var multiPortDiskOperate = require('./multiPortDiskOperate').default;
var swjgFpdk = {
    diskOperate: diskOperate,
    fpdkDiskApi: fpdkDiskApi,
    checkApiVersion: checkApiVersion,
    MultiPortDiskOperate: multiPortDiskOperate,
    govFpdkOperate: function () {
        var instance;
        var instanceDict = {};
        var _static = {
            name: 'SingleGovFpdkOperate',
            getInstance: function getInstance(options) {
                if (typeof instance === 'undefined') {
                    instance = new govFpdkOperate.default(options);
                }
                return instance;
            },
            getNewInstance: function getNewInstance(options) {
                instance = null;
                instance = new govFpdkOperate.default(options);
                return instance;
            },
            getInstanceByTaxNo: function getInstanceByTaxNo(options) {
                var taxNo = options.taxNo || 'fixedTaxNo';
                if (instanceDict[taxNo]) {
                    return instanceDict[taxNo];
                } else {
                    instanceDict[taxNo] = new govFpdkOperate.default(_extends({}, options, { taxNo: taxNo }));
                    return instanceDict[taxNo];
                }
            }
        };
        return _static;
    }()
};

window.swjgFpdk = swjgFpdk;

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') {
    module.exports = swjgFpdk;
}
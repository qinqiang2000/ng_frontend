(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["swjgFpdk"] = factory();
	else
		root["swjgFpdk"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fpdkOperate", function() { return fpdkOperate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MultiPortDiskOperate", function() { return MultiPortDiskOperate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "diskApi", function() { return diskApi; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkApiVersion", function() { return checkApiVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "diskOperate", function() { return diskOperate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "govFpdkOperate", function() { return govFpdkOperate; });
/* harmony import */ var _diskOperate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _diskApi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(21);
/* harmony import */ var _checkApiVersion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(22);
/* harmony import */ var _multiPortDiskOperate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(23);
/* harmony import */ var _govFpdkOperate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(24);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






var fpdkOperate = _govFpdkOperate__WEBPACK_IMPORTED_MODULE_4__["default"];
var MultiPortDiskOperate = _multiPortDiskOperate__WEBPACK_IMPORTED_MODULE_3__["default"];
var diskApi = _diskApi__WEBPACK_IMPORTED_MODULE_1__;
var checkApiVersion = _checkApiVersion__WEBPACK_IMPORTED_MODULE_2__;
var diskOperate = _diskOperate__WEBPACK_IMPORTED_MODULE_0__;
var govFpdkOperate = function () {
  var instance;
  var instanceDict = {}; //根据税号来控制多个

  var _static = {
    name: 'SingleGovFpdkOperate',
    getInstance: function getInstance(options) {
      if (typeof instance === 'undefined') {
        instance = new fpdkOperate(options);
      }

      return instance;
    },
    getNewInstance: function getNewInstance(options) {
      instance = null;
      instance = new fpdkOperate(options);
      return instance;
    },
    getInstanceByTaxNo: function getInstanceByTaxNo(options) {
      var taxNo = options.taxNo || 'fixedTaxNo'; //不传则只支持单税号

      if (instanceDict[taxNo]) {
        return instanceDict[taxNo];
      } else {
        instanceDict[taxNo] = new fpdkOperate(_objectSpread(_objectSpread({}, options), {}, {
          taxNo: taxNo
        }));
        return instanceDict[taxNo];
      }
    }
  };
  return _static;
}();

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setOperateUrl", function() { return setOperateUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openDevice", function() { return openDevice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "closeDevice", function() { return closeDevice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClientHello", function() { return getClientHello; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClientAuthCode", function() { return getClientAuthCode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTaxInfoFromDisk", function() { return getTaxInfoFromDisk; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "signDataApi", function() { return signDataApi; });
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//操作税盘接口

var caOperateUrl = 'http://127.0.0.1:52320/cryptctl'; //如果需要修改税盘操作地址调用这个方法

function setOperateUrl(url) {
  caOperateUrl = url;
}
function openDevice(_x, _x2) {
  return _openDevice.apply(this, arguments);
}

function _openDevice() {
  _openDevice = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(passwd, url) {
    var res;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': {
                "funcname": "opendevice",
                "args": {
                  "userpin": passwd
                }
              },
              'url': url || caOperateUrl
            });

          case 2:
            res = _context.sent;

            if (!(res.errcode === '0000')) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return", {
              errcode: '0000'
            });

          case 7:
            return _context.abrupt("return", {
              errcode: '7000',
              description: res.errmsg || res.description
            });

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _openDevice.apply(this, arguments);
}

function closeDevice(_x3) {
  return _closeDevice.apply(this, arguments);
}

function _closeDevice() {
  _closeDevice = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(url) {
    var res;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': {
                "funcname": "closedevice",
                "args": {}
              },
              'url': url || caOperateUrl
            });

          case 2:
            res = _context2.sent;

            if (!(res.errcode === '0000')) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", true);

          case 7:
            return _context2.abrupt("return", res.errmsg);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _closeDevice.apply(this, arguments);
}

function getClientHello(_x4, _x5) {
  return _getClientHello.apply(this, arguments);
}

function _getClientHello() {
  _getClientHello = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(passwd, url) {
    var res;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': {
                "funcname": "clienthello",
                "args": {
                  "userpin": passwd,
                  "dwflags": 0
                }
              },
              'url': url || caOperateUrl
            });

          case 2:
            res = _context3.sent;

            if (!(res.errcode === '0000')) {
              _context3.next = 11;
              break;
            }

            if (!(res.result !== '')) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", {
              errcode: '0000',
              data: res.result
            });

          case 8:
            return _context3.abrupt("return", {
              errcode: '7000',
              description: '税盘操作异常'
            });

          case 9:
            _context3.next = 12;
            break;

          case 11:
            return _context3.abrupt("return", {
              errcode: res.errcode,
              description: res.errmsg || res.description
            });

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _getClientHello.apply(this, arguments);
}

function getClientAuthCode(_x6, _x7, _x8) {
  return _getClientAuthCode.apply(this, arguments);
}

function _getClientAuthCode() {
  _getClientAuthCode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(passwd, serverPacket, url) {
    var res;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': {
                "funcname": "clientauth",
                "args": {
                  "userpin": passwd,
                  "strServerHello": serverPacket
                }
              },
              'url': url || caOperateUrl
            });

          case 2:
            res = _context4.sent;

            if (!(res.errcode === '0000')) {
              _context4.next = 11;
              break;
            }

            if (!(res.result !== '')) {
              _context4.next = 8;
              break;
            }

            return _context4.abrupt("return", {
              errcode: '0000',
              data: res.result
            });

          case 8:
            return _context4.abrupt("return", {
              errcode: '7001',
              description: res.errmsg || res.description
            });

          case 9:
            _context4.next = 12;
            break;

          case 11:
            return _context4.abrupt("return", {
              errcode: '7001',
              description: res.errmsg || res.description
            });

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getClientAuthCode.apply(this, arguments);
}

function getTaxInfoFromDisk(_x9, _x10, _x11) {
  return _getTaxInfoFromDisk.apply(this, arguments);
} // originData, passwd, flag, alg, url

function _getTaxInfoFromDisk() {
  _getTaxInfoFromDisk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(passwd, type, url) {
    var resData;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': {
                "funcname": "getcertinfo",
                "args": {
                  "userpin": passwd,
                  "cert": "",
                  "certinfono": type
                }
              },
              'url': url || caOperateUrl
            });

          case 2:
            resData = _context5.sent;

            if (!(resData.errcode === '0000' && resData.result !== '')) {
              _context5.next = 7;
              break;
            }

            return _context5.abrupt("return", {
              errcode: '0000',
              data: resData.result
            });

          case 7:
            return _context5.abrupt("return", {
              errcode: '7002',
              description: resData.errmsg || resData.description
            });

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _getTaxInfoFromDisk.apply(this, arguments);
}

function signDataApi(_x12, _x13) {
  return _signDataApi.apply(this, arguments);
}

function _signDataApi() {
  _signDataApi = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(originData, passwd) {
    var flag,
        alg,
        url,
        r,
        resData,
        _args6 = arguments;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            flag = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : '';
            alg = _args6.length > 3 ? _args6[3] : undefined;
            url = _args6.length > 4 ? _args6[4] : undefined;
            r = {
              data: originData,
              alg: "SHA1withRSA",
              flag: 4194304
            };
            _context6.next = 6;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': {
                "funcname": "sign",
                "args": r
              },
              'url': url || caOperateUrl
            });

          case 6:
            resData = _context6.sent;

            if (!(resData.errcode === '0000' && resData.result !== '')) {
              _context6.next = 11;
              break;
            }

            return _context6.abrupt("return", {
              errcode: '0000',
              data: resData.result
            });

          case 11:
            return _context6.abrupt("return", {
              errcode: '27002',
              description: resData.errmsg || '获取签名异常'
            });

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _signDataApi.apply(this, arguments);
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "baseExt", function() { return baseExt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cookieHelp", function() { return cookieHelp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cacheHelp", function() { return cacheHelp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadJs", function() { return loadJs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlHandler", function() { return urlHandler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tools", function() { return tools; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInvoiceType", function() { return checkInvoiceType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInvoiceTypeFull", function() { return checkInvoiceTypeFull; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blockchain_filter", function() { return blockchain_filter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "crossHttp", function() { return crossHttp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clientCheck", function() { return clientCheck; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "kdRequest", function() { return kdRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pwyFetch", function() { return pwyFetch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pwyRequest", function() { return pwyRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "paramJson", function() { return paramJson; });
var request = __webpack_require__(3);

var pwyRequestLib = __webpack_require__(5);

var baseExt = __webpack_require__(13);
var cookieHelp = __webpack_require__(4);
var cacheHelp = __webpack_require__(15);
var loadJs = __webpack_require__(16);
var urlHandler = __webpack_require__(17);
var tools = __webpack_require__(6);
var checkInvoiceType = __webpack_require__(18).checkInvoiceType;
var checkInvoiceTypeFull = __webpack_require__(18).checkInvoiceTypeFull;
var blockchain_filter = __webpack_require__(18).blockchain_filter;
var crossHttp = __webpack_require__(19)["default"];
var clientCheck = __webpack_require__(20)["default"];
var kdRequest = request.kdRequest;
var pwyFetch = pwyRequestLib.pwyFetch;
var pwyRequest = pwyRequestLib.kdRequest;
var paramJson = request.param;

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prePath", function() { return prePath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "param", function() { return param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "kdRequest", function() { return kdRequest; });
/* harmony import */ var _cookie_helps__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }


var prePath = '/';
var param = function param(data) {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      //非json对象
      return data;
    }
  }

  var result = [];

  for (var item in data) {
    if (data.hasOwnProperty(item)) {
      result.push(item + '=' + encodeURIComponent(data[item]));
    }
  }

  return result.join('&');
};

var myFetch = function myFetch(_ref) {
  var _ref$method = _ref.method,
      method = _ref$method === void 0 ? 'GET' : _ref$method,
      _ref$url = _ref.url,
      url = _ref$url === void 0 ? '' : _ref$url,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? '' : _ref$data,
      _ref$mode = _ref.mode,
      mode = _ref$mode === void 0 ? 'cors' : _ref$mode,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 60000 : _ref$timeout,
      _ref$redirect = _ref.redirect,
      redirect = _ref$redirect === void 0 ? 'follow' : _ref$redirect,
      _ref$dataType = _ref.dataType,
      dataType = _ref$dataType === void 0 ? 'json' : _ref$dataType,
      _ref$credentials = _ref.credentials,
      credentials = _ref$credentials === void 0 ? 'include' : _ref$credentials,
      _ref$headers = _ref.headers,
      headers = _ref$headers === void 0 ? {
    'Content-Type': 'application/json'
  } : _ref$headers;
  var requestObj = {
    method: method,
    mode: mode,
    credentials: credentials,
    redirect: redirect
  };

  if (method === 'GET') {
    data = param(data);
  } else if (_typeof(data) === 'object' && dataType === 'json') {
    data = JSON.stringify(data);
  }

  if (method === 'GET') {
    if (url.indexOf('?') === -1) {
      url += '?' + data;
    } else {
      url += '&' + data;
    }
  } else if (method === 'POST') {
    requestObj.body = data;
  }

  if (dataType === 'json') {
    requestObj.headers = headers;
  }

  return fetch(url, requestObj);
};

function myXhr(_ref2) {
  var _ref2$method = _ref2.method,
      method = _ref2$method === void 0 ? 'GET' : _ref2$method,
      _ref2$url = _ref2.url,
      url = _ref2$url === void 0 ? '' : _ref2$url,
      _ref2$data = _ref2.data,
      data = _ref2$data === void 0 ? '' : _ref2$data,
      _ref2$timeout = _ref2.timeout,
      timeout = _ref2$timeout === void 0 ? 60000 : _ref2$timeout,
      _ref2$credentials = _ref2.credentials,
      credentials = _ref2$credentials === void 0 ? 'include' : _ref2$credentials,
      contentType = _ref2.contentType,
      headers = _ref2.headers,
      success = _ref2.success;
  contentType = headers['Content-Type'] || 'application/json;charset=UTF-8';
  return new Promise(function (resolve, reject) {
    var xhr;

    if (XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }

    if (!xhr && typeof XDomainRequest !== 'undefined') {
      // 检查是否是IE，并且使用IE的XDomainRequest
      xhr = new XDomainRequest();
    }

    try {
      xhr.timeout = timeout; //xhr.contentLength = data.length;
    } catch (e) {
      console.warn('设置超时时间异常');
    }

    xhr.ontimeout = function () {
      resolve({
        errcode: 'timeoutErr',
        description: '请求超时！'
      });
    };

    if (contentType) {
      try {
        xhr.contentType = contentType;
      } catch (e) {
        console.warn('设置contentType异常');
      }
    }

    xhr.onload = function () {
      if (xhr.readyState === 4) {
        var status = xhr.status;

        if (status === 200) {
          var resData = xhr.responseText;

          try {
            resData = JSON.parse(resData);
            resolve(resData);
          } catch (e) {
            resolve({
              errcode: 'innerErr',
              description: '返回数据出错！'
            });
          }
        } else {
          resolve({
            errcode: 'requestErr',
            description: "\u8BF7\u6C42\u51FA\u9519".concat(status)
          });
        }
      }
    };

    xhr.onerror = function (error) {
      resolve({
        errcode: 'requestErr',
        description: "\u8BF7\u6C42\u5F02\u5E38"
      });
    };

    xhr.open(method, url, true);

    try {
      xhr.setRequestHeader('Content-Type', contentType);
      if (headers['x-csrf-token']) xhr.setRequestHeader('x-csrf-token', headers['x-csrf-token']);
    } catch (error) {//console.log(error);
    }

    xhr.send(data);
  });
}

function kdRequest(_x) {
  return _kdRequest.apply(this, arguments);
}

function _kdRequest() {
  _kdRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref3) {
    var _ref3$urlPre, urlPre, _ref3$method, method, _ref3$url, url, _ref3$data, data, _ref3$mode, mode, _ref3$timeout, timeout, _ref3$redirect, redirect, _ref3$dataType, dataType, _ref3$credentials, credentials, handlerError, _ref3$headers, headers, csrfToken, response, resData;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _ref3$urlPre = _ref3.urlPre, urlPre = _ref3$urlPre === void 0 ? '' : _ref3$urlPre, _ref3$method = _ref3.method, method = _ref3$method === void 0 ? 'GET' : _ref3$method, _ref3$url = _ref3.url, url = _ref3$url === void 0 ? '' : _ref3$url, _ref3$data = _ref3.data, data = _ref3$data === void 0 ? '' : _ref3$data, _ref3$mode = _ref3.mode, mode = _ref3$mode === void 0 ? 'cors' : _ref3$mode, _ref3$timeout = _ref3.timeout, timeout = _ref3$timeout === void 0 ? 60000 : _ref3$timeout, _ref3$redirect = _ref3.redirect, redirect = _ref3$redirect === void 0 ? 'follow' : _ref3$redirect, _ref3$dataType = _ref3.dataType, dataType = _ref3$dataType === void 0 ? 'json' : _ref3$dataType, _ref3$credentials = _ref3.credentials, credentials = _ref3$credentials === void 0 ? 'include' : _ref3$credentials, handlerError = _ref3.handlerError, _ref3$headers = _ref3.headers, headers = _ref3$headers === void 0 ? {
              'Content-Type': 'application/json'
            } : _ref3$headers;

            if (!/^http/.test(url)) {
              url = urlPre + url;
            }

            csrfToken = Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["getCookie"])('csrfToken');
            if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

            if (url.indexOf('?') === -1) {
              url = url + '?_csrf=' + csrfToken;
            } else {
              url = url + '&_csrf=' + csrfToken;
            }

            if (csrfToken) {
              try {
                headers['x-csrf-token'] = csrfToken;
                Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["setCookie"])('csrfToken', csrfToken, 30 * 60);
              } catch (e) {
                //TODO handle the exception
                Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["setCookie"])('csrfToken', csrfToken, 30 * 60);
              }
            }

            if (!window.fetch) {
              _context.next = 19;
              break;
            }

            _context.next = 9;
            return myFetch({
              url: url,
              data: data,
              dataType: dataType,
              headers: headers,
              method: method
            });

          case 9:
            response = _context.sent;

            if (!(response.status !== 200)) {
              _context.next = 14;
              break;
            }

            return _context.abrupt("return", {
              errcode: '5000',
              description: "\u8BF7\u6C42\u51FA\u9519(".concat(response.status, ")")
            });

          case 14:
            _context.next = 16;
            return response.text().then(function (res) {
              if (dataType === 'json') {
                try {
                  res = JSON.parse(res);
                  return res;
                } catch (e) {
                  return {
                    errcode: 'jsonErr',
                    description: '返回数据格式异常',
                    data: res
                  };
                }
              } else {
                return res;
              }
            })["catch"](function (error) {
              return {
                errcode: 'serverErr',
                description: error
              };
            });

          case 16:
            return _context.abrupt("return", _context.sent);

          case 17:
            _context.next = 24;
            break;

          case 19:
            if (method === 'GET') {
              data = param(data);
            } else if (_typeof(data) === 'object' && dataType === 'json') {
              data = JSON.stringify(data);
            }

            _context.next = 22;
            return myXhr({
              method: method,
              url: url,
              data: data,
              timeout: timeout,
              credentials: credentials,
              headers: headers
            });

          case 22:
            resData = _context.sent;
            return _context.abrupt("return", resData);

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _kdRequest.apply(this, arguments);
}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCookie", function() { return getCookie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearCookie", function() { return clearCookie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCookie", function() { return setCookie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearAllCookie", function() { return clearAllCookie; });
var getCookie = function getCookie(name) {
  var nameEQ = name + '=';
  var str = document.cookie.split(';');

  for (var i = 0; i < str.length; i++) {
    var c = str[i];

    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }

    if (c.indexOf(nameEQ) === 0) {
      return unescape(c.substring(nameEQ.length, c.length));
    }
  }

  return '';
};
var clearCookie = function clearCookie(name) {
  setCookie(name, '', -1);
};
var setCookie = function setCookie(name, value, seconds) {
  var otherStr = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  seconds = seconds || 0;
  var expires = "";

  if (seconds !== 0) {
    var date = new Date();
    date.setTime(date.getTime() + seconds * 1000);
    expires = "; expires=" + date.toGMTString();

    if (otherStr) {
      expires += '; ' + otherStr;
    }
  }

  document.cookie = name + "=" + escape(value) + expires + "; path=/";
};
var clearAllCookie = function clearAllCookie() {
  var strCookie = document.cookie;
  var arrCookie = strCookie.split("; ");

  for (var i = 0, len = arrCookie.length; i < len; i++) {
    // 遍历cookie数组，处理每个cookie对
    var arr = arrCookie[i].split("=");

    if (arr.length > 0) {
      setCookie(arr[0], '', -1);
    }
  }
};

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errcodeInfo", function() { return errcodeInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pwyFetch", function() { return pwyFetch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "kdRequest", function() { return kdRequest; });
/* harmony import */ var _cookie_helps__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _kdRequest__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _tools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var defaultTimeout = 90000;
var errcodeInfo = {
  gatewayTimeout: {
    errcode: 'gatewayTimeout',
    description: '网关超时，请稍后再试!'
  },
  serverErr: {
    errcode: 'serverErr',
    description: '服务端异常, 请稍后再试！'
  },
  requestErr: {
    errcode: 'requestErr',
    description: '请求错误, 请检查网络或参数！'
  },
  timeoutErr: {
    errcode: 'timeoutErr',
    description: '请求超时, 请检查网络是否正常！'
  }
};

var createFetch = function createFetch(url, options) {
  return new Promise(function (resolve) {
    var _ref = options || {},
        _ref$dataType = _ref.dataType,
        dataType = _ref$dataType === void 0 ? 'json' : _ref$dataType,
        method = _ref.method,
        _ref$headers = _ref.headers,
        headers = _ref$headers === void 0 ? {} : _ref$headers,
        _ref$mode = _ref.mode,
        mode = _ref$mode === void 0 ? 'cors' : _ref$mode,
        _ref$credentials = _ref.credentials,
        credentials = _ref$credentials === void 0 ? 'include' : _ref$credentials,
        _ref$redirect = _ref.redirect,
        redirect = _ref$redirect === void 0 ? 'follow' : _ref$redirect,
        body = _ref.body,
        onResponseProgress = _ref.onResponseProgress,
        callback = _ref.callback;

    var requestObj = {
      method: method,
      mode: mode,
      credentials: credentials,
      redirect: redirect
    };

    var handler = function handler(res) {
      if (typeof callback === 'function') {
        callback(res);
      } else {
        resolve(res);
      }
    };

    var upperMethod = method.toUpperCase();

    if (dataType === 'json' || dataType === 'text') {
      requestObj.dataType = 'text';
    }

    requestObj.headers = headers; //GET请求不需要body参数

    if (upperMethod !== 'GET') {
      requestObj.body = body;
    }

    fetch(url, requestObj).then(function (response) {
      if (response.status === 504) {
        handler(errcodeInfo.gatewayTimeout);
      } else if (response.status === 500) {
        handler(errcodeInfo.serverErr);
      } else if (response.status === 400 || response.status === 404) {
        handler(errcodeInfo.requestErr);
      } else {
        // 需要处理进度提示
        var handlerRes = function handlerRes(resText) {
          var res;

          if (dataType === 'json') {
            try {
              res = JSON.parse(resText);
            } catch (err1) {
              Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(err1);
              res = _objectSpread({}, errcodeInfo.serverErr);
            }

            handler(res);
          } else {
            handler(resText);
          }
        };

        if (typeof onResponseProgress === 'function' && typeof TextDecoder === 'function') {
          var reader = response.body.getReader();
          var decoder = new TextDecoder();
          var bytesReceived = 0;
          var resText = '';
          var conentLength = response.headers.get('content-length');
          conentLength = parseInt(conentLength);
          return reader.read().then(function processResult(result) {
            if (result.done) {
              onResponseProgress(bytesReceived, conentLength);
              handlerRes(resText);
              return;
            }

            bytesReceived += result.value.length;
            resText += decoder.decode(result.value);
            onResponseProgress(bytesReceived, conentLength);
            return reader.read().then(processResult);
          });
        } else {
          response.text().then(function (resText) {
            handlerRes(resText);
          })["catch"](function (err2) {
            Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(err2);
            handler(errcodeInfo.requestErr);
          });
        }
      }
    })["catch"](function (err3) {
      Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(err3);
      handler(errcodeInfo.requestErr);
    });
  });
};

var __createTimeoutFetch = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(url, options) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Promise.race([createFetch(url, options), new Promise(function (resolve) {
              setTimeout(function () {
                var res = _objectSpread({}, errcodeInfo.timeoutErr);

                if (typeof options.callback === 'function') {
                  options.callback(res);
                } else {
                  resolve(res);
                }
              }, options.timeout || defaultTimeout);
            })]);

          case 2:
            return _context.abrupt("return", _context.sent);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function __createTimeoutFetch(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var __XMLHttpRequest = function __XMLHttpRequest(url, options) {
  return new Promise(function (resolve) {
    var xhr = new window.XMLHttpRequest();
    var _options$method = options.method,
        method = _options$method === void 0 ? 'GET' : _options$method,
        _options$body = options.body,
        body = _options$body === void 0 ? null : _options$body,
        _options$dataType = options.dataType,
        dataType = _options$dataType === void 0 ? 'json' : _options$dataType,
        headers = options.headers,
        callback = options.callback,
        onRequestProgress = options.onRequestProgress,
        onResponseProgress = options.onResponseProgress,
        onProgress = options.onProgress;

    var handler = function handler(res) {
      if (typeof callback === 'function') {
        callback(res);
      } else {
        resolve(res);
      }
    };

    var handlerOnProgress = function handlerOnProgress() {
      var loaded = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var total = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (typeof onProgress === 'function') {
        try {
          onProgress(xhr.readyState, xhr.status, loaded, total);
        } catch (error) {
          Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(error);
        }
      }
    };

    handlerOnProgress();
    xhr.open(method, url, true);
    handlerOnProgress();

    xhr.ontimeout = function () {
      handler(errcodeInfo.timeoutErr);
      handlerOnProgress();
    };

    if (typeof onRequestProgress === 'function' || typeof onProgress === 'function') {
      xhr.upload.onprogress = function () {
        var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (typeof onRequestProgress === 'function') {
          try {
            onRequestProgress(evt.loaded, evt.total);
          } catch (error) {
            Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(error);
          }
        }

        handlerOnProgress(evt.loaded, evt.total);
      };
    }

    if (typeof onResponseProgress === 'function' || typeof onProgress === 'function') {
      xhr.onprogress = function () {
        var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (typeof onResponseProgress === 'function') {
          try {
            onResponseProgress(evt.loaded, evt.total);
          } catch (error) {
            Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(error);
          }
        }

        handlerOnProgress(evt.loaded, evt.total);
      };
    }

    xhr.onreadystatechange = function () {
      handlerOnProgress();
      var readyState = xhr.readyState;
      var status = xhr.status;

      if (readyState === 4 && status === 200) {
        var resText = xhr.responseText;
        var res;

        if (dataType === 'json') {
          try {
            res = JSON.parse(resText);
          } catch (err1) {
            Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(err1);
            res = _objectSpread({}, errcodeInfo.serverErr);
          }

          handler(res);
        } else {
          console && console.warn('xhr onreadystatechange resText', resText);
          handler(resText);
        }

        xhr = null;
      }
    };

    xhr.onerror = function (error) {
      Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])('xhr error: ', error);
      handler(errcodeInfo.requestErr);
      handlerOnProgress();
    };

    if (headers && headers['Content-Type']) {
      xhr.setRequestHeader('Content-Type', headers['Content-Type']);
    }

    if (headers && headers['x-csrf-token']) {
      xhr.setRequestHeader('x-csrf-token', headers['x-csrf-token']);
    }

    if (dataType === 'json') {
      xhr.responseType = 'text';
    }

    xhr.timeout = options.timeout || defaultTimeout;

    if (method.toLowerCase() === 'post') {
      xhr.send(body);
    } else {
      xhr.send(null);
    }

    handlerOnProgress();
  });
};

var __XDomainRequest = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(url, options) {
    var __innerXdr;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            __innerXdr = new Promise(function (resolve) {
              var xdr = new window.XDomainRequest();
              var _options$method2 = options.method,
                  method = _options$method2 === void 0 ? 'GET' : _options$method2,
                  _options$body2 = options.body,
                  body = _options$body2 === void 0 ? null : _options$body2,
                  callback = options.callback,
                  _options$dataType2 = options.dataType,
                  dataType = _options$dataType2 === void 0 ? 'json' : _options$dataType2;

              var handler = function handler(res) {
                if (typeof callback === 'function') {
                  callback(res);
                } else {
                  resolve(res);
                }
              };

              xdr.open(method, url);

              xdr.ontimeout = function () {
                handler(errcodeInfo.timeoutErr);
              };

              xdr.onerror = function (error) {
                Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(error);
                handler(errcodeInfo.requestErr);
              };

              xdr.onload = function () {
                var resText = xhr.responseText;
                var res;

                if (dataType === 'json') {
                  try {
                    res = JSON.parse(resText);
                  } catch (err1) {
                    Object(_tools__WEBPACK_IMPORTED_MODULE_2__["consoleLog"])(err1);
                    res = _objectSpread({}, errcodeInfo.serverErr);
                  }

                  handler(res);
                } else {
                  handler(resText);
                }
              };

              if (method.toLowerCase() === 'post') {
                xdr.send(body);
              } else {
                xdr.send(null);
              }
            });
            _context2.next = 3;
            return Promise.race([__innerXdr, new Promise(function (r) {
              setTimeout(function () {
                var res = _objectSpread({}, errcodeInfo.timeoutErr);

                if (typeof callback === 'function') {
                  callback(res);
                } else {
                  r(res);
                }
              }, options.timeout || defaultTimeout);
            })]);

          case 3:
            return _context2.abrupt("return", _context2.sent);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function __XDomainRequest(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

var pwyFetch = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(url, options) {
    var method, body, headers, upperMethod, contentType, csrfToken, res;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            method = options.method || 'GET';
            body = options.data || options.body;
            headers = options.headers || {};
            upperMethod = method.toUpperCase();
            contentType = options.contentType || 'json';

            if (contentType === 'json') {
              headers['Content-Type'] = 'application/json; charset=UTF-8';
            }

            csrfToken = Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["getCookie"])('csrfToken');
            if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

            if (url.indexOf('?') === -1) {
              url = url + '?_csrf=' + csrfToken;
            } else {
              url = url + '&_csrf=' + csrfToken;
            }

            if (csrfToken) {
              try {
                headers['x-csrf-token'] = csrfToken;
                Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["setCookie"])('csrfToken', csrfToken, 30 * 60);
              } catch (e) {
                //TODO handle the exception
                Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["setCookie"])('csrfToken', csrfToken, 30 * 60);
              }
            }

            options = _objectSpread(_objectSpread({}, options), {}, {
              headers: headers,
              body: body
            });

            if (upperMethod === 'GET') {
              //GET禁止缓存
              if (typeof options.disabledCache === 'undefined' || options.disabledCache === false) {
                if (url.indexOf('?') === -1) {
                  url = url + '?random=' + Math.random();
                } else {
                  url = url + '&random=' + Math.random();
                }
              }

              if (body && _typeof(body) === 'object') {
                body = Object(_kdRequest__WEBPACK_IMPORTED_MODULE_1__["param"])(body, true); //GET参数编码处理，并拼装到URl

                if (body) {
                  url += '&' + body;
                }
              }
            }

            if (upperMethod === 'POST' && body && _typeof(body) === 'object' && contentType === 'json') {
              options = _objectSpread(_objectSpread({}, options), {}, {
                body: JSON.stringify(body)
              });
            }

            if (!(window.fetch && !options.onRequestProgress && !options.disabledFetch && !options.onProgress)) {
              _context3.next = 17;
              break;
            }

            // fetch不支持上传进度，但支持下载进度回调
            res = __createTimeoutFetch(url, options);
            _context3.next = 27;
            break;

          case 17:
            if (!window.XMLHttpRequest) {
              _context3.next = 23;
              break;
            }

            _context3.next = 20;
            return __XMLHttpRequest(url, options);

          case 20:
            res = _context3.sent;
            _context3.next = 27;
            break;

          case 23:
            if (!window.XDomainRequest) {
              _context3.next = 27;
              break;
            }

            _context3.next = 26;
            return __XDomainRequest(url, options);

          case 26:
            res = _context3.sent;

          case 27:
            return _context3.abrupt("return", res);

          case 28:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function pwyFetch(_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}(); //兼容以前的版本

function kdRequest(_x7) {
  return _kdRequest.apply(this, arguments);
}

function _kdRequest() {
  _kdRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_ref5) {
    var _ref5$method, method, _ref5$url, url, _ref5$data, data, _ref5$timeout, timeout, _ref5$dataType, dataType, _ref5$headers, headers;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _ref5$method = _ref5.method, method = _ref5$method === void 0 ? 'GET' : _ref5$method, _ref5$url = _ref5.url, url = _ref5$url === void 0 ? '' : _ref5$url, _ref5$data = _ref5.data, data = _ref5$data === void 0 ? {} : _ref5$data, _ref5$timeout = _ref5.timeout, timeout = _ref5$timeout === void 0 ? 90000 : _ref5$timeout, _ref5$dataType = _ref5.dataType, dataType = _ref5$dataType === void 0 ? 'json' : _ref5$dataType, _ref5$headers = _ref5.headers, headers = _ref5$headers === void 0 ? {
              'Content-Type': 'application/json'
            } : _ref5$headers;
            _context4.next = 3;
            return pwyFetch(url, {
              body: data,
              headers: headers,
              timeout: timeout,
              dataType: dataType,
              method: method.toUpperCase()
            });

          case 3:
            return _context4.abrupt("return", _context4.sent);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _kdRequest.apply(this, arguments);
}

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInvoiceTypeName", function() { return getInvoiceTypeName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInvoiceTitle", function() { return checkInvoiceTitle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInvoiceTin", function() { return checkInvoiceTin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInvoiceQrInfo", function() { return getInvoiceQrInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInvoiceQrInfoNew", function() { return getInvoiceQrInfoNew; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blobToFile", function() { return blobToFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "downloadFile", function() { return downloadFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUUId", function() { return getUUId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "consoleLog", function() { return consoleLog; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInVisualArea", function() { return isInVisualArea; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInvoiceErrInfo", function() { return getInvoiceErrInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readAsBinaryString", function() { return readAsBinaryString; });
/* harmony import */ var _kdRequest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _cookie_helps__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _piaozone_com_pwyConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _piaozone_com_pwyConstants__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_piaozone_com_pwyConstants__WEBPACK_IMPORTED_MODULE_2__);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var INPUT_INVOICE_TYPES_DICT = _piaozone_com_pwyConstants__WEBPACK_IMPORTED_MODULE_2__["invoiceTypes"].INPUT_INVOICE_TYPES_DICT;
/**
 * @description 根据发票类型获取发票的中文名称
 * @param {int} i 发票类型
 * @returns {string} 如果未匹配到任何发票，返回'--'
 */

var getInvoiceTypeName = function getInvoiceTypeName(i) {
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
/**
 * @description	检测采集的发票抬头和企业名称是否一致
 * @param {int} fplx 发票类型，int类型
 * @param {string} invoiceGhf_mc 发票的购方名称
 * @param {string} ghf_mc 购方企业名称
 * @param {string} checkMode 校验模式，严格或简单模式：strict, simple（少于6个字符的发票抬头默认抬头一致）
 * @returns {int} 1、发票抬头和企业抬头一致, 2、发票抬头和企业抬头不一致 3、该票种不需要校验发票抬头
 *
 */

var checkInvoiceTitle = function checkInvoiceTitle(fplx) {
  var invoiceGhf_mc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var ghf_mc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var checkMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'simple';
  //需要校验发票抬头的发票类型
  var checkInvoiceTypes = [1, //普通电子发票
  3, //普通纸质发票
  4, //专用纸质发票
  5, //普通纸质卷票
  15 //通行费
  ];
  var filterReg = /[^A-Za-z0-9\u4e00-\u9fa5]/g;

  if (checkInvoiceTypes.indexOf(parseInt(fplx)) !== -1) {
    invoiceGhf_mc = invoiceGhf_mc.replace(filterReg, '').trim();
    ghf_mc = ghf_mc.replace(filterReg, '').trim();

    if (checkMode === 'strict') {
      if (invoiceGhf_mc === ghf_mc) {
        return 1; //发票抬头和企业抬头一致
      } else {
        return 2; //发票抬头和企业抬头不一致
      }
    } else if (checkMode === 'simple') {
      if (invoiceGhf_mc.length < 6 || invoiceGhf_mc === ghf_mc) {
        return 1;
      } else {
        return 2;
      }
    }
  } else {
    return 3; //该票种不需要校验发票抬头
  }
};
/**
 * @description	检测企业采集的发票是否和企业税号一致
 * @param {int} fplx 发票类型
 * @param {string} invoiceGhf_tin 发票的购货方税号
 * @param {string} ghf_tin 企业税号
 * @param {string} checkMode 校验模式，严格或简单模式：strict, simple（少于6个字符的发票抬头不做税号校验）
 * @returns {int} 1、发票购方税号和企业税号一致，2、发票购方税号和企业税号不一致，3、该票种不需要校验发票购方税号
 */

var checkInvoiceTin = function checkInvoiceTin(fplx) {
  var invoiceGhf_tin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var ghf_tin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var invoiceGhf_mc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var checkMode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'simple';
  //需要校验发票税号的发票类型
  var checkInvoiceTypes = [1, //普通电子发票
  3, //普通纸质发票
  4, //专用纸质发票
  5, //普通纸质卷票
  15 //通行费
  ];
  var filterReg = /[^A-Za-z0-9\u4e00-\u9fa5]/g;

  if (checkInvoiceTypes.indexOf(parseInt(fplx)) !== -1) {
    if (checkMode === 'strict') {
      if (invoiceGhf_tin === ghf_tin) {
        return 1; //发票购方税号和企业税号一致
      } else {
        return 2; //发票购方税号和企业税号不一致
      }
    } else if (checkMode === 'simple') {
      invoiceGhf_mc = invoiceGhf_mc.replace(filterReg, '').trim();

      if (invoiceGhf_mc.length < 6 || invoiceGhf_tin === ghf_tin) {
        return 1;
      } else {
        return 2; //发票购方税号和企业税号不一致
      }
    }
  } else {
    return 3; //该票种不需要校验发票购方税号
  }
};
/**
 * @description 解析发票二维码中的关键字段
 * @param {string} qrStr 扫描发票二维码获取到的字符串
 * @returns {object|false} 如果能够正常界面二维码中发票数据，返回object, 否则返回false
 */

var getInvoiceQrInfo = function getInvoiceQrInfo(qrStr) {
  var fpInfo = qrStr.replace(/[，]/g, ',').split(',');

  try {
    var fpdm = fpInfo[2];
    var fphm = fpInfo[3];
    var kprq = fpInfo[5];
    var amount = fpInfo[4];
    var jym = fpInfo[6].substr(-6);

    if (!fpdm || !fphm || !kprq) {
      //二维码数据格式有误
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
/**
 *获取地址后的参数
 */

function urlSearch() {
  var search = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  search = search.replace('?', '&');
  if (typeof search !== "string" || !search) return search;
  return search.split("&").reduce(function (res, cur) {
    var arr = cur.split("=");
    return Object.assign(_defineProperty({}, arr[0], arr[1]), res);
  }, {});
} //根据发票代码判断专票或普票


function checkInvoiceType(fpdm) {
  var last3Str = fpdm.substr(fpdm.length - 3);
  var last2Str = fpdm.substr(fpdm.length - 2);
  var firstStr = fpdm.substr(0, 1);
  var eighthStr = fpdm.substr(7, 1);
  var sixthStr = fpdm.substr(5, 1);

  if (fpdm.length == '10') {
    if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
      return 4; //专票
    } else {
      return 3;
    }
  } else {
    if (fpdm.length == 12) {
      if (firstStr == '0' && last2Str == '12') {
        return 15; //通行费
      }

      if (firstStr == '0' && last2Str == '11') {
        return 1; //电普票
      }

      if (firstStr == '0' && last2Str == '06') {
        return 5; //卷式
      }

      if (firstStr == '0' && last2Str == '07') {
        return 5; //卷式
      }

      if (firstStr == '0' && last2Str == '17') {
        //二手车发票
        return 13;
      }

      if (sixthStr == '1' || sixthStr == '2') {
        if (eighthStr == '2') {
          //机动车销售票
          return 12;
        }
      }

      if (firstStr == '0' && last2Str == '13') {
        return 2; //电专票
      }
    }
  }

  return 3;
}

var getInvoiceQrInfoNew = function getInvoiceQrInfoNew(qrStr) {
  //最新处理扫码抢扫二维码
  if (qrStr.indexOf('https' || false) > -1 && qrStr.indexOf('?')) {
    var _urlSearch = urlSearch(qrStr),
        _urlSearch$bill_num = _urlSearch.bill_num,
        bill_num = _urlSearch$bill_num === void 0 ? '' : _urlSearch$bill_num,
        _urlSearch$total_amou = _urlSearch.total_amount,
        total_amount = _urlSearch$total_amou === void 0 ? '' : _urlSearch$total_amou,
        _urlSearch$hash = _urlSearch.hash,
        hash = _urlSearch$hash === void 0 ? '' : _urlSearch$hash;

    if (bill_num != '' && total_amount != '' && hash != '') {
      //新型区块链电子票
      return {
        errcode: '0000',
        qrcodeType: 'web',
        data: {
          bill_num: bill_num,
          total_amount: total_amount,
          hash: hash
        },
        description: '成功'
      };
    } else {
      return {
        errcode: 'fail',
        qrcodeType: 'web',
        description: '请扫描发票（电，普，专）'
      };
    }
  } else {
    var fpInfo = qrStr.replace(/[，]/g, ',').split(',');

    try {
      var index = fpInfo[6].indexOf('20');
      var fpdm = fpInfo[2];
      var fphm = fpInfo[3];

      if (fpInfo[6].length == 8 && index == 0) {
        //区块链电子发票
        var kprq = fpInfo[6];
        var amount = fpInfo[5];
        var jym = fpInfo[7].substr(-5);
        return {
          errcode: '0000',
          qrcodeType: 'string',
          data: {
            fpdm: fpdm,
            fphm: fphm,
            kprq: kprq,
            amount: amount,
            jym: jym
          },
          description: '成功'
        };
      } else {
        var _kprq = fpInfo[5];
        var _amount = fpInfo[4];

        var _jym = fpInfo[6].substr(-6);

        if (!fpdm || !fphm || !_kprq) {
          //二维码数据格式有误
          return {
            errcode: 'fail',
            qrcodeType: 'string',
            description: '请扫描发票（电，普，专）'
          };
        } else {
          if (_amount == '' && _jym == '') {
            return {
              errcode: 'fail',
              description: '请扫描发票（电，普，专）'
            };
          } else {
            var fplxArr = [1, 2, 3, 4, 15];
            var fplx = checkInvoiceType(fpdm);

            if (fplxArr.indexOf(fplx) == '-1') {
              return {
                errcode: 'fail',
                description: '请扫描发票（电，普，专）'
              };
            } else {
              return {
                errcode: '0000',
                qrcodeType: 'string',
                data: {
                  fpdm: fpdm,
                  fphm: fphm,
                  kprq: _kprq,
                  amount: _amount,
                  jym: _jym
                },
                description: '成功'
              };
            }
          }
        }
      }
    } catch (e) {
      return {
        errcode: 'fail',
        description: '请扫描发票（电，普，专）'
      };
    }
  }
};
/**
 * @description 将blob数据转换为file对象
 * @param {blob} blobData 需要转换的blob数据
 * @param {string}} filename 转换后的文件名称
 */

var blobToFile = function blobToFile(blobData, filename) {
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
    var targetFile = new window.File([blobData], filename, {
      type: type
    });
    return targetFile;
  } else {
    return false;
  }
};
/**
 * @description 通过XMLHttpRequest方式处理下载，要求支持XMLHttpRequest、blob、FileReader
 * @param { string } url 请求的路径
 * @param { string } key 请求的数据key
 * @param { string|object } data 请求的数据, 支持string和object
 * @param { string } method 请求的方法，默认post
 * @param { function } startCallback 开始下载前的回调
 * @param { function } endCallback 请求完成结束后的回调，如果有失败可以根据返回的json提示
 */

var downloadFileXhr = function downloadFileXhr(_ref) {
  var url = _ref.url,
      _ref$key = _ref.key,
      key = _ref$key === void 0 ? 'downloadParams' : _ref$key,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? {} : _ref$data,
      _ref$method = _ref.method,
      method = _ref$method === void 0 ? 'POST' : _ref$method,
      startCallback = _ref.startCallback,
      endCallback = _ref.endCallback,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 60000 : _ref$timeout;
  method = method.toLocaleLowerCase();
  startCallback();

  var myEndCallback = function myEndCallback(res) {
    Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["clearCookie"])('downloadResult');
    typeof endCallback === 'function' && endCallback(res);
  };

  var xhr = new window.XMLHttpRequest();
  var csrfToken = Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["getCookie"])('csrfToken');
  if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

  if (url.indexOf('?') === -1) {
    url = url + '?_csrf=' + csrfToken;
  } else {
    url = url + '&_csrf=' + csrfToken;
  }

  if (method === 'get') url += '&' + Object(_kdRequest__WEBPACK_IMPORTED_MODULE_0__["param"])(data);
  xhr.open(method, url, true);
  xhr.responseType = 'blob'; // 返回类型blob

  xhr.setRequestHeader('Content-Type', 'application/json');

  if (csrfToken) {
    try {
      xhr.setRequestHeader('x-csrf-token', csrfToken);
      Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["setCookie"])('csrfToken', csrfToken, 30 * 60);
    } catch (e) {
      //TODO handle the exception
      Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["setCookie"])('csrfToken', csrfToken, 30 * 60);
    }
  }

  xhr.timeout = timeout; // 超时时间，单位是毫秒

  xhr.onerror = function () {
    myEndCallback({
      errcode: '5000',
      description: '服务端异常，请稍后再试'
    });
  };

  xhr.ontimeout = function () {
    myEndCallback({
      errcode: '5004',
      description: '请求超时，请稍后再试'
    });
  };

  xhr.onload = function () {
    if (xhr.status === 200) {
      var blob = xhr.response;
      var ctype = xhr.getResponseHeader('Content-Type');

      if (ctype.indexOf('text/html') !== -1) {
        myEndCallback({
          errcode: '5000',
          description: '服务端异常，请稍后再试'
        });
      } else if (ctype.indexOf('application/json') !== -1) {
        var reader = new window.FileReader();

        reader.onload = function () {
          var content = reader.result; //内容就在这里

          try {
            content = JSON.parse(content);
          } catch (error) {
            content = {
              errcode: '5000',
              description: '服务端异常，请稍后再试'
            };
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

        myEndCallback({
          errcode: '0000',
          description: '下载成功'
        });
      }
    } else {
      myEndCallback({
        errcode: '5000',
        description: '请求异常，请稍后再试'
      });
    }
  };

  if (method === 'post') {
    var dataStr = JSON.stringify(data);
    var newData = {};
    newData[key] = dataStr;
    xhr.send(JSON.stringify(newData));
  } else {
    xhr.send();
  }
};
/**
 *
 * @param { string } url 请求的路径
 * @param { string } key 请求的数据key, 默认downloadParams，post发送数据时将会以这个key发送数据给后台，get无关
 * @param { string|object } data 请求的数据, 支持string和object
 * @param { string } method 请求的方法，默认post
 * @param { function } startCallback 开始下载前的回调
 * @param { function } endCallback 请求完成结束后的回调，如果有失败可以根据返回的json提示
 * 可以选择前端的处理方式，默认为form形式选择，兼容性好一些，当浏览器不支持blob等对象时会自动选择form形式，还支持直接form形式（兼容性更好）
 * 注意form形式需要后台配合处理成功后写入cookie: downloadResult=1, 不成功则不需要处理，
 * node层可以参考发票管理中心publicDownload中间件
 * @param { string} downloadType 选择前端的处理方式，xhr|form
 * @param { number } timeout 超时设置
 */


var downloadFile = function downloadFile(opt) {
  var url = opt.url,
      _opt$key = opt.key,
      key = _opt$key === void 0 ? 'downloadParams' : _opt$key,
      _opt$data = opt.data,
      data = _opt$data === void 0 ? {} : _opt$data,
      _opt$method = opt.method,
      method = _opt$method === void 0 ? 'POST' : _opt$method,
      startCallback = opt.startCallback,
      endCallback = opt.endCallback,
      _opt$downloadType = opt.downloadType,
      downloadType = _opt$downloadType === void 0 ? 'xhr' : _opt$downloadType,
      _opt$timeout = opt.timeout,
      timeout = _opt$timeout === void 0 ? 60000 : _opt$timeout;

  if (window.XMLHttpRequest && window.Blob && window.FileReader && downloadType === 'xhr') {
    downloadFileXhr(opt);
  } else {
    startCallback();
    var iframeId = 'tempDownloadIframe' + +new Date();
    var formId = 'tempFormId_' + +new Date();
    Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["clearCookie"])('downloadResult');

    var myEndCallback = function myEndCallback(res) {
      var iframEl = document.getElementById(iframeId);
      var formEl = document.getElementById(formId);
      Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["clearCookie"])('downloadResult');
      iframEl.innerHTML = '';
      iframEl.parentNode.removeChild(iframEl);
      formEl.parentNode.removeChild(formEl);
      typeof endCallback === 'function' && endCallback(res);
    };

    var checkStatus = function checkStatus(startTime) {
      if (+new Date() - startTime > timeout) {
        myEndCallback({
          errcode: '5004',
          description: '请求超时，请稍后再试！'
        });
      } else {
        var result = Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_1__["getCookie"])('downloadResult');

        if (result) {
          if (result === '1') {
            myEndCallback({
              errcode: '0000',
              description: '下载成功'
            });
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
    inputEl.value = _typeof(data) === 'object' ? JSON.stringify(data) : data;
    formEl.appendChild(inputEl);
    document.body.appendChild(formEl);
    formEl.submit();
    checkStatus(+new Date());
  }
};
var getUUId = function getUUId() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return uuid;
}; // 日志打印

var consoleLog = function consoleLog(tip) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'error';
  var title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (_typeof(window.console) === 'object') {
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
}; // 校验指定class元素是否在地址显示区域类，可以用于动态懒加载图像等

var isInVisualArea = function isInVisualArea(elCls, pObj) {
  var items = pObj.getElementsByClassName(elCls);
  var boxInfo = pObj.getBoundingClientRect();
  var top = boxInfo.top,
      left = boxInfo.left,
      bottom = boxInfo.bottom,
      right = boxInfo.right;
  var result = [];

  for (var i = 0; i < items.length; i++) {
    var itemInfo = items[i].getBoundingClientRect(); // 只要有部分区域在指定区域内，则认为应该显示

    if (itemInfo.top >= top && itemInfo.left >= left && itemInfo.top <= bottom && itemInfo.left <= right) {
      result.push(true);
    } else {
      result.push(false);
    }
  }

  return result;
}; // 校验发票的校验信息

var getInvoiceErrInfo = function getInvoiceErrInfo(invoice) {
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
      continuousNos = _invoice$continuousNo === void 0 ? [] : _invoice$continuousNo,
      _invoice$warningCode = invoice.warningCode,
      warningCode = _invoice$warningCode === void 0 ? '' : _invoice$warningCode,
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
    // 的士票连号提示
    if (parseInt(invoiceType) === 8) {
      waringResult.push('的士票连号，连号号码' + continuousNos.join(','));
    }
  }

  var warningCodeArr = warningCode.split(','); // if (warningCodeArr.indexOf('2') !== -1) {
  //    waringResult.push('疑似旧的监制章发票！');
  // }

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
}; // 已二进制方式读取文件

var readAsBinaryString = function readAsBinaryString(file) {
  return new Promise(function (resolve) {
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
      // ie版本没有原生的方法，通过readAsArrayBuffer兼容
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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var invoiceEditInfo = __webpack_require__(8);

var invoiceTypes = __webpack_require__(10);

var selectSource = __webpack_require__(9);

var invoiceStatus = __webpack_require__(11);

var warningCodesInfo = __webpack_require__(12);

module.exports = {
  invoiceEditInfo: invoiceEditInfo,
  invoiceTypes: invoiceTypes,
  selectSource: selectSource,
  invoiceStatus: invoiceStatus,
  waringCodes: warningCodesInfo.waringCodes,
  getWaringCodesResult: warningCodesInfo.getWaringCodesResult
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(9),
    trainSeatSelectSource = _require.trainSeatSelectSource,
    airSeatSelectSource = _require.airSeatSelectSource,
    currencySelectSource = _require.currencySelectSource; // 禁止选择的日期


var disabledDate = function disabledDate(d) {
  return moment(d.format('YYYY-MM-DD')).format('X') > moment().format('X');
}; // 字符串长度最长控制


var maxStringLength = 50;
var bigStringLength = 200; // 增值税发票,通过校验码查验

var invoiceAdded1 = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '开票日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '校验码后六位',
  dataIndex: 'checkCode',
  type: 'string',
  maxLength: 6,
  required: true
} // 注意区块链发票类型是1，校验码为5位
]; // 增值税发票,通过不含税金额查验

var invoiceAdded2 = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '开票日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '不含税金额',
  dataIndex: 'invoiceAmount',
  type: 'number',
  required: true
}]; // 飞机票

var airBill = [{
  title: '电子客票号',
  dataIndex: 'electronicTicketNum',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '身份证号码',
  dataIndex: 'customerIdentityNum',
  type: 'string',
  maxLength: 18,
  required: true
}, {
  title: '行程',
  subCols: [{
    title: '开始行程',
    dataIndex: 'placeOfDeparture',
    type: 'string',
    maxLength: maxStringLength,
    required: true
  }, {
    title: '结束行程',
    dataIndex: 'destination',
    type: 'string',
    maxLength: maxStringLength,
    required: true
  }]
}, {
  title: '票价',
  dataIndex: 'invoiceAmount',
  type: 'number',
  required: true
}, {
  title: '顾客姓名',
  dataIndex: 'customerName',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '乘机日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '航班号',
  dataIndex: 'flightNum',
  type: 'string',
  maxLength: maxStringLength
}, {
  title: '机场建设费',
  dataIndex: 'airportConstructionFee',
  type: 'number'
}, {
  title: '燃油附加费',
  dataIndex: 'fuelSurcharge',
  type: 'number'
}, {
  title: '印刷序列号',
  dataIndex: 'printNum',
  type: 'string',
  maxLength: maxStringLength
}, {
  title: '座位等级',
  dataIndex: 'seatGrade',
  type: 'select',
  selectSource: airSeatSelectSource
}]; // 通用机打

var generalMachineBill = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '开票日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '合计金额',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '销方名称',
  dataIndex: 'salerName',
  type: 'string',
  maxLength: bigStringLength
}, {
  title: '销方税号',
  dataIndex: 'salerTaxNo',
  type: 'string',
  maxLength: maxStringLength
}, {
  title: '购方名称',
  dataIndex: 'buyerName',
  type: 'string',
  maxLength: bigStringLength
}]; // 其它发票

var otherBill = [{
  title: '金额',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '备注',
  dataIndex: 'salerName',
  type: 'string',
  maxLength: bigStringLength,
  required: true
}, {
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10
}, {
  title: '开票日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate
}]; // 购置税发票

var purchaseTaxBill = [{
  title: '纳税人识别号',
  dataIndex: 'buyerTaxNo',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '完税证明号码',
  dataIndex: 'taxPaidProofNo',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '填发日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '税务机关名称',
  dataIndex: 'taxAuthorityName',
  type: 'string',
  maxLength: bigStringLength,
  required: true
}, {
  title: '金额',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}]; // 定额发票

var quotaBill = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '金额',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '所在地',
  dataIndex: 'place',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}]; // 过路过桥

var roadBridgeBill = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '开票日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '金额',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '入口',
  dataIndex: 'entrance',
  type: 'string',
  maxLength: maxStringLength
}, {
  title: '出口',
  dataIndex: 'exit',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '时间',
  dataIndex: 'time',
  type: 'time'
}, {
  title: '所在地',
  dataIndex: 'place',
  type: 'string',
  maxLength: maxStringLength
}]; // 轮船票

var shipBill = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '乘船人',
  dataIndex: 'passengerName',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '乘船日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '出发地',
  dataIndex: 'stationGetOn',
  type: 'string',
  maxLength: maxStringLength
}, {
  title: '到达地',
  dataIndex: 'stationGetOff',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '金额',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '币别',
  dataIndex: 'currency',
  type: 'select',
  selectSource: currencySelectSource
}]; // 的士票

var taxBill = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '乘车日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '金额（含税）',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '所在地',
  dataIndex: 'place',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '打车里程',
  dataIndex: 'mileage',
  type: 'number'
}, {
  title: '上车时间',
  dataIndex: 'timeGetOn',
  type: 'time'
}, {
  title: '下车时间',
  dataIndex: 'timeGetOff',
  type: 'time'
}]; // 客运票

var trafficBill = [{
  title: '发票代码',
  dataIndex: 'invoiceCode',
  type: 'string',
  maxLength: 12,
  required: true
}, {
  title: '发票号码',
  dataIndex: 'invoiceNo',
  type: 'string',
  maxLength: 10,
  required: true
}, {
  title: '日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '票价',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '出发站',
  dataIndex: 'stationGetOn',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '到达站',
  dataIndex: 'stationGetOff',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '姓名',
  dataIndex: 'passengerName',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '时间',
  dataIndex: 'timeGetOn',
  type: 'time'
}, {
  title: '币别',
  dataIndex: 'currency',
  type: 'select',
  selectSource: currencySelectSource
}]; // 高铁票

var trainBill = [{
  title: '姓名',
  dataIndex: 'passengerName',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '车次',
  dataIndex: 'trainNum',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '印刷序号',
  dataIndex: 'printingSequenceNo',
  type: 'string',
  maxLength: maxStringLength,
  required: true
}, {
  title: '乘车日期',
  dataIndex: 'invoiceDate',
  type: 'date',
  disabledDate: disabledDate,
  required: true
}, {
  title: '金额（含税）',
  dataIndex: 'totalAmount',
  type: 'number',
  required: true
}, {
  title: '行程',
  subCols: [{
    title: '开始行程',
    dataIndex: 'stationGetOn',
    type: 'string',
    maxLength: maxStringLength,
    required: true
  }, {
    title: '结束行程',
    dataIndex: 'stationGetOff',
    type: 'string',
    maxLength: maxStringLength,
    required: true
  }]
}, {
  title: '座位等级',
  dataIndex: 'currency',
  type: 'select',
  selectSource: trainSeatSelectSource
}];
module.exports = {
  k1: invoiceAdded1,
  k3: invoiceAdded1,
  k4: invoiceAdded2,
  k5: invoiceAdded1,
  k12: invoiceAdded2,
  k13: invoiceAdded2,
  k15: invoiceAdded1,
  k7: generalMachineBill,
  k8: taxBill,
  k9: trainBill,
  k10: airBill,
  k14: quotaBill,
  k16: trafficBill,
  k17: roadBridgeBill,
  k19: purchaseTaxBill,
  k20: shipBill,
  k23: generalMachineBill,
  k11: otherBill
};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

var trainSeatSelectSource = ['二等座', '一等座', '特等座', '商务座', '无座'];
var airSeatSelectSource = [{
  value: 'F',
  text: '头等舱'
}, {
  value: 'C',
  text: '公务舱（商务舱）'
}, {
  value: 'Y',
  text: '普通舱（经济舱）'
}];
var currencySelectSource = [{
  value: 'CNY',
  text: '人民币'
}, {
  value: 'HKD',
  text: '港币'
}, {
  value: 'USD',
  text: '美元'
}];
module.exports = {
  trainSeatSelectSource: trainSeatSelectSource,
  airSeatSelectSource: airSeatSelectSource,
  currencySelectSource: currencySelectSource
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

var INPUT_INVOICE_TYPES = [{
  text: '电子普通发票',
  value: 1,
  allowDeduction: 1,
  isAddedTax: true
}, {
  text: '电子专用发票',
  value: 2,
  allowDeduction: 1,
  isAddedTax: true,
  allowGovdk: 1
}, {
  text: '增值税普通发票',
  value: 3,
  isAddedTax: true
}, {
  text: '增值税专用发票',
  value: 4,
  allowDeduction: 1,
  isAddedTax: true,
  allowGovdk: 1
}, {
  text: '普通纸质卷票',
  value: 5,
  isAddedTax: true
}, {
  text: '通用机打发票',
  value: 7
}, {
  text: '出租车票',
  value: 8
}, {
  text: '火车/高铁票',
  value: 9,
  allowDeduction: 1
}, {
  text: '飞机行程单',
  value: 10,
  allowDeduction: 1
}, {
  text: '机动车销售发票',
  value: 12,
  allowDeduction: 1,
  isAddedTax: true,
  allowGovdk: 1
}, {
  text: '二手车销售发票',
  value: 13,
  isAddedTax: true
}, {
  text: '定额发票',
  value: 14
}, {
  text: '通行费电子发票',
  value: 15,
  allowDeduction: 1,
  isAddedTax: true,
  allowGovdk: 1
}, // 允许抵扣，增值税发票
{
  text: '公路汽车票',
  value: 16,
  allowDeduction: 1
}, {
  text: '过路桥费发票',
  value: 17
}, {
  text: '完税证明',
  value: 19
}, {
  text: '轮船票',
  value: 20,
  allowDeduction: 1
}, // 允许抵扣
{
  text: '通用机打电子发票',
  value: 23
}, {
  text: '海关缴款书',
  value: 21,
  allowDeduction: 1,
  allowGovdk: 1
}, {
  text: '火车票退票凭证',
  value: 24
}, {
  text: '财政电子票据',
  value: 25
}, {
  text: '其它票',
  value: 11,
  allowDeduction: 1
}, {
  text: '全电普票',
  value: 26,
  allowDeduction: 1,
  isAddedTax: true
}, {
  text: '全电专票',
  value: 27,
  allowDeduction: 1,
  isAddedTax: true,
  allowGovdk: 1
}];
var inputFullInvoiceDict = {};
var addedInvoiceTypes = [];
var allowDkInvoiceTypes = [];

for (var i = 0; i < INPUT_INVOICE_TYPES.length; i++) {
  var curData = INPUT_INVOICE_TYPES[i];
  inputFullInvoiceDict['k' + curData.value] = curData;

  if (curData.isAddedTax) {
    addedInvoiceTypes.push(curData.value);
  }

  if (curData.allowDeduction === 1) {
    allowDkInvoiceTypes.push(curData.value);
  }
}

module.exports = {
  INPUT_INVOICE_TYPES: INPUT_INVOICE_TYPES,
  INPUT_INVOICE_TYPES_DICT: inputFullInvoiceDict,
  // INPUT_INVOICE__TYPES_DICT
  ADDED_INVOICE_TYPES: addedInvoiceTypes,
  ALLOW_DK_TYPES: allowDkInvoiceTypes
};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

var invoiceStatus = [{
  text: '正常',
  value: 0
}, {
  text: '失控',
  value: 1
}, {
  text: '作废',
  value: 2
}, {
  text: '红冲',
  value: 3
}, {
  text: '异常',
  value: 4
}];
var invoiceStatuDict = {};

for (var i = 0; i < invoiceStatus.length; i++) {
  invoiceStatuDict['k' + invoiceStatus[i].value] = invoiceStatus[i].text;
}

module.exports = {
  INVOICE_STATUS: invoiceStatus,
  INVOICE_STATUS_DICT: invoiceStatuDict
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

var waringCodes = {
  'k1': '',
  //正常
  'k2': '' //'疑似使用旧的监制章'

};

function getWaringCodesResult() {
  var codeStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var codeArr = codeStr.split(',');
  var result = [];

  for (var i = 0; i < codeArr.length; i++) {
    var curCode = codeArr[i];
    var description = waringCodes['k' + curCode] || '';

    if (description) {
      result.push(description);
    }
  }

  return result;
}

module.exports = {
  waringCodes: waringCodes,
  getWaringCodesResult: getWaringCodesResult
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.setPrototypeOf = __webpack_require__(14);

if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
  window.requestAnimationFrame = function () {
    return window.requestAnimationFrame || window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (func) {
      return setTimeout(func, 1 / 60);
    };
  }();
}

Function.prototype.method = function (name, func) {
  if (!this.prototype[name]) {
    this.prototype[name] = func;
  }

  return this;
}; //获取数字的整数部分


Number.method('integer', function () {
  return Math[this < 0 ? 'ceil' : 'floor'](this);
}); //去除字符串前后空白

String.method('trim', function () {
  return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
}); //把中文括弧统一转换为英文，方便比较

String.method('replaceInclude', function () {
  return this.replace('）', ')').replace('（', '(');
}); //过滤JSON数据中的<>等敏感字符

String.method('entityify', function (opt) {
  var entity = {
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
  };

  if (_typeof(opt) !== undefined) {
    entity = opt;
  }

  return function () {
    return this.replace(/(["<>&])/g, function (c) {
      return entity[c];
    });
  };
}());
String.method('isEmail', function () {
  return /^([a-zA-Z0-9_\.-]+)@([a-zA-Z0-9\.-]+)\.([a-zA-Z\.]{2,6})$/.test(this);
});
String.method('isEmpty', function () {
  return /^[\s]*$/.test(this);
});
String.method('isNotEmpty', function () {
  return /[\S]+/.test(this);
});
String.method('isPhone', function () {
  return /^(1[0-9]{10}$)/.test(this);
});
String.method('isPhoneOrMail', function () {
  if (this.isEmail()) {
    return 2;
  } else if (this.isPhone()) {
    return 1;
  } else {
    return false;
  }
});
String.method('getLength', function () {
  var r = /[\x00-\xff]/g;
  var cnLen = this.replace(r, '').length;
  return this.length + cnLen;
});
String.method('isNumber', function () {
  return /[0-9.]*/.test(this) && isFinite(this);
});
String.method('getSub', function (n, flag) {
  var r = /[^\x00-\xff]/g;

  if (this.replace(r, "mm").length <= n) {
    return this;
  }

  var m = Math.floor(n / 2);

  for (var i = m; i < this.length; i++) {
    if (this.substr(0, i).replace(r, "mm").length >= n) {
      if (flag) {
        return this.substr(0, i) + '...';
      } else {
        return this.substr(0, i);
      }
    }
  }

  return this;
});
String.method('trimUnNumber', function () {
  var v = parseFloat(this.trim());

  if (isNaN(v)) {
    return '';
  } else {
    return v + '';
  }
}); //某些浏览器不支持IndexOf

Array.method('indexOf', function (value) {
  var i,
      len = this.length;

  for (i = 0; i < len; i++) {
    if (this[i] === value) {
      return i;
    }
  }

  return -1;
});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint no-proto: 0 */
module.exports = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties)

function setProtoOf (obj, proto) {
  obj.__proto__ = proto
  return obj
}

function mixinProperties (obj, proto) {
  for (var prop in proto) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      obj[prop] = proto[prop]
    }
  }
  return obj
}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCache", function() { return setCache; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCache", function() { return getCache; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearCache", function() { return clearCache; });
/* harmony import */ var _cookie_helps__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

 //默认sessionStorage

var setCache = function setCache(key, value, flag) {
  if (_typeof(value) === 'object') {
    value = escape(JSON.stringify(value));
  } else {
    value = escape(value);
  }

  if (!localStorage && !sessionStorage) {
    try {
      var timeout = 60 * 60;

      if (!isNaN(parseInt(flag))) {
        timeout = flag;
      }

      Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["setCookie"])(key, value, timeout);
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
      //如果传入为数字，则表示未cookie的保留时间
      try {
        Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["setCookie"])(key, value, flag);
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
}; //默认sessionStorage

var getCache = function getCache(key, flag, type) {
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
      //默认使用session storage
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
var clearCache = function clearCache(key, flag) {
  if (!localStorage && !sessionStorage) {
    try {
      Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["clearCookie"])(key);
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
        Object(_cookie_helps__WEBPACK_IMPORTED_MODULE_0__["clearCookie"])(key);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      //默认清理sessionStorage
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
};

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLoadedJs", function() { return getLoadedJs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "syncUse", function() { return syncUse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "use", function() { return use; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadScripts", function() { return loadScripts; });
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var getLoadedJs = function getLoadedJs() {
  var loadedUnAMDScripts = []; // 防止服务端使用时出现异常

  if ((typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && document.getElementsByTagName) {
    var scriptsObj = document.getElementsByTagName('script');

    for (var i = scriptsObj.length; i--;) {
      var src = scriptsObj[i].src || '';

      if (src != '') {
        loadedUnAMDScripts.push(src);
      }
    }
  }

  return loadedUnAMDScripts;
}; //获取地址的绝对路径

var getFullPath = function getFullPath(path, basePath) {
  if (/^https?:\/\/.*$/.test(path)) {
    return path;
  }

  basePath = basePath || window.location.href.replace(/\/[0-0a-zA-Z._-]*$/, '');
  var rootPath = window.location.origin;

  if (/^\/.*$/.test(path)) {
    //以斜杠开始
    return rootPath + path; //以.开始
  } else if (/^\.\/.*$/.test(path)) {
    return basePath + path.replace(/^\./, '');
  } else if (/^\.\.\/.*/.test(path)) {
    //以..开始
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
    //path开始没有特殊字符
    return basePath + path;
  }
}; //同步加载，urls之间有前后依赖关系时可以选择这种方式，速度稍微慢些
//如果前面的一个url地址找不到，后续的则不会加载


var syncUse = function syncUse(sUrls, callback) {
  var loadedUnAMDScripts = getLoadedJs();
  var urls = [];

  if (typeof sUrls === 'string') {
    urls.push(getFullPath(sUrls));
  } else {
    for (var i = 0, len = sUrls.length; i < len; i++) {
      //转换路径
      urls.push(getFullPath(sUrls[i]));
    }
  }

  return function next(i) {
    if (loadedUnAMDScripts.indexOf(urls[i]) == -1) {
      //判断是否已经加载过
      if (i < urls.length) {
        var script = document.createElement('script');
        script.type = 'text/javascript';

        if (script.readyState) {
          //IE
          script.onreadystatechange = function () {
            if (script.readyState == 'loaded' || script.readyState == 'complete') {
              script.onreadystatechange = null;
              next(i + 1);
            }
          };
        } else {
          //Others
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
      //如果已经加载过则直接加载下一个
      next(i + 1);
    }
  }(0);
}; //异步加载，urls之间不相互依赖时可以选择这种方式, 不保证urls的加载顺序
//如果前面的一个url地址找不到，后续会继续加载，但callback不会执行
//如果有重复的url无法控制是否已经加载

var use = function use(sUrls, callback) {
  //异步加载
  var loadedUnAMDScripts = getLoadedJs();
  var loadedNumber = 0;
  var jsNumber;
  var urls = [];

  if (typeof sUrls === 'string') {
    urls.push(getFullPath(sUrls));
  } else {
    for (var i = sUrls.length; i--;) {
      //转换路径
      urls.push(getFullPath(sUrls[i]));
    }
  }

  jsNumber = urls.length;

  for (var _i = jsNumber; _i--;) {
    var jsSrc = urls[_i];

    if (loadedUnAMDScripts.indexOf(jsSrc) == -1) {
      //判断是否已经加载过
      var script = document.createElement('script');
      script.type = 'text/javascript';

      if (script.readyState) {
        //IE
        script.onreadystatechange = function () {
          if (script.readyState == 'loaded' || script.readyState == 'complete') {
            script.onreadystatechange = null;

            if (++loadedNumber == jsNumber) {
              callback();
            }
          }
        };
      } else {
        //Others
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
}; // 加载lib库文件，返回promise对象

var loadScripts = function loadScripts(sUrls, syncFlag) {
  return new Promise(function (resolve) {
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

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlSearch", function() { return urlSearch; });
var urlSearch = function urlSearch() {
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

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blockchain_filter", function() { return blockchain_filter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInvoiceType", function() { return checkInvoiceType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInvoiceTypeFull", function() { return checkInvoiceTypeFull; });
var blockchain_filter = function blockchain_filter(fpInfo) {
  //区块链点击发票区分
  var flag = false;
  var invoiceCode = fpInfo.invoiceCode,
      invoiceNo = fpInfo.invoiceNo;

  if (invoiceCode && invoiceNo) {
    if (invoiceCode.length == 12 && invoiceNo.length == 8) {
      var str5 = invoiceCode.substr(0, 5);
      var str9 = invoiceCode.substr(8, 1);

      if (str5 == '14403' && str9 == '9') {
        flag = true;
      }
    }
  }

  return flag;
}; //根据发票代码判断专票或普票

var checkInvoiceType = function checkInvoiceType(fpdm, fphm) {
  if (fpdm) {
    fpdm += '';
  }

  if (fphm) {
    fphm += '';
  } // const isBlockchain = blockchain_filter({invoiceCode: fpdm, invoiceNo: fphm});
  // if(isBlockchain){
  //     return 11; //区块链发票
  // }


  var last3Str = fpdm.substr(fpdm.length - 3);
  var last2Str = fpdm.substr(fpdm.length - 2);
  var firstStr = fpdm.substr(0, 1);
  var sixthStr = fpdm.substr(5, 1);
  var eighthStr = fpdm.substr(7, 1);

  if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
    return 4; //纸质专票
  }

  if (fpdm.length == 12) {
    if (firstStr == '0' && last2Str == '12') {
      return 15; //通行费
    }

    if (firstStr === '0' && last2Str === '17') {
      return 13; // 二手车
    }

    if (firstStr === '0' && (last2Str === '06' || last2Str === '07')) {
      return 5; //卷式
    }

    if (firstStr === '0' && last2Str === '13') {
      return 2; // 电子专票
    }

    if (sixthStr == '1' || sixthStr == '2') {
      if (eighthStr == '2') {
        //机动车销售票
        return 12;
      }
    }
  }

  return 3;
};
function checkInvoiceTypeFull(fpdm, fphm) {
  if (fpdm) {
    fpdm += '';
  }

  if (fphm) {
    fphm += '';
  }

  if (!fphm || !fpdm) {
    return 5; // 普通纸质卷票
  }

  var fpdmLength = fpdm.length; //长度为12位的都是

  if (fpdmLength == 12) {
    //如果是区块链发票 区块链发票五要素查验 区块链发票暂时定为1--电子发票类型
    if (fpdm.length == 12 && fphm.length == 8) {
      //发票代码12位  发票号码8位
      if (fpdm.startsWith('14403') && '9' === fpdm.substr(8, 9)) {
        return 1;
      }

      if (fpdm.startsWith('0') && fpdm.endsWith('13')) {
        return 2; //电专票
      }
    }

    if (fpdm.startsWith('1') && fpdm.substr(7, 8).equals('2')) {
      return 12; // 机动车
    }

    if (fpdm.endsWith('11') && fpdm.startsWith('0')) {
      return 1; // 普通电子发票
    }

    if (fpdm.endsWith('12') && fpdm.startsWith('0')) {
      return 15; // 通行费
    }

    if (fpdm.endsWith('04') || fpdm.endsWith('05')) {
      return 3; // 普通纸质发票
    }

    if (fpdm.endsWith('06') || fpdm.endsWith('07')) {
      return 5; // 普通纸质卷票
    }

    if (fpdm.endsWith('17') && fpdm.startsWith('0')) {
      return 13; // 二手车
    } else {
      return 3; // 普票
    }
  } else if (fpdmLength == 10) {
    if (fpdm.endsWith('130') || fpdm.endsWith('140') || fpdm.endsWith('160') || fpdm.endsWith('170')) {
      return 4; // 纸质专用发票
    } else {
      return 3; // 普票
    }
  } else {
    return 3;
  }
}

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var crossHttp = function crossHttp(_ref) {
  var _ref$method = _ref.method,
      method = _ref$method === void 0 ? 'POST' : _ref$method,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? '' : _ref$data,
      _ref$withCredentials = _ref.withCredentials,
      withCredentials = _ref$withCredentials === void 0 ? false : _ref$withCredentials,
      _ref$dataType = _ref.dataType,
      dataType = _ref$dataType === void 0 ? 'json' : _ref$dataType,
      _ref$contentType = _ref.contentType,
      contentType = _ref$contentType === void 0 ? 'text/plain' : _ref$contentType,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 60000 : _ref$timeout,
      _ref$url = _ref.url,
      url = _ref$url === void 0 ? 'http://127.0.0.1:52320/cryptctl' : _ref$url,
      onTimeout = _ref.onTimeout,
      onError = _ref.onError,
      success = _ref.success;
  return new Promise(function (resolve, reject) {
    var xhr = null;

    if (XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }

    if (withCredentials && typeof xhr.withCredentials !== 'undefined') {
      xhr.withCredentials = true;
    }

    if (!xhr && typeof XDomainRequest !== 'undefined') {
      // 检查是否是IE，并且使用IE的XDomainRequest
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
            //TODO handle the exception
            resolve({
              description: '服务端异常',
              errcode: 'serverErr'
            });
          }
        } else {
          resolve(result);
        }
      };

      xhr.ontimeout = function () {
        resolve({
          errcode: 'timeout',
          description: '请求超时,请安装且启动“金蝶发票管理组件”后重试！'
        }, xhr);
      };

      xhr.onerror = function () {
        resolve({
          errcode: 'err',
          description: '请求异常,请安装且启动“金蝶发票管理组件”后重试！'
        }, xhr);
      };

      xhr.open(method, url, true); //窗口上下文的同步模式中不支持使用 XMLHttpRequest 的 timeout 属性

      if (_typeof(data) === 'object') {
        data = JSON.stringify(data);
      }

      if (typeof data === 'string') {
        xhr.send(data);
      } else {
        resolve({
          errcode: 'argsErr',
          description: '参数格式不正确'
        });
      }
    } else {
      xhr = null;
      resolve({
        errcode: 'accessErr',
        description: '税盘不支持访问'
      });
    }
  });
};

/* harmony default export */ __webpack_exports__["default"] = (crossHttp);

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//client check
var clientCheck = function clientCheck() {
  //rendering engines
  var engine = {
    ie: 0,
    gecko: 0,
    webkit: 0,
    khtml: 0,
    opera: 0,
    ver: null
  }; //browsers

  var browser = {
    ie: 0,
    firefox: 0,
    safari: 0,
    konq: 0,
    opera: 0,
    chrome: 0,
    ver: null
  }; //platform/device/OS

  var system = {
    win: false,
    mac: false,
    x11: false,
    //mobile devices
    iphone: false,
    ipod: false,
    ipad: false,
    ios: false,
    android: false,
    nokiaN: false,
    winMobile: false,
    //game systems
    wii: false,
    ps: false
  }; //detect rendering engines/browsers

  var ua = navigator.userAgent;

  if (window.opera) {
    engine.ver = browser.ver = window.opera.version();
    engine.opera = browser.opera = parseFloat(engine.ver);
  } else if (/AppleWebKit\/(\S+)/.test(ua)) {
    engine.ver = RegExp['$1'];
    engine.webkit = parseFloat(engine.ver); //figure out if it's Chrome or Safari

    if (/Chrome\/(\S+)/.test(ua)) {
      browser.ver = RegExp['$1'];
      browser.chrome = parseFloat(browser.ver);
    } else if (/Version\/(\S+)/.test(ua)) {
      browser.ver = RegExp['$1'];
      browser.safari = parseFloat(browser.ver);
    } else {
      //approximate version
      var safariVersion = 1;

      if (engine.webkit < 100) {
        safariVersion = 1;
      } else if (engine.webkit < 312) {
        safariVersion = 1.2;
      } else if (engine.webkit < 412) {
        safariVersion = 1.3;
      } else {
        safariVersion = 2;
      }

      browser.safari = browser.ver = safariVersion;
    }
  } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
    engine.ver = browser.ver = RegExp['$1'];
    engine.khtml = browser.konq = parseFloat(engine.ver);
  } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
    engine.ver = RegExp['$1'];
    engine.gecko = parseFloat(engine.ver); //determine if it's Firefox

    if (/Firefox\/(\S+)/.test(ua)) {
      browser.ver = RegExp['$1'];
      browser.firefox = parseFloat(browser.ver);
    }
  } else if (/MSIE ([^;]+)/.test(ua)) {
    engine.ver = browser.ver = RegExp['$1'];
    engine.ie = browser.ie = parseFloat(engine.ver);
  } else if (/Trident\/7.0/.test(ua) && /rv:([^\)]+)\)/.test(ua)) {
    // edge 11版本
    engine.ver = browser.ver = RegExp['$1'];
    engine.ie = browser.ie = parseFloat(engine.ver);
  } else if (/Edge\/(\S+)/.test(ua)) {
    // edge 12或者更高版本
    engine.ver = browser.ver = RegExp['$1'];
    engine.ie = browser.ie = parseFloat(engine.ver);
  } //detect browsers


  browser.ie = engine.ie;
  browser.opera = engine.opera; //detect platform

  var p = navigator.platform;
  system.win = p.indexOf('Win') == 0;
  system.mac = p.indexOf('Mac') == 0;
  system.x11 = p == 'X11' || p.indexOf('Linux') == 0; //detect windows operating systems

  if (system.win) {
    if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
      if (RegExp['$1'] == 'NT') {
        switch (RegExp['$2']) {
          case '5.0':
            system.win = '2000';
            break;

          case '5.1':
            system.win = 'XP';
            break;

          case '6.0':
            system.win = 'Vista';
            break;

          case '6.1':
            system.win = '7';
            break;

          default:
            system.win = 'NT';
            break;
        }
      } else if (RegExp['$1'] == '9x') {
        system.win = 'ME';
      } else {
        system.win = RegExp['$1'];
      }
    }
  } //mobile devices


  system.iphone = ua.indexOf('iPhone') > -1;
  system.ipod = ua.indexOf('iPod') > -1;
  system.ipad = ua.indexOf('iPad') > -1;
  system.nokiaN = ua.indexOf('NokiaN') > -1; //windows mobile

  if (system.win == 'CE') {
    system.winMobile = system.win;
  } else if (system.win == 'Ph') {
    if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
      ;
      system.win = 'Phone';
      system.winMobile = parseFloat(RegExp['$1']);
    }
  } //determine iOS version


  if (system.mac && ua.indexOf('Mobile') > -1) {
    if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
      system.ios = parseFloat(RegExp.$1.replace('_', '.'));
    } else {
      system.ios = 2; //can't really detect - so guess
    }
  } //determine Android version


  if (/Android (\d+\.\d+)/.test(ua)) {
    system.android = parseFloat(RegExp.$1);
  } //gaming systems


  system.wii = ua.indexOf('Wii') > -1;
  system.ps = /playstation/i.test(ua);
  return {
    engine: engine,
    browser: browser,
    system: system
  };
};

/* harmony default export */ __webpack_exports__["default"] = (clientCheck);

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setOperateUrl", function() { return setOperateUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getVersionApi", function() { return getVersionApi; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "verifyPinApi", function() { return verifyPinApi; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClientHello", function() { return getClientHello; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClientAuthCode", function() { return getClientAuthCode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTaxInfoFromDisk", function() { return getTaxInfoFromDisk; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "signDataApi", function() { return signDataApi; });
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//操作税盘接口

var caOperateUrl = 'http://127.0.0.1:52320/cryptctl'; //如果需要修改税盘操作地址调用这个方法

function setOperateUrl(url) {
  caOperateUrl = url;
}

var getApi = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(url, data, o) {
    var res;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
              'method': 'POST',
              'data': Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["paramJson"])(data),
              'contentType': 'application/x-www-form-urlencoded;charset=UTF-8',
              'url': url
            });

          case 2:
            res = _context.sent;
            return _context.abrupt("return", res);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getApi(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

function getVersionApi(_x4, _x5) {
  return _getVersionApi.apply(this, arguments);
}

function _getVersionApi() {
  _getVersionApi = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(flag, url) {
    var ip, apiUrl, data;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!url) {
              url = caOperateUrl;
            }

            ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
            apiUrl = 'https://' + ip + ':28000/api/getVersion';
            data = {
              crosFlag: 0
            };
            _context2.next = 6;
            return getApi(apiUrl, data);

          case 6:
            return _context2.abrupt("return", _context2.sent);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getVersionApi.apply(this, arguments);
}

function verifyPinApi(_x6, _x7, _x8, _x9) {
  return _verifyPinApi.apply(this, arguments);
}

function _verifyPinApi() {
  _verifyPinApi = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(passwd, flag, alg, url) {
    var ip, apiUrl, data, res, errMsg;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            passwd = encodeURIComponent(passwd);

            if (!url) {
              url = caOperateUrl;
            }

            ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
            apiUrl = 'https://' + ip + ':28000/api/verifyPin';
            data = 0 == alg ? {
              password: passwd,
              dwProvType: 1
            } : {
              password: passwd,
              dwProvType: 2050,
              strContainer: '//SM2/SM2CONTAINER0002'
            };
            _context3.next = 7;
            return getApi(apiUrl, data);

          case 7:
            res = _context3.sent;

            if (!(res.code == 0)) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt("return", {
              errcode: '0000',
              data: '0'
            });

          case 12:
            errMsg = res.msg + '(错误代码：' + res.code + ')';
            return _context3.abrupt("return", {
              errcode: '7000',
              description: errMsg
            });

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _verifyPinApi.apply(this, arguments);
}

function getClientHello(_x10, _x11, _x12) {
  return _getClientHello.apply(this, arguments);
}

function _getClientHello() {
  _getClientHello = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(passwd, url, alg) {
    var ip, apiUrl, data, res, errMsg;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!url) {
              url = caOperateUrl;
            }

            ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
            apiUrl = 'https://' + ip + ':28000/api/clientHello';
            data = 0 == alg ? {
              authType: 0,
              dwProvType: 1
            } : {
              authType: 0,
              dwProvType: 2050,
              strContainer: '//SM2/SM2CONTAINER0002'
            };
            _context4.next = 6;
            return getApi(apiUrl, data);

          case 6:
            res = _context4.sent;

            if (!(res.code == 0)) {
              _context4.next = 15;
              break;
            }

            if (!res.clientHello) {
              _context4.next = 12;
              break;
            }

            return _context4.abrupt("return", {
              errcode: '0000',
              data: res.clientHello
            });

          case 12:
            return _context4.abrupt("return", {
              errcode: '7000',
              description: '税盘操作异常'
            });

          case 13:
            _context4.next = 17;
            break;

          case 15:
            errMsg = res.msg + '(错误代码：' + res.code + ')';
            return _context4.abrupt("return", {
              errcode: '7000',
              description: errMsg
            });

          case 17:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getClientHello.apply(this, arguments);
}

function getClientAuthCode(_x13, _x14, _x15, _x16) {
  return _getClientAuthCode.apply(this, arguments);
}

function _getClientAuthCode() {
  _getClientAuthCode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(passwd, serverPacket, url, alg) {
    var ip, apiUrl, data, res, errMsg;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!url) {
              url = caOperateUrl;
            }

            ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
            apiUrl = 'https://' + ip + ':28000/api/clientAuth';
            data = 0 == alg ? {
              password: passwd,
              serverHello: serverPacket,
              dwProvType: 1
            } : {
              password: passwd,
              serverHello: serverPacket,
              dwProvType: 2050,
              strContainer: '//SM2/SM2CONTAINER0002'
            };
            _context5.next = 6;
            return getApi(apiUrl, data);

          case 6:
            res = _context5.sent;

            if (!(res.code == 0)) {
              _context5.next = 15;
              break;
            }

            if (!res.clientAuth) {
              _context5.next = 12;
              break;
            }

            return _context5.abrupt("return", {
              errcode: '0000',
              data: res.clientAuth
            });

          case 12:
            return _context5.abrupt("return", {
              errcode: '7000',
              description: '税盘操作异常'
            });

          case 13:
            _context5.next = 17;
            break;

          case 15:
            errMsg = res.msg + '(错误代码：' + res.code + ')';
            return _context5.abrupt("return", {
              errcode: '7000',
              description: errMsg
            });

          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _getClientAuthCode.apply(this, arguments);
}

function getTaxInfoFromDisk(_x17, _x18, _x19, _x20) {
  return _getTaxInfoFromDisk.apply(this, arguments);
}

function _getTaxInfoFromDisk() {
  _getTaxInfoFromDisk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(passwd, type, url, alg) {
    var ip, apiUrl, data, res, errMsg;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            //71获取税号，27获取企业名称
            if (!url) {
              url = caOperateUrl;
            }

            ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
            apiUrl = 'https://' + ip + ':28000/api/readCertInfo';
            data = 0 == alg ? {
              certInfoNo: type,
              dwProvType: 1
            } : {
              certInfoNo: type,
              dwProvType: 2050,
              strContainer: '//SM2/SM2CONTAINER0002'
            };
            _context6.next = 6;
            return getApi(apiUrl, data);

          case 6:
            res = _context6.sent;

            if (!(res.code == 0)) {
              _context6.next = 15;
              break;
            }

            if (!res.certInfo) {
              _context6.next = 12;
              break;
            }

            return _context6.abrupt("return", {
              errcode: '0000',
              data: res.certInfo
            });

          case 12:
            return _context6.abrupt("return", {
              errcode: '7000',
              description: '税盘操作异常'
            });

          case 13:
            _context6.next = 17;
            break;

          case 15:
            errMsg = res.msg + '(错误代码：' + res.code + ')';
            return _context6.abrupt("return", {
              errcode: '7000',
              description: errMsg
            });

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _getTaxInfoFromDisk.apply(this, arguments);
}

function signDataApi(_x21, _x22, _x23, _x24, _x25) {
  return _signDataApi.apply(this, arguments);
}

function _signDataApi() {
  _signDataApi = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(originData, passwd, flag, alg, url) {
    var ip, apiUrl, data, res, errMsg;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!url) {
              url = caOperateUrl;
            }

            ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
            apiUrl = 'https://' + ip + ':28000/api/signData';
            data = 0 == alg ? {
              password: passwd,
              data: originData,
              signAlgId: 'SHA1withRSA',
              dwFlag: '0x400000',
              dwProvType: 1
            } : {
              password: passwd,
              data: originData,
              signAlgId: 'GBECSM3',
              dwFlag: '0x400000',
              dwProvType: 2050,
              strContainer: '//SM2/SM2CONTAINER0002'
            };
            _context7.next = 6;
            return getApi(apiUrl, data);

          case 6:
            res = _context7.sent;

            if (!(res.code == 0)) {
              _context7.next = 15;
              break;
            }

            if (!res.p7Signature) {
              _context7.next = 12;
              break;
            }

            return _context7.abrupt("return", {
              errcode: '0000',
              data: res.p7Signature
            });

          case 12:
            return _context7.abrupt("return", {
              errcode: '7000',
              description: '税盘操作异常'
            });

          case 13:
            _context7.next = 17;
            break;

          case 15:
            errMsg = res.msg + '(错误代码：' + res.code + ')';
            return _context7.abrupt("return", {
              errcode: '7000',
              description: errMsg
            });

          case 17:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _signDataApi.apply(this, arguments);
}

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getApiVersion", function() { return getApiVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkTaxNo", function() { return checkTaxNo; });
/* harmony import */ var _diskApi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(21);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


var getApiVersion = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(certPass, operateUrl) {
    var vs, cryptType, alg, vsVersion, obj;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _diskApi__WEBPACK_IMPORTED_MODULE_0__["getVersionApi"](true, operateUrl);

          case 2:
            vs = _context.sent;
            cryptType = 1; // 默认使用旧版

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
            return _diskApi__WEBPACK_IMPORTED_MODULE_0__["verifyPinApi"](certPass, false, 1);

          case 19:
            obj = _context.sent;

            if (!(obj.errcode !== '0000')) {
              _context.next = 27;
              break;
            }

            _context.next = 23;
            return _diskApi__WEBPACK_IMPORTED_MODULE_0__["verifyPinApi"](certPass, false, 0);

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

            return _context.abrupt("return", obj);

          case 30:
            return _context.abrupt("return", {
              errcode: '0000',
              data: {
                cryptType: cryptType,
                alg: alg
              }
            });

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getApiVersion(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var checkTaxNo = function checkTaxNo(cert) {
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

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return MultiPortOperateDisk; });
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// 多端口操作税盘接口

var defaultCaOperateUrl = 'http://127.0.0.1:52320/cryptctl';
function MultiPortOperateDisk() {
  var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  this.timeout = opt.timeout || 60000;
  this.allowPorts = opt.ports || ['52320', '61624', '50001', '50051', '50101'];
  this.caOperateUrl = ''; // 默认为空, 一旦有一个接口访问成功则修改这里的
}
MultiPortOperateDisk.prototype = {
  setOperateUrl: function setOperateUrl(url) {
    this.caOperateUrl = url;
  },
  getUrlInfo: function getUrlInfo(url) {
    var urlReg = /^(https?):\/\/([0-9.a-z]*):([0-9]*)\/(.*)$/;
    var urlMatchInfo = url.match(urlReg);

    if (urlMatchInfo.length > 2) {
      return {
        protocol: urlMatchInfo[1],
        hostname: urlMatchInfo[2],
        port: urlMatchInfo[3],
        pathname: urlMatchInfo[4]
      };
    } else {
      return false;
    }
  },
  mergeUrlInfo: function mergeUrlInfo() {
    var oldInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var protocol = oldInfo.protocol,
        hostname = oldInfo.hostname,
        port = oldInfo.port,
        pathname = oldInfo.pathname;
    protocol = info.protocol || protocol;
    hostname = info.hostname || hostname;
    port = info.port || port;
    pathname = info.pathname || pathname;

    if (pathname === '') {
      return protocol + '://' + hostname + ':' + port;
    }

    return protocol + '://' + hostname + ':' + port + '/' + pathname;
  },
  requestDisk: function () {
    var _requestDisk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(url, data, cback) {
      var newInfo, oldInfo, res, errmsg, urlInfo, _res, i, port, curUrl, resInner, _errmsg;

      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (url) {
                _context.next = 4;
                break;
              }

              url = defaultCaOperateUrl;
              _context.next = 11;
              break;

            case 4:
              if (!this.caOperateUrl) {
                _context.next = 11;
                break;
              }

              newInfo = this.getUrlInfo(url);
              oldInfo = this.getUrlInfo(this.caOperateUrl);

              if (!(!newInfo || !oldInfo)) {
                _context.next = 10;
                break;
              }

              cback({
                errcode: '3000',
                description: '税盘操作地址格式异常'
              });
              return _context.abrupt("return");

            case 10:
              // 新地址
              if (newInfo.protocol !== oldInfo.protocol || newInfo.hostname !== oldInfo.hostname) {
                this.caOperateUrl = '';
              }

            case 11:
              if (!this.caOperateUrl) {
                _context.next = 19;
                break;
              }

              _context.next = 14;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
                'method': 'POST',
                'data': data,
                'url': this.caOperateUrl
              });

            case 14:
              res = _context.sent;
              errmsg = res.errmsg || res.description || '税盘操作异常';

              if (res.errcode === '0000') {
                if (res.result !== '') {
                  cback({
                    errcode: '0000',
                    data: res.result
                  });
                } else {
                  cback({
                    errcode: '7000',
                    description: errmsg
                  });
                }
              } else {
                cback({
                  errcode: res.errcode,
                  description: errmsg
                });
              }

              _context.next = 44;
              break;

            case 19:
              urlInfo = this.getUrlInfo(url);
              _res = {};
              i = 0;

            case 22:
              if (!(i < this.allowPorts.length)) {
                _context.next = 43;
                break;
              }

              port = this.allowPorts[i];
              curUrl = this.mergeUrlInfo(urlInfo, {
                port: port
              });
              _context.next = 27;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["crossHttp"])({
                'method': 'POST',
                'data': data,
                'url': curUrl
              });

            case 27:
              resInner = _context.sent;
              _errmsg = resInner.errmsg || resInner.description || '税盘操作异常';

              if (!(resInner.errcode === '0000')) {
                _context.next = 39;
                break;
              }

              if (!(resInner.result !== '')) {
                _context.next = 36;
                break;
              }

              this.caOperateUrl = curUrl;
              _res = {
                errcode: '0000',
                data: resInner.result
              };
              return _context.abrupt("break", 43);

            case 36:
              _res = {
                errcode: '7000',
                description: _errmsg
              };

            case 37:
              _context.next = 40;
              break;

            case 39:
              _res = {
                errcode: resInner.errcode,
                description: _errmsg
              };

            case 40:
              i++;
              _context.next = 22;
              break;

            case 43:
              cback(_res);

            case 44:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function requestDisk(_x, _x2, _x3) {
      return _requestDisk.apply(this, arguments);
    }

    return requestDisk;
  }(),
  getClientHello: function getClientHello(passwd, url) {
    var _this = this;

    return new Promise(function (resolve) {
      var data = {
        "funcname": "clienthello",
        "args": {
          "userpin": passwd,
          "dwflags": 0
        }
      };

      _this.requestDisk(url, data, function (res) {
        resolve(res);
      });
    });
  },
  getClientAuthCode: function getClientAuthCode(passwd, serverPacket, url) {
    var _this2 = this;

    return new Promise(function (resolve) {
      var data = {
        "funcname": "clientauth",
        "args": {
          "userpin": passwd,
          "strServerHello": serverPacket
        }
      };

      _this2.requestDisk(url, data, function (res) {
        resolve(res);
      });
    });
  },
  getTaxInfoFromDisk: function getTaxInfoFromDisk(passwd, type, url) {
    var _this3 = this;

    return new Promise(function (resolve) {
      var data = {
        "funcname": "getcertinfo",
        "args": {
          "userpin": passwd,
          "cert": "",
          "certinfono": type
        }
      };

      _this3.requestDisk(url, data, function (res) {
        resolve(res);
      });
    });
  },
  signDataApi: function signDataApi(originData, passwd) {
    var _this4 = this;

    var flag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var alg = arguments.length > 3 ? arguments[3] : undefined;
    var url = arguments.length > 4 ? arguments[4] : undefined;
    return new Promise(function (resolve) {
      var r = {
        data: originData,
        alg: "SHA1withRSA",
        flag: 4194304
      };
      var data = {
        "funcname": "sign",
        "args": r
      };

      _this4.requestDisk(url, data, function (res) {
        resolve(res);
      });
    });
  },
  companyAuth: function companyAuth(url, data) {
    var _this5 = this;

    return new Promise(function (resolve) {
      _this5.requestDisk(url, data, function (res) {
        resolve(res);
      });
    });
  }
};

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SwjgFpdk; });
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _multiPortDiskOperate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(23);
/* harmony import */ var _diskApi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(21);
/* harmony import */ var _checkApiVersion__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(22);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _excluded = ["serialNo", "versionNo", "dataIndex", "searchOpt", "dataFromIndex", "dataFrom"],
    _excluded2 = ["serialNo", "versionNo", "dataIndex", "searchOpt", "dataFromIndex", "dataFrom"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

 // import * as diskOperate from './diskOperate';




var setCache = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["cacheHelp"].setCache,
    getCache = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["cacheHelp"].getCache,
    clearCache = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["cacheHelp"].clearCache;
var setCookie = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["cookieHelp"].setCookie,
    getCookie = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["cookieHelp"].getCookie,
    clearCookie = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["cookieHelp"].clearCookie;
var govCacheSeconds = 2800;
var defaultTimeout = 70000;
function SwjgFpdk(opt) {
  this.baseTaxNo = opt.taxNo || 'fixedTaxNo';
  this.fpdkType = opt.fpdkType ? parseInt(opt.fpdkType) : 1;
  var loginInfo;
  var govToken = '';
  var cachePasswd = '';
  var cachePtPasswd = '';
  var operateUrl = opt.operateUrl || '';

  if (this.baseTaxNo) {
    govToken = getCookie('govToken-' + this.baseTaxNo);

    if (!govToken) {
      //失效，需要重新登录
      clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
    } else {
      loginInfo = getCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');

      if (loginInfo) {
        operateUrl = loginInfo.operateUrl;
        cachePasswd = loginInfo.passwd || '';
        cachePtPasswd = loginInfo.ptPasswd || '';
      } else {
        // 对应的localStorage存储失效
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
    this.diskOperate = new _multiPortDiskOperate__WEBPACK_IMPORTED_MODULE_1__["default"]({
      ports: opt.ports
    }); // opt.diskOperate || diskOperate;
  } else {
    this.diskOperate = new _multiPortDiskOperate__WEBPACK_IMPORTED_MODULE_1__["default"](); // opt.diskOperate || diskOperate;
  }

  this.operateUrl = operateUrl;
  this.access_token = opt.access_token || '';

  if (loginInfo) {
    this.loginGovInfo = loginInfo;
  }
}
SwjgFpdk.prototype = {
  validateLogin: function () {
    var _validateLogin = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(certPass) {
      var cryptType, alg, cert, certInfo, obj, res;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              /*
              const versionInfo = await getApiVersion(certPass, this.operateUrl);
              if (versionInfo.errcode !== '0000') {
                  return versionInfo;
              }
                const { cryptType, alg } = versionInfo.data;
              */
              cryptType = 0;
              alg = 0;
              cert = '';

              if (!(cryptType === 1)) {
                _context.next = 12;
                break;
              }

              _context.next = 6;
              return this.diskOperate.getTaxInfoFromDisk(certPass, 71, this.operateUrl);

            case 6:
              certInfo = _context.sent;

              if (!(certInfo.errcode !== '0000')) {
                _context.next = 9;
                break;
              }

              return _context.abrupt("return", certInfo);

            case 9:
              cert = certInfo.data;
              _context.next = 18;
              break;

            case 12:
              _context.next = 14;
              return _diskApi__WEBPACK_IMPORTED_MODULE_2__["getTaxInfoFromDisk"](certPass, 71, this.operateUrl, alg);

            case 14:
              obj = _context.sent;

              if (!(obj.errcode !== '0000')) {
                _context.next = 17;
                break;
              }

              return _context.abrupt("return", obj);

            case 17:
              cert = obj.data;

            case 18:
              res = Object(_checkApiVersion__WEBPACK_IMPORTED_MODULE_3__["checkTaxNo"])(cert);

              if (!(res.errcode !== '0000')) {
                _context.next = 21;
                break;
              }

              return _context.abrupt("return", res);

            case 21:
              return _context.abrupt("return", {
                errcode: '0000',
                data: {
                  cryptType: cryptType,
                  alg: alg,
                  cert: cert
                }
              });

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function validateLogin(_x) {
      return _validateLogin.apply(this, arguments);
    }

    return validateLogin;
  }(),
  setConfirmPass: function setConfirmPass(confirmPasswd) {
    this.confirmPasswd = confirmPasswd;
  },
  login: function () {
    var _login = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var passwd,
          ptPasswd,
          access_token,
          opt,
          validateRes,
          _validateRes$data,
          cryptType,
          alg,
          cert,
          clientHelloRes,
          taxNo,
          clientHello,
          headersJson,
          res1,
          _res1$data,
          ymbb,
          baseUrl,
          govVersionInt,
          serverPacket,
          serverRandom,
          resAuthCodeData,
          sbhData,
          clientAuthCode,
          sbh,
          res2,
          _res2$data,
          skssq,
          gxrqfw,
          companyName,
          companyType,
          resInfo,
          _args2 = arguments;

      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              passwd = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : '';
              ptPasswd = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : '';
              access_token = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : this.access_token;
              opt = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {};
              this.passwd = passwd || this.passwd;
              this.ptPasswd = ptPasswd || this.ptPasswd;
              passwd = this.passwd;

              if (!(passwd == '')) {
                _context2.next = 9;
                break;
              }

              return _context2.abrupt("return", {
                errcode: '80401',
                description: 'CA密码不能为空'
              });

            case 9:
              _context2.next = 11;
              return this.validateLogin(passwd);

            case 11:
              validateRes = _context2.sent;

              if (!(validateRes.errcode !== '0000')) {
                _context2.next = 14;
                break;
              }

              return _context2.abrupt("return", validateRes);

            case 14:
              _validateRes$data = validateRes.data, cryptType = _validateRes$data.cryptType, alg = _validateRes$data.alg, cert = _validateRes$data.cert; // const taxInfo = await this.diskOperate.getTaxInfoFromDisk(passwd, 71, this.operateUrl);

              if (!(cryptType == 0)) {
                _context2.next = 21;
                break;
              }

              _context2.next = 18;
              return _diskApi__WEBPACK_IMPORTED_MODULE_2__["getClientHello"](passwd, this.operateUrl, alg);

            case 18:
              clientHelloRes = _context2.sent;
              _context2.next = 24;
              break;

            case 21:
              _context2.next = 23;
              return this.diskOperate.getClientHello(passwd, this.operateUrl);

            case 23:
              clientHelloRes = _context2.sent;

            case 24:
              if (!(clientHelloRes.errcode !== '0000')) {
                _context2.next = 26;
                break;
              }

              return _context2.abrupt("return", clientHelloRes);

            case 26:
              taxNo = cert; //获取成功后，税盘税号

              clientHello = clientHelloRes.data;
              headersJson = {
                'Content-Type': 'application/json'
              };

              if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.param_sign) {
                headersJson['x-csrf-token'] = window.__INITIAL_STATE__.param_sign;
              }

              _context2.next = 32;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: access_token ? this.firstLoginUrl + '?access_token=' + access_token : this.firstLoginUrl,
                timeout: 60000,
                method: 'POST',
                headers: headersJson,
                data: _objectSpread({
                  alg: alg,
                  taxNo: taxNo,
                  clientHello: clientHello
                }, opt)
              });

            case 32:
              res1 = _context2.sent;

              if (!(res1.errcode !== '0000')) {
                _context2.next = 35;
                break;
              }

              return _context2.abrupt("return", res1);

            case 35:
              _res1$data = res1.data, ymbb = _res1$data.ymbb, baseUrl = _res1$data.baseUrl, govVersionInt = _res1$data.govVersionInt, serverPacket = _res1$data.serverPacket, serverRandom = _res1$data.serverRandom;
              this.govVersionInt = govVersionInt;

              if (!(cryptType == 0)) {
                _context2.next = 43;
                break;
              }

              _context2.next = 40;
              return _diskApi__WEBPACK_IMPORTED_MODULE_2__["getClientAuthCode"](passwd, serverPacket, this.operateUrl, alg);

            case 40:
              resAuthCodeData = _context2.sent;
              _context2.next = 46;
              break;

            case 43:
              _context2.next = 45;
              return this.diskOperate.getClientAuthCode(passwd, serverPacket, this.operateUrl);

            case 45:
              resAuthCodeData = _context2.sent;

            case 46:
              if (!(resAuthCodeData.errcode !== '0000')) {
                _context2.next = 48;
                break;
              }

              return _context2.abrupt("return", resAuthCodeData);

            case 48:
              if (!(cryptType == 0)) {
                _context2.next = 54;
                break;
              }

              _context2.next = 51;
              return _diskApi__WEBPACK_IMPORTED_MODULE_2__["getTaxInfoFromDisk"](passwd, 70, this.operateUrl, alg);

            case 51:
              sbhData = _context2.sent;
              _context2.next = 57;
              break;

            case 54:
              _context2.next = 56;
              return this.diskOperate.getTaxInfoFromDisk(passwd, 70, this.operateUrl);

            case 56:
              sbhData = _context2.sent;

            case 57:
              if (!(sbhData.errcode !== '0000')) {
                _context2.next = 59;
                break;
              }

              return _context2.abrupt("return", sbhData);

            case 59:
              clientAuthCode = resAuthCodeData.data;
              sbh = sbhData.data;
              _context2.next = 63;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: access_token ? this.secondLoginUrl + '?access_token=' + access_token : this.secondLoginUrl,
                timeout: defaultTimeout,
                method: 'POST',
                headers: headersJson,
                data: _objectSpread({
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

            case 63:
              res2 = _context2.sent;

              if (!(res2.errcode === '0000')) {
                _context2.next = 75;
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
              setCookie('govToken-' + this.baseTaxNo, 'govToken', govCacheSeconds); //失效控制

              setCache('loginGovInfo-' + this.baseTaxNo, this.loginGovInfo, 'localStorage');
              resInfo = _objectSpread(_objectSpread({}, res2), {}, {
                data: _objectSpread(_objectSpread({}, res2.data), {}, {
                  taxNo: taxNo
                })
              });

              if (typeof this.onLoginSuccess === 'function') {
                this.onLoginSuccess(resInfo);
              }

              return _context2.abrupt("return", resInfo);

            case 75:
              return _context2.abrupt("return", res2);

            case 76:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function login() {
      return _login.apply(this, arguments);
    }

    return login;
  }(),
  holiCommonRequest: function () {
    var _holiCommonRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(url) {
      var opt,
          res,
          _args3 = arguments;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              opt = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
              _context3.prev = 1;
              _context3.next = 4;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: url,
                timeout: defaultTimeout,
                data: opt,
                method: 'POST'
              });

            case 4:
              res = _context3.sent;
              return _context3.abrupt("return", res);

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](1);
              return _context3.abrupt("return", {
                errcode: 'arr',
                description: '请求异常，请稍后再试！'
              });

            case 11:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[1, 8]]);
    }));

    function holiCommonRequest(_x2) {
      return _holiCommonRequest.apply(this, arguments);
    }

    return holiCommonRequest;
  }(),
  commonRequest: function () {
    var _commonRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(url) {
      var opt,
          holiRes,
          _opt$passwd,
          passwd,
          _opt$ptPasswd,
          ptPasswd,
          urlArr,
          access_token,
          res,
          _args4 = arguments;

      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              opt = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {};

              if (!(this.fpdkType === 2)) {
                _context4.next = 6;
                break;
              }

              _context4.next = 4;
              return this.holiCommonRequest(url, opt);

            case 4:
              holiRes = _context4.sent;
              return _context4.abrupt("return", holiRes);

            case 6:
              _opt$passwd = opt.passwd, passwd = _opt$passwd === void 0 ? this.passwd : _opt$passwd, _opt$ptPasswd = opt.ptPasswd, ptPasswd = _opt$ptPasswd === void 0 ? this.ptPasswd : _opt$ptPasswd;
              urlArr = url.split('?');
              access_token = '';

              if (urlArr.length === 2) {
                access_token = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["urlHandler"].urlSearch(urlArr[1]).access_token;
              }

              _context4.prev = 10;
              _context4.next = 13;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
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
              _context4.t0 = _context4["catch"](10);
              return _context4.abrupt("return", {
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

              return _context4.abrupt("return", res);

            case 30:
              _context4.prev = 30;
              _context4.next = 33;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
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
              _context4.t1 = _context4["catch"](30);
              return _context4.abrupt("return", {
                errcode: 'arr',
                description: '请求异常，请稍后再试！'
              });

            case 39:
              return _context4.abrupt("return", res);

            case 40:
              _context4.next = 43;
              break;

            case 42:
              return _context4.abrupt("return", res);

            case 43:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this, [[10, 16], [30, 36]]);
    }));

    function commonRequest(_x3) {
      return _commonRequest.apply(this, arguments);
    }

    return commonRequest;
  }(),
  holiTaxQueryInvoices: function () {
    var _holiTaxQueryInvoices = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(url, opt) {
      var continueFlag, clientType, stepFinish, goOn, stepFinishHanlder, _opt$serialNo, serialNo, _opt$versionNo, versionNo, _opt$dataIndex, dataIndex, searchOpt, _opt$dataFromIndex, dataFromIndex, _opt$dataFrom, dataFrom, otherOpt, res;

      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              continueFlag = opt.continueFlag, clientType = opt.clientType, stepFinish = opt.stepFinish;
              goOn = typeof continueFlag === 'undefined' ? true : continueFlag; //连续请求标志

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
                      queryArgs: typeof stepRes.queryArgs === 'undefined' ? _objectSpread(_objectSpread({
                        //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                        searchOpt: opt.searchOpt,
                        dataFrom: dataFrom || '',
                        dataFromIndex: dataFromIndex,
                        dataIndex: dataIndex
                      }, otherOpt), {}, {
                        name: name
                      }) : stepRes.queryArgs
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }
              };

              _opt$serialNo = opt.serialNo, serialNo = _opt$serialNo === void 0 ? '' : _opt$serialNo, _opt$versionNo = opt.versionNo, versionNo = _opt$versionNo === void 0 ? '' : _opt$versionNo, _opt$dataIndex = opt.dataIndex, dataIndex = _opt$dataIndex === void 0 ? 0 : _opt$dataIndex, searchOpt = opt.searchOpt, _opt$dataFromIndex = opt.dataFromIndex, dataFromIndex = _opt$dataFromIndex === void 0 ? 0 : _opt$dataFromIndex, _opt$dataFrom = opt.dataFrom, dataFrom = _opt$dataFrom === void 0 ? '' : _opt$dataFrom, otherOpt = _objectWithoutProperties(opt, _excluded);

            case 4:
              _context5.next = 6;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: url,
                timeout: defaultTimeout,
                data: _objectSpread(_objectSpread({
                  continueFlag: continueFlag,
                  serialNo: serialNo,
                  clientType: clientType,
                  versionNo: versionNo,
                  dataIndex: dataIndex,
                  dataFromIndex: dataFromIndex,
                  dataFrom: dataFrom
                }, otherOpt), {}, {
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
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    function holiTaxQueryInvoices(_x4, _x5) {
      return _holiTaxQueryInvoices.apply(this, arguments);
    }

    return holiTaxQueryInvoices;
  }(),
  queryInvoices: function () {
    var _queryInvoices = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(url, opt) {
      var res1, continueFlag, clientType, stepFinish, _opt$passwd2, passwd, _opt$ptPasswd2, ptPasswd, goOn, res, name, _opt$serialNo2, serialNo, _opt$versionNo2, versionNo, _opt$dataIndex2, dataIndex, searchOpt, _opt$dataFromIndex2, dataFromIndex, _opt$dataFrom2, dataFrom, otherOpt, urlArr, access_token, stepFinishHanlder;

      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
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
              return _context6.abrupt("return", res1);

            case 5:
              continueFlag = opt.continueFlag, clientType = opt.clientType, stepFinish = opt.stepFinish, _opt$passwd2 = opt.passwd, passwd = _opt$passwd2 === void 0 ? this.passwd : _opt$passwd2, _opt$ptPasswd2 = opt.ptPasswd, ptPasswd = _opt$ptPasswd2 === void 0 ? this.ptPasswd : _opt$ptPasswd2;
              goOn = typeof continueFlag === 'undefined' ? true : continueFlag; //连续请求标志

              name = '--';
              _opt$serialNo2 = opt.serialNo, serialNo = _opt$serialNo2 === void 0 ? '' : _opt$serialNo2, _opt$versionNo2 = opt.versionNo, versionNo = _opt$versionNo2 === void 0 ? '' : _opt$versionNo2, _opt$dataIndex2 = opt.dataIndex, dataIndex = _opt$dataIndex2 === void 0 ? 0 : _opt$dataIndex2, searchOpt = opt.searchOpt, _opt$dataFromIndex2 = opt.dataFromIndex, dataFromIndex = _opt$dataFromIndex2 === void 0 ? 0 : _opt$dataFromIndex2, _opt$dataFrom2 = opt.dataFrom, dataFrom = _opt$dataFrom2 === void 0 ? '' : _opt$dataFrom2, otherOpt = _objectWithoutProperties(opt, _excluded2);
              urlArr = url.split('?');
              access_token = '';

              if (urlArr.length === 2) {
                access_token = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["urlHandler"].urlSearch(urlArr[1]).access_token;
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
                      queryArgs: typeof stepRes.queryArgs === 'undefined' ? _objectSpread(_objectSpread({
                        //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                        searchOpt: opt.searchOpt,
                        dataFrom: dataFrom || '',
                        dataFromIndex: dataFromIndex,
                        dataIndex: dataIndex
                      }, otherOpt), {}, {
                        name: name
                      }) : stepRes.queryArgs
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }
              };

            case 13:
              _context6.next = 15;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: url,
                timeout: defaultTimeout,
                data: _objectSpread(_objectSpread({
                  continueFlag: continueFlag,
                  serialNo: serialNo,
                  clientType: clientType,
                  versionNo: versionNo,
                  dataIndex: dataIndex,
                  dataFromIndex: dataFromIndex,
                  dataFrom: dataFrom
                }, otherOpt), {}, {
                  searchOpt: searchOpt
                }),
                method: 'POST'
              });

            case 15:
              res = _context6.sent;

              if (!(res.errcode === '91300')) {
                _context6.next = 31;
                break;
              }

              clearCookie('govToken-' + this.baseTaxNo);
              clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
              _context6.next = 21;
              return this.login(passwd, ptPasswd, access_token);

            case 21:
              res = _context6.sent;

              if (!(res.errcode !== '0000')) {
                _context6.next = 25;
                break;
              }

              stepFinishHanlder(res);
              return _context6.abrupt("break", 34);

            case 25:
              _context6.next = 27;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: url,
                timeout: defaultTimeout,
                data: _objectSpread(_objectSpread({
                  continueFlag: continueFlag,
                  serialNo: serialNo,
                  clientType: clientType,
                  versionNo: versionNo,
                  dataIndex: dataIndex,
                  dataFromIndex: dataFromIndex,
                  dataFrom: dataFrom
                }, otherOpt), {}, {
                  searchOpt: searchOpt
                }),
                method: 'POST'
              });

            case 27:
              res = _context6.sent;
              stepFinishHanlder(res);
              _context6.next = 32;
              break;

            case 31:
              stepFinishHanlder(res);

            case 32:
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

            case 33:
              if (goOn) {
                _context6.next = 13;
                break;
              }

            case 34:
              return _context6.abrupt("return", res);

            case 35:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function queryInvoices(_x6, _x7) {
      return _queryInvoices.apply(this, arguments);
    }

    return queryInvoices;
  }(),
  gxInvoices: function () {
    var _gxInvoices = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(url, opt) {
      var res;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!(this.fpdkType === 2)) {
                _context7.next = 6;
                break;
              }

              _context7.next = 3;
              return this.holiCommonRequest(url, opt);

            case 3:
              res = _context7.sent;
              _context7.next = 9;
              break;

            case 6:
              _context7.next = 8;
              return this.commonRequest(url, opt);

            case 8:
              res = _context7.sent;

            case 9:
              return _context7.abrupt("return", res);

            case 10:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function gxInvoices(_x8, _x9) {
      return _gxInvoices.apply(this, arguments);
    }

    return gxInvoices;
  }(),
  bdkGxInvoices: function () {
    var _bdkGxInvoices = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(url, opt) {
      var res;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (!(this.fpdkType === 2)) {
                _context8.next = 6;
                break;
              }

              _context8.next = 3;
              return this.holiCommonRequest(url, opt);

            case 3:
              res = _context8.sent;
              _context8.next = 9;
              break;

            case 6:
              _context8.next = 8;
              return this.commonRequest(url, opt);

            case 8:
              res = _context8.sent;

            case 9:
              return _context8.abrupt("return", res);

            case 10:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function bdkGxInvoices(_x10, _x11) {
      return _bdkGxInvoices.apply(this, arguments);
    }

    return bdkGxInvoices;
  }(),
  _gxConfirmTwo: function () {
    var _gxConfirmTwo2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(url, opt) {
      var res;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return this.commonRequest(url, opt);

            case 2:
              res = _context9.sent;
              return _context9.abrupt("return", res);

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function _gxConfirmTwo(_x12, _x13) {
      return _gxConfirmTwo2.apply(this, arguments);
    }

    return _gxConfirmTwo;
  }(),
  gxConfirm: function () {
    var _gxConfirm = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(url) {
      var opt,
          resHoli,
          _opt$sbzt,
          sbzt,
          _this$loginGovInfo,
          cryptType,
          alg,
          res,
          _res,
          _res$data,
          _res$data$tjsjstr,
          tjsjstr,
          _res$data$signKey,
          signKey2,
          _res$data$tjInfo,
          tjInfo,
          _res$data$taxPeriod,
          taxPeriod,
          tjsjsign,
          obj,
          _args10 = arguments;

      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              opt = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : {};

              if (!(this.fpdkType === 2)) {
                _context10.next = 6;
                break;
              }

              _context10.next = 4;
              return this.holiCommonRequest(url, opt);

            case 4:
              resHoli = _context10.sent;
              return _context10.abrupt("return", resHoli);

            case 6:
              _opt$sbzt = opt.sbzt, sbzt = _opt$sbzt === void 0 ? '' : _opt$sbzt;
              _this$loginGovInfo = this.loginGovInfo, cryptType = _this$loginGovInfo.cryptType, alg = _this$loginGovInfo.alg;

              if (!(this.govVersionInt < 4000)) {
                _context10.next = 15;
                break;
              }

              _context10.next = 11;
              return this.commonRequest(url, {
                sbzt: sbzt
              });

            case 11:
              res = _context10.sent;
              return _context10.abrupt("return", res);

            case 15:
              _context10.next = 17;
              return this.commonRequest(url, {});

            case 17:
              _res = _context10.sent;

              if (!(_res.errcode !== '0000')) {
                _context10.next = 20;
                break;
              }

              return _context10.abrupt("return", _res);

            case 20:
              _res$data = _res.data, _res$data$tjsjstr = _res$data.tjsjstr, tjsjstr = _res$data$tjsjstr === void 0 ? '' : _res$data$tjsjstr, _res$data$signKey = _res$data.signKey2, signKey2 = _res$data$signKey === void 0 ? '' : _res$data$signKey, _res$data$tjInfo = _res$data.tjInfo, tjInfo = _res$data$tjInfo === void 0 ? '' : _res$data$tjInfo, _res$data$taxPeriod = _res$data.taxPeriod, taxPeriod = _res$data$taxPeriod === void 0 ? '' : _res$data$taxPeriod;
              tjsjsign = '';

              if (!(cryptType == 0)) {
                _context10.next = 29;
                break;
              }

              _context10.next = 25;
              return _diskApi__WEBPACK_IMPORTED_MODULE_2__["signDataApi"](tjsjstr + signKey2, this.passwd, true, alg, this.operateUrl);

            case 25:
              obj = _context10.sent;

              if (obj.errcode === '0000') {
                tjsjsign = obj.data;
              }

              _context10.next = 32;
              break;

            case 29:
              _context10.next = 31;
              return this.diskOperate.signDataApi(tjsjstr + signKey2, this.passwd, '', 0x400000, this.operateUrl);

            case 31:
              tjsjsign = _context10.sent;

            case 32:
              if (!(tjsjstr && tjsjsign && tjInfo)) {
                _context10.next = 38;
                break;
              }

              _context10.next = 35;
              return this._gxConfirmTwo(url, _objectSpread(_objectSpread({}, opt), {}, {
                tjsjstr: tjsjstr,
                tjsjsign: tjsjsign,
                tjInfo: tjInfo,
                taxPeriod: taxPeriod,
                password: this.confirmPasswd
              }));

            case 35:
              return _context10.abrupt("return", _context10.sent);

            case 38:
              return _context10.abrupt("return", {
                errcode: '82345',
                description: '获取签名确认数据异常'
              });

            case 39:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function gxConfirm(_x14) {
      return _gxConfirm.apply(this, arguments);
    }

    return gxConfirm;
  }(),
  jxxDownloadApply: function () {
    var _jxxDownloadApply = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(url, opt) {
      var continueFlag, stepFinish, _opt$passwd3, passwd, _opt$ptPasswd3, ptPasswd, searchOpt, res, index, goOn, urlArr, access_token, stepFinishHanlder;

      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              continueFlag = opt.continueFlag, stepFinish = opt.stepFinish, _opt$passwd3 = opt.passwd, passwd = _opt$passwd3 === void 0 ? this.passwd : _opt$passwd3, _opt$ptPasswd3 = opt.ptPasswd, ptPasswd = _opt$ptPasswd3 === void 0 ? this.ptPasswd : _opt$ptPasswd3, searchOpt = opt.searchOpt;
              index = opt.index || 0;
              goOn = typeof continueFlag === 'undefined' ? true : continueFlag; //连续请求标志

              urlArr = url.split('?');
              access_token = '';

              if (urlArr.length === 2) {
                access_token = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["urlHandler"].urlSearch(urlArr[1]).access_token;
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
                        //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                        searchOpt: opt.searchOpt,
                        index: opt.index
                      } : stepRes.queryArgs
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }
              };

            case 7:
              _context11.next = 9;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: url,
                timeout: defaultTimeout,
                data: {
                  continueFlag: continueFlag,
                  index: index,
                  searchOpt: searchOpt
                },
                method: 'POST'
              });

            case 9:
              res = _context11.sent;

              if (!(res.errcode === '91300')) {
                _context11.next = 25;
                break;
              }

              clearCookie('govToken-' + this.baseTaxNo);
              clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
              _context11.next = 15;
              return this.login(passwd, ptPasswd, access_token);

            case 15:
              res = _context11.sent;

              if (!(res.errcode !== '0000')) {
                _context11.next = 19;
                break;
              }

              stepFinishHanlder(res);
              return _context11.abrupt("break", 28);

            case 19:
              _context11.next = 21;
              return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_0__["kdRequest"])({
                url: url,
                timeout: defaultTimeout,
                data: {
                  continueFlag: continueFlag,
                  index: index,
                  searchOpt: searchOpt
                },
                method: 'POST'
              });

            case 21:
              res = _context11.sent;
              stepFinishHanlder(res);
              _context11.next = 26;
              break;

            case 25:
              stepFinishHanlder(res);

            case 26:
              if (typeof res.nextIndex !== 'undefined') {
                if (res.endFlag) {
                  goOn = false;
                } else {
                  index = res.nextIndex || 0;
                }
              } else {
                goOn = false;
              }

            case 27:
              if (goOn) {
                _context11.next = 7;
                break;
              }

            case 28:
              return _context11.abrupt("return", res);

            case 29:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function jxxDownloadApply(_x15, _x16) {
      return _jxxDownloadApply.apply(this, arguments);
    }

    return jxxDownloadApply;
  }(),
  getDownloadList: function () {
    var _getDownloadList = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(url, opt) {
      var _opt$fplx, fplx, _opt$sjlx, sjlx, _opt$sqrqq, sqrqq, _opt$sqrqz, sqrqz, pageSize, res;

      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _opt$fplx = opt.fplx, fplx = _opt$fplx === void 0 ? 0 : _opt$fplx, _opt$sjlx = opt.sjlx, sjlx = _opt$sjlx === void 0 ? 0 : _opt$sjlx, _opt$sqrqq = opt.sqrqq, sqrqq = _opt$sqrqq === void 0 ? '' : _opt$sqrqq, _opt$sqrqz = opt.sqrqz, sqrqz = _opt$sqrqz === void 0 ? '' : _opt$sqrqz, pageSize = opt.pageSize;

              if (!(this.govVersionInt < 4000)) {
                _context12.next = 3;
                break;
              }

              return _context12.abrupt("return", {
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
              return _context12.abrupt("return", res);

            case 7:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    }));

    function getDownloadList(_x17, _x18) {
      return _getDownloadList.apply(this, arguments);
    }

    return getDownloadList;
  }(),
  downloadWithPath: function () {
    var _downloadWithPath = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(url, opt) {
      var jymm, res;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              jymm = opt.jymm;

              if (!(this.govVersionInt < 4000)) {
                _context13.next = 3;
                break;
              }

              return _context13.abrupt("return", {
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
              return _context13.abrupt("return", res);

            case 7:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    }));

    function downloadWithPath(_x19, _x20) {
      return _downloadWithPath.apply(this, arguments);
    }

    return downloadWithPath;
  }()
};

/***/ })
/******/ ]);
});
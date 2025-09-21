(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ScanFiles"] = factory();
	else
		root["ScanFiles"] = factory();
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
/***/ (function(module, exports, __webpack_require__) {

var CkScanFile = __webpack_require__(1);

var scanFilesV2 = __webpack_require__(136);

module.exports = {
  scanFilesOld: CkScanFile["default"],
  scanFiles: scanFilesV2["default"]
};

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _JsScanner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var async__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var async__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(async__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(132);
/* harmony import */ var _piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_3__);
var _excluded = ["data"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





var syncUse = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_2__["loadJs"].syncUse;

var CkScanFile = /*#__PURE__*/_createClass(function CkScanFile(opt) {
  var _this = this;

  _classCallCheck(this, CkScanFile);

  _defineProperty(this, "startScan", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
      var _options$data, data, otherOpt, redirectUpload, _otherOpt$filename, filename, _otherOpt$sourceInfo, sourceInfo, _otherOpt$addUploadPr, addUploadProgress, _otherOpt$stepUploadS, stepUploadStart, _otherOpt$stepUploadF, stepUploadFinish, _otherOpt$uploadFinis, uploadFinish, _otherOpt$onConnected, onConnected, scannerOptions, sourceName, syncCallBackParams, sourceCallbackParams;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _options$data = options.data, data = _options$data === void 0 ? {} : _options$data, otherOpt = _objectWithoutProperties(options, _excluded);
              redirectUpload = otherOpt.redirectUpload, _otherOpt$filename = otherOpt.filename, filename = _otherOpt$filename === void 0 ? 'file' : _otherOpt$filename, _otherOpt$sourceInfo = otherOpt.sourceInfo, sourceInfo = _otherOpt$sourceInfo === void 0 ? {
                sourceName: '',
                sourceIndex: 0
              } : _otherOpt$sourceInfo, _otherOpt$addUploadPr = otherOpt.addUploadProgress, addUploadProgress = _otherOpt$addUploadPr === void 0 ? function () {} : _otherOpt$addUploadPr, _otherOpt$stepUploadS = otherOpt.stepUploadStart, stepUploadStart = _otherOpt$stepUploadS === void 0 ? function () {} : _otherOpt$stepUploadS, _otherOpt$stepUploadF = otherOpt.stepUploadFinish, stepUploadFinish = _otherOpt$stepUploadF === void 0 ? function () {} : _otherOpt$stepUploadF, _otherOpt$uploadFinis = otherOpt.uploadFinish, uploadFinish = _otherOpt$uploadFinis === void 0 ? function () {} : _otherOpt$uploadFinis, _otherOpt$onConnected = otherOpt.onConnected, onConnected = _otherOpt$onConnected === void 0 ? function () {} : _otherOpt$onConnected;
              _this.sourceInfo = sourceInfo; // 扫描源信息,sourceName,sourceIndex

              _this.filename = filename;
              _this.onConnected = onConnected;
              _this.addUploadProgress = addUploadProgress;
              _this.stepUploadStart = stepUploadStart;
              _this.stepUploadFinish = stepUploadFinish;
              _this.uploadFinish = uploadFinish;
              _this.data = data; // 初始化sdk

              scannerOptions = {
                API_URL: _this.scannerApiUrl
              };
              _this.scanner = new _JsScanner__WEBPACK_IMPORTED_MODULE_0__["default"](scannerOptions);
              sourceName = _this.sourceInfo.sourceName;
              syncCallBackParams = {};
              sourceCallbackParams = {};

              if (sourceName) {
                _this.AcquireSync(sourceName, syncCallBackParams);
              } else {
                _this.GetDataSources(sourceCallbackParams); // 未指定扫描源错误
                // this.uploadFinish({ errcode: '1405', description: '扫描异常' });

              }

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "GetDataSources", function (otherParams) {
    _this.scanner.GetDataSources(_this.onGetSourcesCompleted, otherParams);
  });

  _defineProperty(this, "onGetSourcesCompleted", function (json, params) {
    if (json.ErrorCode != 0) {
      _this.onScanError(json); // 抛出异常


      return;
    } // 第一次点击


    _this.scannerSources = json.Sources; // 如果只有一个扫描仪,自动选择.直接开始扫描

    if (json.Sources.length == 1) {
      _this.AcquireSync(json.Sources[0]);
    }

    _this.onConnected(_this.scannerSources);

    _this.debug && console.log('GetSourcesCompleted', json.Sources);
  });

  _defineProperty(this, "AcquireSync", function (prdName, otherParams) {
    // 同步扫描
    var isBlank = _this.ifDuplexEnabled ? 1 : 0;

    if (_this.isSync) {
      _this.scanner.AcquireSync(prdName, _this.duplex, _this.color, _this.resolution, _this.format, isBlank, _this.onAcquireSyncCompleted, otherParams);
    } else {
      // 异步扫描
      var res = _this.scanner.AcquireAsync(prdName, _this.duplex, _this.color, _this.resolution, _this.format, isBlank);

      _this.hasUploadCount = 0;

      _this.asyncPathsMap.clear();

      _this.totalImages = 0;

      if (res.ErrorCode != 0) {
        _this.onScanError(res); // 抛出异常


        return;
      }

      if (res.Guid) {
        _this.timer = setInterval(function () {
          _this.QueryResult(res.Guid);
        }, _this.qureyDelay);
        _this.timer2 = setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _this.checkFile(res.Guid);

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        })), _this.checkDelay);
      }
    }
  });

  _defineProperty(this, "onAcquireSyncCompleted", /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(json, otherParams) {
      var i, len;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(json.ErrorCode != 0)) {
                _context3.next = 3;
                break;
              }

              _this.onScanError(json); // 抛出异常


              return _context3.abrupt("return");

            case 3:
              // 第一次点击
              _this.totalFiles = json.Paths.length;
              _this.otherParams = null;
              i = 0, len = json.Paths.length;

            case 6:
              if (!(i < len)) {
                _context3.next = 12;
                break;
              }

              _context3.next = 9;
              return _this.GetFileSync(json.Paths[i], otherParams);

            case 9:
              i++;
              _context3.next = 6;
              break;

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x2, _x3) {
      return _ref3.apply(this, arguments);
    };
  }());

  _defineProperty(this, "GetFileSync", function (path, otherParams) {
    return new Promise(function (resolve, reject) {
      _this.scanner.GetFileSync(path, function (json, otherParams) {
        if (json.ErrorCode !== 0) {
          // 抛出异常
          _this.onScanError(json);

          return;
        }

        _this.fileIndex++; // 转换完成

        var base64str = json.Base64String;

        var fileUid = _this.getUUId();

        var filename = fileUid + '-' + _this.fileIndex + '.jpg';

        var file = _this.base64ToFile(base64str, filename);

        var fileInfo = {
          name: filename,
          index: _this.fileIndex,
          status: 'init',
          id: fileUid,
          errcode: '0000',
          description: 'success',
          file: file,
          localUrl: 'data:image/jpg;base64,' + base64str,
          qrcodeResult: ''
        };

        _this.fileList.push(fileInfo);

        _this.fileIds.push(fileUid); // 记录文件id


        if (typeof _this.addUploadProgress === 'function') {
          _this.addUploadProgress(fileInfo);
        } // 文件全部转换完成-同步


        if (_this.fileIndex == _this.totalFiles - 1) {
          _this.handleStepUploadStart();
        }

        resolve();
      }, otherParams);
    });
  });

  _defineProperty(this, "QueryResult", /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(guid) {
      var res, Status, Files, Data;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              res = _this.scanner.QueryResult(guid);
              Status = res.Status, Files = res.Files, Data = res.Data;

              if (_this.isNext && Files.length) {
                // console.log('this.curIndex-before', this.curIndex);
                // console.log('Files-before', Files);
                _this.processFile = Files.slice(_this.curIndex);
                _this.curIndex += _this.processFile.length;
                _this.isNext = false; // console.log('this.curIndex-after', this.curIndex);
                // console.log('this.processFile', this.processFile);
              }

              if (Status == 2) {
                // 全部扫描完成
                // 总数
                console.log('已上传张数, 总文件数Files', _this.hasUploadCount, Files.length);
                _this.totalImages = Files.length;
                _this.mermoryFilePaths = Files; // 缺纸 {"Status":2,"Format":"jpg","Files":[],"Data":{"Paths":[],"ErrorCode":7,"ErrorType":2,"ErrorDescription":"This data source cannot open","Command":"Acquire"}}
                // 卡纸 {"Status":2,"Format":"jpg","Files":[],"Data":{"Paths":null,"ErrorCode":10,"ErrorType":2,"ErrorDescription":"Scan process shut down by unknown error","Command":"Unknown"}}

                clearInterval(_this.timer);

                if (Data) {
                  if (Data.ErrorCode == 7) {
                    _this.scanErrorDescription = '扫描仪缺纸，请检查！';
                  } else if (Data.ErrorCode == 10) {
                    _this.scanErrorDescription = '扫描仪卡纸，请检查！';
                  }
                }
              }

            case 4:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());

  _defineProperty(this, "checkFile", /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(guid) {
      var curIndex, stepGetFile;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (_this.isContinue && _this.curIndex < _this.mermoryFilePaths.length) {
                _this.processFile = _this.mermoryFilePaths.slice(_this.curIndex);
                _this.curIndex += _this.processFile.length;
              }

              if (!(_this.totalImages != 0 && _this.hasUploadCount >= _this.totalImages || _this.scanErrorDescription && _this.hasUploadCount >= _this.totalImages)) {
                _context6.next = 14;
                break;
              }

              clearInterval(_this.timer2);

              try {
                _this.uploadFinish({
                  errcode: _this.scanErrorDescription ? '5000' : '0000',
                  description: _this.scanErrorDescription || 'success',
                  data: {
                    imagesNum: _this.hasUploadCount
                  }
                });
              } catch (err) {
                console.warn(err);
              }

              _this.hasUploadCount = 0;

              _this.asyncPathsMap.clear();

              _this.processFile = [];
              _this.isNext = true;
              _this.curIndex = 0;
              _this.mermoryFilePaths = [];
              _this.scanErrorDescription = '';

              _this.scanner.DeleteAcquireFiles(guid);

              console.log('全部上传完成,重置部分数据');
              return _context6.abrupt("return");

            case 14:
              if (_this.processFile.length && _this.isContinue) {
                _this.isContinue = false;
                curIndex = 0;

                stepGetFile = /*#__PURE__*/function () {
                  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(curIndex) {
                    var res, base64str, fileUid, filename, file, fileInfo;
                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return _this.AwaitGetFileAsyncByPath(guid, _this.processFile[curIndex]);

                          case 3:
                            res = _context5.sent;

                            if (!(res.ErrorCode !== 0)) {
                              _context5.next = 7;
                              break;
                            }

                            // 抛出异常
                            _this.onScanError(res);

                            return _context5.abrupt("return");

                          case 7:
                            _this.fileIndex++; // 转换完成

                            base64str = res.Base64String;
                            fileUid = _this.getUUId();
                            filename = fileUid + '-' + _this.fileIndex + '.jpg';
                            file = _this.base64ToFile(base64str, filename);
                            fileInfo = {
                              name: filename,
                              index: _this.fileIndex,
                              status: 'init',
                              id: fileUid,
                              errcode: '0000',
                              description: 'success',
                              file: file,
                              localUrl: 'data:image/jpg;base64,' + base64str,
                              qrcodeResult: ''
                            }; // 异步

                            _context5.next = 15;
                            return _this.handleAsyncUpload(fileInfo, _this.processFile[curIndex]);

                          case 15:
                            // console.log('上传完成');
                            curIndex++;

                            if (curIndex < _this.processFile.length) {
                              stepGetFile(curIndex);
                            } else {
                              _this.isNext = true;
                              _this.isContinue = true;
                            }

                            _context5.next = 23;
                            break;

                          case 19:
                            _context5.prev = 19;
                            _context5.t0 = _context5["catch"](0);
                            console.error('上传错误，sdk无响应', _context5.t0); // 重试一次，记录未上传成功的path和index。后续进行插入。
                            // this.noResponseFiles.push({
                            //     index: curIndex,
                            //     filePath: this.processFile[curIndex],
                            //     guid: '',
                            // });

                            if (curIndex < _this.processFile.length) {
                              stepGetFile(curIndex);
                            } else {
                              _this.isNext = true;
                              _this.isContinue = true;
                            }

                          case 23:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5, null, [[0, 19]]);
                  }));

                  return function stepGetFile(_x6) {
                    return _ref6.apply(this, arguments);
                  };
                }();

                stepGetFile(curIndex);
              }

            case 15:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  }());

  _defineProperty(this, "AwaitGetFileAsyncByPath", function (guid, key) {
    return new Promise(function (resolve, reject) {
      var fileRes = _this.scanner.GetFileAsyncByPath(guid, key);

      resolve(fileRes);
    });
  });

  _defineProperty(this, "initScanner", function () {
    return new Promise(function (resolve) {
      if (window.CreateConnection) {
        // 加载成功
        resolve({
          errcode: '0000',
          description: 'success'
        });
      } else {
        if (_this.scanFileStaticJs.length == 0) {
          resolve({
            errcode: '1404',
            description: '缺少JsScanner.min.js文件'
          });
        }

        syncUse(_this.scanFileStaticJs, function () {
          if (window.CreateConnection) {
            resolve({
              errcode: '0000',
              description: 'success'
            });
          } else {
            resolve({
              errcode: 'initError',
              description: 'initial fail'
            });
          }
        });
      }
    });
  });

  _defineProperty(this, "GetSourcesCompleted", function (json) {
    if (json.ErrorCode !== 0) {
      _this.onScanError(json); // 抛出异常


      return;
    } // 第一次点击


    _this.scannerSources = json.Sources; // 如果只有一个扫描仪,自动选择.直接开始扫描

    if (json.Sources.length == 1) {
      _this.scanner.Acquire(json.Sources[0], _this.duplex, _this.color, _this.resolution, _this.format);
    }

    _this.onConnected(_this.scannerSources);

    _this.debug && console.log('GetSourcesCompleted', json.Sources);
  });

  _defineProperty(this, "AcquireDataCompleted", function (json) {
    if (json.ErrorCode !== 0) {
      // 抛出异常
      _this.onScanError(json);

      return;
    }

    _this.totalFiles = json.Paths.length;

    for (var i = 0, len = json.Paths.length; i < len; i++) {
      _this.scanner.GetFile(json.Paths[i]);
    }

    _this.debug && console.log('AcquireDataCompleted', json.Paths);
  });

  _defineProperty(this, "GetAsyncFileCompleted", function (json, otherParams) {
    return new Promise( /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
        var base64str, fileUid, filename, file, fileInfo, filePath;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(json.ErrorCode !== 0)) {
                  _context7.next = 3;
                  break;
                }

                // 抛出异常
                _this.onScanError(json);

                return _context7.abrupt("return");

              case 3:
                _this.fileIndex++; // 转换完成

                base64str = json.Base64String;
                fileUid = _this.getUUId();
                filename = fileUid + '-' + _this.fileIndex + '.jpg';
                file = _this.base64ToFile(base64str, filename);
                fileInfo = {
                  name: filename,
                  index: _this.fileIndex,
                  status: 'init',
                  id: fileUid,
                  errcode: '0000',
                  description: 'success',
                  file: file,
                  localUrl: 'data:image/jpg;base64,' + base64str,
                  qrcodeResult: ''
                }; // 异步

                filePath = otherParams.filePath;

                if (!(_this.asyncPathsMap.has(filePath) && _this.asyncPathsMap.get(filePath) == 0)) {
                  _context7.next = 15;
                  break;
                }

                _this.asyncPathsMap.set(filePath, 1); // 待上传


                _context7.next = 14;
                return _this.handleAsyncUpload(fileInfo, filePath);

              case 14:
                resolve();

              case 15:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      return function (_x7, _x8) {
        return _ref7.apply(this, arguments);
      };
    }());
  });

  _defineProperty(this, "GetFileCompleted", /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(json, otherParams) {
      var base64str, fileUid, filename, file, fileInfo, filePath;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (!(json.ErrorCode !== 0)) {
                _context8.next = 3;
                break;
              }

              // 抛出异常
              _this.onScanError(json);

              return _context8.abrupt("return");

            case 3:
              _this.fileIndex++; // 转换完成

              base64str = json.Base64String;
              fileUid = _this.getUUId();
              filename = fileUid + '-' + _this.fileIndex + '.jpg';
              file = _this.base64ToFile(base64str, filename);
              fileInfo = {
                name: filename,
                index: _this.fileIndex,
                status: 'init',
                id: fileUid,
                errcode: '0000',
                description: 'success',
                file: file,
                localUrl: 'data:image/jpg;base64,' + base64str,
                qrcodeResult: ''
              }; // 同步

              if (!_this.isSync) {
                _context8.next = 16;
                break;
              }

              _this.fileList.push(fileInfo);

              _this.fileIds.push(fileUid); // 记录文件id


              if (typeof _this.addUploadProgress === 'function') {
                _this.addUploadProgress(fileInfo);
              } // 文件全部转换完成-同步


              if (_this.fileIndex == _this.totalFiles - 1) {
                _this.handleStepUploadStart();
              }

              _context8.next = 21;
              break;

            case 16:
              // 异步
              filePath = otherParams.filePath;

              if (!(_this.asyncPathsMap.has(filePath) && _this.asyncPathsMap.get(filePath) == 0)) {
                _context8.next = 21;
                break;
              }

              _this.asyncPathsMap.set(filePath, 1); // 待上传


              _context8.next = 21;
              return _this.handleAsyncUpload(fileInfo, filePath);

            case 21:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    return function (_x9, _x10) {
      return _ref8.apply(this, arguments);
    };
  }());

  _defineProperty(this, "GetVersionCompleted", function (version) {
    // console.log('JsScanner-version', version);
    return version;
  });

  _defineProperty(this, "setDuplexEnabled", function (isEnable) {
    if (isEnable) {
      _this.ifDuplexEnabled = true;
      _this.duplex = 1;
    } else {
      _this.ifDuplexEnabled = false;
      _this.duplex = 0;
    }
  });

  _defineProperty(this, "setQrcodeRecognize", function (isEnable) {
    // 防止报错,实际上二维码不进行二维码识别.
    _this.needRegonizeQr = isEnable;
  });

  _defineProperty(this, "setDiscardBlankpages", function () {
    // 丢弃空白页
    return false;
  });

  _defineProperty(this, "scannerSetting", function (options) {
    // 设置扫描参数
    var color = options.color,
        resolution = options.resolution,
        format = options.format;
    _this.color = color !== null && color !== void 0 ? color : _this.color;
    _this.resolution = resolution !== null && resolution !== void 0 ? resolution : _this.resolution;
    _this.format = format !== null && format !== void 0 ? format : _this.format;
  });

  _defineProperty(this, "getUUId", function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
  });

  _defineProperty(this, "base64ToFile", function (base64str, filename) {
    var blob = _this.dataURLtoBlob(base64str);

    var upFile = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_2__["tools"].blobToFile(blob, filename);

    if (upFile) {
      return upFile;
    }

    return _this.blobToFile(blob, filename);
  });

  _defineProperty(this, "dataURLtoBlob", function (dataurl) {
    var bstr = window.atob(dataurl);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {
      type: 'image/jpeg'
    });
  });

  _defineProperty(this, "blobToFile", function (theBlob, fileName) {
    var date = new Date();
    theBlob.lastModified = date.getTime();
    theBlob.lastModifiedDate = date;
    theBlob.name = fileName;
    return theBlob;
  });

  _defineProperty(this, "handleAsyncUpload", function (item, filePath) {
    // 异步扫描上传
    console.log('handleAsyncUpload');
    return new Promise( /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
        var uploadEnable, preRes, res;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                uploadEnable = true;
                preRes = {};
                _context9.next = 4;
                return _this.addUploadProgress(item);

              case 4:
                _context9.prev = 4;
                _context9.next = 7;
                return _this.stepUploadStart(item);

              case 7:
                _context9.t0 = _context9.sent;

                if (_context9.t0) {
                  _context9.next = 10;
                  break;
                }

                _context9.t0 = {};

              case 10:
                preRes = _context9.t0;
                _this.debug && console.log('stepUploadStart', preRes);
                _context9.next = 17;
                break;

              case 14:
                _context9.prev = 14;
                _context9.t1 = _context9["catch"](4);
                console.error('stepUploadStart处理失败：', _context9.t1);

              case 17:
                if (!uploadEnable) {
                  _context9.next = 28;
                  break;
                }

                _context9.next = 20;
                return _this.handlerUpload(preRes, item);

              case 20:
                res = _context9.sent;

                if (preRes.otherData && preRes.otherData.stopStepUpload) {
                  uploadEnable = false;
                }

                if (!res) {
                  _context9.next = 25;
                  break;
                }

                _context9.next = 25;
                return _this.handlerStepUploadFinish(res, item, preRes);

              case 25:
                console.log('当前上传成功', _this.hasUploadCount); // this.asyncPathsMap.set(filePath, 1);

                _this.hasUploadCount++;
                resolve();

              case 28:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, null, [[4, 14]]);
      }));

      return function (_x11, _x12) {
        return _ref9.apply(this, arguments);
      };
    }());
  });

  _defineProperty(this, "handleStepUploadStart", function () {
    var uploadEnable = true;
    _this.debug && console.log('fileList', _this.fileList);
    Object(async__WEBPACK_IMPORTED_MODULE_1__["mapLimit"])(_this.fileList, _this.limit, /*#__PURE__*/function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(item, callback) {
        var preRes, res, _index;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                preRes = {};
                _context10.prev = 1;
                _context10.next = 4;
                return _this.stepUploadStart(item);

              case 4:
                _context10.t0 = _context10.sent;

                if (_context10.t0) {
                  _context10.next = 7;
                  break;
                }

                _context10.t0 = {};

              case 7:
                preRes = _context10.t0;
                _this.debug && console.log('stepUploadStart', preRes);
                _context10.next = 14;
                break;

              case 11:
                _context10.prev = 11;
                _context10.t1 = _context10["catch"](1);
                console.error('stepUploadStart处理失败：', _context10.t1);

              case 14:
                if (!uploadEnable) {
                  _context10.next = 22;
                  break;
                }

                _context10.next = 17;
                return _this.handlerUpload(preRes, item);

              case 17:
                res = _context10.sent;

                if (preRes.otherData && preRes.otherData.stopStepUpload) {
                  uploadEnable = false;
                }

                if (!res) {
                  _context10.next = 22;
                  break;
                }

                _context10.next = 22;
                return _this.handlerStepUploadFinish(res, item, preRes);

              case 22:
                // 排除已经上传的id
                _index = _this.fileIds.findIndex(function (itm) {
                  return itm == item.id;
                });

                _this.fileIds.splice(_index, 1);

                if (_this.fileIds.length == 0) {
                  try {
                    _this.uploadFinish({
                      errcode: '0000',
                      description: 'success',
                      data: {
                        imagesNum: _this.fileList.length
                      }
                    });
                  } catch (err) {
                    console.warn(err);
                  }

                  _this.fileIndex = -1;
                  _this.fileList = [];
                  console.log('全部上传完成,重置部分数据');
                }

                callback(null, {});

              case 26:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, null, [[1, 11]]);
      }));

      return function (_x13, _x14) {
        return _ref10.apply(this, arguments);
      };
    }(), function (err) {
      console.log('扫描仪并发上传错误：', err);
    });
  });

  _defineProperty(this, "handlerUpload", /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(preRes, item) {
      var formData, res, curFile, extraData, key, element, requestParam;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              formData = new FormData();
              _context12.next = 3;
              return Object(_piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_3__["compressImgFile"])(item.file, _this.compressOpt);

            case 3:
              res = _context12.sent;
              curFile = item.file;

              if (res.errcode === '0000') {
                curFile = res.file;
              } // 第三个参数指定filename,在ie11浏览器中,不指定会默认为blob,不带后缀名在eggjs上传时会报错


              formData.append(_this.filename, curFile, item.file.name); // 将this.data与otherData合并.

              extraData = Object.assign(_this.data, preRes.otherData);

              if (extraData) {
                for (key in extraData) {
                  if (Object.hasOwnProperty.call(extraData, key)) {
                    element = extraData[key];
                    formData.append(key, element);
                  }
                }
              }

              requestParam = {
                method: 'post',
                data: formData,
                contentType: 'file',
                headers: _this.headers
              };
              return _context12.abrupt("return", new Promise( /*#__PURE__*/function () {
                var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(resolve, reject) {
                  var res;
                  return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          _context11.next = 2;
                          return Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_2__["pwyFetch"])(_this.uploadUrl, requestParam);

                        case 2:
                          res = _context11.sent;
                          resolve(res);

                        case 4:
                        case "end":
                          return _context11.stop();
                      }
                    }
                  }, _callee11);
                }));

                return function (_x17, _x18) {
                  return _ref12.apply(this, arguments);
                };
              }()));

            case 11:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    }));

    return function (_x15, _x16) {
      return _ref11.apply(this, arguments);
    };
  }());

  _defineProperty(this, "handlerStepUploadFinish", /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(res, item, preRes) {
      var _preRes$otherData, otherData;

      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _preRes$otherData = preRes.otherData, otherData = _preRes$otherData === void 0 ? {} : _preRes$otherData;
              _context13.prev = 1;
              _context13.next = 4;
              return _this.stepUploadFinish(res, item, otherData);

            case 4:
              _context13.next = 9;
              break;

            case 6:
              _context13.prev = 6;
              _context13.t0 = _context13["catch"](1);
              console.error('stepUploadFinish处理失败：', _context13.t0);

            case 9:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, null, [[1, 6]]);
    }));

    return function (_x19, _x20, _x21) {
      return _ref13.apply(this, arguments);
    };
  }());

  _defineProperty(this, "AcquireImage", function (sourceName) {
    var isBlank = _this.ifDuplexEnabled ? 1 : 0;

    if (_this.isSync) {
      _this.scanner.AcquireSync(sourceName, _this.duplex, _this.color, _this.resolution, _this.format, isBlank, _this.onAcquireSyncCompleted, null);
    } else {
      var res = _this.scanner.AcquireAsync(sourceName, _this.duplex, _this.color, _this.resolution, _this.format, isBlank);

      _this.hasUploadCount = 0;
      _this.totalImages = 0;

      _this.asyncPathsMap.clear();

      if (res.ErrorCode != 0) {
        _this.onScanError(res); // 抛出异常


        return;
      }

      if (res.Guid) {
        _this.timer = setInterval(function () {
          _this.QueryResult(res.Guid);
        }, _this.qureyDelay);
        _this.timer2 = setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _this.checkFile(res.Guid);

                case 1:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee14);
        })), _this.checkDelay);
      }
    }
  });

  _defineProperty(this, "onScanError", function (json) {
    var errorInfo = {
      errcode: json.ErrorCode,
      description: json.ErrorDescription,
      data: json.data || ''
    };

    if (json.ErrorCode == '4000') {
      errorInfo['errcode'] = '0002';
      errorInfo['description'] = '请先安装JsScanner.msi程序';
      errorInfo['data'] = _this.downloadUrl;
    }

    var errcode = errorInfo.errcode,
        description = errorInfo.description,
        data = errorInfo.data;

    if (typeof _this.uploadFinish == 'function') {
      _this.uploadFinish({
        errcode: errcode,
        description: description,
        data: data
      });
    } else {
      _this.onError({
        errcode: errcode,
        description: description
      });
    }
  });

  _defineProperty(this, "getSources", function () {
    // 获取扫描仪来源
    var sources = JSON.parse(localStorage['scanSources']);

    if (sources) {
      return sources;
    }

    return []; //ws未连接
    // if (this.connectStatus != 1) {
    //     this.scanner = new JsScannerSdk();
    //     this.scanner.CreateConnection();
    //     const timer = setInterval(() => {
    //         if (this.connectStatus == 1) {
    //             clearInterval(timer);
    //             return this.scannerSources;
    //         }
    //     }, 500);
    // } else {
    //     this.scanner.GetDataSources();
    // }
  });

  this.options = opt;
  this.duplex = opt.duplex || 0; // 1双面,0单面

  this.color = opt.color || 1; // 1: 灰度; 0:B&W 2:彩色

  this.resolution = opt.resolution || 300; // 100,150,200,300

  this.format = opt.format || 'jpg'; // bmp,jpg,tiff,png,pdf

  this.staticUrl = opt.staticUrl || '';
  this.needRegonizeQr = opt.needRegonizeQr || false;
  this.uploadUrl = opt.uploadUrl;
  this.headers = opt.headers;
  this.locale = opt.locale;
  this.limit = opt.limit || 2;
  this.ifDuplexEnabled = opt.ifDuplexEnabled; // 过滤空白页

  this.version = opt.version;
  this.isAutoSelectSource = opt.isAutoSelectSource;
  this.debug = opt.debug || false;
  this.qureyDelay = opt.qureyDelay || 1000; // 轮询异步扫描结果

  this.checkDelay = opt.checkDelay || 1000; // 轮询checkFile

  this.scanner = null;
  this.connectStatus = null;
  this.scannerSources = [];
  this.fileInfo = {};
  this.filename = ''; // formdata中File的name

  this.data = null; // formdata处理额外的上传数据.

  this.fileIndex = -1;
  this.fileList = [];
  this.totalFiles = 0;
  this.fileIds = [];
  this.scanFileStaticJs = opt.scanFileStaticJs || ["".concat(this.staticUrl, "/static/gallery/scanner-ruizhen/JsScanner-min.js")];
  this.scannerApiUrl = opt.scannerApiUrl || 'http://127.0.0.1:25972/jsscaner/api/v1/command'; //扫描仪sdk请求地址
  // 软件下载地址

  this.downloadUrl = opt.downloadUrl || "".concat(this.staticUrl, "/static/gallery/scanner-ruizhen/JsScanner.msi");
  this.socketUrl = ''; // socket连接地址

  this.needRegonizeQr = opt.needRegonizeQr; // 通知需要识别二维码，加载相关库文件

  this.onError = opt.onError;
  this.isSync = opt.isSync || false; // 是否同步扫描？

  this.hasUploadCount = 0; // 已上传张数

  this.timer = null; //异步定时器

  this.timer2 = null; //

  this.asyncPathsMap = new Map();
  this.hasFinished = 0; // 2次Status=2才确认扫描完成，此时清除之前的map image数据

  this.mermoryFilePaths = []; // 采集的文件path

  this.totalImages = 0; //

  this.curIndex = 0; //

  this.processFile = [];
  this.isNext = true;
  this.isContinue = true; // this.noResponseFiles = []; // 异常请求数据（待后续上传插入）

  var compressOpt = {};

  if (opt.fileQuality) {
    compressOpt.fileQuality = opt.fileQuality;
  }

  if (opt.fileLimitWidth) {
    compressOpt.fileLimitWidth = opt.fileLimitWidth;
  }

  if (opt.fileLimitHeight) {
    compressOpt.fileLimitHeight = opt.fileLimitHeight;
  }

  if (opt.fileLimitPixel) {
    compressOpt.fileLimitPixel = opt.fileLimitPixel;
  }

  if (opt.fileLimitSize) {
    compressOpt.fileLimitSize = opt.fileLimitSize;
  }

  this.compressOpt = compressOpt;

  if (this.needRegonizeQr) {
    this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
  }
});

/* harmony default export */ __webpack_exports__["default"] = (CkScanFile);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var JsScanner = /*#__PURE__*/function () {
  function JsScanner(options) {
    _classCallCheck(this, JsScanner);

    this.API_URL = options.API_URL;
  }

  _createClass(JsScanner, [{
    key: "PostHttpRequest",
    value: function PostHttpRequest(t, e, n) {
      var s = new XMLHttpRequest();
      s.onreadystatechange = function () {
        s.readyState == 4 && 200 == s.status && e(JSON.parse(s.responseText), n);
      }, s.open("POST", this.API_URL), s.setRequestHeader("Content-Type", "application/json;charset=UTF-8"), s.send(t);

      s.onerror = function (error) {
        e({
          Command: 'RequestError',
          ErrorType: 'RequestError',
          ErrorCode: '4000',
          ErrorDescription: 'request error'
        }, n);
      };
    }
  }, {
    key: "PostHttpRequestSync",
    value: function PostHttpRequestSync(t) {
      var e = new XMLHttpRequest();
      return e.open("POST", this.API_URL, !1), e.setRequestHeader("Content-Type", "application/json;charset=UTF-8"), e.send(t), JSON.parse(e.responseText);
    }
  }, {
    key: "GetDataSources",
    value: function GetDataSources(t, e) {
      this.PostHttpRequest(JSON.stringify({
        Command: "GetSources"
      }), t, e);
    }
  }, {
    key: "AcquireSync",
    value: function AcquireSync(t, e, n, s, o, u, i, r) {
      u = {
        Command: "Acquire",
        ProductName: t,
        Duplex: e,
        Color: n,
        Resolution: s,
        Format: o,
        Blank: u
      };
      this.PostHttpRequest(JSON.stringify(u), i, r);
    }
  }, {
    key: "AcquireAsync",
    value: function AcquireAsync(t, e, n, s, o, u, i, r) {
      u = {
        Command: "AcquireAsync",
        ProductName: t,
        Duplex: e,
        Color: n,
        Resolution: s,
        Format: o,
        Blank: u
      };
      return this.PostHttpRequestSync(JSON.stringify(u));
    }
  }, {
    key: "GetFileSync",
    value: function GetFileSync(t, e, n) {
      t = {
        Command: "GetFileSync",
        FilePath: t
      };
      this.PostHttpRequest(JSON.stringify(t), e, n);
    }
  }, {
    key: "GetFileAsyncByIndex",
    value: function GetFileAsyncByIndex(t, e) {
      e = {
        Command: "GetFileAsyncByIndex",
        Guid: t,
        Index: e
      };
      return this.PostHttpRequestSync(JSON.stringify(e));
    }
  }, {
    key: "GetFileAsyncByPath",
    value: function GetFileAsyncByPath(t, e) {
      e = {
        Command: "GetFileAsyncByPath",
        Guid: t,
        FilePath: e
      };
      return this.PostHttpRequestSync(JSON.stringify(e));
    }
  }, {
    key: "GetProductVersion",
    value: function GetProductVersion() {
      var t = {
        Command: "GetProductVersion"
      };
      return this.PostHttpRequestSync(JSON.stringify(t));
    }
  }, {
    key: "QueryResult",
    value: function QueryResult(t) {
      t = {
        Command: "QueryResult",
        Guid: t
      };
      return this.PostHttpRequestSync(JSON.stringify(t));
    }
  }, {
    key: "GetProductInfo",
    value: function GetProductInfo(t, e, n) {
      t = {
        Command: "GetProductInfo",
        ProductName: t
      };
      this.PostHttpRequest(JSON.stringify(t), e, n);
    }
  }, {
    key: "DeleteAcquireFiles",
    value: function DeleteAcquireFiles(t) {
      t = {
        Command: "DeleteAcquireFiles",
        Guid: t
      };
      return this.PostHttpRequestSync(JSON.stringify(t));
    }
  }]);

  return JsScanner;
}();

/* harmony default export */ __webpack_exports__["default"] = (JsScanner);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate, process, global, module) {(function (global, factory) {
   true ? factory(exports) :
  undefined;
}(this, (function (exports) { 'use strict';

function slice(arrayLike, start) {
    start = start|0;
    var newLen = Math.max(arrayLike.length - start, 0);
    var newArr = Array(newLen);
    for(var idx = 0; idx < newLen; idx++)  {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}

/**
 * Creates a continuation function with some arguments already applied.
 *
 * Useful as a shorthand when combined with other control flow functions. Any
 * arguments passed to the returned function are added to the arguments
 * originally passed to apply.
 *
 * @name apply
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function you want to eventually apply all
 * arguments to. Invokes with (arguments...).
 * @param {...*} arguments... - Any number of arguments to automatically apply
 * when the continuation is called.
 * @returns {Function} the partially-applied function
 * @example
 *
 * // using apply
 * async.parallel([
 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
 *     async.apply(fs.writeFile, 'testfile2', 'test2')
 * ]);
 *
 *
 * // the same process without using apply
 * async.parallel([
 *     function(callback) {
 *         fs.writeFile('testfile1', 'test1', callback);
 *     },
 *     function(callback) {
 *         fs.writeFile('testfile2', 'test2', callback);
 *     }
 * ]);
 *
 * // It's possible to pass any number of additional arguments when calling the
 * // continuation:
 *
 * node> var fn = async.apply(sys.puts, 'one');
 * node> fn('two', 'three');
 * one
 * two
 * three
 */
var apply = function(fn/*, ...args*/) {
    var args = slice(arguments, 1);
    return function(/*callArgs*/) {
        var callArgs = slice(arguments);
        return fn.apply(null, args.concat(callArgs));
    };
};

var initialParams = function (fn) {
    return function (/*...args, callback*/) {
        var args = slice(arguments);
        var callback = args.pop();
        fn.call(this, args, callback);
    };
};

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        defer(function () {
            fn.apply(null, args);
        });
    };
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

var setImmediate$1 = wrap(_defer);

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function(value) {
                invokeCallback(callback, null, value);
            }, function(err) {
                invokeCallback(callback, err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function invokeCallback(callback, error, value) {
    try {
        callback(error, value);
    } catch (e) {
        setImmediate$1(rethrow, e);
    }
}

function rethrow(error) {
    throw error;
}

var supportsSymbol = typeof Symbol === 'function';

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

function applyEach$1(eachfn) {
    return function(fns/*, ...args*/) {
        var args = slice(arguments, 1);
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
var breakLoop = {};

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

var getIterator = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? {value: coll[i], key: i} : null;
    }
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done)
            return null;
        i++;
        return {value: item.value, key: i};
    }
}

function createObjectIterator(obj) {
    var okeys = keys(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? {value: obj[key], key: key} : null;
    };
}

function iterator(coll) {
    if (isArrayLike(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = getIterator(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

function onlyOnce(fn) {
    return function() {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;
        var looping = false;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            }
            else if (value === breakLoop || (done && running <= 0)) {
                done = true;
                return callback(null);
            }
            else if (!looping) {
                replenish();
            }
        }

        function replenish () {
            looping = true;
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
            looping = false;
        }

        replenish();
    };
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachOfLimit(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
}

function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}

// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll, iteratee, callback) {
    callback = once(callback || noop);
    var index = 0,
        completed = 0,
        length = coll.length;
    if (length === 0) {
        callback(null);
    }

    function iteratorCallback(err, value) {
        if (err) {
            callback(err);
        } else if ((++completed === length) || value === breakLoop) {
            callback(null);
        }
    }

    for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
    }
}

// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric = doLimit(eachOfLimit, Infinity);

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each
 * item in `coll`.
 * The `key` is the item's key, or index in the case of an array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
var eachOf = function(coll, iteratee, callback) {
    var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
    eachOfImplementation(coll, wrapAsync(iteratee), callback);
};

function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, wrapAsync(iteratee), callback);
    };
}

function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = callback || noop;
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        _iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Produces a new collection of values by mapping each value in `coll` through
 * the `iteratee` function. The `iteratee` is called with an item from `coll`
 * and a callback for when it has finished processing. Each of these callback
 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
 * `iteratee` passes an error to its callback, the main `callback` (for the
 * `map` function) is immediately called with the error.
 *
 * Note, that since this function applies the `iteratee` to each item in
 * parallel, there is no guarantee that the `iteratee` functions will complete
 * in order. However, the results array will be in the same order as the
 * original `coll`.
 *
 * If `map` is passed an Object, the results will be an Array.  The results
 * will roughly be in the order of the original Objects' keys (but this can
 * vary across JavaScript engines).
 *
 * @name map
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an Array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @example
 *
 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
var map = doParallel(_asyncMap);

/**
 * Applies the provided arguments to each function in the array, calling
 * `callback` after all functions have completed. If you only provide the first
 * argument, `fns`, then it will return a function which lets you pass in the
 * arguments as if it were a single function call. If more arguments are
 * provided, `callback` is required while `args` is still optional.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(..args, callback)`. If invoked with any
 * arguments, `callback` is required.
 * @example
 *
 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async.applyEach([enableSearch, updateSchema]),
 *     callback
 * );
 */
var applyEach = applyEach$1(map);

function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
    };
}

/**
 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
 *
 * @name mapLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapLimit = doParallelLimit(_asyncMap);

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapSeries = doLimit(mapLimit, 1);

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
var applyEachSeries = applyEach$1(mapSeries);

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the main `callback` is immediately called with the
 * error.
 *
 * {@link AsyncFunction}s also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one or two arguments:
 * * a `results` object, containing the results of the previously executed
 *   functions, only passed if the task has any dependencies,
 * * a `callback(err, result)` function, which must be called when finished,
 *   passing an `error` (which can be `null`) and the result of the function's
 *   execution.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback. Results are always returned; however, if an
 * error occurs, no further `tasks` will be performed, and the results object
 * will only contain partial results. Invoked with (err, results).
 * @returns undefined
 * @example
 *
 * async.auto({
 *     // this function will just be passed a callback
 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
 *     showData: ['readData', function(results, cb) {
 *         // results.readData is the file's contents
 *         // ...
 *     }]
 * }, callback);
 *
 * async.auto({
 *     get_data: function(callback) {
 *         console.log('in get_data');
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         console.log('in make_folder');
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: ['get_data', 'make_folder', function(results, callback) {
 *         console.log('in write_file', JSON.stringify(results));
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(results, callback) {
 *         console.log('in email_link', JSON.stringify(results));
 *         // once the file is written let's email a link to it...
 *         // results.write_file contains the filename returned by write_file.
 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
 *     }]
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('results = ', results);
 * });
 */
var auto = function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys$$1 = keys(tasks);
    var numTasks = keys$$1.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = Object.create(null);

    var readyTasks = [];

    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};

    baseForOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            readyToCheck.push(key);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
            enqueueTask(key, task);
            readyToCheck.push(key);
            return;
        }
        uncheckedDependencies[key] = remainingDependencies;

        arrayEach(dependencies, function (dependencyName) {
            if (!tasks[dependencyName]) {
                throw new Error('async.auto task `' + key +
                    '` has a non-existent dependency `' +
                    dependencyName + '` in ' +
                    dependencies.join(', '));
            }
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    checkForDeadlocks();
    processQueue();

    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while(readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }

    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }


    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(function(err, result) {
            runningTasks--;
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            if (err) {
                var safeResults = {};
                baseForOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = result;
                hasError = true;
                listeners = Object.create(null);

                callback(err, safeResults);
            } else {
                results[key] = result;
                taskComplete(key);
            }
        });

        runningTasks++;
        var taskFn = wrapAsync(task[task.length - 1]);
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }

    function checkForDeadlocks() {
        // Kahn's algorithm
        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
            currentTask = readyToCheck.pop();
            counter++;
            arrayEach(getDependents(currentTask), function (dependent) {
                if (--uncheckedDependencies[dependent] === 0) {
                    readyToCheck.push(dependent);
                }
            });
        }

        if (counter !== numTasks) {
            throw new Error(
                'async.auto cannot execute tasks due to a recursive dependency'
            );
        }
    }

    function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function (task, key) {
            if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                result.push(key);
            }
        });
        return result;
    }
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the first unmatched string symbol.
 */
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;

  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f';
var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange = '\\u20d0-\\u20ff';
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;

  return castSlice(strSymbols, start, end).join('');
}

var FN_ARGS = /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseParams(func) {
    func = func.toString().replace(STRIP_COMMENTS, '');
    func = func.match(FN_ARGS)[2].replace(' ', '');
    func = func ? func.split(FN_ARG_SPLIT) : [];
    func = func.map(function (arg){
        return trim(arg.replace(FN_ARG, ''));
    });
    return func;
}

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
 * tasks are specified as parameters to the function, after the usual callback
 * parameter, with the parameter names matching the names of the tasks it
 * depends on. This can provide even more readable task graphs which can be
 * easier to maintain.
 *
 * If a final callback is specified, the task results are similarly injected,
 * specified as named parameters after the initial error parameter.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
 * the form 'func([dependencies...], callback). The object's key of a property
 * serves as the name of the task defined by that property, i.e. can be used
 * when specifying requirements for other tasks.
 * * The `callback` parameter is a `callback(err, result)` which must be called
 *   when finished, passing an `error` (which can be `null`) and the result of
 *   the function's execution. The remaining parameters name other tasks on
 *   which the task is dependent, and the results from those tasks are the
 *   arguments of those parameters.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback, and a `results` object with any completed
 * task results, similar to `auto`.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *     get_data: function(callback) {
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: function(get_data, make_folder, callback) {
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     },
 *     email_link: function(write_file, callback) {
 *         // once the file is written let's email a link to it...
 *         // write_file contains the filename returned by write_file.
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 *
 * // If you are using a JS minifier that mangles parameter names, `autoInject`
 * // will not work with plain functions, since the parameter names will be
 * // collapsed to a single letter identifier.  To work around this, you can
 * // explicitly specify the names of the parameters your task function needs
 * // in an array, similar to Angular.js dependency injection.
 *
 * // This still has an advantage over plain `auto`, since the results a task
 * // depends on are still spread into arguments.
 * async.autoInject({
 *     //...
 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(write_file, callback) {
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }]
 *     //...
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 */
function autoInject(tasks, callback) {
    var newTasks = {};

    baseForOwn(tasks, function (taskFn, key) {
        var params;
        var fnIsAsync = isAsync(taskFn);
        var hasNoDeps =
            (!fnIsAsync && taskFn.length === 1) ||
            (fnIsAsync && taskFn.length === 0);

        if (isArray(taskFn)) {
            params = taskFn.slice(0, -1);
            taskFn = taskFn[taskFn.length - 1];

            newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (hasNoDeps) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            }

            // remove callback param
            if (!fnIsAsync) params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            wrapAsync(taskFn).apply(null, newArgs);
        }
    });

    auto(newTasks, callback);
}

// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = function () {
    while(this.head) this.shift();
    return this;
};

DLL.prototype.insertAfter = function(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;
    else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;
    else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function(node) {
    if (this.head) this.insertBefore(this.head, node);
    else setInitial(this, node);
};

DLL.prototype.push = function(node) {
    if (this.tail) this.insertAfter(this.tail, node);
    else setInitial(this, node);
};

DLL.prototype.shift = function() {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function() {
    return this.tail && this.removeLink(this.tail);
};

DLL.prototype.toArray = function () {
    var arr = Array(this.length);
    var curr = this.head;
    for(var idx = 0; idx < this.length; idx++) {
        arr[idx] = curr.data;
        curr = curr.next;
    }
    return arr;
};

DLL.prototype.remove = function (testFn) {
    var curr = this.head;
    while(!!curr) {
        var next = curr.next;
        if (testFn(curr)) {
            this.removeLink(curr);
        }
        curr = next;
    }
    return this;
};

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var _worker = wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];

    var processingScheduled = false;
    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                callback: callback || noop
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        }

        if (!processingScheduled) {
            processingScheduled = true;
            setImmediate$1(function() {
                processingScheduled = false;
                q.process();
            });
        }
    }

    function _next(tasks) {
        return function(err){
            numRunning -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];

                var index = baseIndexOf(workersList, task, 0);
                if (index === 0) {
                    workersList.shift();
                } else if (index > 0) {
                    workersList.splice(index, 1);
                }

                task.callback.apply(task, arguments);

                if (err != null) {
                    q.error(err, task.data);
                }
            }

            if (numRunning <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        };
    }

    var isProcessing = false;
    var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated:noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        remove: function (testFn) {
            q._tasks.remove(testFn);
        },
        process: function () {
            // Avoid trying to start too many processing operations. This can occur
            // when callbacks resolve synchronously (#1267).
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                var tasks = [], data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    workersList.push(node);
                    data.push(node.data);
                }

                numRunning += 1;

                if (q._tasks.length === 0) {
                    q.empty();
                }

                if (numRunning === q.concurrency) {
                    q.saturated();
                }

                var cb = onlyOnce(_next(tasks));
                _worker(data, cb);
            }
            isProcessing = false;
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return numRunning;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q._tasks.length + numRunning === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            setImmediate$1(q.process);
        }
    };
    return q;
}

/**
 * A cargo of tasks for the worker function to complete. Cargo inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargo.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargo` is
 * created to alter the payload on-the-fly.
 * @property {Function} push - Adds `task` to the `queue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
 * @property {Function} saturated - A callback that is called when the
 * `queue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} empty - A callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargo.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
 */

/**
 * Creates a `cargo` object with the specified payload. Tasks added to the
 * cargo will be processed altogether (up to the `payload` limit). If the
 * `worker` is in progress, the task is queued until it becomes available. Once
 * the `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, cargo passes an array of tasks to a single worker, repeating
 * when the worker is finished.
 *
 * @name cargo
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An asynchronous function for processing an array
 * of queued tasks. Invoked with `(tasks, callback)`.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargo and inner queue.
 * @example
 *
 * // create a cargo object with payload 2
 * var cargo = async.cargo(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2);
 *
 * // add some items
 * cargo.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargo.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargo.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 */
function cargo(worker, payload) {
    return queue(worker, 1, payload);
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Invoked with (err).
 */
var eachOfSeries = doLimit(eachOfLimit, 1);

/**
 * Reduces `coll` into a single value using an async `iteratee` to return each
 * successive step. `memo` is the initial state of the reduction. This function
 * only operates in series.
 *
 * For performance reasons, it may make sense to split a call to this function
 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
 * results. This function is for situations where each step in the reduction
 * needs to be async; if you can get the data before reducing it, then it's
 * probably a good idea to do so.
 *
 * @name reduce
 * @static
 * @memberOf module:Collections
 * @method
 * @alias inject
 * @alias foldl
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 * @example
 *
 * async.reduce([1,2,3], 0, function(memo, item, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         callback(null, memo + item)
 *     });
 * }, function(err, result) {
 *     // result is now equal to the last value of memo, which is 6
 * });
 */
function reduce(coll, memo, iteratee, callback) {
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    eachOfSeries(coll, function(x, i, callback) {
        _iteratee(memo, x, function(err, v) {
            memo = v;
            callback(err);
        });
    }, function(err) {
        callback(err, memo);
    });
}

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.compose]{@link module:ControlFlow.compose}
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} a function that composes the `functions` in order
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
function seq(/*...functions*/) {
    var _functions = arrayMap(arguments, wrapAsync);
    return function(/*...args*/) {
        var args = slice(arguments);
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(_functions, args, function(newargs, fn, cb) {
            fn.apply(that, newargs.concat(function(err/*, ...nextargs*/) {
                var nextargs = slice(arguments, 1);
                cb(err, nextargs);
            }));
        },
        function(err, results) {
            cb.apply(that, [err].concat(results));
        });
    };
}

/**
 * Creates a function which is a composition of the passed asynchronous
 * functions. Each function consumes the return value of the function that
 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name compose
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} an asynchronous function that is the composed
 * asynchronous `functions`
 * @example
 *
 * function add1(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n + 1);
 *     }, 10);
 * }
 *
 * function mul3(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n * 3);
 *     }, 10);
 * }
 *
 * var add1mul3 = async.compose(mul3, add1);
 * add1mul3(4, function (err, result) {
 *     // result now equals 15
 * });
 */
var compose = function(/*...args*/) {
    return seq.apply(null, slice(arguments).reverse());
};

var _concat = Array.prototype.concat;

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
 *
 * @name concatLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err /*, ...args*/) {
            if (err) return callback(err);
            return callback(null, slice(arguments, 1));
        });
    }, function(err, mapResults) {
        var result = [];
        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                result = _concat.apply(result, mapResults[i]);
            }
        }

        return callback(err, result);
    });
};

/**
 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
 * the concatenated list. The `iteratee`s are called in parallel, and the
 * results are concatenated as they return. There is no guarantee that the
 * results array will be returned in the original order of `coll` passed to the
 * `iteratee` function.
 *
 * @name concat
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @example
 *
 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
 *     // files is now a list of filenames that exist in the 3 directories
 * });
 */
var concat = doLimit(concatLimit, Infinity);

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatSeries = doLimit(concatLimit, 1);

/**
 * Returns a function that when called, calls-back with the values provided.
 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
 * [`auto`]{@link module:ControlFlow.auto}.
 *
 * @name constant
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {...*} arguments... - Any number of arguments to automatically invoke
 * callback with.
 * @returns {AsyncFunction} Returns a function that when invoked, automatically
 * invokes the callback with the previous given arguments.
 * @example
 *
 * async.waterfall([
 *     async.constant(42),
 *     function (value, next) {
 *         // value === 42
 *     },
 *     //...
 * ], callback);
 *
 * async.waterfall([
 *     async.constant(filename, "utf8"),
 *     fs.readFile,
 *     function (fileData, next) {
 *         //...
 *     }
 *     //...
 * ], callback);
 *
 * async.auto({
 *     hostname: async.constant("https://server.net/"),
 *     port: findFreePort,
 *     launchServer: ["hostname", "port", function (options, cb) {
 *         startServer(options, cb);
 *     }],
 *     //...
 * }, callback);
 */
var constant = function(/*...values*/) {
    var values = slice(arguments);
    var args = [null].concat(values);
    return function (/*...ignoredArgs, callback*/) {
        var callback = arguments[arguments.length - 1];
        return callback.apply(this, args);
    };
};

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

function _createTester(check, getResult) {
    return function(eachfn, arr, iteratee, cb) {
        cb = cb || noop;
        var testPassed = false;
        var testResult;
        eachfn(arr, function(value, _, callback) {
            iteratee(value, function(err, result) {
                if (err) {
                    callback(err);
                } else if (check(result) && !testResult) {
                    testPassed = true;
                    testResult = getResult(true, value);
                    callback(null, breakLoop);
                } else {
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                cb(null, testPassed ? testResult : getResult(false));
            }
        });
    };
}

function _findGetResult(v, x) {
    return x;
}

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
var detect = doParallel(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectLimit = doParallelLimit(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectSeries = doLimit(detectLimit, 1);

function consoleFunc(name) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        args.push(function (err/*, ...args*/) {
            var args = slice(arguments, 1);
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        });
        wrapAsync(fn).apply(null, args);
    };
}

/**
 * Logs the result of an [`async` function]{@link AsyncFunction} to the
 * `console` using `console.dir` to display the properties of the resulting object.
 * Only works in Node.js or in browsers that support `console.dir` and
 * `console.error` (such as FF and Chrome).
 * If multiple arguments are returned from the async function,
 * `console.dir` is called on each argument in order.
 *
 * @name dir
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, {hello: name});
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.dir(hello, 'world');
 * {hello: 'world'}
 */
var dir = consoleFunc('dir');

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occurred, otherwise `null`.
 */
function doDuring(fn, test, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        args.push(check);
        _test.apply(this, args);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    check(null, true);

}

/**
 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `iteratee` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - A function which is called each time `test`
 * passes. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped.
 * `callback` will be passed an error and any arguments passed to the final
 * `iteratee`'s callback. Invoked with (err, [results]);
 */
function doWhilst(iteratee, test, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        if (test.apply(this, args)) return _iteratee(next);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function doUntil(iteratee, test, callback) {
    doWhilst(iteratee, function() {
        return !test.apply(this, arguments);
    }, callback);
}

/**
 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
 * is passed a callback in the form of `function (err, truth)`. If error is
 * passed to `test` or `fn`, the main callback is immediately called with the
 * value of the error.
 *
 * @name during
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error, if one occurred, otherwise `null`.
 * @example
 *
 * var count = 0;
 *
 * async.during(
 *     function (callback) {
 *         return callback(null, count < 5);
 *     },
 *     function (callback) {
 *         count++;
 *         setTimeout(callback, 1000);
 *     },
 *     function (err) {
 *         // 5 seconds have passed
 *     }
 * );
 */
function during(test, fn, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err) {
        if (err) return callback(err);
        _test(check);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    _test(check);
}

function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` passes an error to its `callback`, the
 * main `callback` (for the `each` function) is immediately called with the
 * error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to
 * each item in `coll`. Invoked with (item, callback).
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOf`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile, function(err){
 *   // if any of the saves produced an error, err would equal that error
 * });
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, function(file, callback) {
 *
 *     // Perform operation on file here.
 *     console.log('Processing file ' + file);
 *
 *     if( file.length > 32 ) {
 *       console.log('This file name is too long');
 *       callback('File name too long');
 *     } else {
 *       // Do work to process file here
 *       console.log('File processed');
 *       callback();
 *     }
 * }, function(err) {
 *     // if any of the file processing produced an error, err would equal that error
 *     if( err ) {
 *       // One of the iterations produced an error.
 *       // All processing will now stop.
 *       console.log('A file failed to process');
 *     } else {
 *       console.log('All files have been processed successfully');
 *     }
 * });
 */
function eachLimit(coll, iteratee, callback) {
    eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfLimit`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit$1(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
var eachSeries = doLimit(eachLimit$1, 1);

/**
 * Wrap an async function and ensure it calls its callback on a later tick of
 * the event loop.  If the function already calls its callback on a next tick,
 * no extra deferral is added. This is useful for preventing stack overflows
 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
 * contained. ES2017 `async` functions are returned as-is -- they are immune
 * to Zalgo's corrupting influences, as they always resolve on a later tick.
 *
 * @name ensureAsync
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - an async function, one that expects a node-style
 * callback as its last argument.
 * @returns {AsyncFunction} Returns a wrapped function with the exact same call
 * signature as the function passed in.
 * @example
 *
 * function sometimesAsync(arg, callback) {
 *     if (cache[arg]) {
 *         return callback(null, cache[arg]); // this would be synchronous!!
 *     } else {
 *         doSomeIO(arg, callback); // this IO would be asynchronous
 *     }
 * }
 *
 * // this has a risk of stack overflows if many results are cached in a row
 * async.mapSeries(args, sometimesAsync, done);
 *
 * // this will defer sometimesAsync's callback if necessary,
 * // preventing stack overflows
 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 */
function ensureAsync(fn) {
    if (isAsync(fn)) return fn;
    return initialParams(function (args, callback) {
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function notId(v) {
    return !v;
}

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @example
 *
 * async.every(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then every file exists
 * });
 */
var every = doParallel(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everyLimit = doParallelLimit(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in series.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everySeries = doLimit(everyLimit, 1);

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

function filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (truthValues[i]) results.push(arr[i]);
        }
        callback(null, results);
    });
}

function filterGeneric(eachfn, coll, iteratee, callback) {
    var results = [];
    eachfn(coll, function (x, index, callback) {
        iteratee(x, function (err, v) {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, arrayMap(results.sort(function (a, b) {
                return a.index - b.index;
            }), baseProperty('value')));
        }
    });
}

function _filter(eachfn, coll, iteratee, callback) {
    var filter = isArrayLike(coll) ? filterArray : filterGeneric;
    filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
}

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.filter(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of the existing files
 * });
 */
var filter = doParallel(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var filterLimit = doParallelLimit(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 */
var filterSeries = doLimit(filterLimit, 1);

/**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
function forever(fn, errback) {
    var done = onlyOnce(errback || noop);
    var task = wrapAsync(ensureAsync(fn));

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupByLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err, key) {
            if (err) return callback(err);
            return callback(null, {key: key, val: val});
        });
    }, function(err, mapResults) {
        var result = {};
        // from MDN, handle object having an `hasOwnProperty` prop
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                var key = mapResults[i].key;
                var val = mapResults[i].val;

                if (hasOwnProperty.call(result, key)) {
                    result[key].push(val);
                } else {
                    result[key] = [val];
                }
            }
        }

        return callback(err, result);
    });
};

/**
 * Returns a new object, where each value corresponds to an array of items, from
 * `coll`, that returned the corresponding key. That is, the keys of the object
 * correspond to the values passed to the `iteratee` callback.
 *
 * Note: Since this function applies the `iteratee` to each item in parallel,
 * there is no guarantee that the `iteratee` functions will complete in order.
 * However, the values for each key in the `result` will be in the same order as
 * the original `coll`. For Objects, the values will roughly be in the order of
 * the original Objects' keys (but this can vary across JavaScript engines).
 *
 * @name groupBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @example
 *
 * async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
 *     db.findById(userId, function(err, user) {
 *         if (err) return callback(err);
 *         return callback(null, user.age);
 *     });
 * }, function(err, result) {
 *     // result is object containing the userIds grouped by age
 *     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
 * });
 */
var groupBy = doLimit(groupByLimit, Infinity);

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
 *
 * @name groupBySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupBySeries = doLimit(groupByLimit, 1);

/**
 * Logs the result of an `async` function to the `console`. Only works in
 * Node.js or in browsers that support `console.log` and `console.error` (such
 * as FF and Chrome). If multiple arguments are returned from the async
 * function, `console.log` is called on each argument in order.
 *
 * @name log
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, 'hello ' + name);
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.log(hello, 'world');
 * 'hello world'
 */
var log = consoleFunc('log');

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name mapValuesLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
function mapValuesLimit(obj, limit, iteratee, callback) {
    callback = once(callback || noop);
    var newObj = {};
    var _iteratee = wrapAsync(iteratee);
    eachOfLimit(obj, limit, function(val, key, next) {
        _iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        });
    }, function (err) {
        callback(err, newObj);
    });
}

/**
 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
 *
 * Produces a new Object by mapping each value of `obj` through the `iteratee`
 * function. The `iteratee` is called each `value` and `key` from `obj` and a
 * callback for when it has finished processing. Each of these callbacks takes
 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
 * passes an error to its callback, the main `callback` (for the `mapValues`
 * function) is immediately called with the error.
 *
 * Note, the order of the keys in the result is not guaranteed.  The keys will
 * be roughly in the order they complete, (but this is very engine-specific)
 *
 * @name mapValues
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 * @example
 *
 * async.mapValues({
 *     f1: 'file1',
 *     f2: 'file2',
 *     f3: 'file3'
 * }, function (file, key, callback) {
 *   fs.stat(file, callback);
 * }, function(err, result) {
 *     // result is now a map of stats for each file, e.g.
 *     // {
 *     //     f1: [stats for file1],
 *     //     f2: [stats for file2],
 *     //     f3: [stats for file3]
 *     // }
 * });
 */

var mapValues = doLimit(mapValuesLimit, Infinity);

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
var mapValuesSeries = doLimit(mapValuesLimit, 1);

function has(obj, key) {
    return key in obj;
}

/**
 * Caches the results of an async function. When creating a hash to store
 * function results against, the callback is omitted from the hash and an
 * optional hash function can be used.
 *
 * If no hash function is specified, the first argument is used as a hash key,
 * which may work reasonably if it is a string or a data type that converts to a
 * distinct string. Note that objects and arrays will not behave reasonably.
 * Neither will cases where the other arguments are significant. In such cases,
 * specify your own hash function.
 *
 * The cache of results is exposed as the `memo` property of the function
 * returned by `memoize`.
 *
 * @name memoize
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function to proxy and cache results from.
 * @param {Function} hasher - An optional function for generating a custom hash
 * for storing results. It has all the arguments applied to it apart from the
 * callback, and must be synchronous.
 * @returns {AsyncFunction} a memoized version of `fn`
 * @example
 *
 * var slow_fn = function(name, callback) {
 *     // do something
 *     callback(null, result);
 * };
 * var fn = async.memoize(slow_fn);
 *
 * // fn can now be used as if it were slow_fn
 * fn('some name', function() {
 *     // callback
 * });
 */
function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var _fn = wrapAsync(fn);
    var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate$1(function() {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            _fn.apply(null, args.concat(function(/*args*/) {
                var args = slice(arguments);
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            }));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `process.nextTick`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name nextTick
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.setImmediate]{@link module:Utils.setImmediate}
 * @category Util
 * @param {Function} callback - The function to call on a later loop around
 * the event loop. Invoked with (args...).
 * @param {...*} args... - any number of additional arguments to pass to the
 * callback on the next tick.
 * @example
 *
 * var call_order = [];
 * async.nextTick(function() {
 *     call_order.push('two');
 *     // call_order now equals ['one','two']
 * });
 * call_order.push('one');
 *
 * async.setImmediate(function (a, b, c) {
 *     // a, b, and c equal 1, 2, and 3
 * }, 1, 2, 3);
 */
var _defer$1;

if (hasNextTick) {
    _defer$1 = process.nextTick;
} else if (hasSetImmediate) {
    _defer$1 = setImmediate;
} else {
    _defer$1 = fallback;
}

var nextTick = wrap(_defer$1);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        wrapAsync(task)(function (err, result) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            results[key] = result;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Run the `tasks` collection of functions in parallel, without waiting until
 * the previous function has completed. If any of the functions pass an error to
 * its callback, the main `callback` is immediately called with the value of the
 * error. Once the `tasks` have completed, the results are passed to the final
 * `callback` as an array.
 *
 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
 * parallel execution of code.  If your tasks do not use any timers or perform
 * any I/O, they will actually be executed in series.  Any synchronous setup
 * sections for each task will happen one after the other.  JavaScript remains
 * single-threaded.
 *
 * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
 * execution of other tasks when a task fails.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 * results from {@link async.parallel}.
 *
 * @name parallel
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 *
 * @example
 * async.parallel([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // the results array will equal ['one','two'] even though
 *     // the second function had a shorter timeout.
 * });
 *
 * // an example using an object instead of an array
 * async.parallel({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equals to: {one: 1, two: 2}
 * });
 */
function parallelLimit(tasks, callback) {
    _parallel(eachOf, tasks, callback);
}

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
function parallelLimit$1(tasks, limit, callback) {
    _parallel(_eachOfLimit(limit), tasks, callback);
}

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} remove - remove items from the queue that match a test
 * function.  The test function will be passed an object with a `data` property,
 * and a `priority` property, if this is a
 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
 * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
 * `function ({data, priority}) {}` and returns a Boolean.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. No more tasks
 * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`. Invoked with (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
var queue$1 = function (worker, concurrency) {
    var _worker = wrapAsync(worker);
    return queue(function (items, cb) {
        _worker(items[0], cb);
    }, concurrency, 1);
};

/**
 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
 * completed in ascending priority order.
 *
 * @name priorityQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`.
 * Invoked with (task, callback).
 * @param {number} concurrency - An `integer` for determining how many `worker`
 * functions should be run in parallel.  If omitted, the concurrency defaults to
 * `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
 * differences between `queue` and `priorityQueue` objects:
 * * `push(task, priority, [callback])` - `priority` should be a number. If an
 *   array of `tasks` is given, all tasks will be assigned the same priority.
 * * The `unshift` method was removed.
 */
var priorityQueue = function(worker, concurrency) {
    // Start with a normal queue
    var q = queue$1(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function(data, priority, callback) {
        if (callback == null) callback = noop;
        if (typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
            nextNode = nextNode.next;
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                priority: priority,
                callback: callback
            };

            if (nextNode) {
                q._tasks.insertBefore(nextNode, item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
 * to run. Each function can complete with an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @returns undefined
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
function race(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++) {
        wrapAsync(tasks[i])(callback);
    }
}

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
function reduceRight (array, memo, iteratee, callback) {
    var reversed = slice(array).reverse();
    reduce(reversed, memo, iteratee, callback);
}

/**
 * Wraps the async function in another function that always completes with a
 * result object, even when it errors.
 *
 * The result object has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
function reflect(fn) {
    var _fn = wrapAsync(fn);
    return initialParams(function reflectOn(args, reflectCallback) {
        args.push(function callback(error, cbArg) {
            if (error) {
                reflectCallback(null, { error: error });
            } else {
                var value;
                if (arguments.length <= 2) {
                    value = cbArg;
                } else {
                    value = slice(arguments, 1);
                }
                reflectCallback(null, { value: value });
            }
        });

        return _fn.apply(this, args);
    });
}

/**
 * A helper function that wraps an array or an object of functions with `reflect`.
 *
 * @name reflectAll
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.reflect]{@link module:Utils.reflect}
 * @category Util
 * @param {Array|Object|Iterable} tasks - The collection of
 * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
 * @returns {Array} Returns an array of async functions, each wrapped in
 * `async.reflect`
 * @example
 *
 * let tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         // do some more stuff but error ...
 *         callback(new Error('bad stuff happened'));
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ];
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = Error('bad stuff happened')
 *     // results[2].value = 'two'
 * });
 *
 * // an example using an object instead of an array
 * let tasks = {
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         callback('two');
 *     },
 *     three: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 100);
 *     }
 * };
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results.one.value = 'one'
 *     // results.two.error = 'two'
 *     // results.three.value = 'three'
 * });
 */
function reflectAll(tasks) {
    var results;
    if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
    } else {
        results = {};
        baseForOwn(tasks, function(task, key) {
            results[key] = reflect.call(this, task);
        });
    }
    return results;
}

function reject$1(eachfn, arr, iteratee, callback) {
    _filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
            cb(err, !v);
        });
    }, callback);
}

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.reject(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of missing files
 *     createFiles(results);
 * });
 */
var reject = doParallel(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectLimit = doParallelLimit(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectSeries = doLimit(rejectLimit, 1);

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant$1(value) {
  return function() {
    return value;
  };
}

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @see [async.retryable]{@link module:ControlFlow.retryable}
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {AsyncFunction} task - An async function to retry.
 * Invoked with (callback).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 *
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // to retry individual methods that are not as reliable within other
 * // control flow functions, use the `retryable` wrapper:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retryable(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
function retry(opts, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant$1(DEFAULT_INTERVAL)
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ?
                t.interval :
                constant$1(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
    } else {
        parseTimes(options, opts);
        callback = callback || noop;
    }

    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }

    var _task = wrapAsync(task);

    var attempt = 1;
    function retryAttempt() {
        _task(function(err) {
            if (err && attempt++ < options.times &&
                (typeof options.errorFilter != 'function' ||
                    options.errorFilter(err))) {
                setTimeout(retryAttempt, options.intervalFunc(attempt));
            } else {
                callback.apply(null, arguments);
            }
        });
    }

    retryAttempt();
}

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
 * wraps a task and makes it retryable, rather than immediately calling it
 * with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {AsyncFunction} task - the asynchronous function to wrap.
 * This function will be passed any arguments passed to the returned wrapper.
 * Invoked with (...args, callback).
 * @returns {AsyncFunction} The wrapped function, which when invoked, will
 * retry on an error, based on the parameters specified in `opts`.
 * This function will accept the same parameters as `task`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */
var retryable = function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    var _task = wrapAsync(task);
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            _task.apply(null, args.concat(cb));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
};

/**
 * Run the functions in the `tasks` collection in series, each one running once
 * the previous function has completed. If any functions in the series pass an
 * error to its callback, no more functions are run, and `callback` is
 * immediately called with the value of the error. Otherwise, `callback`
 * receives an array of results when `tasks` have completed.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function, and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 *  results from {@link async.series}.
 *
 * **Note** that while many implementations preserve the order of object
 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
 * explicitly states that
 *
 * > The mechanics and order of enumerating the properties is not specified.
 *
 * So if you rely on the order in which your series of functions are executed,
 * and want this to work on all platforms, consider using an array.
 *
 * @name series
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing
 * [async functions]{@link AsyncFunction} to run in series.
 * Each function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This function gets a results array (or object)
 * containing all the result arguments passed to the `task` callbacks. Invoked
 * with (err, result).
 * @example
 * async.series([
 *     function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     },
 *     function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // results is now equal to ['one', 'two']
 * });
 *
 * async.series({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback){
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equal to: {one: 1, two: 2}
 * });
 */
function series(tasks, callback) {
    _parallel(eachOfSeries, tasks, callback);
}

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @example
 *
 * async.some(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
var some = doParallel(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someLimit = doParallelLimit(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in series.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someSeries = doLimit(someLimit, 1);

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a value to use as the sort criteria as
 * its `result`.
 * Invoked with (item, callback).
 * @param {Function} callback - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is the items
 * from the original `coll` sorted by the values returned by the `iteratee`
 * calls. Invoked with (err, results).
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *     fs.stat(file, function(err, stats) {
 *         callback(err, stats.mtime);
 *     });
 * }, function(err, results) {
 *     // results is now the original array of files sorted by
 *     // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x);
 * }, function(err,result) {
 *     // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */
function sortBy (coll, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    map(coll, function (x, callback) {
        _iteratee(x, function (err, criteria) {
            if (err) return callback(err);
            callback(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} asyncFn - The async function to limit in time.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
 * of the control flow functions.
 * Invoke this function with the same parameters as you would `asyncFunc`.
 * @example
 *
 * function myFunction(foo, callback) {
 *     doAsyncTask(foo, function(err, data) {
 *         // handle errors
 *         if (err) return callback(err);
 *
 *         // do some stuff ...
 *
 *         // return processed data
 *         return callback(null, data);
 *     });
 * }
 *
 * var wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }, function(err, data) {
 *     // if `myFunction` takes < 1000 ms to execute, `err`
 *     // and `data` will have their expected values
 *
 *     // else `err` will be an Error with the code 'ETIMEDOUT'
 * });
 */
function timeout(asyncFn, milliseconds, info) {
    var fn = wrapAsync(asyncFn);

    return initialParams(function (args, callback) {
        var timedOut = false;
        var timer;

        function timeoutCallback() {
            var name = asyncFn.name || 'anonymous';
            var error  = new Error('Callback function "' + name + '" timed out.');
            error.code = 'ETIMEDOUT';
            if (info) {
                error.info = info;
            }
            timedOut = true;
            callback(error);
        }

        args.push(function () {
            if (!timedOut) {
                callback.apply(null, arguments);
                clearTimeout(timer);
            }
        });

        // setup timer and call original function
        timer = setTimeout(timeoutCallback, milliseconds);
        fn.apply(null, args);
    });
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;
var nativeMax = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
function timeLimit(count, limit, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    mapLimit(baseRange(0, count, 1), limit, _iteratee, callback);
}

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [map]{@link module:Collections.map}.
 *
 * @name times
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
var times = doLimit(timeLimit, Infinity);

/**
 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 */
var timesSeries = doLimit(timeLimit, 1);

/**
 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
 * element in series, each step potentially mutating an `accumulator` value.
 * The type of the accumulator defaults to the type of collection passed in.
 *
 * @name transform
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
 * it will default to an empty Object or Array, depending on the type of `coll`
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * collection that potentially modifies the accumulator.
 * Invoked with (accumulator, item, key, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the transformed accumulator.
 * Invoked with (err, result).
 * @example
 *
 * async.transform([1,2,3], function(acc, item, index, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         acc.push(item * 2)
 *         callback(null)
 *     });
 * }, function(err, result) {
 *     // result is now equal to [2, 4, 6]
 * });
 *
 * @example
 *
 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
 *     setImmediate(function () {
 *         obj[key] = val * 2;
 *         callback();
 *     })
 * }, function (err, result) {
 *     // result is equal to {a: 2, b: 4, c: 6}
 * })
 */
function transform (coll, accumulator, iteratee, callback) {
    if (arguments.length <= 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
    }
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);

    eachOf(coll, function(v, k, cb) {
        _iteratee(accumulator, v, k, cb);
    }, function(err) {
        callback(err, accumulator);
    });
}

/**
 * It runs each task in series but stops whenever any of the functions were
 * successful. If one of the tasks were successful, the `callback` will be
 * passed the result of the successful task. If all tasks fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name tryEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to
 * run, each function is passed a `callback(err, result)` it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {Function} [callback] - An optional callback which is called when one
 * of the tasks has succeeded, or all have failed. It receives the `err` and
 * `result` arguments of the last attempt at completing the `task`. Invoked with
 * (err, results).
 * @example
 * async.tryEach([
 *     function getDataFromFirstWebsite(callback) {
 *         // Try getting the data from the first website
 *         callback(err, data);
 *     },
 *     function getDataFromSecondWebsite(callback) {
 *         // First website failed,
 *         // Try getting the data from the backup website
 *         callback(err, data);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     Now do something with the data.
 * });
 *
 */
function tryEach(tasks, callback) {
    var error = null;
    var result;
    callback = callback || noop;
    eachSeries(tasks, function(task, callback) {
        wrapAsync(task)(function (err, res/*, ...args*/) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            } else {
                result = res;
            }
            error = err;
            callback(!err);
        });
    }, function () {
        callback(error, result);
    });
}

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {AsyncFunction} fn - the memoized function
 * @returns {AsyncFunction} a function that calls the original unmemoized function
 */
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

/**
 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs.
 *
 * @name whilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns undefined
 * @example
 *
 * var count = 0;
 * async.whilst(
 *     function() { return count < 5; },
 *     function(callback) {
 *         count++;
 *         setTimeout(function() {
 *             callback(null, count);
 *         }, 1000);
 *     },
 *     function (err, n) {
 *         // 5 seconds have passed, n = 5
 *     }
 * );
 */
function whilst(test, iteratee, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    if (!test()) return callback(null);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        if (test()) return _iteratee(next);
        var args = slice(arguments, 1);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs. `callback` will be passed an error and any
 * arguments passed to the final `iteratee`'s callback.
 *
 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
 *
 * @name until
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function until(test, iteratee, callback) {
    whilst(function() {
        return !test.apply(this, arguments);
    }, iteratee, callback);
}

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
var waterfall = function(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        var task = wrapAsync(tasks[taskIndex++]);
        args.push(onlyOnce(next));
        task.apply(null, args);
    }

    function next(err/*, ...args*/) {
        if (err || taskIndex === tasks.length) {
            return callback.apply(null, arguments);
        }
        nextTask(slice(arguments, 1));
    }

    nextTask([]);
};

/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */


/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

var index = {
    apply: apply,
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    asyncify: asyncify,
    auto: auto,
    autoInject: autoInject,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatLimit: concatLimit,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: eachLimit,
    eachLimit: eachLimit$1,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    everySeries: everySeries,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    groupBy: groupBy,
    groupByLimit: groupByLimit,
    groupBySeries: groupBySeries,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    mapValues: mapValues,
    mapValuesLimit: mapValuesLimit,
    mapValuesSeries: mapValuesSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallelLimit,
    parallelLimit: parallelLimit$1,
    priorityQueue: priorityQueue,
    queue: queue$1,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reflect: reflect,
    reflectAll: reflectAll,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    retryable: retryable,
    seq: seq,
    series: series,
    setImmediate: setImmediate$1,
    some: some,
    someLimit: someLimit,
    someSeries: someSeries,
    sortBy: sortBy,
    timeout: timeout,
    times: times,
    timesLimit: timeLimit,
    timesSeries: timesSeries,
    transform: transform,
    tryEach: tryEach,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    allLimit: everyLimit,
    allSeries: everySeries,
    any: some,
    anyLimit: someLimit,
    anySeries: someSeries,
    find: detect,
    findLimit: detectLimit,
    findSeries: detectSeries,
    forEach: eachLimit,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit$1,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify
};

exports['default'] = index;
exports.apply = apply;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.asyncify = asyncify;
exports.auto = auto;
exports.autoInject = autoInject;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatLimit = concatLimit;
exports.concatSeries = concatSeries;
exports.constant = constant;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = eachLimit;
exports.eachLimit = eachLimit$1;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.everySeries = everySeries;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.groupBy = groupBy;
exports.groupByLimit = groupByLimit;
exports.groupBySeries = groupBySeries;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.mapValues = mapValues;
exports.mapValuesLimit = mapValuesLimit;
exports.mapValuesSeries = mapValuesSeries;
exports.memoize = memoize;
exports.nextTick = nextTick;
exports.parallel = parallelLimit;
exports.parallelLimit = parallelLimit$1;
exports.priorityQueue = priorityQueue;
exports.queue = queue$1;
exports.race = race;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reflect = reflect;
exports.reflectAll = reflectAll;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.retryable = retryable;
exports.seq = seq;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.someSeries = someSeries;
exports.sortBy = sortBy;
exports.timeout = timeout;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.tryEach = tryEach;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.allLimit = everyLimit;
exports.allSeries = everySeries;
exports.any = some;
exports.anyLimit = someLimit;
exports.anySeries = someSeries;
exports.find = detect;
exports.findLimit = detectLimit;
exports.findSeries = detectSeries;
exports.forEach = eachLimit;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit$1;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;

Object.defineProperty(exports, '__esModule', { value: true });

})));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(4).setImmediate, __webpack_require__(7), __webpack_require__(5), __webpack_require__(8)(module)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
            (typeof self !== "undefined" && self) ||
            window;
var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(6);
// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof global !== "undefined" && global.setImmediate) ||
                       (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof global !== "undefined" && global.clearImmediate) ||
                         (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5), __webpack_require__(7)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var request = __webpack_require__(10);

var pwyRequestLib = __webpack_require__(107);

var baseExt = exports.baseExt = __webpack_require__(124);

var cookieHelp = exports.cookieHelp = __webpack_require__(106);

var cacheHelp = exports.cacheHelp = __webpack_require__(126);

var loadJs = exports.loadJs = __webpack_require__(127);

var urlHandler = exports.urlHandler = __webpack_require__(128);

var tools = exports.tools = __webpack_require__(113);

var checkInvoiceType = exports.checkInvoiceType = __webpack_require__(129).checkInvoiceType;

var checkInvoiceTypeFull = exports.checkInvoiceTypeFull = __webpack_require__(129).checkInvoiceTypeFull;

var crossHttp = exports.crossHttp = __webpack_require__(130)["default"];

var clientCheck = exports.clientCheck = __webpack_require__(131)["default"];

var kdRequest = exports.kdRequest = request.kdRequest;
var pwyFetch = exports.pwyFetch = pwyRequestLib.pwyFetch;
var pwyRequest = exports.pwyRequest = pwyRequestLib.kdRequest;
var paramJson = exports.paramJson = request.param;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.kdRequest = exports.param = exports.prePath = undefined;

var _regenerator = __webpack_require__(11);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(14);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = __webpack_require__(15);

var _promise2 = _interopRequireDefault(_promise);

var _stringify = __webpack_require__(86);

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

var kdRequest = exports.kdRequest = function () {
  var _ref3 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee(_ref4) {
    var _ref4$urlPre = _ref4.urlPre,
        urlPre = _ref4$urlPre === undefined ? '' : _ref4$urlPre,
        _ref4$method = _ref4.method,
        method = _ref4$method === undefined ? 'GET' : _ref4$method,
        _ref4$url = _ref4.url,
        url = _ref4$url === undefined ? '' : _ref4$url,
        _ref4$data = _ref4.data,
        data = _ref4$data === undefined ? '' : _ref4$data,
        _ref4$mode = _ref4.mode,
        mode = _ref4$mode === undefined ? 'cors' : _ref4$mode,
        _ref4$timeout = _ref4.timeout,
        timeout = _ref4$timeout === undefined ? 60000 : _ref4$timeout,
        _ref4$redirect = _ref4.redirect,
        redirect = _ref4$redirect === undefined ? 'follow' : _ref4$redirect,
        _ref4$dataType = _ref4.dataType,
        dataType = _ref4$dataType === undefined ? 'json' : _ref4$dataType,
        _ref4$credentials = _ref4.credentials,
        credentials = _ref4$credentials === undefined ? 'include' : _ref4$credentials,
        handlerError = _ref4.handlerError,
        _ref4$headers = _ref4.headers,
        headers = _ref4$headers === undefined ? {
      'Content-Type': 'application/json'
    } : _ref4$headers;
    var csrfToken, response, resData;
    return _regenerator2["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!/^http/.test(url)) {
              url = urlPre + url;
            }

            csrfToken = (0, _cookie_helps.getCookie)('csrfToken');

            if (url.indexOf('?') === -1) {
              url = url + '?_csrf=' + csrfToken;
            } else {
              url = url + '&_csrf=' + csrfToken;
            }

            if (csrfToken) {
              try {
                headers['x-csrf-token'] = csrfToken;
                (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);
              } catch (e) {
                (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);
              }
            }

            if (!window.fetch) {
              _context.next = 17;
              break;
            }

            _context.next = 7;
            return myFetch({
              url: url,
              data: data,
              dataType: dataType,
              headers: headers,
              method: method
            });

          case 7:
            response = _context.sent;

            if (!(response.status !== 200)) {
              _context.next = 12;
              break;
            }

            return _context.abrupt('return', {
              errcode: '5000',
              description: "\u8BF7\u6C42\u51FA\u9519(" + response.status + ')'
            });

          case 12:
            _context.next = 14;
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

          case 14:
            return _context.abrupt('return', _context.sent);

          case 15:
            _context.next = 22;
            break;

          case 17:
            if (method === 'GET') {
              data = param(data);
            } else if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3["default"])(data)) === 'object' && dataType === 'json') {
              data = (0, _stringify2["default"])(data);
            }

            _context.next = 20;
            return myXhr({
              method: method,
              url: url,
              data: data,
              timeout: timeout,
              credentials: credentials,
              headers: headers
            });

          case 20:
            resData = _context.sent;
            return _context.abrupt('return', resData);

          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function kdRequest(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var _cookie_helps = __webpack_require__(106);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var prePath = exports.prePath = '/';

var param = exports.param = function param(data) {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
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
      method = _ref$method === undefined ? 'GET' : _ref$method,
      _ref$url = _ref.url,
      url = _ref$url === undefined ? '' : _ref$url,
      _ref$data = _ref.data,
      data = _ref$data === undefined ? '' : _ref$data,
      _ref$mode = _ref.mode,
      mode = _ref$mode === undefined ? 'cors' : _ref$mode,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 60000 : _ref$timeout,
      _ref$redirect = _ref.redirect,
      redirect = _ref$redirect === undefined ? 'follow' : _ref$redirect,
      _ref$dataType = _ref.dataType,
      dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
      _ref$credentials = _ref.credentials,
      credentials = _ref$credentials === undefined ? 'include' : _ref$credentials,
      _ref$headers = _ref.headers,
      headers = _ref$headers === undefined ? {
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
  } else if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3["default"])(data)) === 'object' && dataType === 'json') {
    data = (0, _stringify2["default"])(data);
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
      method = _ref2$method === undefined ? 'GET' : _ref2$method,
      _ref2$url = _ref2.url,
      url = _ref2$url === undefined ? '' : _ref2$url,
      _ref2$data = _ref2.data,
      data = _ref2$data === undefined ? '' : _ref2$data,
      _ref2$timeout = _ref2.timeout,
      timeout = _ref2$timeout === undefined ? 60000 : _ref2$timeout,
      _ref2$credentials = _ref2.credentials,
      credentials = _ref2$credentials === undefined ? 'include' : _ref2$credentials,
      contentType = _ref2.contentType,
      headers = _ref2.headers,
      success = _ref2.success;
  contentType = headers['Content-Type'] || 'application/json;charset=UTF-8';
  return new _promise2["default"](function (resolve, reject) {
    var xhr = void 0;
    var csrfToken = (0, _cookie_helps.getCookie)('csrfToken');
    (0, _cookie_helps.setCookie)('csrfToken', csrfToken, 30 * 60);

    if (XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }

    if (!xhr && typeof XDomainRequest !== 'undefined') {
      xhr = new XDomainRequest();
    }

    try {
      xhr.timeout = timeout;
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
            description: "\u8BF7\u6C42\u51FA\u9519" + status
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
    } catch (error) {}

    xhr.send(data);
  });
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(12);


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = __webpack_require__(13);

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}


/***/ }),
/* 13 */
/***/ (function(module, exports) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _promise = __webpack_require__(15);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return _promise2.default.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(16), __esModule: true };

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(17);
__webpack_require__(18);
__webpack_require__(62);
__webpack_require__(66);
__webpack_require__(84);
__webpack_require__(85);
module.exports = __webpack_require__(26).Promise;


/***/ }),
/* 17 */
/***/ (function(module, exports) {



/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(19)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(22)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(20);
var defined = __webpack_require__(21);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(23);
var $export = __webpack_require__(24);
var redefine = __webpack_require__(40);
var hide = __webpack_require__(29);
var Iterators = __webpack_require__(41);
var $iterCreate = __webpack_require__(42);
var setToStringTag = __webpack_require__(58);
var getPrototypeOf = __webpack_require__(60);
var ITERATOR = __webpack_require__(59)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(25);
var core = __webpack_require__(26);
var ctx = __webpack_require__(27);
var hide = __webpack_require__(29);
var has = __webpack_require__(39);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 26 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(28);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(30);
var createDesc = __webpack_require__(38);
module.exports = __webpack_require__(34) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(31);
var IE8_DOM_DEFINE = __webpack_require__(33);
var toPrimitive = __webpack_require__(37);
var dP = Object.defineProperty;

exports.f = __webpack_require__(34) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(32);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(34) && !__webpack_require__(35)(function () {
  return Object.defineProperty(__webpack_require__(36)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(35)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(32);
var document = __webpack_require__(25).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(32);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 39 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(29);


/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(43);
var descriptor = __webpack_require__(38);
var setToStringTag = __webpack_require__(58);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(29)(IteratorPrototype, __webpack_require__(59)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(31);
var dPs = __webpack_require__(44);
var enumBugKeys = __webpack_require__(56);
var IE_PROTO = __webpack_require__(53)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(36)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(57).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(30);
var anObject = __webpack_require__(31);
var getKeys = __webpack_require__(45);

module.exports = __webpack_require__(34) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(46);
var enumBugKeys = __webpack_require__(56);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(39);
var toIObject = __webpack_require__(47);
var arrayIndexOf = __webpack_require__(50)(false);
var IE_PROTO = __webpack_require__(53)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(48);
var defined = __webpack_require__(21);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(49);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 49 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(47);
var toLength = __webpack_require__(51);
var toAbsoluteIndex = __webpack_require__(52);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(20);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(20);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(54)('keys');
var uid = __webpack_require__(55);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(26);
var global = __webpack_require__(25);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(23) ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 55 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 56 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(25).document;
module.exports = document && document.documentElement;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(30).f;
var has = __webpack_require__(39);
var TAG = __webpack_require__(59)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(54)('wks');
var uid = __webpack_require__(55);
var Symbol = __webpack_require__(25).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(39);
var toObject = __webpack_require__(61);
var IE_PROTO = __webpack_require__(53)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(21);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(63);
var global = __webpack_require__(25);
var hide = __webpack_require__(29);
var Iterators = __webpack_require__(41);
var TO_STRING_TAG = __webpack_require__(59)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(64);
var step = __webpack_require__(65);
var Iterators = __webpack_require__(41);
var toIObject = __webpack_require__(47);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(22)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 64 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 65 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(23);
var global = __webpack_require__(25);
var ctx = __webpack_require__(27);
var classof = __webpack_require__(67);
var $export = __webpack_require__(24);
var isObject = __webpack_require__(32);
var aFunction = __webpack_require__(28);
var anInstance = __webpack_require__(68);
var forOf = __webpack_require__(69);
var speciesConstructor = __webpack_require__(73);
var task = __webpack_require__(74).set;
var microtask = __webpack_require__(76)();
var newPromiseCapabilityModule = __webpack_require__(77);
var perform = __webpack_require__(78);
var userAgent = __webpack_require__(79);
var promiseResolve = __webpack_require__(80);
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__(59)('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__(81)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__(58)($Promise, PROMISE);
__webpack_require__(82)(PROMISE);
Wrapper = __webpack_require__(26)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(83)(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(49);
var TAG = __webpack_require__(59)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 68 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(27);
var call = __webpack_require__(70);
var isArrayIter = __webpack_require__(71);
var anObject = __webpack_require__(31);
var toLength = __webpack_require__(51);
var getIterFn = __webpack_require__(72);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(31);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(41);
var ITERATOR = __webpack_require__(59)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(67);
var ITERATOR = __webpack_require__(59)('iterator');
var Iterators = __webpack_require__(41);
module.exports = __webpack_require__(26).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(31);
var aFunction = __webpack_require__(28);
var SPECIES = __webpack_require__(59)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(27);
var invoke = __webpack_require__(75);
var html = __webpack_require__(57);
var cel = __webpack_require__(36);
var global = __webpack_require__(25);
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__(49)(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),
/* 75 */
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(25);
var macrotask = __webpack_require__(74).set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__(49)(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__(28);

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),
/* 78 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(25);
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(31);
var isObject = __webpack_require__(32);
var newPromiseCapability = __webpack_require__(77);

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var hide = __webpack_require__(29);
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(25);
var core = __webpack_require__(26);
var dP = __webpack_require__(30);
var DESCRIPTORS = __webpack_require__(34);
var SPECIES = __webpack_require__(59)('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(59)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// https://github.com/tc39/proposal-promise-finally

var $export = __webpack_require__(24);
var core = __webpack_require__(26);
var global = __webpack_require__(25);
var speciesConstructor = __webpack_require__(73);
var promiseResolve = __webpack_require__(80);

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://github.com/tc39/proposal-promise-try
var $export = __webpack_require__(24);
var newPromiseCapability = __webpack_require__(77);
var perform = __webpack_require__(78);

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(87), __esModule: true };

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(26);
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _iterator = __webpack_require__(89);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(92);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(90), __esModule: true };

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(18);
__webpack_require__(62);
module.exports = __webpack_require__(91).f('iterator');


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(59);


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(93), __esModule: true };

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(94);
__webpack_require__(17);
__webpack_require__(104);
__webpack_require__(105);
module.exports = __webpack_require__(26).Symbol;


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(25);
var has = __webpack_require__(39);
var DESCRIPTORS = __webpack_require__(34);
var $export = __webpack_require__(24);
var redefine = __webpack_require__(40);
var META = __webpack_require__(95).KEY;
var $fails = __webpack_require__(35);
var shared = __webpack_require__(54);
var setToStringTag = __webpack_require__(58);
var uid = __webpack_require__(55);
var wks = __webpack_require__(59);
var wksExt = __webpack_require__(91);
var wksDefine = __webpack_require__(96);
var enumKeys = __webpack_require__(97);
var isArray = __webpack_require__(100);
var anObject = __webpack_require__(31);
var isObject = __webpack_require__(32);
var toObject = __webpack_require__(61);
var toIObject = __webpack_require__(47);
var toPrimitive = __webpack_require__(37);
var createDesc = __webpack_require__(38);
var _create = __webpack_require__(43);
var gOPNExt = __webpack_require__(101);
var $GOPD = __webpack_require__(103);
var $GOPS = __webpack_require__(98);
var $DP = __webpack_require__(30);
var $keys = __webpack_require__(45);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(102).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(99).f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(23)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(29)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(55)('meta');
var isObject = __webpack_require__(32);
var has = __webpack_require__(39);
var setDesc = __webpack_require__(30).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(35)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(25);
var core = __webpack_require__(26);
var LIBRARY = __webpack_require__(23);
var wksExt = __webpack_require__(91);
var defineProperty = __webpack_require__(30).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(45);
var gOPS = __webpack_require__(98);
var pIE = __webpack_require__(99);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 98 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 99 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(49);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(47);
var gOPN = __webpack_require__(102).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(46);
var hiddenKeys = __webpack_require__(56).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(99);
var createDesc = __webpack_require__(38);
var toIObject = __webpack_require__(47);
var toPrimitive = __webpack_require__(37);
var has = __webpack_require__(39);
var IE8_DOM_DEFINE = __webpack_require__(33);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(34) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(96)('asyncIterator');


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(96)('observable');


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var getCookie = exports.getCookie = function getCookie(name) {
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

var clearCookie = exports.clearCookie = function clearCookie(name) {
  setCookie(name, '', -1);
};

var setCookie = exports.setCookie = function setCookie(name, value, seconds) {
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

var clearAllCookie = exports.clearAllCookie = function clearAllCookie() {
  var strCookie = document.cookie;
  var arrCookie = strCookie.split("; ");

  for (var i = 0, len = arrCookie.length; i < len; i++) {
    var arr = arrCookie[i].split("=");

    if (arr.length > 0) {
      setCookie(arr[0], '', -1);
    }
  }
};

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.kdRequest = exports.pwyFetch = exports.errcodeInfo = undefined;

var _stringify = __webpack_require__(86);

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = __webpack_require__(11);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(14);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = __webpack_require__(108);

var _extends3 = _interopRequireDefault(_extends2);

var _promise = __webpack_require__(15);

var _promise2 = _interopRequireDefault(_promise);

var kdRequest = exports.kdRequest = function () {
  var _ref6 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee5(_ref7) {
    var _ref7$method = _ref7.method,
        method = _ref7$method === undefined ? 'GET' : _ref7$method,
        _ref7$url = _ref7.url,
        url = _ref7$url === undefined ? '' : _ref7$url,
        _ref7$data = _ref7.data,
        data = _ref7$data === undefined ? {} : _ref7$data,
        _ref7$timeout = _ref7.timeout,
        timeout = _ref7$timeout === undefined ? 90000 : _ref7$timeout,
        _ref7$dataType = _ref7.dataType,
        dataType = _ref7$dataType === undefined ? 'json' : _ref7$dataType,
        _ref7$headers = _ref7.headers,
        headers = _ref7$headers === undefined ? {
      'Content-Type': 'application/json'
    } : _ref7$headers;
    return _regenerator2["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return pwyFetch(url, {
              body: data,
              headers: headers,
              timeout: timeout,
              dataType: dataType,
              method: method.toUpperCase()
            });

          case 2:
            return _context5.abrupt('return', _context5.sent);

          case 3:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function kdRequest(_x13) {
    return _ref6.apply(this, arguments);
  };
}();

var _cookie_helps = __webpack_require__(106);

var _kdRequest = __webpack_require__(10);

var _tools = __webpack_require__(113);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var defaultTimeout = 90000;
var errcodeInfo = exports.errcodeInfo = {
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
  return new _promise2["default"](function (resolve) {
    var _ref = options || {},
        _ref$dataType = _ref.dataType,
        dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
        method = _ref.method,
        _ref$headers = _ref.headers,
        headers = _ref$headers === undefined ? {} : _ref$headers,
        _ref$mode = _ref.mode,
        mode = _ref$mode === undefined ? 'cors' : _ref$mode,
        _ref$credentials = _ref.credentials,
        credentials = _ref$credentials === undefined ? 'include' : _ref$credentials,
        _ref$redirect = _ref.redirect,
        redirect = _ref$redirect === undefined ? 'follow' : _ref$redirect,
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

    requestObj.headers = headers;

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
        var handlerRes = function handlerRes(resText) {
          var res = void 0;

          if (dataType === 'json') {
            try {
              res = JSON.parse(resText);
            } catch (err1) {
              (0, _tools.consoleLog)(err1);
              res = (0, _extends3["default"])({}, errcodeInfo.serverErr);
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
            (0, _tools.consoleLog)(err2);
            handler(errcodeInfo.requestErr);
          });
        }
      }
    })["catch"](function (err3) {
      (0, _tools.consoleLog)(err3);
      handler(errcodeInfo.requestErr);
    });
  });
};

var __createTimeoutFetch = function () {
  var _ref2 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee(url, options) {
    return _regenerator2["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _promise2["default"].race([createFetch(url, options), new _promise2["default"](function (resolve) {
              setTimeout(function () {
                var res = (0, _extends3["default"])({}, errcodeInfo.timeoutErr);

                if (typeof options.callback === 'function') {
                  options.callback(res);
                } else {
                  resolve(res);
                }
              }, options.timeout || defaultTimeout);
            })]);

          case 2:
            return _context.abrupt('return', _context.sent);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function __createTimeoutFetch(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var __XMLHttpRequest = function () {
  var _ref3 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee2(url, options) {
    return _regenerator2["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', new _promise2["default"](function (resolve) {
              var xhr = new window.XMLHttpRequest();
              var _options$method = options.method,
                  method = _options$method === undefined ? 'GET' : _options$method,
                  _options$body = options.body,
                  body = _options$body === undefined ? null : _options$body,
                  _options$dataType = options.dataType,
                  dataType = _options$dataType === undefined ? 'json' : _options$dataType,
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
                    (0, _tools.consoleLog)(error);
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
                      (0, _tools.consoleLog)(error);
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
                      (0, _tools.consoleLog)(error);
                    }
                  }

                  handlerOnProgress(evt.loaded, evt.total);
                };
              }

              xhr.onreadystatechange = function () {
                handlerOnProgress();
              };

              xhr.onload = function () {
                if (xhr.readyState === 4) {
                  var status = xhr.status;

                  if (status === 200) {
                    var resText = xhr.responseText;
                    var res = void 0;

                    if (dataType === 'json') {
                      try {
                        res = JSON.parse(resText);
                      } catch (err1) {
                        (0, _tools.consoleLog)(err1);
                        res = (0, _extends3["default"])({}, errcodeInfo.serverErr);
                      }

                      handler(res);
                    } else {
                      handler(resText);
                    }
                  } else {
                    handler(errcodeInfo.serverErr);
                  }
                }
              };

              xhr.onerror = function (error) {
                (0, _tools.consoleLog)(error);
                handler(errcodeInfo.requestErr);
                handlerOnProgress();
              };

              var csrfToken = (0, _cookie_helps.getCookie)('csrfToken');

              if (options && options.headers && options.headers['Content-Type']) {
                xhr.setRequestHeader('Content-Type', options.headers['Content-Type']);
              }

              if (csrfToken) {
                xhr.setRequestHeader('x-csrf-token', csrfToken);
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
            }));

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function __XMLHttpRequest(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

var __XDomainRequest = function () {
  var _ref4 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee3(url, options) {
    var __innerXdr;

    return _regenerator2["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            __innerXdr = new _promise2["default"](function (resolve) {
              var xdr = new window.XDomainRequest();
              var _options$method2 = options.method,
                  method = _options$method2 === undefined ? 'GET' : _options$method2,
                  _options$body2 = options.body,
                  body = _options$body2 === undefined ? null : _options$body2,
                  callback = options.callback,
                  _options$dataType2 = options.dataType,
                  dataType = _options$dataType2 === undefined ? 'json' : _options$dataType2;

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
                (0, _tools.consoleLog)(error);
                handler(errcodeInfo.requestErr);
              };

              xdr.onload = function () {
                var resText = xhr.responseText;
                var res = void 0;

                if (dataType === 'json') {
                  try {
                    res = JSON.parse(resText);
                  } catch (err1) {
                    (0, _tools.consoleLog)(err1);
                    res = (0, _extends3["default"])({}, errcodeInfo.serverErr);
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
            _context3.next = 3;
            return _promise2["default"].race([__innerXdr, new _promise2["default"](function (r) {
              setTimeout(function () {
                var res = (0, _extends3["default"])({}, errcodeInfo.timeoutErr);

                if (typeof callback === 'function') {
                  callback(res);
                } else {
                  r(res);
                }
              }, options.timeout || defaultTimeout);
            })]);

          case 3:
            return _context3.abrupt('return', _context3.sent);

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function __XDomainRequest(_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();

var pwyFetch = exports.pwyFetch = function () {
  var _ref5 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee4(url, options) {
    var method, body, headers, upperMethod, contentType, res;
    return _regenerator2["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            method = options.method || 'GET';
            body = options.data || options.body;
            headers = options.headers || {};
            upperMethod = method.toUpperCase();
            contentType = options.contentType || 'json';

            if (contentType === 'json') {
              headers['Content-Type'] = 'application/json; charset=UTF-8';
            }

            options = (0, _extends3["default"])({}, options, {
              headers: headers,
              body: body
            });

            if (upperMethod === 'GET') {
              if (typeof options.disabledCache === 'undefined' || options.disabledCache === false) {
                if (url.indexOf('?') === -1) {
                  url = url + '?random=' + Math.random();
                } else {
                  url = url + '&random=' + Math.random();
                }
              }

              if (body && (typeof body === 'undefined' ? 'undefined' : (0, _typeof3["default"])(body)) === 'object') {
                body = (0, _kdRequest.param)(body, true);

                if (body) {
                  url += '&' + body;
                }
              }
            }

            if (upperMethod === 'POST' && body && (typeof body === 'undefined' ? 'undefined' : (0, _typeof3["default"])(body)) === 'object' && contentType === 'json') {
              options = (0, _extends3["default"])({}, options, {
                body: (0, _stringify2["default"])(body)
              });
            }

            res = void 0;

            if (!(window.fetch && !options.onRequestProgress && !options.disabledFetch && !options.onProgress)) {
              _context4.next = 14;
              break;
            }

            res = __createTimeoutFetch(url, options);
            _context4.next = 24;
            break;

          case 14:
            if (!window.XMLHttpRequest) {
              _context4.next = 20;
              break;
            }

            _context4.next = 17;
            return __XMLHttpRequest(url, options);

          case 17:
            res = _context4.sent;
            _context4.next = 24;
            break;

          case 20:
            if (!window.XDomainRequest) {
              _context4.next = 24;
              break;
            }

            _context4.next = 23;
            return __XDomainRequest(url, options);

          case 23:
            res = _context4.sent;

          case 24:
            return _context4.abrupt('return', res);

          case 25:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function pwyFetch(_x11, _x12) {
    return _ref5.apply(this, arguments);
  };
}();

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _assign = __webpack_require__(109);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _assign2.default || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(110), __esModule: true };

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(111);
module.exports = __webpack_require__(26).Object.assign;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(24);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(112) });


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var DESCRIPTORS = __webpack_require__(34);
var getKeys = __webpack_require__(45);
var gOPS = __webpack_require__(98);
var pIE = __webpack_require__(99);
var toObject = __webpack_require__(61);
var IObject = __webpack_require__(48);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(35)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || isEnum.call(S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readAsBinaryString = exports.getInvoiceErrInfo = exports.isInVisualArea = exports.consoleLog = exports.getUUId = exports.downloadFile = exports.blobToFile = exports.getInvoiceQrInfoNew = exports.getInvoiceQrInfo = exports.checkInvoiceTin = exports.checkInvoiceTitle = exports.getInvoiceTypeName = undefined;

var _promise = __webpack_require__(15);

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = __webpack_require__(86);

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = __webpack_require__(114);

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = __webpack_require__(109);

var _assign2 = _interopRequireDefault(_assign);

var _kdRequest = __webpack_require__(10);

var _cookie_helps = __webpack_require__(106);

var _pwyConstants = __webpack_require__(118);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

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
    return (0, _assign2["default"])((0, _defineProperty3["default"])({}, arr[0], arr[1]), res);
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
  if (qrStr.indexOf('https' || false) > -1 && qrStr.indexOf('?')) {
    var _urlSearch = urlSearch(qrStr),
        _urlSearch$bill_num = _urlSearch.bill_num,
        bill_num = _urlSearch$bill_num === undefined ? '' : _urlSearch$bill_num,
        _urlSearch$total_amou = _urlSearch.total_amount,
        total_amount = _urlSearch$total_amou === undefined ? '' : _urlSearch$total_amou,
        _urlSearch$hash = _urlSearch.hash,
        hash = _urlSearch$hash === undefined ? '' : _urlSearch$hash;

    if (bill_num != '' && total_amount != '' && hash != '') {
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
    var targetFile = new window.File([blobData], filename, {
      type: type
    });
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

  if (method === 'get') {
    url += '?' + (0, _kdRequest.param)(data);
  }

  ;
  xhr.open(method, url, true);
  xhr.responseType = 'blob';
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.timeout = timeout;

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
          var content = reader.result;

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
        var eleLink = document.createElement('a');
        eleLink.download = decodeURIComponent(disposition.split(';')[1].split('=')[1]);
        eleLink.style.display = 'none';
        eleLink.href = URL.createObjectURL(new Blob([blob]));
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
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
    var dataStr = (0, _stringify2["default"])(data);
    var newData = {};
    newData[key] = dataStr;
    xhr.send((0, _stringify2["default"])(newData));
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
      downloadType = _opt$downloadType === undefined ? 'form' : _opt$downloadType,
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
        myEndCallback({
          errcode: '5004',
          description: '请求超时，请稍后再试！'
        });
      } else {
        var result = (0, _cookie_helps.getCookie)('downloadResult');

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
    inputEl.value = (typeof data === 'undefined' ? 'undefined' : (0, _typeof3["default"])(data)) === 'object' ? (0, _stringify2["default"])(data) : data;
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

  if ((0, _typeof3["default"])(window.console) === 'object') {
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
  return new _promise2["default"](function (resolve) {
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

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(115);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(116), __esModule: true };

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(117);
var $Object = __webpack_require__(26).Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(24);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(34), 'Object', { defineProperty: __webpack_require__(30).f });


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

var invoiceEditInfo = __webpack_require__(119);

var invoiceTypes = __webpack_require__(121);

var selectSource = __webpack_require__(120);

var invoiceStatus = __webpack_require__(122);

var warningCodesInfo = __webpack_require__(123);

module.exports = {
  invoiceEditInfo: invoiceEditInfo,
  invoiceTypes: invoiceTypes,
  selectSource: selectSource,
  invoiceStatus: invoiceStatus,
  waringCodes: warningCodesInfo.waringCodes,
  getWaringCodesResult: warningCodesInfo.getWaringCodesResult
};

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(120),
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
/* 120 */
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
/* 121 */
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
  text: '其它票',
  value: 11,
  allowDeduction: 1
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
/* 122 */
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
/* 123 */
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
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

Object.setPrototypeOf = __webpack_require__(125);

if ((typeof window === 'undefined' ? 'undefined' : (0, _typeof3["default"])(window)) === 'object') {
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
};

Number.method('integer', function () {
  return Math[this < 0 ? 'ceil' : 'floor'](this);
});
String.method('trim', function () {
  return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
});
String.method('replaceInclude', function () {
  return this.replace('）', ')').replace('（', '(');
});
String.method('entityify', function (opt) {
  var entity = {
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
  };

  if ((typeof opt === 'undefined' ? 'undefined' : (0, _typeof3["default"])(opt)) !== undefined) {
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
});
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
/* 125 */
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
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearCache = exports.getCache = exports.setCache = undefined;

var _stringify = __webpack_require__(86);

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var _require = __webpack_require__(106),
    setCookie = _require.setCookie,
    clearCookie = _require.clearCookie;

var setCache = exports.setCache = function setCache(key, value, flag) {
  if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3["default"])(value)) === 'object') {
    value = escape((0, _stringify2["default"])(value));
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

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadScripts = exports.use = exports.syncUse = exports.getLoadedJs = undefined;

var _promise = __webpack_require__(15);

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var getLoadedJs = exports.getLoadedJs = function getLoadedJs() {
  var loadedUnAMDScripts = [];

  if ((typeof document === 'undefined' ? 'undefined' : (0, _typeof3["default"])(document)) === 'object' && document.getElementsByTagName) {
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
  return new _promise2["default"](function (resolve) {
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
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkInvoiceTypeFull = checkInvoiceTypeFull;

var blockchain_filter = function blockchain_filter(fpInfo) {
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
};

var checkInvoiceType = exports.checkInvoiceType = function checkInvoiceType(fpdm, fphm) {
  if (fpdm) {
    fpdm += '';
  }

  if (fphm) {
    fphm += '';
  }

  var last3Str = fpdm.substr(fpdm.length - 3);
  var last2Str = fpdm.substr(fpdm.length - 2);
  var firstStr = fpdm.substr(0, 1);
  var sixthStr = fpdm.substr(5, 1);
  var eighthStr = fpdm.substr(7, 1);

  if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
    return 4;
  }

  if (fpdm.length == 12) {
    if (firstStr == '0' && last2Str == '12') {
      return 15;
    }

    if (firstStr === '0' && last2Str === '17') {
      return 13;
    }

    if (firstStr === '0' && (last2Str === '06' || last2Str === '07')) {
      return 5;
    }

    if (firstStr === '0' && last2Str === '13') {
      return 2;
    }

    if (sixthStr == '1' || sixthStr == '2') {
      if (eighthStr == '2') {
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
    return 5;
  }

  var fpdmLength = fpdm.length;

  if (fpdmLength == 12) {
    if (fpdm.length == 12 && fphm.length == 8) {
      if (fpdm.startsWith('14403') && '9' === fpdm.substr(8, 9)) {
        return 1;
      }

      if (fpdm.startsWith('0') && fpdm.endsWith('13')) {
        return 2;
      }
    }

    if (fpdm.startsWith('1') && fpdm.substr(7, 8).equals('2')) {
      return 12;
    }

    if (fpdm.endsWith('11') && fpdm.startsWith('0')) {
      return 1;
    }

    if (fpdm.endsWith('12') && fpdm.startsWith('0')) {
      return 15;
    }

    if (fpdm.endsWith('04') || fpdm.endsWith('05')) {
      return 3;
    }

    if (fpdm.endsWith('06') || fpdm.endsWith('07')) {
      return 5;
    }

    if (fpdm.endsWith('17') && fpdm.startsWith('0')) {
      return 13;
    } else {
      return 3;
    }
  } else if (fpdmLength == 10) {
    if (fpdm.endsWith('130') || fpdm.endsWith('140') || fpdm.endsWith('160') || fpdm.endsWith('170')) {
      return 4;
    } else {
      return 3;
    }
  } else {
    return 3;
  }
}

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = __webpack_require__(86);

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = __webpack_require__(15);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var crossHttp = function crossHttp(_ref) {
  var _ref$method = _ref.method,
      method = _ref$method === undefined ? 'POST' : _ref$method,
      _ref$data = _ref.data,
      data = _ref$data === undefined ? '' : _ref$data,
      _ref$withCredentials = _ref.withCredentials,
      withCredentials = _ref$withCredentials === undefined ? false : _ref$withCredentials,
      _ref$dataType = _ref.dataType,
      dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
      _ref$contentType = _ref.contentType,
      contentType = _ref$contentType === undefined ? 'text/plain' : _ref$contentType,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 60000 : _ref$timeout,
      _ref$url = _ref.url,
      url = _ref$url === undefined ? 'http://127.0.0.1:52320/cryptctl' : _ref$url,
      onTimeout = _ref.onTimeout,
      onError = _ref.onError,
      success = _ref.success;
  return new _promise2["default"](function (resolve, reject) {
    var xhr = null;

    if (XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }

    if (withCredentials && typeof xhr.withCredentials !== 'undefined') {
      xhr.withCredentials = true;
    }

    if (!xhr && typeof XDomainRequest !== 'undefined') {
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

      xhr.open(method, url, true);

      if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3["default"])(data)) === 'object') {
        data = (0, _stringify2["default"])(data);
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

exports["default"] = crossHttp;

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var clientCheck = function clientCheck() {
  var engine = {
    ie: 0,
    gecko: 0,
    webkit: 0,
    khtml: 0,
    opera: 0,
    ver: null
  };
  var browser = {
    ie: 0,
    firefox: 0,
    safari: 0,
    konq: 0,
    opera: 0,
    chrome: 0,
    ver: null
  };
  var system = {
    win: false,
    mac: false,
    x11: false,
    iphone: false,
    ipod: false,
    ipad: false,
    ios: false,
    android: false,
    nokiaN: false,
    winMobile: false,
    wii: false,
    ps: false
  };
  var ua = navigator.userAgent;

  if (window.opera) {
    engine.ver = browser.ver = window.opera.version();
    engine.opera = browser.opera = parseFloat(engine.ver);
  } else if (/AppleWebKit\/(\S+)/.test(ua)) {
    engine.ver = RegExp['$1'];
    engine.webkit = parseFloat(engine.ver);

    if (/Chrome\/(\S+)/.test(ua)) {
      browser.ver = RegExp['$1'];
      browser.chrome = parseFloat(browser.ver);
    } else if (/Version\/(\S+)/.test(ua)) {
      browser.ver = RegExp['$1'];
      browser.safari = parseFloat(browser.ver);
    } else {
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
    engine.gecko = parseFloat(engine.ver);

    if (/Firefox\/(\S+)/.test(ua)) {
      browser.ver = RegExp['$1'];
      browser.firefox = parseFloat(browser.ver);
    }
  } else if (/MSIE ([^;]+)/.test(ua)) {
    engine.ver = browser.ver = RegExp['$1'];
    engine.ie = browser.ie = parseFloat(engine.ver);
  } else if (/Trident\/7.0/.test(ua) && /rv:([^\)]+)\)/.test(ua)) {
    engine.ver = browser.ver = RegExp['$1'];
    engine.ie = browser.ie = parseFloat(engine.ver);
  } else if (/Edge\/(\S+)/.test(ua)) {
    engine.ver = browser.ver = RegExp['$1'];
    engine.ie = browser.ie = parseFloat(engine.ver);
  }

  browser.ie = engine.ie;
  browser.opera = engine.opera;
  var p = navigator.platform;
  system.win = p.indexOf('Win') == 0;
  system.mac = p.indexOf('Mac') == 0;
  system.x11 = p == 'X11' || p.indexOf('Linux') == 0;

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
  }

  system.iphone = ua.indexOf('iPhone') > -1;
  system.ipod = ua.indexOf('iPod') > -1;
  system.ipad = ua.indexOf('iPad') > -1;
  system.nokiaN = ua.indexOf('NokiaN') > -1;

  if (system.win == 'CE') {
    system.winMobile = system.win;
  } else if (system.win == 'Ph') {
    if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
      ;
      system.win = 'Phone';
      system.winMobile = parseFloat(RegExp['$1']);
    }
  }

  if (system.mac && ua.indexOf('Mobile') > -1) {
    if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
      system.ios = parseFloat(RegExp.$1.replace('_', '.'));
    } else {
      system.ios = 2;
    }
  }

  if (/Android (\d+\.\d+)/.test(ua)) {
    system.android = parseFloat(RegExp.$1);
  }

  system.wii = ua.indexOf('Wii') > -1;
  system.ps = /playstation/i.test(ua);
  return {
    engine: engine,
    browser: browser,
    system: system
  };
};

exports["default"] = clientCheck;

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

var processUtils = __webpack_require__(133);

var OperateCanvas = __webpack_require__(134)["default"];

var _require = __webpack_require__(135),
    compressImgFile = _require.compressImgFile;

module.exports = {
  adjustSize: processUtils.adjustSize,
  loadImage: processUtils.loadImage,
  base64ToFile: processUtils.base64ToFile,
  normalize: processUtils.normalize,
  getRotateRect: processUtils.getRotateRect,
  cuteImage: processUtils.cuteImage,
  markImage: processUtils.markImage,
  sortByRegion: processUtils.sortByRegion,
  OperateCanvas: OperateCanvas,
  compressImgFile: compressImgFile
};

/***/ }),
/* 133 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjustSize", function() { return adjustSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadImage", function() { return loadImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "base64ToFile", function() { return base64ToFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRotateRect", function() { return getRotateRect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cuteImage", function() { return cuteImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sortByRegion", function() { return sortByRegion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjuestRect", function() { return adjuestRect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showImage", function() { return showImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "markImage", function() { return markImage; });
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// 等比例换算图像长宽
function adjustSize(width, height, maxWidth, maxHeight) {
  var tempRateW = parseFloat(maxWidth / width);
  var tempRateH = parseFloat(maxHeight / height);
  var rate = parseFloat(width / height);

  if (width > maxWidth || height > maxHeight) {
    if (tempRateW < tempRateH) {
      width = maxWidth;
      height = Math.floor(width / rate);
    } else {
      height = maxHeight;
      width = height * rate;
    }
  }

  return {
    width: width,
    height: height,
    rate: rate
  };
}
function loadImage(imgSrc) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              resolve({
                errcode: '0000',
                data: {
                  imgObj: img,
                  width: img.width,
                  height: img.height
                }
              });

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    img.onerror = function () {
      resolve({
        errcode: '2000',
        description: '加载图像失败'
      });
    };

    img.src = imgSrc;
  });
}
function base64ToFile(baseStr) {
  var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  filename = filename || 'temp_' + +new Date() + '_' + Math.random().toString().replace(/0\./, '') + '.jpg';
  var arr = baseStr.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var suffix = mime.split('/')[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  filename = filename.split('.')[0];

  if (window.File && typeof window.File === 'function') {
    var newFile = new File([u8arr], "".concat(filename, ".").concat(suffix), {
      type: mime
    });
    return {
      errcode: '0000',
      data: newFile
    };
  } else {
    try {
      var theBlob = new Blob([u8arr], {
        type: mime
      });
      theBlob.lastModifiedDate = new Date();
      theBlob.name = "".concat(filename, ".").concat(suffix);
      return {
        errcode: '0000',
        data: theBlob
      };
    } catch (error) {
      console.error(error);
      return {
        errcode: '90002',
        description: 'base64转换为图片异常，请检查图片是否正常'
      };
    }
  }
}
function normalize(_x) {
  return _normalize.apply(this, arguments);
}

function _normalize() {
  _normalize = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file) {
    var opt,
        localUrl,
        res,
        _opt$maxWidth,
        maxWidth,
        _opt$maxHeight,
        maxHeight,
        _opt$quality,
        quality,
        _opt$toType,
        toType,
        _opt$filename,
        filename,
        _res$data,
        width,
        height,
        imgObj,
        newSize,
        imageWidth,
        imageHeight,
        base64Result,
        canvas,
        context,
        resFile,
        _args2 = arguments;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            opt = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
            localUrl = URL.createObjectURL(file);
            _context2.next = 4;
            return loadImage(localUrl);

          case 4:
            res = _context2.sent;

            if (!(res.errcode !== '0000')) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", res);

          case 7:
            _opt$maxWidth = opt.maxWidth, maxWidth = _opt$maxWidth === void 0 ? 1920 : _opt$maxWidth, _opt$maxHeight = opt.maxHeight, maxHeight = _opt$maxHeight === void 0 ? 1080 : _opt$maxHeight, _opt$quality = opt.quality, quality = _opt$quality === void 0 ? 0.95 : _opt$quality, _opt$toType = opt.toType, toType = _opt$toType === void 0 ? 'base64' : _opt$toType, _opt$filename = opt.filename, filename = _opt$filename === void 0 ? '' : _opt$filename;
            _res$data = res.data, width = _res$data.width, height = _res$data.height, imgObj = _res$data.imgObj;
            newSize = adjustSize(width, height, maxWidth, maxHeight);
            imageWidth = newSize.width;
            imageHeight = newSize.height;
            base64Result = '';
            _context2.prev = 13;
            canvas = document.createElement('canvas');
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            context = canvas.getContext('2d');
            context.clearRect(0, 0, imageWidth, imageHeight);
            context.drawImage(imgObj, 0, 0, imageWidth, imageHeight);
            base64Result = canvas.toDataURL('image/jpeg', quality);

            if (!(toType === 'base64')) {
              _context2.next = 23;
              break;
            }

            return _context2.abrupt("return", {
              errcode: '0000',
              data: {
                imageWidth: imageWidth,
                imageHeight: imageHeight,
                base64: base64Result
              }
            });

          case 23:
            _context2.next = 29;
            break;

          case 25:
            _context2.prev = 25;
            _context2.t0 = _context2["catch"](13);
            console.error(_context2.t0);
            return _context2.abrupt("return", {
              errcode: '90001',
              description: '图片转换异常, 请检查图片是否正常'
            });

          case 29:
            _context2.next = 31;
            return base64ToFile(base64Result, filename);

          case 31:
            resFile = _context2.sent;

            if (!(resFile.errcode !== '0000')) {
              _context2.next = 34;
              break;
            }

            return _context2.abrupt("return", resFile);

          case 34:
            return _context2.abrupt("return", {
              errcode: '0000',
              data: {
                imageWidth: imageWidth,
                imageHeight: imageHeight,
                file: resFile.data
              }
            });

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[13, 25]]);
  }));
  return _normalize.apply(this, arguments);
}

; // 获取图像旋转任意角度后, 在指定区域显示的大小, emptyPix为留白区域大小

function getRotateRect(deg, imgWidth, imgHeight, maxWidth, maxHeight) {
  var emptyPix = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 10;
  var minWidth = arguments.length > 6 ? arguments[6] : undefined;
  var minHeight = arguments.length > 7 ? arguments[7] : undefined;
  var pi = parseFloat(Math.PI / 180);
  var cos = Math.cos;
  var sin = Math.sin;
  var rate = parseFloat(imgWidth / imgHeight);
  deg = Math.abs(deg);
  deg = deg % 360;
  var maxRw = maxWidth - emptyPix;
  var maxRh = maxHeight - emptyPix;
  var rw = imgWidth;
  var rh = imgHeight;

  if (deg === 0 || deg === 180) {
    maxRw = maxWidth;
    maxRh = maxHeight;
  } else if (deg === 90 || deg === 270) {
    maxRw = maxHeight;
    maxRh = maxWidth;
  } else if (deg > 0 && deg < 90 || deg > 180 && deg < 270) {
    maxRw = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
    maxRh = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
  } else if (deg > 90 && deg < 180 || deg > 270 && deg < 360) {
    maxRw = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
    maxRh = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
  }

  if (minWidth && minHeight && (imgWidth < minWidth || imgHeight < minHeight)) {
    if (imgHeight < minHeight) {
      rh = minHeight;
      rw = rate * rh;
    } else {
      rw = minWidth;
      rh = rw / rate;
    }
  }

  if (rw > maxRw || rh > maxRh) {
    if (rw > rh) {
      rh = maxRh;
      rw = rate * rh;
    } else {
      rw = maxRw;
      rh = rw / rate;
    }

    if (rw > maxRw) {
      rw = maxRw;
      rh = rw / rate;
    } else if (rh > maxRh) {
      rh = maxRh;
      rw = rh * rate;
    }
  }

  return {
    rw: rw,
    rh: rh
  };
} // 图像裁剪

function cuteImage(_x2, _x3) {
  return _cuteImage.apply(this, arguments);
} // 根据裁剪区域坐标排序

function _cuteImage() {
  _cuteImage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(imgObj, _ref2) {
    var _ref2$pixel, pixel, _ref2$region, region, _ref2$maxWidth, maxWidth, _ref2$maxHeight, maxHeight, imgWidth, imgHeight, sx, sy, sw, sh, pixelArr, originWidth, originHeight, wRate, hRate, regionArr, rate, rw, rh, canvas, ctx, maxRw, maxRh;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ref2$pixel = _ref2.pixel, pixel = _ref2$pixel === void 0 ? '' : _ref2$pixel, _ref2$region = _ref2.region, region = _ref2$region === void 0 ? '' : _ref2$region, _ref2$maxWidth = _ref2.maxWidth, maxWidth = _ref2$maxWidth === void 0 ? 1920 : _ref2$maxWidth, _ref2$maxHeight = _ref2.maxHeight, maxHeight = _ref2$maxHeight === void 0 ? 1080 : _ref2$maxHeight;

            if (!(region === '')) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", {
              errcode: '0000',
              data: imgObj
            });

          case 3:
            imgWidth = imgObj.width;
            imgHeight = imgObj.height;

            if (region && pixel) {
              pixelArr = pixel.split(',');
              originWidth = parseInt(pixelArr[0]);
              originHeight = parseInt(pixelArr[1]);

              if (imgWidth > imgHeight && originWidth < originHeight || imgWidth < imgHeight && originWidth > originHeight) {
                originWidth = parseInt(pixelArr[1]);
                originHeight = parseInt(pixelArr[0]);
              }

              wRate = parseFloat(imgWidth / originWidth);
              hRate = parseFloat(imgHeight / originHeight); // eslint-disable-next-line

              regionArr = region.replace(/[\[\]]/g, '').split(',');
              sx = parseInt(regionArr[0]) * wRate;
              sy = parseInt(regionArr[1]) * hRate;
              sw = parseInt(regionArr[2]) * wRate - sx;
              sh = parseInt(regionArr[3]) * hRate - sy;
            } else {
              sx = 0;
              sy = 0;
              sw = imgWidth;
              sh = imgHeight;
            }

            rate = parseFloat(sw / sh);
            rw = sw;
            rh = sh;
            canvas = document.createElement('canvas');

            if (!(typeof canvas.getContext !== 'function')) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt("return", {
              errcode: 'unsport',
              description: '浏览器不支持canvas'
            });

          case 12:
            maxWidth = sw > 1920 ? 1920 : sw;
            maxHeight = sh > 1080 ? 1080 : sh;
            canvas.width = maxWidth;
            canvas.height = maxHeight;
            ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, maxWidth, maxHeight);
            maxRw = maxWidth;
            maxRh = maxHeight;
            ctx.save();
            ctx.translate(maxWidth / 2, maxHeight / 2);

            if (rw > rh) {
              rh = maxRh;
              rw = rate * rh;
            } else {
              rw = maxRw;
              rh = rw / rate;
            }

            if (rw > maxRw) {
              rw = maxRw;
              rh = rw / rate;
            } else if (rh > maxRh) {
              rh = maxRh;
              rw = rh * rate;
            }

            ctx.translate(-rw / 2, -rh / 2);
            ctx.drawImage(imgObj, sx, sy, sw, sh, 0, 0, rw, rh);
            ctx.restore();
            return _context3.abrupt("return", {
              errcode: '0000',
              description: 'success',
              data: canvas
            });

          case 28:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _cuteImage.apply(this, arguments);
}

function sortByRegion(dataArr) {
  if (dataArr.length <= 1) {
    return dataArr;
  } else {
    for (var i = 0; i < dataArr.length - 1; i++) {
      for (var j = 0; j < dataArr.length - i - 1; j++) {
        var preData = dataArr[j];
        var nextData = dataArr[j + 1];
        var nextRegion = nextData.region || '';
        nextRegion = nextRegion.replace(/[[\]]/g, '').split(',');
        var nextRectX = parseInt(nextRegion[0]);
        var nextRectY = parseInt(nextRegion[1]);
        var preRegion = preData.region || '';
        preRegion = preRegion.replace(/[[\]]/g, '').split(',');
        var preRectX = parseInt(preRegion[0]);
        var preRectY = parseInt(preRegion[1]);
        var deltaX = nextRectX - preRectX;
        var deltaY = nextRectY - preRectY;
        var exchange = false;

        if (deltaX < 0 && deltaY < 0) {
          exchange = true;
        } else if (deltaX < 0) {
          if (deltaY + deltaX > 0) {
            exchange = false;
          } else {
            exchange = true;
          }
        } else if (deltaY < 0) {
          if (deltaY + deltaX > 50) {
            exchange = false;
          } else {
            exchange = true;
          }
        }

        if (exchange) {
          var temp = _objectSpread({}, nextData);

          dataArr[j + 1] = _objectSpread({}, preData);
          dataArr[j] = temp;
        }
      }
    }

    return dataArr;
  }
} // 区域重叠，重新调整

function adjuestRect() {
  var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var dataArr = _toConsumableArray(list);

  for (var i = 0; i < dataArr.length; i++) {
    var adjustData = dataArr[i];
    var adjustRegion = adjustData.region || '';
    adjustRegion = adjustRegion.replace(/[[\]]/g, '').split(',');
    var adjustLeftX = parseInt(adjustRegion[0]);
    var adjustLeftY = parseInt(adjustRegion[1]);
    var adjustRightX = parseInt(adjustRegion[2]);
    var adjustRightY = parseInt(adjustRegion[3]); //初始化最终修正的结果

    for (var j = 0; j < dataArr.length; j++) {
      if (j <= i) {
        continue;
      }

      var diffData = dataArr[j];
      var diffRegion = diffData.region || '';
      diffRegion = diffRegion.replace(/[[\]]/g, '').split(',');
      var diffLeftX = parseInt(diffRegion[0]);
      var diffLeftY = parseInt(diffRegion[1]);
      var diffRightX = parseInt(diffRegion[2]);
      var diffRightY = parseInt(diffRegion[3]); // 完全没有相交的区域

      if (adjustRightX < diffLeftX || adjustRightY < diffLeftY) {
        continue;
      }

      var w1 = Math.abs((adjustRightX > diffRightX ? adjustRightX : diffRightX) - (adjustLeftX < diffLeftX ? adjustLeftX : diffLeftX));
      var w2 = Math.abs(adjustRightX - adjustLeftX) + Math.abs(diffRightX - diffLeftX);
      var h1 = Math.abs((adjustRightY > diffRightY ? adjustRightY : diffRightY) - (diffLeftY < adjustLeftY ? diffLeftY : adjustLeftY));
      var h2 = Math.abs(adjustRightY - adjustLeftY) + Math.abs(diffRightY - diffLeftY);
      var deltaW = w1 - w2;
      var deltaH = h1 - h2; //没有重叠

      if (deltaW > 0 || deltaH > 0) {
        continue;
      } else {
        deltaH = Math.abs(deltaH) / 2 + 6;
        deltaW = Math.abs(deltaW) / 2 + 6;

        if (deltaW < deltaH) {
          if (adjustLeftX < diffLeftX) {
            //在左侧
            adjustRegion = [adjustLeftX, adjustLeftY, parseInt(adjustRegion[2]) - deltaW, adjustRegion[3]];
            diffRegion = [diffLeftX + deltaW, diffLeftY, diffRegion[2], diffRegion[3]];
            adjustRightX -= deltaW;
            diffLeftX += deltaW;
          } else {
            //在右侧
            adjustRegion = [adjustLeftX + deltaW, adjustLeftY, adjustRegion[2], adjustRegion[3]];
            diffRegion = [diffLeftX, diffLeftY, parseInt(diffRegion[2]) - deltaW, diffRegion[3]];
            diffRightX -= deltaW;
            adjustLeftX += deltaW;
          }

          dataArr[i].region = adjustRegion.join(',');
          dataArr[j].region = diffRegion.join(',');
        } else {
          if (adjustLeftY < diffLeftY) {
            //在上方
            adjustRegion = [adjustLeftX, adjustLeftY, adjustRegion[2], parseInt(adjustRegion[3]) - deltaH];
            diffRegion = [diffLeftX, diffLeftY + deltaH, diffRegion[2], diffRegion[3]];
            adjustRightY -= deltaH;
            diffLeftY += deltaH;
          } else {
            //在下方
            adjustRegion = [adjustLeftX, adjustLeftY + deltaH, adjustRegion[2], adjustRegion[3]];
            diffRegion = [diffLeftX, diffLeftY, diffRegion[2], parseInt(diffRegion[3]) - deltaH];
            diffRightY -= deltaH;
            adjustLeftY += deltaH;
          }

          dataArr[i].region = adjustRegion.join(',');
          dataArr[j].region = diffRegion.join(',');
        }
      }
    }
  }

  return dataArr;
}
function showImage(_x4) {
  return _showImage.apply(this, arguments);
} // 混贴图像区域标记
// areaInfo { rotateDeg: 90, pixel: '2976,3968', region: '[0,2067,1294,3920]' }
// orientation 为整个图像的旋转角度

function _showImage() {
  _showImage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(imgObj) {
    var opt,
        _opt$maxWidth2,
        maxWidth,
        _opt$maxHeight2,
        maxHeight,
        minWidth,
        minHeight,
        canvas,
        imgWidth,
        imgHeight,
        _getRotateRect,
        rw,
        rh,
        ctx,
        _args4 = arguments;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            opt = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {};
            _opt$maxWidth2 = opt.maxWidth, maxWidth = _opt$maxWidth2 === void 0 ? 1920 : _opt$maxWidth2, _opt$maxHeight2 = opt.maxHeight, maxHeight = _opt$maxHeight2 === void 0 ? 1024 : _opt$maxHeight2, minWidth = opt.minWidth, minHeight = opt.minHeight;
            canvas = document.createElement('canvas');

            if (!(typeof canvas.getContext !== 'function')) {
              _context4.next = 5;
              break;
            }

            return _context4.abrupt("return", {
              errcode: 'unsport',
              description: '浏览器不支持canvas'
            });

          case 5:
            imgWidth = imgObj.width;
            imgHeight = imgObj.height;
            _getRotateRect = getRotateRect(0, imgWidth, imgHeight, maxWidth, maxHeight, 0, minWidth, minHeight), rw = _getRotateRect.rw, rh = _getRotateRect.rh;
            canvas.width = rw;
            canvas.height = rh;
            ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.drawImage(imgObj, 0, 0, imgWidth, imgHeight, 0, 0, rw, rh);
            ctx.restore();
            return _context4.abrupt("return", {
              errcode: '0000',
              description: 'success',
              data: canvas
            });

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _showImage.apply(this, arguments);
}

function markImage(_x5, _x6) {
  return _markImage.apply(this, arguments);
}

function _markImage() {
  _markImage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(imgObj, _ref3) {
    var targetWidth, targetHeight, _ref3$areaInfo, areaInfo, clearCanvas, _ref3$orientation, orientation, _ref3$maxWidth, maxWidth, _ref3$maxHeight, maxHeight, markSize, markFontSize, lineWidth, markRate, imgWidth, imgHeight, canvas, deg, tempRwRh, rw, rh, ctx, rectX, rectY, rectWidth, rectHeight, originWidth, originHeight, pixel, pixelArr, newWidthRate, newHeightRate, tempRwRh2, areaInfoList, i, region, markColor, lineColor, rectRight, rectBottom, px, py, _i, _region, _rectRight, _rectBottom, _px, _py;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            targetWidth = _ref3.targetWidth, targetHeight = _ref3.targetHeight, _ref3$areaInfo = _ref3.areaInfo, areaInfo = _ref3$areaInfo === void 0 ? [] : _ref3$areaInfo, clearCanvas = _ref3.clearCanvas, _ref3$orientation = _ref3.orientation, orientation = _ref3$orientation === void 0 ? 0 : _ref3$orientation, _ref3$maxWidth = _ref3.maxWidth, maxWidth = _ref3$maxWidth === void 0 ? 1920 : _ref3$maxWidth, _ref3$maxHeight = _ref3.maxHeight, maxHeight = _ref3$maxHeight === void 0 ? 1024 : _ref3$maxHeight;
            markSize = 12;
            markFontSize = 16;
            lineWidth = 2;
            markRate = 1;
            imgWidth = imgObj.width;
            imgHeight = imgObj.height;

            if (!(areaInfo.length === 0)) {
              _context5.next = 9;
              break;
            }

            return _context5.abrupt("return", {
              errcode: 'argsErr',
              description: '标记区域为空'
            });

          case 9:
            if (typeof clearCanvas === 'undefined') {
              clearCanvas = true;
            }

            canvas = document.createElement('canvas'); //画布对象找不到或者不支持画布

            if (!(!canvas || typeof canvas.getContext !== 'function')) {
              _context5.next = 13;
              break;
            }

            return _context5.abrupt("return", {
              errcode: 'unsport',
              description: '浏览器不支持canvas'
            });

          case 13:
            deg = Math.abs(orientation) % 360;
            tempRwRh = getRotateRect(deg, imgWidth, imgHeight, maxWidth, maxHeight, 0);
            rw = tempRwRh.rw;
            rh = tempRwRh.rh;
            ctx = canvas.getContext('2d');
            rectX = 0;
            rectY = 0;
            rectWidth = 0;
            rectHeight = 0;
            originWidth = imgWidth;
            originHeight = imgHeight;
            pixel = areaInfo[0].pixel;

            if (pixel) {
              pixelArr = pixel.split(',');

              if (imgWidth > imgHeight && originWidth < originHeight || imgWidth < imgHeight && originWidth > originHeight) {
                originWidth = parseInt(pixelArr[1]);
                originHeight = parseInt(pixelArr[0]);
              } else {
                originWidth = parseInt(pixelArr[0]);
                originHeight = parseInt(pixelArr[1]);
              }
            }

            if (deg === 90 || deg === 270) {
              canvas.width = rh;
              canvas.height = rw;
            } else {
              canvas.width = rw;
              canvas.height = rh;
            }

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-orientation * Math.PI / 180);
            newWidthRate = parseFloat(rw / originWidth);
            newHeightRate = parseFloat(rh / originHeight);
            ctx.translate(-rw / 2, -rh / 2);
            ctx.drawImage(imgObj, 0, 0, imgWidth, imgHeight, 0, 0, rw, rh); // 根据最终画布的大小计算字体等标志的缩放大小

            tempRwRh2 = getRotateRect(0, canvas.width, canvas.height, targetWidth, targetHeight, 0);
            markRate = canvas.height / tempRwRh2.rh;
            markSize = markRate * markSize;
            markFontSize = markRate * markFontSize;
            lineWidth = markRate * lineWidth;
            areaInfoList = adjuestRect(areaInfo);

            for (i = 0; i < areaInfoList.length; i++) {
              region = areaInfoList[i].region.replace(/[[\]]/g, '').split(',');

              if (!areaInfoList[i].region) {
                region = [0, 0, imgWidth, imgHeight];
              }

              markColor = areaInfoList[i].markColor || '#487BFB';
              lineColor = areaInfoList[i].lineColor || markColor;
              rectX = parseInt(region[0]) * newWidthRate;
              rectY = parseInt(region[1]) * newHeightRate;
              rectWidth = parseInt(region[2]) * newWidthRate - rectX;
              rectHeight = parseInt(region[3]) * newHeightRate - rectY;
              rectRight = parseInt(region[2]) * newWidthRate;
              rectBottom = parseInt(region[3]) * newHeightRate;

              if (rectWidth + rectX > rw) {
                rectWidth = rw - rectX;
              }

              if (rectHeight + rectY > rh) {
                rectHeight = rh - rectY;
              }

              ctx.save();
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = lineWidth;

              if (typeof ctx.setLineDash === 'function') {
                ctx.setLineDash([10 * markRate, 10 * markRate]);
              }

              ctx.moveTo(rectX + lineWidth, rectY + lineWidth);
              ctx.beginPath();
              ctx.strokeRect(rectX + lineWidth, rectY + lineWidth, rectWidth - 2 * lineWidth, rectHeight - 2 * lineWidth);
              ctx.stroke();
              ctx.closePath();
              ctx.restore(); // 绘制圆圈

              ctx.save();
              ctx.strokeStyle = markColor;
              ctx.beginPath();
              px = rectX + markSize + lineWidth + 2;
              py = rectY + markSize + lineWidth + 2;

              if (orientation === -90 || orientation === 270) {
                py = rectBottom - markSize - lineWidth - 2;
              } else if (orientation === -180 || orientation === 180) {
                px = rectRight - markSize - lineWidth - 2;
                py = rectBottom - markSize - lineWidth - 2;
              } else if (orientation === 90 || orientation === -270) {
                px = rectRight - markSize - lineWidth - 2;
              }

              ctx.moveTo(px, py);
              ctx.arc(px, py, markSize, 0, Math.PI * 2, false);
              ctx.closePath();
              ctx.stroke();
              ctx.fillStyle = markColor;
              ctx.fill();
              ctx.restore();
            } //绘制序号


            for (_i = 0; _i < areaInfoList.length; _i++) {
              _region = areaInfoList[_i].region.replace(/[[\]]/g, '').split(',');

              if (!areaInfoList[_i].region) {
                _region = [0, 0, imgWidth, imgHeight];
              }

              rectX = parseInt(_region[0]) * newWidthRate;
              rectY = parseInt(_region[1]) * newHeightRate;
              _rectRight = parseInt(_region[2]) * newWidthRate;
              _rectBottom = parseInt(_region[3]) * newHeightRate;
              _px = rectX + markSize + lineWidth + 2.3;
              _py = rectY + markSize + lineWidth + 2.3;
              ctx.save();
              ctx.font = markFontSize + 'px Times New Roman';
              ctx.fillStyle = '#fff';
              ctx.textAlign = 'center'; // 设置垂直对齐方式

              ctx.textBaseline = 'middle';

              if (orientation === -90 || orientation === 270) {
                _py = _rectBottom - markSize - lineWidth - 2.3;
              } else if (orientation === -180 || orientation === 180) {
                _px = _rectRight - markSize - lineWidth - 2.3;
                _py = _rectBottom - markSize - lineWidth - 2.3;
              } else if (orientation === 90 || orientation === -270) {
                _px = _rectRight - markSize - lineWidth - 2.3;
              }

              if (orientation !== 0) {
                ctx.translate(_px, _py);
                ctx.rotate(orientation * Math.PI / 180);
                ctx.fillText(_i + 1, 0, 0);
              } else {
                ctx.fillText(_i + 1, _px, _py);
              }

              ctx.restore();
            }

            ctx.restore();
            return _context5.abrupt("return", {
              errcode: '0000',
              description: 'success',
              data: canvas
            });

          case 45:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _markImage.apply(this, arguments);
}

/***/ }),
/* 134 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OperateCanvas; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(133);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var OperateCanvas = /*#__PURE__*/function () {
  function OperateCanvas(props) {
    var _this = this;

    _classCallCheck(this, OperateCanvas);

    _defineProperty(this, "modifyArgs", function (opt) {
      _this.displayFlag = opt.displayFlag || _this.displayFlag;
      _this.width = opt.width || _this.width;
      _this.height = opt.height || _this.height;
      _this.emptyFillStyle = opt.emptyFillStyle || _this.emptyFillStyle;
      _this.imgCanvasObj = null;
    });

    _defineProperty(this, "computeDrawSize", function () {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var imgWidth = opt.imgWidth,
          imgHeight = opt.imgHeight,
          maxWidth = opt.maxWidth,
          maxHeight = opt.maxHeight,
          _opt$rotateDeg = opt.rotateDeg,
          rotateDeg = _opt$rotateDeg === void 0 ? _this.rotateDeg : _opt$rotateDeg,
          _opt$displayFlag = opt.displayFlag,
          displayFlag = _opt$displayFlag === void 0 ? 'showImage' : _opt$displayFlag,
          resetLargerRatio = opt.resetLargerRatio,
          reset = opt.reset;
      var largerRatio = typeof opt.largerRatio !== 'undefined' ? opt.largerRatio : _this.largerRatio;
      var rate = parseFloat(imgWidth / imgHeight);
      var minWidth = maxWidth * 1 / 2;
      var minHeight = maxHeight * 1 / 2;

      if (rotateDeg !== _this.rotateDeg || resetLargerRatio || reset) {
        var tempRotateDeg = displayFlag === 'markImage' ? 0 : rotateDeg;
        var tempRwRh = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["getRotateRect"])(tempRotateDeg, imgWidth, imgHeight, maxWidth, maxHeight, 0, minWidth, minHeight);
        _this.rw = tempRwRh.rw;
        _this.rh = tempRwRh.rh;
        _this.rotateDeg = reset ? _this.initRotateDeg : rotateDeg;
        _this.largerRatio = parseFloat(_this.rw / imgWidth);

        if (!_this.initLargerRatio) {
          _this.initLargerRatio = _this.largerRatio;
        }
      } else {
        if (largerRatio !== _this.largerRatio) {
          // 放大系数发生变化
          _this.largerRatio = largerRatio;
        }

        _this.rh = imgHeight * largerRatio;
        _this.rw = _this.rh * rate;
      }
    });

    _defineProperty(this, "showImage", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(imgObj) {
        var opt,
            resetLargerRatio,
            reset,
            _opt$largerRatio,
            largerRatio,
            rotateDeg,
            maxWidth,
            maxHeight,
            _this$getOffset,
            offsetX,
            offsetY,
            cuteRes,
            ctx,
            imgWidth,
            imgHeight,
            canvas,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                opt = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
                resetLargerRatio = opt.resetLargerRatio, reset = opt.reset, _opt$largerRatio = opt.largerRatio, largerRatio = _opt$largerRatio === void 0 ? _this.largerRatio : _opt$largerRatio;
                rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : _this.rotateDeg;
                rotateDeg = rotateDeg % 360;
                maxWidth = _this.ctx.canvas.width;
                maxHeight = _this.ctx.canvas.height;
                _this$getOffset = _this.getOffset(rotateDeg, opt.offsetX, opt.offsetY), offsetX = _this$getOffset.offsetX, offsetY = _this$getOffset.offsetY;

                if (!(rotateDeg !== _this.rotateDeg || !_this.imgCanvasObj)) {
                  _context.next = 14;
                  break;
                }

                _context.next = 10;
                return Object(_utils__WEBPACK_IMPORTED_MODULE_0__["showImage"])(imgObj);

              case 10:
                cuteRes = _context.sent;

                if (!(cuteRes.errcode !== '0000')) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt("return", cuteRes);

              case 13:
                _this.imgCanvasObj = cuteRes.data;

              case 14:
                ctx = _this.ctx;
                imgWidth = _this.imgCanvasObj.width;
                imgHeight = _this.imgCanvasObj.height; // 更新图像绘制的尺寸

                _this.computeDrawSize({
                  imgWidth: imgWidth,
                  imgHeight: imgHeight,
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  rotateDeg: rotateDeg,
                  largerRatio: largerRatio,
                  resetLargerRatio: resetLargerRatio,
                  reset: reset
                });

                canvas = ctx.canvas;
                ctx.save();
                ctx.fillStyle = _this.emptyFillStyle;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-rotateDeg * Math.PI / 180);
                ctx.translate(-_this.rw / 2 + offsetX, -_this.rh / 2 + offsetY);
                ctx.drawImage(_this.imgCanvasObj, 0, 0, imgWidth, imgHeight, 0, 0, _this.rw, _this.rh);
                ctx.restore();
                return _context.abrupt("return", {
                  errcode: '0000',
                  data: {
                    rotateDeg: _this.rotateDeg,
                    largerRatio: _this.largerRatio
                  }
                });

              case 28:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "cuteImage", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(imgObj) {
        var opt,
            resetLargerRatio,
            reset,
            _opt$largerRatio2,
            largerRatio,
            _opt$areaInfo,
            areaInfo,
            rotateDeg,
            _areaInfo$,
            pixel,
            region,
            maxWidth,
            maxHeight,
            cuteRes,
            ctx,
            canvas,
            imgWidth,
            imgHeight,
            _this$getOffset2,
            offsetX,
            offsetY,
            _args2 = arguments;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                opt = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
                resetLargerRatio = opt.resetLargerRatio, reset = opt.reset, _opt$largerRatio2 = opt.largerRatio, largerRatio = _opt$largerRatio2 === void 0 ? _this.largerRatio : _opt$largerRatio2, _opt$areaInfo = opt.areaInfo, areaInfo = _opt$areaInfo === void 0 ? [] : _opt$areaInfo;
                rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : _this.rotateDeg;
                rotateDeg = rotateDeg % 360;
                _areaInfo$ = areaInfo[0], pixel = _areaInfo$.pixel, region = _areaInfo$.region;
                maxWidth = _this.ctx.canvas.width;
                maxHeight = _this.ctx.canvas.height;

                if (!(rotateDeg !== _this.rotateDeg || !_this.imgCanvasObj)) {
                  _context2.next = 14;
                  break;
                }

                _context2.next = 10;
                return Object(_utils__WEBPACK_IMPORTED_MODULE_0__["cuteImage"])(imgObj, {
                  pixel: pixel,
                  region: region
                });

              case 10:
                cuteRes = _context2.sent;

                if (!(cuteRes.errcode !== '0000')) {
                  _context2.next = 13;
                  break;
                }

                return _context2.abrupt("return", cuteRes);

              case 13:
                _this.imgCanvasObj = cuteRes.data;

              case 14:
                ctx = _this.ctx;
                canvas = ctx.canvas;
                imgWidth = _this.imgCanvasObj.width;
                imgHeight = _this.imgCanvasObj.height;
                _this$getOffset2 = _this.getOffset(rotateDeg, opt.offsetX, opt.offsetY), offsetX = _this$getOffset2.offsetX, offsetY = _this$getOffset2.offsetY; // 更新图像绘制的尺寸

                _this.computeDrawSize({
                  imgWidth: imgWidth,
                  imgHeight: imgHeight,
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  rotateDeg: rotateDeg,
                  largerRatio: largerRatio,
                  resetLargerRatio: resetLargerRatio,
                  reset: reset
                });

                ctx.save();
                ctx.fillStyle = _this.emptyFillStyle;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-rotateDeg * Math.PI / 180);
                ctx.translate(-_this.rw / 2 + offsetX, -_this.rh / 2 + offsetY);
                ctx.drawImage(_this.imgCanvasObj, 0, 0, imgWidth, imgHeight, 0, 0, _this.rw, _this.rh);
                ctx.restore();
                return _context2.abrupt("return", {
                  errcode: '0000',
                  data: {
                    rotateDeg: _this.rotateDeg,
                    largerRatio: _this.largerRatio
                  }
                });

              case 29:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "markImage", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(imgObj) {
        var opt,
            resetLargerRatio,
            reset,
            offsetX,
            offsetY,
            _opt$largerRatio3,
            largerRatio,
            _opt$areaInfo2,
            areaInfo,
            rotateDeg,
            ctx,
            maxWidth,
            maxHeight,
            cuteRes,
            imgWidth,
            imgHeight,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                opt = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
                resetLargerRatio = opt.resetLargerRatio, reset = opt.reset, offsetX = opt.offsetX, offsetY = opt.offsetY, _opt$largerRatio3 = opt.largerRatio, largerRatio = _opt$largerRatio3 === void 0 ? _this.largerRatio : _opt$largerRatio3, _opt$areaInfo2 = opt.areaInfo, areaInfo = _opt$areaInfo2 === void 0 ? [] : _opt$areaInfo2;
                rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : _this.rotateDeg;
                rotateDeg = rotateDeg % 360;
                ctx = _this.ctx;
                maxWidth = ctx.canvas.width;
                maxHeight = ctx.canvas.height;

                if (!(rotateDeg !== _this.rotateDeg || !_this.imgCanvasObj)) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 10;
                return Object(_utils__WEBPACK_IMPORTED_MODULE_0__["markImage"])(imgObj, {
                  targetHeight: maxHeight,
                  targetWidth: maxWidth,
                  areaInfo: areaInfo,
                  orientation: rotateDeg
                });

              case 10:
                cuteRes = _context3.sent;

                if (!(cuteRes.errcode !== '0000')) {
                  _context3.next = 13;
                  break;
                }

                return _context3.abrupt("return", cuteRes);

              case 13:
                _this.imgCanvasObj = cuteRes.data;

              case 14:
                imgWidth = _this.imgCanvasObj.width;
                imgHeight = _this.imgCanvasObj.height; // 更新图像绘制的尺寸

                _this.computeDrawSize({
                  displayFlag: 'markImage',
                  imgWidth: imgWidth,
                  imgHeight: imgHeight,
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  rotateDeg: rotateDeg,
                  largerRatio: largerRatio,
                  resetLargerRatio: resetLargerRatio,
                  reset: reset
                });

                ctx.save();
                ctx.fillStyle = _this.emptyFillStyle;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.translate(ctx.canvas.width / 2 - _this.rw / 2 + offsetX, ctx.canvas.height / 2 - _this.rh / 2 + offsetY);
                ctx.drawImage(_this.imgCanvasObj, 0, 0, imgWidth, imgHeight, 0, 0, _this.rw, _this.rh);
                ctx.restore();
                return _context3.abrupt("return", {
                  errcode: '0000',
                  data: {
                    rotateDeg: _this.rotateDeg,
                    largerRatio: _this.largerRatio
                  }
                });

              case 24:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }());

    this.ctx = props.ctx;
    this.width = props.width;
    this.height = props.height;
    this.initLargerRatio = props.largerRatio || 1;
    this.initRotateDeg = props.rotateDeg || 0;
    this.rotateDeg = this.initRotateDeg;
    this.largerRatio = this.initLargerRatio;
    this.emptyFillStyle = props.emptyFillStyle || '#D7DAE1';
  }

  _createClass(OperateCanvas, [{
    key: "getOffset",
    value: function getOffset(rotateDeg) {
      var offsetX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var offsetY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      if (rotateDeg === 90 || rotateDeg === -270) {
        var temp = offsetY;
        offsetY = offsetX;
        offsetX = -temp;
      } else if (rotateDeg === -90 || rotateDeg === 270) {
        var _temp = offsetY;
        offsetY = -offsetX;
        offsetX = _temp;
      } else if (rotateDeg === 180 || rotateDeg === -180) {
        offsetY = -offsetY;
        offsetX = -offsetX;
      }

      return {
        offsetX: offsetX,
        offsetY: offsetY
      };
    }
  }]);

  return OperateCanvas;
}();



/***/ }),
/* 135 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tempCompressImgFile", function() { return tempCompressImgFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compressImgFile", function() { return compressImgFile; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(133);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


function tempCompressImgFile(_x) {
  return _tempCompressImgFile.apply(this, arguments);
} // 部分gui用户，不方便远程调试，可能压缩中出现异常，先全局捕获下异常

function _tempCompressImgFile() {
  _tempCompressImgFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file) {
    var options,
        localUrl,
        URL,
        fileType,
        fileLimitWidth,
        fileLimitHeight,
        fileLimitPixel,
        fileLimitQuality,
        fileLimitSize,
        fileSize,
        fileLimitSizeTemp,
        rate,
        loadRes,
        _loadRes$data,
        width,
        height,
        imgObj,
        info,
        newWidth,
        newHeight,
        imgRate,
        imgCanvasData,
        canvas,
        context,
        bFileRes,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
            localUrl = options.localUrl || ''; // 浏览器兼容

            URL = window.URL || window.webkitURL || window.mozURL || {};
            fileType = file.type || ''; // 非图像，不支持的浏览器不压缩，没有设置压缩，直接返回

            if (!(fileType.indexOf('image/') === -1 || typeof URL.createObjectURL !== 'function' || typeof options.fileLimitSize === 'undefined')) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", {
              errcode: '0000',
              localUrl: localUrl,
              file: file
            });

          case 6:
            fileLimitWidth = options.fileLimitWidth, fileLimitHeight = options.fileLimitHeight; // 短边最小值

            fileLimitPixel = options.fileLimitPixel;

            if (!fileLimitPixel && fileLimitWidth && fileLimitHeight) {
              fileLimitPixel = fileLimitWidth > fileLimitHeight ? fileLimitHeight : fileLimitWidth;
            }

            if (!fileLimitPixel) {
              fileLimitPixel = 1500;
            }

            fileLimitQuality = options.fileQuality || 0.98;

            if (isNaN(parseFloat(fileLimitQuality))) {
              fileLimitQuality = 0.98;
            } else {
              fileLimitQuality = parseFloat(fileLimitQuality);
            }

            if (!(localUrl === '')) {
              _context.next = 21;
              break;
            }

            _context.prev = 13;
            localUrl = URL.createObjectURL(file);
            _context.next = 21;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](13);

            if (window.console) {
              console.error(_context.t0);
            }

            return _context.abrupt("return", {
              errcode: '0000',
              localUrl: localUrl,
              file: file
            });

          case 21:
            fileLimitSize = options.fileLimitSize;
            fileSize = file.size;
            fileLimitSizeTemp = parseFloat(fileLimitSize) * 1024 * 1024; // 文件大小小于指定大小不需要压缩

            if (!(fileSize <= fileLimitSizeTemp)) {
              _context.next = 26;
              break;
            }

            return _context.abrupt("return", {
              errcode: '0000',
              localUrl: localUrl,
              file: file
            });

          case 26:
            // 计算压缩比例
            rate = fileLimitSizeTemp / fileSize;
            _context.next = 29;
            return Object(_utils__WEBPACK_IMPORTED_MODULE_0__["loadImage"])(localUrl);

          case 29:
            loadRes = _context.sent;

            if (!(loadRes.errcode !== '0000')) {
              _context.next = 32;
              break;
            }

            return _context.abrupt("return", {
              errcode: '0000',
              localUrl: localUrl,
              file: file
            });

          case 32:
            _loadRes$data = loadRes.data, width = _loadRes$data.width, height = _loadRes$data.height, imgObj = _loadRes$data.imgObj;
            info = {
              originWidth: width,
              originHeight: height,
              width: width,
              height: height,
              localUrl: localUrl
            }; // 图像原始像素比较小，则直接返回

            if (!(width < fileLimitPixel || height < fileLimitPixel)) {
              _context.next = 36;
              break;
            }

            return _context.abrupt("return", _objectSpread(_objectSpread({
              errcode: '0000'
            }, info), {}, {
              file: file
            }));

          case 36:
            newWidth = width;
            newHeight = height;
            imgRate = width / height; // 以短边作为压缩基准

            if (width <= height) {
              newHeight = Math.floor(height * rate);
              newWidth = Math.floor(newHeight * imgRate);
            } else {
              newWidth = Math.floor(width * rate);
              newHeight = Math.floor(newWidth / imgRate);
            } // 压缩后的图像大小小于指定限制, 直接使用最小值作为短边的像素大小，长边等比例缩放


            if (newWidth < fileLimitPixel || newHeight < fileLimitPixel) {
              if (newWidth <= newHeight) {
                newWidth = fileLimitPixel;
                newHeight = Math.floor(newWidth / imgRate);
              } else {
                newHeight = fileLimitPixel;
                newWidth = Math.floor(newHeight * imgRate);
              }
            }

            info.width = newWidth;
            info.height = newHeight;
            _context.prev = 43;
            canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            context = canvas.getContext('2d');
            context.clearRect(0, 0, newWidth, newHeight);
            context.drawImage(imgObj, 0, 0, newWidth, newHeight);
            imgCanvasData = canvas.toDataURL('image/jpeg', fileLimitQuality);
            canvas = null;
            _context.next = 58;
            break;

          case 54:
            _context.prev = 54;
            _context.t1 = _context["catch"](43);

            if (window.console) {
              console.error(_context.t1);
            }

            return _context.abrupt("return", _objectSpread(_objectSpread({
              errcode: '0000'
            }, info), {}, {
              file: file
            }));

          case 58:
            _context.next = 60;
            return Object(_utils__WEBPACK_IMPORTED_MODULE_0__["base64ToFile"])(imgCanvasData, file.name);

          case 60:
            bFileRes = _context.sent;

            if (!(bFileRes.errcode !== '0000' || bFileRes.data.size > file.size)) {
              _context.next = 63;
              break;
            }

            return _context.abrupt("return", _objectSpread(_objectSpread({
              errcode: '0000'
            }, info), {}, {
              width: width,
              height: height,
              file: file // 压缩后图像变大，直接使用原图

            }));

          case 63:
            return _context.abrupt("return", _objectSpread(_objectSpread({
              errcode: '0000'
            }, info), {}, {
              file: bFileRes.data
            }));

          case 64:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[13, 17], [43, 54]]);
  }));
  return _tempCompressImgFile.apply(this, arguments);
}

function compressImgFile(_x2) {
  return _compressImgFile.apply(this, arguments);
}

function _compressImgFile() {
  _compressImgFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file) {
    var options,
        res,
        localUrl,
        _args2 = arguments;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            options = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
            _context2.prev = 1;
            _context2.next = 4;
            return tempCompressImgFile(file, options);

          case 4:
            res = _context2.sent;
            return _context2.abrupt("return", res);

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](1);

            if (window.console) {
              console.error(_context2.t0);
            }

          case 11:
            localUrl = options.localUrl || '';
            return _context2.abrupt("return", {
              errcode: '0000',
              localUrl: localUrl,
              file: file
            });

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 8]]);
  }));
  return _compressImgFile.apply(this, arguments);
}

/***/ }),
/* 136 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _JsScanner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(132);
/* harmony import */ var _piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var async__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
/* harmony import */ var async__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(async__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _controlDialogBox__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(137);
var _excluded = ["data"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







var ScanFile = /*#__PURE__*/function () {
  function ScanFile(_opt) {
    var _this = this;

    _classCallCheck(this, ScanFile);

    _defineProperty(this, "initScan", function (opt) {
      _this.sourceName = '';
      _this.staticUrl = opt.staticUrl || '';
      _this.needRegonizeQr = opt.needRegonizeQr || false;
      _this.uploadUrl = opt.uploadUrl;
      _this.headers = opt.headers;
      _this.locale = opt.locale;
      _this.limit = opt.limit || 2;
      _this.debug = opt.debug || false;
      _this.queryDelay = opt.queryDelay || 1000; // 轮询异步扫描结果

      _this.scanFileStaticJs = opt.scanFileStaticJs || ["".concat(_this.staticUrl, "/static/gallery/scanner-ruizhen/JsScanner-min.js")];
      _this.scannerApiUrl = opt.scannerApiUrl || 'http://127.0.0.1:25972/jsscaner/api/v1/command'; //扫描仪sdk请求地址
      // 软件下载地址

      _this.downloadUrl = opt.downloadUrl || "".concat(_this.staticUrl, "/static/gallery/scanner-ruizhen/JsScanner.msi");

      _this.onError = opt.onError || function () {};

      _this.setCompressOpt(opt);

      if (_this.needRegonizeQr) {
        _this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
      }

      _this.scanner = new _JsScanner__WEBPACK_IMPORTED_MODULE_0__["default"]({
        API_URL: _this.scannerApiUrl
      });
    });

    _defineProperty(this, "setCompressOpt", function (opt) {
      var compressOpt = {};

      if (opt.fileQuality) {
        compressOpt.fileQuality = opt.fileQuality;
      }

      if (opt.fileLimitWidth) {
        compressOpt.fileLimitWidth = opt.fileLimitWidth;
      }

      if (opt.fileLimitHeight) {
        compressOpt.fileLimitHeight = opt.fileLimitHeight;
      }

      if (opt.fileLimitPixel) {
        compressOpt.fileLimitPixel = opt.fileLimitPixel;
      }

      if (opt.fileLimitSize) {
        compressOpt.fileLimitSize = opt.fileLimitSize;
      }

      _this.compressOpt = compressOpt;
    });

    _defineProperty(this, "setDuplexEnabled", function (isEnable, ifDuplexEnabled) {
      if (isEnable) {
        _this.ifDuplexEnabled = typeof ifDuplexEnabled === 'undefined' ? true : ifDuplexEnabled;
        _this.duplex = 1;
      } else {
        _this.ifDuplexEnabled = typeof ifDuplexEnabled === 'undefined' ? false : ifDuplexEnabled;
        _this.duplex = 0;
      }
    });

    _defineProperty(this, "setDiscardBlankpages", function (value) {
      _this.ifDuplexEnabled = value;
    });

    _defineProperty(this, "setQrcodeRecognize", function (isEnable) {
      // 防止报错,实际上二维码不进行二维码识别.
      _this.needRegonizeQr = isEnable;
    });

    _defineProperty(this, "resetScan", function () {
      // 一批扫描处理结束控制
      _this.handleIsEnd = true; // queryResult 结束控制

      _this.queryIsEnd = true;
      _this.queryResultIsEnd = false;
      _this.scannerSources = [];
      _this.filename = ''; // formdata中File的name

      _this.data = null; // formdata处理额外的上传数据

      if (_this.timer) {
        window.clearTimeout(_this.timer);
      } else {
        _this.timer = null; //异步定时器
      }

      if (!_this.disabledClearFiles && _this.Guid && _this.processFile && _this.processFile.length > 0) {
        var guid = _this.Guid;
        setTimeout(function () {
          _this.scanner.DeleteAcquireFiles(guid);
        }, 1000);
      }

      _this.processFile = [];
      _this.Guid = '';

      if (_this.asyncPathsMap && _this.asyncPathsMap.size > 0) {
        _this.asyncPathsMap.clear();
      } else {
        _this.asyncPathsMap = new Map();
      }
    });

    _defineProperty(this, "showSelectSource", function () {
      Object(_controlDialogBox__WEBPACK_IMPORTED_MODULE_4__["showSelectSource"])({
        scannerSources: _this.scannerSources,
        sourceName: _this.sourceName,
        onSelect: function onSelect(newSourceName) {
          _this.sourceName = newSourceName;
        },
        onConfirm: function onConfirm(newSourceName) {
          _this.sourceName = newSourceName;

          _this.AcquireSync(newSourceName, {});
        },
        onCancel: function () {
          var _onCancel = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _this.sourceName = '';
                    _context.next = 3;
                    return _this.onScanEnd({
                      errcode: '0000',
                      description: 'success',
                      data: {
                        imagesNum: 0,
                        operateStatus: 'cancelSelectSource' // 取消选择扫描仪

                      }
                    });

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          function onCancel() {
            return _onCancel.apply(this, arguments);
          }

          return onCancel;
        }()
      });
    });

    _defineProperty(this, "showDownloadMsi", function (upgradeFlag) {
      Object(_controlDialogBox__WEBPACK_IMPORTED_MODULE_4__["showDownloadMsi"])({
        downloadUrl: _this.downloadUrl,
        upgradeFlag: upgradeFlag,
        onConfirm: function () {
          var _onConfirm = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return _this.onScanEnd({
                      errcode: '0000',
                      description: 'success',
                      data: {
                        operateStatus: 'confirmDownload',
                        // 确认下载
                        imagesNum: 0
                      }
                    });

                  case 2:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          function onConfirm() {
            return _onConfirm.apply(this, arguments);
          }

          return onConfirm;
        }(),
        onCancel: function () {
          var _onCancel2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return _this.onScanEnd({
                      errcode: '0000',
                      description: 'success',
                      data: {
                        operateStatus: 'cancelDownload',
                        // 取消下载
                        imagesNum: 0
                      }
                    });

                  case 2:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3);
          }));

          function onCancel() {
            return _onCancel2.apply(this, arguments);
          }

          return onCancel;
        }()
      });
    });

    _defineProperty(this, "setScanSource", function (s) {
      _this.sourceName = s;
    });

    _defineProperty(this, "getScanSources", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(fresh) {
        var res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(!fresh && _this.scannerSources.length > 0)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return", {
                  errcode: '0000',
                  description: 'success',
                  data: _this.scannerSources
                });

              case 2:
                _context4.next = 4;
                return _this.GetDataSources();

              case 4:
                res = _context4.sent;

                if (!(res.ErrorCode === '4000')) {
                  _context4.next = 10;
                  break;
                }

                _this.showDownloadMsi();

                return _context4.abrupt("return", {
                  errcode: '4000',
                  description: '未安装jsScanner扫描组件'
                });

              case 10:
                if (!(res.ErrorCode != 0)) {
                  _context4.next = 12;
                  break;
                }

                return _context4.abrupt("return", {
                  errcode: '4000',
                  description: res.ErrorDescription || '获取扫描仪异常，请重试'
                });

              case 12:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "checkVersion", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var res;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return _this.scanner.GetProductVersion();

            case 3:
              res = _context5.sent;
              _context5.next = 9;
              break;

            case 6:
              _context5.prev = 6;
              _context5.t0 = _context5["catch"](0);
              return _context5.abrupt("return", {
                ErrorCode: '4000',
                ErrorDescription: '扫描仪组件调用异常，请检查是否安装'
              });

            case 9:
              return _context5.abrupt("return", res);

            case 10:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, null, [[0, 6]]);
    })));

    _defineProperty(this, "startScan", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(options) {
        var _options$data, data, otherOpt, redirectUpload, _otherOpt$filename, filename, _otherOpt$addUploadPr, addUploadProgress, _otherOpt$stepUploadS, stepUploadStart, _otherOpt$stepUploadF, stepUploadFinish, _otherOpt$uploadFinis, uploadFinish, _otherOpt$onConnected, onConnected, sourceName, resCheck, Major, Minor, res;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _this.resetScan(true);

                _options$data = options.data, data = _options$data === void 0 ? {} : _options$data, otherOpt = _objectWithoutProperties(options, _excluded);
                redirectUpload = otherOpt.redirectUpload, _otherOpt$filename = otherOpt.filename, filename = _otherOpt$filename === void 0 ? 'file' : _otherOpt$filename, _otherOpt$addUploadPr = otherOpt.addUploadProgress, addUploadProgress = _otherOpt$addUploadPr === void 0 ? function () {} : _otherOpt$addUploadPr, _otherOpt$stepUploadS = otherOpt.stepUploadStart, stepUploadStart = _otherOpt$stepUploadS === void 0 ? function () {} : _otherOpt$stepUploadS, _otherOpt$stepUploadF = otherOpt.stepUploadFinish, stepUploadFinish = _otherOpt$stepUploadF === void 0 ? function () {} : _otherOpt$stepUploadF, _otherOpt$uploadFinis = otherOpt.uploadFinish, uploadFinish = _otherOpt$uploadFinis === void 0 ? function () {} : _otherOpt$uploadFinis, _otherOpt$onConnected = otherOpt.onConnected, onConnected = _otherOpt$onConnected === void 0 ? function () {} : _otherOpt$onConnected; // 可以在扫描时选择修改扫描仪相关参数

                _this.setScanParam(otherOpt);

                _this.filename = filename;
                _this.onConnected = onConnected;
                _this.addUploadProgress = addUploadProgress;
                _this.stepUploadStart = stepUploadStart;
                _this.stepUploadFinish = stepUploadFinish;
                _this.uploadFinish = uploadFinish;
                _this.data = data;
                sourceName = _this.sourceName;
                _context6.next = 14;
                return _this.checkVersion();

              case 14:
                resCheck = _context6.sent;

                if (!(resCheck.ErrorCode === '4000')) {
                  _context6.next = 18;
                  break;
                }

                _this.showDownloadMsi();

                return _context6.abrupt("return");

              case 18:
                if (!(resCheck.ErrorCode != 0)) {
                  _context6.next = 22;
                  break;
                }

                _context6.next = 21;
                return _this.onScanEnd(resCheck);

              case 21:
                return _context6.abrupt("return");

              case 22:
                Major = resCheck.Major, Minor = resCheck.Minor; // 需要下载升级

                if (!(_this.versionMajor > Major || _this.versionMajor === Major && _this.versionMinor > Minor)) {
                  _context6.next = 26;
                  break;
                }

                _this.showDownloadMsi(true);

                return _context6.abrupt("return");

              case 26:
                _context6.next = 28;
                return _this.GetDataSources();

              case 28:
                res = _context6.sent;

                if (!(res.ErrorCode != 0)) {
                  _context6.next = 33;
                  break;
                }

                _context6.next = 32;
                return _this.onScanEnd(res);

              case 32:
                return _context6.abrupt("return");

              case 33:
                _this.scannerSources = res.Sources; // 扫描仪获取到为空

                if (!(_this.scannerSources.length === 0)) {
                  _context6.next = 38;
                  break;
                }

                _context6.next = 37;
                return _this.onScanEnd({
                  ErrorCode: '30001',
                  ErrorDescription: '未获取到扫描仪，请检查扫描仪驱动是否安装'
                });

              case 37:
                return _context6.abrupt("return");

              case 38:
                if (!(_this.scannerSources.length === 1)) {
                  _context6.next = 42;
                  break;
                }

                _this.sourceName = _this.scannerSources[0];

                _this.AcquireSync(_this.scannerSources[0], {});

                return _context6.abrupt("return");

              case 42:
                // 扫描仪源多于1个，当未指定指定的扫描仪，或者指定的不存在时需要重新选择
                if (!sourceName || _this.scannerSources.indexOf(sourceName) === -1) {
                  _this.showSelectSource();
                } else {
                  _this.AcquireSync(sourceName, {});
                }

              case 43:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "GetDataSources", function () {
      return new Promise(function (resolve) {
        _this.scanner.GetDataSources(function (json) {
          _this.debug && console.log('GetSourcesCompleted', json);
          resolve(json);
        }, {});
      });
    });

    _defineProperty(this, "getUUId", function () {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
      });
      return uuid;
    });

    _defineProperty(this, "dataURLtoBlob", function (dataurl) {
      var bstr = window.atob(dataurl);
      var n = bstr.length;
      var u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new Blob([u8arr], {
        type: 'image/jpeg'
      });
    });

    _defineProperty(this, "blobToFile", function (theBlob, fileName) {
      var date = new Date();
      theBlob.lastModified = date.getTime();
      theBlob.lastModifiedDate = date;
      theBlob.name = fileName;
      return theBlob;
    });

    _defineProperty(this, "base64ToFile", function (base64str, filename) {
      var blob = _this.dataURLtoBlob(base64str);

      var upFile = _piaozone_com_utils__WEBPACK_IMPORTED_MODULE_1__["tools"].blobToFile(blob, filename);

      if (upFile) {
        return upFile;
      }

      return _this.blobToFile(blob, filename);
    });

    _defineProperty(this, "handlerUpload", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(preRes, item) {
        var formData, res, curFile, extraData, key, element, requestParam;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                formData = new FormData();
                _context8.next = 3;
                return Object(_piaozone_com_process_image__WEBPACK_IMPORTED_MODULE_2__["compressImgFile"])(item.file, _this.compressOpt);

              case 3:
                res = _context8.sent;
                curFile = item.file;

                if (res.errcode === '0000') {
                  curFile = res.file;
                } // 第三个参数指定filename,在ie11浏览器中,不指定会默认为blob,不带后缀名在eggjs上传时会报错


                formData.append(_this.filename, curFile, item.file.name); // 将this.data与otherData合并.

                extraData = Object.assign(_this.data, preRes.otherData);

                if (extraData) {
                  for (key in extraData) {
                    if (Object.hasOwnProperty.call(extraData, key)) {
                      element = extraData[key];
                      formData.append(key, element);
                    }
                  }
                }

                requestParam = {
                  method: 'post',
                  data: formData,
                  contentType: 'file',
                  headers: _this.headers
                };
                return _context8.abrupt("return", new Promise( /*#__PURE__*/function () {
                  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            Object(_piaozone_com_utils__WEBPACK_IMPORTED_MODULE_1__["pwyFetch"])(_this.uploadUrl, requestParam).then(function (res) {
                              resolve(res);
                            });

                          case 1:
                          case "end":
                            return _context7.stop();
                        }
                      }
                    }, _callee7);
                  }));

                  return function (_x5, _x6) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      return function (_x3, _x4) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "getFileInfo", function () {
      var fileRes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var index = fileRes.index,
          _fileRes$Base64String = fileRes.Base64String,
          Base64String = _fileRes$Base64String === void 0 ? '' : _fileRes$Base64String,
          ErrorDescription = fileRes.ErrorDescription,
          ErrorCode = fileRes.ErrorCode;

      var fileUid = _this.getUUId();

      var filename = fileUid + '-' + index + '.jpg';
      var fileInfo = {
        name: filename,
        index: index,
        status: 'init',
        id: fileUid,
        errcode: '0000',
        description: 'success',
        file: {
          name: filename,
          size: 0
        },
        localUrl: '',
        qrcodeResult: ''
      };
      var errcode = '0000';
      var description = 'success';
      var file; // 获取文件异常，直接返回单步回调通知当前扫描仪页数据获取异常信息

      if (ErrorCode != '0') {
        errcode = '5000';
        description = ErrorDescription || '获取扫描仪文件异常';
      } else {
        try {
          file = _this.base64ToFile(Base64String, filename);
        } catch (error) {
          console.error('base64ToFile error', error);
          errcode = '5001';
          description = '浏览器不支持，请更换chrome或者高版本浏览器';
        }
      }

      fileInfo.localUrl = 'data:image/jpg;base64,' + Base64String;

      if (file) {
        fileInfo.file = file;
      }

      return {
        errcode: errcode,
        description: description,
        fileInfo: fileInfo
      };
    });

    _defineProperty(this, "mapLimitUpload", function (arr) {
      return new Promise(function (resolve) {
        async__WEBPACK_IMPORTED_MODULE_3___default.a.mapLimit(arr, _this.limit, /*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(filePath, callback) {
            var fileRes, res;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    fileRes = _this.asyncPathsMap.get(filePath); // 只处理数据已经准备好的

                    if (!(fileRes && fileRes.status === 'waitUpload')) {
                      _context9.next = 6;
                      break;
                    }

                    _context9.next = 4;
                    return _this.handlerUpload(fileRes.preRes, fileRes.fileInfo);

                  case 4:
                    res = _context9.sent;

                    _this.asyncPathsMap.set(filePath, {
                      status: 'uploaded',
                      res: res,
                      fileInfo: fileRes.fileInfo,
                      preRes: fileRes.preRes
                    });

                  case 6:
                    callback(null, {});

                  case 7:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9);
          }));

          return function (_x7, _x8) {
            return _ref6.apply(this, arguments);
          };
        }(), function (err) {
          if (err) {
            console.error('mapLimitUpload error', err);
          }

          resolve({
            errcode: '0000',
            description: 'success'
          });
        });
      });
    });

    _defineProperty(this, "handlePreUploadBySort", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(arr) {
        var i, filePath, fileRes, fileInfoRes, errcode, description, fileInfo, uploadEnable, preRes;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < arr.length)) {
                  _context10.next = 41;
                  break;
                }

                filePath = arr[i];
                fileRes = _this.asyncPathsMap.get(filePath);

                if (fileRes) {
                  _context10.next = 6;
                  break;
                }

                return _context10.abrupt("break", 41);

              case 6:
                if (!(fileRes.status === 'waiting')) {
                  _context10.next = 38;
                  break;
                }

                fileInfoRes = _this.getFileInfo(fileRes);
                errcode = fileInfoRes.errcode, description = fileInfoRes.description, fileInfo = fileInfoRes.fileInfo;

                if (!(typeof _this.addUploadProgress === 'function')) {
                  _context10.next = 18;
                  break;
                }

                _context10.prev = 10;
                _context10.next = 13;
                return _this.addUploadProgress(fileInfo);

              case 13:
                _context10.next = 18;
                break;

              case 15:
                _context10.prev = 15;
                _context10.t0 = _context10["catch"](10);
                console.error('addUploadProgress error', fileInfo, _context10.t0);

              case 18:
                if (!(errcode !== '0000')) {
                  _context10.next = 21;
                  break;
                }

                _this.asyncPathsMap.set(filePath, {
                  status: 'uploaded',
                  res: {
                    errcode: errcode,
                    description: description
                  },
                  fileInfo: fileInfo,
                  preRes: {}
                });

                return _context10.abrupt("return");

              case 21:
                uploadEnable = true;
                preRes = {};
                _context10.prev = 23;
                _context10.next = 26;
                return _this.stepUploadStart(fileInfo);

              case 26:
                preRes = _context10.sent;
                _context10.next = 33;
                break;

              case 29:
                _context10.prev = 29;
                _context10.t1 = _context10["catch"](23);
                preRes = {};
                console.error('stepUploadStart处理失败：', _context10.t1);

              case 33:
                // 允许回调控制本次是否需要上传到后台，并且可以根据当前文件信息返回额外的上传参数
                if (preRes && preRes.otherData && preRes.otherData.stopStepUpload) {
                  uploadEnable = false;
                } // 不需要上传, 直接回调本次结束函数


                if (uploadEnable) {
                  _context10.next = 37;
                  break;
                }

                _this.asyncPathsMap.set(filePath, {
                  status: 'uploaded',
                  res: {
                    errcode: '0000',
                    description: 'success'
                  },
                  fileInfo: fileInfo,
                  preRes: preRes
                });

                return _context10.abrupt("return");

              case 37:
                _this.asyncPathsMap.set(filePath, {
                  status: 'waitUpload',
                  fileInfo: fileInfo,
                  preRes: preRes
                });

              case 38:
                i++;
                _context10.next = 1;
                break;

              case 41:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, null, [[10, 15], [23, 29]]);
      }));

      return function (_x9) {
        return _ref7.apply(this, arguments);
      };
    }());

    _defineProperty(this, "handlerStepUploadFinishBySort", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(arr) {
        var i, filePath, fileRes, _ref9, _ref9$otherData, otherData;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < arr.length)) {
                  _context11.next = 27;
                  break;
                }

                filePath = arr[i];
                fileRes = _this.asyncPathsMap.get(filePath);

                if (fileRes) {
                  _context11.next = 8;
                  break;
                }

                return _context11.abrupt("break", 27);

              case 8:
                if (!(fileRes.status === 'done')) {
                  _context11.next = 12;
                  break;
                }

                return _context11.abrupt("continue", 24);

              case 12:
                if (!(fileRes.status !== 'uploaded')) {
                  _context11.next = 14;
                  break;
                }

                return _context11.abrupt("break", 27);

              case 14:
                _ref9 = fileRes.preRes || {}, _ref9$otherData = _ref9.otherData, otherData = _ref9$otherData === void 0 ? {} : _ref9$otherData;
                _context11.prev = 15;
                _context11.next = 18;
                return _this.stepUploadFinish(fileRes.res, fileRes.fileInfo, otherData);

              case 18:
                _context11.next = 23;
                break;

              case 20:
                _context11.prev = 20;
                _context11.t0 = _context11["catch"](15);
                console.error('stepUploadFinish处理失败：', _context11.t0);

              case 23:
                _this.asyncPathsMap.set(filePath, {
                  status: 'done'
                });

              case 24:
                i++;
                _context11.next = 1;
                break;

              case 27:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, null, [[15, 20]]);
      }));

      return function (_x10) {
        return _ref8.apply(this, arguments);
      };
    }());

    _defineProperty(this, "handleScanedFiles", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
      var errInfo,
          arr,
          curArrIsAllDone,
          i,
          curPath,
          fileRes,
          _args12 = arguments;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              errInfo = _args12.length > 0 && _args12[0] !== undefined ? _args12[0] : {};
              arr = _this.processFile;
              _context12.next = 4;
              return _this.handlePreUploadBySort(arr);

            case 4:
              _context12.next = 6;
              return _this.mapLimitUpload(arr);

            case 6:
              _context12.next = 8;
              return _this.handlerStepUploadFinishBySort(arr);

            case 8:
              curArrIsAllDone = true;
              i = 0;

            case 10:
              if (!(i < arr.length)) {
                _context12.next = 19;
                break;
              }

              curPath = arr[i];
              fileRes = _this.asyncPathsMap.get(curPath); // 文件不存在，为了保持有序，直接退出不处理后续的记录，等待下一次进入再处理

              if (!(!fileRes || fileRes.status !== 'done')) {
                _context12.next = 16;
                break;
              }

              curArrIsAllDone = false;
              return _context12.abrupt("break", 19);

            case 16:
              i++;
              _context12.next = 10;
              break;

            case 19:
              if (!(_this.queryIsEnd && curArrIsAllDone)) {
                _context12.next = 24;
                break;
              }

              _this.handleIsEnd = true;
              window.clearTimeout(_this.timer);
              _context12.next = 24;
              return _this.onScanEnd({
                errcode: errInfo.errcode || '0000',
                description: errInfo.description || 'success',
                data: {
                  imagesNum: arr.length
                }
              });

            case 24:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    })));

    _defineProperty(this, "getFileAsyncByPath", function (guid, filePath) {
      var retry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var fileRes = {};

      try {
        fileRes = _this.scanner.GetFileAsyncByPath(guid, filePath);
      } catch (error) {
        // 重试三次
        if (retry >= 2) {
          console.error('getFilesData fileRes: ', error);
          return {
            ErrorCode: '500',
            ErrorDescription: '获取扫描仪件异常'
          };
        }

        return _this.getFileAsyncByPath(guid, filePath, retry + 1);
      }

      return fileRes;
    });

    _defineProperty(this, "getFilesData", function () {
      var Files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      for (var i = 0; i < Files.length; i++) {
        var filePath = Files[i];

        if (!_this.asyncPathsMap.get(filePath)) {
          var fileRes = _this.getFileAsyncByPath(_this.Guid, filePath);

          var _fileRes$Base64String2 = fileRes.Base64String,
              Base64String = _fileRes$Base64String2 === void 0 ? '' : _fileRes$Base64String2,
              _fileRes$ErrorDescrip = fileRes.ErrorDescription,
              ErrorDescription = _fileRes$ErrorDescrip === void 0 ? '获取扫描仪件异常' : _fileRes$ErrorDescrip;
          var ErrorCode = fileRes.ErrorCode;

          if (typeof fileRes.ErrorCode === 'undefined') {
            ErrorCode = '500';
          }

          _this.asyncPathsMap.set(filePath, {
            status: 'waiting',
            index: i,
            Base64String: Base64String,
            ErrorDescription: ErrorDescription,
            ErrorCode: ErrorCode
          });
        }
      }
    });

    _defineProperty(this, "QueryResult", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
      var res, _res, Status, Files, Data, ErrorCode, ErrorDescription, curDescription, _ErrorCode;

      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.prev = 0;
              res = _this.scanner.QueryResult(_this.Guid);
              _context13.next = 10;
              break;

            case 4:
              _context13.prev = 4;
              _context13.t0 = _context13["catch"](0);
              console.error('scanner QueryResult error', _context13.t0);
              _context13.next = 9;
              return _this.onScanEnd({
                errcode: '30000',
                description: '扫描异常，请检查扫描仪是否连接正常'
              });

            case 9:
              return _context13.abrupt("return");

            case 10:
              _res = res, Status = _res.Status, Files = _res.Files, Data = _res.Data, ErrorCode = _res.ErrorCode, ErrorDescription = _res.ErrorDescription; // 扫描异常

              if (!(ErrorCode != '0')) {
                _context13.next = 17;
                break;
              }

              _this.debug && console.warn('QueryResult res', res);
              _this.sourceName = '';
              _context13.next = 16;
              return _this.onScanEnd({
                errcode: '30001',
                description: ErrorDescription || '扫描异常，请检查扫描仪是否连接正常'
              });

            case 16:
              return _context13.abrupt("return");

            case 17:
              if (!(Status == 1)) {
                _context13.next = 24;
                break;
              }

              _this.processFile = Files;

              _this.getFilesData(Files);

              _context13.next = 22;
              return _this.handleScanedFiles();

            case 22:
              _context13.next = 36;
              break;

            case 24:
              if (!(Status == 2)) {
                _context13.next = 36;
                break;
              }

              _this.queryIsEnd = true;

              if (Data.Paths && Data.Paths.length > _this.processFile.length) {
                _this.processFile = Data.Paths;

                _this.getFilesData(_this.processFile);
              }

              if (!(Data.ErrorCode != '0')) {
                _context13.next = 34;
                break;
              }

              _ErrorCode = '30002';

              if (Data.ErrorCode == 7) {
                _this.sourceName = ''; // 无法找到扫描仪时重新打开选择扫描仪

                _ErrorCode = '30004';
                curDescription = '无法打开指定的扫描仪，请检查扫描仪是否选择正确';
              } else if (Data.ErrorCode == 9) {
                _ErrorCode = '30004';
                curDescription = '扫描仪缺纸，请检查！';
              } else if (Data.ErrorCode == 10) {
                _ErrorCode = '30005';
                curDescription = '扫描仪卡纸，请检查！';
              } else {
                curDescription = Data.ErrorDescription || '扫描异常，请重试';
              }

              _context13.next = 32;
              return _this.handleScanedFiles({
                errcode: _ErrorCode,
                description: curDescription
              });

            case 32:
              _context13.next = 36;
              break;

            case 34:
              _context13.next = 36;
              return _this.handleScanedFiles();

            case 36:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, null, [[0, 4]]);
    })));

    _defineProperty(this, "loopHandlerFiles", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              if (!_this.handleIsEnd) {
                _context14.next = 3;
                break;
              }

              window.clearTimeout(_this.timer);
              return _context14.abrupt("return");

            case 3:
              _context14.prev = 3;

              if (!_this.queryIsEnd) {
                _context14.next = 9;
                break;
              }

              _context14.next = 7;
              return _this.handleScanedFiles();

            case 7:
              _context14.next = 11;
              break;

            case 9:
              _context14.next = 11;
              return _this.QueryResult();

            case 11:
              _context14.next = 16;
              break;

            case 13:
              _context14.prev = 13;
              _context14.t0 = _context14["catch"](3);
              console.error('loopHandlerFiles error', _context14.t0);

            case 16:
              _this.timer = window.setTimeout(function () {
                _this.loopHandlerFiles();

                return false;
              }, _this.queryDelay);

            case 17:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, null, [[3, 13]]);
    })));

    _defineProperty(this, "AcquireSync", /*#__PURE__*/function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(prdName) {
        var isBlank, res;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                // 同步扫描
                isBlank = _this.ifDuplexEnabled ? 1 : 0;
                _context15.prev = 1;
                res = _this.scanner.AcquireAsync(prdName, _this.duplex, _this.color, _this.resolution, _this.format, isBlank);
                _context15.next = 11;
                break;

              case 5:
                _context15.prev = 5;
                _context15.t0 = _context15["catch"](1);
                console.error('AcquireAsync error', _context15.t0);
                _context15.next = 10;
                return _this.onScanEnd({
                  errcode: '500',
                  description: '扫描服务进程异常，请检查！'
                });

              case 10:
                return _context15.abrupt("return");

              case 11:
                if (!(res.ErrorCode != 0)) {
                  _context15.next = 16;
                  break;
                }

                _this.debug && console.warn('AcquireSync res', res);
                _context15.next = 15;
                return _this.onScanEnd(res);

              case 15:
                return _context15.abrupt("return");

              case 16:
                if (!res.Guid) {
                  _context15.next = 23;
                  break;
                }

                _this.Guid = res.Guid;
                _this.handleIsEnd = false;
                _this.queryIsEnd = false;

                _this.loopHandlerFiles();

                _context15.next = 26;
                break;

              case 23:
                _this.debug && console.warn('AcquireAsync 异常', res);
                _context15.next = 26;
                return _this.onScanEnd({
                  ErrorCode: '30003',
                  ErrorDescription: '扫描异常，请检查扫描仪'
                });

              case 26:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, null, [[1, 5]]);
      }));

      return function (_x11) {
        return _ref13.apply(this, arguments);
      };
    }());

    _defineProperty(this, "onScanEnd", /*#__PURE__*/function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(json) {
        var errorInfo, errcode, description, data;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                errorInfo = {
                  errcode: json.ErrorCode || json.errcode,
                  description: json.ErrorDescription || json.description,
                  data: json.data || ''
                };
                errcode = errorInfo.errcode, description = errorInfo.description, data = errorInfo.data;

                _this.resetScan();

                _context16.prev = 3;

                if (!(typeof _this.uploadFinish == 'function')) {
                  _context16.next = 9;
                  break;
                }

                _context16.next = 7;
                return _this.uploadFinish({
                  errcode: errcode,
                  description: description,
                  data: data
                });

              case 7:
                _context16.next = 11;
                break;

              case 9:
                _context16.next = 11;
                return _this.onError({
                  errcode: errcode,
                  description: description
                });

              case 11:
                _context16.next = 16;
                break;

              case 13:
                _context16.prev = 13;
                _context16.t0 = _context16["catch"](3);
                console.error('onScanEnd error', _context16.t0);

              case 16:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, null, [[3, 13]]);
      }));

      return function (_x12) {
        return _ref14.apply(this, arguments);
      };
    }());

    this.versionMajor = 1;
    this.versionMinor = 4;
    this.version = "".concat(this.versionMajor, ".").concat(this.versionMinor);
    this.disabledClearFiles = _opt.disabledClearFiles || false;
    this.setScanParam(_opt);
    this.initScan(_opt);
  }

  _createClass(ScanFile, [{
    key: "setScanParam",
    value: // 设置扫描相关参数
    function setScanParam() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.duplex = opt.duplex || this.duplex || 0; // 1双面, 0单面

      this.color = opt.color || this.color || 2; // 1: 灰度; 0:B&W 2:彩色

      this.resolution = opt.resolution || this.resolution || 300; //分辨率 100,150,200,300

      this.format = opt.format || this.format || 'jpg'; // bmp,jpg,tiff,png,pdf

      this.ifDuplexEnabled = opt.ifDuplexEnabled || this.ifDuplexEnabled || false; // 过滤空白页
    } // 双面扫描时默认过滤空白页

  }]);

  return ScanFile;
}();

/* harmony default export */ __webpack_exports__["default"] = (ScanFile);

/***/ }),
/* 137 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showDownloadMsi", function() { return showDownloadMsi; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showSelectSource", function() { return showSelectSource; });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function showDownloadMsi() {
  var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var downloadUrl = opt.downloadUrl,
      upgradeFlag = opt.upgradeFlag,
      onCancel = opt.onCancel,
      onConfirm = opt.onConfirm;
  var boxEl = document.getElementById('dialog-download-msi');

  if (!boxEl) {
    var cssStr = "\n        .dialog-download-msi {\n            display: none;\n            position: absolute;\n            width: 100vw;\n            height: 100vh;\n            left: 0;\n            top: 0;\n            z-index: 99999999999;\n        }\n        .dialog-download-msi .mask {\n            z-index: 2;\n            position: absolute;\n            background: #333;\n            opacity: .5;\n            left: 0;\n            top: 0;\n            width: 100%;\n            height: 100%;\n        }\n        .dialog-download-msi .dialog-content {\n            z-index: 5;\n            position: absolute;\n            top: 30%;\n            left: 0;\n            right: 0;\n            margin: auto auto;\n            font-size: 14px;\n            background-color: #eee;\n            border: 2px solid #777;\n            border-left: 2px solid #ddd;\n            border-top: 2px solid #ddd;\n            padding: 15px 20px 0 20px;\n            width: 300px;\n        }\n\n        .dialog-download-msi .dialog-content p {\n            padding: 0;\n            margin: 0;\n            font-weight: bold;\n        }\n        .dialog-download-msi input {\n            min-width: 80px;\n            height: 20px;\n            margin: 10px 10px 20px 0;\n            line-height: 0;\n        }";
    var styleEl = document.createElement('style');
    styleEl.innerHTML = cssStr;
    document.getElementsByTagName('head')[0].appendChild(styleEl);
    var description = '当前未安装扫描必须的组件JsScanner.msi，您可以下载安装后再使用';

    if (upgradeFlag) {
      description = '当前有新版本可以更新，您可以下载安装后再使用';
    }

    var boxInnerHtml = "\n        <div class=\"mask\"></div>\n        <div class=\"dialog-content\">\n            <p>".concat(description, "</p>\n            <a style=\"display: none\" href=\"").concat(downloadUrl, "\" id=\"downloadLink\" target=\"_blank\">download</a>\n            <div class=\"dialog-buttons\">\n                <input type=\"button\" value=\"\u4E0B\u8F7D\" id=\"comConfirmDownloadBtn\" />\n                <input\n                    type=\"button\"\n                    value=\"\u53D6\u6D88\"\n                    class=\"cancelDownloadBtn\"\n                    id=\"cancelDownloadBtn\"\n                />\n            </div>\n        </div>");
    var newBoxEl = document.createElement('div');
    newBoxEl.id = 'dialog-download-msi';
    newBoxEl.className = 'dialog-download-msi';
    newBoxEl.innerHTML = boxInnerHtml;
    document.body.prepend(newBoxEl, document.body.firstChild);
    newBoxEl.style.display = 'block'; // 确定下载按钮

    document.getElementById('comConfirmDownloadBtn').onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              document.getElementById('dialog-download-msi').style.display = 'none';
              document.getElementById('downloadLink').click();
              _context.next = 4;
              return onConfirm();

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })); // 取消选择

    document.getElementById('cancelDownloadBtn').onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return onCancel();

            case 2:
              document.getElementById('dialog-download-msi').style.display = 'none';

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
  } else {
    boxEl.style.display = 'block';
  }
}
function showSelectSource() {
  var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Element.prototype.on = function (type, fn) {
    if (window.addEventListener) {
      //高级浏览器事件绑定
      this.addEventListener(type, fn, false);
    } else {
      //IE9以下浏览器
      this.attachEvent('on' + type, fn);
    }
  };

  var scannerSources = opt.scannerSources,
      sourceName = opt.sourceName,
      onSelect = opt.onSelect,
      onConfirm = opt.onConfirm,
      onCancel = opt.onCancel;
  var boxEl = document.getElementById('dialog-selectsourceBox');

  if (!boxEl) {
    var cssStr = ".dialog-selectsourceBox {\n                display: none;\n                position: absolute;\n                width: 100vw;\n                height: 100vh;\n                left: 0;\n                top: 0;\n                z-index: 99999999999;\n            }\n            .dialog-selectsourceBox .mask {\n                z-index: 2;\n                position: absolute;\n                background: #333;\n                opacity: .5;\n                left: 0;\n                top: 0;\n                width: 100%;\n                height: 100%;\n            }\n\n            .dialog-selectsource {\n                z-index: 5;\n                position: absolute;\n                top: 30%;\n                left: 0;\n                right: 0;\n                margin: auto auto;\n                font-size: 14px;\n                background-color: #eee;\n                border: 2px solid #777;\n                border-left: 2px solid #ddd;\n                border-top: 2px solid #ddd;\n                padding: 15px 20px 0 20px;\n                width: 300px;\n            }\n\n            .dialog-selectsource p {\n                padding: 0;\n                margin: 0;\n                font-weight: bold;\n            }\n\n            .dialog-selectsource-sourcelist {\n                height: 70px;\n                padding: 0;\n                background-color: #fff;\n                border: 2px solid #777;\n                border-right: 2px solid #ddd;\n                border-bottom: 2px solid #ddd;\n                overflow-y: auto;\n                overflow-x: hidden;\n                min-width: 240px;\n                -webkit-touch-callout: none;\n                -webkit-user-select: none;\n                -khtml-user-select: none;\n                -moz-user-select: none;\n                -ms-user-select: none;\n                user-select: none;\n            }\n\n            .dialog-selectsource-sourcelist ul {\n                list-style: none;\n                margin: 0;\n                padding: 0;\n            }\n\n            .dialog-selectsource-sourcelist li {\n                padding: 2px 0 2px 2px;\n                margin: 0;\n                list-style: none;\n                cursor: pointer;\n                line-height: 18px;\n            }\n\n            .dialog-selectsource-sourcelist li:hover {\n                background-color: #eff6fd;\n            }\n\n            .dialog-selectsource-sourcelist li.dialog-selectsource-sourcelist-li-selected {\n                background-color: #c7defc;\n            }\n\n            .dialog-selectsource-sourcelist-ul {\n                list-style: none;\n                margin: 0;\n                padding: 0;\n            }\n\n            .dialog-selectsource-buttons>input {\n                min-width: 80px;\n                height: 20px;\n                margin: 10px 10px 20px 0;\n                line-height: 0;\n            }";
    var styleEl = document.createElement('style');
    styleEl.innerHTML = cssStr;
    document.getElementsByTagName('head')[0].appendChild(styleEl);

    var getLiStr = function getLiStr(specSourceName) {
      var liArr = [];

      for (var i = 0; i < scannerSources.length; i++) {
        var curName = scannerSources[i];
        var cls = 'dialog-selectsource-sourcelist-li';

        if (scannerSources.indexOf(specSourceName) === -1 && i === 0 || curName === specSourceName) {
          cls = 'dialog-selectsource-sourcelist-li-selected dialog-selectsource-sourcelist-li';
        }

        liArr.push("<li data-value=\"".concat(curName, "\" data=\"").concat(i, "\" class=\"").concat(cls, "\">").concat(curName, "</li>"));
      }

      return liArr.join('');
    };

    var liStr = getLiStr(sourceName);
    var boxInnerHtml = "\n        <div class=\"mask\"></div>\n        <div class=\"dialog-selectsource\">\n            <p>\u9009\u62E9\u626B\u63CF\u4EEA\u7C7B\u578B</p>\n            <div class=\"dialog-selectsource-sourcelist\">\n                <ul id=\"dialog-selectsource-sourcelist-ul\">".concat(liStr, "</ul>\n            </div>\n            <div class=\"dialog-selectsource-buttons\">\n                <input type=\"button\" value=\"\u786E\u5B9A\" class=\"startScanBtn\" id=\"comConfirmScanBtn\" />\n                <input\n                    type=\"button\"\n                    value=\"\u53D6\u6D88\"\n                    class=\"cancelScanBtn\"\n                    id=\"cancelScanBtn\"\n                />\n            </div>\n        </div>");
    var newBoxEl = document.createElement('div');
    newBoxEl.id = 'dialog-selectsourceBox';
    newBoxEl.className = 'dialog-selectsourceBox';
    newBoxEl.innerHTML = boxInnerHtml;
    document.body.prepend(newBoxEl, document.body.firstChild);
    newBoxEl.style.display = 'block'; // 确定开始扫描

    document.getElementById('comConfirmScanBtn').onclick = function () {
      var el = document.getElementsByClassName('dialog-selectsource-sourcelist-li-selected')[0];
      document.getElementById('dialog-selectsourceBox').style.display = 'none';
      onConfirm(el.innerText);
    }; // 取消选择


    document.getElementById('cancelScanBtn').onclick = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              document.getElementById('dialog-selectsourceBox').style.display = 'none';
              _context3.next = 3;
              return onCancel();

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })); // 扫描仪源选择框添加事件

    var ulBox = document.getElementById('dialog-selectsource-sourcelist-ul');

    var ulBoxListen = function ulBoxListen(e) {
      if (e.target.tagName === 'LI') {
        var curName = e.target.innerText;
        ulBox.innerHTML = getLiStr(curName);
        onSelect(curName);
      }
    };

    ulBox.on('click', ulBoxListen);
  } else {
    boxEl.style.display = 'block';
  }
}

/***/ })
/******/ ]);
});
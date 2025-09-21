(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["processImage"] = factory();
	else
		root["processImage"] = factory();
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

var processUtils = __webpack_require__(1);

var OperateCanvas = __webpack_require__(2)["default"];

var _require = __webpack_require__(3),
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
  // getImgTag: processUtils.getImgTag,
  OperateCanvas: OperateCanvas,
  compressImgFile: compressImgFile
};

/***/ }),
/* 1 */
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

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// import EXIF from 'exif-js';
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
/*
export const getImgTag = (file, tagType = 'Orientation') => {
    return new Promise((resolve) => {
        try {
            EXIF.getData(file, function() {
                // 1、旋转0度，6、顺时针90°，8、逆时针90°，3、旋转180度
                // 2，4，5，7 功能类似 Photoshop 的水平翻转、垂直翻转，照像时不会出现的
                if (['Make', 'Model', 'Orientation'].indexOf(tagType) !== -1) {
                    const result = EXIF.getTag(this, tagType);
                    resolve({
                        errcode: '0000',
                        data: result
                    });
                } else {
                    resolve({
                        errcode: '3000',
                        description: '参数错误，请检查',
                        data: {}
                    });
                }
            });
        } catch (error) {
            resolve({
                errcode: '5000',
                description: '获取图片信息异常',
                data: {}
            });
        }
    });
};
*/

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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return OperateCanvas; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tempCompressImgFile", function() { return tempCompressImgFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compressImgFile", function() { return compressImgFile; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

/***/ })
/******/ ]);
});
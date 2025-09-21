export const DEFAULT_SCALE = 1.0;
export const MAX_AUTO_SCALE = 1.25;
export const SCROLLBAR_PADDING = 40;
export const VERTICAL_PADDING = 5;
export const CSS_UNITS = 96.0 / 72.0;
export const DEFAULT_SCALE_DELTA = 1.1;
export const MIN_SCALE = 0.25;
export const MAX_SCALE = 10.0;
export const THUMBNAIL_HEIGHT = 50;

export const CustomStyle = (function CustomStyleClosure() {
    var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
    var _cache = Object.create(null);
    function CustomStyle() {}
    CustomStyle.getProp = function get(propName, element) {
        if (arguments.length === 1 && typeof _cache[propName] === 'string') {
            return _cache[propName];
        }
        element = element || document.documentElement;
        var style = element.style;
        var prefixed; var uPropName;
        if (typeof style[propName] === 'string') {
            return (_cache[propName] = propName);
        }
        uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
        for (var i = 0,
            l = prefixes.length; i < l; i++) {
            prefixed = prefixes[i] + uPropName;
            if (typeof style[prefixed] === 'string') {
                return (_cache[propName] = prefixed);
            }
        }
        return (_cache[propName] = 'undefined');
    };
    CustomStyle.setProp = function set(propName, element, str) {
        var prop = this.getProp(propName);
        if (prop !== 'undefined') {
            element.style[prop] = str;
        }
    };
    return CustomStyle;
})();

export const Util = (function UtilClosure() {
    function Util() {}
    var rgbBuf = ['rgb(', 0, ',', 0, ',', 0, ')'];
    Util.makeCssRgb = function Util_makeCssRgb(r, g, b) {
        rgbBuf[1] = r;
        rgbBuf[3] = g;
        rgbBuf[5] = b;
        return rgbBuf.join('');
    };
    Util.transform = function Util_transform(m1, m2) {
        return [m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]];
    };
    Util.applyTransform = function Util_applyTransform(p, m) {
        var xt = p[0] * m[0] + p[1] * m[2] + m[4];
        var yt = p[0] * m[1] + p[1] * m[3] + m[5];
        return [xt, yt];
    };
    Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {
        var d = m[0] * m[3] - m[1] * m[2];
        var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
        var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
        return [xt, yt];
    };
    Util.getAxialAlignedBoundingBox = function Util_getAxialAlignedBoundingBox(r, m) {
        var p1 = Util.applyTransform(r, m);
        var p2 = Util.applyTransform(r.slice(2, 4), m);
        var p3 = Util.applyTransform([r[0], r[3]], m);
        var p4 = Util.applyTransform([r[2], r[1]], m);
        return [Math.min(p1[0], p2[0], p3[0], p4[0]),
            Math.min(p1[1], p2[1], p3[1], p4[1]),
            Math.max(p1[0], p2[0], p3[0], p4[0]),
            Math.max(p1[1], p2[1], p3[1], p4[1])];
    };
    Util.inverseTransform = function Util_inverseTransform(m) {
        var d = m[0] * m[3] - m[1] * m[2];
        return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
    };
    Util.apply3dTransform = function Util_apply3dTransform(m, v) {
        return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
    };
    Util.singularValueDecompose2dScale = function Util_singularValueDecompose2dScale(m) {
        var transpose = [m[0], m[2], m[1], m[3]];
        var a = m[0] * transpose[0] + m[1] * transpose[2];
        var b = m[0] * transpose[1] + m[1] * transpose[3];
        var c = m[2] * transpose[0] + m[3] * transpose[2];
        var d = m[2] * transpose[1] + m[3] * transpose[3];
        var first = (a + d) / 2;
        var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;
        var sx = first + second || 1;
        var sy = first - second || 1;
        return [Math.sqrt(sx), Math.sqrt(sy)];
    };
    Util.normalizeRect = function Util_normalizeRect(rect) {
        var r = rect.slice(0);
        if (rect[0] > rect[2]) {
            r[0] = rect[2];
            r[2] = rect[0];
        }
        if (rect[1] > rect[3]) {
            r[1] = rect[3];
            r[3] = rect[1];
        }
        return r;
    };
    Util.intersect = function Util_intersect(rect1, rect2) {
        function compare(a, b) {
            return a - b;
        }
        var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare);
        var orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare);
        var result = [];
        rect1 = Util.normalizeRect(rect1);
        rect2 = Util.normalizeRect(rect2);
        if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) || (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {
            result[0] = orderedX[1];
            result[2] = orderedX[2];
        } else {
            return false;
        }
        if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) || (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {
            result[1] = orderedY[1];
            result[3] = orderedY[2];
        } else {
            return false;
        }
        return result;
    };
    Util.sign = function Util_sign(num) {
        return num < 0 ? -1 : 1;
    };
    var ROMAN_NUMBER_MAP = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM', '', 'X',
        'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC', '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    Util.toRoman = function Util_toRoman(number, lowerCase) {
        var pos; var romanBuf = [];
        while (number >= 1000) {
            number -= 1000;
            romanBuf.push('M');
        }
        pos = (number / 100) | 0;
        number %= 100;
        romanBuf.push(ROMAN_NUMBER_MAP[pos]);
        pos = (number / 10) | 0;
        number %= 10;
        romanBuf.push(ROMAN_NUMBER_MAP[10 + pos]);
        romanBuf.push(ROMAN_NUMBER_MAP[20 + number]);
        var romanStr = romanBuf.join('');
        return (lowerCase ? romanStr.toLowerCase() : romanStr);
    };
    Util.appendToArray = function Util_appendToArray(arr1, arr2) {
        Array.prototype.push.apply(arr1, arr2);
    };
    Util.prependToArray = function Util_prependToArray(arr1, arr2) {
        Array.prototype.unshift.apply(arr1, arr2);
    };
    Util.extendObj = function extendObj(obj1, obj2) {
        for (var key in obj2) {
            obj1[key] = obj2[key];
        }
    };
    Util.getInheritableProperty = function Util_getInheritableProperty(dict, name) {
        while (dict && !dict.has(name)) {
            dict = dict.get('Parent');
        }
        if (!dict) {
            return null;
        }
        return dict.get(name);
    };
    Util.inherit = function Util_inherit(sub, base, prototype) {
        sub.prototype = Object.create(base.prototype);
        sub.prototype.constructor = sub;
        for (var prop in prototype) {
            sub.prototype[prop] = prototype[prop];
        }
    };
    Util.loadScript = function Util_loadScript(src, callback) {
        var script = document.createElement('script');
        var loaded = false;
        script.setAttribute('src', src);
        if (callback) {
            script.onload = function() {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    return Util;
})();

export const PageViewport = (function PageViewportClosure() {
    function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {
        this.viewBox = viewBox;
        this.scale = scale;
        this.rotation = rotation;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        var centerX = (viewBox[2] + viewBox[0]) / 2;
        var centerY = (viewBox[3] + viewBox[1]) / 2;
        var rotateA, rotateB, rotateC, rotateD;
        rotation = rotation % 360;
        rotation = rotation < 0 ? rotation + 360 : rotation;
        switch (rotation) {
        case 180:
            rotateA = -1;
            rotateB = 0;
            rotateC = 0;
            rotateD = 1;
            break;
        case 90:
            rotateA = 0;
            rotateB = 1;
            rotateC = 1;
            rotateD = 0;
            break;
        case 270:
            rotateA = 0;
            rotateB = -1;
            rotateC = -1;
            rotateD = 0;
            break;
        default:
            rotateA = 1;
            rotateB = 0;
            rotateC = 0;
            rotateD = -1;
            break;
        }
        if (dontFlip) {
            rotateC = -rotateC;
            rotateD = -rotateD;
        }
        var offsetCanvasX, offsetCanvasY;
        var width, height;
        if (rotateA === 0) {
            offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
            offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
            width = Math.abs(viewBox[3] - viewBox[1]) * scale;
            height = Math.abs(viewBox[2] - viewBox[0]) * scale;
        } else {
            offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
            offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
            width = Math.abs(viewBox[2] - viewBox[0]) * scale;
            height = Math.abs(viewBox[3] - viewBox[1]) * scale;
        }
        this.transform = [rotateA * scale,
            rotateB * scale, rotateC * scale, rotateD * scale,
            offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
            offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY];
        this.width = width;
        this.height = height;
        this.fontScale = scale;
    }
    PageViewport.prototype = {
        clone: function PageViewPort_clone(args) {
            args = args || {};
            var scale = 'scale' in args ? args.scale : this.scale;
            var rotation = 'rotation' in args ? args.rotation : this.rotation;
            return new PageViewport(this.viewBox.slice(), scale, rotation, this.offsetX, this.offsetY, args.dontFlip);
        },
        convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {
            return Util.applyTransform([x, y], this.transform);
        },
        convertToViewportRectangle: function PageViewport_convertToViewportRectangle(rect) {
            var tl = Util.applyTransform([rect[0], rect[1]], this.transform);
            var br = Util.applyTransform([rect[2], rect[3]], this.transform);
            return [tl[0], tl[1], br[0], br[1]];
        },
        convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {
            return Util.applyInverseTransform([x, y], this.transform);
        }
    };
    return PageViewport;
})();


export function getViewport(pageInfo, scale, rotate) {
    if (arguments.length < 3) {
        rotate = pageInfo.view.rotate;
    }
    return new PageViewport(pageInfo.view, scale, rotate, 0, 0);
}

export function approximateFraction(x) {
    if (Math.floor(x) === x) {
        return [x, 1];
    }
    var xinv = 1 / x;
    var limit = 8;
    if (xinv > limit) {
        return [1, limit];
    } else if (Math.floor(xinv) === xinv) {
        return [1, xinv];
    }
    var x_ = x > 1 ? xinv : x;
    var a = 0;
    var b = 1;
    var c = 1;
    var d = 1;
    while (true) {
        var p = a + c;
        var q = b + d;
        if (q > limit) {
            break;
        }
        if (x_ <= p / q) {
            c = p;
            d = q;
        } else {
            a = p;
            b = q;
        }
    }
    if (x_ - a / b < c / d - x_) {
        return x_ === x ? [a, b] : [b, a];
    } else {
        return x_ === x ? [c, d] : [d, c];
    }
}
export function roundToDivide(x, div) {
    var r = x % div;
    return r === 0 ? x : Math.round(x - r + div);
}

export function binarySearchFirstItem(items, condition) {
    var minIndex = 0;
    var maxIndex = items.length - 1;
    if (items.length === 0 || !condition(items[maxIndex])) {
        return items.length;
    }
    if (condition(items[minIndex])) {
        return minIndex;
    }
    while (minIndex < maxIndex) {
        var currentIndex = (minIndex + maxIndex) >> 1;
        var currentItem = items[currentIndex];
        if (condition(currentItem)) {
            maxIndex = currentIndex;
        } else {
            minIndex = currentIndex + 1;
        }
    }
    return minIndex;
}

export function getVisibleElements(scrollEl, views, sortByVisibility) {
    var top = scrollEl.scrollTop;
    var bottom = top + scrollEl.clientHeight;
    var left = scrollEl.scrollLeft;
    var right = left + scrollEl.clientWidth;
    function isElementBottomBelowViewTop(view) {
        var element = view.pageContainer;
        var elementBottom = element.offsetTop + element.clientTop + element.clientHeight;
        return elementBottom > top;
    }
    var visible = []; var view; var element;
    var currentHeight, viewHeight, hiddenHeight, percentHeight;
    var currentWidth, viewWidth;
    var firstVisibleElementInd = (views.length === 0) ? 0 : binarySearchFirstItem(views, isElementBottomBelowViewTop);
    for (var i = firstVisibleElementInd, ii = views.length; i < ii; i++) {
        view = views[i];
        element = view.pageContainer;
        currentHeight = element.offsetTop + element.clientTop;
        viewHeight = element.clientHeight;
        if (currentHeight > bottom) {
            break;
        }
        currentWidth = element.offsetLeft + element.clientLeft;
        viewWidth = element.clientWidth;
        if (currentWidth + viewWidth < left || currentWidth > right) {
            continue;
        }
        hiddenHeight = Math.max(0, top - currentHeight) + Math.max(0, currentHeight + viewHeight - bottom);
        percentHeight = ((viewHeight - hiddenHeight) * 100 / viewHeight) | 0;
        visible.push({
            id: view.id,
            x: currentWidth,
            y: currentHeight,
            view: view,
            percent: percentHeight
        });
    }
    var first = visible[0];
    var last = visible[visible.length - 1];
    if (sortByVisibility) {
        visible.sort(function(a, b) {
            var pc = a.percent - b.percent;
            if (Math.abs(pc) > 0.001) {
                return -pc;
            }
            return a.id - b.id;
        });
    }
    return {
        first: first,
        last: last,
        views: visible
    };
}

export function getOutputScale(ctx) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
    var pixelRatio = devicePixelRatio / backingStoreRatio;
    return {
        sx: pixelRatio,
        sy: pixelRatio,
        scaled: pixelRatio !== 1
    };
}

export function getCanvasCSSWH(viewport, ctx, { useOnlyCssZoom, maxCanvasPixels, CSS_UNITS }) {
    let hasRestrictedScaling = false;
    const outputScale = getOutputScale(ctx);
    if (useOnlyCssZoom) {
        var actualSizeViewport = viewport.clone({
            scale: CSS_UNITS
        });
        outputScale.sx *= actualSizeViewport.width / viewport.width;
        outputScale.sy *= actualSizeViewport.height / viewport.height;
        outputScale.scaled = true;
    }
    if (maxCanvasPixels > 0) {
        var pixelsInViewport = viewport.width * viewport.height;
        var maxScale = Math.sqrt(maxCanvasPixels / pixelsInViewport);
        if (outputScale.sx > maxScale || outputScale.sy > maxScale) {
            outputScale.sx = maxScale;
            outputScale.sy = maxScale;
            outputScale.scaled = true;
            hasRestrictedScaling = true;
        } else {
            hasRestrictedScaling = false;
        }
    }

    const sfx = approximateFraction(outputScale.sx);
    const sfy = approximateFraction(outputScale.sy);
    const width = roundToDivide(viewport.width * outputScale.sx, sfx[0]);
    const height = roundToDivide(viewport.height * outputScale.sy, sfy[0]);
    const styleWidth = roundToDivide(viewport.width, sfx[1]);
    const styleHeight = roundToDivide(viewport.height, sfy[1]);
    return { width, height, styleWidth, styleHeight, outputScale, hasRestrictedScaling };
}

export function getScale(currentPage, value, opt = {}) {
    var scale = parseFloat(value);
    if (scale > 0) {
        return scale;
    }

    const pdfPageRotate = currentPage.rotate;
    var totalRotation = ((opt.rotation || 0) + pdfPageRotate) % 360;
    var viewport = getViewport(currentPage, CSS_UNITS * DEFAULT_SCALE, totalRotation);
    const { isInPresentationMode, removePageBorders, container } = opt;
    var hPadding = (isInPresentationMode || removePageBorders) ? 0 : SCROLLBAR_PADDING;
    var vPadding = (isInPresentationMode || removePageBorders) ? 0 : VERTICAL_PADDING;
    // 4为修复css 中 pageBorder变量导致出现滚动条，--page-border: 9px solid transparent;
    var pageWidthScale = (container.clientWidth - hPadding - 4) / viewport.width * 1;
    var pageHeightScale = (container.clientHeight - vPadding - 4) / viewport.height * 1;
    switch (value) {
    case 'page-actual':
        scale = 1;
        break;
    case 'page-width':
        scale = pageWidthScale;
        break;
    case 'page-height':
        scale = pageHeightScale;
        break;
    case 'page-fit':
        scale = Math.min(pageWidthScale, pageHeightScale);
        break;
    case 'auto':
        var isLandscape = (currentPage.width > currentPage.height);
        var horizontalScale = isLandscape ? Math.min(pageHeightScale, pageWidthScale) : pageWidthScale;
        scale = Math.min(MAX_AUTO_SCALE, horizontalScale);
        break;
    default:
        console.error('PDFViewer_setScale: "' + value + '" is an unknown zoom value.');
        return;
    }
    return scale;
}

export function watchScroll(viewAreaElement, callback) {
    var debounceScroll = function debounceScroll(evt) {
        if (rAF) {
            return;
        }
        rAF = window.requestAnimationFrame(function viewAreaElementScrolled() {
            rAF = null;
            var currentY = viewAreaElement.scrollTop;
            var lastY = state.lastY;
            if (currentY !== lastY) {
                state.down = currentY > lastY;
            }
            state.lastY = currentY;
            callback(state);
        });
    };
    var state = {
        down: true,
        lastY: viewAreaElement.scrollTop,
        _eventHandler: debounceScroll
    };
    var rAF = null;
    viewAreaElement.addEventListener('scroll', debounceScroll, true);
    return state;
}

export function getDownloadInfo(xhr) {
    let realFilename = '';
    let filename = '';
    let fileType = '';
    let contentType = '';
    try {
        contentType = xhr.getResponseHeader('content-type');
        const contentDisposition = xhr.getResponseHeader('content-disposition');
        if (contentDisposition) {
            // 通过正则匹配到附件文件名称
            const dispositionMatch = contentDisposition.match(/filename[^;\n=]*=((['"]).*?\2|[^;\n]*)/g);
            let disposition = dispositionMatch[0].split('=')[1].replace(/^["']/, '').replace(/["']$/, '');
            disposition = decodeURIComponent(disposition);
            realFilename = disposition;
        }
    } catch (error) {}

    filename = realFilename || filename;
    if (contentType.indexOf('image/') !== -1 || /\.(jpg|JPG|jpeg|JPEG|png|PNG|bmp|BMP)$/.test(filename)) {
        fileType = 'image';
    } else if (contentType.indexOf('excel') !== -1 || contentType.indexOf('spreadsheetml.sheet') !== -1 || /\.(xlsx|xls)$/.test(filename)) {
        fileType = 'excel';
    } else if (contentType.indexOf('application/pdf') !== -1 || /\.pdf$/.test(filename)) {
        fileType = 'pdf';
    } else if (contentType.indexOf('application/json') !== -1) {
        fileType = 'json';
    } else {
        fileType = 'office';
    }

    return {
        fileType,
        filename
    };
}
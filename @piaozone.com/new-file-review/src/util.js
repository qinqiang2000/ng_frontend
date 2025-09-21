/*eslint-disable*/
// 获取文件名中的后缀
export function getFileExtend(fileName) {
    return fileName && fileName.substring(fileName.lastIndexOf('.') + 1).toUpperCase();
}

// 获取文件类型
export function getFileType(ext) {
    ext = ext.toUpperCase();
    if (['PDF'].indexOf(ext) !== -1) {
        return 'pdf';
    } else if (['XLS', 'XLSX', 'CSV'].indexOf(ext) !== -1) {
        return 'excel';
    } else if (['XML'].indexOf(ext) !== -1) {
        return 'xml';
    } else if (['BMP', 'PNG', 'JPEG', 'JPG', 'GIF', 'OFD'].indexOf(ext) !== -1) {
        return 'image';
    } else if (['DOC', 'DOCX'].indexOf(ext) !== -1) {
        return 'docx';
    } else if (['PPT', 'PPTX'].indexOf(ext) !== -1) {
        return 'ppt';
    } else if (['TXT'].indexOf(ext) !== -1) {
        return 'txt';
    } else if (['HEIC'].indexOf(ext) !== -1) {
        return 'heic';
    }
    return 'unknown';
}

export const clientCheck = function() {
    //rendering engines
    var engine = {
        ie: 0,
        gecko: 0,
        webkit: 0,
        khtml: 0,
        opera: 0,
        ver: null
    };
    //browsers
    var browser = {
        ie: 0,
        firefox: 0,
        safari: 0,
        konq: 0,
        opera: 0,
        chrome: 0,
        ver: null
    };
    //platform/device/OS
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
    };
    //detect rendering engines/browsers
    var ua = navigator.userAgent;
    if (window.opera){
        engine.ver = browser.ver = window.opera.version();
        engine.opera = browser.opera = parseFloat(engine.ver);
    } else if (/AppleWebKit\/(\S+)/.test(ua)){
        engine.ver = RegExp['$1'];
        engine.webkit = parseFloat(engine.ver);

        //figure out if it's Chrome or Safari
        if (/Chrome\/(\S+)/.test(ua)){
            browser.ver = RegExp['$1'];
            browser.chrome = parseFloat(browser.ver);
        } else if (/Version\/(\S+)/.test(ua)){
            browser.ver = RegExp['$1'];
            browser.safari = parseFloat(browser.ver);
        } else {
            //approximate version
            var safariVersion = 1;
            if (engine.webkit < 100){
                safariVersion = 1;
            } else if (engine.webkit < 312){
                safariVersion = 1.2;
            } else if (engine.webkit < 412){
                safariVersion = 1.3;
            } else {
                safariVersion = 2;
            }

            browser.safari = browser.ver = safariVersion;
        }
    } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)){
        engine.ver = browser.ver = RegExp['$1'];
        engine.khtml = browser.konq = parseFloat(engine.ver);
    } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)){
        engine.ver = RegExp['$1'];
        engine.gecko = parseFloat(engine.ver);

        //determine if it's Firefox
        if (/Firefox\/(\S+)/.test(ua)){
            browser.ver = RegExp['$1'];
            browser.firefox = parseFloat(browser.ver);
        }
    } else if (/MSIE ([^;]+)/.test(ua)){
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    } else if (/Trident\/7.0/.test(ua) && /rv:([^\)]+)\)/.test(ua)) { // edge 11版本
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    } else if (/Edge\/(\S+)/.test(ua)) { // edge 12或者更高版本
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    }

    //detect browsers
    browser.ie = engine.ie;
    browser.opera = engine.opera;

    //detect platform
    var p = navigator.platform;
    system.win = p.indexOf('Win') == 0;
    system.mac = p.indexOf('Mac') == 0;
    system.x11 = (p == 'X11') || (p.indexOf('Linux') == 0);

    //detect windows operating systems
    if (system.win){
        if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)){
            if (RegExp['$1'] == 'NT'){
                switch(RegExp['$2']){
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
            } else if (RegExp['$1'] == '9x'){
                system.win = 'ME';
            } else {
                system.win = RegExp['$1'];
            }
        }
    }

    //mobile devices
    system.iphone = ua.indexOf('iPhone') > -1;
    system.ipod = ua.indexOf('iPod') > -1;
    system.ipad = ua.indexOf('iPad') > -1;
    system.nokiaN = ua.indexOf('NokiaN') > -1;

    //windows mobile
    if (system.win == 'CE'){
        system.winMobile = system.win;
    } else if (system.win == 'Ph'){
        if(/Windows Phone OS (\d+.\d+)/.test(ua)){;
            system.win = 'Phone';
            system.winMobile = parseFloat(RegExp['$1']);
        }
    }

    //determine iOS version
    if (system.mac && ua.indexOf('Mobile') > -1){
        if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)){
            system.ios = parseFloat(RegExp.$1.replace('_', '.'));
        } else {
            system.ios = 2;  //can't really detect - so guess
        }
    }

    //determine Android version
    if (/Android (\d+\.\d+)/.test(ua)){
        system.android = parseFloat(RegExp.$1);
    }

    //gaming systems
    system.wii = ua.indexOf('Wii') > -1;
    system.ps = /playstation/i.test(ua);

    return {
        engine: engine,
        browser: browser,
        system: system
    };
};

export const getUrlParam = function(url, k) {
    var urlParams = url.split('?');

    var result = '';
    if (urlParams.length > 1) {
        var tempArr = urlParams[1].split('&');
        for (var i = 0, len = tempArr.length; i < len; i++) {
            var splitIndex = tempArr[i].indexOf('=');
            var paramKey = tempArr[i].substr(0, splitIndex);
            var paramValue = tempArr[i].substr(splitIndex + 1);
            if (k === paramKey) {
                result = paramValue;
                break;
            }
        }
    }
    return result;
};

// 获取图像旋转任意角度后, 在指定区域显示的大小, emptyPix为留白区域大小
export function getRotateRect(deg, imgWidth, imgHeight, maxWidth, maxHeight, emptyPix = 10, minWidth, minHeight) {
    const pi = parseFloat(Math.PI / 180);
    const cos = Math.cos;
    const sin = Math.sin;
    const rate = parseFloat(imgWidth / imgHeight);
    deg = Math.abs(deg);
    deg = deg % 360;

    let maxRw = maxWidth - emptyPix;
    let maxRh = maxHeight - emptyPix;
    let rw = imgWidth;
    let rh = imgHeight;

    if (deg === 0 || deg === 180) {
        maxRw = maxWidth;
        maxRh = maxHeight;
    } else if (deg === 90 || deg === 270) {
        maxRw = maxHeight;
        maxRh = maxWidth;
    } else if ((deg > 0 && deg < 90) || (deg > 180 && deg < 270)) {
        maxRw = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
        maxRh = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
    } else if ((deg > 90 && deg < 180) || (deg > 270 && deg < 360)) {
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
        rw: parseInt(rw),
        rh: parseInt(rh)
    };
}
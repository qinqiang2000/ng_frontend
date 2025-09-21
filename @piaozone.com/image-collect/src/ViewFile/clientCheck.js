/* eslint-disable */

//client check
export var clientCheck = function() {
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

//判断数组中是否存在某个值
function findItem(arr, val){
	for(var i=0;i<arr.length;i++){

		if(arr[i] == val){
			return i;
		}
	}
	return -1;
};

//获取地址的绝对路径
export function getFullPath(path, basePath){
	if(/^https?:\/\/.*$/.test(path)){
		return path;
	}
	var basePath = basePath || (location.href).replace(/\/[0-0a-zA-Z\._-]*$/,'');
	var rootPath = location.origin;
	if(/^\/.*$/.test(path)){ //以斜杠开始
		return rootPath+path;
	}else if(/^\.\/.*$/.test(path)){
		return basePath+path.replace('^\.','');
	}else if(/^\.\.\/.*/.test(path)){ //双斜杠开始
		var puri = path.split('/');
		var newUri = [];
		for(var i=0;i<puri.length; i++){
			if(puri[i] == '..' && rootPath != basePath){
				basePath = basePath.replace(/\/[0-0a-zA-Z\._-]*$/,'');
			}else if(puri[i] !='.' && puri[i] != '..'){
				newUri.push(puri[i]);
			}
		}
		return basePath + '/' + newUri.join('/');
	}
}


//同步加载，urls之间有前后依赖关系时可以选择这种方式，速度稍微慢些
//如果前面的一个url地址找不到，后续的则不会加载
export function loadScript(sUrls, callback){
	var loadedUnAMDScripts = [];
	var urls = [];
	var scriptsObj = document.getElementsByTagName('script');

	for(var i=0;i<sUrls.length;i++){ //转换路径
		urls.push(getFullPath(sUrls[i]));
	}

	for(var i=0,len=scriptsObj.length;i<len;i++){ //查看那些脚本已经加载
		var src = scriptsObj[i].src || '';
		if(src != ''){
			loadedUnAMDScripts.push(src);
		}
	}

	if(typeof urls === 'string'){
		urls = [urls];
	}
	return (function next(i){
		if(findItem(loadedUnAMDScripts, urls[i]) == -1){ //判断是否已经加载过
			if(i<urls.length){
				var script = document.createElement ("script");
				script.type = "text/javascript";
				if(script.readyState){ //IE
					script.onreadystatechange = function(){
						if (script.readyState == "loaded" || script.readyState == "complete"){
							script.onreadystatechange = null;
							loadedUnAMDScripts.push(this.src);
							next(i+1);
						}
					};
				}else{ //Others
					script.onload = function(){

						loadedUnAMDScripts.push(this.src);
						next(i+1);
					};
				}
                console.log('urls[i]', urls[i]);
				script.src = urls[i];
				if(/^.*sea\.js\/?$/.test(urls[i])){
					script.id = 'seajsnode';
				}
				document.getElementsByTagName("head")[0].appendChild(script);
			}else{
				callback();
			}
		}else{ //如果已经加载过则直接加载下一个
			next(i+1);
		}

	}(0));
};


export function ajaxRequest(url, options){
    return new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        var onResponseProgress = options.onResponseProgress || (f => f);
        xhr.onload = () => {
            resolve({ response: xhr.response });
        };

        xhr.onprogress = (evt = {}) => {
            onResponseProgress(evt.loaded, evt.total, xhr);
        };

        try {
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.send();
        } catch (e) {
            resolve({ errcode: 'err', description: '获取文件异常' });
        }
    });
}

// buffer转换为字符串
export function buf2char(buffer) {
    var array = new Uint8Array(buffer);
    var res = '';
    var chunk = 8 * 1024;
    var i;
    for (i = 0; i < array.length / chunk; i++) {
        res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk));
    }
    res += String.fromCharCode.apply(null, array.slice(i * chunk));
    return decodeURIComponent(escape(res));
}


export function getDownloadInfo(xhr) {
    var realFilename = '';
    var filename = '';
    var fileType = '';
    var contentType = '';
    try {
        contentType = xhr.getResponseHeader('content-type');
        var contentDisposition = xhr.getResponseHeader('content-disposition');
        var contentEncoding = xhr.getResponseHeader('Content-Encoding');
        if (contentDisposition) {
            // 通过正则匹配到附件文件名称
            var dispositionMatch = contentDisposition.match(/filename[^;\n=]*=((['"]).*?\2|[^;\n]*)/g);
            var disposition = dispositionMatch[0].split('=')[1].replace(/^["']/, '').replace(/["']$/, '');
            disposition = decodeURIComponent(disposition, 'UTF-8');
            realFilename = disposition;
        }
    } catch (error) {}

    filename = realFilename || filename;
    if (contentType.indexOf('image/') !== -1 || /\.(jpg|JPG|jpeg|JPEG|png|PNG|bmp|BMP)$/.test(filename)) {
        fileType = 'image';
    } else if (contentType.indexOf('excel') !== -1 || contentType.indexOf('spreadsheetml.sheet') !== -1 || /\.(xlsx|xls)$/.test(filename)) {
        fileType = 'excel';
    } else if (contentType.indexOf('application/pdf') !== -1 || /\.(pdf|PDF)$/.test(filename)) {
        fileType = 'pdf';
    } else if (contentType.indexOf('application/json') !== -1) {
        fileType = 'json';
    } else if (contentType.indexOf('text/html') !== -1) {
        fileType = 'html';
    } else if (contentType.indexOf('text/') !== -1) {
        fileType = 'text';
    } else if (contentEncoding === 'gzip') {
        fileType = 'zip';
    } else {
        fileType = 'office';
    }
    return {
        fileType: fileType,
        filename: filename
    };
}

export function uint8ArrayToBase64(buffer) {
    // var str = String.fromCharCode(...new Uint8Array(buffer));
    var array = new Uint8Array(buffer);
    var res = '';
    var chunk = 8 * 1024;
    var i;
    for (i = 0; i < array.length / chunk; i++) {
        res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk));
    }
    res += String.fromCharCode.apply(null, array.slice(i * chunk));
    return window.btoa(res);
}


export function loadCss(urls) {
    for (var i = 0; i < urls.length; i++) {
        var url = urls[i];
        var linkEl = document.createElement('link');
        if (/\.css$/.test(url)) {
            linkEl.rel = 'stylesheet';
        } else {
            linkEl.rel = 'resouce';
        }
        linkEl.href = url;
        document.getElementsByTagName('head')[0].appendChild(linkEl);
    }
}

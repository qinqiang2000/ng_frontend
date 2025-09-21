const loadedUnAMDScripts = [];
const scriptsObj = document.getElementsByTagName('script');
for (var i = scriptsObj.length; i--;) {
    var src = scriptsObj[i].src || '';
    if (src != '') {
        loadedUnAMDScripts.push(src);
    }
}

//获取地址的绝对路径
const getFullPath = function(path, basePath) {
    if (/^https?:\/\/.*$/.test(path)) {
        return path;
    }
    basePath = basePath || (window.location.href).replace(/\/[0-0a-zA-Z._-]*$/, '');
    var rootPath = window.location.origin;
    if (/^\/.*$/.test(path)) { //以斜杠开始
        return rootPath + path; //以.开始
    } else if (/^\.\/.*$/.test(path)) {
        return basePath + path.replace(/^\./, '');
    } else if (/^\.\.\/.*/.test(path)) { //以..开始
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
    } else { //path开始没有特殊字符
        return basePath + path;
    }
};

//同步加载，urls之间有前后依赖关系时可以选择这种方式，速度稍微慢些
//如果前面的一个url地址找不到，后续的则不会加载
export const syncUse = function(sUrls, callback) {
    var urls = [];
    if (typeof sUrls === 'string') {
        urls.push(getFullPath(sUrls));
    } else {
        for (var i = 0, len = sUrls.length; i < len; i++) { //转换路径
            urls.push(getFullPath(sUrls[i]));
        }
    }

    return (function next(i) {
        if (loadedUnAMDScripts.indexOf(urls[i]) == -1) { //判断是否已经加载过
            if (i < urls.length) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                if (script.readyState) { //IE
                    script.onreadystatechange = function() {
                        if (script.readyState == 'loaded' || script.readyState == 'complete') {
                            script.onreadystatechange = null;
                            next(i + 1);
                        }
                    };
                } else { //Others
                    script.onload = function() {
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
        } else { //如果已经加载过则直接加载下一个
            next(i + 1);
        }
    }(0));
};

//异步加载，urls之间不相互依赖时可以选择这种方式, 不保证urls的加载顺序
//如果前面的一个url地址找不到，后续会继续加载，但callback不会执行
//如果有重复的url无法控制是否已经加载
export const use = function(sUrls, callback) { //异步加载
    var loadedNumber = 0;
    var jsNumber;
    var urls = [];

    if (typeof sUrls === 'string') {
        urls.push(getFullPath(sUrls));
    } else {
        for (let i = sUrls.length; i--;) { //转换路径
            urls.push(getFullPath(sUrls[i]));
        }
    }
    jsNumber = urls.length;
    for (let i = jsNumber; i--;) {
        var jsSrc = urls[i];
        if (loadedUnAMDScripts.indexOf(jsSrc) == -1) { //判断是否已经加载过
            var script = document.createElement('script');
            script.type = 'text/javascript';
            if (script.readyState) { //IE
                script.onreadystatechange = function() {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        script.onreadystatechange = null;
                        if (++loadedNumber == jsNumber) {
                            callback();
                        }
                    }
                };
            } else { //Others
                script.onload = function() {
                    if (++loadedNumber == jsNumber) {
                        callback();
                    }
                };
            }
            script.src = urls[i];
            if (/^.*sea\.js\/?$/.test(jsSrc)) {
                script.id = 'seajsnode';
            }
            document.getElementsByTagName('head')[0].appendChild(script);
            loadedUnAMDScripts.push(urls[i]);
        } else {
            if (++loadedNumber == jsNumber) {
                callback();
            }
        }
    }
};
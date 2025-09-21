/**
 * 获取文件后缀名
 */
/* eslint-disable */
export function getFileExtensionByName(filename) {
    if (typeof filename !== 'string') {
        try {
            filename = filename.toString();
        } catch (error) {
            return '';
        }
    }
    if (filename.lastIndexOf('.') < 0) {
        return '';
    }
    return filename.substring(filename.lastIndexOf('.') + 1).toUpperCase();
}

export function getBrowser() {
    const IE11 = navigator.userAgent.replace(
        /(.*)(Trident)(.*)(rv\:)(\d+)(.*)/,
        function (match, p1, p2, p3, p4, p5, p6, offset) {
            if (p2 == 'Trident') {
                return 'IE/' + p5;
            }
            return p2 + '/' + p5;
        }
    );

    const IE = navigator.userAgent.replace(/(.*)(MS)(IE)\s(\d+)(.*)/, function (match, p1, p2, p3, p4, p5, offset) {
        return p3 + '/' + p4;
    });

    const Chrome = navigator.userAgent.replace(/(.*)(Chrome\/\d+)(.*)/, function (match, p1, p2, offset) {
        return p2;
    });

    const Firefox = navigator.userAgent.replace(/(.*)(Firefox\/\d+)/, function (match, p1, p2, offset) {
        return p2;
    });
    let version = '';
    if (IE11 == 'IE/11' || IE.indexOf('IE') > -1) {
        return { browser: 'IE', version: 11 };
    }
    if (Chrome.indexOf('Chrome') > -1) {
        version = Chrome.substring(7);
        return { browser: 'Chrome', version };
    }
    if (Firefox.indexOf('Firefox') > -1) {
        version = Firefox.substring(8);
        return { browser: 'Firefox', version };
    }

    return 'unknown';
}

export const urlSearch = function(search=''){
    search = search.replace(/^\?/, '');
    const urlParams = {};
    const urlParamArr = search.split('&');
    for(let i=0,len = urlParamArr.length; i<len;i++){
        const param = urlParamArr[i].split('=');
        let tempValue = '';
        if(param.length > 1){
            tempValue = param[1];
        }
        urlParams[param[0]] = tempValue;
    }
    return urlParams;
}

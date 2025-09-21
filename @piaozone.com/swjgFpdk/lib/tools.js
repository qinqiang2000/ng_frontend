import { cookieHelp } from '@piaozone.com/utils';

var getCookie = cookieHelp.getCookie;


export function createJsonpCallback() {
    var d = new Date().getTime();
    var r = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
        return (d + Math.random() * 10) % 10 | 0;
    });

    return 'jQuery11020' + r + '_' + d;
}

export function sleep() {
    var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3000;

    return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
            resolve();
        }, time);
    });
}

function getLoginCookies() {
    var nsrmc = getCookie('nsrmc');
    var token = getCookie('token');
    var cookieResult = ['XCSFXS=@%23%24%25%21@%23'];

    if (nsrmc) {
        cookieResult.push('nsrmc=' + escape(nsrmc));
    }

    if (token) {
        cookieResult.push('token=' + escape(token));
    }

    return cookieResult.join('; ');
}

function getFpdkCookies() {
    var skssq = getCookie('skssq');
    var gxrqfw = getCookie('gxrqfw');
    var dqrq = moment().format('YYYY-MM-DD');
    var nsrmc = getCookie('nsrmc');
    var token = getCookie('govToken');

    if (token && skssq && gxrqfw) {
        return 'skssq=' + escape(skssq) + '; gxrqfw=' + escape(gxrqfw) + '; dqrq=' + dqrq + '; nsrmc=' + escape(nsrmc) + '; token=' + escape(token) + '; XCSFXS=@%23%24%25%21@%23';
    } else {
        return '';
    }
}

export function createFpdkHeader(baseUrl) {
    var cookieFlag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'login';
    var contentType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'application/x-www-form-urlencoded;charset=utf-8';

    return {
        'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
        'Referer': baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-:\.]+\/)(.*)$/, '$1'),
        'Host': baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\/.*$/g, ''),
        'Content-Type': contentType,
        'Connection': 'Keep-Alive',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Cookie': cookieFlag === 'login' ? getLoginCookies() : getFpdkCookies()
    };
}
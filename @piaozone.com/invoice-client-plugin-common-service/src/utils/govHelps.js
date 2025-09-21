/* eslint-disable */
const Array = global.Array;

export function getCookie(loginedCookies, key) {
    for (let i = 0; i < loginedCookies.length; i++) {
        const cookie = loginedCookies[i];
        const name = cookie.name;
        const value = cookie.value;
        if (name === key) {
            return unescape(value);
        }
    }
    return null;
}

export function getNtCookie(name) {
    const nameEQ = name + '=';
    // eslint-disable-next-line
    const str = document.cookie.split(';');

    for (let i = 0; i < str.length; i++) {
        let c = str[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return unescape(c.substring(nameEQ.length, c.length));
        }
    }
    return '';
}

export function createEntryKey(loginedCookies, t, nStr = '2|4|5|0|1|3') {
    var n = nStr.split('|');
    var o = 0;
    while (1) {
        switch (n[o++]) {
            case '0':
                if (!h) {
                    h = 3;
                } else {
                    var u = h['index'];
                    h = parseInt(d.substring(u, u + 1), 10) + 3;
                }
                continue;
            case '1':
                var c = ('' + t).concat('').split('').reverse().join('') + (''.concat(d).split('')).reverse().join('');
                for (var s = '', l = 0; l < c.length; l += h) {
                    var f = c.substring(l, l + h);
                    s += f.split('').reverse().join('');
                }
                continue;
            case '2':
                var d = getCookie(loginedCookies, 'dzfp-ssotoken');
                continue;
            case '3':
                return s.substring(0, 20);
            case '4':
                if (d === null) {
                    d = '';
                }
                continue;
            case '5':
                var h = d.match('[0-9]+');
                continue;
        }
        break;
    }
}

// i的格式 { skssq: 202210 }
export function getUrlYzmByjs(cookie, urlPath, timestamp, i) {
    const t = urlPath.split('?')[0] + '?t=' + timestamp;
    let u = t;
    if (u.indexOf('urlyzm=') !== -1) {
        return u;
    }
    u = u.split('?')[0];
    const c = +new Date();
    const s = createEntryKey(cookie, c);
    var f = u += '?ruuid=' + c;
    if (i) {
        var d = f.split('?').splice(1);
        for (var h in d.map((function(t) {
            return t['split']('=')[0];
        })), i)
        if (!d.includes(''.concat(h))) {
            var p = h.charAt(0).toUpperCase();
            h.length > 1 && (p += h.slice(1));
            var v = i[h];
            void 0 !== v && (f += '&'.concat(p, '=').concat(v));
        }
    }
    const g = ''.concat(s, '+').concat(f);
    const b = hex_md5(g);
    const result = u + ''.concat(u.indexOf('?') ? '&' : '?', 'urlyzm=').concat(encodeURIComponent(b));
    return result;
}

// 生成16位随机数
export function createRandom() {
    for (var arr = ['0', '1'], b = Number(String(new Date().valueOf()).slice(0x3)).toString(0x2), c = 0x28 - b.length, d = '1', e = '1', f = 0; f < c; f++) {
        d += arr[Math.round(Math.random())];
    }
    for (var i = 0; i < 0x17; i++) {
        e += arr[Math.round(Math.random())];
    }
    var f = (parseInt(e, 0x2).toString(0x10) + parseInt(d + b, 0x2).toString(0x10));
    return f;
}


export function Ve(e) {
    if ("" === e || null == e) {
        return e;
    }
    var n = e;
    0 !== n.indexOf('/') && (n += '/');
	var o = e.split('?'), a = [];
    o.length > 1 && (n = o[0], a = o[1].split('&'));
    for (var u = 0; u < a.length; u++) {
        var c = a[u],
            s = c.split('=');
		't' !== s[0] && s[0] !== 'urlyzm' && 'ruuid' !== s[0] && (n += "".concat(n.includes('?') ? '&' : '?')["concat"](c))
    }
    return n.indexOf('?') === -1 && (n += "?"), n
}

export function ze(cookies) {
    var t = getCookie(cookies, 'security-token-key');
    if (!t) {
        var n = getCookie(cookies, 'lsmhToken');
        t = n && n === 'lsmhToken' ? 'SSOTicket' : 'dzfp-ssotoken';
    }
    return t;
}

export function We(tokenInfo) {
    const cookies = tokenInfo.loginedCookies;
    var n = getCookie(cookies, ze(cookies));
    if (n === null) {
        n = '';
    };
    var i = n.match('[0-9]+');
    if (i === null) {
        i = 3;
    }
    var a = i['index'];
    i = parseInt(n.substring(a, a + 1), 10) + 3;
    return {
		num: i,
		tokenVal: n
	};
}

export function Ue(e, t, n, o, tokenInfo = {}) {
    var s = e;
    if (s.indexOf('urlyzm=') > -1) {
        return s;
    }
    s = Ve(s);

    const a = function(source) {
        return source === null ? source : Array.prototype.reverse.call(source)
    };
    var l, f = new Date().valueOf(), d = We(tokenInfo)['num']%2 === 0 ? 50 * Math.random(1) : 49 * Math.random() + 51;

    d >=0 && d <= 50 ? l = function(e) {
        for (var n = We(tokenInfo), r = n.num, o = n.tokenVal, c = a(''.concat(e).split('')).join('') + a(''.concat(o).split('')).join(''), s = '', l = 0;
            l < c.length; l +=r) {
            var f = c.substring(l, l + r);
            s += a(f.split('')).join('');
        }
        return (s.substring(0, 5) + s.substring(15, 20) + s.substring(5, 10)) + s.substring(20, 25)
    }(f) : d >= 51	&& d <= 100 && (l = function(e, t) {
        for (var r = We(tokenInfo), o = r["num"], s = r.tokenVal, l = a(''.concat(e).split('')).join('') + a(''.concat(s).split('')).join(''), f = '', d = 0;
        d < l.length; d+=o) {
            var h = l.substring(d, d + o);
            f +=a(h.split('')).join('');
        }
        var p = "" , v = t;
        if (t) {
            for (var g = 0; g < v.length; g+=o) {
                var b = v.substring(g, g + o);
                p +=a(b.split('')).join('')
            }
        } else {
            p = 'wk123med876dfesd57m72hnb3yfm98fs';
        }
        return p = a(''.concat(p).split('')).join(''), ((f.substring(0, 5) + p.substring(5, 10)) + f.substring(15, 20)) + p.substring(20, 25)
    }(f, t))
    var h = s["indexOf"]("?") === s["length"] - 1 ? '' : s.indexOf('?') > -1 ? '&' : '?',
    p = s +=''.concat(h, 'ruuid=').concat(f);
    if (o) {
        var v = p.split('?').splice(1);
        for (var g in v.map((function(e) {
            return e.split("=")[0];
        })), o);

        if (!v.includes(''.concat(g))) {
            var b = g.charAt(0).toUpperCase();
            g.length > 1 && (b += g.slice(1));
            var m = o[g];
            void 0 !== m && (p += '&'.concat(b, '=').concat(m));
        }
    }
    var y = ''.concat(l, '+').concat(p),
    x = hex_md5(y);
    return s + ''.concat(s.indexOf('?') ? '&' : '?', 'urlyzm=').concat(encodeURIComponent(x));
}

export function generateURLYzm(publicKeyInfo = {}, url, t, tokenInfo = {}) {
    if (!url) {
        return url;
    }
    if (url.indexOf('cssSecurity/v1/getPublicKey') > -1) {
        return url;
    }
    var a = url;
    var u = { ...publicKeyInfo };
    var c = u.publicKey;
    var s = u.tokenKey;
    var l = u.urlType;
    var f = u.urlYzm;
    if (l && l !== '' && '1' !== l && 1 !== l) {
        l === '2' && (a = function(e, t, r) {
            var u = e;
            if (u.indexOf('urlyzm') > -1) {
                return u;
            }
            if (u = Ue(e, '', '', '', tokenInfo), r) {
                var c = u.indexOf('?'),
                s = u.substring(c + 1),
                l = s.indexOf('ruuid='),
                f = s.substring(l + 6);
                f = f.substring(0, f.indexOf('&'));
                var d = u.substring(0, c),
                h = i.substring(e.indexOf('?'), -1) ? e.substring(0, e.indexOf('?')) : e;
                u = Je(s, h),
                u = ''.concat(d, '?urlyzm=').concat(encodeURIComponent(u), '&ruuid=').concat(f);
                return u;
            }
        })(a, 0, c);
    } else if (a = Ue(a, s, 0, t, tokenInfo), f) {
        var d = (new Date)['valueOf']();
        a +='&urls='.concat(d);
    }
    return a;
}

// 生成税局请求的完整参数
export function createGovRequest(originUrl, opt = {}, tokenInfo = {}, requestType) {
    const {
        method = 'get',
        body,
        timeout = [12000, 60000]
    } = opt;
    const userAgent = tokenInfo.userAgent;
    const taxNo = tokenInfo.taxNo;
    const publicKeyInfo = tokenInfo.publicKeyInfo || {};
    const headers = {};
    let url = originUrl.split('?')[0];
    var a = url.includes('?');
    var b = new Date()['valueOf']();
    var c = createRandom();
    let params;
    let tempParams = [];
    const baseUrl = tokenInfo.baseUrl;
    const isDownload = requestType === 'download';
    const loginedCookies = tokenInfo.loginedCookies;
    const cookieArr = [];
    for (let i = 0; i < loginedCookies.length; i++) {
        const curItem = loginedCookies[i];
        cookieArr.push(curItem.name + '=' + curItem.value);
    }

    headers['User-Agent'] = userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
    headers['cookie'] = cookieArr.join('; ');
    if (isDownload || opt.disableTransform) {
        const newUrl = /^http.*$/.test(originUrl) ? originUrl : baseUrl + originUrl;
        const result = {
            headers: {
                ...headers,
                ...(opt.headers || {})
            },
            method: method.toUpperCase(),
            timeout: [12000, 60000]
        };
        if (isDownload) {
            result.timeout = opt.timeout || [12000, 120000];
        } else {
            // 导入数据
            const isImport = requestType === 'import';
            if (!isImport) {
                result.contentType = opt.contentType || 'json';
            }

            if (opt.timeout) {
                result.timeout = opt.timeout;
            }

            if (opt.dataType) {
                result.dataType = opt.dataType;
            }
            if (result.method !== 'GET') {
                if (opt.body) {
                    if (typeof opt.body === 'string') {
                        result.data = JSON.parse(opt.body);
                    } else {
                        result.data = opt.body;
                    }
                }
                if (opt.files) {
                    result.files = opt.files;
                }
            }
        }

        return {
            errcode: '0000',
            description: 'success',
            data: {
                requestUrl: newUrl,
                requestOpt: result
            }
        };
    }

    if (originUrl.split('?').length > 1) {
        params = {};
        const paramItem = originUrl.split('?')[1];
        const paramArr = paramItem.split('&');
        for (let i = 0; i < paramArr.length; i++) {
            const curItem = paramArr[i];
            const curItemArr = curItem.split('=');
            params[curItemArr[0]] = curItemArr[1] || '';

            const firstChar = curItemArr[0].charAt(0).toUpperCase();
            const leftChars = curItemArr[0].slice(1);
            tempParams.push(firstChar + leftChars + '=' + curItemArr[1] || '');
        };
    }
    if (a) {
        url = url.concat('&t=', b);
    } else {
        url = url.concat('?t=', b);
    }
    if (method.toLocaleLowerCase() === 'get') {
        if (!body) {
            url = generateURLYzm(publicKeyInfo, url, params, tokenInfo);
        } else if (typeof body === 'object') {
            url = generateURLYzm(publicKeyInfo, url, body, tokenInfo);
        } else {
            url = generateURLYzm(publicKeyInfo, url, JSON.parse(body), tokenInfo);
        }
    } else {
        url = generateURLYzm(publicKeyInfo, url, params, tokenInfo);
    }
    if (tempParams.length > 0) {
        url += '&' + tempParams.join('&')
    }

    headers['nsrsbh'] = taxNo;
    headers['SSO_SECURITY_CHECK_TOKEN'] = getCookie(tokenInfo.loginedCookies, 'SSO_SECURITY_CHECK_TOKEN');
    headers['X-B3-SpanId'] = c;
    headers['X-B3-Sampled'] = '1';
    headers['X-B3-TraceId'] = c;
    headers['X-Tsf-Client-Timestamp'] = b + '000';
    const result = {
        headers: {
            ...headers,
            ...(opt.headers || {})
        },
        method: method.toUpperCase(),
        timeout
    };

    // 导入数据
    const isImport = requestType === 'import';
    if (!isImport) {
        result.contentType = opt.contentType || 'json';
    }

    if (opt.timeout) {
        result.timeout = opt.timeout;
    }

    if (opt.dataType) {
        result.dataType = opt.dataType;
    }
    if (result.method !== 'GET') {
        if (opt.body) {
            if (typeof opt.body === 'string') {
                result.data = JSON.parse(opt.body);
            } else {
                result.data = opt.body;
            }
        }
        if (opt.files) {
            result.files = opt.files;
        }
    }

    const newUrl = /^http.*$/.test(url) ? url : baseUrl + url;
    return {
        errcode: '0000',
        description: 'success',
        data: {
            requestUrl: newUrl,
            requestOpt: result
        }
    };
}

export function formatData(soureData, type = 1) {
    if (typeof soureData === 'string' || typeof soureData === 'undefined' || typeof soureData === 'number') {
        return soureData;
    }

    if (typeof soureData === 'undefined') {
        return {};
    }

    // 数组
    if (typeof soureData === 'object' && Array.isArray(soureData)) {
        const result = [];
        for (let i = 0; i < soureData.length; i++) {
            const tempData = formatData(soureData[i]);
            result.push(tempData);
        }
        return result;
    }

    // 对象
    const keys = Object.keys(soureData);
    const result = {};
    for (let j = 0; j < keys.length; j++) {
        const k = keys[j];
        if (soureData.hasOwnProperty(k)) {
            let newK = k;
            // 首字母转换为小写
            if (type === 1) {
                newK = k.substring(0, 1).toLocaleLowerCase() + k.substring(1);
            // 首字母转换为大写
            } else if(type === 2) {
                newK = k.substring(0, 1).toUpperCase() + k.substring(1);
            }
            const curData = soureData[k];
            if (Array.isArray(curData)) {
                result[newK] = [];
                for (let i = 0; i < curData.length; i++) {
                    result[newK].push(formatData(curData[i], type));
                }
            } else if (curData === null) {
                result[newK] = null;
            } else if (typeof curData === 'object') {
                result[newK] = formatData(curData, type);
            } else {
                result[newK] = curData;
            }
        }
    }
    return result;
}

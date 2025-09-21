
/*eslint-disable*/

function getCookie(cookieStr, name) {
    const nameEQ = name + '=';
    // eslint-disable-next-line
    const str = cookieStr.split(';');

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

function Ae(t, e) {
    var n, i;
    var a = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''), c = [];
    if (e = e || a.length, t) {
        for (n = 0; n < t; n++) {
            c[n] = a[0 | Math.random() * e];
        }
    } else {
        for (c[8] = c[13] = c[18] = c[23] = "-", c[14] = "4", n = 0; _0x27c221[o(2641)](n, 36); n++) {
            c[n] || (i = 0 | 16 * Math.random(), c[n] = a[19 === n ? 8 | 3 & i : i]);
        }
    }
    return c.join('');
}

export function ke(cookieStr, t) {
    var n = '4|2|1|3|0'.split('|');
    var i = 0;
    while (1) {
        switch (n[i++]) {
        case '0':
            return null;
        case '1':
            var o = s.indexOf(l);
            continue;
        case '2':
            l += '=';
            continue;
        case '3':
            if (-1 !== o) {
                var a = o + l.length;
                var c = s.indexOf(';', a);
                -1 === c && (c = s.length);
                var u = s['substring'](a, c);
                return unescape(u);
            }
            continue;
        case '4':
            var s = cookieStr;
            var l = JSON.parse(JSON.stringify(t));
            continue
        }
        break
    }
}

export function Le(cookieStr) {
    var e = ke(cookieStr, 'security-token-key');
    if (!e) {
        var a = ke(cookieStr, 'lsmhToken');
        e = a && 'lsmhToken' === a ? 'SSOTicket' : 'dzfp-ssotoken'
    }
    return e
}

function qe(cookieStr) {
    var e = Le(cookieStr);
    var n = ke(cookieStr, e);
    null === n && (n = '');
    var o = n.match('[0-9]+');
    if (null === o) {
        o = 3;
    } else {
        var a = o["index"];
        o = parseInt(n.substring(a, a + 1), 10) + 3
    }
    return {
        num: o,
        tokenVal: n
    };
}

function Re(t) {
    var n = '6|5|4|3|0|1|2'.split('|');
    var o = 0;
    while (1) {
        switch (n[o++]) {
        case '0':
            s.length > 1 && (f = s[0], l = s[1].split("&"));
            continue;
        case '1':
            for (var a = 0; a < l.length; a++) {
                var c = l[a], u = c.split("=");
                't' !== u[0] && 'urlyzm' !== u[0] && 'ruuid' !== u[0] && (f += "".concat(f.includes("?") ? "&" : "?").concat(c))
            }
            continue;
        case '2':
            return -1 === f.indexOf("?") && (f += "?"), f;
        case '3':
            var s = t.split("?")
              , l = [];
            continue;
        case '4':
            0 !== f.indexOf("/") && (f += "/");
            continue;
        case '5':
            var f = t;
            continue;
        case '6':
            if ("" === t || null == t)
                return t;
            continue
        }
        break
    }
}

function a(t) {
    return t === null ? t : t.reverse();
}

function Ue(cookieStr, t, e) {
    var c = function(t) {
        for (var n = qe(cookieStr), r = n.num, i = n.tokenVal, c = a(''.concat(t).split('')).join('') + a(''.concat(i).split('')).join(''), u = '', s = 0; s < c.length; s += r) {
            var l = c.substring(s, s + r);
            u += a(l.split('')).join('');
        }
        return u.substring(0, 20);
    }(t);
    var u = Re(e);
    c = ''.concat(c, '+').concat(u);
    return hex_md5(c);
}


function de(data, key) {
    const cipher = moduleCrypto.createCipheriv('aes-256-ecb', key, null);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
    /*
    var o = moduleCrypto.enc.Utf8.parse(e);
    var a = moduleCrypto.enc.Utf8.parse(t);
    return moduleCrypto.AES.encrypt(a, o, {
        mode: moduleCrypto.mode.ECB,
        padding: moduleCrypto.pad.Pkcs7
    })['toString']();
    */
}

function Ye(cookieStr, t, e) {
    var o = Ae(32);
    var a = ''.concat(o).concat(t);
    var c = Ue(cookieStr, '', e);
    return de(a, c);
}


// 暂时不会使用
function ye(t, e, n) {
    return e in t ? Object.defineProperty(t, e, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : t[e] = n, t
}

// 暂时不会使用
function me(t, e) {
    var a = Object.keys(t);
    if (Object.getOwnPropertySymbols) {
        var c = Object['getOwnPropertySymbols'](t);
        e && (c = c["filter"]((function(e) {
            return Object["getOwnPropertyDescriptor"](t, e)['enumerable']
        }))),
        a.push["apply"](a, c)
    }
    return a;
}

function fe(t, e) {
    var i = new ce;
    return i.setPublicKey(e), i.encrypt(t.toString())
}

// 暂时不会使用
function We(optInfo, t) {
    const cookieStr = optInfo.cookieStr;
    var n = optInfo.publicKeyInfo;
    var o = n.publicKey;
    var a = n.mesType;
    var c = {
        mesKey: "",
        enMesKey: ""
    };
    if ("1" === a || 1 === a) {
        var u = Ae(32);
        c.enMesKey = fe(u, o),
        c.mesKey = u
    } else {
        "2" !== a && 2 !== a || (c["mesKey"] = Ue(cookieStr, "", t));
    }
    return c;
}

function getEncryptInfo(optInfo, t, e) {
    var l = {
        mesKey: '',
        enMesKey: '',
        enVal: t
    };
    const cookieStr = optInfo.cookieStr;
    var f = optInfo.publicKeyInfo;  // 获取pubicKey信息
    var d = f['mesType'];
    var h = f['isflag'];
    // 不需要加密的直接返回
    if (h && '1' === h) {
        return l;
    }

    if (d === '1' || d === 1) {
        var p = Ae(32);
        var v = ''.concat(p).concat(jsonStr);
        (l = function(t) {
            for (var r = 1; r < arguments.length; r++) {
                var a = arguments[r] != null ? arguments[r] : {};
                if (r % 2) {
                    me(Object(a), !0).forEach((function(n) {
                        ye(t, n, a[n])
                    }));
                } else {
                    if (Object['getOwnPropertyDescriptors']) {
                        Object['defineProperties'](t, Object['getOwnPropertyDescriptors'](a));
                    } else {
                        me(i(Object(a))).forEach((function(e) {
                            Object['defineProperty'](t, e, Object['getOwnPropertyDescriptor'](a, e));
                        }));
                    }
                }
            }
            return t;
        }({}, We(optInfo)))['enVal'] = de(v, l['mesKey']);
    } else {
        d !== '2' && d !== 2 || (l.enVal = Ye(cookieStr, t, e));
        return l;
    }
}

// 生成加密报文
export function createJmbw(optInfo, jsonData, urlPath, checkType) {
    // 目前为固定值
    if (!checkType) {
        // {mesKey: '', enMesKey: '', enVal: 'wCnSLeRpBD1vxZYPlCOZ2QMRAI51Bsqw6LP2YgF4WtAKOxPi92…4UizQNsn4yTACeajyuH4N37l19lBohtfL6cKYn8IW/voCk6U='}
        var encryInfo = getEncryptInfo(optInfo, JSON.stringify(jsonData), urlPath);
        var jmbwObj = {
            'Jmbw': encryInfo['enVal'],
        };
        return {
            'data': jmbwObj,
            'headers': {
                'security-mes-key': encryInfo['enMesKey']
            }
        };
    }
    return false;
}

function _0x394540(_0x8d0f2d, _0x4ff774) {
    var _0x442010 = Object['keys'](_0x8d0f2d);
    var _0x41a4fa = Object['getOwnPropertySymbols'](_0x8d0f2d);
    _0x4ff774 && (_0x41a4fa = _0x41a4fa.filter(function(_0x3f63c5) {
        return Object['getOwnPropertyDescriptor'](_0x8d0f2d, _0x3f63c5)['enumerable'];
    })),
    _0x442010.push.apply(_0x442010, _0x41a4fa);
    return _0x442010;
}

function _0xec37bc(_0xe010c1, _0x180b0d, _0x14aad6) {
    return _0x180b0d in _0xe010c1 ? Object['defineProperty'](_0xe010c1, _0x180b0d, {
        'value': _0x14aad6,
        'enumerable': !0x0,
        'configurable': !0x0,
        'writable': !0x0
    }) : _0xe010c1[_0x180b0d] = _0x14aad6, _0xe010c1;
}

function _0x300451(_0x56cd91) {
    for (var i = 0x1; i <= arguments.length; i++) {
        var _0x113dfe = null != arguments[i] ? arguments[i] : {};
        i % 2 ? _0x394540(Object(_0x113dfe), !0x0).forEach(function(_0x1845a4) {
            _0xec37bc(_0x56cd91, _0x1845a4, _0x113dfe[_0x1845a4]);
        }) : Object['getOwnPropertyDescriptors'] ? Object['defineProperties'](_0x56cd91, Object['getOwnPropertyDescriptors'](_0x113dfe)) : _0x394540(Object(_0x113dfe)).forEach(function(_0x56dffa) {
            Object['defineProperty'](_0x56cd91, _0x56dffa, Object['getOwnPropertyDescriptor'](_0x113dfe, _0x56dffa));
        });
    }
    return _0x56cd91;
}

function _0x27ee59() {
    for (var _0x17f77c = ['0', '1'], _0x187dd4 = Number(String(new Date().valueOf()).slice(0x3)).toString(0x2), _0x98badb = 0x28 - _0x187dd4.length, _0x149a11 = '1', _0x48590b = '1', _0x4b81ad = 0x0; _0x4b81ad < _0x98badb - 0x1; _0x4b81ad++)
        _0x149a11 += _0x17f77c[Math.round(Math['random']())];
    for (var _0x3c9e09 = 0x0; _0x3c9e09 < 0x17; _0x3c9e09++)
        _0x48590b += _0x17f77c[Math.round(Math.random())];
    var _0x2471eb = parseInt(_0x48590b, 0x2).toString(0x10) + parseInt(_0x149a11 + _0x187dd4, 0x2)['toString'](0x10);
    return _0x2471eb;
}


function He(cookieStr, t, e, n, o) {
    var s = t;
    if (s.indexOf('urlyzm=') > -1)
        return s;
    s = Re(s);
    var l, f = (new Date).valueOf(), d = qe(cookieStr).num % 2 == 0 ? 50 * Math.random(1) : 49 * Math.random() + 51;
    d >= 0 && d <= 50 ? l = function(t) {
        for (var r = qe(cookieStr), o = r.num, u = r.tokenVal, s = a("".concat(t).split("")).join("") + a("".concat(u).split(""))["join"](""), l = "", f = 0; f < s.length; f += o) {
            var v = s["substring"](f, f + o);
            l += a(v.split("")).join("")
        }
        return l["substring"](0, 5) + l.substring(15, 20) + l.substring(5, 10) + l.substring(20, 25)
    }(f) : d >= 51 && d <= 100 && (l = function(t, e) {
        for (var r = qe(cookieStr), o = r.num, s = r.tokenVal, l = a("".concat(t).split("")).join("") + a("".concat(s).split("")).join(""), f = "", d = 0; d < l.length; d += o) {
            var h = l.substring(d, d + o);
            f += a(h.split("")).join("")
        }
        var p = "", v = e;
        if (e)
            for (var b = 0; b < v.length; b += o) {
                var g = v["substring"](b, b + o);
                p += a(g["split"](""))["join"]("")
            }
        else
            p = 'wk123med876dfesd57m72hnb3yfm98fs';
        return p = a("".concat(p).split("")).join(""), f.substring(0, 5) + p.substring(5, 10) + f.substring(15, 20) + p.substring(20, 25)
    }(f, e));
    var h = s.indexOf("?") === s.length - 1 ? "" : s.indexOf("?") > -1 ? "&" : "?"
      , p = s += "".concat(h, "ruuid=").concat(f);
    if (o) {
        var v = p.split("?").splice(1);
        for (var b in v.map((function(t) {
            return t["split"]("=")[0]
        }
        )),
        o)
            if (!v["includes"]("".concat(b))) {
                var g = b["charAt"](0).toUpperCase();
                b.length > 1 && (g += b.slice(1));
                var m = o[b];
                void 0 !== m && (p += "&"["concat"](g, "=")["concat"](m))
            }
    }
    var y = "".concat(l, "+").concat(p)
      , x = hex_md5(y);
    return s + "".concat(s.indexOf("?") ? "&" : "?", 'urlyzm=').concat(encodeURIComponent(x))
}

function generateURLYzm(optInfo, t, e) {
    const cookieStr = optInfo.cookieStr;
    const publicKeyInfo = optInfo.publicKeyInfo;
    var a = '1|4|2|0|3'.split('|');
    var c = 0;
    while (1) {
        switch (a[c++]) {
        case "0":
            if (h && "" !== h && "1" !== h && 1 !== h)
                "2" === h && (s = function(t, e, r) {
                    var a = t;
                    if (a.indexOf('urlyzm=') > -1)
                        return a;
                    if (a = He(cookieStr, t), r) {
                        var c = a.indexOf('?');
                        var u = a.substring(c + 1);
                        var s = u.indexOf('ruuid=');
                        var l = u.substring(s + 6);
                        l = l.substring(0, l.indexOf('&'));
                        var f = a.substring(0, c);
                        var d = t.indexOf("?") > -1 ? t.substring(0, t.indexOf('?')) : t;
                        a = Ye(u, d),
                        a = ''.concat(f, '?urlyzm=').concat(encodeURIComponent(a), '&ruuid=').concat(l)
                    }
                    return a
                }(s, 0, f));
            else if (s = He(cookieStr, s, d, 0, e), p) {
                var u = (new Date).valueOf();
                s += '&urls='.concat(u)
            }
            continue;
        case "1":
            if (!t)
                return t;
            continue;
        case "2":
            var s = t
                , l = publicKeyInfo
                , f = l.publicKey
                , d = l.tokenKey
                , h = l.urlType
                , p = l.urlYzm;
            continue;
        case "3":
            return s;
        case "4":
            if (t.indexOf('cssSecurity/v1/getPublicKey') > -1)
                return t;
            continue
        }
        break
    }
}

function transformRequest(optInfo, _0x55890c, nsrsbh) {
    const cookieStr = optInfo.cookieStr;
    var _0x391ad4 = nsrsbh;
    'old' === _0x55890c.headers['x-api-version'] && (Object['assign'](_0x55890c, {
        'timeout': 60000
    }),
    Object.assign(_0x55890c['headers'], {
        'x-api-version-demo': 'demo'
    }),
    _0x55890c.transformResponse = [function(_0x447210) {
        var _0x2d2ef0 = JSON.parse(_0x447210);
        return _0x2d2ef0['xApiVersion'] = 'old', _0x2d2ef0;
    }]);
    var _0x25ba56 = _0x55890c.url;
    var _0x62de4b = _0x25ba56.includes('?');
    var _0x364157 = new Date().valueOf();
    var _0x5ba6c2 = Object(_0x27ee59)();
    return _0x55890c.url = ''['concat'](_0x25ba56).concat(_0x62de4b ? '&' : '?', 't=').concat(_0x364157),
    'get' === _0x55890c.method.toLocaleLowerCase() ? _0x55890c.url = Object(generateURLYzm)(optInfo, _0x55890c.url, _0x55890c.data || _0x55890c.params) : _0x55890c.url = Object(generateURLYzm)(optInfo, _0x55890c.url, _0x55890c.params),
    _0x391ad4 && (_0x55890c.headers.nsrsbh = _0x391ad4),
    _0x55890c.headers['SSO_SECURITY_CHECK_TOKEN'] = getCookie(cookieStr, 'SSO_SECURITY_CHECK_TOKEN'),
    _0x55890c.headers['X-B3-SpanId'] = _0x5ba6c2,
    _0x55890c.headers['X-B3-Sampled'] = '1',
    _0x55890c.headers['X-B3-TraceId'] = _0x5ba6c2,
    _0x55890c.headers['X-Tsf-Client-Timestamp'] = ''.concat(_0x364157, '000'),
    _0x55890c;
}

export function getRequestInfo(opt, other) {
    const requestUrl = opt.url;
    const { needEncry, baseUrl = '', cookieStr, taxNo, publicKeyInfo } = other;
    let data = opt.data;
    let headers = {
        'security-mes-key': ''
    };
    const optInfo = {
        cookieStr,
        publicKeyInfo
    };
    if (needEncry && data) {
        const jmbwInfo = createJmbw(optInfo, data, requestUrl);
        data = jmbwInfo.data;
        headers = jmbwInfo.headers;
    }
    // let timeout = 25000;
    // if (requestUrl !== '/fpjf/yxjfzz/v1/sendDzfpMail' && requestUrl !== '/kpfw/fpjfzz/v1/openDzfpwj' && requestUrl !== '/ypfw/dkgx/v1/queryFpxx' &&
    // requestUrl !== '/ypfw/ytqr/v1/sqtj' && requestUrl !== '/ypfw/dkgx/v1/exportFpxx') {
    const timeout = 120000;
    const result = _0x300451({
        'timeout': timeout,
        'baseURL': baseUrl
    }, {
        ...opt,
        headers,
        data
    });
    const result2 = transformRequest({
        cookieStr,
        publicKeyInfo
    }, result, taxNo);
    return result2;
    // }
    // return false;
}
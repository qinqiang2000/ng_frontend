/*eslint-disable*/

/*
function Xe(t) {
    var n = (new Date).getTime();
    Me('c_check', n),
    Je(t)
}

function Ze(t) {
    var o = document.getElementById('css_iframe');
    if (!o) {
        try {
            o = document.createElement('<iframe name="css_iframe"></iframe>')
        } catch (a) {
            (o = document.createElement('iframe'))['name'] = 'css_iframe';
        }
        o.style.width = '1px',
        o.style.height = '1px',
        o.style.position = 'absolute',
        o.style.left = '-1000px',
        o.style.top = '-1000px',
        o.setAttribute('id', 'css_iframe'),
        document.body.appendChild(o)
    }
    window['c_checktime'] || function t(r) {
        var a = ke('c_check_flag') , c = ke('c_check');
        if (window['c_checkout'] && clearTimeout(window['c_checkout']), a || c) {
            if (!a && c)
                Me('c_check_flag', true, 60 * Ee * 1e3),
                window['c_checktime'] ? Xe() : (window["c_checktime"] = setInterval(t, 60 * Ee * 1e3), Xe(r));
            else if (a && c) {
                var u = (new Date).getTime();
                var s = 2 * Math["random"]();
                var l = 60 * (Ee + s) *  1e3 - (u - c);
                window['c_checkout'] = setTimeout(t, l)
            }
        } else
            Me('c_check_flag', true, 60 * Ee * 1e3),
            window["c_checktime"] = setInterval(t, 60 * Ee * 1e3),
            Xe()
    }(t)
}
*/

export function getPublicKeyInfo(r) {
    var a = r ? r.publicKey : null;
    var Ee, o;
    var u = a.substring(4, 5);
    var s = a.substring(15, 16);
    var l = a.substring(17, 18);
    a = ''.concat(a.substring(0, 3)).concat(a.substring(4, 15), "}").concat(a.substring(16, 17)).concat(a.substring(18));
    var f = r['securityrate'], d = 0;
    !r['isExcludeUser'] || "1" !== r['isExcludeUser'] && 1 !== r['isExcludeUser'] || (d = '1'),
    function(e, r, i, o, a, c, u) {
        var d = "8|5|9|6|3|4|2|0|7|1".split("|"), h = 0;
        while (1) {
            switch (d[h++]) {
            case "0":
                p[m] = e,
                p[y] = r,
                p[x] = i,
                p[_] = o,
                p[w] = a,
                p[O] = g,
                p[j] = u,
                Object['freeze'](C),
                Object['freeze'](v);
                continue;
            case "1":
                Object['freeze'](p);
                continue;
            case "2":
                var p = {};
                continue;
            case "3":
                var v = {};
                continue;
            case "4":
                v[m] = e,
                v[y] = r,
                v[x] = i,
                v[_] = o,
                v[w] = a,
                v[O] = g,
                v[j] = u;
                continue;
            case "5":
                g < 0 && (g = 2),
                Ee = g;
                // 使c_time的cookie时间增加4个小时
                // Me('c_time', g);
                continue;
            case "6":
                C[m] = e,
                C[y] = r,
                C[x] = i,
                C[_] = o,
                C[w] = a,
                C[O] = g,
                C[j] = u;
                continue;
            case "7":
                continue;
            case "8":
                var g = parseInt(c)/60 - 3;
                continue;
            case "9":
                var m = 'fce4af5a'
                    , y = '4889e050'
                    , x = 'efdcb0cc'
                    , _ = '5ca3af51'
                    , w = '0a7158e0'
                    , O = 'de98r70e'
                    , j = 'ex09bc21'
                    , C = {};
                continue
            }
            break
        }
    }(r.tokenKey, a, u, s, l, f, d),
    // 等于1的情况还未发现
    // "1" !== l && n[t(3592)](1, l) || n[t(5758)](Ze),
    // "1" !== l && 1 !== l || Ze(),
    o = {
        publicKey: a,
        tokenKey: r.tokenKey,
        urlType: u,
        mesType: s,
        clientType: l,
        isflag: d
    };
    return o;
}
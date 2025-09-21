/* eslint-disable */
export default function tpassDecoder() {
	var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	this.encode = function(n) {
		var a, i, r, o, c, s, l, u = "", d = 0;
		n = t(n);
		while (d < n.length)
			a = n.charCodeAt(d++),
			i = n.charCodeAt(d++),
			r = n.charCodeAt(d++),
			o = a >> 2,
			c = (3 & a) << 4 | i >> 4,
			s = (15 & i) << 2 | r >> 6,
			l = 63 & r,
			isNaN(i) ? s = l = 64 : isNaN(r) && (l = 64),
			u = u + e.charAt(o) + e.charAt(c) + e.charAt(s) + e.charAt(l);
		return u
	}
	,
	this.decode = function(t) {
		var a, i, r, o, c, s, l, u = "", d = 0;
		t = t.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (d < t.length)
			o = e.indexOf(t.charAt(d++)),
			c = e.indexOf(t.charAt(d++)),
			s = e.indexOf(t.charAt(d++)),
			l = e.indexOf(t.charAt(d++)),
			a = o << 2 | c >> 4,
			i = (15 & c) << 4 | s >> 2,
			r = (3 & s) << 6 | l,
			u += String.fromCharCode(a),
			64 != s && (u += String.fromCharCode(i)),
			64 != l && (u += String.fromCharCode(r));
		return u = n(u),
		u
	}
	;
	var t = function(e) {
		e = e.replace(/\r\n/g, "\n");
		for (var t = "", n = 0; n < e.length; n++) {
			var a = e.charCodeAt(n);
			a < 128 ? t += String.fromCharCode(a) : a > 127 && a < 2048 ? (t += String.fromCharCode(a >> 6 | 192),
			t += String.fromCharCode(63 & a | 128)) : (t += String.fromCharCode(a >> 12 | 224),
			t += String.fromCharCode(a >> 6 & 63 | 128),
			t += String.fromCharCode(63 & a | 128))
		}
		return t
	}
	  , n = function(e) {
		var t = ""
		  , n = 0
		  , a = 0
		  , i = 0
		  , r = 0;
		while (n < e.length)
			a = e.charCodeAt(n),
			a < 128 ? (t += String.fromCharCode(a),
			n++) : a > 191 && a < 224 ? (i = e.charCodeAt(n + 1),
			t += String.fromCharCode((31 & a) << 6 | 63 & i),
			n += 2) : (i = e.charCodeAt(n + 1),
			r = e.charCodeAt(n + 2),
			t += String.fromCharCode((15 & a) << 12 | (63 & i) << 6 | 63 & r),
			n += 3);
		return t
	}
}
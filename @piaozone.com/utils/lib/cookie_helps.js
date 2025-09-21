'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var getCookie = exports.getCookie = function getCookie(name) {
	var nameEQ = name + '=';
	var str = document.cookie.split(';');

	for (var i = 0; i < str.length; i++) {
		var c = str[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) === 0) {
			return unescape(c.substring(nameEQ.length, c.length));
		}
	}
	return '';
};

var clearCookie = exports.clearCookie = function clearCookie(name) {
	setCookie(name, '', -1);
};

var setCookie = exports.setCookie = function setCookie(name, value, seconds) {
	var otherStr = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

	seconds = seconds || 0;
	var expires = "";
	if (seconds !== 0) {
		var date = new Date();
		date.setTime(date.getTime() + seconds * 1000);
		expires = "; expires=" + date.toGMTString();
		if (otherStr) {
			expires += '; ' + otherStr;
		}
	}
	document.cookie = name + "=" + escape(value) + expires + "; path=/";
};

var clearAllCookie = exports.clearAllCookie = function clearAllCookie() {
	var strCookie = document.cookie;
	var arrCookie = strCookie.split("; ");

	for (var i = 0, len = arrCookie.length; i < len; i++) {
		var arr = arrCookie[i].split("=");
		if (arr.length > 0) {
			setCookie(arr[0], '', -1);
		}
	}
};
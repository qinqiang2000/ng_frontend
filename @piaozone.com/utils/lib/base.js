'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.setPrototypeOf = require('setprototypeof');

if ((typeof window === 'undefined' ? 'undefined' : (0, _typeof3.default)(window)) === 'object') {
	window.requestAnimationFrame = function () {
		return window.requestAnimationFrame || window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (func) {
			return setTimeout(func, 1 / 60);
		};
	}();
}

Function.prototype.method = function (name, func) {
	if (!this.prototype[name]) {
		this.prototype[name] = func;
	}
	return this;
};

Number.method('integer', function () {
	return Math[this < 0 ? 'ceil' : 'floor'](this);
});

String.method('trim', function () {
	return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
});

String.method('replaceInclude', function () {
	return this.replace('）', ')').replace('（', '(');
});

String.method('entityify', function (opt) {
	var entity = {
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;'
	};
	if ((typeof opt === 'undefined' ? 'undefined' : (0, _typeof3.default)(opt)) !== undefined) {
		entity = opt;
	}
	return function () {
		return this.replace(/(["<>&])/g, function (c) {
			return entity[c];
		});
	};
}());

String.method('isEmail', function () {
	return (/^([a-zA-Z0-9_\.-]+)@([a-zA-Z0-9\.-]+)\.([a-zA-Z\.]{2,6})$/.test(this)
	);
});

String.method('isEmpty', function () {
	return (/^[\s]*$/.test(this)
	);
});
String.method('isNotEmpty', function () {
	return (/[\S]+/.test(this)
	);
});

String.method('isPhone', function () {
	return (/^(1[0-9]{10}$)/.test(this)
	);
});
String.method('isPhoneOrMail', function () {
	if (this.isEmail()) {
		return 2;
	} else if (this.isPhone()) {
		return 1;
	} else {
		return false;
	}
});

String.method('getLength', function () {
	var r = /[\x00-\xff]/g;
	var cnLen = this.replace(r, '').length;
	return this.length + cnLen;
});

String.method('isNumber', function () {
	return (/[0-9.]*/.test(this) && isFinite(this)
	);
});

String.method('getSub', function (n, flag) {
	var r = /[^\x00-\xff]/g;
	if (this.replace(r, "mm").length <= n) {
		return this;
	}
	var m = Math.floor(n / 2);
	for (var i = m; i < this.length; i++) {
		if (this.substr(0, i).replace(r, "mm").length >= n) {
			if (flag) {
				return this.substr(0, i) + '...';
			} else {
				return this.substr(0, i);
			}
		}
	}
	return this;
});

String.method('trimUnNumber', function () {
	var v = parseFloat(this.trim());
	if (isNaN(v)) {
		return '';
	} else {
		return v + '';
	}
});

Array.method('indexOf', function (value) {
	var i,
	    len = this.length;
	for (i = 0; i < len; i++) {
		if (this[i] === value) {
			return i;
		}
	}
	return -1;
});
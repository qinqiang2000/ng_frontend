
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';
import '@babel/polyfill';

require('es6-promise').polyfill();

Object.setPrototypeOf = require('setprototypeof');

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60);
};

window.cancelAnimationFrame = window.cancelAnimationFrame || Window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame || function (id) {
	window.clearTimeout(id);
};

window.Map = Map;
window.Set = Set;
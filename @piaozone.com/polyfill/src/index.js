//'use strict';
//import 'core-js/es6/map';
//import 'core-js/es6/set';
//import 'es6-promise/dist/es6-promise.min.js';
//import 'fetch-ie8/fetch.js';
//import 'babel-polyfill';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';
import '@babel/polyfill';

require('es6-promise').polyfill();

Object.setPrototypeOf = require('setprototypeof');

window.requestAnimationFrame=window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	function( callback ){
		//为了使setTimteout的尽可能的接近每秒60帧的效果
		window.setTimeout(callback,1000/60);
	}

window.cancelAnimationFrame=window.cancelAnimationFrame ||
	Window.webkitCancelAnimationFrame ||
	window.mozCancelAnimationFrame ||
	window.msCancelAnimationFrame ||
	window.oCancelAnimationFrame ||
	function( id ){
		window.clearTimeout( id );
	}


window.Map = Map;
window.Set = Set;

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
		//为了使setTimteout的尽可能的接近每秒60帧的效果
		window.clearTimeout( id );
	}


window.Map = Map;
window.Set = Set;
// window.Promise = Promise;
/*
if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}

// fetch() polyfill for making API calls.
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
if (process.env.NODE_ENV === 'test') {
  require('raf').polyfill(global);
}

*/

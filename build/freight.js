;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Freight = require('./src/freight.js');

module.exports = Freight;
},{"./src/freight.js":2}],2:[function(require,module,exports){
var Freight = function() {
	var self = this;

	/**
	 * Sets a cookie given a value of any type.
	 *
	 * @method    define
	 * @public
	 *
	 * @param     {String}   name               The name of the cookie to be set
	 * @param     {Mixed}    value              The value to convert to string and set in the cookie
	 * @param     {Object}   [options]          Options hash
	 * @param     {Mixed}    [options.expires]  The expiration as a number of seconds, or "session", or undefined for one year
	 *
	 * @return    {Boolean}                     Whether or not the cookie was successfully set
	 *
	 * @example
	 *   cookie.set('foo', 'bar', { expires : 1000000 });
	 *   cookie.set('foo', [1, 2, 3], { expires : 'session' });
	 *   cookie.set('foo', { bar : 'baz', boom : 'boosh' });
	 */
	self.define = function(name, value, options) {

	};

};

module.exports = Freight;
},{}]},{},[1])
;
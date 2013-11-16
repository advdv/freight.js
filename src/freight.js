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
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable no-var */

var GLOBAL = require('core/shims/global');

if (typeof process === 'object' && typeof GLOBAL['requestAnimationFrame'] === 'undefined') {
	(function requestAnimationFrameShim() {
		GLOBAL['requestAnimationFrame'] = function requestAnimationFrame(cb) {
			return setTimeout(() => cb(performance.now()), 0);
		};

		GLOBAL['cancelAnimationFrame'] = clearTimeout;
	}());
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import GLOBAL from 'core/shims/global';

if (typeof process === 'object' && typeof GLOBAL['requestAnimationFrame'] === 'undefined') {
	(function requestAnimationFrameShim() {
		GLOBAL['requestAnimationFrame'] = function requestAnimationFrame(cb: Function) {
			return setTimeout(() => cb(performance.now()), 0);
		};

		GLOBAL['cancelAnimationFrame'] = clearTimeout;
	}());
}

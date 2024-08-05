/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import GLOBAL from 'core/shims/global';

if (typeof process === 'object' && typeof GLOBAL['requestIdleCallback'] === 'undefined') {
	(function requestIdleCallbackShim() {
		GLOBAL['requestIdleCallback'] = function requestIdleCallback(cb: Function, options?: {timeout: CanUndef<number>}) {
			const timeout = options?.timeout ?? Math.floor(Math.random() * 30) + 1;

			return setTimeout(handler, timeout);

			function handler() {
				cb({didTimeout: true, timeRemaining: () => 0});
			}
		};

		GLOBAL['cancelIdleCallback'] = clearTimeout;
	}());
}

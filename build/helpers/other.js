'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

Object.assign(
	exports,
	include('build/helpers')
);

/**
 * Waits till the specified callback function returns true
 *
 * @param {!Function} cb
 * @param {number} interval
 * @returns {!Promise<void>}
 */
exports.wait = function wait(cb, interval = 15) {
	return new Promise((res) => {
		if (cb()) {
			res();
			return;
		}

		const intervalId = setInterval(() => {
			if (cb()) {
				res();
				clearInterval(intervalId);
			}
		}, interval);
	});
};

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	stream = require('stream');

Object.assign(
	exports,
	include('build/helpers')
);

const
	STDOUT = Symbol('Original STDOUT');

/**
 * Mutes any output from the global console API
 */
exports.muteConsole = function muteConsole() {
	console[STDOUT] = console[STDOUT] ?? console._stdout;
	console._stdout = new stream.Writable();
};

/**
 * Unmutes output from the global console API
 */
exports.unmuteConsole = function unmuteConsole() {
	console._stdout = console[STDOUT] ?? console._stdout;
	console[STDOUT] = undefined;
};

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

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable no-restricted-globals */

const _global =
	typeof globalThis === 'object' && isGlobal(globalThis) && globalThis ||
	typeof window === 'object' && isGlobal(window) && window ||
	typeof global === 'object' && isGlobal(global) && global ||
	typeof self === 'object' && isGlobal(self) && self ||

	(function getGlobalUnstrict() {
		return this;
	}()) ||

	this ||

	// eslint-disable-next-line no-new-func
	new Function('', 'return this')();

module.exports = _global;

/**
 * Checks if the provided value is a global object by confirming the presence of Math,
 * known to exist in any global JS environment
 *
 * @param obj
 * @returns {boolean}
 */
function isGlobal(obj) {
	return Boolean(obj) && obj.Math === Math;
}

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	isPathInside = require('is-path-inside');

/**
 * WebPack loader to shim "core/symbol" module for old browsers
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * ```js
 * import symbolGenerator from 'core/symbol';
 *
 * const $$ = symbolGenerator();
 *
 * console.log($$.foo);
 * console.log($$.bar);
 * ```
 */
module.exports = function symbolGeneratorLoader(str) {
	if (!$C(this.query.modules).some((src) => isPathInside(this.context, src))) {
		return str;
	}

	const
		calls = /\$\$\.([a-z_$][\w$]*)/gi,
		names = new Set();

	let res;

	// eslint-disable-next-line no-cond-assign
	while (res = calls.exec(str)) {
		names.add(res[1]);
	}

	if (names.size) {
		return str.replace(/(\$\$ = symbolGenerator\()(\))/, (sstr, $1, $2) => $1 + JSON.stringify([...names]) + $2);
	}

	return str;
};

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('config');

const
	{getVariableName} = include('build/stylus/ds/helpers');

module.exports = {
	/**
	 * Returns a string with invoking a CSS variable by the specified path
	 *
	 * @param {string} path
	 * @returns {string}
	 *
	 * @example
	 * ```js
	 * // var(--foo-bar)
	 * getCSSVariable('foo.bar')
	 * ```
	 */
	getCSSVariable(path) {
		return `'var(${getVariableName(path.split('.'))})'`;
	}
};

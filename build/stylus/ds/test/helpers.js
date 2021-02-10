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
	 * Returns string with css variable by the specified path
	 *
	 * @param path
	 * @returns {string}
	 */
	getCSSVariable(path) {
		return `'var(${getVariableName(path)})'`;
	}
};

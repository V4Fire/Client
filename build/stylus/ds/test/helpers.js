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
	{createVariableName} = include('build/stylus/ds/helpers');

module.exports = {
	getCSSVariable(path) {
		return `'var(${createVariableName(path)})'`;
	}
};

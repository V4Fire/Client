/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{isExternalDep} = include('build/const');

/**
 * Options for `webpack.watchOptions`
 */
module.exports = {
	aggregateTimeout: 200,
	poll: 1000,
	ignored: isExternalDep
};

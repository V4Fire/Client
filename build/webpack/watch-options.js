/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{webpack} = require('@config/config'),
	{depsRgxpStr} = include('build/const'),
	{createDepRegExp, prepareLibsForRegExp} = include('build/helpers');

const exclude = [
	depsRgxpStr,
	prepareLibsForRegExp(webpack.managedLibs())
]
	.filter(Boolean)
	.join('|');

/**
 * Options for `webpack.watchOptions`
 */
module.exports = {
	aggregateTimeout: 200,
	poll: 1000,
	ignored: createDepRegExp(exclude)
};

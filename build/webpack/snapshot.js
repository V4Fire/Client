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
	{getManagedPath, prepareLibsForRegExp} = include('build/helpers'),
	{depsRgxpStr} = include('build/const');

const exclude = [
	depsRgxpStr,
	prepareLibsForRegExp(webpack.managedLibs())
]
	.filter((str) => str !== '')
	.join('|');

/**
 * Options for `webpack.snapshot`
 */
module.exports = {
	...IS_PROD ?
		{} :
		{
			managedPaths: [getManagedPath(exclude)]
		}
};

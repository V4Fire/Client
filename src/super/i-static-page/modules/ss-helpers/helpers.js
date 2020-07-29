/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('config');

exports.needInline = needInline;

/**
 * Returns true if should inline a resource
 *
 * @param {boolean=} [forceInline]
 * @returns {boolean}
 */
function needInline(forceInline) {
	return Boolean(webpack.fatHTML() || forceInline);
}

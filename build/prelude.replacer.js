'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	escaper = require('escaper'),
	{replaceRgxp, methods} = include('build/prelude.webpack');

/**
 * Monic replacer for prelude module
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	const
		r = this.flags.runtime || {};

	if (r.noGlobals && replaceRgxp) {
		str = escaper.paste(
			escaper.replace(str).replace(replaceRgxp, (str) => {
				str = RegExp.escape(str);

				if (str[0] !== '\\') {
					str = `\\b${str}`;
				}

				str += '\\b';

				if (!methods.get(str)) {
					console.log(str);
				}

				return methods.get(str);
			})
		);
	}

	return str;
};

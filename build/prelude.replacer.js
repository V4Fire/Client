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
	{tokens, globalLink, replaceRgxp} = include('build/prelude.webpack');

/**
 * Monic replacer for prelude module
 *
 * @param {string} str
 * @returns {string}
 */
module.exports = function (str) {
	if (replaceRgxp) {
		let
			initGlobals = false;

		str = escaper.paste(
			escaper.replace(str).replace(replaceRgxp, (str) => {
				const
					token = tokens.get(str);

				if (token) {
					if (token.global) {
						initGlobals = true;
					}

					return token.link;
				}

				return str;
			})
		);

		if (initGlobals) {
			str = `const ${globalLink} = Function('return this')();\n\n${str}`;
		}
	}

	return str;
};

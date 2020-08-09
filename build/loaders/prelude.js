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

const
	labelRgxp = /\[__ESCAPER_QUOT__(\d+)_]/g;

/**
 * WebPack loader to replace global invokes of prelude methods
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * ```js
 * "foo".camelize() // "foo"[Symbol.for('[[V4_PROP_TRAP:camelize')]()
 * ```
 */
module.exports = function preludeLoader(str) {
	if (replaceRgxp) {
		const
			content = [];

		let
			initGlobals = false;

		str = escaper.paste(
			// eslint-disable-next-line no-template-curly-in-string
			escaper.replace(str, {label: '[__ESCAPER_QUOT__${pos}_]'}, content).replace(replaceRgxp, (str) => {
				const
					token = tokens.get(str);

				if (token) {
					if (token.global) {
						initGlobals = true;
					}

					return token.link;
				}

				return str;
			}),

			content,
			labelRgxp
		);

		if (initGlobals) {
			str = `const ${globalLink} = Function('return this')();\n\n${str}`;
		}
	}

	return str;
};

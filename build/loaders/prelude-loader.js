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
			escapedFragments = [];

		let
			initGlobals = false;

		str = escaper
			// eslint-disable-next-line no-template-curly-in-string
			.replace(str, {label: '[__ESCAPER_QUOT__${pos}_]'}, escapedFragments);

		str = str.replace(replaceRgxp, (str) => {
			const
				token = tokens.get(str);

			if (token) {
				if (token.global) {
					initGlobals = true;
				}

				return token.link;
			}

			return str;
		});

		str = escaper.paste(str, escapedFragments, labelRgxp);

		if (initGlobals) {
			str = `const ${globalLink} = Function('return this')();\n\n${str}`;
		}
	}

	return str;
};

Object.assign(module.exports, {
	labelRgxp
});

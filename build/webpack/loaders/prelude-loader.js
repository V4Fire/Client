'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	escaper = require('escaper');

const
	{tokens, globalLink, replaceRgxp} = include('build/prelude');

const
	labelRgxp = /\[__ESCAPER_QUOT__(\d+)_]/g;

/**
 * Webpack loader to replace global invokes of prelude methods
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
	if (replaceRgxp != null) {
		const
			escapedFragments = [];

		let
			initGlobals = false;

		str = escaper
			// eslint-disable-next-line no-template-curly-in-string
			.replace(str, {label: '[__ESCAPER_QUOT__${pos}_]'}, escapedFragments);

		const
			normalizeRgxp = /^\s*([^.\s]+)\s*\.\s*/;

		str = str.replace(replaceRgxp, (str) => {
			str = str.replace(normalizeRgxp, '$1.');

			let
				token = tokens.get(str);

			if (token) {
				if (token.global) {
					initGlobals = true;
				}

				return token.link;
			}

			token = tokens.get(str.slice(1));

			if (token) {
				if (token.global) {
					initGlobals = true;
				}

				return str[0] + token.link;
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

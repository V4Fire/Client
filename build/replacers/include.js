'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	includeRgxp = /\binclude\((['"`])(.*?)\1\);/g,
	escapeStringLiteralRgxp = /(`|${|\\)/g;

/**
 * Monic replacer that adds extra syntax to use the "#include" directive.
 * This replacer is useful to include some content by a path within SS files.
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * ```
 * < .bla
 *   /// This declaration will be replaced by a content of the specified file
 *   include(bla/foo.html)
 * ```
 */
module.exports = function includeReplacer(str) {
	if (this.flags.escapeStringLiteral) {
		str = str.replace(escapeStringLiteralRgxp, '\\$1');
	}

	return str.replace(includeRgxp, (str, _, url) => `\n//#include ${url}\n`);
};

Object.assign(module.exports, {
	includeRgxp
});

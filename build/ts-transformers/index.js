/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	modernRegExpFlagsTransformer = include('build/ts-transformers/modern-regexp-flags'),
	preludeTransformer = include('build/ts-transformers/prelude');

/**
 * @param {import('typescript').Program} program
 * @returns {object}
 */
module.exports = (program) => ({
	before: [
		preludeTransformer(program),
		modernRegExpFlagsTransformer(program)
	],
	after: {},
	afterDeclarations: {}
});

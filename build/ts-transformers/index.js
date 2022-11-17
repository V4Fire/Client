'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	modernRegExpFlagsTransformer = include('build/ts-transformers/modern-regexp-flags'),
	preludeTransformer = include('build/ts-transformers/prelude');

module.exports = (program) => ({
	before: [
		preludeTransformer(program),
		modernRegExpFlagsTransformer(program)
	],

	after: {},

	afterDeclarations: {}
});

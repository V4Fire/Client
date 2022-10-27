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
	classPropertyTransformer = include('build/ts-transformers/class-property'),
	symbolGeneratorTransformer = include('build/ts-transformers/symbol-generator');

module.exports = (program) => ({
	before: [
		modernRegExpFlagsTransformer(program),
		symbolGeneratorTransformer(program),
		classPropertyTransformer(program)
	],

	after: [],

	afterDeclarations: []
});

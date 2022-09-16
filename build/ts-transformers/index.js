'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const modernRegExpFlagsTransformer = include('build/ts-transformers/modern-regexp-flags');

module.exports = {
	before: {
		modernRegExpFlagsTransformer
	},

	after: {},

	afterDeclarations: {}
};

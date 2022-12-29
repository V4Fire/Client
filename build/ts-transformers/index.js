'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const modernRegExpFlagsTransformer = include('build/ts-transformers/modern-regexp-flags');
const i18nInheritanceChainTransformer = include('build/ts-transformers/i18n-inheritance-chain');

module.exports = {
	before: {
		modernRegExpFlagsTransformer,
		i18nInheritanceChainTransformer
	},

	after: {},

	afterDeclarations: {}
};

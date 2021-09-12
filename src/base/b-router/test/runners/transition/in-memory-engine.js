// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	{generateTransitionCommonSpecs} = include('src/base/b-router/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	describe('b-router advanced transitions with history API engine', () => {
		generateTransitionCommonSpecs(page, 'inMemoryRouterEngine');
	});
};

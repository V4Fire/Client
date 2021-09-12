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
	{generateWatchCommonSpecs} = include('src/base/b-router/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	describe('b-router watching with in-memory engine', () => {
		generateWatchCommonSpecs(page, 'inMemoryRouterEngine');
	});
};

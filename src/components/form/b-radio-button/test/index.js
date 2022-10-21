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
	h = include('tests/helpers').default,
	u = include('tests/utils').default,
	test = u.getCurrentTest();

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<boolean>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);
	return test(page);
};

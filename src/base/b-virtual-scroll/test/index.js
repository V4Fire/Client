/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

 // @ts-check

const
	h = include('tests/helpers'),
	u = include('tests/utils'),
	test = u.getCurrentTest();

/**
 * Starts a test
 *
 * @param {?} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params);
	test(page);
};

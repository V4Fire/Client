/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns a component context by the specified selector
 *
 * @param {?} page
 * @param {string} selector
 * @returns {!Promise<{componentSelector: string, component: ?}>}
 */
module.exports.getComponentCtx = async function (page, selector) {
	const component = await (await page.$(selector)).getProperty('component');
	return {componentSelector: selector, component};
};

/**
 * Scrolls the specified page to the bottom
 *
 * @param {?} page
 * @returns {!Promise<void>}
 */
module.exports.scrollToPageBottom = async function (page) {
	await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
};

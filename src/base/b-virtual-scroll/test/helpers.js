
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath'),
	pzlr = require('@pzlr/build-core');

const
	cwd = pzlr.resolve.cwd,
	helpers = require(path.join(cwd, 'tests/helpers.js'));

const
	h = Object.assign(module.exports, helpers);

/**
 * Scrolls the page down and waits for items to be rendered
 *
 * @param {?} page
 * @param {number} count
 * @param {string} componentSelector
 * @returns {!Promise<void>}
 */
module.exports.scrollAndWaitItemsCountGreaterThan = async function (page, count, componentSelector) {
	await h.scrollToPageBottom(page);
	await h.waitItemsCountGreaterThan(page, count, componentSelector);
};

/**
 * Waits items to be rendered
 *
 * @param {?} page
 * @param {number} count
 * @param {string} componentSelector
 * @param {string=} [op]
 * @returns {!Promise<void>}
 */
module.exports.waitItemsCountGreaterThan = async function (page, count, componentSelector, op = '>') {
	await page.waitForFunction(`document.querySelector('${componentSelector}__container').childElementCount ${op} ${count}`);
};

/**
 * Waits the ref to have the specified display value
 *
 * @param {?} page
 * @param {string} componentSelector
 * @param {string} refClassName
 * @param {string} display
 * @returns {!Promise<void>}
 */
module.exports.waitForRefDisplay = async function (page, componentSelector, refClassName, display) {
	await page.waitForFunction(`document.querySelector('${componentSelector}__${refClassName}').style.display === '${display}'`);
};

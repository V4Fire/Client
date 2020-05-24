
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

Object.assign(module.exports, helpers);

/**
 * Scrolls page down and waits for items to be rendered
 *
 * @param {*} page
 * @param {number} count
 * @param {string} componentSelector
 */
module.exports.scrollAndWaitItemsCountGreaterThan = async function (page, count, componentSelector) {
	await module.exports.scrollToPageBottom(page);
	await module.exports.waitItemsCountGreaterThan(page, count, componentSelector);
}

/**
 * Scrolls page down and waits for items to be rendered
 *
 * @param {*} page
 * @param {number} count
 * @param {string} componentSelector
 */
module.exports.waitItemsCountGreaterThan = async function (page, count, componentSelector, op = '>') {
	await page.waitForFunction(`document.querySelector('${componentSelector}__container').childElementCount ${op} ${count}`);
}

/**
 * Waits for ref to have the specified display value
 *
 * @param {*} page 
 * @param {string} componentSelector
 * @param {string} refClassName
 * @param {string} display
 */
module.exports.waitForRefDisplay = async function (page, componentSelector, refClassName, display) {
	await page.waitForFunction(`document.querySelector('${componentSelector}__${refClassName}').style.display === '${display}'`);
}

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
 * @param {string} componentSelectors
 * @returns {!Promise<void>}
 */
module.exports.scrollAndWaitItemsCountGreaterThan = async function (page, count, {componentSelector, componentName}) {
	await h.scrollToPageBottom(page);
	await h.waitItemsCountGreaterThan(page, count, {componentSelector, componentName});
};

/**
 * Waits items to be rendered
 *
 * @param {?} page
 * @param {number} count
 * @param {Dictionary} options
 * @returns {!Promise<void>}
 */
module.exports.waitItemsCountGreaterThan = async function (page, count, options) {
	const {componentSelector, componentName, op} = {
		op: '>',
		...options,
		componentSelector: options.componentSelector || options.componentName,
		componentName: options.componentName || options.componentSelector
	};

	await page.waitForFunction(`${querySelector(componentSelector, componentName, 'container')}.childElementCount ${op} ${count}`);
};

/**
 * Waits the ref to have the specified display value
 *
 * @param {?} page
 * @param {Dictionary} selectors
 * @param {string} refClassName
 * @param {string} display
 * @param {string} elName
 * @returns {!Promise<void>}
 */
module.exports.waitForRefDisplay = async function (page, {componentSelector, componentName}, refClassName, display) {
	await page.waitForFunction(`${querySelector(componentSelector, componentName, refClassName)}.style.display === '${display}'`);
};

/**
 * Generates a query selector string
 *
 * @param {string} componentSelector
 * @param {string} componentName
 * @param {string} elName
 */
function querySelector(componentSelector, componentName, elName) {
	if (!componentName) {
		componentName = componentSelector;
	}

	return `document.querySelector('${componentSelector} ${componentName}__${elName}')`;
}

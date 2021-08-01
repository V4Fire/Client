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
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with touch gestures
 */
class Gestures {
	/** @see [[BrowserTests.Gestures.create]] */
	create(page, options) {
		return page.evaluateHandle((options) => new globalThis._Gestures(options), options);
	}
}

module.exports = Gestures;

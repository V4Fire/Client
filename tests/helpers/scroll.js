/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	delay = require('delay');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with scroll on the page
 */
class Scroll {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} selector
	 * @param {Object=} [scrollIntoViewOptions]
	 */
	async scrollIntoViewIfNeeded(ctx, selector, scrollIntoViewOptions) {
		const el = await this.#parent.dom.waitForEl(ctx, selector);
		return el.scrollIntoViewIfNeeded(scrollIntoViewOptions);
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} refName
	 * @param {Object=} [scrollIntoViewOptions]
	 */
	async scrollRefIntoViewIfNeeded(ctx, refName, scrollIntoViewOptions) {
		const ref = await this.#parent.dom.waitForRef(ctx, refName);
		return ref.scrollIntoViewIfNeeded(scrollIntoViewOptions);
	}

	/**
	 * @param {Page} page
	 * @param {ScrollToOptions} options
	 */
	scrollBy(page, options) {
		return page.evaluate((options) => globalThis.scrollBy(options), options);
	}

	/**
	 * @param {Page} page
	 * @param {ScrollToOptions=} [options]
	 */
	scrollToBottom(page, options) {
		return this.scrollBy(page, {top: 1e7, left: 0, ...options});
	}

	/**
	 * @param {Page} page
	 * @param {Function=} [checkFn]
	 * @param {Object=} [options]
	 */
	async scrollToBottomWhile(page, checkFn, options) {
		options = {
			timeout: 1000,
			tick: 100,
			...options
		};

		checkFn = checkFn ?? (() => false);

		let
			isDone = await checkFn(),
			didTimeout = false;

		const
			timeout = setTimeout(() => didTimeout = true, options.timeout);

		if (isDone) {
			return;
		}

		while (!isDone) {
			if (didTimeout) {
				return;
			}

			await this.scrollToBottom(page);
			isDone = await checkFn();
			await delay(options.tick);
		}

		clearTimeout(timeout);
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Scroll;

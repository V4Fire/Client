// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	delay = require('delay');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with the page scroll
 */
class Scroll {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.Scroll.scrollIntoViewIfNeeded]]
	 */
	async scrollIntoViewIfNeeded(ctx, selector, scrollIntoViewOptions) {
		const el = await this.#parent.dom.waitForEl(ctx, selector);
		return el.scrollIntoViewIfNeeded(scrollIntoViewOptions);
	}

	/**
	 * @see [[BrowserTests.Scroll.scrollRefIntoViewIfNeeded]]
	 */
	async scrollRefIntoViewIfNeeded(ctx, refName, scrollIntoViewOptions) {
		const ref = await this.#parent.dom.waitForRef(ctx, refName);
		return ref.scrollIntoViewIfNeeded(scrollIntoViewOptions);
	}

	/**
	 * @see [[BrowserTests.Scroll.scrollBy]]
	 */
	scrollBy(page, options) {
		return page.evaluate((options) => globalThis.scrollBy(options), options);
	}

	/**
	 * @see [[BrowserTests.Scroll.scrollToBottom]]
	 */
	scrollToBottom(page, options) {
		return this.scrollBy(page, {top: 1e7, left: 0, ...options});
	}

	/**
	 * @see [[BrowserTests.Scroll.scrollToBottomWhile]]
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

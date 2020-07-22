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
 * Class provides API to work with `DOM`.
 */
class DOM {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @param {string} refName
	 * @returns {string}
	 */
	getRefSelector(refName) {
		return `[data-test-ref="${refName}"]`;
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} refName
	 *
	 * @returns {!Promise<Array<ElementHandle>>}
	 */
	getRefs(ctx, refName) {
		return ctx.$$(this.getRefSelector(refName));
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} refName
	 *
	 * @returns {!Promise<ElementHandle>}
	 */
	getRef(ctx, refName) {
		return ctx.$(this.getRefSelector(refName));
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} refName
	 * @param {string} attr
	 *
	 * @returns {!Promise<string>}
	 */
	async getRefAttr(ctx, refName, attr) {
		return (await this.getRef(ctx, refName)).getAttribute(attr);
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} refName
	 * @param {Object=} [clickOptions]
	 *
	 * @returns {!Promise<void>}
	 */
	clickToRef(ctx, refName, clickOptions) {
		return ctx.click(this.getRefSelector(refName), clickOptions);
	}

	/**
	 * @param {ElementHandle | Page} ctx
	 * @param {string} selector
	 * @param {Object} [options]
	 *
	 * @returns {!Promise<?ElementHandle>}
	 */
	async waitForEl(ctx, selector, options) {
		options = {
			sleep: 100,
			timeout: 2000,
			to: 'mount',
			...options
		};

		let isTimeout = false;
		setTimeout(() => isTimeout = true, options.timeout);

		if (options.to === 'mount') {
			let ref = await ctx.$(selector);

			if (ref) {
				return ref;
			}

			while (!ref) {
				if (isTimeout) {
					return;
				}

				ref = await ctx.$(selector);

				if (ref) {
					return ref;
				}

				await delay(options.sleep);
			}
		}

		if (options.to === 'unmount') {
			let ref = await ctx.$(selector);

			if (!ref) {
				return;
			}

			while (ref) {
				if (isTimeout) {
					return;
				}

				ref = await ctx.$(selector);

				if (!ref) {
					return;
				}

				await delay(options.sleep);
			}
		}
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} refName
	 * @param {Object=} [options]
	 *
	 * @returns {!Promise<?ElementHandle>}
	 */
	waitForRef(ctx, refName, options) {
		return this.waitForEl(ctx, this.getRefSelector(refName), options);
	}

	/**
	 * @param {ElementHandle | string} selectorOrElement
	 * @param {Page | ElementHandle} [ctx]
	 *
	 * @returns {!Promise<boolean>}
	 */
	async isVisible(selectorOrElement, ctx) {
		const element = typeof selectorOrElement === 'string' ?
			await ctx.$(selectorOrElement) :
			selectorOrElement;

		// eslint-disable-next-line no-inline-comments
		return element.evaluate((/** @type HTMLElement */ el) => {
			const
				style = globalThis.getComputedStyle(el),
				rect = el.getBoundingClientRect(),
				hasVisibleBoundingBox = Boolean(rect.top || rect.bottom || rect.width || rect.height);

			return style && style.visibility !== 'hidden' && hasVisibleBoundingBox;
		});
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = DOM;

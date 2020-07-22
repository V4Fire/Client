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
	 * @see [[BrowserTests.DOM.getRefSelector]]
	 */
	getRefSelector(refName) {
		return `[data-test-ref="${refName}"]`;
	}

	/**
	 * @see [[BrowserTests.DOM.getRefs]]
	 */
	getRefs(ctx, refName) {
		return ctx.$$(this.getRefSelector(refName));
	}

	/**
	 * @see [[BrowserTests.DOM.getRef]]
	 */
	getRef(ctx, refName) {
		return ctx.$(this.getRefSelector(refName));
	}

	/**
	 * @see [[BrowserTests.DOM.getRefAttr]]
	 */
	async getRefAttr(ctx, refName, attr) {
		return (await this.getRef(ctx, refName)).getAttribute(attr);
	}

	/**
	 * @see [[BrowserTests.DOM.clickToRef]]
	 */
	clickToRef(ctx, refName, clickOptions) {
		return ctx.click(this.getRefSelector(refName), clickOptions);
	}

	/**
	 * @see [[BrowserTests.DOM.waitForEl]]
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
	 * @see [[BrowserTests.DOM.waitForRef]]
	 */
	waitForRef(ctx, refName, options) {
		return this.waitForEl(ctx, this.getRefSelector(refName), options);
	}

	/**
	 * @see [[BrowserTests.DOM.isVisible]]
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

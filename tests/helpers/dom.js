/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

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
	waitForEl(ctx, selector, options) {
		options = {
			sleep: 100,
			timeout: 5000,
			to: 'mount',
			...options
		};

		if (options.to === 'mount') {
			return ctx.waitForSelector(selector, {state: 'attached', timeout: options.timeout});
		}

		if (options.to === 'unmount') {
			return ctx.waitForSelector(selector, {state: 'detached', timeout: options.timeout});
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
	 * @see [[BrowserTests.DOM.elNameGenerator]]
	 */
	elNameGenerator(blockName, elName) {
		if (elName != null) {
			return `${blockName}__${elName}`;
		}

		return (elName) => `${blockName}__${elName}`;
	}

	/**
	 * @see [[BrowserTests.DOM.elNameSelectorGenerator]]
	 */
	elNameSelectorGenerator(blockName, elName) {
		if (elName) {
			return `.${blockName}__${elName}`
		}

		return (elName) => `.${blockName}__${elName}`;
	}

	/**
	 * @see [[BrowserTests.DOM.elModNameGenerator]]
	 */
	elModNameGenerator(fullElName, modName, modVal) {
		if (modName != null) {
			return `${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * @see [[BrowserTests.DOM.elModSelectorGenerator]]
	 */
	elModSelectorGenerator(fullElName, modName, modVal) {
		if (modName != null) {
			return `.${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `.${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = DOM;

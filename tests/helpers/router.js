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
 * Class provides API to work with `b-router`.
 */
class Router {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.Router.call]]
	 */
	async call(page, method, ...args) {
		const
			c = await this.#parent.component.waitForComponent(page, '#root-component');

		await c.evaluate((ctx, args) => ctx.router[args[0]](...args.slice(1, args.length)), [method, ...args]);

		await page.waitForLoadState('networkidle');
		await this.#parent.bom.waitForIdleCallback(page);
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Router;

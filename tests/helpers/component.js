// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with components on the page
 */
class Component {

	/**
	 * Parent class
	 */
	#parent;

	/**
	 * @param {?} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @param {Page} page
	 * @param {string} componentSelector
	 * @param {Object} props
	 * @param {Object=} [options]
	 *
	 * @returns {!Promise<Object>}
	 */
	async setPropsToComponent(page, componentSelector, props, options) {
		const ctx = await this.getComponentByQuery(page, componentSelector);

		await ctx.evaluate(async (ctx, props) => {
			for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
				const
					prop = keys[i],
					val = props[prop];

				ctx.field.set(prop, val);
			}

			await ctx.nextTick();
		}, props);

		await this.#parent.dom.waitForIdleCallback(page, options);
		return this.getComponentByQuery(page, componentSelector);
	}

	/**
	 * @param {Page} page
	 * @param {string} componentSelector
	 * @param {Object} props
	 *
	 * @returns {!Promise<Object>}
	 */
	async reloadAndSetProps(page, componentSelector, props) {
		await this.#parent.utils.reloadAndWaitForIdle(page);
		return this.setPropsToComponent(page, componentSelector, props);
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @param {string} selector
	 * @param {Object=} [options]
	 *
	 * @returns {!Promise<?ElementHandle>}
	 */
	async waitForComponent(ctx, selector, options = {}) {
		const componentEl = await this.#parent.dom.waitForEl(ctx, selector, options);

		if (!componentEl) {
			return undefined;
		}

		return this.getComponentByQuery(ctx, selector);
	}

	/**
	 * @param {Page | ElementHandle} ctx
	 * @returns {!Promise<?ElementHandle>}
	 */
	getRoot(ctx) {
		return this.waitForComponent(ctx, '#root-component');
	}

	/**
	 * @param {string} id
	 * @returns {!Promise<Object>} component
	 */
	async getComponentById(page, id) {
		return (await page.$(`#${id}`)).getProperty('component');
	}

	/**
	 * @param {ElementHandle|Page} ctx
	 * @param {string} selector
	 * @returns {!Promise<Object>} component
	 */
	async getComponentByQuery(ctx, selector) {
		return (await ctx.$(selector)).getProperty('component');
	}

	/**
	 * @param {Page} ctx
	 * @param {string} selector
	 *
	 * @returns {!Promise<Array<Object>>} components
	 */
	async getComponents(ctx, selector) {
		const
			els = await ctx.$$(selector),
			components = [];

		for (let i = 0; i < els.length; i++) {
			components[i] = await els[i].getProperty('component');
		}

		return components;
	}
}

module.exports = Component;

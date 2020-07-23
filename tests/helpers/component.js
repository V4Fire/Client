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
 * Class provides API to work with components on a page
 */
class Component {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.Component.setPropsToComponent]]
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

		await this.#parent.bom.waitForIdleCallback(page, options);
		return this.getComponentByQuery(page, componentSelector);
	}

	/**
	 * @see [[BrowserTests.Component.reloadAndSetProps]]
	 */
	async reloadAndSetProps(page, componentSelector, props) {
		await this.#parent.utils.reloadAndWaitForIdle(page);
		return this.setPropsToComponent(page, componentSelector, props);
	}

	/**
	 * @see [[BrowserTests.Component.waitForComponent]]
	 */
	async waitForComponent(ctx, selector, options = {}) {
		const componentEl = await this.#parent.dom.waitForEl(ctx, selector, options);

		if (!componentEl) {
			return undefined;
		}

		return this.getComponentByQuery(ctx, selector);
	}

	/**
	 * @see [[BrowserTests.Component.getRoot]]
	 */
	getRoot(ctx) {
		return this.waitForComponent(ctx, '#root-component');
	}

	/**
	 * @see [[BrowserTests.Component.getComponentById]]
	 */
	async getComponentById(page, id) {
		return (await page.$(`#${id}`)).getProperty('component');
	}

	/**
	 * @see [[BrowserTests.Component.getComponentByQuery]]
	 */
	async getComponentByQuery(ctx, selector) {
		return (await ctx.$(selector)).getProperty('component');
	}

	/**
	 * @see [[BrowserTests.Component.getComponents]]
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

	/**
	 * @see [[BrowserTests.Component.waitForComponentStatus]]
	 */
	async waitForComponentStatus(ctx, selector, status) {
		const component = await this.getComponentByQuery(ctx, selector);

		if (!component) {
			return undefined;
		}

		await component.evaluate((ctx, status) => new Promise((res) => {
			if (ctx.componentStatus === status) {
				res();
			}

			ctx.on(`status${status.camelize(true)}`, res);
		}), status);

		return component;
	}

	/**
	 * @see [[BrowserTests.Component.waitForComponentPropVal]]
	 */
	async waitForComponentPropVal(ctx, selector, prop, val) {
		const check = async () => {
			const
				c = await this.waitForComponent(ctx, selector),
				// eslint-disable-next-line no-inline-comments
				isSettled = await c.evaluate((/** @type any */ ctx, [prop, val]) => ctx.field.get(prop) === val, [prop, val]);

			return isSettled;
		};

		let
			res = await check();

		while (!res) {
			res = await check();
			await delay(100);
		}

		return this.getComponentByQuery(ctx, selector);
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Component;

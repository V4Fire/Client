/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import type iBlock from 'super/i-block/i-block';
import type Helpers from '@tests/helpers';

/**
 * Class provides API to work with components on a page
 */
export default class Component {

	/** @see [[Helpers]] */
	protected parent: typeof Helpers;

	/**
	 * @param parent
	 */
	constructor(parent: typeof Helpers) {
		this.parent = parent;
	}

	/**
	 * Waits for the specified component to appear in the DOM and returns it
	 *
	 * @param ctx
	 * @param selector
	 * @param [options]
	 */
	async waitForComponent<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string
	): Promise<JSHandle<T>> {
		await ctx.waitForSelector(selector, {state: 'attached'});

		const
			component = await this.getComponentByQuery<T>(ctx, selector);

		if (!component) {
			throw new Error('There is no component on provided selector');
		}

		return component;
	}

	/**
	 * Returns the root component
	 *
	 * @param ctx
	 * @param [selector]
	 */
	getRoot<T extends iBlock>(ctx: Page | ElementHandle, selector: string = '#root-component'): Promise<CanUndef<JSHandle<T>>> {
		return this.waitForComponent(ctx, selector);
	}

	/**
	 * Returns a component by id
	 *
	 * @param page
	 * @param id
	 */
	async getComponentById<T extends iBlock>(
		page: Page | ElementHandle,
		id: string
	): Promise<CanUndef<JSHandle<T>>> {
		return (await page.$(`#${id}`))?.getProperty('component');
	}

	/**
	 * Returns a component by the specified query
	 *
	 * @param ctx
	 * @param selector
	 */
	async getComponentByQuery<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string
	): Promise<CanUndef<JSHandle<T>>> {
		return (await ctx.$(selector))?.getProperty('component');
	}

	/**
	 * Returns a component by the specified selector
	 *
	 * @param ctx
	 * @param selector
	 */
	async getComponents(ctx: Page | ElementHandle, selector: string): Promise<JSHandle[]> {
		const
			els = await ctx.$$(selector),
			components = <JSHandle[]>[];

		for (let i = 0; i < els.length; i++) {
			components[i] = await els[i].getProperty('component');
		}

		return components;
	}

	/**
	 * Waits until the component has the specified status and returns the component
	 *
	 * @param ctx
	 * @param selector
	 * @param status
	 */
	async waitForComponentStatus<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string,
		status: string
	): Promise<CanUndef<JSHandle<T>>> {
		const
			component = await this.waitForComponent<T>(ctx, selector);

		await component.evaluate((ctx, status) => new Promise<void>((res) => {
			if (ctx.componentStatus === status) {
				res();
			}

			ctx.on(`status${status.camelize(true)}`, res);
		}), status);

		return component;
	}

	/**
	 * Creates a component by using `$createElement` and `vdom.render` methods
	 *
	 * @param componentCtx
	 * @param componentName
	 * @param [props]
	 */
	renderComponent<T extends iBlock>(
		componentCtx: ElementHandle<iBlock>,
		componentName: string,
		props?: Dictionary
	): Promise<ElementHandle<T>> {
		return <Promise<ElementHandle<any>>>componentCtx.evaluateHandle((ctx, [componentName, props]) =>
			ctx.vdom.render(ctx.unsafe.$createElement(componentName, {attrs: {'v-attrs': props}})), [componentName, props]);
	}
}

module.exports = Component;

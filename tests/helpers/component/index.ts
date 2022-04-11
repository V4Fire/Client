/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import { zipJson } from 'core/prelude/test-env/components/json-parser';

import type iBlock from 'super/i-block/i-block';

import BOM, { WaitForIdleOptions } from 'tests/helpers/bom';

/**
 * Class provides API to work with components on a page
 */
export default class Component {
	/**
	 * Renders components and mounts it into DOM tree
	 *
	 * @param componentName
	 * @param scheme
	 * @param opts
	 */
	 static async createComponents(
		page: Page,
		componentName: string,
		scheme: RenderParams[],
		opts?: RenderOptions
	): Promise<void> {
		const schemeAsString = zipJson(scheme);

		await page.evaluate(([{componentName, schemeAsString, opts}]) => {
			globalThis.renderComponents(componentName, schemeAsString, opts);

		}, [{componentName, schemeAsString, opts}]);
	}

	/**
	 * Creates a component by using `$createElement` and `vdom.render` methods
	 *
	 * @param page
	 * @param componentName
	 * @param [scheme]
	 * @param [opts]
	 */
	 static async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		scheme?: Partial<RenderParams>,
		opts?: RenderOptions
	): Promise<JSHandle<T>>;

	/**
	 * Creates a components by using `$createElement` and `vdom.render` methods
	 *
	 * @param page
	 * @param componentName
	 * @param [scheme]
	 * @param [opts]
	 */
	 static async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		scheme: RenderParams[],
		opts?: RenderOptions
	): Promise<undefined>;

	/**
	 * @param page
	 * @param componentName
	 * @param [scheme]
	 * @param [opts]
	 */
	static async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		scheme: Partial<RenderParams> | RenderParams[] = {},
		opts?: RenderOptions
	): Promise<CanUndef<JSHandle<T>>> {
		if (Array.isArray(scheme)) {
			await this.createComponents(page, componentName, scheme, opts);
			return;
		}

		const
			renderId = String(Math.random());

		const schemeAsString = zipJson([
			{
				...scheme,

				attrs: {
					...scheme.attrs,
					'data-render-id': renderId
				}
			}
		]);

		const normalizedOptions = {
			...opts,
			rootSelector: '#root-component'
		};

		await page.evaluate(([{componentName, schemeAsString, normalizedOptions}]) => {
			globalThis.renderComponents(componentName, schemeAsString, normalizedOptions);

		}, [{componentName, schemeAsString, normalizedOptions}]);

		return <Promise<JSHandle<T>>>this.getComponentByQuery(page, `[data-render-id="${renderId}"]`);
	}

	/**
	 * Removes all created components
	 * @param page
	 */
	static removeCreatedComponents(page: Page): Promise<void> {
		return page.evaluate(() => globalThis.removeCreatedComponents());
	}

	/**
	 * Returns a component by the specified query
	 *
	 * @param ctx
	 * @param selector
	 */
	static async getComponentByQuery<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string
	): Promise<CanUndef<JSHandle<T>>> {
		return (await ctx.$(selector))?.getProperty('component');
	}

	/**
	 * Returns a component by the specified query
	 *
	 * @param ctx
	 * @param selector
	 */
	 static async waitForComponentByQuery<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string
	): Promise<JSHandle<T>> {
		return (await ctx.waitForSelector(selector, {state: 'attached'})).getProperty('component');
	}

	/**
	 * Returns a component by the specified selector
	 *
	 * @param ctx
	 * @param selector
	 */
	static async getComponents(ctx: Page | ElementHandle, selector: string): Promise<JSHandle[]> {
		const
			els = await ctx.$$(selector),
			components = <JSHandle[]>[];

		for (let i = 0; i < els.length; i++) {
			components[i] = await els[i].getProperty('component');
		}

		return components;
	}

	/**
	 * Sets props to a component by the specified selector and waits for nextTick after that
	 *
	 * @param page
	 * @param componentSelector
	 * @param props
	 * @param [idleOptions]
	 */
	static async setPropsToComponent<T extends iBlock>(
		page: Page,
		componentSelector: string,
		props: Dictionary,
		options?: WaitForIdleOptions
	): Promise<JSHandle<T>> {
		const ctx = await this.waitForComponentByQuery(page, componentSelector);

		await ctx.evaluate(async (ctx, props) => {
			for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
				const
					prop = keys[i],
					val = props[prop];

				ctx.field.set(prop, val);
			}

			await ctx.nextTick();
		}, props);

		await BOM.waitForIdleCallback(page, options);

		return this.waitForComponentByQuery(page, componentSelector);
	}

	/**
	 * Returns the root component
	 *
	 * @param ctx
	 * @param [selector]
	 * @typeParam T - type of the root
	 */
	static waitForRoot<T>(ctx: Page | ElementHandle, selector: string = '#root-component'): Promise<JSHandle<T>> {
		const res = this.waitForComponentByQuery(ctx, selector);

		return <any>res;
	}

	/**
	 * Заменяет все функции на строковое представление с префиксом
	 *
	 * @param val
	 */
	protected static replaceFnsReviver(val: object): unknown {
		return JSON.parse(JSON.stringify(val, (key, val) => {
			if (Object.isFunction(val)) {
				return `FN__${val.toString()}`;
			}

			return val;
		}));
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
	 * @see [[Component.createComponent]]
	 * @param page
	 * @param componentName
	 * @param scheme
	 * @param opts
	 */
	async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		scheme: Partial<RenderParams> = {},
		opts?: RenderOptions
	): Promise<JSHandle<T>> {
		return Component.createComponent(page, componentName, scheme, opts);
	}

	/**
	 * @param ctx
	 * @param [selector]
	 * @deprecated
	 * @see [[Component.waitForRoot]]
	 */
	getRoot<T extends iBlock>(ctx: Page | ElementHandle, selector: string = '#root-component'): Promise<CanUndef<JSHandle<T>>> {
		return Component.waitForRoot(ctx, selector);
	}

	/**
	 * @deprecated
	 * @see [[Component.getComponentByQuery]]
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
		return Component.getComponentByQuery(ctx, selector);
	}

	/**
	 * @param ctx
	 * @param selector
	 * @deprecated
	 * @see [[Component.getComponents]]
	 */
	getComponents(ctx: Page | ElementHandle, selector: string): Promise<JSHandle[]> {
		return Component.getComponents(ctx, selector);
	}

	/**
	 * @param page
	 * @param componentSelector
	 * @param props
	 * @param options
	 * @deprecated
	 * @see [[Component.setPropsToComponent]]
	 */
	async setPropsToComponent<T extends iBlock>(
		page: Page,
		componentSelector: string,
		props: Dictionary,
		options?: WaitForIdleOptions
	): Promise<CanUndef<JSHandle<T>>> {
		return Component.setPropsToComponent(page, componentSelector, props, options);
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
}

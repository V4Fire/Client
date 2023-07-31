/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import { expandedStringify } from 'core/prelude/test-env/components/json';

import type iBlock from 'components/super/i-block/i-block';
import type { ComponentStatus } from 'components/super/i-block/i-block';

import { isRenderComponentsVnodeParams } from 'tests/helpers/component/helpers';

/**
 * The Component class provides an API to work with components on a page.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Component {
	/**
	 * Creates components with the given name and props and mounts them into the DOM tree.
	 *
	 * @param page
	 * @param componentName - The name of the component to be created.
	 * @param scheme - An array of objects representing the component's structure.
	 * @returns - A promise that resolves when the components are created and mounted.
	 *
	 * @example
	 * ```typescript
	 * const scheme = [
	 *   { attrs: { class: 'header' }, children: ['Header Content'] },
	 *   { attrs: { class: 'body' }, children: ['Body Content'] }
	 * ];
	 * await Component.createComponents(page, 'b-component', scheme);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * const scheme = [
	 *   { attrs: { fnProp: () => 1 }, children: ['Header Content'] },
	 *   { attrs: { fnProp: () => 1 }, children: ['Body Content'] }
	 * ];
	 * await Component.createComponents(page, 'b-component', scheme);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * const scheme = [
	 *   { attrs: { regExpProp: /test/ }, children: ['Header Content'] },
	 *   { attrs: { regExpProp: /test/ }, children: ['Body Content'] }
	 * ];
	 * await Component.createComponents(page, 'b-component', scheme);
	 * ```
	 */
	static async createComponents(
		page: Page,
		componentName: string,
		scheme: RenderComponentsVnodeParams[]
	): Promise<void> {
		const schemeAsString = expandedStringify(scheme);

		await page.evaluate(([{componentName, schemeAsString}]) => {
			globalThis.renderComponents(componentName, schemeAsString);

		}, [{componentName, schemeAsString}]);
	}

	/**
	 * Creates a single component with the specified name and parameters/attributes.
	 *
	 * @param page
	 * @param componentName - The name of the component to be created.
	 * @param [schemeOrAttrs] - Either an object representing the component's structure or just the attributes object.
	 * @returns - A promise that resolves to the handle of the created component.
	 *
	 * @example
	 * ```typescript
	 * await Component.createComponent(page, 'b-component', { attrs: { class: 'header' }, children: ['Header Content'] });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await Component.createComponent(page, 'b-component', { attrs: { fnProp: () => 1 } });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await Component.createComponent(page, 'b-component', { attrs: { regExpProp: /test/ } });
	 * ```
	 */
	static async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		schemeOrAttrs?: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs']
	): Promise<JSHandle<T>>;

	/**
	 * Creates a component by the specified name and parameters
	 *
	 * @param page
	 * @param componentName
	 * @param [scheme]
	 *
	 * @example
	 * ```typescript
	 * const scheme = [
	 *   { attrs: { class: 'header' }, children: ['Header Content'] },
	 *   { attrs: { class: 'body' }, children: ['Body Content'] }
	 * ];
	 * await Component.createComponent(page, 'b-component', scheme);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * const scheme = [
	 *   { attrs: { fnProp: () => 1 }, children: ['Header Content'] },
	 *   { attrs: { fnProp: () => 1 }, children: ['Body Content'] }
	 * ];
	 * await Component.createComponent(page, 'b-component', scheme);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * const scheme = [
	 *   { attrs: { regExpProp: /test/ }, children: ['Header Content'] },
	 *   { attrs: { regExpProp: /test/ }, children: ['Body Content'] }
	 * ];
	 * await Component.createComponent(page, 'b-component', scheme);
	 * ```
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		scheme: RenderComponentsVnodeParams[]
	): Promise<undefined>;

	static async createComponent<T extends iBlock>(
		page: Page,
		componentName: string,
		schemeOrAttrs: CanArray<RenderComponentsVnodeParams> | RenderComponentsVnodeParams['attrs'] = {}
	): Promise<CanUndef<JSHandle<T>>> {
		if (Array.isArray(schemeOrAttrs)) {
			await this.createComponents(page, componentName, schemeOrAttrs);
			return;
		}

		let
			attrs: RenderComponentsVnodeParams['attrs'],
			children: RenderComponentsVnodeParams['children'];

		if (isRenderComponentsVnodeParams(schemeOrAttrs)) {
			attrs = schemeOrAttrs.attrs;
			children = schemeOrAttrs.children;

		} else {
			attrs = schemeOrAttrs;
		}

		const
			renderId = String(Math.random());

		const schemeAsString = expandedStringify([
			{
				attrs: {
					...attrs,
					'data-render-id': renderId
				},
				children
			}
		]);

		await page.evaluate(([{componentName, schemeAsString}]) => {
			globalThis.renderComponents(componentName, schemeAsString);

		}, [{componentName, schemeAsString}]);

		return this.waitForComponentByQuery(page, `[data-render-id="${renderId}"]`);
	}

	/**
	 * Removes all dynamically created components from the page.
	 *
	 * @param page
	 * @returns - A promise that resolves when all components are removed.
	 *
	 * @example
	 * ```typescript
	 * await Component.removeCreatedComponents(page);
	 * ```
	 */
	static removeCreatedComponents(page: Page): Promise<void> {
		return page.evaluate(() => globalThis.removeCreatedComponents());
	}

	/**
	 * Returns a component handle based on the specified query selector.
	 *
	 * @param ctx
	 * @param selector - The query selector to find the component.
	 * @returns - A promise that resolves to the handle of the found component or undefined if not found.
	 *
	 * @example
	 * ```typescript
	 * const componentHandle = await Component.getComponentByQuery(page, '.b-component');
	 * ```
	 */
	static async getComponentByQuery<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string
	): Promise<CanUndef<JSHandle<T>>> {
		return (await ctx.$(selector))?.getProperty('component');
	}

	/**
	 * Waits until a component is attached to the DOM and returns its handle based on the specified query selector.
	 *
	 * @param ctx
	 * @param selector - The query selector to find the component.
	 * @returns - A promise that resolves to the handle of the found component.
	 *
	 * @example
	 * ```typescript
	 * const componentHandle = await Component.waitForComponentByQuery(page, '.b-component');
	 * ```
	 */
	static async waitForComponentByQuery<T extends iBlock>(
		ctx: Page | ElementHandle,
		selector: string
	): Promise<JSHandle<T>> {
		return (await ctx.waitForSelector(selector, {state: 'attached'})).getProperty('component');
	}

	/**
	 * Returns an array of component handles based on the specified query selector.
	 *
	 * @param ctx
	 * @param selector - The query selector to find the components.
	 * @returns - A promise that resolves to an array of component handles.
	 *
	 * @example
	 * ```typescript
	 * const componentHandles = await Component.getComponents(page, '.b-component');
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
	 * Returns the root component handle.
	 *
	 * @typeParam T - The type of the root component.
	 * @param ctx
	 * @param [selector] - The query selector to find the root component.
	 * @returns - A promise that resolves to the handle of the root component.
	 *
	 * @example
	 * ```typescript
	 * // Example usage:
	 * const rootComponentHandle = await Component.waitForRoot(page);
	 * // or with a custom selector
	 * const customRootComponentHandle = await Component.waitForRoot(page, '.p-root-component');
	 * ```
	 */
	static waitForRoot<T>(ctx: Page | ElementHandle, selector: string = '#root-component'): Promise<JSHandle<T>> {
		const res = this.waitForComponentByQuery(ctx, selector);
		return <any>res;
	}

	/**
	 * Waits until the component has the specified status and returns the component handle.
	 *
	 * @param ctx
	 * @param componentSelector - The query selector to find the component.
	 * @param status - The status to wait for.
	 * @returns - A promise that resolves to the handle of the component.
	 *
	 * @example
	 * ```typescript
	 * const componentHandle = await Component.waitForComponentStatus(page, '.b-component', 'ready');
	 * ```
	 */
	static async waitForComponentStatus<T extends iBlock>(
		ctx: Page | ElementHandle,
		componentSelector: string,
		status: ComponentStatus
	): Promise<JSHandle<T>> {
		const
			component = await this.waitForComponentByQuery<T>(ctx, componentSelector);

		await component.evaluate((ctx, status) => new Promise<void>((res) => {
			if (ctx.componentStatus === status) {
				res();
			}

			ctx.on(`status${status.camelize(true)}`, res);
		}), status);

		return component;
	}

	/**
	 * Waits until the component template is loaded.
	 *
	 * @param ctx
	 * @param componentName - The name of the component.
	 * @returns - A promise that resolves when the component template is loaded.
	 *
	 * @example
	 * ```typescript
	 * await Component.waitForComponentTemplate(page, 'b-component');
	 * ```
	 */
	static async waitForComponentTemplate(
		ctx: Page,
		componentName: string
	): Promise<void> {
		// @ts-ignore TPLS is a global storage for component templates
		await ctx.waitForFunction((componentName) => globalThis.TPLS[componentName] != null, componentName);
	}
}

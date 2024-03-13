/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import type { VNodeDescriptor } from 'components/friends/vdom';
import { expandedStringify } from 'core/prelude/test-env/components/json';

import type iBlock from 'components/super/i-block/i-block';

import type { ComponentInDummy } from 'tests/helpers/component/interface';
import type bDummy from 'components/dummies/b-dummy/b-dummy';
import { isRenderComponentsVNodeParams } from 'tests/helpers/component/helpers';

/**
 * Class provides API to work with components on a page
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Component {
	/**
	 * Creates components by the passed name and scheme and mounts them into the DOM tree
	 *
	 * @param page
	 * @param componentName
	 * @param scheme
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
	 * Creates a component by the specified name and parameters/attributes
	 *
	 * @param page
	 * @param componentName
	 * @param [schemeOrAttrs]
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

		if (isRenderComponentsVNodeParams(schemeOrAttrs)) {
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
	 * Creates a component inside the `b-dummy` component and uses the `field-like` property of `b-dummy`
	 * to pass props to the inner component.
	 *
	 * This function can be useful when you need to test changes to component props.
	 * Since component props are readonly properties, you cannot change them directly;
	 * changes are only available through the parent component. This is why the `b-dummy` wrapper is created,
	 * and the props for the component you want to render are passed as references to the property of `b-dummy`.
	 *
	 * The function returns a `handle` to the created component (not to `b-dummy`)
	 * and adds a method and property for convenience:
	 *
	 * - `update` - a method that allows you to modify the component's props.
	 *
	 * - `dummy` - the `handle` of the `b-dummy` component.
	 *
	 * @param page
	 * @param componentName
	 * @param params
	 */
	static async createComponentInDummy<T extends iBlock>(
		page: Page,
		componentName: string,
		params: RenderComponentsVnodeParams
	): Promise<ComponentInDummy<T>> {
		const dummy = await this.createComponent<bDummy>(page, 'b-dummy');

		const update = async (props, mixInitialProps = false) => {
			await dummy.evaluate((ctx, [name, props, mixInitialProps]) => {
				const parsed: RenderComponentsVnodeParams = globalThis.expandedParse(props);

				ctx.testComponentAttrs = mixInitialProps ?
					Object.assign(ctx.testComponentAttrs, parsed.attrs) :
					parsed.attrs ?? {};

				const shouldSetSlots = !Object.isEmpty(parsed.children) ||
					(!Object.isEmpty(ctx.testComponentSlots) && Object.isEmpty(parsed.children));

				if (shouldSetSlots) {
					ctx.testComponentSlots = compileChild();
				}

				ctx.testComponent = name;

				function compileChild() {
					return ctx.vdom.create(Object.entries(parsed.children ?? {}).map(([slotName, child]) => ({
						type: 'template',
						attrs: {
							slot: slotName
						},
						children: (<VNodeDescriptor[]>[]).concat(<VNodeDescriptor>(child ?? []))
					})));
				}

			}, <const>[componentName, expandedStringify(props), mixInitialProps]);
		};

		await update(params);
		const component = await dummy.evaluateHandle((ctx) => ctx.unsafe.$refs.testComponent);

		Object.assign(component, {
			update,
			dummy
		});

		return <ComponentInDummy<T>>component;
	}

	/**
	 * Removes all dynamically created components
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
	 * Returns a promise that will be resolved with a component by the specified query
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
	 * Returns the root component
	 *
	 * @typeParam T - type of the root
	 * @param ctx
	 * @param [selector]
	 */
	static waitForRoot<T>(ctx: Page | ElementHandle, selector: string = '#root-component'): Promise<JSHandle<T>> {
		const res = this.waitForComponentByQuery(ctx, selector);
		return <any>res;
	}

	/**
	 * Waits until the component has the specified status and returns the component
	 *
	 * @param ctx
	 * @param componentSelector
	 * @param status
	 */
	static async waitForComponentStatus<T extends iBlock>(
		ctx: Page | ElementHandle,
		componentSelector: string,
		status: string
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
	 * Waits until the component template is loaded
	 *
	 * @param ctx
	 * @param componentName
	 */
	static async waitForComponentTemplate(
		ctx: Page,
		componentName: string
	): Promise<void> {
		// @ts-ignore TPLS is a global storage for component templates
		await ctx.waitForFunction((componentName) => globalThis.TPLS[componentName] != null, componentName);
	}
}

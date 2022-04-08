/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, ElementHandle } from 'playwright';

import type { WaitForElOptions } from 'tests/helpers/dom/interface';

/**
 * Class provides API to work with `DOM`.
 */
export default class DOM {

	/**
	 * Returns an element that matches the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 */
	static async getRef<T extends HTMLElement>(
		ctx: Page | ElementHandle,
		refName: string
	): Promise<Nullable<ElementHandle<T>>> {
		const
			res = await ctx.$(this.getRefSelector(refName));

		return <ElementHandle<T>>res;
	}

	/**
	 * Returns an element that matches the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 */
	static async waitRef<T extends HTMLElement>(
		ctx: Page | ElementHandle,
		refName: string
	): Promise<ElementHandle<T>> {
		const
			res = await ctx.waitForSelector(this.getRefSelector(refName), {state: 'attached'});

		return <ElementHandle<T>>res;
	}

	/**
	 * Returns elements that match the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 */
	static getRefs(ctx: Page | ElementHandle, refName: string): Promise<ElementHandle[]> {
		return ctx.$$(this.getRefSelector(refName));
	}

	/**
	 * Returns a selector for test refs
	 * @param refName
	 */
	static getRefSelector(refName: string): string {
		return `[data-test-ref="${refName}"]`;
	}

	/**
	 * Click on the element that matches the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 * @param [clickOptions]
	 *
	 * @see https://playwright.dev/#version=v1.2.0&path=docs%2Fapi.md&q=pageclickselector-options
	 */
	static clickToRef(ctx: Page | ElementHandle, refName: string, clickOptions?: Dictionary): Promise<void> {
		return ctx.click(this.getRefSelector(refName), {
			force: true,
			...clickOptions
		});
	}

	/**
	 * Returns a generator of an element names
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index'), // Function
	 *   elName = base('page'); // 'p-index__page'
	 * ```
	 */
	static elNameGenerator(blockName: string): (elName: string) => string;

	/**
	 * Returns an element name
	 *
	 * @example
	 * ```typescript
	 * const
	 *   elName = elNameGenerator('p-index', 'page'); // 'p-index__page'
	 * ```
	 */
	static elNameGenerator(blockName: string, elName: string): string;

	static elNameGenerator(blockName: string, elName?: string): any {
		if (elName != null) {
			return `${blockName}__${elName}`;
		}

		return (elName) => `${blockName}__${elName}`;
	}

	/**
	 * Returns a generator of an element class names
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameSelectorGenerator('p-index'), // Function
	 *   elName = base('page'); // '.p-index__page'
	 * ```
	 */
	static elNameSelectorGenerator(blockName: string): (elName: string) => string;

	/**
	 * Returns an element class name
	 *
	 * @example
	 * ```typescript
	 * const
	 *   elName = elNameGenerator('p-index', 'page'); // '.p-index__page'
	 * ```
	 */
	static elNameSelectorGenerator(blockName: string, elName: string): string;

	static elNameSelectorGenerator(blockName: string, elName?: string): any {
		if (elName != null) {
			return `.${blockName}__${elName}`;
		}

		return (elName) => `.${blockName}__${elName}`;
	}

	/**
	 * Returns a generator of an element names with modifiers
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index') // Function,
	 *   elName = base('page'), // 'p-index__page'
	 *   modsBase = elModNameGenerator(elName), // Function
	 *   elNameWithMods = modsBase('type', 'test'); // 'p-index__page_type_test'
	 * ```
	 */
	static elModNameGenerator(fullElName: string): (modName: string, modVal: string) => string;

	/**
	 * Returns a string of an element name with modifiers
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index') // Function,
	 *   elName = base('page'), // 'p-index__page'
	 *   modsBase = elModNameGenerator(elName, 'type', 'test'); // 'p-index__page_type_test'
	 * ```
	 */
	static elModNameGenerator(fullElName: string, modName: string, modVal: string): string;

	static elModNameGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * Returns a generator of an element class names with modifiers
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index') // Function,
	 *   elName = base('page'), // 'p-index__page'
	 *   modsBase = elModNameGenerator(elName), // Function
	 *   elNameWithMods = modsBase('type', 'test'); // '.p-index__page_type_test'
	 * ```
	 */
	static elModSelectorGenerator(fullElName: string): (modName: string, modVal: string) => string;

	/**
	 * Returns a string of an element class name with modifiers
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index') // Function,
	 *   elName = base('page'), // 'p-index__page'
	 *   modsBase = elModSelectorGenerator(elName, 'type', 'test'); // '.p-index__page_type_test'
	 * ```
	 */
	static elModSelectorGenerator(fullElName: string, modName: string, modVal: string): string;

	static elModSelectorGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `.${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `.${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * Returns `true` if the specified item is visible in the viewport
	 *
	 * @param selectorOrElement
	 * @param ctx
	 */
	static async isVisible(selectorOrElement: string, ctx: Page | ElementHandle): Promise<boolean>;
	static async isVisible(selectorOrElement: ElementHandle, ctx?: Page | ElementHandle): Promise<boolean>;
	static async isVisible(selectorOrElement: ElementHandle | string, ctx?: Page | ElementHandle): Promise<boolean> {
		const element = typeof selectorOrElement === 'string' ?
			await ctx!.$(selectorOrElement) :
			selectorOrElement;

		if (!element) {
			return Promise.resolve(false);
		}

		return element.evaluate<boolean, Element>((el) => {
			const
				style = globalThis.getComputedStyle(el),
				rect = el.getBoundingClientRect(),
				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				hasVisibleBoundingBox = Boolean(rect.top || rect.bottom || rect.width || rect.height);

			return Object.isTruly(style) && style.visibility !== 'hidden' && hasVisibleBoundingBox;
		});
	}

	/**
	 * Waits for the specified element to appear in the DOM and returns it
	 *
	 * @param ctx
	 * @param selector
	 * @param [options]
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
	 */
	static waitForEl(
		ctx: Page | ElementHandle,
		selector: string,
		options: WaitForElOptions
	): Promise<Nullable<ElementHandle>> {
		const normalizedOptions = <Required<WaitForElOptions>>{
			sleep: 100,
			timeout: 5000,
			to: 'mount',
			...options
		};

		if (normalizedOptions.to === 'mount') {
			return ctx.waitForSelector(selector, {state: 'attached', timeout: normalizedOptions.timeout});

		}

		return ctx.waitForSelector(selector, {state: 'detached', timeout: normalizedOptions.timeout});
	}

	/**
	 * @param refName
	 * @deprecated
	 * @see [[DOM.getRefSelector]]
	 */
	getRefSelector(refName: string): string {
		return DOM.getRefSelector(refName);
	}

	/**
	 * @param ctx
	 * @param refName
	 * @deprecated
	 * @see [[DOM.getRefs]]
	 */
	getRefs(ctx: Page | ElementHandle, refName: string): Promise<ElementHandle[]> {
		return DOM.getRefs(ctx, refName);
	}

	/**
	 * @param ctx
	 * @param refName
	 * @deprecated
	 * @see [[DOM.getRef]]
	 */
	getRef<T extends HTMLElement>(ctx: Page | ElementHandle, refName: string): Promise<Nullable<ElementHandle<T>>> {
		return DOM.getRef(ctx, refName);
	}

	/**
	 * Returns attribute value of the specified `ref`
	 *
	 * @param ctx
	 * @param refName
	 * @param attr
	 */
	async getRefAttr(ctx: Page | ElementHandle, refName: string, attr: string): Promise<Nullable<string>> {
		return (await this.getRef(ctx, refName))?.getAttribute(attr);
	}

	/**
	 * @param ctx
	 * @param refName
	 * @param [clickOptions]
	 * @deprecated
	 * @see [[DOM.clickToRef]]
	 */
	clickToRef(ctx: Page | ElementHandle, refName: string, clickOptions?: Dictionary): Promise<void> {
		return DOM.clickToRef(ctx, refName, clickOptions);
	}

	/**
	 * @param ctx
	 * @param refName
	 * @param [options] - @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
	 * @deprecated
	 * @see [[DOM.waitRef]]
	 */
	waitForRef(ctx: Page | ElementHandle, refName: string, options?: Dictionary): Promise<ElementHandle> {
		return ctx.waitForSelector(this.getRefSelector(refName), {state: 'attached', ...options});
	}

	/**
	 * @param ctx
	 * @param selector
	 * @param [options]
	 * @deprecated
	 * @see [[DOM.waitForEl]]
	 * @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
	 */
	waitForEl(ctx: Page | ElementHandle, selector: string, options: WaitForElOptions): Promise<Nullable<ElementHandle>> {
		const normalizedOptions = <Required<WaitForElOptions>>{
			sleep: 100,
			timeout: 5000,
			to: 'mount',
			...options
		};

		if (normalizedOptions.to === 'mount') {
			return ctx.waitForSelector(selector, {state: 'attached', timeout: normalizedOptions.timeout});

		}

		return ctx.waitForSelector(selector, {state: 'detached', timeout: normalizedOptions.timeout});
	}

	/**
	 * @param blockName
	 * @param elName
	 * @deprecated
	 * @see [[DOM.elNameGenerator]]
	 */
	elNameGenerator(blockName: string, elName?: string): any {
		if (elName != null) {
			return `${blockName}__${elName}`;
		}

		return (elName) => `${blockName}__${elName}`;
	}

	/**
	 * @param blockName
	 * @param elName
	 * @deprecated
	 * @see [[DOM.elNameSelectorGenerator]]
	 */
	elNameSelectorGenerator(blockName: string, elName?: string): any {
		if (elName != null) {
			return `.${blockName}__${elName}`;
		}

		return (elName) => `.${blockName}__${elName}`;
	}

	/**
	 * @param fullElName
	 * @param modName
	 * @param modVal
	 * @deprecated
	 * @see [[DOM.elModNameGenerator]]
	 */
	elModNameGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * @param fullElName
	 * @param modName
	 * @param modVal
	 * @deprecated
	 *
	 * @see [[DOM.elModSelectorGenerator]]
	 */
	elModSelectorGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `.${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `.${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * @param selectorOrElement
	 * @param ctx
	 * @deprecated
	 * @see [[DOM.isVisible]]
	 */
	async isVisible(selectorOrElement: ElementHandle | string, ctx?: Page | ElementHandle): Promise<boolean> {
		return DOM.isVisible(<any>selectorOrElement, ctx);
	}
}

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
 * Class provides API to work with DOM.
 */
export default class DOM {
	/**
	 * Returns an element matched by the specified ref name
	 *
	 * @param ctx
	 * @param refName
	 */
	 static async getRef<T extends HTMLElement>(
		ctx: Page | ElementHandle,
		refName: string
	): Promise<Nullable<ElementHandle<T>>> {
		const res = await ctx.$(this.getRefSelector(refName));
		return <ElementHandle<T>>res;
	}

	/**
	 * Returns a promise that will be resolved with an element matched by the specified ref name
	 *
	 * @param ctx
	 * @param refName
	 */
	static async waitRef<T extends HTMLElement>(
		ctx: Page | ElementHandle,
		refName: string
	): Promise<ElementHandle<T>> {
		const res = await ctx.waitForSelector(this.getRefSelector(refName), {state: 'attached'});
		return <ElementHandle<T>>res;
	}

	/**
	 * Returns elements matched the specified ref name
	 *
	 * @param ctx
	 * @param refName
	 */
	static getRefs(ctx: Page | ElementHandle, refName: string): Promise<ElementHandle[]> {
		return ctx.$$(this.getRefSelector(refName));
	}

	/**
	 * Returns a selector for the specified ref
	 * @param refName
	 */
	static getRefSelector(refName: string): string {
		return `[data-test-ref="${refName}"]`;
	}

	/**
	 * Clicks to an element matched to the specified ref name
	 * @see https://playwright.dev/#version=v1.2.0&path=docs%2Fapi.md&q=pageclickselector-options
	 *
	 * @param ctx
	 * @param refName
	 * @param [clickOpts]
	 */
	static clickToRef(ctx: Page | ElementHandle, refName: string, clickOpts?: Dictionary): Promise<void> {
		return ctx.click(this.getRefSelector(refName), {
			force: true,
			...clickOpts
		});
	}

	/**
	 * Returns a generator of element names for the specified block
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index'), // Function
	 *   elName = base('page');             // 'p-index__page'
	 * ```
	 */
	static elNameGenerator(blockName: string): (elName: string) => string;

	/**
	 * Returns an element name for the specified block
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
	 * Returns a generator of element classes for the specified block
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameSelectorGenerator('p-index'), // Function
	 *   elName = base('page');                     // '.p-index__page'
	 * ```
	 */
	static elNameSelectorGenerator(blockName: string): (elName: string) => string;

	/**
	 * Returns an element class for the specified block
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
	 * Returns a generator of element names with modifiers for the specified block
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index')          // Function,
	 *   elName = base('page'),                     // 'p-index__page'
	 *
	 *   modsBase = elModNameGenerator(elName),     // Function
	 *   elNameWithMods = modsBase('type', 'test'); // 'p-index__page_type_test'
	 * ```
	 */
	static elModNameGenerator(fullElName: string): (modName: string, modVal: string) => string;

	/**
	 * Returns an element name with modifiers for the specified block
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index')                      // Function,
	 *   elName = base('page'),                                 // 'p-index__page'
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
	 * Returns a generator of element classes with modifiers for the specified block
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index')          // Function,
	 *   elName = base('page'),                     // 'p-index__page'
	 *
	 *   modsBase = elModNameGenerator(elName),     // Function
	 *   elNameWithMods = modsBase('type', 'test'); // '.p-index__page_type_test'
	 * ```
	 */
	static elModSelectorGenerator(fullElName: string): (modName: string, modVal: string) => string;

	/**
	 * Returns an element class name with modifiers for the specified block
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index')                          // Function,
	 *   elName = base('page'),                                     // 'p-index__page'
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
	 * Returns true if the specified elements is in the viewport
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
	 * Returns a promise that will be resolved with an element matched by the specified ref name
	 *
	 * @param ctx
	 * @param refName
	 * @param [opts] - @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
	 */
	waitForRef(ctx: Page | ElementHandle, refName: string, opts?: Dictionary): Promise<ElementHandle> {
		return ctx.waitForSelector(this.getRefSelector(refName), {state: 'attached', ...opts});
	}

	/**
	 * @deprecated
	 * @see [[DOM.getRefSelector]]
	 * @param refName
	 */
	getRefSelector(refName: string): string {
		return DOM.getRefSelector(refName);
	}

	/**
	 * @deprecated
	 * @see [[DOM.getRefs]]
	 *
	 * @param ctx
	 * @param refName
	 */
	getRefs(ctx: Page | ElementHandle, refName: string): Promise<ElementHandle[]> {
		return DOM.getRefs(ctx, refName);
	}

	/**
	 * @deprecated
	 * @see [[DOM.getRef]]
	 *
	 * @param ctx
	 * @param refName
	 */
	getRef<T extends HTMLElement>(ctx: Page | ElementHandle, refName: string): Promise<Nullable<ElementHandle<T>>> {
		return DOM.getRef(ctx, refName);
	}

	/**
	 * Returns an attribute value of the specified ref
	 *
	 * @param ctx
	 * @param refName
	 * @param attr
	 */
	async getRefAttr(ctx: Page | ElementHandle, refName: string, attr: string): Promise<Nullable<string>> {
		return (await this.getRef(ctx, refName))?.getAttribute(attr);
	}

	/**
	 * @deprecated
	 * @see [[DOM.clickToRef]]
	 *
	 * @param ctx
	 * @param refName
	 * @param [clickOpts]
	 */
	clickToRef(ctx: Page | ElementHandle, refName: string, clickOpts?: Dictionary): Promise<void> {
		return DOM.clickToRef(ctx, refName, clickOpts);
	}

	/**
	 * Returns a promise that will be resolved with an element matched by the specified selector
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
	 *
	 * @param ctx
	 * @param selector
	 * @param [opts]
	 */
	waitForEl(ctx: Page | ElementHandle, selector: string, opts?: WaitForElOptions): Promise<Nullable<ElementHandle>> {
		const normalizedOptions = <Required<WaitForElOptions>>{
			sleep: 100,
			timeout: 5000,
			to: 'mount',
			...opts
		};

		if (normalizedOptions.to === 'mount') {
			return ctx.waitForSelector(selector, {state: 'attached', timeout: normalizedOptions.timeout});

		}

		return ctx.waitForSelector(selector, {state: 'detached', timeout: normalizedOptions.timeout});
	}

	/**
	 * @deprecated
	 * @see [[DOM.elNameGenerator]]
	 *
	 * @param blockName
	 * @param [elName]
	 */
	elNameGenerator(blockName: string, elName?: string): any {
		if (elName != null) {
			return `${blockName}__${elName}`;
		}

		return (elName) => `${blockName}__${elName}`;
	}

	/**
	 * @deprecated
	 * @see [[DOM.elNameSelectorGenerator]]
	 *
	 * @param blockName
	 * @param [elName]
	 */
	elNameSelectorGenerator(blockName: string, elName?: string): any {
		if (elName != null) {
			return `.${blockName}__${elName}`;
		}

		return (elName) => `.${blockName}__${elName}`;
	}

	/**
	 * @deprecated
	 * @see [[DOM.elModNameGenerator]]
	 *
	 * @param fullElName
	 * @param [modName]
	 * @param [modVal]
	 */
	elModNameGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * @deprecated
	 * @see [[DOM.elModSelectorGenerator]]
	 *
	 * @param fullElName
	 * @param [modName]
	 * @param [modVal]
	 */
	elModSelectorGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `.${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `.${fullElName}_${modName}_${modVal}`;
	}

	/**
	 * @deprecated
	 * @see [[DOM.isVisible]]
	 *
	 * @param selectorOrElement
	 * @param [ctx]
	 */
	async isVisible(selectorOrElement: ElementHandle | string, ctx?: Page | ElementHandle): Promise<boolean> {
		return DOM.isVisible(<any>selectorOrElement, ctx);
	}
}

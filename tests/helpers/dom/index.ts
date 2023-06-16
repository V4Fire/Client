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
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class DOM {
	/**
	 * Returns an element matched by the specified ref name
	 *
	 * @param ctx
	 * @param refName
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id
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
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id
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
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id
	 */
	static getRefs(ctx: Page | ElementHandle, refName: string): Promise<ElementHandle[]> {
		return ctx.$$(this.getRefSelector(refName));
	}

	/**
	 * Returns a selector for the specified ref
	 *
	 * @param refName
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id
	 */
	static getRefSelector(refName: string): string {
		return `[data-test-ref="${refName}"]`;
	}

	/**
	 * Clicks to an element matched to the specified ref name
	 *
	 * @see https://playwright.dev/#version=v1.2.0&path=docs%2Fapi.md&q=pageclickselector-options
	 *
	 * @param ctx
	 * @param refName
	 * @param [clickOpts]
	 *
	 * @deprecated
	 * @see https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id
	 */
	static clickToRef(ctx: Page | ElementHandle, refName: string, clickOpts?: Dictionary): Promise<void> {
		return ctx.click(this.getRefSelector(refName), {
			...clickOpts
		});
	}

	/**
	 * Returns a content from description meta tag
	 */
	static getPageDescription(): string | undefined {
		const metaElem: HTMLMetaElement | undefined = [].find.call(document.getElementsByTagName('meta'), (item) => item.name === 'description');

		if (metaElem) {
			return metaElem.content;
		}
	}

	/**
	 * Returns a generator of element names for the specified block
	 *
	 * @param blockName
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
	 * @param blockName
	 * @param elName
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
	 * @param blockName
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
	 * @param blockName
	 * @param elName
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
	 * @param fullElementName
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
	static elModNameGenerator(fullElementName: string): (modName: string, modVal: string) => string;

	/**
	 * Returns an element name with modifiers for the specified block
	 *
	 * @param fullElementName
	 * @param modName
	 * @param modVal
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index')                      // Function,
	 *   elName = base('page'),                                 // 'p-index__page'
	 *   modsBase = elModNameGenerator(elName, 'type', 'test'); // 'p-index__page_type_test'
	 * ```
	 */
	static elModNameGenerator(fullElementName: string, modName: string, modVal: string): string;

	static elModNameGenerator(fullElementName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `${fullElementName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `${fullElementName}_${modName}_${modVal}`;
	}

	/**
	 * Returns a generator of element classes with modifiers for the specified block
	 *
	 * @param fullElementName
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
	static elModSelectorGenerator(fullElementName: string): (modName: string, modVal: string) => string;

	/**
	 * Returns an element class name with modifiers for the specified block
	 *
	 * @param fullElementName
	 * @param modName
	 * @param modVal
	 *
	 * @example
	 * ```typescript
	 * const
	 *   base = elNameGenerator('p-index')                          // Function,
	 *   elName = base('page'),                                     // 'p-index__page'
	 *   modsBase = elModSelectorGenerator(elName, 'type', 'test'); // '.p-index__page_type_test'
	 * ```
	 */
	static elModSelectorGenerator(fullElementName: string, modName: string, modVal: string): string;

	static elModSelectorGenerator(fullElementName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `.${fullElementName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `.${fullElementName}_${modName}_${modVal}`;
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
}

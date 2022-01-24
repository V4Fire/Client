/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, ElementHandle } from 'playwright';

import type Helpers from '@tests/helpers';

/**
 * Class provides API to work with `DOM`.
 */
export default class DOM {
	/** @see [[Helpers]] */
	protected parent: typeof Helpers;

	/** @param parent */
	constructor(parent: typeof Helpers) {
		this.parent = parent;
	}

	/**
	 * Returns a selector for test refs
	 * @param refName
	 */
	getRefSelector(refName: string): string {
		return `[data-test-ref="${refName}"]`;
	}

	/**
	 * Returns elements that match the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 */
	getRefs(ctx: Page | ElementHandle, refName: string): Promise<ElementHandle[]> {
		return ctx.$$(this.getRefSelector(refName));
	}

	/**
	 * Returns an element that matches the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 */
	async getRef<T extends HTMLElement>(ctx: Page | ElementHandle, refName: string): Promise<Nullable<ElementHandle<T>>> {
		const
			res = await ctx.$(this.getRefSelector(refName));

		return <ElementHandle<T>>res;
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
	 * Click on the element that matches the specified `refName`
	 *
	 * @param ctx
	 * @param refName
	 * @param [clickOptions]
	 *
	 * @see https://playwright.dev/#version=v1.2.0&path=docs%2Fapi.md&q=pageclickselector-options
	 */
	clickToRef(ctx: Page | ElementHandle, refName: string, clickOptions?: Dictionary): Promise<void> {
		return ctx.click(this.getRefSelector(refName), {
			force: true,
			...clickOptions
		});
	}

	/**
	 * Waits for an element in the DOM that matches the specified `refName` and returns it
	 *
	 * @param ctx
	 * @param refName
	 */
	waitForRef(ctx: Page | ElementHandle, refName: string): Promise<CanUndef<ElementHandle>> {
		return ctx.waitForSelector(this.getRefSelector(refName));
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
	elNameGenerator(blockName: string): (elName: string) => string;

	/**
	 * Returns an element name
	 *
	 * @example
	 * ```typescript
	 * const
	 *   elName = elNameGenerator('p-index', 'page'); // 'p-index__page'
	 * ```
	 */
	elNameGenerator(blockName: string, elName: string): string;

	elNameGenerator(blockName: string, elName?: string): any {
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
	elNameSelectorGenerator(blockName: string): (elName: string) => string;

	/**
	 * Returns an element class name
	 *
	 * @example
	 * ```typescript
	 * const
	 *   elName = elNameGenerator('p-index', 'page'); // '.p-index__page'
	 * ```
	 */
	elNameSelectorGenerator(blockName: string, elName: string): string;

	elNameSelectorGenerator(blockName: string, elName?: string): any {
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
	elModNameGenerator(fullElName: string): (modName: string, modVal: string) => string;

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
	elModNameGenerator(fullElName: string, modName: string, modVal: string): string;

	elModNameGenerator(fullElName: string, modName?: string, modVal?: string): any {
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
	elModSelectorGenerator(fullElName: string): (modName: string, modVal: string) => string;

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
	elModSelectorGenerator(fullElName: string, modName: string, modVal: string): string;

	elModSelectorGenerator(fullElName: string, modName?: string, modVal?: string): any {
		if (modName != null) {
			return `.${fullElName}_${modName}_${modVal}`;
		}

		return (modName, modVal) => `.${fullElName}_${modName}_${modVal}`;
	}
}

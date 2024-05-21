/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AbstractCache } from 'core/cache';

import type bDynamicPage from 'components/base/b-dynamic-page/b-dynamic-page';

import type iDynamicPage from 'components/super/i-dynamic-page/i-dynamic-page';
import type { ComponentElement, UnsafeIData } from 'components/super/i-dynamic-page/i-dynamic-page';

export type Include = CanArray<string> | RegExp | IncludeFn;

export interface PageGetter {
	(route: iDynamicPage['route'], ctx: bDynamicPage): CanUndef<string>;
}

export interface IncludeFn {
	(page: string, route: iDynamicPage['route'], ctx: bDynamicPage): boolean | string | KeepAliveCache;
}

export type Exclude = CanArray<string> | RegExp | ExcludeFn;

export interface ExcludeFn {
	(page: string, route: iDynamicPage['route'], ctx: bDynamicPage): boolean;
}

export type iDynamicPageEl = ComponentElement<iDynamicPage>;

export interface KeepAliveCache {
	/**
	 * Key for page caching
	 */
	cacheKey: string;

	/**
	 * The name of the cache group to use.
	 * Pages with the same group will use the same cache object.
	 */
	cacheGroup: string;

	/**
	 * Creates an object for caching pages
	 */
	createCache(): AbstractCache<iDynamicPageEl>;
}

export interface KeepAliveStrategy {
	isLoopback: boolean;
	has(): boolean;
	get(): CanUndef<iDynamicPageEl>;
	add(page: iDynamicPageEl): iDynamicPageEl;
	remove(): CanUndef<iDynamicPageEl>;
}

// @ts-ignore (extend)
export interface UnsafeBDynamicPage<CTX extends bDynamicPage = bDynamicPage> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	renderIterator: CTX['renderIterator'];

	// @ts-ignore (access)
	renderFilter: CTX['renderFilter'];

	// @ts-ignore (access)
	getKeepAliveStrategy: CTX['getKeepAliveStrategy'];

	// @ts-ignore (access)
	wrapCache: CTX['wrapCache'];
}

export interface OnBeforeSwitchPage {
	/**
	 * Saves the scroll position of an element
	 * @param el
	 */
	saveScroll(el: Element): void;
}

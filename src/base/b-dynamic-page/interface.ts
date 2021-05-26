/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AbstractCache } from 'core/cache';

import type bDynamicPage from 'base/b-dynamic-page/b-dynamic-page';
import type iDynamicPage from 'super/i-dynamic-page/i-dynamic-page';
import type { ComponentElement, UnsafeIData } from 'super/i-dynamic-page/i-dynamic-page';

export type Include =
	CanArray<string> |
	RegExp |
	((page: string, route?: iDynamicPage['route']) => boolean | string | KeepAliveCache);

export type Exclude =
	CanArray<string> |
	RegExp |
	((page: string, route?: iDynamicPage['route']) => boolean);

export type iDynamicPageEl = ComponentElement<iDynamicPage>;

export interface KeepAliveCache {
	/**
	 * Key to cache a page
	 */
	cacheKey: string;

	/**
	 * Name of the used cache group.
	 * Pages with the same group will use the same cache object.
	 */
	cacheGroup: string;

	/**
	 * Creates an object to cache pages
	 */
	createCache(): AbstractCache<iDynamicPageEl>;
}

export interface KeepAliveStrategy {
	has(): boolean;
	get(): CanUndef<iDynamicPageEl>;
	add(page: iDynamicPageEl): CanUndef<iDynamicPageEl>;
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

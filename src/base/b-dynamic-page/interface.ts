/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AbstractCache } from 'core/cache';

import type iDynamicPage from 'super/i-dynamic-page/i-dynamic-page';
import type { ComponentElement } from 'super/i-dynamic-page/i-dynamic-page';

export type Include = CanArray<string> | RegExp | ((page: string) => boolean | string | KeepAliveCache);
export type Exclude = CanArray<string> | RegExp | ((page: string) => boolean);

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
	createCache(): AbstractCache<ComponentElement<iDynamicPage>>;
}

export interface KeepAliveStrategy {
	has(): boolean;
	get(): CanUndef<ComponentElement<iDynamicPage>>;
	add(page: ComponentElement<iDynamicPage>): ComponentElement<iDynamicPage>;
	remove(): CanUndef<ComponentElement<iDynamicPage>>;
}

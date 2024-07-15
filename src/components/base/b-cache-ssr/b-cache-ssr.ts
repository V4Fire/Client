/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-cache-ssr/README.md]]
 * @packageDocumentation
 */

import type { AbstractCache } from 'core/cache';
import SuperState from 'components/friends/state';

import iBlock, { component, prop, system } from 'components/super/i-block/i-block';
import { ssrCache } from 'components/base/b-cache-ssr/const';

export * from 'components/super/i-block/i-block';
export * from 'components/base/b-cache-ssr/const';

@component({functional: true})
export default class bCacheSSR extends iBlock {
	@prop({required: true})
	override readonly globalName!: string;

	override readonly rootTag: string = 'div';

	/**
	 * The key under which the rendered templates will be stored in the cache
	 */
	get cacheKey(): string {
		return `${this.globalName}-default`;
	}

	@system((ctx) => {
		class State extends SuperState {
			override initFromStorage(): CanPromise<boolean> {
				return false;
			}
		}

		return new State(ctx);
	})

	protected override readonly state!: SuperState;

	@system(() => ssrCache)
	protected override readonly $ssrCache!: AbstractCache<string>;
}

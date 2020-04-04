/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/opt/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import { literalCache } from 'super/i-block/modules/opt/const';
import { IfOnceValue } from 'super/i-block/modules/opt/interface';

export * from 'super/i-block/modules/opt/const';
export * from 'super/i-block/modules/opt/interface';

/**
 * Class that provides some methods to optimize an application
 */
export default class Opt<C extends iBlock = iBlock> extends Friend<C> {
	/** @see [[iBlock.ifOnceStore]] */
	protected get ifOnceStore(): this['C']['ifOnceStore'] {
		return this.component.ifOnceStore;
	}

	/**
	 * Returns a number if the specified label:
	 *   2 -> already exists in a cache;
	 *   1 -> just written in a cache;
	 *   0 -> doesn't exist in a cache.
	 *
	 * This method is used with conditions to provide a logic: if the condition was switched to true,
	 * then further it always return true.
	 *
	 * @param label
	 * @param [value] - label value (will be saved in the cache only if true)
	 *
	 * @example
	 * ```
	 * < .content v-if = opt.ifOnce('opened', m.opened === 'true')
	 *   Very big content
	 * ```
	 */
	ifOnce(label: unknown, value: boolean = false): IfOnceValue {
		const
			strLabel = String(label);

		if (this.ifOnceStore[strLabel]) {
			return 2;
		}

		if (value) {
			// @ts-ignore
			this.ifOnceStore[strLabel] = 1;
		}

		return 0;
	}

	/**
	 * Tries to find a cached alternative to the specified value and returns it,
	 * or if the value wasn't find in the cache, it will be frozen, cached and returned.
	 *
	 * This method is used to cache raw literals within component templates to avoid redundant re-renders that occurs
	 * because a link to an object was changed.
	 *
	 * @param literal
	 *
	 * @example
	 * ```
	 * < b-button :mods = opt.memoizeLiteral({foo: 'bla'})
	 * ```
	 */
	memoizeLiteral<T>(literal: T): T extends (infer V)[] ? ReadonlyArray<V> : T extends object ? Readonly<T> : T {
		if (Object.isFrozen(literal)) {
			return <any>literal;
		}

		const key = Object.fastHash(literal);
		return literalCache[key] = literalCache[key] || Object.freeze(<any>literal);
	}
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export type MemoizedLiteral<T = unknown> =
	Readonly<Dictionary<T>> |
	ReadonlyArray<T>;

export const
	literalCache = Object.createDict<MemoizedLiteral>();

export default class Opt {
	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Cache of ifOnce
	 */
	protected get ifOnceStore(): Dictionary {
		// @ts-ignore
		return this.component.ifOnceStore;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns a number if the specified label:
	 *   2 -> already exists in the cache;
	 *   1 -> just written in the cache;
	 *   0 -> doesn't exist in the cache.
	 *
	 * @param label
	 * @param [value] - label value (will saved in the cache only if true)
	 */
	ifOnce(label: unknown, value: boolean = false): 0 | 1 | 2 {
		if (this.ifOnceStore[String(label)]) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[String(label)] = 1;
		}

		return 0;
	}

	/**
	 * Saves a literal to the cache and returns it
	 * @param literal
	 */
	memoizeLiteral<T>(
		literal: T
	): T extends (infer V)[] ? ReadonlyArray<V> : T extends Dictionary ? Readonly<T> : T {
		if (Object.isArray(literal) || Object.isObject(literal)) {
			if (Object.isFrozen(literal)) {
				return <any>literal;
			}

			const key = JSON.stringify(literal);
			return literalCache[key] = literalCache[key] || Object.freeze(<any>literal);
		}

		return <any>literal;
	}
}

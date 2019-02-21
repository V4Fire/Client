/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Async, { AsyncOpts } from 'core/async';

export default class Lazy {
	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns if the specified label:
	 *   2 -> already exists in the cache;
	 *   1 -> just written in the cache;
	 *   0 -> doesn't exist in the cache.
	 *
	 * @param label
	 * @param [value] - label value (will saved in the cache only if true)
	 */
	protected ifOnce(label: unknown, value: boolean = false): 0 | 1 | 2 {
		if (this.ifOnceStore[String(label)]) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[String(label)] = 1;
		}

		return 0;
	}

	/**
	 * Saves to cache the specified literal and returns returns it
	 * @param literal
	 */
	protected memoizeLiteral<T>(
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

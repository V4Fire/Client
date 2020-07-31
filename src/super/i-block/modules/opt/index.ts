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

import Friend from 'super/i-block/modules/friend';

import { literalCache } from 'super/i-block/modules/opt/const';
import { IfOnceValue } from 'super/i-block/modules/opt/interface';

export * from 'super/i-block/modules/opt/const';
export * from 'super/i-block/modules/opt/interface';

/**
 * Class provides some methods to optimize an application
 */
export default class Opt extends Friend {
	/** @see [[iBlock.ifOnceStore]] */
	protected get ifOnceStore(): Dictionary<number> {
		return this.ctx.ifOnceStore;
	}

	/**
	 * Returns a number if the specified label:
	 *   2 -> already exists in the cache;
	 *   1 -> just written in the cache;
	 *   0 -> doesn't exist in the cache.
	 *
	 * This method is used with conditions to provide a logic: if the condition was switched to true,
	 * then further it always returns true.
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

		if (this.ifOnceStore[strLabel] != null) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[strLabel] = 1;
		}

		return 0;
	}

	/**
	 * Tries to find a blueprint in the cache to the specified value and returns it,
	 * or if the value wasn't found in the cache, it would be frozen, cached, and returned.
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
	memoizeLiteral<T>(literal: T): T extends Array<infer V> ? readonly V[] : T extends object ? Readonly<T> : T {
		if (Object.isFrozen(literal)) {
			return <any>literal;
		}

		const key = Object.fastHash(literal);
		return literalCache[key] = literalCache[key] ?? Object.freeze(<any>literal);
	}

	/**
	 * Shows any changes of component properties.
	 * This method is useful to debug.
	 */
	showAnyChanges(): void {
		const cg = (name, key, val, oldVal, info) => {
			console.group(`${name} "${key}" (${this.ctx.componentName})`);
			console.log(Object.fastClone(val));
			console.log(oldVal);
			console.log('Path: ', info?.path);
			console.groupEnd();
		};

		Object.forEach(this.ctx.$systemFields, (val, key) => {
			this.ctx.watch(key, {deep: true}, (val, oldVal, info) => {
				cg('System field', key, val, oldVal, info);
			});
		});

		Object.forEach(this.ctx.$fields, (val, key) => {
			this.ctx.watch(key, {deep: true}, (val, oldVal, info) => {
				cg('Field', key, val, oldVal, info);
			});
		});

		Object.forEach(this.ctx.$props, (val, key) => {
			this.ctx.watch(key, {deep: true}, (val, oldVal, info) => {
				cg('Prop', key, val, oldVal, info);
			});
		});
	}
}

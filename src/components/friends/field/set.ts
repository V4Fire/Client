/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { unwrap } from 'core/object/watch';

import type Friend from 'components/friends/friend';
import iBlock, { getPropertyInfo, V4_COMPONENT } from 'components/super/i-block/i-block';

import type { KeyGetter } from 'components/friends/field/interface';

/**
 * Sets a new component property at the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param value - the value to set to the property
 * @param keyGetter - a function that returns the key to set
 *
 * @example
 * ```typescript
 * import iBlock, { component, field } from 'components/super/i-block/i-block';
 *
 * @component()
 * export default class bInput extends iBlock {
 *   @field()
 *   foo: Dictionary = {};
 *
 *   created() {
 *     this.field.set('foo.bla', 1);
 *     console.log(this.foo.bla === 1);
 *
 *     this.field.set('foo.blaBar', 2, String.underscore);
 *     console.log(this.foo.bla_bar === 2);
 *   }
 * }
 * ```
 */
export function setField<T = unknown>(this: Friend, path: string, value: T, keyGetter: KeyGetter): T;

/**
 * Sets a new property on the passed object at the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param value - the value to set to the property
 * @param [obj] - the object to set the property
 * @param [keyGetter] - a function that returns the key to set
 *
 * @example
 * ```js
 * const obj = {};
 *
 * this.field.set('foo.bla', obj, 1);
 * console.log(obj.foo.bla === 1);
 *
 * this.field.set('foo.blaBar', obj, 2, String.underscore);
 * console.log(obj.foo.bla_bar === 2);
 * ```
 */
export function setField<T = unknown>(
	this: Friend,
	path: string,
	value: T,
	obj?: Nullable<object>,
	keyGetter?: KeyGetter
): T;

export function setField<T = unknown>(
	this: Friend,
	path: string,
	value: T,
	obj: Nullable<object> = this.ctx,
	keyGetter?: KeyGetter
): T {
	if (Object.isFunction(obj)) {
		keyGetter = obj;
		obj = this.ctx;
	}

	if (obj == null) {
		return value;
	}

	let {ctx} = this;

	let isComponent = false;

	if (V4_COMPONENT in obj) {
		ctx = (<iBlock>obj).unsafe;
		isComponent = true;
	}

	let
		sync: CanNull<() => T> = null,
		needSetToWatch = isComponent;

	let
		ref = obj,
		chunks: string[];

	if (isComponent) {
		const info = getPropertyInfo(path, Object.cast(ctx));

		ctx = Object.cast(info.ctx);
		ref = ctx;

		chunks = info.path.includes('.') ? info.path.split('.') : [info.path];

		if (info.accessor != null) {
			needSetToWatch = false;
			chunks[0] = info.accessor;

		} else {
			const isReady = !ctx.lfc.isBeforeCreate();

			const
				isSystem = info.type === 'system',
				isField = !isSystem && info.type === 'field';

			if (isSystem || isField) {
				// If the property has not yet been watched, do not force proxy creation
				// eslint-disable-next-line @v4fire/unbound-method
				needSetToWatch = isReady && Object.isFunction(Object.getOwnPropertyDescriptor(ctx, info.name)?.get);

				if (isSystem) {
					// If the component has already initialized system field watchers,
					// we must set these properties directly on the proxy object
					if (needSetToWatch) {
						ref = ctx.$systemFields;

					// Otherwise, we must synchronize these properties between the proxy object and the component instance
					} else {
						const name = chunks[0];
						sync = () => ctx.$systemFields[name] = ref[name];
					}

				} else if (ctx.isFunctionalWatchers) {
					ref = ctx.$fields;

					// If the component has not yet initialized field watchers,
					// we must synchronize these properties between the proxy object and the component instance
					if (unwrap(ref) === ref) {
						const name = chunks[0];
						sync = () => ctx[name] = ref[name];
					}

				} else {
					ref = isReady ? ctx : ctx.$fields;
				}
			}
		}

	} else {
		chunks = path.includes('.') ? path.split('.') : [path];
	}

	let prop = keyGetter ? <PropertyKey>keyGetter(chunks[0], ref) : chunks[0];

	if (chunks.length > 1) {
		chunks.some((chunk, i) => {
			prop = keyGetter ? <PropertyKey>keyGetter(chunk, ref) : chunk;

			if (i + 1 === chunks.length) {
				return true;
			}

			type AnyMap = Map<any, any>;

			const isRefMap = Object.isMap(ref);

			let newRef: unknown = isRefMap ? (<AnyMap>ref).get(prop) : ref[prop];

			if (newRef == null || typeof newRef !== 'object') {
				newRef = isNaN(Number(chunks[i + 1])) ? {} : [];

				if (needSetToWatch) {
					ctx.$set(ref, prop, newRef);

				} else if (isRefMap) {
					(<AnyMap>ref).set(prop, newRef);

				} else {
					ref[prop] = newRef;
				}
			}

			if (isRefMap) {
				ref = (<AnyMap>ref).get(prop);

			} else {
				ref = ref[prop];
			}

			return false;
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (ref == null) {
		return value;
	}

	if (Object.isMap(ref)) {
		if (!needSetToWatch || ref.has(prop)) {
			ref.set(prop, value);

		} else {
			ctx.$set(ref, prop, value);
		}

	} else if (!needSetToWatch || !Object.isArray(ref) && prop in ref) {
		ref[prop] = value;

	} else {
		ctx.$set(ref, prop, value);
	}

	if (sync != null) {
		sync();
	}

	return value;
}

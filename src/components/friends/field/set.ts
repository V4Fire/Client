/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { unwrap } from 'core/object/watch';

import type Friend from 'components/friends/friend';
import iBlock, { getPropertyInfo } from 'components/super/i-block/i-block';

import type { KeyGetter } from 'components/friends/field/interface';

/**
 * Sets a new component property by the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param value - a value to set to the property
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
 * Sets a new property to the passed object by the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param value - a value to set to the property
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

	let
		{ctx} = this;

	let
		isComponent = false;

	if ((<Dictionary>obj).instance instanceof iBlock) {
		ctx = (<iBlock>obj).unsafe;
		isComponent = true;
	}

	let
		sync,
		needSetToWatch = isComponent;

	let
		ref = obj,
		chunks;

	if (isComponent) {
		const
			info = getPropertyInfo(path, ctx);

		ctx = Object.cast(info.ctx);
		ref = ctx;

		chunks = info.path.split('.');

		if (info.accessor != null) {
			needSetToWatch = false;
			chunks[0] = info.accessor;

		} else {
			const
				isReady = !ctx.lfc.isBeforeCreate();

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
						sync = () => Object.set(ctx.$systemFields, [name], ref[name]);
					}

				} else if (ctx.isFunctionalWatchers) {
					ref = ctx.$fields;

					// If the component has not yet initialized field watchers,
					// we must synchronize these properties between the proxy object and the component instance
					if (unwrap(ref) === ref) {
						const name = chunks[0];
						sync = () => Object.set(ctx, [name], ref[name]);
					}

				} else {
					ref = isReady ? ctx : ctx.$fields;
				}
			}
		}

	} else {
		chunks = path.split('.');
	}

	let
		prop;

	for (let i = 0; i < chunks.length; i++) {
		prop = keyGetter ? keyGetter(chunks[i], ref) : chunks[i];

		if (i + 1 === chunks.length) {
			break;
		}

		let
			newRef = Object.get(ref, [prop]);

		if (newRef == null || typeof newRef !== 'object') {
			newRef = isNaN(Number(chunks[i + 1])) ? {} : [];

			if (needSetToWatch) {
				ctx.$set(ref, prop, newRef);

			} else {
				Object.set(ref, [prop], newRef);
			}
		}

		ref = Object.get(ref, [prop])!;
	}

	if (!needSetToWatch || !Object.isArray(ref) && Object.has(ref, [prop])) {
		Object.set(ref, [prop], value);

	} else {
		ctx.$set(ref, prop, value);
	}

	if (sync != null) {
		sync();
	}

	return value;
}

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
 * Deletes a component property by the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param keyGetter - a function that returns the key to delete
 *
 * @example
 * ```typescript
 * import iBlock, { component, field } from 'components/super/i-block/i-block';
 *
 * @component()
 * export default class bInput extends iBlock {
 *   @field()
 *   foo: Dictionary = {
 *     bla: 1,
 *     bla_bar: 2
 *   };
 *
 *   created() {
 *     this.field.delete('foo.bla');
 *     console.log('bla' in this.foo === false);
 *
 *     this.field.delete('foo.blaBar', String.underscore);
 *     console.log('bla_bar' in this.foo === false);
 *   }
 * }
 * ```
 */
export function deleteField(this: Friend, path: string, keyGetter?: KeyGetter): boolean;

/**
 * Deletes a property from the passed object by the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param [obj] - the object to delete the property
 * @param [keyGetter] - a function that returns the key to delete
 *
 * @example
 * ```js
 * const obj = {
 *   bla: 1,
 *   bla_bar: 2
 * };
 *
 * this.field.delete('foo.bla', obj);
 * console.log('bla' in obj.foo === false);
 *
 * this.field.delete('foo.blaBar', obj, String.underscore);
 * console.log('bla_bar' in obj.foo === false);
 * ```
 */
export function deleteField(
	this: Friend,
	path: string,
	obj?: Nullable<object>,
	keyGetter?: KeyGetter
): boolean;

export function deleteField(
	this: Friend,
	path: string,
	obj: Nullable<object> = this.ctx,
	keyGetter?: KeyGetter
): boolean {
	if (Object.isFunction(obj)) {
		keyGetter = obj;
		obj = this.ctx;
	}

	if (obj == null) {
		return false;
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
		needDeleteToWatch = isComponent;

	let
		ref = obj,
		chunks;

	if (isComponent) {
		const
			info = getPropertyInfo(path, ctx);

		const
			isReady = !ctx.lfc.isBeforeCreate(),
			isSystem = info.type === 'system',
			isField = !isSystem && info.type === 'field';

		ctx = Object.cast(info.ctx);

		chunks = info.path.split('.');
		chunks[0] = info.name;

		if (isSystem || isField) {
			// If the property has not yet been watched, do not force proxy creation
			needDeleteToWatch = isReady && (
				// eslint-disable-next-line @v4fire/unbound-method
				!ctx.isFunctional || Object.isFunction(Object.getOwnPropertyDescriptor(ctx, info.name)?.get)
			);

			if (isSystem) {
				// If the component has already initialized system field watchers,
				// we must set these properties directly on the proxy object
				if (needDeleteToWatch) {
					ref = ctx.$systemFields;

				// Otherwise, we must synchronize these properties between the proxy object and the component instance
				} else {
					const name = chunks[0];
					sync = () => Object.delete(ctx.$systemFields, [name]);
				}

			} else if (ctx.isFunctional) {
				ref = ctx.$fields;

				// If the component has not yet initialized field watchers,
				// we must synchronize these properties between the proxy object and the component instance
				if (unwrap(ref) === ref) {
					const name = chunks[0];
					sync = () => Object.delete(ctx, [name]);
				}

			} else {
				ref = isReady ? ctx : ctx.$fields;
			}
		}

	} else {
		chunks = path.split('.');
	}

	let
		needDelete = true,
		prop;

	for (let i = 0; i < chunks.length; i++) {
		prop = keyGetter ? keyGetter(chunks[i], ref) : chunks[i];

		if (i + 1 === chunks.length) {
			break;
		}

		const
			newRef = Object.get(ref, [prop]);

		if (newRef == null || typeof newRef !== 'object') {
			needDelete = false;
			break;
		}

		ref = newRef;
	}

	if (needDelete) {
		if (needDeleteToWatch) {
			ctx.$delete(ref, prop);

		} else {
			Object.delete(ref, [prop]);
		}

		if (sync != null) {
			sync();
		}

		return true;
	}

	return false;
}

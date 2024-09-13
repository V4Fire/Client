/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getPropertyInfo, V4_COMPONENT, PropertyInfo } from 'core/component';

import type Field from 'components/friends/field';
import type iBlock from 'components/super/i-block/i-block';

import type { ValueGetter } from 'components/friends/field/interface';

/**
 * Returns a component property at the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`, or a property descriptor
 * @param getter - a function used to get a value from an object and a property
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
 *     // 1
 *     console.log(this.field.get('foo.bla'));
 *
 *     // 2
 *     console.log(this.field.get('foo.blaBar', (prop, obj) => Object.get(obj, prop.underscore())));
 *   }
 * }
 * ```
 */
export function getField<T = unknown>(this: Field, path: string | PropertyInfo, getter: ValueGetter): CanUndef<T>;

/**
 * Returns a property from the passed object at the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`, or a property descriptor
 * @param [obj] - the object to search
 * @param [getter] - a function that is used to get a value from an object and a property
 *
 * @example
 * ```js
 * // 1
 * console.log(this.field.get('foo.bla', {foo: {bla: 1}}));
 *
 * // 2
 * console.log(this.field.get('foo.blaBar', {foo: {bla_bar: 2}}, (prop, obj) => Object.get(obj, prop.underscore())));
 * ```
 */
export function getField<T = unknown>(
	this: Field,
	path: string | PropertyInfo,
	obj?: Nullable<object>,
	getter?: ValueGetter
): CanUndef<T>;

export function getField<T = unknown>(
	this: Field,
	path: string | PropertyInfo,
	obj: Nullable<object | ValueGetter> = this.ctx,
	getter?: ValueGetter
): CanUndef<T> {
	if (Object.isFunction(obj)) {
		getter = obj;
		obj = this.ctx;
	}

	if (obj == null) {
		return;
	}

	let {ctx} = this;

	let isComponent = false;

	if (typeof obj === 'object' && V4_COMPONENT in obj) {
		ctx = (<iBlock>obj).unsafe;
		isComponent = true;
	}

	let
		res: unknown = obj,
		chunks: string[];

	if (isComponent) {
		const info = Object.isString(path) ? getPropertyInfo(path, Object.cast(ctx)) : path;

		ctx = Object.cast(info.ctx);
		res = ctx;

		chunks = info.path.includes('.') ? info.path.split('.') : [info.path];

		if (info.accessor != null) {
			chunks[0] = info.accessor;

		} else {
			switch (info.type) {
				case 'prop':
					if (ctx.lfc.isBeforeCreate('beforeDataCreate')) {
						return undefined;
					}

					break;

				case 'field':
					res = this.getFieldsStore(ctx);
					break;

				default:
					// Do nothing
			}
		}

	} else {
		if (!Object.isString(path)) {
			path = path.originalPath;
		}

		chunks = path.includes('.') ? path.split('.') : [path];
	}

	if (chunks.length === 1) {
		const chunk = chunks[0];

		if (getter != null) {
			res = getter(chunk, res);

		} else {
			const obj = <object>res;

			if (Object.isMap(obj)) {
				res = obj.get(chunk);

			} else {
				res = typeof obj !== 'object' || chunk in obj ? obj[chunk] : undefined;
			}
		}

	} else {
		const hasNoProperty = chunks.some((chunk) => {
			if (res == null) {
				return true;
			}

			if (Object.isPromiseLike(res) && !(chunk in res)) {
				res = res.then((res) => {
					if (getter != null) {
						return getter(chunk, res);
					}

					if (res == null) {
						return undefined;
					}

					const obj = <object>res;

					if (Object.isMap(obj)) {
						return obj.get(chunk);
					}

					return typeof obj !== 'object' || chunk in obj ? obj[chunk] : undefined;
				});

			} else if (getter != null) {
				res = getter(chunk, res);

			} else {
				const obj = <object>res;

				if (Object.isMap(obj)) {
					res = obj.get(chunk);

				} else {
					res = typeof obj !== 'object' || chunk in obj ? obj[chunk] : undefined;
				}
			}

			return false;
		});

		if (hasNoProperty) {
			return undefined;
		}
	}

	if (Object.isPromiseLike(res)) {
		// @ts-ignore (cast)
		return this.async.promise(res);
	}

	// @ts-ignore (cast)
	return res;
}

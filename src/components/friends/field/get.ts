/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Field from 'components/friends/field';
import iBlock, { getPropertyInfo } from 'components/super/i-block/i-block';

import type { ValueGetter } from 'components/friends/field/interface';

/**
 * Returns a component property at the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
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
export function getField<T = unknown>(this: Field, path: string, getter: ValueGetter): CanUndef<T>;

/**
 * Returns a property from the passed object at the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
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
	path: string,
	obj?: Nullable<object>,
	getter?: ValueGetter
): CanUndef<T>;

export function getField<T = unknown>(
	this: Field,
	path: string,
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

	if ('componentName' in obj && 'unsafe' in obj) {
		ctx = (<iBlock>obj).unsafe;
		isComponent = true;
	}

	let
		res: unknown = obj,
		chunks: string[];

	if (isComponent) {
		const info = getPropertyInfo(path, Object.cast(ctx));

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
		chunks = path.includes('.') ? path.split('.') : [path];
	}

	if (chunks.length === 1) {
		res = getter != null ? getter(chunks[0], res) : (<object>res)[chunks[0]];

	} else {
		const hasNoProperty = chunks.some((key) => {
			if (res == null) {
				return true;
			}

			if (Object.isPromiseLike(res) && !(key in res)) {
				res = res.then((res) => getter != null ? getter(key, res) : (<object>res)[key]);

			} else {
				res = getter != null ? getter(key, res) : (<object>res)[key];
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

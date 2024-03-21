/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';
import iBlock, { getPropertyInfo } from 'components/super/i-block/i-block';

import type { ValueGetter } from 'components/friends/field/interface';

/**
 * Returns a component property by the specified path
 *
 * @param path - the property path, for instance `foo.bla.bar`
 * @param getter - a function that is used to get a value from an object and a property
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
export function getField<T = unknown>(this: Friend, path: string, getter: ValueGetter): CanUndef<T>;

/**
 * Returns a property from the passed object by the specified path
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
	this: Friend,
	path: string,
	obj?: Nullable<object>,
	getter?: ValueGetter
): CanUndef<T>;

export function getField<T = unknown>(
	this: Friend,
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

	let
		{ctx} = this;

	let
		isComponent = false;

	if ((<Dictionary>obj).instance instanceof iBlock) {
		ctx = (<iBlock>obj).unsafe;
		isComponent = true;
	}

	let
		res: unknown = obj,
		chunks;

	if (isComponent) {
		const
			info = getPropertyInfo(path, ctx);

		ctx = Object.cast(info.ctx);
		res = ctx;

		chunks = info.path.split('.');

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
					res = ctx.isFunctionalWatchers || ctx.lfc.isBeforeCreate() ? ctx.$fields : ctx;
					break;

				default:
					// Do nothing
			}
		}

	} else {
		chunks = path.split('.');
	}

	if (getter == null) {
		res = Object.get<T>(res, chunks);

	} else {
		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			const
				key = chunks[i];

			if (Object.isPromiseLike(res) && !(key in res)) {
				res = res.then((res) => getter!(key, res));

			} else {
				res = getter(key, res);
			}
		}
	}

	if (Object.isPromiseLike(res)) {
		return Object.cast(this.async.promise(res));
	}

	return Object.cast(res);
}

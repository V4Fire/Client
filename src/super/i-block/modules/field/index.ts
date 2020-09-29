/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/field/README.md]]
 * @packageDocumentation
 */

import { getPropertyInfo } from 'core/component';

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import { KeyGetter, ValueGetter } from 'super/i-block/modules/field/interface';

export * from 'super/i-block/modules/field/interface';

/**
 * Class provides helper methods to safety access to a component property
 */
export default class Field extends Friend {
	/**
	 * Returns a property from a component by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param getter - function that returns a value from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.get('bla.foo');
	 * this.field.get('bla.fooBla', String.underscore.compose(Object.get));
	 * ```
	 */
	get<T = unknown>(path: ObjectPropertyPath, getter: ValueGetter): CanUndef<T>;

	/**
	 * Returns a property from an object by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj] - source object
	 * @param [getter] - function that returns a value from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.get('bla.foo', obj);
	 * this.field.get('bla.fooBla', obj, String.underscore.compose(Object.get));
	 * ```
	 */
	get<T = unknown>(
		path: string,
		obj?: Nullable<object>,
		getter?: ValueGetter
	): CanUndef<T>;

	get<T = unknown>(
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

			ctx = <any>info.ctx;
			res = ctx;

			chunks = info.path.split('.');

			if (info.accessor != null && this.ctx.hook !== 'beforeRuntime') {
				chunks[0] = info.accessor;

			} else {
				const isField = info.type === 'field';
				res = isField ? ctx.$fields : ctx;

				if ((isField && ctx.lfc.isBeforeCreate() || !(chunks[0] in <Dictionary>res))) {
					chunks[0] = info.name;
				}
			}

		} else {
			chunks = path.split('.');
		}

		if (getter == null) {
			return Object.get(res, chunks);
		}

		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			res = getter(chunks[i], res);
		}

		return <any>res;
	}

	/**
	 * Sets a new property to an object by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param value - value to set
	 * @param getter - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.set('bla.foo', 1);
	 * this.field.get('bla.fooBla', 1, String.underscore);
	 * ```
	 */
	set<T = unknown>(path: string, value: T, getter: KeyGetter): T;

	/**
	 * Sets a new property to an object by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param value - value to set
	 * @param [obj] - source object
	 * @param [getter] - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.set('bla.foo', 1);
	 * this.field.set('bla.foo', 1, obj);
	 * this.field.get('bla.fooBla', 1, obj, String.underscore);
	 * ```
	 */
	set<T = unknown>(
		path: string,
		value: T,
		obj?: Nullable<object>,
		getter?: KeyGetter
	): T;

	set<T = unknown>(
		path: string,
		value: T,
		obj: Nullable<object> = this.ctx,
		getter?: ValueGetter
	): T {
		if (Object.isFunction(obj)) {
			getter = obj;
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
			needSet = isComponent;

		let
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getPropertyInfo(path, ctx);

			ctx = <any>info.ctx;
			ref = ctx;
			chunks = info.path.split('.');

			if (info.accessor != null && this.ctx.hook !== 'beforeRuntime') {
				needSet = false;
				chunks[0] = info.accessor;

			} else {
				const
					isReady = !ctx.lfc.isBeforeCreate();

				switch (info.type) {
					case 'system':
						// eslint-disable-next-line @typescript-eslint/unbound-method
						needSet = isReady && Object.isFunction(Object.getOwnPropertyDescriptor(ctx, info.name)?.get);

						if (needSet) {
							ref = ctx.$systemFields;
						}

						break;

					case 'field':
						needSet = isReady;
						ref = ctx.$fields;

						if (!isReady) {
							chunks[0] = info.name;
						}

						break;

					default:
					// Loopback
				}
			}

		} else {
			chunks = path.split('.');
		}

		let
			prop;

		for (let i = 0; i < chunks.length; i++) {
			prop = getter ? getter(chunks[i], ref) : chunks[i];

			if (i + 1 === chunks.length) {
				break;
			}

			let
				newRef = Object.get(ref, [prop]);

			if (newRef == null || typeof newRef !== 'object') {
				newRef = isNaN(Number(chunks[i + 1])) ? {} : [];

				if (needSet) {
					ctx.$set(ref, prop, newRef);

				} else {
					Object.set(ref, [prop], newRef);
				}
			}

			ref = <any>newRef;
		}

		if (!needSet || !Object.isArray(ref) && Object.has(ref, [prop])) {
			Object.set(ref, [prop], value);

		} else {
			ctx.$set(ref, prop, value);
		}

		return value;
	}

	/**
	 * Deletes a property from an object by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param getter - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.delete('bla.foo');
	 * this.field.delete('bla.fooBla', String.underscore);
	 * ```
	 */
	delete(path: string, getter?: KeyGetter): boolean;

	/**
	 * Deletes a property from an object by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj] - source object
	 * @param [getter] - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.delete('bla.foo');
	 * this.field.delete('bla.foo', obj);
	 * this.field.delete('bla.fooBla', obj, String.underscore);
	 * ```
	 */
	delete(path: string, obj?: Nullable<object>, getter?: KeyGetter): boolean;

	delete(
		path: string,
		obj: Nullable<object> = this.ctx,
		getter?: KeyGetter
	): boolean {
		if (Object.isFunction(obj)) {
			getter = obj;
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
			needSet = isComponent,
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getPropertyInfo(path, ctx),
				isReady = !ctx.lfc.isBeforeCreate();

			ctx = <any>info.ctx;

			switch (info.type) {
				case 'system':
					// eslint-disable-next-line @typescript-eslint/unbound-method
					needSet = isReady && Object.isFunction(Object.getOwnPropertyDescriptor(ctx, info.name)?.get);

					if (needSet) {
						ref = ctx.$systemFields;
					}

					break;

				case 'field':
					needSet = isReady;
					ref = ctx.$fields;
					break;

				default:
				// Loopback
			}

			chunks = info.path.split('.');
			chunks[0] = info.name;

		} else {
			chunks = path.split('.');
		}

		let
			test = true,
			prop;

		for (let i = 0; i < chunks.length; i++) {
			prop = getter ? getter(chunks[i], ref) : chunks[i];

			if (i + 1 === chunks.length) {
				break;
			}

			const
				newRef = Object.get(ref, [prop]);

			if (newRef == null || typeof newRef !== 'object') {
				test = false;
				break;
			}

			ref = <any>newRef;
		}

		if (test) {
			if (needSet) {
				ctx.$delete(ref, prop);

			} else {
				Object.delete(ref, [prop]);
			}

			return true;
		}

		return false;
	}
}

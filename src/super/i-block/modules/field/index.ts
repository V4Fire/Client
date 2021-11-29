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

import { unwrap } from 'core/object/watch';
import { getPropertyInfo } from 'core/component';

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import type { KeyGetter, ValueGetter } from 'super/i-block/modules/field/interface';

export * from 'super/i-block/modules/field/interface';

/**
 * Class provides helper methods to safety access to a component property
 */
export default class Field extends Friend {
	/**
	 * Returns a property from a component by the specified path
	 *
	 * @param path - path to the property (`bla.baz.foo`)
	 * @param getter - function that returns a value from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.get('bla.foo');
	 * this.field.get('bla.fooBla', (prop, obj) => Object.get(obj, prop.underscore()));
	 * ```
	 */
	get<T = unknown>(path: ObjectPropertyPath, getter: ValueGetter): CanUndef<T>;

	/**
	 * Returns a property from an object by the specified path
	 *
	 * @param path - path to the property (`bla.baz.foo`)
	 * @param [obj] - source object
	 * @param [getter] - function that returns a value from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.get('bla.foo', obj);
	 * this.field.get('bla.fooBla', obj, (prop, obj) => Object.get(obj, prop.underscore()));
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

			ctx = Object.cast(info.ctx);
			res = ctx;

			chunks = info.path.split('.');

			if (info.accessor != null) {
				chunks[0] = info.accessor;

			} else if (!ctx.isFlyweight) {
				switch (info.type) {
					case 'prop':
						if (ctx.lfc.isBeforeCreate('beforeDataCreate')) {
							return undefined;
						}

						break;

					case 'field':
						res = ctx.$fields;
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

	/**
	 * Sets a new property to an object by the specified path
	 *
	 * @param path - path to the property (`bla.baz.foo`)
	 * @param value - value to set
	 * @param keyGetter - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.set('bla.foo', 1);
	 * this.field.get('bla.fooBla', 1, String.underscore);
	 * ```
	 */
	set<T = unknown>(path: string, value: T, keyGetter: KeyGetter): T;

	/**
	 * Sets a new property to an object by the specified path
	 *
	 * @param path - path to the property (`bla.baz.foo`)
	 * @param value - value to set
	 * @param [obj] - source object
	 * @param [keyGetter] - function that returns a key name from the passed object
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
		keyGetter?: KeyGetter
	): T;

	set<T = unknown>(
		path: string,
		value: T,
		obj: Nullable<object> = this.ctx,
		keyGetter?: ValueGetter
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

			} else if (ctx.isFlyweight) {
				needSetToWatch = false;

			} else {
				const
					isReady = !ctx.lfc.isBeforeCreate();

				const
					isSystem = info.type === 'system',
					isField = !isSystem && info.type === 'field';

				if (isSystem || isField) {
					// If property not already watched, don't force the creation of a proxy
					// eslint-disable-next-line @typescript-eslint/unbound-method
					needSetToWatch = isReady && Object.isFunction(Object.getOwnPropertyDescriptor(ctx, info.name)?.get);

					if (isSystem) {
						// If a component already initialized watchers of system fields,
						// we have to set these properties directly to the proxy object
						if (needSetToWatch) {
							ref = ctx.$systemFields;

						// Otherwise, we have to synchronize these properties between the proxy object and component instance
						} else {
							const name = chunks[0];
							sync = () => Object.set(ctx.$systemFields, [name], ref[name]);
						}

					} else {
						ref = ctx.$fields;

						if (!isReady) {
							chunks[0] = info.name;
						}

						const needSync =
							ctx.isNotRegular &&
							unwrap(ref) === ref;

						// If a component doesn't already initialize watchers of fields,
						// we have to synchronize these properties between the proxy object and component instance
						if (needSync) {
							const name = chunks[0];
							sync = () => Object.set(ctx, [name], ref[name]);
						}
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

	/**
	 * Deletes a property from an object by the specified path
	 *
	 * @param path - path to the property (`bla.baz.foo`)
	 * @param keyGetter - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.delete('bla.foo');
	 * this.field.delete('bla.fooBla', String.underscore);
	 * ```
	 */
	delete(path: string, keyGetter?: KeyGetter): boolean;

	/**
	 * Deletes a property from an object by the specified path
	 *
	 * @param path - path to the property (`bla.baz.foo`)
	 * @param [obj] - source object
	 * @param [keyGetter] - function that returns a key name from the passed object
	 *
	 * @example
	 * ```js
	 * this.field.delete('bla.foo');
	 * this.field.delete('bla.foo', obj);
	 * this.field.delete('bla.fooBla', obj, String.underscore);
	 * ```
	 */
	delete(path: string, obj?: Nullable<object>, keyGetter?: KeyGetter): boolean;

	delete(
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

			if (ctx.isFlyweight) {
				needDeleteToWatch = false;

			} else if (isSystem || isField) {
				// If property not already watched, don't force the creation of a proxy
				// eslint-disable-next-line @typescript-eslint/unbound-method
				needDeleteToWatch = isReady && Object.isFunction(Object.getOwnPropertyDescriptor(ctx, info.name)?.get);

				if (isSystem) {
					// If a component already initialized watchers of system fields,
					// we have to set these properties directly to the proxy object
					if (needDeleteToWatch) {
						ref = ctx.$systemFields;

					// Otherwise, we have to synchronize these properties between the proxy object and component instance
					} else {
						const name = chunks[0];
						sync = () => Object.delete(ctx.$systemFields, [name]);
					}

				} else {
					ref = ctx.$fields;

					// If a component doesn't already initialize watchers of fields,
					// we have to synchronize these properties between the proxy object and component instance
					if (ctx.isFunctional && unwrap(ref) === ref) {
						const name = chunks[0];
						sync = () => Object.delete(ctx, [name]);
					}
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

			ref = newRef!;
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
}

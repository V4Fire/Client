/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Async, { AsyncOpts } from 'core/async';

export default class Field {
	/**
	 * Returns a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [getter] - field getter
	 */
	getField<T = unknown>(path: string, getter?: FieldGetter): CanUndef<T>;

	/**
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 * @param [getter] - field getter
	 */
	getField<T = unknown>(path: string, obj?: Dictionary, getter?: FieldGetter): CanUndef<T>;
	getField<T = unknown>(
		path: string,
		obj: Dictionary | FieldGetter = this,
		getter?: FieldGetter
	): CanUndef<T> {
		if (!getter && Object.isFunction(obj)) {
			getter = <FieldGetter>obj;
			obj = this;
		}

		let
			// tslint:disable-next-line:no-this-assignment
			ctx: iBlock = this,
			isComponent = obj === this;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			isField = isComponent && ctx.meta.fields[chunks[0]];

		let
			res = isField ? ctx.$$data : obj;

		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			const prop = chunks[i];
			res = <Dictionary>(getter ? getter(prop, res) : res[prop]);
		}

		return <any>res;
	}

	/**
	 * Sets a new property to the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param value
	 * @param [obj]
	 */
	setField<T = unknown>(path: string, value: T, obj: Dictionary = this): T {
		let
			// tslint:disable-next-line:no-this-assignment
			ctx: iBlock = this,
			isComponent = obj === this;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			isField = isComponent && ctx.meta.fields[chunks[0]],
			isReady = !ctx.isBeforeCreate();

		let
			ref = isField ? ctx.$$data : obj;

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				const
					val = isNaN(Number(chunks[i + 1])) ? {} : [];

				if (isField && isReady) {
					ctx.$set(ref, prop, val);

				} else {
					ref[prop] = val;
				}
			}

			ref = <Dictionary>ref[prop];
		}

		if (path in ref) {
			ref[path] = value;

		} else {
			if (isField && isReady) {
				ctx.$set(ref, path, value);

			} else {
				ref[path] = value;
			}
		}

		return value;
	}

	/**
	 * Deletes a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	deleteField(path: string, obj: Dictionary = this): boolean {
		let
			// tslint:disable-next-line:no-this-assignment
			ctx: iBlock = this,
			isComponent = obj === this;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			isField = isComponent && ctx.meta.fields[chunks[0]],
			isReady = !ctx.isBeforeCreate();

		let
			test = true,
			ref = isField ? ctx.$$data : obj;

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				test = false;
				break;
			}

			ref = <Dictionary>ref[prop];
		}

		if (test) {
			if (isField && isReady) {
				ctx.$delete(ref, path);

			} else {
				delete ref[path];
			}

			return true;
		}

		return false;
	}
}

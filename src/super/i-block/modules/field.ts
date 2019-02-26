/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export interface FieldGetter<R = unknown, D = unknown> {
	(key: string, data: NonNullable<D>): R;
}

export default class Field {
	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [getter] - field getter
	 */
	get<T = unknown>(path: string, getter?: FieldGetter): CanUndef<T>;

	/**
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 * @param [getter] - field getter
	 */
	get<T = unknown>(path: string, obj?: Dictionary, getter?: FieldGetter): CanUndef<T>;
	get<T = unknown>(
		path: string,
		obj: Dictionary | FieldGetter = this.component,
		getter?: FieldGetter
	): CanUndef<T> {
		if (!getter && Object.isFunction(obj)) {
			getter = <FieldGetter>obj;
			obj = this;
		}

		let
			ctx = this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			// @ts-ignore
			isField = isComponent && ctx.meta.fields[chunks[0]];

		let
			// @ts-ignore
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
	set<T = unknown>(path: string, value: T, obj: Dictionary = this.component): T {
		let
			ctx = this.component,
			isComponent = false;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			// @ts-ignore
			isField = isComponent && ctx.meta.fields[chunks[0]],
			isReady = !ctx.lfc.isBeforeCreate();

		let
			// @ts-ignore
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
					// @ts-ignore
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
				// @ts-ignore
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
	delete(path: string, obj: Dictionary = this.component): boolean {
		let
			ctx = this.component,
			isComponent = false;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			// @ts-ignore
			isField = isComponent && ctx.meta.fields[chunks[0]],
			isReady = !ctx.lfc.isBeforeCreate();

		let
			test = true,
			// @ts-ignore
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
				// @ts-ignore
				ctx.$delete(ref, path);

			} else {
				delete ref[path];
			}

			return true;
		}

		return false;
	}
}

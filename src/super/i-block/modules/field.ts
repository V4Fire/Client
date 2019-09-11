/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { getFieldInfo } from 'core/component';

export interface FieldGetter<R = unknown, D = unknown> {
	(key: string, data: NonNullable<D>): R;
}

export default class Field {
	/**
	 * Component instance
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
	get<T = unknown>(path: string, obj?: object, getter?: FieldGetter): CanUndef<T>;
	get<T = unknown>(
		path: string,
		obj: object | FieldGetter = this.component,
		getter?: FieldGetter
	): CanUndef<T> {
		if (!getter && Object.isFunction(obj)) {
			getter = <FieldGetter>obj;
			obj = this;
		}

		if (!obj) {
			return;
		}

		let
			ctx = this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		let
			isField = isComponent,
			res = obj,
			chunks;

		if (isComponent) {
			const
				info = getFieldInfo(path, ctx);

			// @ts-ignore
			ctx = info.ctx;
			isField = info.type === 'field';

			// @ts-ignore (access)
			res = isField ? ctx.$$data : ctx;
			chunks = info.path.split('.');

			if (isField && ctx.lfc.isBeforeCreate() || !(chunks[0] in res)) {
				chunks[0] = info.name;
			}

		} else {
			chunks = path.split('.');
		}

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
	set<T = unknown>(path: string, value: T, obj: object = this.component): T {
		if (!obj) {
			return value;
		}

		let
			ctx = this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			isReady = !ctx.lfc.isBeforeCreate();

		let
			isField = isComponent,
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getFieldInfo(path, ctx);

			// @ts-ignore
			ctx = info.ctx;
			isField = info.type === 'field';

			// @ts-ignore (access)
			ref = isField ? ctx.$$data : ctx;
			chunks = info.path.split('.');

			if (isField && !isReady || !(chunks[0] in ref)) {
				chunks[0] = info.name;
			}

		} else {
			chunks = path.split('.');
		}

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (i + 1 === chunks.length) {
				path = prop;
				break;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				const
					val = isNaN(Number(chunks[i + 1])) ? {} : [];

				if (isField && isReady) {
					// @ts-ignore (access)
					ctx.$set(ref, prop, val);

				} else {
					ref[prop] = val;
				}
			}

			ref = <Dictionary>ref[prop];
		}

		if (!isField || !isReady || path in ref && !Object.isArray(ref)) {
			ref[path] = value;

		} else {
			// @ts-ignore (access)
			ctx.$set(ref, path, value);
		}

		return value;
	}

	/**
	 * Deletes a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	delete(path: string, obj: object = this.component): boolean {
		if (!obj) {
			return false;
		}

		let
			ctx = this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			isReady = !ctx.lfc.isBeforeCreate();

		let
			isField = isComponent,
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getFieldInfo(path, ctx);

			// @ts-ignore
			ctx = info.ctx;
			isField = info.type === 'field';

			// @ts-ignore (access)
			ref = isField ? ctx.$$data : ctx;
			chunks = info.path.split('.');
			chunks[0] = info.name;

		} else {
			chunks = path.split('.');
		}

		let
			test = true;

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (i + 1 === chunks.length) {
				path = prop;
				break;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				test = false;
				break;
			}

			ref = <Dictionary>ref[prop];
		}

		if (test) {
			if (isField && isReady) {
				// @ts-ignore (access)
				ctx.$delete(ref, path);

			} else {
				delete ref[path];
			}

			return true;
		}

		return false;
	}
}

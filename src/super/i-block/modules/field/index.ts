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

import { FieldGetter } from 'super/i-block/modules/field/interface';
export * from 'super/i-block/modules/field/interface';

/**
 * Class that provides helper methods to safety access to a component property
 */
export default class Field<C extends iBlock = iBlock> extends Friend<C> {
	/**
	 * Returns a property from a component by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [getter] - field getter
	 */
	get<T = unknown>(path: string, getter?: FieldGetter): CanUndef<T>;

	/**
	 * Returns a property from an object by the specified path
	 *
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
		if (Object.isFunction(obj)) {
			getter = obj;
			obj = this;
		}

		if (!obj) {
			return;
		}

		let
			ctx = <iBlock['unsafe']>this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = (<iBlock>obj).unsafe;
			isComponent = true;
		}

		let
			res = obj,
			chunks;

		if (isComponent) {
			const
				info = getPropertyInfo(path, ctx);

			ctx = res = <any>info.ctx;
			chunks = info.path.split('.');

			if (info.accessor && this.component.hook !== 'beforeRuntime') {
				chunks[0] = info.accessor;

			} else {
				const isField = info.type === 'field';
				res = isField ? ctx.$fields : ctx;

				if ((isField && ctx.lfc.isBeforeCreate() || !(chunks[0] in res))) {
					chunks[0] = info.name;
				}
			}

		} else {
			chunks = path.split('.');
		}

		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			const prop = chunks[i];
			res = getter ? getter(prop, res) : res[prop];
		}

		return <any>res;
	}

	/**
	 * Sets a new property to an object by the specified path
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
			ctx = <iBlock['unsafe']>this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = (<iBlock>obj).unsafe;
			isComponent = true;
		}

		let
			isField = isComponent,
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getPropertyInfo(path, ctx),
				isReady = !ctx.lfc.isBeforeCreate();

			ctx = ref = <any>info.ctx;
			chunks = info.path.split('.');

			if (info.accessor && this.component.hook !== 'beforeRuntime') {
				isField = false;
				chunks[0] = info.accessor;

			} else {
				isField = info.type === 'field';
				ref = isField ? ctx.$fields : ctx;

				if ((isField && !isReady || !(chunks[0] in ref))) {
					chunks[0] = info.name;
				}
			}

		} else {
			chunks = path.split('.');
		}

		const
			isReady = !ctx.lfc.isBeforeCreate();

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
			ctx.$set(ref, path, value);
		}

		return value;
	}

	/**
	 * Deletes a property from an object by the specified path
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	delete(path: string, obj: object = this.component): boolean {
		if (!obj) {
			return false;
		}

		let
			ctx = <iBlock['unsafe']>this.component,
			isComponent = false;

		if ((<Dictionary>obj).instance instanceof iBlock) {
			ctx = (<iBlock>obj).unsafe;
			isComponent = true;
		}

		let
			isField = isComponent,
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getPropertyInfo(path, ctx);

			ctx = <any>info.ctx;
			isField = info.type === 'field';
			ref = isField ? ctx.$fields : ctx;
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
			if (isField && !ctx.lfc.isBeforeCreate()) {
				ctx.$delete(ref, path);

			} else {
				delete ref[path];
			}

			return true;
		}

		return false;
	}
}

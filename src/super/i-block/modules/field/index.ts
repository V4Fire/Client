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
 * Class provides helper methods to safety access to a component property
 */
export default class Field extends Friend {
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
	get<T = unknown>(
		path: string,
		obj?: Nullable<object>,
		getter?: FieldGetter
	): CanUndef<T>;

	get<T = unknown>(
		path: string,
		obj: Nullable<object | FieldGetter> = this.ctx,
		getter?: FieldGetter
	): CanUndef<T> {
		if (Object.isFunction(obj)) {
			getter = obj;
			obj = this;
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

		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			const prop = chunks[i];
			res = getter ? getter(prop, res) : (<Dictionary>res)[prop];
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
	set<T = unknown>(path: string, value: T, obj: Nullable<object> = this.ctx): T {
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
			isField = isComponent,
			ref = obj,
			chunks;

		if (isComponent) {
			const
				info = getPropertyInfo(path, ctx),
				isReady = !ctx.lfc.isBeforeCreate();

			ctx = <any>info.ctx;
			ref = ctx;

			chunks = info.path.split('.');

			if (info.accessor != null && this.ctx.hook !== 'beforeRuntime') {
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

			if (ref[prop] == null || typeof ref[prop] !== 'object') {
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
	delete(path: string, obj: Nullable<object> = this.ctx): boolean {
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

			if (ref[prop] == null || typeof ref[prop] !== 'object') {
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

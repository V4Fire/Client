/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { Statuses, iBlockDecorator } from 'super/i-block/i-block';
import { statuses } from 'super/i-block/modules/const';

import { AsyncOpts } from 'core/async';
import { WatchOptions } from 'vue';
import { initEvent, ModVal, InitFieldFn as BaseInitFieldFn } from 'core/component';

import {

	ComponentMethod,
	ComponentAccessor,
	MethodWatchers,

	p as pDecorator,
	prop as propDecorator,
	field as fieldDecorator,
	system as systemDecorator,
	watch as watchDecorator,

	FieldWatcher as BaseFieldWatcher,
	ComponentProp as BaseComponentProp,
	ComponentField as BaseComponentField

} from 'core/component/decorators/base';

export interface InitFieldFn<T extends iBlock = iBlockDecorator> extends BaseInitFieldFn<T> {}

export type FieldWatcher<
	T extends iBlock = iBlockDecorator,
	A = any,
	B = A
> = BaseFieldWatcher<T, A, B>;

export interface ComponentProp<
	T extends iBlock = iBlockDecorator,
	A = any,
	B = A
> extends BaseComponentProp<T, A, B> {}

export interface ComponentField<
	T extends iBlock = iBlockDecorator,
	A = any,
	B = A
> extends BaseComponentField<T, A, B> {}

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const p = pDecorator as (params?: ComponentProp | ComponentField | ComponentMethod | ComponentAccessor) =>
	Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const prop = propDecorator as (params?: Function | ObjectConstructor | ComponentProp) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const field = fieldDecorator as (params?: InitFieldFn | ComponentField) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const system = systemDecorator as (params?: InitFieldFn | ComponentField) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const watch = watchDecorator as (params?: FieldWatcher | MethodWatchers) => Function;

/**
 * Binds a modifier to the specified parameter
 *
 * @decorator
 * @param param
 * @param [converter] - converter function
 * @param [opts] - watch options
 */
export function bindModTo<T extends iBlock = iBlockDecorator>(
	param: string,
	converter: ((value: any, ctx: T) => any) | WatchOptions = Boolean,
	opts?: WatchOptions
): Function {
	return (target, key) => {
		initEvent.once('constructor', ({meta}) => {
			meta.hooks.created.push({
				fn(this: iBlockDecorator): void {
					this.bindModTo<T>(key, param, converter, opts);
				}
			});
		});
	};
}

type EventType = 'on' | 'once';

/**
 * Decorates a method as a modifier handler
 *
 * @decorator
 * @param name
 * @param [value]
 * @param [method]
 */
export function mod(name: string, value: ModVal = '*', method: EventType = 'on'): Function {
	return (target, key, descriptor) => {
		initEvent.once('constructor', ({meta}) => {
			meta.hooks.beforeCreate.push({
				fn(this: iBlockDecorator): void {
					this.localEvent[method](`block.mod.set.${name}.${value}`, descriptor.value.bind(this));
				}
			});
		});
	};
}

/**
 * Decorates a method as a remove modifier handler
 *
 * @decorator
 * @param name
 * @param [value]
 * @param [method]
 */
export function removeMod(name: string, value: ModVal = '*', method: EventType = 'on'): Function {
	return (target, key, descriptor) => {
		initEvent.once('constructor', ({meta}) => {
			meta.hooks.beforeCreate.push({
				fn(this: iBlockDecorator): void {
					this.localEvent[method](`block.mod.remove.${name}.${value}`, descriptor.value.bind(this));
				}
			});
		});
	};
}

/**
 * Decorates a method as an element modifier handler
 *
 * @decorator
 * @param elName
 * @param modName
 * @param [value]
 * @param [method]
 */
export function elMod(elName: string, modName: string, value: ModVal = '*', method: EventType = 'on'): Function {
	return (target, key, descriptor) => {
		initEvent.once('constructor', ({meta}) => {
			meta.hooks.beforeCreate.push({
				fn(this: iBlockDecorator): void {
					this.localEvent[method](`el.mod.set.${elName}.${modName}.${value}`, descriptor.value.bind(this));
				}
			});
		});
	};
}

/**
 * Decorates a method as an element remove modifier handler
 *
 * @decorator
 * @param elName
 * @param modName
 * @param [value]
 * @param [method]
 */
export function removeElMod(elName: string, modName: string, value: ModVal = '*', method: EventType = 'on'): Function {
	return (target, key, descriptor) => {
		initEvent.once('constructor', ({meta}) => {
			meta.hooks.beforeCreate.push({
				fn(this: iBlockDecorator): void {
					this.localEvent[method](`el.mod.remove.${elName}.${modName}.${value}`, descriptor.value.bind(this));
				}
			});
		});
	};
}

export interface WaitOpts extends AsyncOpts {
	fn?: Function;
	defer?: boolean | number;
}

const
	waitCtxRgxp = /([^:]+):(\w+)/;

export function wait(params: WaitOpts): Function;
export function wait(status: number | string | Statuses, params?: WaitOpts | Function): Function;

/**
 * Decorates a method or a function for using with the specified init status
 *
 * @see Async.wait
 * @decorator
 * @param status
 * @param [params] - additional parameters:
 *   *) [params.fn] - callback function
 *   *) [params.defer] - if true, then the function will always return a promise
 */
export function wait<T = any>(status: number | string | Statuses | WaitOpts, params?: WaitOpts | Function): Function {
	let
		ctx;

	if (Object.isObject(status)) {
		params = <WaitOpts>status;
		status = 0;

	} else if (Object.isString(status)) {
		if (waitCtxRgxp.test(status)) {
			ctx = RegExp.$1;
			status = RegExp.$2;
		}

		status = statuses[status];
	}

	// tslint:disable:prefer-const

	let {
		join,
		label,
		group,
		defer,
		fn
	} = params && typeof params !== 'function' ? params : <Dictionary>{};

	// tslint:enable:prefer-const

	let
		handler = <Function>(fn || params);

	const
		isDecorator = !Object.isFunction(handler);

	function wrapper(this: iBlockDecorator): CanPromise<T> | undefined {
		const
			getRoot = () => ctx ? this.getField(ctx) : this,
			root = getRoot(),
			args = arguments;

		if (join === undefined) {
			join = handler.length ? 'replace' : true;
		}

		const
			{async: $a} = this,
			p = {join, label, group};

		const exec = (ctx) => {
			const
				// @ts-ignore
				componentStatus = <number>statuses[this.getField('componentStatusStore', ctx)];

			let
				res,
				init;

			if (componentStatus < 0 && status > componentStatus) {
				throw Object.assign(new Error('Component status watcher abort'), {
					type: 'abort'
				});
			}

			if (componentStatus >= status) {
				init = true;

				if (defer) {
					res = $a.promise(
						(async () => {
							await $a.nextTick();
							return handler.apply(this, args);
						})(),

						p
					);

				} else {
					res = handler.apply(this, args);
				}
			}

			if (!init) {
				res = $a.promise(
					new Promise((resolve) => {
						$a.once(ctx.localEvent, `component.status.${statuses[<number>status]}`, () => {
							resolve(handler.apply(this, args));
						});
					}),

					p
				);
			}

			if (isDecorator && Object.isPromise(res)) {
				return res.catch(stderr);
			}

			return res;
		};

		if (root) {
			return exec(root);
		}

		const
			res = $a.promise($a.wait(getRoot)).then(() => exec(getRoot()));

		if (isDecorator) {
			return res.catch(stderr);
		}

		return res;
	}

	if (isDecorator) {
		return <any>((target, key, descriptors) => {
			handler = descriptors.value;
			descriptors.value = wrapper;
		});
	}

	return wrapper;
}

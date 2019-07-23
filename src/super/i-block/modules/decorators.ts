/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOpts } from 'core/async';
import { statuses } from 'super/i-block/modules/const';
import { Statuses, iBlockDecorator } from 'super/i-block/i-block';
import { initEvent, ModVal, InitFieldFn as BaseInitFieldFn, ComponentInterface } from 'core/component';
import { WatchOptions } from 'core/component/engines';

import {

	ComponentMethod,
	ComponentAccessor,

	p as pDecorator,
	prop as propDecorator,
	field as fieldDecorator,
	system as systemDecorator,
	watch as watchDecorator,

	MethodWatchers as BaseMethodWatchers,
	FieldWatcher as BaseFieldWatcher,
	ComponentProp as BaseComponentProp,
	ComponentField as BaseComponentField

} from 'core/component/decorators/base';

export interface InitFieldFn<
	CTX extends ComponentInterface = ComponentInterface
> extends BaseInitFieldFn<CTX & iBlockDecorator> {}

export type MethodWatchers<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> = BaseMethodWatchers<CTX & iBlockDecorator, A, B>;

export type FieldWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> = BaseFieldWatcher<CTX & iBlockDecorator, A, B>;

export interface ComponentProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends BaseComponentProp<CTX & iBlockDecorator, A, B> {}

export interface ComponentField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends BaseComponentField<CTX & iBlockDecorator, A, B> {}

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const p = pDecorator as <CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A>(
	params?: ComponentProp<CTX, A, B> | ComponentField<CTX, A, B> | ComponentMethod<CTX, A, B> | ComponentAccessor
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const prop = propDecorator as <CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A>(
	params?: CanArray<Function> | ObjectConstructor | ComponentProp<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const field = fieldDecorator as <CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A>(
	params?: InitFieldFn<CTX> | ComponentField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const system = systemDecorator as <CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A>(
	params?: InitFieldFn<CTX> | ComponentField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const watch = watchDecorator as <CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A>(
	params?: FieldWatcher<CTX, A, B> | MethodWatchers<CTX, A, B>
) => Function;

export type BindModCb<V = unknown, R = unknown, CTX extends ComponentInterface = ComponentInterface> =
	((value: V, ctx: CTX) => R) | Function;

export type DecoratorCtx<CTX> = {component: CTX} | CTX;

/**
 * Returns a component instance from a decorator wrapper
 * @param val
 */
export function getComponentCtx<CTX>(val: DecoratorCtx<CTX>): CTX {
	// @ts-ignore
	return val.component || val;
}

/**
 * Binds a modifier to the specified parameter
 *
 * @decorator
 * @param param
 * @param [converter] - converter function
 * @param [opts] - watch options
 */
export function bindModTo<V = unknown, R = unknown, CTX extends ComponentInterface = ComponentInterface>(
	param: string,
	converter: BindModCb | WatchOptions = Boolean,
	opts?: WatchOptions
): Function {
	return (target, key) => {
		initEvent.once('bindConstructor', (componentName) => {
			initEvent.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.created.push({
					fn(this: DecoratorCtx<CTX & iBlockDecorator>): void {
						getComponentCtx(this).sync.mod(key, param, converter, opts);
					}
				});
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
export function mod<CTX extends ComponentInterface = ComponentInterface>(
	name: string,
	value: ModVal = '*',
	method: EventType = 'on'
): Function {
	return (target, key, descriptor) => {
		initEvent.once('bindConstructor', (componentName) => {
			initEvent.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: DecoratorCtx<CTX & iBlockDecorator>): void {
						const c = getComponentCtx(this);
						c.localEvent[method](`block.mod.set.${name}.${value}`, descriptor.value.bind(c));
					}
				});
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
export function removeMod<CTX extends ComponentInterface = ComponentInterface>(
	name: string,
	value: ModVal = '*',
	method: EventType = 'on'
): Function {
	return (target, key, descriptor) => {
		initEvent.once('bindConstructor', (componentName) => {
			initEvent.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: DecoratorCtx<CTX & iBlockDecorator>): void {
						const c = getComponentCtx(this);
						c.localEvent[method](`block.mod.remove.${name}.${value}`, descriptor.value.bind(c));
					}
				});
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
export function elMod<CTX extends ComponentInterface = ComponentInterface>(
	elName: string,
	modName: string,
	value: ModVal = '*',
	method: EventType = 'on'
): Function {
	return (target, key, descriptor) => {
		initEvent.once('bindConstructor', (componentName) => {
			initEvent.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: DecoratorCtx<CTX & iBlockDecorator>): void {
						const c = getComponentCtx(this);
						c.localEvent[method](`el.mod.set.${elName}.${modName}.${value}`, descriptor.value.bind(c));
					}
				});
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
export function removeElMod<CTX extends ComponentInterface = ComponentInterface>(
	elName: string,
	modName: string,
	value: ModVal = '*',
	method: EventType = 'on'
): Function {
	return (target, key, descriptor) => {
		initEvent.once('bindConstructor', (componentName) => {
			initEvent.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: DecoratorCtx<CTX & iBlockDecorator>): void {
						const c = getComponentCtx(this);
						c.localEvent[method](`el.mod.remove.${elName}.${modName}.${value}`, descriptor.value.bind(c));
					}
				});
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

/**
 * Decorates a method or a function for using with the specified init status
 *
 * @see Async.wait
 * @decorator
 * @param params - additional parameters:
 *   *) [params.fn] - callback function
 *   *) [params.defer] - if true, then the function will always return a promise
 */
export function wait(params: WaitOpts): Function;

/**
 * @see Async.wait
 * @decorator
 * @param status
 * @param [params]
 */
// tslint:disable-next-line:completed-docs
export function wait(status: number | string | Statuses, params?: WaitOpts | Function): Function;
// tslint:disable-next-line:completed-docs
export function wait<CTX extends ComponentInterface = ComponentInterface>(
	status: number | string | Statuses | WaitOpts,
	params?: WaitOpts | Function
): Function {
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
	} = params && !Object.isFunction(params) ? params : <WaitOpts>{};

	// tslint:enable:prefer-const

	let
		handler = <Function>(fn || params);

	const
		isDecorator = !Object.isFunction(handler);

	function wrapper(this: DecoratorCtx<CTX & iBlockDecorator>): CanUndef<CanPromise<CTX>> {
		const
			component = getComponentCtx(this);

		const
			getRoot = () => ctx ? component.field.get(ctx) : component,
			root = getRoot(),
			args = arguments;

		if (join === undefined) {
			join = handler.length ? 'replace' : true;
		}

		const
			{async: $a} = component,
			p = {join, label, group};

		const exec = (ctx) => {
			const
				// @ts-ignore
				componentStatus = <number>statuses[component.field.get('componentStatusStore', ctx)];

			let
				res,
				init;

			if (componentStatus < 0 && status > componentStatus) {
				throw Object.assign(new Error('Component status watcher abort'), {
					type: 'abort'
				});
			}

			if (component.$isFlyweight || componentStatus >= status) {
				init = true;
				res = defer ?
					$a.promise($a.nextTick().then(() => handler.apply(this, args)), p) :
					handler.apply(this, args);
			}

			if (!init) {
				res = $a.promisifyOnce(ctx, `status-${statuses[<number>status]}`, {
					...p,
					handler: () => handler.apply(this, args)
				});
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
		return ((target, key, descriptors) => {
			handler = descriptors.value;
			descriptors.value = wrapper;
		});
	}

	return wrapper;
}

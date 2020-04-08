/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initEmitter, ModVal } from 'core/component';

import {

	DecoratorMethod,
	DecoratorComponentAccessor,

	p as pDecorator,
	prop as propDecorator,
	field as fieldDecorator,
	system as systemDecorator,
	watch as watchDecorator

} from 'core/component/decorators';

import iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/const';
import { waitCtxRgxp } from 'super/i-block/modules/decorators/const';

import {

	ComponentProp,
	ComponentField,
	InitFieldFn,

	FieldWatcher,
	MethodWatchers,

	WaitOptions,
	WaitStatuses,

	ModEventType,
	DecoratorCtx

} from 'super/i-block/modules/decorators/interface';

export * from 'super/i-block/modules/decorators/interface';

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const p = pDecorator as <CTX extends iBlock['unsafe'] = iBlock['unsafe'], A = unknown, B = A>(
	params?: ComponentProp<CTX, A, B> | ComponentField<CTX, A, B> | DecoratorMethod<CTX, A, B> | DecoratorComponentAccessor
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const prop = propDecorator as <CTX extends iBlock['unsafe'] = iBlock['unsafe'], A = unknown, B = A>(
	params?: CanArray<Function> | ObjectConstructor | ComponentProp<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const field = fieldDecorator as <CTX extends iBlock['unsafe'] = iBlock['unsafe'], A = unknown, B = A>(
	params?: InitFieldFn<CTX> | ComponentField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const system = systemDecorator as <CTX extends iBlock['unsafe'] = iBlock['unsafe'], A = unknown, B = A>(
	params?: InitFieldFn<CTX> | ComponentField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const watch = watchDecorator as <CTX extends iBlock['unsafe'] = iBlock['unsafe'], A = unknown, B = A>(
	params?: FieldWatcher<CTX, A, B> | MethodWatchers<CTX, A, B>
) => Function;

/**
 * Returns a component instance from the specified decorator wrapper
 * @param wrapper
 */
export function getComponentCtx<CTX>(wrapper: DecoratorCtx<CTX>): CTX {
	// @ts-ignore
	return wrapper.component || wrapper;
}

/**
 * Decorates a method as a modifier handler
 *
 * @decorator
 * @param name - modifier name to listen
 * @param [value] - modifier value to listen
 * @param [method] - event method
 */
export function mod<CTX extends iBlock['unsafe'] = iBlock['unsafe']>(
	name: string,
	value: ModVal = '*',
	method: ModEventType = 'on'
): Function {
	return (target, key, descriptor) => {
		initEmitter.once('bindConstructor', (componentName) => {
			initEmitter.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: DecoratorCtx<CTX>): void {
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
 * @param name - modifier name to listen
 * @param [value] - modifier value to listen
 * @param [method] - event method
 */
export function removeMod<CTX extends iBlock['unsafe'] = iBlock['unsafe']>(
	name: string,
	value: ModVal = '*',
	method: ModEventType = 'on'
): Function {
	return (target, key, descriptor) => {
		initEmitter.once('bindConstructor', (componentName) => {
			initEmitter.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: DecoratorCtx<CTX>): void {
						const c = getComponentCtx(this);
						c.localEvent[method](`block.mod.remove.${name}.${value}`, descriptor.value.bind(c));
					}
				});
			});
		});
	};
}

/**
 * Decorates a method or a function to use with the specified initialize status
 *
 * @see [[Async.wait]]
 * @decorator
 *
 * @param opts - additional options
 */
export function wait(opts: WaitOptions): Function;

/**
 * Decorates a method or a function to use with the specified initialize status
 *
 * @see [[Async.wait]]
 * @decorator
 *
 * @param status - status to wait
 * @param [opts] - additional options
 */
// tslint:disable-next-line:completed-docs
export function wait(status: WaitStatuses, opts?: WaitOptions | Function): Function;
export function wait<CTX extends iBlock['unsafe'] = iBlock['unsafe']>(
	status: WaitStatuses | WaitOptions,
	opts?: WaitOptions | Function
): Function {
	let
		ctx;

	if (Object.isPlainObject(status)) {
		opts = <WaitOptions>status;
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
	} = opts && !Object.isFunction(opts) ? opts : <WaitOptions>{};

	// tslint:enable:prefer-const

	let
		handler = <Function>(fn || opts);

	const
		isDecorator = !Object.isFunction(handler);

	function wrapper(this: DecoratorCtx<CTX>): CanUndef<CanPromise<CTX>> {
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
				componentStatus = statuses[component.componentStatus];

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

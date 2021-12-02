/* eslint-disable @typescript-eslint/consistent-type-assertions */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/decorators/README.md]]
 * @packageDocumentation
 */

import type { ProxyCb } from '~/core/async';
import { initEmitter, ModVal } from '~/core/component';

import {

	p as pDecorator,
	prop as propDecorator,
	field as fieldDecorator,
	system as systemDecorator,
	watch as watchDecorator,

	DecoratorMethod,
	DecoratorComponentAccessor

} from '~/core/component/decorators';

import type iBlock from '~/super/i-block/i-block';

import { statuses } from '~/super/i-block/const';
import { waitCtxRgxp } from '~/super/i-block/modules/decorators/const';

import type {

	DecoratorProp,
	DecoratorField,
	InitFieldFn,

	DecoratorFieldWatcher,
	DecoratorMethodWatcher,

	WaitStatuses,
	WaitDecoratorOptions,
	WaitOptions,

	DecoratorEventListenerMethod

} from '~/super/i-block/modules/decorators/interface';

export { hook, computed } from '~/core/component/decorators';
export * from '~/super/i-block/modules/decorators/interface';

/**
 * @see core/component/decorators/base.ts
 * @inheritDoc
 */
export const p = pDecorator as <CTX = iBlock, A = unknown, B = A>(
	params?:
		// @ts-ignore (unsafe cast)
		DecoratorProp<CTX, A, B> | DecoratorField<CTX, A, B> | DecoratorMethod<CTX, A, B> | DecoratorComponentAccessor
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @inheritDoc
 */
export const prop = propDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: CanArray<FunctionConstructor | Function> | ObjectConstructor | DecoratorProp<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @inheritDoc
 */
export const field = fieldDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: InitFieldFn<CTX> | DecoratorField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @inheritDoc
 */
export const system = systemDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: InitFieldFn<CTX> | DecoratorField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/base.ts
 * @inheritDoc
 */
export const watch = watchDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: DecoratorFieldWatcher<CTX, A, B> | DecoratorMethodWatcher<CTX, A, B>
) => Function;

/**
 * Decorates a method as a modifier handler
 *
 * @decorator
 * @param name - modifier name to listen
 * @param [value] - modifier value to listen
 * @param [method] - event method
 */
export function mod(
	name: string,
	value: ModVal = '*',
	method: DecoratorEventListenerMethod = 'on'
): Function {
	return (target, key, descriptor) => {
		initEmitter.once('bindConstructor', (componentName) => {
			initEmitter.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: iBlock['unsafe']): void {
						this.localEmitter[method](`block.mod.set.${name}.${value}`, descriptor.value.bind(this));
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
export function removeMod(
	name: string,
	value: ModVal = '*',
	method: DecoratorEventListenerMethod = 'on'
): Function {
	return (target, key, descriptor) => {
		initEmitter.once('bindConstructor', (componentName) => {
			initEmitter.once(`constructor.${componentName}`, ({meta}) => {
				meta.hooks.beforeCreate.push({
					fn(this: iBlock['unsafe']): void {
						this.localEmitter[method](`block.mod.remove.${name}.${value}`, descriptor.value.bind(this));
					}
				});
			});
		});
	};
}

/**
 * Decorates a method to wait
 *
 * @see [[Async.wait]]
 * @decorator
 *
 * @param opts - additional options
 */
export function wait(opts: WaitDecoratorOptions): Function;

/**
 * Wraps the specified function to wait a component status
 *
 * @see [[Async.wait]]
 * @param opts - additional options
 */
export function wait<F extends AnyFunction>(
	opts: WaitOptions<F>
): ProxyCb<Parameters<F>, CanPromise<ReturnType<F>>, iBlock>;

/**
 * Decorates a method to wait the specified component status
 *
 * @see [[Async.wait]]
 * @decorator
 *
 * @param status
 * @param [opts] - additional options
 */
export function wait(status: WaitStatuses, opts?: WaitDecoratorOptions): Function;

/**
 * Wraps the specified function to wait a component status
 *
 * @see [[Async.wait]]
 * @param status
 * @param fnOrOpts - function to wrap or additional options
 */
export function wait<F extends AnyFunction>(
	status: WaitStatuses,
	fnOrOpts: F | WaitOptions<F>
): ProxyCb<Parameters<F>, CanPromise<ReturnType<F>>, iBlock>;

export function wait(
	statusOrOpts: WaitStatuses | WaitDecoratorOptions | WaitOptions,
	optsOrCb?: WaitDecoratorOptions | WaitOptions | Function
): Function {
	let
		status: WaitStatuses,
		opts: CanUndef<WaitDecoratorOptions | WaitOptions>,
		handler,
		ctx;

	if (Object.isFunction(optsOrCb)) {
		if (Object.isString(statusOrOpts)) {
			if (RegExp.test(waitCtxRgxp, statusOrOpts)) {
				ctx = RegExp.$1;
				status = statuses[RegExp.$2];

			} else {
				status = statuses[statusOrOpts];
			}

		} else {
			status = 0;

			if (Object.isPlainObject(statusOrOpts)) {
				opts = statusOrOpts;
			}
		}

		handler = optsOrCb;

	} else if (Object.isString(statusOrOpts)) {
		if (RegExp.test(waitCtxRgxp, statusOrOpts)) {
			ctx = RegExp.$1;
			status = statuses[RegExp.$2];

		} else {
			status = statuses[statusOrOpts];
		}

		if (Object.isPlainObject(optsOrCb)) {
			opts = <typeof opts>optsOrCb;
			handler = Object.get(opts, 'fn');
		}

	} else {
		status = 0;

		if (Object.isPlainObject(statusOrOpts)) {
			opts = statusOrOpts;
			handler = Object.get(opts, 'fn');
		}
	}

	opts ??= {};

	let {
		join,
		label,
		group,
		defer
	} = opts;

	const
		isDecorator = !Object.isFunction(handler);

	function wrapper(this: iBlock['unsafe'], ...args: unknown[]): CanUndef<CanPromise<unknown>> {
		const
			getRoot = () => ctx != null ? this.field.get(ctx) : this,
			root = getRoot();

		if (join === undefined) {
			join = handler.length > 0 ? 'replace' : true;
		}

		const
			{async: $a} = this,
			p = {join, label, group};

		const exec = (ctx) => {
			const
				componentStatus = Number(statuses[this.componentStatus]);

			let
				res,
				init = false;

			if (componentStatus < 0 && status > componentStatus) {
				throw Object.assign(new Error('Component status watcher abort'), {
					type: 'abort'
				});
			}

			if (this.isFlyweight || componentStatus >= status) {
				init = true;
				res = Object.isTruly(defer) ?
					$a.promise($a.nextTick().then(() => handler.apply(this, args)), p) :
					handler.apply(this, args);
			}

			if (!init) {
				res = $a.promisifyOnce(ctx, `componentStatus:${statuses[status]}`, {
					...p,
					handler: () => handler.apply(this, args)
				});
			}

			if (isDecorator && Object.isPromise(res)) {
				return res.catch(stderr);
			}

			return res;
		};

		if (root != null) {
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

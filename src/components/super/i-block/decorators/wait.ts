/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type { ProxyCb } from 'core/async';

import type iBlock from 'components/super/i-block/i-block';
import { statuses } from 'components/super/i-block/const';

import type { WaitStatuses, WaitDecoratorOptions, WaitOptions } from 'components/super/i-block/decorators/interface';

const
	waitCtxRgxp = /([^:]+):(\w+)/;

/**
 * Decorates the method so that when it is called, it does not execute immediately, but waits for the next tick.
 * The wrapped method returns a promise that will resolve with the result of the original method.
 *
 * {@link Async.wait}
 *
 * @decorator
 *
 * @param opts - additional options
 *
 * @example
 * ```typescript
 * import iBlock, { component, wait } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @wait({defer: true}})
 *   doSomething() {
 *     // ...
 *     return 42;
 *   }
 * ```
 */
export function wait(opts: {defer: true} & WaitDecoratorOptions): Function;

/**
 * Decorates the function so that when it is called, it does not execute immediately, but waits for the next tick.
 * The wrapped function returns a promise that will resolve with the result of the original method.
 *
 * {@link Async.wait}
 *
 * @param opts - additional options
 *
 * @example
 * ```typescript
 * import { wait } from 'components/super/i-block/i-block';
 *
 * const deferredFn = wait({defer: true, fn: () => {
 *   // ...
 *   return 42;
 * }});
 *
 * deferredFn().then(console.log);
 * ```
 */
export function wait<F extends AnyFunction>(
	opts: {defer: true} & WaitOptions<F>
): ProxyCb<Parameters<F>, CanPromise<ReturnType<F>>, iBlock>;

/**
 * Decorates the method so that when it is called, it expects its component to have the given `componentStatus`.
 * If the component is already in this state or higher, then the original method will execute immediately and return
 * the result. If not, then the wrapped method returns a promise that will resolve with the result of the original when
 * the component enters this state.
 *
 * {@link Async.wait}
 *
 * @decorator
 *
 * @param componentStatus
 * @param [opts] - additional options
 *
 * @example
 * ```typescript
 * import iBlock, { component, wait } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @wait('ready')
 *   doSomething() {
 *     // ...
 *     return 42;
 *   }
 * ```
 */
export function wait(componentStatus: WaitStatuses, opts?: WaitDecoratorOptions): Function;

/**
 * Decorates the function so that when it is called, it expects its component to have the given `componentStatus`.
 * If the component is already in this state or higher, then the original function will execute immediately and return
 * the result. If not, then the wrapped function returns a promise that will resolve with the result of the original
 * when the component enters this state.
 *
 * {@link Async.wait}
 *
 * @param componentStatus
 * @param fnOrOpts - function to wrap or additional options
 */
export function wait<F extends AnyFunction>(
	componentStatus: WaitStatuses,
	fnOrOpts: F | WaitOptions<F>
): ProxyCb<Parameters<F>, CanPromise<ReturnType<F>>, iBlock>;

export function wait(
	componentStatusOrOpts: WaitStatuses | WaitDecoratorOptions | WaitOptions,
	optsOrCb?: WaitDecoratorOptions | WaitOptions | Function
): Function {
	let
		status: WaitStatuses,
		opts: CanUndef<WaitDecoratorOptions | WaitOptions>;

	let
		handler,
		ctx;

	if (Object.isFunction(optsOrCb)) {
		if (Object.isString(componentStatusOrOpts)) {
			if (RegExp.test(waitCtxRgxp, componentStatusOrOpts)) {
				ctx = RegExp.$1;
				status = statuses[RegExp.$2];

			} else {
				status = statuses[componentStatusOrOpts];
			}

		} else {
			status = 0;

			if (Object.isPlainObject(componentStatusOrOpts)) {
				opts = componentStatusOrOpts;
			}
		}

		handler = optsOrCb;

	} else if (Object.isString(componentStatusOrOpts)) {
		if (RegExp.test(waitCtxRgxp, componentStatusOrOpts)) {
			ctx = RegExp.$1;
			status = statuses[RegExp.$2];

		} else {
			status = statuses[componentStatusOrOpts];
		}

		if (Object.isPlainObject(optsOrCb)) {
			opts = <typeof opts>optsOrCb;
			handler = opts!['fn'];
		}

	} else {
		status = 0;

		if (Object.isPlainObject(componentStatusOrOpts)) {
			opts = componentStatusOrOpts;
			handler = opts['fn'];
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
			{async: $a} = this;

		const
			getRoot = () => ctx != null ? this.field.get(ctx) : this,
			root = getRoot();

		if (join === undefined) {
			join = handler.length > 0 ? 'replace' : true;
		}

		const p = {
			join,
			label,
			group
		};

		const exec = (ctx) => {
			const
				componentStatus = Number(statuses[this.componentStatus]);

			let
				res,
				init = false;

			if (componentStatus < 0 && status > componentStatus) {
				this.log({
					context: 'watcher',
					logLevel: 'warn'
				}, 'Component status watcher abort', () => handler);

				throw Object.assign(new Error('Component status watcher abort'), {
					type: 'abort'
				});
			}

			if (componentStatus >= status) {
				init = true;

				res = defer ?
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

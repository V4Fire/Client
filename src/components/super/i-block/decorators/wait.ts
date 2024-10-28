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

const waitCtxRgxp = /([^:]+):(\w+)/;

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
 *   @wait({defer: true})
 *   doSomething() {
 *     // ...
 *     return 42;
 *   }
 * }
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
 * }
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
		ctx: CanUndef<string>,
		handler: Nullable<Function>,
		opts: CanUndef<WaitDecoratorOptions | WaitOptions>;

	if (Object.isFunction(optsOrCb)) {
		handler = optsOrCb;

	} else {
		opts = parseOptions(optsOrCb);
	}

	opts = parseOptions(componentStatusOrOpts) ?? {};

	let {join, label, group, defer} = opts;

	const
		isDecorator = !Object.isFunction(handler),
		waitStatus = parseWaitStatus(componentStatusOrOpts) ?? statuses.inactive;

	if (isDecorator) {
		return ((_target: object, _key: PropertyKey, descriptors: PropertyDescriptor) => {
			handler = descriptors.value;
			descriptors.value = wrapper;
		});
	}

	return wrapper;

	function wrapper(this: iBlock['unsafe'], ...args: unknown[]): CanUndef<CanPromise<unknown>> {
		if (handler == null) {
			throw new ReferenceError('The handler is not specified');
		}

		const {async: $a} = this;

		const
			that = this,
			resolvedHandler = handler;

		const
			getRoot = () => ctx != null ? this.field.get<iBlock['unsafe']>(ctx) : this,
			root = getRoot();

		if (join === undefined) {
			join = resolvedHandler.length > 0 ? 'replace' : true;
		}

		const p = {join, label, group};

		if (root != null) {
			return exec(root);
		}

		const res = $a.promise($a.wait(getRoot)).then(() => exec(getRoot()));

		if (isDecorator) {
			return res.catch(stderr);
		}

		return res;

		function exec(ctx: CanUndef<iBlock['unsafe']>) {
			const componentStatus = Number(statuses[that.componentStatus]);

			let
				res: unknown,
				init = false;

			if (componentStatus < 0 && waitStatus > componentStatus) {
				that.log({
					context: 'watcher',
					logLevel: 'warn'
				}, 'Component status watcher abort', () => handler);

				throw Object.assign(new Error('Component status watcher abort'), {
					type: 'abort'
				});
			}

			if (componentStatus >= waitStatus) {
				init = true;

				res = defer ?
					$a.promise($a.nextTick().then(() => resolvedHandler.apply(that, args)), p) :
					resolvedHandler.apply(that, args);
			}

			if (!init) {
				if (ctx == null) {
					throw new ReferenceError('The context is not specified');
				}

				res = $a.promisifyOnce(ctx, `componentStatus:${statuses[waitStatus]}`, {
					...p,
					handler: () => resolvedHandler.apply(that, args)
				});
			}

			if (isDecorator && Object.isPromise(res)) {
				return res.catch(stderr);
			}

			return res;
		}
	}

	function parseOptions(value: Nullable<WaitStatuses | WaitDecoratorOptions | WaitOptions | Function>) {
		if (Object.isPlainObject(value)) {
			opts ??= Object.cast(value);
			handler ??= 'fn' in value ? value.fn : null;
		}

		return opts;
	}

	function parseWaitStatus(value: WaitStatuses | object): CanUndef<number> {
		if (Object.isNumber(value)) {
			return value;
		}

		if (Object.isString(value)) {
			const test = waitCtxRgxp.exec(value);

			if (test != null) {
				ctx = test[1];
				return statuses[test[2]];
			}

			return statuses[value];
		}
	}
}

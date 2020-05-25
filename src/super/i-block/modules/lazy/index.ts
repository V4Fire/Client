/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/lazy/README.md]]
 * @packageDocumentation
 */

import { deprecated } from 'core/functools/deprecation';

import Friend from 'super/i-block/modules/friend';
import { CreateLazyFnOptions, LazyFn } from 'super/i-block/modules/lazy/interface';
export * from 'super/i-block/modules/lazy/interface';

/**
 * Class provides some methods to organize lazy calculations
 */
export default class Lazy extends Friend {
	/**
	 * Creates a new function from the specified function that executes deferredly.
	 * The new function returns a promise with a result of the original function.
	 *
	 * @deprecated
	 * @see [[Async.debounce]]
	 *
	 * @param fn
	 * @param [opts] - additional options
	 */
	@deprecated({alternative: 'Async.debounce'})
	createLazyFn<T extends (...args: unknown[]) => unknown>(fn: T, opts?: CreateLazyFnOptions): LazyFn<T> {
		const {async: $a} = this;
		return (...args) => (opts?.delay ? $a.sleep(opts.delay, opts) : $a.nextTick())
			.then(() => fn.call(this.ctx, ...args));
	}
}

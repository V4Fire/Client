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

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import { CreateLazyFnOptions, LazyFn } from 'super/i-block/modules/lazy/interface';
export * from 'super/i-block/modules/lazy/interface';

/**
 * Class that provides some methods to organize lazy calculations
 */
export default class Opt<C extends iBlock = iBlock> extends Friend<C> {
	/**
	 * Creates a new function from the specified function that executes deferredly.
	 * The new function returns a promise with a result of the original function.
	 *
	 * @see [[Async.setImmediate]]
	 * @see [[Async.setTimeout]]
	 *
	 * @param fn
	 * @param [opts] - additional options
	 */
	createLazyFn<T extends (...args: unknown[]) => unknown>(fn: T, opts?: CreateLazyFnOptions): LazyFn<T> {
		const {async: $a} = this;
		return (...args) => (opts?.delay ? $a.sleep(opts.delay, opts) : $a.nextTick())
			.then(() => fn.call(this.component, ...args));
	}
}

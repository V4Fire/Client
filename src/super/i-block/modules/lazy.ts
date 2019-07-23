/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, { AsyncOpts } from 'core/async';
import iBlock from 'super/i-block/i-block';

export default class Lazy {
	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Creates a new function from the specified that executes deferredly
	 *
	 * @see Async.setTimeout
	 * @param fn
	 * @param [params] - async parameters
	 */
	createLazyFn(fn: Function, params?: AsyncOpts): Function {
		return (...args) => this.async.setImmediate(() => fn.call(this, ...args), params);
	}
}

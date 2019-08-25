/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, { AsyncOpts } from 'core/async';
import iBlock from 'super/i-block/i-block';

export interface LazyParams extends AsyncOpts {
	delay?: number;
}

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
	 * @see Async.setImmediate
	 * @see Async.setTimeout
	 * @param fn
	 * @param [params]
	 */
	createLazyFn(fn: Function, params: LazyParams = {}): Function {
		const
			{async: $a} = this,
			{delay} = params;

		return (...args) => delay ?
			$a.setTimeout(() => fn.call(this, ...args), delay, params) :
			$a.setImmediate(() => fn.call(this, ...args), params);
	}
}

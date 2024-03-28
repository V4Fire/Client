/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface/component';

/**
 * A component constructor function
 */
export interface ComponentConstructor<T = unknown> {
	new(): T;
}

/**
 * A component root DOM element
 */
export type ComponentElement<T = ComponentInterface> = Element & {
	component?: T;
};

export interface ComponentEmitterOptions {
	/**
	 * If set to true, the handler will be added before all the other handlers
	 * @default `false`
	 */
	prepend?: boolean;

	/**
	 * A flag indicating that an unwrapped async emitter needs to be called.
	 *
	 * This flag is needed to avoid re-registering an event in the async module.
	 * This is relevant for methods like on and once on a component instance, but not relevant for $on and $once methods.
	 * The $on and $once methods must be wrapped in async.
	 */
	rawEmitter?: boolean
}

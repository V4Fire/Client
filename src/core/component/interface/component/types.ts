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
	 * A flag indicating that the handler should be added directly to the component's event emitter.
	 * Otherwise, the handler is always added to the emitter wrapped in an Async container.
	 *
	 * Why is this necessary?
	 * The thing is, there are situations when we pass the component's event emitter as
	 * a parameter to another module or component.
	 * And for safe operation with such an emitter, we use packaging in an Async container.
	 * In fact, we get double packaging in Async, since the original emitter is already packed.
	 * This flag solves this problem.
	 */
	rawEmitter?: boolean;
}

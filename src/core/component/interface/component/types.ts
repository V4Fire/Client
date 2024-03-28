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

	skipEmitterWrapping?: boolean
}

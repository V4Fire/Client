/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A component constructor function
 */
export interface ComponentConstructor<T = unknown> {
	new(): T;
}

/**
 * A component root DOM element
 */
export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A symbol to extract the raw component context
 */
export const toRaw = Symbol('A link to the raw component context');

/**
 * A cache for the wrapped component contexts
 */
export const wrappedContexts = new WeakMap();

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A unique symbol used to identify a V4Fire component
 */
export const V4_COMPONENT = Symbol('This is a V4Fire component');

/**
 * A symbol used as a flag to mark a function as a generated default wrapper
 */
export const DEFAULT_WRAPPER = Symbol('This function is the generated default wrapper');

/**
 * A placeholder object used to refer to the parent instance in a specific context
 */
export const PARENT = {};

/**
 * A symbol used for extracting the unique identifier of the asynchronous render task.
 */
export const ASYNC_RENDER_ID = Symbol('Async render task identifier');

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A flag to mark some function that it’s a generated default wrapper
 */
export const DEFAULT_WRAPPER = Symbol('This function is the generated default wrapper');

/**
 * A value to refer the parent instance
 */
export const PARENT = {};

/**
 * A symbol for extracting the unique identifier of the async render task
 */
export const ASYNC_RENDER_ID = Symbol('Async render task identifier');

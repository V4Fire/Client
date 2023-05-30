/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A RegExp to check if the given string is the name of a component
 *
 * @example
 * ```js
 * console.log(isComponent.test('b-button')); // true
 * console.log(isComponent.test('button'));   // false
 * ```
 */
export const isComponent = /^([bpg]-[^_ ]+)$/;

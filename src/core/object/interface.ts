/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SelectParams {
	/**
	 * Path to an object property
	 *
	 * @example
	 * ```js
	 * select({foo: {bar: {bla: {}}}}, {from: 'foo.bla'})
	 * ```
	 */
	from?: string | number;

	/**
	 * Object for matching or an array of objects.
	 * The array is interpreted as "or".
	 *
	 * @example
	 * ```js
	 * select({test: 2}, {where: {test: 2}}) // {test: 2}
	 * select({test: 2}, {where: [{test: 1}, {test: 2}]}) // {test: 2}
	 * ```
	 */
	where?: CanArray<Dictionary>;
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns the first value of the specified array if it length no more than 1,
 * otherwise returns the original array
 *
 * @param arr
 */
export function unpackIf(arr: unknown[]): CanArray<unknown> {
	return Object.isArray(arr) && arr.length < 2 ? arr[0] : arr;
}

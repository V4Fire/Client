/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * If the specified value is an array and if its length no greater than 1,
 * then it returns the first element of the array, otherwise it returns the entire object passed
 *
 * @param value
 */
export function unpackIf(value: CanArray<unknown>): CanArray<unknown> {
	return Object.isArray(value) && value.length < 2 ? value[0] : value;
}

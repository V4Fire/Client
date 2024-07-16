/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns a value for the `srcset` attribute, based on the passed dictionary
 *
 * @param dict - the dictionary, where keys are image queries and values are image URLs
 *
 * @example
 * ```js
 * // '/img-hdpi.png 2x, /img-xhdpi.png 3x'
 * console.log(getSrcSet({'2x': '/img-hdpi.png', '3x': '/img-xhdpi.png'}));
 * ```
 */
export function getSrcSet(dict: Dictionary<string>): string {
	return Object.entries(dict).reduce<string[]>((acc, [query, url]) => {
		acc.push(`${url} ${query}`);
		return acc;
	}, []).join(', ');
}

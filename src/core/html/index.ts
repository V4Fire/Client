/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/html/README.md]]
 * @packageDocumentation
 */

/**
 * Returns a srcset string for an image tag by the specified resolution map
 *
 * @param resolutions - map, where the key is a picture multiplier and value is a picture URL
 *
 * @example
 * ```js
 * // 'http://img-hdpi.png 2x, http://img-xhdpi.png 3x'
 * getSrcSet({'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'})
 * ```
 */
export function getSrcSet(resolutions: Dictionary<string>): string {
	let str = '';

	for (let keys = Object.keys(resolutions), i = 0; i < keys.length; i++) {
		const
			ratio = keys[i],
			url = resolutions[ratio];

		str += `${url} ${ratio}${i !== keys.length - 1 ? ', ' : ''}`;
	}

	return str;
}

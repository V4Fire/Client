/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns a srcset string for img tag
 * @param resolutions - map, where key is picture multiplier and value is a picture url
 *
 * @example
 * getSrcSet({'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'})
 * -> 'http://img-hdpi.png 2x, http://img-xhdpi.png 3x'
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

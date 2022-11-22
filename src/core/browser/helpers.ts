/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Takes the given string pattern and returns a tuple `[browserName, browserVersion?[]]` if the pattern
 * is matched with `navigator.userAgent`. Otherwise, returns `false`.
 *
 * @param pattern
 */
export function match(pattern: RegExp | string): [string, number[] | null] | false {
	if (typeof navigator === 'undefined') {
		return false;
	}

	const
		rgxp = Object.isString(pattern) ? new RegExp(`(${pattern})(?:[ \\/-]([0-9._]*))?`, 'i') : pattern,
		res = rgxp.exec(navigator.userAgent);

	return res ?
		[
			res[1],
			Object.isTruly(res[2]) ? res[2].split(/[._]/).map(map) : null
		] :

		false;

	function map(el: string): number {
		const v = parseInt(el, 10);
		return Object.isTruly(v) ? v : 0;
	}
}

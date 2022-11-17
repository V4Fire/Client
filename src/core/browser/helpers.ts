/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{userAgent} = navigator;

/**
 * Takes a string pattern and returns a tuple `[browserName, browserVersion?[]]` if the pattern
 * is matched with `navigator.userAgent`. Otherwise, returns `false`.
 *
 * @param pattern - pattern source, regexp
 *   or function that takes userAgent string and returns array of browserName and browserVersion
 */
export function match(pattern: RegExp | string | PatternFn): [string, number[] | null] | false {
	let
		name: CanUndef<string>,
		version: CanUndef<string>;

	if (Object.isFunction(pattern)) {
		[name, version] = pattern(userAgent) ?? [];

	} else {
		const
			rgxp = Object.isString(pattern) ? new RegExp(`(${pattern})(?:[ \\/-]([0-9._]*))?`, 'i') : pattern;

		[, name, version] = rgxp.exec(userAgent) ?? [];
	}

	const versionParts = version != null && version.length !== 0 ?
		version.split(/[._]/).map(map) :
		null;

	if (name != null) {
		return [name, versionParts];
	}

	return false;

	function map(el: string): number {
		const v = parseInt(el, 10);
		return Object.isTruly(v) ? v : 0;
	}
}

export type PatternFn = (userAgent: string) => CanUndef<[CanUndef<string>, CanUndef<string>]>;

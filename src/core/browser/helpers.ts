/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Pattern } from 'core/browser/interface';

/**
 * Accepts the given pattern and returns the `[browserName, browserVersion?[]]` tuple
 * if the pattern matches `navigator.userAgent`.
 * If it doesn't match, it returns `false`.
 *
 * @param pattern - the pattern, regular expression, or a function that accepts a userAgent string and
 *   returns a pair consisting of browserName and browserVersion
 */
export function match(pattern: Pattern): [string, number[] | null] | false {
	if (typeof navigator === 'undefined') {
		return false;
	}

	const
		{userAgent} = navigator;

	let
		name: CanUndef<string>,
		version: CanUndef<string>;

	if (Object.isFunction(pattern)) {
		[name, version] = pattern(userAgent) ?? [];

	} else {
		const rgxp = Object.isString(pattern) ? new RegExp(`(${pattern})(?:[ \\/-]([0-9._]*))?`, 'i') : pattern;
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

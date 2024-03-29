/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/cookies/README.md]]
 * @packageDocumentation
 */

import type { SetOptions, RemoveOptions } from 'core/cookies/interface';

export * from 'core/cookies/interface';

/**
 * Returns true, if a cookie by the specified name is defined
 * @param name
 */
export function has(name: string): boolean {
	return get(name) !== undefined;
}

/**
 * Returns a cookie value by the specified name
 */
export function get(name: string): CanUndef<string> {
	const matches = new RegExp(`(?:^|; )${RegExp.escape(name)}=([^;]*)`).exec(document.cookie);
	return matches != null ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Sets a cookie value by the specified name
 *
 * @param name
 * @param value
 * @param [opts] - additional options
 */
export function set(name: string, value: string, opts?: SetOptions): string {
	opts = {path: '/', ...opts};

	const
		{expires} = opts;

	if (expires != null) {
		let
			v = expires;

		if (Object.isNumber(expires)) {
			const d = new Date();
			d.setTime(d.getTime() + expires);
			v = d;

		} else if (!Object.isDate(expires)) {
			v = Date.create(expires);
		}

		opts.expires = (<Date>v).toUTCString();
	}

	let
		cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	for (let keys = Object.keys(opts), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = opts[key];

		cookie += `; ${key}`;

		if (val !== true) {
			cookie += `=${val}`;
		}
	}

	document.cookie = cookie;
	return value;
}

/**
 * Removes a cookie by the specified name.
 * Notice, the cookie to remove should have the same domain and path used to install it.
 *
 * @param name
 * @param [opts] - additional options
 */
export function remove(name: string, opts?: RemoveOptions): boolean {
	if (!has(name)) {
		return false;
	}

	set(name, '', {path: '/', ...opts, expires: -1});
	return true;
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');

/**
 * Returns a cookie value by the specified name
 */
export function get(name: string): string | undefined {
	const matches = document.cookie.match(new RegExp(`(?:^|; )${RegExp.escape(name)}=([^;]*)`));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Returns true, if a cookie by the specified name is defined
 * @param name
 */
export function has(name: string): boolean {
	return get(name) !== undefined;
}

export interface CookieOptions {
	path?: string;
	domain?: string;
	expires?: Date | string | number;
	secure?: boolean;
}

/**
 * Sets a cookie value by the specified name
 *
 * @param name
 * @param value
 * @param opts - additional options
 */
export function set(name: string, value: string, opts: CookieOptions): string {
	opts = opts || {};

	const
		{expires} = opts;

	if (expires) {
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

	document.cookie = $C(opts).to(`${name}=${encodeURIComponent(value)}`).reduce((cookie, val, key) => {
		cookie += `; ${key}`;

		if (val !== true) {
			cookie += `=${val}`;
		}

		return cookie;
	});

	return value;
}

/**
 * Removes a cookie by the specified name
 * @param name
 */
export function remove(name: string): boolean {
	if (!has(name)) {
		return false;
	}

	set(name, '', {
		expires: -1
	});

	return true;
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CookieStore } from 'core/cookies/interface';
import { cookieSeparator } from 'core/cookies/stores/const';

/**
 * Creates a cookie store with a browser-like interface based on a cookie string
 * @param cookie
 */
export function createCookieStore(cookie: CanArray<string>): CookieStore {
	(Object.isString(cookie) ? cookie.split(cookieSeparator) : cookie).forEach((cookie) => {
		document.cookie = cookie;
	});

	return document;
}

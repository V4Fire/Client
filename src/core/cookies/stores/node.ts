/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CookieStore } from 'core/cookies/interface';
import { cookieSeparator } from 'core/cookies/stores/const';
import { preventRedundantUpdate } from 'core/cookies/decorators';

/**
 * Creates a cookie store with a browser-like interface based on a cookie string
 * @param cookie
 */
export function createCookieStore(cookie: CanArray<string>): CookieStore {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const {CookieJar, CookieAccessInfo} = require('cookiejar');

	const cookieJar = new CookieJar();
	cookieJar.setCookies(Object.isString(cookie) ? cookie.split(cookieSeparator) : cookie);

	return {
		get cookie() {
			return cookieJar.getCookies(CookieAccessInfo.All).toValueString();
		},

		set cookie(cookie: string) {
			cookieJar.setCookie(cookie);
		}
	};
}

/**
 * Creates a decorated cookie store with prevention of overwriting a previously added cookie with the same name and value
 * {@link createCookieStore}
 * {@link preventRedundantUpdate}
 *
 * @param cookie
 */
export function createDecoratedCookieStore(cookie: CanArray<string>): CookieStore {
	return preventRedundantUpdate(
		createCookieStore(cookie)
	);
}

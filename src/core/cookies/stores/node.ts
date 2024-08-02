/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CookieStore } from 'core/cookies/interface';
import { cookieSeparator } from 'core/cookies/stores/const';
import { withIdempotency } from 'core/cookies/decorators/with-idempotency';

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
 * Creates an idempotent cookie store that do not overwrite a previously added cookie with the same name and value
 * {@link createCookieStore}
 * {@link withIdempotency}
 *
 * @param cookie
 */
export function createIdempotentCookieStore(cookie: CanArray<string>): CookieStore {
	return withIdempotency(
		createCookieStore(cookie)
	);
}

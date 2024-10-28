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
	(Object.isString(cookie) ? cookie.split(cookieSeparator) : cookie).forEach((cookie) => {
		document.cookie = cookie;
	});

	return document;
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

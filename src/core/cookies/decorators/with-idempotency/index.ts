/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CookieStore } from 'core/cookies';

const
	rawCookieRegExp = /([^;]+)=[^;]+/;

/**
 * Adds idempotent behavior to the CookieStore,
 * ensuring that a cookie is not overwritten if it already exists with the same name and value.
 *
 * @param store
 */
export function withIdempotency(store: CookieStore): CookieStore {
	return {
		get cookie() {
			return store.cookie;
		},

		set cookie(rawCookie: string) {
			const
				[cookie, name] = rawCookieRegExp.exec(rawCookie) ?? [],
				currentCookieRegExp = new RegExp(`${name}=[^;]+(?=;|$)`),
				currentCookie = currentCookieRegExp.exec(store.cookie)?.[0];

			if (currentCookie === cookie) {
				return;
			}

			store.cookie = rawCookie;
		}
	};
}

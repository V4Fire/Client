/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { rawCookieRegExp } from 'core/cookies/stores';
import type { CookieStore } from 'core/cookies';

/**
 * Enhances the CookieStore with an additional check for SSR
 * to prevent overwriting a previously added cookie with the same name and value.
 *
 * @param store
 */
export function ssrStoreDecorator(store: CookieStore): CookieStore {
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

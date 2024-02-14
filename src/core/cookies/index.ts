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

import { Cookie } from 'core/cookies/class';
import type { CookieStore } from 'core/cookies/interface';

export * from 'core/cookies/class';
export * from 'core/cookies/interface';

const globalCookie = new Cookie(
	SSR ?
		{
			get cookie() {
				return '';
			},

			set cookie(_: string) {
				// Loopback
			}
		} :

		document
);

/**
 * Returns an API for managing the cookie of the specified store
 * @param from
 */
export const from = (from: CookieStore): Cookie => new Cookie(from);

export const
	has = globalCookie.has.bind(globalCookie),
	get = globalCookie.get.bind(globalCookie),
	set = globalCookie.set.bind(globalCookie),
	remove = globalCookie.remove.bind(globalCookie);

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

import { Cookies } from 'core/cookies/class';
import { createCookieStore } from 'core/cookies/stores';
import type { CookieStore } from 'core/cookies/interface';

export * from 'core/cookies/class';
export * from 'core/cookies/stores';
export * from 'core/cookies/interface';
export * from 'core/cookies/decorators/with-idempotency';

const globalCookies = new Cookies(createCookieStore(''));

/**
 * Returns an API for managing the cookie of the specified store
 * @param from
 */
export const from = (from: CookieStore): Cookies => new Cookies(from);

export const
	has = globalCookies.has.bind(globalCookies),
	get = globalCookies.get.bind(globalCookies),
	set = globalCookies.set.bind(globalCookies),
	remove = globalCookies.remove.bind(globalCookies);

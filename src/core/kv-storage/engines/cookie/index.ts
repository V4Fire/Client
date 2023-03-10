/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import CookieEngine from 'core/kv-storage/engines/cookie/engine';

export const
	syncSessionStorage = new CookieEngine('v4ss'),
	asyncSessionStorage = syncSessionStorage;

export const
	syncLocalStorage = new CookieEngine('v4ls', {maxAge: 2 ** 31 - 1}),
	asyncLocalStorage = syncLocalStorage;

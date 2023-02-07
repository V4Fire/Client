/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import CookieEngine from 'core/kv-storage/engines/cookie/engine';

import { COOKIE_STORAGE_NAME } from 'core/kv-storage/engines/cookie/const';

export const
	syncLocalStorage = new CookieEngine(COOKIE_STORAGE_NAME);

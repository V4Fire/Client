import { factory } from '@super/core/kv-storage';

import CookieStorageEngine from 'core/kv-storage/engines/cookie-storage';

export * from '@super/core/kv-storage';

/**
 * TODO: Нужно придумать название куки, которую будем использовать как хранилище
 */
const cookieNameForStorage = 'v4strg';

/**
 * API for synchronous storage based on cookies
 *
 * @example
 * ```js
 * cookieStorage.set('foo', 'bar');
 * cookieStorage.get('foo'); // 'foo'
 * ```
 */
export const cookieStorage = factory(new CookieStorageEngine(cookieNameForStorage), false);

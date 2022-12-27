import { factory } from '@super/core/kv-storage';

import type { SyncStorage } from 'core/kv-storage/interface';

import CookieStorageEngine from 'core/kv-storage/engines/cookie-storage';

export * from '@super/core/kv-storage';

/**
 * Factory to create storage based on cookies
 * disclaimer: The maximum cookie size is 4 kb
 *
 * @param cookieNameForStorage - The name of the cookie that will be used as the basis for the storage
 *
 * @example
 * ```js
 * cookieStorage.set('foo', 'bar');
 * cookieStorage.get('foo'); // 'foo'
 * ```
 */
export const cookieStorageFactory = (
	cookieNameForStorage: string
): SyncStorage => factory(new CookieStorageEngine(cookieNameForStorage), false);

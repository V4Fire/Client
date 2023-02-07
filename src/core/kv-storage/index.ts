import { factory } from '@v4fire/core/core/kv-storage';

import { syncLocalStorage } from 'core/kv-storage/engines/cookie';

export * from '@v4fire/core/core/kv-storage';

/**
 * API for synchronous local storage based on cookies
 *
 * @example
 * ```js
 * session.set('foo', 'bar');
 * session.get('foo'); // 'foo'
 * ```
 */
export const cookie = factory(syncLocalStorage);

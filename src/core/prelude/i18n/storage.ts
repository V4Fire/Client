/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import type { SyncStorageNamespace } from 'core/kv-storage';

import { cookieStorageFactory } from 'core/kv-storage';
import { COOKIE_STORAGE_NAME } from 'core/prelude/i18n/const';

const
	storage: SyncStorageNamespace = cookieStorageFactory(COOKIE_STORAGE_NAME);

export default storage;

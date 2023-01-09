/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import type { SyncStorageNamespace } from 'core/kv-storage';

import { cookieStorageFactory } from 'core/kv-storage';

const
	// TODO: Выбрать имя куки для хранилища
	storage: SyncStorageNamespace = cookieStorageFactory('v4storage');

export default storage;

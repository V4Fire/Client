/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import type { LocaleKVStorage } from 'core/prelude/i18n/interface';

import { cookieStorageFactory } from 'core/kv-storage';
import { COOKIE_STORAGE_NAME } from 'core/prelude/i18n/const';

const
	storage: LocaleKVStorage = cookieStorageFactory(COOKIE_STORAGE_NAME);

export default storage;

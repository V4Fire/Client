/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LocaleKVStorage } from 'core/prelude/i18n/interface';

import { factory } from 'core/kv-storage';
import { syncLocalStorage } from 'core/kv-storage/engines/cookie';

const
	storage: LocaleKVStorage = factory(syncLocalStorage);

export default storage;

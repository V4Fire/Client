/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import type { LocaleKVStorage } from 'core/prelude/i18n/interface';

import { factory } from 'core/kv-storage';
import { syncLocalStorage } from 'core/kv-storage/engines/cookie';

const
	storage: LocaleKVStorage = factory(syncLocalStorage);

export default storage;

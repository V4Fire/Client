/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { factory } from 'core/kv-storage';
import { syncLocalStorage } from 'core/kv-storage/engines/cookie';

const
	storage = factory(syncLocalStorage);

export default storage;

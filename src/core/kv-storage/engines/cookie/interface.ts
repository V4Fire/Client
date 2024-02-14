/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Cookies, SetOptions } from 'core/cookies';
import type { StorageOptions as StringStorageOptions } from 'core/kv-storage/engines/string';

export * from 'core/kv-storage/engines/string';

export interface StorageOptions extends Exclude<StringStorageOptions, 'data'>, SetOptions {
	/**
	 * An engine for managing cookies
	 */
	cookies?: Cookies;
}

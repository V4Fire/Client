/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { from, createCookieStore, ssrStoreDecorator } from 'core/cookies';
import CookieEngine from 'core/kv-storage/engines/cookie/engine';

import type { StorageOptions } from 'core/kv-storage/engines/cookie/interface';

export default class SSRCookieEngine extends CookieEngine {
	constructor(cookieName: string, opts?: StorageOptions) {
		super(cookieName, opts);

		this.cookies = from(
			ssrStoreDecorator(
				opts?.cookies?.store ??
				createCookieStore('')
			)
		);
	}
}

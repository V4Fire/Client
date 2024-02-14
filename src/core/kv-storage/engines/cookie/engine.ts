/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { from, Cookies, SetOptions } from 'core/cookies';

import StringEngine from 'core/kv-storage/engines/string/engine';
import type { StorageOptions } from 'core/kv-storage/engines/cookie/interface';

export default class CookieEngine extends StringEngine {
	override get serializedData(): string {
		return this.cookies.get(this.cookieName) ?? '';
	}

	protected override set serializedData(value: string) {
		if (value.length === 0) {
			this.cookies.remove(this.cookieName, Object.select(this.setOptions, ['path', 'domains']));

		} else {
			this.cookies.set(this.cookieName, value, this.setOptions);
		}
	}

	/**
	 * An engine for managing cookies
	 */
	protected cookies: Cookies;

	/**
	 * The name of the cookie in which the data is stored
	 */
	protected cookieName: string;

	/**
	 * Additional options for setting cookies
	 */
	protected setOptions: SetOptions;

	/**
	 * @param cookieName - the name of the cookie in which the data is stored
	 * @param [opts] - additional options for setting cookies
	 */
	constructor(cookieName: string, opts?: StorageOptions) {
		super(Object.select(opts, 'separators'));
		this.cookies = opts?.cookies ?? from(document);
		this.cookieName = cookieName;
		this.setOptions = Object.reject(opts, ['cookies', 'separators']);
	}
}

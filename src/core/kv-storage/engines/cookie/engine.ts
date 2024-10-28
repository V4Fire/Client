/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { from, createCookieStore, Cookies, SetOptions } from 'core/cookies';

import StringEngine from 'core/kv-storage/engines/string/engine';
import type { StorageOptions } from 'core/kv-storage/engines/cookie/interface';

export default class CookieEngine extends StringEngine {
	override get serializedData(): string {
		return this.cookies.get(this.cookieName) ?? '';
	}

	protected override set serializedData(value: string) {
		if (this.date == null) {
			this.date = Date.now();
		}

		if (value.length === 0) {
			this.cookies.remove(this.cookieName, Object.select(this.actualOptions, ['path', 'domains']));

		} else {
			this.cookies.set(this.cookieName, value, this.actualOptions);
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
	 * The date of setting cookie
	 */
	protected date: CanUndef<number>;

	/**
	 * Actual options for setting cookies.
	 * Ensure cookie options, especially `maxAge`, are kept up-to-date.
	 *
	 * @example
	 * ```js
	 * const store = new CookieEngine('bla', {maxAge: 600});
	 * store.set('foo', 5); // cookie is added with max-age=600
	 * ... // after 60s
	 * store.set('bar', 10); // cookie is added with max-age=540
	 * ```
	 */
	protected get actualOptions(): SetOptions {
		if (this.setOptions.maxAge == null) {
			return this.setOptions;
		}

		const
			passedTime = Math.floor((Date.now() - this.date!) / 1000);

		return {
			...this.setOptions,
			maxAge: this.setOptions.maxAge - passedTime
		};
	}

	/**
	 * @param cookieName - the name of the cookie in which the data is stored
	 * @param [opts] - additional options for setting cookies
	 */
	constructor(cookieName: string, opts?: StorageOptions) {
		super(Object.select(opts, 'separators'));
		this.cookies = opts?.cookies ?? from(createCookieStore(''));
		this.cookieName = cookieName;
		this.setOptions = Object.reject(opts, ['cookies', 'separators']);
	}
}

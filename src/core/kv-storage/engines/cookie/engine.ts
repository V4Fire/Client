/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import StringEngine from 'core/kv-storage/engines/string/engine';

import * as cookie from 'core/cookies';

export default class CookieEngine extends StringEngine {
	/**
	 * The name of the cookie in which the data is stored
	 */
	protected cookieName: string;

	/**
	 * Additional options for setting cookies
	 */
	protected setOptions: cookie.SetOptions;

	/**
	 * @param cookieName - the name of the cookie in which the data is stored
	 * @param [setOpts] - additional options for setting cookies
	 */
	constructor(cookieName: string, setOpts?: cookie.SetOptions) {
		super();
		this.cookieName = cookieName;
		this.setOptions = setOpts ?? {};
	}

	protected override getRawData(): string {
		return cookie.get(this.cookieName) ?? '';
	}

	protected override setRawData(value: string): void {
		if (value.length === 0) {
			cookie.remove(this.cookieName, Object.select(this.setOptions, ['path', 'domains']));
		} else {
			cookie.set(this.cookieName, value, this.setOptions);
		}
	}
}

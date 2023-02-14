/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ClearFilter } from 'core/kv-storage/interface';
import { cookieStorageSeparators } from 'core/kv-storage/engines/cookie/const';

import * as cookie from 'core/cookies';

export default class CookieEngine {
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
		this.cookieName = cookieName;
		this.setOptions = setOpts ?? {};
	}

	/**
	 * Returns true if a value by the specified key exists in the storage
	 * @param key
	 */
	has(key: string): boolean {
		return key in this.getDataFromCookie();
	}

	/**
	 * Returns a value from the storage by the specified key
	 * @param key
	 */
	get(key: string): CanUndef<string> {
		return this.getDataFromCookie()[key];
	}

	/**
	 * Saves a value to the storage by the specified key
	 *
	 * @param key
	 * @param value
	 */
	set(key: string, value: unknown): void {
		const
			dividersValues = Object.values(cookieStorageSeparators),
			isForbiddenCharacterUsed = dividersValues.some((el) => key.includes(el) || String(value).includes(el));

		if (isForbiddenCharacterUsed) {
			throw new TypeError(`Forbidden character used in the cookie storage key: ${key}, value: ${String(value)}`);
		}

		this.updateCookieData({[key]: String(value)});
	}

	/**
	 * Removes a value from the storage by the specified key
	 * @param key
	 */
	remove(key: string): void {
		this.updateCookieData({[key]: undefined});
	}

	/**
	 * Clears the storage by the specified filter
	 * @param filter
	 */
	clear(filter?: ClearFilter<string>): void {
		if (filter != null) {
			const
				state = this.getDataFromCookie();

			Object.entries(state).forEach(([key, value]) => {
				if (filter(<string>value, key) === true) {
					delete state[key];
				}
			});

			this.overwriteCookie(state);

		} else {
			this.overwriteCookie({});
		}
	}

	/**
	 * Updates the data stored in the cookie
	 * @param data - values to update in the storage
	 */
	protected updateCookieData(data: Dictionary<CanUndef<string>>): void {
		const
			currentState = this.getDataFromCookie();

		Object.entries(data).forEach(([key, value]) => {
			if (value === undefined) {
				delete currentState[key];

			} else {
				currentState[key] = value;
			}
		});

		this.overwriteCookie(currentState);
	}

	/**
	 * Returns data from the storage cookie
	 */
	protected getDataFromCookie(): Dictionary<string> {
		const
			cookieValue = cookie.get(this.cookieName);

		if (cookieValue == null) {
			return {};
		}

		return cookieValue.split(cookieStorageSeparators.keys).reduce((acc, el) => {
			const [key, value] = el.split(cookieStorageSeparators.values);
			acc[key] = value;
			return acc;
		}, {});
	}

	/**
	 * Overwrites the storage cookie with the passed data
	 * @param data
	 */
	protected overwriteCookie(data: Dictionary<string>): void {
		if (Object.size(data) === 0) {
			cookie.remove(this.cookieName, Object.select(this.setOptions, ['path', 'domains']));
		}

		const rawCookie = Object.entries(data)
			.map(([key, value]) => `${key}${cookieStorageSeparators.values}${value}`)
			.join(cookieStorageSeparators.keys);

		cookie.set(this.cookieName, rawCookie, this.setOptions);
	}
}

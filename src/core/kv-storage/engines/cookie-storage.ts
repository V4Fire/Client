/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { ClearFilter } from 'core/kv-storage/interface';

import * as cookie from 'core/cookies';

export default class CookieStorageEngine {
	protected cookieName: string;

	constructor(cookieName: string) {
		this.cookieName = cookieName;
	}

	/** @see SyncStorageNamespace.get */
	get(key: string): CanUndef<string> {
		return this.getCookieLikeDictionary()[key];
	}

	/** @see SyncStorageNamespace.has */
	has(key: string): boolean {
		return key in this.getCookieLikeDictionary();
	}

	/** @see SyncStorageNamespace.set */
	set(key: string, value: string): void {
		this.updateValues([{key, value}]);
	}

	/** @see SyncStorageNamespace.remove */
	remove(key: string): void {
		this.updateValues([{key, value: undefined}]);
	}

	/** @see SyncStorageNamespace.clear */
	clear(filter?: ClearFilter<string>): void {
		if (filter != null) {
			const state = this.getCookieLikeDictionary();

			Object.entries(state).forEach(([key, value]) => {
				if (filter(<string>value, key) === true) {
					delete state[key];
				}
			});

			this.updateCookieRaw(state);

		} else {
			this.updateCookieRaw({});
		}
	}

	/**
	 * Returns the cookie value converted to dictionary format
	 */
	protected getCookieLikeDictionary(): Dictionary<string> {
		const cookieValue = cookie.get(this.cookieName);

		if (cookieValue == null) {
			return {};
		}

		return cookieValue.split('#').reduce((acc, el) => {
			const [key, value] = el.split('.');
			acc[key] = value;
			return acc;
		}, {});
	}

	/**
	 * Updates the data stored in the cookie
	 * @param values - values to update in the storage
	 */
	protected updateValues(values: Array<{key: string; value: CanUndef<string>}>): void {
		const currentState = this.getCookieLikeDictionary();

		values.forEach(({key, value}) => {
			if (value === undefined) {
				delete currentState[key];
			} else {
				currentState[key] = value;
			}
		});

		this.updateCookieRaw(currentState);
	}

	protected updateCookieRaw(state: Dictionary<string>): void {
		if (Object.size(state) === 0) {
			cookie.remove(this.cookieName);
		}

		const rawCookie = Object.entries(state)
			.map(([key, value]) => `${key}.${value}`)
			.join('#');

		cookie.set(this.cookieName, rawCookie);
	}
}

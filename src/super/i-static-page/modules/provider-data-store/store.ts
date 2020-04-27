/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ProviderDataItem from 'super/i-static-page/modules/provider-data-store/item';
import { empty } from 'super/i-static-page/modules/provider-data-store/const';

/**
 * Class to store data providers data
 */
export default class ProviderDataStore {
	/**
	 * Providers store
	 */
	protected store: Dictionary<ProviderDataItem> = Object.createDict();

	/**
	 * Dummy of DataStoreItem
	 */
	protected loopbackItem: ProviderDataItem<undefined>;

	constructor() {
		this.loopbackItem = new ProviderDataItem(empty, undefined);
	}

	/**
	 * Returns true if the specified key exists in the store
	 * @param key
	 */
	has(key: string): boolean {
		return key in this.store;
	}

	/**
	 * Returns a value from the store by the specified key
	 * @param key
	 */
	get<T>(key: string): ProviderDataItem<T> {
		return <ProviderDataItem<T>>this.store[key] || this.loopbackItem;
	}

	/**
	 * Saves a value to the store by the specified key
	 *
	 * @param key
	 * @param value
	 */
	set(key: string, value: unknown): void {
		this.store[key] = new ProviderDataItem(key, value);
	}

	/**
	 * Removes a value from the store by the specified key
	 * @param key
	 */
	remove(key: string): void {
		delete this.store[key];
	}
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-static-page/modules/provider-data-store/README.md]]
 * @packageDocumentation
 */

import Cache from 'core/cache/simple';
import ProviderDataItem from 'super/i-static-page/modules/provider-data-store/item';

export { ProviderDataItem };

/**
 * Class to store data of data providers
 */
export default class ProviderDataStore extends Cache<ProviderDataItem> {
	/** @override */
	set<T>(key: string, value: T): ProviderDataItem<T> {
		const item = new ProviderDataItem(key, value);
		this.storage.set(key, item);
		return item;
	}
}

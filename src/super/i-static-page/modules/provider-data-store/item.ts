/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if runtime has core/data
import type Provider from '@src/core/data';
//#endif

import { providers } from '@src/core/data/const';
import select, { SelectParams } from '@src/core/object/select';
import type { ItemKey } from '@src/super/i-static-page/modules/provider-data-store/interface';

/**
 * Wrapper for a data item
 */
export default class ProviderDataItem<T = unknown> {
	/**
	 * Item key
	 */
	readonly key: ItemKey;

	/**
	 * Item data
	 */
	readonly data: CanUndef<T>;

	/**
	 * Link to a data provider
	 */
	protected get provider(): CanUndef<typeof Provider> {
		return <typeof Provider>providers[this.key];
	}

	/**
	 * @param key
	 * @param [value]
	 */
	constructor(key: ItemKey, value: T) {
		this.key = key;
		this.data = value;
	}

	/**
	 * Finds an element from the instance by the specified parameters
	 * @param params
	 */
	select<D = unknown>(params: SelectParams): CanUndef<D> {
		const
			{provider, data} = this;

		if (data == null) {
			return;
		}

		if (provider != null && Object.isFunction(provider.select)) {
			return provider.select(data, params);
		}

		return select(data, params);
	}
}

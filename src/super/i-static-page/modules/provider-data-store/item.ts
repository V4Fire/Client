/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if runtime has core/data
import Provider from 'core/data';
//#endif

import { providers } from 'core/data/const';
import select, { SelectParams } from 'core/object/select';
import { ItemKey } from 'super/i-static-page/modules/provider-data-store/interface';

/**
 * Wrapper for a data item
 */
export default class ProviderDataItem<T = unknown> {
	/**
	 * Item key
	 */
	protected key: ItemKey;

	/**
	 * Item value
	 */
	protected value: CanUndef<T>;

	/**
	 * Link to a data provider
	 */
	protected get provider(): CanUndef<typeof Provider> {
		return providers[<any>this.key] as typeof Provider;
	}

	/**
	 * @param key
	 * @param [value]
	 */
	constructor(key: ItemKey, value: T) {
		this.key = key;
		this.value = value;
	}

	/**
	 * Finds an element from the instance by the specified parameters
	 * @param params
	 */
	select<D = unknown>(params: SelectParams): CanUndef<D> {
		const
			{provider, value} = this;

		if (!value) {
			return;
		}

		if (provider && Object.isFunction(provider.select)) {
			return provider.select(value, params);
		}

		return select(value, params as SelectParams);
	}
}

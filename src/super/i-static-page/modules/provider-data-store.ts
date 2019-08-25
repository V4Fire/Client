/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Provider, { providers } from 'core/data';
import select, { SelectParams } from 'core/select';

export const
	$$ = symbolGenerator();

export type Label = string | number | symbol;
export type ProviderOrUnknown = string | unknown;

export class ProviderDataItem<T extends unknown = unknown> {
	/**
	 * Item key
	 */
	protected key: string;

	/**
	 * Item value
	 */
	protected value: CanUndef<T>;

	/**
	 * Link to data provider
	 */
	protected get provider(): CanUndef<typeof Provider> {
		return providers[this.key] as typeof Provider;
	}

	/**
	 * @param key
	 * @param [value]
	 */
	constructor(key: Label, value: T) {
		// @ts-ignore (symbol)
		this.key = key;
		this.value = value;
	}

	/**
	 * Proxy to provider call
	 * @param params
	 */
	select<V extends unknown = unknown>(params: unknown): CanUndef<V> {
		const
			{provider, value} = this;

		if (!value) {
			return undefined;
		}

		if (provider && Object.isFunction(provider.select)) {
			return provider.select(value, params);
		}

		return select(value, params as SelectParams);
	}
}

export default class ProviderDataStore {
	/**
	 * Providers store
	 */
	protected store: Dictionary<ProviderDataItem<ProviderOrUnknown>> = {};

	/**
	 * Dummy of DataStoreItem
	 */
	protected dummy: ProviderDataItem<undefined>;

	constructor() {
		this.dummy = new ProviderDataItem($$.empty, undefined);
	}

	/**
	 * Returns a specified provider saved data
	 * @param name
	 */
	get<T>(name: string): ProviderDataItem<T> {
		return <ProviderDataItem<T>>this.store[name] || this.dummy;
	}

	/**
	 * Sets a specified value to store
	 * @param key
	 */
	set(key: string, value: unknown): void {
		this.store[key] = new ProviderDataItem(key, value);
	}

	/**
	 * True if specified keys exists in store
	 * @param key
	 */
	exists(key: string): boolean {
		// tslint:disable-next-line: strict-type-predicates
		return this.store[key] != null;
	}

	/**
	 * Delete a specified key from storage
	 * @param key
	 */
	remove(key: string): boolean {
		return delete this.store[key];
	}
}

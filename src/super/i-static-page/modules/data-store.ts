/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Provider, { ProviderSelectParams, select, providers } from 'core/data';

export const
	$$ = symbolGenerator();

export type Label = string | number | symbol;
export type ProviderOrUnknown = string | unknown;

export class DataStoreItem<T extends unknown = unknown> {
	/**
	 * Item key
	 */
	protected key: string;

	/**
	 * Item value;
	 */
	protected value: CanUndef<T>;

	/**
	 * Link to provider
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

		return select(value, params as ProviderSelectParams);
	}
}

export default class DataStore {
	/**
	 * Providers store
	 */
	protected store: Dictionary<DataStoreItem<ProviderOrUnknown>> = {};

	/**
	 * Dummy of DataStoreItem
	 */
	protected dummy: DataStoreItem<undefined>;

	constructor() {
		this.dummy = new DataStoreItem($$.empty, undefined);
	}

	/**
	 * Returns a specified provider saved data
	 * @param name
	 */
	get<T>(name: string): DataStoreItem<T> {
		return <DataStoreItem<T>>this.store[name] || this.dummy;
	}

	/**
	 * Sets a specified value to store
	 * @param key
	 */
	set(key: string, value: unknown): void {
		this.store[key] = new DataStoreItem(key, value);
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

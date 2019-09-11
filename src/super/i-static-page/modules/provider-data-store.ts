/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Provider, { providers } from 'core/data';
import { select, SelectParams } from 'core/object';

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
	 * Link to a data provider
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
	 * Proxy for provider.select
	 * @param params
	 */
	select<T = unknown>(params: SelectParams): CanUndef<T> {
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

export default class ProviderDataStore {
	/**
	 * Providers store
	 */
	protected store: Dictionary<ProviderDataItem<ProviderOrUnknown>> = {};

	/**
	 * Dummy of DataStoreItem
	 */
	protected loopbackItem: ProviderDataItem<undefined>;

	constructor() {
		this.loopbackItem = new ProviderDataItem($$.empty, undefined);
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
	 * Returns true if the specified key exists in the store
	 * @param key
	 */
	has(key: string): boolean {
		// tslint:disable-next-line: strict-type-predicates
		return this.store[key] != null;
	}

	/**
	 * Removes a value from the store by the specified key
	 * @param key
	 */
	remove(key: string): void {
		delete this.store[key];
	}
}

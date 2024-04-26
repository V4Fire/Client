/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/hydration/README.md]]
 * @packageDocumentation
 */

import { expandedStringify, expandedParse } from 'core/json';

import { styles, emptyDataStoreKey } from 'core/component/hydration/const';
import type { Store, HydratedData, HydratedValue, Environment } from 'core/component/hydration/interface';

export * from 'core/component/hydration/const';
export * from 'core/component/hydration/interface';

export class HydrationStore {
	/**
	 * A dictionary containing the necessary styles for hydration
	 */
	readonly styles: typeof styles = new Map();

	/**
	 * Hydrated data store
	 */
	protected store: Store;

	/**
	 * A dictionary where the keys are the stored data and the values are their IDs
	 */
	protected data: Map<HydratedValue, string> = new Map();

	/**
	 * The current environment
	 */
	protected readonly environment: Environment = SSR ? 'server' : 'client';

	/**
	 * @param environment - the current environment
	 */
	constructor(environment?: Environment) {
		if (environment != null) {
			this.environment = environment;
		}

		try {
			this.store = this.parse(document.getElementById('hydration-store')?.textContent ?? '');

		} catch {
			this.store = {
				data: Object.createDict(),
				store: Object.createDict()
			};
		}
	}

	/**
	 * Returns a JSON string representation of the hydrated data
	 */
	toString(): string {
		const extraTypes = [
			Date,
			typeof BigInt === 'function' ? BigInt : Object,
			Function,
			Map,
			Set
		];

		const toJSON = extraTypes.reduce<Array<Nullable<PropertyDescriptor>>>((res, constr) => {
			if ('toJSON' in constr.prototype) {
				res.push(Object.getOwnPropertyDescriptor(constr.prototype, 'toJSON'));

				// @ts-ignore (ts)
				delete constr.prototype.toJSON;

			} else {
				res.push(null);
			}

			return res;
		}, []);

		const serializedData = JSON.stringify(this.store, expandedStringify);

		toJSON.forEach((fn, i) => {
			if (fn != null) {
				Object.defineProperty(extraTypes[i].prototype, 'toJSON', fn);
			}
		});

		return serializedData;
	}

	/**
	 * Returns true if the component with the provided ID contains hydrated data
	 * @param componentId
	 */
	has(componentId: string): boolean {
		return componentId in this.store.store;
	}

	/**
	 * Returns the hydrated data for the component associated with the given ID
	 * @param componentId
	 */
	get(componentId: string): CanUndef<HydratedData> {
		const
			data = this.store.store[componentId];

		if (data != null) {
			return Object.fromEntries(
				Object.entries(data).map(([key, value]) => [key, this.store.data[value!]])
			);
		}
	}

	/**
	 * Returns the hydrated data for the specified component ID and path
	 *
	 * @param componentId
	 * @param path
	 */
	getByPath(componentId: string, path: string): CanUndef<HydratedValue> {
		const
			key = this.store.store[componentId]?.[path];

		if (key != null) {
			return this.store.data[key];
		}
	}

	/**
	 * Initializes hydration data storage for the given component ID
	 * @param componentId
	 */
	init(componentId: string): void {
		if (this.environment === 'client') {
			return;
		}

		this.store.store[componentId] ??= Object.createDict();
	}

	/**
	 * Sets hydration data for the specified component ID and path
	 *
	 * @param componentId
	 * @param path
	 * @param data
	 */
	set(componentId: string, path: string, data: CanUndef<HydratedValue>): void {
		if (data === undefined || this.environment === 'client') {
			return;
		}

		const
			key = this.getDataKey(data);

		this.init(componentId);
		this.store.store[componentId]![path] = key;
		this.store.data[key] = data;
	}

	/**
	 * Sets empty hydration data for the specified component ID and path
	 *
	 * @param componentId
	 * @param path
	 */
	setEmpty(componentId: string, path: string): void {
		this.init(componentId);
		this.store.store[componentId]![path] = emptyDataStoreKey;
	}

	/**
	 * Removes hydration data by the specified component ID
	 * @param componentId
	 */
	remove(componentId: string): void {
		delete this.store.store[componentId];
	}

	/**
	 * Removes hydration data by the specified component ID and path
	 *
	 * @param componentId
	 * @param path
	 */
	removeByPath(componentId: string, path: string): void {
		const
			key = this.store.store[componentId]![path];

		if (key != null) {
			delete this.store.data[key];
		}

		delete this.store.store[componentId]![path];
	}

	/**
	 * Clears the store
	 */
	clear(): void {
		this.data.clear();
		this.styles.clear();

		Object.forEach(this.store, (store: Dictionary) => {
			Object.forEach(store, (_, key) => {
				delete store[key];
			});
		});
	}

	/**
	 * Returns a unique ID for the specified data
	 * @param data
	 */
	protected getDataKey(data: HydratedValue): string {
		let
			key = this.data.get(data);

		if (key == null) {
			key = Object.fastHash(Math.random());
			this.data.set(data, key);
		}

		return key;
	}

	/**
	 * Parses the given string as JSON and stores it in the hydrated store
	 * @param store
	 */
	protected parse(store: string): Store {
		return JSON.parse(store, expandedParse) ?? Object.createDict();
	}
}

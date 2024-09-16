/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/hydration-store/README.md]]
 * @packageDocumentation
 */

import { expandedStringify, expandedParse } from 'core/json';
import { sanitize } from 'core/html/xss';

import { styles, emptyDataStoreKey } from 'core/hydration-store/const';
import type { Store, HydratedData, HydratedValue, Environment, StoreJSON } from 'core/hydration-store/interface';

export * from 'core/hydration-store/const';
export * from 'core/hydration-store/interface';

export default class HydrationStore {
	/**
	 * A dictionary containing the necessary styles for hydration
	 */
	readonly styles: typeof styles = new Map();

	/**
	 * Hydrated data store
	 */
	protected store: Store;

	/**
	 * {@link Store} in JSON format.
	 * It is used for incremental serialization of the store.
	 */
	protected readonly storeJSON: StoreJSON = this.createStore();

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

		if (this.environment === 'client') {
			const store = document.getElementById('hydration-store');

			if (store != null) {
				this.store = this.parse(store.textContent ?? 'null');

				let
					isValidData = true;

				if (Object.isDictionary(this.store)) {
					const
						entries = Object.entries(this.store),
						validKeys = Object.keys(this.createStore());

					if (
						entries.length !== 2 ||
						entries.some(([key, value]) => !validKeys.includes(key) || !Object.isDictionary(value))
					) {
						isValidData = false;
					}

				} else {
					isValidData = false;
				}

				if (!isValidData) {
					throw new TypeError('Incorrect format of hydrated data');
				}

			} else {
				this.store = this.createStore();
			}

		} else {
			this.store = this.createStore();
		}
	}

	/**
	 * Returns a JSON string representation of the hydrated data
	 */
	toString(): string {
		const {store, data} = this.storeJSON;

		return sanitize(`{"store":${shallowStringify(store)},"data":${shallowStringify(data)}}`);

		function shallowStringify(obj: Dictionary<string>): string {
			const lastIndex = Object.size(obj) - 1;

			const res = Object.entries(obj).reduce((res, [key, value], index) => {
				const separator = index < lastIndex ? ',' : '';
				res[index] = `"${key}":${value != null ? value : null}${separator}`;

				return res;
			}, <string[]>[]).join('');

			return `{${res}}`;
		}
	}

	/**
	 * Initializes hydration data storage for the given entity ID
	 * @param id
	 */
	init(id: string): void {
		if (this.environment === 'client') {
			return;
		}

		this.store.store[id] ??= Object.createDict();
	}

	/**
	 * Returns true if the entity with the provided ID contains hydrated data
	 * @param id
	 */
	has(id: string): boolean {
		return id in this.store.store;
	}

	/**
	 * Retrieves the hydrated data for the entity associated with the given ID
	 * @param id
	 */
	get(id: string): CanUndef<HydratedData>;

	/**
	 * Retrieves the hydrated data for the entity associated with the given ID and path
	 *
	 * @param id
	 * @param path
	 */
	get(id: string, path: string): CanUndef<HydratedValue>;
	get(id: string, path?: string): CanUndef<HydratedData | HydratedValue> {
		const
			data = this.store.store[id];

		if (data == null) {
			return;
		}

		if (path == null) {
			return Object.fromEntries(
				Object.entries(data).map(([key, value]) => [key, this.store.data[value!]])
			);
		}

		const
			key = data[path];

		if (key != null) {
			return this.store.data[key];
		}
	}

	/**
	 * Sets hydration data for the specified entity ID and path
	 *
	 * @param id
	 * @param path
	 * @param data
	 */
	set(id: string, path: string, data: CanUndef<HydratedValue>): void {
		if (data === undefined || this.environment === 'client') {
			return;
		}

		const
			key = this.getDataKey(data);

		this.init(id);
		this.store.store[id]![path] = key;
		this.store.data[key] = data;

		this.storeJSON.store[id] = this.serializeData(this.store.store[id]!);
		this.storeJSON.data[key] = this.serializeData(data);
	}

	/**
	 * Sets empty hydration data for the specified entity ID and path
	 *
	 * @param id
	 * @param path
	 */
	setEmpty(id: string, path: string): void {
		if (this.environment === 'client') {
			return;
		}

		this.init(id);
		this.store.store[id]![path] = emptyDataStoreKey;
		this.storeJSON.store[id] = this.serializeData(this.store.store[id]!);
	}

	/**
	 * Removes the hydration data for the specified entity ID.
	 * If a path is provided, it removes the hydrated value at that path.
	 *
	 * @param id
	 * @param [path]
	 */
	remove(id: string, path?: string): void {
		if (path == null) {
			delete this.store.store[id];
			delete this.storeJSON.store[id];
			return;
		}

		const
			key = this.store.store[id]![path];

		if (key != null) {
			delete this.store.data[key];
			delete this.storeJSON.data[key];
		}

		delete this.store.store[id]![path];
	}

	/**
	 * Clears the store
	 */
	clear(): void {
		this.data.clear();
		this.styles.clear();

		this.clearStore(this.store);
		this.clearStore(this.storeJSON);
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
	 * Creates the initial store
	 */
	protected createStore<T extends Store | StoreJSON>(): T {
		return Object.cast({
			store: Object.createDict(),
			data: Object.createDict()
		});
	}

	/**
	 * Clears the hydrated data store
	 * @param store
	 */
	protected clearStore(store: Store | StoreJSON): void {
		Object.forEach(store, (store: Dictionary) => {
			Object.forEach(store, (_, key) => {
				delete store[key];
			});
		});
	}

	/**
	 * Parses the given string as JSON and stores it in the hydrated store
	 * @param store
	 */
	protected parse(store: string): Store {
		return JSON.parse(store, expandedParse) ?? Object.createDict();
	}

	/**
	 * Serializes the specified data
	 * @param data
	 */
	protected serializeData(data: unknown): string {
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

		const serializedData = JSON.stringify(data, expandedStringify);

		toJSON.forEach((fn, i) => {
			if (fn != null) {
				Object.defineProperty(extraTypes[i].prototype, 'toJSON', fn);
			}
		});

		return serializedData;
	}
}

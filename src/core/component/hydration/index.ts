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
import type { Store, HydratedData, HydratedValue } from 'core/component/hydration/interface';

export * from 'core/component/hydration/interface';

export class HydrationStore {
	/**
	 * Hydrated data store
	 */
	protected store: Store;

	constructor() {
		try {
			this.store = this.parse(document.getElementById('hydration-store')?.textContent ?? '');

		} catch {
			this.store = Object.createDict();
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
		return componentId in this.store;
	}

	/**
	 * Returns the hydrated data for the component associated with the given ID
	 * @param componentId
	 */
	get(componentId: string): CanUndef<HydratedData> {
		return this.store[componentId];
	}

	/**
	 * Sets hydration data for the specified component ID and path
	 *
	 * @param componentId
	 * @param path
	 * @param data
	 */
	set(componentId: string, path: string, data: CanUndef<HydratedValue>): void {
		if (data === undefined) {
			return;
		}

		this.store[componentId] ??= Object.createDict();
		this.store[componentId]![path] = data;
	}

	/**
	 * Removes hydration data by the specified component ID
	 * @param componentId
	 */
	remove(componentId: string): void {
		delete this.store[componentId];
	}

	/**
	 * Parses the given string as JSON and stores it in the hydrated store
	 * @param store
	 */
	protected parse(store: string): Store {
		return JSON.parse(store, expandedParse) ?? Object.createDict();
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new HydrationStore();

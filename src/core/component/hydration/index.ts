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

import type { Store, HydratedData } from 'core/component/hydration/interface';

export * from 'core/component/hydration/interface';

export class HydrationStore {
	/**
	 * Store for hydrated data
	 */
	protected store: Store;

	constructor() {
		try {
			this.store = this.parse(document.getElementById('hydration-store')?.textContent ?? '');

		} catch {
			this.store = Object.createDict();
		}
	}

	toString(): string {
		return JSON.stringify(this.store);
	}

	/**
	 * Returns true if the component with the given ID has hydrated data
	 * @param componentId
	 */
	has(componentId: string): boolean {
		return componentId in this.store;
	}

	/**
	 * Returns the hydrated component data for the given ID
	 * @param componentId
	 */
	get(componentId: string): CanUndef<HydratedData> {
		return this.store[componentId];
	}

	/**
	 * Sets data for hydration at the given component ID and path
	 *
	 * @param componentId
	 * @param path
	 * @param data
	 */
	set(componentId: string, path: string, data: CanUndef<JSONLikeValue>): void {
		if (data === undefined) {
			return;
		}

		this.store[componentId] ??= Object.createDict();
		this.store[componentId]![path] = data;
	}

	protected parse(store: string): Store {
		return JSON.parse(store) ?? Object.createDict();
	}
}

export default new HydrationStore();

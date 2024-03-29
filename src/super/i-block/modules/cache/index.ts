/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/cache/README.md]]
 * @packageDocumentation
 */

export default class Cache<K extends string = string, V = unknown> {
	/**
	 * Cache dictionary
	 */
	dict: Dictionary<Dictionary<V> | V> = Object.createDict();

	/**
	 * @param [namespaces] - predefined namespaces
	 */
	constructor(namespaces?: string[]) {
		if (namespaces) {
			for (let i = 0; i < namespaces.length; i++) {
				this.dict[namespaces[i]] = Object.createDict();
			}
		}
	}

	/**
	 * Creates a cache object by the specified parameters and returns it
	 *
	 * @param nms - namespace
	 * @param [cacheKey] - cache key
	 */
	create(nms: K, cacheKey?: string): Dictionary<V> {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const cache = this.dict[nms] ?? Object.createDict<V>();
		this.dict[nms] = cache;

		if (cacheKey != null) {
			cache[cacheKey] = cache[cacheKey] ?? Object.createDict<V>();
			return cache[cacheKey];
		}

		return Object.cast(cache);
	}
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Cache helper
 */
export default class Cache<T extends string = string> {
	/**
	 * Cache dictionary
	 */
	dict: Dictionary = Object.createDict();

	/**
	 * @param [namespaces] - predefined namespaces
	 */
	constructor(namespaces?: string[]) {
		$C(namespaces).forEach((el) => {
			this.dict[el] = Object.createDict();
		});
	}

	/**
	 * Creates a cache object by the specified parameters and returns it
	 */
	create(nms: T, cacheKey?: string): Dictionary {
		const
			cache = this.dict[nms] = this.dict[nms] || Object.createDict();

		if (cacheKey) {
			cache[cacheKey] = cache[cacheKey] || Object.createDict();
			return cache[cacheKey];
		}

		return cache;
	}
}

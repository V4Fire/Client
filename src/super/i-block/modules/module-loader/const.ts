/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Module } from 'super/i-block/modules/module-loader/interface';

export const
	cache = new Map<unknown, Module>(),
	cachedModules = <Module[]>[];

const set = cache.set.bind(cache);
cache.set = (key, value) => {
	if (cache.has(key)) {
		throw new Error(`A module with the "${String(key)}" id is already set`);
	}

	return set(key, value);
};

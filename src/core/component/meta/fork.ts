/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/interface';

/**
 * Creates a new meta object from the specified
 * @param base
 */
export function forkMeta(base: ComponentMeta): ComponentMeta {
	const
		meta = Object.create(base);

	meta.watchDependencies = new Map(meta.watchDependencies);
	meta.params = Object.create(base.params);
	meta.watchers = {};
	meta.hooks = {};

	for (let o = meta.hooks, p = base.hooks, keys = Object.keys(p), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			v = p[key];

		if (v != null) {
			o[key] = v.slice();
		}
	}

	for (let o = meta.watchers, p = base.watchers, keys = Object.keys(p), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			v = p[key];

		if (v != null) {
			o[key] = v.slice();
		}
	}

	return meta;
}

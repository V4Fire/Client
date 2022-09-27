/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/interface';

/**
 * Creates a new meta object based on the specified
 * @param base
 */
export function forkMeta(base: ComponentMeta): ComponentMeta {
	const
		meta = Object.create(base);

	meta.watchDependencies = new Map(meta.watchDependencies);
	meta.params = Object.create(base.params);
	meta.watchers = {};
	meta.hooks = {};

	Object.entries(base.hooks).forEach(([key, val]) => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (val != null) {
			meta.hooks[key] = val.slice();
		}
	});

	Object.entries(base.watchers).forEach(([key, val]) => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (val != null) {
			meta.watchers[key] = val.slice();
		}
	});

	return meta;
}

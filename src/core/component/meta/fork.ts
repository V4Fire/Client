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

	Object.entries(base.hooks).forEach(([key, hooks]) => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (hooks != null) {
			meta.hooks[key] = hooks.slice();
		}
	});

	Object.entries(base.watchers).forEach(([key, watchers]) => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (watchers != null) {
			meta.watchers[key] = watchers.slice();
		}
	});

	return meta;
}

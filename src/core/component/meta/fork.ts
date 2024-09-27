/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/interface';

/**
 * Forks the metaobject of the passed component and returns the copy
 * @param base
 */
export function forkMeta(base: ComponentMeta): ComponentMeta {
	const meta = Object.create(base);

	meta.params = Object.create(base.params);
	meta.watchDependencies = new Map(meta.watchDependencies);

	meta.tiedFields = {...meta.tiedFields};
	meta.hooks = {};

	Object.entries(base.hooks).forEach(([name, handlers]) => {
		meta.hooks[name] = handlers.slice();
	});

	meta.watchers = new Map();

	for (const [name, watchers] of base.watchers) {
		meta.watchers.set(name, watchers.slice());
	}

	return meta;
}

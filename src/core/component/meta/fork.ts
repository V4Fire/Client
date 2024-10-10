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

	const hookNames = Object.keys(base.hooks);

	for (let i = 0; i < hookNames.length; i++) {
		const name = hookNames[i];
		meta.hooks[name] = base.hooks[name].slice();
	}

	meta.watchers = {};

	const watcherNames = Object.keys(base.watchers);

	for (let i = 0; i < watcherNames.length; i++) {
		const
			name = hookNames[i],
			watchers = base.watchers[name];

		if (watchers != null) {
			meta.watchers[name] = watchers.slice();
		}
	}

	return meta;
}

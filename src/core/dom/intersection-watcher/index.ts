/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/dom/intersection-watcher/README.md]]
 * @packageDocumentation
 */

import { unimplement } from 'core/functools/implementation';
import IntersectionWatcher from 'core/dom/intersection-watcher/engines';

export * from 'core/dom/intersection-watcher/interface';
export { IntersectionWatcher as default };

const intersectionWatcher = SSR ?
	{
		watch: () => unimplement({name: 'watch', type: 'function'}),
		unwatch: () => unimplement({name: 'unwatch', type: 'function'})
	} :

	new IntersectionWatcher();

export const
	watch = intersectionWatcher.watch.bind(intersectionWatcher),
	unwatch = intersectionWatcher.unwatch.bind(intersectionWatcher);

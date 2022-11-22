/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/dom/resize-watcher/README.md]]
 * @packageDocumentation
 */

import { IS_NODE } from 'core/env';
import { unimplement } from 'core/functools/implementation';

import ResizeWatcher from 'core/dom/resize-watcher/class';

export * from 'core/dom/resize-watcher/interface';
export { ResizeWatcher as default };

const resizeWatcher = IS_NODE ?
	{
		watch: () => unimplement({name: 'watch', type: 'function'}),
		unwatch: () => unimplement({name: 'unwatch', type: 'function'})
	} :

	new ResizeWatcher();

export const
	watch = resizeWatcher.watch.bind(resizeWatcher),
	unwatch = resizeWatcher.unwatch.bind(resizeWatcher);

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

import ResizeWatcher from 'core/dom/resize-watcher/class';

export * from 'core/dom/resize-watcher/interface';
export { ResizeWatcher as default };

const
	resizeWatcher = new ResizeWatcher();

export const
	watch = resizeWatcher.watch.bind(resizeWatcher),
	unwatch = resizeWatcher.unwatch.bind(resizeWatcher);

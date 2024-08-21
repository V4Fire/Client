/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DynamicHandlers } from 'core/component/watch/interface';

export const
	dynamicHandlers: DynamicHandlers = new WeakMap(),
	immediateDynamicHandlers: DynamicHandlers = new WeakMap();

export const
	tiedWatchers = Symbol('A list of tied watchers'),
	watcherInitializer = Symbol('The watcher initializer');

export const
	cacheStatus = Symbol('Cache status'),
	toComponentObject = Symbol('A link to the component object');

export const
	customWatcherRgxp = /^([!?]?)([^!:?]*):(.*)/,
	isCustomWatcher = {test: (path: string): boolean => path.includes(':')};

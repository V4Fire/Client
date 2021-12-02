/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DynamicHandlers } from '@src/core/component/watch/interface';

export const
	dynamicHandlers: DynamicHandlers = new WeakMap(),
	immediateDynamicHandlers: DynamicHandlers = new WeakMap();

export const
	tiedWatchers = Symbol('List of tied watchers'),
	watcherInitializer = Symbol('Watcher initializer'),
	toComponentObject = Symbol('Link to a component object');

export const
	cacheStatus = Symbol('Cache status'),
	fakeCopyLabel = Symbol('Fake copy label');

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/;

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';

/**
 * Map of handlers to watch dynamic fields, like accessors and computedFields
 */
export const dynamicHandlers = new WeakMap<ComponentInterface, Dictionary<Set<Function>>>();

export const
	watcherInitializer = Symbol('Watcher initializer'),
	toComponentObject = Symbol('Link to a component object');

export const
	cacheStatus = Symbol('Cache status'),
	fakeCopyLabel = Symbol('Fake copy label');

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/;

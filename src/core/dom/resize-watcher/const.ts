/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import type { Watcher, WatchHandler } from 'core/dom/resize-watcher/interface';

export const
	registeredWatchers = new WeakMap<Element, Map<WatchHandler, Watcher>>(),
	asyncTasks = new Async();

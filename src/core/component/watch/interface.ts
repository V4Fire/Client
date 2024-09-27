/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type { ComponentInterface, PropertyInfo, WatchObject } from 'core/component/interface';

export type DynamicHandlers = WeakMap<
	ComponentInterface,
	Dictionary<Set<Function>>
>;

export interface BindRemoteWatchersParams<A extends object = ComponentInterface> {
	/**
	 * A link to the `Async` instance
	 */
	async?: Async<A>;

	/**
	 * A dictionary with watchers
	 */
	watchers?: Map<string, WatchObject[]>;

	/**
	 * Information object of a property to watch
	 */
	info?: PropertyInfo;
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import { ComponentInterface, PropertyInfo, WatchObject } from 'core/component/interface';

export type DynamicHandlers = WeakMap<
	ComponentInterface,
	Dictionary<Set<Function>>
>;

export interface BindRemoteWatchersParams<A extends object = ComponentInterface> {
	/**
	 * Link to an instance of Async
	 */
	async?: Async<A>;

	/**
	 * Dictionary of watchers
	 */
	watchers?: Dictionary<WatchObject[]>;

	/**
	 * Information object about a property to watch
	 */
	info?: PropertyInfo;
}

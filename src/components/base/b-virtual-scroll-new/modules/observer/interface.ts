/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MountedItem } from 'components/base/b-virtual-scroll-new/interface';

/**
 * Interface representing an observer engine for watching components entering the viewport.
 */
export interface ObserverEngine {
	/**
	 * Initializes a watcher to track when components enter the viewport.
	 *
	 * @param components - An array of mounted items to be watched.
	 */
	watchForIntersection(components: MountedItem[]): void;

	/**
	 * Resets the state of the observer engine.
	 * This can be used to clear any existing observers and reset the module to its initial state.
	 */
	reset(): void;
}

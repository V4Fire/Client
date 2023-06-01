/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MountedComponentItem } from 'components/base/b-scrolly/interface';

export interface ObserverEngine {
	/**
	 * Initializes a watcher to watch component enters the viewport
	 * @param components
	 */
	watchForIntersection(components: MountedComponentItem[]): void;

	/**
	 * Resets the module state
	 */
	reset(): void;
}


/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { MountedChild } from 'components/base/b-virtual-scroll/interface';
import { observerAsyncGroup } from 'components/base/b-virtual-scroll/modules/observer/const';
import type { ObserverEngine } from 'components/base/b-virtual-scroll/modules/observer/interface';
import Friend from 'components/friends/friend';

export default class ScrollObserver extends Friend implements ObserverEngine {

	/**
	 * {@link bVirtualScroll}
	 */
	override readonly C!: bVirtualScroll;

	/**
	 * @inheritdoc
	 */
	watchForIntersection(_components: MountedChild[]): void {
		// ...
	}

	/**
	 * @inheritdoc
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

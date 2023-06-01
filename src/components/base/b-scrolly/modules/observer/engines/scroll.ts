/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { MountedComponentItem } from 'components/base/b-scrolly/interface';
import { observerAsyncGroup } from 'components/base/b-scrolly/modules/observer/const';
import type { ObserverEngine } from 'components/base/b-scrolly/modules/observer/interface';
import Friend from 'components/friends/friend';

export default class ScrollObserver extends Friend implements ObserverEngine {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	/**
	 * @inheritdoc
	 */
	watchForIntersection(_components: MountedComponentItem[]): void {
		// ...
	}

	/**
	 * @inheritdoc
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

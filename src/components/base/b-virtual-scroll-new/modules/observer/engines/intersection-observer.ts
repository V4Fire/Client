/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { MountedChild } from 'components/base/b-virtual-scroll-new/interface';

import { observerAsyncGroup } from 'components/base/b-virtual-scroll-new/modules/observer/const';
import type { ObserverEngine } from 'components/base/b-virtual-scroll-new/modules/observer/interface';

export default class IoObserver extends Friend implements ObserverEngine {
	/** @inheritDoc */
	declare readonly C: bVirtualScrollNew;

	/**
	 * {@link ObserverEngine.watchForIntersection}
	 * @param components
	 */
	watchForIntersection(components: MountedChild[]): void {
		const {ctx} = this;

		for (const component of components) {
			ctx.dom.watchForIntersection(component.node, {
				group: observerAsyncGroup,
				label: component.childIndex.toString(),
				once: true,
				threshold: 0.00001,
				delay: 0
			}, () => ctx.onElementEnters(component));
		}
	}

	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

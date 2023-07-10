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

export default class IoObserver extends Friend implements ObserverEngine {

	/**
	 * {@link bVirtualScroll}
	 */
	override readonly C!: bVirtualScroll;

	/**
	 * {@link ObserverEngine.watchForIntersection}
	 * @param components
	 */
	watchForIntersection(components: MountedChild[]): void {
		const
			{ctx} = this;

		for (const component of components) {
			ctx.dom.watchForIntersection(component.node, {
				group: observerAsyncGroup,
				label: component.key,
				once: true,
				delay: 0
			}, () => ctx.onElementEnters(component));
		}
	}

	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

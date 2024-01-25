/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'super/i-block/modules/friend';

import type bVirtualScroll2 from 'base/b-virtual-scroll-2/b-virtual-scroll-2';
import type { MountedChild } from 'base/b-virtual-scroll-2/interface';

import { observerAsyncGroup } from 'base/b-virtual-scroll-2/modules/observer/const';
import type { ObserverEngine } from 'base/b-virtual-scroll-2/modules/observer/interface';

export default class IoObserver extends Friend implements ObserverEngine {

	/**
	 * {@link bVirtualScroll}
	 */
	override readonly C!: bVirtualScroll2;

	/**
	 * {@link ObserverEngine.watchForIntersection}
	 * @param components
	 */
	watchForIntersection(components: MountedChild[]): void {
		const
			{ctx} = this;

		for (const component of components) {
			ctx.dom.watchForIntersection(component.node, {
				once: true,
				delay: 0,
				threshold: 0.00001,
				callback: () => ctx.onElementEnters(component)
			}, {
				group: observerAsyncGroup,
				label: component.key,
			});
		}
	}

	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

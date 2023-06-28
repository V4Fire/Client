/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { MountedChild } from 'components/base/b-scrolly/interface';
import { observerAsyncGroup } from 'components/base/b-scrolly/modules/observer/const';
import type { ObserverEngine } from 'components/base/b-scrolly/modules/observer/interface';
import { Friend } from 'super/i-data/i-data';

export default class IoObserver extends Friend implements ObserverEngine {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	/**
	 * @inheritdoc
	 */
	watchForIntersection(components: MountedChild[]): void {
		const
			{ctx} = this;

		for (const component of components) {
			ctx.dom.watchForIntersection(component.node, {
				once: true,
				delay: 0,
				onEnter: () => ctx.onElementEnters(component),
				threshold: 0.01
			}, {
				group: observerAsyncGroup,
				label: component.key
			});
		}
	}

	/**
	 * @inheritdoc
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

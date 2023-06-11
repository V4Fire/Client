/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { componentLocalEvents, componentObserverLocalEvents } from 'components/base/b-scrolly/const';
import type { AnyMounted } from 'components/base/b-scrolly/interface';
import { observerAsyncGroup } from 'components/base/b-scrolly/modules/observer/const';
import type { ObserverEngine } from 'components/base/b-scrolly/modules/observer/interface';
import Friend from 'components/friends/friend';

export default class IoObserver extends Friend implements ObserverEngine {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		ctx.componentEmitter.on(componentLocalEvents.resetState, () => this.reset());
	}

	/**
	 * @inheritdoc
	 */
	watchForIntersection(components: AnyMounted[]): void {
		const
			{ctx} = this;

		for (const component of components) {
			ctx.dom.watchForIntersection(component.node, {
				group: observerAsyncGroup,
				label: component.key,
				once: true,
				delay: 0
			}, () => ctx.componentEmitter.emit(componentObserverLocalEvents.elementEnter, component));
		}
	}

	/**
	 * @inheritdoc
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(observerAsyncGroup)});
	}
}

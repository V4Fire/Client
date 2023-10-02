/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { MountedChild } from 'components/base/b-virtual-scroll/interface';

import IoObserver from 'components/base/b-virtual-scroll/modules/observer/engines/intersection-observer';

export { default as IoObserver } from 'components/base/b-virtual-scroll/modules/observer/engines/intersection-observer';

/**
 * Observer class for `bVirtualScroll` component.
 * It provides observation capabilities using different engines such as IoObserver and ScrollObserver.
 */
export class Observer extends Friend {
	override readonly C!: bVirtualScroll;

	/**
	 * The observation engine used by the Observer.
	 */
	protected engine: IoObserver;

	/**
	 * @param ctx - the `bVirtualScroll` component instance.
	 */
	constructor(ctx: bVirtualScroll) {
		super(ctx);

		this.engine = new IoObserver(ctx);
	}

	/**
	 * Starts observing the specified mounted elements
	 * @param mounted - an array of elements to be observed.
	 */
	observe(mounted: MountedChild[]): void {
		const
			{ctx} = this;

		if (ctx.disableObserver) {
			return;
		}

		this.engine.watchForIntersection(mounted);
	}

	/**
	 * Resets the module state
	 */
	reset(): void {
		this.engine.reset();
	}
}

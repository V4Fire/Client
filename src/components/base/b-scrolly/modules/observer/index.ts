/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { MountedChild } from 'components/base/b-scrolly/interface';
import ScrollObserver from 'components/base/b-scrolly/modules/observer/engines/scroll';
import IoObserver from 'components/base/b-scrolly/modules/observer/engines/intersection-observer';
import { Friend } from 'super/i-data/i-data';

export { default as IoObserver } from 'components/base/b-scrolly/modules/observer/engines/intersection-observer';
export { default as ScrollObserver } from 'components/base/b-scrolly/modules/observer/engines/scroll';

/**
 * Observer class for `bScrolly` component.
 * It provides observation capabilities using different engines such as IoObserver and ScrollObserver.
 */
export class Observer extends Friend {
	override readonly C!: bScrolly;

	/**
	 * The observation engine used by the Observer.
	 * It can be either an {@link IoObserver} or {@link ScrollObserver} instance.
	 */
	protected engine?: IoObserver | ScrollObserver;

	/**
	 * Starts observing the specified mounted elements.
	 * @param mounted - An array of elements to be observed.
	 */
	observe(mounted: MountedChild[]): void {
		const
			{ctx} = this;

		if (this.engine == null) {
			this.engine = ctx.componentStrategy === 'intersectionObserver' ?
				new IoObserver(ctx) :
				new ScrollObserver(ctx);
		}

		if (ctx.disableObserver) {
			return;
		}

		this.engine.watchForIntersection(mounted);
	}

	/**
	 * Resets the module state.
	 */
	reset(): void {
		this.engine?.reset();
	}
}

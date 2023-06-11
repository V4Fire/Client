/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { AnyMounted } from 'components/base/b-scrolly/interface';
import ScrollObserver from 'components/base/b-scrolly/modules/observer/engines/scroll';
import IoObserver from 'components/base/b-scrolly/modules/observer/engines/intersection-observer';
import Friend from 'components/friends/friend';

export { default as IoObserver } from 'components/base/b-scrolly/modules/observer/engines/intersection-observer';
export { default as ScrollObserver } from 'components/base/b-scrolly/modules/observer/engines/scroll';

export class Observer extends Friend {
		/**
		 * {@link bScrolly}
		 */
		override readonly C!: bScrolly;

		/**
		 * Observe engine
		 */
		protected engine: IoObserver | ScrollObserver;

		/**
		 * @param ctx
		 */
		constructor(ctx: bScrolly) {
			super(ctx);

			this.engine = ctx.componentStrategy === 'intersectionObserver' ?
				new IoObserver(ctx) :
				new ScrollObserver(ctx);
		}

		/**
		 * @param mounted
		 */
		observe(mounted: AnyMounted[]): void {
			const
				{ctx} = this;

			if (ctx.disableObserver) {
				return;
			}

			this.engine.watchForIntersection(mounted);
		}
}

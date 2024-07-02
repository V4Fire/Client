/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type Transition from 'components/base/b-router/modules/transition/class';
import type { ScrollSnapshot } from 'components/base/b-router/modules/transition/interface';

const
	$$ = symbolGenerator();

export default class ScrollControl {
	/**
	 * The transition instance
	 */
	protected transition: Transition;

	/**
	 * User's scroll position.
	 * It is initialized after the `beforeChange` event.
	 */
	protected snapshot: ScrollSnapshot;

	constructor(transition: Transition) {
		this.transition = transition;
	}

	/**
	 * Returns the user's scroll position snapshot
	 */
	getSnapshot(): ScrollSnapshot {
		return this.snapshot;
	}

	/**
	 * Stores the user's scroll position for the specific time moment
	 */
	createSnapshot(): void {
		if (this.snapshot) {
			return;
		}

		this.snapshot = Object.freeze({
			meta: Object.freeze({
				scroll: Object.freeze({
					x: typeof scrollX === 'undefined' ? 0 : scrollX,
					y: typeof scrollY === 'undefined' ? 0 : scrollY
				})
			})
		});
	}

	/**
	 * This method updates the current route's scroll position.
	 * To save the scroll position before switching to a new route,
	 * we need to emit a system `replace` transition with additional information about the scroll.
	 */
	async updateCurrentRouteScroll(): Promise<void> {
		if (!SSR && this.transition.currentEngineRoute && this.transition.getMethod() !== 'replace') {
			const currentRouteWithScroll = Object.mixin(true, undefined, this.transition.currentEngineRoute, this.snapshot);

			if (!Object.fastCompare(this.transition.currentEngineRoute, currentRouteWithScroll)) {
				await this.transition.engine.replace(this.transition.getEngineRoute()!, currentRouteWithScroll);
			}
		}
	}

	/**
	 * Restores the scroll position
	 * @param reset
	 */
	restore(reset: boolean): void {
		const
			{meta} = this.transition.newRouteInfo ?? {};

		if (SSR || !meta || meta.autoScroll === false) {
			return;
		}

		const
			{component} = this.transition;

		(async () => {
			const label = {
				label: $$.autoScroll
			};

			try {
				await component.nextTick(label);
				setScroll();

				// Restoring the scroll for dynamic height components
				await component.async.sleep(10, label);
				setScroll();
			} catch {}
		})().catch(stderr);

		function setScroll() {
			const
				s = meta!.scroll;

			if (s != null) {
				component.r.scrollTo(s.x, s.y);

			} else if (reset) {
				component.r.scrollTo(0, 0);
			}
		}
	}
}

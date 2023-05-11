
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import { $$ } from 'components/form/b-select/const';
import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

export default class Overlay extends Friend {
	override readonly C!: bBottomSlide;

	/**
	 * Current value of the overlay opacity
	 */
	protected opacity: number = 0;

	/**
	 * This method sets the opacity of the overlay and updates it's CSS
	 * @param opacity
	 */
	setOpacity(opacity: number): CanPromise<void> {
		this.opacity = opacity;
		void this.updateOverlayStyle();
	}

	/**
	 * Updates opacity for the overlay during animation
	 */
	animateOpacityKeyframe(): CanPromise<void> {
		return this.ctx.waitComponentStatus('ready', () => {
			const
				{ctx} = this,
				{$refs: {overlay}, maxOpacity, geometry} = ctx;

			if (!overlay || maxOpacity < 0) {
				return;
			}

			const
				lastStepOffset = geometry.getStepOffset(ctx.stepCount - 1),
				penultimateStepOffset = geometry.getStepOffset(ctx.stepCount - 2),
				{offset} = geometry;

			if (!Object.isNumber(penultimateStepOffset) || penultimateStepOffset > offset) {
				return;
			}

			const
				p = (lastStepOffset - penultimateStepOffset) / 100,
				currentP = (lastStepOffset - offset) / p;

			const
				calculatedOpacity = maxOpacity - (maxOpacity / 100 * currentP),
				nextOpacity = Math.min(calculatedOpacity, maxOpacity);

			const
				diffExceedsRenderTreshold = Math.abs(this.opacity - nextOpacity) >= 0.025;

			if (diffExceedsRenderTreshold) {
				void this.setOpacity(nextOpacity);
			}

		}, {label: $$.performOpacity});
	}

	/**
	 * Updates an opacity of the overlay node
	 */
	protected updateOverlayStyle(): CanPromise<void> {
		return this.ctx.waitComponentStatus('ready', () => {
			const {overlay} = this.ctx.$refs;

			if (!(overlay instanceof HTMLElement)) {
				return;
			}

			overlay.style.setProperty('opacity', String(this.opacity));
		}, {label: $$.updateOpacity});
	}
}


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
	 * This method sets new opacity of the overlay and updates it's CSS
	 * @param opacity
	 */
	setOpacity(opacity: number): CanPromise<void> {
		this.opacity = opacity;
		void this.updateOverlayStyle();
	}

	/**
	 * Tries to set next opacity for the overlay during animation
	 */
	animateOpacityFrame(): CanPromise<void> {
		return this.ctx.waitComponentStatus('ready', () => {
			const
				{ctx} = this,
				{$refs: {overlay}, maxOpacity} = ctx;

			if (!overlay || maxOpacity < 0) {
				return;
			}

			const
				stepLength = ctx.steps.length,
				lastStep = ctx.stepsInPixels[stepLength - 1],
				penultimateStep = ctx.stepsInPixels[stepLength - 2];

			if (!Object.isNumber(penultimateStep) || penultimateStep > ctx.offset) {
				return;
			}

			const
				p = (lastStep - penultimateStep) / 100,
				currentP = (lastStep - ctx.offset) / p;

			const
				calculatedOpacity = maxOpacity - maxOpacity / 100 * currentP,
				nextOpacity = calculatedOpacity > maxOpacity ? maxOpacity : calculatedOpacity;

			const
				diffExceedsTreshold = Math.abs(this.opacity - nextOpacity) >= 0.025;

			if (diffExceedsTreshold) {
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

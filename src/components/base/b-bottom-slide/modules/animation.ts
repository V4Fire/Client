
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

export default class Animation extends Friend {
	override readonly C!: bBottomSlide;

	/**
	 * True if all animations need to use requestAnimationFrame
	 */
	protected get shouldUseRAF(): boolean {
		return this.ctx.browser.is.iOS === false;
	}

	/**
	 * True if element positions are being updated now
	 */
	protected isPositionUpdating: boolean = false;

	/**
	 * Initializes the animation of component elements moving
	 */
	animateMoving(): void {
		if (this.isPositionUpdating && this.shouldUseRAF) {
			return;
		}

		this.performMoving();
	}

	/**
	 * Performs the animation of component elements moving
	 */
	performMoving(): void {
		this.isPositionUpdating = true;

		if (this.shouldUseRAF) {
			this.async.requestAnimationFrame(() => {
				if (this.isPositionUpdating) {
					this.ctx.updateKeyframeValues();
					this.performMoving();
				}
			}, {label: $$.performMovingAnimation});

		} else {
			this.ctx.updateKeyframeValues();
		}
	}

	/**
	 * Stops the animation of component elements moving
	 */
	stopMoving(): void {
		this.async.clearAnimationFrame({label: $$.performMovingAnimation});
		this.isPositionUpdating = false;
		this.ctx.diff = 0;
	}
}

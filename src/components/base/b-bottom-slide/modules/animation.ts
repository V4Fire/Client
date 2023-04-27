
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
	 * Difference in a cursor position compared to the last frame
	 */
	protected diff: number = 0;

	/**
	 * Initializes the animation of component elements moving
	 * @param diff
	 */
	startMoving(diff: number): void {
		if (!this.isPositionUpdating || !this.shouldUseRAF) {
			this.performMoving();
		}

		this.diff += diff;
	}

	/**
	 * Stops the animation of component elements moving
	 */
	stopMoving(): void {
		this.async.clearAnimationFrame({label: $$.performMovingAnimation});
		this.isPositionUpdating = false;
		this.diff = 0;
	}

	/**
	 * Performs the animation of component elements moving
	 */
	protected performMoving(): void {
		this.isPositionUpdating = true;

		if (this.shouldUseRAF) {
			this.async.requestAnimationFrame(() => {
				if (this.isPositionUpdating) {
					this.updateKeyframeValues();
					this.performMoving();
				}
			}, {label: $$.performMovingAnimation});

		} else {
			this.updateKeyframeValues();
		}
	}

	/**
	 * Updates CSS values of component elements
	 */
	protected updateKeyframeValues(): void {
		const
			{ctx} = this,
			isMaxNotReached = ctx.geometry.windowHeight >= ctx.offset + this.diff;

		if (isMaxNotReached) {
			ctx.offset += this.diff;
			ctx.isPulling = true;

			void ctx.updateWindowPosition();
		}

		void ctx.performOpacity();
		this.diff = 0;
	}
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';
import type { Direction } from 'components/base/b-bottom-slide/interface';

export default class SwipeControl extends Friend {
	/** @inheritDoc */
	declare readonly C: bBottomSlide;

	/**
	 * Current cursor direction
	 */
	protected direction: Direction = 0;

	/**
	 * Timestamp of a start touch on the component
	 */
	protected startTime: number = 0;

	/**
	 * Y position of a start touch on the component
	 */
	protected startY: number = 0;

	/**
	 * Current Y position of the touch
	 */
	protected currentY: number = 0;

	/**
	 * End Y position of the touch
	 */
	protected endY: number = 0;

	/**
	 * True if content is pulled by using the trigger
	 */
	protected byTrigger: boolean = false;

	/**
	 * This method should be used to notify about offset changes
	 * @param offset
	 */
	notifyOffsetChanged(offset: number): void {
		this.endY = offset;
	}

	/**
	 * Handler: start to pull the component
	 *
	 * @param e
	 * @param [isTrigger]
	 */
	onPullStart(e: TouchEvent, isTrigger: boolean = false): void {
		const
			touch = e.touches[0];

		this.byTrigger = isTrigger;
		this.startY = touch.clientY;
		this.startTime = performance.now();
	}

	/**
	 * Handler: the component is being pulled
	 * @param e
	 */
	onPull(e: TouchEvent): void {
		const
			{ctx} = this,
			{geometry} = ctx,
			{clientY} = e.touches[0];

		const
			diff = this.currentY > 0 ? this.currentY - clientY : 0;

		this.currentY = clientY;
		this.direction = <Direction>Math.sign(diff);

		const needAnimate =
			this.byTrigger ||
			!ctx.isFullyOpened ||
			(ctx.isViewportTopReached && (this.direction < 0 || geometry.offset < geometry.lastStepOffset));

		if (needAnimate) {
			ctx.animation.startMoving(diff);

			if (e.cancelable) {
				e.preventDefault();
				e.stopPropagation();
			}

			return;
		}

		ctx.animation.stopMoving();
	}

	/**
	 * Handler: the component has been released after pulling
	 */
	onPullEnd(): void {
		if (this.currentY === 0) {
			return;
		}

		const
			{ctx} = this,
			startEndDiff = Math.abs(this.startY - this.endY),
			endTime = performance.now();

		const isFastSwipe =
			endTime - this.startTime <= ctx.fastSwipeDelay &&
			startEndDiff >= ctx.fastSwipeThreshold;

		const notScroll = isFastSwipe && (
			!ctx.isFullyOpened ||
			ctx.isViewportTopReached ||
			this.byTrigger
		);

		const
			isThresholdPassed = !isFastSwipe && startEndDiff >= ctx.swipeThreshold;

		ctx.animation.stopMoving();
		this.moveToClosest(notScroll, isThresholdPassed);

		this.endY += this.startY - this.currentY;
		this.byTrigger = false;

		this.currentY = 0;
	}

	/**
	 * Moves the component to the nearest step relative to the current position
	 *
	 * @param respectDirection - if true, then when searching for a new step to change,
	 * the cursor direction will be taken into account, but not the nearest step
	 *
	 * @param isThresholdPassed - if true, then the minimum threshold to change a step is passed
	 */
	protected moveToClosest(respectDirection: boolean, isThresholdPassed: boolean): void {
		const
			{direction, ctx} = this,
			{geometry} = ctx;

		if (ctx.heightMode === 'content') {
			if (!respectDirection && isThresholdPassed) {
				void ctx[geometry.contentHeight / 2 < geometry.offset ? 'next' : 'prev']();

			} else if (respectDirection) {
				void ctx[direction > 0 ? 'next' : 'prev']();
			}

		} else {
			let
				step = 0;

			if (!respectDirection) {
				let
					min: CanUndef<number> = undefined;

				for (let i = 0; i < ctx.stepCount; i++) {
					const
						res = Math.abs(geometry.offset - geometry.getStepOffset(i));

					if (!Object.isNumber(min) || min > res) {
						min = res;
						step = i;
					}
				}

			} else {
				let i = 0;

				for (; i < ctx.stepCount; i++) {
					const
						s = geometry.getStepOffset(i);

					if (s > geometry.offset) {
						break;
					}
				}

				if (direction > 0) {
					step = i > ctx.stepCount - 1 ? i - 1 : i;

				} else {
					step = i === 0 ? i : i - 1;
				}
			}

			const
				prevStep = ctx.step;

			if (step === 0) {
				ctx.close().catch(stderr);

			} else if (prevStep === 0) {
				ctx.open(step).catch(stderr);

			} else {
				ctx.step = step;
			}

		}

		ctx.stickToStep();
	}
}


/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import { $$ } from 'components/base/b-bottom-slide/const';
import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

export default class Geometry extends Friend {
	override readonly C!: bBottomSlide;

	/**
	 * Window height
	 */
	get windowHeight(): number {
		return document.documentElement.clientHeight;
	}

	/** @see [[Geometry.contentHeightStore]] */
	get contentHeight(): number {
		return this.contentHeightStore;
	}

	/** @see [[Geometry.contentMaxHeightStore]] */
	get contentMaxHeight(): number {
		return this.contentMaxHeightStore;
	}

	/**
	 * Current component offset
	 */
	get offset(): number {
		return this.offsetStore;
	}

	/**
	 * Sets a new component offset
	 */
	protected set offset(value: number) {
		const
			lastStepOffset = <CanUndef<number>>this.lastStepOffset;

		if (lastStepOffset != null && value > lastStepOffset) {
			value = lastStepOffset;
		}

		this.offsetStore = value;
		this.ctx.swipeControl.notifyOffsetChanged(value);
	}

	/**
	 * Last step offset (in pixels)
	 */
	get lastStepOffset(): number {
		return this.stepsInPixels[this.stepsInPixels.length - 1];
	}

	/**
	 * Current step offset (in pixels)
	 */
	get currentStepOffset(): number {
		return this.stepsInPixels[this.ctx.step];
	}

	/** @see [[Geometry.offset]] */
	protected offsetStore: number = 0;

	/**
	 * List of possible component positions relative to the screen height (in pixels)
	 */
	protected stepsInPixels: number[] = [];

	/**
	 * The maximum content height (in pixels)
	 */
	protected contentMaxHeightStore: number = 0;

	/**
	 * Content height (in pixels)
	 */
	protected contentHeightStore: number = 0;

	/**
	 * Sets the new offset
	 * @param offset
	 */
	setOffset(offset: number): void {
		this.offset = offset;
	}

	/**
	 * Increments offset by the specified delta
	 * @param delta
	 */
	incrementOffset(delta: number): void {
		this.offset += delta;
	}

	/**
	 * Returns the offset in px for the specified step
	 * @param step
	 */
	getStepOffset(step: number): number {
		return this.stepsInPixels[step] ?? 0;
	}

	/**
	 * Sets new offset for the provided step
	 * @param step
	 */
	setOffsetForStep(step: number): void {
		this.offset = this.stepsInPixels[step];
	}

	/**
	 * Initializes geometry of the elements
	 */
	async init(): Promise<void> {
		const {ctx} = this;

		const [header, content, view, window] = await Promise.all([
			ctx.waitRef<HTMLElement>('header', {label: $$.initGeometry}),
			ctx.waitRef<HTMLElement>('content'),
			ctx.waitRef<HTMLElement>('view'),
			ctx.waitRef<HTMLElement>('window')
		]);

		const
			{maxVisiblePercent} = ctx;

		const
			currentPage = ctx.history.current?.content;

		if (ctx.heightMode === 'content' && currentPage?.initBoundingRect) {
			const
				currentContentPageHeight = currentPage.el.scrollHeight;

			if (content.clientHeight !== currentContentPageHeight) {
				content.style.height = currentContentPageHeight.px;
			}
		}

		const
			maxVisiblePx = this.windowHeight * (maxVisiblePercent / 100),
			contentHeight = view.clientHeight + header.clientHeight;

		this.contentHeightStore = contentHeight > maxVisiblePx ? maxVisiblePx : contentHeight;
		this.contentMaxHeightStore = maxVisiblePx;

		if (currentPage) {
			Object.assign((<HTMLElement>currentPage.el).style, {
				maxHeight: (maxVisiblePx === 0 ? 0 : (maxVisiblePx - header.clientHeight)).px
			});
		}

		Object.assign(window.style, {
			// If documentElement height is equal to zero, maxVisiblePx is always be zero too,
			// even after new calling of initGeometry.
			// Also, view.clientHeight above would return zero as well, even though the real size is bigger.
			maxHeight: maxVisiblePx === 0 ? undefined : maxVisiblePx.px
		});

		this.bakeSteps();
	}

	/**
	 * Bakes values of steps in pixels
	 */
	protected bakeSteps(): void {
		this.stepsInPixels = this.ctx.steps.map((s) => (s / 100 * this.windowHeight));
	}
}

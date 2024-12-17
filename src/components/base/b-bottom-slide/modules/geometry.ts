/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import Friend from 'components/friends/friend';

import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

const
	$$ = symbolGenerator();

export default class Geometry extends Friend {
	/** @inheritDoc */
	declare readonly C: bBottomSlide;

	/**
	 * Window height
	 */
	get windowHeight(): number {
		// Cache clientHeight to prevent browser reflow
		if (this.windowHeightStore === 0) {
			this.windowHeightStore = document.documentElement.clientHeight;
		}

		return this.windowHeightStore;
	}

	/**
	 * The maximum content height (in pixels)
	 */
	get contentHeight(): number {
		return this.contentHeightStore;
	}

	/**
	 * Content height (in pixels)
	 */
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
	 * @param value
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

	/** {@link Geometry.offset} */
	protected offsetStore: number = 0;

	/**
	 * A list of possible component positions relative to the screen height (in pixels)
	 */
	protected stepsInPixels: number[] = [];

	/** {@link Geometry.windowHeight} */
	protected windowHeightStore: number = 0;

	/** {@link Geometry.contentHeight} */
	protected contentHeightStore: number = 0;

	/** {@link Geometry.contentMaxHeight} */
	protected contentMaxHeightStore: number = 0;

	/**
	 * Sets a new offset
	 * @param offset
	 */
	setOffset(offset: number): void {
		this.offset = offset;
	}

	/**
	 * Increments the offset by the specified delta
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
	 * Sets a new offset for the provided step
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

		this.windowHeightStore = document.documentElement.clientHeight;

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

		if (ctx.heightMode === 'content' && currentPage?.initBoundingRect != null) {
			const
				currentContentPageHeight = currentPage.el.scrollHeight;

			if (content.clientHeight !== currentContentPageHeight) {
				content.style.height = currentContentPageHeight.px;
			}
		}

		const
			maxVisiblePx = this.windowHeight * (maxVisiblePercent / 100),
			contentHeight = view.clientHeight + header.clientHeight;

		this.contentHeightStore = Math.min(contentHeight, maxVisiblePx);
		this.contentMaxHeightStore = maxVisiblePx;

		if (currentPage) {
			Object.assign((<HTMLElement>currentPage.el).style, {
				maxHeight: (maxVisiblePx === 0 ? 0 : (maxVisiblePx - header.clientHeight)).px
			});
		}

		Object.assign(window.style, {
			// If the height of documentElement is zero, the maxVisiblePx value will also always be zero,
			// even after calling init again.
			// Furthermore, view.clientHeight will return zero too, even if the actual size is larger.
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

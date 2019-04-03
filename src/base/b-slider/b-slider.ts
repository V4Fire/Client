/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component, system, hook, watch, wait, prop } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

/**
 * -1 - Previous
 * 0 - Not changed
 * 1 - Next
 */
export type SlideDirection = number;

export interface SlideRect extends ClientRect {
	offsetLeft: number;
}

export const
	$$ = symbolGenerator();

export const alignTypes = {
	start: true,
	center: true,
	end: true,
	none: true
};

export const sliderModes = {
	scroll: true,
	slider: true
};

export type AlignType = keyof typeof alignTypes;
export type Mode = keyof typeof sliderModes;

/**
 * Returns true if the specified value is in the range X > 0 && X <= 1
 * @param v
 */
export function isBetweenZeroAndOne(v: number): boolean {
	return v > 0 && v <= 1;
}

/**
 * Returns true if the specified value is greater than 0 and is not infinite
 * @param v
 */
export function isNotInfinitePositiveNumber(v: number): boolean {
	return v > 0 && Number.isFinite(v);
}

@component({functional: true})
export default class bSlider extends iBlock {
	/**
	 * Slider mode
	 *   *) scroll - scroll will be used
	 *   *) slider - slider implementation will be used (it is impossible to skip slides)
	 */
	@prop({type: String, validator: (v) => Boolean(sliderModes[v])})
	readonly mode: Mode = 'slider';

	/**
	 * Slide alignment type
	 *   *) none - only works for mode === 'scroll'
	 */
	@prop({type: String, validator: (v) => Boolean(alignTypes[v])})
	readonly align: AlignType = 'center';

	/**
	 * How much does the shift along the X axis correspond to the movement of the finger
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly deltaX: number = 0.9;

	/**
	 * The minimum required percentage to scroll the slider to another slide
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly threshold: number = 0.3;

	/**
	 * The minimum required percentage for the scroll slider to another slide in fast motion on slider
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly fastSwipeThreshold: number = 0.05;

	/**
	 * Время (в секундах) после которого можно засчитывать что это был быстрый свайп
	 */
	@prop({type: Number, validator: isNotInfinitePositiveNumber})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum displacement threshold along the X axis at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: isNotInfinitePositiveNumber})
	readonly swipeToleranceX: number = 10;

	/**
	 * The minimum Y offset threshold at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: isNotInfinitePositiveNumber})
	readonly swipeToleranceY: number = 50;

	/**
	 * The number of slides in the slider
	 */
	@system()
	length: number = 0;

	/**
	 * Pointer to current slide
	 */
	@system()
	current: number = 0;

	/**
	 * true, if mode === 'slider'
	 */
	get isSlider(): boolean {
		return this.mode === 'slider';
	}

	/**
	 * Returns the current slider scroll
	 */
	get currentOffset(): number {
		const
			{slidesRects, current, align, viewRect} = this,
			slideRect = slidesRects[current];

		if (!slideRect || !viewRect) {
			return 0;
		}

		if (current === 0) {
			return 0;
		}

		switch (align) {
			case 'center':
				return slideRect.offsetLeft - (viewRect.width - slideRect.width) / 2;
			case 'start':
				return  slideRect.offsetLeft;
			case 'end':
				return slideRect.offsetLeft + slideRect.width;
			default:
				return 0;
		}
	}

	/** @override */
	protected $refs!: {
		view?: HTMLElement;
		wrapper?: HTMLElement;
	};

	/**
	 * X position of the first touch on the slider
	 */
	@system()
	protected startX: number = 0;

	/**
	 * Y position of the first touch on the slider
	 */
	@system()
	protected startY: number = 0;

	/**
	 * The difference between the position of the touch on the X axis at the beginning of the slide and at the end
	 */
	@system()
	protected diffX: number = 0;

	/**
	 * Is the minimum threshold for starting slide slides passed
	 * @see swipeTolerance
	 */
	@system()
	protected isTolerancePassed: boolean = false;

	/**
	 * Slide positions
	 */
	@system()
	protected slidesRects: SlideRect[] = [];

	/**
	 * Slider size and position
	 */
	@system()
	protected viewRect?: ClientRect;

	/**
	 * Stores the timestamp of the start of the touch on the slider
	 */
	@system()
	protected startTime: number = 0;

	/**
	 * Returns true if the user has started scrolling
	 */
	@system()
	protected scrolling: boolean = true;

	/** @override */
	protected tmp: {swiping?: boolean} = {};

	/**
	 * Updates slider state
	 */
	syncState(): void {
		const
			{view, wrapper} = this.$refs;

		if (!view || !wrapper || !this.isSlider) {
			return;
		}

		const
			{children} = wrapper,
			viewRect = view.getBoundingClientRect();

		this.viewRect = viewRect;
		this.length = children.length;
		this.slidesRects = [];

		for (let i = 0; i < children.length; i++) {
			const
				child = <HTMLElement>children[i];

			this.slidesRects[i] = Object.assign(child.getBoundingClientRect(), {
				offsetLeft: child.offsetLeft
			});
		}
	}

	/**
	 * @see syncState
	 */
	@hook('mounted')
	@watch('?window:resize')
	@wait('ready')
	syncStateAsync(): CanPromise<void> {
		if (!this.isSlider) {
			return;
		}

		const
			{wrapper} = this.$refs;

		if (!wrapper) {
			return;
		}

		this.async.setTimeout(async ()  => {
			this.syncState();
			wrapper.style.setProperty('--offset', `${this.currentOffset}px`);
		}, 50, {label: $$.syncStateAsync, join: true});
	}

	/**
	 * Switch to next slide
	 * @param dir - direction
	 */
	changeSlide(dir: SlideDirection): boolean {
		const
			{current, length, $refs} = this;

		if (dir < 0 && current > 0 || dir > 0 && current < length - 1) {
			const
				{wrapper} = $refs;

			if (!wrapper) {
				return false;
			}

			this.current += dir;
			wrapper.style.setProperty('--offset', `${this.currentOffset}px`);
			return true;
		}

		return false;
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('mode', 'mode', String);
		this.sync.mod('align', 'align', String);
	}

	/** @override */
	protected initGlobalEvents(): void {
		super.initGlobalEvents();

		if (this.isSlider) {
			this.async.on(document, 'scroll', () => this.scrolling = true, {label: $$.setScrolling});
		}
	}

	/**
	 * Handler: keeps the initial touch position on the screen
	 * @param e
	 */
	protected onStart(e: TouchEvent): void {
		this.scrolling = false;

		const
			touch = e.touches[0],
			{clientX, clientY} = touch,
			{wrapper} = this.$refs;

		if (!wrapper) {
			return;
		}

		this.startX = clientX;
		this.startY = clientY;

		this.syncState();
		this.setMod('swipe', true);

		this.startTime = performance.now();
	}

	/**
	 * Handler: cancels the scroll if trying to scroll the slider sideways, sets the modified position of the slider
	 *
	 * @param e
	 * @emits moveStart()
	 */
	protected onMove(e: TouchEvent): void {
		if (this.scrolling) {
			return;
		}

		const
			{startX, startY, tmp} = this,
			{wrapper} = this.$refs;

		const
			touch = e.touches[0],
			isTolerancePassed = this.isTolerancePassed ||
				Math.abs(startX - touch.clientX) > this.swipeToleranceX && Math.abs(startY - touch.clientY) < this.swipeToleranceY,
			diffX = startX - touch.clientX;

		if (!wrapper || !isTolerancePassed) {
			return;
		}

		if (!tmp.swiping) {
			this.emit('moveStart');
		}

		e.preventDefault();
		e.stopPropagation();

		tmp.swiping = true;
		this.isTolerancePassed = true;
		this.diffX = diffX;

		const
			transform = this.diffX * this.deltaX;

		wrapper.style.setProperty('--transform', `${transform}px`);
	}

	/**
	 * Handler: sets the end position to the slider
	 * @emits moveEnd(dir: SwipeDirection, isChanged: boolean)
	 */
	protected onRelease(): void {
		if (this.scrolling) {
			this.scrolling = false;
			return;
		}

		const {
			slidesRects,
			diffX,
			viewRect,
			threshold,
			startTime,
			fastSwipeDelay,
			fastSwipeThreshold,
			tmp
		} = this;

		const
			{wrapper} = this.$refs,
			dir: SlideDirection = Math.sign(diffX);

		let
			isSwiped = false;

		if (!wrapper || !slidesRects || !viewRect) {
			return;
		}

		const
			timestamp = performance.now(),
			passedValue = Number(Math.abs(dir * diffX / viewRect.width).toFixed(2)),
			isFastSwiped = timestamp - startTime < fastSwipeDelay && passedValue > fastSwipeThreshold,
			isThresholdPassed = passedValue > threshold;

		if (isThresholdPassed || isFastSwiped) {
			isSwiped = this.changeSlide(dir);
		}

		this.diffX = 0;
		wrapper.style.setProperty('--transform', '0px');
		this.removeMod('swipe', true);
		this.emit('swipeEnd', dir, isSwiped);
		this.isTolerancePassed = false;
		tmp.swiping = false;
	}
}

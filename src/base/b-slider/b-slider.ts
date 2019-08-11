/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, system, hook, watch, wait, prop, p } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

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

export interface SlideRect extends ClientRect {
	offsetLeft: number;
}

/**
 * -1 - Previous
 * 0  - Not changed
 * 1  - Next
 */
export type SlideDirection = -1 | 0 | 1;
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
 * Returns true if the specified value is greater than 0 and isn't infinite
 * @param v
 */
export function isNotInfinitePositiveNumber(v: number): boolean {
	return v > 0 && Number.isFinite(v);
}

@component()
export default class bSlider extends iData {
	/**
	 * Slider mode
	 *   *) scroll - scroll implementation
	 *   *) slider - slider implementation (impossible to skip slides)
	 */
	@prop({type: String, validator: (v) => Boolean(sliderModes[v])})
	readonly mode: Mode = 'slider';

	/**
	 * If true, will be used a duplicate slot to calculate the dynamic height
	 */
	@prop(Boolean)
	readonly dynamicHeight: boolean = false;

	/**
	 * If true, after the last slide will slide to the first
	 */
	@prop(Boolean)
	readonly circular: boolean = false;

	/**
	 * Slide alignment type
	 */
	@prop({type: String, validator: (v) => Boolean(alignTypes[v])})
	readonly align: AlignType = 'center';

	/**
	 * How much does the shift along the X axis correspond to a finger movement
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly deltaX: number = 0.9;

	/**
	 * The minimum required percentage to scroll the slider to an another slide
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly threshold: number = 0.3;

	/**
	 * The minimum required percentage for the scroll slider to an another slide in fast motion on the slider
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly fastSwipeThreshold: number = 0.05;

	/**
	 * Time (in milliseconds) after which we can assume that there was a quick swipe
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
	 * Align the first slide to the left
	 */
	@prop(Boolean)
	readonly alignFirstToStart: boolean = true;

	/**
	 * Option component
	 */
	@prop({type: String, required: false})
	readonly option?: string;

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
	 * True if mode is slider
	 */
	get isSlider(): boolean {
		return this.mode === 'slider';
	}

	/**
	 * Returns the current slider scroll
	 */
	@p({cache: false})
	get currentOffset(): number {
		const
			{slideRects, current, align, viewRect} = this,
			slideRect = slideRects[current];

		if (!slideRect || !viewRect) {
			return 0;
		}

		if (current === 0 && this.alignFirstToStart) {
			return 0;
		}

		switch (align) {
			case 'center':
				return slideRect.offsetLeft - (viewRect.width - slideRect.width) / 2;

			case 'start':
				return slideRect.offsetLeft;

			case 'end':
				return slideRect.offsetLeft + slideRect.width;
		}

		return 0;
	}

	/** @override */
	protected readonly $refs!: {
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
	 * The difference between a touch position on X axis at the beginning of the slide and at the end
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
	protected slideRects: SlideRect[] = [];

	/**
	 * Slider viewport rectangle
	 */
	@system()
	protected viewRect?: ClientRect;

	/**
	 * Timestamp of a start touch on the slider
	 */
	@system()
	protected startTime: number = 0;

	/**
	 * True if the user has started scrolling
	 */
	@system()
	protected scrolling: boolean = true;

	/**
	 * True if the user has started swiping
	 */
	@system()
	protected swiping: boolean = true;

	/**
	 * Observers store
	 */
	@system()
	protected observers: {
		mutation?: MutationObserver;
		resize?: ResizeObserver;
	} = {};

	/**
	 * Synchronizes the slider state
	 */
	@hook('mounted')
	syncState(): void {
		const
			{view, wrapper} = this.$refs;

		if (!view || !wrapper || !this.isSlider) {
			return;
		}

		const
			{children} = wrapper;

		this.viewRect = view.getBoundingClientRect();
		this.length = children.length;
		this.slideRects = [];

		for (let i = 0; i < children.length; i++) {
			const
				child = <HTMLElement>children[i];

			this.slideRects[i] = Object.assign(child.getBoundingClientRect(), {
				offsetLeft: child.offsetLeft
			});
		}
	}

	/**
	 * Synchronizes the slider state
	 * (deferred version)
	 */
	@watch(['?window:resize', ':updateState'])
	@wait('ready')
	async syncStateDefer(): Promise<void> {
		if (!this.isSlider) {
			return;
		}

		const
			{wrapper} = this.$refs;

		if (!wrapper) {
			return;
		}

		try {
			await this.async.sleep(50, {label: $$.syncStateAsync, join: true});

			this.syncState();
			wrapper.style.setProperty('--offset', `${this.currentOffset}px`);

		} catch {}
	}

	/**
	 * Switches to the specified slide
	 *
	 * @param index - slide index
	 * @param [animate] - animate transition
	 */
	async slideTo(index: number, animate: boolean = false): Promise<boolean> {
		const
			{length, current} = this,
			{wrapper} = this.$refs;

		if (current === index || !wrapper) {
			return false;
		}

		if (length - 1 >= index) {
			this.current = index;

			if (!animate) {
				await this.setMod('swipe', true);
			}

			this.syncState();
			wrapper.style.setProperty('--offset', `${this.currentOffset}px`);

			return true;
		}

		return false;
	}

	/**
	 * Moves to the next or the previous slide
	 * @param dir - direction
	 */
	moveSlide(dir: SlideDirection): boolean {
		let
			current = this.current;

		const
			{length, $refs} = this;

		if (dir < 0 && current > 0 || dir > 0 && current < length - 1 || this.circular) {
			const
				{wrapper} = $refs;

			if (!wrapper) {
				return false;
			}

			current += dir;

			if (dir < 0 && current < 0) {
				current = length - 1;

			} else if (dir > 0 && current > length - 1) {
				current = 0;
			}

			this.current = current;
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
		this.sync.mod('dynamicHeight', 'dynamicHeight', String);
	}

	/**
	 * Initializes the slider mode
	 */
	@watch({field: 'mode', immediate: true})
	protected initMode(): void {
		const label = {
			label: $$.setScrolling
		};

		if (this.isSlider) {
			this.async.on(document, 'scroll', () => this.scrolling = true, label);

		} else {
			this.async.off(label);
		}
	}

	/**
	 * Initializes observers
	 * @emits updateState()
	 */
	@hook('mounted')
	protected initObservers(): void {
		const
			{observers, $refs: {wrapper}} = this;

		if (!observers.mutation && wrapper) {
			observers.mutation = new MutationObserver(() => {
				this.emit('updateState');
			});

			observers.mutation.observe(wrapper, {
				childList: true
			});

			this.async.worker(observers.mutation, {
				label: $$.mutationObserver
			});
		}
	}

	/**
	 * Handler: keeps an initial touch position on the screen
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
	 * Handler: cancels a scroll if trying to scroll the slider sideways, sets the modified position of the slider
	 *
	 * @param e
	 * @emits swipeStart()
	 */
	protected onMove(e: TouchEvent): void {
		if (this.scrolling) {
			return;
		}

		const
			{startX, startY} = this,
			{wrapper} = this.$refs;

		const
			touch = e.touches[0],
			diffX = startX - touch.clientX;

		const isTolerancePassed =
			this.isTolerancePassed ||
			Math.abs(startX - touch.clientX) > this.swipeToleranceX && Math.abs(startY - touch.clientY) < this.swipeToleranceY;

		if (!wrapper || !isTolerancePassed) {
			return;
		}

		if (!this.swiping) {
			this.emit('swipeStart');
		}

		e.preventDefault();
		e.stopPropagation();

		this.swiping = true;
		this.isTolerancePassed = true;
		this.diffX = diffX;

		wrapper.style.setProperty('--transform', `${this.diffX * this.deltaX}px`);
	}

	/**
	 * Handler: sets the end position to the slider
	 * @emits swipeEnd(dir: SwipeDirection, isChanged: boolean)
	 */
	protected onRelease(): void {
		if (this.scrolling) {
			this.scrolling = false;
			return;
		}

		const {
			slideRects,
			diffX,
			viewRect,
			threshold,
			startTime,
			fastSwipeDelay,
			fastSwipeThreshold
		} = this;

		const
			{wrapper} = this.$refs,
			dir = <SlideDirection>Math.sign(diffX);

		let
			isSwiped = false;

		if (!wrapper || !slideRects || !viewRect) {
			return;
		}

		const
			timestamp = performance.now(),
			passedValue = Number(Math.abs(dir * diffX / viewRect.width).toFixed(2)),
			isFastSwiped = timestamp - startTime < fastSwipeDelay && passedValue > fastSwipeThreshold,
			isThresholdPassed = passedValue > threshold;

		if (isThresholdPassed || isFastSwiped) {
			isSwiped = this.moveSlide(dir);
		}

		this.diffX = 0;
		wrapper.style.setProperty('--transform', '0px');
		this.removeMod('swipe', true);

		this.emit('swipeEnd', dir, isSwiped);
		this.isTolerancePassed = false;
		this.swiping = false;
	}
}

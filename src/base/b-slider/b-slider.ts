/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, field, system, hook, watch, wait, p } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export interface SlideRect extends ClientRect {
	offsetLeft: number;
}

/**
 * -1 - Previous
 * 0  - Not changed
 * 1  - Next
 */
export type SlideDirection = -1 | 0 | 1;
export type OptionProps = ((el: unknown, i: number) => Dictionary) | Dictionary;
export type OptionsIterator<T = bSlider> = (options: unknown[], ctx: T) => unknown[];

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

@component()
export default class bSlider<T extends object = Dictionary> extends iData<T> {
	/**
	 * Slider mode
	 *   *) scroll - scroll implementation
	 *   *) slider - slider implementation (impossible to skip slides)
	 */
	@prop({type: String, validator: (v) => sliderModes.hasOwnProperty(v)})
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
	@prop({type: String, validator: (v) => alignTypes.hasOwnProperty(v)})
	readonly align: AlignType = 'center';

	/**
	 * How much does the shift along the X axis correspond to a finger movement
	 */
	@prop({type: Number, validator: (v: number) => v.isPositiveBetweenZeroAndOne()})
	readonly deltaX: number = 0.9;

	/**
	 * The minimum required percentage to scroll the slider to an another slide
	 */
	@prop({type: Number, validator: (v: number) => v.isPositiveBetweenZeroAndOne()})
	readonly threshold: number = 0.3;

	/**
	 * The minimum required percentage for the scroll slider to an another slide in fast motion on the slider
	 */
	@prop({type: Number, validator: (v: number) => v.isPositiveBetweenZeroAndOne()})
	readonly fastSwipeThreshold: number = 0.05;

	/**
	 * Time (in milliseconds) after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: (v: number) => v.isNatural()})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum displacement threshold along the X axis at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: (v: number) => v.isNatural()})
	readonly swipeToleranceX: number = 10;

	/**
	 * The minimum Y offset threshold at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: (v: number) => v.isNatural()})
	readonly swipeToleranceY: number = 50;

	/**
	 * Align the first slide to the left
	 */
	@prop(Boolean)
	readonly alignFirstToStart: boolean = true;

	/**
	 * Initial component options
	 */
	@prop(Array)
	readonly optionsProp?: unknown[] = [];

	/**
	 * Factory for an options iterator
	 */
	@prop(Function)
	optionsIterator?: OptionsIterator;

	/**
	 * Component options
	 */
	@field((o) => o.sync.link())
	options!: unknown[];

	/**
	 * Option component
	 */
	@prop({type: String, required: false})
	readonly option?: string;

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: String, required: false})
	readonly optionKey?: string;

	/**
	 * Option component props
	 */
	@prop({type: [Object, Function]})
	readonly optionProps: OptionProps = {};

	/**
	 * The number of slides in the slider
	 */
	@system()
	length: number = 0;

	/**
	 * Pointer to the current slide
	 */
	@p({cache: false})
	get current(): number {
		return this.currentStore;
	}

	/**
	 * Sets a pointer of the current slide
	 * @emits change(current: number)
	 */
	set current(value: number) {
		if (value === this.current) {
			return;
		}

		this.currentStore = value;
		this.emit('change', value);
	}

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

	/**
	 * @see current
	 */
	@system()
	protected currentStore: number = 0;

	/** @override */
	protected readonly $refs!: {
		view?: HTMLElement;
		content?: HTMLElement;
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
			{view, content} = this.$refs;

		if (!view || !content || !this.isSlider) {
			return;
		}

		const
			{children} = content;

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
			{content} = this.$refs;

		if (!content) {
			return;
		}

		try {
			await this.async.sleep(50, {label: $$.syncStateAsync, join: true});

			this.syncState();
			content.style.setProperty('--offset', `${this.currentOffset}px`);

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
			{content} = this.$refs;

		if (current === index || !content) {
			return false;
		}

		if (length - 1 >= index) {
			this.current = index;

			if (!animate) {
				await this.setMod('swipe', true);
			}

			this.syncState();
			content.style.setProperty('--offset', `${this.currentOffset}px`);

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
			{length, $refs: {content}} = this;

		if (dir < 0 && current > 0 || dir > 0 && current < length - 1 || this.circular) {
			if (!content) {
				return false;
			}

			current += dir;

			if (dir < 0 && current < 0) {
				current = length - 1;

			} else if (dir > 0 && current > length - 1) {
				current = 0;
			}

			this.current = current;
			content.style.setProperty('--offset', `${this.currentOffset}px`);
			return true;
		}

		return false;
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent(this.db);

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
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
			{observers, $refs: {content}} = this;

		if (!observers.mutation && content) {
			observers.mutation = new MutationObserver(() => {
				this.emit('updateState');
			});

			observers.mutation.observe(content, {
				childList: true
			});

			this.async.worker(observers.mutation, {
				label: $$.mutationObserver
			});
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('mode', 'mode', String);
		this.sync.mod('align', 'align', String);
		this.sync.mod('dynamicHeight', 'dynamicHeight', String);
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
			{content} = this.$refs;

		if (!content) {
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
			{content} = this.$refs;

		const
			touch = e.touches[0],
			diffX = startX - touch.clientX;

		const isTolerancePassed =
			this.isTolerancePassed ||
			Math.abs(startX - touch.clientX) > this.swipeToleranceX && Math.abs(startY - touch.clientY) < this.swipeToleranceY;

		if (!content || !isTolerancePassed) {
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

		content.style.setProperty('--transform', `${this.diffX * this.deltaX}px`);
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
			{content} = this.$refs,
			dir = <SlideDirection>Math.sign(diffX);

		let
			isSwiped = false;

		if (!content || !slideRects || !viewRect) {
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
		content.style.setProperty('--transform', '0px');
		this.removeMod('swipe', true);

		this.emit('swipeEnd', dir, isSwiped);
		this.isTolerancePassed = false;
		this.swiping = false;
	}
}

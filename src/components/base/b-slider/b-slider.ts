/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-slider/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { derive } from 'core/functools/trait';

import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iItems, { IterationKey } from 'components/traits/i-items/i-items';

import {

	component,
	field,
	system,
	computed,

	hook,
	watch,
	wait,

	ModsDecl

} from 'components/super/i-data/i-data';

import iSliderProps from 'components/base/b-slider/props';
import { autoSlidingAsyncGroup } from 'components/base/b-slider/const';
import type { Mode, SlideRect, SlideDirection } from 'components/base/b-slider/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-slider/interface';

const
	$$ = symbolGenerator();

interface bSlider extends Trait<typeof iObserveDOM> {}

@component()
@derive(iObserveDOM)
class bSlider extends iSliderProps implements iObserveDOM, iItems {
	static override readonly mods: ModsDecl = {
		swipe: [
			'true',
			'false'
		]
	};

	/**
	 * The number of slides in the slider
	 */
	get length(): number {
		return this.lengthStore;
	}

	/**
	 * A link to the content node
	 */
	get content(): CanUndef<HTMLElement> {
		return this.$refs.content;
	}

	/**
	 * The number of DOM nodes in the content block
	 */
	get contentLength(): number {
		return this.content?.children.length ?? 0;
	}

	/**
	 * Pointer to the current slide
	 */
	get current(): number {
		return this.currentStore;
	}

	/**
	 * Sets a pointer of the current slide
	 *
	 * @param value
	 * @emits `change(current: number)`
	 */
	set current(value: number) {
		if (value === this.current) {
			return;
		}

		this.currentStore = value;
		this.emit('change', value);
	}

	/**
	 * True if a slider mode is `slide`
	 */
	get isSlideMode(): boolean {
		return this.mode === 'slide';
	}

	/**
	 * The current slider scroll position
	 */
	get currentOffset(): number {
		if (this.mode === 'scroll') {
			return this.$refs.contentWrapper?.scrollLeft ?? 0;
		}

		const
			{slideRects, current, align, viewRect} = this,
			slidesCount = slideRects.length,
			slideRect = slideRects[current];

		if (current >= slidesCount || viewRect == null) {
			return 0;
		}

		if (this.alignFirstToStart && current === 0) {
			return 0;
		}

		if (this.alignLastToEnd && current === slidesCount - 1 && slidesCount !== 1) {
			return slideRect.offsetLeft + slideRect.width - viewRect.width;
		}

		switch (align) {
			case 'center':
				return slideRect.offsetLeft - (viewRect.width - slideRect.width) / 2;

			case 'start':
				return slideRect.offsetLeft;

			case 'end':
				return slideRect.offsetLeft + slideRect.width - viewRect.width;

			default:
				return 0;
		}
	}

	/**
	 * The number of slides in the slider
	 */
	@system()
	protected lengthStore: number = 0;

	/**
	 * Sets the number of slides in the slider
	 * @param value
	 */
	// eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
	protected set length(value: number) {
		this.field.set('lengthStore', value);
	}

	/** {@link iItems.items} */
	@field((o) => o.sync.link())
	protected itemsStore!: iItems['items'];

	/** {@link bSlider.current} */
	@system()
	protected currentStore: number = 0;

	/** {@link bSlider.modeProp} */
	@field((o) => o.sync.link())
	protected mode!: Mode;

	protected override readonly $refs!: iSliderProps['$refs'] & {
		view?: HTMLElement;
		content?: HTMLElement;
		contentWrapper?: HTMLElement;
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
	 * The difference between a touch position on the X-axis at the beginning of the swipe and at the end
	 */
	@system()
	protected diffX: number = 0;

	/**
	 * Is the minimum threshold for starting slide content passed
	 *
	 * {@link bSlider.swipeToleranceX}
	 * {@link bSlider.swipeToleranceY}
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
	protected viewRect?: DOMRect;

	/**
	 * Timestamp of a start touch on the slider
	 */
	@system()
	protected startTime: number = 0;

	/**
	 * True if a user has started scrolling
	 */
	@system()
	protected scrolling: boolean = true;

	/**
	 * True if a user has started swiping
	 */
	@system()
	protected swiping: boolean = false;

	/**
	 * True if all animations need to use `requestAnimationFrame`
	 */
	@computed({cache: true})
	protected get shouldUseRAF(): boolean {
		return this.browser.is.iOS === false;
	}

	/**
	 * True if needed to minimize the amount of non-essential motion used
	 */
	@computed({cache: true})
	protected get shouldReduceMotion(): boolean {
		return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/** {@link iItems.items} */
	@computed()
	get items(): this['Items'] {
		return this.itemsStore ?? [];
	}

	/** {@link iItems.items} */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	/**
	 * Switches to the specified slide by an index
	 *
	 * @param index - slide index
	 * @param [animate] - animate transition
	 */
	async slideTo(index: number, animate: boolean = false): Promise<boolean> {
		const
			{length, current, content} = this;

		if (current === index || content == null) {
			return false;
		}

		if (length - 1 >= index) {
			this.current = index;

			if (animate) {
				await this.removeMod('swipe');

			} else {
				await this.setMod('swipe', true);
			}

			this.syncState();

			return true;
		}

		return false;
	}

	/**
	 * Moves to the next or previous slide
	 * @param dir - direction
	 */
	moveSlide(dir: SlideDirection): boolean {
		let
			{current} = this;

		const
			{length, content} = this;

		if (dir < 0 && current > 0 || dir > 0 && current < length - 1 || this.circular) {
			if (content == null) {
				return false;
			}

			current += dir;

			if (dir < 0 && current < 0) {
				current = length - 1;

			} else if (dir > 0 && current > length - 1) {
				current = 0;
			}

			this.current = current;
			this.performSliderMove();
			return true;
		}

		return false;
	}

	/** {@link iObserveDOM.initDOMObservers} */
	@hook('mounted')
	initDOMObservers(): void {
		const
			{content} = this;

		if (content != null) {
			iObserveDOM.observe(this, {
				node: content,
				childList: true
			});
		}
	}

	/**
	 * Performs auto slide change
	 */
	protected async performAutoSlide(): Promise<void> {
		const
			{current, length} = this;

		if (current === length - 1) {
			await this.slideTo(0, true);

		} else {
			await this.slideTo(current + 1, true);
		}
	}

	/**
	 * Resets auto slide moves
	 * @param firstInterval - an interval (in ms) before first auto slide change
	 */
	protected initAutoSliding(firstInterval: number = this.autoSlideInterval): void {
		this.stopAutoSliding();

		if (!this.isSlideMode || !Number.isPositive(firstInterval)) {
			return;
		}

		this.async.setTimeout(
			async () => {
				await this.performAutoSlide();

				this.async.setInterval(
					() => this.performAutoSlide(),
					this.autoSlideInterval,

					{
						label: $$.autoSlide,
						group: autoSlidingAsyncGroup,
						join: false
					}
				);
			},

			firstInterval,

			{
				label: $$.autoSlideFirst,
				group: autoSlidingAsyncGroup,
				join: false
			}
		);
	}

	/**
	 * Clears auto slide moves
	 */
	protected stopAutoSliding(): void {
		this.async.clearAll({group: new RegExp(autoSlidingAsyncGroup)});
	}

	/**
	 * Synchronizes auto slide moves by (re-)setting the corresponding interval.
	 *
	 * The code waits for the `ready` state because the slides may be loaded asynchronously via a data provider.
	 * It also watches for changes in the `db` property, as well as the `mode`,
	 * because the auto slide functionality only works when the slider is in `slide` mode.
	 */
	@hook('mounted')
	@wait('ready')
	@watch(['db', 'autoSlideInterval', 'mode'])
	protected syncAutoSlide(): void {
		this.initAutoSliding(this.autoSlideInterval);
	}

	/**
	 * Performs the slider animation
	 */
	protected updateSlidePosition(): void {
		const
			{content} = this;

		if (content == null) {
			return;
		}

		const pos = this.shouldReduceMotion ? this.currentOffset : this.currentOffset + this.diffX * this.deltaX;
		content.style.transform = `translate3d(${(-pos).px}, 0, 0)`;
	}

	/**
	 * Updates the slider position
	 */
	protected performSliderMove(): void {
		if (this.shouldUseRAF) {
			this.async.requestAnimationFrame(this.updateSlidePosition.bind(this), {label: $$.performSliderMove});

		} else {
			this.updateSlidePosition();
		}
	}

	/**
	 * Returns additional props to pass to the specified item component
	 *
	 * @param el
	 * @param i
	 */
	protected getItemAttrs(el: this['Item'], i: number): CanUndef<Dictionary> {
		const
			{itemProps} = this;

		return Object.isFunction(itemProps) ?
			itemProps(el, i, {
				key: this.getItemKey(el, i),
				ctx: this
			}) :

			itemProps;
	}

	/**
	 * Returns a component name to render the specified item
	 *
	 * @param el
	 * @param i
	 */
	protected getItemComponentName(el: this['Item'], i: number): string {
		const {item} = this;
		return Object.isFunction(item) ? item(el, i) : <string>item;
	}

	/** {@link iItems.getItemKey} */
	protected getItemKey(el: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Synchronizes the slider state
	 */
	@hook(['mounted', 'updated'])
	@wait('loading', {label: $$.syncState})
	protected syncState(): void {
		const
			{view, content} = this.$refs;

		if (view == null || content == null || !this.isSlideMode) {
			return;
		}

		const
			{children} = content;

		this.length = children.length;
		this.viewRect = view.getBoundingClientRect();
		this.slideRects = [];

		for (let i = 0; i < children.length; i++) {
			const
				child = <HTMLElement>children[i];

			this.slideRects[i] = Object.assign(child.getBoundingClientRect(), {
				offsetLeft: child.offsetLeft
			});
		}

		this.performSliderMove();
	}

	/**
	 * Synchronizes the slider state (deferred version)
	 * @emits `syncState()`
	 */
	@watch('localEmitter:DOMChange')
	@wait('ready', {label: $$.syncStateDefer})
	protected async syncStateDefer(): Promise<void> {
		const
			{content} = this;

		if (!this.isSlideMode || !content) {
			return;
		}

		try {
			await this.async.sleep(50, {label: $$.syncStateDefer, join: true});
			this.syncState();
			this.emit('syncState');

		} catch {}
	}

	protected override initRemoteData(): CanUndef<this['Items']> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<this['Items']>(this.db);

		if (Object.isArray(val)) {
			return this.items = val;
		}

		return this.items;
	}

	/**
	 * Initializes the slider mode
	 */
	@watch({path: 'mode', immediate: true})
	protected initMode(): void {
		const group = {
			group: 'scroll',
			label: $$.setScrolling
		};

		const
			{content} = this.$refs;

		if (this.isSlideMode) {
			this.async.on(document, 'scroll', () => this.scrolling = true, group);
			this.initDOMObservers();

		} else {
			this.async.off(group);
			content && iObserveDOM.unobserve(this, content);
		}
	}

	/**
	 * Validates the component props values
	 */
	@hook('beforeDataCreate')
	protected validateProps(): void {
		if (this.useScrollSnap && this.modeProp === 'slide') {
			throw new Error('Scroll snap cannot be enabled in `slide` mode');
		}
	}

	protected override initModEvents(): void {
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
		this.stopAutoSliding();
		this.scrolling = false;

		const
			touch = e.touches[0],
			{clientX, clientY} = touch,
			{content} = this;

		if (content == null) {
			return;
		}

		this.startX = clientX;
		this.startY = clientY;

		this.syncState();
		void this.setMod('swipe', true);

		this.startTime = performance.now();
	}

	/**
	 * Handler: cancels a scroll if trying to scroll the slider sideways, sets the modified position of the slider
	 *
	 * @param e
	 * @emits `swipeStart()`
	 */
	protected onMove(e: TouchEvent): void {
		if (this.scrolling) {
			return;
		}

		const
			{startX, startY, content} = this;

		const
			touch = e.touches[0],
			diffX = startX - touch.clientX,
			diffY = startY - touch.clientY;

		const isTolerancePassed =
			this.isTolerancePassed ||
			Math.abs(diffX) > this.swipeToleranceX && Math.abs(diffY) < this.swipeToleranceY;

		if (content == null || !isTolerancePassed) {
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

		this.performSliderMove();
	}

	/**
	 * Handler: sets the end position to the slider
	 * @emits `swipeEnd(dir:` [[SwipeDirection]]`, isChanged: boolean)`
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
			fastSwipeThreshold,
			content
		} = this;

		const
			dir = <SlideDirection>Math.sign(diffX);

		let
			isSwiped = false;

		if (content == null || Object.size(slideRects) === 0 || viewRect == null) {
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
		this.performSliderMove();
		void this.removeMod('swipe', true);

		this.emit('swipeEnd', dir, isSwiped);
		this.isTolerancePassed = false;
		this.swiping = false;

		this.initAutoSliding(Math.max(this.autoSlideInterval, this.autoSlidePostGestureDelay));
	}
}

export default bSlider;

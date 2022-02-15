/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-slider/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/list';
//#endif

import symbolGenerator from 'core/symbol';

import { derive } from 'core/functools/trait';
import { deprecated, deprecate } from 'core/functools';

import iObserveDOM from 'traits/i-observe-dom/i-observe-dom';
import iItems, { IterationKey } from 'traits/i-items/i-items';

import iData, {

	component,
	prop,
	field,
	system,
	computed,

	hook,
	watch,
	wait,

	ModsDecl

} from 'super/i-data/i-data';

import { sliderModes, alignTypes } from 'base/b-slider/const';
import type { Mode, SlideRect, SlideDirection, AlignType } from 'base/b-slider/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-slider/interface';

export const
	$$ = symbolGenerator();

interface bSlider extends Trait<typeof iObserveDOM> {}

/**
 * Component to create a content slider
 */
@component()
@derive(iObserveDOM)
class bSlider extends iData implements iObserveDOM, iItems {
	/** @see [[iItems.Item]] */
	readonly Item!: object;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	/**
	 * A slider mode:
	 *
	 * 1. With the `slide` mode, it is impossible to skip slides.
	 *    That is, we can't get from the first slide directly to the third or other stuff.
	 *
	 * 2. With the `scroll` mode, to scroll slides is used the browser native scrolling.
	 */
	@prop({type: String, validator: Object.hasOwnProperty(sliderModes)})
	readonly modeProp: Mode = 'slide';

	/**
	 * If true, the height calculation will be based on rendered elements.
	 * The component will create an additional element to contain the rendered elements,
	 * while it will not be visible to the user. This may be useful if you need to hide scroll on mobile devices,
	 * but you don't know the exact size of the elements that can be rendered into a component.
	 */
	@prop(Boolean)
	readonly dynamicHeight: boolean = false;

	/**
	 * If true, a user will be automatically returned to the first slide when scrolling the last slide.
	 * That is, the slider will work "in a circle".
	 */
	@prop(Boolean)
	readonly circular: boolean = false;

	/**
	 * This prop controls how many slides will scroll.
	 * For example, by specifying `center`, the slider will stop when the active slide is
	 * in the slider's center when scrolling.
	 */
	@prop({type: String, validator: Object.hasOwnProperty(alignTypes)})
	readonly align: AlignType = 'center';

	/**
	 * If true, the first slide will be aligned to the start position (the left bound).
	 */
	@prop(Boolean)
	readonly alignFirstToStart: boolean = true;

	/**
	 * How much does the shift along the X-axis corresponds to a finger movement
	 */
	@prop({type: Number, validator: (v) => Number.isPositiveBetweenZeroAndOne(v)})
	readonly deltaX: number = 0.9;

	/**
	 * The minimum required percentage to scroll the slider to another slide
	 */
	@prop({type: Number, validator: (v) => Number.isPositiveBetweenZeroAndOne(v)})
	readonly threshold: number = 0.3;

	/**
	 * The minimum required percentage for the scroll slider to another slide in fast motion on the slider
	 */
	@prop({type: Number, validator: (v) => Number.isPositiveBetweenZeroAndOne(v)})
	readonly fastSwipeThreshold: number = 0.05;

	/**
	 * Time (in milliseconds) after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: (v) => Number.isNatural(v)})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum displacement threshold along the X-axis at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: (v) => Number.isNatural(v)})
	readonly swipeToleranceX: number = 10;

	/**
	 * The minimum Y-axis offset threshold at which the slider will be considered to be used (in px)
	 */
	@prop({type: Number, validator: (v) => Number.isNatural(v)})
	readonly swipeToleranceY: number = 50;

	/**
	 * @deprecated
	 * @see [[bSlider.items]]
	 */
	@prop(Array)
	readonly optionsProp: iItems['items'] = [];

	/** @see [[iItems.items]] */
	@prop(Array)
	readonly itemsProp: iItems['items'] = [];

	/**
	 * @deprecated
	 * @see [[bSlider.item]]
	 */
	@prop({type: [String, Function], required: false})
	readonly option?: iItems['item'];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/**
	 * @deprecated
	 * @see [[bSlider.itemKey]]
	 */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItems['itemKey'];

	/** @see [[iItems.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/**
	 * @deprecated
	 * @see [[bSlider.itemProps]]
	 */
	@prop({type: [Function, Object]})
	readonly optionProps?: iItems['itemProps'];

	/** @see [[iItems.itemProps]] */
	@prop({type: [Function, Object]})
	readonly itemProps?: iItems['itemProps'];

	/** @see [[bSlider.items]] */
	@field((o) => o.sync.link())
	options!: this['Items'];

	/**
	 * The number of slides in the slider
	 */
	@system()
	length: number = 0;

	static override readonly mods: ModsDecl = {
		swipe: [
			'true',
			'false'
		]
	};

	/**
	 * Link to a content node
	 */
	get content(): CanUndef<HTMLElement> {
		return this.$refs.content;
	}

	/**
	 * Number of DOM nodes within a content block
	 */
	get contentLength(): number {
		const l = this.content;
		return l ? l.children.length : 0;
	}

	/**
	 * Pointer to the current slide
	 */
	get current(): number {
		return this.currentStore;
	}

	/**
	 * Sets a pointer of the current slide
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
	 * @deprecated
	 * @see [[bSlider.isSlideMode]]
	 */
	@deprecated({renamedTo: 'isSlideMode'})
	get isSlider(): boolean {
		return this.isSlideMode;
	}

	/**
	 * True if a slider mode is `slide`.
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
			slideRect = slideRects[current];

		if (current >= slideRects.length || !viewRect) {
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

			default:
				return 0;
		}
	}

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	protected itemsStore!: iItems['items'];

	/** @see [[bSlider.current]] */
	@system()
	protected currentStore: number = 0;

	/** @see [[bSlider.modeProp]] */
	@field((o) => o.sync.link((value: Mode) => {
		if (value === 'slider') {
			deprecate({
				name: 'slider',
				type: 'property',
				renamedTo: 'slide'
			});

			return 'slide';
		}

		return value;
	}))

	protected mode!: Mode;

	protected override readonly $refs!: {
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
	 * The difference between a touch position on X axis at the beginning of the swipe and at the end
	 */
	@system()
	protected diffX: number = 0;

	/**
	 * Is the minimum threshold for starting slide content passed
	 *
	 * @see [[bSlider.swipeToleranceX]]
	 * @see [[bSlider.swipeToleranceY]]
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

	/** @see [[iItems.items]] */
	@computed({dependencies: ['itemsStore', 'options']})
	get items(): this['Items'] {
		const
			items = Object.size(this.options) > 0 ? this.options : this.itemsStore;

		if (Object.size(this.options) > 0) {
			deprecate({
				name: 'options',
				type: 'property',
				renamedTo: 'items'
			});
		}

		return items ?? [];
	}

	/** @see [[iItems.items]] */
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

		if (current === index || !content) {
			return false;
		}

		if (length - 1 >= index) {
			this.current = index;

			if (!animate) {
				await this.setMod('swipe', true);
			}

			this.syncState();
			this.performSliderMove();

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
			this.performSliderMove();
			return true;
		}

		return false;
	}

	/** @see [[iObserveDOM.initDOMObservers]] */
	@hook('mounted')
	initDOMObservers(): void {
		const
			{content} = this;

		if (content) {
			iObserveDOM.observe(this, {
				node: content,
				childList: true
			});
		}
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
			{itemProps, optionProps} = this;

		let
			props = itemProps;

		if (optionProps != null) {
			deprecate({
				name: 'optionProps',
				type: 'property',
				renamedTo: 'itemProps'
			});

			props = optionProps;
		}

		return Object.isFunction(props) ?
			props(el, i, {
				key: this.getItemKey(el, i),
				ctx: this
			}) :

			props;
	}

	/**
	 * Returns a component name to render the specified item
	 *
	 * @param el
	 * @param i
	 */
	protected getItemComponentName(el: this['Item'], i: number): string {
		const
			{item, option} = this;

		if (option != null) {
			deprecate({
				name: 'option',
				type: 'property',
				renamedTo: 'item'
			});

			return Object.isFunction(option) ? option(el, i) : option;
		}

		return Object.isFunction(item) ? item(el, i) : <string>item;
	}

	/**
	 * @deprecated
	 * @see [[bSlider.getItemKey]]
	 */
	@deprecated({renamedTo: 'getItemKey'})
	protected getOptionKey(el: this['Item'], i: number): CanUndef<IterationKey> {
		return this.getItemKey(el, i);
	}

	/** @see [[iItems.getItemKey]] */
	protected getItemKey(el: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Synchronizes the slider state
	 */
	@hook('mounted')
	@wait('loading', {label: $$.syncState})
	protected syncState(): void {
		const
			{view, content} = this.$refs;

		if (!view || !content || !this.isSlideMode) {
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

		void this.setMod('swipe', true);
		this.performSliderMove();
	}

	/**
	 * Synchronizes the slider state (deferred version)
	 * @emits `syncState()`
	 */
	@watch(':DOMChange')
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
			if (Object.isArray(this.options)) {
				deprecate({
					name: 'options',
					type: 'property',
					renamedTo: 'items'
				});

				this.options = val;
			}

			return this.items = val;
		}

		return this.items;
	}

	/**
	 * Initializes the slider mode
	 */
	@watch({field: 'mode', immediate: true})
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
		this.scrolling = false;

		const
			touch = e.touches[0],
			{clientX, clientY} = touch,
			{content} = this;

		if (!content) {
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

		if (!content || Object.size(slideRects) === 0 || !viewRect) {
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
	}
}

export default bSlider;

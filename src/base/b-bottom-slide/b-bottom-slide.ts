/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { is } from 'core/browser';

import iHistory from 'traits/i-history/i-history';
import History from 'traits/i-history/history';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iOpen from 'traits/i-open/i-open';
import iVisible from 'traits/i-visible/i-visible';
import iObserveDom from 'traits/i-observe-dom/i-observe-dom';
import iBlock, { ModsDecl, component, prop, field, system, hook, watch, wait, p } from 'super/i-block/i-block';

export * from 'super/i-data/i-data';

export type HeightMode = 'content' | 'full';
export type Direction = -1 | 0 | 1;

export const
	$$ = symbolGenerator();

/**
 * Component: bottom sheet behavior
 */
@component()
export default class bBottomSlide extends iBlock implements iLockPageScroll, iOpen, iVisible, iObserveDom, iHistory {
	/**
	 * Component height Option:
	 *   *) content – the height of the instance, but not more than the full value,
	 *      in addition, "steps" will be ignored
	 *
	 *   *) full – the height of the content will always be the full height of the viewport
	 */
	@prop({type: String, validator: (v) => ({full: true, content: true}).hasOwnProperty(v)})
	readonly heightMode: HeightMode = 'full';

	/**
	 * Number of allowed component positions relative to the screen height (%)
	 */
	@prop({type: Array, validator: (v) => v.every((a) => a >= 0 && a <= 100)})
	readonly stepsProp: number[] = [];

	/** @see steps */
	@field((o: bBottomSlide) => o.sync.link('stepsProp', (v: number[]) => v.slice().sort((a, b) => a - b)))
	readonly stepsStore!: number[];

	/**
	 * Visible part of the content (will be visible over the page content) (px)
	 */
	@prop({type: Number, validator: (v: number) => v.isNonNegative()})
	readonly visible: number = 0;

	/**
	 * Time (in milliseconds) after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: (v: number) => v.isPositive()})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum required pixels for the scroll slider to an another slide in fast motion on the slider
	 */
	@prop({type: Number, validator: (v: number) => v.isNatural()})
	readonly fastSwipeThreshold: number = 10;

	/**
	 * The minimum Y offset threshold at which the slider will be considered to be used (px)
	 */
	@prop({type: Number, validator: (v: number) => v.isNatural()})
	readonly swipeThreshold: number = 40;

	/**
	 * Max value of overlay opacity
	 */
	@prop({type: Number, validator: (v) => v >= 0 && v <= 1})
	readonly maxOpacity: number = 0.8;

	/**
	 * If true, the content will scroll up on component close
	 */
	@prop(Boolean)
	readonly scrollToTopOnClose: boolean = true;

	/**
	 * If true, overlay will be used
	 */
	@prop(Boolean)
	readonly overlay: boolean = true;

	/**
	 * Maximum percentage of the height of the screen to which you can pull the component
	 */
	@prop({type: Number, validator: (v) => v >= 0 && v <= 100})
	readonly maxVisiblePercent: number = 90;

	/**
	 * Possible component positions in % (of screen height)
	 */
	@p({cache: false})
	get steps(): number[] {
		const
			{heightMode, visiblePercent, contentHeight, windowHeight, stepsStore, maxVisiblePercent} = this,
			res = [visiblePercent];

		if (heightMode === 'content') {
			res.push(contentHeight / windowHeight * 100);

		} else {
			res.push(maxVisiblePercent);
		}

		return res.concat(stepsStore).sort((a, b) => a - b);
	}

	/**
	 * True if the content is fully open
	 */
	@p({cache: false})
	get isFullyOpened(): boolean {
		return this.step === this.steps.length - 1;
	}

	/**
	 * True if the content is fully closed
	 */
	@p({cache: false})
	get isClosed(): boolean {
		return this.step === 0;
	}

	/** @see iHistory.history */
	@system((ctx: iHistory) => new History(ctx))
	readonly history!: History<iHistory>;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iOpen.mods,
		...iVisible.mods,

		stick: [
			['true'],
			'false'
		],

		events: [
			'true',
			['false']
		]
	};

	/** @override */
	protected $refs!: {
		view: HTMLElement;
		window: HTMLElement;
		header: HTMLElement;
		content: HTMLElement;
		overlay?: HTMLElement;
	};

	/** @see step */
	@system()
	protected stepStore: number = 0;

	/**
	 * Current component step
	 */
	@p({cache: false})
	protected get step(): number {
		return this.stepStore;
	}

	/**
	 * Sets current component step
	 * @emits changeStep(step: number)
	 */
	protected set step(v: number) {
		if (v === this.step) {
			return;
		}

		this.stepStore = v;
		this.emit('changeStep', v);
	}

	/**
	 * Steps of component (px)
	 */
	@system()
	protected stepsInPixels: number[] = [];

	/**
	 * Timestamp of a start touch on the component
	 */
	@system()
	protected startTime: number = 0;

	/**
	 * Y position of the first touch on the component
	 */
	@system()
	protected startY: number = 0;

	/**
	 * Current Y position of the touch
	 */
	@system()
	protected currentY: number = 0;

	/**
	 * End Y position of the touch
	 */
	@system()
	protected endY: number = 0;

	/**
	 * Difference in cursor position compared to last frame
	 */
	@system()
	protected diff: number = 0;

	/**
	 * The current value of the transparency of the overlay
	 */
	@system()
	protected opacity: number = 0;

	/**
	 * Current cursor direction
	 */
	@system()
	protected direction: Direction = 0;

	/**
	 * Window height
	 */
	@system()
	protected windowHeight: number = 0;

	/**
	 * Maximum content height (px)
	 */
	@system()
	protected contentMaxHeight: number = 0;

	/**
	 * Content height (px)
	 */
	@system()
	protected contentHeight: number = 0;

	/**
	 * Component end position height
	 */
	@system()
	protected maxPullOutHeight: number = 0;

	/**
	 * True if the content scrolled to the top
	 */
	@system()
	protected isViewportTopReached: boolean = true;

	/**
	 * True if now the item position is being updated
	 */
	@system()
	protected isAnimating: boolean = false;

	/**
	 * True if content is pulled using the trigger
	 */
	@system()
	protected isTrigger: boolean = false;

	/** @see offset */
	@system()
	protected offsetStore: number = 0;

	/**
	 * Current component offset
	 */
	@p({cache: false})
	protected get offset(): number {
		return this.offsetStore;
	}

	/**
	 * Sets current component offset
	 */
	protected set offset(value: number) {
		this.offsetStore = value;
		this.endY = value;
	}

	/** @see isMoving */
	@system()
	protected isMovingStore: boolean = false;

	/**
	 * True if component are pulled
	 */
	@p({cache: false})
	protected get isMoving(): boolean {
		return this.isMovingStore;
	}

	/** @emits changeMoveState(val: boolean) */
	protected set isMoving(val: boolean) {
		if (this.isMovingStore === val) {
			return;
		}

		this.isMovingStore = val;
		this[val ? 'setRootMod' : 'removeRootMod']('fullscreen-moving', true);
		this[val ? 'setMod' : 'removeMod']('stick', false);
		this.emit('changeMoveState', val);
	}

	/**
	 * Visible percent of component
	 * @see visible
	 */
	@p({cache: false})
	protected get visiblePercent(): number {
		return this.visible / this.windowHeight * 100;
	}

	/**
	 * Last step offset (px)
	 */
	protected get lastStepOffset(): number {
		return this.stepsInPixels[this.stepsInPixels.length - 1];
	}

	/**
	 * Current step offset (px)
	 */
	protected get currentStepOffset(): number {
		return this.stepsInPixels[this.step];
	}

	/**
	 * True if RAF should be used for animations
	 */
	protected get isLowEnd(): boolean {
		return !Boolean(is.iOS);
	}

	/** @see [[History.prototype.onPageTopReached]] */
	onPageTopReached(show: boolean): void {
		this.isViewportTopReached = show;
	}

	/** @see iLockPageScroll.lock */
	@wait('ready')
	lock(): Promise<void> {
		return iLockPageScroll.lock(this, <HTMLElement>this.$refs.view);
	}

	/** @see iLockPageScroll.unlock */
	unlock(): Promise<void> {
		return iLockPageScroll.unlock(this);
	}

	/**
	 * @see iOpen.open
	 * @param [step]
	 * @emits open()
	 */
	@wait('ready')
	async open(step?: number): Promise<boolean> {
		if (step !== undefined && step > this.stepsInPixels.length - 1) {
			return false;
		}

		if (!this.visible) {
			this.removeMod('hidden', true);
			iOpen.open(this).catch(stderr);
		}

		this.step = step || 1;
		this.history.initIndex();

		this.emit('open');
		return true;
	}

	/**
	 * @see iOpen.close
	 * @emits close()
	 */
	async close(): Promise<boolean> {
		if (this.isClosed) {
			return false;
		}

		this.step = 0;

		if (!this.visible) {
			iOpen.close(this).catch(stderr);
			this.setMod('hidden', true);
		}

		this.history.clear();
		this.emit('close');
		return true;
	}

	/**
	 * Opens next component step
	 */
	async next(): Promise<boolean> {
		if (this.isFullyOpened) {
			return false;
		}

		if (this.step === 0) {
			return this.open();
		}

		this.step++;
		return true;
	}

	/**
	 * Opens previous component step
	 */
	async prev(): Promise<boolean> {
		if (this.isClosed) {
			return false;
		}

		const
			step = this.step - 1;

		if (step === 0) {
			return this.close();
		}

		this.step--;
		return true;
	}

	/** @see iOpen.onOpenedChange */
	onOpenedChange(): void {
		return;
	}

	/** @see iObserveDom.onDOMChange */
	onDOMChange(): void {
		iObserveDom.onDOMChange(this);
	}

	/** @see iOpen.onKeyClose */
	async onKeyClose(): Promise<void> {
		return;
	}

	/** @see iOpen.onTouchClose */
	async onTouchClose(): Promise<void> {
		return;
	}

	/** @see iObserveDom.initObservers */
	@watch('heightMode')
	@hook('mounted')
	@wait('ready')
	initDOMObservers(): CanPromise<void> {
		const
			{content} = this.$refs;

		if (this.heightMode === 'full') {
			iObserveDom.unobserve(this, content);
			return;
		}

		iObserveDom.observe(this, {
			node: content,
			childList: true,
			subtree: true
		});
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('heightMode', 'heightMode', String);
		this.sync.mod('visible', 'visible', Boolean);
		this.sync.mod('opened', 'visible', Boolean);
	}

	/**
	 * Puts the node to the top level of the DOM tree
	 */
	@hook('mounted')
	@wait('ready')
	protected initNodePosition(): CanPromise<void> {
		const {$el} = this;
		document.body.insertAdjacentElement('afterbegin', $el);
	}

	/**
	 * Initializes heights of elements
	 */
	@hook('mounted')
	@wait('ready')
	protected initHeights(): CanPromise<void> {
		const
			{maxVisiblePercent, $refs: {header, content, view}} = this;

		const
			currentPage = this.history?.current?.content;

		if (this.heightMode === 'content' && currentPage?.initBoundingRect) {

			const
				currentContentPageHeight = currentPage?.initBoundingRect.height;

			if (content.clientHeight !== currentContentPageHeight) {
				content.style.height = currentContentPageHeight.px;
			}
		}

		const
			windowHeight = document.documentElement.clientHeight,
			maxVisiblePx = windowHeight * (maxVisiblePercent / 100),
			contentHeight = view.clientHeight + header.clientHeight;

		this.windowHeight = windowHeight;
		this.contentHeight = contentHeight > maxVisiblePx ? maxVisiblePx : contentHeight;
		this.contentMaxHeight = maxVisiblePx;

		if (currentPage) {
			Object.assign((<HTMLElement>currentPage.el).style, {
				maxHeight: maxVisiblePx.px
			});
		}

		Object.assign(view.style, {
			maxHeight: maxVisiblePx.px,
			paddingBottom: header.clientHeight.px
		});
	}

	/**
	 * Initializes offset of the component
	 */
	@hook('mounted')
	@watch('visible')
	protected initOffset(): void {
		this.offset = this.visible;
		this.setPosition();
	}

	/**
	 * Updates steps value
	 */
	@hook('mounted')
	@watch('steps')
	protected updateSteps(): void {
		const {
			steps,
			windowHeight
		} = this;

		this.stepsInPixels = steps.map((s) => (s / 100 * windowHeight));
	}

	/**
	 * Sticks component to the closest step
	 */
	protected stickToStep(): void {
		this.offset = this.stepsInPixels[this.step];
		this.isMoving = false;
		this.opacity = this.isFullyOpened ? this.maxOpacity : 0;

		this.stopAnimation();
		this.setPosition();
		this.setOpacity();
	}

	/**
	 * Sets a position of the window node
	 */
	@wait('ready')
	protected setPosition(): CanPromise<void> {
		this.$refs.window.style.transform = `translate3d(0, ${(-this.offset).px}, 0)`;
	}

	/**
	 * Sets an opacity of the overlay node
	 */
	@wait('ready')
	protected setOpacity(): CanPromise<void> {
		const
			{$refs: {overlay}} = this;

		if (!(overlay instanceof HTMLElement)) {
			return;
		}

		overlay.style.setProperty('opacity', String(this.opacity));
	}

	/**
	 * Sets a new CSS values for elements
	 */
	protected setKeyframeValues(): void {
		const
			{windowHeight} = this,
			isMaxNotReached = windowHeight >= this.offset + this.diff;

		if (isMaxNotReached) {
			this.offset += this.diff;
			this.isMoving = true;
			this.setPosition();
		}

		this.performOpacity();
		this.diff = 0;
	}

	/**
	 * Initializes animation
	 */
	protected animate(): void {
		if (this.isAnimating && this.isLowEnd) {
			return;
		}

		this.performAnimation();
	}

	/**
	 * Performs component move animation
	 */
	protected performAnimation(): void {
		this.isAnimating = true;

		if (this.isLowEnd) {
			this.async.requestAnimationFrame(() => {
				if (this.isAnimating) {
					this.setKeyframeValues();
					this.performAnimation();
				}

			}, {label: $$.raf});

		} else {
			this.setKeyframeValues();
		}
	}

	/**
	 * Performs overlay opacity animation
	 */
	@wait('ready')
	protected performOpacity(): CanPromise<void> {
		const
			{$refs: {overlay}, maxOpacity} = this;

		if (!overlay || maxOpacity < 0) {
			return;
		}

		const
			{stepsInPixels, offset, steps} = this,
			lastStep = stepsInPixels[steps.length - 1],
			penultimateStep = stepsInPixels[steps.length - 2];

		if (penultimateStep === undefined || penultimateStep > offset) {
			return;
		}

		const
			p = (lastStep - penultimateStep) / 100,
			currentP = (lastStep - offset) / p,
			calculatedOpacity = maxOpacity - maxOpacity / 100 * currentP,
			opacity = calculatedOpacity > maxOpacity ? maxOpacity : calculatedOpacity,
			diff = Math.abs(this.opacity - opacity) >= 0.025;

		if (!diff) {
			return;
		}

		this.opacity = opacity;
		this.setOpacity();
	}

	/**
	 * Moves the component to the nearest step relative to the current position
	 *
	 * @param respectDirection - if true, then when searching for the next step,
	 *   the direction of the cursor will be taken into account, and not the nearest step
	 *
	 * @param isThresholdPassed - if true, then the minimum threshold for changing the step is passed
	 */
	protected moveToClosest(respectDirection: boolean, isThresholdPassed: boolean): void {
		const
			{heightMode, contentHeight, offset, direction} = this;

		if (heightMode === 'content') {
			if (!respectDirection && isThresholdPassed) {
				this[contentHeight / 2 < offset ? 'next' : 'prev']();

			} else if (respectDirection) {
				this[direction > 0 ? 'next' : 'prev']();
			}

		} else {
			const
				{stepsInPixels} = this;

			let
				step = 0;

			if (!respectDirection) {
				let
					min;

				for (let i = 0; i < stepsInPixels.length; i++) {
					const
						res = Math.abs(offset - stepsInPixels[i]);

					if (!min || min > res) {
						min = res;
						step = i;
					}
				}

			} else {
				let i = 0;

				for (; i < stepsInPixels.length; i++) {
					const
						s = stepsInPixels[i];

					if (s > offset) {
						break;
					}
				}

				if (direction > 0) {
					step = i > stepsInPixels.length - 1 ? i - 1 : i;

				} else {
					i === 0 ? step = i : step = i - 1;
				}
			}

			this.step = step;

			if (this.step === 0) {
				this.close().catch(stderr);
			}
		}

		this.stickToStep();
	}

	/**
	 * Stops all animations
	 */
	protected stopAnimation(): void {
		this.async.clearAnimationFrame({label: $$.raf});
		this.isAnimating = false;
		this.diff = 0;
	}

	/**
	 * Recalculates sizes and steps
	 */
	@p({watch: ['window:resize', ':DOMChange', ':history:transition']})
	@wait('ready')
	protected async recalculate(): Promise<void> {
		try {
			await this.async.sleep(50, {label: $$.syncStateDefer, join: true});
			this.initHeights();
			this.updateSteps();
			this.stickToStep();

		} catch {}
	}

	/**
	 * Handler: on component history cleared
	 */
	@p({watch: ':history:clear'})
	protected onHistoryCleared(): void {
		Object.assign(this.$refs.content.style, {height: 'initial'});
	}

	/**
	 * Handler: current step was changed
	 */
	@watch(':changeStep')
	@hook('mounted')
	@wait('ready')
	protected onStepChange(): CanPromise<void> {
		const
			{window: w, view: v} = this.$refs;

		this.async.once(w, 'transitionend', () => {
			if (this.isFullyOpened) {
				this.lock().catch(stderr);
				this.removeMod('events', false);

			} else {
				this.unlock().catch(stderr);
				this.setMod('events', false);

				if (this.scrollToTopOnClose) {
					v.scrollTo(0, 0);
				}
			}
		}, {label: $$.waitAnimationToFinish});

		this.stickToStep();
	}

	/**
	 * Handler: touch start
	 *
	 * @param e
	 * @param [isTrigger]
	 */
	protected onStart(e: TouchEvent, isTrigger: boolean = false): void {
		const
			touch = e.touches[0],
			{clientY} = touch;

		this.isTrigger = isTrigger;
		this.startY = clientY;
		this.startTime = performance.now();
	}

	/**
	 * Handler: touch move
	 * @param e
	 */
	protected onMove(e: TouchEvent): void {
		const {
			currentY,
			isViewportTopReached,
			isTrigger,
			isFullyOpened,
			lastStepOffset
		} = this;

		const
			{clientY} = e.touches[0],
			diff = (currentY || clientY) - clientY;

		this.currentY = clientY;
		this.direction = Math.sign(diff) as Direction;

		if (
			isTrigger ||
			!isFullyOpened ||
			(isViewportTopReached && (this.direction < 0 || this.offset < lastStepOffset))
		) {
			this.animate();
			this.diff += diff;

			if (e.cancelable) {
				e.preventDefault();
				e.stopPropagation();
			}

			return;
		}

		this.stopAnimation();
	}

	/**
	 * Handler: touch end
	 */
	protected onRelease(): void {
		const {
			startTime,
			isTrigger,
			fastSwipeDelay,
			swipeThreshold,
			fastSwipeThreshold,
			isViewportTopReached
		} = this;

		if (this.currentY === 0) {
			return;
		}

		const
			startEndDiff = Math.abs(this.startY - this.endY),
			endTime = performance.now();

		const isFastSwiped =
			endTime - startTime <= fastSwipeDelay &&
			startEndDiff >= fastSwipeThreshold;

		const isNotScroll = isFastSwiped && (
			isViewportTopReached ||
			!this.isFullyOpened ||
			isTrigger
		);

		const
			isThresholdPassed = !isFastSwiped && startEndDiff >= swipeThreshold;

		this.stopAnimation();
		this.moveToClosest(isNotScroll, isThresholdPassed);

		this.endY = this.endY + (this.startY - this.currentY);
		this.isTrigger = false;

		this.diff = 0;
		this.currentY = 0;
	}

	/** @override */
	protected beforeDestroy(): void {
		super.beforeDestroy();
		this.$el.remove();
	}
}

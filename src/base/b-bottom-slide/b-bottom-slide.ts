/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-bottom-slide/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import History from 'traits/i-history/history';
import iHistory from 'traits/i-history/i-history';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

import iOpen from 'traits/i-open/i-open';
import iVisible from 'traits/i-visible/i-visible';

import iBlock, {

	component,
	prop,
	field,
	system,

	hook,
	watch,
	wait,
	p,

	ModsDecl

} from 'super/i-block/i-block';

export * from 'super/i-data/i-data';

import { HeightMode, Direction } from 'base/b-bottom-slide/interface';
import { heightMode } from 'base/b-bottom-slide/const';

export * from 'base/b-bottom-slide/const';
export * from 'base/b-bottom-slide/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to create bottom sheet behavior that is similar to native mobile UI
 * @see https://material.io/develop/android/components/bottom-sheet-behavior/
 */
@component()
export default class bBottomSlide extends iBlock implements iLockPageScroll, iOpen, iVisible, iObserveDOM, iHistory {
	/**
	 * Component height mode:
	 * 1. "content" – the height value is based on a component content, but no more than the viewport height
	 * 2. "full" – the height value is equal to the viewport height
	 */
	@prop({type: String, validator: Object.hasOwnProperty(heightMode)})
	readonly heightMode: HeightMode = 'full';

	/**
	 * List of allowed component positions relative to the screen height (in percentages)
	 */
	@prop({type: Array, validator: (v) => v.every((a) => a >= 0 && a <= 100)})
	readonly stepsProp: number[] = [];

	/** @see [[bBottomSlide.steps]] */
	@field((o: bBottomSlide) => o.sync.link('stepsProp', (v: number[]) => v.slice().sort((a, b) => a - b)))
	readonly stepsStore!: number[];

	/**
	 * Minimum height value of a component visible part (in pixels),
	 * i.e. even the component is closed this part still be visible
	 */
	@prop({type: Number, validator: Number.isNonNegative})
	readonly visible: number = 0;

	/**
	 * Maximum height value to which you can pull the component
	 */
	@prop({type: Number, validator: (v) => v >= 0 && v <= 100})
	readonly maxVisiblePercent: number = 90;

	/**
	 * Maximum time in milliseconds after after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: Number.isPositive})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * Minimum required amount of pixels of scrolling after which we can assume that there was a quick swipe
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly fastSwipeThreshold: number = 10;

	/**
	 * Minimum required amount of pixels of scrolling to swipe
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly swipeThreshold: number = 40;

	/**
	 * If true, the component will overlay background while it's opened
	 */
	@prop(Boolean)
	readonly overlay: boolean = true;

	/**
	 * Maximum value of overlay opacity
	 */
	@prop({type: Number, validator: Number.isBetweenZeroAndOne})
	readonly maxOpacity: number = 0.8;

	/**
	 * If true, then the content scroll will be automatically reset to the top after closing the component
	 */
	@prop(Boolean)
	readonly scrollToTopOnClose: boolean = true;

	/**
	 * List of possible component positions relative to the screen height (in percentages)
	 */
	@p({cache: false})
	get steps(): number[] {
		const
			res = [this.visibleInPercent];

		if (this.heightMode === 'content') {
			res.push(this.contentHeight / this.windowHeight * 100);

		} else {
			res.push(this.maxVisiblePercent);
		}

		return res.concat(this.field.get<number[]>('stepsStore')!).sort((a, b) => a - b);
	}

	/**
	 * True if the content is fully opened
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

	/** @see [[iHistory.history]] */
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

	/** @see [[bBottomSlide.step]] */
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
	 * Sets a new component step
	 * @emits `stepChange(step: number)`
	 */
	protected set step(v: number) {
		if (v === this.step) {
			return;
		}

		this.stepStore = v;

		// @deprecated
		this.emit('changeStep', v);
		this.emit('stepChange', v);
	}

	/**
	 * List of possible component positions relative to the screen height (in pixels)
	 */
	@system()
	protected stepsInPixels: number[] = [];

	/**
	 * Timestamp of a start touch on the component
	 */
	@system()
	protected startTime: number = 0;

	/**
	 * Y position of a start touch on the component
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
	 * Difference in a cursor position compared to the last frame
	 */
	@system()
	protected diff: number = 0;

	/**
	 * Current cursor direction
	 */
	@system()
	protected direction: Direction = 0;

	/**
	 * Current value of the overlay transparency
	 */
	@system()
	protected opacity: number = 0;

	/**
	 * Window height
	 */
	@system()
	protected windowHeight: number = 0;

	/**
	 * Content height (in pixels)
	 */
	@system()
	protected contentHeight: number = 0;

	/**
	 * Maximum content height (in pixels)
	 */
	@system()
	protected contentMaxHeight: number = 0;

	/**
	 * True if the content is already scrolled to the top
	 */
	@system()
	protected isViewportTopReached: boolean = true;

	/**
	 * True if element positions are being updated now
	 */
	@system()
	protected isPositionUpdating: boolean = false;

	/**
	 * True if the component is switching to another step now
	 */
	@system()
	protected isStepTransitionInProgress: boolean = false;

	/**
	 * True if content is pulled by using the trigger
	 */
	@system()
	protected byTrigger: boolean = false;

	/** @see [[bBottomSlide.offset]] */
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
	 * Sets a new component offset
	 */
	protected set offset(value: number) {
		this.offsetStore = value;
		this.endY = value;
	}

	/** @see [[bBottomSlide.isPulling]] */
	@system()
	protected isPullingStore: boolean = false;

	/**
	 * True if the component is being pulled now
	 */
	@p({cache: false})
	protected get isPulling(): boolean {
		return this.isPullingStore;
	}

	/**
	 * Switches the component pulling mode
	 * @emits `moveStateChange(value boolean)`
	 */
	protected set isPulling(value: boolean) {
		if (this.isPullingStore === value) {
			return;
		}

		this.isPullingStore = value;

		this[value ? 'setRootMod' : 'removeRootMod']('fullscreen-moving', true);
		this[value ? 'setMod' : 'removeMod']('stick', false);

		// @deprecated
		this.emit('changeMoveState', value);
		this.emit('moveStateChange', value);
	}

	/**
	 * Minimum height value of a component visible part (in percents),
	 * i.e. even the component is closed this part still be visible
	 * @see [[bBottomSlide.visible]]
	 */
	@p({cache: false})
	protected get visibleInPercent(): number {
		return this.visible / this.windowHeight * 100;
	}

	/**
	 * Last step offset (in pixels)
	 */
	protected get lastStepOffset(): number {
		return this.stepsInPixels[this.stepsInPixels.length - 1];
	}

	/**
	 * Current step offset (in pixels)
	 */
	protected get currentStepOffset(): number {
		return this.stepsInPixels[this.step];
	}

	/**
	 * True if all animations need to use requestAnimationFrame
	 */
	protected get shouldUseRAF(): boolean {
		return !this.browser.is.iOS;
	}

	/** @see [[History.onPageTopVisibilityChange]] */
	onPageTopVisibilityChange(state: boolean): void {
		this.isViewportTopReached = state;
	}

	/** @see [[iLockPageScroll.lock]] */
	@wait('ready')
	lock(): Promise<void> {
		return iLockPageScroll.lock(this, this.$refs.view);
	}

	/** @see [[iLockPageScroll.unlock]] */
	unlock(): Promise<void> {
		return iLockPageScroll.unlock(this);
	}

	/**
	 * @see [[iOpen.open]]
	 * @param [step]
	 * @emits `open()`
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
	 * @see [[iOpen.close]]
	 * @emits `close()`
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
	 * Switches to the next component step.
	 * The methods returns false if the component is already fully opened.
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
	 * Switches to the previous component step.
	 * The methods returns false if the component is already closed.
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

	/** @see [[iOpen.onOpenedChange]] */
	onOpenedChange(): void {
		return;
	}

	/** @see [[iObserveDOM.onDOMChange]] */
	onDOMChange(): void {
		iObserveDOM.onDOMChange(this);
	}

	/** @see [[iOpen.onKeyClose]] */
	async onKeyClose(): Promise<void> {
		return;
	}

	/** @see [[iOpen.onTouchClose]] */
	async onTouchClose(): Promise<void> {
		return;
	}

	/** @see [[iObserveDOM.initObservers]] */
	@watch('heightMode')
	@hook('mounted')
	@wait('ready')
	initDOMObservers(): CanPromise<void> {
		iObserveDOM.observe(this, {
			node: this.$refs.content,
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
	 * Puts a node of the component to the top level of a DOM tree
	 */
	@hook('mounted')
	@wait('ready')
	protected initNodePosition(): CanPromise<void> {
		document.body.insertAdjacentElement('afterbegin', this.$el);
	}

	/**
	 * Initializes geometry of elements
	 */
	@hook('mounted')
	@wait('ready')
	protected initGeometry(): CanPromise<void> {
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
			// If documentElement height is equal to zero, maxVisiblePx is always be zero too,
			// even after new calling of initGeometry.
			// Also, view.clientHeight above would return zero as well, even though the real size is bigger.
			maxHeight: maxVisiblePx === 0 ? undefined : maxVisiblePx.px,
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
		this.updateWindowPosition();
	}

	/**
	 * Bakes values of steps in pixels
	 */
	@hook('mounted')
	@watch('steps')
	protected bakeSteps(): void {
		this.stepsInPixels = this.steps.map((s) => (s / 100 * this.windowHeight));
	}

	/**
	 * Sticks the component to the closest step
	 */
	protected stickToStep(): void {
		this.isPulling = false;
		this.offset = this.stepsInPixels[this.step];
		this.opacity = this.isFullyOpened ? this.maxOpacity : 0;
		this.stopMovingAnimation();
		this.updateWindowPosition();
		this.updateOpacity();
	}

	/**
	 * Updates a position of the window node
	 */
	@wait('ready')
	protected updateWindowPosition(): CanPromise<void> {
		this.$refs.window.style.transform = `translate3d(0, ${(-this.offset).px}, 0)`;
	}

	/**
	 * Updates an opacity of the overlay node
	 */
	@wait('ready')
	protected updateOpacity(): CanPromise<void> {
		const
			{$refs: {overlay}} = this;

		if (!(overlay instanceof HTMLElement)) {
			return;
		}

		overlay.style.setProperty('opacity', String(this.opacity));
	}

	/**
	 * Updates CSS values of component elements
	 */
	protected updateKeyframeValues(): void {
		const
			isMaxNotReached = this.windowHeight >= this.offset + this.diff;

		if (isMaxNotReached) {
			this.offset += this.diff;
			this.isPulling = true;
			this.updateWindowPosition();
		}

		this.performOpacity();
		this.diff = 0;
	}

	/**
	 * Initializes the animation of component elements moving
	 */
	protected animateMoving(): void {
		if (this.isPositionUpdating && this.shouldUseRAF) {
			return;
		}

		this.performMovingAnimation();
	}

	/**
	 * Performs the animation of component elements moving
	 */
	protected performMovingAnimation(): void {
		this.isPositionUpdating = true;

		if (this.shouldUseRAF) {
			this.async.requestAnimationFrame(() => {
				if (this.isPositionUpdating) {
					this.updateKeyframeValues();
					this.performMovingAnimation();
				}
			}, {label: $$.performMovingAnimation});

		} else {
			this.updateKeyframeValues();
		}
	}

	/**
	 * Stops the animation of component elements moving
	 */
	protected stopMovingAnimation(): void {
		this.async.clearAnimationFrame({label: $$.performMovingAnimation});
		this.isPositionUpdating = false;
		this.diff = 0;
	}

	/**
	 * Performs the animation of the component overlay opacity
	 */
	@wait('ready')
	protected performOpacity(): CanPromise<void> {
		const
			{$refs: {overlay}, maxOpacity} = this;

		if (!overlay || maxOpacity < 0) {
			return;
		}

		const
			stepLength = this.steps.length,
			lastStep = this.stepsInPixels[stepLength - 1],
			penultimateStep = this.stepsInPixels[stepLength - 2];

		if (penultimateStep === undefined || penultimateStep > this.offset) {
			return;
		}

		const
			p = (lastStep - penultimateStep) / 100,
			currentP = (lastStep - this.offset) / p,
			calculatedOpacity = maxOpacity - maxOpacity / 100 * currentP,
			opacity = calculatedOpacity > maxOpacity ? maxOpacity : calculatedOpacity,
			diff = Math.abs(this.opacity - opacity) >= 0.025;

		if (!diff) {
			return;
		}

		this.opacity = opacity;
		this.updateOpacity();
	}

	/**
	 * Moves the component to the nearest step relative to the current position
	 *
	 * @param respectDirection - if true, then when searching for a new step to change,
	 *   the cursor direction will be taken into account, but not the nearest step
	 *
	 * @param isThresholdPassed - if true, then the minimum threshold to change a step is passed
	 */
	protected moveToClosest(respectDirection: boolean, isThresholdPassed: boolean): void {
		const
			{offset, direction} = this;

		if (this.heightMode === 'content') {
			if (!respectDirection && isThresholdPassed) {
				this[this.contentHeight / 2 < offset ? 'next' : 'prev']();

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
	 * Recalculates a component state: sizes, positions, etc.
	 */
	@watch(['window:resize', ':DOMChange', ':history:transition'])
	@wait('ready')
	protected async recalculateState(): Promise<void> {
		try {
			await this.async.sleep(50, {label: $$.syncStateDefer, join: true});
			this.initGeometry();
			this.bakeSteps();
			this.stickToStep();

		} catch {}
	}

	/**
	 * Removes the component element from DOM if its transition is finished
	 */
	@hook('beforeDestroy')
	protected removeFromDOMIfPossible(): void {
		if (!this.isStepTransitionInProgress) {
			this.$el.remove();
		}
	}

	/**
	 * Handler: the component history was cleared
	 */
	@watch(':history:clear')
	protected onHistoryClear(): void {
		this.$refs.content.style.removeProperty('height');
	}

	/**
	 * Handler: the current step was changed
	 */
	@watch(':changeStep')
	@hook('mounted')
	@wait('ready')
	protected onStepChange(): CanPromise<void> {
		const {
			window: win,
			view
		} = this.$refs;

		this.isStepTransitionInProgress = true;

		this.async.once(win, 'transitionend', () => {
			if (this.isFullyOpened) {
				this.lock().catch(stderr);
				this.removeMod('events', false);

			} else {
				this.unlock().catch(stderr);
				this.setMod('events', false);

				if (this.scrollToTopOnClose) {
					view.scrollTo(0, 0);
				}
			}

			this.isStepTransitionInProgress = false;

			if (this.componentStatus === 'destroyed') {
				this.removeFromDOMIfPossible();
			}

		}, {group: ':zombie', label: $$.waitAnimationToFinish});

		this.stickToStep();
	}

	/**
	 * Handler: start to pull the component
	 *
	 * @param e
	 * @param [isTrigger]
	 */
	protected onPullStart(e: TouchEvent, isTrigger: boolean = false): void {
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
	protected onPull(e: TouchEvent): void {
		const
			{clientY} = e.touches[0];

		const
			diff = (this.currentY || clientY) - clientY;

		this.currentY = clientY;
		this.direction = Math.sign(diff) as Direction;

		const needAnimate =
			this.byTrigger ||
			!this.isFullyOpened ||
			(this.isViewportTopReached && (this.direction < 0 || this.offset < this.lastStepOffset));

		if (needAnimate) {
			this.animateMoving();
			this.diff += diff;

			if (e.cancelable) {
				e.preventDefault();
				e.stopPropagation();
			}

			return;
		}

		this.stopMovingAnimation();
	}

	/**
	 * Handler: finish to pull the component
	 */
	protected onPullEnd(): void {
		if (this.currentY === 0) {
			return;
		}

		const
			startEndDiff = Math.abs(this.startY - this.endY),
			endTime = performance.now();

		const isFastSwipe =
			endTime - this.startTime <= this.fastSwipeDelay &&
			startEndDiff >= this.fastSwipeThreshold;

		const notScroll = isFastSwipe && (
			!this.isFullyOpened ||
			this.isViewportTopReached ||
			this.byTrigger
		);

		const
			isThresholdPassed = !isFastSwipe && startEndDiff >= this.swipeThreshold;

		this.stopMovingAnimation();
		this.moveToClosest(notScroll, isThresholdPassed);

		this.endY = this.endY + (this.startY - this.currentY);
		this.byTrigger = false;

		this.diff = 0;
		this.currentY = 0;
	}
}

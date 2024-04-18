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
import SyncPromise from 'core/promise/sync';

import { derive } from 'core/functools/trait';

import History from 'traits/i-history/history';
import type iHistory from 'traits/i-history/i-history';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

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

import { heightMode } from 'base/b-bottom-slide/const';
import type { HeightMode, Direction } from 'base/b-bottom-slide/interface';

export * from 'super/i-data/i-data';

export * from 'base/b-bottom-slide/const';
export * from 'base/b-bottom-slide/interface';

export const
	$$ = symbolGenerator();

interface bBottomSlide extends
	Trait<typeof iLockPageScroll>,
	Trait<typeof iOpen> {}

/**
 * Component to create bottom sheet behavior that is similar to native mobile UI
 * @see https://material.io/develop/android/components/bottom-sheet-behavior/
 */
@component()
@derive(iLockPageScroll, iOpen)
class bBottomSlide extends iBlock implements iLockPageScroll, iOpen, iVisible, iHistory {
	/** @see [[iVisible.prototype.hideIfOffline]] */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * Component height mode:
	 *
	 * 1. `content` – the height value is based on a component content, but no more than the viewport height
	 * 2. `full` – the height value is equal to the viewport height
	 */
	@prop({type: String, validator: Object.hasOwnProperty(heightMode)})
	readonly heightMode: HeightMode = 'full';

	/**
	 * List of allowed component positions relative to the screen height (in percentages)
	 */
	@prop({type: Array, validator: (v: number[]) => v.every((a) => a >= 0 && a <= 100)})
	readonly stepsProp: number[] = [];

	/** @see [[bBottomSlide.steps]] */
	@field<bBottomSlide>((o) => o.sync.link('stepsProp', (v: number[]) => v.slice().sort((a, b) => a - b)))
	readonly stepsStore!: number[];

	/**
	 * The minimum height value of a visible part (in pixels), i.e.,
	 * even the component is closed, this part still be visible
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isNonNegative})
	readonly visible: number = 0;

	/**
	 * The maximum height value to which you can pull the component
	 */
	@prop({type: Number, validator: (v: number) => v >= 0 && v <= 100})
	readonly maxVisiblePercent: number = 90;

	/**
	 * The maximum time in milliseconds after which we can assume that there was a quick swipe
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isPositive})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * The minimum required amount of pixels of scrolling after which we can assume that there was a quick swipe
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isNatural})
	readonly fastSwipeThreshold: number = 10;

	/**
	 * The minimum required amount of pixels of scrolling to swipe
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isNatural})
	readonly swipeThreshold: number = 40;

	/**
	 * If true, the component will overlay background while it's opened
	 */
	@prop(Boolean)
	readonly overlay: boolean = true;

	/**
	 * The maximum value of overlay opacity
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isBetweenZeroAndOne})
	readonly maxOpacity: number = 0.8;

	/**
	 * If true, then the content scroll will be automatically reset to the top after closing the component
	 */
	@prop(Boolean)
	readonly scrollToTopOnClose: boolean = true;

	/**
	 * If false, the inner content of the component won't be rendered if the component isn't opened
	 */
	@prop(Boolean)
	readonly forceInnerRender: boolean = true;

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

	/** @see [[iHistory.history]] */
	@system<iHistory>((ctx) => new History(ctx))
	readonly history!: History;

	static override readonly mods: ModsDecl = {
		...iOpen.mods,
		...iVisible.mods,

		stick: [
			['true'],
			'false'
		],

		events: [
			'true',
			['false']
		],

		heightMode: [
			'content',
			'full'
		]
	};

	protected override $refs!: {
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
	@system(() => document.documentElement.clientHeight)
	protected windowHeight: number = 0;

	/**
	 * Content height (in pixels)
	 */
	@system()
	protected contentHeight: number = 0;

	/**
	 * The maximum content height (in pixels)
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
		const
			lastStepOffset = <CanUndef<number>>this.lastStepOffset;

		if (lastStepOffset != null && value > lastStepOffset) {
			value = lastStepOffset;
		}

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
		void this[value ? 'setMod' : 'removeMod']('stick', false);

		// @deprecated
		this.emit('changeMoveState', value);
		this.emit('moveStateChange', value);
	}

	/**
	 * The minimum height value of a component visible part (in percents),
	 * i.e. even the component is closed this part still be visible
	 * @see [[bBottomSlide.visible]]
	 */
	@p({cache: false})
	protected get visibleInPercent(): number {
		return this.windowHeight === 0 ? 0 : this.visible / this.windowHeight * 100;
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
		return this.browser.is.iOS === false;
	}

	/** @see [[History.onPageTopVisibilityChange]] */
	onPageTopVisibilityChange(state: boolean): void {
		this.isViewportTopReached = state;
	}

	/** @see [[iLockPageScroll.lock]] */
	@wait('ready', {label: $$.lock})
	lock(): Promise<void> {
		return iLockPageScroll.lock(this, this.$refs.view);
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

		if (this.visible === 0) {
			void this.removeMod('hidden', true);
			await iOpen.open(this);
		}

		const
			prevStep = this.step;

		this.step = step ?? 1;

		if (prevStep === 0) {
			this.history.initIndex();
		}

		this.emit('open');
		return true;
	}

	/**
	 * @see [[iOpen.close]]
	 * @emits `close()`
	 */
	async close(): Promise<boolean> {
		if (this.isClosed) {
			if (this.history.length > 1) {
				this.history.clear();
			}

			return false;
		}

		this.step = 0;

		if (this.visible === 0) {
			iOpen.close(this).catch(stderr);
			await this.setMod('hidden', true);
		}

		this.history.clear();
		this.emit('close');
		return true;
	}

	/**
	 * Switches to the next component step.
	 * The method returns false if the component is already fully opened.
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
	 * The method returns false if the component is already closed.
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

	/** @see [[iOpen.onKeyClose]] */
	async onKeyClose(): Promise<void> {
		// Loopback
	}

	/** @see [[iOpen.onTouchClose]] */
	async onTouchClose(): Promise<void> {
		// Loopback
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('heightMode', 'heightMode', String);
		this.sync.mod('visible', 'visible', Boolean);
		this.sync.mod('opened', 'visible', Boolean);
	}

	/**
	 * Puts a node of the component to the top level of a DOM tree
	 */
	@hook('mounted')
	@wait('ready', {label: $$.initNodePosition})
	protected initNodePosition(): CanPromise<void> {
		document.body.insertAdjacentElement('afterbegin', this.$el!);
	}

	/**
	 * Initializes geometry of elements
	 */
	@hook('mounted')
	@wait('ready')
	protected async initGeometry(): Promise<void> {
		const [header, content, view, window] = await Promise.all([
			this.waitRef<HTMLElement>('header', {label: $$.initGeometry}),
			this.waitRef<HTMLElement>('content'),
			this.waitRef<HTMLElement>('view'),
			this.waitRef<HTMLElement>('window')
		]);

		const
			{maxVisiblePercent} = this;

		const
			currentPage = this.history.current?.content;

		if (this.heightMode === 'content' && currentPage?.initBoundingRect) {
			const
				currentContentPageHeight = currentPage.el.scrollHeight;

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
		this.initOffset();
	}

	/**
	 * Bakes values of steps in pixels
	 */
	@watch('steps')
	protected bakeSteps(): void {
		this.stepsInPixels = this.steps.map((s) => (s / 100 * this.windowHeight));
	}

	/**
	 * Initializes offset of the component
	 */
	@watch('visible')
	protected initOffset(): void {
		this.offset = this.visible;
		void this.updateWindowPosition();
	}

	/**
	 * Initializes initial 'hidden' modifier value
	 */
	@hook('created')
	protected initHiddenState(): void {
		if (this.visible === 0) {
			void this.setMod('hidden', true);
		}
	}

	/**
	 * Sticks the component to the closest step
	 */
	protected stickToStep(): void {
		this.isPulling = false;
		this.offset = this.stepsInPixels[this.step];
		this.opacity = this.isFullyOpened ? this.maxOpacity : 0;
		this.stopMovingAnimation();

		void this.updateWindowPosition();
		void this.updateOpacity();
	}

	/**
	 * Updates a position of the window node
	 */
	@wait('ready', {label: $$.updateWindowPosition})
	protected async updateWindowPosition(): Promise<void> {
		const window = await this.waitRef<HTMLElement>('window');
		window.style.transform = `translate3d(0, ${(-this.offset).px}, 0)`;
	}

	/**
	 * Updates an opacity of the overlay node
	 */
	@wait('ready', {label: $$.updateOpacity})
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

			void this.updateWindowPosition();
		}

		void this.performOpacity();
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
	@wait('ready', {label: $$.performOpacity})
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

		if (!Object.isNumber(penultimateStep) || penultimateStep > this.offset) {
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
		void this.updateOpacity();
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
				void this[this.contentHeight / 2 < offset ? 'next' : 'prev']();

			} else if (respectDirection) {
				void this[direction > 0 ? 'next' : 'prev']();
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

					if (!Object.isNumber(min) || min > res) {
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
					step = i === 0 ? i : i - 1;
				}
			}

			const
				prevStep = this.step;

			if (step === 0) {
				this.close().catch(stderr);

			} else if (prevStep === 0) {
				this.open(step).catch(stderr);

			} else {
				this.step = step;
			}

		}

		this.stickToStep();
	}

	/**
	 * Recalculates a component state: sizes, positions, etc.
	 */
	@watch(':history:transition')
	@wait('ready')
	protected async recalculateState(): Promise<void> {
		try {
			await this.async.sleep(50, {label: $$.syncStateDefer, join: true});
			await this.initGeometry();
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
			this.$el?.remove();
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
	protected onStepChange(): void {
		SyncPromise.all([
			this.waitRef<HTMLElement>('window', {label: $$.onStepChange}),
			this.waitRef<HTMLElement>('view')
		])

			.then(([win, view]) => {
				this.isStepTransitionInProgress = true;

				this.async.once(win, 'transitionend', () => {
					if (this.isFullyOpened) {
						this.lock().catch(stderr);
						void this.removeMod('events', false);

					} else {
						this.unlock().catch(stderr);
						void this.setMod('events', false);

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
			})

			.catch(stderr);
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
			diff = this.currentY > 0 ? this.currentY - clientY : 0;

		this.currentY = clientY;
		this.direction = <Direction>Math.sign(diff);

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
	 * Handler: the component has been released after pulling
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

		this.endY += this.startY - this.currentY;
		this.byTrigger = false;

		this.diff = 0;
		this.currentY = 0;
	}
}

export default bBottomSlide;

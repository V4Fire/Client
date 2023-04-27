/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-bottom-slide/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import { derive } from 'core/functools/trait';

import History from 'components/traits/i-history/history';
import type iHistory from 'components/traits/i-history/i-history';

import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';

import iOpen from 'components/traits/i-open/i-open';
import iVisible from 'components/traits/i-visible/i-visible';

import Block, { getFullElementName } from 'components/friends/block';

import iBlock, {

	component,
	field,
	system,
	computed,

	hook,
	watch,
	wait,

	ModsDecl,
	UnsafeGetter

} from 'components/super/i-block/i-block';

import { $$ } from 'components/form/b-select/const';
import type { UnsafeBBottomSlide } from 'components/base/b-bottom-slide/interface';

import bBottomSlideProps from 'components/base/b-bottom-slide/props';
import Animation from 'components/base/b-bottom-slide/modules/animation';
import SwipeControl from 'components/base/b-bottom-slide/modules/swipe-control';
import Geometry from 'components/base/b-bottom-slide/modules/geometry';

export * from 'components/super/i-data/i-data';

export * from 'components/base/b-bottom-slide/const';
export * from 'components/base/b-bottom-slide/interface';

Block.addToPrototype({getFullElementName});

interface bBottomSlide extends
	Trait<typeof iLockPageScroll>,
	Trait<typeof iObserveDOM>,
	Trait<typeof iOpen> {}

/**
 * Component to create bottom sheet behavior that is similar to native mobile UI
 * @see https://material.io/develop/android/components/bottom-sheet-behavior/
 */
@component()
@derive(iLockPageScroll, iObserveDOM, iOpen)
class bBottomSlide extends bBottomSlideProps implements iLockPageScroll, iObserveDOM, iOpen, iVisible, iHistory {
	override get unsafe(): UnsafeGetter<UnsafeBBottomSlide<this>> {
		return Object.cast(this);
	}

	/** @see [[bBottomSlide.steps]] */
	@field<bBottomSlide>((o) => o.sync.link('stepsProp', (v: number[]) => v.slice().sort((a, b) => a - b)))
	readonly stepsStore!: number[];

	/**
	 * True if the content is fully opened
	 */
	@computed({cache: false})
	get isFullyOpened(): boolean {
		return this.step === this.steps.length - 1;
	}

	/**
	 * True if the content is fully closed
	 */
	@computed({cache: false})
	get isClosed(): boolean {
		return this.step === 0;
	}

	/**
	 * List of possible component positions relative to the screen height (in percentages)
	 */
	@computed({cache: false})
	get steps(): number[] {
		const
			res = [this.visibleInPercent];

		if (this.heightMode === 'content') {
			res.push(this.geometry.contentHeight / this.geometry.windowHeight * 100);

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

	protected override readonly $refs!: iBlock['$refs'] & {
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
	@computed({cache: false})
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
	 * Current value of the overlay transparency
	 */
	@system()
	protected opacity: number = 0;

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

	/** @see [[bBottomSlide.offset]] */
	@system()
	protected offsetStore: number = 0;

	/**
	 * Current component offset
	 */
	@computed({cache: false})
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
		this.swipeControl.notifyOffsetChanged(value);
	}

	/** @see [[bBottomSlide.isPulling]] */
	@system()
	protected isPullingStore: boolean = false;

	/**
	 * True if the component is being pulled now
	 */
	@computed({cache: false})
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
	@computed({cache: false})
	protected get visibleInPercent(): number {
		return this.geometry.windowHeight === 0 ? 0 : this.visible / this.geometry.windowHeight * 100;
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
	 * Animation API
	 */
	@system((o) => new Animation(o))
	protected animation!: Animation;

	/**
	 * Swipe control API
	 */
	@system((o) => new SwipeControl(o))
	protected swipeControl!: SwipeControl;

	/**
	 * Component's geometry
	 */
	@system((o) => new Geometry(o))
	protected geometry!: Geometry;

	/** @see [[History.onPageTopVisibilityChange]] */
	onPageTopVisibilityChange(state: boolean): void {
		this.isViewportTopReached = state;
	}

	/** @see [[iLockPageScroll.lock]] */
	@wait('ready', {label: $$.lock})
	lockPageScroll(): Promise<void> {
		return iLockPageScroll.lockPageScroll(this, this.$refs.view);
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

	/** @see [[iObserveDOM.initObservers]] */
	@watch('heightMode')
	@hook('mounted')
	@wait('ready')
	async initDOMObservers(): Promise<void> {
		const
			content = await this.waitRef<HTMLElement>('content', {label: $$.initDOMObservers});

		iObserveDOM.observe(this, {
			node: content,
			childList: true,
			subtree: true
		});
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

	/** @see [[Geometry.init]] */
	@hook('mounted')
	@wait('ready')
	protected async initGeometry(): Promise<void> {
		await this.geometry.init();

		this.bakeSteps();
		this.initOffset();
	}

	/**
	 * Bakes values of steps in pixels
	 */
	protected bakeSteps(): void {
		this.stepsInPixels = this.steps.map((s) => (s / 100 * this.geometry.windowHeight));
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
		this.animation.stopMoving();

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
	 * Recalculates a component state: sizes, positions, etc.
	 */
	@watch(['window:resize', 'localEmitter:DOMChange', ':history:transition'])
	@wait('ready')
	protected async recalculateState(): Promise<void> {
		try {
			await this.async.sleep(50, {label: $$.syncStateDefer, join: true});
			await this.initGeometry();
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
						this.lockPageScroll().catch(stderr);
						void this.removeMod('events', false);

					} else {
						this.unlockPageScroll().catch(stderr);
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
}

export default bBottomSlide;

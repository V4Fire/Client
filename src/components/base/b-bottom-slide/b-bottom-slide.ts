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

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import { derive } from 'core/functools/trait';

import History from 'components/traits/i-history/history';
import type iHistory from 'components/traits/i-history/i-history';

import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';

import iOpen from 'components/traits/i-open/i-open';
import iVisible from 'components/traits/i-visible/i-visible';

import Block, { getFullElementName } from 'components/friends/block';

import iBlock, { component, field, system, computed, hook, watch, wait } from 'components/super/i-block/i-block';
import type { ModsDecl, UnsafeGetter } from 'components/super/i-block/i-block';

import type { UnsafeBBottomSlide } from 'components/base/b-bottom-slide/interface';

import iBottomSlideProps from 'components/base/b-bottom-slide/props';
import { Animation, Overlay, Geometry, SwipeControl } from 'components/base/b-bottom-slide/modules';

export * from 'components/super/i-data/i-data';

export * from 'components/base/b-bottom-slide/const';
export * from 'components/base/b-bottom-slide/interface';

const $$ = symbolGenerator();

Block.addToPrototype({getFullElementName});

interface bBottomSlide extends
	Trait<typeof iLockPageScroll>,
	Trait<typeof iOpen> {}

@component()
@derive(iLockPageScroll, iOpen)
class bBottomSlide extends iBottomSlideProps implements iLockPageScroll, iOpen, iVisible, iHistory {
	override get unsafe(): UnsafeGetter<UnsafeBBottomSlide<this>> {
		return Object.cast(this);
	}

	/**
	 * True if the content is fully opened
	 */
	@computed({cache: false})
	get isFullyOpened(): boolean {
		return this.step === this.stepCount - 1;
	}

	/**
	 * True if the content is completely closed
	 */
	@computed({cache: false})
	get isClosed(): boolean {
		return this.step === 0;
	}

	/**
	 * A list of possible component positions relative to screen height (percentage)
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

	/**
	 * Returns the number of component steps
	 */
	@computed({cache: true, dependencies: ['stepsStore']})
	get stepCount(): number {
		// The component always has at least 2 steps
		return 2 + this.stepsStore.length;
	}

	/** {@link iHistory.history} */
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

	/** {@link bBottomSlide.step} */
	@system()
	protected stepStore: number = 0;

	/** {@link bBottomSlide.steps} */
	@field<bBottomSlide>((o) => o.sync.link('stepsProp', (v: number[]) => v.slice().sort((a, b) => a - b)))
	protected readonly stepsStore!: number[];

	/**
	 * Current component step
	 */
	@computed({cache: false})
	protected get step(): number {
		return this.stepStore;
	}

	/**
	 * Sets a new component step
	 *
	 * @param value
	 * @emits `stepChange(step: number)`
	 */
	protected set step(value: number) {
		if (value === this.step) {
			return;
		}

		this.stepStore = value;
		this.emit('stepChange', value);
	}

	/**
	 * True if the content is already scrolled to the top
	 */
	@system()
	protected isViewportTopReached: boolean = true;

	/**
	 * True if the component is currently switching to another step
	 */
	@system()
	protected isStepTransitionInProgress: boolean = false;

	/** {@link bBottomSlide.isPulling} */
	@system()
	protected isPullingStore: boolean = false;

	/**
	 * True if the component is currently being pulled
	 */
	@computed({cache: false})
	protected get isPulling(): boolean {
		return this.isPullingStore;
	}

	/**
	 * Switches the component pulling mode
	 *
	 * @param value
	 * @emits `moveStateChange(value boolean)`
	 */
	protected set isPulling(value: boolean) {
		if (this.isPullingStore === value) {
			return;
		}

		this.isPullingStore = value;

		this[value ? 'setRootMod' : 'removeRootMod']('fullscreen-moving', true);
		void this[value ? 'setMod' : 'removeMod']('stick', false);

		this.emit('moveStateChange', value);
	}

	/**
	 * The minimum value of the height of the component visible part (in percent),
	 * i.e., even if the component is closed, this part will still be visible
	 * {@link bBottomSlide.visible}
	 */
	@computed({cache: false})
	protected get visibleInPercent(): number {
		return this.geometry.windowHeight === 0 ? 0 : this.visible / this.geometry.windowHeight * 100;
	}

	/**
	 * Animation API - handles all component's animations
	 */
	@system((o) => new Animation(o))
	protected animation!: Animation;

	/**
	 * Swipe API - provides control of the component via swipes
	 */
	@system((o) => new SwipeControl(o))
	protected swipeControl!: SwipeControl;

	/**
	 * Component's geometry - stores different heights and offsets
	 */
	@system((o) => new Geometry(o))
	protected geometry!: Geometry;

	/**
	 * Overlay API - provides control of the component's overlay
	 */
	@system((o) => new Overlay(o))
	protected overlayAPI!: Overlay;

	/** {@link History.onPageTopVisibilityChange} */
	onPageTopVisibilityChange(state: boolean): void {
		this.isViewportTopReached = state;
	}

	/** {@link iLockPageScroll.prototype.lockPageScroll} */
	@wait('ready', {label: $$.lock})
	lockPageScroll(): Promise<void> {
		return iLockPageScroll.lockPageScroll(this, this.$refs.view);
	}

	/**
	 * {@link iOpen.prototype.open}
	 *
	 * @param [step]
	 * @emits `open()`
	 */
	@wait('ready')
	async open(step?: number): Promise<boolean> {
		if (step !== undefined && step > this.stepCount - 1) {
			return false;
		}

		if (this.visible === 0) {
			void this.removeMod('hidden', true);
			await iOpen.open(this);
		}

		const prevStep = this.step;

		this.step = step ?? 1;

		if (prevStep === 0) {
			this.history.initIndex();
		}

		this.emit('open');
		return true;
	}

	/**
	 * {@link iOpen.prototype.close}
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

		const step = this.step - 1;

		if (step === 0) {
			return this.close();
		}

		this.step = step;
		return true;
	}

	/** {@link iOpen.prototype.onKeyClose} */
	async onKeyClose(): Promise<void> {
		// Loopback
	}

	/** {@link iOpen.prototype.onTouchClose} */
	async onTouchClose(): Promise<void> {
		// Loopback
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('heightMode', 'heightMode', String);
		this.sync.mod('visible', 'visible', Boolean);
		this.sync.mod('opened', 'visible', Boolean);
	}

	/** {@link Geometry.init} */
	@hook('mounted')
	@wait('ready')
	protected async initGeometry(): Promise<void> {
		await this.geometry.init();
		this.initOffset();
	}

	/**
	 * Initializes the component offset
	 */
	@watch('visible')
	protected initOffset(): void {
		this.geometry.setOffset(this.visible);
		void this.updateWindowPosition();
	}

	/**
	 * Unlocks the page scroll when the component is destroyed
	 */
	@hook('beforeCreate')
	protected unlockPageScrollOnDestroy(): void {
		this.async.worker(() => this.unlockPageScroll().catch(stderr));
	}

	/**
	 * Initializes the initial `hidden` modifier value
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
		this.geometry.setOffsetForStep(this.step);
		this.animation.stopMoving();

		void this.updateWindowPosition();
		void this.overlayAPI.setOpacity(this.isFullyOpened ? this.maxOpacity : 0);
	}

	/**
	 * Updates the position of the window node
	 */
	@wait('ready', {label: $$.updateWindowPosition})
	protected async updateWindowPosition(): Promise<void> {
		const window = await this.waitRef<HTMLElement>('window');
		window.style.transform = `translate3d(0, ${(-this.geometry.offset).px}, 0)`;
	}

	/**
	 * Recalculates the component state: sizes, positions, etc.
	 */
	@watch(':history:transition')
	@wait('ready')
	protected async recalculateState(): Promise<void> {
		try {
			await this.async.sleep(50, {label: $$.syncStateDefer, join: true});
			await this.initGeometry();
			this.stickToStep();

		} catch {}
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
	@watch(':stepChange')
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

				}, {group: ':zombie', label: $$.waitAnimationToFinish});

				this.stickToStep();
			})

			.catch(stderr);
	}
}

export default bBottomSlide;

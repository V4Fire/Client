/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-window/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { derive } from 'core/functools/trait';

import Block, { getElementSelector } from 'components/friends/block';

import iVisible from 'components/traits/i-visible/i-visible';
import iWidth from 'components/traits/i-width/i-width';
import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iOpenToggle, { CloseHelperEvents } from 'components/traits/i-open-toggle/i-open-toggle';

import iData, {

	component,
	prop,
	field,
	hook,
	watch,
	wait,

	Stage,

	ModsDecl,
	ModEvent,
	SetModEvent

} from 'components/super/i-data/i-data';

import type { StageTitles } from 'components/base/b-window/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/traits/i-open-toggle/i-open-toggle';

Block.addToPrototype({getElementSelector});

const
	$$ = symbolGenerator();

interface bWindow extends Trait<typeof iOpenToggle>, Trait<typeof iLockPageScroll> {}

/**
 * Component to create a modal window
 */
@component()
@derive(iOpenToggle, iLockPageScroll)
class bWindow extends iData implements iVisible, iWidth, iOpenToggle, iLockPageScroll {
	override readonly proxyCall: boolean = true;

	/** {@link [iVisible.prototype.hideIfOffline]]} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * Initial window title
	 */
	@prop({type: String, required: false})
	readonly titleProp?: string;

	/**
	 * A dictionary of window titles. The dictionary values are tied to the `stage` values.
	 * A key with the name `[[DEFAULT]]` is used by default. If a key value is defined as a function,
	 * it will be invoked (the result will be used as a title).
	 *
	 * @example
	 * ```
	 * < b-window &
	 *   :dataProvider = 'User' |
	 *   :stageTitles = {
	 *     '[[DEFAULT]]': 'Default title',
	 *     'uploading': 'Uploading the avatar...',
	 *     'edit': (ctx) => `Edit a user with the identifier ${ctx.db?.id}`
	 *   }
	 * .
	 * ```
	 */
	@prop({type: Object, required: false})
	readonly stageTitles?: StageTitles;

	/**
	 * A name of the active third-party slot to show.
	 *
	 * This feature brings a possibility to decompose different window templates into separate files
	 * with the special `.window` postfix. All those templates are automatically loaded, but you must provide their
	 * name to activate one or another.
	 *
	 * @example
	 * **my-page/upload-avatar.window.ss**
	 *
	 * ```
	 * - namespace b-window
	 *
	 * - eval
	 *  /// Register an external block
	 *  ? @@saveTplDir(__dirname, 'windowSlotUploadAvatar')
	 *
	 * /// Notice, to correct work the external block name must start with "windowSlot"
	 * - block index->windowSlotUploadAvatar(nms)
	 *   /// The `nms` value is taken from a basename of this file directory
	 *   /// .my-page
	 *   < ?.${nms}
	 *     < button.&__button
	 *       Upload an avatar
	 * ```
	 *
	 * ```
	 * /// This component will use a template from windowSlotUploadAvatar
	 * < b-window :slotName = 'windowSlotUploadAvatar'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly slotNameProp?: string;

	/**
	 * If false, inner content of the component won't be rendered if the component isn't opened
	 */
	@prop(Boolean)
	readonly forceInnerRender: boolean = true;

	static override readonly mods: ModsDecl = {
		...iVisible.mods,
		...iWidth.mods,

		opened: [
			...iOpenToggle.mods.opened ?? [],
			['false']
		],

		position: [
			['fixed'],
			'absolute'
		]
	};

	/** @inheritDoc */
	declare protected readonly $refs: iData['$refs'] & {
		window: HTMLElement;
	};

	/**
	 * Window title store
	 * {@link bWindow.titleProp}
	 */
	@field((o) => o.sync.link())
	protected titleStore?: string;

	/**
	 * Slot name store
	 * {@link bWindow.slotNameProp}
	 */
	@field((o) => o.sync.link())
	protected slotNameStore?: string;

	/**
	 * Name of the active third-party slot to show
	 * {@link bWindow.slotNameProp}
	 */
	get slotName(): CanUndef<string> {
		return this.field.get('slotNameStore');
	}

	/**
	 * Sets a new third-party slot to show
	 * {@link bWindow.slotNameProp}
	 *
	 * @param value
	 */
	set slotName(value: CanUndef<string>) {
		this.field.set('slotNameStore', value);
	}

	/**
	 * Window title
	 * {@link bWindow.titleStore}
	 */
	get title(): string {
		const
			v = this.field.get<string>('titleStore') ?? '',
			{stageTitles} = this;

		if (stageTitles) {
			let
				stageValue = stageTitles[v];

			if (stageValue == null) {
				stageValue = stageTitles['[[DEFAULT]]'];
			}

			if (stageValue != null) {
				stageValue = Object.isFunction(stageValue) ? stageValue(this) : stageValue;
			}

			return stageValue ?? v;
		}

		return v;
	}

	/**
	 * Sets a new window title
	 * @param value
	 */
	set title(value: string) {
		this.field.set('titleStore', value);
	}

	/**
	 * {@link iOpenToggle.prototype.open}
	 * @param [stage] - component stage to open
	 */
	async open(stage?: Stage): Promise<boolean> {
		if (await iOpenToggle.open(this)) {
			if (stage != null) {
				this.stage = stage;
			}

			this.setRootMod('opened', true);
			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** {@link iOpenToggle.prototype.close} */
	async close(): Promise<boolean> {
		if (await iOpenToggle.close(this)) {
			this.setRootMod('opened', false);
			this.emit('close');
			return true;
		}

		return false;
	}

	/** {@link iLockPageScroll.prototype.lockPageScroll} */
	@wait('loading', {label: $$.lock})
	lockPageScroll(): Promise<void> {
		return iLockPageScroll.lockPageScroll(this, this.$refs.window);
	}

	/** {@link iOpenToggle.prototype.onOpenedChange} */
	async onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		await this.setMod('hidden', e.type === 'remove' ? true : e.value === 'false');
	}

	/** {@link iOpenToggle.prototype.onTouchClose} */
	async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <CanUndef<Element>>e.target;

		if (target == null || this.block == null) {
			return;
		}

		if (target.matches(this.block.getElementSelector('wrapper'))) {
			e.preventDefault();
			await this.close();
		}
	}

	/**
	 * Attaches dynamic window styles to the root node
	 */
	@watch({path: 'mods.position', immediate: true})
	@wait('loading', {label: $$.initRootStyles})
	protected initRootStyles(): CanPromise<void> {
		const
			el = <HTMLElement>this.$el;

		if (this.mods.position === 'absolute') {
			Object.assign(el.style, {
				top: scrollY.px
			});
		}
	}

	/** {@link iOpenToggle.initCloseHelpers} */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	protected override initModEvents(): void {
		super.initModEvents();
		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);
		iLockPageScroll.initModEvents(this);
	}

	protected override beforeDestroy(): void {
		super.beforeDestroy();
		this.removeRootMod('hidden');
	}
}

export default bWindow;

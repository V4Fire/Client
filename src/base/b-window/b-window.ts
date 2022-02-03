/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-window/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { derive } from 'core/functools/trait';

import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';

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

} from 'super/i-data/i-data';

import type { StageTitles } from 'base/b-window/interface';

export * from 'super/i-data/i-data';
export * from 'traits/i-open-toggle/i-open-toggle';

export const
	$$ = symbolGenerator();

interface bWindow extends Trait<typeof iOpenToggle>, Trait<typeof iLockPageScroll> {}

/**
 * Component to create a modal window
 */
@component()
@derive(iOpenToggle, iLockPageScroll)
class bWindow extends iData implements iVisible, iWidth, iOpenToggle, iLockPageScroll {
	override readonly proxyCall: boolean = true;

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

	protected override readonly $refs!: {
		window: HTMLElement;
	};

	/**
	 * Window title store
	 * @see [[bWindow.titleProp]]
	 */
	@field((o) => o.sync.link())
	protected titleStore?: string;

	/**
	 * Slot name store
	 * @see [[bWindow.slotNameProp]]
	 */
	@field((o) => o.sync.link())
	protected slotNameStore?: string;

	/**
	 * Name of the active third-party slot to show
	 * @see [[bWindow.slotNameProp]]
	 */
	get slotName(): CanUndef<string> {
		return this.field.get('slotNameStore');
	}

	/**
	 * Sets a new third-party slot to show
	 *
	 * @see [[bWindow.slotNameProp]]
	 * @param value
	 */
	set slotName(value: CanUndef<string>) {
		this.field.set('slotNameStore', value);
	}

	/**
	 * Window title
	 * @see [[bWindow.titleStore]]
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
				stageValue = this.t(Object.isFunction(stageValue) ? stageValue(this) : stageValue);
			}

			return stageValue ?? v;
		}

		return v;
	}

	/**
	 * Sets a new window title
	 */
	set title(value: string) {
		this.field.set('titleStore', value);
	}

	/**
	 * @see [[iOpenToggle.open]]
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

	/** @see [[iOpenToggle.close]] */
	async close(): Promise<boolean> {
		if (await iOpenToggle.close(this)) {
			this.setRootMod('opened', false);
			this.emit('close');
			return true;
		}

		return false;
	}

	/** @see [[iLockPageScroll.lock]] */
	@wait('loading', {label: $$.lock})
	lock(): Promise<void> {
		return iLockPageScroll.lock(this, this.$refs.window);
	}

	/** @see [[iOpenToggle.onOpenedChange]] */
	async onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		await this.setMod('hidden', e.type === 'remove' ? true : e.value === 'false');
	}

	/** @see [[iOpenToggle.onTouchClose]] */
	async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <CanUndef<Element>>e.target;

		if (target == null) {
			return;
		}

		if (this.block == null) {
			return;
		}

		if (target.matches(this.block.getElSelector('wrapper'))) {
			e.preventDefault();
			await this.close();
		}
	}

	/**
	 * Initializes the component placement within a document
	 */
	@hook('mounted')
	protected initDocumentPlacement(): void {
		if (this.$el != null) {
			this.dom.appendChild(document.body, this.$el);
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
				top: pageYOffset.px
			});
		}
	}

	/** @see iOpenToggle.initCloseHelpers */
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

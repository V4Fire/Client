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

import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';

import iData, {

	component,
	prop,
	field,
	hook,
	wait,

	Stage,
	RequestError,

	ModsDecl,
	ModEvent,
	SetModEvent

} from 'super/i-data/i-data';

import { StageTitles } from 'base/b-window/interface';

export * from 'super/i-data/i-data';
export * from 'traits/i-open-toggle/i-open-toggle';

/**
 * Component to create a modal window
 */
@component()
export default class bWindow extends iData implements iVisible, iWidth, iOpenToggle, iLockPageScroll {
	/** @override */
	readonly proxyCall: boolean = true;

	/**
	 * Initial window title
	 */
	@prop({type: String, required: false})
	readonly titleProp?: string;

	/**
	 * Map window titles tied to the component `stage` values.
	 * A key with the name `[[DEFAULT]]` is used by default.
	 * If a key value is defined as a function, it will be invoked (the result will be used as a title).
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
	 * Name of the active third-party slot to show.
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
	 * If false, the inner content of the component won't be rendered if the component isn't opened
	 */
	@prop(Boolean)
	readonly forceInnerRender: boolean = true;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods,
		...iWidth.mods,

		opened: [
			...iOpenToggle.mods.opened ?? [],
			['false']
		],

		position: [
			['fixed'],
			'absolute',
			'custom'
		]
	};

	/** @override */
	protected readonly $refs!: {
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

	/** @see [[iOpenToggle.prototype.toggle]] */
	toggle(): Promise<boolean> {
		return iOpenToggle.toggle(this);
	}

	/**
	 * @see [[iOpenToggle.prototype.open]]
	 * @param [stage] - component stage to open
	 */
	async open(stage?: Stage): Promise<boolean> {
		if (await iOpenToggle.open(this)) {
			if (stage != null) {
				this.stage = stage;
			}

			this.setRootMod('hidden', false);
			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** @see [[iOpenToggle.prototype.close]] */
	async close(): Promise<boolean> {
		if (await iOpenToggle.close(this)) {
			this.setRootMod('hidden', true);
			this.emit('close');
			return true;
		}

		return false;
	}

	/** @see [[iLockPageScroll.prototype.lock]] */
	@wait('loading')
	lock(): Promise<void> {
		return iLockPageScroll.lock(this, this.$refs.window);
	}

	/** @see [[iLockPageScroll.prototype.unlock]] */
	unlock(): Promise<void> {
		return iLockPageScroll.unlock(this);
	}

	/** @see [[iOpenToggle.prototype.onOpenedChange]] */
	async onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		await this.setMod('hidden', e.type === 'remove' ? true : e.value === 'false');
	}

	/** @see [[iOpenToggle.prototype.onKeyClose]] */
	onKeyClose(e: KeyboardEvent): Promise<void> {
		return iOpenToggle.onKeyClose(this, e);
	}

	/** @see [[iOpenToggle.prototype.onTouchClose]] */
	async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <CanUndef<Element>>e.target;

		if (!target) {
			return;
		}

		if (!this.block) {
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
		this.dom.appendChild(document.body, this.$el!);
		void this.initRootStyles();
	}

	/**
	 * Attaches dynamic window styles to the root node
	 */
	@wait('loading')
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

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);
		iLockPageScroll.initModEvents(this);
	}

	/**
	 * Default error handler
	 * @param err
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected onError(err: RequestError): void {
		return undefined;
	}

	/** @override */
	protected beforeDestroy(): void {
		super.beforeDestroy();
		this.removeRootMod('hidden');
	}
}

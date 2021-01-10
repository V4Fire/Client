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

	field,
	component,
	prop,
	hook,
	wait,
	ModsDecl,
	Stage,
	ModEvent,
	SetModEvent,
	RequestError

} from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'traits/i-open-toggle/i-open-toggle';

export type TitleValue<T = unknown> = string | ((ctx: T) => string);
export interface StageTitles<T = unknown> extends Dictionary<TitleValue<T>> {
	'[[DEFAULT]]': TitleValue<T>;
}

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
	 * Map of window titles ({stage: title})
	 */
	@prop({type: Object, required: false})
	readonly stageTitles?: Dictionary<string>;

	/**
	 * Name of an active third-party slot
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
			...iOpenToggle.mods.opened,
			['false']
		],

		position: [
			['fixed'],
			'absolute',
			'custom'
		]
	};

	protected readonly $refs!: {
		window: HTMLElement;
	};

	/**
	 * Window title store
	 */
	@field((o) => o.sync.link())
	protected titleStore?: string;

	/**
	 * Slot name store
	 */
	@field((o) => o.sync.link())
	protected slotNameStore?: string;

	/**
	 * Slot name
	 */
	get slotName(): CanUndef<string> {
		return this.field.get('slotNameStore');
	}

	/**
	 * Sets a new slot name
	 * @param value
	 */
	set slotName(value: CanUndef<string>) {
		this.field.set('slotNameStore', value);
	}

	/**
	 * Window title
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
	 * @param [stage] - window stage
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
	 * Handler: error
	 * @param _err
	 */
	protected onError(_err: RequestError): void {
		return undefined;
	}

	/** @override */
	protected beforeDestroy(): void {
		super.beforeDestroy();
		this.removeRootMod('hidden');
	}
}

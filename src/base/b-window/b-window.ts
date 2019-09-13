/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
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
export default class bWindow<T extends object = Dictionary> extends iData<T>
	implements iVisible, iWidth, iOpenToggle, iLockPageScroll {

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

	/** @override */
	set error(value: string) {
		if (value) {
			this.stage = 'error';
		}

		this.errorMsg = value;
	}

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
			v = this.field.get<string>('titleStore') || '',
			stageTitles = this.stageTitles;

		if (stageTitles) {
			let
				stageValue = stageTitles[<string>v];

			if (!stageValue) {
				stageValue = stageTitles['[[DEFAULT]]'];
			}

			if (stageValue) {
				stageValue = this.t(Object.isFunction(stageValue) ? stageValue(this) : stageValue);
			}

			return stageValue || v;
		}

		return v;
	}

	/**
	 * Sets a new window title
	 */
	set title(value: string) {
		this.field.set('titleStore', value);
	}

	/** @see iOpenToggle.toggle */
	toggle(): Promise<boolean> {
		return iOpenToggle.toggle(this);
	}

	/**
	 * @see iOpenToggle.open
	 * @param [stage] - window stage
	 */
	async open(stage?: Stage): Promise<boolean> {
		if (await iOpenToggle.open(this)) {
			if (stage) {
				this.stage = stage;
			}

			this.setRootMod('hidden', false);
			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** @see iOpenToggle.close */
	async close(): Promise<boolean> {
		if (await iOpenToggle.close(this)) {
			this.setRootMod('hidden', true);
			this.emit('close');
			return true;
		}

		return false;
	}

	/** @see iLockPageScroll.lock */
	@wait('loading')
	lock(): CanPromise<void> {
		iLockPageScroll.lock(this, this.$refs.window);
	}

	/** @see iLockPageScroll.unlock */
	unlock(): void {
		iLockPageScroll.unlock(this);
	}

	/** @see iOpenToggle.onOpenedChange */
	async onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		await this.setMod('hidden', e.type === 'remove' ? true : e.value === 'false');
	}

	/** @see iOpenToggle.onKeyClose */
	onKeyClose(e: KeyboardEvent): Promise<void> {
		return iOpenToggle.onKeyClose(this, e);
	}

	/** @see iOpenToggle.onTouchClose */
	async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <Element>e.target;

		if (!target) {
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
		document.body.insertAdjacentElement('beforeend', this.$el);
		this.initRootStyles();
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
	 * @param err
	 */
	protected onError(err: RequestError): void {
		this.error = this.getDefaultErrorText(err);
	}

	/** @override */
	protected beforeDestroy(): void {
		super.beforeDestroy();
		this.removeRootMod('hidden');
		this.$el.remove();
	}
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, {

	field,
	component,
	prop,
	hook,
	ModsDecl,
	Stage,
	CloseHelperEvents,
	ModEvent,
	SetModEvent

} from 'super/i-data/i-data';

import { RequestError } from 'core/data';
export * from 'super/i-data/i-data';

export type TitleValue<T = unknown> = string | ((ctx: T) => string);
export interface StageTitles<T = unknown> extends Dictionary<TitleValue<T>> {
	'[[DEFAULT]]': TitleValue<T>;
}

@component()
export default class bWindow<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Initial window title
	 */
	@prop({type: String, required: false})
	readonly titleProp?: string;

	/**
	 * Map of window titles ({stage: title})
	 */
	@prop(Object)
	readonly stageTitles?: Dictionary<string>;

	/**
	 * Name of an active third-party slot
	 */
	@prop({type: String, required: false})
	readonly slotNameProp?: string;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		opened: [
			bWindow.PARENT,
			['false']
		]
	};

	/**
	 * Window title store
	 */
	@field((o) => o.link())
	protected titleStore?: string;

	/**
	 * Slot name store
	 */
	@field((o) => o.link())
	protected slotNameStore?: string;

	/** @override */
	set error(value: string) {
		if (value) {
			this.stage = 'error';
		}

		this.errorMsg = value;
	}

	/**
	 * @override
	 * @param [stage] - window stage
	 */
	async open(stage?: Stage): Promise<boolean> {
		if (await super.open()) {
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

	/** @override */
	async close(): Promise<boolean> {
		if (await super.close()) {
			this.setRootMod('hidden', true);
			this.emit('close');
			return true;
		}

		return false;
	}

	/**
	 * Slot name
	 */
	get slotName(): CanUndef<string> {
		return this.getField('slotNameStore');
	}

	/**
	 * Sets a new slot name
	 * @param value
	 */
	set slotName(value: CanUndef<string>) {
		this.setField('slotNameStore', value);
	}

	/**
	 * Window title
	 */
	get title(): string {
		const
			v = this.getField<string>('titleStore') || '',
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
		this.setField('titleStore', value);
	}

	/** @override */
	protected initCloseHelpers(events: CloseHelperEvents): void {
		super.initCloseHelpers({touch: 'mousedown touchstart', ...events});
	}

	/**
	 * Initializes the component placement within a document
	 */
	@hook('mounted')
	protected initDocumentPlacement(): void {
		document.body.insertAdjacentElement('beforeend', this.$el);
	}

	/**
	 * Handler: error
	 * @param err
	 */
	protected onError(err: RequestError): void {
		this.error = this.getDefaultErrorText(err);
	}

	/** @override */
	protected async onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		await this.setMod('hidden', e.type === 'remove' ? true : e.value === 'false');
	}

	/** @override */
	protected async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <Element>e.target;

		if (!target) {
			return;
		}

		if (target.matches(this.block.getElSelector('wrapper'))) {
			this.async.once(document, 'click mouseup touchend', (e) => {
				e.stopImmediatePropagation();
			}, {group: 'closeHelpers'}, {capture: true});

			await this.close();
		}
	}

	/** @override */
	protected beforeDestroy(): void {
		super.beforeDestroy();
		this.removeRootMod('hidden');
		this.$el.remove();
	}
}

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import KeyCodes from 'core/key-codes';
import iData, { field, component, prop, hook, ModsDecl, Stage } from 'super/i-data/i-data';
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
		hidden: [
			['true'],
			'false'
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
		if (await this.setMod('hidden', false)) {
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
		if (await this.setMod('hidden', true)) {
			this.setRootMod('hidden', true);
			this.emit('close');
			return true;
		}

		return false;
	}

	/**
	 * Slot name
	 */
	get slotName(): string | undefined {
		return this.getField('slotNameStore');
	}

	/**
	 * Sets a new slot name
	 * @param value
	 */
	set slotName(value: string | undefined) {
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

	/**
	 * Handler: error
	 * @param err
	 */
	protected onError(err: RequestError): void {
		this.error = this.getDefaultErrorText(err);
	}

	/** @override */
	@hook('created')
	protected initCloseHelpers(): void {
		const
			{async: $a, localEvent: $e} = this,
			group = 'closeHelpers';

		const closeHelpers = () => {
			$a.on(document, 'keyup', async (e) => {
				if (e.keyCode === KeyCodes.ESC) {
					await this.close();
				}
			}, {group});

			$a.on(document, 'mousedown touchstart', async (e) => {
				if (e.target.matches(this.block.getElSelector('wrapper'))) {
					await this.close();

					$a.once(document, 'click mouseup touchend', (e) => {
						e.stopImmediatePropagation();
					}, {group}, {capture: true});
				}
			}, {group});
		};

		$e.removeAllListeners('block.mod.*.hidden.*');
		$e.on('block.mod.remove.hidden.*', closeHelpers);
		$e.on('block.mod.set.hidden.false', closeHelpers);
		$e.on('block.mod.set.hidden.true', () => $a.off({group}));
	}

	/**
	 * Initializes the component placement within a document
	 */
	@hook('mounted')
	protected initDocumentPlacement(): void {
		document.body.insertAdjacentElement('beforeend', this.$el);
	}

	/** @override */
	protected beforeDestroy(): void {
		super.beforeDestroy();
		this.removeRootMod('hidden');
		this.$el.remove();
	}
}

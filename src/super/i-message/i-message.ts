/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import keyCodes from 'core/key-codes';
import iBlock, { component, prop, field, hook, ModsDecl, ModEvent, SetModEvent } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export interface CloseHelperEvents {
	key?: string;
	touch?: string;
}

@component()
export default class iMessage extends iBlock {
	/**
	 * Initial information message
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * Initial error message
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * Information message store
	 */
	@field((o) => o.link('infoProp'))
	infoMsg?: string;

	/**
	 * Error message store
	 */
	@field((o) => o.link('errorProp'))
	errorMsg?: string;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		showInfo: [
			'true',
			'false'
		],

		showError: [
			'true',
			'false'
		],

		opened: [
			'true',
			'false'
		]
	};

	/**
	 * Information message
	 */
	get info(): CanUndef<string> {
		return this.infoMsg;
	}

	/**
	 * Sets a new information message
	 * @param value
	 */
	set info(value: CanUndef<string>) {
		this.infoMsg = value;
	}

	/**
	 * Error message
	 */
	get error(): CanUndef<string> {
		return this.errorMsg;
	}

	/**
	 * Sets a new error message
	 * @param value
	 */
	set error(value: CanUndef<string>) {
		this.errorMsg = value;
	}

	/**
	 * Opens the component
	 * @emits open()
	 */
	async open(): Promise<boolean> {
		if (await this.setMod('opened', true)) {
			this.emit('open');
			return true;
		}

		return false;
	}

	/**
	 * Closes the component
	 * @emits close()
	 */
	async close(): Promise<boolean> {
		if (await this.setMod('opened', false)) {
			this.emit('close');
			return true;
		}

		return false;
	}

	/**
	 * Toggles the component
	 */
	toggle(): Promise<boolean> {
		return this.mods.opened === 'true' ? this.close() : this.open();
	}

	/**
	 * Initializes close helpers
	 * @param [events] - event names for helpers
	 */
	@hook('created')
	protected initCloseHelpers(events: CloseHelperEvents = {}): void {
		const
			{async: $a, localEvent: $e} = this,
			group = {group: 'closeHelpers'};

		const closeHelpers = () => {
			$a.on(document, events.key || 'keyup', this.onKeyClose, group);
			$a.on(document, events.touch || 'click', this.onTouchClose, group);
		};

		$e.removeAllListeners('block.mod.*.opened.*');
		$e.on('block.mod.set.opened.true', closeHelpers);
		$e.on('block.mod.set.opened.false', () => $a.off(group));
		$e.on('block.mod.*.opened.*', this.onOpenedChange);
	}

	/**
	 * Handler: opened modifier change
	 * @param e
	 */
	protected onOpenedChange(e: ModEvent | SetModEvent): void {
		return undefined;
	}

	/**
	 * Handler: close by a keyboard event
	 * @param e
	 */
	protected async onKeyClose(e: KeyboardEvent): Promise<void> {
		if (e.keyCode === keyCodes.ESC) {
			await this.close();
		}
	}

	/**
	 * Handler: close by a touch event
	 * @param e
	 */
	protected async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <Element>e.target;

		if (!target) {
			return;
		}

		if (!target.closest(`.${this.componentId}`)) {
			await this.close();
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo('showInfo', 'infoMsg');
		this.bindModTo('showError', 'errorMsg');
	}
}
